const mongoose = require('mongoose');

const ProductionReportSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    productionQuantity: {
        type: Number,
        required: true
    }
});

const ProductionReportModel = mongoose.model('ProductionReport', ProductionReportSchema);
module.exports = ProductionReportModel