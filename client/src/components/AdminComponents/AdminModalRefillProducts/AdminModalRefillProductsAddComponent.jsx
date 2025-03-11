import React, { useEffect, useState } from 'react'
import '../../../CSS/AdminCSS/AdminModalProducts/AdminModalProductsAdd.css';
import toast from 'react-hot-toast';
import axios from 'axios';
import { ChromePicker } from 'react-color';

function AdminModalRefillProductsAddComponent({isOpen, onClose, fetchRefillProducts}) {
    const [categories, setCategories] = useState([]);
    const [dataInput, setDataInput] = useState({
        productName: '', 
        category: '', 
        quantity: '', 
        price: '', 
        color: '#ff0000'
    })
    const [showPicker, setShowPicker] = useState(false);

    const handleChangeComplete = (color) => {
        setDataInput((prevState) => ({
            ...prevState,
            color: color.hex, 
        }));
        setShowPicker(!showPicker);
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

    const handleAddProductAdmin = async (e) => {
        e.preventDefault();
        const {productName, category, quantity, price, color} = dataInput;
    
        if(!productName || !category || !price || !quantity){
            toast.error('Please input all fields');
            return;
        }
    
        // if(quantity > 105){
        //     toast.error('quantity cannot exceed 105');
        //     return;
        // }

        const productData = {productName, category, quantity, price, color};
    
        try {
            const response = await axios.post('/adminRefillProduct/addRefillProductAdmin', productData, {
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
                    quantity: '', 
                    price: '', 
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
                                <label>Volume:</label>
                                <input type="number"
                                value={dataInput.quantity} 
                                onChange={(e) => setDataInput({...dataInput, quantity: e.target.value})} 
                                />
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
                    <button onClick={handleAddProductAdmin}>OKAY</button>
                    <button onClick={onClose}>CANCEL</button>
                </div>
            </div>
        </form>
    </div>
  )
}

export default AdminModalRefillProductsAddComponent