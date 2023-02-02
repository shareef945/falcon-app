import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import { Calendar, Lock, X } from "react-feather";
import toast, { Toaster } from "react-hot-toast";
import { usePaystackPayment } from "react-paystack";
import { BeatLoader } from "react-spinners";
import { joinedDaysAgo } from "./utils/UsefulFunctions";
import { motion } from 'framer-motion';

export default function Account() {
    const [count, setCount] = useState(0);
    const [customer, setCustomer] = useState(JSON.parse(sessionStorage.getItem("falcon-auth-token")));
    const [email, setEmail] = useState(customer["Email Address"]);
    const [phone, setPhone] = useState(customer["Phone Number"]);
    const [paymentDetails, setPaymentDetails] = useState(customer["Payment Details"]);
    const [working, setWorking] = useState(false);
    const [goodToGo, setGoodToGo] = useState(true);
    const [hidden, setHidden] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [otp] = useState(crypto.randomUUID(5).substring(0, 4));
    const passwordRegex = new RegExp(/^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/);

    const paystack_config = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: 20,
        currency: 'GHS',
        publicKey: process.env.REACT_APP_PAYSTACK_TEST_PUBLIC_KEY,
    };
    const [count2, setCount2] = useState(0);


    useEffect(() => {
        document.title = "Falcon | Manage your account";

        const fetchData = async () => {
            let result = await getCustomer();
            setCustomer(result);
            sessionStorage.setItem("falcon-auth-token", JSON.stringify(result));                   
            // console.log("updated customer object: ", result);
            setPaymentDetails(result["Payment Details"]);
            setCount2(count2 + 1);
        }
        // update customer record to the latest only once when page is opened
        if (count2 < 1) {
            // call the function
            fetchData()
                // make sure to catch any error
                .catch(console.error);
        }

    });

    async function sendOtp() {
        return fetch(process.env.REACT_APP_API_URL + "sendverification", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "First Name": customer["First Name"],
                "Email Address": customer["Email Address"],
                "Verification Code": otp,
            })
        })
            .then(data => data.json())
    }

    // api call to get latest customer details
    async function getCustomer() {
        const idobj = JSON.parse(sessionStorage.getItem("falcon-auth-token"));
        const id = idobj["_id"];
        // https://8k7pdn.deta.dev/
        // http://localhost:8443/
        return fetch(process.env.REACT_APP_API_URL+"customer/" + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(data => data.json())
    }

    // api call to paystack to verify a transaction
    async function getTransaction(transactionId) {
        return fetch("https://api.paystack.co/transaction/verify/" + transactionId, {
            method: 'GET',
            port: 443,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.REACT_APP_PAYSTACK_TEST_SECRET}`,
            },
        })
            .then(data => data.json()).catch((err) => {
                err.json()
                console.log(err)
            })
    }

    async function updateCustomer(truncated) {
        return fetch(process.env.REACT_APP_API_URL+"/customer/" + customer["_id"], {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(truncated)
        })
            .then(data => data.json())
    }

    // on success paystack popup callback
    const onPayStackSuccess = (reference) => {
        // console.log(reference);
        figureOutTransaction(reference);
    };

    // processing transaction object received from paystack api
    async function figureOutTransaction(reference) {
        // call the api and get the object
        const transaction = await getTransaction(reference.trxref);

        // the transaction object received from paystack contains an authorisation code that you can use to set up a recurring payment later
        // it is important to store the email at the time of transaction as well as the authorization,
        // so we add the email into the authorisation
        let authorisation = transaction.data.authorization;
        authorisation.email = transaction.data.customer.email;
        // console.log("authorisation: ", authorisation);

       const truncated = [...paymentDetails, authorisation];
        // update state
        setPaymentDetails([...paymentDetails, authorisation]);
        // update as a valid payment method on api
        const result = await updateCustomer({ "Payment Details": truncated });
        // console.log("update customer result: ", result);
        if (result.status !== 400) {
            toast("Payment details updated")
            setWorking(false);
        }
        else {
            setWorking(false);

        }
    }


    // on paystack popup closure
    const onPaystackClose = () => {
        console.log('paystack pop up closed');
        setWorking(false);
    }

    // paystack component
    const PaystackHookExample = () => {
        const initializePayment = usePaystackPayment(paystack_config);
        return (
            <div>
                <button onClick={() => {
                    setWorking(true)
                    initializePayment(onPayStackSuccess, onPaystackClose)
                }}>Add a payment method</button>
            </div>
        );
    };

    // function to prevent submitting requests with no changes
    function trackChanges(emailChange, phoneChange) {
        if (emailChange === customer["Email Address"]
            && phoneChange === customer["Phone Number"]) {
            setCount(0);
        }
    }

    async function validateFields() {
        let emailRegex = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");
        let changes = {};
        setWorking(true);
        if (email != customer["Email Address"]) {
            if (emailRegex.test(email)) {
                changes["Email Address"] = email;
            } else {
                setWorking(false);
                toast("Please enter a valid email");
                setGoodToGo(false);
            }
        }
        if (phone != customer["Phone Number"]) {
            changes["Phone Number"] = phone;
        }

        if (goodToGo == true) {
            // in theory changes won't be empty as validateFields() will only get called if there are changes
            const result = await updateCustomer(changes);
            // console.log("update customer result: ", result);
            if (result.status !== 400) {
                setWorking(false);
                setCount(0);
                toast("Details updated")
            }
            else {
                setWorking(false);
                toast("Something went wrong.");
            }
        }

    }

    async function sendCode() {
        setHidden(true);
        const sent = await sendOtp();
    }

    function confirmOtp() {
        if (otp === otpInput) {
            setShowPasswordInput(true);
        } else {
            toast("That isn't the OTP. Please try again.");
        }
    }

    async function validateNewPassword() {
        if (passwordRegex.test(passwordInput)) {
            setWorking(true);
            const result = await updateCustomer({
                "Password": passwordInput
            });
            setWorking(false);
            setShowPasswordInput(false);
            setHidden(false);
            // console.log(result);
            if (result.status !== 400) {
                setWorking(false);
                toast("Password changed.")
            }
            else {
                setWorking(false);
                toast("Something went wrong. Please try again later.");
            }
        }
    }

    return (
        <div className="body-centred">
            <Toaster />

            {working ?
                <BeatLoader style={{ marginTop: 32 }} />
                :
                <div
                    className="info-container"
                    style={{ marginBottom: 16 }}>
                    <h1>My details</h1>
                    <h3>{customer["First Name"]} {customer["Last Name"]}</h3>
                    {/* <p>@{customer["Username"]}</p> */}
                    <div className="icon-text"><Calendar color="#A0AEC0" size={18} /><p className="grey-text">{joinedDaysAgo(customer["Registration Date"])}</p></div>

                    {hidden ? "" :
                        <div className="info-container">
                            <div style={{ marginTop: 16, marginBottom: 16 }} className="info-container">
                                <h3>Payment details</h3>


                                {paymentDetails.length == 0 ? <div className="info-container">
                                    <p style={{ maxWidth: 300 }}>You don't have any payment details set.</p>
                                </div> : ""}
                                <div className='info-container'>

                                    {paymentDetails.map((object, index) => (
                                        <div className="edit-text-container" style={{ flexDirection: "row", marginBottom: 4 }}><p><b>{object.brand.toUpperCase()}</b> ending in {object.last4}</p></div>

                                    ))}
                                    <PaystackHookExample />
                                    <p style={{ maxWidth: 320, fontSize: 14 }}>When you add a new card, we take a small payment of 0.20 cedis to confirm your card which is immediately refunded.</p>

                                </div>


                            </div>

                            <div className="card-align-vertical">
                                <h3>Your contact details</h3>
                                <div className="input-container">
                                    <p>Email address</p>
                                    <input className="edit-text-container" type='email' placeholder={email} value={email} onChange={(e) => {
                                        setEmail(e.target.value)
                                        setCount(count + 1)
                                        trackChanges(e.target.value, phone)
                                    }} />
                                </div>
                                <div className="input-container">
                                    <p>Mobile number</p>
                                    <input className="edit-text-container" type='numeric' placeholder={phone} value={phone} onChange={(e) => {
                                        setPhone(e.target.value)
                                        setCount(count + 1)
                                        trackChanges(email, e.target.value)
                                    }} />
                                </div>
                                <button
                                    onClick={() => { validateFields() }}
                                    className={count > 0 ? "primary-btn-enabled" : "btn-disabled"}>Update</button>
                            </div>

                            <div className="card-align-vertical">
                                <h3>KYC information</h3>
                                <div className="input-container">
                                    <p>Government ID number</p>
                                    <p className="container-grey-bg">
                                        {customer["Government ID Number"]}
                                    </p>
                                </div>
                                <div className="input-container">
                                    <p>Date of Birth</p>
                                    <p className="container-grey-bg">
                                        {customer["DOB"]}
                                    </p>
                                </div>
                                <div className="input-container">
                                    <p>Address</p>
                                    <p className="container-grey-bg">
                                        {customer["Home Address"]}
                                    </p>
                                    <p>Please contact support if you want to update your address.</p>
                                </div>
                                <button
                                    onClick={validateFields}
                                    className={count > 0 ? "primary-btn-enabled" : "btn-disabled"}>Submit</button>
                            </div>
                        </div>
                    }


                    <motion.div
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20
                        }}
                        style={{ display: "flex", flexDirection: "column" }}>
                        {hidden ? <X
                            onClick={() => {
                                setHidden(false);
                            }}
                            style={{ cursor: "pointer", marginLeft: "auto", marginBottom: -12, zIndex: 1, background: "red", color: "white", borderRadius: 16, padding: 2 }} />
                            :
                            ""
                        } <div className="card-align-vertical">
                            <h3>Security</h3>
                            {hidden ?
                                showPasswordInput ?
                                    <div className="info-container">
                                        <p style={{ maxWidth: "320px" }}>
                                            Choose a new password
                                        </p>
                                        <div className="input-container">
                                            <input className="edit-text-container" type='password' placeholder='Password' value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value) }} />
                                        </div>
                                        <button className="primary-btn" onClick={() => { validateNewPassword() }}>Change Password</button>
                                    </div> :
                                    <div className="info-container">
                                        <p style={{ maxWidth: "320px" }}>
                                            Please enter the verification code sent to {customer["Email Address"]}
                                        </p>
                                        <div className="input-container">
                                            <input className="edit-text-container" type='numeric' placeholder='Code' value={otpInput} onChange={(e) => { setOtpInput(e.target.value) }} />
                                        </div>
                                        <Button className="primary-btn" onClick={() => { confirmOtp() }}>Confirm</Button>
                                    </div>
                                :
                                <motion.div
                                    className="edit-text-container" style={{ background: "#2A2550", borderRadius: 12, color: "white", cursor: "pointer" }} onClick={() => { sendCode(); }}>
                                    <div className="icon-text">
                                        <Lock size={18} />
                                        <p>Change your password</p>
                                    </div>
                                </motion.div>}

                        </div>
                    </motion.div>

                </div>}

        </div>

    )
}