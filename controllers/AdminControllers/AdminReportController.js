const AdminInventoryReportModel = require("../../models/AdminModels/AdminInventoryReportModel");
const SalesReportModel = require("../../models/AdminModels/AdminSalesReportModel");
const ProductModel = require("../../models/ProductModel");
const RefillProductModel = require("../../models/RefillProductModel");

//get inventory report
const getInventoryReport = async(productId, productName, sizeUnit, productSize, category, quantity, isOrder = false, isRefill = false) => {
    const reportDate = new Date();
    reportDate.setHours(0, 0, 0, 0);

    //define today's date range for the query to limit to current day's records only
    const startOfDay = reportDate;
    const endOfDay = new Date(reportDate.getTime() + 24 * 60 * 60 * 1000);

    //check for an existing report for the same product on the current date
    let existingReport = await AdminInventoryReportModel.findOne({
        productId,
        reportDate: {
            $gte: startOfDay,
            $lt: endOfDay
        }
    });

    if(existingReport){
        //update existing report if it's already created for today
        existingReport.productName = productName;
        existingReport.sizeUnit = sizeUnit;
        existingReport.productSize = productSize;
        existingReport.category = category;
        existingReport.quantity = quantity;
        existingReport.isRefill = isRefill;
       
        await existingReport.save();
    } else{
        await AdminInventoryReportModel.create({
            productId,
            productName,
            sizeUnit,
            productSize,
            category,
            quantity,
            isRefill,
            reportDate: startOfDay
        });
    }
};

const getInventoryReportsAdmin = async(req, res) => {
    try {
        const adminInventoryReports = await AdminInventoryReportModel.find();
        return res.json(adminInventoryReports);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
}

const getSalesReport = async(
    productId,
    productName,
    sizeUnit,
    category,
    price,
    unitsSold,
    productType
) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);


        let product;
        let isRefill = false;
        
   
        if(productType === 'refill'){
            product = await RefillProductModel.findById(productId);
            isRefill = true;
        } else if(productType === 'product'){
            product = await ProductModel.findById(productId);
            isRefill = false;
        } else{
            product = await ProductModel.findById(productId);
            
            if(!product){
                product = await RefillProductModel.findById(productId);
                isRefill = true;
            }
        }
        
        if(!product){
            throw new Error(`Product not found with ID: ${productId}`);
        }

        let salesReport = await SalesReportModel.findOne({
            productId,
            reportDate: today,
            isRefill
        });

        if(salesReport){
            salesReport.unitsSold += unitsSold;
            salesReport.totalRevenue += product.price * unitsSold;
            salesReport.inventoryLevel = product.quantity;
        } else {
            salesReport = new SalesReportModel({
                productId,
                productName,
                productCode: product.productCode,
                sizeUnit,
                category,
                price: product.price,
                inventoryLevel: product.quantity,
                unitsSold,
                totalRevenue: product.price * unitsSold,
                initialQuantity: product.quantity + unitsSold,
                isRefill,
                reportDate: today,
            });
        }

        await salesReport.save();

        return true;
    } catch (error) {
        console.error(`Sales Report Error: ${error.message}`);
        return false;
    }
};

//get sales reports
const getSalesReportsAdmin = async(req, res) => {
    try {
        const adminsalesReports = await SalesReportModel.find();
        return res.json(adminsalesReports);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: 'Server error' 
        });
    }
};


const updateInventoryReportNames = async(req, res) => {
    const {reportId, preparedBy, checkedBy, receivedBy} = req.body;

    try {
        const report = await AdminInventoryReportModel.findById(reportId);

        if(!report){
            return res.status(404).json({ 
                message: 'Report not found' 
            });
        }

        //update the fields with new names
        if(preparedBy) report.preparedBy = preparedBy;
        if(checkedBy) report.checkedBy = checkedBy;
        if(receivedBy) report.receivedBy = receivedBy;

        //save the updated report
        await report.save();

        return res.json({ 
            message: 'Report updated successfully' 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Sever error' 
        });
    }
};

const updateSalesReportNames = async(req, res) => {
    const {reportId, preparedBy, checkedBy, receivedBy} = req.body;

    try {
        const report = await SalesReportModel.findById(reportId);

        if(!report){
            return res.status(404).json({ 
                message: 'Report not found' 
            });
        }

        //update the fields with new names
        if(preparedBy) report.preparedBy = preparedBy;
        if(checkedBy) report.checkedBy = checkedBy;
        if(receivedBy) report.receivedBy = receivedBy;

        //save the updated report
        await report.save();

        return res.json({ 
            message: 'Report updated successfully' 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Sever error' 
        });
    }
};

module.exports = {
    // createDailyInventoryReportAdmin,
    getInventoryReportsAdmin,
    // createDailySalesReportAdmin,
    getSalesReportsAdmin,
    getInventoryReport,
    getSalesReport,
    updateInventoryReportNames,
    updateSalesReportNames
}