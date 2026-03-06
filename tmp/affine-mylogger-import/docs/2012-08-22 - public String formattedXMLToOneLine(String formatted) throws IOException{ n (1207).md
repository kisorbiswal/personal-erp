---
source: mylogger
mylogger_id: 1207
created: 2012-08-22T06:08:50+00:00
created_raw: 2012-08-22 06:08:50
completed_raw: 
tags:
  - code
---

public String formattedXMLToOneLine(String formatted) throws IOException{ n               BufferedWriter wr = new BufferedWriter(new FileWriter(new File("C:\\Users\\kisor.biswal.EGBALORE\\Desktop\\control.xml"))); n               wr.write(formatted); n               wr.flush(); n               wr.close(); n               BufferedReader br = new BufferedReader(new FileReader(new File("C:\\Users\\kisor.biswal.EGBALORE\\Desktop\\control.xml"))); n               String line; n               StringBuilder sb = new StringBuilder(); n n               while((line=br.readLine())!= null){ n                   sb.append(line.trim()); n               } n               System.out.println(sb.toString()); n               br.close(); n               formatted=sb.toString(); n               return formatted; n          }
