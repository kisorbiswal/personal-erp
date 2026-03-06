---
source: mylogger
mylogger_id: 45276
created: 2022-01-03T10:18:22+00:00
created_raw: 2022-01-03 10:18:22
completed_raw: 2022-08-25 15:50:49
tags:
  - oracle
---

==Release Existing boss module to 8081==nncd \~/dev/cxp/boss-modulesnngit status //Ensure no change there.nngit pullnnboss metadata packagenncd \~/dev/kisor-pocnncurl -u super_user:welcome1 -X PUT --data-binary @bmd.zip http://cc-cx-3.ad2.fusionappsdephx.oraclevcn.com:8081/metadatann\n==Release existing boss module to 8081 with custom module==nn- [ ] cd \~/dev/kisor-pocn- [ ] delete everything insiden- [ ] boss module create -m kmodulen- [ ] copy contents of cxpcat to kmodule foldern- [ ] Replace cxpcat with module everywhere.n- [ ] boss metadata packagen- [ ] curl -u super_user:welcome1 -X PUT --data-binary @bmd.zip http://cc-cx-3.ad2.fusionappsdephx.oraclevcn.com:8081/metadatann\n\nDelete the cxpcat folder form kisor-pocnboss module create -m cxpcatnupdate boss-modulencopy the cxpcat of boss-module to kisor-pocnnboss metadata packagencurl -u super_user:welcome1 -X PUT --data-binary @bmd.zip http://cc-cx-3.ad2.fusionappsdephx.oraclevcn.com:8081/metadata
