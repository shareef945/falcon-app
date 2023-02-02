import React from "react";
import { PieChart } from 'react-minimal-pie-chart';
import { prettifyNumber } from "./UsefulFunctions";

export const LoanPreviewContainer = ({ type, count, tenure, tenureunit, principal, interest, interestpercent, totalcost, repayment, repaymentFrequency }) => (
    <div className='previewContainer'>
        <h3 className={parseInt(count) > 0 ? "hidden" : "shown"}>Start typing a loan amount to get started</h3>
        <h3 className={parseInt(count) > 0 ? "shown" : "hidden"}>You could get a {tenure} {tenureunit} {type} of</h3>

        <h3 className={parseInt(count) > 0 ? "shownbold" : "hidden"}>₵{prettifyNumber(parseInt(principal))}</h3>

        <PieChart className='chart'
            data={[
                { value: parseInt(principal), color: '#2A2550' },
                { value: parseInt(interest), color: '#FF7700' },
            ]}
            lineWidth="50"
        />

        <div className='col-start' style={{display:"flex", gap: "16px", flexDirection:"row"}}>
            <div>
                <p className='interest'>Interest</p>
                <p className='principal'>Principal</p>
                <p className='totalcost'>Total cost</p>
            </div>
            <div>
                <p className='interest'>₵{prettifyNumber(parseInt(interest))}</p>
                <p className='principal'>₵{prettifyNumber(parseInt(principal))}</p>
                <p className='totalcost'>₵{prettifyNumber(parseInt(totalcost))}</p>
            </div>
            <p className='interest'>{interestpercent}%</p>
        </div>

        <p className={parseInt(count) > 0 ? "calcExplainer" : "hidden"}>
            A loan of ₵{prettifyNumber(principal)} over {tenure} {tenureunit} could cost you ₵{prettifyNumber(repayment)} per {repaymentFrequency} at a {interestpercent}% interest rate.
            The total cost after {tenure} {tenureunit} would be ₵{prettifyNumber(totalcost)} which includes the ₵{prettifyNumber(interest)} in interest.<br />Subject to approval. Terms apply.</p>

    </div>

);

