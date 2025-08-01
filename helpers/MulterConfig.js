const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../helpers/CloudinaryConfig');

//set up multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'products', //cloudinary folder name
        format: async (req, file) => 'png', //save as PNG format
        public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now(),
    },
});

//initialize multer with Cloudinary storage
const upload = multer({
    storage: storage,
    limits: {fileSize: 5 * 1024 * 1024 },
}).single('image');

module.exports = upload;


// ----UPDATED------
// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const cloudinary = require('../helpers/CloudinaryConfig');

// //set up multer storage for Cloudinary with optimized transformations
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: 'products', //cloudinary folder name
//         format: async (req, file) => 'auto', //use auto format for optimal compression
//         public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now(),
//         transformation: [
//             { width: 500, height: 500, crop: 'limit', quality: 'auto' }
//         ]
//     },
// });

// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 5 * 1024 * 1024 },
// }).single('image');

// module.exports = upload;