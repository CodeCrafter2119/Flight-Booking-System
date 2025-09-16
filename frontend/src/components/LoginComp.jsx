import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../security/MainContext';

export default function LoginComp() {
    const navigate = useNavigate();
    const { state } = useLocation();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const authContext = useAuth();

    async function handleLogin() {
        setIsLoading(true);
        setErrorMessage(false);
        
        try {
            const success = await authContext.login(email, password);
            if (success) {
                const from = state?.from || '/flights';
                navigate(from, { replace: true });
            } else {
                setErrorMessage(true);
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(true);
        } finally {
            setIsLoading(false);
        }
    }

    function handleEmail(event) {
        setEmail(event.target.value);
    }

    function handlePassword(event) {
        setPassword(event.target.value);
    }

    return (
        <div className='LoginForm'>
            {errorMessage && (
                <div className='ErrorMessage'>
                    Login Failed. Check your credentials.
                </div>
            )}

            <div className="login">
                <h1>Admin login page</h1>
                <hr />
                <div>
                    <label className="m-2">Email</label>
                    <input 
                        type="email" 
                        name='email' 
                        value={email} 
                        onChange={handleEmail}
                    />
                </div>
                <div>
                    <label className="m-2">Password</label>
                    <input 
                        type="password" 
                        name='password' 
                        value={password} 
                        onChange={handlePassword} 
                    />
                </div>
                <button 
                    className="btn btn-success m-3" 
                    onClick={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </div>

            <div className="mt-3 text-center">
                Don't have an account? <Link to="/register">Register here</Link>
            </div>
        </div>
    );
}