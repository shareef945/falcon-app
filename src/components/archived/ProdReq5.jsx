import Button from '@mui/material/Button';
import { FaHome } from "@react-icons/all-files/fa/FaHome";
import React from "react";
import { useState } from 'react';
import { Toaster } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import personalfinance from '../../img/successimage.png';

export default function ProdReq5() {
    let navigate = useNavigate();

    return (
        <div className="body">
            <Toaster />
            <div className="row-responsive-centre-horiz">
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
            </div>
        </div>
    )
}