import React, { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { Eye, EyeOff, MessageCircle, Navigation } from "react-feather";
import { Gradient } from "../utils/Gradient";
import Lottie from "lottie-react";
import zoomlens from "../utils/zoom-lens.json";
import speed from "../utils/speed.json";
import flyingwallet from "../utils/flying-wallet.json";
import settingsanim from "../utils/settings-anim.json";
import toast, { Toaster } from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { reloadApp } from "../../App";
import { Checkbox } from "@mui/material";
import { BeatLoader } from "react-spinners";
import { HideImage } from "@mui/icons-material";
import ReactGA from "react-ga4";
// ReactGA.initialize("G-4V172MEF14");

const gradient = new Gradient();

export default function LandingPage() {
  let navigate = useNavigate();
  const lottieRef = useRef();
  const menuItems = ["Log in", "Sign up"];
  const [forgotPassword, setForgotPassword] = useState(false);
  const [menuItem, setMenuItem] = useState(menuItems[0]);
  let emailRegex = new RegExp(
    "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])"
  );
  const [working, setWorking] = useState(false);

  // use effect allows us to update ui things in the background
  useEffect(() => {
    // console.log(ref);
    lottieRef.current.setSpeed(2);
    gradient.initGradient("#gradient-canvas");

    // const keyDownHandler = event => {
    //     console.log('User pressed: ', event.key);
    //     if (event.key === 'Enter') {
    //         event.preventDefault();
    //         // 👇️ your logic here
    //         keydownAction();
    //     }
    // };

    // document.addEventListener('keydown', keyDownHandler);

    // return () => { document.removeEventListener('keydown', keyDownHandler) }
  });

  async function checkCustomer(credentials) {
    //https://8k7pdn.deta.dev/api/customer
    // "http://localhost:8443/api/login"
    return fetch(process.env.REACT_APP_API_URL + "avoid-duplicates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
      .then((data) => data.json())
      .catch((error) => {
        console.log(error);
        // Send a custom event
        ReactGA.event({
          category: "error",
          action: "checkCustomer",
          label: error,
        });
      });
  }

  async function checkCustomerFunction(
    email,
    number,
    name,
    password,
    countryCode
  ) {
    const result = await checkCustomer({ email: email });

    // if else to check if email exists on system, if true reject sign up
    // else,
    // push details to next screen and request OTP

    if (result.exists == true) {
      toast("An account with that email already exists!");
    } else {
      navigate("/signupdetails", {
        state: {
          account_details: {
            email,
            number: countryCode.concat(number),
            name,
            password,
          },
        },
      });
    }
  }

  function SignUp() {
    const countryCodes = ["+233", "+44"];
    const [email, setEmail] = useState("");
    const [number, setNumber] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [validated, setValidated] = useState(false);
    const [countryCode, setCountryCode] = useState(countryCodes[0]);
    const [showPassword, setShowPassword] = useState(false);

    const phoneNumberRegex = new RegExp(/^\+?[1-9][0-9]{11,14}$/);
    const passwordRegex = new RegExp(/^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/);

    function validateFields() {
      const names = name.split(" ");
      if (number.substring(0) == "0") {
        const currentNumber = number;
        setNumber(currentNumber.substring(0, currentNumber.length - 1));
      }
      if (phoneNumberRegex.test(countryCode.concat(number))) {
        if (emailRegex.test(email)) {
          if (password.length >= 4) {
            // check name
            if (names.length >= 2) {
              checkCustomerFunction(email, number, name, password, countryCode);
            } else if (names.length == 1) {
              toast("Please make sure you've entered your last name.");
            } else {
              toast(
                "Please make sure you've entered your first name and last name."
              );
            }
          } else {
            toast(
              "Please make sure your password is at least 8 characters in length and has at least one digit and letter."
            );
          }
        } else {
          toast("Please make sure your email is valid");
        }
      } else {
        toast(
          "Please make sure your phone number is formatted correctly and is complete, e.g +2332345678"
        );
      }
    }

    return (
      <div className="signin-form">
        <Toaster
          toastOptions={{
            style: {
              border: "1px solid #713200",
              padding: "16px",
              color: "#713200",
              fontFamily: "-apple-system",
            },
          }}
        />
        <div className="input-container">
          <p>Full Name</p>
          <input
            className="edit-text-container"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </div>
        <div className="input-container" style={{ maxWidth: 200 }}>
          <p>Phone number</p>
          <div className="edit-text-container">
            <select
              className="dropdown"
              style={{ border: "none", background: "transparent", padding: 0 }}
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}>
              {countryCodes.map((value) => (
                <option value={value} key={value}>
                  {value}
                </option>
              ))}
            </select>
            <input
              style={{ maxWidth: 110 }}
              type="numeric"
              placeholder="233243945816"
              value={number}
              onChange={(e) => {
                setNumber(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="input-container">
          <p>Email</p>
          <input
            className="edit-text-container"
            type="email"
            placeholder="email@domain.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <div className="input-container">
          <p>Choose PIN</p>
          <div className="edit-text-container">
            <div className="icon-text">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
              {showPassword ? (
                <Eye
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                />
              ) : (
                <EyeOff
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                />
              )}
            </div>
          </div>
        </div>
        <button
          className="primary-btn"
          onClick={() => {
            validateFields();
          }}>
          Sign Up
        </button>
      </div>
    );
  }

  async function loginUser(credentials) {
    console.log(credentials);
    //https://8k7pdn.deta.dev/api/customer
    // "http://localhost:8443/api/login"
    return fetch(process.env.REACT_APP_API_URL + "login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
      .then((data) => data.json())
      .catch((error) => {
        console.log(error);
        ReactGA.event({
          category: "error",
          action: "loginUser",
          label: error,
        });
      });
  }

  async function resetPasswordsendEmail(credentials) {
    //https://8k7pdn.deta.dev/api/customer
    // "http://localhost:8443/api/login"
    return fetch(process.env.REACT_APP_API_URL + "sendpasswordresetemail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
      .then((data) => data.json())
      .catch((error) => {
        console.log(error);
        ReactGA.event({
          category: "error",
          action: "resetPasswordsendEmail",
          label: error,
        });
      });
  }

  function LogIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [saveDetails, setSaveDetails] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [number, setNumber] = useState("");
    const phoneNumberRegex = new RegExp(/^\+?[1-9][0-9]{11,14}$/);

    async function sendResetEmail() {
      if (emailRegex.test(email) === true) {
        const sent = await resetPasswordsendEmail({
          email,
        });

        // console.log("res: ", sent);
        setForgotPassword(false);
        toast("We've sent you an email with a link to reset your password.");
      }
    }

    async function validateFields() {
      let realnumber = number;
      if (realnumber.substring(0, 1) === "0") {
        let currentNumber = number;
        realnumber = 
          "+233".concat(currentNumber.substring(1, currentNumber.length));
        
        }
        // console.log(realnumber);
      // check valid email with a regex or something
      // api get request, if valid user, localStorage.setItem("falcon-auth-token", userId);
      if (phoneNumberRegex.test(realnumber) === true) {
        if (password.length >= 4) {
          setWorking(true);
          const customer = await loginUser({
            "Phone Number": realnumber,
            password,
          });
          // console.log("login: ", customer);
          if (customer.message === undefined) {
            // store details
            const truncated = {
              _id: customer["_id"],
              "Customer ID": customer["Customer ID"],
              "First Name": customer["First Name"],
              "Last Name": customer["Last Name"],
              "Email Address": customer["Email Address"],
              "Payment Details": customer["Payment Details"],
              "Phone Number": customer["Phone Number"],
              "Home Address": customer["Home Address"],
              DOB: customer.DOB,
              "Government ID Number": customer["Government ID Number"],
              Username: customer["Username"],
              "Registration Date": customer["Registration Date"],
              Products: customer.Products,
            };
            sessionStorage.setItem(
              "falcon-auth-token",
              JSON.stringify(truncated)
            );
            sessionStorage.setItem(
              "falcon-auth-stamp",
              Math.floor(Date.now() / 1000)
            );

            ReactGA.send("logged-in");

            setWorking(false);
            navigate("/");
            reloadApp();
          } else {
            toast("You've entered an incorrect phone number or pin!");
            setTimeout(() => {
              setWorking(false);
            }, 3000);
          }
        } else {
          toast("Please enter a valid pin");
        }
      } else {
        toast("Please enter a valid phone number");
      }
    }

    return (
      <div>
        <Toaster />
        {working ? (
          <BeatLoader />
        ) : forgotPassword ? (
          <div className="signin-form">
            <h3>Reset your PIN</h3>
            <p style={{ maxWidth: "320px" }}>
              Enter the email address associated with your account and we'll
              send you a link to reset your password.
            </p>
            <div className="input-container">
              <p>Email</p>
              <input
                className="edit-text-container"
                type="email"
                placeholder="email@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            <button
              className="primary-btn"
              onClick={() => {
                sendResetEmail();
              }}>
              Continue
            </button>
            <h4
              style={{ cursor: "pointer" }}
              onClick={() => {
                setForgotPassword(false);
              }}
              className="blue-text">
              Back to sign in
            </h4>
          </div>
        ) : (
          <div className="signin-form">
            <Toaster />
            <div className="input-container">
              <p>Phone Number</p>
              <input
                className="edit-text-container"
                type="text"
                placeholder="Enter Phone Number"
                // value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                }}
              />
            </div>
            <div className="input-container">
              <p>PIN</p>
              <div className="edit-text-container">
                <div className="icon-text">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••"
                    name="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                  />
                  {showPassword ? (
                    <Eye
                      onClick={() => {
                        setShowPassword(!showPassword);
                      }}
                    />
                  ) : (
                    <EyeOff
                      onClick={() => {
                        setShowPassword(!showPassword);
                      }}
                    />
                  )}
                </div>
              </div>
              <p
                onClick={() => {
                  setForgotPassword(true);
                }}
                style={{ color: "#FF7700", cursor: "pointer" }}>
                Forgot your PIN?
              </p>
            </div>
            <button
              className="primary-btn"
              onClick={() => {
                validateFields();
              }}>
              Log In
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <canvas id="gradient-canvas" data-transition-in></canvas>

      <div className="landing-hero">
        <div className="landing-hero-nav">
          <h2 className="brand-name">falcon</h2>

          <div
            className="group-btn-row"
            style={{
              marginLeft: "auto",
            }}>
            <h3
              onClick={() => {
                if (menuItem === "Log in") {
                  setMenuItem(menuItems[1]);
                } else {
                  setMenuItem(menuItems[0]);
                }
              }}
              style={{
                color: "white",
                background: "#FFFFFF33",
                padding: "3px 12px",
                borderRadius: "16px",
                cursor: "pointer",
              }}>
              {menuItem}
            </h3>
          </div>
        </div>

        <div
          style={{ alignItems: "baseline", margin: "0" }}
          className="row-responsive">
          <div
            className="input-container"
            style={{
              marginTop: 72,
              marginLeft: "0px",
            }}>
            <h10>Own now, Pay later</h10>

            <p style={{ maxWidth: 600, fontSize: 18 }}>
              We've simplified the loan process so you can sign up, apply for a
              loan and get it in your bank account in as little as an hour.
            </p>
          </div>

          {menuItem === "Log in" ? <SignUp /> : <LogIn />}
        </div>

        <div
          className="input-container"
          style={{
            marginTop: 72,
            gap: 16,
            maxWidth: 700,
          }}>
          <h2>Here's why our customers prefer us</h2>
          <div className="input-container">
            <Lottie
              animationData={speed}
              lottieRef={lottieRef}
              style={{ height: "48px", width: "48px" }}
            />

            <h3>Quick turnaround</h3>
            <p>
              We continue to make our application process efficient and can get
              you a loan in under an hour.<sup>1</sup>
            </p>
          </div>
          <div className="input-container">
            <Lottie
              animationData={zoomlens}
              lottieRef={lottieRef}
              style={{ height: "48px", width: "48px" }}
            />
            <h3>Upfront visibility</h3>
            <p>
              Our loan calculator tells you how much you could get and what your
              monthly or weekly repayments could be.
            </p>
          </div>
          <div className="input-container">
            <Lottie
              animationData={flyingwallet}
              lottieRef={lottieRef}
              style={{ height: "48px", width: "48px" }}
            />
            <h3>Transparent pricing</h3>
            <p>
              Upfront visibility from the calculator and our powerful web
              platform and notifications means you always know what you pay,
              with no hidden charges.
            </p>
          </div>
          <div className="input-container">
            <Lottie
              animationData={settingsanim}
              lottieRef={lottieRef}
              style={{ height: "48px", width: "48px" }}
            />
            <h3>Reliable Tools</h3>
            <p>
              We've made managing a loan convenient for you. Pay off extra at
              any time and adjust your payment details and other items.
            </p>
          </div>
        </div>

        <div className="footer equal-columns">
          <div
            className="input-container"
            style={{ borderRight: "1px #e6ebf1 dashed" }}>
            <h3>falcon</h3>
            <div className="icon-text">
              <Navigation fill="black" size={15} />
              <p>Ghana</p>
            </div>
            <div className="icon-text">
              <MessageCircle fill="black" size={15} />
              <p>English</p>
            </div>
            <p>© 2022 SAI Resources.</p>
          </div>

          <div
            className="input-container"
            style={{
              borderRight: "1px #e6ebf1 dashed",
              paddingLeft: "16px",
            }}>
            <h4>Company</h4>
            <p>About Us</p>
            <p>AML / KYC </p>
          </div>

          <div
            className="input-container"
            style={{
              borderRight: "1px #e6ebf1 dashed",
              paddingLeft: "16px",
            }}>
            <h4>Partner Program</h4>
            <p>About Partnership</p>
            <p>Becoming a Partner</p>
          </div>

          <div
            className="input-container"
            style={{
              paddingLeft: "16px",
            }}>
            <h4>Resources</h4>
            <a className="footer-text" href="/support">
              Support Centre
            </a>
            <a className="footer-text" href="#">
              Terms
            </a>
            <a className="footer-text" href="#">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
