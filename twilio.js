function getBase64Auth(forceProduction) {
  if (forceProduction) { 
    return Utilities.base64Encode(TWILIO_PRODUCTION_SID + ":" + TWILIO_PROUDCTION_AUTH);
  } else { 
    return Utilities.base64Encode(TWILIO_ACCOUNT_SID + ":" + TWILIO_AUTH_TOKEN);
  }
}

function sendBatchSms(to, body) { 
  Logger.log("!!! sendBatchSms() - Not fully implemented TODO"); 
  for (var i in to) { 
    sendSms(to[i], body);
  }
}

// TODO Should go through pages
function updateInbox(people) { 
  var FIRST_ROW = 2;
  var NUM_COLUMNS = 5;
  
  if (!people) people = loadMembers();  

  var data = pullInboundSms(100); 
  if (!data) return;
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inbox");
  var count = data.messages.length; 
  var range = sheet.getRange(FIRST_ROW, 1, count + 1, NUM_COLUMNS); 
  var table = range.getValues();
  
  for (var i = 0; i < count; i++) { 
    
    var msg = data.messages[i];  
    var date = new Date(msg.date_sent);
    var fromPerson = findByNumber(people, msg.from);
    if (fromPerson) fromPerson = fromPerson.firstname + " " + fromPerson.lastname; 
    else fromPerson = "Unknown"; 
    
    table[i] = [date, fromPerson, msg.from, msg.body, msg.status]; 
  }
  
  range.setValues(table);

}

// @returns parsed JSON response or null
function pullInboundSms(numberToRetrieve) { 
  
  var url ="https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_PRODUCTION_SID 
     + "/Messages.json?PageSize=" + numberToRetrieve + "&To=" + TWILIO_PRODUCTION_NUMBER;
  
  
  var options = {"method" : "get"};
  options.headers = {"Authorization" : "Basic " + getBase64Auth(true)};
  
  var res = null; 
  try { 
    res = UrlFetchApp.fetch(url, options);
    res = JSON.parse(res.getContentText());
  } catch (err) { 
    logError("Couldn't retrieve messages : " + err);
  }
  
  return res;
}

// Send SMS using twilio 
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

// Look up phone number using Twilio service
// @returns Twilio data about the phone number
function lookup(phoneNumber) {
    var lookupUrl = "https://lookups.twilio.com/v1/PhoneNumbers/" + phoneNumber + "?Type=carrier"; 

    var options = {
        "method" : "get"
    };

    options.headers = {    
        "Authorization" : "Basic " + getBase64Auth(true) 
    };

    var response = UrlFetchApp.fetch(lookupUrl, options);
    var data = JSON.parse(response); 
    Logger.log(data); 
    return data; 
}
