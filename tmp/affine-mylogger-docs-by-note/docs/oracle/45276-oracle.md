---
mylogger_id: 45276
tags: [oracle]
added: "2022-01-03 10:18:22"
completed: "2022-08-25 15:50:49"
source: mylogger
---

# Note 45276

Tags: #oracle

==Release Existing boss module to 8081==

cd \~/dev/cxp/boss-modules

git status //Ensure no change there.

git pull

boss metadata package

cd \~/dev/kisor-poc

curl -u super_user:welcome1 -X PUT --data-binary @bmd.zip http://cc-cx-3.ad2.fusionappsdephx.oraclevcn.com:8081/metadata

\
==Release existing boss module to 8081 with custom module==

- [ ] cd \~/dev/kisor-poc
- [ ] delete everything inside
- [ ] boss module create -m kmodule
- [ ] copy contents of cxpcat to kmodule folder
- [ ] Replace cxpcat with module everywhere.
- [ ] boss metadata package
- [ ] curl -u super_user:welcome1 -X PUT --data-binary @bmd.zip http://cc-cx-3.ad2.fusionappsdephx.oraclevcn.com:8081/metadata

\
\
Delete the cxpcat folder form kisor-poc
boss module create -m cxpcat
update boss-module
copy the cxpcat of boss-module to kisor-poc

boss metadata package
curl -u super_user:welcome1 -X PUT --data-binary @bmd.zip http://cc-cx-3.ad2.fusionappsdephx.oraclevcn.com:8081/metadata
