---
mylogger_id: 3227
tags: [address]
added: "2013-04-23 10:07:00"
source: mylogger
---

# Note 3227

Tags: #address

CREATE TABLE  `postal_code_data` ( 
  `country_code` VARCHAR(2) NOT NULL, 
  `zip` VARCHAR(20) NOT NULL, 
  `place_name` VARCHAR(180) NOT NULL, 
  `state_name` VARCHAR(100) NOT NULL, 
  `state_code` VARCHAR(20) NOT NULL, 
  `city` VARCHAR(100), 
  `code2` VARCHAR(20), 
  `name3` VARCHAR(45), 
  `code3` VARCHAR(45), 
  `latitude` DOUBLE NOT NULL, 
  `longitude` DOUBLE NOT NULL 
) 
ENGINE = InnoDB;
