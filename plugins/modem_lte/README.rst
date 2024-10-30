============================
Smart EQ - modem_lte: keep LTE modem connection 
============================

The module plugin keep LTE modem connection. At GSM will modem restart

------------
Installation
------------

1. Save :download:`modem_lte.js` as ``/store/scripts/lib/modem_lte.js``
2. Add line to ``/store/scripts/ovmsmain.js``:

  - ``modem_lte = require("lib/modem_lte");``

3. Issue ``script reload`` or evaluate the ``require`` line

-------------
Configuration
-------------

----------
Plugin API
----------
