---
source: mylogger
mylogger_id: 45925
created: 2022-06-22T07:38:06+00:00
created_raw: 2022-06-22 07:38:06
completed_raw: 2022-06-22 07:38:20
tags:
  - now
---

\#991 nnUpdated asked by SamathannFunctionality DonenPreviosuly all the code were at flow/page level.nMoved the Action chains and variable to application level.nThe flow is not exactly same so had to refactor accordingly.(Continue,canel, refresh count, close, save)nCreated new Drawer Popup in Shell page.nMove the conditions drawer to shell page.nnValidations DonenValidate the Segment conditions and show error.nEnable continue only if after the name and descriptions are filled.nShow Auto refresh only when smart switch is enabled.(Earlier we were using checkbox, so had to change data type of variables to support it)nnPendingnValidate the name is not used. Previously we were not doing it, as we were saving the segment directly.nSwitch component listener is not working as expcted(going into infinite loop), so have to chage code to use individual variable instead of the Object, currently used.nNewly created segments are not coming in list. Pobably Open search syncing issue.nnProblem encounterednto align the text to right of the switch, after experimenting for some time discovered not possible. So talked to Alex and Sudheer to change that to top align.nSwitch listener infinite loopnoj-sp-create-edit-drawer-template primary action lint issue
