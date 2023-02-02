import React, { useState } from 'react';
import { Link } from "react-router-dom";

const ButtonGroup1 = ({ buttons }) => {
  const [clickedId, setClickedId] = useState(-1);
  const links = ['/loans/personal-loan-caclulator', '/loans/asset-loan-calculator', '/loans/business-loan-calculator']
  const handleClick = (event, id) => {
    setClickedId(id);
    // navigate to next page based on id
  };
  const subtitles = ['No collateral required.', 'Loan is secured against the asset.', 'No collateral required.']
  return (
    <>
      {buttons.map((buttonLabel, i) => (
        <Link to={links[i]}
          className="linksnodecor">
          <div className={i === clickedId ? "loanBtnGroupNormal loanBtnGroupActive" : "loanBtnGroupNormal"}
            onClick={(event) => handleClick(event, i)}>
            <div key={i}
              name={buttonLabel} >
              {buttonLabel}
            </div>
            <p>{subtitles[i]}</p>
          </div>
        </Link>
      ))}
    </>
  );
};

export default ButtonGroup1