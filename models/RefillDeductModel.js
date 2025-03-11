const mongoose = require('mongoose');


const RefillDeductSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        ref: 'Product'
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        default: 0
    },
    volume: {
        type: Number,
    },
    drum: {
        type: Number,
    },
    color: {
        type: String,
    },
}, {timestamps: true});

const RefillDeductModel = mongoose.model('RefillDeduct', RefillDeductSchema);
module.exports = RefillDeductModel;