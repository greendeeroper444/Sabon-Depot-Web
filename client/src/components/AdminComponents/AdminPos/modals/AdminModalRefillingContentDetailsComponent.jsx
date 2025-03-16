import React, { useEffect, useState } from 'react'
import '../../../../CSS/CustomerCSS/CustomerModalShopDetails.css';
import cancelIcon from '../../../../assets/modals/modal-icon-cancel.png';
import cancelIcon2 from '../../../../assets/modals/modal-icon-cancel-2.png';
import { useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import toast from 'react-hot-toast';
import axios from 'axios';
import PropTypes from 'prop-types';
import { calculateSubtotalModalStaff } from '../../../../utils/StaffCalculateVolume';

function AdminModalRefillingContentDetailsComponent({isOpen, onClose, cartItems, setCartItems, adminId}) {
    const navigate = useNavigate();
    const [cashReceived, setCashReceived] = useState('');
    const [changeTotal, setChangeTotal] = useState(0);
    const [manualDiscount, setManualDiscount] = useState('');

    const handleVolumeChange = (cartItemId, newVolume) => {
        //allow empty string for backspacing and decimal inputs
        const updatedCartItems = cartItems.map(item =>
            item._id === cartItemId ? {...item, quantity: newVolume} : item
        );
        setCartItems(updatedCartItems);
        
        //only send to server if it's a valid number greater than 0
        if(newVolume !== '' && parseFloat(newVolume) > 0){
            try {
                axios.put('/adminCartRefill/updateProductVolumeRefillAdmin', {
                    cartItemId,
                    quantity: parseFloat(newVolume),
                    sizeUnit: 'Liters'
                }).then(response => {
                    if(!response.data.success) {
                        toast.error(response.data.message || 'Failed to update volume.');
                    }
                });
            } catch (error) {
                console.error('Error updating volume:', error);
                toast.error('Failed to update volume. Please try again.');
            }
        }
    };
    
    const handlePriceChange = (cartItemId, newPrice) => {
        if(newPrice === '' || newPrice < 1){
            const updatedCartItems = cartItems.map(item =>
                item._id === cartItemId ? {...item, price: newPrice} : item
            );
            setCartItems(updatedCartItems);
            return;
        }
    
        try {
            axios.put('/adminCartRefill/updateProductPriceRefillAdmin', {
                cartItemId,
                price: parseFloat(newPrice) || 0
            }).then(response => {
                if(response.data.success){
                    const updatedCartItems = cartItems.map(item =>
                        item._id === cartItemId
                            ? {...item, price: parseFloat(newPrice) || 0}
                            : item
                    );
                    setCartItems(updatedCartItems);
                } else {
                    toast.error(response.data.message || 'Failed to update price.');
                }
            });
        } catch (error) {
            console.error('Error updating price:', error);
            toast.error('Failed to update price. Please try again.');
        }
    };
    
    const handleDiscountChange = (value) => {
        //vlidate to ensure it's a number between 0 and 100
        const numValue = parseFloat(value);
        if(isNaN(numValue) || numValue < 0 || numValue > 100){
            //could add validation handling here
            //we'll just update the state
            setManualDiscount(value);
            return;
        }
        
        setManualDiscount(value);
    };
    
    const handleCheckout = async() => {
        if(cartItems.length === 0){
            toast.error('Cart is empty!');
            return;
        }
    
        try {
            //pass the manual discount to the calculation function
            const discountValue = manualDiscount !== '' ? parseFloat(manualDiscount) : null;
            const {finalSubtotal} = calculateSubtotalModalStaff(cartItems, discountValue);
            const parsedTotalAmount = parseFloat(finalSubtotal.replace(/,/g, ''));
    
            if(isNaN(parsedTotalAmount) || parsedTotalAmount <= 0){
                toast.error('Invalid total amount!');
                return;
            }
    
            const orderData = {
                items: cartItems.map((item) => ({
                    productId: item.productId._id,
                    productName: item.productId.productName,
                    quantity: item.quantity,
                    price: item.price,
                    productSize: item.productSize,
                    sizeUnit: item.sizeUnit,
                })),
                totalAmount: parsedTotalAmount,
                cashReceived: Number(cashReceived) || 0,
                changeTotal: Number(changeTotal) || 0,
                discountRate: discountValue || 0,
            };
    
            const response = await axios.post('/adminOrderRefill/addOrderRefillAdmin', orderData);
    
            if(response?.data?.success){
                const orderId = response.data.orderId;
                toast.success(`Order created successfully! Order ID: ${orderId}`);
                setCartItems([]);
                onClose();
                navigate(`/admin/order-summary-refill/${orderId}`);
            } else {
                toast.error(response?.data?.message || 'Failed to create the order.');
            }
        } catch (error) {
            console.error('Order creation error:', error);
            toast.error('Failed to create the order. Please try again.');
        }
    };

    //delete function
    const handleCartItemDelete = async(cartItemId) => {
        try {
            const response = await axios.delete(`/adminCartRefill/removeProductFromCartRefillAdmin/${cartItemId}`);
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
            const response = await axios.get(`/adminCartRefill/getProductCartRefillAdmin/${adminId}`);
            // setCartItems(response.data);
            setCartItems(response.data.map(item => ({
                ...item,
                price: item.price || 0
            })));
        } catch (error) {
            console.error(error);
        }
    };

    const handleCashReceivedChange = (value) => {
        const receivedValue = parseFloat(value) || '';
    
        setCashReceived(receivedValue);
    
        //get the final subtotal as a number by removing '₱' and commas
        //use the manual discount in the calculation if it's provided
        const discountValue = manualDiscount !== '' ? parseFloat(manualDiscount) : null;
        const {finalSubtotal} = calculateSubtotalModalStaff(cartItems, discountValue);
        const numericSubtotal = parseFloat(finalSubtotal.replace(/₱|,/g, '')) || 0;
    
        const change = receivedValue - numericSubtotal;
        setChangeTotal(change);
    };

    useEffect(() => {
        if(isOpen && adminId){
            fetchCartItems();
        }
    }, [isOpen, adminId]);

    //recalculate change when manual discount changes
    useEffect(() => {
        if (cashReceived) {
            handleCashReceivedChange(cashReceived);
        }
    }, [manualDiscount]);

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
                                        <div className='cylinder'>
                                            <div
                                            className='water'
                                            style={{
                                            height: `${(cartItem.quantity/ cartItem.quantity) * 100}%`,
                                            background: cartItem.productId.color
                                            }}
                                            ></div>
                                        </div>

                                        <div className='product-details'>
                                             <div className='product-name'>{cartItem.productId.productName}</div>
                                            {/* <p style={{ fontSize: '12px' }}>{cartItem.productId.productSize} Liter</p> */}
                                            <p  style={{ fontSize: '12px' }}>{cartItem.productId.quantity} Liter</p>
                                            <div className='product-quantity'>
                                                <input
                                                    type="number"
                                                    step="0.1"  //allow decimal increments
                                                    min="0.1"   //minimum value of 0.1
                                                    value={cartItem.quantity}
                                                    onChange={(e) => handleVolumeChange(cartItem._id, e.target.value)}
                                                    className='quantity-input'
                                                />
                                                <span>Liters</span>
                                                <span>X</span>
                                                <span>₱</span>
                                                <input
                                                    type='text'
                                                    value={cartItem.price || ''} 
                                                    onChange={(e) => handlePriceChange(cartItem._id, e.target.value)}
                                                    className='quantity-input'
                                                />

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
                        <span className='summary-value'>₱{calculateSubtotalModalStaff(cartItems).rawSubtotal}</span>
                    </div>
                    <div className='summary-row'>
                        <span className='summary-label'>Discount (%):</span>
                        <input
                            type='number'
                            min='0'
                            max='100'
                            value={manualDiscount}
                            onChange={(e) => handleDiscountChange(e.target.value)}
                            placeholder='Enter discount %'
                            className='cash-input'
                        />
                    </div>
                    {
                        (manualDiscount !== '' && parseFloat(manualDiscount) > 0) || 
                        (manualDiscount === '' && calculateSubtotalModalStaff(cartItems).discountRate > 0) ? (
                            <div className='summary-row'>
                                <span className='summary-label'>Discount Amount ({manualDiscount !== '' ? manualDiscount : calculateSubtotalModalStaff(cartItems).discountRate}%):</span>
                                <span className='summary-value'>- ₱{calculateSubtotalModalStaff(cartItems, manualDiscount !== '' ? parseFloat(manualDiscount) : null).discountAmount}</span>
                            </div>
                        ) : null
                    }
                    <div className='summary-row'>
                        <span className='summary-label'>Total:</span>
                        <span className='summary-value'> ₱{calculateSubtotalModalStaff(cartItems, manualDiscount !== '' ? parseFloat(manualDiscount) : null).finalSubtotal}</span>
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

AdminModalRefillingContentDetailsComponent.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    cartItems: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            productId: PropTypes.shape({
                finalPrice: PropTypes.number,
                price: PropTypes.number.isRequired,
                imageUrl: PropTypes.string.isRequired,
                productName: PropTypes.string.isRequired,
                sizeUnit: PropTypes.string.isRequired,
                productSize2: PropTypes.string.isRequired,
                quantity: PropTypes.number.isRequired,
            }).isRequired,
            quantity: PropTypes.number.isRequired,
            finalPrice: PropTypes.number,
        })
    ).isRequired,
    setCartItems: PropTypes.func.isRequired,
    adminId: PropTypes.string.isRequired,
}

export default AdminModalRefillingContentDetailsComponent