---
source: mylogger
mylogger_id: 2301
created: 2013-01-25T04:28:14+00:00
created_raw: 2013-01-25 04:28:14
completed_raw: 
tags:
  - egestalt
---

Yesterday complete 2nd half upto 8.30pm spent on finding the reason for Application deadlock, all people worked. I went throgh the code of eclipse link and found a indefinite loop. Then had meeting with Raghu, Mani and Bhaswant, concluded that the change in AbstractDatabaseService to create single EntityManagerFactory by Bindu would have lead to this. So Plan is to revert the code and test. Later remove all connection leaks and make EntityManagerFactorySingleton.
