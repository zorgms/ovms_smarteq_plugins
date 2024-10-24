/*
    Installation:
     - Save as /store/scripts/lib/ios_tpms_fix.js
     - Add to /store/scripts/ovmsmain.js: ios_tpms_fix = require("lib/ios_tpms_fix");
     - Issue "script reload"
*/

// delete old events
PubSub.unsubscribe('clock.0503');
PubSub.unsubscribe('clock.1303');
PubSub.unsubscribe('clock.2103');

function ios_tpms_fix() {  
  OvmsCommand.Exec('me set v.t.temp 1,1,1,1');
}

PubSub.subscribe('clock.0503',ios_tpms_fix);
PubSub.subscribe('clock.1303',ios_tpms_fix);
PubSub.subscribe('clock.2103',ios_tpms_fix);
