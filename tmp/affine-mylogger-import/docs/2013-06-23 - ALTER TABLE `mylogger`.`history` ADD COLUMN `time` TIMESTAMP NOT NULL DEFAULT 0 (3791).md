---
source: mylogger
mylogger_id: 3791
created: 2013-06-23T05:20:18+00:00
created_raw: 2013-06-23 05:20:18
completed_raw: 
tags:
  - dev
---

ALTER TABLE `mylogger`.`history` ADD COLUMN `time` TIMESTAMP NOT NULL DEFAULT 0 AFTER `query`;
