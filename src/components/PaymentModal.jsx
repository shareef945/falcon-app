import { Radio, TextField } from "@mui/material";
import React from "react";
import { useState } from "react";
import { Button } from "react-bootstrap";
import Alert from "react-bootstrap/Alert";
import { motion } from "framer-motion";
import { AlertOctagon, CreditCard, Plus, PlusSquare, X } from "react-feather";
import { prettifyNumber } from "./utils/UsefulFunctions";
import { usePaystackPayment } from "react-paystack";
import { Warning } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { BeatLoader } from "react-spinners";
import Lottie from "lottie-react";
import success from "./utils/success.json";
import { sendSMS } from "./utils/TwilioFunctions";

export default function PaymentModal({
  selectedCard,
  customer,
  resetCount,
  callback,
}) {
  // console.log(selectedCard)
  // this wouldn't work with non ghana country codes or 2 digit country codes e.g +44
  let phone =
    "0" +
    customer["Phone Number"].substring(4, customer["Phone Number"].length - 1);
  const [number, setNumber] = useState(phone);
  const [paymentMethods] = useState(customer["Payment Details"]);
  const [preferredPaymentMethod, setPaymentMethod] = useState(null);
  const [nopaymentmethodset, setNoPaymentMethodError] = useState(false);
  const networks = [
    { provider: "MTN", code: "mtn" },
    { provider: "Vodafone", code: "vod" },
    { provider: "Airtel/Tigo", code: "tgo" },
  ];
  const [network, setNetwork] = useState(networks[0].code);
  // TODO: don't need to display mobile money UI, init paystack modal instead
  // console.log(customer);
  // the test mobile money number returns the object you will expect at your webhook
  // let mobile_money = {
  //     "phone": '0551234987',
  //     "provider": 'mtn'
  // }
  const [paymentAmount, setpaymentAmount] = useState(
    selectedCard["Installment Amount"]
  );
  let paystack_config = {
    reference: new Date().getTime().toString(),
    email: customer["Email Address"],
    amount: 100 * paymentAmount,
    currency: "GHS",
    publicKey: process.env.REACT_APP_PAYSTACK_TEST_PUBLIC_KEY,
  };

  const handleChange = (event) => {
    if (nopaymentmethodset) {
      setNoPaymentMethodError(false);
    } else {
      const option = paymentMethods.find(
        (option) => option.authorization_code === event.target.value
      );
      setPaymentMethod(option);
    }
  };

  const [working, setWorking] = useState(false);
  const [paymentMade, setPaymentMade] = useState(false);

  function closeCard() {
    resetCount();
    setWorking(false);
    setPaymentMade(true);
    setTimeout(() => {
      callback();
    }, 3000);
  }

  // api call to paystack to charge a saved card
  async function chargeAuthorization(params) {
    return fetch("https://api.paystack.co/transaction/charge_authorization", {
      method: "POST",
      port: 443,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_PAYSTACK_TEST_SECRET}`,
      },
      body: JSON.stringify(params),
    })
      .then((data) => data.json())
      .catch((err) => {
        err.json();
        console.log(err);
      });
  }

  // make the api call to charge the specified card (this api handles transactions posting and resolving the installment)
  async function startCharge() {
    setWorking(true);
    const transaction = await chargeAuthorization({
      authorization_code: preferredPaymentMethod.authorization_code,
      email: preferredPaymentMethod.email,
      amount: paymentAmount * 100,
    });
    const amount_paid = transaction.data.amount / 100;
    const balance_pre_transaction = selectedCard["Balance"];
    // you do not need to verify the transaction, just post this charge as a transaction to paystack
    if (transaction.data.status === "success") {
      // post the transaction to the api if successful
      const transactionData = {
        "Transaction ID": transaction.data.id,
        "Customer ID": customer["_id"],
        "Product ID": selectedCard["_id"],
        Amount: amount_paid,
        Currency: "GHS",
        "Paystact Reference": transaction,
        Date: new Date().getTime().toString(),
        "Balance Post Transaction":
          parseInt(balance_pre_transaction) - amount_paid,
      };

      // post to transaction api
      const transactionUpdates = await postTransaction(transactionData);
      if (transactionUpdates?.Amount) {
        // post successful
        console.log("Transaction posted");
      } else {
        // post failed
        // retry
        const transactionUpdates2 = await postTransaction(transactionData);
        // todo: stop a recursive loop going on
      }

      // await sendSMS(textBody, customer["Phone Number"]);
      // update product balance field with balance - amount_paid
      const productUpdate = await patchProduct({
        Balance: parseInt(balance_pre_transaction) - amount_paid,
      });
      //    console.log(productUpdate.Balance, balance_pre_transaction, amount_paid);
      if (productUpdate?.Balance) {
        // post succesful
        console.log("Balance updated");
        closeCard();
      } else {
        // post failed
        // retry
        toast(
          "Your payment has been successful but something went wrong with updating your balance. We're just retrying a background task. Please don't close this tab."
        );
        const productUpdate2 = await patchProduct({
          Balance: parseInt(balance_pre_transaction) - amount_paid,
        });
      }
    } else {
      setWorking(false);
      alert(
        "Your transaction didn't go through. Please try again in a few minutes."
      );
    }
  }

  async function postTransaction(transactionData) {
    return fetch(process.env.REACT_APP_API_URL + "transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionData),
    })
      .then((data) => data.json())
      .catch((err) => {
        err.json();
        console.log(err);
      });
  }

  async function patchProduct(productUpdate) {
    return fetch(
      process.env.REACT_APP_API_URL + "products/" + selectedCard["_id"],
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productUpdate),
      }
    )
      .then((data) => data.json())
      .catch((err) => {
        err.json();
        console.log(err);
      });
  }

  // api call to paystack to verify a transaction
  async function getTransaction(transactionId) {
    return fetch(
      "https://api.paystack.co/transaction/verify/" + transactionId,
      {
        method: "GET",
        port: 443,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_PAYSTACK_TEST_SECRET}`,
        },
      }
    )
      .then((data) => data.json())
      .catch((err) => {
        err.json();
        console.log(err);
      });
  }

  // processing transaction object received from paystack api
  async function figureOutTransaction(reference) {
    setWorking(true);
    // call the api and get the object
    const transaction = await getTransaction(reference.trxref);
    const amount_paid = transaction.data.amount / 100;
    const balance_pre_transaction = selectedCard["Balance"];
    // console.log(transaction);
    if (transaction.data.status === "success") {
      toast("Thanks for your payment");
      // post the transaction to the api if successful
      const transactionData = {
        "Transaction ID": transaction.data.id,
        "Customer ID": customer["_id"],
        "Product ID": selectedCard["_id"],
        Amount: amount_paid,
        Currency: "GHS",
        "Paystact Reference": transaction,
        Date: new Date().getTime().toString(),
        "Balance Post Transaction":
          parseInt(balance_pre_transaction) - amount_paid,
      };
      const textBody = `Dear ${
        customer["First Name"]
      }, your payment of ₵${prettifyNumber(
        paymentAmount
      )} was received for product ${
        selectedCard["Product ID"]
      }. You've paid ₵${prettifyNumber(
        selectedCard["Principal"] +
          selectedCard["Interest"] -
          (parseInt(balance_pre_transaction) - amount_paid)
      )} to date and your balance is ${
        parseInt(balance_pre_transaction) - amount_paid
      }`;
      sendSMS(textBody, customer["Phone Number"]);

      // post to transaction api
      const transactionUpdates = await postTransaction(transactionData);
      if (transactionUpdates?.Amount) {
        // post successful
        console.log("Transaction posted");
      } else {
        // post failed
        // retry
        const transactionUpdates2 = await postTransaction(transactionData);
        // todo: stop a recursive loop going on
      }
      // update product balance field with balance - amount_paid
      const productUpdate = await patchProduct({
        Balance: parseInt(balance_pre_transaction) - amount_paid,
      });
      if (productUpdate?.Balance) {
        // post succesful
        console.log("Balance updated");
        closeCard();
      } else {
        // post failed
        //retry
        toast(
          "Your payment has been successful but something went wrong with updating your balance. We're just retrying a background task. Please don't close this tab."
        );
        const productUpdate2 = await patchProduct({
          Balance: parseInt(balance_pre_transaction) - amount_paid,
        });
      }
    } else {
      alert(
        "Your transaction didn't go through. Please try again in a few minutes."
      );
      setWorking(false);
    }
  }

  // on success paystack popup callback
  const onPayStackSuccess = (reference) => {
    figureOutTransaction(reference);
  };

  // on paystack popup closure
  const onPaystackClose = () => {
    console.log("paystack pop up closed");
  };

  const [x, setX] = useState(0);

  //if user choses to use a new card, the paystack component get used instead and
  // onSuccess calls the falcon transaction api and resolves the installment

  // paystack component
  const PaystackMobileMoneyHook = () => {
    const initializePayment = usePaystackPayment(paystack_config);
    return (
      <button
        style={{ borderRadius: 32, backgroundColor: "purple" }}
        className="primary-btn"
        onClick={() => {
          initializePayment(onPayStackSuccess, onPaystackClose);
        }}>
        <b>Pay with a new method</b>
      </button>
    );
  };

  async function validate() {
    if (preferredPaymentMethod !== null) {
      if (nopaymentmethodset === true) {
        setNoPaymentMethodError(false);
      } else {
        // charge
        startCharge();
      }
    } else {
      if (nopaymentmethodset === false) {
        setNoPaymentMethodError(true);
      } else {
        // already set, shake
        setX(-16);
        setTimeout(() => {
          setX(0);
          setTimeout(() => {
            setX(16);
            setTimeout(() => {
              setX(0);
            }, 50);
          }, 50);
        }, 50);
      }
    }
  }

  return (
    <motion.div initial={{ y: 32 }} animate={{ y: 0 }}>
      {working ? (
        <BeatLoader />
      ) : paymentMade ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#f3f3f3",
            alignItems: "center",
            textAlign: "center",
            padding: 16,
            gap: 16,
            borderRadius: 16,
          }}>
          <Lottie
            animationData={success}
            loop="false"
            style={{
              height: 100,
              width: 100,
            }}
          />
          <p>Thank you for your payment 🎉</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <X
            onClick={() => {
              callback();
            }}
            style={{
              cursor: "pointer",
              marginLeft: "auto",
              marginBottom: -12,
              zIndex: 1,
              background: "red",
              color: "white",
              borderRadius: 16,
              padding: 2,
            }}
          />

          <div className="card-align-vertical" style={{ borderRadius: 18 }}>
            <h3>Make a payment</h3>

            <div>
              <div className="edit-text-container">
                <p className="stickyText">₵</p>
                <input
                  placeholder={paymentAmount}
                  clasname="input"
                  type="numeric"
                  name="amount"
                  onChange={(e) => {
                    setpaymentAmount(e.target.value);
                  }}
                />
              </div>
              <p style={{ fontSize: 11, marginTop: 4, color: "grey" }}>
                {" "}
                You can edit the amount in this field{" "}
              </p>
            </div>

            <h3 style={{ fontSize: 14 }}>Pay with a saved payment method</h3>
            {nopaymentmethodset ? (
              <motion.div
                initial={{ x: 16 }}
                animate={{ x }}
                layout
                transition={{
                  type: "spring",
                  stiffness: 700,
                  damping: 30,
                }}
                className="icon-text"
                style={{
                  padding: "12px 6px",
                  borderRadius: 8,
                  backgroundColor: "rgba(255, 0, 0, 0.2)",
                }}>
                <AlertOctagon />
                <p>Please choose an option:</p>
              </motion.div>
            ) : (
              ""
            )}
            {paymentMethods.map((method, index) => (
              <div
                style={{
                  background: "#F6F6F6",
                  borderRadius: 12,
                  display: "flex",
                  flexDirection: "row",
                  gap: 16,
                  padding: "4px 6px",
                  alignItems: "center",
                }}>
                <CreditCard />
                <p>
                  {method.brand.toUpperCase()} ending in {method.last4}
                </p>
                <Radio
                  type="radio"
                  name={method.last4}
                  value={method.authorization_code}
                  checked={method === preferredPaymentMethod}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Button
                onClick={() => {
                  validate();
                }}
                style={{ borderRadius: 32 }}
                className="primary-btn">
                <b>
                  {preferredPaymentMethod === "Pay with a new method" ||
                  preferredPaymentMethod === "Pay with mobile money"
                    ? "Proceed"
                    : "Pay"}
                </b>
              </Button>

              <h4 style={{ marginLeft: "auto", marginRight: "auto" }}>OR</h4>

              <PaystackMobileMoneyHook />

              <p style={{ fontSize: 14, textAlign: "center", color: "grey" }}>
                This includes paying with mobile money or a new card.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
