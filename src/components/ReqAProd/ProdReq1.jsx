import React from 'react'
import ButtonGroup1 from './ButtonGroup1'
import personalfinance from '../../img/personalfinance.webp'


function ProdReq1 () {

    
    return (
        <div>
            <div className='titlebar'>
                <a href="/">  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </a>
                <h2>I want to get a:</h2>
            </div>
            <div className='row'>
            <div className='extra-margin-left'>
                <ButtonGroup1 
                buttons={["Personal Loan", "Asset Finance", "Commercial Loan"]}
                />
            </div>
            <figure>
                <img src={personalfinance}
                alt='Personal loan'
                width={350}/>
            </figure>
        </div>
    </div>
    )
}
export default ProdReq1