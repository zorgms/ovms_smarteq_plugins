/*
    Installation:
     - Save as /store/scripts/lib/ios_tpms_fix.js
     - Add to /store/scripts/ovmsmain.js: ios_tpms_fix = require("lib/ios_tpms_fix");
     - Issue "script reload"
*/

var tpms_etemp = OvmsMetrics.Value("v.e.temp");
var tpms_ecabintemp = OvmsMetrics.Value("v.e.cabintemp");
OvmsCommand.Exec('me set v.t.temp ' + tpms_ecabintemp + "," + tpms_ecabintemp + "," + tpms_etemp + "," + tpms_etemp);

function ios_tpms_fix() {  
  var tpms_etemp = OvmsMetrics.Value("v.e.temp");
  var tpms_ecabintemp = OvmsMetrics.Value("v.e.cabintemp");
  OvmsCommand.Exec('me set v.t.temp ' + tpms_ecabintemp + "," + tpms_ecabintemp + "," + tpms_etemp + "," + tpms_etemp);
}

PubSub.subscribe('ticker.3600',ios_tpms_fix);
