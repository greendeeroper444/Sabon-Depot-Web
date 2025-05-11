// import React, { useContext, useEffect, useState } from 'react'
// import '../../CSS/AdminCSS/AdminNavbar.css';
// import notificationIcon from '../../assets/admin/adminicons/admin-navbar-notification-icon.png';
// import bottomAngleIcon from '../../assets/admin/adminicons/admin-navbar-bottomangle-icon.png';
// import menuIcon from '../../assets/icons/icon-menu-gray.png';
// import { AdminContext } from '../../../contexts/AdminContexts/AdminAuthContext';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// function AdminNavbarComponent({adminToggleSidebar}) {
//     const { admin } = useContext(AdminContext);
//     const navigate = useNavigate();
//     const [dropdownVisible, setDropdownVisible] = useState(false);
//     const [notificationDropdownVisible, setNotificationDropdownVisible] = useState(false);
//     const [orderNotifications, setOrderNotifications] = useState([]);
//     const [expirationNotifications, setExpirationNotifications] = useState([]);
//     const [lowStockNotifications, setLowStockNotifications] = useState([]);
//     const [newNotificationsCount, setNewNotificationsCount] = useState(0);

//     //fetch order-related notifications
//     const fetchOrderNotifications = async() => {
//         try {
//             const response = await axios.get('/adminNotifications/getNotificationsOrderAdmin');
//             setOrderNotifications(response.data);
//             return response.data;
//         } catch (error) {
//             console.error('Error fetching order notifications:', error);
//             return [];
//         }
//     };

//     //fetch general admin (expiration) notifications
//     const fetchAdminNotifications = async() => {
//         try {
//             const response = await axios.get('/adminNotifications/getNotificationsAdmin');
//             setExpirationNotifications(response.data);
//             return response.data;
//         } catch (error) {
//             console.error('Error fetching expiration notifications:', error);
//             return [];
//         }
//     };

//     //fetch low-stock product notifications
//     const fetchLowStockNotifications = async() => {
//         try {
//             const response = await axios.get('/adminProduct/getOutOfStockProductsAdmin');
//             const lowStockProducts = response.data;
//             const notifications = lowStockProducts.map((product) => ({
//                 message: `${product.productName} (${product.sizeUnit.slice(0, 1)} - ${product.productSize}) is almost sold out! Only ${product.quantity} left.`,
//                 isRead: false,
//             }));
//             setLowStockNotifications(notifications);
//             return notifications;
//         } catch (error) {
//             console.error('Error fetching low-stock notifications:', error);
//             return [];
//         }
//     };

//     // Function to update notification count
//     const updateNotificationCount = (orderNotifs, expirationNotifs, lowStockNotifs) => {
//         const unreadCount = 
//             orderNotifs.filter(notif => !notif.isRead).length +
//             expirationNotifs.filter(notif => !notif.isRead).length +
//             lowStockNotifs.filter(notif => !notif.isRead).length;
        
//         setNewNotificationsCount(unreadCount);
//     };

//     const fetchAllNotifications = async () => {
//         const orders = await fetchOrderNotifications();
//         const expirations = await fetchAdminNotifications();
//         const lowStocks = await fetchLowStockNotifications();
        
//         updateNotificationCount(orders, expirations, lowStocks);
//     };

//     useEffect(() => {
//         // Fetch notifications when component mounts
//         fetchAllNotifications();

//         // Set up interval to check for new notifications every 30 seconds
//         const intervalId = setInterval(() => {
//             fetchAllNotifications();
//         }, 10000); // 30 seconds

//         // Clean up interval on component unmount
//         return () => clearInterval(intervalId);
//     }, []);

//     // Update notification count whenever notifications change
//     useEffect(() => {
//         updateNotificationCount(orderNotifications, expirationNotifications, lowStockNotifications);
//     }, [orderNotifications, expirationNotifications, lowStockNotifications]);

//     const toggleDropdown = () => {
//         setDropdownVisible(!dropdownVisible);
//     };

//     const handleConfirmLogout = async() => {
//         try {
//             const response = await axios.post('/adminAuth/logoutAdmin');
//             if (response.data.message) {
//                 toast.success(response.data.message);
//             }
//             navigate('/admin-staff-login');
//         } catch (error) {
//             console.error(error);
//             toast.error('Logout failed');
//         }
//     };

//     //handle notification click to toggle isRead status and update in the backend
//     const handleNotificationClick = async(notificationId, type) => {
//         try {
//             // Send request to backend to update the notification status permanently
//             await axios.put(`/adminNotifications/updateNotificationStatus/${notificationId}`, {
//                 isRead: true,
//                 notificationType: type,  // send type ('order', 'expiration', or 'lowStock')
//             });

//             // Update local state based on notification type
//             if (type === 'order') {
//                 setOrderNotifications(prevNotifs => 
//                     prevNotifs.map(notif => 
//                         notif._id === notificationId ? {...notif, isRead: true} : notif
//                     )
//                 );
//             } else if (type === 'expiration') {
//                 setExpirationNotifications(prevNotifs => 
//                     prevNotifs.map(notif => 
//                         notif._id === notificationId ? {...notif, isRead: true} : notif
//                     )
//                 );
//             } else if (type === 'lowStock') {
//                 setLowStockNotifications(prevNotifs => 
//                     prevNotifs.map(notif => 
//                         notif._id === notificationId ? {...notif, isRead: true} : notif
//                     )
//                 );
//             }

//             setNotificationDropdownVisible(false);
//         } catch (error) {
//             console.error('Error updating notification status:', error);
//             toast.error('Failed to update notification status');
//         }
//     };

//     //combine all notifications
//     const allNotifications = [
//         ...orderNotifications.map(notification => ({ type: 'order', ...notification })),
//         ...expirationNotifications.map(notification => ({ type: 'expiration', ...notification })),
//         ...lowStockNotifications.map(notification => ({ type: 'lowStock', ...notification }))
//     ];

//     // Sort notifications by creation date (newest first)
//     const sortedNotifications = [...allNotifications].sort((a, b) => {
//         // First prioritize by type - orders first
//         if (a.type === 'order' && b.type !== 'order') return -1;
//         if (a.type !== 'order' && b.type === 'order') return 1;
        
//         // Then sort by creation date (newest first)
//         return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
//     });

//     const toggleNotificationDropdown = () => {
//         setNotificationDropdownVisible(!notificationDropdownVisible);
//     };

//     return (
//         <nav className='admin-navbar'>
//             <div className='admin-menu-burger'>
//                 <button onClick={adminToggleSidebar}><img src={menuIcon} alt="Menu" /></button>
//             </div>
//             <div className='admin-navbar-container'>
//                 <div className='hi-span'>
//                     <h2>Hi!</h2>
//                     <span>Let's check your store today</span>
//                 </div>
//                 <div className='admin-navbar-profile'>
//                     <div className='notification-container'>
//                         <img 
//                             src={notificationIcon} 
//                             alt="Notification" 
//                             className='notification-icon' 
//                             onClick={toggleNotificationDropdown}
//                         />
//                         {newNotificationsCount > 0 && (
//                             <span className='notification-count'>
//                                 {newNotificationsCount}
//                             </span>
//                         )}

//                         {
//                             notificationDropdownVisible && (
//                                 <div className='notification-dropdown'>
//                                     <h4>Notifications</h4>
//                                     {
//                                         sortedNotifications.length > 0 ? (
//                                             <>
//                                                 {
//                                                     sortedNotifications.map((notification, index) => {
//                                                         // Determine notification type and link
//                                                         let notificationLink = '/admin';
                                                        
//                                                         if (notification.type === 'order') {
//                                                             const paymentMethod = notification.orderId?.paymentMethod;
//                                                             notificationLink = paymentMethod === 'Pick Up'
//                                                                 ? `/admin/orders-pickup/details/${notification.orderId?._id}`
//                                                                 : `/admin/orders/details/${notification.orderId?._id}`;
//                                                         } else if (notification.type === 'expiration' || notification.type === 'lowStock') {
//                                                             notificationLink = '/admin/inventory/finished-product';
//                                                         }

//                                                         return (
//                                                             <div key={index} className='notification-items'>
//                                                                 <Link 
//                                                                 to={notificationLink}
//                                                                 className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
//                                                                 onClick={() => handleNotificationClick(notification._id, notification.type)}
//                                                                 >
//                                                                     {notification.message}
//                                                                     <br />
//                                                                     <small>
//                                                                         {notification.createdAt 
//                                                                             ? new Date(notification.createdAt).toLocaleString() 
//                                                                             : 'Just now'}
//                                                                     </small>
//                                                                 </Link>
//                                                             </div>
//                                                         );
//                                                     })
//                                                 }
//                                             </>
//                                         ) : (
//                                             <div className='notification-item'>No new notifications</div>
//                                         )
//                                     }
//                                 </div>
//                             )
//                         }
//                     </div>
//                     <div className='profile-info'>
//                         {
//                             !!admin && (
//                                 <>
//                                     <span className='profile-name'>{admin.fullName}</span>
//                                     <span className='profile-role'>Admin</span>
//                                 </>
//                             )
//                         }
//                     </div>
//                     <img src={bottomAngleIcon} 
//                     alt="Dropdown Icon" className='dropdown-icon' 
//                     onClick={toggleDropdown} />
//                     {
//                         dropdownVisible && (
//                             <div className='dropdown-menu'>
//                                 <button onClick={handleConfirmLogout}>Logout</button>
//                             </div>
//                         )
//                     }
//                 </div>
//             </div>
//         </nav>
//     )
// }

// export default AdminNavbarComponent
import React, { useContext, useEffect, useState } from 'react'
import '../../CSS/AdminCSS/AdminNavbar.css';
import notificationIcon from '../../assets/admin/adminicons/admin-navbar-notification-icon.png';
import bottomAngleIcon from '../../assets/admin/adminicons/admin-navbar-bottomangle-icon.png';
import menuIcon from '../../assets/icons/icon-menu-gray.png';
import { AdminContext } from '../../../contexts/AdminContexts/AdminAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';


import { FaShoppingBag, FaCalendarAlt, FaBoxOpen } from 'react-icons/fa';

function AdminNavbarComponent({adminToggleSidebar}) {
    const { admin } = useContext(AdminContext);
    const navigate = useNavigate();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [notificationDropdownVisible, setNotificationDropdownVisible] = useState(false);
    const [orderNotifications, setOrderNotifications] = useState([]);
    const [expirationNotifications, setExpirationNotifications] = useState([]);
    const [lowStockNotifications, setLowStockNotifications] = useState([]);
    const [newNotificationsCount, setNewNotificationsCount] = useState(0);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'orders', 'expiration', 'lowStock'

    //fetch order-related notifications
    const fetchOrderNotifications = async() => {
        try {
            const response = await axios.get('/adminNotifications/getNotificationsOrderAdmin');
            setOrderNotifications(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching order notifications:', error);
            return [];
        }
    };

    //fetch general admin (expiration) notifications
    const fetchAdminNotifications = async() => {
        try {
            const response = await axios.get('/adminNotifications/getNotificationsAdmin');
            setExpirationNotifications(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching expiration notifications:', error);
            return [];
        }
    };

    //fetch low-stock product notifications
    const fetchLowStockNotifications = async() => {
        try {
            const response = await axios.get('/adminProduct/getOutOfStockProductsAdmin');
            const lowStockProducts = response.data;
            const notifications = lowStockProducts.map((product) => ({
                message: `${product.productName} (${product.sizeUnit.slice(0, 1)} - ${product.productSize}) is almost sold out! Only ${product.quantity} left.`,
                isRead: false,
            }));
            setLowStockNotifications(notifications);
            return notifications;
        } catch (error) {
            console.error('Error fetching low-stock notifications:', error);
            return [];
        }
    };

    //function to update notification count
    const updateNotificationCount = (orderNotifs, expirationNotifs, lowStockNotifs) => {
        const unreadCount = 
            orderNotifs.filter(notif => !notif.isRead).length +
            expirationNotifs.filter(notif => !notif.isRead).length +
            lowStockNotifs.filter(notif => !notif.isRead).length;
        
        setNewNotificationsCount(unreadCount);
    };

    const fetchAllNotifications = async () => {
        const orders = await fetchOrderNotifications();
        const expirations = await fetchAdminNotifications();
        const lowStocks = await fetchLowStockNotifications();
        
        updateNotificationCount(orders, expirations, lowStocks);
    };

    useEffect(() => {
        //fetch notifications when component mounts
        fetchAllNotifications();

        //set up interval to check for new notifications every 30 seconds
        const intervalId = setInterval(() => {
            fetchAllNotifications();
        }, 10000);

        //clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    //update notification count whenever notifications change
    useEffect(() => {
        updateNotificationCount(orderNotifications, expirationNotifications, lowStockNotifications);
    }, [orderNotifications, expirationNotifications, lowStockNotifications]);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleConfirmLogout = async() => {
        try {
            const response = await axios.post('/adminAuth/logoutAdmin');
            if (response.data.message) {
                toast.success(response.data.message);
            }
            navigate('/admin-staff-login');
        } catch (error) {
            console.error(error);
            toast.error('Logout failed');
        }
    };

    //handle notification click to toggle isRead status and update in the backend
    const handleNotificationClick = async(notificationId, type) => {
        try {
            //send request to backend to update the notification status permanently
            await axios.put(`/adminNotifications/updateNotificationStatus/${notificationId}`, {
                isRead: true,
                notificationType: type,  // send type ('order', 'expiration', or 'lowStock')
            });

            //update local state based on notification type
            if (type === 'order') {
                setOrderNotifications(prevNotifs => 
                    prevNotifs.map(notif => 
                        notif._id === notificationId ? {...notif, isRead: true} : notif
                    )
                );
            } else if (type === 'expiration') {
                setExpirationNotifications(prevNotifs => 
                    prevNotifs.map(notif => 
                        notif._id === notificationId ? {...notif, isRead: true} : notif
                    )
                );
            } else if (type === 'lowStock') {
                setLowStockNotifications(prevNotifs => 
                    prevNotifs.map(notif => 
                        notif._id === notificationId ? {...notif, isRead: true} : notif
                    )
                );
            }

            setNotificationDropdownVisible(false);
        } catch (error) {
            console.error('Error updating notification status:', error);
            toast.error('Failed to update notification status');
        }
    };

    //combine all notifications
    const allNotifications = [
        ...orderNotifications.map(notification => ({ type: 'order', ...notification })),
        ...expirationNotifications.map(notification => ({ type: 'expiration', ...notification })),
        ...lowStockNotifications.map(notification => ({ type: 'lowStock', ...notification }))
    ];

    //sort notifications by creation date (newest first)
    const sortedNotifications = [...allNotifications].sort((a, b) => {
        //first prioritize by type - orders first
        if (a.type === 'order' && b.type !== 'order') return -1;
        if (a.type !== 'order' && b.type === 'order') return 1;
        
        //then sort by creation date (newest first)
        return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
    });

    const toggleNotificationDropdown = () => {
        setNotificationDropdownVisible(!notificationDropdownVisible);
    };

    //filter notifications based on active tab
    const getFilteredNotifications = () => {
        if (activeTab === 'all') return sortedNotifications;
        return sortedNotifications.filter(notification => notification.type === activeTab);
    };

    //get count for each notification type
    const getNotificationCounts = () => {
        return {
            orders: orderNotifications.length,
            expiration: expirationNotifications.length,
            lowStock: lowStockNotifications.length
        };
    };

    const counts = getNotificationCounts();
    const filteredNotifications = getFilteredNotifications();

    //helper function to format time
    const formatTime = (timestamp) => {
        if (!timestamp) return 'Just now';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    //get icon based on notification type
    const getNotificationIcon = (type) => {
        switch(type) {
            case 'order':
                return <FaShoppingBag className="notification-type-icon order" />;
            case 'expiration':
                return <FaCalendarAlt className="notification-type-icon expiration" />;
            case 'lowStock':
                return <FaBoxOpen className="notification-type-icon low-stock" />;
            default:
                return null;
        }
    };

    //get bg color class based on notification type
    const getNotificationTypeClass = (type) => {
        switch(type) {
            case 'order':
                return 'notification-order';
            case 'expiration':
                return 'notification-expiration';
            case 'lowStock':
                return 'notification-lowstock';
            default:
                return '';
        }
    };

    //mark all notifications as read
    const markAllAsRead = async() => {
        try {
            await axios.put('/adminNotifications/markAllAsRead');
            
            // Update local state
            setOrderNotifications(prevNotifs => 
                prevNotifs.map(notif => ({...notif, isRead: true}))
            );
            setExpirationNotifications(prevNotifs => 
                prevNotifs.map(notif => ({...notif, isRead: true}))
            );
            setLowStockNotifications(prevNotifs => 
                prevNotifs.map(notif => ({...notif, isRead: true}))
            );
            
            setNewNotificationsCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark notifications as read');
        }
    };

  return (
    <nav className='admin-navbar'>
        {/* <div className='admin-menu-burger'>
            <button onClick={adminToggleSidebar}><img src={menuIcon} alt="Menu" /></button>
        </div> */}
        <div className='admin-navbar-container'>
            <div className='hi-span'>
                <h2>Hi!</h2>
                <span>Let's check your store today</span>
            </div>
            <div className='admin-navbar-profile'>
                <div className='notification-container'>
                    <img 
                        src={notificationIcon} 
                        alt="Notification" 
                        className='notification-icon' 
                        onClick={toggleNotificationDropdown}
                    />
                    {
                        newNotificationsCount > 0 && (
                            <span className='notification-count'>
                                {newNotificationsCount}
                            </span>
                        )
                    }

                    {
                        notificationDropdownVisible && (
                            <div className='notification-dropdown'>
                                <div className="notification-dropdown-header">
                                    <h4>Notifications</h4>
                                    {/* {newNotificationsCount > 0 && (
                                        <button 
                                            className="mark-all-read-btn"
                                            onClick={markAllAsRead}
                                        >
                                            Mark all as read
                                        </button>
                                    )} */}
                                </div>
                                
                                <div className="notification-tabs">
                                    <button 
                                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('all')}
                                    >
                                        All ({sortedNotifications.length})
                                    </button>
                                    <button 
                                        className={`tab-btn ${activeTab === 'order' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('order')}
                                    >
                                        Orders ({counts.orders})
                                    </button>
                                    <button 
                                        className={`tab-btn ${activeTab === 'expiration' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('expiration')}
                                    >
                                        Expiration ({counts.expiration})
                                    </button>
                                    <button 
                                        className={`tab-btn ${activeTab === 'lowStock' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('lowStock')}
                                    >
                                        Low Stock ({counts.lowStock})
                                    </button>
                                </div>
                                
                                <div className="notification-list">
                                    {
                                        filteredNotifications.length > 0 ? (
                                            filteredNotifications.map((notification, index) => {
                                                // Determine notification type and link
                                                let notificationLink = '/admin';
                                                
                                                if (notification.type === 'order') {
                                                    const paymentMethod = notification.orderId?.paymentMethod;
                                                    notificationLink = paymentMethod === 'Pick Up'
                                                        ? `/admin/orders-pickup/details/${notification.orderId?._id}`
                                                        : `/admin/orders/details/${notification.orderId?._id}`;
                                                } else if (notification.type === 'expiration' || notification.type === 'lowStock') {
                                                    notificationLink = '/admin/inventory/finished-product';
                                                }

                                                return (
                                                    <Link 
                                                        key={index}
                                                        to={notificationLink}
                                                        className={`notification-item ${notification.isRead ? 'read' : 'unread'} ${getNotificationTypeClass(notification.type)}`}
                                                        onClick={() => handleNotificationClick(notification._id, notification.type)}
                                                    >
                                                        <div className="notification-icon-container">
                                                            {getNotificationIcon(notification.type)}
                                                        </div>
                                                        <div className="notification-content">
                                                            <div className="notification-message">
                                                                {notification.message}
                                                            </div>
                                                            <div className="notification-time">
                                                                {formatTime(notification.createdAt)}
                                                            </div>
                                                        </div>
                                                        {!notification.isRead && <div className="unread-indicator"></div>}
                                                    </Link>
                                                );
                                            })
                                        ) : (
                                            <div className='empty-notification'>
                                                <div className="empty-notification-icon">📭</div>
                                                <div className="empty-notification-text">No {activeTab !== 'all' ? activeTab : ''} notifications</div>
                                            </div>
                                        )
                                    }
                                </div>
                                
                                {/* {filteredNotifications.length > 5 && (
                                    <div className="view-all-footer">
                                        <Link to="/admin/notifications" className="view-all-btn">
                                            View all notifications
                                        </Link>
                                    </div>
                                )} */}
                            </div>
                        )
                    }
                </div>
                <div className='profile-info'>
                    {
                        !!admin && (
                            <>
                                <span className='profile-name'>{admin.fullName}</span>
                                <span className='profile-role'>Admin</span>
                            </>
                        )
                    }
                </div>
                <img src={bottomAngleIcon} 
                alt="Dropdown Icon" className='dropdown-icon' 
                onClick={toggleDropdown} />
                {
                    dropdownVisible && (
                        <div className='dropdown-menu'>
                            <button onClick={handleConfirmLogout}>Logout</button>
                        </div>
                    )
                }
            </div>
        </div>
    </nav>
  )
}

export default AdminNavbarComponent