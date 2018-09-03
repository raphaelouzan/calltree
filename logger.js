function logError(errorMsg) { 
  logRow(new Date(), "", "", "", "", errorMsg);
  console.error("Error : " + errorMsg);
}

function logSms(from, to, body) { 
  logRow(new Date().toString(), from, to, body, "sent", "");
}

function logSmsError(from, to, body, errorMsg) { 
  logRow(new Date().toString(), from, to, body, "error", errorMsg);
  console.error("Error sending msg %s %s %s %s", from, to, body, errorMsg);
}

function logRowTest() { 
  logRow(new Date(), "1", "2", "3", "4", "5");
}

function logAboutToSubmitMatches() { 
  logRow(new Date(), "System", "System", "Today we're sending matches", "matches", "");
}

function logRow(timestamp, from, to, body, sent, msg) { 
  var ACTIVITY_SHEET = 2;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[ACTIVITY_SHEET];
  var lastRow = sheet.getLastRow() + 1;
  sheet.getRange(lastRow, 1, 1, 7).setValues([[timestamp, from, to, body, sent, msg, isDebugOn()]]);
}

function assert(condition, errorMsg) {
  if (!condition) { 
    Logger.log(errorMsg);
    logError(errorMsg);
    // Add line to the log
  }
  return condition;
}

function populateControlPanel(people) { 
  
  if (!people) { 
    people = loadMembers();
  }
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Control");
  // Debug on?
  sheet.getRange(2, 1).setValue(isDebugOn() ? "DEBUG" : "PRODUCTION");
  // This month submission date
  var date = new Date();
  sheet.getRange(3, 1).setValue(getSubmissionInfoForMonth(date).dayToSend + "/" + (date.getMonth() + 1));
  // Next submission date (iterate by a month)
  date.setMonth(date.getMonth() + 1);
  sheet.getRange(4, 1).setValue(getSubmissionInfoForMonth(date).dayToSend + "/" + (date.getMonth() + 1)); 
  // Birthdays today 
  var birthdays = getBirthdayPeopleForDate(people, new Date().getDate(), new Date().getMonth());
  sheet.getRange(5, 1).setValue(birthdays[0].length);
  // Number of members
  sheet.getRange(6, 1).setValue(Object.keys(people).length + 1);
  // Oldest and latest matches sent
  var matches = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Timetable");
  var lastSent = matches.getRange(6, 2, matches.getLastRow()).getValues();
  var min = new Date(); 
  var max = new Date(2000, 1, 1); 
  for (var i in lastSent) { 
    if (lastSent[i][0] == "") continue;
    var d = new Date(lastSent[i][0]); 
    if (d.valueOf() < min.valueOf()) min = d; 
    else if (d.valueOf() > max.valueOf()) max = d; 
  }
  if (max.valueOf() < min.valueOf()) max = min; 
  sheet.getRange(7, 1).setValue(min); 
  sheet.getRange(8, 1).setValue(max); 
}
