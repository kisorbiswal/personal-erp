---
source: mylogger
mylogger_id: 7074
created: 2014-12-31T04:51:34+00:00
created_raw: 2014-12-31 04:51:34
completed_raw: 
tags:
  - sql
---

CREATE OR REPLACE FUNCTION amcInstalationUpdate( ) RETURNS boolean ASn$BODY$nDECLAREn    r      _amc_information%ROWTYPE;n	r1   _amc_instalment%ROWTYPE;n    _no integer := 1;n	cid  _company%ROWTYPE;nBEGINnFor cid in select id from _companynloop n	_no:=1;n	FOR r INn		SELECT idn		FROM   _amc_information  where _company_id = cid.id  order by created_Daten	LOOPn		 For r1 In Select id from _amc_instalment where _amc = r.id  order by created_date n		 Loop n		   UPDATE _amc_instalment set _installment_no = _no where id = r1.id;n		   _no := _no + 1;n		 END Loop; n	END LOOP;nEnd loop;nreturn true;nEND;n $BODY$n  LANGUAGE plpgsql VOLATILEn  COST 100;nALTER FUNCTION amcInstalationUpdate()n  OWNER TO meta;nEND;nselect amcInstalationUpdate() from _company;
