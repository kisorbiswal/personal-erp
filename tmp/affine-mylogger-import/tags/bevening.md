# tag: bevening

total: 13

## #6644
- added: 2014-10-30 08:50:58
- completed: 2014-12-18 11:41:47

Farmer chicken problem\npublic class A {\tpublic static void main(String[] args) {\t\tA a = new A();\t\ta.run(140);\t}\n\tpublic int[][] run(int sum) {\t\tint p = 10, q = 16, r = 26;\t\tint x = 1;\t\twhile (true) {\t\t\tint a = 1;\t\t\twhile (true) {\t\t\t\tint[] result = findYB(x, a, p, sum);\t\t\t\tif (result != null) {\t\t\t\t\tint[] res = findAB(x, result[0], q, sum);\t\t\t\t\tif (res != null) {\t\t\t\t\t\tint[] last = findAB(x, result[0], r, sum);\t\t\t\t\t\tif (last != null) {\t\t\t\t\t\t\tSystem.out.println("x=" + x + ",y=" + result[0]\t\t\t\t\t\t\t\t\t+ ",a=" + a + ",b=" + result[1] + ",c="\t\t\t\t\t\t\t\t\t+ res[0] + ",d=" + res[1] + ",e=" + last[0]\t\t\t\t\t\t\t\t\t+ ",f=" + last[1]);\t\t\t\t\t\t}\t\t\t\t\t}\t\t\t\t}\t\t\t\ta++;\t\t\t\tif (a == p) {\t\t\t\t\tbreak;\t\t\t\t}\t\t\t}\t\t\tx++;\t\t\tif (x == sum) {\t\t\t\tbreak;\t\t\t}\t\t}\t\treturn null;\t}\n\tprivate int[] findAB(int x, int y, int items, int sum) {\t\tint a = 1;\t\twhile (true) {\t\t\tint b = items - a;\t\t\tint total = a * x + b * y;\t\t\tif (total == sum) {\t\t\t\treturn new int[] { a, b };\t\t\t}\t\t\ta++;\t\t\tif (a == items) {\t\t\t\tbreak;\t\t\t}\t\t}\t\treturn null;\t}\n\tprivate int[] findYB(int x, int a, int items, int sum) {\t\t// a+b=items\t\tint b = items - a;\t\t// ax+by=sum\t\t// by=sum-ax;\t\tint by = sum - (a * x);\t\t// y=(sum-sx)/b;\t\tif (by % b != 0) {\t\t\treturn null;\t\t}\n\t\tint y = by / b;\t\tif (y <= 0) {\t\t\treturn null;\t\t}\t\treturn new int[] { y, b };\t}}

---

## #5683
- added: 2014-06-26 10:07:44
- completed: 2014-08-21 09:11:32

Install pocket chrome extension and add feedly.com

---

## #4849
- added: 2013-11-11 10:31:28
- completed: 2014-05-28 12:27:03

http://www.meraevents.com/event/hdcf-confluence-xv what is this?

---

## #4715
- added: 2013-10-10 13:43:48
- completed: 2014-05-28 12:27:03

Check ecgine generated code

---

## #4563
- added: 2013-08-31 05:10:10
- completed: 2014-05-28 12:27:03

Budget https://docs.google.com/spreadsheet/ccc?key=0ApK5WqzoP3tudFM0dnBMZE4zZzVJUmxjaVd5Vi1fSmc#gid=2

---

## #4498
- added: 2013-08-22 06:14:19
- completed: 2013-10-06 08:37:39

http://information.rapid7.com/security-assessment-with-idc-video-page.html?aliId=24470692

---

## #4407
- added: 2013-08-14 13:56:46
- completed: 2014-05-28 12:27:03

http://www.mooc-list.com/categories/computer-science-artificial-intelligence-robotics-vision

---

## #4368
- added: 2013-08-09 09:46:22
- completed: 2013-10-06 17:41:30

http://www.hudku.com/search/business-list/Swimming%20Pools%20in%20Koramangala,%20Bangalore,%20Karnataka,%20India Swimming pools, first one looks good

---

## #4281
- added: 2013-08-02 08:33:16
- completed: 2013-10-06 08:37:39

Refer https://mail.google.com/mail/u/0/?shva=1#inbox/1403e1e214fe1893

---

## #4248
- added: 2013-07-29 16:58:33
- completed: 2013-10-07 18:34:31

http://www.youtube.com/watch?v=x5ZYqzl6VdQ

---

## #4210
- added: 2013-07-25 03:26:13
- completed: 2013-10-07 18:34:31

http://www.youtube.com/watch?v=StYj8gzEtGQ

---

## #3836
- added: 2013-06-26 11:18:53
- completed: 2013-08-06 13:14:35

Pay Kotak Credit Card bill  2200

---

## #3801
- added: 2013-06-24 05:57:33
- completed: 2013-08-06 13:14:35

Rs.6419.35\n___________________________________________________\nMinimum Amount Due:\nRs.320.97\n___________________________________________________\nDue Date:\n03/07/13

---
