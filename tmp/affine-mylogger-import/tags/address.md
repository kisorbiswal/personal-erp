# tag: address

total: 6

## #45235
- added: 2021-12-21 08:56:08

Akhi Bangalore \nT2, #24, 12th Main Road, Mallesh Palya, Bangalore -75. Land mark near creme cake shop.

---

## #7868
- added: 2015-05-06 06:20:31

H.No. 37-103/1/1, 202, IInd Floor, Nagarjuna Arcade, Plot No. 10 & 25, Naredmet 'X' Road, P.O. R.K. Puram, Sri colony, Secunderabad, Telangana 500056 Phone:099591 52726, TIN Facility

---

## #6068
- added: 2014-07-31 07:21:04

House No: 2-C/1083, Sector-11, CDA, Cuttack-753014, Odisha, India

---

## #5954
- added: 2014-07-18 13:38:59

House No: 2-C/1083, Sector-11, CDA, Cuttack-753014

---

## #3228
- added: 2013-04-23 10:08:24

SELECT * FROM postal_code_data c; \n \nLOAD DATA INFILE 'C:\\\\Users\\\\kisor.biswal.EGBALORE\\\\Desktop\\\\tmp\\\\postal\\\\all\\\\allCountries.txt' INTO TABLE postal_code_data FIELDS TERMINATED BY '\\t' ;

---

## #3227
- added: 2013-04-23 10:07:00

CREATE TABLE  `postal_code_data` ( \n  `country_code` VARCHAR(2) NOT NULL, \n  `zip` VARCHAR(20) NOT NULL, \n  `place_name` VARCHAR(180) NOT NULL, \n  `state_name` VARCHAR(100) NOT NULL, \n  `state_code` VARCHAR(20) NOT NULL, \n  `city` VARCHAR(100), \n  `code2` VARCHAR(20), \n  `name3` VARCHAR(45), \n  `code3` VARCHAR(45), \n  `latitude` DOUBLE NOT NULL, \n  `longitude` DOUBLE NOT NULL \n) \nENGINE = InnoDB;

---
