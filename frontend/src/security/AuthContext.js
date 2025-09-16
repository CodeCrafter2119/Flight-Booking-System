import { Routes, Route, Navigate } from 'react-router-dom';
import FlightList from '../components/FlightList';
// import AddNewFlight from '../components/AddNewFlight';
import Successpage from '../components/Successpage';
import Bookedflight from '../components/BookedFlight';
import LoginComp from '../components/LoginComp';
import RegisterComp from '../components/RegisterComp';
import AuthProvider, { useAuth } from './MainContext';
import PaymentPage from '../components/PaymentPage';
import RazorpayPayment from '../components/RazorpayPayment';
import SeatSelectionPage from '../components/SeatSelectionPage';

function AuthenticatedRoute({children}){

  const AuthContext= useAuth();

  if(AuthContext.isAuthenticated){
    return children
  }else{
    return <Navigate to="/" />
  }

}

export default function FlightRoute() {
  return (
    <AuthProvider >

      <Routes>
    
          <Route path="/" element={<FlightList />} />
          <Route path="/razorpay" element={<RazorpayPayment />} />
          <Route path="/flights" element={<FlightList />} />
          <Route path="/login" element={<LoginComp />}></Route>
          <Route path="/register" element={<RegisterComp />}></Route>
        
     
          {/* <Route path='/flights' element={
              <AuthenticatedRoute>
                <FlightList />
              </AuthenticatedRoute>
        }></Route> */}
          
          <Route path='/BookedFlight/:id' element={
              // <AuthenticatedRoute>
                <Bookedflight />
              // </AuthenticatedRoute>
        }></Route>

          <Route path='/flights/booking/:bookedId' element={
              // <AuthenticatedRoute>
                <PaymentPage />
            //  </AuthenticatedRoute>
          }></Route>

          <Route path='/flight/:flightId/seats' element={<SeatSelectionPage />} />
        {/* /flight/{flightId}/seats */}
        
        <Route path='/successpage' element={
              <AuthenticatedRoute>
                <Successpage />
              </AuthenticatedRoute>
        }></Route>
       


      </Routes>
    </AuthProvider>
  );
}