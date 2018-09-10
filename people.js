function loadMembers() { 
  var peopleTable = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("People"); 
  var people = getRowsData(peopleTable);
  return people;
}

function findByNumber(people, number) { 
  var res = Object.keys(people).filter(function(elem, index, array) {
        return people[elem].number == number;
  });
  if (res && res.length == 1) { 
    return people[res[0]];
  } else { 
    return null;
  }
}