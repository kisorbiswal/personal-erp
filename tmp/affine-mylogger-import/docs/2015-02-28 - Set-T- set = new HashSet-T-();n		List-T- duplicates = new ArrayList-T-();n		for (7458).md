---
source: mylogger
mylogger_id: 7458
created: 2015-02-28T05:39:20+00:00
created_raw: 2015-02-28 05:39:20
completed_raw: 
tags:
  - edo
---

Set<T> set = new HashSet<T>();n		List<T> duplicates = new ArrayList<T>();n		for (T t : entities) {n			if (set.contains(t)) {n				duplicates.add(t);n			}n			set.add(t);n		}
