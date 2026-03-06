---
source: mylogger
mylogger_id: 2996
created: 2013-04-05T05:35:38+00:00
created_raw: 2013-04-05 05:35:38
completed_raw: 
tags:
  - code
---

private Map<String, String> getInfoByIP(String ip){ n          try { n          String apiLocation="http://api.ipinfodb.com/v3/ip-city/?key=ec542ed17fbb0132019c7a76f21be325cc4c3bd61e893b7f5e693d02a7778646&ip="+ip+"&format=json"; n               URL url=new URL(apiLocation); n               InputStream inputStream = url.openStream(); n               ByteArrayOutputStream buffer = new ByteArrayOutputStream(); n n               int nRead; n               byte[] data = new byte[16384]; n n               while ((nRead = inputStream.read(data, 0, data.length)) != -1) { n                 buffer.write(data, 0, nRead); n               } n n               buffer.flush(); n               String rawInfo=new String(buffer.toByteArray()); n               return parseJSON(rawInfo); n          } catch (Exception e) { n               e.printStackTrace(); n          } n          return null; n     } n      n     private Map<String, String> parseJSON(String jsonString){ n          if(jsonString==null||jsonString.length()<1){ n               return null; n          } n           n          jsonString=jsonString.substring(1,jsonString.length()-1); n          String[] pairs = jsonString.split(","); n          Map<String, String> infoMap=new HashMap<String, String>(); n          for(String s:pairs){ n               String[] pair = s.split(":"); n               infoMap.put(pair[0].trim().replaceAll("\"", ""), pair[1].trim().replaceAll("\"", "")); n          } n          return infoMap; n     }
