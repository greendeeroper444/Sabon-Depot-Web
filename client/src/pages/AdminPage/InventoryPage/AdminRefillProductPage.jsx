import React, { useEffect, useState } from 'react'
import '../../../CSS/AdminCSS/AdminInventory/RefillProduct.css';
import AdminModalRefillProductsAddComponent from '../../../components/AdminComponents/AdminModalRefillProducts/AdminModalRefillProductsAddComponent';
import AdminModalRefillProductsDeleteComponent from '../../../components/AdminComponents/AdminModalRefillProducts/AdminModalRefillProductsDeleteComponent';
import AdminModalRefillProductsEditComponent from '../../../components/AdminComponents/AdminModalRefillProducts/AdminModalRefillProductsEditComponent';
import 'jspdf-autotable';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminRefillProductPage() {
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [refillProducts, setRefillProducts] = useState([]); 
    const [productIdToDelete, setProductIdToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedCategory, setSelectedCategory] = useState('');
    const categories = [...new Set(refillProducts.map((product) => product.category))];

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredRefillProducts = refillProducts
        .filter(product => selectedCategory ? product.category === selectedCategory : true)
        .filter(product => product.productName.toLowerCase().includes(searchTerm.toLowerCase()));

    useEffect(() => {
        fetchRefillProducts();
    }, []);

    const fetchRefillProducts = async () => {
        try {
            const response = await axios.get('/adminRefillProduct/getRefillProductAdmin');
            setRefillProducts(response.data);
        } catch (error) {
            console.error('Error fetching refill products:', error);
            setError('Failed to load products');
        }
    };
    
    const handleAddProductClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedProduct(null);
    };

    const handleEditProductClick = async(productId) => {
        try {
            const response = await axios.get(`/adminRefillProduct/getEditRefillProductAdmin/${productId}`);
            setSelectedProduct(response.data);
            setIsEditModalOpen(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteProductClick = (productId) => {
        setProductIdToDelete(productId);
        setIsDeleteModalOpen(true);
    };
    
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setProductIdToDelete(null);
    };
    
    const handleConfirmDelete = async() => {
        try {
            const response = await axios.delete(`/adminRefillProduct/deleteRefillProductAdmin/${productIdToDelete}`);
            setRefillProducts(refillProducts.filter(product => product._id !== productIdToDelete));
            setIsDeleteModalOpen(false);
            setProductIdToDelete(null);
            toast.success(response.data.message);
        } catch (error) {
            console.log(error)
        }
    };

    const getStatusLabel = (level) => {
        if (level >= 75) return { text: 'Normal', className: 'status-normal' };
        if (level >= 50) return { text: 'Medium', className: 'status-medium' };
        return {text: 'Low', className: 'status-low'};
    };

    const getProductColor = (product) => {
        //use the product's color attribute from the database
        if (product.color) {
            //color is stored as a hex string (e.g., '#ff0000')
            return product.color;
        }
        
        //fallback default color if no color is specified
        return '#23a94d';
    };

  return (
    <div className='admin-inventory-container'>
        <AdminModalRefillProductsAddComponent
            isOpen={isModalOpen} 
            onClose={handleCloseModal}
            fetchRefillProducts={fetchRefillProducts}
        />

        <AdminModalRefillProductsDeleteComponent
            isOpen={isDeleteModalOpen} 
            onClose={handleCloseDeleteModal} 
            onConfirm={handleConfirmDelete} 
        />

        <AdminModalRefillProductsEditComponent
            isOpen={isEditModalOpen} 
            selectedProduct={selectedProduct}
            onClose={handleCloseEditModal}
            fetchRefillProducts={fetchRefillProducts}
        />

        <div className='inventory-header'>
            <h2>Current Inventory</h2>
            <div className='inventory-search'>
                <input 
                    type='text'
                    placeholder='Search products...'
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>
        </div>

        <div className='inventory-controls'>
            <div className='category-filter'>
                <select onChange={handleCategoryChange} value={selectedCategory}>
                    <option value=''>All Categories</option>
                    {
                        categories.map((category, index) => (
                            <option key={index} value={category}>
                                {category}
                            </option>
                        ))
                    }
                </select>
            </div>
            <button className='add-product-btn' onClick={handleAddProductClick}>Add Product</button>
        </div>

        {error && <p className='error-message'>{error}</p>}
        
        <table className='inventory-table'>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Level</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {
                    filteredRefillProducts.map((product) => {
                        //actual values from the database
                        const capacity = product.productSize || `${product.quantity}${product.sizeUnit || 'L'}`;
                        //calculate percentage based on actual product data
                        //for demo purposes, let's assume the tank capacity is 100L and calculate accordingly
                        const tankCapacity = parseInt(product.productSize) || 100;
                        const currentQuantity = product.quantity || 0;
                        const percentage = Math.round((currentQuantity / tankCapacity) * 100);
                        const status = getStatusLabel(percentage);
                        const productColor = getProductColor(product);
                        const levelColor = productColor;
                        
                        return (
                            <tr key={product._id}>
                                <td className='product-cell'>
                                    <div className='product-info'>
                                        <div className='product-icon' style={{ backgroundColor: '#f5f5f5' }}>
                                            <div className='bottle-icon' style={{ backgroundColor: productColor }}></div>
                                        </div>
                                        <div className='product-details'>
                                            <div className='product-name'>{product.productName}</div>
                                            <div className='product-category'>{product.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className='level-cell'>
                                    <div className='level-indicator'>
                                        <div 
                                            className='level-fill' 
                                            style={{ 
                                                height: `${percentage}%`, 
                                                backgroundColor: productColor 
                                            }}
                                        ></div>
                                        <span className='level-percentage'>{percentage}%</span>
                                    </div>
                                </td>
                                <td className='capacity-cell'>
                                    <div>
                                        <span className='capacity-value'>{capacity}</span>
                                        <span className='capacity-label'>Total</span>
                                    </div>
                                </td>
                                <td className='status-cell'>
                                    <span className={`status-badge ${status.className}`}>
                                        {status.text}
                                    </span>
                                </td>
                                <td className='actions-cell'>
                                    <button className='edit-btn' onClick={() => handleEditProductClick(product._id)}>
                                        Edit
                                    </button>
                                    {' '}
                                    <button className='delete-btn' onClick={() => handleDeleteProductClick(product._id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })
                }
            </tbody>
        </table>
    </div>
  )
}

export default AdminRefillProductPage