function runEveryDay() { 
  // TODO Send welcome message if user getting a message for the first time
  // TODO Add test for getRowsData, sendMatches
  // TODO Test birthday message bulk sending (SMS messages to multiple people)
  // TODO Add monthly news digest 
  // TODO Should check on SMS submission status with Twilio Webhook

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
    
    // Update SMS inbox
    console.time("updateInbox"); 
    updateInbox(people);
    console.timeEnd("updateInbox");
    
  } catch(e) { 
    Logger.log("runEveryday error " + e);
    console.error('CallTree::runEveryDay() yieled an error ' + e);
  }
  console.timeEnd("runEveryday");  
}

function onOpen() {
   
   var menu = SpreadsheetApp.getUi()
      .createMenu('* Call Tree Functions * ')
      .addItem('Pull latest news', 'pullNews')
      .addItem('Update incoming text inbox', 'updateInbox')
      .addItem('Verify Phone Numbers', 'lookupPhoneNumbers')
      .addItem('Update control panel', 'populateControlPanel')
      .addItem('Export sheet to JSON', 'exportJSON')
      .addSeparator()
      .addItem('* Run CallTree batch * (' + (isDebugOn() ? 'DEBUG' : 'PRODUCTION') + ')', 'runEveryDay')
      .addToUi(); 
};