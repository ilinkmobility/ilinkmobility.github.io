/**
 * PWACurrencyConverter
 * 
 * This is the controler for this responsive currency conversion web app.
 * Free web api https://api.fixer.io used to get the realtime currency rates.
 * This web app is designed as progressive web app, so it will work in offline and we can
 * add this to our device home screen.
 */


var CurrencyConversionWebAPI = 'https://api.fixer.io/latest?base=USD';
var HTTP_OK = 200;
var indicator;

var app = {
  from: "USD",
  to: "INR",
  fromCurrencyName: "US Dollar",
  toCurrencyName: "Indian Rupee",
  currencies: {},
  currencyCodes: ["AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", "HRK", "HUF", "IDR", "ILS", "INR", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PLN", "RON", "RUB", "SEK", "SGD", "THB", "TRY", "USD", "ZAR"],  	currncyNames: ["Australian Dollar", "Bulgarian Lev", "Brazilian Real", "Canadian Dollar", "Swiss Franc", "Chinese Yuan", "Czech Koruna", "Danish Krone", "Euro", "British Pound", "Hong Kong Dollar", "Croatian Kuna", "Hungarian Forint", "Indonesian Rupiah", "Israeli Shekel", "Indian Rupee", "Japanese Yen", "Korean Won", "Mexican Peso", "Malaysian Ringgit", "Norwegian Krone", "New Zealand Dollar", "Philippine Peso", "Polish Zloty", "Romanian Leu", "Russian Rouble", "Swedish Krona", "Singapore Dollar", "Thai Baht", "Turkey Lira", "US Dollar", "South African Rand"]
};

//An Ajax method to retrieve the various country's currency rates based on USD
function getCurrencies(isLoaderNeeded) {
  if(isLoaderNeeded) {
    var indicator = phonon.indicator('Please wait...', false);
  }
  
  // Fetch the latest data.
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === HTTP_OK) {
        app.currencies = JSON.parse(request.response);
        updateCurrency();
        saveCurrencyRates();
        saveOtherCurrencyRatesOverIndianRupee();
        indicator.close();
      } else {
        loadPreviousCurrencyRates();
      }
    } else {
      loadPreviousCurrencyRates();
    }
  };
  request.open('GET', CurrencyConversionWebAPI);
  request.send();
};


//Save the retrived currency rates in browser local db to use the data in case of offline.
function saveCurrencyRates() {
  var currencies = JSON.stringify(app.currencies);
  localStorage.currencies = currencies;
}

function saveLastConversion(converted) {
  localStorage.lastConversion = converted;
}

function saveOtherCurrencyRatesOverIndianRupee() {
  localStorage.otherConversions = "INR Rates :\n" +
  "USD : " + currencyValueDifference("USD", "INR").toFixed(2) + "\n" +
  "EUR : " + currencyValueDifference("EUR", "INR").toFixed(2) + "\n" +
  "GBP : " + currencyValueDifference("GBP", "INR").toFixed(2);
}

function currencyValueDifference(fromCurrency, toCurrency) {
  var from = (fromCurrency != "USD") ? app.currencies.rates[fromCurrency] : 1;
  var to = (toCurrency != "USD") ? app.currencies.rates[toCurrency] : 1;

  var differenceWithUSD = (1/from) * 100;

  return ((to * differenceWithUSD) / 100);
}

//Loading the currencies from local database during the initialization of UI.
function loadPreviousCurrencyRates() {
  app.currencies = localStorage.currencies;
  if (app.currencies) {
    app.currencies = JSON.parse(app.currencies);
  }

  indicator.close();
}

//Event method to handle change of From and To currencies.
function onSelect(currency, type) {
  if(type == 0) {
    document.getElementById('fromCurrency').innerHTML = app.currncyNames[app.currencyCodes.indexOf(currency)];
    app.from = currency;
  } else {
    document.getElementById('toCurrency').innerHTML = app.currncyNames[app.currencyCodes.indexOf(currency)];
    app.to = currency;
  }

  updateCurrency();
}

//Method to calculate the currencies between multiple countires and update the result.
function updateCurrency() {
  var from = (app.from != "USD") ? app.currencies.rates[app.from] : 1;
  var to = (app.to != "USD") ? app.currencies.rates[app.to] : 1;


  var ratio = (1/from) * 100;

  var valueToConvert = document.getElementById('amount').value;

  if(valueToConvert <= 0) {
    valueToConvert = 1;
  }

  var ratio = ((to * ratio) / 100);
  var calculated = ratio * valueToConvert;

  document.getElementById('result').innerHTML = (calculated).toFixed(2);

  document.getElementById('dbUpdated').innerHTML = app.currencies.date;

  //Save this conversion in local database to show in Windows 10 tiles
  var converted = app.from + " - " + app.to + " = " + ratio.toFixed(2);
  saveLastConversion(converted);
}

function showToastInWindows10 () {
  if (typeof Windows !== 'undefined'&& typeof Windows.UI !== 'undefined' && typeof Windows.UI.Notifications !== 'undefined') {
    console.log("Windows 10 Supported.");
    var toastContent = new Windows.Data.Xml.Dom.XmlDocument();
    
    var toast = toastContent.createElement("toast");
    toastContent.appendChild(toast);
      
    var visual = toastContent.createElement("visual");
    toast.appendChild(visual);
      
    var binding = toastContent.createElement("binding");
    binding.setAttribute("template", "ToastGeneric");
    visual.appendChild(binding);
      
    // Title text
    var text = toastContent.createElement("text");
    text.innerText = "Hi! Now you can check the currency rates anytime.";
    binding.appendChild(text);
            
    // Override the app logo
    var appLogo = toastContent.createElement("image");
    appLogo.setAttribute("placement", "appLogoOverride");
    appLogo.setAttribute("src", "https://goodstudies.github.io/PWACurrencyConverterHostedWebApp/img/icon-152x152.png");
    appLogo.setAttribute("alt", "PWA-CC");
    binding.appendChild(appLogo);

    var notifications = Windows.UI.Notifications;
    var toast = new notifications.ToastNotification(toastContent);
    notifications.ToastNotificationManager.createToastNotifier().show(toast);
  } else {
    console.log("Windows 10 NOT Supported.");
  }
}

function showTileInWindows10 () {
  if (typeof Windows !== 'undefined'&& typeof Windows.UI !== 'undefined' && typeof Windows.UI.Notifications !== 'undefined') {
    console.log("Windows 10 Supported.");

    var tileContent = new Windows.Data.Xml.Dom.XmlDocument();
    
    var tile = tileContent.createElement("tile");
    tileContent.appendChild(tile);
      
    var visual = tileContent.createElement("visual");
    tile.appendChild(visual);
      
    var bindingMedium = tileContent.createElement("binding");
    bindingMedium.setAttribute("template", "TileMedium");
    visual.appendChild(bindingMedium);
      
    var peekImage = tileContent.createElement("image");
    peekImage.setAttribute("placement", "peek");
    peekImage.setAttribute("src", "https://goodstudies.github.io/PWACurrencyConverterHostedWebApp/img/icon-152x152.png");
    peekImage.setAttribute("alt", "PWA-CC");
    bindingMedium.appendChild(peekImage);

    var text = tileContent.createElement("text");
    text.setAttribute("hint-wrap", "true");
    text.innerText = "" + localStorage.otherConversions; 
    bindingMedium.appendChild(text);

    var notifications = Windows.UI.Notifications;
    var tileNotification = new notifications.TileNotification(tileContent);
    notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);
  } else {
    console.log("Windows 10 NOT Supported.");
  }
}

app.from.innerHTML = app.fromCurrencyName;
app.to.innerHTML = app.toCurrencyName;

getCurrencies(true);

showTileInWindows10();

showToastInWindows10();
