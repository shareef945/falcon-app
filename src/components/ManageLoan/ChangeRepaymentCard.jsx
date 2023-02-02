import { useState } from "react";
import { ArrowLeft } from "react-feather";
import { useLocation } from "react-router-dom";

export default function ChangeRepaymentCard() {
    const selected = useLocation().state.selected;
    const [customer, setCustomer] = useState(JSON.parse(sessionStorage.getItem("falcon-auth-token")));
    const [paymentDetails, setPaymentDetails] = useState(customer["Payment Details"]);
    const [repaymentcard, setRepaymentcard] = useState(selected["Preferred Payment Details"]["Payment Card"]);

    return (
        <div>
            <div className="titlebar" style={{ marginBottom: 16 }}>
                <div className="icon-text">
                    <ArrowLeft /> <p>Back</p>
                </div>
            </div>
            <div className="body-centred">
                <p><b>{repaymentcard.brand.toUpperCase()}</b> ending in {repaymentcard.last4}</p>
                <select className='dropdown'
                    onChange={(e) => {
                        setRepaymentcard(paymentDetails[e.target.selectedIndex])
                    }}>
                    {paymentDetails.map(item => (
                        <option value={item} key={item.id}>
                            {item.brand.toUpperCase() + " card ending in " + item.last4}
                        </option>
                    ))}
                </select>

            </div>
        </div>

    )
}