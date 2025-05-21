import React, { useState } from 'react'
import '../../CSS/CustomerCSS/CustomerPlaceOrder.css';
import invoiceIcon from '../../assets/placeorder/placeorder-invoice-icon.png';
import { useParams } from 'react-router-dom';
import UseOrderDetailsHook from '../../hooks/CustomerHooks/UseOrderDetailsHook';
import { formatDate, formatFullDate, getEstimatedDeliveryDate, orderDate, orderDate2 } from '../../utils/OrderUtils';
import InvoiceModal from '../../components/CustomerComponents/InvoiceModal';

function CustomerPlaceOrderPage() {
    const {customerId, orderId} = useParams();
    const {order, loading, error} = UseOrderDetailsHook(customerId, orderId);
    const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false);

    if(loading){
        return <div>Loading...</div>;
    }

    if(error){
        return <div>{error}</div>;
    }

    if(!order){
        return <div>Order not found</div>;
    }

    //calculate subtotal
    const subtotal = order.items.reduce((acc, item) => acc + item.finalPrice * item.quantity, 0);
    const shippingCost = 50;

    const statusesMap = order.paymentMethod === 'Pick Up' 
    ? {'Pending': 'isPending', 'Ready To Pick Up': 'isReady', 'Picked Up': 'isPickedUp'}
    : {'Pending': 'isPending', 'Shipped': 'isShipped', 'Out For Delivery': 'isOutForDelivery', 'Delivered': 'isDelivered'};

    const statuses = Object.keys(statusesMap);

    const statusDates = {
        isPending: order.createdAt,
        isReady: order.readyDate,
        isPickedUp: order.pickedUpDate,
        isShipped: order.shippedDate,
        isOutForDelivery: order.outForDeliveryDate,
        isDelivered: order.deliveredDate,
    };

    // Custom function to determine the proper status class based on current order status
    const getStatusClassCustomer = (statusKey, order) => {
        // Current status of the order
        const currentStatus = order.paymentMethod === 'Pick Up' 
            ? (order.pickedUpDate ? 'isPickedUp' : (order.readyDate ? 'isReady' : 'isPending'))
            : (order.deliveredDate ? 'isDelivered' : (order.outForDeliveryDate ? 'isOutForDelivery' : (order.shippedDate ? 'isShipped' : 'isPending')));
        
        // The status we're checking
        const checkStatus = statusKey;
        
        // Get index of current status and the status we're checking
        const statusOrder = order.paymentMethod === 'Pick Up' 
            ? ['isPending', 'isReady', 'isPickedUp']
            : ['isPending', 'isShipped', 'isOutForDelivery', 'isDelivered'];
        
        const currentIndex = statusOrder.indexOf(currentStatus);
        const checkIndex = statusOrder.indexOf(checkStatus);
        
        // If the status we're checking is the current status, mark it as active
        if (checkStatus === currentStatus) {
            return 'active';
        // If the status we're checking comes before the current status, mark it as completed
        } else if (checkIndex < currentIndex) {
            return 'completed';
        // Otherwise, it's a future status
        } else {
            return 'inactive';
        }
    };

  return (
    <div className='customer-place-order-container'>
        <div className='customer-place-order-header'>
            <div className='breadcrumb'>Home &gt; Orders &gt; ID {order.orderNumber}</div>
            <div className='order-id'>
                <h2>Order ID: {order.orderNumber}</h2>
                <button className='invoice-button' onClick={() => setInvoiceModalOpen(true)}>
                    <img src={invoiceIcon} alt="" />
                    <span>Invoice</span>
                </button>
            </div>
            <div className='order-details'>
                {
                    order.paymentMethod === 'Pick Up' ? (
                        <p className='estimated-delivery'>
                            <span role='img' aria-label='calendar'>📅</span>
                            Pick up on: {orderDate2(order.pickupDate)} at {order.pickupTime}
                        </p>
                    ) : (
                        <p className='estimated-delivery'>
                            <span role='img' aria-label='truck'>🚚</span>
                            Estimated delivery: {getEstimatedDeliveryDate(order.createdAt)}
                        </p>
                    )
                }
            </div>
        </div>

        {/* dynamic Progress Tracker */}
        <div className='customer-place-order-progress-tracker'>
            {
                statuses.map((status) => {
                    const statusKey = statusesMap[status]; //map display name to internal key
                    return (
                        <div key={status} className={`status ${getStatusClassCustomer(statusKey, order)}`}>
                            <div className={`status-circle ${getStatusClassCustomer(statusKey, order)}`}></div>
                            <p>{status}</p>
                            <span>{statusDates[statusKey] ? formatFullDate(statusDates[statusKey]) : 'N/A'}</span>
                        </div>
                    );
                })
            }
        </div>


        {
            order.items.map((item) => (
                <div key={item._id} className='customer-place-order-item'>
                    <div className='item-image'>
                        <img src={`${item.imageUrl}`} alt={item.productName} />
                    </div>
                    <div className='item-details'>
                        <h3>{item.productName}</h3>
                        <p>{item.category} | 250ml</p>
                    </div>
                    <div className='item-price'>
                        <p>₱ {item.finalPrice}.00</p>
                        <p>{`Qty: ${item.quantity}`}</p>
                    </div>
                </div>
            ))
        }

        <div className='customer-place-order-payment'>
            <div>
                <h4>Payment</h4>
                <p>{order.paymentMethod}</p>
            </div>
            <div>
                <h4>Delivery</h4>
                <p>Address</p>
                <p>{order.billingDetails.fullName}</p>
                <p>{order.billingDetails.address}</p>
            </div>
        </div>

        <div className='customer-place-order-summary'>
            <h4>Order Summary</h4>
            <div className='summary-item'>
                <span>Subtotal</span>
                <span>{`₱${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
            </div>
            <div className='customer-place-order-total'>
                <span>Total</span>
                <span>{`₱${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
            </div>
        </div>

        <InvoiceModal
            isOpen={isInvoiceModalOpen}
            onClose={() => setInvoiceModalOpen(false)}
            order={order}
            subtotal={subtotal}
            shippingCost={shippingCost}
        />
    </div>
  )
}

export default CustomerPlaceOrderPage