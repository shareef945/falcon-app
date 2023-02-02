import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom'

export default function CarFinance3() {
    /** this page will read info on customer from server and pull it as a personaldetails object
     * and add that to a request object that is sent on to the next summary page
     */

    /** first pick up what was passed from last activity */
    const location = useLocation();
    const loanObj = location.state;

    /** define options and vars */
    const options = [
        'Growth', 'Consolidate Debt', 'Emergency Cash Flow', 'Cash Flow'
    ];
    const roles = [
        'Sole Trader', 'Partner', 'Director'
    ];
    const [loan_purpose, setLoanPurpose] = useState(options[0]);
    const [turnover, setTurnover] = useState('10,000');
    const [role, setRole] = useState(roles[0]);
    const [business_description, setBusinessDescription] = useState('Car Repairs');
    // when adding backend, this will be set accurately
    const [firstline, setFirstline] = useState('1107 Aston Place');
    const [secondline, setSecondline] = useState('100 Suffolk Street');
    const [lastline, setLastline] = useState('Birmingham UK B1 1FQ');
    const [phone, setPhone] = useState('+233 803 123 4567');
    const [business_name, setBusinessName] = useState('ABC Small Business');
    const [business_registration, setBusinessRegNo] = useState('1234567890');
    const [inputColor, setInputColor] = useState("#949494");

    /** output */
    return (
        <div className='body'>
            <div className='titlebar'>
                <a href="/requestaloan2">  <svg xmlns="http://www.w3.org/2000/svg" className="backarrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </a>
                <h2>Your Commercial loan application</h2>
            </div>

            <p style={{
                marginLeft: "5%",
                marginRight: "5%",
            }}>We’ve pre-filled information you’ve already told us below. If any details have changed, pleas edit as required. You must be a sole trader, partner or director to borrow on behalf of your business.</p>


            <div
                style={{ marginTop: "32px" }}
                className='row-responsive'>
                {
                    // This is the div that gets styled so the cards are displayed in a row (or column if smaller screen)
                }
                <div className='info-container'>
                    {
                        // This is the div that gets styled so the label is aligned with the card
                    }
                    <h4>About your business</h4>
                    <div className='card-align-vertical'>
                        <div className='input-container'>
                            <p>What is the name of your business?</p>
                            <input
                                className='input'
                                type="text" placeholder={business_name} onChange={(e) => {
                                    setBusinessName(e.target.value)
                                }} />
                        </div>
                        <div className='input-container'>
                            <p>What is your company's registration number?</p>
                            <input
                                className='input'
                                type="text" placeholder={business_registration} onChange={(e) => {
                                    setBusinessRegNo(e.target.value)
                                }} />
                        </div>
                        <div className='input-container'>
                            <p>What will you use this loan for?</p>
                            <select className='dropdown'
                                value={loan_purpose} onChange={(e) => setLoanPurpose(e.target.value)}>
                                {options.map((value) => (
                                    <option value={value} key={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className='input-container'>
                            <p>What is your estimated turnover for this year?</p>
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
                                    onBlur={() => {
                                        setInputColor("#949494")
                                    }}

                                    type="numeric" name="amount" placeholder={turnover} onChange={(e) => {
                                        setTurnover(e.target.value)
                                    }} />
                            </div>
                        </div>

                    </div>
                </div>

                <div className='info-container'>
                    <h4>Your role</h4>
                    <div className='card-align-vertical'>
                        <div className='input-container'>
                            <p>What is your role in the business?</p>
                            <select className='dropdown'
                                value={role} onChange={(e) => setRole(e.target.value)}>
                                {roles.map((value) => (
                                    <option value={value} key={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='input-container'>
                            <p>What does your business do? </p>
                            <input
                                className='input'
                                type="text" placeholder={business_description} onChange={(e) => {
                                    setSecondline(e.target.value)
                                }} />
                        </div>
                    </div>
                </div>

                <div className='info-container'>
                    <h4>Business contact details</h4>
                    <div className='card-align-vertical'>
                        <div className='input-container'>
                            <p>First line of address</p>
                            <input
                                className='input'
                                type="text" placeholder={firstline} onChange={(e) => {
                                    setFirstline(e.target.value)
                                }} />
                        </div>
                        <div className='input-container'>
                            <p>Second line of address</p>
                            <input
                                className='input'
                                type="text" placeholder={secondline} onChange={(e) => {
                                    setSecondline(e.target.value)
                                }} />
                        </div>
                        <div className='input-container'>
                            <p>Last line of address</p>
                            <input
                                className='input'
                                type="text" placeholder={lastline} onChange={(e) => {
                                    setLastline(e.target.value)
                                }} />
                        </div>
                        <div className='input-container'>
                            <p>Phone number</p>
                            <input
                                className='input'
                                type="text" placeholder={phone} onChange={(e) => {
                                    setPhone(e.target.value)
                                }} />

                        </div>
                    </div>

                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}>
                        <div className='group-btn-row-unresponsive'>
                            <Link to='/'>
                                <button className='secondary-btn'>
                                    Cancel
                                </button>
                            </Link>
                            <Link to='/businessloan4'
                                state={
                                    {
                                        request_details: {
                                            type: "Business loan",
                                        },
                                        product_details: loanObj,
                                        business_details: {
                                            business_name,
                                            business_registration,
                                            business_description,
                                            loan_purpose,
                                            turnover,
                                            role,
                                            address: firstline.concat(" ", secondline, " ", lastline),
                                            phone_number: phone,
                                        },
                                    }
                                }>
                                <button className='primary-btn'>
                                    Proceed
                                </button>
                            </Link>
                        </div>
                    </div>


                </div>

            </div>

        </div >
    )
}
