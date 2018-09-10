function runAutoTests() { 
  // TODO Proper testing framework. Could throw an exception in the assert
  // TODO Should pass a mock dataset to all tests (copy an object dump and JSON parse it create a dict out of it)
  var people = loadMembers(); 
  
  var res = assert(testMatchTemplate(people), "TestMatchTemplate failed"); 
  res &= assert(testLoadMembers(people), "TestLoadMembers failed");
  res &= assert(testFindByNumber(people), "TestFindByNumber failed");
  res &= assert(testGetSubmissionInfo(people), "TestGetSubmissionInfo failed"); 
  res &= assert(testFindSubmissionColumn(), "testFindSubmissionColumn failed");
  res &= assert(testBirthdayFinder(), "testBirthdayFinder failed");
  res &= assert(testEditMembers(people), "testEditMembers failed");
  
  assert(res, "Automatic tests failed"); 
  return res;
}

function getRandomPerson(people) { 
  var usernames = Object.keys(people);
  return people[usernames[rand(1, usernames.length - 1)]];
}

function rand(min, max) { 
  return Math.floor(Math.random() * 100 % max) + min;
}

function testClass() { 
  var people = new People(); 
  Logger.log(people.get()); 
  
}

function testLoadMembers(people) { 
  if (!people) people = loadMembers();
  
  var res = (Object.keys(people).length == 24); 
  if (!res) throw "Invalid number of people"; 
  
  var raphBirthday = new Date(people["Raphael"].birthday);
  if (raphBirthday.getMonth() != 5 || raphBirthday.getDate() != 9) throw "Invalid date for Raph's birthday";
  
  if (!people["Raphael"].enrolled) throw "Raphael should be enrolled";
  
  if (people["Raphael"].email != "raphael.ouzan@gmail.com") throw "Wrong email for raphael";
  
  return true;
}

function testEditMembers(people) { 
  if (!people) people = loadMembers(); 
  
  var person = getRandomPerson(people);
  var isEnrolled = person.enrolled;
  
  // invest checkbox & save
  person.enrolled = (isEnrolled == "true") ? "false" : "true"; 
  
  Logger.log("Updated person " + person.firstname + " enrolled? " + person.enrolled);
  Logger.log(people);
  updatePeople(people);
  
  // Check that the update worked
  updatedPeople = loadMembers(); 
  if (updatedPeople[person.username].enrolled == isEnrolled) throw "edit members failed"; 
  
  // revert changes
  updatedPeople[person.username].enrolled = isEnrolled;
  updatePeople(updatedPeople);
  
  return true; 
}

function testFindByNumber(people) { 
  if (!people) people = loadMembers(); 
  var res = findByNumber(people, "+19178873590"); // raphael's number
  if (res == null || res.firstname != "Raphael") throw "Test Error: " + res;
  
  res = findByNumber(people, "+19178873599"); // wrong number
  if (res) throw "Test Error: should have returned null for wrong number"; 
  
  return true;
}

function testGetSubmissionInfo(people) { 
  if (!people) people = loadMembers();
  
  var date = new Date(2018, 7, 31); 
  Logger.log("Date for test " + date); 
  var res = getSubmissionInfoForMonth(date);
  var success = (res.dayToSend == 31) && (res.matches.length == Object.keys(people).length) && res.quote != ""; 
  if (!success) throw "Test Error : " + res.dayToSend + " " + res.matches.length + " " + Object.keys(people).length + " " + res.quote;
  
  date = new Date(2018, rand(0, 11), rand(0, 30));
  res = getSubmissionInfoForMonth(date);
  success = (res.matches.length == Object.keys(people).length);
  if (!success) throw "Test Error : " + res;
  
  return true; 
}

function testFindSubmissionColumn() { 
  var date = new Date(2018, 7, 31); 
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Timetable");
  var rows = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var res = findSubmissionColumn(date, rows); 
  var success = (res == 2);
  if (!success) throw "Test Error : " + res;
  
  return true;
}

function testMatchTemplate(people) { 
  if (!people) people = loadMembers();
  
  var tp = "Hello ${\"to.firstname\"} meet ${\"match.lastname\"}";
  var res = textFromTemplate(tp, {"to" : people["Raphael"], "match" : people["Athena"]}); 
  Logger.log(res); 
  if (res != "Hello Raphael meet Karp") throw "Failed test"; 
  
  tp = "Hello ${\"to.firstname\"} World ${\"bla\"}";
  res = textFromTemplate(tp, {"to" : people["Raphael"], "bla" : "Sensei"});
  Logger.log(res);
  if(res != "Hello Raphael World Sensei") throw "failed test";
  
  return true;
}

function testBirthdayFinder(people) { 
  if (!people) people = loadMembers(); 
  
  var birthdays = getBirthdayPeopleForDate(people, 9, 5); // Raphael's birthday (month 0 based)
  var res = (birthdays[0][0] == people["Raphael"]);
  if (!res) throw "Couldn't find Raphael's birthday"; 
  
  birthdays = getBirthdayPeopleForDate(people, 6, 0); // Athena's bday
  res = (birthdays[0][0] == people["Athena"]); 
  if (!res) throw "Couldn't find Athena's birthday";
  
  return true; 
}

function testSendBirthday() { 
  // Generate random dates with today's date
  // Check if it can find today's date within the random dates
  
  // TODO
  var people = loadMembers();
  var numBirthdayPeople = 0; 
  var numNotYetPeople = 0; 
  
  var today = new Date(); 
  for (var p in people) { 
    var person = people[p]; 
    person.birthday = new Date(rand(1950, 2003), rand(1,12), rand(1,12));
    if (person.birthday.getDate() == today.getDate() && person.birthday.getMonth() == today.getMonth()) { 
      numBirthdayPeople += 1; 
    }
  }
}

function testSendBirthdayMessageUI() { 
  
  var people = loadMembers(); 
  var testRec = people["Raphael"].number; 
  
  // Send to Raphael random birthdays of people
  var birthdays = []; 
  var usernames = Object.keys(people);
  var numberOfBirthdays = Math.floor(Math.random()* 100 % 10); 
  
  for (var i = 0; i < Math.max(1, numberOfBirthdays); i++) { 
    // Get random people
    birthdays.push(getRandomPerson(people));
  }
  
  Logger.log(birthdays);
  
  sendBatchSms([testRec], formatBirthdayMessage(birthdays));
}


function testSendMatch() { 

  var people = loadMembers(); 
  var testRec = people["Raphael"]; 
  sendMatchText(testRec, getRandomPerson(people), 
                "\"All that we see or seem is but a dream within a dream.\" -- Edgar Poe");
}

