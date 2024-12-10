/*
    Installation:
     - Save as /store/scripts/lib/modem_wlan.js
     - Add to /store/scripts/ovmsmain.js: modem_wlan = require("lib/modem_wlan");
     - Issue "script reload"
*/


// create config usr value
var init_usrcfg = OvmsConfig.Get("usr","wlan.init", "no");

if(init_usrcfg == "no"){
    OvmsConfig.Set("usr", "wlan.init", "yes");      // init usr config
    OvmsConfig.Set("usr", "wlan.ticker", "60");    // ticker format 1/10/60/300/600/3600 seconds
    OvmsConfig.Set("usr", "wlan.ps_ticker", "0");   // PubSub ID subscription
    OvmsConfig.Set("usr", "wlan.setsq", "yes");
}

var wlan = {
  init: false,
  counter: 0,
  modemsq: OvmsConfig.Get("usr","wlan.setsq", "yes"),
  ticker: OvmsConfig.Get("usr","wlan.ps_ticker", "0"),       // subscription
};

// delete old events
PubSub.unsubscribe(wlan.ticker);

// get value
var ticker = 'ticker.' + OvmsConfig.Get("usr","wlan.ticker", "600");
var xsq_activated = OvmsConfig.Get("usr","xsq.activated","yes");

if (wlan.modemsq == "yes"){
  OvmsConfig.Set("network", "modem.sq.bad", "-95");
  OvmsConfig.Set("network", "modem.sq.good", "-93");
  OvmsConfig.Set("network", "wifi.sq.bad", "-89");
  OvmsConfig.Set("network", "wifi.sq.good", "-87");
  OvmsConfig.Set("usr", "wlan.setsq", "no");
}

function veh_on() {
  return OvmsMetrics.Value("v.e.on");
}

function v2connected() {
  return OvmsMetrics.Value("s.v2.connected");
}

function wlan_check() {
  var mobil_online = OvmsMetrics.Value("m.net.mdm.mode");
  var type_mode = OvmsMetrics.Value("m.net.type");
  var wifi_sq = OvmsMetrics.Value("m.net.wifi.sq");
  wlan.counter = wlan.counter +1;

  if ((wifi_sq <= -120) && (mobil_online.includes("Online")) && !type_mode.includes("modem") && !v2connected() && (wlan.counter > 5)){
      OvmsCommand.Exec("cellular setstate PowerOffOn");
      wlan.counter = 0;
  }
}

// event creating
if(!wlan.init){
  wlan.init = true;
  wlan.ticker = PubSub.subscribe('clock.0001',veh_on);
  PubSub.unsubscribe(wlan.ticker);
  wlan.ticker = PubSub.subscribe(ticker,wlan_check);
  OvmsConfig.Set("usr", "wlan.ps_ticker", wlan.ticker);
}
