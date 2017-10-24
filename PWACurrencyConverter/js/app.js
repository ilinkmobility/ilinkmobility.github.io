var app = {
  from: "USD",
  to: "INR",
  fromCurrencyName: "US Dollar",
  toCurrencyName: "Indian Rupee",
  currencies: {},
  currencyCodes: ["AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", "HRK", "HUF", "IDR", "ILS", "INR", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PLN", "RON", "RUB", "SEK", "SGD", "THB", "TRY", "USD", "ZAR"],  	currncyNames: ["Australian Dollar", "Bulgarian Lev", "Brazilian Real", "Canadian Dollar", "Swiss Franc", "Chinese Yuan", "Czech Koruna", "Danish Krone", "Euro", "British Pound", "Hong Kong Dollar", "Croatian Kuna", "Hungarian Forint", "Indonesian Rupiah", "Israeli Shekel", "Indian Rupee", "Japanese Yen", "Korean Won", "Mexican Peso", "Malaysian Ringgit", "Norwegian Krone", "New Zealand Dollar", "Philippine Peso", "Polish Zloty", "Romanian Leu", "Russian Rouble", "Swedish Krona", "Singapore Dollar", "Thai Baht", "Turkey Lira", "US Dollar", "South African Rand"]
};

var url = 'https://api.fixer.io/latest?base=USD';
var indicator;

function getCurrencies() {
  var indicator = phonon.indicator('Please wait...', false);
  // Fetch the latest data.
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
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
  request.open('GET', url);
  request.send();
};

function saveCurrencyRates() {
  var currencies = JSON.stringify(app.currencies);
  localStorage.currencies = currencies;
}

function loadPreviousCurrencyRates() {
  app.currencies = localStorage.currencies;
  if (app.currencies) {
    app.currencies = JSON.parse(app.currencies);
  }

  indicator.close();
}

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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
           .register('./service-worker.js')
           .then(function() { console.log('Service Worker Registered'); });
}