import React, { useEffect, useState } from 'react'
import '../../../CSS/AdminCSS/AdminModalProducts/AdminModalProductsAdd.css';
import toast from 'react-hot-toast';
import axios from 'axios';
import { ChromePicker } from 'react-color';

function StaffModalRefillProductsAddComponent({isOpen, onClose, fetchRefillProducts}) {
    const [categories, setCategories] = useState([]);
    const [dataInput, setDataInput] = useState({
        productName: '', 
        category: '', 
        drum: '', 
        color: '#ff0000'
    })
    const [showPicker, setShowPicker] = useState(false);

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

    const handleAddProductStaff = async (e) => {
        e.preventDefault();
        const {productName, category, drum, color} = dataInput;
    
        if(!productName || !category || !drum){
            toast.error('Please input all fields');
            return;
        }
    
        // if(volume > 105){
        //     toast.error('volume cannot exceed 105');
        //     return;
        // }

        const productData = {productName, category, drum, color};
    
        try {
            const response = await axios.post('/staffRefillProduct/addRefillProductStaff', productData, {
                headers: { 
                    'Content-Type': 'application/json' 
                }
            });
    
            if(response.data.error){
                toast.error(response.data.error);
            } else {
                setDataInput({ 
                    productName: '', 
                    category: '', 
                    drum: '', 
                    color: '#ff0000'
                });
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
                <h3>Add New Refill Product</h3>
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
                                <label>Drum Quantity:</label>
                                <input type="number"
                                value={dataInput.drum} 
                                onChange={(e) => setDataInput({...dataInput, drum: e.target.value})} 
                                />
                            </div>
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
                    <button onClick={handleAddProductStaff}>OKAY</button>
                    <button onClick={onClose}>CANCEL</button>
                </div>
            </div>
        </form>
    </div>
  )
}

export default StaffModalRefillProductsAddComponent