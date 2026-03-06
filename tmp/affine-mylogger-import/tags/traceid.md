# tag: traceid

total: 1

## #44489
- added: 2021-07-05 05:27:18

Field cointaining Merchant supplied trace id:\n\n vpc_TxAcquirerTraceId\n\n\\\nWhere we plass the trace id: DE48SE63\n\n\\\nUse this to look up for trace id: vpc_AgreementId\n\n\\\nfrom 1st CIT response(VISA): \n\nfinancialNetworkCode": "abc", /MCC "financialNetworkDate": "transactionIdentifier":\n\nvpc_TxAcquirerTraceId\n\nStore Trace id returned by RSC against Agreement ID in CIT txn\n\n\\\nIdentify MIT from API field: source: Merchant\n\n\\\nCheck the Target flow for MC\n\nIn VPCM we can check the Visa flow.\n\n\\\nCardPaymentEngine(CPE)

---
