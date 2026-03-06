# tag: tomcat

total: 1

## #793
- added: 2012-06-15 13:46:41

Log request urls <filter> \n    <filter-name>requestdumper</filter-name> \n    <filter-class> \n        org.apache.catalina.filters.RequestDumperFilter \n    </filter-class> \n</filter> \n<filter-mapping> \n    <filter-name>requestdumper</filter-name> \n    <url-pattern>*</url-pattern> \n</filter-mapping>

---
