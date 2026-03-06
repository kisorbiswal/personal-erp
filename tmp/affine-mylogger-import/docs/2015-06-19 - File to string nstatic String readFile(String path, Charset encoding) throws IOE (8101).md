---
source: mylogger
mylogger_id: 8101
created: 2015-06-19T10:02:17+00:00
created_raw: 2015-06-19 10:02:17
completed_raw: 
tags:
  - code
---

File to string nstatic String readFile(String path, Charset encoding) throws IOException {n		byte[] encoded = Files.readAllBytes(Paths.get(path));n		return new String(encoded, encoding);n	}
