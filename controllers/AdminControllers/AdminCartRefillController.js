const AdminAuthModel = require("../../models/AdminModels/AdminAuthModel");
const StaffCartRefillModel = require("../../models/StaffModels/StaffCartRefillModel");
const jwt = require('jsonwebtoken');
const RefillProductModel = require("../../models/RefillProductModel");
const mongoose = require('mongoose')

const addProductToCartRefillAdmin = async(req, res) => {
    const {productId, quantity, price} = req.body;
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

            const productSize = `${quantity}L`;

            await new StaffCartRefillModel({
                adminId,
                productId,
                productName: product.productName,
                quantity,
                price: product.price,
                sizeUnit: product.sizeUnit,
                productSize
            }).save();

            
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
    const {cartItemId, quantity, sizeUnit} = req.body;

    if(!cartItemId || !mongoose.Types.ObjectId.isValid(cartItemId)){
        return res.status(400).json({ 
            success: false, message: 'Invalid cart item ID' 
        });
    }

    if(!quantity || quantity <= 0){
        return res.status(400).json({ 
            success: false,
             message: 'Volume must be greater than 0' 
            });
    }

    try {

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

        const productSize = `${quantity}L`;
       
        cartItem.quantity = parseFloat(quantity);
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

        try {
            await StaffCartRefillModel.findByIdAndDelete(cartItemId);
            res.json({ 
                success: true,
                message: 'Product removed from cart' 
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ 
                message: 'Server error' 
            });
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