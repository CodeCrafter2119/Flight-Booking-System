import { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AssistsAPI, 
  retrieveAllFlights, 
  retrieveFlightFromTo 
} from "../api/CallingApi";
import "./FlightList.css";
import { useAuth } from "../security/MainContext";

function FlightList() {
  const { authenticated, user, logout } = useAuth();
  const [state, setState] = useState({
    flights: [],
    message: null,
    searchParams: {
      departure: "",
      arrival: "",
      id: ""
    },
    loading: {
      main: false,
      search: false,
    }
  });

  const [chatMessages, setChatMessages] = useState([
    { text: "Hello! I can help you find flights. Try asking 'Show me flights to Paris' or 'From New York to London'", sender: 'bot' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { flights, searchParams, loading } = state;

  useEffect(() => {
    fetchAllFlights();
  }, []);

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const fetchAllFlights = async () => {
    updateState({ 
      loading: { ...loading, main: true },
      message: "Loading flights..."
    });

    try {
      const response = await retrieveAllFlights();
      updateState({
        flights: response.data || [],
        message: null,
        loading: { ...loading, main: false }
      });
    } catch (error) {
      console.error("Failed to fetch flights:", error);
      updateState({
        message: "Failed to load flights. Please try again.",
        loading: { ...loading, main: false }
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateState({
      searchParams: {
        ...searchParams,
        [name]: value
      }
    });
  };

  const searchByRoute = async (from, to) => {
    const departure = (from || searchParams.departure).trim();
    const arrival = (to || searchParams.arrival).trim();

    if (!departure && !arrival) {
      updateState({ message: "Please enter at least one location" });
      return;
    }

    updateState({
      loading: { ...loading, search: true },
      message: "Searching flights...",
      flights: []
    });

    try {
      const response = await retrieveFlightFromTo(
        departure || "any", 
        arrival || "any"
      );

      updateState({
        flights: response.data,
        message: response.data.length ? null : 
          `No flights found from ${departure || 'anywhere'} to ${arrival || 'anywhere'}`,
        loading: { ...loading, search: false }
      });
    } catch (error) {
      console.error("Search failed:", error);
      updateState({
        message: "Failed to search flights",
        flights: [],
        loading: { ...loading, search: false }
      });
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { text: chatInput, sender: 'user' };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    try {
      const response = await AssistsAPI(chatInput);
      const { departureFrom, arrivalTo } = response.data;
      
      // FIXED: Replace "any" with "anywhere" in display messages
      setChatMessages(prev => [
        ...prev,
        { 
          text: departureFrom === 'any' 
            ? `Searching flights to ${arrivalTo === 'any' ? 'anywhere' : arrivalTo}...` 
            : arrivalTo === 'any'
            ? `Searching flights from ${departureFrom === 'any' ? 'anywhere' : departureFrom}...`
            : `Searching flights from ${departureFrom} to ${arrivalTo}...`,
          sender: 'bot' 
        }
      ]);

      const searchResponse = await retrieveFlightFromTo(
        departureFrom || "any", 
        arrivalTo || "any"
      );

      const foundFlights = searchResponse?.data || [];
      
      // FIXED: Replace "any" with "anywhere" in error message
      updateState({
        flights: foundFlights,
        message: foundFlights.length ? null : 
          `No flights found from ${departureFrom === 'any' ? 'anywhere' : departureFrom} to ${arrivalTo === 'any' ? 'anywhere' : arrivalTo}`,
        loading: { ...state.loading, search: false }
      });

      setChatMessages(prev => [
        ...prev,
        { 
          text: foundFlights.length > 0 
            ? `Found ${foundFlights.length} flights matching your search`
            : "No flights found matching your criteria",
          sender: 'bot' 
        }
      ]);

    } catch (error) {
      console.error("Search error:", error);
      setChatMessages(prev => [
        ...prev,
        { 
          text: "Sorry, I encountered an error processing your request. Please try again.",
          sender: 'bot' 
        }
      ]);
      updateState({
        message: "Failed to process your request",
        flights: [],
        loading: { ...state.loading, search: false }
      });
    }
  };

  const handleBookFlight = (flightId) => {
    if (authenticated) {
      navigate(`/BookedFlight/${flightId}`);
    } else {
      navigate('/login', { 
        state: { 
          from: `/BookedFlight/${flightId}`,
          message: "Please login to book your flight" 
        } 
      });
    }
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfile(false);
  };

  return (
    <div className="flight-app-container">
      <div className="app-header-container">
        <h1 className="app-header">Hi {authenticated ? user?.name || 'User' : 'User'}, earn BluChips on every booking</h1>
        
        {authenticated && (
          <div className="profile-section">
            <div className="profile-icon" onClick={toggleProfile}>
              <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
              {showProfile && (
                <div className="profile-dropdown">
                  <div className="profile-info">
                    <p className="profile-name">{user?.name || 'User'}</p>
                    <p className="profile-email">{user?.email || 'user@example.com'}</p>
                    <p className="profile-id">ID: {user?.id || 'N/A'}</p>
                  </div>
                  <div className="profile-actions">
                    <button 
                      className="profile-button"
                      onClick={() => {
                        navigate('/profile');
                        setShowProfile(false);
                      }}
                    >
                      View Profile
                    </button>
                    <button 
                      className="profile-button logout-button"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="row">
        <div className="col-md-8">
          <div className="booking-card">
            <h2 className="section-title">Book a flight</h2>
            
            <div className="radio-options">
              <div className="radio-option">
                <input type="radio" id="oneWay" name="tripType" />
                <label htmlFor="oneWay">One Way</label>
              </div>
              <div className="radio-option">
                <input type="radio" id="roundTrip" name="tripType" defaultChecked />
                <label htmlFor="roundTrip">Round Trip</label>
              </div>
              <div className="radio-option">
                <input type="radio" id="multiCity" name="tripType" />
                <label htmlFor="multiCity">Multi City</label>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <label>From</label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Delhi, DEL"
                  value={searchParams.departure}
                  onChange={(e) => handleInputChange({target: {name: 'departure', value: e.target.value}})}
                />
              </div>
              <div className="col-md-6">
                <label>To</label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by place/airport"
                  value={searchParams.arrival}
                  onChange={(e) => handleInputChange({target: {name: 'arrival', value: e.target.value}})}
                />
              </div>
            </div>
            
            <div className="row mt-2">
              <div className="col-md-6">
                <label>Departure</label>
                <input type="date" className="search-input" />
              </div>
              <div className="col-md-6">
                <label>Return</label>
                <input type="date" className="search-input" />
              </div>
            </div>
            
            <div className="divider"></div>
            
            <div className="passenger-selector">
              <span>Travelers + Special Fares</span>
              <span className="passenger-count">1 Passenger</span>
            </div>
            
            <button 
              className="search-button" 
              onClick={() => searchByRoute()}
              disabled={loading.search}
            >
              {loading.search ? "Searching..." : "Search Flights"}
            </button>
          </div>
          
          {flights.length > 0 && (
            <div className="booking-card">
              <h2 className="section-title">Available Flights</h2>
              <table className="flight-table">
                <thead>
                  <tr>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Return</th>
                    <th>Seats</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map(flight => (
                    <tr key={flight.id}>
                      <td>{flight.departureFrom}</td>
                      <td>{flight.arrivalTo}</td>
                      <td>{flight.departure}</td>
                      <td>{flight.departureTime}</td>
                      <td>{flight.returnDate}</td>
                      <td>{flight.seatsAvailable}</td>
                      <td>
                        <button 
                          className="book-button"
                          onClick={() => handleBookFlight(flight.id)}
                        >
                          book
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="booking-card recent-searches">
            <h2 className="section-title">Recent searches</h2>
            <div className="recent-search-item">
              DEL - BOM | 22 Jul | 1 Passenger
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="chat-container">
            <div className="chat-header">
              Flight Assistant
            </div>
            <div className="chat-body">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`chat-message ${
                    msg.sender === 'user' ? 'user-message' : 'bot-message'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="chat-input-container">
              <form onSubmit={handleChatSubmit} className="d-flex">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ask about flights..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary ms-2"
                  disabled={loading.search}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
          
          <div className="offer-banner mt-3">
            <h3>Find exciting offers and best deals</h3>
            <p>Book now and save up to 20%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlightList;