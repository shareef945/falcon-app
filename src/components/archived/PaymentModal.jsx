import { Radio, TextField } from "@mui/material";
import React from "react";
import { useState } from "react";
import { Button } from "react-bootstrap";
import Alert from 'react-bootstrap/Alert';
import { motion } from 'framer-motion';
import { AlertOctagon, CreditCard, Plus, PlusSquare, X } from "react-feather";
import { usePaystackPayment } from "react-paystack";
import { Warning } from "@mui/icons-material";
import { toast } from "react-hot-toast";

export default function PaymentModal({ selectedCard, customer, callback }) {
    // this wouldn't work with non ghana country codes or 2 digit country codes e.g +44 
    let phone = '0' + customer["Phone Number"].substring(4, customer["Phone Number"].length - 1);
    const [number, setNumber] = useState(phone);
    const [paymentMethods] = useState(customer["Payment Details"])
    const [preferredPaymentMethod, setPaymentMethod] = useState(null);
    const [nopaymentmethodset, setNoPaymentMethodError] = useState(false);
    const networks = [{ provider: 'MTN', code: 'mtn' }, { provider: 'Vodafone', code: 'vod' }, { provider: 'Airtel/Tigo', code: 'tgo' }];
    const [network, setNetwork] = useState(networks[0].code);
    // TODO: don't need to display mobile money UI, init paystack modal instead
    const [mobileMoney, setMobileMoney] = useState(false);
    let mobile_money = {
        "phone": number,
        "provider": network
    }

    // the test mobile money number returns the object you will expect at your webhook
    // let mobile_money = {
    //     "phone": '0551234987',
    //     "provider": 'mtn'
    // }
    // console.log(mobile_money)
    let paystack_config = {
        reference: (new Date()).getTime().toString(),
        email: customer["Email Address"],
        amount: 100 * selectedCard["Installment Amount"],
        currency: 'GHS',
        publicKey: process.env.REACT_APP_PAYSTACK_TEST_PUBLIC_KEY,
    };

    const handleChange = (event) => {
        if (nopaymentmethodset) {
            setNoPaymentMethodError(false);
        }
        else {
            const option = paymentMethods.find(option => option.authorization_code === event.target.value);
            setPaymentMethod(option);
        }
    };

    // make the api call to charge the specified card (this api handles transactions posting and resolving the installment)
    async function startCharge(params) {

    }

    // make an api call to the charge api with a mobile money object
    async function mobileMoneyCharge() {
        return fetch(process.env.REACT_APP_PAYSTACK_ROOT_URL + 'charge', {
            method: 'POST',
            port: 443,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.REACT_APP_PAYSTACK_TEST_SECRET}`,
            },
            body: JSON.stringify({
                "amount": parseInt(selectedCard["Installment Amount"]) * 100,
                "email": customer["Email Address"],
                "currency": "GHS",
                mobile_money
            })
        }).then(data => data.json()).catch(error => console.error);
    }

    // mobile money payments
    async function callPaystackMM() {
        const result = await mobileMoneyCharge();
        if (mobile_money.provider === ('mtn' || 'tgo')) {
            // read the result and if result.message is 'Charge attempted', show result.data.display_text,
            // TODO: set up webhook endpoint on api server to parse paystack response on payment success
            // else, deal with errors
        } else {
            // vodafone requires additional otp
            // read the result and if result.message is 'Charge attempted', show result.data.display_text and provide a textfield to take OTP
            // on submit, pass the OTP to the Submit OTP api
            // https://paystack.com/docs/payments/payment-channels/#mobile-money
        }
    }

    const [x, setX] = useState(0);

    //if user choses to use a new card, the paystack component get used instead and 
    // onSuccess calls the falcon transaction api and resolves the installment


    async function validate() {
        if (preferredPaymentMethod !== null) {
            if (nopaymentmethodset === true) {
                setNoPaymentMethodError(false);
            } else if (preferredPaymentMethod == 'Pay with mobile money') {
                setMobileMoney(true);

            } else {

                // charge
                // console.log(preferredPaymentMethod);
                // https://paystack.com/docs/payments/recurring-charges/#charge-the-authorization

                // if data.status == success, call falcon transaction api and resolve the installment

                // if data.status == failed, show error message and tell the user to try again or use a different card
            }

        } else {
            if (nopaymentmethodset === false) {
                setNoPaymentMethodError(true);
            } else {
                // already set, shake
                setX(-16);
                setTimeout(() => {
                    setX(0);
                    setTimeout(() => {
                        setX(16);
                        setTimeout(() => {
                            setX(0);
                        }, 50)
                    }, 50)
                }, 50)

            }
        }
    }

    return (
        <motion.div
            initial={{ y: 32 }}
            animate={{ y: 0 }}>
            {mobileMoney ? <div
                style={{ display: "flex", flexDirection: "column" }}>
                <X
                    onClick={() => {
                        callback();
                    }}
                    style={{ cursor: "pointer", marginLeft: "auto", marginBottom: -12, zIndex: 1, background: "red", color: "white", borderRadius: 16, padding: 2 }} />

                <div className="card-align-vertical" style={{ borderRadius: 18 }}>
                    <TextField
                        label='Phone number'
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={number}
                        onChange={(e) => {
                            setNumber(e.target.value);
                        }}
                    />
                    <select className='dropdown'
                        value={network} onChange={(e) => {
                            setNetwork(e.target.value)
                        }} >
                        {networks.map((item) => (
                            <option value={item.code} key={item.code}>
                                {item.provider}
                            </option>
                        ))}
                    </select>

                    <Button onClick={() => {
                        callPaystackMM();
                    }} className="primary-btn">Pay</Button>
                </div>
            </div>
                :
                <div
                    style={{ display: "flex", flexDirection: "column" }}>
                    <X
                        onClick={() => {
                            callback();
                        }}
                        style={{ cursor: "pointer", marginLeft: "auto", marginBottom: -12, zIndex: 1, background: "red", color: "white", borderRadius: 16, padding: 2 }} />

                    <div className="card-align-vertical" style={{ borderRadius: 18 }}>
                        <h4>Installment payment</h4>
                        <h3> GH₵ {selectedCard["Installment Amount"]}</h3>
                        <p>Choose a payment method</p>
                        {nopaymentmethodset ?
                            <motion.div
                                initial={{ x: 16 }}
                                animate={{ x }}
                                layout transition={{
                                    type: "spring",
                                    stiffness: 700,
                                    damping: 30
                                }}
                                className="icon-text"
                                style={{ padding: "12px 6px", borderRadius: 8, backgroundColor: "rgba(255, 0, 0, 0.2)" }}
                            >
                                <AlertOctagon />
                                <p>Please choose an option:</p>
                            </motion.div> : ""}
                        {paymentMethods.map((method, index) => (
                            <div style={{ background: "#F6F6F6", borderRadius: 12, display: "flex", flexDirection: "row", gap: 16, padding: "4px 6px", alignItems: "center" }}>
                                <CreditCard />
                                <p>{method.brand.toUpperCase()} ending in {method.last4}</p>
                                <Radio
                                    type='radio'
                                    name={method.last4}
                                    value={method.authorization_code}
                                    checked={method === preferredPaymentMethod}
                                    onChange={handleChange}
                                />
                            </div>
                        ))}
                        <div style={{ background: "#F6F6F6", borderRadius: 12, display: "flex", flexDirection: "row", gap: 16, padding: "4px 6px", alignItems: "center" }}>
                            <PlusSquare />
                            <p>Pay with a new method</p>
                            <Radio
                                type='radio'
                                name='new-card'
                                value='Pay with a new method'
                                checked={preferredPaymentMethod === 'Pay with a new method'}
                                onChange={(e) => {
                                    setPaymentMethod(e.target.value);
                                }}
                            />
                        </div>
                        <div style={{ background: "#F6F6F6", borderRadius: 12, display: "flex", flexDirection: "row", gap: 16, padding: "4px 6px", alignItems: "center" }}>
                            <PlusSquare />
                            <p>Pay with mobile money</p>
                            <Radio
                                type='radio'
                                name='new-card'
                                value='Pay with mobile money'
                                checked={preferredPaymentMethod === 'Pay with mobile money'}
                                onChange={(e) => {
                                    setPaymentMethod(e.target.value);
                                }}
                            />
                        </div>
                        <Button
                            onClick={() => {
                                validate();
                            }}
                            style={{ borderRadius: 32 }} className="primary-btn"><b>{preferredPaymentMethod === 'Pay with a new method' || preferredPaymentMethod === 'Pay with mobile money' ? "Proceed" : "Pay"}</b></Button>
                    </div>

                </div>}
        </motion.div>
    )

}