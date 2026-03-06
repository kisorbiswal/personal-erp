---
source: mylogger
mylogger_id: 77
created: 2011-08-20T22:54:19+00:00
created_raw: 2011-08-20 22:54:19
completed_raw: 2013-01-29 03:05:16
tags:
  - do
---

mvn deploy:deploy-file -Durl=http://maven.qvantel.net/nexus/content/repositories/releases -DrepositoryId=releases -Dfile=/home/qvantel/newworkspace/falcon-qcm/QCMapi/target/falcon-qcm.jar -DgroupId=com.qvantel.bss.qcrm.qcm -DartifactId=falcon-qcm -Dversion=2.3.2 -Dpackaging=jar -DgeneratePom=truen mvn install:install-file -Dfile=/home/qvantel/newworkspace/falcon-qcm/QCMapi/target/falcon-qcm.jar -DgroupId=com.qvantel.bss.qcrm.qcm -DartifactId=falcon-qcm -Dversion=2.3.2 -Dpackaging=jar -DlocalRepositoryPath=/home/qvantel/.m2/repository
