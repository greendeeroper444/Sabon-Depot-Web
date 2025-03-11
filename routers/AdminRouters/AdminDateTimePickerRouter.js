const express = require('express');
const { addDate, getDate, addTime, getTime, deleteDate, updateDate, deleteTime, updateTime, createTimeSlot, updateTimeSlot, getAllTimeSlots, getExtentionTime, addExtentionTime, updateExtentionTime, getExpiryNotifTime, addExpiryNotifTime, updateExpiryNotifTime } = require('../../controllers/AdminControllers/AdminDateTimePickerController');

const router = express.Router();

router.post('/addDate', addDate);
router.get('/getDate', getDate);
router.delete('/deleteDate/:id', deleteDate);
router.put('/updateDate/:id', updateDate);

router.post('/addTime', addTime);
router.get('/getTime', getTime);
router.delete('/deleteTime/:id', deleteTime);
router.put('/updateTime/:id', updateTime);


//newtime
router.post('/createTimeSlot', createTimeSlot);
router.put('/updateTimeSlot/:id', updateTimeSlot);
router.get('/getAllTimeSlots', getAllTimeSlots);



router.get('/getExtentionTime', getExtentionTime);
router.post('/addExtentionTime', addExtentionTime);
router.put('/updateExtentionTime/:id', updateExtentionTime);

router.get('/getExpiryNotifTime', getExpiryNotifTime);
router.post('/addExpiryNotifTime', addExpiryNotifTime);
router.put('/updateExpiryNotifTime/:id', updateExpiryNotifTime);

module.exports = router;