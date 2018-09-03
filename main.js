function runEveryDay() { 
  // TODO Add test for getRowsData, getSubmissionInfo, sendMatches
  // TODO Should add a note next to matches that were sent and prevent double sending
  // TODO Birthday message bulk sending (SMS messages to multiple people)
  // TODO Add monthly digest 


  Logger.log("Running CallTree daily job. MODE: Debug? " + isDebugOn()); 
  
  console.time("runEveryday");
  try { 
    console.time("loadMembers");
    var peopleDb = loadMembers();
    console.timeEnd("loadMembers");
    
//    console.time("populateControlPanel");
//    populateControlPanel(peopleDb);
//    console.timeEnd("populateControlPanel");
  
    // TODO send birthdays
    console.time("sendBirthdays"); 
    sendBirthdays(peopleDb);
    console.timeEnd("sendBirthdays");
    
    // Send matches every month on the day / month / year listed in the table
    console.time("sendMatchesIfScheduledForToday");
    sendMatchesIfScheduledForToday(peopleDb);
    console.timeEnd("sendMatchesIfScheduledForToday");
    
  } catch(e) { 
    Log.log("runEveryday error " + e);
    console.error('CallTree::runEveryDay() yieled an error ' + e);
  }
  console.timeEnd("runEveryday");  
  
}

function onOpen() {
   
   var menu = SpreadsheetApp.getUi()
      .createMenu('Call Tree Functions')
      .addItem('Verify Phone Numbers', 'lookupPhoneNumbers')
      .addItem('Update control panel', 'populateControlPanel')
      .addItem('Export sheet to JSON', 'exportJSON')
      .addSeparator()
      .addItem('* Run CallTree batch * (' + (isDebugOn() ? 'DEBUG' : 'PRODUCTION') + ')', 'runEveryDay')
      .addToUi(); 
};

function loadMembers() { 
  var peopleTable = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("People"); 
  var people =  getRowsData(peopleTable);
  return people;
}

