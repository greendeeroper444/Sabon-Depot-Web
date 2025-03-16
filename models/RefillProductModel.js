const mongoose = require('mongoose');


const RefillProductSchema = new mongoose.Schema({
    productCode: {
        type: String,
        required: true,
        trim: true
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
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        default: 'blue'
    },
    sizeUnit: {
        type: String,
        default: 'Liters'
    },
    productSize: {
        type: String,
    },
    uploaderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    uploaderType: {
        type: String,
        required: true,
        enum: ['Admin', 'Staff']
    },
    createdBy: {
        type: String,
        required: true,
        trim: true
    },
    updatedBy: {
        type: String,
        trim: true
    },
}, {timestamps: true});

const RefillProductModel = mongoose.model('RefillProduct', RefillProductSchema);
module.exports = RefillProductModel;