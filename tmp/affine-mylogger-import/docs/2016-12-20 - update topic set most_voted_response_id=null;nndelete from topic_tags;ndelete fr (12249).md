---
source: mylogger
mylogger_id: 12249
created: 2016-12-20T10:30:41+00:00
created_raw: 2016-12-20 10:30:41
completed_raw: 
tags:
  - pgsql
---

update topic set most_voted_response_id=null;nndelete from topic_tags;ndelete from tag;ndelete from comment;ndelete from response;ndelete from topic;
