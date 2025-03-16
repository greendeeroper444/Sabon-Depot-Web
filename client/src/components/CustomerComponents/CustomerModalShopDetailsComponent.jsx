import React, { useContext, useEffect } from 'react'
import '../../CSS/CustomerCSS/CustomerModalShopDetails.css';
import cancelIcon from '../../assets/modals/modal-icon-cancel.png';
import cancelIcon2 from '../../assets/modals/modal-icon-cancel-2.png';
import { useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import toast from 'react-hot-toast';
import axios from 'axios';
import PropTypes from 'prop-types'; 
import CalculateFinalPriceUtils, { calculateFinalPriceModal, calculateSubtotalModalCustomer } from '../../utils/CalculateFinalPriceUtils';
import { CustomerContext } from '../../../contexts/CustomerContexts/CustomerAuthContext';

function CustomerModalShopDetailsComponent({isOpen, onClose, cartItems, setCartItems, customerId}) {
    const navigate = useNavigate();
    const {customer} = useContext(CustomerContext);

     //handle quantity change
     const handleQuantityChange = async(cartItemId, newQuantity) => {
        if(newQuantity < 1) return;

        try {
            const response = await axios.put('/customerCart/updateProductQuantityCustomer', {
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
    const handleCheckout = () => {
        navigate(`/checkout/${customerId}`, {state: {cartItems}});
    };
    
     //delete function
     const handleCartItemDelete = async(cartItemId) => {
        try {
            const response = await axios.delete(`/customerCart/removeProductFromCartCustomer/${cartItemId}`);
            if(response.data.success){
                fetchCartItems();
            } else{
                throw new Error('Failed to delete product from cart');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCartItems = async () => {
        try {
            const response = await axios.get(`/customerCart/getProductCartCustomer/${customerId}`);
            const updatedCartItems = response.data.map(item => ({
                ...item,
                finalPrice: CalculateFinalPriceUtils(customer, item.productId).finalPrice
            }));
            setCartItems(updatedCartItems);
        } catch (error) {
            console.error(error);
        }
    };
    
    const handleCartNavigation = () => {
        navigate(`/cart/${customerId}`);
    };

    useEffect(() => {
        if(isOpen && customerId){
            fetchCartItems();
        }
    }, [isOpen, customerId]);

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
                            Array.isArray(cartItems) && cartItems.map((cartItem) => (
                                <div key={cartItem._id} className='cart-item'>
                                    <div className='product-image-container'>
                                        <img src={`${cartItem.productId.imageUrl}`} alt="Product" className='product-image' />
                                    </div>
                                    <div className='product-details'>
                                        <div className='product-name'>{cartItem.productId.productName}</div>
                                        <div className='product-quantity'>
                                            <input
                                                type='number'
                                                value={cartItem.quantity}
                                                min='1'
                                                onChange={(e) => handleQuantityChange(cartItem._id, parseInt(e.target.value))}
                                                className='quantity-input'
                                            />
                                            <span>×</span> 
                                            <span className='product-price'>{`₱${calculateFinalPriceModal(cartItem).toFixed(2)}`}</span>
                                        </div>
                                    </div>
                                    <button className='remove-item-button' onClick={() => handleCartItemDelete(cartItem._id)}>
                                        ×
                                    </button>
                                </div>
                            ))
                        )
                    }
                </div>

                <div className='cart-summary'>
                    <div className='summary-row'>
                        <span className='summary-label'>Subtotal:</span>
                        <span className='summary-value'>{`₱${calculateSubtotalModalCustomer(cartItems, customer)}`}</span>
                    </div>
                    <div className='summary-row'>
                        <span className='summary-label'>Total:</span>
                        <span className='summary-value'>{`₱${calculateSubtotalModalCustomer(cartItems, customer)}`}</span>
                    </div>
                    {/* <div className='summary-row'>
                        <span className='summary-label'>Cash:</span>
                        <input type="text" className='cash-input' placeholder="Enter cash amount" />
                    </div>
                    <div className='summary-row'>
                        <span className='summary-label'>Change:</span>
                        <span className='summary-value'>₱ 0.00</span>
                    </div> */}
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

//define props type for the component
CustomerModalShopDetailsComponent.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    cartItems: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        productId: PropTypes.shape({
            finalPrice: PropTypes.number,
            price: PropTypes.number.isRequired,
            imageUrl: PropTypes.string.isRequired,
            productName: PropTypes.string.isRequired,
        }).isRequired,
        quantity: PropTypes.number.isRequired,
        finalPrice: PropTypes.number,
    })).isRequired,
    setCartItems: PropTypes.func.isRequired,
    customerId: PropTypes.string.isRequired,
}

export default CustomerModalShopDetailsComponent