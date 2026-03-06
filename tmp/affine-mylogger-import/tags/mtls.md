# tag: mtls

total: 10

## #44566
- added: 2021-07-22 11:07:12

Visa Checkout, MC SRC\n\nEU, IN\n\nNA\n\nAP

---

## #44453
- added: 2021-06-28 11:02:54

F5 URL: <https://stage.outbound.gateway.mastercard.int:15848> Webhook\n\n**<https://mtf.outbound.gateway.mastercard.int:15845>**

---

## #44395
- added: 2021-06-17 11:24:18

For the PayPal configuration, there are three endpoints:\n\nf5vip_paypal_port = 15651\n\nf5vip_paypalipn_port = 15814\n\nf5vip_paypalsandbox_port = 15652\n\n \n\nThe IPN port is not going to be updated, but I that still leaves us with both a sandbox and a production link. I think we’ll need to update both of these, so we have one new production mTLS link, and one new sandbox mTLS link.\n\n \n\nIn QA and MTF we’ll likely only get one to the sandbox environment because we don’t have access to the PayPal production environment.

---

## #44390
- added: 2021-06-17 06:49:47

- [ ] If there was already in Traffic\n\n\\\n

---

## #44388
- added: 2021-06-17 06:12:24

Node tools for QA MTLS if added in common other QAs will not have the endpoint. So need to think.

---

## #44310
- added: 2021-06-09 09:32:41

- [ ] Sonar plugin for Intellij\n\n\\\n

---

## #44294
- added: 2021-06-07 09:25:23

t9eiVrJ3EZnORCi5RtLnyFY0HqaC/lq3uDUx+1WCad1BU+FDUW1JPq5W9gO9hzhb

---

## #44292
- added: 2021-06-07 04:41:08

XEqsv4iaP2Uvi29TPhFXHQqUg2E3/KsjqQtNdnZ56CvefMq4ZvUnXWx7GGF26L5qNyDLcQUNTNGF530lbP0uJnkQaUyMBElMBpOowY3OhTrXdXpirCluoxU8jnbku8psK5VV4hONLL9orK/xIBJYWweoWBITgwKlSiLAEMM5gKIoRv8znzJspNHBLqGgLcvNCOK/L5rMmx1B2JPerv5gaw==

---

## #44230
- added: 2021-06-01 09:16:03

iiq50Bpmt1jwqFjrz1cl3/pZ3/nYwzkiXwdXAPEXDpsvnrnoej6yiy5b8L8irGyZ0DjQMal+qEVQXyixVr8LclT2dij3AqptE8NkRLrkWRPTyGVM+wCRnQ2THS3AslStB6hYEhODAqVKIsAQwzmAoppYxX1ctoFEcirzl/5SC3M/8488rDn2C5p4etz4aVxTzl+I/TalbFc40pagrk0onnkQaUyMBElMBpOowY3OhTqznWVbNkfpnHYTcMQDu4NnMzUCR/Iyrudes00FcWVCDw==

---

## #43939
- added: 2021-03-30 04:52:38
- completed: 2021-08-17 17:11:38

Nathan Franks\n\nMadhuri Bharadwaj\n\n\\\nKrishna team is okay to update the old port if the new port is tested.\n\n\\\nHave we tested bigtherion?\n\n\\\nCreate service provider\nCreate MSO with that provider\nGet MM credentials\nCreate Merchants\n\n\\\nhttps://mastercard-smartit.onbmc.com/smartit/app/#/change/IDGC657NJDST2AQQA28YQPBPW3QWGA

---
