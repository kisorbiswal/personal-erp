---
source: mylogger
mylogger_id: 3609
created: 2013-06-03T14:15:00+00:00
created_raw: 2013-06-03 14:15:00
completed_raw: 2013-06-03 14:15:05
tags:
  - do
---

Extended Request factory servlet and attempted to do how we are doing by process call, first problem was it does not have all that it takes to serialize the exception, e.g Serialization policy etc. Then found that Request Factory does not return serialized exception, it just returns an error message.
