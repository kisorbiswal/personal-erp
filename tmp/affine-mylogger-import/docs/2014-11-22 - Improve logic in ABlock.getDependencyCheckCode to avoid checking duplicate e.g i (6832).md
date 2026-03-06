---
source: mylogger
mylogger_id: 6832
created: 2014-11-22T10:50:21+00:00
created_raw: 2014-11-22 10:50:21
completed_raw: 2015-09-08 07:10:03
tags:
  - cdo
---

Improve logic in ABlock.getDependencyCheckCode to avoid checking duplicate e.g in a.b.x and a.b.y dont need to check a.hasB twice.
