---
source: mylogger
mylogger_id: 198
created: 2011-08-24T21:27:00+00:00
created_raw: 2011-08-24 21:27:00
completed_raw: 
tags:
  - file copy
---

FileInputStream input = new FileInputStream(pdf);			buf = new BufferedInputStream(input);			byte[] b = new byte[1024];			int len;			while ((len = buf.read(b)) &gt; 0) {				stream.write(b, 0, len);			}
