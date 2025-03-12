const schedule = require('node-schedule');
const ProductModel = require('../models/ProductModel');
const AdminNotificationModel = require('../models/AdminModels/AdminNotificationModel');
const CartModel = require('../models/CartModel');
const StaffCartModel = require('../models/StaffModels/StaffCartModel');
const AdminNotificationOrderModel = require('../models/AdminModels/AdminNotificationOrderModel');
const StaffCartRefillModel = require('../models/StaffModels/StaffCartRefillModel');

//run daily at midnight (0 0 * * *)
schedule.scheduleJob('0 0 * * *', async() => {
    try {
        const currentDate = new Date();
        const currentDateString = currentDate.toISOString().split('T')[0];
        
        //notify about products expiring in 1, 2, or 3 days
        for(let i = 1; i <= 3; i++){
            const notifyDate = new Date(currentDate);
            notifyDate.setDate(currentDate.getDate() + i);
            const notifyDateString = notifyDate.toISOString().split('T')[0];
            
            //find products with expirationDate matching the notifyDate
            const expiringProducts = await ProductModel.find({
                expirationDate: notifyDateString,
            });
            
            if(expiringProducts.length > 0) {
                //group products by batch
                const batchGroups = {};
                
                for(const product of expiringProducts) {
                    const batch = product.batch || 'Unspecified Batch';
                    
                    if(!batchGroups[batch]) {
                        batchGroups[batch] = [];
                    }
                    
                    batchGroups[batch].push(product);
                }
                
                //create one notification per batch
                for(const batch in batchGroups) {
                    const productsInBatch = batchGroups[batch];
                    const productNames = productsInBatch.map(p => p.productName).join(', ');
                    const productCount = productsInBatch.length;
                    
                    //create notification with batch information and list of products
                    const notificationMessage = `${i} day(s) left before expiration for ${productCount} product(s) in ${batch}: ${productNames}`;
                    
                    const notification = new AdminNotificationModel({
                        message: notificationMessage,
                        productId: productsInBatch[0]._id,
                        expirationDate: notifyDateString,
                        productName: `${productCount} products in ${batch}`,
                        createdAt: new Date(),
                    });
                    
                    await notification.save();
                    console.log(`Sent batch notification for ${productCount} product(s) in ${batch} expiring in ${i} day(s).`);
                }
            }
        }
        
        //delete products that expire exactly on the current date
        const expiredProducts = await ProductModel.find({
            expirationDate: currentDateString,
        });
        
        if(expiredProducts.length > 0){
            console.log(`Found ${expiredProducts.length} products to delete on expiration date: ${currentDateString}`);
            
            for (const product of expiredProducts) {
                //remove product from all related collections
                await CartModel.deleteMany({productId: product._id});
                await StaffCartModel.deleteMany({productId: product._id});
                await StaffCartRefillModel.deleteMany({productId: product._id});
                await AdminNotificationOrderModel.deleteMany({productId: product._id});
                console.log(`Removed product from carts: ${product.productName}`);
                
                //delete the product
                await ProductModel.findByIdAndDelete(product._id);
                console.log(`Deleted expired product: ${product.productName}`);
            }
        }
    } catch (error) {
        console.error('Error handling product expiration:', error);
    }
});