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

// TODO improve birthday message (emoji, etc.)
function formatBirthdayMessage(birthdays) { 
  assert(birthdays.length > 0, "formatBirthdayMessage called with empty birthday list"); 
  
  var msg = "Hi, this is the Henry Crown CallTree! "; 
  msg += "Today, we're celebrating "; 
  if (birthdays.length == 1) { 
    msg += "the birthday of: " + formatPerson(birthdays[0]); 
  } else { 
    msg += birthdays.length + " birthdays today:";
    for (var i in birthdays) { 
      msg += "\n" + formatPerson(birthdays[i]);
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
