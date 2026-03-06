---
source: mylogger
mylogger_id: 7469
created: 2015-03-03T09:40:10+00:00
created_raw: 2015-03-03 09:40:10
completed_raw: 2015-03-04 09:58:05
tags:
  - evening
---

private void addAuthenticationParameters(HttpRequest executeMethod) {n		String apiKey = dataStore.getLoggedInDetails();n		String encodedKey = Base64.getEncoder().encodeToString(n				apiKey.getBytes());n		executeMethod.addHeader(AUTH_HEADER_NAME, BEARER + " " + encodedKey);n	}
