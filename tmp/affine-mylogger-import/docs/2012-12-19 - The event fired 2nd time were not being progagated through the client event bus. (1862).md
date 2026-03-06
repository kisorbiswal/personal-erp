---
source: mylogger
mylogger_id: 1862
created: 2012-12-19T13:00:36+00:00
created_raw: 2012-12-19 13:00:36
completed_raw: 2013-01-23 05:24:17
tags:
  - do
---

The event fired 2nd time were not being progagated through the client event bus. The GWT event type where different not geting that from NotificatinoEventHelper. Problem solved.
