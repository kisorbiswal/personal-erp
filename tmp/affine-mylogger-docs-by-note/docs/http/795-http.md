---
mylogger_id: 795
tags: [http]
added: "2012-06-15 14:41:56"
source: mylogger
---

# Note 795

Tags: #http

Payload is not sent in parameter map when enctype="multipart/form-data" it should be "application/x-www-form-urlencoded". Default is application/x-www-form-urlencoded but some APIs may use differnt enctype as default.
