
/*
 * @todo should mark in the table who was already sent for to avoid dups and send late 
 * birthday notices if the script didn't run on time. 
 */
function sendBirthdays(people) { 
  var month = new Date().getMonth();
  var day = new Date().getDate();
  
  var lists = getBirthdayPeopleForDate(people, day, month); 
  var birthdays = lists[0]; 
  if (birthdays && birthdays.length > 0) { 
    Logger.log("People with birthday today:" + birthdays);
    // TODO send text to everyone but them 
    var recipients = [];
    for (var p in lists[1]) { 
      recipients.push(lists[1][p].number);
    }
    sendBatchSms(recipients, formatBirthdayMessage(birthdays)); 
  }
}

function testSendBirthdayMessage() { 
  var people = loadMembers(); 
  var testRec = people["Raphael"].number; 
  
  // Send to Raphael random birthdays of people
  var birthdays = []; 
  var usernames = Object.keys(people);
  var numberOfBirthdays = Math.floor(Math.random()* 100 % 10); 
  
  for (var i = 0; i < Math.max(1, numberOfBirthdays); i++) { 
    // Get random people
    birthdays.push(people[usernames[Math.floor(Math.random() * 100) % usernames.length]]);
  }
  
  Logger.log(birthdays);
  
  sendBatchSms([testRec], formatBirthdayMessage(birthdays));
}

// TODO improve birthday message (emoji, etc.)
function formatBirthdayMessage(birthdays) { 
  assert(birthdays.length > 0, "formatBirthdayMessage called with empty birthday list"); 
  
  var msg = "Hi, this is the Henry Crown CallTree! "; 
  msg += "Today, we have "; 
  if (birthdays.length == 1) { 
    msg += "one birthday: " + birthdays[0].firstname + " " + birthdays[0].lastname + " is celebrating!"; 
  } else { 
    msg += birthdays.length + " birthdays:";
    for (var i in birthdays) { 
      msg += "\n" + birthdays[i].firstname + " " + birthdays[i].lastname + " (" + birthdays[i].city + ", " + birthdays[i].country + ") ";
    }
  }
  
  return msg; 
}

function getBirthdayPeopleForDate(people, day, month) { 
  var birthdayPeople = [];
  var notYetPeople = []; 
        
  for (var person in people) { 
    var person = people[person];
    
    if (person.birthday) {
      birthday = new Date(person.birthday); 
      Logger.log(person.firstname + " birthday -> " + birthday); 
      if (birthday.getMonth() == month && birthday.getDate() == day) { 
        birthdayPeople.push(person);
      } else { 
        notYetPeople.push(person); 
      }
    } else { 
      notYetPeople.push(person);
    }
  }
  
  return [birthdayPeople, notYetPeople];
}
