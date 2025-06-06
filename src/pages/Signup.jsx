import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import frontDesk from '../assets/reception.jpg';
const API_URL = import.meta.env.VITE_API_URL;


const Signup = () => {
    const [userInfo, setUserInfo] = useState({email: '', password: '', username: '', confirmation: ''});

    const [passwordErr, setPasswordErr] = useState(false);

    const [userExists, setUserExists] = useState(false);
    const [invalidEmail, setInvalidEmail] = useState(false);

    const [specialErr, setSpecialErr] = useState(false);
    const [lengthErr, setLengthErr] = useState(false);
    const [letterErr, setLetterErr] = useState(false);
    const [numberErr, setNumberErr] = useState(false);

    const [emailClass, setEmailClass] = useState('form-control')
    const [passwordsClass, setPasswordsClass] = useState('form-control');

    const [loading, setLoading] = useState(false);

    const moveTo = useNavigate();

    const emailCheck = (email) => {
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    const updateInfo = (e) => {
        e.preventDefault();
        setUserInfo({...userInfo, [e.target.name]: e.target.value});
    }
    const passwordCheck = (password) => {
        setLengthErr(false);
        setLetterErr(false);
        setSpecialErr(false);
        setNumberErr(false);
        setPasswordErr(false);
        setUserExists(false);
        setInvalidEmail(false);

        setPasswordsClass('form-control');

        console.log(`password: ${password}, length: ${password.length}`);
        
        if (password.length < 8 || password.length > 20) {
            setLengthErr(true);
            setPasswordsClass('form-control is-invalid');
            return true;
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            setSpecialErr(true);
            setPasswordsClass('form-control is-invalid');
            return true;
        }
        if (!/\d/.test(password)) {
            setNumberErr(true);
            setPasswordsClass('form-control is-invalid');
            return true;
        }
        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
            setLetterErr(true);
            setPasswordsClass('form-control is-invalid');
            return true;
        }
        return false;
    }
    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        console.log(userInfo);
        
        if (emailCheck(userInfo.email)) {
            setInvalidEmail(true);
            setEmailClass('form-control is-invalid');
            setLoading(false);
            return;
        }
        else if (passwordCheck(userInfo.password)) {
            setLoading(false);
            return;
        }
        else if (userInfo.password !== userInfo.confirmation) {
            setPasswordErr(true);
            setPasswordsClass('form-control is-invalid');
            setLoading(false);
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/signup`, userInfo);
            if (res.data.alreadyExists){
                setUserExists(true);
                setEmailClass('form-control is-invalid');
                console.log("user already exists");
                
                return;
            }
            else if(res.data.sucessful){
                moveTo('/Login');
            }
        } catch (err) {
            console.log(
                "Login failed:",
                
              );
        }
        finally {setLoading(false);}

    }
    return (
      <div className="container-fluid p-0">
        <div className="position-relative" style={{ height: "100vh" }}>
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              backgroundImage: `url(${frontDesk})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>

          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"></div>

          <div className="position-relative p-4" style={{ zIndex: 2 }}>
            <div className="d-flex justify-content-center p-4 text-light">
              <h1>Millionaire's Club Front Desk</h1>
            </div>

            <div className="container d-flex justify-content-center p-2">
              <form
                onSubmit={handleSubmit}
                className="align-self-center p-2 border border-success border-3 rounded" style={{width: '35%'}}
              >
                <div className="container p-1">
                  <div className="p-3">
                    <label className="form-label text-light">
                      Enter your Email
                    </label>
                    {userExists && (
                      <div
                        className="alert alert-danger p-1"
                        style={{ width: "55%" }}
                        role="alert"
                      >
                        Account with email already exists
                      </div>
                    )}
                    {invalidEmail && (
                      <div
                        className="alert alert-danger p-1"
                        style={{ width: "42%" }}
                        role="alert"
                      >
                        Please enter a valid email
                      </div>
                    )}
                    <input
                      type="email"
                      name="email"
                      className={emailClass}
                      onChange={updateInfo}
                      required
                    />
                  </div>

                  <div className="p-3">
                    <label className="form-label text-light">
                      Enter a username
                    </label>
                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      onChange={updateInfo}
                      required
                    />
                  </div>

                  <div className="p-3">
                    <label className="form-label text-light">
                      Enter a password
                    </label>

                    {specialErr && (
                      <div
                        className="alert alert-danger p-1"
                        style={{ width: "89%" }}
                        role="alert"
                      >
                        Must include at least one special character. Eg. $, @, &
                      </div>
                    )}
                    {lengthErr && (
                      <div
                        className="alert alert-danger p-1"
                        style={{ width: "56%" }}
                        role="alert"
                      >
                        Must be at least 8 characters long
                      </div>
                    )}
                    {letterErr && (
                      <div
                        className="alert alert-danger p-1"
                        style={{ width: "92%" }}
                        role="alert"
                      >
                        Must include at least one uppercase and lowercase letter
                      </div>
                    )}
                    {numberErr && (
                      <div
                        className="alert alert-danger p-1"
                        style={{ width: "56%" }}
                        role="alert"
                      >
                        Must include at least one number
                      </div>
                    )}

                    <input
                      type="password"
                      name="password"
                      className={passwordsClass}
                      onChange={updateInfo}
                      required
                    />
                  </div>

                  <div className="p-3">
                    <label className="form-label text-light">
                      Re-enter your password
                    </label>
                    {passwordErr && (
                      <div
                        className="alert alert-danger p-1"
                        style={{ width: "175px" }}
                        role="alert"
                      >
                        Passwords don't match
                      </div>
                    )}
                    <input
                      type="password"
                      name="confirmation"
                      className={passwordsClass}
                      onChange={updateInfo}
                      required
                    />
                  </div>

                  <div className="d-flex justify-content-center p-1">
                    <button
                      className="btn btn-success"
                      type="submit"
                      disabled={loading}
                    >
                      Create Account
                    </button>
                  </div>
                </div>
                <hr className="opacity-100 border-light" />
                <div className="text-center">
                  <div className="me-2  pb-3 text-light">
                    Already have an account?
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => moveTo("/Login")}
                    disabled={loading}
                  >
                    Log In
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
}

export default Signup;