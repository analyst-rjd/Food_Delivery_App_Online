import React from 'react';
import DeliveryTracker from './DeliveryTracker';
import { FaReceipt, FaPhoneAlt, FaMotorcycle } from 'react-icons/fa';

const OrderTracking = () => {
    // Mock order details
    const orderDetails = {
        orderId: "OD123456789",
        restaurant: "Paradise Biryani",
        items: [
            { name: "Chicken Biryani", quantity: 2, price: 299 },
            { name: "Mutton Seekh Kebab", quantity: 1, price: 349 }
        ],
        total: 947,
        deliveryPartner: "John Doe",
        estimatedTime: "30-35 mins"
    };

    return (
        <div className="order-tracking-container">
            <div className="order-header">
                <h2>Track Your Order</h2>
                <span className="order-id">Order ID: {orderDetails.orderId}</span>
            </div>

            <DeliveryTracker orderId={orderDetails.orderId} />

            <div className="order-details-card">
                <div className="order-info">
                    <div className="info-section">
                        <FaReceipt className="info-icon" />
                        <div>
                            <h3>{orderDetails.restaurant}</h3>
                            <div className="order-items">
                                {orderDetails.items.map((item, index) => (
                                    <div key={index} className="order-item">
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="order-total">
                                <strong>Total:</strong> ₹{orderDetails.total}
                            </div>
                        </div>
                    </div>

                    <div className="delivery-info">
                        <div className="info-section">
                            <FaMotorcycle className="info-icon" />
                            <div>
                                <h4>Delivery Partner</h4>
                                <p>{orderDetails.deliveryPartner}</p>
                            </div>
                        </div>
                        
                        <button className="contact-btn">
                            <FaPhoneAlt /> Contact
                        </button>
                    </div>

                    <div className="estimated-time">
                        <strong>Estimated Delivery Time:</strong>
                        <span>{orderDetails.estimatedTime}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking; 