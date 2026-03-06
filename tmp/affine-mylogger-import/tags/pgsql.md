# tag: pgsql

total: 1

## #12249
- added: 2016-12-20 10:30:41

update topic set most_voted_response_id=null;\n\ndelete from topic_tags;\ndelete from tag;\ndelete from comment;\ndelete from response;\ndelete from topic;

---
