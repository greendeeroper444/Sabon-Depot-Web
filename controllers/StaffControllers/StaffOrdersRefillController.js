const StaffAuthModel = require("../../models/StaffModels/StaffAuthModel");
const jwt = require('jsonwebtoken');
const StaffCartRefillModel = require("../../models/StaffModels/StaffCartRefillModel");
const RefillProductModel = require("../../models/RefillProductModel");
const StaffOrderRefillModel = require("../../models/StaffModels/StaffOrderRefillModel");
const { BestSellingModel, TotalSaleModel } = require("../../models/SalesOverviewModel");
const ProductionReportModel = require("../../models/ProductionReportModel");
const { getInventoryReport, getSalesReport } = require("../AdminControllers/AdminReportController");

//create order via staff
const addOrderRefillStaff = async(req, res) => {
    try {
        const {cashReceived, changeTotal, discountRate} = req.body;
        const token = req.cookies.token;

        if(!token){
            return res.status(400).json({ 
                message: 'Unauthorized - Missing token' 
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, {}, async(err, decodedToken) => {
            if(err){
                return res.status(400).json({ 
                    message: 'Unauthorized - Invalid token' 
                });
            }

            const staffId = decodedToken.id;
            const staffExists = await StaffAuthModel.findById(staffId);
            if(!staffExists){
                return res.json({ 
                    error: 'Staff does not exist' 
                });
            }

            //get all cart items for this staff
            const cartItems = await StaffCartRefillModel.find({staffId}).populate('productId');

            if(cartItems.length === 0){
                return res.status(400).json({ 
                    message: 'No items in the cart' 
                });
            }

            //calculate subtotal (without discount)
            const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
            
            //apply discount if provided
            let discount = 0;
            if(discountRate && !isNaN(discountRate) && discountRate > 0){
                discount = (subtotal * discountRate) / 100;
            }
            
            //calculate final total amount with discount applied
            const totalAmount = subtotal - discount;

            //create the order
            const order = new StaffOrderRefillModel({
                staffId,
                items: cartItems.map((item) => ({
                    productId: item.productId._id,
                    productName: item.productName,
                    category: item.productId.category || '',
                    price: item.price,
                    finalPrice: item.price * item.quantity,
                    quantity: item.quantity,
                    uploaderId: item.productId.uploaderId,
                    uploaderType: item.productId.uploaderType,
                    sizeUnit: item.sizeUnit,
                    productSize: item.productSize,
                    createdProductBy: item.productId.createdBy || '',
                    createdProductAt: item.productId.createdAt || new Date(),
                    updatedProductBy: item.productId.updatedBy || '',
                    updatedProductAt: item.productId.updatedAt || new Date(),
                })),
                subtotal,
                discountRate: discountRate || 0,
                discountAmount: discount,
                totalAmount,
                cashReceived,
                changeTotal,
                whoProcessed: staffExists.fullName,
            });

            await order.save();

            //rest of the function remains the same as before
            //update product quantities based on the order
            await Promise.all(cartItems.map(async (item) => {
                await RefillProductModel.findByIdAndUpdate(item.productId._id, {
                    $inc: {quantity: -parseFloat(item.quantity)} //decrease product quantity
                });

                const today = new Date();
                today.setUTCHours(0, 0, 0, 0); //set time to midnight for the day field

                //total sales
                const existingRecord = await TotalSaleModel.findOne({
                    productName: item.productId.productName,
                    day: today,
                });

                if(existingRecord){
                    //update existing record
                    await TotalSaleModel.updateOne(
                        {_id: existingRecord._id},
                        {
                            $inc: {
                                totalProduct: 1,
                                totalSales: item.productId.price * item.quantity,
                                quantitySold: item.quantity,
                            },
                        }
                    );
                } else{
                    //create a new record
                    await TotalSaleModel.create({
                        productName: item.productId.productName,
                        totalProduct: 1,
                        price: item.productId.price,
                        totalSales: item.productId.price * item.quantity,
                        quantitySold: item.quantity,
                        day: today,
                    });
                }

                //get all best selling
                //update bestSellingRecord model
                const bestSellingRecord = await BestSellingModel.findOne({productId: item.productId._id});
                if(bestSellingRecord){
                    //update existing record
                    bestSellingRecord.totalProduct += 1;
                    bestSellingRecord.totalSales += item.price * item.quantity;
                    bestSellingRecord.quantitySold += item.quantity;
                    bestSellingRecord.lastSoldAt = Date.now();
                    await bestSellingRecord.save();
                } else{
                    //create a new record
                    await BestSellingModel.create({
                        productId: item.productId._id,
                        productName: item.productId.productName,
                        price: item.productId.price,
                        totalSales: item.price * item.quantity,
                        quantitySold: item.quantity,
                        sizeUnit: item.productId.sizeUnit,
                        productSize: item.productId.productSize,
                        lastSoldAt: Date.now(),
                    });
                }

                await getSalesReport(
                    item.productId._id,
                    item.productId.productName,
                    item.productId.sizeUnit,
                    item.productId.category,
                    item.productId.price,
                    item.quantity,
                    'refill'
                );
            }));

            //clear the cart
            await StaffCartRefillModel.deleteMany({staffId});

            res.status(201).json({
                message: 'Order created successfully',
                success: true,
                orderId: order._id,
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
};



const getOrderRefillStaff = async(req, res) => {
    try {
        const {orderId} = req.params;

        //If orderId is provided, fetch the specific order
        if(orderId){
            const order = await StaffOrderRefillModel.findById(orderId);
            if(!order){
                return res.status(404).json({
                    message: 'Order not found',
                });
            }

            return res.status(200).json({
                message: 'Order fetched successfully',
                order,
            });
        }

        //otherwise, fetch all orders
        const orders = await StaffOrderRefillModel.find().sort({createdAt: -1});

        res.status(200).json({
            message: 'Orders fetched successfully',
            orders,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Server error',
        });
    }
};

const getAllOrderRefillStaff = async(req, res) => {
    try {
        const staffProducts = await StaffOrderRefillModel.find();
        return res.json(staffProducts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
}

const updateOrderRefillStaff = async(req, res) => {
    try {
        const {orderId} = req.params;
        const {productName, category, quantity} = req.body;

        if(!productName || !category || !quantity){
            return res.json({
                error: 'Please provide all required fields'
            });
        }

        const order = await StaffOrderRefillModel.findById(orderId);
        if(!order){
            return res.json({
                error: 'Product not found'
            });
        }

        //eemove ownership check
        // order.productCode = productCode;
        order.productName = productName;
        order.category = category;
        order.quantity = quantity;

        const updatedOrderWaklin = await order.save();

        return res.json({
            message: 'Order updated successfully!',
            updatedOrderWaklin
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
}


const getUpdateOrderRefillStaff = async(req, res) => {
    const {orderId} = req.params;
    try {
        const order = await StaffOrderRefillModel.findById(orderId);
        if(!order){
            return res.status(404).json({ 
                message: 'Order not found'
            });
        }
        res.json(order);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
}


module.exports = {
    addOrderRefillStaff,
    getOrderRefillStaff,
    getAllOrderRefillStaff,
    updateOrderRefillStaff,
    getUpdateOrderRefillStaff
}