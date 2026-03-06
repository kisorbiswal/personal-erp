---
source: mylogger
mylogger_id: 3615
created: 2013-06-04T13:19:04+00:00
created_raw: 2013-06-04 13:19:04
completed_raw: 
tags:
  - dev
---

SAXParserFactory factory = SAXParserFactory.newInstance(); n          SAXParser parser = factory.newSAXParser(); n          Handler handler=new Handler(); n          parser.parse("C:\\Users\\kisor.biswal.EGBALORE\\Dropbox\\work\\sife\\histexp_6.04.2013 17.23.14 PM.xml", handler); n nimport org.xml.sax.Attributes; nimport org.xml.sax.SAXException; nimport org.xml.sax.helpers.DefaultHandler; n npublic class Handler extends DefaultHandler { n     boolean item = false; n  n     public void startElement(String uri, String localName,String qName,  n                Attributes attributes) throws SAXException { n  n          if (qName.equalsIgnoreCase("item")) { n               item = true; n               if(attributes.getValue(0)==null ||attributes.getValue(0).isEmpty()){ n                    System.out.println("Wrong"); n               } n               String out=attributes.getValue(0)+"     "+attributes.getValue(2)+"     "+attributes.getValue(1); n               System.out.println(out); n          } n  n     } n}
