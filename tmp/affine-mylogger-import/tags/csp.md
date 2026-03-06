# tag: csp

total: 4

## #44534
- added: 2021-07-15 10:01:55

update the document [of VPCM Cache](https://confluence.mastercard.int/display/MPGSSETP/Branding+-+CSP+cache)

---

## #44233
- added: 2021-06-01 12:47:34

What if bundle users do not come to white label branding to upload csp config? What will happen to their custom csps?\n\n\\\nAsset Service in HotHot, have code to notify.\n\nApplications in both HotHot and OLTP\n\n\\\nOLTP releases before the HotHot so during that period the branding update notifier will not work. It is okay as the release not considered complete until both HotHot and OLTP are released.

---

## #44224
- added: 2021-05-31 12:39:40

CSP Asset service, load test on startup\n\n[HotHot to OLTP](https://confluence.mastercard.int/display/MPGSRSP/Decommission+the+JMS+Remoting+Bridge)

---

## #43923
- added: 2021-03-25 11:06:30

Risk SPI testing\n\n1\\.As of now we will use an existing domain name to test the CSP config changes in MTF.\n\n2\\. We will revert the domain association change done for #1 after testing is done. 3. We will create a support request for Gateway team to create a new subdomain and we will use that for our testing.\n\n\\\n- [ ] See which all services are available when we call getServices? It will give us if those services are visible from OLTP to Asset.\n- [ ] Invoke one of our service with any data.\n\n\\\n

---
