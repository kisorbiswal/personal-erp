---
source: mylogger
mylogger_id: 163
created: 2011-08-22T21:10:39+00:00
created_raw: 2011-08-22 21:10:39
completed_raw: 2013-01-29 04:21:46
tags:
  - do
---

Could not resolve dependencies  A. Make sure eclipse property Maven&gt;User Setting points to proper file. Causes mainly while running as root.  B. Execute mvn:clean command  C. If the dependecies are still not available to eclipse add those by executing mvn eclipse:eclipse  D. If still not available then execute mvn -Declipse.workspace=/home/ft/workspaces/wksp1/ eclipse:add-maven-repo
