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
      var cellData = String(data[i][j]);
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


/**
 * Replaces markers in a template string with values in a row.
 *
 * @param  {String} template the template to be used
 * @param  {Array} rowValues the values to fill the template
 * @param  {Array} headers the headers corresponding to the values
 * @return {String} the copy of the template
 */
function createTextFromTemplate(template, rowValues, headers, dateFormat, dateTimeZone) {
  for(i in rowValues) {
    if(rowValues[i] instanceof Date && !isNaN(rowValues[i].valueOf())) {
      rowValues[i] = Utilities.formatDate(new Date(rowValues[i]), dateTimeZone, dateFormat);
    }
  }
  var data =  getObjects_([rowValues], normalizeHeaders_(headers))[0];
  // Search for all the variables to be replaced, for instance ${"Column name"}
  var templateVars = template.match(/\$\{\"[^\"]+\"\}/g);

  // Replace variables from the template with the actual values from the data object.
  // If no value is available, replace with the empty string.
  for (var i = 0; i < templateVars.length; ++i) {
    // normalizeHeader_ ignores ${"} so we can call it directly here.
    var variableData = data[normalizeHeader_(templateVars[i])];
    template = template.replace(templateVars[i], variableData || "");
  }
  return template;
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
