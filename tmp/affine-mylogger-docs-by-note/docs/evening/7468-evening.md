---
mylogger_id: 7468
tags: [evening]
added: "2015-03-03 09:39:56"
completed: "2015-03-04 09:58:05"
source: mylogger
---

# Note 7468

Tags: #evening

HttpPost post = new HttpPost(EcgineToolContext.URL + LOG_IN);
		List<NameValuePair> postParameters = new ArrayList<>();
		postParameters.add(new BasicNameValuePair(USER_NAME, userName));
		postParameters.add(new BasicNameValuePair(PASS_WORD, password));
		post.setEntity(new UrlEncodedFormEntity(postParameters));

		HttpResponse response = httpClient.execute(post);

		StatusLine status = response.getStatusLine();
		if (status.getStatusCode() != HttpStatus.SC_OK) {
			throw new RuntimeException(status.toString());
		}

		HttpEntity entity = response.getEntity();
		String responseContent = IOUtils.toString(entity.getContent());

		JSONObject responseResult = new JSONObject(responseContent);
		dataStore.saveLoginDetails(responseResult.getString(API_KEY));
