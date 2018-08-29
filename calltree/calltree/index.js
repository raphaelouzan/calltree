const request = require('request-promise-native')

exports.handler = (event, context, callback) => {
    const TWILIO_ACCOUNT = 'AC1967a49711d26a2b8ad344946cb3d591' // add here your Twilio account ID
    const TWILIO_API_KEY = 'a8faf6d02d198b7067283a53618ed85a' // add here your Twilio API key
    const SEND_SMS_FROM = '+14702802715' // add here your Twilio phone number
    const SEND_SMS_TO = '+19178873590' // add here your Twilio phone number


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