import { Money } from "@mui/icons-material";
import React from "react"
import { useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, CreditCard, File, FileText } from "react-feather";
import { useLocation, useNavigate } from "react-router-dom"
export default function ManageLoan() {
    const selected = useLocation().state.selectedCard;
    let navigate = useNavigate();

    return (
        <div>
            <div className="titlebar" style={{ marginBottom: 16 }}>
                <div className="icon-text">
                    <ArrowLeft /> <p>Back</p>
                </div>
            </div>
            <div className="body-centred">
                <div className="card-align-vertical" style={{ marginBottom: 16 }}>
                    <h2>Manage Loan</h2>

                    <h3>Payments</h3>

                    <div className="edit-text-container" style={{ gap: 32 }}>
                        <div className="icon-text">
                            <Calendar /> <p>Repayment date</p>
                        </div>
                        <ArrowRight style={{ marginLeft: "auto" }} />
                    </div>

                    <div
                    onClick={()=>{
                        navigate('/change-repayment-card', {state: {
                            selected
                          }});
                    }} 
                    className="edit-text-container" style={{ gap: 32, cursor: "pointer"}}>
                        <div className="icon-text">
                            <CreditCard /> <p>Repayment card</p>
                        </div>
                        <ArrowRight style={{ marginLeft: "auto" }} />
                    </div>

                    <div className="edit-text-container" style={{ gap: 32 }}>
                        <div className="icon-text">
                            <FileText /> <p>View statements</p>
                        </div>
                        <ArrowRight style={{ marginLeft: "auto" }} />
                    </div>

                    <div className="edit-text-container" style={{ gap: 32 }}>
                        <div className="icon-text">
                            <Money /> <p>Pay off your loan early</p>
                        </div>
                        <ArrowRight style={{ marginLeft: "auto" }} />
                    </div>

                    <h3>Information</h3>

                    <div className="edit-text-container" style={{ gap: 32 }}>
                        <div className="icon-text">
                            <File /> <p>Loan details</p>
                        </div>
                        <ArrowRight style={{ marginLeft: "auto" }} />
                    </div>

                    <div className="edit-text-container" style={{ gap: 32 }}>
                        <div className="icon-text">
                            <FileText /> <p>Loan contract</p>
                        </div>
                        <ArrowRight style={{ marginLeft: "auto" }} />
                    </div>

                </div>


            </div>
        </div>

    )
}

