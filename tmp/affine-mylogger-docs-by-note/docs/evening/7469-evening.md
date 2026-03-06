---
mylogger_id: 7469
tags: [evening]
added: "2015-03-03 09:40:10"
completed: "2015-03-04 09:58:05"
source: mylogger
---

# Note 7469

Tags: #evening

private void addAuthenticationParameters(HttpRequest executeMethod) {
		String apiKey = dataStore.getLoggedInDetails();
		String encodedKey = Base64.getEncoder().encodeToString(
				apiKey.getBytes());
		executeMethod.addHeader(AUTH_HEADER_NAME, BEARER + " " + encodedKey);
	}
