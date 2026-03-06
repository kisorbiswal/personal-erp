---
source: mylogger
mylogger_id: 44395
created: 2021-06-17T11:24:18+00:00
created_raw: 2021-06-17 11:24:18
completed_raw: 
tags:
  - mtls
---

For the PayPal configuration, there are three endpoints:nnf5vip_paypal_port = 15651nnf5vip_paypalipn_port = 15814nnf5vip_paypalsandbox_port = 15652nn nnThe IPN port is not going to be updated, but I that still leaves us with both a sandbox and a production link. I think we’ll need to update both of these, so we have one new production mTLS link, and one new sandbox mTLS link.nn nnIn QA and MTF we’ll likely only get one to the sandbox environment because we don’t have access to the PayPal production environment.
