---
source: mylogger
mylogger_id: 1848
created: 2012-12-18T13:29:08+00:00
created_raw: 2012-12-18 13:29:08
completed_raw: 
tags:
  - server push code
---

NotificationManager.register(createNotificationHandler()); nprivate GenericAppEventHandler createNotificationHandler() { n  GenericAppEventHandler  _genericAppEventHandler = new GenericAppEventHandler() { n      @Override n      public void onEventTrigger(GenericAppEvent event) { n       if(event.getNotificationEventType()==NotificationEventType.SCAN_EVENT_UPDATE){ n        updateUI(); n       } n         n      } n  }; n  return _genericAppEventHandler; n } n  n  nprivate void fireScanerStatusEvent() { n  NotificationEventHelper.fireEvent(NotificationEventType.SCAN_EVENT_UPDATE,partnerId,customerId,null); n }
