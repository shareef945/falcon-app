import React, { createRef, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { ArrowRight, Camera, HelpCircle, RefreshCw, X, XCircle } from "react-feather";
import { motion } from 'framer-motion';
import { toast, Toaster } from "react-hot-toast";
import { TextField } from "@mui/material";
import { browserName, browserVersion, osName, osVersion } from "react-device-detect";
import Lottie from "lottie-react";
import success from "../utils/success.json";
import { useScreenshot } from "use-react-screenshot";

function SupportBob({ color, user, projectKey }) {
    const ref = createRef(null);
    // first option menu
    const [popup, setPopup] = useState(false);
    // bigger focus nesting into an option
    const [focusId, setFocusId] = useState(null);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [image, takeScreenShot] = useScreenshot();
    const getImage = () => takeScreenShot(ref.current);


    const [submitted, setSubmitted] = useState(false);

    async function newRequest(request) {
        return fetch('https://t6hfvo.deta.dev/api/new-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        }).then(data => data.json()).catch(error => console.log(error));
    }

    async function handleSubmit() {
        if (focusId === 0) {
            if (subject.length > 5 && description.length > 10) {
                const request = {
                    key: crypto.randomUUID().substring(0, 13),
                    type: 'request',
                    subject,
                    description,
                    image,
                    user,
                    device: browserName + " " + browserVersion + ", " + osName + " " + osVersion,
                    notes: [],
                    time: new Date().getTime(),
                    state: 'active',
                    archived: false,
                    opened: false
                };
                const res = await newRequest({ request, projectKey });
                if (res === null) {
                    // request was posted
                    setSubmitted(true);
                    setTimeout(() => {
                        setFocusId(null);
                        setSubmitted(false);
                        setSubject('');
                        setDescription('');
                    }, 4000);
                } else {
                    console.log(res);
                    toast("Support Bob ran into an error submitting the request. Please try again")
                }
            } else {
                toast("Please enter a subject and description.");
            }
        }
    }

    async function sendFeedback() {
        if (focusId === 1) {
            if (description.length > 10) {
                const feedback = {
                    key: crypto.randomUUID().substring(0, 13),
                    type: 'feedback',
                    subject: '',
                    description,
                    user,
                    device: browserName + " " + browserVersion + ", " + osName + " " + osVersion,
                    notes: [],
                    time: new Date().getTime(),
                    state: 'active',
                    archived: false,
                    opened: false
                };
                const res = await newRequest({ feedback, projectKey });
                if (res === null) {
                    // request was posted
                    setSubmitted(true);
                    setTimeout(() => {
                        setFocusId(null);
                        setSubmitted(false);
                        setSubject('');
                        setDescription('');
                    }, 4000);
                } else {
                    console.log(res);
                    toast("Support Bob ran into an error submitting your feedback. Please try again")
                }
            } else {
                toast("Please enter some text 😮");
            }
        }
    }

    return (
        // you must position this component in a div with position fixed and width and height set at 100%
        // this component does not have an email or phone number or first name input so you must pass these when sending the request

        <div ref={ref} style={{ position: 'absolute', bottom: 96, right: 16 }}>
            <Toaster toastOptions={{
                style:
                {
                    fontFamily: "Inter",
                    background: "#F9F3EE",
                    borderRadius: "12px"
                }
            }} />
            <div style={{ maxWidth: 340, gap: 16, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>

                {focusId == 0 ?
                    submitted ?
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                background: "#f3f3f3",
                                alignItems: 'center',
                                textAlign: 'center',
                                padding: 16,
                                gap: 16,
                                borderRadius: 16
                            }}>
                            <Lottie
                                animationData={success}
                                loop='false'
                                style={{
                                    height: 100,
                                    width: 100
                                }}
                            />
                            <p>Your request has been submitted. You'll hear back as soon as possible.</p>
                        </div>
                        :
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <X
                                onClick={() => {
                                    setFocusId(null);
                                }}
                                style={{ cursor: "pointer", marginLeft: "auto", marginBottom: -12, zIndex: 1, background: "red", color: "white", borderRadius: 16, padding: 2 }} />

                            <motion.div
                                initial={{ y: 16 }}
                                animate={{ y: 0 }}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    background: "#f3f3f3",
                                    padding: 16,
                                    gap: 16,
                                    borderRadius: 16
                                }}
                            >
                                <h3>Leave us a message</h3>
                                <p><b>Subject</b></p>
                                <TextField
                                    multiline='true'
                                    maxRows={3}
                                    value={subject}
                                    onChange={(e) => {
                                        setSubject(e.target.value);
                                    }}
                                    style={{ background: "white", borderRadius: "4px" }} />

                                <p><b>Description</b></p>
                                <p>Please describe your request in as much detail as you can. We'll be in touch with you as soon as possible</p>
                                <TextField
                                    multiline='true' Ï
                                    minRows={3}
                                    maxRows={6}
                                    value={description}
                                    type='text'
                                    onChange={(e) => {
                                        setDescription(e.target.value);
                                    }}
                                    style={{
                                        background: "white", width: 300, minHeight: 50
                                    }} />
                                <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, flexDirection: 'row' }}>
                                    {image ?
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <RefreshCw
                                            size={12}
                                                onClick={() => {
                                                    getImage();
                                                }}
                                                style={{ cursor: "pointer", marginLeft: "auto", marginTop: -8, zIndex: 1, background: "red", color: "white", borderRadius: 16, padding: 2 }} />

                                            <img width={32} height={32} src={image} />
                                        </div>
                                        :
                                        <Camera
                                            onClick={() => { getImage() }}
                                            style={{ cursor: 'pointer', borderRadius: 12, padding: 8, background: "#f5cac3", color: '#f7ede2', fill: 'black' }} />
                                    } <Button
                                        onClick={() => {
                                            handleSubmit();
                                        }}
                                        style={{ borderRadius: 12, width: '100%', background: "#2A2550", color: "white" }}>
                                        Send
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    : focusId == 1 ?
                        submitted ?
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    background: "#f3f3f3",
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    padding: 16,
                                    gap: 16,
                                    borderRadius: 16
                                }}>
                                <Lottie
                                    animationData={success}
                                    loop='false'
                                    style={{
                                        height: 100,
                                        width: 100
                                    }}
                                />
                                <p>Thanks for your feedback. Your thoughts help make the service better. We'll be in touch if we need to learn more.</p>
                            </div>
                            :
                            <motion.div
                                initial={{ y: 16 }}
                                animate={{ y: 0 }}
                                style={{ display: "flex", flexDirection: "column" }}>
                                <X
                                    onClick={() => {
                                        setFocusId(null);
                                    }}
                                    style={{ cursor: "pointer", marginLeft: "auto", marginBottom: -12, zIndex: 1, background: "red", color: "white", borderRadius: 16, padding: 2 }} />

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        background: "#f3f3f3",
                                        padding: 16,
                                        gap: 16,
                                        borderRadius: 16
                                    }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'baseline', marginBottom: 0 }}><p><b>Share your thoughts</b></p><h2>💡</h2></div>
                                    <TextField
                                        multiline='true' Ï
                                        minRows={3}
                                        maxRows={6}
                                        value={description}
                                        type='text'
                                        onChange={(e) => {
                                            setDescription(e.target.value);
                                        }}
                                        style={{
                                            background: "white", width: 300, minHeight: 50, borderRadius: "4px"
                                        }} />
                                    <Button
                                        onClick={() => {
                                            sendFeedback();
                                        }}
                                        style={{ borderRadius: 32, background: "#2A2550", color: "white" }}>
                                        Send
                                    </Button>

                                </div>
                            </motion.div>
                        :
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {popup ? <motion.div
                                initial={{ y: 16 }}
                                animate={{ y: 0 }}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    background: "#f3f3f3",
                                    padding: 16,
                                    gap: 8,
                                    borderRadius: 16
                                }}
                            >
                                <p
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setFocusId(0);
                                    }}>Contact us</p>
                                <p
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setFocusId(1);
                                    }}>Leave some feedback</p>
                            </motion.div>
                                :
                                ""}
                            <motion.div style={{ marginLeft: 'auto' }}>
                                <Button style={{ borderRadius: 32, background: "#2A2550", color: "white" }}
                                    onClick={() => {
                                        setPopup(!popup);
                                    }}>
                                    <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                                        {popup ? <XCircle /> : <HelpCircle />}
                                        <p>{popup ? "Close" : "Support"}</p>
                                    </div>
                                </Button>
                            </motion.div>
                        </div>
                }
            </div>
        </div>
    )
}

export default SupportBob;