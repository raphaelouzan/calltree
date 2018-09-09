function fetchHeadlines(q, from) { 
  
  var newsUrl = "https://newsapi.org/v2/everything?language=en&apiKey=" + NEWS_API 
              + "&q=" + encodeURIComponent(q);
  
  if (from) { 
    newsUrl += "&from=" + Utilities.formatDate(from, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  
  var response = UrlFetchApp.fetch(newsUrl, {"method" : "get"});
  return JSON.parse(response); 
}

function pullNews() { 
  var BASE_ROW = 2;
  var NEWS_FROM_DAY_BACK = "C1"; 
  
  var sheet = SpreadsheetApp.getActive().getSheetByName("News");
  
  var pullNewsFromDaysBack = sheet.getRange(NEWS_FROM_DAY_BACK).getValue();
  var from  = new Date(new Date().valueOf() - pullNewsFromDaysBack*(1000 * 60 * 60 * 24)); 
  
  var range = sheet.getRange(BASE_ROW, 3, sheet.getLastRow(), 6); 
  var names = range.getValues();
  
  for (var i in names) { 
    var name = names[i][0]; 
    if (name && name != "") { 
      Logger.log("NEWS: looking up : " + name);
      var error = null;
      try { 
        var headlines = fetchHeadlines(name, from);
      } catch (e) { 
        Logger.log("Error pulling news for : " + name + " error: " + e); 
        error = e;
      }
      
      if (headlines && headlines.status == "ok" && headlines.totalResults > 0) { 
        // TODO currently only pulls first article
        var article = headlines.articles[0];
        names[i][1] = "=IMAGE(\"" + article.urlToImage + "\")";
        names[i][2] = article.title; 
        names[i][3] = article.description; 
        names[i][4] = article.source.name; 
        names[i][5] = article.publishedAt; 
      } else { 
        names[i][1] = ""; 
        names[i][2] = ""; 
        if (error) { 
          names[i][2] = "Couldn't look up news for : " + name + ". Exception: " + error;
        }
        names[i][3] = ""; 
        names[i][4] = ""; 
        names[i][5] = ""; 
      }
    }    
  }
  
  range.setValues(names);
}

function formatName(firstname, lastname) { 
  return "\"" + firstname + " " + lastname + "\"";
}