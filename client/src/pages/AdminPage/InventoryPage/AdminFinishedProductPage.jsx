import React, { useEffect, useState, useRef } from 'react'
import '../../../CSS/AdminCSS/AdminInventory/FinishedProduct.css'
import axios from 'axios';
import editIcon from '../../../assets/staff/stafficons/staff-orders-edit-icon.png';
import deleteIcon from '../../../assets/staff/stafficons/staff-orders-delete-icon.png';
import AdminModalProductsAddComponent from '../../../components/AdminComponents/AdminModalProducts/AdminModalProductsAddComponent';
import AdminModalProductsDeleteComponent from '../../../components/AdminComponents/AdminModalProducts/AdminModalProductsDeleteComponent';
import AdminModalProductsEditComponent from '../../../components/AdminComponents/AdminModalProducts/AdminModalProductsEditComponent';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { orderDate } from '../../../utils/OrderUtils';
import { optimizeCloudinaryUrl } from '../../../utils/OptimizeCloudinaryUrl';

function AdminFinishedProductPage() {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productIdToDelete, setProductIdToDelete] = useState(null);
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
    
    //pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const categories = [...new Set(products.map((product) => product.category))];

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
        setCurrentPage(1); //reset to first page on filter change
    };

    const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

    //calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
    }, [filteredProducts, itemsPerPage]);

    //display/get product data
    const fetchProducts = async() => {
        try {
            const response = await axios.get('/adminProduct/getProductAdmin');
    
            //extract unique batch names from the response data
            const uniqueBatches = [...new Set(response.data.map((product) => product.batch))];
            
            //sort batches numerically
            const sortedBatches = uniqueBatches.sort((a, b) => {
                //extract numbers from batch names (e.g., 'Batch 1' -> 1)
                const numA = parseInt(a.replace(/\D/g, ''));
                const numB = parseInt(b.replace(/\D/g, ''));
                
                //compare the extracted numbers
                return numA - numB;
            });
    
            setBatches(sortedBatches);
    
            //sort products by quantity
            const sortedProducts = response.data.sort((a, b) => a.quantity - b.quantity);
            setProducts(sortedProducts);
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProducts();
    }, []);

    //fetch products for a selected batch
    const fetchBatchProducts = async(batch) => {
        setLoading(true);
        try {
            const response = await axios.get(`/adminProduct/getBatchProductAdmin?batch=${batch}`);
            setProducts(response.data);
            setSelectedBatch(batch);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSummaryData = async() => {
            try {
                const response = await axios.get('/adminProduct/getProductSummaryAdmin');
                setSummaryData(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchSummaryData();
    }, []);

    //generate PDF report
    const handleGenerateReport = () => {
        const doc = new jsPDF();
    
        //title
        doc.setFontSize(18);
        doc.setTextColor(34, 31, 197);
        doc.setFont(undefined, 'bold');
        doc.text('CLEAN-UP SOLUTIONS ENTERPRISES, INC.', 14, 16);
    
        //subtitle
        doc.setFontSize(14);
        doc.setTextColor(197, 31, 41);
        doc.setFont(undefined, 'bold');
        doc.text('PRICE MONITORING SHEET', 14, 24);
    
        //date
        const now = new Date();
        const formattedDate = new Intl.DateTimeFormat('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }).format(now);
        const upperCaseDate = formattedDate.toUpperCase();
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text(`AS OF ${upperCaseDate}`, 14, 32);
    
        //table
        doc.autoTable({
            startY: 40,
            head: [['Product Code', 'Product', 'Category', 'Price']],
            body: products.map(product => [
                product.productCode,
                product.productName,
                product.category,
                product.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
            ]),
            styles: {fontSize: 12, halign: 'center'},
            headStyles: {fillColor: [0, 0, 139]},
        });
    
        //save the PDF
        doc.save('product_report.pdf');
    };

    //edit function
    const handleEditProductClick = async(productId) => {
        try {
            const response = await axios.get(`/adminProduct/getEditProductAdmin/${productId}`);
            setSelectedProduct(response.data);
            setIsEditModalOpen(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedProduct(null);
    };

    //delete function
    const handleConfirmDelete = async() => {
        try {
            const response = await axios.delete(`/adminProduct/deleteProductAdmin/${productIdToDelete}`);
            setProducts(products.filter(product => product._id !== productIdToDelete));
            setIsDeleteModalOpen(false);
            setProductIdToDelete(null);
            toast.success(response.data.message);

            fetchProducts();
        } catch (error) {
            console.log(error)
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

    const handleAddProductClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    //pagination navigation
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    
    if(loading){
        return <p>Loading...</p>;
    }

  return (
    <div className='admin-finished-product-container'>
        <AdminModalProductsAddComponent
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        fetchProducts={fetchProducts}
        />

        <AdminModalProductsDeleteComponent
        isOpen={isDeleteModalOpen} 
        onClose={handleCloseDeleteModal} 
        onConfirm={handleConfirmDelete}
        />

        <AdminModalProductsEditComponent
        isOpen={isEditModalOpen} 
        onClose={handleCloseEditModal} 
        selectedProduct={selectedProduct}
        fetchProducts={fetchProducts}
        />

        <div className='admin-finished-product-header'>
            <div className='admin-finished-product-header-controls'>
                <div>Overall Inventory</div>
            </div>
            <div className='admin-finished-product-container'>
            <table className='admin-finished-product-header-table'>
                <thead>
                    <tr>
                        <th>Categories</th>
                        <th>Total Products</th>
                        <th>Total Units Produced</th>
                        <th></th>
                        <th>Low Stocks</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{summaryData.categoryCount}</td>
                        <td>{summaryData.totalProducts}</td>
                        <td>{summaryData.totalUnitsProduced}</td>
                        <td>₱ {summaryData.totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td>{summaryData.lowStockCount}</td>
                        <td>{summaryData.notInStock}</td>
                    </tr>
                    <tr className='subtext'>
                        <td>Total</td>
                        <td>Ordered</td>
                        <td>Not in stock</td>
                    </tr>
                </tbody>
            </table>
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
            
            {
                batches.map((batch) => (
                    <button
                        key={batch}
                        onClick={() => fetchBatchProducts(batch)}
                        className={`batch-button ${selectedBatch === batch ? 'active' : ''}`}
                    >
                        {batch}
                    </button>
                ))
            }
        </div>

        <div className='admin-finished-product-controls'>
            <div className='controls-title'>
                <h2>Products</h2>
                <span className='product-count'>{filteredProducts.length} items</span>
            </div>
            
            <div className='controls-actions'>
                <div className='controls-filters'>
                    <div className='filter-item'>
                        <span className='filter-label'>Category:</span>
                        <select 
                        onChange={handleCategoryChange} 
                        value={selectedCategory}
                        >
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
                    
                    <div className='filter-item' style={{ display: 'none' }}>
                        <span className='filter-label'>Show:</span>
                        <select 
                        value={itemsPerPage} 
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                        </select>
                    </div>
                    <div className='filter-item'>
                        <span className='filter-label'>Show:</span>
                        <select 
                        value={itemsPerPage} 
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                        </select>
                    </div>
                </div>
                
                <div className='controls-buttons'>
                    <button className='btn-add' onClick={handleAddProductClick}>
                        <span className='plus-icon'>+</span> Add Product
                    </button>
                    
                    <button className='btn-print' onClick={handleGenerateReport}>
                        <i className='print-icon'></i> Print Report
                    </button>
                </div>
            </div>
        </div>

        {error && <p>{error}</p>}

        {
            products.length === 0 ? (
                <p>No products available.</p>
            ) : (
                <>
                    <table className='admin-finished-product-table'>
                        <thead>
                            <tr>
                                <th>Product Code</th>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Size</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Availability</th>
                                <th>Expiration</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentItems.map((product) => (
                                    <tr 
                                    key={product._id} 
                                    className={`${product.isArchived ? 'archived-product' : ''} 
                                    ${product.quantity < product.stockLevel ? 'low-quantity' : ''} 
                                    ${product.quantity === 0 ? 'out-of-quantity' : ''}
                                    ${product.isArchived && product.quantity < product.stockLevel ? 'low-quantity archived-product' : ''}`}
                                    >
                                        <td>{product.productCode}</td>
                                        <td className='product-image-name'>
                                            {
                                                product.imageUrl ? (
                                                    <img 
                                                    src={optimizeCloudinaryUrl(product.imageUrl, 300, 300)} 
                                                    alt={product.productName} 
                                                    loading='lazy'
                                                    />
                                                ) : (
                                                    <div className='placeholder-image'></div>
                                                )
                                            }
                                            {' '}{product.productName}
                                        </td>
                                        <td>{product.category}</td>
                                        <td>{product.sizeUnit?.slice(0, 1)} - {product.productSize}</td>
                                        <td>{product.price}</td>
                                        <td>{product.quantity}</td>
                                        <td className={product.quantity > 0 ? (product.quantity > product.stockLevel ? 'in-stock' : 'low-stock') : 'out-of-stock'}>
                                            {product.quantity > 0 ? (product.quantity > product.stockLevel ? 'In stock' : 'Low stock') : 'Out of stock'}
                                        </td>
                                        <td>{`${orderDate(product.expirationDate)}`}</td>
                                        <td className='actions-tbody'>
                                            <button className='button-edit-icon'
                                            onClick={() => handleEditProductClick(product._id)}
                                            >
                                                <img src={editIcon} alt='Edit Icon' />
                                                </button>
                                                <button className='button-delete-icon' 
                                            onClick={() => handleDeleteProductClick(product._id)}>
                                                <img src={deleteIcon} alt='Delete Icon' />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    
                    {/*pagination controls */}
                    <div className='pagination-controls'>
                        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                        {
                            Array.from({ length: totalPages }, (_, i) => (
                                <button 
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={currentPage === i + 1 ? 'active-page' : ''}
                                >
                                    {i + 1}
                                </button>
                            ))
                        }
                        <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
                    </div>
                </>
            )
        }
    </div>
  )
}

export default AdminFinishedProductPage