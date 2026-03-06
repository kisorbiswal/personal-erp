---
mylogger_id: 2444
tags: [query]
added: "2013-02-05 08:13:07"
source: mylogger
---

# Note 2444

Tags: #query

select column_name, table_name from information_schema.columns where table_schema='securegrcdb' and column_name like '%ucf_citation_id%' and table_name not like '%view%'; info schema
