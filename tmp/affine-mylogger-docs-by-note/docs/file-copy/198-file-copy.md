---
mylogger_id: 198
tags: [file-copy]
added: "2011-08-24 21:27:00"
source: mylogger
---

# Note 198

Tags: #file-copy

FileInputStream input = new FileInputStream(pdf);			buf = new BufferedInputStream(input);			byte[] b = new byte[1024];			int len;			while ((len = buf.read(b)) &gt; 0) {				stream.write(b, 0, len);			}
