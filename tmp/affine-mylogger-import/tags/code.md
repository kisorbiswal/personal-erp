# tag: code

total: 12

## #12139
- added: 2016-11-28 09:00:51

Session session = sessionFactory.openSession();\n    String sql = "select d.id, d.title, r.description, u.first_name, u.last_name, p.name, s.name"\n        + " (SELECT string_agg(t.title, ',') from title t join discusion_tags dt on t.id=dt.tag_id and dt.discussion_id=d.id) as tags "\n        + "from discussion d left join Response r " + "on r.discussion_id=d.id order by r.vote_count limit 1 "\n        + "join user u " + "on u.id=r.creator join Plant p on p.id=u.plant join state s on p.sate=s.id "\n        + " join media m on m.id=u.profile";

---

## #11150
- added: 2016-06-15 05:53:53

logging: <dependency>\n      <groupId>org.slf4j</groupId>\n      <artifactId>slf4j-api</artifactId>\n      <version>1.7.2</version>\n    </dependency>\n    <dependency>\n      <groupId>org.slf4j</groupId>\n      <artifactId>slf4j-log4j12</artifactId>\n      <version>1.7.2</version>\n    </dependency>\n    <dependency>\n      <groupId>log4j</groupId>\n      <artifactId>log4j</artifactId>\n      <version>1.2.17</version>\n    </dependency>

---

## #10799
- added: 2016-05-02 11:22:33

<div class="navbar navbar-default navbar-fixed-top">\n      <div class="container">\n        <div class="navbar-header">\n          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">\n            <span class="icon-bar"></span>\n            <span class="icon-bar"></span>\n            <span class="icon-bar"></span>\n          </button>\n          <a href="/" class="site-avatar">\n            <img src="/images/vimukti.jpg">\n              <div class="site-info">\n                <h2 class="site-name"></h2><span class="site-version"></span>\n              </div>\n            </img>\n          </a>\n        </div>\n        <div class="navbar-collapse collapse">\n          <div class="nav navbar-nav nav-links navbar-right">\n            <li><a href="/">Home</a></li>\n            <li><a href="/download">Download</a></li>\n            <li><a href="/accounter">Accounter</a></li>\n            <li><a href="/salescrm">Sales CRM</a></li>\n            <!--<li><a href="/faq">FAQ</a></li>-->\n            <li><a href="/contactus">Contact Us</a></li>\n          </div>\n        </div>\n      </div>\n  </div>

---

## #8101
- added: 2015-06-19 10:02:17

File to string \nstatic String readFile(String path, Charset encoding) throws IOException {\n\t\tbyte[] encoded = Files.readAllBytes(Paths.get(path));\n\t\treturn new String(encoded, encoding);\n\t}

---

## #2996
- added: 2013-04-05 05:35:38

private Map<String, String> getInfoByIP(String ip){ \n          try { \n          String apiLocation="http://api.ipinfodb.com/v3/ip-city/?key=ec542ed17fbb0132019c7a76f21be325cc4c3bd61e893b7f5e693d02a7778646&ip="+ip+"&format=json"; \n               URL url=new URL(apiLocation); \n               InputStream inputStream = url.openStream(); \n               ByteArrayOutputStream buffer = new ByteArrayOutputStream(); \n \n               int nRead; \n               byte[] data = new byte[16384]; \n \n               while ((nRead = inputStream.read(data, 0, data.length)) != -1) { \n                 buffer.write(data, 0, nRead); \n               } \n \n               buffer.flush(); \n               String rawInfo=new String(buffer.toByteArray()); \n               return parseJSON(rawInfo); \n          } catch (Exception e) { \n               e.printStackTrace(); \n          } \n          return null; \n     } \n      \n     private Map<String, String> parseJSON(String jsonString){ \n          if(jsonString==null||jsonString.length()<1){ \n               return null; \n          } \n           \n          jsonString=jsonString.substring(1,jsonString.length()-1); \n          String[] pairs = jsonString.split(","); \n          Map<String, String> infoMap=new HashMap<String, String>(); \n          for(String s:pairs){ \n               String[] pair = s.split(":"); \n               infoMap.put(pair[0].trim().replaceAll("\\"", ""), pair[1].trim().replaceAll("\\"", "")); \n          } \n          return infoMap; \n     }

---

## #2887
- added: 2013-03-26 07:34:26

File to bytes \n FileChannel fc = stream.getChannel(); \n              MappedByteBuffer bb = fc.map(FileChannel.MapMode.READ_ONLY, 0, fc.size()); \n              /* Instead of using default, pass in a decoder. */ \n              return Charset.defaultCharset().decode(bb).toString();

---

## #2098
- added: 2013-01-11 05:10:25

shell bat script for /r %%a in (*.java) do ( javac "%%a" )

---

## #1265
- added: 2012-08-28 10:44:53

Demo of GXT http://www.gwt-ext.com/demo/

---

## #1238
- added: 2012-08-24 10:20:14

http://msdn.microsoft.com/en-us/library/windows/desktop/bb456468%28v=vs.85%29.aspx Windows Sidebar Gadget dev

---

## #1237
- added: 2012-08-24 10:12:16

Timezone in js http://www.onlineaspect.com/2007/06/08/auto-detect-a-time-zone-with-javascript/

---

## #1235
- added: 2012-08-24 09:51:28

Date picker http://trentrichardson.com/examples/timepicker/

---

## #1207
- added: 2012-08-22 06:08:50

public String formattedXMLToOneLine(String formatted) throws IOException{ \n               BufferedWriter wr = new BufferedWriter(new FileWriter(new File("C:\\\\Users\\\\kisor.biswal.EGBALORE\\\\Desktop\\\\control.xml"))); \n               wr.write(formatted); \n               wr.flush(); \n               wr.close(); \n               BufferedReader br = new BufferedReader(new FileReader(new File("C:\\\\Users\\\\kisor.biswal.EGBALORE\\\\Desktop\\\\control.xml"))); \n               String line; \n               StringBuilder sb = new StringBuilder(); \n \n               while((line=br.readLine())!= null){ \n                   sb.append(line.trim()); \n               } \n               System.out.println(sb.toString()); \n               br.close(); \n               formatted=sb.toString(); \n               return formatted; \n          }

---
