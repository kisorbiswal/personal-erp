---
source: mylogger
mylogger_id: 150
created: 2011-08-22T00:36:44+00:00
created_raw: 2011-08-22 00:36:44
completed_raw: 2013-01-29 03:05:16
tags:
  - do
---

Installation stepsnCopy crowd.war to deploy folder nCopy crowd-ds.xml to deploy folder and check the connection properties properlynCopy ojdbc14-10.1.0.5.0.jar to jboss lib nCheck crowd-init.properties in crowd.war class path for crow.home, make sure a directory existsnCheck crowd.properties in crowd class path for server url and make sure it points to proper host, localhost may not exist alwaysnnTodays troubleshoot while installationncrowd.properties in crowd class path was pointing to 28nfalcon.qvantel.com does not resolve, now added host 127.0.0.1 for falcon.qvantel.comnChanged application passwords of all applications in crowd admin portal, as the passwords in property files were wrong.
