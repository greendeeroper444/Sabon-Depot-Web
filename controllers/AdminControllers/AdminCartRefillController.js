const AdminAuthModel = require("../../models/AdminModels/AdminAuthModel");
const StaffCartRefillModel = require("../../models/StaffModels/StaffCartRefillModel");
const jwt = require('jsonwebtoken');
const RefillProductModel = require("../../models/RefillProductModel");
const mongoose = require('mongoose')

const addProductToCartRefillAdmin = async(req, res) => {
    const {productId, volume, sizeUnit} = req.body;
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

        try {
            const product = await RefillProductModel.findById(productId);
            if(!product){
                return res.json({ 
                    error: 'Product does not exist' 
                });
            }

            //convert volume based on selected unit
            let convertedVolume = volume;
            if(sizeUnit === 'Milliliter'){
                convertedVolume = volume / 1000; //convert ml to L
            } else if(sizeUnit === 'Gallon'){
                convertedVolume = volume * 3.785; //convert Gallon to L
            }

            // Calculate drums needed
            const drumsNeeded = Math.ceil(convertedVolume / product.maximumSizeLiter);
            
            // Check if enough drums are available
            if(product.drum < drumsNeeded){
                return res.status(400).json({ 
                    error: 'Not enough drums available' 
                });
            }

            const price = product.price;
            let existingCartItem = await StaffCartRefillModel.findOne({adminId, productId});

            let unit = sizeUnit || 'Liter';
            let productSize = `${volume}${unit === 'Liter' ? 'L' : unit === 'Milliliter' ? 'ml' : 'Gal'}`;
            
            if(existingCartItem){
                // Calculate total volume and drums needed after adding to cart
                const totalVolume = convertedVolume + existingCartItem.volume;
                const totalDrumsNeeded = Math.ceil(totalVolume / product.maximumSizeLiter);
                
                // Check if enough drums are available for the updated total
                if(product.drum < totalDrumsNeeded){
                    return res.status(400).json({ 
                        error: 'Not enough drums available for the requested amount' 
                    });
                }

                // Update existing cart item
                existingCartItem.volume += convertedVolume;
                existingCartItem.drum = totalDrumsNeeded; // Add drum field to cart model
                existingCartItem.productSize = `${existingCartItem.volume}${sizeUnit === 'Liter' ? 'L' : sizeUnit === 'Milliliter' ? 'ml' : 'Gal'}`;
                existingCartItem.updatedAt = Date.now();
                await existingCartItem.save();
            } else {
                await new StaffCartRefillModel({
                    adminId,
                    productId,
                    volume: convertedVolume,
                    drum: drumsNeeded, // Add drum field to cart model
                    price,
                    productName: product.productName,
                    productSizeLiter: product.volume,
                    sizeUnit: sizeUnit,
                    productSize: productSize, 
                }).save();
            }

            // Don't deduct from product stock here - only when order is finalized
            
            const updatedCart = await StaffCartRefillModel.find({adminId}).populate('productId');
            res.json(updatedCart);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ 
                message: 'Server error' 
            });
        }
    });
};





const updateProductVolumeRefillAdmin = async(req, res) => {
    const {cartItemId, volume, sizeUnit} = req.body;

    if(!cartItemId || !mongoose.Types.ObjectId.isValid(cartItemId)){
        return res.status(400).json({ 
            success: false, message: 'Invalid cart item ID' 
        });
    }

    if(!volume || volume < 1){
        return res.status(400).json({ 
            success: false,
             message: 'Volume must be at least 1' 
            });
    }

    try {
        console.log('Update Request:', req.body);

        const cartItem = await StaffCartRefillModel.findById(cartItemId);
        if(!cartItem){
            return res.status(404).json({ 
                success: false, message: 'Cart item not found' 
            });
        }

        const product = await RefillProductModel.findById(cartItem.productId);
        if(!product){
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        //convert volume based on sizeUnit
        let convertedVolume = volume;
        let productSize = `${volume}${sizeUnit === 'Mililiter' ? 'ml' : sizeUnit === 'Gallon' ? 'gal' : 'L'}`;

        if(sizeUnit === 'Mililiter'){
            convertedVolume = volume / 1000;
        } else if(sizeUnit === 'Gallon'){
            convertedVolume = volume * 3.785;
        }

        const previousVolume = cartItem.volume || 0;
        const volumeDifference = convertedVolume - previousVolume;

        //check if enough stock is available
        if(volumeDifference > product.volume){
            return res.status(400).json({ 
                success: false, 
                message: 'Not enough stock available' 
            });
        }

        //update product stock
        product.volume -= volumeDifference;
        await product.save();

        //update cart item
        cartItem.volume = convertedVolume;
        cartItem.productSize = productSize;
        cartItem.sizeUnit = sizeUnit;
        cartItem.updatedAt = new Date();
        await cartItem.save();

        res.json({ 
            success: true, 
            message: 'Volume updated successfully', 
            item: cartItem 
        });
    } catch (error) {
        console.error('Error updating volume:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

const updateProductPriceRefillAdmin = async(req, res) => {
    const {cartItemId, price} = req.body;

    if(!cartItemId || !mongoose.Types.ObjectId.isValid(cartItemId)){
        return res.status(400).json({ 
            success: false, message: 'Invalid cart item ID' 
        });
    }

    if(!price || price < 1){
        return res.status(400).json({ 
            success: false, message: 'Price must be at least 1' 
        });
    }

    try {
        const cartItem = await StaffCartRefillModel.findById(cartItemId);
        if(!cartItem){
            return res.status(404).json({ 
                success: false, message: 'Cart item not found' 
            });
        }

        //update cart item price
        cartItem.price = price;
        cartItem.updatedAt = new Date();
        await cartItem.save();

        res.json({ 
            success: true, 
            message: 'Price updated successfully', 
            item: cartItem 
        });
    } catch (error) {
        console.error('Error updating price:', error);
        res.status(500).json({ 
            success: false, message: 'Internal server error' 
        });
    }
};




const getProductCartRefillAdmin = async(req, res) => {
    const adminId = req.params.adminId;
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

        if(decodedToken.id !== adminId){
            return res.json({ 
                error: 'Unauthorized - Invalid customer ID' 
            });
        }

        try {
            //fetch cart items with populated product details, including sizeUnit and productSize
            const cartItems = await StaffCartRefillModel.find({adminId})
                .populate({
                    path: 'productId',
                    select: 'productName price imageUrl sizeUnit productSize'
                });
            res.json(cartItems);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ 
                message: 'Server error' 
            });
        }
    });
};

const removeProductFromCartRefillAdmin = async(req, res) => {
    const {cartItemId} = req.params;
    const token = req.cookies.token;

    if(!token){
        return res.json({ error: 'Unauthorized - Missing token' });
    }

    jwt.verify(token, process.env.JWT_SECRET, {}, async(err, decodedToken) => {
        if(err){
            return res.json({ error: 'Unauthorized - Invalid token' });
        }

        try {
            const cartItem = await StaffCartRefillModel.findById(cartItemId);
            if (!cartItem) {
                return res.status(404).json({ success: false, message: 'Cart item not found' });
            }

            const product = await RefillProductModel.findById(cartItem.productId);
            if (product) {
                product.volume += cartItem.volume; // Restore product volume
                await product.save();
            }

            await StaffCartRefillModel.findByIdAndDelete(cartItemId);

            res.json({ success: true, message: 'Product removed from cart, stock restored' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error' });
        }
    });
};





// const updateProductSizeUnitAndProductSizeStaff 

module.exports = {
    addProductToCartRefillAdmin,
    getProductCartRefillAdmin,
    removeProductFromCartRefillAdmin,
    updateProductVolumeRefillAdmin,
    updateProductPriceRefillAdmin
}