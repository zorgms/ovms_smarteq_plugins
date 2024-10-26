/*
    Installation:
     - Save as /store/scripts/lib/ios_tpms_fix.js
     - Add to /store/scripts/ovmsmain.js: ios_tpms_fix = require("lib/ios_tpms_fix");
     - Issue "script reload"
*/

var tpms_etemp = Number(OvmsMetrics.Value("v.e.temp"));
OvmsCommand.Exec('me set v.t.temp ' + tpms_etemp + "," + tpms_etemp + "," + tpms_etemp + "," + tpms_etemp);

function ios_tpms_fix() {  
  var tpms_etemp = Number(OvmsMetrics.Value("v.e.temp"));
  OvmsCommand.Exec('me set v.t.temp ' + tpms_etemp + "," + tpms_etemp + "," + tpms_etemp + "," + tpms_etemp);
}

PubSub.subscribe('ticker.3600',ios_tpms_fix);
