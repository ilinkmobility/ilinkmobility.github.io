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
function getCurrencies() {
  var indicator = phonon.indicator('Please wait...', false);
  // Fetch the latest data.
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === HTTP_OK) {
        app.currencies = JSON.parse(request.response);
        updateCurrency();
        saveCurrencyRates();
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

  var calculated = ((to * ratio) / 100) * valueToConvert;

  document.getElementById('result').innerHTML = (calculated).toFixed(2);

  document.getElementById('dbUpdated').innerHTML = app.currencies.date;
}

app.from.innerHTML = app.fromCurrencyName;
app.to.innerHTML = app.toCurrencyName;

getCurrencies();

//Regestering the service worker if the working brower support it. (Eg. Chrome, MS Edge)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
           .register('./service-worker.js')
           .then(function() { console.log('Service Worker Registered'); });
}