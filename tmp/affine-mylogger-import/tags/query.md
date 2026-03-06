# tag: query

total: 7

## #4136
- added: 2013-07-17 10:34:44

SHOW ENGINE INNODB STATUs;  see mysql status

---

## #3774
- added: 2013-06-20 18:15:49

insert into user_list (email,is_active) values('kisor.biswal@gmail.com',true);

---

## #2444
- added: 2013-02-05 08:13:07

select column_name, table_name from information_schema.columns where table_schema='securegrcdb' and column_name like '%ucf_citation_id%' and table_name not like '%view%'; info schema

---

## #1183
- added: 2012-08-16 06:33:03

http://www.arubin.org/files/geo_search.pdf Proximity search

---

## #1179
- added: 2012-08-14 13:07:42

SELECT *, 3956 * 2 * ASIN(SQRT( \nPOWER(SIN((33.675611 - abs(dest.latitude)) * pi()/180 / 2), \n2) + COS(33.675611 * pi()/180 ) * COS(abs(dest.latitude) * \npi()/180) * POWER(SIN((-86.408952 - dest.longitude) * \npi()/180 / 2), 2) )) as distance \nFROM core_country_state_city_extended_m dest ORDER BY distance; Distance from Latitue and Longitude

---

## #1135
- added: 2012-08-08 09:56:15

select concat('840','/',s.stateId,'/',15518+id) ckey,s.countryId countryId, s.stateId stateId, 15518+id cityId, n.city cityName, "--" alphaCode, "--" zipCode, \n '2012-08-08 15:08:00' createdTime, '2012-08-08 15:08:00' updatedTime, createdBy, updatedBy \nfrom new_cities n join securegrcdb.core_country_state_m s on(s.alphaCode=n.state_code); \n \n \ninsert into securegrcdb.core_country_state_city_m (select concat('840','/',s.stateId,'/',15518+id) ckey,s.countryId countryId, s.stateId stateId, 15518+id cityId, n.city cityName, "--" alphaCode, "--" zipCode, \n '2012-08-08 15:08:00' createdTime, '2012-08-08 15:08:00' updatedTime, createdBy, updatedBy \nfrom new_cities n join securegrcdb.core_country_state_m s on(s.alphaCode=n.state_code));

---

## #489
- added: 2011-10-17 13:16:45

Select only Character data select team_code from team where ascii(substr(team_code,1,1))<49 or ascii(substr(team_code,1,1))>57 ;

---
