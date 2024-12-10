============================
Smart EQ - modem_wlan: switch WLAN/LTE modem connection 
============================

The module plugin switch WLAN/LTE modem connection. At GSM will modem restart

------------
Installation
------------

1. Save :download:`modem_wlan.js` as ``/store/scripts/lib/modem_wlan.js``
2. Add line to ``/store/scripts/ovmsmain.js``:

  - ``modem_wlan = require("lib/modem_wlan");``

3. Issue ``script reload`` or evaluate the ``require`` line

-------------
Configuration
-------------

----------
Plugin API
----------
