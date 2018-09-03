function sendMatchesIfScheduledForToday(people) { 
                     
  var today = new Date(); 
  
  var submissionInfo = getSubmissionInfoForMonth(today);
  
  var shouldSendNow = (submissionInfo.dayToSend == String(today.getDate()));
  if (shouldSendNow) { 
    assert(submissionInfo.quote != undefined, "No quote provided for this month!");
    assert(submissionInfo.matches != undefined, "No matches found for this submission!");
    
    logAboutToSubmitMatches();
    sendMatches(people, submissionInfo.matches, submissionInfo.quote);
  } else { 
    Logger.log("Not sending matches today. Submission day: " + submissionInfo.dayToSend + " today: " + today.getDate()); 
  }
		
}

function findSubmissionColumn(date, rows) { 
  var YEAR_ROW  = 1;
  var MONTH_ROW = 2;
  
  var year = String(date.getFullYear());
  var month = String(date.getMonth() + 1); 

  Logger.log("looking for submission year: " + year + " and looking for month: " + month); 
  var yearCol = rows[YEAR_ROW - 1].indexOf(year); 
  if (assert(yearCol != -1, "Couldn't find info for the current year in matches")) { 
    var monthCol = rows[MONTH_ROW - 1].indexOf(month, yearCol);
    return monthCol;
  } else return -1;
}

function getSubmissionDayAndQuoteForMonth(monthCol, rows) { 
  
  var DAY_ROW = 3;
  var QUOTE_ROW = 4;
  
  var day = nullIfEmpty(rows[DAY_ROW - 1][monthCol]); 
  var quote = nullIfEmpty(rows[QUOTE_ROW - 1][monthCol]);
  Logger.log("Found timing for submission " + day + " and quote: " + quote);
     
  return [day, quote];
}

/*
 * @param date  year and month for the lookup of submission info 
 * 
 * @returns day for submission, the quote of the month and an array of matches 
 *         (recipient, match, match cell pointer, last text cell pointer)
 */
function getSubmissionInfoForMonth(date) { 
  var MATCH_SHEET = 0; 
  var MATCH_ROW = 6;
  var TO_CELL   = 1; 
  var LAST_TEXT_CELL = 2;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[MATCH_SHEET];
  var rows = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
 
  var monthCol = findSubmissionColumn(date, rows); 
  if (monthCol == -1) { 
    logError("Couldn't find submission info for date - " + date); 
    return;
  }
  
  // Find time of submission
  var timingAndQuote = getSubmissionDayAndQuoteForMonth(monthCol, rows);

  // Look up matches for that day (monthCol)
  var foundMatches = [];
  for (var i = MATCH_ROW - 1; i < rows.length; i++) { 
  	var row = rows[i]; 
  	foundMatches.push([row[TO_CELL - 1], row[monthCol], sheet.getRange(i + 1, monthCol + 1), sheet.getRange(i + 1, LAST_TEXT_CELL)]);
  }

  var res = { 
  	dayToSend: timingAndQuote[0],
  	quote: timingAndQuote[1],
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
    var matchCell = matches[i][2];
    var lastTextCell = matches[i][3];
    
    Logger.log("Recipient: " + to + " match : " + match);
    
    if (assert(people[to] != undefined, "Username " + to + " could not be found in the people table") 
        && assert(people[match] != undefined, "Username " + match + " could not be found in the people table")) {
      
      if (sendMatchText(people[to], people[match], quote)) {
        //Mark timestamp for match cell and last text column
        var timestamp = isDebugOn() ? "DEBUG :" + new Date().toString() : new Date();
        matchCell.setNote(timestamp);
        lastTextCell.setValue(timestamp);       
      }
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
  return assert(sendSms(to.number, msg), "Message could not be sent");
}

/// Match generation

function _findUserByName(users, name) { 

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
  users.splice(users.indexOf("Raphael"), 1);
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var recipients = sheet.getRange(startRow, 1, sheet.getLastRow() + 1 - startRow).getValues();
  
  for (var i = 0; i < recipients.length; i++) { 
    
    if (isCellEmpty_(recipients[i])) continue;
    
    Logger.log("Cursor: " + cursor + " recipient -> " + recipients[i] + " index " + _findUserByName(users, recipients[i]));     
     
    var indexOf = _findUserByName(users, recipients[i]);
    if (indexOf != -1) { 
      var cursor = indexOf;
      for (var x = 0; x < users.length; x++) {
        cursor = (cursor + 1) % users.length;
        // Don't match with yourself
        if (cursor == indexOf) cursor = (cursor + 1) % users.length;
        sheet.getRange(startRow + i, firstMatchCol + x).setValue(users[cursor]);  
      }
    }
 
  }  
}
