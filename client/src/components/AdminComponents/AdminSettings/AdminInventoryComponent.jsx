import React, { useState, useEffect } from 'react'
import axios from 'axios';
import '../../../CSS/AdminCSS/AdminSettings/AdminInventoryComponent.css';

function AdminInventoryComponent() {
    const [selectedSize, setSelectedSize] = useState('All');
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [sizes, setSizes] = useState([]);
    const [sizeUnit, setSizeUnit] = useState('Milliliters');
    const [productSize, setProductSize] = useState('');
    const [editSizeId, setEditSizeId] = useState(null);

    useEffect(() => {
        fetchCategories();
        fetchSizes();
    }, []);

    const fetchSizes = async() => {
        try {
            const response = await axios.get('/adminProductSize/getProductSize');
            setSizes(response.data);
        } catch (error) {
            console.error('Error fetching sizes', error);
        }
    };

    const fetchCategories = async() => {
        try {
            const response = await axios.get('/adminProductCategory/getProductCategory');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    };

    const handleSizeSubmit = async () => {
        try {
            const endpoint = isEditing 
                ? `/adminProductSize/updateProductSize/${editSizeId}`
                : '/adminProductSize/addProductSize';
            
            const method = isEditing ? 'put' : 'post';
            
            await axios({
                method,
                url: endpoint,
                data: { productSize, sizeUnit }
            });
            
            setProductSize('');
            setSizeUnit('Milliliters');
            setIsSizeModalOpen(false);
            setIsEditing(false);
            fetchSizes();
        } catch (error) {
            console.error(error);
        }
    };
    
    const handleCategorySubmit = async() => {
        try {
            const endpoint = isEditing 
                ? `/adminProductCategory/updateProductCategory/${editCategoryId}`
                : '/adminProductCategory/addProductCategory';
            
            const method = isEditing ? 'put' : 'post';
            
            await axios({
                method,
                url: endpoint,
                data: { categoryName }
            });
            
            setCategoryName('');
            setIsCategoryModalOpen(false);
            setIsEditing(false);
            fetchCategories();
        } catch (error) {
            console.error('Error adding/updating category', error);
        }
    };

    const handleEditSize = (sizeId, productSize, sizeUnit) => {
        setEditSizeId(sizeId);
        setProductSize(productSize);
        setSizeUnit(sizeUnit);
        setIsEditing(true);
        setIsSizeModalOpen(true);
    };

    const handleEditCategory = (categoryId, categoryName) => {
        setEditCategoryId(categoryId);
        setCategoryName(categoryName);
        setIsEditing(true);
        setIsCategoryModalOpen(true);
    };

    const handleDeleteSize = async(sizeId) => {
        if (!window.confirm('Are you sure you want to delete this size?')) return;
        
        try {
            await axios.delete(`/adminProductSize/deleteProductSize/${sizeId}`);
            fetchSizes();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteCategory = async(categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        
        try {
            await axios.delete(`/adminProductCategory/deleteProductCategory/${categoryId}`);
            fetchCategories();
        } catch (error) {
            console.error(error);
        }
    };

    const handleFilterClick = (sizeUnit) => {
        setSelectedSize(sizeUnit);
    };

    const filteredSizes = selectedSize === 'All' ? sizes : sizes.filter(size => size.sizeUnit === selectedSize);

    const getSizeUnitSuffix = (unit) => {
        switch(unit) {
            case 'Milliliters': return 'ml';
            case 'Liters': return 'L';
            case 'Gallons': return 'gal';
            case 'Drums': return 'drum';
            default: return '';
        }
    };

    const formatSizeInput = (value) => {
        const numericValue = value.replace(/[^\d]/g, '');
        return numericValue ? `${numericValue}${getSizeUnitSuffix(sizeUnit)}` : '';
    };

    const getCleanSizeValue = (value) => {
        return value.replace(/[^\d]/g, '');
    };

    const handleKeyDown = (e, submitFn) => {
        if (e.key === 'Enter') {
            submitFn();
        }
    };

  return (
    <div className='admin-inventory-container'>
        <h2 className='admin-section-title'>Inventory Settings</h2>
        <div className='inventory-grid'>
            {/* product category section */}
            <section className='categories-section panel'>
                <div className='panel-header'>
                    <h2>Product Categories</h2>
                    <button 
                        onClick={() => {
                            setIsEditing(false);
                            setCategoryName('');
                            setIsCategoryModalOpen(true);
                        }} 
                        className='add-btn'
                    >
                        <span className='btn-icon'>+</span> Add Category
                    </button>
                </div>
                
                <div className='table-container'>
                    <table className='data-table'>
                        <thead>
                            <tr>
                                <th>Category Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                categories.length > 0 ? (
                                    categories.map((category) => (
                                        <tr key={category._id}>
                                            <td>{category.categoryName}</td>
                                            <td className='action-buttons'>
                                                <button 
                                                    onClick={() => handleEditCategory(category._id, category.categoryName)} 
                                                    className='edit-btn'
                                                    title="Edit category"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteCategory(category._id)} 
                                                    className='delete-btn'
                                                    title="Delete category"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="empty-table">No categories found. Add a category to get started.</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </section>

            {/* product size section */}
            <section className='sizes-section panel'>
                <div className='panel-header'>
                    <h2>Product Sizes</h2>
                    <button 
                        onClick={() => {
                            setIsEditing(false);
                            setProductSize('');
                            setSizeUnit('Milliliters');
                            setIsSizeModalOpen(true);
                        }} 
                        className='add-btn'
                    >
                        <span className='btn-icon'>+</span> Add Size
                    </button>
                </div>
                
                <div className='filter-container'>
                    <div className='filter-label'>Filter by unit:</div>
                    <div className='filter-buttons'>
                        <button
                            onClick={() => handleFilterClick('All')}
                            className={`filter-btn ${selectedSize === 'All' ? 'active' : ''}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => handleFilterClick('Milliliters')}
                            className={`filter-btn ${selectedSize === 'Milliliters' ? 'active' : ''}`}
                        >
                            Milliliters
                        </button>
                        <button
                            onClick={() => handleFilterClick('Liters')}
                            className={`filter-btn ${selectedSize === 'Liters' ? 'active' : ''}`}
                        >
                            Liters
                        </button>
                        <button
                            onClick={() => handleFilterClick('Gallons')}
                            className={`filter-btn ${selectedSize === 'Gallons' ? 'active' : ''}`}
                        >
                            Gallons
                        </button>
                        <button
                            onClick={() => handleFilterClick('Drums')}
                            className={`filter-btn ${selectedSize === 'Drums' ? 'active' : ''}`}
                        >
                            Drums
                        </button>
                    </div>
                </div>
                
                <div className='table-container'>
                    <table className='data-table'>
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Unit</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filteredSizes.length > 0 ? (
                                    filteredSizes.map((size) => (
                                        <tr key={size._id}>
                                            <td>{size.productSize}</td>
                                            <td>{size.sizeUnit}</td>
                                            <td className='action-buttons'>
                                                <button 
                                                    onClick={() => handleEditSize(size._id, size.productSize, size.sizeUnit)} 
                                                    className='edit-btn'
                                                    title="Edit size"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteSize(size._id)} 
                                                    className='delete-btn'
                                                    title="Delete size"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="empty-table">No sizes found matching the selected filter.</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        {/* category modal */}
        {
            isCategoryModalOpen && (
                <div className='modal-overlay' onClick={() => setIsCategoryModalOpen(false)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className='modal-header'>
                            <h2>{isEditing ? 'Edit Category' : 'Add New Category'}</h2>
                            <button 
                                className='modal-close' 
                                onClick={() => setIsCategoryModalOpen(false)}
                                title="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor="categoryName">Category Name:</label>
                                <input
                                    id="categoryName"
                                    type='text'
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className='form-input'
                                    placeholder='Enter category name'
                                    autoFocus
                                    onKeyDown={(e) => handleKeyDown(e, handleCategorySubmit)}
                                />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button 
                                onClick={() => setIsCategoryModalOpen(false)} 
                                className='cancel-button'
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCategorySubmit} 
                                className='submit-button'
                                disabled={!categoryName.trim()}
                            >
                                {isEditing ? 'Update Category' : 'Add Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        {/* size modal */}
        {
        isSizeModalOpen && (
            <div className='modal-overlay' onClick={() => setIsSizeModalOpen(false)}>
                <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                    <div className='modal-header'>
                        <h2>{isEditing ? 'Edit Size' : 'Add New Size'}</h2>
                        <button 
                            className='modal-close' 
                            onClick={() => setIsSizeModalOpen(false)}
                            title="Close"
                        >
                            ×
                        </button>
                    </div>
                    <div className='modal-body'>
                        <div className='form-group'>
                            <label htmlFor="sizeUnit">Unit Type:</label>
                            <select
                                id="sizeUnit"
                                value={sizeUnit}
                                onChange={(e) => {
                                    setSizeUnit(e.target.value);
                                    //update the suffix when unit changes
                                    if(productSize){
                                        const numericValue = getCleanSizeValue(productSize);
                                        setProductSize(`${numericValue}${getSizeUnitSuffix(e.target.value)}`);
                                    }
                                }}
                                className='form-select'
                            >
                                <option value='Milliliters'>Milliliters</option>
                                <option value='Liters'>Liters</option>
                                <option value='Gallons'>Gallons</option>
                                <option value='Drums'>Drums</option>
                            </select>
                        </div>
                        
                        <div className='form-group'>
                            <label htmlFor="productSize">Size Value:</label>
                            <div className='input-with-suffix'>
                                <input
                                    id="productSize"
                                    type='text'
                                    value={getCleanSizeValue(productSize)}
                                    onChange={(e) => {
                                        setProductSize(formatSizeInput(e.target.value));
                                    }}
                                    className='form-input'
                                    placeholder={`Enter numeric value (e.g., 500 for 500${getSizeUnitSuffix(sizeUnit)})`}
                                    autoFocus
                                    onKeyDown={(e) => handleKeyDown(e, handleSizeSubmit)}
                                />
                                <span className='input-suffix'>{getSizeUnitSuffix(sizeUnit)}</span>
                            </div>
                        </div>
                    </div>
                    <div className='modal-footer'>
                        <button 
                            onClick={() => setIsSizeModalOpen(false)} 
                            className='cancel-button'
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSizeSubmit} 
                            className='submit-button'
                            disabled={!getCleanSizeValue(productSize)}
                        >
                            {isEditing ? 'Update Size' : 'Add Size'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default AdminInventoryComponent