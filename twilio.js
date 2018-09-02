function getBase64Auth() {
  return Utilities.base64Encode(TWILIO_ACCOUNT_SID + ":" + TWILIO_AUTH_TOKEN);
}

function sendBatchSms(to, body) { 
  Logger.log("Not fully implemented TODO"); 
  for (var i in to) { 
    sendSms(to[i], body);
  }
}

function sendSms(to, body) {
  
  var messages_url = "https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_ACCOUNT_SID + "/Messages.json";

  var payload = {
    "To": to,
    "Body" : body,
    "From" : MY_PHONE_NUMBER
  };

  var options = {
    "method" : "post",
    "payload" : payload
  };

  options.headers = { 
    "Authorization" : "Basic " + getBase64Auth()
  };

  var res = null;
  try { 
    res = UrlFetchApp.fetch(messages_url, options);
    logSms(MY_PHONE_NUMBER, to, body);
  } catch (err) { 
    // TODO make sure this is the right syntax to extract the error message
    logSmsError(MY_PHONE_NUMBER, to, body, err.toString());
    Logger.log(err);
  }
  
  return res;  
  
}