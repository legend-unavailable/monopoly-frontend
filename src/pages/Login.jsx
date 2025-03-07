import axios from "axios";
import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import lounge from '../assets/cigarLounge.jpg'

const Login = () => {
    const [loginInfo, setLoginInfo] = useState({email: '', password: ''});
    const [noErr, setNoErr] = useState(false);
    const [emailClass, setEmailClass] = useState("form-control");
    const [passwordClass, setPasswordClass] = useState("form-control");
    const [invalidPassword, setInvalidPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const moveTo = useNavigate();

    const backgroundStyle = {
      backgroundImage: `url(${lounge})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      height: '100vh',
      filter: 'brightness(0.5)'
    }

    const emailCheck = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
        
    }
    const passwordCheck = (password) => {
        return password.length >= 8;
    }

    const handleChange = (e) => {
        setLoginInfo({...loginInfo, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(loginInfo);
        setLoading(true);

        if (!emailCheck(loginInfo.email)) {
            setEmailClass('form-control is-invalid');
            setLoading(false);
            return;
        }
        setEmailClass("form-control is-valid");
        if (!passwordCheck(loginInfo.password)) {
            setPasswordClass("form-control is-invalid");
            setLoading(false);
            return;
        }
        setPasswordClass("form-control is-valid");
        try {
            const res = await axios.post('http://localhost:3000/login', loginInfo);
            console.log(res);
            
            if (res.data.isFound) {
                moveTo('/Lobby');
            }
        }
        catch(error) {
            console.log(
              "Login failed:",
              error.response?.data?.error || error.message
            );
            setNoErr(true);
            setEmailClass("form-control is-invalid");
            setPasswordClass("form-control is-invalid");
        }
        finally{setLoading(false)}
    }

    return (
      <div className="container-fluid p-0" style={backgroundStyle}>
        <div className="d-flex justify-content-center">
          <h1>login page</h1>
        </div>
        <div
          className="container d-flex justify-content-center"
          style={{ height: "80vh" }}
        >
          <form onSubmit={handleSubmit} className="align-self-center"
          noValidate>
            <div className="container">
              {noErr && (
                <div className="alert alert-danger" role="alert">
                  Invalid email or password
                </div>
              )}
              <label htmlFor="" className="form-label">
                Email
              </label>
              <input
                type="email"
                className={emailClass}
                onChange={handleChange}
                name="email"
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="container">
              <label htmlFor="" className="form-label">
                Password
              </label>
              <input
                type="password"
                className={passwordClass}
                onChange={handleChange}
                name="password"
                required
                placeholder="Enter your password"
              />
            </div>

            <div className="d-flex justify-content-center p-3">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Loggin in...' : 'Login'}
              </button>
            </div>
            <hr />
            
            <div className="text-center">
                <div className="me-2">Don't have an account?</div>
                <button className="btn btn-info" onClick={() => moveTo('/Signup')}>Sign Up</button>
            </div>
          </form>
        </div>
      </div>
    );
}

export default Login;