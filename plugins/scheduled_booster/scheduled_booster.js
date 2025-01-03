/*
    Installation:
     - Save as /store/scripts/lib/scheduled_booster.js
     - Add to /store/scripts/ovmsmain.js: scheduled_booster = require("lib/scheduled_booster");
     - Issue "script reload"
*/

// create config usr value
var init_usrcfg = OvmsConfig.Get("usr","b.init", "no");

if(init_usrcfg == "no"){
    OvmsConfig.Set("usr", "b.init", "yes");           // init usr config
    OvmsConfig.Set("usr", "b.activated", "no");       // schedule time activated
    OvmsConfig.Set("usr", "b.week", "no");            // schedule time weekly at Day de/activated   
    OvmsConfig.Set("usr", "b.scheduled", "0515");     // schedule time format 1400 for 14:00 / 2 p.m. o'clock 
    OvmsConfig.Set("usr", "b.day_start", "1");        // Day1 -> Monday
    OvmsConfig.Set("usr", "b.day_end", "6");          // Day5 -> Friday + 1 switched at midnight
    OvmsConfig.Set("usr", "b.scheduled_2", "no");     // double schedule time for 10 min.
    OvmsConfig.Set("usr", "b.ticker", "10");     	  // ticker format 1/10/60/300/600/3600 seconds
    OvmsConfig.Set("usr", "b.data", "0,0,0,0,-1,-1,-1"); // Data Array
    OvmsConfig.Set("usr", "b.ps_start_day", "0");        // PubSub ID start_day subscription
    OvmsConfig.Set("usr", "b.ps_end_day", "0");        // PubSub ID end_day subscription
    OvmsConfig.Set("usr", "b.ps_scheduled_boost", "0");     // PubSub ID scheduled_boost subscription
    OvmsConfig.Set("usr", "b.ps_scheduled_boost_2", "0");   // PubSub ID scheduled_boost_2 subscription, boost two times
    OvmsConfig.Set("usr", "b.ps_data", "0");      // PubSub ID booster_data subscription
}

var booster = {
    init: false,
    start_day: OvmsConfig.Get("usr","b.ps_start_day", "0"),       // start_day subscription
    end_day: OvmsConfig.Get("usr","b.ps_end_day", "0"),         // end_day subscription
    scheduled_boost: OvmsConfig.Get("usr","b.ps_scheduled_boost", "0"), // scheduled_boost subscription
    scheduled_boost_2: OvmsConfig.Get("usr","b.ps_scheduled_boost_2", "0"), // scheduled_boost_2 subscription, boost two times
    data: OvmsConfig.Get("usr","b.ps_data", "0"),    // booster_data subscription
    metrics: false,
    activated: OvmsConfig.Get("usr","b.activated", "no"),
    week: OvmsConfig.Get("usr","b.week", "no"),
    scheduled: OvmsConfig.Get("usr","b.scheduled", "0515"),
    ds: OvmsConfig.Get("usr","b.day_start", "0"),
    de: OvmsConfig.Get("usr","b.day_end", "0"),
    bdt: OvmsConfig.Get("usr","b.scheduled_2", "0"),
    current: 1,
};

// unsubscribe earlier PubSubscribe
PubSub.unsubscribe(booster.start_day);
PubSub.unsubscribe(booster.end_day);
PubSub.unsubscribe(booster.scheduled_boost);
PubSub.unsubscribe(booster.scheduled_boost_2);
PubSub.unsubscribe(booster.data);

// get/set value
OvmsConfig.Delete("usr", "b.data");
var scheduled_ticker = 'ticker.' + OvmsConfig.Get("usr","b.ticker","10");

function veh_on() {
    return OvmsMetrics.Value("v.e.on");
}

function veh_hvac() {
    return OvmsMetrics.Value("v.e.hvac");
}

function start_day() {
    if (OvmsConfig.Get("usr","b.week") == "yes"){
        OvmsConfig.Set("usr", "b.activated", "yes");
    }
}

function end_day() {
    if (OvmsConfig.Get("usr","b.week") == "yes") {
        OvmsConfig.Set("usr", "b.activated", "no");
    }
}
// scheduled booster time
function scheduled_boost() {
    if(!veh_on() && !veh_hvac() && (OvmsConfig.Get("usr","b.activated") == "yes")) {
        OvmsVehicle.ClimateControl("on");
        if (OvmsConfig.Get("usr","b.scheduled_2") == "yes") {
            booster.scheduled_boost_2 = PubSub.subscribe('ticker.60',scheduled_boost_2);
            OvmsConfig.Set("usr", "b.ps_scheduled_boost_2", booster.scheduled_boost_2);
        }
    }
}
// scheduled booster time add a second booster time for 10 min. booster
function scheduled_boost_2() {
    if(!veh_on() && !veh_hvac()) {
        OvmsVehicle.ClimateControl("on");
        PubSub.unsubscribe(booster.scheduled_boost_2);
    }
    if(veh_on()) {
        PubSub.unsubscribe(booster.scheduled_boost_2);
    }
}

function booster_data() {

    var newdata = OvmsConfig.Get("usr", "b.data", "0,0,0,0,-1,-1,-1").split(",");
    if (newdata[0] == 1) {
        var newdataapp = OvmsMetrics.Value("v.g.mode").split(",");
        booster.activated = newdataapp[1];
        booster.week = newdataapp[2];
        booster.scheduled = newdataapp[3];
        booster.ds = newdataapp[4];
        booster.de = newdataapp[5];
        booster.bdt = newdataapp[6];
        booster.current = booster.current + 1;
        // booster scheduled on
        if (newdata[1] == 1) {
            OvmsConfig.Set("usr", "b.activated", "yes");
            booster.activated = "yes";
            if(newdata[3] == 0){
                PubSub.unsubscribe(booster.scheduled_boost);
                var ClockEvent = 'clock.' + OvmsConfig.Get("usr","b.scheduled");
                booster.scheduled_boost = PubSub.subscribe(ClockEvent,scheduled_boost);
                OvmsConfig.Set("usr", "b.ps_scheduled_boost", booster.scheduled_boost);
                booster.week = "no";
            }
        }
        // booster scheduled off
        if (newdata[1] == 2) {
            OvmsConfig.Set("usr", "b.activated", "no");
            booster.activated = "no";
        }
        // boost every day between start/end day on
        if (newdata[2] == 1) {
            OvmsConfig.Set("usr", "b.week", "yes");
            booster.week = "yes";
        }
        // boost every day between start/end day off
        if (newdata[2] == 2) {
            OvmsConfig.Set("usr", "b.week", "no");
            booster.week = "no";
        }
        // booster scheduled time + boost scheduled on
        if (newdata[3]> 0) {
            PubSub.unsubscribe(booster.scheduled_boost);
            OvmsConfig.Set("usr", "b.scheduled", newdata[3]);
            booster.scheduled = newdata[3]
            var ClockEvent = 'clock.' + newdata[3];
            booster.scheduled_boost = PubSub.subscribe(ClockEvent,scheduled_boost);
            OvmsConfig.Set("usr", "b.ps_scheduled_boost", booster.scheduled_boost);
        }
        // booster start day + boost scheduled on + boost weekly on
        if (newdata[4] > -1) {
            PubSub.unsubscribe(booster.start_day);
            // add one Day for execute on last Day, Day 7 not possible -> set Day 0 for Sunday
            if (newdata[4] > 6) {
                var scheduled_start = 0;
            } else {
                var scheduled_start = newdata[4];
            };
            OvmsConfig.Set("usr", "b.day_start", scheduled_start);
            booster.ds = scheduled_start
            var DayStart = 'clock.day' + scheduled_start;
            booster.start_day = PubSub.subscribe(DayStart,start_day);
            OvmsConfig.Set("usr", "b.ps_start_day", booster.start_day);
        }
        // booster stop day
        if (newdata[5] > -1) {
            PubSub.unsubscribe(booster.end_day);
            // add one Day for execute on last Day, Day 7 not possible -> set Day 0 for Sunday
            if (newdata[5] <= 5) {
                var scheduled_end = (Number(newdata[5]) +1);
            } else {
                var scheduled_end = 0;
            };
            OvmsConfig.Set("usr", "b.day_end", scheduled_end);
            booster.de = scheduled_end;
            var DayEnd = 'clock.day' + scheduled_end;
            booster.end_day = PubSub.subscribe(DayEnd,end_day);
            OvmsConfig.Set("usr", "b.ps_end_day", booster.end_day);
        }
        // double booster time
        if (newdata[6] == 1) {
            OvmsConfig.Set("usr", "b.scheduled_2", "yes");
            if(booster.metrics){
                OvmsCommand.Exec('me set v.e.booster.bdt yes');
                booster.bdt = "yes";
            }
        }
        // single booster time
        if (newdata[6] == 0) {
            OvmsConfig.Set("usr", "b.scheduled_2", "no");
            booster.bdt = "no";
        }
        OvmsConfig.Set("usr", "b.data", "0,0,0,0,-1,-1,-1");
        if(booster.metrics){
            OvmsCommand.Exec('me set v.g.mode booster,' + booster.activated + "," + booster.week + "," +  booster.scheduled + "," +  booster.ds + "," +  booster.de + "," +  booster.bdt);
            OvmsCommand.Exec('me set v.g.current ' + booster.current)
        }
        if(booster.current > 10){
            booster.current = 1;
        }
    }
}

// event creating
if(!booster.init){
    booster.init = true;
    booster.scheduled_boost = PubSub.subscribe('clock.0001',veh_on);
    PubSub.unsubscribe(booster.scheduled_boost);
    booster.scheduled_boost_2 = PubSub.subscribe('clock.0001',veh_on);
    PubSub.unsubscribe(booster.scheduled_boost_2);
    var ClockEvent = 'clock.' + OvmsConfig.Get("usr","b.scheduled");
    booster.scheduled_boost = PubSub.subscribe(ClockEvent,scheduled_boost);
    OvmsConfig.Set("usr", "b.ps_scheduled_boost", booster.scheduled_boost);

    booster.start_day = PubSub.subscribe('clock.0001',veh_on);
    PubSub.unsubscribe(booster.start_day);
    booster.end_day = PubSub.subscribe('clock.0001',veh_on);
    PubSub.unsubscribe(booster.end_day);
    var DayStart = 'clock.day' + OvmsConfig.Get("usr","b.day_start");
    var DayEnd = 'clock.day' + OvmsConfig.Get("usr","b.day_end");
    booster.start_day = PubSub.subscribe(DayStart,start_day);
    booster.end_day = PubSub.subscribe(DayEnd,end_day);
    OvmsConfig.Set("usr", "b.ps_start_day", booster.start_day);
    OvmsConfig.Set("usr", "b.ps_end_day", booster.end_day);

    booster.data = PubSub.subscribe(scheduled_ticker,booster_data);
    OvmsConfig.Set("usr", "b.ps_data", booster.data);
    if(OvmsConfig.Get("module", "cfgversion") >= 2024112200) {
        booster.metrics = true;
        OvmsCommand.Exec('me set v.g.mode booster,'+ booster.activated + "," + booster.week + "," +  booster.scheduled + "," +  booster.ds + "," +  booster.de + "," +  booster.bdt);
        OvmsCommand.Exec('me set v.g.current 1')
    }
}
