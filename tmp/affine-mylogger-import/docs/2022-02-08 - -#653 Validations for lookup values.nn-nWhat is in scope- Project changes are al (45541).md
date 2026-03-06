---
source: mylogger
mylogger_id: 45541
created: 2022-02-08T04:42:00+00:00
created_raw: 2022-02-08 04:42:00
completed_raw: 2022-02-11 10:25:57
tags:
  - now
---

\#653 Validations for lookup values.nn\nWhat is in scope? Project changes are already done.nn\nMeanwhile, I'm exploring how dynamic looks-ups work in BOSS.nn\n- [ ] See all the available fields. How are they mapped now?n  - [ ] There are multiple units available for length, a height which might be the same. We do not have anything for weight.n  - [ ] Also in UOMs we do not have filters.nn\n| Updatable Status | Type | Result |n|----|----|----|n| Updatable | Reference | Works |n| Updatable | Composition | Only existing value updatable. Any other value gives null pointer exception |n| Not updatable | Composition | Only existing value updatable. Any other value gives null pointer exception |n| Not updatable | Reference | Field projectActionType is not updatable |nnDiscussed in #boss-users [thread](https://oracle-one.slack.com/archives/C01JRU1DQ4B/p1644493186315039), looks like we should use relationType: reference and updatable: module. This will work in M4 24. nn\nIt was originally relationType: reference, so I’ll ignore the previous branch and make necessary change on develop branch code, where we already have a  relationType: reference.nn\n
