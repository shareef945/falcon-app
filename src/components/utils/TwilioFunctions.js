// const accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);

// // export function sendSMS(body, to) {
// //     return client.messages
// //     .create({
// //         body: body,
// //         from: process.env.REACT_APP_TWILIO_NUMBER,
// //         to: to
// //     }).then(message => {console.log(message)});
// // }

export async function sendSMS(body, to) {
    return fetch(process.env.REACT_APP_API_URL + 'send-sms', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({body, to})
    })
      .then((data) => data.json())
      .catch((err) => {
        err.json();
        console.log(err);
      });
}