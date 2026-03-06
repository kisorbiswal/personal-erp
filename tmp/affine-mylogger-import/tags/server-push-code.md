# tag: server push code

total: 1

## #1848
- added: 2012-12-18 13:29:08

NotificationManager.register(createNotificationHandler()); \nprivate GenericAppEventHandler createNotificationHandler() { \n  GenericAppEventHandler  _genericAppEventHandler = new GenericAppEventHandler() { \n      @Override \n      public void onEventTrigger(GenericAppEvent event) { \n       if(event.getNotificationEventType()==NotificationEventType.SCAN_EVENT_UPDATE){ \n        updateUI(); \n       } \n         \n      } \n  }; \n  return _genericAppEventHandler; \n } \n  \n  \nprivate void fireScanerStatusEvent() { \n  NotificationEventHelper.fireEvent(NotificationEventType.SCAN_EVENT_UPDATE,partnerId,customerId,null); \n }

---
