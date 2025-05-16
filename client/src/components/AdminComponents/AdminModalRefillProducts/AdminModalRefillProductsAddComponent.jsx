import React, { useEffect, useState } from 'react'
import '../../../CSS/AdminCSS/AdminModalProducts/AdminModalProductsAdd.css';
import toast from 'react-hot-toast';
import axios from 'axios';
import { ChromePicker } from 'react-color';

//colors for easy selection
const namedColors = [
    { name: 'Red', hex: '#FF0000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#008000' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Pink', hex: '#FFC0CB' },
    { name: 'Brown', hex: '#A52A2A' },
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Cyan', hex: '#00FFFF' },
    { name: 'Magenta', hex: '#FF00FF' }
];

function AdminModalRefillProductsAddComponent({isOpen, onClose, fetchRefillProducts}) {
    const [categories, setCategories] = useState([]);
    const [dataInput, setDataInput] = useState({
        productCode: '',
        productName: '', 
        category: '', 
        quantity: '', 
        price: '', 
        color: '#ff0000'
    });
    const [showPicker, setShowPicker] = useState(false);
    const [colorName, setColorName] = useState('Red');

    const handleChangeComplete = (color) => {
        setDataInput((prevState) => ({
            ...prevState,
            color: color.hex, 
        }));
        
        //find the closest named color
        const closestColor = findClosestNamedColor(color.hex);
        setColorName(closestColor.name);
    };
    
    //select a named color directly
    const selectNamedColor = (color) => {
        setDataInput((prevState) => ({
            ...prevState,
            color: color.hex, 
        }));
        setColorName(color.name);
        setShowPicker(false);
    };
    
    //closest named color to a hex value
    const findClosestNamedColor = (hex) => {
        //simple implementation - find exact match or default to first color
        const exactMatch = namedColors.find(color => color.hex.toLowerCase() === hex.toLowerCase());
        if (exactMatch) return exactMatch;

        return { name: 'Custom', hex: hex };
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
        
        // Set initial color name
        const initialColor = findClosestNamedColor(dataInput.color);
        setColorName(initialColor.name);
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
        const {productCode, productName, category, quantity, price, color} = dataInput;
    
        if(!productCode || !productName || !category || !price || !quantity){
            toast.error('Please input all fields');
            return;
        }

        const productData = {productCode, productName, category, quantity, price, color};
    
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
                    productCode: '',
                    productName: '', 
                    category: '', 
                    quantity: '', 
                    price: '', 
                    color: '#ff0000'
                });
                setColorName('Red');
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
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                                <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                                    {colorName} ({dataInput.color})
                                </span>

                                {
                                    showPicker && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            zIndex: 2, 
                                            top: '60px', 
                                            left: '0', 
                                            backgroundColor: '#fff',
                                            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                                            padding: '10px',
                                            borderRadius: '5px'
                                        }}>
                                            <div style={{ marginBottom: '10px' }}>
                                                <h4 style={{ margin: '0 0 10px 0' }}>Common Colors</h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                                                    {
                                                        namedColors.map((color, index) => (
                                                            <div 
                                                                key={index}
                                                                onClick={() => selectNamedColor(color)}
                                                                style={{
                                                                    width: '30px',
                                                                    height: '30px',
                                                                    backgroundColor: color.hex,
                                                                    border: '1px solid #ccc',
                                                                    cursor: 'pointer',
                                                                    position: 'relative',
                                                                    borderRadius: '3px'
                                                                }}
                                                                title={`${color.name} (${color.hex})`}
                                                            />
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                            
                                            <h4 style={{ margin: '10px 0' }}>Custom Color</h4>
                                            <ChromePicker
                                                color={dataInput.color}
                                                onChangeComplete={handleChangeComplete}
                                            />
                                            <button 
                                                onClick={() => setShowPicker(false)}
                                                style={{
                                                    marginTop: '10px',
                                                    padding: '5px 10px',
                                                    backgroundColor: '#f0f0f0',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '3px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Close
                                            </button>
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