---
mylogger_id: 1179
tags: [query]
added: "2012-08-14 13:07:42"
source: mylogger
---

# Note 1179

Tags: #query

SELECT *, 3956 * 2 * ASIN(SQRT( 
POWER(SIN((33.675611 - abs(dest.latitude)) * pi()/180 / 2), 
2) + COS(33.675611 * pi()/180 ) * COS(abs(dest.latitude) * 
pi()/180) * POWER(SIN((-86.408952 - dest.longitude) * 
pi()/180 / 2), 2) )) as distance 
FROM core_country_state_city_extended_m dest ORDER BY distance; Distance from Latitue and Longitude
