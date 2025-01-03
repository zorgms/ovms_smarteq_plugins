/*
    Installation:
     - Save as /store/scripts/lib/modem_lte.js
     - Add to /store/scripts/ovmsmain.js: modem_lte = require("lib/modem_lte");
     - Issue "script reload"
*/


// create config usr value
var init_usrcfg = OvmsConfig.Get("usr","lte.init", "no");

if(init_usrcfg == "no"){
    OvmsConfig.Set("usr", "lte.init", "yes");      // init usr config
    OvmsConfig.Set("usr", "lte.ticker", "600");    // ticker format 1/10/60/300/600/3600 seconds
    OvmsConfig.Set("usr", "lte.ps_ticker", "0");   // PubSub ID subscription
    OvmsConfig.Set("usr", "lte.gsm2lte", "0");
    OvmsConfig.Set("usr", "lte.setsq", "yes");
}

var lte = {
  init: false,
  counter: 0,
  modemsq: OvmsConfig.Get("usr","lte.setsq", "yes"),
  gsm2lte: Number(OvmsConfig.Get("usr","lte.gsm2lte", "0")),
  ticker: OvmsConfig.Get("usr","lte.ps_ticker", "0"),       // subscription
};

// delete old events
PubSub.unsubscribe(lte.ticker);

// get value
var ticker = 'ticker.' + OvmsConfig.Get("usr","lte.ticker", "600");
var xsq_activated = OvmsConfig.Get("usr","xsq.activated","yes");

if (lte.modemsq == "yes"){
  OvmsConfig.Set("network", "modem.sq.bad", "-95");
  OvmsConfig.Set("network", "modem.sq.good", "-90");
  OvmsConfig.Set("network", "wifi.sq.bad", "-89");
  OvmsConfig.Set("network", "wifi.sq.good", "-85");
  OvmsConfig.Set("usr", "lte.setsq", "no");
}

function veh_on() {
  return OvmsMetrics.Value("v.e.on");
}

function lte_check() {
  var lte_mode = OvmsMetrics.Value("m.net.mdm.mode");

  if (lte_mode.includes("GSM")) {
    lte.counter = lte.counter +1;
    lte.gsm2lte = lte.gsm2lte +1;
    OvmsConfig.Set("usr", "lte.gsm2lte", lte.gsm2lte);
    if(lte.counter > 5) {
      lte.counter = 0;
      OvmsConfig.Set("usr", "lte.ps_ticker", "0");
      OvmsCommand.Exec("cellular setstate PowerOffOn");
    } else {
      OvmsCommand.Exec('cellular cmd AT+COPS=0,0,"Telekom.de",7');
    }
  }
  if ((lte_mode.includes("LTE"))&&(lte.counter > 0)) {
    lte.counter = 0;
  }
}

// event creating
if(!lte.init){
  lte.init = true;
  lte.ticker = PubSub.subscribe('clock.0001',veh_on);
  PubSub.unsubscribe(lte.ticker);
  lte.ticker = PubSub.subscribe(ticker,lte_check);
  OvmsConfig.Set("usr", "lte.ps_ticker", lte.ticker);
}
