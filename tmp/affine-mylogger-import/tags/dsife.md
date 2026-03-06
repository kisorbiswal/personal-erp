# tag: dsife

total: 9

## #3702
- added: 2013-06-13 09:56:48

Create a new project with both utils and UI code, commit to some repository.

---

## #3701
- added: 2013-06-13 09:56:02

Calculate Sleep times

---

## #3668
- added: 2013-06-11 16:41:24
- completed: 2013-06-12 13:33:03

Backed up Office and Star Chrome data, now working on parsing the study hours(countdown data)

---

## #3640
- added: 2013-06-06 19:12:32
- completed: 2013-06-12 13:33:03

Predicted star time

---

## #3632
- added: 2013-06-05 16:37:08
- completed: 2013-06-12 13:33:03

Category data

---

## #3618
- added: 2013-06-04 18:34:39
- completed: 2013-06-12 13:33:03

Parsed firefox data, now chrome

---

## #3617
- added: 2013-06-04 16:50:35
- completed: 2013-06-11 16:41:41

public class FireFoxFileUtil {\n\n\tpublic static void main(String[] args) throws IOException {\n\t\tFile src = new File("E:\\\\sife\\\\OfficeFirefox.txt");\n\t\tFile dest = new File("E:\\\\sife\\\\officeff.txt");\n\t\tif (!dest.exists()) {\n\t\t\tdest.createNewFile();\n\t\t}\n\n\t\tBufferedReader br = new BufferedReader(new FileReader(src));\n\t\tBufferedWriter bw = new BufferedWriter(new FileWriter(dest));\n\n\t\tString line = null;\n\t\twhile ((line = br.readLine()) != null) {\n\t\t\tString[] split = line.split("\\t");\n\t\t\tString timestamp = split[0];\n\t\t\tDate date = new Date(getInt(timestamp));\n\t\t\tString dateString = getFormattedDate(date);\n\t\t\tline = line.replace(timestamp, dateString);\n\t\t\tbw.write(line + "\\n");\n\t\t}\n\t\tbr.close();\n\t\tbw.close();\n\t}\n\n\tprivate static String getFormattedDate(Date date) {\n\t\tSimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");\n\t\tString formattedDate = format.format(date);\n\t\treturn formattedDate;\n\t}\n\n\tprivate static long getInt(String timestamp) {\n\t\tlong i = 0;\n\t\ttry {\n\t\t\ti = Long.parseLong(timestamp);\n\t\t} catch (Exception e) {\n\t\t\te.printStackTrace();\n\t\t}\n\t\treturn i;\n\t}\n\n}

---

## #3616
- added: 2013-06-04 15:41:54

E:\\sife

---

## #3148
- added: 2013-04-17 17:43:59

http://developers.facebook.com/blog/post/2009/08/11/new-opportunities-for-inbox-and-notification-integration/ Read Others FB messages

---
