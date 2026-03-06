---
mylogger_id: 793
tags: [tomcat]
added: "2012-06-15 13:46:41"
source: mylogger
---

# Note 793

Tags: #tomcat

Log request urls <filter> 
    <filter-name>requestdumper</filter-name> 
    <filter-class> 
        org.apache.catalina.filters.RequestDumperFilter 
    </filter-class> 
</filter> 
<filter-mapping> 
    <filter-name>requestdumper</filter-name> 
    <url-pattern>*</url-pattern> 
</filter-mapping>
