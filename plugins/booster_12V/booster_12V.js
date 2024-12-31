/*
    Installation:
     - Save as /store/scripts/lib/booster_12v.js
     - Add to /store/scripts/ovmsmain.js: booster_12v = require("lib/booster_12v");
     - Issue "script reload"
*/


// create config usr value
var init_usrcfg = OvmsConfig.Get("usr","12v.init", "no");

if(init_usrcfg == "no"){
    OvmsConfig.Set("usr", "12v.init", "yes");      // init usr config
    OvmsConfig.Set("usr", "12v.charging", "yes");  // activate 12V charging events
    OvmsConfig.Set("usr", "12v.ps_time_1", "0");       // PubSub ID time 1 subscription
    OvmsConfig.Set("usr", "12v.ps_booster_2", "0");    // PubSub ID 2x booster subscription
}

var state_12v = {
  init: false,
  alert: false,
  time_1: OvmsConfig.Get("usr","12v.ps_time_1", "0"),       // time 1 subscription
  booster_2: OvmsConfig.Get("usr","12v.ps_booster_2", "0"), // 2x booster subscription
};

// delete old events
PubSub.unsubscribe(state_12v.time_1);
PubSub.unsubscribe(state_12v.booster_2);

// get value
var time_on_1 = 'clock.' + OvmsConfig.Get("usr","12v.time_1", "1900"); 
var charging_12v = OvmsConfig.Get("usr", "12v.charging", "yes");

function veh_on() {
  return OvmsMetrics.Value("v.e.on");
}
function charging() {
  return OvmsMetrics.Value("v.c.charging");
}

function veh_hvac() {
  return OvmsMetrics.Value("v.e.hvac");
}

function alert_12v() {
  return OvmsMetrics.Value("v.b.12v.voltage.alert");
}

function charge_12v_check() {

  if(!veh_on() && !charging())  {
      if (alert_12v() && !state_12v.alert) {
        state_12v.alert = true;
        OvmsVehicle.ClimateControl("on");
        state_12v.booster_2 = PubSub.subscribe('ticker.60',charge_12v_boost_2);
        OvmsConfig.Set("usr", "12v.ps_booster_2", state_12v.booster_2);
      }
  }
}

// scheduled booster time add a second booster time for 10 min. booster
function charge_12v_boost_2() {
  if(!veh_on() && !charging() && !veh_hvac()) {
    OvmsVehicle.ClimateControl("on");
    state_12v.alert = false;
    PubSub.unsubscribe(state_12v.booster_2);
  }
  if(veh_on()) {
    state_12v.alert = false;
    PubSub.unsubscribe(state_12v.booster_2);
  }
}

// event creating
if(!state_12v.init){
  state_12v.init = true;
  state_12v.time_1 = PubSub.subscribe('clock.0001',veh_on);
  PubSub.unsubscribe(state_12v.time_1);
  state_12v.booster_2 = PubSub.subscribe('clock.0001',veh_on);
  PubSub.unsubscribe(state_12v.booster_2);
  state_12v.time_1 = PubSub.subscribe('vehicle.alert.12v.on',charge_12v_check);
  OvmsConfig.Set("usr", "12v.ps_time_1", state_12v.time_1);
}
