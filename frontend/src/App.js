
import './App.css';
import FlightList from './components/FlightList';
import FlightRoute from './security/AuthContext';

function App() {
  return (
    <div className="App">
      <FlightRoute />
    </div>
  );
}

export default App;
