============================
Smart EQ - booster_12V: 12V Check'n'charge
============================

The module plugin checked the 12V battery metrics (voltage) twice per day.
If the 12V less then 12V alert setting, this plugin start the Booster two times to charge the 12V

------------
Installation
------------

1. Save :download:`booster_12V.js` as ``/store/scripts/lib/booster_12V.js``
2. Add line to ``/store/scripts/ovmsmain.js``:

  - ``booster_12V = require("lib/booster_12V");``

3. Issue ``script reload`` or evaluate the ``require`` line

-------------
Configuration
-------------

----------
Plugin API
----------
