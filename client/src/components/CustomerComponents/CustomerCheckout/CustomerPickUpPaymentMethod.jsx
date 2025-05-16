import React, { useState, useEffect } from 'react'
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../CSS/CustomerCSS/CustomerCheckout/CustomerPickUpPaymentMethod.css';
import { toast } from 'react-hot-toast';
import moment from 'moment-timezone';

const CustomerPickUpPaymentMethod = ({
    onClose,
    handlePickupPayment,
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
}) => {
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [localSelectedDate, setLocalSelectedDate] = useState(
        selectedDate ? new Date(selectedDate) : null
    );
    const [localSelectedTime, setLocalSelectedTime] = useState(selectedTime || '');
    const [hasAvailableTimesToday, setHasAvailableTimesToday] = useState(false);

    //fetch unavailable dates from the backend
    useEffect(() => {
        const fetchUnavailableData = async() => {
            try {
                const response = await axios.get('/customerDatePicker/getDateUnavailable');
                setUnavailableDates(response.data.unavailable || []);
            } catch (error) {
                console.error('Error fetching unavailable dates:', error);
                setUnavailableDates([]);
            }
        };

        fetchUnavailableData();
    }, []);

    //fetch available times from the backend
    useEffect(() => {
        const fetchAvailableTimes = async() => {
            try {
                const response = await axios.get('/customerDatePicker/getTimeAvailable');
                const times = response.data || [];
                setAvailableTimes(times);
                
                //check if any times are available for today
                checkAvailableTimesToday(times);
            } catch (error) {
                console.error('Error fetching available times:', error);
                setAvailableTimes([]);
                setHasAvailableTimesToday(false);
            }
        };

        fetchAvailableTimes();
    }, []);

    //check if any times are available for today
    const checkAvailableTimesToday = (times) => {
        const currentTime = moment().tz('Asia/Singapore').format('HH:mm');
        
        const availableTimesToday = times.filter(entry => {
            //extract time from formattedTime or use the time object if available
            const timeToCheck = entry.formattedTime || 
                (entry.time && `${entry.time.startTime}-${entry.time.endTime}`);
            
            if(!timeToCheck) return false;
            
            //extract the start time from the format
            const startTime = timeToCheck.includes('-') 
                ? timeToCheck.split('-')[0].trim() 
                : timeToCheck.trim();
            
            //compare with current time - must be at least 15 minutes in the future
            const currentTimeMoment = moment(currentTime, 'HH:mm');
            const startTimeMoment = moment(startTime, 'HH:mm');
            
            //add 15 minutes buffer to current time
            const bufferTime = moment(currentTimeMoment).add(15, 'minutes');
            
            return startTimeMoment.isAfter(bufferTime);
        });
        
        setHasAvailableTimesToday(availableTimesToday.length > 0);
    };

    //determine if a date should be disabled (past dates or unavailable dates)
    const isDateDisabled = (date) => {
        //convert to local timezone for comparison
        const dateString = moment(date).tz('Asia/Singapore').format('YYYY-MM-DD');
        const currentDate = moment().tz('Asia/Singapore').format('YYYY-MM-DD');
        
        //check if the date is today
        const isToday = dateString === currentDate;
        
        //disable past dates
        if(dateString < currentDate){
            return true;
        }
        
        //disable today if no available times remain
        if (isToday && !hasAvailableTimesToday) {
            return true;
        }
        
        //disable dates marked as unavailable
        return unavailableDates.includes(dateString);
    };

    //force disable today's date in the DatePicker component
    const filterDate = (date) => {
        const dateString = moment(date).tz('Asia/Singapore').format('YYYY-MM-DD');
        const currentDate = moment().tz('Asia/Singapore').format('YYYY-MM-DD');
        console.log('Right now date:', currentDate);
        
        //always disable today
        if(dateString === currentDate){
            return false;
        }   
        
        //use the regular isDateDisabled function for other dates
        return !isDateDisabled(date);
    };

    //filter available times based on the current time for today's date
    const getFilteredTimes = () => {
        if(!localSelectedDate) return [];

        const currentDate = moment().tz('Asia/Singapore').format('YYYY-MM-DD');
        const selectedDateFormatted = moment(localSelectedDate).tz('Asia/Singapore').format('YYYY-MM-DD');
        const currentTime = moment().tz('Asia/Singapore').format('HH:mm');

        //if selected date is today, filter out past times
        if(selectedDateFormatted === currentDate){
            return availableTimes.filter(entry => {
                //extract time from formattedTime or use the time object if available
                const timeToCheck = entry.formattedTime || 
                    (entry.time && `${entry.time.startTime}-${entry.time.endTime}`);
                
                if(!timeToCheck) return false;
                
                //extract the start time from the format
                const startTime = timeToCheck.includes('-') 
                    ? timeToCheck.split('-')[0].trim() 
                    : timeToCheck.trim();
                
                //compare with current time - must be at least 15 minutes in the future
                const currentTimeMoment = moment(currentTime, 'HH:mm');
                const startTimeMoment = moment(startTime, 'HH:mm');
                
                //add 15 minutes buffer to current time
                const bufferTime = moment(currentTimeMoment).add(15, 'minutes');
                
                return startTimeMoment.isAfter(bufferTime);
            });
        }

        //for future dates, return all available times
        return availableTimes;
    };

    //handle date change
    const handleDateChange = (date) => {
        if(!date) return;

        const dateString = date.toISOString().split('T')[0];
        setLocalSelectedDate(date);
        setSelectedDate(dateString);
        setLocalSelectedTime('');
        setSelectedTime('');
    };

    //handle time change
    const handleTimeChange = (e) => {
        const time = e.target.value;
        setLocalSelectedTime(time);
        setSelectedTime(time);
    };

    //reset to default state when Cancel is clicked
    const handleCancel = () => {
        setLocalSelectedDate(null);
        setLocalSelectedTime('');
        setSelectedDate(null);
        setSelectedTime('');
        onClose?.();
    };

    //submit the selected date and time
    const handleSubmit = () => {
        if(!localSelectedDate || !localSelectedTime){
            toast.error('Please select both a date and time before submitting.');
            return;
        }
        handlePickupPayment({
            pickupDate: localSelectedDate.toISOString().split('T')[0],
            pickupTime: localSelectedTime,
        });
        onClose?.();
    };

    //get filtered times based on current date/time
    const filteredTimes = getFilteredTimes();

    //calculate the minimum date to allow - force tomorrow
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    };

    //format the selected date for display
    const formatSelectedDate = () => {
        if (!localSelectedDate) return "";
        
        //actual selected date object directly
        return localSelectedDate.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

  return (
    <div className='customer-pickup-payment-container'>
        <div className='customer-pickup-payment-content'>
            <h2>Pick-Up Date & Time</h2>

            {/* date picker */}
            <DatePicker
                selected={localSelectedDate}
                onChange={handleDateChange}
                filterDate={filterDate}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select a date"
                className='date-picker'
                minDate={getMinDate()}
            />

            {/*time dropdown */}
            <select
                value={localSelectedTime}
                onChange={handleTimeChange}
                disabled={!localSelectedDate}
            >
                <option value="" disabled>
                    Select a time
                </option>
                {
                    filteredTimes.map((entry) => {
                        const timeValue = entry.formattedTime || 
                            (entry.time && `${entry.time.startTime}-${entry.time.endTime}`);
                        return (
                            <option key={entry._id} value={timeValue}>
                                {timeValue}
                            </option>
                        );
                    })
                }
            </select>

            {
                localSelectedDate && localSelectedTime && (
                    <div className='time-display'>
                        {formatSelectedDate()}
                        <br />
                        {localSelectedTime}
                    </div>
                )
            }

            <div className='disclaimer'>
                <p>
                    <strong>Disclaimer:</strong> If your order is not picked up on the selected date and time, 
                    it will be automatically canceled.
                </p>
            </div>

            <div className='modal-buttons'>
                <button className='cancel-button' onClick={handleCancel}>
                    Cancel
                </button>
                <button className='submit-button' onClick={handleSubmit}>
                    Submit
                </button>
            </div>
        </div>
    </div>
  )
}

export default CustomerPickUpPaymentMethod