import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import React, { useState } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import {
  BrowserRouter as Router, Navigate, //replaces "Switch" used till v5
  Route, Routes
} from 'react-router-dom';
import NotFound from './components/404Page';
import AuthenticatedNav from './components/AuthenticatedNav';
import Dashboard from './components/Dashboard';
import ManageRequests from './components/ManageRequests';
import ModifyRequest from './components/ModifyRequest';
import LandingPage from './components/Onboarding/LandingPage';
import MoreDetails from './components/Onboarding/MoreDetails';
import CarFinance2 from './components/ReqAProd/AssetFinance/CarFinance2';
import CarFinance4 from './components/ReqAProd/AssetFinance/CarFinance4';
import BusinessLoan2 from './components/ReqAProd/Commercial/BusinessLoan2';
import BusinessLoan4 from './components/ReqAProd/Commercial/BusinessLoan4';
import ProdReq2 from './components/ReqAProd/PersonalLoans/ProdReq2';
import ProdReq4 from './components/ReqAProd/PersonalLoans/ProdReq4';
import ProdReq1 from './components/ReqAProd/ProdReq1';
import ProdReq5 from './components/ReqAProd/ProdReq5';
import SupportPage from './components/SupportPage';
import SupportPosts from './components/SupportPosts';

const app = initializeApp({
  apiKey: "AIzaSyBT13svu-FBHm8DbmMxRmPUkzzfm9vf-lA",
  authDomain: "falcon-cda80.firebaseapp.com",
  projectId: "falcon-cda80",
  storageBucket: "falcon-cda80.appspot.com",
  messagingSenderId: "384297481833",
  appId: "1:384297481833:web:e7cc3ffc18864a2b1194f8",
  measurementId: "G-4V172MEF14"
});
const auth = getAuth(app);

const offlineToken = localStorage.getItem("falcon-auth-token");


function App() {
  console.log("firebase auth last renewed: " + localStorage.getItem("falcon-auth-stamp"));

  const [user] = useAuthState(auth);

  // firebase tokens last indefinitely, so some logic needs to track how long a user has been signed in, and log them out
  // this should probably track activity, but for easier code, i'm just tracking when last they signed in
  // and if has been more than two days, force log out
  if (localStorage.getItem("falcon-auth-stamp") !== "null") {

    const currentTime = Math.floor(Date.now() / 1000);
    // there are 86400 seconds in one day, 172800 in two days
    if ((currentTime - (localStorage.getItem("falcon-auth-stamp"))) > 172800) {
      // forced log out
      signOut(auth);
      localStorage.removeItem("falcon-auth-token");
    }
  } else {
    console.log("firebase auth last renewed is null: " + localStorage.getItem("falcon-auth-stamp"));

  }

  // Authentication Guard
 
  // UPDATE: THIS IS NOW JUST A TAG FOR THE NAV TO SHOW OR NOT SHOW DEPENDING ON AUTH STATUS
  function RequireAuth({ children }) {
    return localStorage.getItem("falcon-auth-token") ? children : "";
  }

  // NEW, please wrapp protected route elements in <Private> </Private>
  // Wrapping route element tags in <Private></Private> makes router useful in unauthenticated states
  function Private({ Component }) {
    return localStorage.getItem("falcon-auth-token") ? <Component /> : <Navigate to="/landing-page" />
  }

  return (
    <div className="App">

      {/* {localStorage.getItem("falcon-auth-token") ? "" : <Nav />} */}

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
          <Route path='/loans/feedback-screen' element={<Private><ProdReq5 /></Private>} />
          {/* Support Page */}
          <Route path='/support' element={<Private><SupportPage /></Private>} />
          <Route path='/support/:category' element={<Private><SupportPosts /></Private>} />
          {/* Account Page */}
          {/* Onboarding */}
          <Route path='/landing-page' element={<LandingPage />} />
          <Route path='/signupdetails' element={<MoreDetails />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Router>

    </div>
  );
}

function SignIn() {

  // TODO: Expand to match figma design and include tie in with mongo db,
  // by fetching usercredential.user.uid and storing in mongo db against relevant user's db

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  function signInWithFirebase() {
    signInWithEmailAndPassword(auth, email, password).then((UserCredential) => {
      console.log(UserCredential.user.email + " signed in to Falcon support at " + Math.floor(Date.now() / 1000));
      localStorage.setItem("falcon-auth-stamp", Math.floor(Date.now() / 1000));
      localStorage.setItem("falcon-auth-token", UserCredential.user);
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
  }

  return (
    <div>
      <div className='sign-in-body'>
        <h1 style={{ fontSize: "72px", marginBottom: "0" }}>👮</h1>
        <h2 style={{ color: "white" }}>Hi there friend, this website is still under development. You'll need to sign in to access it</h2>

        <div className='signin-form'>
          <input type='email' placeholder='email@domain.com' value={email} onChange={(e) => { setEmail(e.target.value) }} />
          <input type='password' placeholder='****' name="password" value={password} onChange={(e) => { setPassword(e.target.value) }} />
          <button className="primary-btn" onClick={signInWithFirebase}>Submit</button>

        </div>

      </div>
    </div>
  )
}


export default App;