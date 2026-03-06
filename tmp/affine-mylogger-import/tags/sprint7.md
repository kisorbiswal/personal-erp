# tag: sprint7

total: 3

## #45433
- added: 2022-01-27 09:53:37

522, 584, 586, 637, 642 All are related.

---

## #45432
- added: 2022-01-27 09:48:32

Kaustubh is working on Test Cases for Segments BO. Observe how it is done.

---

## #45431
- added: 2022-01-27 08:58:54

* 'RecordCount' and 'LastRefreshedOn' attributes are updated in DB when\n  * User clicks on refresh beside count component on segment card\n    * UI change to show refresh button, record count and last refreshed on timestamp.\n    * Make a call to /products/_search?filter_path=hits from UI.\n    * Update the count and timestamp. Call API from UI.\n  * User clicks on segment card on landing page and lands on list page\n    * where latest records are fetched and displayed.(This is already avaialbe)\n      * See how the query applies filters. Are they synced in realtime with index? Else there might be discrepancy.\n    * Make a call to Update API with the count and timestamp.\n  * User edits a segment's attributes and saves the segment\n    * OnSuccess of save operation call\n    * Make a call to /products/_search?filter_path=hits from UI.\n    * Update the count and timestamp. Call API from UI.\n  * User clicks refresh button, the existing one in Segment edit page.\n    * Call to get the updated count(This is already there)\n    * Update the count and timestamp. Call API from UI.\n* Testing all the scenarios.\n\n\\\n

---
