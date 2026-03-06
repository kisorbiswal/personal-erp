---
source: mylogger
mylogger_id: 12139
created: 2016-11-28T09:00:51+00:00
created_raw: 2016-11-28 09:00:51
completed_raw: 
tags:
  - code
---

Session session = sessionFactory.openSession();n    String sql = "select d.id, d.title, r.description, u.first_name, u.last_name, p.name, s.name"n        + " (SELECT string_agg(t.title, ',') from title t join discusion_tags dt on t.id=dt.tag_id and dt.discussion_id=d.id) as tags "n        + "from discussion d left join Response r " + "on r.discussion_id=d.id order by r.vote_count limit 1 "n        + "join user u " + "on u.id=r.creator join Plant p on p.id=u.plant join state s on p.sate=s.id "n        + " join media m on m.id=u.profile";
