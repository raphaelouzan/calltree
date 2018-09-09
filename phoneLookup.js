function lookupPhoneNumbers() {
    var STATUS_CELL = 10; 
    var NUMBER_CELL = 9; 
    var CARRIER_CELL = 11;
  
    var sheet = SpreadsheetApp.getActiveSheet();
    var startRow = 2; 
    var numRows = sheet.getLastRow() - 1; 
    var dataRange = sheet.getRange(startRow, NUMBER_CELL, numRows); 
    var phoneNumbers = dataRange.getValues();

    for (var i in phoneNumbers) {
        var phoneNumber = phoneNumbers[i]; 
        var spreadsheetRow = startRow + Number(i); 
        sheet.getRange(spreadsheetRow, STATUS_CELL).setValue("");
        Logger.log("Validating Number : " + phoneNumber);
        if (phoneNumber != "") { 
            try { 
                data = lookup(phoneNumber);
                if (data['status'] == 404) { 
                  sheet.getRange(spreadsheetRow, STATUS_CELL).setValue("not found");
                } else {
                  sheet.getRange(spreadsheetRow, STATUS_CELL).setValue("found");
                  sheet.getRange(spreadsheetRow, CARRIER_CELL).setValue(data['carrier']['name']);
                  // update phone number to best format
                  sheet.getRange(spreadsheetRow, NUMBER_CELL).setValue(data['phone_number']);
                }  
            } catch(err) {
                Logger.log(err);
                sheet.getRange(spreadsheetRow, STATUS_CELL).setValue('lookup error');
            }
        }
    }
}