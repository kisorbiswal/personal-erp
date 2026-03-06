---
mylogger_id: 1135
tags: [query]
added: "2012-08-08 09:56:15"
source: mylogger
---

# Note 1135

Tags: #query

select concat('840','/',s.stateId,'/',15518+id) ckey,s.countryId countryId, s.stateId stateId, 15518+id cityId, n.city cityName, "--" alphaCode, "--" zipCode, 
 '2012-08-08 15:08:00' createdTime, '2012-08-08 15:08:00' updatedTime, createdBy, updatedBy 
from new_cities n join securegrcdb.core_country_state_m s on(s.alphaCode=n.state_code); 
 
 
insert into securegrcdb.core_country_state_city_m (select concat('840','/',s.stateId,'/',15518+id) ckey,s.countryId countryId, s.stateId stateId, 15518+id cityId, n.city cityName, "--" alphaCode, "--" zipCode, 
 '2012-08-08 15:08:00' createdTime, '2012-08-08 15:08:00' updatedTime, createdBy, updatedBy 
from new_cities n join securegrcdb.core_country_state_m s on(s.alphaCode=n.state_code));
