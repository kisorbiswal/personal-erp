---
source: mylogger
mylogger_id: 1135
created: 2012-08-08T09:56:15+00:00
created_raw: 2012-08-08 09:56:15
completed_raw: 
tags:
  - query
---

select concat('840','/',s.stateId,'/',15518+id) ckey,s.countryId countryId, s.stateId stateId, 15518+id cityId, n.city cityName, "--" alphaCode, "--" zipCode, n '2012-08-08 15:08:00' createdTime, '2012-08-08 15:08:00' updatedTime, createdBy, updatedBy nfrom new_cities n join securegrcdb.core_country_state_m s on(s.alphaCode=n.state_code); n n ninsert into securegrcdb.core_country_state_city_m (select concat('840','/',s.stateId,'/',15518+id) ckey,s.countryId countryId, s.stateId stateId, 15518+id cityId, n.city cityName, "--" alphaCode, "--" zipCode, n '2012-08-08 15:08:00' createdTime, '2012-08-08 15:08:00' updatedTime, createdBy, updatedBy nfrom new_cities n join securegrcdb.core_country_state_m s on(s.alphaCode=n.state_code));
