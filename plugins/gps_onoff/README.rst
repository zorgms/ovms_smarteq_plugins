============================
Smart EQ - gps_onoff: switch off the GPS when parking
============================

The module plugin switch off the GPS for energy saving when the car is parking

------------
Installation
------------

1. Save :download:`gps_onoff.js` as ``/store/scripts/lib/gps_onoff.js``
2. Add line to ``/store/scripts/ovmsmain.js``:

  - ``gps_onoff = require("lib/gps_onoff");``

3. Issue ``script reload`` or evaluate the ``require`` line

-------------
Configuration
-------------

----------
Plugin API
----------
