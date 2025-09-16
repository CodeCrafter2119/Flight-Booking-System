import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './SeatSelection.css';

const SeatSelectionPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [bookingDetails, setBookingDetails] = useState(location.state?.bookingDetails || null);
    const [passengerCount, setPassengerCount] = useState(location.state?.passengerCount || 1);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [unavailableSeats, setUnavailableSeats] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [connected, setConnected] = useState(false);
    const [debugInfo, setDebugInfo] = useState('Initializing...');
    
    const stompClient = useRef(null);
    const seatPrice = 500;
    const userId = localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);

    // Seat configuration
    const rows = 10;
    const seatsPerRow = 6;
    const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

    useEffect(() => {
        if (!bookingDetails) {
            navigate('/flights');
            return;
        }

        initializeWebSocket();

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
                console.log('WebSocket connection closed');
            }
        };
    }, [bookingDetails]);

    const initializeWebSocket = () => {
        const flightIdNum = Number(bookingDetails.flightId);
        
        if (isNaN(flightIdNum)) {
            setError('Invalid flight ID format');
            return;
        }

        // Clear previous connection
        if (stompClient.current) {
            stompClient.current.deactivate();
        }

        setDebugInfo('Connecting to WebSocket server...');
        setError('');
        
        try {
            stompClient.current = new Client({
                webSocketFactory: () => new SockJS('http://Flight-booking-system-env.eba-utt8xhke.ap-south-1.elasticbeanstalk.com/ws'),
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                
                debug: function(str) {
                    if (str.includes('ERROR') || str.includes('Close')) {
                        console.log('STOMP:', str);
                    }
                },
                
                onConnect: (frame) => {
                    console.log('✅ WebSocket connected successfully!', frame);
                    setConnected(true);
                    setError('');
                    setDebugInfo('Connected! Subscribing to seat updates...');
                    
                    // Subscribe to seat updates for this flight
                    stompClient.current.subscribe(
                        `/topic/flight/${flightIdNum}/seats`, 
                        (message) => {
                            console.log('Received seat update:', message.body);
                            try {
                                const updatedUnavailableSeats = JSON.parse(message.body);
                                setUnavailableSeats(new Set(updatedUnavailableSeats));
                                setDebugInfo(`Seat data updated: ${updatedUnavailableSeats.length} unavailable seats`);
                            } catch (e) {
                                console.error('Error parsing seat data:', e);
                                setDebugInfo('Error parsing seat data');
                            }
                        }
                    );
                    
                    // Request initial unavailable seats
                    console.log('Requesting initial seat data for flight:', flightIdNum);
                    stompClient.current.publish({
                        destination: `/app/flight/${flightIdNum}/seats`,
                        body: JSON.stringify({})
                    });
                },
                
                onStompError: (frame) => {
                    console.error('❌ STOMP error:', frame);
                    setConnected(false);
                    setError(`STOMP protocol error: ${frame.headers?.message || 'Unknown error'}`);
                    setDebugInfo(`STOMP Error: ${JSON.stringify(frame)}`);
                },
                
                onWebSocketError: (event) => {
                    console.error('❌ WebSocket error:', event);
                    setConnected(false);
                    setError('WebSocket connection failed');
                    setDebugInfo(`WebSocket Error: ${event.type}. Server is running but WebSocket might be misconfigured.`);
                },
                
                onDisconnect: (frame) => {
                    console.log('WebSocket disconnected:', frame);
                    setConnected(false);
                    setDebugInfo('Disconnected from server');
                }
            });
            
            // Activate the connection
            stompClient.current.activate();
            
        } catch (error) {
            console.error('❌ WebSocket initialization failed:', error);
            setError(`Failed to initialize WebSocket: ${error.message}`);
            setDebugInfo(`Initialization Error: ${error.message}`);
            setConnected(false);
        }
    };

    const handleSeatSelect = (seatNumber) => {
        if (unavailableSeats.has(seatNumber)) {
            console.log('Seat is unavailable:', seatNumber);
            return;
        }

        setSelectedSeats(prev => {
            if (prev.includes(seatNumber)) {
                // Deselect seat
                if (connected) {
                    releaseSeat(seatNumber);
                }
                return prev.filter(seat => seat !== seatNumber);
            } else if (prev.length < passengerCount) {
                // Select seat
                if (connected) {
                    reserveSeat(seatNumber);
                }
                return [...prev, seatNumber];
            }
            return prev;
        });
    };

    const reserveSeat = (seatNumber) => {
        if (stompClient.current && connected && bookingDetails) {
            try {
                console.log('Reserving seat:', seatNumber);
                const flightIdNum = Number(bookingDetails.flightId);
                const reservationRequest = {
                    flightId: flightIdNum,
                    seatNumber: seatNumber,
                    userId: userId
                };
                
                stompClient.current.publish({
                    destination: '/app/reserve-seat',
                    body: JSON.stringify(reservationRequest)
                });
            } catch (error) {
                console.error('Error reserving seat:', error);
                setError('Failed to reserve seat. Please try again.');
            }
        }
    };

    const releaseSeat = (seatNumber) => {
        if (stompClient.current && connected && bookingDetails) {
            try {
                console.log('Releasing seat:', seatNumber);
                const flightIdNum = Number(bookingDetails.flightId);
                const reservationRequest = {
                    flightId: flightIdNum,
                    seatNumber: seatNumber,
                    userId: userId
                };
                
                stompClient.current.publish({
                    destination: '/app/release-seat',
                    body: JSON.stringify(reservationRequest)
                });
            } catch (error) {
                console.error('Error releasing seat:', error);
            }
        }
    };

    const handleConfirmSeats = async () => {
        if (selectedSeats.length !== passengerCount) {
            setError(`Please select exactly ${passengerCount} seat(s)`);
            return;
        }

        try {
            setLoading(true);
            
            // Navigate to payment page with selected seats
            navigate(`/flights/booking/${bookingDetails.id}`, {
                state: {
                    bookingDetails: {
                        ...bookingDetails,
                        selectedSeats: selectedSeats,
                        seatCharges: selectedSeats.length * seatPrice,
                        totalAmount: (bookingDetails.totalAmount || 0) + (selectedSeats.length * seatPrice)
                    },
                    selectedSeats,
                    seatCharges: selectedSeats.length * seatPrice
                }
            });
            
        } catch (err) {
            setError('Failed to proceed to payment');
            console.error('Navigation error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Function to convert seat number to display format (e.g., 1 -> "1A")
    const getSeatDisplay = (seatNumber) => {
        const row = Math.floor((seatNumber - 1) / seatsPerRow) + 1;
        const seatIndex = (seatNumber - 1) % seatsPerRow;
        return `${row}${seatLetters[seatIndex]}`;
    };

    // Render the actual seat map
    const renderSeatMap = () => {
        const seatMap = [];
        
        // Add cockpit area
        seatMap.push(
            <div key="cockpit" className="cockpit-area">
                <div className="cockpit">Cockpit</div>
            </div>
        );
        
        // Add seat rows
        for (let row = 1; row <= rows; row++) {
            const rowSeats = [];
            
            // Left side seats (A, B, C)
            for (let seat = 1; seat <= 3; seat++) {
                const seatNumber = (row - 1) * seatsPerRow + seat;
                const seatLabel = `${row}${seatLetters[seat - 1]}`;
                const isUnavailable = unavailableSeats.has(seatNumber);
                const isSelected = selectedSeats.includes(seatNumber);
                const isEmergencyExit = row === 1 || row === rows;
                
                rowSeats.push(
                    <div
                        key={`left-${seatNumber}`}
                        className={`seat ${isUnavailable ? 'booked' : ''} ${isSelected ? 'selected' : ''} ${isEmergencyExit ? 'emergency' : ''}`}
                        onClick={() => !isUnavailable && handleSeatSelect(seatNumber)}
                        title={isUnavailable ? 'Already booked' : `Seat ${seatLabel}`}
                    >
                        {seatLabel}
                    </div>
                );
            }

            // Aisle
            rowSeats.push(<div key={`aisle-${row}`} className="aisle"></div>);

            // Right side seats (D, E, F)
            for (let seat = 4; seat <= 6; seat++) {
                const seatNumber = (row - 1) * seatsPerRow + seat;
                const seatLabel = `${row}${seatLetters[seat - 1]}`;
                const isUnavailable = unavailableSeats.has(seatNumber);
                const isSelected = selectedSeats.includes(seatNumber);
                const isEmergencyExit = row === 1 || row === rows;
                
                rowSeats.push(
                    <div
                        key={`right-${seatNumber}`}
                        className={`seat ${isUnavailable ? 'booked' : ''} ${isSelected ? 'selected' : ''} ${isEmergencyExit ? 'emergency' : ''}`}
                        onClick={() => !isUnavailable && handleSeatSelect(seatNumber)}
                        title={isUnavailable ? 'Already booked' : `Seat ${seatLabel}`}
                    >
                        {seatLabel}
                    </div>
                );
            }

            seatMap.push(
                <div key={`row-${row}`} className="seat-row">
                    {rowSeats}
                </div>
            );
        }

        return seatMap;
    };

    if (!bookingDetails) {
        return (
            <div className="error-container">
                <h3>No Booking Information</h3>
                <p>No booking information found. Please start over.</p>
                <button onClick={() => navigate('/flights')} className="retry-button">
                    Back to Flights
                </button>
            </div>
        );
    }

    return (
        <div className="seat-selection-page">
            <div className="container">
                <div className="header">
                    <h1>Select Your Seats</h1>
                    {bookingDetails && (
                        <p>Flight {bookingDetails.flightNumber} - {bookingDetails.departureFrom} to {bookingDetails.arrivalTo}</p>
                    )}
                    <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
                        {connected ? '✅ Connected' : '❌ Disconnected'}
                        <button onClick={initializeWebSocket} className="retry-btn">
                            Retry Connection
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <div className="debug-info">
                    <h4>Connection Status</h4>
                    <p><strong>Flight ID:</strong> {bookingDetails.flightId}</p>
                    <p><strong>WebSocket Status:</strong> {connected ? 'Connected' : 'Disconnected'}</p>
                    <p><strong>Server URL:</strong> http://Flight-booking-system-env.eba-utt8xhke.ap-south-1.elasticbeanstalk.com/ws</p>
                    <p><strong>Debug Info:</strong> {debugInfo}</p>
                    <p><strong>Unavailable Seats:</strong> {Array.from(unavailableSeats).join(', ') || 'None'}</p>
                </div>

                <div className="booking-summary">
                    <h3>Booking Summary</h3>
                    <div className="summary-details">
                        <p><strong>Booking Reference:</strong> {bookingDetails.bookingReference}</p>
                        <p><strong>Passengers:</strong> {passengerCount}</p>
                        <p><strong>Flight Date:</strong> {bookingDetails.departureDate || 'N/A'}</p>
                        <p><strong>Departure Time:</strong> {bookingDetails.departureTime || 'N/A'}</p>
                    </div>
                </div>

                <div className="seat-selection-container">
                    <div className="airplane-layout">
                        <div className="airplane">
                            {renderSeatMap()}
                        </div>
                    </div>

                    <div className="selection-info">
                        <div className="seat-legend">
                            <h4>Seat Legend</h4>
                            <div className="legend-item">
                                <div className="seat available"></div>
                                <span>Available</span>
                            </div>
                            <div className="legend-item">
                                <div className="seat selected"></div>
                                <span>Selected</span>
                            </div>
                            <div className="legend-item">
                                <div className="seat booked"></div>
                                <span>Unavailable</span>
                            </div>
                            <div className="legend-item">
                                <div className="seat emergency"></div>
                                <span>Emergency Exit</span>
                            </div>
                        </div>

                        <div className="selected-seats-info">
                            <h4>Your Selection</h4>
                            {selectedSeats.length > 0 ? (
                                <div>
                                    <p>Selected Seats: {selectedSeats.map(seat => getSeatDisplay(seat)).join(', ')}</p>
                                    <p>Seat Charges: ₹{selectedSeats.length * seatPrice}</p>
                                </div>
                            ) : (
                                <p>No seats selected yet</p>
                            )}
                        </div>

                        <div className="action-buttons">
                            <button 
                                className="btn-back"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                            >
                                Back to Booking
                            </button>
                            <button 
                                className={`btn-confirm ${selectedSeats.length === passengerCount ? '' : 'disabled'}`}
                                onClick={handleConfirmSeats}
                                disabled={selectedSeats.length !== passengerCount || loading}
                            >
                                {loading ? 'Processing...' : `Confirm ${selectedSeats.length}/${passengerCount} Seats`}
                            </button>
                        </div>

                        {!connected && (
                            <div className="connection-warning">
                                <p>⚠️ WebSocket not connected. Seat availability may not be accurate.</p>
                                <p>You can still select seats and proceed to payment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatSelectionPage;