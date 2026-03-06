# tag: file copy

total: 1

## #198
- added: 2011-08-24 21:27:00

FileInputStream input = new FileInputStream(pdf);\t\t\tbuf = new BufferedInputStream(input);\t\t\tbyte[] b = new byte[1024];\t\t\tint len;\t\t\twhile ((len = buf.read(b)) &gt; 0) {\t\t\t\tstream.write(b, 0, len);\t\t\t}

---
