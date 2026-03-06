---
source: mylogger
mylogger_id: 13326
created: 2017-07-17T13:04:05+00:00
created_raw: 2017-07-17 13:04:05
completed_raw: 
tags:
  - psql
---

CREATE ROLE panini WITH LOGIN PASSWORD 'Hd&23kd';nCREATE DATABASE user_auth;nGRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO panini;nnpsql -U panini -h 127.0.0.1 user_authnnsudo -u postgres psql
