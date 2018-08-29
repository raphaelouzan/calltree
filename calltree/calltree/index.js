require("./environment.js");
const request = require('request-promise-native');

exports.handler = (event, context, callback) => {
    const TWILIO_ACCOUNT = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_API_KEY = process.env.TWILIO_AUTH_TOKEN;
    const SEND_SMS_FROM = process.env.MY_PHONE_NUMBER;
    const SEND_SMS_TO = '+19178873590';
    

    // get access to the data 
    // if time of event, figure out match of the month
    // text match of the month with quote
    
    return request.post({
            url: `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT}/Messages.json`,
            json: true,
            auth: {
                user: TWILIO_ACCOUNT,
                pass: TWILIO_API_KEY
            },
            form: {
                From: SEND_SMS_FROM,
                To: SEND_SMS_TO,
                Body: `Hey world from lambda`
            }
        })
        .then((data) => {
            console.log(`Sent SMS to ${SEND_SMS_TO}`)
            return callback(null, true)
        })
        .catch((err) => {
            console.error(err)
            return callback(err)
        })

};