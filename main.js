function runEveryDay() { 
  // TODO Add test for getRowsData, sendMatches
  // TODO Test birthday message bulk sending (SMS messages to multiple people)
  // TODO Add monthly news digest 

  Logger.log("Running CallTree daily job. MODE: Debug? " + isDebugOn()); 
  
  console.time("runEveryday");
  try { 
    console.time("loadMembers");
    var people = loadMembers();
    console.timeEnd("loadMembers");
    
    console.time("populateControlPanel");
    populateControlPanel(people);
    console.timeEnd("populateControlPanel");
  
    // TODO test send birthdays
    console.time("sendBirthdays"); 
    sendBirthdays(people);
    console.timeEnd("sendBirthdays");
    
    // Send matches every month on the day / month / year listed in the table
    console.time("sendMatchesIfScheduledForToday");
    sendMatchesIfScheduledForToday(people);
    console.timeEnd("sendMatchesIfScheduledForToday");
    
  } catch(e) { 
    Logger.log("runEveryday error " + e);
    console.error('CallTree::runEveryDay() yieled an error ' + e);
  }
  console.timeEnd("runEveryday");  
  
}

function onOpen() {
   
   var menu = SpreadsheetApp.getUi()
      .createMenu('* Call Tree Functions * ')
      .addItem('Verify Phone Numbers', 'lookupPhoneNumbers')
      .addItem('Update control panel', 'populateControlPanel')
      .addItem('Export sheet to JSON', 'exportJSON')
      .addSeparator()
      .addItem('* Run CallTree batch * (' + (isDebugOn() ? 'DEBUG' : 'PRODUCTION') + ')', 'runEveryDay')
      .addToUi(); 
};

function loadMembers() { 
  var peopleTable = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("People"); 
  return getRowsData(peopleTable);
}

