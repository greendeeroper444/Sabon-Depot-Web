import React, { useState } from 'react'
import '../../../CSS/CustomerCSS/Shop/CustomerShopContent2.css';
import { Link } from 'react-router-dom';
import UseFetchRefillProductsHook from '../../../hooks/AdminHooks/UseFetchRefillProductsHook';

function AdminDirectOrdersRefillContentComponent({
    onAddToCart,
    selectedCategory
}) {
    const {refillProducts, loading, error} = UseFetchRefillProductsHook(selectedCategory);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    //filter products based on selected category
    const filteredRefillProducts = refillProducts.filter(product => {
        const categoryMatches = selectedCategory ? product.category === selectedCategory : true;
        return categoryMatches;
    });

    const totalItems = filteredRefillProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredRefillProducts.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    
    const calculatePercentage = (product) => {
        const tankCapacity = parseInt(product.productSize) || 100;
        const currentQuantity = product.quantity || 0;
        return Math.round((currentQuantity / tankCapacity) * 100);
    };

    if(loading) return <div>Loading...</div>;
    if(error) return <div>Error: {error.message}</div>;

  return (
    <div className='shop-products-content'>
        <div className='refill-shop-products-contents'>
            <div className='refill-product-grid'>
                {
                    paginatedProducts.map((product) => (
                        <div className='refill-product-card' key={product._id}>
                            <div className='product-capsule-container'>
                                <div className='product-capsule-wrapper'>
                                    <div 
                                        className='product-capsule' 
                                        style={{ 
                                            color: product.color,
                                            '--fill-height': `${calculatePercentage(product)}%`
                                        }}
                                    >
                                        <div className='capsule-text'>
                                            {calculatePercentage(product)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='product-info' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <h3>{product.productName}</h3>
                                <p>{product.quantity}L Available</p>
                                <div className='product-actions'>
                                    <div className='eco-badge'>
                                        <span className='eco-icon'>♻</span> Eco-friendly
                                    </div>
                                    <button 
                                        className='add-button'
                                        onClick={() => onAddToCart(product._id)}
                                    >
                                        <span className='plus-icon'>+</span> Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>

        {
            totalPages > 1 && (
                <div className='customer-shop-content-pagination'>
                    <button
                        className='page-item'
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        className='page-item'
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            )
        }
    </div>
  )
}

export default AdminDirectOrdersRefillContentComponent