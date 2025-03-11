import React, { useEffect, useState } from 'react'
import '../../../CSS/AdminCSS/AdminModalProducts/AdminModalProductsAdd.css';
import uploadIcon from '../../../assets/staff/stafficons/staff-prices-upload-icon.png';
import toast from 'react-hot-toast';
import axios from 'axios';

function StaffModalProductsEditComponent({isOpen, onClose, selectedProduct, fetchProducts}) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [dataInput, setDataInput] = useState({
        productCode: '',
        productName: '',
        category: '',
        price: '',
        quantity: '',
        stockLevel: '',
        discountPercentage: '',
        discountedDate: '',
        productSize: '',
        sizeUnit: '',
        expirationDate: '',
        updatedAt: '',
        description: '',
    });
    const [inputValue, setInputValue] = useState(''); 
    const [categories, setCategories] = useState([]);
    const [sizeUnits, setSizeUnits] = useState([]);
    const [originalExpirationDate, setOriginalExpirationDate] = useState('');
    const [isNewProduct, setIsNewProduct] = useState(false);


    useEffect(() => {
        const fetchSizeUnits = async() => {
            try {
                const response = await axios.get('/adminProductSize/getSizeUnitsWithSizes');
                setSizeUnits(response.data);
                console.log('Size Units fetched',response.data);
            } catch (error) {
                console.error(error);
                setSizeUnits([]); //handle errors gracefully
            }
        };
    
        fetchSizeUnits();
    }, []);

    useEffect(() => {
        const fetchCategories = async() => {
            try {
                const response = await axios.get('/adminProductCategory/getProductCategory');
                console.log('Fetched Categories:', response.data);
                if(Array.isArray(response.data)){
                    setCategories(response.data);//ensure categories are set correctly
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
    
    //check for expiration date change and update UI accordingly
    const handleExpirationDateChange = (e) => {
        const newExpirationDate = e.target.value;
        setDataInput({...dataInput, expirationDate: newExpirationDate});
        
        //check if expiration date has changed from original
        if(newExpirationDate !== originalExpirationDate){
            setIsNewProduct(true);
            //reset input value since this will be a new product
            setInputValue('');
        } else{
            setIsNewProduct(false);
        }
    };

    const handleEditProductStaff = async(e) => {
        e.preventDefault();

        //calculate quantity based on whether this is a new product or not
        const updatedQuantity = isNewProduct 
            ? (!isNaN(parseInt(inputValue)) ? parseInt(inputValue) : 0)  //for new product, just use input value
            : (!isNaN(parseInt(dataInput.quantity)) ? parseInt(dataInput.quantity) : 0) + 
            (!isNaN(parseInt(inputValue)) ? parseInt(inputValue) : 0);  //for existing product, add to current quantity


        const formData = new FormData();
        formData.append('productCode', dataInput.productCode);
        formData.append('productName', dataInput.productName);
        formData.append('category', dataInput.category);
        formData.append('price', dataInput.price);
        formData.append('quantity', updatedQuantity);
        formData.append('stockLevel', dataInput.stockLevel)
        formData.append('discountPercentage', dataInput.discountPercentage);
        formData.append('discountedDate', dataInput.discountedDate);
        formData.append('productSize', dataInput.productSize);
        formData.append('sizeUnit', dataInput.sizeUnit);
        formData.append('expirationDate', dataInput.expirationDate);
        formData.append('updatedAt', dataInput.updatedAt);
        formData.append('description', dataInput.description);
        if(selectedImage && typeof selectedImage !== 'string'){
            formData.append('image', selectedImage);
        }

        //show loading toast
        const loadingToastId = toast.loading('Updating product...');


        try {
            const response = await axios.put(`/staffProduct/editProductStaff/${selectedProduct._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            //remove loading toast
            toast.dismiss(loadingToastId);
            
            if(response.data.newProduct){
                toast.success('New product created with updated expiration date!');
            } else{
                toast.success(response.data.message);
            }
            
            onClose();
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToastId);
            toast.error('Something went wrong, please try again.');
        }
    };
    

    useEffect(() => {
        if(selectedProduct){
            const {productCode, productName, category, price, quantity, stockLevel, imageUrl, discountPercentage, discountedDate, productSize, sizeUnit, expirationDate, updatedAt, description} = selectedProduct;
            
            //store the original expiration date for comparison
            if(expirationDate){
                setOriginalExpirationDate(new Date(expirationDate).toISOString().split('T')[0]);
            }
            
            setDataInput({
                productCode: productCode || '',
                productName: productName || '',
                category: category || '',
                price: price || '',
                quantity: quantity || 0,
                stockLevel: stockLevel || '',
                discountPercentage: discountPercentage || '',
                discountedDate: discountedDate ? new Date(discountedDate).toISOString().split('T')[0] : '',
                productSize: productSize || '',
                sizeUnit: sizeUnit || '',
                expirationDate: expirationDate ? new Date(expirationDate).toISOString().split('T')[0] : '',
                updatedAt: updatedAt ? new Date(updatedAt).toISOString().split('T')[0] : '',
                description: description || '',
            });
            setSelectedImage(imageUrl || null);
            setIsNewProduct(false); //reset this when loading a product
        }
    }, [selectedProduct]);

    const handleFileInputClick = () => {
        document.getElementById('file-input').click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
        }
    };

    const handleSizeUnitChange = (e) => {
        setDataInput({
            ...dataInput,
            sizeUnit: e.target.value,
            productSize: '', //reset product size when unit changes
        });
    };

    const renderSizeInputOptions = () => {
        const selectedUnit = sizeUnits.find(unit => unit.sizeUnit === dataInput.sizeUnit);
    
        if(!selectedUnit) return null;
    
        return (
            <select
            value={dataInput.productSize}
            onChange={(e) => setDataInput({ ...dataInput, productSize: e.target.value })}
            >
                <option value="">Select size</option>
                {
                    selectedUnit.sizes.map((size, index) => (
                        <option key={index} value={size}>
                            {size}
                        </option>
                    ))
                }
            </select>
        );
    };

    if(!isOpen) return null;

  return (
    <div className='admin-modal-products-add-container'>
        <form className='admin-modal-products-add-form'>
            <div className='admin-modal-products-add-header'>
                <h3>{isNewProduct ? 'Create New Product' : 'Update Product'}</h3>
                <button onClick={onClose}>X</button>
            </div>
            <div className='admin-modal-products-add-content'>
                <div className='admin-modal-products-add-image-upload'>
                    <div className='admin-modal-products-add-image-upload-left'>
                        <label htmlFor="file-input">
                            <img
                            src={selectedImage ? (typeof selectedImage === 'string' 
                                ? `${selectedImage}` 
                                : URL.createObjectURL(selectedImage)) 
                                : uploadIcon}
                            alt="upload placeholder"
                            className='upload-placeholder'
                            onError={(e) => {e.target.onerror = null; e.target.src = uploadIcon; }}
                            />
                        </label>
                    </div>
                    <div className='admin-modal-products-add-image-upload-right'>
                        <span className='upload-instructions'>Please upload square image, size less than 100KB</span>
                        <div className='file-input-container'>
                            <input
                            id='file-input'
                            type="file"
                            accept='image/png, image/jpeg, image/jpg'
                            onChange={handleFileChange}
                            />
                            <span className='file-input-label' onClick={handleFileInputClick}>Choose File</span>
                            <span className='file-input-text'>{selectedImage ? 'File Chosen' : 'No File Chosen'}</span>
                        </div>
                    </div>
                </div>
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
                                <label>SIZE UNIT:</label>
                                <select
                                value={dataInput.sizeUnit}
                                onChange={handleSizeUnitChange}
                                >
                                    <option value="">Select size unit</option>
                                    {
                                        sizeUnits.map((unit, index) => (
                                            <option key={index} value={unit.sizeUnit}>
                                                {unit.sizeUnit}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className='label-information'>
                        <label htmlFor="">Stock & Pricing</label>
                    </div>
                    <div className='admin-modal-products-add-inputs'>
                        {
                            dataInput.sizeUnit && (
                                <div className='label-text'>
                                    <div>
                                        <label>PRODUCT SIZE:</label>
                                        {renderSizeInputOptions()}
                                    </div>
                                </div>
                            )
                        }
                        <div className='label-text'>
                            <div>
                                <label>PRICE:</label>
                                <input type="number"
                                value={dataInput.price} 
                                onChange={(e) => setDataInput({...dataInput, price: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div className='label-text'>
                            <div>
                                <label>{isNewProduct ? 'NEW QUANTITY:' : 'UPDATE QUANTITY:'}</label>
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
                            {!isNewProduct && (
                                <span>
                                    = {dataInput.quantity + (inputValue ? Number(inputValue) : 0)}
                                </span>
                            )}
                        </div>
                        <div className='label-text'>
                            <div>
                                <label>STOCK LEVEL:</label>
                                <input type="number"
                                value={dataInput.stockLevel} 
                                onChange={(e) => setDataInput({...dataInput, stockLevel: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className='label-information'>
                        <label htmlFor="">Discount & Expiry</label>
                    </div>
                    <div className='admin-modal-products-add-inputs'>
                        <div className='label-text'>
                            <div>
                                <label>DISCOUNT PERCENTAGE:</label>
                                <input
                                    type="number"
                                    value={dataInput.discountPercentage}
                                    onChange={(e) => setDataInput({...dataInput, discountPercentage: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className='label-text'>
                            <div>
                                <label>DISCOUNT END:</label>
                                <input
                                type="date"
                                value={dataInput.discountedDate}
                                onChange={(e) => setDataInput({...dataInput, discountedDate: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className='label-text'>
                            <div>
                                <label>EXPIRATION DATE:</label>
                                <input
                                type="date"
                                value={dataInput.expirationDate}
                                onChange={handleExpirationDateChange}
                                />
                            </div>
                            {isNewProduct && (
                                <div style={{marginTop: '8px', color: '#ff6b6b', fontSize: '12px'}}>
                                    Creating a new product with different expiration date
                                </div>
                            )}
                        </div>
                        <div className='label-text'>
                            <div>
                                <label>UPLOADED DATE:</label>
                                <input
                                type="date"
                                value={dataInput.updatedAt}
                                onChange={(e) => setDataInput({...dataInput, updatedAt: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className='label-information'>
                        <label htmlFor="">Description</label>
                    </div>
                    <div className='label-text'>
                        <div>
                            <label>DESCRIPTION:</label>
                            <textarea
                                value={dataInput.description} 
                                onChange={(e) => setDataInput({...dataInput, description: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                <div className='admin-modal-products-add-buttons'>
                    <button onClick={handleEditProductStaff}>{isNewProduct ? 'CREATE NEW' : 'SAVE'}</button>
                    <button onClick={onClose}>CANCEL</button>
                </div>
            </div>
        </form>
    </div>
  )
}

export default StaffModalProductsEditComponent