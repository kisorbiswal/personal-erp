---
source: mylogger
mylogger_id: 2887
created: 2013-03-26T07:34:26+00:00
created_raw: 2013-03-26 07:34:26
completed_raw: 
tags:
  - code
---

File to bytes n FileChannel fc = stream.getChannel(); n              MappedByteBuffer bb = fc.map(FileChannel.MapMode.READ_ONLY, 0, fc.size()); n              /* Instead of using default, pass in a decoder. */ n              return Charset.defaultCharset().decode(bb).toString();
