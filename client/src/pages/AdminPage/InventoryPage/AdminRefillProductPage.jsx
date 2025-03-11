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

    const [selectedCategory, setSelectedCategory] = useState('');
    const categories = [...new Set(refillProducts.map((product) => product.category))];

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const filteredRefillProducts = selectedCategory
    ? refillProducts.filter((product) => product.category === selectedCategory)
    : refillProducts;

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
    
    //delete function
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
  return (
    <div className='admin-finished-product-container'>
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

        <div className='admin-finished-product-controls'>
            <div>Refill Products</div>
            <div>
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
               
                <button onClick={handleAddProductClick}>Add Product</button>
            </div>
        </div>

        {error && <p>{error}</p>}
        <br />
        <br />
        <br />
        <table className='product-table'>
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th>Liquid Level</th>
                    <th>Drum Quantity</th>
                    <th>Volume (L)</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {
                    filteredRefillProducts.map((product) => {
                        const waterLevel = (product.volume / product.maximumSizeLiter) * 100;
                        
                        return (
                            <tr key={product._id}>
                                <td>{product.productName}</td>
                                <td>
                                    <div className='cylinder'>
                                        <div
                                            className='water'
                                            style={{ height: `${waterLevel}%`, background: product.color }}
                                        ></div>
                                    </div>
                                </td>
                                <td>{product.drum} Drum</td>
                                <td>{product.volume}L</td>
                                <td>
                                    <button onClick={() => handleEditProductClick(product._id)}>Edit</button>
                                    {' '}
                                    <button onClick={() => handleDeleteProductClick(product._id)}>Delete</button>
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