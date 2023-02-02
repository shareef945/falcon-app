import React from 'react';
import {
  BrowserRouter as Router, Navigate,
  Route, Routes
} from 'react-router-dom';
import NotFound from './components/Miscalleneous/404Page';
import Account from './components/Account';
import AuthenticatedNav from './components/Miscalleneous/AuthenticatedNav';
import Dashboard from './components/Dashboard';
import ChangeRepaymentCard from './components/ManageLoan/ChangeRepaymentCard';
import ManageLoan from './components/ManageLoan/ManageLoan';
import ManageRequests from './components/RequestsAndProducts/ManageRequests';
import ModifyRequest from './components/RequestsAndProducts/ModifyRequest';
import LandingPage from './components/Onboarding/LandingPage';
import MoreDetails from './components/Onboarding/MoreDetails';
import CarFinance2 from './components/ReqAProd/AssetFinance/CarFinance2';
import CarFinance4 from './components/ReqAProd/AssetFinance/CarFinance4';
import BusinessLoan2 from './components/ReqAProd/Commercial/BusinessLoan2';
import BusinessLoan4 from './components/ReqAProd/Commercial/BusinessLoan4';
import ProdReq2 from './components/ReqAProd/PersonalLoans/ProdReq2';
import ProdReq4 from './components/ReqAProd/PersonalLoans/ProdReq4';
import ProdReq1 from './components/ReqAProd/ProdReq1';
import SupportPage from './components/Support/SupportPage';
import SupportPost from './components/Support/SupportPost';
import SupportPosts from './components/Support/SupportPosts';
import TransactionPage from "./components/RequestsAndProducts/TransactionPage";
import PasswordReset from './components/utils/PasswordReset';
import ReactGA from "react-ga4";

try {
  ReactGA.initialize("G-4V172MEF14", {
    gaOptions: {
      debug_mode: true,
    },
    gtagOptions: {
      debug_mode: true,
    },
  });
} catch (err) {
  console.error(err);
}

// can either pass props back to App JS or just reload the page
export function reloadApp() {
  window.location.reload(false);
}



function App() {

  // this should probably track activity, but for easier code, i'm just tracking when last they signed in
  // and if has been more than two days, force log out
  if (sessionStorage.getItem("falcon-auth-stamp") !== "null") {

    const currentTime = Math.floor(Date.now() / 1000);
    // there are 1800 seconds in one hour, 86400 seconds in one day, 172800 in two days
    if ((currentTime - (sessionStorage.getItem("falcon-auth-stamp"))) > 1800) {
      // forced log out
      sessionStorage.removeItem("falcon-auth-token");

    }
  } else {
    // console.log("auth token last renewed is null: ");

  }

  // Authentication Guard

  // UPDATE: THIS IS NOW JUST A TAG FOR THE NAV TO SHOW OR NOT SHOW DEPENDING ON AUTH STATUS
  function RequireAuth({ children }) {
    return sessionStorage.getItem("falcon-auth-token") ? children : "";
  }

  // NEW, please wrapp protected route elements in <Private> </Private>
  // Wrapping route element tags in <Private></Private> makes router useful in unauthenticated states
  function Private({ children }) {
    return sessionStorage.getItem("falcon-auth-token") ? children : <Navigate to="/landing-page" />
  }

  return (
    <div className="App">

      <Router>
        <RequireAuth>
          <AuthenticatedNav />
        </RequireAuth>
        <Routes>
          <Route path="/" element={<Private><Dashboard /></Private>} />
          {/* Dashboard sub components including managing products etc, or maybe separate pages tbc */}
          {/* Managing Requests */}
          <Route path='managerequests/' element={
            <Private> <ManageRequests /> </Private>} />
          <Route path='/modifyrequest/:requestid' element={<Private><ModifyRequest /></Private>} />
          {/* Request a loan */}
          <Route path="requestaloan" element={<Private><ProdReq1 /></Private>} />
          <Route path="/loans/personal-loan-caclulator" element={<Private><ProdReq2 /></Private>} />
          <Route path='/loans/submit-personal' element={<Private><ProdReq4 /></Private>} />
          <Route path='/loans/asset-loan-calculator' element={<Private><CarFinance2 /></Private>} />
          <Route path='/loans/submit-asset' element={<Private><CarFinance4 /></Private>} />
          <Route path='/loans/business-loan-calculator' element={<Private><BusinessLoan2 /></Private>} />
          <Route path='/loans/submit-commercial' element={<Private><BusinessLoan4 /></Private>} />
          {/* Support Page */}
          <Route path='/support' element={<SupportPage />} />
          <Route path='/support/:category' element={<SupportPosts />} />
          <Route path='/support/:category/:title' element={<SupportPost />} />
          {/* Account Page */}
          <Route path='/account' element={<Private><Account /></Private>} />
          <Route path='/transactions' element={<Private><TransactionPage /></Private>} />
          <Route path='/manage-loan' element={<Private><ManageLoan /></Private>} />
          <Route path='/change-repayment-card' element={<Private><ChangeRepaymentCard /></Private>} />
          <Route path='/reset-password/:token/:email' element={<PasswordReset />} />

          {/* Onboarding */}
          <Route path='/landing-page' element={<LandingPage />} />
          <Route path='/signupdetails' element={<MoreDetails />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Router>

    </div>
  );
}

export default App;
