# tag: egestalt

total: 6

## #2301
- added: 2013-01-25 04:28:14

Yesterday complete 2nd half upto 8.30pm spent on finding the reason for Application deadlock, all people worked. I went throgh the code of eclipse link and found a indefinite loop. Then had meeting with Raghu, Mani and Bhaswant, concluded that the change in AbstractDatabaseService to create single EntityManagerFactory by Bindu would have lead to this. So Plan is to revert the code and test. Later remove all connection leaks and make EntityManagerFactorySingleton.

---

## #2295
- added: 2013-01-24 09:39:52

http://www.unifiedcompliance.com/

---

## #2289
- added: 2013-01-23 12:52:30

Today implemented async callback that calls all the methods that failed authentication, earlier it used call the first one rest were ignored.

---

## #2288
- added: 2013-01-23 12:51:34

Found the instance variables in service impl classes. Older day.

---

## #2203
- added: 2013-01-19 20:32:51

Server Push using GWT Event Service, Registration Workflow. UCF data updating.

---

## #1658
- added: 2012-11-30 11:28:58

PF balance in Qvantel account is EE 25638 and ER 19483

---
