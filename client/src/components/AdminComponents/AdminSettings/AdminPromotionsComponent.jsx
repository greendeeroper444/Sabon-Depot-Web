import React, { useEffect, useState } from 'react'
import axios from 'axios';
import editIcon from '../../../assets/staff/stafficons/staff-orders-edit-icon.png';
import toast from 'react-hot-toast';
import { orderDate } from '../../../utils/OrderUtils';
import AdminModalProductsEditComponent from '../../../components/AdminComponents/AdminModalProducts/AdminModalProductsEditComponent';
import '../../../CSS/AdminCSS/AdminSettings/AdminPromitionsComponent.css';
import { optimizeCloudinaryUrl } from '../../../utils/OptimizeCloudinaryUrl';

function AdminPromotionsComponent() {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [summaryData, setSummaryData] = useState({
        categoryCount: 0,
        totalProducts: 0,
        totalUnitsProduced: 0,
        totalValue: 0,
        lowStockCount: 0,
        notInStock: 0
    });
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    //get unique categories
    const categories = [...new Set(products
        .filter(product => product.discountPercentage && product.discountPercentage > 0)
        .map(product => product.category))];
    
    //handle category filter change
    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    //handle search
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    //filter products based on category and discount
    useEffect(() => {
        let result = products.filter(product => 
            product.discountPercentage && product.discountPercentage > 0);
        
        if(selectedCategory){
            result = result.filter(product => product.category === selectedCategory);
        }
        
        if(searchTerm){
            result = result.filter(product => 
                product.productName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredProducts(result);
    }, [products, selectedCategory, searchTerm]);

    //display/get product data
    const fetchProducts = async() => {
        try {
            setLoading(true);
            const response = await axios.get('/adminProduct/getProductAdmin');
    
            //extract unique batch names from the response data
            const uniqueBatches = [...new Set(response.data.map((product) => product.batch))];
            setBatches(uniqueBatches);
    
            //sort products by discount percentage (higher first)
            const sortedProducts = response.data.sort((a, b) => 
                (b.discountPercentage || 0) - (a.discountPercentage || 0)
            );
            
            setProducts(sortedProducts);
            setLoading(false);
        } catch (error) {
            setError('Failed to load products. Please try again.');
            setLoading(false);
            toast.error('Failed to load products');
        }
    };
    
    useEffect(() => {
        fetchProducts();
        fetchSummaryData();
    }, []);

    //fetch products for a selected batch
    const fetchBatchProducts = async(batch) => {
        setLoading(true);
        try {
            const response = await axios.get(`/adminProduct/getBatchProductAdmin?batch=${batch}`);
            
            //sort by discount percentage
            const sortedProducts = response.data.sort((a, b) => 
                (b.discountPercentage || 0) - (a.discountPercentage || 0)
            );
            
            setProducts(sortedProducts);
            setSelectedBatch(batch);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error(`Failed to load batch ${batch}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummaryData = async() => {
        try {
            const response = await axios.get('/adminProduct/getProductSummaryAdmin');
            setSummaryData(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    //edit function
    const handleEditProductClick = async(productId) => {
        try {
            setLoading(true);
            const response = await axios.get(`/adminProduct/getEditProductAdmin/${productId}`);
            setSelectedProduct(response.data);
            setIsEditModalOpen(true);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        fetchProducts(); 
    };

    //check if a discount is about to expire (within 3 days)
    const isDiscountExpiringSoon = (discountEndDate) => {
        if(!discountEndDate) return false;
        
        const endDate = new Date(discountEndDate);
        const today = new Date();
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays >= 0 && diffDays <= 3;
    };

    //calculate discount progress
    const getDiscountProgress = (product) => {
        if(!product.discountedDate) return 100;
        
        const startDate = new Date(product.discountStartDate || new Date());
        const endDate = new Date(product.discountedDate);
        const today = new Date();
        
        const totalDuration = endDate - startDate;
        const elapsed = today - startDate;
        
        //if the discount period has ended
        if (today > endDate) return 100;
        
        //if the discount period hasn't started
        if (today < startDate) return 0;
        
        //progress as a percentage
        return Math.min(100, Math.max(0, Math.floor((elapsed / totalDuration) * 100)));
    };

    return (
        <div className='admin-promotions-container'>
            <div className='admin-promotions-header'>
                <h2>Product Promotions</h2>
                <div className='admin-promotions-stats'>
                    <div className='stat-item'>
                        <span className='stat-value'>{filteredProducts.length}</span>
                        <span className='stat-label'>Active Promotions</span>
                    </div>
                    <div className='stat-item'>
                        <span className='stat-value'>
                            {filteredProducts.reduce((avg, product) => avg + (product.discountPercentage || 0), 0) / 
                             (filteredProducts.length || 1)}%
                        </span>
                        <span className='stat-label'>Avg. Discount</span>
                    </div>
                </div>
            </div>

            <div className='admin-promotions-filters'>
                <div className='search-container'>
                    <input 
                        type='text' 
                        placeholder='Search products...' 
                        value={searchTerm}
                        onChange={handleSearch}
                        className='search-input'
                    />
                </div>
                
                <div className='filters-right'>
                    <div className='category-filter'>
                        <select onChange={handleCategoryChange} value={selectedCategory} className='category-select'>
                            <option value=''>All Categories</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className='batch-filters'>
                <button
                    onClick={() => {
                        setSelectedBatch(null);
                        fetchProducts();
                    }}
                    className={`batch-button ${selectedBatch === null ? 'active' : ''}`}
                >
                    All Batches
                </button>
                
                {batches.map((batch) => (
                    <button
                        key={batch}
                        onClick={() => fetchBatchProducts(batch)}
                        className={`batch-button ${selectedBatch === batch ? 'active' : ''}`}
                    >
                        {batch}
                    </button>
                ))}
            </div>

            <AdminModalProductsEditComponent
                isOpen={isEditModalOpen} 
                onClose={handleCloseEditModal} 
                selectedProduct={selectedProduct}
                fetchProducts={fetchProducts}
            />

            {loading ? (
                <div className='loading-container'>
                    <div className='loading-spinner'></div>
                    <p>Loading promotions...</p>
                </div>
            ) : error ? (
                <div className='error-message'>{error}</div>
            ) : filteredProducts.length === 0 ? (
                <div className='no-data-message'>
                    <div className='no-data-icon'>🔍</div>
                    <p>No active promotions found.</p>
                    {selectedCategory && <p>Try selecting a different category or clearing filters.</p>}
                </div>
            ) : (
                <div className='table-container'>
                    <table className='admin-promotions-table'>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Size</th>
                                <th>Discount</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr 
                                    key={product._id} 
                                    className={`
                                        ${product.isArchived ? 'archived-product' : ''} 
                                        ${product.quantity < product.stockLevel ? 'low-quantity' : ''} 
                                        ${product.quantity === 0 ? 'out-of-quantity' : ''}
                                        ${isDiscountExpiringSoon(product.discountedDate) ? 'expiring-soon' : ''}
                                    `}
                                >
                                    <td className='product-info'>
                                        <div className='product-image-container'>
                                            <img 
                                            src={optimizeCloudinaryUrl(product.imageUrl, 300, 300)} 
                                            alt={product.productName}
                                            loading='lazy'
                                            />
                                        </div>
                                        <div className='product-details'>
                                            <div className='product-name'>{product.productName}</div>
                                            {product.quantity === 0 ? (
                                                <span className='stock-badge out-of-stock'>Out of stock</span>
                                            ) : product.quantity < product.stockLevel ? (
                                                <span className='stock-badge low-stock'>Low stock: {product.quantity}</span>
                                            ) : (
                                                <span className='stock-badge in-stock'>In stock: {product.quantity}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{product.category}</td>
                                    <td>{product.sizeUnit.slice(0, 1)} - {product.productSize}</td>
                                    <td className='discount-cell'>
                                        <div className='discount-badge'>
                                            {product.discountPercentage}% OFF
                                        </div>
                                    </td>
                                    <td className='price-cell'>
                                        <div className='price-display'>
                                            <span className='original-price'>${product.price}</span>
                                            <span className='discounted-price'>${product.discountedPrice}</span>
                                        </div>
                                    </td>
                                    <td className='status-cell'>
                                        {product.discountedDate ? (
                                            <div className='discount-status'>
                                                <div className='progress-container'>
                                                    <div 
                                                        className='progress-bar' 
                                                        style={{ width: `${getDiscountProgress(product)}%` }}
                                                    ></div>
                                                </div>
                                                <div className='status-date'>
                                                    {isDiscountExpiringSoon(product.discountedDate) ? (
                                                        <span className='expiring-text'>Expires {orderDate(product.discountedDate)}</span>
                                                    ) : (
                                                        <span>Ends {orderDate(product.discountedDate)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className='no-end-date'>No end date</span>
                                        )}
                                    </td>
                                    <td className='actions-cell'>
                                        <button 
                                            className='action-button edit-button'
                                            onClick={() => handleEditProductClick(product._id)}
                                            aria-label='Edit product'
                                        >
                                            <img src={editIcon} alt='Edit' />
                                            <span>Edit</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminPromotionsComponent;