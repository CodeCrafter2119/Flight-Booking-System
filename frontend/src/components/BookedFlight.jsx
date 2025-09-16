import { useState, useEffect } from "react";
import { ErrorMessage, Field, Formik } from "formik";
import { useParams, useNavigate } from "react-router-dom";
import { BookedFlightAPI, retrieveAFlightById, retrieveAllFlights } from "../api/CallingApi";
import "./BookedFlight.css";

export default function BookedFlight() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState({ main: true, form: false });
    const [error, setError] = useState(null);
    const [flights, setFlights] = useState([]);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState(null);

    const [initialValues, setInitialValues] = useState({
        flightId: "",
        departureFrom: "",
        arrivalTo: "",
        departureDate: "",
        departureTime: "",
        returnDate: "",
        seatsAvailable: "",
        passenger: "1",
        passengerName: "",
        passengerName2: "",
        passengerAdult: "",
        passengerAdult2: "",
        dateOfBirth: "",
        dateOfBirth2: "",
        contactNo: ""
    });

    // Fetch all flights on component mount
    useEffect(() => {
        fetchFlights();
    }, []);

    const fetchFlights = async () => {
        try {
            setLoading(prev => ({ ...prev, main: true }));
            setError(null);
            
            const response = await retrieveAllFlights();
            setFlights(response.data || []);
            
        } catch (error) {
            console.error("Failed to fetch flights:", error);
            setError(error.response?.data?.message || 
                   error.message || 
                   "Failed to load flights. Please try again.");
        } finally {
            setLoading(prev => ({ ...prev, main: false }));
        }
    };

    const handleFlightSelect = (flight) => {
        setSelectedFlight(flight);
        setInitialValues({
            ...initialValues,
            flightId: flight.id,
            departureFrom: flight.departureFrom,
            arrivalTo: flight.arrivalTo,
            departureDate: flight.departureDate,
            departureTime: flight.departureTime,
            returnDate: flight.returnDate,
            seatsAvailable: flight.seatsAvailable
        });
        setShowBookingForm(true);
    };

    async function onSubmit(values, { setSubmitting }) {
        try {
            setError(null); // Clear previous errors
            
            const ticket = {
                flightId: values.flightId,
                passenger: values.passenger,
                passengerName: values.passengerName,
                passengerName2: values.passengerName2,
                passengerAdult: values.passengerAdult,
                passengerAdult2: values.passengerAdult2,
                dateOfBirth: values.dateOfBirth,
                dateOfBirth2: values.dateOfBirth2,
                contactNo: values.contactNo
            };
            
            // First create the booking
            const bookingResponse = await BookedFlightAPI(ticket);
            
            if (!bookingResponse?.data?.id) {
                throw new Error("Invalid booking response - missing booking ID");
            }
            
            // Generate a booking reference if not provided by backend
            const bookingReference = bookingResponse.data.bookingReference || 
                                   `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            
            // Navigate to seat selection page with all required data
            navigate(`/flight/${values.flightId}/seats`, {
                state: {
                    bookingDetails: {
                        id: bookingResponse.data.id,
                        flightId: values.flightId,
                        flightNumber: selectedFlight?.flightNumber || `FL${values.flightId}`,
                        departureFrom: values.departureFrom,
                        arrivalTo: values.arrivalTo,
                        departureDate: values.departureDate,
                        departureTime: values.departureTime,
                        totalAmount: selectedFlight?.price || 0,
                        bookingReference: bookingReference,
                        // Include any other necessary fields from the booking response
                        ...bookingResponse.data
                    },
                    passengerCount: parseInt(values.passenger) || 1
                }
            });
            
        } catch (error) {
            console.error("Booking failed:", error);
            setError(error.response?.data?.message || 
                   error.message || 
                   "Booking failed. Please check your information and try again.");
        } finally {
            setSubmitting(false);
        }
    }

    function validate(values) {
        let errors = {};
        if (!values.passengerName) {
            errors.passengerName = "Passenger name is required";
        }
        if (!values.flightId) {
            errors.flightId = "Please select a flight";
        }
        if (!values.contactNo) {
            errors.contactNo = "Contact number is required";
        }
        if (!values.passenger || values.passenger < 1) {
            errors.passenger = "At least one passenger is required";
        }
        if (!values.dateOfBirth) {
            errors.dateOfBirth = "Date of birth is required";
        }
        if (!values.passengerAdult) {
            errors.passengerAdult = "Gender is required";
        }
        return errors;
    }

    if (loading.main) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading available flights...</p>
            </div>
        );
    }

    if (error && !showBookingForm) {
        return (
            <div className="error-container">
                <h3>Error Loading Flights</h3>
                <p>{error}</p>
                <button 
                    className="retry-button"
                    onClick={fetchFlights}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flight-booking-page">
            <div className="flight-listings">
                <h1>Available Flights</h1>
                
                {flights.length === 0 ? (
                    <div className="no-flights">
                        <p>No flights available at the moment.</p>
                        <button onClick={fetchFlights} className="retry-button">
                            Refresh
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flights-table-container">
                            <table className="flights-table">
                                <thead>
                                    <tr>
                                        <th>Flight #</th>
                                        <th>Departure</th>
                                        <th>Arrival</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Return</th>
                                        <th>Seats</th>
                                        <th>Price</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {flights.map((flight, index) => (
                                        <tr key={flight.id || index}>
                                            <td>{flight.flightNumber || `FL${flight.id}`}</td>
                                            <td>{flight.departureFrom}</td>
                                            <td>{flight.arrivalTo}</td>
                                            <td>{flight.departureDate || 'N/A'}</td>
                                            <td>{flight.departureTime || 'N/A'}</td>
                                            <td>{flight.returnDate || 'N/A'}</td>
                                            <td>{flight.seatsAvailable}</td>
                                            <td>₹{flight.price || 'N/A'}</td>
                                            <td>
                                                <button 
                                                    className="select-flight-btn"
                                                    onClick={() => handleFlightSelect(flight)}
                                                    disabled={flight.seatsAvailable <= 0}
                                                >
                                                    {flight.seatsAvailable <= 0 ? "Sold Out" : "Select"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="flight-search-help">
                            <p>Hello! I can help you find flights.</p>
                            <p>Try asking 'Show me flights to Paris' or 'From New York to London'</p>
                            
                            <div className="search-box">
                                <input 
                                    type="text" 
                                    placeholder="Ask about flights..." 
                                    className="search-input"
                                />
                                <button className="search-button">Send</button>
                            </div>
                            
                            <div className="promo-banner">
                                <p>Find exciting offers and best deals</p>
                                <p>Book now and save up to 20%</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            {showBookingForm && (
                <div className="booking-form-container">
                    <div className="booking-container">
                        <h2 className="booking-header">Confirm Your Flight</h2>
                        
                        {error && (
                            <div className="error-message">
                                <strong>Error:</strong> {error}
                            </div>
                        )}
                        
                        <Formik
                            initialValues={initialValues}
                            enableReinitialize={true}
                            onSubmit={onSubmit}
                            validate={validate}
                            validateOnBlur={true}
                            validateOnChange={true}
                         >
                            {(formikProps) => (
                                <form className="booking-form" onSubmit={formikProps.handleSubmit}>
                                    <div className="flight-info-card">
                                        <h3 className="flight-info-header">Flight Information</h3>
                                        
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">Flight ID</label>
                                                <Field 
                                                    type="text" 
                                                    className="form-input"
                                                    name="flightId" 
                                                    readOnly
                                                />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label className="form-label">Seats Available</label>
                                                <Field 
                                                    type="text" 
                                                    className="form-input"
                                                    name="seatsAvailable" 
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">Departure From</label>
                                                <Field 
                                                    type="text" 
                                                    className="form-input"
                                                    name="departureFrom" 
                                                    readOnly
                                                />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label className="form-label">Arrival To</label>
                                                <Field 
                                                    type="text" 
                                                    className="form-input"
                                                    name="arrivalTo" 
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">Departure Date</label>
                                                <Field 
                                                    type="date" 
                                                    className="form-input"
                                                    name="departureDate" 
                                                    readOnly
                                                />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label className="form-label">Departure Time</label>
                                                <Field 
                                                    type="time" 
                                                    className="form-input"
                                                    name="departureTime" 
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        
                                        {initialValues.returnDate && (
                                            <div className="form-group">
                                                <label className="form-label">Return Date</label>
                                                <Field 
                                                    type="date" 
                                                    className="form-input"
                                                    name="returnDate" 
                                                    readOnly
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="passenger-info-card">
                                        <h3 className="passenger-info-header">Passenger Information</h3>
                                        
                                        <div className="form-group">
                                            <label className="form-label">Number of Passengers *</label>
                                            <Field 
                                                type="number" 
                                                className="form-input"
                                                name="passenger" 
                                                placeholder="Enter number of passengers"
                                                min="1"
                                                max="10"
                                            />
                                            <ErrorMessage name="passenger" component="div" className="error-text" />
                                        </div>
                                        
                                        <div className="passenger-section">
                                            <h4 className="passenger-subheader">Primary Passenger *</h4>
                                            
                                            <div className="form-group">
                                                <label className="form-label">Full Name *</label>
                                                <Field 
                                                    type="text" 
                                                    className="form-input"
                                                    name="passengerName" 
                                                    placeholder="Enter passenger name as it appears on ID"
                                                />
                                                <ErrorMessage name="passengerName" component="div" className="error-text" />
                                            </div>
                                            
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label className="form-label">Gender *</label>
                                                    <Field 
                                                        as="select"
                                                        className="form-input"
                                                        name="passengerAdult"
                                                    >
                                                        <option value="">Select gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </Field>
                                                    <ErrorMessage name="passengerAdult" component="div" className="error-text" />
                                                </div>
                                                
                                                <div className="form-group">
                                                    <label className="form-label">Date of Birth *</label>
                                                    <Field 
                                                        type="date" 
                                                        className="form-input"
                                                        name="dateOfBirth" 
                                                    />
                                                    <ErrorMessage name="dateOfBirth" component="div" className="error-text" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {formikProps.values.passenger > 1 && (
                                            <div className="passenger-section">
                                                <h4 className="passenger-subheader">Secondary Passenger</h4>
                                                
                                                <div className="form-group">
                                                    <label className="form-label">Full Name</label>
                                                    <Field 
                                                        type="text" 
                                                        className="form-input"
                                                        name="passengerName2" 
                                                        placeholder="Enter passenger name as it appears on ID"
                                                    />
                                                    <ErrorMessage name="passengerName2" component="div" className="error-text" />
                                                </div>
                                                
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label className="form-label">Gender</label>
                                                        <Field 
                                                            as="select"
                                                            className="form-input"
                                                            name="passengerAdult2"
                                                        >
                                                            <option value="">Select gender</option>
                                                            <option value="male">Male</option>
                                                            <option value="female">Female</option>
                                                            <option value="other">Other</option>
                                                        </Field>
                                                        <ErrorMessage name="passengerAdult2" component="div" className="error-text" />
                                                    </div>
                                                    
                                                    <div className="form-group">
                                                        <label className="form-label">Date of Birth</label>
                                                        <Field 
                                                            type="date" 
                                                            className="form-input"
                                                            name="dateOfBirth2" 
                                                        />
                                                        <ErrorMessage name="dateOfBirth2" component="div" className="error-text" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="form-group">
                                            <label className="form-label">Contact Number *</label>
                                            <Field 
                                                type="tel" 
                                                className="form-input"
                                                name="contactNo" 
                                                placeholder="Contact Number"
                                            />
                                            <ErrorMessage name="contactNo" component="div" className="error-text" />
                                        </div>
                                    </div>

                                    <div className="actions-container">
                                        <button 
                                            type="button" 
                                            className="cancel-button"
                                            onClick={() => {
                                                setShowBookingForm(false);
                                                setError(null);
                                            }}
                                        >
                                            Back to Flights
                                        </button>
                                        <button 
                                            className="submit-button" 
                                            type="submit"
                                            disabled={formikProps.isSubmitting || !formikProps.isValid}
                                        >
                                            {formikProps.isSubmitting ? "Processing..." : "Continue to Seat Selection"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </Formik>
                    </div>
                </div>
            )}
        </div>
    );
}