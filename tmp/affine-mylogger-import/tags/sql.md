# tag: sql

total: 9

## #13693
- added: 2018-01-03 08:51:42

https://begriffs.com/posts/2018-01-01-sql-keys-in-depth.html

---

## #7074
- added: 2014-12-31 04:51:34

CREATE OR REPLACE FUNCTION amcInstalationUpdate( ) RETURNS boolean AS\n$BODY$\nDECLARE\n    r      _amc_information%ROWTYPE;\n\tr1   _amc_instalment%ROWTYPE;\n    _no integer := 1;\n\tcid  _company%ROWTYPE;\nBEGIN\nFor cid in select id from _company\nloop \n\t_no:=1;\n\tFOR r IN\n\t\tSELECT id\n\t\tFROM   _amc_information  where _company_id = cid.id  order by created_Date\n\tLOOP\n\t\t For r1 In Select id from _amc_instalment where _amc = r.id  order by created_date \n\t\t Loop \n\t\t   UPDATE _amc_instalment set _installment_no = _no where id = r1.id;\n\t\t   _no := _no + 1;\n\t\t END Loop; \n\tEND LOOP;\nEnd loop;\nreturn true;\nEND;\n $BODY$\n  LANGUAGE plpgsql VOLATILE\n  COST 100;\nALTER FUNCTION amcInstalationUpdate()\n  OWNER TO meta;\nEND;\nselect amcInstalationUpdate() from _company;

---

## #6613
- added: 2014-10-24 11:47:38

Ecgine Release\n sudo su postgres psql SELECT pg_terminate_backend(pg_stat_activity.procpid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'cs_360_1'; //DROP CONNECTIONS drop database cs_360_1; create database cs_360_1; grant all privileges on database cs_360_1 to meta; \\q exit  //@meta: psql -U meta cs_360_1 < cs_360_21-Oct-2014-23-00 psql -U meta cs_360_1 < /mnt/projects/CS360/version2_csu.sql >>dumplog2.txt 2>&1

---

## #4343
- added: 2013-08-08 08:11:56

http://java.dzone.com/articles/10-common-mistakes-java Sedhu has sent

---

## #1123
- added: 2012-08-07 11:46:15

http://www.arubin.org/files/geo_search.pdf

---

## #954
- added: 2012-07-10 06:42:57

http://www.javacodegeeks.com/2012/07/ultimate-jpa-queries-and-tips-list-part.html

---

## #916
- added: 2012-07-04 10:12:44

http://www.slideshare.net/manikandakumar/mysql-query-and-index-tuning

---

## #887
- added: 2012-06-28 16:59:17

http://phpweby.com/tutorials/mysql/32 JOINs

---

## #377
- added: 2011-09-28 14:30:32

Sql injection http://download.oracle.com/docs/cd/E14072_01/appdev.112/e13995/oracle/jdbc/OracleDriver.html

---
