import { useState } from 'react';

function Auth() {
    const [isLogin, setIsLogin] = useState(true); // Toggle between login/signup

    return (
        <div>
            <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
            <form>
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />
                {!isLogin && <input type="password" placeholder="Confirm Password" />}
                <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)}>
                Switch to {isLogin ? 'Sign Up' : 'Login'}
            </button>
        </div>
    );
}

export default Auth;