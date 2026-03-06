---
source: mylogger
mylogger_id: 7468
created: 2015-03-03T09:39:56+00:00
created_raw: 2015-03-03 09:39:56
completed_raw: 2015-03-04 09:58:05
tags:
  - evening
---

HttpPost post = new HttpPost(EcgineToolContext.URL + LOG_IN);n		List<NameValuePair> postParameters = new ArrayList<>();n		postParameters.add(new BasicNameValuePair(USER_NAME, userName));n		postParameters.add(new BasicNameValuePair(PASS_WORD, password));n		post.setEntity(new UrlEncodedFormEntity(postParameters));nn		HttpResponse response = httpClient.execute(post);nn		StatusLine status = response.getStatusLine();n		if (status.getStatusCode() != HttpStatus.SC_OK) {n			throw new RuntimeException(status.toString());n		}nn		HttpEntity entity = response.getEntity();n		String responseContent = IOUtils.toString(entity.getContent());nn		JSONObject responseResult = new JSONObject(responseContent);n		dataStore.saveLoginDetails(responseResult.getString(API_KEY));
