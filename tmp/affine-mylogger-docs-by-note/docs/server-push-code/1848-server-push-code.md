---
mylogger_id: 1848
tags: [server-push-code]
added: "2012-12-18 13:29:08"
source: mylogger
---

# Note 1848

Tags: #server-push-code

NotificationManager.register(createNotificationHandler()); 
private GenericAppEventHandler createNotificationHandler() { 
  GenericAppEventHandler  _genericAppEventHandler = new GenericAppEventHandler() { 
      @Override 
      public void onEventTrigger(GenericAppEvent event) { 
       if(event.getNotificationEventType()==NotificationEventType.SCAN_EVENT_UPDATE){ 
        updateUI(); 
       } 
         
      } 
  }; 
  return _genericAppEventHandler; 
 } 
  
  
private void fireScanerStatusEvent() { 
  NotificationEventHelper.fireEvent(NotificationEventType.SCAN_EVENT_UPDATE,partnerId,customerId,null); 
 }
