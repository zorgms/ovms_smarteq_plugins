/*
    Installation:
     - Save as /store/scripts/lib/xsq_test.js
     - Add to /store/scripts/ovmsmain.js: xsq_test = require("lib/xsq_test");
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
function charge_port() {
    return OvmsMetrics.Value("v.d.cp");
}
function bus_awake() {
    return OvmsMetrics.Value("xsq.v.bus.awake");
}

function xsq_data_v2() {

    var xsq_activated = OvmsConfig.Get("usr","xsq.activated","yes");

    if((xsq_activated == "yes") && (veh_on() || charging() || bus_awake())) {

        var newdata = OvmsConfig.Get("usr", "xsq.data", "0,0,0,0,0,0").split(",");

        var xsq_energy_hv = OvmsMetrics.Value("xsq.evc.hv.energy");

        //  config set usr xsq.data 1,1,0,1,1,0
        if (newdata[0] == 1) {
            OvmsCommand.Exec('me set v.b.power '+ xsq_energy_hv);
        }
        if (newdata[1] == 1) {
            var xsq_use_reset = OvmsMetrics.Value("xsq.use.at.reset");
            OvmsCommand.Exec('me set v.i.power '+ xsq_use_reset);
        }
        if (newdata[2] == 1) {
            var xsq_odo_start = OvmsMetrics.Value("xsq.odometer.start");
            OvmsCommand.Exec('me set  '+ xsq_odo_start);
        }
        if (newdata[3] == 1) {
            var xsq_efficiency = OvmsMetrics.Value("v.c.efficiency");
            if(charge_port() && (xsq_efficiency >0)){
                OvmsCommand.Exec('me set v.i.efficiency '+ xsq_efficiency);
            }
        }        
        if (newdata[4] == 1) {
            var xsq_time = OvmsMetrics.Value("v.c.time");
            if(charge_port() && (xsq_time > 0)){
                OvmsCommand.Exec('me set v.c.12v.current '+ xsq_time);
            }
        }
        
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
