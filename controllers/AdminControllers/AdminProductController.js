const ProductModel = require('../../models/ProductModel');
const jwt = require('jsonwebtoken');
const AdminAuthModel = require('../../models/AdminModels/AdminAuthModel');
const { getInventoryReport } = require('./AdminReportController');
const WorkinProgressProductModel = require('../../models/WorkinProgressProductModel');
const upload = require('../../helpers/MulterConfig');
const ProductionReportModel = require('../../models/ProductionReportModel');


const uploadProductAdmin = async(req, res) => {
    upload(req, res, async (err) => {
        if(err){
            return res.json({error: err});
        }

        try {
            const {
                productCode, productName, category, price, quantity, stockLevel,
                discountPercentage = 0, discountedDate, sizeUnit, productSize,
                expirationDate, description
            } = req.body;

            const imageUrl = req.file ? req.file.path : '';

            if(!productCode || !productName || !category || !price || !quantity || !stockLevel || !imageUrl || !productSize || !expirationDate){
                return res.json({
                    error: 'Please provide all required fields'
                });
            }

            if(discountedDate && new Date(discountedDate) < new Date()) {
                return res.json({ 
                    error: 'Discounted date must be today or a future date.' 
                });
            }

            const token = req.cookies.token;
            if(!token){
                return res.json({ 
                    error: 'Unauthorized - Missing token' 
                });
            }

            jwt.verify(token, process.env.JWT_SECRET, {}, async(err, decodedToken) => {
                if(err){
                    return res.json({ 
                        error: 'Unauthorized - Invalid token' 
                    });
                }

                const adminId = decodedToken.id;
                const adminExists = await AdminAuthModel.findById(adminId);
                if(!adminExists){
                    return res.json({ 
                        error: 'Admin does not exist' 
                    });
                }

                //check for existing products with the same expirationDate
                const existingBatch = await ProductModel.findOne({
                    expirationDate,
                });

                let batch;
                if(existingBatch){
                    //use the same batch if expirationDate matches
                    batch = existingBatch.batch;
                } else {
                    //get all existing batches
                    const allBatches = await ProductModel.distinct('batch');
                    
                    //extract the batch numbers and find the highest one
                    const batchNumbers = allBatches.map(b => {
                        const match = b.match(/Batch\s+(\d+)/i);
                        return match ? parseInt(match[1]) : 0;
                    });
                    
                    //find the highest batch number
                    const highestBatchNumber = batchNumbers.length > 0 ? Math.max(...batchNumbers) : 0;
                    
                    //create new batch with the next sequential number
                    batch = `Batch ${highestBatchNumber + 1}`;
                }

                const discountedPrice = discountPercentage > 0
                    ? price - (price * discountPercentage) / 100
                    : price;

                //create new product with the determined batch
                const newProduct = await ProductModel.create({
                    productCode,
                    productName,
                    category,
                    price,
                    discountedPrice,
                    discountPercentage,
                    quantity,
                    stockLevel,
                    discountedDate,
                    imageUrl,
                    sizeUnit,
                    productSize,
                    uploaderId: adminId,
                    uploaderType: 'Admin',
                    expirationDate,
                    description,
                    createdBy: adminExists.fullName,
                    batch,
                });

                //get today's date and strip time components for date-only comparison
                const today = new Date();
                const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

                //check if there's already a production report for today (date-only comparison)
                const existingProductionReport = await ProductionReportModel.findOne({
                    date: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                });

                if(existingProductionReport){
                    //update existing report by adding the new quantity
                    await ProductionReportModel.updateOne(
                        {_id: existingProductionReport._id},
                        {$inc: {productionQuantity: parseInt(quantity)}}
                    );
                } else{
                    //create new report for today
                    await ProductionReportModel.create({
                        productId: newProduct._id,
                        productName: productName,
                        productionQuantity: parseInt(quantity),
                        date: startOfDay,
                    });
                }
                
                await getInventoryReport(
                    newProduct._id,
                    newProduct.productName,
                    newProduct.sizeUnit,
                    newProduct.productSize,
                    newProduct.category,
                    newProduct.quantity,
                    true
                );
                
                return res.json({
                    message: 'Product added successfully!',
                    newProduct,
                });
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                message: 'Server error' 
            });
        }
    });
};


const getProductAdmin = async(req, res) => {
    try {
        const adminProducts = await ProductModel.find();
        return res.json(adminProducts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
}
const getBatchProductAdmin = async(req, res) => {
    try {
        const {batch} = req.query;
        if(!batch){
            return res.status(400).json({ 
                error: 'Batch is required' 
            });
        }

        const batchProducts = await ProductModel.find({batch});
        return res.json(batchProducts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
};



const deleteProductAdmin = async(req, res) => {
    try {
        const product = await ProductModel.findById(req.params.productId);
        if(!product){
            return res.status(404).json({ 
                message: 'Product not found' 
            });
        }

        await ProductModel.findByIdAndDelete(req.params.productId);

        return res.status(200).json({ 
            message: 'Product deleted successfully' 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
};


//updated
const editProductAdmin = async(req, res) => {
    upload(req, res, async (err) => {
        if(err){
            return res.json({error: err});
        }

        try {
            const {productId} = req.params;
            const {
                productCode, 
                productName, 
                category, 
                price, 
                quantity, 
                stockLevel, 
                discountPercentage = 0, 
                discountedDate, 
                sizeUnit, 
                productSize, 
                expirationDate,
                description
            } = req.body;
            const imageUrl = req.file ? req.file.path : '';

            if(!productCode || !productName || !category || !price || !stockLevel || !productSize || !expirationDate){
                return res.json({
                    error: 'Please provide all required fields'
                });
            }

            const product = await ProductModel.findById(productId);
            if(!product){
                return res.json({
                    error: 'Product not found'
                });
            }

            //fix 2: Compare the dates in a consistent format
            //format both dates to YYYY-MM-DD for comparison
            const formattedNewDate = new Date(expirationDate).toISOString().split('T')[0];
            const formattedOriginalDate = new Date(product.expirationDate).toISOString().split('T')[0];
            
            //check if expiration date has changed
            if(formattedNewDate !== formattedOriginalDate) {
                //create a new product instead of updating the existing one
                
                //check for an existing product with the same expirationDate
                const existingBatch = await ProductModel.findOne({expirationDate});

                let newBatch;
                if(existingBatch){
                    //use the same batch if expirationDate matches
                    newBatch = existingBatch.batch;
                } else{
                    //get all existing batches
                    const allBatches = await ProductModel.distinct('batch');
                    
                    //extract the batch numbers and find the highest one
                    const batchNumbers = allBatches.map(b => {
                        const match = b.match(/Batch\s+(\d+)/i);
                        return match ? parseInt(match[1]) : 0;
                    });
                    
                    //find the highest batch number
                    const highestBatchNumber = batchNumbers.length > 0 ? Math.max(...batchNumbers) : 0;
                    
                    //create new batch with the next sequential number
                    newBatch = `Batch ${highestBatchNumber + 1}`;
                }

                //calculate discounted price for the new product
                const currentDate = new Date();
                let newDiscountedPrice = price;

                if(discountPercentage > 0 && discountedDate && new Date(discountedDate) > currentDate){
                    newDiscountedPrice = price - (price * discountPercentage / 100);
                }

                //get the uploader info from the original product
                const uploaderId = product.uploaderId;
                const uploaderType = product.uploaderType;
                const createdBy = product.createdBy;

                //create a new product with the new expiration date
                const newProduct = await ProductModel.create({
                    productCode,
                    productName,
                    category,
                    price,
                    discountedPrice: newDiscountedPrice,
                    discountPercentage,
                    quantity: !isNaN(quantity) ? Number(quantity) : 0,
                    stockLevel,
                    discountedDate,
                    imageUrl: imageUrl || product.imageUrl,
                    sizeUnit,
                    productSize,
                    uploaderId,
                    uploaderType,
                    expirationDate,
                    description,
                    createdBy,
                    batch: newBatch,
                });
                
                await getInventoryReport(
                    newProduct._id,
                    newProduct.productName,
                    newProduct.sizeUnit,
                    newProduct.productSize,
                    newProduct.category,
                    newProduct.quantity,
                    true
                );

                return res.json({
                    message: 'New product created with updated expiration date!',
                    originalProduct: product,
                    newProduct: true
                });
            } else {
                //if expiration date didn't change, update the existing product as before
                let batch = product.batch;

                //calculate discounted price
                const currentDate = new Date();
                let discountedPrice = price;

                if(discountPercentage > 0 && discountedDate && new Date(discountedDate) > currentDate){
                    discountedPrice = price - (price * discountPercentage / 100);
                } else{
                    //reset discount if expired or invalid
                    product.discountPercentage = 0;
                    product.discountedDate = null;
                }

                //update product fields
                product.productCode = productCode;
                product.productName = productName;
                product.category = category;
                product.price = price;
                product.discountedPrice = discountedPrice;
                product.quantity = !isNaN(quantity) ? Number(quantity) : 0;
                product.stockLevel = stockLevel;
                product.discountPercentage = discountPercentage;
                product.sizeUnit = sizeUnit;
                product.productSize = productSize;
                product.discountedDate = discountedDate;
                product.description = description;
                product.batch = batch;
                if(imageUrl){
                    product.imageUrl = imageUrl;
                }

                const updatedProduct = await product.save();

                await getInventoryReport(product._id, productName, sizeUnit, productSize, category, quantity);

                return res.json({
                    message: 'Product updated successfully!',
                    updatedProduct,
                    newProduct: false
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'Server error'
            });
        }
    });
};


const getEditProductAdmin = async(req, res) => {
    const {productId} = req.params;
    try {
        const product = await ProductModel.findById(productId);
        if(!product){
            return res.status(404).json({ 
                message: 'Product not found'
            });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
};



const getProductSummaryAdmin = async(req, res) => {
    try {

        //get the count of unique categories
        const categories = await ProductModel.distinct('category');
        const categoryCount = categories.length;

        //get the total number of products
        const totalProducts = await ProductModel.countDocuments();

        //calculate the total value (sum of price * quantity for each product)
        const totalValueResult = await ProductModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalValue: {$sum: {$multiply: ['$price', '$quantity']}}
                }
            }
        ]);
        const totalValue = totalValueResult[0]?.totalValue || 0;

        //get the total units produced (sum of all product quantities)
        const totalUnitsProduced = await ProductModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalQuantity: {$sum: '$quantity'}
                }
            }
        ]);

        //get the count of products with low stock (quantity < 10)
        const lowStockCount = await ProductModel.countDocuments({quantity: {$lt: 10}});
        const notInStock = await ProductModel.countDocuments({quantity: 0});

        res.json({
            categoryCount,
            totalProducts,
            totalUnitsProduced: totalUnitsProduced[0]?.totalQuantity || 0,
            totalValue,
            lowStockCount,
            notInStock
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Server error' 
        });
    }
};

//to get or notify the low quantity of product.
const getOutOfStockProductsAdmin = async(req, res) => {
    try {
        // console.log("Fetching all products...");
        //fetch all products
        const products = await ProductModel.find();
        // console.log(`Total products fetched: ${products.length}`);
        
        //debug: Print first few products to verify data structure
        // console.log("Sample products:", products.slice(0, 3).map(p => ({
        //     productName: p.productName,
        //     quantity: p.quantity,
        //     stockLevel: p.stockLevel
        // })));

        //create arrays for each type
        const lowStockProducts = [];
        const outOfStockProducts = [];
        
        //process each product
        products.forEach(product => {
            //convert to plain object
            const productObj = product.toObject ? product.toObject() : JSON.parse(JSON.stringify(product));
            
            //check stock conditions with logging
            // console.log(`Checking product: ${productObj.productName}, quantity: ${productObj.quantity}, stockLevel: ${productObj.stockLevel}`);
            
            if(productObj.quantity === 0){
                console.log(`${productObj.productName} is OUT OF STOCK`);
                outOfStockProducts.push({
                    ...productObj,
                    stockStatus: 'Out of Stock'
                });
            } 
            else if(productObj.quantity <= productObj.stockLevel){
                console.log(`${productObj.productName} is LOW STOCK`);
                lowStockProducts.push({
                    ...productObj,
                    stockStatus: 'Low Stock'
                });
            }
        });
        
        // console.log(`Out of stock products: ${outOfStockProducts.length}`);
        // console.log(`Low stock products: ${lowStockProducts.length}`);
        
        //combine both arrays
        const result = [...lowStockProducts, ...outOfStockProducts];
        // console.log(`Total products to return: ${result.length}`);
        
        return res.json(result);
    } catch (error) {
        console.error("Error in getOutOfStockProductsAdmin:", error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
};

const getUniqueCategoriesAdmin = async(req, res) => {
    try {
        const categories = await ProductModel.distinct('category');
        return res.json(categories);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
};

// const getProductsAdmin = async(req, res) => {
//     const category = req.query.category;

//     try {
//         const query = {
//             ...(category ? {category: category} : {}),
//             isArchived: false,
//         };

//         //fetch products only from ProductModel
//         const customerProducts = await ProductModel.find(query).sort({createdAt: -1});

//         //group by productName and prioritize by sizeUnit and productSize
//         const productMap = new Map();

//         customerProducts.forEach(product => {
//             const key = product.productName;

//             if(!productMap.has(key)){
//                 productMap.set(key, product);
//             } else {
//                 const existingProduct = productMap.get(key);

//                 const sizePriority = {
//                     'Gallons': 3,
//                     'Liters': 2,
//                     'Milliliters': 1,
//                 };

//                 const existingSizePriority = sizePriority[existingProduct.sizeUnit] || 0;
//                 const newSizePriority = sizePriority[product.sizeUnit] || 0;

//                 if(
//                     newSizePriority > existingSizePriority ||
//                     (newSizePriority === existingSizePriority && product.productSize > existingProduct.productSize)
//                 ){
//                     productMap.set(key, product);
//                 }
//             }
//         });

//         const prioritizedProducts = Array.from(productMap.values()).sort((a, b) => b.createdAt - a.createdAt);

//         return res.json(prioritizedProducts);
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             message: 'Server error',
//         });
//     }
// };
const getProductsAdmin = async(req, res) => {
    const category = req.query.category;

    try {
        const query = {
            ...(category ? {category: category} : {}),
            isArchived: false,
        };

        //fetch all products from ProductModel
        const allProducts = await ProductModel.find(query).sort({createdAt: -1});

        //group by productName and sizeUnit
        const productMap = new Map();

        allProducts.forEach(product => {
            const key = `${product.productName}-${product.sizeUnit}`;

            if(!productMap.has(key)){
                productMap.set(key, product);
            } else {
                const existingProduct = productMap.get(key);

                const sizePriority = {
                    'Gallons': 3,
                    'Liters': 2,
                    'Milliliters': 1,
                };

                const existingSizePriority = sizePriority[existingProduct.sizeUnit] || 0;
                const newSizePriority = sizePriority[product.sizeUnit] || 0;

                if(
                    newSizePriority > existingSizePriority ||
                    (newSizePriority === existingSizePriority && parseInt(product.productSize) > parseInt(existingProduct.productSize))
                ){
                    productMap.set(key, product);
                }
            }
        });

        const prioritizedProducts = Array.from(productMap.values()).sort((a, b) => b.createdAt - a.createdAt);

        return res.json(prioritizedProducts);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Server error',
        });
    }
};


module.exports = {
    uploadProductAdmin,
    getProductAdmin,
    deleteProductAdmin,
    editProductAdmin,
    getEditProductAdmin,
    // getStatisticsAdmin,
    getProductSummaryAdmin,
    getOutOfStockProductsAdmin,
    getUniqueCategoriesAdmin,
    getProductsAdmin,
    getBatchProductAdmin
}
