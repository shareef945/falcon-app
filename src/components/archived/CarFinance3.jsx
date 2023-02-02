import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export default function CarFinance3() {
    /** this page will read info on customer from server and pull it as a personaldetails object
     * and add that to a request object that is sent on to the next summary page
     */

    /** first pick up what was passed from last activity */
    const location = useLocation();
    const loanObj = location.state;

    /** define options and vars */
    const options = [
        'Employed full time', 'Employed part time', 'Self employed', 'Unemployed'
    ];
    const [employment, setEmployment] = useState(options[0]);
    const [income, setIncome] = useState('10,000');
    // when adding backend, this will be set accurately
    const [firstline, setFirstline] = useState('1107 Aston Place');
    const [secondline, setSecondline] = useState('100 Suffolk Street');
    const [lastline, setLastline] = useState('Birmingham UK B1 1FQ');
    const [dateofbirth, setDateofbirth] = useState('23/July/2000');
    const [name, setName] = useState('Shareef Ali');
    const [phone, setPhone] = useState('+233 803 123 4567');
    const [inputColor, setInputColor] = useState("#949494");

    /** output */
    return (
        <div className='body'>
            <Toaster/>
            <div className='titlebar'>
                <a href="/requestaloan2">  <svg xmlns="http://www.w3.org/2000/svg" className="backarrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </a>
                <h2>Your Car Finance application</h2>
            </div>

            <p style={{
                marginLeft: "5%",
                marginRight: "5%",
            }}>To request this car finance, please confirm that the details below are still correct. If any have changed, please edit as required.</p>


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
                    <h4>Your finances</h4>
                    <div className='card-align-vertical'>
                        <div className='input-container'>
                            <p>Employment status</p>
                            <select className='dropdown'
                                value={employment} onChange={(e) => setEmployment(e.target.value)}>
                                {options.map((value) => (
                                    <option value={value} key={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className='input-container'>
                            <p>Monthly income before tax</p>
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

                                    type="numeric" name="amount" placeholder={income} onChange={(e) => {
                                        setIncome(e.target.value)
                                    }} />
                            </div>
                        </div>

                    </div>
                </div>

                <div className='info-container'>
                    <h4>Your address</h4>
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
                </div>
            </div>

            <div className='info-container'>
                <h4>Personal details</h4>
                <div className='card-align-vertical'>
                    <div className='input-container'>
                        <p>Full name</p>
                            <input
                                className='input'
                                type="text" placeholder={name} onChange={(e) => {
                                    setName(e.target.value)
                                }} />
                    </div>
                    <div className='input-container'>
                        <p>Date of Birth</p>
                            <input 
                            className='input'
                            type="text" placeholder={dateofbirth} onChange={(e) => {
                                setDateofbirth(e.target.value)
                            }} />
                    </div>
                    <div className='input-container' onClick= {() => {
                                    toast("To change your registered phone number, you'll have to visit the account tab.")
                             }}>
                        <p>Phone number</p>
                            <input
                            disabled="disabled"
                            className='input'
                             type="text" name="amount" placeholder={phone} />
                        
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
                        <Link to='/carfinance4'
                            state={
                                {
                                    request_details: {
                                        type: "Car finance",
                                    },
                                    product_details: loanObj,
                                    personal_details: {
                                        employment: employment,
                                        income: income,
                                        address: firstline.concat(" ", secondline, " ", lastline),
                                        full_name: name,
                                        date_of_birth: dateofbirth,
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
