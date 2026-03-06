---
source: mylogger
mylogger_id: 12808
created: 2017-04-25T09:37:44+00:00
created_raw: 2017-04-25 09:37:44
completed_raw: 
tags:
  - docker
---

Docker file -- build -> image -- run --> Containerddnnndocker run --name user-management -p 3000:3000 user-managementndocker build -t user-management .ndocker imagesnndocker ps -andocker rm $(docker ps -a -q)
