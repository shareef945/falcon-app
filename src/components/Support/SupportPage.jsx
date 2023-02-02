import { Fab } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { ArrowRight, HelpCircle } from "react-feather";
import { Toaster } from "react-hot-toast";
import "react-notion/src/styles.css";
import { Link } from "react-router-dom";
import {SupportBob} from 'support-bob-react';
// import SupportBob from '../archived/SupportBob'



export default function SupportPage() {

    const [customer, setCustomer] = useState(sessionStorage.getItem("falcon-auth-token") ? JSON.parse(sessionStorage.getItem("falcon-auth-token")) : {"Email Address" : "unauthenticated user"});
    let posts = [];
    let listTitles = [];
    const [titles, setTitles] = useState(["Loans", "Accounts"]);
    const subtitles = ["Requesting a loan, editing installments and more...", "Setting up, making changes to your account, and more..."]
    let postids = [];
    let dataFetched = "false";
    const [popup, setPopup] = useState(false);

    useEffect(() => {
        document.title = "Falcon Help"
    });

    function showPopUp() {

    }

    return (
        <div style={{position: "fixed", width: "100%", height: "100%"}}>
            <Toaster />
            <div style={{display: "flex", flexDirection: "column", gap: 16}}>
                {/* this div will be overlapped */}
                <div className="icon-text" style={{ paddingTop: "32px", paddingLeft: "32px", gap: 16 }}>
                    <h2>How can we help you today</h2>
                    <img style={{ height: 48 }} src="data:image/png;base64,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" alt=""></img>
                </div>
                <div className="row-responsive">

                    {titles.map((item, i) => (
                        <Link to={'/support/' + item} className="linksnodecor"> <div className="card-align-vertical" style={{ flexDirection: "row", alignItems: "center" }}>
                            <div>
                                <h3>{item}</h3>
                                <p>{subtitles[i]}</p>
                            </div><ArrowRight size={36} /></div>
                        </Link>

                    ))}
                </div>
            </div>
            {/* This div will overlap other div */}
            <SupportBob user={customer['Email Address']} projectKey='b43e92df-9de0'/>
        </div>
    )
}