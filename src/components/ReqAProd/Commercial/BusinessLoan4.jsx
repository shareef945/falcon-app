import Button from '@mui/material/Button';
import { FaHome } from "@react-icons/all-files/fa/FaHome";
import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { usePaystackPayment } from 'react-paystack';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import personalfinance from '../../../img/successimage.png';
import { getBanks } from '../../utils/VerifyBankAccount';


export default function CarFinance4() {
    const location = useLocation();
    const requestObj = location.state.request;
    const [customer, setCustomer] = useState(JSON.parse(sessionStorage.getItem("falcon-auth-token")));
    let navigate = useNavigate();


    const options = [
        'GTB ending in 1234', 'UBA ending in 1234'
    ];

    const options2 = [
        'VISA Debit ending in 1234', 'Mastercard ending in 1234'
    ];

    document.addEventListener("wheel", function (event) {
        if (document.activeElement.type === "number") {
            document.activeElement.blur();
        }
    });

    const [paymentCards, setPaymentCards] = useState([]);
    const [banks, setBanks] = useState([]);
    const [bankName, setBankName] = useState('');
    const [businessDescription, setBusinessDescription] = useState('');
    const [bankCode, setBankCode] = useState();
    const [accountNumberInput, setAccountNumberInput] = useState();
    const [payoutAcc, setPayoutAcc] = useState('');
    const [payoutAccDescription, setPayoutAccDescription] = useState([]);
    const [repaymentcard, setRepaymentcard] = useState(paymentCards[0]);
    const [count, setCount] = useState(0);
    const [count2, setCount2] = useState(0);
    const [working, setWorking] = useState(false);
    const [banking, setBanking] = useState(false);
    const paystack_config = {
        reference: (new Date()).getTime().toString(),
        email: customer["Email Address"],
        amount: 20,
        currency: 'GHS',
        publicKey: process.env.REACT_APP_PAYSTACK_TEST_PUBLIC_KEY,
    };




    requestObj["Preferred Payment Details"]["Payout Account"] = payoutAcc;
    requestObj["Preferred Payment Details"]["Payment Card"] = repaymentcard;
    requestObj["Business Description"] = businessDescription;
    

    useEffect(() => {
        const fetchData = async () => {
            let result = await getCustomer();
            let bankers = await getBanks();
            setBanks(bankers["data"]);
            setBankName(banks[0].name);
            setBankCode(banks[0].code);
            setCustomer(result);
            setPaymentCards(result["Payment Details"]);
            setRepaymentcard(result["Payment Details"][0])
            // console.log("payment cards", result["Payment Details"]);
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

    async function updateCustomer(truncated) {
        return fetch(process.env.REACT_APP_API_URL + "customer/" + customer["_id"], {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(truncated)
        })
            .then(data => data.json())
    }

    async function postRequest(request) {
        //https://8k7pdn.deta.dev/api/products
        // "http://localhost:8443/api/login"
        return fetch(process.env.REACT_APP_API_URL + "products", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product: request,
                email: customer["Email Address"],
                name: customer["First Name"]
            })
        }).then(data => data.json()).catch(error => console.log(error))
    }

    async function submitRequest() {

        setCount(1);
        setWorking(true);
        const response = await postRequest(requestObj);
        console.log("request api response:", response);
        if (response.message === undefined) {
            // request posted
            setWorking(false);
        } else {
            toast("Something went wrong, please try that again.");
        }

    }

    // api call to get latest customer details
    async function getCustomer() {
        const idobj = JSON.parse(sessionStorage.getItem("falcon-auth-token"));
        const id = idobj["_id"];
        // https://8k7pdn.deta.dev/
        // http://localhost:8443/
        return fetch(process.env.REACT_APP_API_URL + "customer/" + id, {
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
                Authorization: 'Bearer sk_test_5fa5e8662d27bf8b188509dba3521b26b0dae3f5',
            },
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

        const truncated = [...paymentCards, authorisation];
        // update state
        setPaymentCards([...paymentCards, authorisation]);
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
                <div onClick={() => {
                    setWorking(true)
                    initializePayment(onPayStackSuccess, onPaystackClose)
                }}>
                    <p style={{ color: "#FF7700", fontWeight: "600", cursor: "pointer" }}>
                        Add a new payment card</p>
                </div>
            </div>
        );
    };

    async function verifyBank() {

        if (accountNumberInput === undefined) {
            alert("Please enter a valid account number");
        } else {

            setBanking(false);
            setWorking(false);
            setPayoutAcc({
                "account_number": accountNumberInput,
                "bank_code": bankCode,
                "bank_name": bankName,
            });
            setPayoutAccDescription(bankName.split(" ")[0] + " ending in " + accountNumberInput.substring(accountNumberInput.length - 4, accountNumberInput.length - 1));
            toast("Bank account information added.");

        }
    }


    return (
        <div>
            {count > 0 ?
                <div className="body">
                    <Toaster />
                    {working ? <BeatLoader /> : <div className="row-responsive-centre-horiz">
                        <figure className="figure-show">
                            <img src={personalfinance}
                                alt='Personal loan'
                                width={350} />
                        </figure>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "center",
                            alignItems: "center",
                            gap: "16px"
                        }}>

                            <p className="card-text-regular">Sit tight, we’ll be in touch soon with a decision by text and email.</p>

                            <Button
                                onClick={() => {
                                    navigate("/");
                                }}
                                style={{
                                    borderRadius: 12,
                                    backgroundColor: "#2A2550",
                                    padding: "8px 16px",
                                    textTransform: "none",
                                    fontFamily: "'Inter', sans-serif",
                                    fontWeight: "500",
                                    fontSize: "16px",
                                }}
                                variant="contained" endIcon={<FaHome />}>Back to Dashboard</Button>


                        </div>
                    </div>}

                </div>
                :
                <div>
                    <Toaster toastOptions={{
                        style:
                        {
                            fontFamily: "Inter",
                            background: "#F9F3EE",
                            borderRadius: "12px"
                        }
                    }} />
                    <div className='titlebar'>
                        <a href="/loans/business-loan-calculator">  <svg xmlns="http://www.w3.org/2000/svg" className="backarrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        </a>
                        <h2 className='pagetitle'>Your Business Loan application</h2>
                    </div>

                    <div className='row-responsive'>

                        <div className='info-container'>
                            <h3>Summary</h3>
                            <div className='card-align-centre'>
                                <p className='card-text-regular'>₵{requestObj["Principal"]} @ {location.state.interest_percent}%</p>
                                <p className='card-text-regular'>Total cost after {requestObj.Tenure} {requestObj["Tenure Unit"]} is ₵{requestObj.Balance} which includes the ₵{requestObj.Interest} in interest.</p>
                                <hr
                                    style={{
                                        color: 'black',
                                        backgroundColor: 'black',
                                        width: '300px',
                                    }}
                                />
                                <Link
                                    state={
                                        {
                                            product_details: location.state,
                                        }
                                    }
                                    style={
                                        {
                                            textDecoration: 'none',
                                        }
                                    }
                                    to='/loans/business-loan-calculator'>
                                    <div className='card-text-edit'>
                                        <p className='card-text-regular'>EDIT</p>
                                    </div>
                                </Link>
                            </div>
                            <div className='info-box-container'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                <p className='card-text-regular'>We'll send you a copy of this application by email after you submit it.</p>
                            </div>
                        </div>

                        <div className='info-container'>
                            <h4>Business information</h4>
                            <div className='card-align-vertical'>
                                <p>Please give a brief description of your business<br />(10 words or less)</p>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder='Start typing' onChange={(e) => {
                                        setBusinessDescription(e.target.value)
                                    }} />
                            </div>
                        </div>

                        <div className='info-container'>
                            <h4>Account information</h4>

                            <div className='card-align-vertical'>
                                        <div className='input-container'>
                                            <p>If approved, pay my loan into:</p>
                                            <input className="container-grey-bg" value={payoutAcc.length == 0 ? "Please verify an account" : payoutAccDescription} disabled='disabled' />
                                            {banking ?

                                                <div className='info-container'>
                                                    <input type='number' className="edit-text-container" placeholder='Account Number' value={accountNumberInput} onChange={(e) => {
                                                        setAccountNumberInput(e.target.value);
                                                    }} />
                                                    <select className='dropdown'
                                                        style={{ maxWidth: 270 }}
                                                        onChange={(e) => {
                                                            setBankCode(e.target.value);
                                                            setBankName(banks[e.target.selectedIndex].name);
                                                        }}>
                                                        {banks.map(item => (
                                                            <option value={item.code} key={item.id}>
                                                                {item.name}
                                                            </option>
                                                        ))
                                                        }
                                                    </select>

                                                    <p
                                                        onClick={() => {
                                                            verifyBank();
                                                        }}
                                                        style={{ cursor: "pointer", color: "#FF7700", fontWeight: "600", marginLeft: "auto" }}>Add</p>

                                                </div>
                                                :
                                                ""}
                                            <p
                                                onClick={() => {
                                                    setBanking(!banking)
                                                }}
                                                style={{ cursor: "pointer", color: "#FF7700", fontWeight: "600", }}>{banking ? "" : "Verify a new bank account"}</p>

                                        </div>

                                        {/* <div className='input-container'>
                                            <p>If approved, make repayments with:</p>
                                            <select className='dropdown'
                                                onChange={(e) => {
                                                    setRepaymentcard(paymentCards[e.target.selectedIndex])
                                                }}>
                                                {paymentCards.map(item => (
                                                    <option value={item} key={item.id}>
                                                        {item.brand.toUpperCase() + " card ending in " + item.last4}
                                                    </option>
                                                ))}
                                            </select>
                                            <PaystackHookExample />
                                        </div> */}
                                    </div>

                            <p className='card-text-regular'>
                                By applying, you agree to the <a href='https://www.notion.so/abeotech/Terms-90b98cf7e76f4a7da93e493e58e7de73'>terms</a> of use of this product. We’ll use your details and the information provided to assess your suitability for this product.
                            </p>
                            <button
                                className='primary-btn'
                                style={{ minWidth: "300px" }}
                                onClick={() => {
                                    if (businessDescription === "" || businessDescription.length < 3) {

                                        toast.error("Please provide a brief description of your business");

                                    } else {
                                        submitRequest();
                                    }
                                    // } else if (payoutAcc !== '' && repaymentcard !== undefined){
                                    //     submitRequest();
                                    // } else {
                                    //       toast("You must verify a bank account for your loan to be paid into and choose a repayment card first.");
                                    // }
                                }
                                }>
                                Submit my application
                            </button>


                        </div>


                    </div>


                </div >}
        </div>

    )
}