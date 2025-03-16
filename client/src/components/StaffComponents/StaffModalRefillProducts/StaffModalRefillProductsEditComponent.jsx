import React, { useEffect, useState } from 'react'
import '../../../CSS/AdminCSS/AdminModalProducts/AdminModalProductsAdd.css';
import toast from 'react-hot-toast';
import axios from 'axios';
import { ChromePicker, TwitterPicker } from 'react-color';

function StaffModalRefillProductsEditComponent({isOpen, onClose, fetchRefillProducts, selectedProduct}) {
    const [categories, setCategories] = useState([]);
    const [dataInput, setDataInput] = useState({
        productCode: '',
        productName: '', 
        category: '', 
        price: '', 
        quantity: '',
        color: '#ff0000'
    })
    const [showPicker, setShowPicker] = useState(false);
    const [inputValue, setInputValue] = useState(0); 

    useEffect(() => {
        if (selectedProduct) {
            setDataInput({
                productCode: selectedProduct.productCode || '',
                productName: selectedProduct.productName || '',
                category: selectedProduct.category || '',
                price: selectedProduct.price || '',
                quantity: selectedProduct.quantity || '',
                color: selectedProduct.color || '#ff0000'
            });
        }
  }, [selectedProduct]);

    const handleChangeComplete = (color) => {
        setDataInput((prevState) => ({
            ...prevState,
            color: color.hex, 
        }));
    };

    useEffect(() => {
        const fetchCategories = async() => {
            try {
                const response = await axios.get('/adminProductCategory/getProductCategory');
                console.log('Fetched Categories:', response.data);
                if(Array.isArray(response.data)){
                    setCategories(response.data); //ensure categories are set correctly
                } else{
                    setCategories([]); //if not an array, set it as an empty array
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]); //set empty array if there's an error
            }
        };
    
        fetchCategories();
    }, []);
    

    //handle category selection change
    const handleCategoryChange = (event) => {
        const selectedValue = event.target.value;
        setDataInput((prevState) => ({
            ...prevState,
            category: selectedValue,
        }));
    };
    
    if(!isOpen) return null;

    const handleEditProductStaff = async(e) => {
        e.preventDefault();

        const {productCode, productName, category, price, quantity, color} = dataInput;

        const updatedVolume = parseInt(dataInput.quantity) + parseInt(inputValue);
    
        if(!productCode || !productName || !category || !price || !quantity){
            toast.error('Please input all fields');
            return;
        }

        // if (updatedVolume > 105) {
        //     toast.error('volume cannot exceed 105.');
        //     return;
        // }
    
    
        try {
            const response = await axios.put(`/staffRefillProduct/editRefillProductStaff/${selectedProduct._id}`, {
                productCode,
                productName,
                category,
                price,
                quantity: updatedVolume,
                color
            }, {
                headers: {'Content-Type': 'application/json'}
            });
    
            if(response.data.error){
                toast.error(response.data.error);
            } else {
                toast.success(response.data.message);
                onClose();
                fetchRefillProducts();
            }
        } catch (error) {
            console.log(error);
        }
    };
  

  return (
    <div className='admin-modal-products-add-container'>
        <form className='admin-modal-products-add-form'>
            <div className='admin-modal-products-add-header'>
                <h3>Update Refill Product</h3>
                <button onClick={onClose}>X</button>
            </div>
            <div className='admin-modal-products-add-content'>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className='label-information'>
                        <label htmlFor="">Product Information</label>
                    </div>
                    <div className='admin-modal-products-add-inputs'>
                        <div className='label-text'>
                            <div>
                                <label>PRODUCT CODE:</label>
                                <input type="text"
                                value={dataInput.productCode} 
                                onChange={(e) => setDataInput({...dataInput, productCode: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className='label-text'>
                            <div>
                                <label>PRODUCT NAME:</label>
                                <input type="text"
                                value={dataInput.productName} 
                                onChange={(e) => setDataInput({...dataInput, productName: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className='label-text'>
                            <div>
                                <label>CATEGORY:</label>
                                <select
                                value={dataInput.category}
                                onChange={handleCategoryChange}
                                >
                                    <option value="">Select Category</option>
                                    {
                                        categories && categories.length > 0 ? (
                                            categories.map((category) => (
                                                <option key={category._id} value={category.categoryName}>
                                                    {category.categoryName}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="">No categories available</option>
                                        )
                                    }
                                </select>
                            </div>
                        </div>
                        <div className='label-text'>
                            <div>
                                <label>Price:</label>
                                <input type="number"
                                value={dataInput.price} 
                                onChange={(e) => setDataInput({...dataInput, price: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div className='label-text'>
                            <div>
                                <label>UPDATE VOLUME:</label>
                                <input
                                type="number"
                                value={inputValue}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    if(newValue === ''){
                                        setInputValue('');
                                    } else{
                                        setInputValue(newValue);
                                    }
                                }}
                                />
                            </div>
                            <span>
                                = {dataInput.quantity + (inputValue ? Number(inputValue) : 0)}
                            </span>
                        </div>
                        
                        <div style={{ position: 'relative' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '10px' }}>COLOR:</label>
                            <div style={{ position: 'relative' }}>
                                <div 
                                onClick={() => setShowPicker(!showPicker)}
                                style={{
                                width: '50px',
                                height: '50px',
                                backgroundColor: dataInput.color,
                                border: '1px solid #000',
                                cursor: 'pointer',
                                display: 'inline-block',
                                marginLeft: '10px',
                                }}
                                ></div>

                                {
                                    showPicker && (
                                        <div style={{ position: 'absolute', zIndex: 2 }}>
                                            <ChromePicker
                                            color={dataInput.color}
                                            onChangeComplete={handleChangeComplete}
                                            />
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className='admin-modal-products-add-buttons'>
                    <button onClick={handleEditProductStaff}>OKAY</button>
                    <button onClick={onClose}>CANCEL</button>
                </div>
            </div>
        </form>
    </div>
  )
}

export default StaffModalRefillProductsEditComponent