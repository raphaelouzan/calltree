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

function formatPerson(person) { 
  return person.firstname + " " + person.lastname + " (" + person.city + ", " + person.country + ") at \n📱: " + person.number + "\n📧: " + person.email; ;
}

// TODO improve birthday message (emoji, etc.)
function formatBirthdayMessage(birthdays) { 
  assert(birthdays.length > 0, "formatBirthdayMessage called with empty birthday list"); 
  
  
  var birthdayPeople = ""; 
  for (var i in birthdays) { 
      birthdayPeople += "\n" + formatPerson(birthdays[i]);
  }
  
  var msg = textFromTemplate(getBirthdayTemplate(), {"peopleWithBirthday": birthdayPeople});
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
      if (birthday && birthday.getMonth() == month && birthday.getDate() == day) { 
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
