import React, { useEffect, useState } from "react";
import { ArrowLeft } from "react-feather";
import toast, { Toaster } from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RiseLoader } from "react-spinners";
import { prettifyNumber } from '../utils/UsefulFunctions';

export default function ModifyRequest() {


    let navigate = useNavigate();
    const location = useLocation();
    let request = location.state.request;
    // console.log(request)
    let countInit = 0;
    const [working, setWorking] = useState(false);

    /** our dropdowns */
    const options = [
        'month', 'week'
    ];
    const options2 = [
        'months', 'year'
    ];
    const months = [
        3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36
    ];

    const years = [1, 2, 3, 4];

    /** the interest rates */
    const multipliers = [
        1.08, 1.17, 1.25, 1.33, 1.42, 1.50, 1.58, 1.66, 1.74, 1.82, 1.90, 1.98
    ];

    const yearMultipliers = [1.33, 1.58, 1.90, 2.23];

    /** initialising and setting variables */
    const bankAccounts = [
        'GTB ending in 1234', 'UBA ending in 1234'
    ];
    const paymentCards = [
        'VISA Debit ending in 1234', 'Mastercard ending in 1234'
    ];
    const initialInterestPercent = 100 * (request["Interest"] / request["Principal"]);
    const [count, setCount] = useState(countInit);
    const [repaymentFreq, setRepaymentfreq] = useState(request["Repayment Frequency"]);
    const [loanterm, setLoanterm] = useState(request["Tenure"]);
    const [monthoryear, setMonthorYear] = useState(request["Tenure Unit"]);
    const [interest, setInterest] = useState(request["Interest"]);
    const [interestpercent, setInterestpercent] = useState(initialInterestPercent);
    const [principal, setPrincipal] = useState(request.Principal);
    const [totalcost, setTotalcost] = useState(principal + interest);
    const [loanAmount, setLoanAmount] = useState(request.Principal);
    const [repayment, setRepayment] = useState(request["Installment Amount"]);
    const [inputColor, setInputColor] = useState("#949494");
    const [repaymentCard, setRepaymentCard] = useState(request["Preferred Payment Details"]["Payment Card"]);
    const [payoutAccount, setPayoutAccount] = useState(request["Preferred Payment Details"]["Payout Account"]);
    const [numberOfInstallments, setNumberOfInstallments] = useState(request["Number of Installments"]);

    useEffect(()=>{
        document.title = "Falcon | Modify request";
    });
    /** where the rice and stew gets calculated. switches based on any input switch */
    function calculateLoan(amount, termm) {
        if (request["Product Category"] == ("Commercial loan" || "Personal loan")) {
            let index = months.indexOf(parseInt(loanterm));
            if (typeof termm !== "undefined") {
                index = months.indexOf(parseInt(termm));
            }
            let multiplierr = multipliers[index]
            let totalcostt = (amount * multiplierr).toFixed(2);
            setTotalcost(totalcostt);
            setPrincipal(amount);
            setInterest((totalcostt - amount).toFixed(2));
            // console.log(termm);
            setInterestpercent((multiplierr * 100) - 100);
            calculateRepayment(repaymentFreq, termm, totalcostt);
        } else {

        }

    };

    function calculateRepayment(termString, loantermm, totalcostt) {
        if (request["Product Category"] == ("Commercial loan" || "Personal loan")) {
            let costt = totalcost;
            if (totalcostt) {
                costt = totalcostt;
            }
            if (!loantermm) {
                loantermm = loanterm;
            }
            let result = 0;
            // as this loan only accepts months as term
            let permonth = costt / loantermm;
            let numberofRepayments = 0;
            if (termString === 'month') {
                result = permonth;
                numberofRepayments = loantermm;
            } else if (termString === 'week') {
                let perweek = permonth / 4;
                result = perweek;
                numberofRepayments = loantermm * 4;
            }
            result = result.toFixed(2);
            setRepayment(result);
            setNumberOfInstallments(numberofRepayments);
        } else {

        }
    };

    async function updateRequest(request, requestID) {
        return fetch(process.env.REACT_APP_API_URL + "products/" + requestID, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        }).then(data => data.json()).catch(error => console.log(error))
    }

    async function patchRequest() {
        const updates = {
            "Date of Last Change": new Date(Date.now()),
            "Preferred Payment Details": {
                "Payout Account": payoutAccount,
                "Repayment Card": repaymentCard,
            },
            Balance: parseInt(totalcost),
            Principal: parseInt(principal),
            Tenure: parseInt(loanterm),
            "Tenure Unit": monthoryear,
            "Repayment Frequency": repaymentFreq,
            "Installment Amount": parseInt(repayment),
            "Number of Installments": numberOfInstallments,
            Interest: parseInt(interest),
        };
        let updateRequestResult = await updateRequest(updates, request["_id"]);
        if (updateRequestResult.status !== 400) {
            setWorking(false);
            navigate("/managerequests");
        }
    }

    return (
        <div className="body-padding">
            <Toaster />
            <div className="titlebar" style={{ margin: 0 }}>
                <Link style={{ textDecoration: "none" }} to="/managerequests">
                    <ArrowLeft />
                </Link><h3>Modify request with id: {request["Product ID"]}</h3>
            </div>

            <p>You can't edit some fields. Alternatively, you can withdraw this request and submit a new one from your dashboard.</p>


            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {working ? <RiseLoader /> : ""}
                {working ? "" : <div style={{ width: "fit-content" }}>
                    <div className="card-align-vertical">
                        <div className="input-container">
                            <h4>Loan type</h4>
                            <p>{request["Product Category"]}</p>
                        </div>

                        <div className='input-container'>
                            <h4>Loan amount</h4>
                            <div
                                style={
                                    {
                                        borderColor: inputColor,
                                    }
                                }
                                className='edit-text-container'>
                                <p className='stickyText'>₵</p>
                                <input
                                    onFocus={() => {
                                        setInputColor("#00BFFF")
                                    }}
                                    placeholder={principal}
                                    onBlur={() => {
                                        setInputColor("#949494")
                                    }}
                                    clasname="input"
                                    type="numeric" name="amount" onChange={(e) => {
                                        setLoanAmount(e.target.value)
                                        calculateLoan(e.target.value)
                                        {
                                            // wrapping count in an if - else to set a minimum loan amount
                                        }
                                        if (e.target.value > 10) {
                                            setCount(count + 1)
                                        } else {
                                            setCount(0)
                                        }

                                        if (e.target.value > 500000) {
                                            toast("Are you sure about that? 😲")
                                        }
                                    }} />
                            </div>
                        </div>

                        <div className='input-container'>
                            <h4>Paid back over</h4>
                            <div className='row' style={{ gap: "16px" }}>
                                <select className='dropdown'
                                    value={loanterm} onChange={(e) => {
                                        setLoanterm(e.target.value)
                                        calculateLoan(loanAmount, e.target.value)
                                    }} >
                                    {request["Product Category"] == "Car finance" ? years.map((value) => (
                                        <option value={value} key={value}>
                                            {value}
                                        </option>
                                    )) : months.map((value) => (
                                        <option value={value} key={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                                <p>
                                    {request["Product Category"] == "Car finance" ? loanterm > 1 ? "years" : "year" : "months"}
                                </p>
                            </div>
                        </div>

                        <div className='input-container'>
                            <h4>With repayments made every</h4>
                            <select className='dropdown'
                                value={repaymentFreq} onChange={(e) => {
                                    setRepaymentfreq(e.target.value)
                                    calculateRepayment(e.target.value)
                                }}>
                                {options.map((value) => (
                                    <option value={value} key={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <p style={{ maxWidth: 300 }}>
                            A loan of ₵{prettifyNumber(principal)} over {loanterm} {loanterm > 1 ? monthoryear + "s" : monthoryear} could cost you ₵{prettifyNumber(repayment)} per {repaymentFreq} at a {interestpercent}% interest rate.
                            The total cost after {loanterm} {loanterm > 1 ? monthoryear + 's' : monthoryear} would be ₵{prettifyNumber(totalcost)} which includes the ₵{prettifyNumber(interest)} in interest.<br />Subject to approval. Terms apply.</p>

                        <div className='input-container'>
                            <h4>If approved, pay my loan into:</h4>
                            <select className='dropdown'
                                value={payoutAccount} onChange={(e) => {
                                    setPayoutAccount(e.target.value);
                                    request["Preferred Payment Details"]["Payout Account"] = e.target.value;
                                }}>
                                {bankAccounts.map((value) => (
                                    <option value={value} key={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                            <p style={{ color: "#FF7700", fontWeight: "600" }}>Verify a new bank account</p>

                        </div>

                        <div className='input-container'>
                            <h4>If approved, make repayments with:</h4>
                            <select className='dropdown'
                                value={repaymentCard} onChange={(e) => {
                                    setRepaymentCard(e.target.value);
                                    request["Preferred Payment Details"]["Payment Card"] = e.target.value;
                                }}>
                                {paymentCards.map((value) => (
                                    <option value={value} key={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                            <p style={{ color: "#FF7700", fontWeight: "600" }}>Verify a new bank account</p>

                        </div>


                    </div>
                    <button className="primary-btn" style={{ marginTop: "24px", width: "100%" }}
                        onClick={() => {
                            setWorking(true);
                            patchRequest();
                        }}>
                        Submit
                    </button>
                </div>}
            </div>


        </div>
    )
}