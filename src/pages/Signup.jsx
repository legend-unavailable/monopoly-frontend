import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

const Signup = () => {
    const [userInfo, setUserInfo] = useState({email: '', password: '', username: ''});
    const [passwordErr, setPasswordErr] = useState(false);
    const [userExists = setUserExists] = useState(false);
    const [specialErr, setSpecialErr] = useState(false);

    const [emailClass, setEmailClass] = useState('form-control')
    const [passwordsClass, setPasswordsClass] = useState('form-control');

    const emailCheck = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    const updateInfo = (e) => {
        e.preventDefault();
        setUserInfo({...userInfo, [e.target.name]: e.target.value});
    }
    const handleSubmit = async( e) => {
        e.preventDefault();
        //setloading
        if (!emailCheck(userInfo.email)) {
            setUserExists(true);
            //setloading
            setEmailClass('form-control is-invalid')

        }

    }
    return(
        <div className="container">
            <div className="d-flex justify-content-center p-4">
                <h1>signup page</h1>
            </div>

            <div className="container d-flex justify-content-center p-2">
                <form onSubmit={handleSubmit}
                className="align-self-center w-75 p-2 border border-success border-3 rounded">
                    <div className="container p-1">
                        <div className="p-3">
                            <label className="form-label">
                                Enter your Email
                            </label>
                            {userExists && 
                            (<div className="alert alert-danger p-1" style={{width: '245px'}} role="alert">
                                Account with email already exists
                            </div>)}
                             <input type="email" name='email' className={emailClass} onChange={updateInfo} required/>
                        </div>

                        <div className="p-3">
                            <label className="form-label">
                                Enter a username
                            </label>
                             <input type="text" name='username' className="form-control" onChange={updateInfo} required/>
                        </div>

                        <div className="p-3">
                            <label className="form-label">
                                Enter a password
                            </label>
                            
                            {specialErr || 
                            (<div className="alert alert-danger p-1" style={{width: '89%'}} role="alert">
                                Must include at least one special character. Eg. $, @, &
                            </div>)}
                            {specialErr || 
                            (<div className="alert alert-danger p-1" style={{width: '56%'}} role="alert">
                                Must be at least 8 characters long
                            </div>)}
                            {specialErr || 
                            (<div className="alert alert-danger p-1" style={{width: '92%'}} role="alert">
                                Must include at least one uppercase and lowercase letter
                            </div>)}
                            {specialErr || 
                            (<div className="alert alert-danger p-1" style={{width: '56%'}} role="alert">
                                Must include at least one number
                            </div>)}
                            
                             <input type="password" name='password' className={passwordsClass} onChange={updateInfo} required placeholder="Must have a number, a special character, and at least 8 characters"/>
                        </div>

                        <div className="p-3">
                            <label className="form-label">
                                Re-enter your password
                            </label>
                            {passwordErr && 
                            (<div className="alert alert-danger p-1" style={{width: '175px'}} role="alert">
                                Passwords don't match
                            </div>)}
                             <input type="password" className={passwordsClass} onChange={updateInfo} required/>
                        </div>

                        <div className="d-flex justify-content-center p-1">
                            <button className="btn btn-success" type='submit'>Create Account</button>
                        </div>
                    </div>
                    <hr />
                    <div className="text-center">
                        <div className="me-2">
                            Already have an account?
                        </div>
                        <button className="btn btn-primary" onClick={() => moveTo('/Login')}>Sign Up</button>
            </div>
                </form>
            </div>

        </div>
    )
}

export default Signup;