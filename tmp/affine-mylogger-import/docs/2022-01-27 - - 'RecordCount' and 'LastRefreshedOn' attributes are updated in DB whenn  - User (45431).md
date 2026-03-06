---
source: mylogger
mylogger_id: 45431
created: 2022-01-27T08:58:54+00:00
created_raw: 2022-01-27 08:58:54
completed_raw: 
tags:
  - sprint7
---

* 'RecordCount' and 'LastRefreshedOn' attributes are updated in DB whenn  * User clicks on refresh beside count component on segment cardn    * UI change to show refresh button, record count and last refreshed on timestamp.n    * Make a call to /products/_search?filter_path=hits from UI.n    * Update the count and timestamp. Call API from UI.n  * User clicks on segment card on landing page and lands on list pagen    * where latest records are fetched and displayed.(This is already avaialbe)n      * See how the query applies filters. Are they synced in realtime with index? Else there might be discrepancy.n    * Make a call to Update API with the count and timestamp.n  * User edits a segment's attributes and saves the segmentn    * OnSuccess of save operation calln    * Make a call to /products/_search?filter_path=hits from UI.n    * Update the count and timestamp. Call API from UI.n  * User clicks refresh button, the existing one in Segment edit page.n    * Call to get the updated count(This is already there)n    * Update the count and timestamp. Call API from UI.n* Testing all the scenarios.nn\n
