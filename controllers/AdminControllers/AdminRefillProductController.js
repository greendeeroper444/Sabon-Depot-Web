const AdminAuthModel = require("../../models/AdminModels/AdminAuthModel");
const RefillProductModel = require("../../models/RefillProductModel");
const jwt = require('jsonwebtoken');
const { getInventoryReport } = require("./AdminReportController");
const ProductionReportModel = require("../../models/ProductionReportModel");

const addRefillProductAdmin = async(req, res) => {
    try {
        const {productCode, productName, category, quantity, price, color} = req.body;

        if(!productCode || !productName || !category || !quantity || !price || !color){
            return res.json({
                error: 'Please provide all required fields'
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

            const productSize = `${quantity}L`;

            //create new product with the determined batch
            const newRefillProduct = await RefillProductModel.create({
                productCode,
                productName,
                category,
                quantity,
                price,
                color,
                productSize,
                uploaderId: adminId,
                uploaderType: 'Admin',
                createdBy: adminExists.fullName,
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
                    productId: newRefillProduct._id,
                    productName: productName,
                    productionQuantity: parseInt(quantity),
                    date: startOfDay,
                });
            }
            
            await getInventoryReport(
                newRefillProduct._id,
                newRefillProduct.productName,
                newRefillProduct.sizeUnit,
                newRefillProduct.productSize,
                newRefillProduct.category,
                newRefillProduct.quantity,
                true
            );

            return res.json({
                message: 'Refill product added successfully!',
                newRefillProduct,
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
};

const getRefillProductAdmin = async(req, res) => {
    try {
        const adminProducts = await RefillProductModel.find();
        return res.json(adminProducts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
}

const editRefillProductAdmin = async(req, res) => {
    try {
        const {productId} = req.params;
        const {productCode, productName, category, quantity, price, color} = req.body;

        if(!productCode || !productName || !category || !quantity || !price || !color){
            return res.json({
                error: 'Please provide all required fields',
            });
        }

        const token = req.cookies.token;
        if(!token){
            return res.json({
                error: 'Unauthorized - Missing token',
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, {}, async(err, decodedToken) => {
            if(err){
                return res.json({
                    error: 'Unauthorized - Invalid token',
                });
            }

            const adminId = decodedToken.id;
            const adminExists = await AdminAuthModel.findById(adminId);
            if(!adminExists){
                return res.json({
                    error: 'Admin does not exist',
                });
            }

            const productSize = `${quantity}L`;

            const updatedProduct = await RefillProductModel.findByIdAndUpdate(
                productId,
                {productCode, productName, category, quantity, price, color, productSize},
                {new: true}
            );

            if(!updatedProduct){
                return res.json({
                    error: 'Product not found',
                });
            }

            return res.json({
                message: 'Product updated successfully',
                updatedProduct,
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Server error',
        });
    }
};


//get a specific refill product by id
const getEditRefillProductAdmin = async(req, res) => {
    try {
        const {productId} = req.params;
        const product = await RefillProductModel.findById(productId);

        if(!product){
            return res.json({
                error: 'Product not found',
            });
        }

        return res.json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Server error',
        });
    }
};

const deleteRefillProductAdmin = async(req, res) => {
    try {
        const product = await RefillProductModel.findById(req.params.productId);
        if(!product){
            return res.status(404).json({ 
                message: 'Product not found' 
            });
        }

        await RefillProductModel.findByIdAndDelete(req.params.productId);

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


const getRefillProductsAdmin = async(req, res) => {
    try {
        const adminProducts = await RefillProductModel.find();
        return res.json(adminProducts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
};

const getUniqueCategoriesRefillProductAdmin = async(req, res) => {
    try {
        const categories = await RefillProductModel.distinct('category');
        return res.json(categories);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
};

module.exports = {
    addRefillProductAdmin,
    getRefillProductAdmin,
    editRefillProductAdmin,
    getEditRefillProductAdmin,
    deleteRefillProductAdmin,
    getRefillProductsAdmin,
    getUniqueCategoriesRefillProductAdmin
}