import React, { useEffect, useState } from 'react'
import '../../../../CSS/CustomerCSS/CustomerModalShopDetails.css';
import cancelIcon from '../../../../assets/modals/modal-icon-cancel.png';
import cancelIcon2 from '../../../../assets/modals/modal-icon-cancel-2.png';
import { useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import toast from 'react-hot-toast';
import axios from 'axios';
import PropTypes from 'prop-types';
import { calculateFinalPriceModalAdmin, calculateSubtotalModalAdmin } from '../../../../utils/AdminCalculateFinalPriceUtils';

function AdminModalWalkinContentDetailsComponent({isOpen, onClose, cartItems, setCartItems, adminId}) {
    const navigate = useNavigate();
    const [cashReceived, setCashReceived] = useState('');
    const [changeTotal, setChangeTotal] = useState(0);


    //handle quantity change
    const handleQuantityChange = async(cartItemId, newQuantity) => {
        if(newQuantity < 1) return;

        try {
            const response = await axios.put('/adminCart/updateProductQuantityAdmin', {
                cartItemId,
                quantity: newQuantity,
            });

            if(response.data.success){
                const updatedCartItems = cartItems.map(item =>
                    item._id === cartItemId ? {...item, quantity: newQuantity} : item
                );
                setCartItems(updatedCartItems);
            } else {
                toast.error(response.data.message || 'Failed to update quantity.');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Failed to update quantity. Please try again.');
        }
    };

    //handle checkout
    const handleCheckout = async() => {
        if(cartItems.length === 0){
            toast.error('Cart is empty!');
            return;
        }

        //validate if cash received is sufficient
        const {finalSubtotal} = calculateSubtotalModalAdmin(cartItems);
        const numericSubtotal = parseFloat(finalSubtotal.replace(/₱|,/g, '')) || 0;
        const numericCashReceived = parseFloat(cashReceived) || 0;

        if(numericCashReceived < numericSubtotal){
            toast.error('Cash amount is insufficient!');
            return;
        }

        try {
            const {finalSubtotal} = calculateSubtotalModalAdmin(cartItems);

            const orderData = {
                items: cartItems.map((item) => ({
                    productId: item.productId._id,
                    productName: item.productId.productName,
                    quantity: item.quantity,
                    finalPrice: calculateFinalPriceModalAdmin(item),
                })),
                // totalAmount: calculateSubtotalModalAdmin(cartItems),
                totalAmount: parseFloat(finalSubtotal.replace(/,/g, '')),
                cashReceived,
                changeTotal,
            };

            const response = await axios.post('/adminOrderWalkin/addOrderWalkinAdmin', orderData);

            if(response.data.success){
                const orderId = response.data.orderId;
                toast.success(`Order created successfully! Order ID: ${orderId}`);
                setCartItems([]);
                onClose();
                navigate(`/admin/order-summary/${orderId}`);
            } else {
                toast.error(response.data.message || 'Failed to create the order.');
            }
        } catch (error) {
            console.error('Order creation error:', error);
            toast.error('Failed to create the order. Please try again.');
        }
    };


    //delete function
    const handleCartItemDelete = async(cartItemId) => {
        try {
            const response = await axios.delete(`/adminCart/removeProductFromCartAdmin/${cartItemId}`);
            if(response.data.success){
                // toast.success(response.data.message);
                fetchCartItems();
            } else{
                throw new Error('Failed to delete product from cart');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCartItems = async() => {
        try {
            const response = await axios.get(`/adminCart/getProductCartAdmin/${adminId}`);
            setCartItems(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error(error);
            setCartItems([]);
        }
    };
    

    useEffect(() => {
        if(isOpen && adminId){
            fetchCartItems();
            console.log("Fetched cartItems:", cartItems);
        }
    }, [isOpen, adminId]);

    // 
    const handleCashReceivedChange = (value) => {
        const receivedValue = parseFloat(value) || '';
    
        setCashReceived(receivedValue);
    
        //get the final subtotal as a number by removing '₱' and commas
        const {finalSubtotal} = calculateSubtotalModalAdmin(cartItems);
        const numericSubtotal = parseFloat(finalSubtotal.replace(/₱|,/g, '')) || 0;
    
        const change = receivedValue - numericSubtotal;
        setChangeTotal(change);
    };

    if(!isOpen) return null;

  return (
    <div className='customer-modal-overlay'>
        <Draggable>
            <div className='customer-modal-container'>
                <div className='customer-modal-header'>
                    <div className='cart-title'>
                        <div className='cart-icon'>🛒</div>
                        <h2>Shopping Cart</h2>
                    </div>
                    <button className='close-button' onClick={onClose}>×</button>
                </div>

                <div className='customer-modal-content'>
                    {
                        Array.isArray(cartItems) && cartItems.length === 0 ? (
                            <div className='no-items-message'>No items in this cart</div>
                        ) : (
                            Array.isArray(cartItems) &&
                            cartItems.map((cartItem) =>
                                cartItem.productId ? (
                                    <div key={cartItem._id} className='cart-item'>
                                        <div className='product-image-container'>
                                            <img src={`${cartItem.productId.imageUrl}`} alt="Product" className='product-image' />
                                        </div>
                                        <div className='product-details'>
                                            <div className='product-name'>{cartItem.productId.productName}</div>
                                            <p style={{ fontSize: '12px' }}>{cartItem.productId.productSize}</p>

                                            <div className='product-quantity'>
                                                <input
                                                    type='number'
                                                    value={cartItem.quantity}
                                                    min='1'
                                                    onChange={(e) => handleQuantityChange(cartItem._id, parseInt(e.target.value))}
                                                    className='quantity-input'
                                                />
                                                <span>X</span>
                                                <span className='product-price'>{`₱ ${calculateFinalPriceModalAdmin(cartItem)}`}</span>
                                            </div>
                                        </div>
                                        <button className='remove-item-button' onClick={() => handleCartItemDelete(cartItem._id)}>
                                            ×
                                        </button>
                                    </div>
                                ) : null
                            )
                        )
                    }
                </div>

                <div className='cart-summary'>
                    <div className='summary-row'>
                        <span className='summary-label'>Subtotal:</span>
                        <span className='summary-value'>₱{calculateSubtotalModalAdmin(cartItems).rawSubtotal}</span>
                    </div>
                    {
                        calculateSubtotalModalAdmin(cartItems).discountRate > 0 && (
                            <div className='summary-row'>
                                <span className='summary-label'>Discount ({calculateSubtotalModalAdmin(cartItems).discountRate}%):</span>
                                <span className='summary-value'>- ₱{calculateSubtotalModalAdmin(cartItems).discountAmount}</span>
                            </div>
                        )
                    }
                    <div className='summary-row'>
                        <span className='summary-label'>Total:</span>
                        <span className='summary-value'> ₱{calculateSubtotalModalAdmin(cartItems).finalSubtotal}</span>
                    </div>
                    <div className='summary-row'>
                        <span className='summary-label'>Cash:</span>
                        <input
                            type='number'
                            min='1'
                            value={cashReceived}
                            onChange={(e) => handleCashReceivedChange(e.target.value)}
                            className='cash-input' 
                            placeholder='Enter cash amount'
                        />
                    </div>
                    <div className='summary-row'>
                        <span className='summary-label'>Change:</span>
                        <span className='summary-value' style={{ color: '#077A37' }}> ₱{changeTotal.toFixed(2)}</span>
                    </div>
                </div>

                <div className='modal-footer'>
                    <button className='close-btn' onClick={onClose}>Close</button>
                    <button className='checkout-btn' onClick={handleCheckout}>Checkout</button>
                </div>
            </div>
        </Draggable>
    </div>
  )
}

AdminModalWalkinContentDetailsComponent.propTypes = {
    cartItems: [],
}

export default AdminModalWalkinContentDetailsComponent
