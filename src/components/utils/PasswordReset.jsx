import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BeatLoader } from "react-spinners";

export default function PasswordReset() {
    // get params from url
    const [resetToken, setResetToken] = useState('');
    const [params] = useState(useParams());
    const email = params.email;
    const token = params.token;
    const [password, setPassword] = useState('');
    const passwordRegex = new RegExp(/^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/);
    const [working, setWorking] = useState(false);
    const [explainer, setExplainer] = useState('');
    const [responseReceived, setResponseReceived] = useState(false);

    let navigate = useNavigate();

    async function resetPassword(credentials) {
        //https://8k7pdn.deta.dev/api/customer
        // "http://localhost:8443/api/login"
        return fetch(process.env.REACT_APP_API_URL + "resetpassword", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        }).then(data => data.json()).catch(error => console.log(error))
    }

    async function validateFields() {
        if (passwordRegex.test(password)) {
            setWorking(true);
            const res = await resetPassword({ email, password, token });
            setWorking(false);
            setResponseReceived(true);
            // i've written this so the api always returns a 201 code
            // will probably rewrite to handle 500s instead on failed reset
            if (res.message === "Operation was rejected."){
                setExplainer("We couldn't change your password at this time. Please click the link in your email again or request a password reset again.")
            }
            else if (res.message === "Token has expired."){
                setExplainer("This link has expired. Please request a new link on the landing page.")

            } else if (res.message === "Password changed."){
                setExplainer("Password Changed. Click the button below to go to the sign in page.");
            }
        }
    }

    // post email, password and token to changepassword api endpoint,
    // password field is updated on customer object if token matches current password reset token in customer object and hasn't expired (by comparing timestamp difference is less than 1 hour ago)

    return (
        <div className="body-centred">
           {working ? <BeatLoader /> 
           : 
           <div>
                <h1 style={{ fontSize: "24px", color: "black" }}>falcon</h1>
                <div className="card-align-vertical" style={{ backgroundColor: "white" }}>
                    { responseReceived ? 
                    <div>
                        <p style={{ maxWidth: "320px" }}>
                            {explainer}
                        </p> 
                        <button className="primary-btn" onClick={()=>{navigate('/landing-page')}}>Back to Sign In</button>
                    </div>
                    :
                    <div className="info-container">

                        <p style={{ maxWidth: "320px" }}>
                            Choose a new password
                        </p>
                        <div className="input-container">
                            <input className="edit-text-container" type='password' placeholder='Password' value={password} onChange={(e) => { setPassword(e.target.value) }} />
                        </div>
                        <button className="primary-btn" onClick={()=>{validateFields()}}>Change Password</button>

                    </div>}
                </div>
            </div>}
        </div>
    )
}