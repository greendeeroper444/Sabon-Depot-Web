const mongoose = require('mongoose');


const ExtentionPeriodSchema = new mongoose.Schema({
    extentionPeriod: {
        type: Number,
    },
}, timestamp = true);


const ExtentionPeriodModel = mongoose.model('ExtentionPeriod', ExtentionPeriodSchema);
module.exports = ExtentionPeriodModel;
