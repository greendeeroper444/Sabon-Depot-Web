import React, { useEffect, useState } from 'react';
import '../../CSS/AdminCSS/AdminDashboard.css';
import axios from 'axios';
import DoughnutChart from '../../components/AdminComponents/AdminDashboardGraph/DoughnutChart';
import { monthDay } from '../../utils/OrderUtils';
import BarChart from '../../components/AdminComponents/AdminDashboardGraph/BarChart';
import LineChart from '../../components/AdminComponents/AdminDashboardGraph/LineChart';

function AdminDashboardPage() {
    const [topSales, setTopSales] = useState([]);
    const [salesData, setSalesData] = useState(null);
    const [productionReports, setProductionReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderCounts, setOrderCounts] = useState({
        delivered: 0,
        pending: 0,
        pickedUp: 0,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [showAlert, setShowAlert] = useState(false);

    const checkProductStock = async() => {
        try {
            const response = await axios.get('/adminProduct/getOutOfStockProductsAdmin');
            const lowStockProducts = response.data;
    
            const newNotifications = lowStockProducts.map(product => ({
                message: `${product.productName} (${product.sizeUnit.slice(0, 1)} - ${product.productSize}) is almost sold out! Only ${product.quantity} left.`,
                imageUrl: product.imageUrl,
                productName: product.productName,
                category: product.category,
                productCode: product.productCode,
                sizeUnit: product.sizeUnit,
                quantity: product.quantity,
                stockLevel: product.stockLevel,
                price: product.price,

            }));
    
            setNotifications(newNotifications);
            setShowAlert(true);
        } catch (error) {
            console.error('Error fetching out-of-stock products:', error);
        }
    };

    useEffect(() => {
        checkProductStock();
    }, []);
    const closeAlert = () => {
        setShowAlert(false);
    };
    
    useEffect(() => {
        const fetchOrderCounts = async() => {
            try {
                const response = await axios.get('/staffOrderOverview/getDeliveredPendingCanceled');
                const {delivered, pending, pickedUp} = response.data;
                setOrderCounts({
                    delivered,
                    pending,
                    pickedUp
                });
            } catch (error) {
                console.error(error);
            }
        };

        fetchOrderCounts();
    }, []);

    useEffect(() => {
        const fetchSalesOverview = async() => {
            try {
                const salesResponse = await axios.get('/staffOrderOverview/getTotalProductSales');
                const {salesData} = salesResponse.data;

                const chartLabels = salesData.map((item) => monthDay(item._id));
                const chartSales = salesData.map((item) => item.totalSales);

                setSalesData({
                labels: chartLabels,
                    datasets: [
                        {
                            label: 'Sales',
                            data: chartSales,
                            borderColor: 'green',
                            fill: false,
                            tension: 0.4,
                        },
                    ],
                });

                setLoading(false);
            } catch (err) {
                setError('Failed to fetch sales data.');
                setLoading(false);
            }
        };

        fetchSalesOverview();
    }, []);

    
    useEffect(() => {
        const fetchProductionReport = async() => {
            try {
                const productionResponse = await axios.get('/adminOrderOverview/getProductionReport');
                const productionData = productionResponse.data;
    
                const productionMap = productionData.reduce((acc, item) => {
                    const date = monthDay(item.date);
                    if(acc[date]){
                        acc[date] += item.quantity;
                    } else{
                        acc[date] = item.quantity;
                    }
                    return acc;
                }, {});
    
                const chartLabels = Object.keys(productionMap);
                const chartQuantities = Object.values(productionMap);
    
                setProductionReports({
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Production Quantity',
                            data: chartQuantities,
                            backgroundColor: '#00ff6a',
                        },
                    ],
                });
            } catch (error) {
                console.error('Error fetching production report:', error.response?.data || error.message);
            }
        };
    
        fetchProductionReport();
    }, []);
    
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    useEffect(() => {
        const fetchTopSales = async() => {
            try {
                const bestSellingResponse = await axios.get('/staffOrderOverview/getBestSellingProducts');
                const data = Array.isArray(bestSellingResponse.data.bestSellingProducts)
                ? bestSellingResponse.data.bestSellingProducts
                : [];
                setTopSales(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchTopSales();
    }, []);


     //function to handle the search query change
     const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    //filtered products based on the search query
    const filteredProducts = topSales.filter(product =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className='admin-dashboard-container'>
        {
            showAlert && notifications.length > 0 && (
                <div className='alert-message'>
                    <button className='close-alert' onClick={closeAlert}>
                        ×
                    </button>
                    <table className='notification-table'>
                        <thead>
                            <tr>
                                <th>Product Code</th>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Size</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Availability</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            notifications.map((notification, index) => (
                                <tr key={index}
                                className={`${notification.quantity <= notification.stockLevel && notification.quantity > 0 ? 'low-stock-tr' : ''} 
                                ${notification.quantity === 0 ? 'out-of-stock-tr' : ''}`}
                                onClick={() =>
                                    window.location.href =
                                    'https://sabon-depot-web.onrender.com/admin/inventory/finished-product'
                                }
                                >
                                    <td>{notification.productCode}</td>
                                    <td className='product-name'>
                                        <img
                                            src={`${notification.imageUrl}`}
                                            alt={notification.productName}
                                            className='notification-image'
                                        />
                                        {notification.productName}
                                    </td>
                                    <td>{notification.category}</td>
                                    <td>{notification.sizeUnit}</td>
                                    <td>{notification.price}</td>
                                    <td>{notification.quantity}</td>
                                    <td className={`${notification.quantity <= notification.stockLevel && notification.quantity > 0 ? 'low-stock' : ''} 
                                    ${notification.quantity === 0 ? 'out-of-stock' : ''}`}>
                                        {notification.quantity === 0 ? 'Out of Stock' : 
                                        notification.quantity <= notification.stockLevel ? 'Low Stock' : ''}
                                    </td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>
            )
        }


        <div className='admin-dashboard-first'>
        <div className='admin-top-sales'>
                <h3>Top Sales</h3>
                <div className='admin-top-sales-list'>
                {
                    topSales.length > 0 ? (
                        //filter out products without a valid productId
                        topSales
                            .filter(product => product.productId || product._id) //keep only products with valid ID
                            .sort((a, b) => b.totalSales - a.totalSales) //sort by totalSales in descending order
                            .slice(0, 3) //get the top 3 products
                            .map((product, index) => (
                                <div key={index} className='admin-top-sales-item'>
                                    <div>
                                        <>
                                            <img
                                            src={`${product.imageUrl}`}
                                            alt={product.productName || 'Product'}
                                            />
                                            <strong>{product.productName}</strong>
                                            <div>{product.quantitySold || product.totalProduct || 0} products sold</div>
                                        </>
                                    </div>
                                    <>
                                        <div className='admin-price'>Price: {product.price || (product.productId && product.productId.price) || 'N/A'}</div>
                                        <div className='admin-inventory'>Inventory: {product.quantitySold || product.totalProduct || 0}</div>
                                        <div className='admin-sale'>Sale: {product.totalSales || 0}</div>
                                    </>
                                </div>
                            ))
                    ) : (
                        <p className='admin-no-data'>No top sales data available.</p>
                    )
                }
                </div>
            </div>

            <DoughnutChart orderCounts={orderCounts} />
        </div>

        <br />
        <br />
        <br />

        <div className='admin-dashboard-second'>
            {
                salesData && (
                <div className='chart-container'>
                    <h2 className='sales-title'>Daily Sales</h2>
                    <LineChart salesData={salesData} chartOptions={chartOptions} />
                </div>
                )
            }
            {
                productionReports && (
                <div className='chart-container'>
                    <h2 className='sales-title'>Production Report</h2>
                    <BarChart salesData={productionReports} chartOptions={chartOptions} />
                </div>
                )
            }
        </div>

        <br />
        <br />
        <br />
        <br />

        <div className='dashboard-header'>
            <h2 className='dashboard-title'>Best Selling Products</h2>
            <div className='search-container'>
                <input 
                    type='text' 
                    placeholder='Search' 
                    className='search-input' 
                    value={searchQuery}
                    onChange={handleSearchChange} 
                />
                <button className='filter-button'>
                    <i className='fas fa-filter'></i>
                </button>
            </div>
        </div>
        <table className='product-table'>
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th>Product Code</th>
                    <th>Size</th>
                    <th>Category</th>
                    <th>Inventory Level</th>
                    <th>Units Sold</th>
                    <th>Total Revenue</th>
                </tr>
            </thead>
            <tbody>
                {
                   filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <tr key={product.productId?._id || product._id}>
                                <td>{product.productName}</td>
                                <td>{product.productId ? product.productId.productCode : "N/A"}</td>
                                <td>{product.productSize}</td>
                                <td>{product.productId ? product.productId.category : "N/A"}</td>
                                <td>{product.productId ? product.productId.quantity : "N/A"}</td>
                                <td>{product.quantitySold}</td>
                                <td>{product.totalSales}</td>
                            </tr>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center' }}>No results found</p>
                    )
                }
            </tbody>
        </table>
        <br />
        <br />
        <br />
    </div>
  )
}

export default AdminDashboardPage
