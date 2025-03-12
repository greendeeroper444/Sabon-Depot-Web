import React, { useEffect, useState } from 'react'
import '../../../CSS/AdminCSS/AdminSettings/AdminNotificationsComponent.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';


function StaffNotificationsComponent() {
    const [orderNotifications, setOrderNotifications] = useState([]);
    const [expirationNotifications, setExpirationNotifications] = useState([]);
    const [lowStockNotifications, setLowStockNotifications] = useState([]);
    const [count, setCount] = useState(1);
    const [prevCount, setPrevCount] = useState(1);
    const [expiryNotifId, setExpiryNotifId] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [activeTab, setActiveTab] = useState('orders');

    useEffect(() => {
        fetchExpiryNotifPeriod();
        fetchAllNotifications();
    }, []);

    const fetchExpiryNotifPeriod = async() => {
        try {
            const response = await axios.get('/adminDatePicker/getExpiryNotifTime');
            if(response.data && response.data.data){
                setCount(response.data.data.expiryNotifPeriod);
                setPrevCount(response.data.data.expiryNotifPeriod);
                setExpiryNotifId(response.data.data._id);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleIncrease = () => {
        setPrevCount(count);
        setCount(prev => prev + 1);
        setShowConfirmation(true);
    };

    const handleDecrease = () => {
        if(count > 1){
            setPrevCount(count);
            setCount(prev => prev - 1);
            setShowConfirmation(true);
        }
    };

    const handleConfirm = async() => {
        try {
            await axios.put(`/adminDatePicker/updateExpiryNotifTime/${expiryNotifId}`, { 
                expiryNotifPeriod: count 
            });
            setShowConfirmation(false);
            toast.success('Extension period updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update extension period');
        }
    };

    const handleCancel = () => {
        setCount(prevCount);
        setShowConfirmation(false);
        toast.error('Extension period update cancelled');
    };

    //fetch order-related notifications
    const fetchOrderNotifications = async() => {
        try {
            const response = await axios.get('/adminNotifications/getNotificationsOrderAdmin');
            setOrderNotifications(response.data);
        } catch (error) {
            console.error('Error fetching order notifications:', error);
        }
    };

    //fetch general admin (expiration) notifications
    const fetchAdminNotifications = async() => {
        try {
            const response = await axios.get('/adminNotifications/getNotificationsAdmin');
            setExpirationNotifications(response.data);
        } catch (error) {
            console.error('Error fetching expiration notifications:', error);
        }
    };

    //fetch low-stock product notifications
    const fetchLowStockNotifications = async() => {
        try {
            const response = await axios.get('/adminProduct/getOutOfStockProductsAdmin');
            const lowStockProducts = response.data;
            const notifications = lowStockProducts.map((product) => ({
                message: `${product.productName} (${product.sizeUnit.slice(0, 1)} - ${product.productSize}) is almost sold out! Only ${product.quantity} left.`,
            }));
            setLowStockNotifications(notifications);
        } catch (error) {
            console.error('Error fetching low-stock notifications:', error);
        }
    };

    const fetchAllNotifications = async() => {
        await fetchOrderNotifications();
        await fetchAdminNotifications();
        await fetchLowStockNotifications();
    };

    const getTotalNotifications = () => {
        return orderNotifications.length + expirationNotifications.length + lowStockNotifications.length;
    };

    return (
        <div className="admin-notifications">
            <div className="notifications-header">
                <h2>Notifications <span className="notification-badge">{getTotalNotifications()}</span></h2>
                <div className="notification-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders <span className="tab-badge">{orderNotifications.length}</span>
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'expiration' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('expiration')}
                    >
                        Expiration <span className="tab-badge">{expirationNotifications.length}</span>
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'stock' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('stock')}
                    >
                        Low Stock <span className="tab-badge">{lowStockNotifications.length}</span>
                    </button>
                </div>
            </div>
            
            <div className="notification-content">
                {/* Order Notifications */}
                {activeTab === 'orders' && (
                    <div className="notification-category">
                        <h3>Order Notifications</h3>
                        <div className="notification-list">
                            {orderNotifications.length > 0 ? (
                                orderNotifications.map((notification, index) => {
                                    const paymentMethod = notification.orderId?.paymentMethod; 
                                    const orderLink =
                                        paymentMethod === 'Pick Up'
                                            ? `/admin/orders-pickup/details/${notification.orderId._id}`
                                            : `/admin/orders/details/${notification.orderId._id}`;

                                    return (
                                        <div key={index} className="notification-item">
                                            <Link to={orderLink}>
                                                <div className="notification-icon">📦</div>
                                                <div className="notification-text">
                                                    {notification.message || notification}
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">🔔</div>
                                    <p>No order notifications available</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Expiration Notifications */}
                {activeTab === 'expiration' && (
                    <div className="notification-category">
                        <div className="category-header">
                            <h3>Expiration Notifications</h3>
                            <div className="expiry-settings">
                                <div className="period-label">
                                    <span>Notify</span>
                                    <div className="counter">
                                        <button className="counter-btn minus" onClick={handleDecrease} disabled={count <= 1}>−</button>
                                        <span className="counter-value">{count}</span>
                                        <button className="counter-btn plus" onClick={handleIncrease}>+</button>
                                    </div>
                                    <span>days before expiry</span>
                                </div>
                                
                                {showConfirmation && (
                                    <div className="confirmation-controls">
                                        <button className="confirm-btn" onClick={handleConfirm}>
                                            <span className="icon">✓</span> Save
                                        </button>
                                        <button className="cancel-btn" onClick={handleCancel}>
                                            <span className="icon">✕</span> Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="notification-list">
                            {expirationNotifications.length > 0 ? (
                                expirationNotifications.map((notification, index) => (
                                    <div key={index} className="notification-item">
                                        <Link to="/admin/inventory/finished-product">
                                            <div className="notification-icon">⏱️</div>
                                            <div className="notification-text">
                                                {notification.message || notification}
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">⏱️</div>
                                    <p>No expiration notifications available</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Low Stock Notifications */}
                {activeTab === 'stock' && (
                    <div className="notification-category">
                        <h3>Low Stock Notifications</h3>
                        <div className="notification-list">
                            {lowStockNotifications.length > 0 ? (
                                lowStockNotifications.map((notification, index) => (
                                    <div key={index} className="notification-item">
                                        <Link to="/admin/inventory/finished-product">
                                            <div className="notification-icon">📉</div>
                                            <div className="notification-text">
                                                {notification.message}
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">📊</div>
                                    <p>No low stock notifications available</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StaffNotificationsComponent;