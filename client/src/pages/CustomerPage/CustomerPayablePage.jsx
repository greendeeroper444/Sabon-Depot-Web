import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const styles = {
  customerPayablePage: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '10px',
  },
  orderTable: {
    marginBottom: '30px',
    padding: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  payableTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
    backgroundColor: '#fff',
    tableLayout: 'fixed',
  },
  tableCell: {
    border: '1px solid #ddd',
    padding: '10px',
    textAlign: 'center',
    wordWrap: 'break-word',
  },
  tableHeader: {
    border: '1px solid #ddd',
    padding: '10px',
    textAlign: 'center',
    backgroundColor: '#f4f4f4',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  firstCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    textAlign: 'left',
    gap: '10px',
  },
  productImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '5px',
    border: '1px solid #ddd',
  },
  proofImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '5px',
    border: '1px solid #ddd',
  },
  status: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px 15px',
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '15px',
    textTransform: 'capitalize',
  },
  statusPaid: {
    backgroundColor: '#d4f8d4',
    color: '#28a745',
    border: '1px solid #28a745',
  },
  statusPartial: {
    backgroundColor: '#f8f6d7',
    color: '#dcd135',
    border: '1px solid #dcd135',
  },
  statusUnpaid: {
    backgroundColor: '#f8d7da',
    color: '#dc3545',
    border: '1px solid #dc3545',
  },
  statusIcon: {
    marginRight: '5px',
    fontSize: '16px',
  },
  viewButton: {
    border: 'none',
    borderRadius: '5px',
    padding: '8px 15px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
    backgroundColor: '#fff',
    color: '#077A37',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  receiveButton: {
    border: 'none',
    borderRadius: '5px',
    padding: '8px 15px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
    backgroundColor: '#077A37',
    color: '#fff',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  receiveButtonDisabled: {
    backgroundColor: '#cccccc',
    color: '#666666',
    cursor: 'not-allowed',
    boxShadow: 'none',
    border: 'none',
    borderRadius: '5px',
    padding: '8px 15px',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  totalAmount: {
    textAlign: 'right',
    fontSize: '16px',
    marginTop: '10px',
    padding: '10px',
    color: '#444',
    fontWeight: 'bold',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },
  modalHeading: {
    marginBottom: '20px',
    color: '#333',
  },
  modalImage: {
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
    borderRadius: '8px',
    marginBottom: '1rem',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  closeButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  noOrders: {
    padding: '40px 20px',
    textAlign: 'center',
    border: '1px dashed #ccc',
    borderRadius: '8px',
    margin: '20px 0',
  },
  shopNow: {
    display: 'inline-block',
    marginTop: '15px',
    padding: '10px 25px',
    backgroundColor: '#077A37',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  proofOfPaymentImage: {
    width: '30px',
    height: '30px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '2px',
    objectFit: 'cover',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
  },
  receivedText: {
    display: 'inline-block',
    padding: '8px 15px',
    color: '#28a745',
    fontWeight: 'bold',
  }
};

//media query styles - we'll apply these conditionally
const getResponsiveStyles = () => {
    const width = window.innerWidth;
    
    if (width <= 480) {
        return {
        heading: { fontSize: '20px' },
        modalContent: { width: '95%', padding: '15px' }
        };
    }
    
    if (width <= 640) {
        return {
            payableTable: { border: 0 },
            tableHeader: { display: 'none' },
            tableRow: {
                marginBottom: '20px',
                display: 'block',
                border: '1px solid #ddd',
                borderRadius: '5px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            },
            tableCell: {
                display: 'flex',
                justifyContent: 'space-between',
                textAlign: 'right',
                padding: '10px',
                borderBottom: '1px solid #eee',
                borderLeft: 0,
                borderRight: 0,
            },
            firstCell: {
                flexDirection: 'column',
                alignItems: 'flex-start',
            },
            totalAmount: {
                textAlign: 'center',
                marginTop: '15px',
            }
        };
    }
    
    if (width <= 768) {
        return {
            orderHeading: { fontSize: '16px' },
            tableCell: { padding: '8px 5px', fontSize: '14px' },
            tableHeader: { padding: '8px 5px', fontSize: '14px' },
            viewButton: { padding: '6px 10px', fontSize: '12px' },
            receiveButton: { padding: '6px 10px', fontSize: '12px' },
        };
    }
    
    if (width <= 992) {
        return {
            payableTable: { tableLayout: 'auto' }
        };
    }
    
    return {};
};

function CustomerPayablePage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [responsiveStyles, setResponsiveStyles] = useState(getResponsiveStyles());
    const { customerId } = useParams();
    const navigate = useNavigate();

    //update responsive styles on window resize
    useEffect(() => {
        const handleResize = () => {
            setResponsiveStyles(getResponsiveStyles());
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleReceiveOrder = async(orderId) => {
        try {
            const response = await axios.put(`/customerOrder/receivedButton/${orderId}`);
            alert(response.data.message);
    
            //update the state to reflect the change
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? {...order, isReceived: true} : order
                )
            );
        } catch (error) {
            console.error(error);
            alert('Failed to update order status. Please try again.');
        }
    };
    
    useEffect(() => {
        const fetchOrders = async() => {
            try {
                setLoading(true);
                const response = await axios.get(`/customerOrder/getAllOrdersCustomer/${customerId}`);
                const { orders } = response.data;
                const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
                alert('Failed to load orders.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [customerId]);

    if(loading) {
        return <div style={styles.loadingContainer}>Loading...</div>;
    }

    //combine the base styles with responsive styles
    const getStyleWithResponsive = (baseStyleKey, responsiveKey = null) => {
        const keyToUse = responsiveKey || baseStyleKey;
        return {
            ...styles[baseStyleKey],
            ...(responsiveStyles[keyToUse] || {})
        };
    };

    //get status style based on payment status
    const getStatusStyle = (status) => {
        const baseStyle = styles.status;
        switch(status.toLowerCase()) {
            case 'paid':
                return {...baseStyle, ...styles.statusPaid};
            case 'partial':
                return {...baseStyle, ...styles.statusPartial};
            case 'unpaid':
            default:
                return {...baseStyle, ...styles.statusUnpaid};
        }
    };

  return (
    <div style={getStyleWithResponsive('customerPayablePage')}>
        <h1 style={getStyleWithResponsive('heading')}>Your Orders</h1>
        <p>Manage your account payments easily and accurately.</p>

        {orders.length > 0 ? (
            orders.map((order) => (
                <div key={order._id} style={getStyleWithResponsive('orderTable')}>
                    <h3 style={getStyleWithResponsive('orderHeading')}>
                        Order ID: {order.orderNumber} - Date: {new Date(order.createdAt).toLocaleDateString()}
                    </h3>
                    <div>
                        <table style={getStyleWithResponsive('payableTable')}>
                            <thead>
                                <tr>
                                    <th style={getStyleWithResponsive('tableHeader')}>Product</th>
                                    <th style={getStyleWithResponsive('tableHeader')}>Payment Status</th>
                                    <th style={getStyleWithResponsive('tableHeader')}>Payor</th>
                                    <th style={getStyleWithResponsive('tableHeader')}>Quantity</th>
                                    <th style={getStyleWithResponsive('tableHeader')}>Amount</th>
                                    <th style={getStyleWithResponsive('tableHeader')}>Order Status</th>
                                    <th style={getStyleWithResponsive('tableHeader')}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item) => (
                                    <tr key={item._id} style={responsiveStyles.tableRow || {}}>
                                        <td 
                                            style={{
                                                ...getStyleWithResponsive('tableCell'),
                                                ...getStyleWithResponsive('firstCell')
                                            }}
                                            data-label="Product">
                                            <img
                                                src={item.imageUrl
                                                    ? `${item.imageUrl}`
                                                    : 'https://via.placeholder.com/50'}
                                                alt={item.productName}
                                                style={styles.productImage}
                                            />
                                            <span>{item.productName}</span>
                                        </td>
                                        <td style={getStyleWithResponsive('tableCell')} data-label="Payment Status">
                                            <span style={getStatusStyle(order.paymentStatus)}>
                                                {order.paymentStatus === 'Unpaid' ? (
                                                    <><span style={styles.statusIcon}>X</span> Unpaid</>
                                                ) : (
                                                    <><span style={styles.statusIcon}>✔</span> Paid</>
                                                )}
                                            </span>
                                        </td>
                                        <td style={getStyleWithResponsive('tableCell')} data-label="Payor">
                                            {order.billingDetails.firstName} {order.billingDetails.lastName}
                                        </td>
                                        <td style={getStyleWithResponsive('tableCell')} data-label="Quantity">
                                            {item.quantity}
                                        </td>
                                        <td style={getStyleWithResponsive('tableCell')} data-label="Amount">
                                            ₱{item.discountedPrice.toFixed(2)}
                                        </td>
                                        <td style={getStyleWithResponsive('tableCell')} data-label="Order Status">
                                            {order.orderStatus}
                                        </td>
                                        <td style={getStyleWithResponsive('tableCell')} data-label="Actions">
                                            <button
                                                style={getStyleWithResponsive('viewButton')}
                                                onClick={() => navigate(`/place-order/${customerId}/${order._id}`)}
                                            >
                                                View
                                            </button>
                                            {order.isDelivered && !order.isReceived && (
                                                <button
                                                    style={getStyleWithResponsive('receiveButton')}
                                                    onClick={() => handleReceiveOrder(order._id)}
                                                >
                                                    Receive
                                                </button>
                                            )}
                                            {order.isReceived && (
                                                <span style={styles.receivedText}>Received</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={getStyleWithResponsive('totalAmount')}>
                        <strong>Total Amount for this Order:</strong> ₱{order.totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                </div>
            ))
        ) : (
            <div style={styles.noOrders}>
                <p>You have not placed any orders yet.</p>
                <Link to='/shop' style={styles.shopNow}>Shop Now</Link>
            </div>
        )}

        {selectedOrder && (
            <div style={styles.modal}>
                <div style={getStyleWithResponsive('modalContent')}>
                    <h2 style={styles.modalHeading}>{selectedOrder.paymentStatus === 'Paid' ? 'Proof of Payment' : 'Proof of Payment'}</h2>
                    {selectedOrder.paymentProof && (
                        <img 
                            src={`${selectedOrder.paymentProof}`} 
                            alt='Proof' 
                            style={styles.modalImage} 
                        />
                    )}
                    <button style={styles.closeButton} onClick={() => setSelectedOrder(null)}>Close</button>
                </div>
            </div>
        )}
    </div>
  )
}

export default CustomerPayablePage