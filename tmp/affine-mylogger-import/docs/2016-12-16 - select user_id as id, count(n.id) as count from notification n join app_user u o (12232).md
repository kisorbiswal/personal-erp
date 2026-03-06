---
source: mylogger
mylogger_id: 12232
created: 2016-12-16T13:13:15+00:00
created_raw: 2016-12-16 13:13:15
completed_raw: 
tags:
  - techc
---

select user_id as id, count(n.id) as count from notification n join app_user u on u.id=n.user_id where n.user_id in (1,2,7) and n.created_date > u.notification_read_at group by n.user_id Should have a better way to do. Now creating map manually. Also in topic jpa even worse.
