---
mylogger_id: 46288
tags: [oracle]
added: "2022-11-24 05:11:41"
completed: "2022-11-24 05:11:47"
source: mylogger
---

# Note 46288

Tags: #oracle

1. Artifactory that contains real data about the artifacts/jars
2. BA Report
3. Helidon code
   Call 1 and 2 compare them
   Create a JSON
   Push to report artifactory

   /Generate Also this has a cron job running daily to create JSOn and upload to Artifactory jSON/HTML.
   /Reportname/5
   Read form 3.1
   /artifacts of a given repo then you pass the report name that already exist in artifactory
   Return the artifacts with statuses

   3\.1 Report artifactory
4. Apex code
   Reading
   Reprots
   Repos
   Artifacts

   ```
    Reading all these form the data base. That is not being upulated from May.
   ```

Write new apex application to call the APIs from 3. Helidon service do not depend on the database
