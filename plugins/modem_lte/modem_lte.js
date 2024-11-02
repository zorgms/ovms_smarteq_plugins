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
}

var lte = {
  init: false,
  counter: 0,
  gsm2lte: Number(OvmsConfig.Get("usr","lte.gsm2lte", "0")),
  ticker: OvmsConfig.Get("usr","lte.ps_ticker", "0"),       // subscription
};

// delete old events
PubSub.unsubscribe(lte.ticker);

// get value
var ticker = 'ticker.' + OvmsConfig.Get("usr","lte.ticker", "600");

function veh_on() {
  return OvmsMetrics.Value("v.e.on");
}

function lte_check() {
  var lte_mode = OvmsMetrics.Value("m.net.mdm.mode").split(",");
  var lte_network = OvmsMetrics.Value("m.net.mdm.network");
  var lte_reg = OvmsMetrics.Value("m.net.mdm.netreg");

  if ((lte_mode[0] != "LTE") && (lte_network == "modem") && (lte_reg == "RegisteredRoaming")) {
      lte.counter = lte.counter +1;
      lte.gsm2lte = lte.gsm2lte +1;
      OvmsConfig.Set("usr", "lte.gsm2lte", lte.gsm2lte);
      if(lte.counter > 5) {
        lte.counter = 0;
        OvmsConfig.Set("usr", "lte.ps_ticker", "0");
        OvmsCommand.Exec("mo re");
      } else {
        OvmsCommand.Exec("cellular setstate PowerOffOn");
      }
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
