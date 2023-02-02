import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';



export default function AuthenticatedNav() {
    const [isNavExpanded, setIsNavExpanded] = useState(false)
    /** getting current location and using a count to switch classnames */
    const location = useLocation().pathname;
    const navigate = useNavigate();

    function logOut() {

        // Sign-out successful.
        sessionStorage.setItem("falcon-auth-stamp", null);
        sessionStorage.removeItem("falcon-auth-token");
        if (location === '/') {
            window.location.reload(false);
        } else {
            <Navigate to={'/'} />
        }


    }

    return (
        <nav>
            <a href="/"
                className="brand-name">
                falcon
            </a>
            <button className='hamburger'
                onClick={() => {
                    setIsNavExpanded(!isNavExpanded);
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div
                className={isNavExpanded ? "navigation-items expanded" : "navigation-items"}>
                <ul>
                    <li>
                        <a className={location == '/' ? "activelink" : ""} href='/'>Dashboard</a>
                    </li>
                    <li>
                        <a className={location.includes('/account') ? "activelink" : ""} href='/account'>Account</a>
                    </li>
                    <li>
                        <a className={location.includes('/support') ? "activelink" : ""} href='/support'>Help</a>
                    </li>
                    <li>
                        <a onClick={logOut}>Log Out</a>
                    </li>
                </ul>
            </div>
        </nav>
    )
}