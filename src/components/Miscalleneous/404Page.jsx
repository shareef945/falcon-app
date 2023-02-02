import { useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import speed from '../utils/404-page.json';
import Lottie from 'lottie-react';
export default function NotFound() {

    let navigate = useNavigate();

    const lottieRef = useRef();

    useEffect(() => {
        lottieRef.current.setSpeed(2);
        document.title = "Page Not Found";
    });

    return (
        <div className="overlay-container">
            <div style={{ position: "absolute", margin: 64 }}>
                <Lottie animationData={speed} lottieRef={lottieRef} style={{ height: "300px", width: "300px" }} />
                <h2>Oops! You seem to be lost.</h2>
                <Button onClick={() => {
                    navigate('/');
                }}>
                    Take me home
                </Button>
            </div>
        </div>
    )
}