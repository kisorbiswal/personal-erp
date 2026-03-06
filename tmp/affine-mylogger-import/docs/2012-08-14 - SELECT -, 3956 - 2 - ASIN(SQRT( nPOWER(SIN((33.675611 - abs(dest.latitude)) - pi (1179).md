---
source: mylogger
mylogger_id: 1179
created: 2012-08-14T13:07:42+00:00
created_raw: 2012-08-14 13:07:42
completed_raw: 
tags:
  - query
---

SELECT *, 3956 * 2 * ASIN(SQRT( nPOWER(SIN((33.675611 - abs(dest.latitude)) * pi()/180 / 2), n2) + COS(33.675611 * pi()/180 ) * COS(abs(dest.latitude) * npi()/180) * POWER(SIN((-86.408952 - dest.longitude) * npi()/180 / 2), 2) )) as distance nFROM core_country_state_city_extended_m dest ORDER BY distance; Distance from Latitue and Longitude
