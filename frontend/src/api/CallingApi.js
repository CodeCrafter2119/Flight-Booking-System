import { urlAPI } from "./ApiClient"

export const retrieveAllFlights = () => urlAPI.get(`/flights`)

export const retrieveFlightFromTo = (placeName,placeTo) => urlAPI.get(`/flights/place/${placeName}/${placeTo}`)

export const retrieveAFlightById = (id) => urlAPI.get(`/flights/${id}`)

// export const DeleteFlightById = (id) => urlAPI.delete(`/flights/${id}`)

// export const AddNewFlightAPI =(Flight) => urlAPI.post(`/flights/add`,Flight)

export const BookedFlightAPI = (ticket) => urlAPI.post(`/flights/booking`,ticket)

export const ConfirmBookingAPI = (bookedId,paymentAmount) => urlAPI.put(`/flights/booking/${bookedId}`,paymentAmount)

export const AssistsAPI = (query) => urlAPI.get(`/assist/${encodeURIComponent(query)}`)

// export const PaymentAPI = (body) => urlAPI.post(`/payment`,body)

export const RegisterUser = (userData) => {
    return urlAPI.post('/register/user', userData);
};

export const ExecuteJwtAuthAPI = (email,password) => urlAPI.post(`/authenticate/user`,{email,password});