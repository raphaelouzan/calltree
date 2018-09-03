function getRandomPerson(people) { 
  var usernames = Object.keys(people);
  return people[usernames[rand(1, usernames.length - 1)]];
}


function rand(min, max) { 
  return Math.floor(Math.random() * 100 % max) + min;
}

function runAutoTests() { 
  var res = testMatchTemplate(); 
  return res;
}

function testMatchTemplate() { 
  var people = loadMembers();
  var tp = "Hello ${\"to.firstname\"} meet ${\"match.lastname\"}";
  var res = textFromTemplate(tp, {"to" : people["Raphael"], "match" : people["Athena"]}); 
  Logger.log(res); 
  if (res != "Hello Raphael meet Karp") throw "Failed test"; 
  
  tp = "Hello ${\"to.firstname\"} World ${\"bla\"}";
  res = textFromTemplate(tp, {"to" : people["Raphael"], "bla" : "Sensei"});
  Logger.log(res);
  if(res != "Hello Raphael World Sensei") throw "failed test";
  
  return res;
}

function testSubInfo() { 
  // TODO need to improve this test
	var people = loadMembers();
	var r = getSubmissionInfoForMonth(people, "8", "2018");
	Logger.log("timing " + r.dayToSend + " matches " + r.matches + " quote " + r.quote);

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
  
  for (var i = 0; i < rand(10, 50); i++) { 
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

