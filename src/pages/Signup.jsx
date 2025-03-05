import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

const Signup = () => {
    return(
        <div className="container">
            <div className="d-flex justify-content-center">
                <h1>signup page</h1>
            </div>

            <div className="justify-content-center">
                <form className="align-self-center">
                    <label className="form-label">
                        Enter your Email
                    </label>
                    <imput className="form-control"></imput>
                </form>
            </div>

        </div>
    )
}

export default Signup;