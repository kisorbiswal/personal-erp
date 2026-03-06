# tag: psql

total: 3

## #13869
- added: 2018-03-21 10:34:09

CREATE EXTENSION postgis; -- Enable Topology CREATE EXTENSION postgis_topology;

---

## #13326
- added: 2017-07-17 13:04:05

CREATE ROLE panini WITH LOGIN PASSWORD 'Hd&23kd';\nCREATE DATABASE user_auth;\nGRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO panini;\n\npsql -U panini -h 127.0.0.1 user_auth\n\nsudo -u postgres psql

---

## #6273
- added: 2014-09-02 05:52:29

SELECT pg_terminate_backend(pg_stat_activity.procpid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'customer_support';

---
