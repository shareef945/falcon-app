import { TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { PropagateLoader } from "react-spinners";
import { reloadApp } from "../../App";

import ReactGA from "react-ga4";
// ReactGA.initialize("G-4V172MEF14");

export default function MoreDetails() {
    let accountInitialDetails = useLocation().state.account_details;
    let navigate = useNavigate();

    const menuItems = ["Log in", "Sign up"];
    const [menuItem, setMenuItem] = useState(menuItems[0]);
    

    const mf = ["Male", "Female"];

    const country = "Ghana";
    const [requestEmailVerification, setRequestEmailVerification] = useState(true);
    const [firstLineofAddress, setFirstLineofAddress] = useState("");
    const [secondLineofAddress, setSecondLineofAddress] = useState("");
    const [city, setCity] = useState("");
    const [dateOfBirth, setDateOfBirth] = React.useState(dayjs('2022-01-01T00:00:01'));
    const [gender, setGender] = useState(mf[0]);
    const [otp, setOtp] = useState(crypto.randomUUID(5).substring(0, 4));
    const [otpInput, setOtpInput] = useState('');
    const [govtId, setGovtId] = useState("");
    const [isWorking, setIsWorking] = useState(false);
    const [count, setCount] = useState(0);

    async function signUp(credentials) {
        return fetch(process.env.REACT_APP_API_URL + "customer", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        })
            .then(data => data.json())
    }

    async function sendOtp() {
        return fetch(process.env.REACT_APP_API_URL + "sendverification", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "First Name": accountInitialDetails.name,
                "Email Address": accountInitialDetails.email,
                "Verification Code": otp,
            })
        })
            .then(data => data.json())
    }

    useEffect(() => {
        if (count < 1) {
            sendOtp();
            setCount(1);
        }
    })

    function verifyEmail() {
        if (otp === otpInput) {
            toast("Your email address has now been verified.")
            setRequestEmailVerification(false);
        } else {
            toast("You've entered the wrong OTP. Please try again.")
        }
    }
    async function validateFields() {

        // console.log("date of birth: " + dateOfBirth.format("DD/MM/YYYY"));
        const today = Date.now(); // this is a unix epoch
        const dateobject = new Date(today);
        if (((today - dateOfBirth) / 31536000000) < 18) {
            toast("You must be 18 years or older to sign up.");
        } else {
            if (govtId.length < 8) {
                toast("You haven't entered a valid government ID number.");
            } else {
                if (firstLineofAddress.length < 1) {
                    toast("Please check that the first line of your address is not empty.");
                } else {
                    if (secondLineofAddress.length < 3) {
                        toast("Please check that the second line of your address is not empty.");
                    } else {
                        if (city.length < 3) {
                            toast("Please check that you've entered the name of a real city.");
                        } else {
                            // build customer object
                            const customerObject = {
                                "Customer ID": String(accountInitialDetails.name.split(" ")[0].substring(0, 2) + accountInitialDetails.name.split(" ")[1].substring(0, 2) + new Date().getTime()),
                                "First Name": accountInitialDetails.name.split(" ")[0],
                                "Last Name": accountInitialDetails.name.split(" ")[1],
                                DOB: dateOfBirth.format("DD/MM/YYYY"),
                                Gender: gender,
                                "Email Address": accountInitialDetails.email,
                                "Phone Number": accountInitialDetails.number,
                                "Registration Date": new Date().getTime(),
                                "Home Address": firstLineofAddress.concat(" ", secondLineofAddress, " ", city, " ", country),
                                City: city,
                                Country: country,
                                "Payment Details": [],
                                Password: accountInitialDetails.password,
                                "Government ID Number": govtId,
                                Status: "active",
                                Balance: 0,
                                Products: [],
                                "Last Transaction Date": "",
                                "Last Transaction Due Date": ""
                            }
                            // replace form with loader
                            setIsWorking(true);
                            // create customer record
                            const status = await signUp(customerObject);
                            // console.log(status);
                            // successful
                            if (status.Status) {
                                // store details
                                const truncated = {
                                    "_id": status["_id"],
                                    "Customer ID": status["Customer ID"],
                                    "First Name": status["First Name"],
                                    "Last Name": status["Last Name"],
                                    "Email Address": status["Email Address"],
                                    "Payment Details": status["Payment Details"],
                                    "Phone Number": status["Phone Number"],
                                    "Home Address": status["Home Address"],
                                    DOB: status.DOB,
                                    "Government ID Number": status["Government ID Number"],
                                    "Username": status["Username"],
                                    "Registration Date": status["Registration Date"],
                                    Products: status.Products
                                }
                                sessionStorage.setItem("falcon-auth-token", JSON.stringify(truncated));
                                sessionStorage.setItem("falcon-auth-stamp", Math.floor(Date.now() / 1000));
                                ReactGA.send("signup");
                                navigate('/'); //should probably pass some prop that says they're a new user
                                reloadApp();
                            } else {
                                // decipher errors

                            }
                        }
                    }
                }
            }
        }
    }

    return (
        <div className="body-centred" style={{}}>

            <Toaster />
            {isWorking === true ?
                <div>
                    <h1 style={{ fontSize: "24px", color: "white" }}>falcon</h1>
                    <div className="card-align-vertical" style={{ backgroundColor: "white" }}>
                        <div className="info-container" style={{ alignItems: "center" }}>

                            <p style={{ maxWidth: "320px" }}>
                                Creating your account</p>

                            <PropagateLoader size={14} loading={isWorking} color="#FF7700" />

                        </div>
                    </div>

                </div>
                : requestEmailVerification ?
                    <div>
                        <h1 style={{ fontSize: "24px", color: "black" }}>falcon</h1>
                        <div className="card-align-vertical" style={{ backgroundColor: "white" }}>
                            <div className="info-container">

                                <p style={{ maxWidth: "320px" }}>
                                    Please enter the verification code sent to {accountInitialDetails.email}
                                </p>
                                <div className="input-container">
                                    <input className="edit-text-container" type='numeric' placeholder='Code' value={otpInput} onChange={(e) => { setOtpInput(e.target.value) }} />
                                </div>
                                <button className="primary-btn" onClick={()=>{verifyEmail()}}>Verify Email</button>

                            </div>
                        </div>
                    </div> :
                    <div>
                        <h1 style={{ fontSize: "24px", color: "black" }}>falcon</h1>
                        <div className="card-align-vertical" style={{ backgroundColor: "white" }}>
                            <div className="info-container">

                                <p style={{ maxWidth: "320px" }}>
                                    We just need a few more details to create your account</p>

                            </div>
                            <div className="info-container">

                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Date of birth"
                                        value={dateOfBirth}
                                        inputFormat="DD/MM/YYYY"
                                        onChange={(newValue) => {
                                            setDateOfBirth(newValue);
                                        }}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                                <div className="input-container">
                                    <p>Gender</p>
                                    <select className='dropdown'
                                        value={gender} onChange={(e) => setGender(e.target.value)}>
                                        {mf.map((value) => (
                                            <option value={value} key={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-container">
                                    <p>Government ID number</p>
                                    <input className="edit-text-container" type='numeric' placeholder='' value={govtId} onChange={(e) => { setGovtId(e.target.value) }} />
                                </div>

                                <div className="input-container">
                                    <p>First line of address</p>
                                    <input className="edit-text-container" type='text' placeholder='' value={firstLineofAddress} onChange={(e) => { setFirstLineofAddress(e.target.value) }} />
                                </div>
                                <div className="input-container">
                                    <p>Second line of address</p>
                                    <input className="edit-text-container" type='text' placeholder='' value={secondLineofAddress} onChange={(e) => { setSecondLineofAddress(e.target.value) }} />
                                </div>
                                <div className="input-container">
                                    <p>City</p>
                                    <input className="edit-text-container" type='text' placeholder='' value={city} onChange={(e) => { setCity(e.target.value) }} />
                                </div>
                                <p>Country: <b>{country}</b></p>
                                <button className="primary-btn" onClick={validateFields}>Create My Account</button>
                                <p style={{ maxWidth: "320px", textAlign: "center" }}>By clicking the “Create my account” button, you agree to SAI Resources' terms of acceptable use.</p>
                            </div>

                        </div>
                    </div>
            }
        </div>
    )
}