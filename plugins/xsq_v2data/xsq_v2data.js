/*
    Installation:
     - Save as /store/scripts/lib/xsq_v2data.js
     - Add to /store/scripts/ovmsmain.js: xsq_v2data = require("lib/xsq_v2data");
     - Issue "script reload"
*/


// create config usr value
var init_usrcfg = OvmsConfig.Get("usr","xsq.init", "no");

if(init_usrcfg == "no"){
    OvmsConfig.Set("usr", "xsq.init", "yes");       // init usr config
    OvmsConfig.Set("usr", "xsq.activated", "yes");   // ticker activated     
    OvmsConfig.Set("usr", "xsq.ticker", "10");     	// ticker format 1/10/60/300/600/3600 seconds
}

var state = {
    start_charging: false,       // switch for start charge
    start_kwh: 0.00
};

// delete old events
PubSub.unsubscribe(xsq_data_v2);

// get value
var xsq_ticker = 'ticker.' + OvmsConfig.Get("usr","xsq.ticker","10");
var xsq_activated = OvmsConfig.Get("usr","xsq.activated","yes");

function veh_on() {
    return OvmsMetrics.Value("v.e.on");
}
function charging() {
    return OvmsMetrics.Value("v.c.charging");
}
function bus_awake() {
    return OvmsMetrics.Value("xsq.v.bus.awake");
}

function xsq_data_v2() {

    var xsq_activated = OvmsConfig.Get("usr","xsq.activated","yes");

    if((xsq_activated == "yes") && (veh_on() || charging() || bus_awake())) {

        var xsq_energy_hv = OvmsMetrics.Value("xsq.evc.hv.energy");
        OvmsCommand.Exec('me set v.b.power '+ xsq_energy_hv);

        var xsq_use_reset = OvmsMetrics.Value("xsq.use.at.reset");
        OvmsCommand.Exec('me set v.i.power '+ xsq_use_reset);

        if(charging() && !state.start_charging){
            state.start_charging = true;
            state.start_kwh = xsq_energy_hv;
        }
        if(!charging() && state.start_charging){
            state.start_charging = false;
        }
        if(state.start_charging){
            var charged = Number(xsq_energy_hv) - Number(state.start_kwh);
            OvmsCommand.Exec('me set v.c.kwh '+ charged);
        }
    }
}

// event creating
if(xsq_activated == "yes"){
    PubSub.subscribe(xsq_ticker,xsq_data_v2);
}
