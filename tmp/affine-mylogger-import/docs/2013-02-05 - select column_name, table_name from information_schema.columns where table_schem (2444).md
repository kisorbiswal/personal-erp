---
source: mylogger
mylogger_id: 2444
created: 2013-02-05T08:13:07+00:00
created_raw: 2013-02-05 08:13:07
completed_raw: 
tags:
  - query
---

select column_name, table_name from information_schema.columns where table_schema='securegrcdb' and column_name like '%ucf_citation_id%' and table_name not like '%view%'; info schema
