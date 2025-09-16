import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ConfirmBookingAPI } from "../api/CallingApi";
import "./PaymentPage.css";

export default function PaymentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("credit");
    const [formData, setFormData] = useState({
        cardNumber: "",
        cardName: "",
        expiry: "",
        cvv: "",
        upiId: "",
        bank: ""
    });
    const [formErrors, setFormErrors] = useState({});

    // Get booking details from navigation state or params
    const { bookingDetails, passengerCount } = location.state || {};
    const [paymentAmount] = useState(passengerCount * 5000); // Adjust calculation as needed

    useEffect(() => {
        if (!bookingDetails && !id) {
            navigate("/"); // Redirect if no booking details or ID
        }
    }, [bookingDetails, id, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Format card number with spaces
        if (name === "cardNumber") {
            const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            setFormData({
                ...formData,
                [name]: formattedValue
            });
            return;
        }
        
        // Format expiry date with slash
        if (name === "expiry" && value.length === 2 && !formData.expiry.includes('/')) {
            setFormData({
                ...formData,
                [name]: value + '/'
            });
            return;
        }

        setFormData({
            ...formData,
            [name]: value
        });
    };

     const razorpay = () => {
   
      navigate(`/razorpay`);
    
    }

    const validateForm = () => {
        const errors = {};
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        
        if (paymentMethod === "credit" || paymentMethod === "debit") {
            if (!formData.cardNumber || !/^\d{4} \d{4} \d{4} \d{4}$/.test(formData.cardNumber)) {
                errors.cardNumber = "Please enter a valid 16-digit card number";
            }
            if (!formData.cardName.trim()) {
                errors.cardName = "Card holder name is required";
            }
            if (!formData.expiry || !/^\d{2}\/\d{2}$/.test(formData.expiry)) {
                errors.expiry = "Please enter expiry in MM/YY format";
            } else {
                const [month, year] = formData.expiry.split('/').map(Number);
                if (month < 1 || month > 12) {
                    errors.expiry = "Invalid month";
                } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                    errors.expiry = "Card expired";
                }
            }
            if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv)) {
                errors.cvv = "Please enter a valid CVV";
            }
        } else if (paymentMethod === "upi") {
            if (!formData.upiId || !/^[\w.-]+@[\w]+$/.test(formData.upiId)) {
                errors.upiId = "Please enter a valid UPI ID (e.g., name@upi)";
            }
        } else if (paymentMethod === "netbanking") {
            if (!formData.bank) {
                errors.bank = "Please select a bank";
            }
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePayment = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            setError(null);
            
            const bookingId = bookingDetails?.id || id;
            if (!bookingId) {
                throw new Error("Missing booking ID");
            }

            const response = await ConfirmBookingAPI(bookingId, { paymentAmount });
            
            if (!response.data) {
                throw new Error("Payment confirmation failed");
            }
            
            navigate("/booking-success", {
                state: {
                    bookingId: bookingId,
                    paymentId: response.data.id,
                    amount: paymentAmount,
                    bookingDetails: bookingDetails
                }
            });
            
        } catch (error) {
            console.error("Payment failed:", error);
            setError(error.response?.data?.message || 
                   error.message || 
                   "Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!bookingDetails && !id) {
        return (
            <div className="payment-error-container">
                <h3>No Booking Found</h3>
                <p>We couldn't find your booking details. Please start the booking process again.</p>
                <button 
                    className="payment-retry-button"
                    onClick={() => navigate("/")}
                >
                    Return to Home
                </button>
               
    
            </div>
        );
    }

    return (
        <div className="payment-container">
            <h1>Complete Your Payment</h1>
            
            <div className="payment-grid">
                <div className="payment-summary">
                    <h2>Booking Summary</h2>
                    <div className="summary-card">
                        {bookingDetails && (
                            <>
                                <div className="summary-item">
                                    <span>Flight:</span>
                                    <span>{bookingDetails.flight?.departureFrom} → {bookingDetails.flight?.arrivalTo}</span>
                                </div>
                                <div className="summary-item">
                                    <span>Date:</span>
                                    <span>{new Date(bookingDetails.flight?.departureDateTime).toLocaleDateString()}</span>
                                </div>
                            </>
                        )}
                        <div className="summary-item">
                            <span>Passengers:</span>
                            <span>{passengerCount || 1}</span>
                        </div>
                        <div className="summary-item total">
                            <span>Total Amount:</span>
                            <span>₹{paymentAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                <div className="payment-section">
                    <h2>Payment Method</h2>
                    <div className="payment-methods">
                        <div className="method-options">
                            {["credit", "debit", "upi", "netbanking"].map(method => (
                                <label 
                                    key={method}
                                    className={`method-option ${paymentMethod === method ? "active" : ""}`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method}
                                        checked={paymentMethod === method}
                                        onChange={() => setPaymentMethod(method)}
                                    />
                                    {method === "credit" ? "Credit Card" : 
                                     method === "debit" ? "Debit Card" :
                                     method === "upi" ? "UPI" : "Net Banking"}
                                </label>
                            ))}
                        </div>
                        
                        <div className="payment-details">
                            {(paymentMethod === "credit" || paymentMethod === "debit") && (
                                <div className="card-form">
                                    <div className="form-group">
                                        <label>Card Number</label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={handleInputChange}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                        />
                                        {formErrors.cardNumber && (
                                            <span className="error">{formErrors.cardNumber}</span>
                                        )}
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Card Holder Name</label>
                                        <input
                                            type="text"
                                            name="cardName"
                                            value={formData.cardName}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                        />
                                        {formErrors.cardName && (
                                            <span className="error">{formErrors.cardName}</span>
                                        )}
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Expiry Date</label>
                                            <input
                                                type="text"
                                                name="expiry"
                                                value={formData.expiry}
                                                onChange={handleInputChange}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                            />
                                            {formErrors.expiry && (
                                                <span className="error">{formErrors.expiry}</span>
                                            )}
                                        </div>
                                        
                                        <div className="form-group">
                                            <label>CVV</label>
                                            <input
                                                type="password"
                                                name="cvv"
                                                value={formData.cvv}
                                                onChange={handleInputChange}
                                                placeholder="123"
                                                maxLength={4}
                                            />
                                            {formErrors.cvv && (
                                                <span className="error">{formErrors.cvv}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {paymentMethod === "upi" && (
                                <div className="upi-form">
                                    <div className="form-group">
                                        <label>UPI ID</label>
                                        <input
                                            type="text"
                                            name="upiId"
                                            value={formData.upiId}
                                            onChange={handleInputChange}
                                            placeholder="yourname@upi"
                                        />
                                        {formErrors.upiId && (
                                            <span className="error">{formErrors.upiId}</span>
                                        )}
                                    </div>
                                    <p className="upi-note">e.g. name@bankname or 1234567890@upi</p>
                                </div>
                            )}
                            
                            {paymentMethod === "netbanking" && (
                                <div className="netbanking-form">
                                    <div className="form-group">
                                        <label>Select Bank</label>
                                        <select
                                            name="bank"
                                            value={formData.bank}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">-- Select Bank --</option>
                                            <option value="sbi">State Bank of India</option>
                                            <option value="hdfc">HDFC Bank</option>
                                            <option value="icici">ICICI Bank</option>
                                            <option value="axis">Axis Bank</option>
                                            <option value="kotak">Kotak Mahindra Bank</option>
                                        </select>
                                        {formErrors.bank && (
                                            <span className="error">{formErrors.bank}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}
                    
                    <div className="payment-actions">
                        <button 
                            className="pay-now-button"
                            onClick={handlePayment}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span> Processing...
                                </>
                            ) : (
                                `Pay ₹${paymentAmount.toLocaleString()}`
                            )}
                        </button>
                        
                        <button 
                            className="cancel-button"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
        className="profile-button logout-button"
                      onClick={razorpay}
    >
         Pay Now
      </button>
                    </div>
                    
                    <div className="security-info">
                        <div className="security-note">
                            <span className="lock-icon">🔒</span>
                            <span>Your payment is secure and encrypted</span>
                        </div>
                        <div className="payment-guarantee">
                            <span className="shield-icon">🛡️</span>
                            <span>100% Payment Protection Guarantee</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}