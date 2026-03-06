---
source: mylogger
mylogger_id: 6628
created: 2014-10-28T04:13:14+00:00
created_raw: 2014-10-28 04:13:14
completed_raw: 2014-10-28 06:30:10
tags:
  - bdo
---

OnUpdatModelnUnique Settingdn	insert n		We should validate the existing data if unique.n		And inseert corresponding rows into UNIQUE_VALUEn	updaten		There should not be update. It should be delete and add.n	deleten		Delete the rows that belogs to the corresponding setting from UNIQUE_VALUE tablennnOnInstance CUDn	Insertn		Validate uniquenessn		insert into big tablen		insert into UNIQUE_VALUE in proper sequencen	Updaten		Do I know if the unique values changed? If yesn		Check uniqueness.n		Update big tablen		Update UNIQUE_VALUE by Entity_idn	Deleten		Delete row from UNIQUE_VALUE by Entity_id
