import { useState } from 'react';
import {  Link } from 'react-router-dom';
import {  RegisterUser } from '../api/CallingApi';

export default function RegisterComp() {
    const [formData, setFormData] = useState({
        username:'',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [data, setData]=useState('');
    // const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errorMessage) setErrorMessage('');
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            setErrorMessage('Username is required');
            return false;
        }
        if (formData.username.length < 3) {
            setErrorMessage('Username must be at least 3 characters');
            return false;
        }
        if (!formData.email) {
            setErrorMessage('Password is required');
            return false;
        }
        if (!formData.password) {
            setErrorMessage('Password is required');
            return false;
        }
        if (formData.password.length < 6) {
            setErrorMessage('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            const response = await RegisterUser({
                username: formData.username,
                email:formData.email,
                password: formData.password
            });
            setData(response.data);
            console.log(response);
            // Redirect to login with success state
            // navigate('/login', { 
            //     state: { 
            //         registrationSuccess: true,
            //         username: formData.username 
            //     } 
            // });
        } catch (error) {
            console.error('Registration error:', error);
            const errorMsg = error.response?.data?.message || 
                           error.message || 
                           'Registration failed. Please try again.';
            setErrorMessage(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login">
            <h1>Registration Page</h1>
            <hr />
            
             {<div className='successMessage' >Your Id Credentials</div> }
             {<div className='successMessage' >Your Id {data.id}</div> }
             {<div className='successMessage' >Your Name {data.username}</div> }
             {<div className='successMessage' >Your Email {data.email}</div> }

            {errorMessage && (
                <div className="alert alert-danger" role="alert">
                    {errorMessage}
                </div>
            )}
            
            <form onSubmit={handleRegister}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input 
                        type="text" 
                        className="form-control"
                        id="username"
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input 
                        type="text" 
                        className="form-control"
                        id="email"
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input 
                        type="password" 
                        className="form-control"
                        id="password"
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input 
                        type="password" 
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword" 
                        value={formData.confirmPassword} 
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span className="visually-hidden">Loading...</span>
                        </>
                    ) : (
                        'Register'
                    )}
                </button>
            </form>
            
            <div className="mt-3 text-center">
                Already have an account? <Link to="/login">Login here</Link>
            </div>
        </div>
    );
}