function textFromTemplate(template, data) { 
  var templateVars = template.match(/\$\{\"[^\"]+\"\}/g);
  if (!assert(templateVars, "Couldn't extract variables from template")) return null;
  
  // Replace variables from the template with the actual values from the data object.
  // If no value is available, replace with the empty string.
  for (var i = 0; i < templateVars.length; ++i) {
    var marker = templateVars[i].replace("${\"", "").replace("\"}", "");
 
    var isDict = (marker.indexOf(".") != -1);
    var value; 
    
    if (isDict) { 
      var objName = marker.substring(0, marker.indexOf("."));
      var obj = data[objName];
      if (!assert(obj, "The template variable " + marker + " is invalid")) continue;
      var field = marker.substring(marker.indexOf(".") + 1, marker.length);
      value = obj[field];
    } else { 
      value = data[marker];
    }
    template = template.replace(templateVars[i], value || "");
  }
  
  return template;
}

// Creates multi dimension arrays
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

// @return A dict where the key is the first datafield of each row, 
//         and the value is a dict where the key is form keys param for the values of each row
// @note   All the data values are converted to String
// @param data: JavaScript 2d array
// @param keys: Array of Strings that define the property names for the objects to create
function getObjects(data, keys) {
  var objects = {};
  for (var i = 0; i < data.length; ++i) {
    var object = {};
    var hasData = false;
    for (var j = 0; j < data[i].length; ++j) {
      // TODO consider not converting data to string
      var cellData = data[i][j];
      if (isCellEmpty_(cellData)) {
        continue;
      }
      object[keys[j]] = cellData;
      hasData = true;
    }
    if (hasData) {
      objects[object[Object.keys(object)[0]]] = object;
    }
  }
  return objects;
}

function objectToTable(object, fields) { 
 
  var keys = Object.keys(object); 
  Logger.log("keys : " + keys);
  // To retrieve the fields, we need a row with all fields, so best to look up the fields
  // as params rather than dynamically on an arbitrary row
  Logger.log( "fields : " + fields);
  var table = createArray(keys.length, fields.length); 
  for (var i = 0; i < keys.length; i++) { 
    for (var x = 0; x < fields.length; x++) { 
      var value = object[keys[i]][fields[x]];
      if (value && value != "") {
        table[i][x] = value;
      } else { 
        table[i][x] = "";
      }
    }
  }
  
  return table;
}


// Based on: https://script.google.com/d/1Fvd-OtdzYzd4edFKsD3RPcjQ6YV3hmoJxJuBNK1g_qUtI_MuEXeyIps2/edit?usp=sharing

/**
 * Iterates row by row in the input range and returns an array of objects.
 * Each object contains all the data for a given row, indexed by its normalized column name.
 * @param {Sheet} sheet The sheet object that contains the data to be processed
 * @param {Range} range The exact range of cells where the data is stored
 * @param {number} columnHeadersRowIndex Specifies the row number where the column names are stored.
 *   This argument is optional and it defaults to the row immediately above range;
 * @return {object[]} An array of objects.
 */
function getRowsData(sheet, range, columnHeadersRowIndex) {
  columnHeadersRowIndex = columnHeadersRowIndex || range.getRowIndex() - 1;
  var numColumns = range.getEndColumn() - range.getColumn() + 1;
  var headersRange = sheet.getRange(columnHeadersRowIndex, range.getColumn(), 1, numColumns);
  var headers = headersRange.getValues()[0];
  return getObjects(range.getValues(), headers);
}

// Returns an Array of normalized Strings.
// Arguments:
//   - headers: Array of Strings to normalize
function normalizeHeaders(headers) {
  var keys = [];
  for (var i = 0; i < headers.length; ++i) {
    var key = normalizeHeader_(headers[i]);
    if (key.length > 0) {
      keys.push(key);
    }
  }
  return keys;
}

// Normalizes a string, by removing all alphanumeric characters and using mixed case
// to separate words. The output will always start with a lower case letter.
// This function is designed to produce JavaScript object property names.
// Arguments:
//   - header: string to normalize
// Examples:
//   "First Name" -> "firstName"
//   "Market Cap (millions) -> "marketCapMillions
//   "1 number at the beginning is ignored" -> "numberAtTheBeginningIsIgnored"
function normalizeHeader_(header) {
  var key = "";
  var upperCase = false;
  for (var i = 0; i < header.length; ++i) {
    var letter = header[i];
    if (letter == " " && key.length > 0) {
      upperCase = true;
      continue;
    }
    if (!isAlnum_(letter)) {
      continue;
    }
    if (key.length == 0 && isDigit_(letter)) {
      continue; // first character must be a letter
    }
    if (upperCase) {
      upperCase = false;
      key += letter.toUpperCase();
    } else {
      key += letter.toLowerCase();
    }
  }
  return key;
}

/*
 * @param cellData (String)
 * @returns the value otherwise null if an empty string
 */ 
function nullIfEmpty(cellData) { 
  if (isCellEmpty_(cellData)) return null; 
  else return cellData;
}

// Returns true if the cell where cellData was read from is empty.
// Arguments:
//   - cellData: string
function isCellEmpty_(cellData) {
  return typeof(cellData) == "string" && cellData == "";
}

// Returns true if the character char is alphabetical, false otherwise.
function isAlnum_(char) {
  return char >= 'A' && char <= 'Z' ||
    char >= 'a' && char <= 'z' ||
    isDigit_(char);
}

// Returns true if the character char is a digit, false otherwise.
function isDigit_(char) {
  return char >= '0' && char <= '9';
}
