---
source: mylogger
mylogger_id: 7528
created: 2015-03-16T04:55:14+00:00
created_raw: 2015-03-16 04:55:14
completed_raw: 2015-03-27 23:50:53
tags:
  - bdo
---

public boolean isTimeout() {n 		// Duration must be less than specified durationn-		return System.currentTimeMillis() - requestArrivedTime > REQUEST_DURATION;n+		// return System.currentTimeMillis() - requestArrivedTime >n+		// REQUEST_DURATION;n+		return false;n 	}
