function loadMembers() { 
  var people = getRowsData("People");
  return people;
}

// Assumes People header starts at (1,1) and data at (2,1)
function getRowsData(sheetName) { 
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName); 
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var data = sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  return getObjects(data, headers);
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