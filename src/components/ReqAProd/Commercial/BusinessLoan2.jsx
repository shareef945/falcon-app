import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoanPreviewContainer } from '../../utils/LoanPreviewContainer';

export default function BusinessLoan2() {
    let navigate = useNavigate();
    /** count to detect first input */
    let countInit = 0;
    const [customer, setCustomer] = useState(JSON.parse(sessionStorage.getItem("falcon-auth-token")));
    let customerId = "demo001";
    const timestamp = new Date();

    const location = useLocation();
    let requestObj = {
        "Principal": 0,
        Interest: 0,
        Tenure: 3,
        "Tenure Unit": 'months',
        "Installment Amount": 0,
        "Repayment Frequency": 'month',
        "Number of Installments": 0,
    }
    let loanObj = {
        totalcost: 0,
        interest_percent: 0,
    };
    if (location.state) {
        loanObj = location.state.product_details;
        requestObj = location.state.product_details.request;
        countInit = 1;
    }

    /** our dropdowns */
    const options = [
        'month', 'week'
    ];
    const options2 = [
        'months',
    ];
    const months = [
        3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36
    ];

    /** the interest rates */
    const multipliers = [
        1.08, 1.17, 1.25, 1.33, 1.42, 1.50, 1.58, 1.66, 1.74, 1.82, 1.90, 1.98
    ];

    /** initialising and setting variables */
    const [count, setCount] = useState(countInit);
    const [repaymentFreq, setRepaymentfreq] = useState(requestObj["Repayment Frequency"]);
    const [loanterm, setLoanterm] = useState(requestObj.Tenure);
    const [monthoryear, setMonthorYear] = useState(requestObj["Tenure Unit"]);
    const [interest, setInterest] = useState(requestObj.Interest);
    const [interestpercent, setInterestpercent] = useState(loanObj.interest_percent);
    const [principal, setPrincipal] = useState(requestObj["Principal"]);
    const [totalcost, setTotalcost] = useState(loanObj.totalcost);
    const [loanAmount, setLoanAmount] = useState(requestObj["Principal"]);
    const [repayment, setRepayment] = useState(requestObj["Installment Amount"]);
    const [inputColor, setInputColor] = useState("#949494");
    const [numberOfInstallments, setNumberOfInstallments] = useState(requestObj["Number of Installments"]);


    return (
        <div className='body'>
            <Toaster toastOptions={{
                style:
                {
                    fontFamily: "Inter",
                    background: "#F9F3EE",
                    borderRadius: "12px"
                }
            }} />
            <div className='titlebar'>
                <a href="/requestaloan">  <svg xmlns="http://www.w3.org/2000/svg" className="backarrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </a>
                <h2 className='pagetitle'>Commercial loan calculator</h2>
            </div>
            <div className='row-responsive'>
                <div className='card-align-vertical'>
                    <div className='input-container'>
                        <p>I want to get a loan for:</p>
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
                                    calculateLoan(e.target.value, loanterm)
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
                        <p>And pay it back over:</p>
                        <div className='row' style={{ gap: "16px" }}>
                            <select className='dropdown'
                                value={loanterm} onChange={(e) => {
                                    setLoanterm(e.target.value)
                                    calculateLoan(loanAmount, e.target.value)
                                }} >
                                {months.map((value) => (
                                    <option value={value} key={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                            <select className='dropdown'
                                value={monthoryear} onChange={(e) => {
                                    setMonthorYear(e.target.value)
                                    calculateLoan(loanAmount)
                                }}>
                                {options2.map((value) => (
                                    <option value={value} key={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className='input-container'>
                        <p>With repayments made every:</p>
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
                </div>
                <div className='float-right-responsive'>


                    <LoanPreviewContainer
                        type="commercial loan"
                        count={count}
                        tenure={loanterm}
                        tenureunit={monthoryear}
                        principal={principal}
                        interest={interest}
                        interestpercent={interestpercent}
                        totalcost={totalcost}
                        repayment={repayment}
                        repaymentFrequency={repaymentFreq} />

                    <button
                        onClick={() => {
                            navigate('/loans/submit-commercial', {
                                state: {
                                    request: {
                                        "Customer ID": customer._id,
                                        "Product ID": "CL"+customer._id.substring(0,3)+String(crypto.randomUUID(5)).substring(0,2),
                                        "Request Date": timestamp.getTime(),
                                        "Product Category": "Commercial loan",
                                        "Preferred Payment Details": {
                                            "Payout Account": "",
                                            "Payment Card": "",
                                        },
                                        Interest: parseInt(interest),
                                        Tenure: parseInt(loanterm),
                                        "Principal": parseInt(principal),
                                        "Tenure Unit": monthoryear,
                                        "Repayment Frequency": repaymentFreq,
                                        "Number of Installments": parseInt(numberOfInstallments),
                                        "Installment Amount": repayment,
                                        "Request Status": "In Progress",
                                        "Loan Sent": false,
                                        "Product Status": "Inactive",
                                        "Date of Last Change": timestamp.getTime(),
                                        Balance: parseInt(totalcost),
                                    },
                                    interest_percent: interestpercent,
                                    totalcost: totalcost,
                                }
                            });
                        }}
                        style={
                            {
                                float: "right",
                                marginTop: "16px"
                            }
                        }
                        className={count > 0 ? "primary-btn-enabled" : "btn-disabled"}>
                        Apply for this loan
                    </button>
                </div>
            </div>
        </div>
    )
    /** where the rice and stew gets calculated. switches based on any input switch */
    function calculateLoan(amount, termm) {
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
    };

    function calculateRepayment(termString, loantermm, totalcostt) {
        
        let costt = totalcost;
        if (totalcostt) {
            costt = totalcostt;
        }

        if(!loantermm) {
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
    };

}