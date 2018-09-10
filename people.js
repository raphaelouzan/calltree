function loadMembers() { 
  var rows = getRowsData("People");
  return getObjects(rows.data, rows.headers);
}

function updatePeople(people) {
  var table = objectToTable(people);   
  setRowsData("People", table); 
}

function setRowsData(sheetName, table) { 
  // TODO should cache the range? 
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName); 
  var range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
  
  // Update the table with a 10 second lock
  var lock = LockService.getPublicLock(); 
  if (lock.tryLock(10000))  {
    range.setValues(table);
  } else {
    logError("Couldn't acquire lock to update people table");
  }
  
}

// Assumes header starts at (1,1) and data at (2,1)
function getRowsData(sheetName) { 
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName); 
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var data = sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  return {"data": data, "headers" : headers};
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