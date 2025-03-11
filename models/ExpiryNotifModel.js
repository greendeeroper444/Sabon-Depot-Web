const mongoose = require('mongoose');


const ExpiryNotifPeriodSchema = new mongoose.Schema({
    expiryNotifPeriod: {
        type: Number,
    },
}, timestamp = true);


const ExpiryNotifPeriodModel = mongoose.model('ExpiryNotifPeriod', ExpiryNotifPeriodSchema);
module.exports = ExpiryNotifPeriodModel;
