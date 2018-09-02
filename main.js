function runEveryDay() { 
  // TODO schedule this to run every day 
  // TODO Templatize SMS messages with replacable variables. 
  // TODO prettify the copy for birthday message and match messages
  // TODO Add Stackdriver logging, measure time to run

  Logger.log("Running CallTree daily job. MODE: Debug? " + isDebugOn()); 
  
  var peopleDb = loadMembers();
  
  populateControlPanel(peopleDb);
  
  // TODO send birthdays
  sendBirthdays(peopleDb);

  // Send matches every month on the day / month / year listed in the table
  sendMatchesIfScheduledForToday(peopleDb);
}

function loadMembers() { 
  // Could cache JSON structure for faster processing
  return JSON.parse(exportSheetAsJSON(1)); 
}

function sendMatchesIfScheduledForToday(peopleDb) { 
  var submission = getMonthlySubmissionInfo(); 
  if (assert(submission != undefined, "Couldn't retrieve info for this month - submission day, quote")) { 
    var shouldSendNow = (String(submission[0]) == String(new Date().getDate())); 
    var quote = submission[1]; 
    
    if (shouldSendNow) { 
      assert(quote != undefined, "No quote provided for this month!");
      logAboutToSubmitMatches();
      lookupAndSendMatches(peopleDb, quote); 
    } else { 
      Logger.log("Not sending matches today"); 
    }
  }
}

/* 
 * @returns date (day) to send matches and the quote to use
 */ 
function getMonthlySubmissionInfo() { 
  var month = String(new Date().getMonth() + 1); 
  var year = String(new Date().getFullYear());
  return getSubmissionInfoForMonth(month, year);
}

function getSubmissionInfoForMonth(month, year) { 
  var MATCH_SHEET = 0; 
  var QUOTE_ROW = 3;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[MATCH_SHEET];
  var rows = sheet.getRange(1, 3, QUOTE_ROW + 1, sheet.getLastColumn()).getValues();
 
  var yearCol = rows[0].indexOf(year); 
  if (assert(yearCol != undefined, "Couldn't find info for the current year behavior in matches")) { 
    var monthCol = rows[1].indexOf(month, yearCol);
    Logger.log("Found month for submission: " + monthCol);
    if (assert (monthCol != undefined, "Couldn't find info for the current month behavior in matches")) { 
      var timing = rows[2][monthCol]; 
      var quote = rows[3][monthCol];
      Logger.log("Found timing for submission " + timing + " and quote: " + quote);
      return [timing, quote];
    }
  }
  return null;
}

function lookupAndSendMatches(people, quote) { 
  var MATCH_SHEET = 0; 
  var TO_CELL = 1; 
  
  var LAST_TEXT_CELL = 2;
  var MATCH_CELL = 3;
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[MATCH_SHEET];
  var numRows = sheet.getLastRow() - 1; 
  var startRow = 6;
  
  var dataRange = sheet.getRange(startRow, TO_CELL, numRows, 3); 
  var recipients = dataRange.getValues();
  
  for (var row in recipients) { 
 
    var recipient = recipients[row];
    if (recipient[0] != "") { 
      Logger.log("start: " + startRow + " + " + row);
      var to = recipient[TO_CELL - 1]; 
      var lastText = recipient[LAST_TEXT_CELL - 1]; 
      var match = recipient[MATCH_CELL - 1];
      Logger.log("Recipient: " + to + " last text " + lastText + " match : " + match);
      
      if (assert(people[to] != undefined, "Username " + to + " could not be found in the people table") 
          && assert(people[match] != undefined, "Username " + match + " could not be found in the people table")) {
        sendMatchText(people[to], people[match], quote);
        
        //Update Last Text timestamp
        sheet.getRange((startRow + Number(row)), LAST_TEXT_CELL).setValue(
          isDebugOn() ? "DEBUG :" + new Date().toString() : new Date());
      }
    }
  }
}

function formatPerson(person) { 
  return person.firstname + " " + person.lastname + " (" + person.city + ", " + person.country + ") at \n📱: " + person.number + "\n📧: " + person.email; ;
}

function formatMatchMessage(to, match, quote) { 
 
  var msg = "Hello " + to.firstname + ", this is the keep in touch Henry Crown Call Tree!" + 
    "\nThis month, may I suggest you contact " + 
      formatPerson(match) + "?" + 
    "\n\n" + 
    quote;
    
  return msg;
}

function sendMatchText(to, match, quote) { 
  Logger.log("Sending to " + to.firstname + " match with " + match.firstname);
  var msg = formatMatchMessage(to, match, quote);
  
  assert(sendSms(to.number, msg), "Message could not be sent");
}
