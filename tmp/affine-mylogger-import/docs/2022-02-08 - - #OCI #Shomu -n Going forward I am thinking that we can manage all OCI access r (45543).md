---
source: mylogger
mylogger_id: 45543
created: 2022-02-08T05:13:18+00:00
created_raw: 2022-02-08 05:13:18
completed_raw: 2022-02-09 12:27:50
tags:
  - oracle
---

> #OCI #Shomu \n Going forward I am thinking that we can manage all OCI access requests through the OCI. This will enable us to manage all access to all of our tenancies (dev / pre-prod / prod) from a central place (which is BOAT / OCI Internal IdP). Users onboarded through BOAT can login using this URL: **<https://console.us-phoenix-1.oraclecloud.com/?tenant=bmc_operator_access&provider=ocna-saml&override_tenant=ocid1.tenancy.oc1..aaaaaaaaogzlbbyxuved4rhcvadekq7qgdal37r6eftj3alyogo7zj2fcjnq>.** n>n> ** \n **n>n> As a trial, I am trying to onboard Raj, Kisor and Divya using this method. n>n> \n> Users will require yubikey to access OCI using the internal IdP. Steps to request yubikey is here - <https://confluence.oraclecorp.com/confluence/display/OCIID/Ordering+and+Activating+your+YubiKey+for+OCNA+and+OCI>n>n> \n> As we are restructuring the tenancy layout to align with the Commerce standards, I think this will a good time to move all dev team members to the Internal IdP (all dev will need to request Yubikey).n>n> \n> Please let me know if in case of any questions, comments or concerns.nn\n
