---
source: mylogger
mylogger_id: 7715
created: 2015-04-08T16:34:39+00:00
created_raw: 2015-04-08 16:34:39
completed_raw: 
tags:
  - dev
---

add-apt-repository ppa:webupd8team/javansudo apt-get updatenapt-get install htopnapt-get install tomcat7nsudo apt-get install postgresql postgresql-contribnapt-get install oracle-java8-installernsudo -u postgres psql postgresnnnnn\password postgresnsudo -i -u postgresncreatedb androcallernnnnn<Host name="localhost"  appBase="webapps"n         unpackWARs="true" autoDeploy="true">n n	 <Context path="" docBase="androcaller">n	     <!-- Default set of monitored resources -->n	     <WatchedResource>WEB-INF/web.xml</WatchedResource>n	 </Context>n n</Host>nnnserver {n  listen          80;n  server_name     androcaller.com;n  root            /etc/tomcat7/webapps/androcaller;n n  proxy_cache one;n n  location / {n        proxy_set_header X-Forwarded-Host $host;n        proxy_set_header X-Forwarded-Server $host;n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;n        proxy_pass http://127.0.0.1:8080/;n  }n}nnnn/etc/tomcat/configsn/var/lib/tomcat/webappn/usr/share/tomcat7/bin/catalina.sh
