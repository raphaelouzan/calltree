function sendMatchesIfScheduledForToday(people) { 
  
  var thisMonth = String(new Date().getMonth() + 1);
  var thisYear = String(new Date().getFullYear());
  var today = String(new Date().getDate());
                     
  var submissionInfo = getSubmissionInfoForMonth(thisMonth, thisYear);
  
  Logger.log("timing got ==> " + submissionInfo.dayToSend + " current day: " );
  var shouldSendNow = (submissionInfo.dayToSend == today);
  if (shouldSendNow) { 
    assert(submissionInfo.quote != undefined, "No quote provided for this month!");
    assert(submissionInfo.matches != undefined, "No matches found for this submission!");
    
    logAboutToSubmitMatches();
    sendMatches(people, submissionInfo.matches, submissionInfo.quote);
  } else { 
    Logger.log("Not sending matches today"); 
  }
		
}

function _findUserByName(users, name) { 
  if (name == "Raphael") return -1; 
  for (var i = 0; i < users.length; i++) {
    if (users[i] == name) return i;
  }
  return -1;
}

function generateMatches() { 
  // TODO should never change matches for texts that were sent
  
  var startRow = 6;
  var firstMatchCol = 3;
  
  var users = Object.keys(loadMembers()); 
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var recipients = sheet.getRange(startRow, 1, sheet.getLastRow() - startRow).getValues();
  
  for (var i = 0; i < recipients.length; i++) { 
    
    if (isCellEmpty_(recipients[i])) continue;
    
    Logger.log("Cursor: " + cursor + " recipient -> " + recipients[i] + " index " + _findUserByName(users, recipients[i]));     
     
    var indexOf = _findUserByName(users, recipients[i]);
    if (indexOf != -1) { 
      var cursor = indexOf;
      for (var x = 0; x < users.length; x++) {
        cursor = (cursor + 1) % users.length;
        if (cursor == indexOf) cursor = (cursor + 1) % users.length;
        sheet.getRange(startRow + i, firstMatchCol + x).setValue(users[cursor]);  
      }
    }
 
  }  
}

/*
 * @param (String) year  Year in question (YYYY format) 
 * @param (String) month Month of the year in numeric form (1-based)
 * 
 * @returns day for submission, the quote of the month and an array of matches (recipient, match, last text cell pointer)
 */
function getSubmissionInfoForMonth(month, year) { 
  var MATCH_SHEET = 0; 
  var YEAR_ROW  = 1;
  var MONTH_ROW = 3;
  var QUOTE_ROW = 4;
  var MATCH_ROW = 6;
  var TO_CELL   = 1; 
  var LAST_TEXT_CELL = 2;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[MATCH_SHEET];
  var rows = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
 
  var foundTiming = null;
  var foundQuote = null; 

  Logger.log("looking for year: " + year + " and looking for month: " + month); 
  // Find time of submission
  var yearCol = rows[YEAR_ROW - 1].indexOf(year); 
  if (assert(yearCol != -1, "Couldn't find info for the current year in matches")) { 
    var monthCol = rows[1].indexOf(month, yearCol);
    Logger.log("Found month for submission: " + monthCol);
    if (assert (monthCol != -1, "Couldn't find info for the current month in matches")) { 
      foundTiming = nullIfEmpty(rows[MONTH_ROW - 1][monthCol]); 
      foundQuote = nullIfEmpty(rows[QUOTE_ROW - 1][monthCol]);
      Logger.log("Found timing for submission " + foundTiming + " and quote: " + foundQuote);
    }
  }

  // Look up matches for that day (monthCol)
  var foundMatches = [];
  for (var i = MATCH_ROW - 1; i < rows.length; i++) { 
  	var row = rows[i]; 
  	foundMatches.push([row[TO_CELL - 1], row[monthCol], sheet.getRange(i + 1, LAST_TEXT_CELL)]);
  }

  var res = { 
  	dayToSend: foundTiming,
  	quote: foundQuote,
  	matches: foundMatches 
  };

  return res;
}

/*
 * @param people DB
 * @param matches key pairs [recipient username, match username]
 * @param quote
 *
 */
function sendMatches(people, matches, quote) { 
 
  Logger.log("About to send matches " + matches);
  
  for (var i in matches) { 
    var to = matches[i][0];
    var match = matches[i][1];
    var lastText = matches[i][2];
    
    Logger.log("Recipient: " + to + " match : " + match);
    
    if (assert(people[to] != undefined, "Username " + to + " could not be found in the people table") 
        && assert(people[match] != undefined, "Username " + match + " could not be found in the people table")) {
      
      sendMatchText(people[to], people[match], quote);
      
      //Update Last Text timestamp
      lastText.setValue(
        isDebugOn() ? "DEBUG :" + new Date().toString() : new Date());
    }
    
  }  

}

/*
 * @param to     the recipient, as an object of the person table
 * @param match  the match, as an object of the person table
 * @param quote  string of the quote
 */
function sendMatchText(to, match, quote) { 
  Logger.log("Sending to " + to.firstname + " match with " + match.firstname);
  var msg = textFromTemplate(getMatchTemplate(), {"to" : to, "person" : match, "quote": quote});
  assert(sendSms(to.number, msg), "Message could not be sent");
}
