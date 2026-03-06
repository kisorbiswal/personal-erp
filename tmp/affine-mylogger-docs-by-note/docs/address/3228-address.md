---
mylogger_id: 3228
tags: [address]
added: "2013-04-23 10:08:24"
source: mylogger
---

# Note 3228

Tags: #address

SELECT * FROM postal_code_data c; 
 
LOAD DATA INFILE 'C:\\Users\\kisor.biswal.EGBALORE\\Desktop\\tmp\\postal\\all\\allCountries.txt' INTO TABLE postal_code_data FIELDS TERMINATED BY '\t' ;
