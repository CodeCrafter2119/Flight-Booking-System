import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { urlAPI } from '../api/ApiClient';

// Your axios instance (this would typically be in a separate file)

const RazorpayPayment = ({ orderDetails }) => {
  // Safe destructuring with defaults
  const { 
    orderId = 'order_R84ki3Ddhyr9WN', 
    amount = 900000, 
    currency = 'INR' 
  } = orderDetails || {};

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!orderId) {
      alert('Order information is missing');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Check if Razorpay is already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        
        script.onload = initializeRazorpay;
      } else {
        initializeRazorpay();
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Failed to initialize payment');
      setIsProcessing(false);
    }
  };

  const initializeRazorpay = () => {
    const options = {
      key: "rzp_test_l5MXTWsTyrUqwN",
      amount: amount,
      currency: currency,
      order_id: orderId,
      name: "Flight Booking",
      description: "Payment for your booking",
      handler: async function(response) {
        try {
          // Using your urlAPI instance instead of direct axios call
          await urlAPI.post('/payment/confirm-booking', {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature
          });
          alert('Payment successful! Booking confirmed.');
        } catch (error) {
          console.error('Confirmation failed:', error);
          alert('Payment succeeded but confirmation failed. Please contact support.');
        } finally {
          setIsProcessing(false);
        }
      },
      prefill: {
        name: "Passenger Name",
        email: "passenger@example.com",
        contact: "9876543210"
      },
      theme: {
        color: "#3399cc"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      alert(`Payment failed: ${response.error.description}`);
      setIsProcessing(false);
    });
    rzp.open();
  };

  return (
    <div className="payment-container" style={styles.container}>
      <h3 style={styles.heading}>Complete Payment</h3>
      <p style={styles.text}>Order ID: {orderId}</p>
      <p style={styles.text}>Amount: ₹{(amount / 100).toLocaleString('en-IN')}</p>
      <button 
        onClick={handlePayment} 
        className="pay-button"
        style={isProcessing ? styles.buttonProcessing : styles.button}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};

// Prop type validation
RazorpayPayment.propTypes = {
  orderDetails: PropTypes.shape({
    orderId: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string
  }).isRequired
};

// Inline styles for the component
const styles = {
  container: {
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    maxWidth: '400px',
    margin: '20px auto',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9'
  },
  heading: {
    color: '#333',
    marginTop: '0'
  },
  text: {
    color: '#555',
    margin: '10px 0'
  },
  button: {
    backgroundColor: '#3399cc',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    width: '100%'
  },
  buttonProcessing: {
    backgroundColor: '#999',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontSize: '16px',
    fontWeight: 'bold',
    width: '100%'
  }
};

export default RazorpayPayment;