---
source: mylogger
mylogger_id: 6273
created: 2014-09-02T05:52:29+00:00
created_raw: 2014-09-02 05:52:29
completed_raw: 
tags:
  - psql
---

SELECT pg_terminate_backend(pg_stat_activity.procpid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'customer_support';
