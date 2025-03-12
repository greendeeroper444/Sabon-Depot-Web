import React, { useState, useEffect } from 'react'
import '../../../CSS/AdminCSS/AdminSettings/AdminOrderingComponent.css';
import axios from 'axios';
import { orderDate2 } from '../../../utils/OrderUtils';
import { toast } from 'react-hot-toast';

function AdminOrderingComponent() {
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [isUpdateDateModalOpen, setIsUpdateDateModalOpen] = useState(false);
    const [isUpdateTimeModalOpen, setIsUpdateTimeModalOpen] = useState(false);
    const [date, setDate] = useState('');
    const [dates, setDates] = useState([]);
    const [selectedDateId, setSelectedDateId] = useState(null);
    const [selectedTimeId, setSelectedTimeId] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [newStartTime, setNewStartTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');
    const [updatedStartTime, setUpdatedStartTime] = useState('');
    const [updatedEndTime, setUpdatedEndTime] = useState('');
    const [count, setCount] = useState(1);
    const [prevCount, setPrevCount] = useState(1);
    const [extentionId, setExtentionId] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await Promise.all([
                fetchExtentionPeriod(),
                fetchDates(),
                fetchTimes()
            ]);
            setIsLoading(false);
        };
        
        fetchData();
    }, []);

    const fetchExtentionPeriod = async() => {
        try {
            const response = await axios.get('/adminDatePicker/getExtentionTime');
            if(response.data && response.data.data){
                setCount(response.data.data.extentionPeriod);
                setPrevCount(response.data.data.extentionPeriod);
                setExtentionId(response.data.data._id);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch extension period');
        }
    };

    const handleIncrease = () => {
        setPrevCount(count);
        setCount(prev => prev + 1);
        setShowConfirmation(true);
    };

    const handleDecrease = () => {
        if(count > 1){
            setPrevCount(count);
            setCount(prev => prev - 1);
            setShowConfirmation(true);
        }
    };

    const handleConfirm = async() => {
        try {
            await axios.put(`/adminDatePicker/updateExtentionTime/${extentionId}`, { 
                extentionPeriod: count 
            });
            setShowConfirmation(false);
            toast.success('Extension period updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update extension period');
        }
    };

    const handleCancel = () => {
        setCount(prevCount);
        setShowConfirmation(false);
        toast.error('Extension period update cancelled');
    };

    const fetchDates = async() => {
        try {
            const response = await axios.get('/adminDatePicker/getDate');
            setDates(response.data);
        } catch (error) {
            console.error('Error fetching dates:', error);
            toast.error('Failed to fetch unavailable dates');
        }
    };

    const fetchTimes = async() => {
        try {
            const response = await axios.get('/adminDatePicker/getAllTimeSlots');
            setTimeSlots(response.data);
        } catch (error) {
            console.error('Error fetching time slots:', error);
            toast.error('Failed to fetch time slots');
        }
    };

    //check if date already exists
    const isDateDuplicate = (dateToCheck) => {
        return dates.some(item => {
            const existingDate = new Date(item.date).toISOString().split('T')[0];
            return existingDate === dateToCheck;
        });
    };

    const handleAddDate = async() => {
        if (!date) {
            toast.error('Please select a date');
            return;
        }
        
        try {
            //check for duplicate date
            if(isDateDuplicate(date)){
                toast.error('This date already exists in the unavailable dates list!');
                return;
            }
            
            await axios.post('/adminDatePicker/addDate', {date});
            fetchDates();
            setDate('');
            setIsDateModalOpen(false);
            toast.success('Date added successfully');
        } catch (error) {
            console.error('Error adding date:', error);
            toast.error('Failed to add date');
        }
    };

    const handleDeleteDate = async(id) => {
        if (window.confirm('Are you sure you want to delete this date?')) {
            try {
                await axios.delete(`/adminDatePicker/deleteDate/${id}`);
                fetchDates();
                toast.success('Date deleted successfully');
            } catch (error) {
                console.error('Error deleting date:', error);
                toast.error('Failed to delete date');
            }
        }
    };

    const openUpdateDateModal = (id, existingDate) => {
        setSelectedDateId(id);
        // Format date for the input field
        const formattedDate = new Date(existingDate).toISOString().split('T')[0];
        setDate(formattedDate);
        setIsUpdateDateModalOpen(true);
    };

    //check if time slot overlaps with existing ones
    const isTimeSlotOverlapping = (startTime, endTime, currentId = null) => {
        return timeSlots.some(slot => {
            //skip the current time slot when updating
            if(currentId && slot._id === currentId) return false;
            
            const existingStart = slot.time.startTime;
            const existingEnd = slot.time.endTime;
            
            //check for overlap
            return (
                (startTime >= existingStart && startTime < existingEnd) ||
                (endTime > existingStart && endTime <= existingEnd) ||
                (startTime <= existingStart && endTime >= existingEnd)
            );
        });
    };

    const handleCreateTimeSlot = async() => {
        try {
            //check for time format validity
            if(!newStartTime || !newEndTime){
                toast.error('Please provide both start and end times');
                return;
            }
            
            //check if start time is before end time
            if(newStartTime >= newEndTime){
                toast.error('Start time must be before end time');
                return;
            }
            +
            /*
            if(isTimeSlotOverlapping(newStartTime, newEndTime)){
                toast.error('This time slot overlaps with an existing time slot');
                return;
            }
            */
            
            await axios.post('/adminDatePicker/createTimeSlot', {
                startTime: newStartTime,
                endTime: newEndTime
            });
            fetchTimes();
            setNewStartTime('');
            setNewEndTime('');
            setIsTimeModalOpen(false);
            toast.success('Time slot added successfully');
        } catch (error) {
            console.error('Error creating time slot:', error);
            toast.error('Failed to create time slot');
        }
    };

    const handleDeleteTime = async(id) => {
        if (window.confirm('Are you sure you want to delete this time slot?')) {
            try {
                await axios.delete(`/adminDatePicker/deleteTime/${id}`);
                fetchTimes();
                toast.success('Time slot deleted successfully');
            } catch (error) {
                console.error('Error deleting time:', error);
                toast.error('Failed to delete time slot');
            }
        }
    };

    const handleUpdateTimeSlot = async() => {
        if(!selectedTimeId) return;
        try {
            //check if start time is before end time
            if(updatedStartTime >= updatedEndTime){
                toast.error('Start time must be before end time');
                return;
            }
            
            /*
            if(isTimeSlotOverlapping(updatedStartTime, updatedEndTime, selectedTimeId)){
                toast.error('This time slot overlaps with an existing time slot');
                return;
            }
            */
            
            await axios.put(`/adminDatePicker/updateTimeSlot/${selectedTimeId}`, {
                startTime: updatedStartTime,
                endTime: updatedEndTime
            });
            fetchTimes();
            setUpdatedStartTime('');
            setUpdatedEndTime('');
            setIsUpdateTimeModalOpen(false);
            toast.success('Time slot updated successfully');
        } catch (error) {
            console.error('Error updating time slot:', error);
            toast.error('Failed to update time slot');
        }
    };

    const openUpdateTimeModal = (id, time) => {
        setSelectedTimeId(id);
        setUpdatedStartTime(time.startTime);
        setUpdatedEndTime(time.endTime);
        setIsUpdateTimeModalOpen(true);
    };

    const handleUpdateDate = async() => {
        if (!date) {
            toast.error('Please select a date');
            return;
        }
        
        try {
            //check if the updated date conflicts with another date (excluding the current one)
            const isDuplicate = dates.some(item => {
                if(item._id === selectedDateId) return false;
                const existingDate = new Date(item.date).toISOString().split('T')[0];
                return existingDate === date;
            });
            
            if(isDuplicate){
                toast.error('This date already exists in the unavailable dates list!');
                return;
            }
            
            await axios.put(`/adminDatePicker/updateDate/${selectedDateId}`, { date });
            fetchDates();
            setDate('');
            setIsUpdateDateModalOpen(false);
            toast.success('Date updated successfully');
        } catch (error) {
            console.error('Error updating date:', error);
            toast.error('Failed to update date');
        }
    };

    // Format time for display
    const formatTime = (timeString) => {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
    };

    if (isLoading) {
        return <div className='loading-spinner'>Loading...</div>;
    }

  return (
    <div className='admin-ordering-container'>
        <h2 className='admin-section-title'>Ordering Settings</h2>
        
        <div className='admin-panel'>
            <div className='extension-period-container'>
                <h3 className='section-title'>Extension Period (days)</h3>
                <div className='counter-container'>
                    <button 
                        className={`counter-btn decrease ${count <= 1 ? 'disabled' : ''}`} 
                        onClick={handleDecrease}
                        disabled={count <= 1}
                    >
                        <span className='material-icons'>-</span>
                    </button>
                    <span className='counter-value'>{count}</span>
                    <button className='counter-btn increase' onClick={handleIncrease}>
                        <span className='material-icons'>+</span>
                    </button>

                    {showConfirmation && (
                        <div className='confirmation-controls'>
                            <button className='confirm-btn' onClick={handleConfirm} title='Confirm'>
                                <span className='material-icons'>check</span>
                            </button>
                            <button className='cancel-btn' onClick={handleCancel} title='Cancel'>
                                <span className='material-icons'>close</span>
                            </button>
                        </div>
                    )}
                </div>
                <p className='help-text'>Set the number of days in advance customers can place orders</p>
            </div>

            <div className='action-buttons'>
                <button onClick={() => setIsDateModalOpen(true)} className='action-btn add-date-btn'>
                    <span className='material-icons'></span>
                    Add Unavailable Date
                </button>
                <button onClick={() => setIsTimeModalOpen(true)} className='action-btn add-time-btn'>
                    <span className='material-icons'></span>
                    Add Time Slot
                </button>
            </div>
        </div>

        <div className='data-tables'>
            <div className='table-container'>
                <h3 className='table-title'>
                    <span className='material-icons'></span>
                    Unavailable Dates
                </h3>
                {
                    dates.length === 0 ? (
                        <div className='empty-state'>
                            No unavailable dates added yet
                        </div>
                    ) : (
                        <table className='data-table'>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    dates.map((entry, index) => (
                                        <tr key={entry._id || index}>
                                            <td>{index + 1}</td>
                                            <td>{orderDate2(entry.date)}</td>
                                            <td className='action-cell'>
                                                <button 
                                                    className='edit-btn' 
                                                    onClick={() => openUpdateDateModal(entry._id, entry.date)}
                                                    title='Edit date'
                                                >
                                                    <span className='material-icons'>edit</span>
                                                </button>
                                                <button 
                                                    className='delete-btn' 
                                                    onClick={() => handleDeleteDate(entry._id)}
                                                    title='Delete date'
                                                >
                                                    <span className='material-icons'>delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    )
                }
            </div>

            <div className='table-container'>
                <h3 className='table-title'>
                    <span className='material-icons'></span>
                    Available Time Slots
                </h3>
                {
                    timeSlots.length === 0 ? (
                        <div className='empty-state'>
                            No time slots added yet
                        </div>
                    ) : (
                        <table className='data-table'>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    timeSlots.map((entry, index) => (
                                        <tr key={entry._id || index}>
                                            <td>{index + 1}</td>
                                            <td>{formatTime(entry.time.startTime)}</td>
                                            <td>{formatTime(entry.time.endTime)}</td>
                                            <td className='action-cell'>
                                                <button 
                                                    className='edit-btn' 
                                                    onClick={() => openUpdateTimeModal(entry._id, entry.time)}
                                                    title='Edit time slot'
                                                >
                                                    <span className='material-icons'>edit</span>
                                                </button>
                                                <button 
                                                    className='delete-btn' 
                                                    onClick={() => handleDeleteTime(entry._id)}
                                                    title='Delete time slot'
                                                >
                                                    <span className='material-icons'>delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    )
                }
            </div>
        </div>

        {/* date modal */}
        {
            isDateModalOpen && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h3>Add Unavailable Date</h3>
                            <button className='close-modal-btn' onClick={() => setIsDateModalOpen(false)}>
                                <span className='material-icons'>close</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='date-input'>Select Date:</label>
                                <input
                                    id='date-input'
                                    type='date'
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className='date-input'
                                />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button onClick={() => setIsDateModalOpen(false)} className='cancel-modal-btn'>
                                Cancel
                            </button>
                            <button onClick={handleAddDate} className='submit-modal-btn'>
                                Add Date
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        {/* Time Modal */}
        {
            isTimeModalOpen && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h3>Add Time Slot</h3>
                            <button className='close-modal-btn' onClick={() => setIsTimeModalOpen(false)}>
                                <span className='material-icons'>close</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='start-time'>Start Time:</label>
                                <input
                                    id='start-time'
                                    type='time'
                                    value={newStartTime}
                                    onChange={(e) => setNewStartTime(e.target.value)}
                                    className='time-input'
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='end-time'>End Time:</label>
                                <input
                                    id='end-time'
                                    type='time'
                                    value={newEndTime}
                                    onChange={(e) => setNewEndTime(e.target.value)}
                                    className='time-input'
                                />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button onClick={() => setIsTimeModalOpen(false)} className='cancel-modal-btn'>
                                Cancel
                            </button>
                            <button onClick={handleCreateTimeSlot} className='submit-modal-btn'>
                                Add Time Slot
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        {/* Update Date Modal */}
        {
            isUpdateDateModalOpen && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h3>Update Unavailable Date</h3>
                            <button className='close-modal-btn' onClick={() => setIsUpdateDateModalOpen(false)}>
                                <span className='material-icons'>close</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='update-date-input'>Select Date:</label>
                                <input
                                    id='update-date-input'
                                    type='date'
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className='date-input'
                                />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button onClick={() => setIsUpdateDateModalOpen(false)} className='cancel-modal-btn'>
                                Cancel
                            </button>
                            <button onClick={handleUpdateDate} className='submit-modal-btn'>
                                Update Date
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        {/* Update Time Modal */}
        {
            isUpdateTimeModalOpen && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h3>Update Time Slot</h3>
                            <button className='close-modal-btn' onClick={() => setIsUpdateTimeModalOpen(false)}>
                                <span className='material-icons'>close</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='update-start-time'>Start Time:</label>
                                <input
                                    id='update-start-time'
                                    type='time'
                                    value={updatedStartTime}
                                    onChange={(e) => setUpdatedStartTime(e.target.value)}
                                    className='time-input'
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='update-end-time'>End Time:</label>
                                <input
                                    id='update-end-time'
                                    type='time'
                                    value={updatedEndTime}
                                    onChange={(e) => setUpdatedEndTime(e.target.value)}
                                    className='time-input'
                                />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button onClick={() => setIsUpdateTimeModalOpen(false)} className='cancel-modal-btn'>
                                Cancel
                            </button>
                            <button onClick={handleUpdateTimeSlot} className='submit-modal-btn'>
                                Update Time Slot
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
    </div>
  )
}

export default AdminOrderingComponent