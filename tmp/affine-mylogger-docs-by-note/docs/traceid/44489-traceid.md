---
mylogger_id: 44489
tags: [traceid]
added: "2021-07-05 05:27:18"
source: mylogger
---

# Note 44489

Tags: #traceid

Field cointaining Merchant supplied trace id:

 vpc_TxAcquirerTraceId

\
Where we plass the trace id: DE48SE63

\
Use this to look up for trace id: vpc_AgreementId

\
from 1st CIT response(VISA): 

financialNetworkCode": "abc", /MCC "financialNetworkDate": "transactionIdentifier":

vpc_TxAcquirerTraceId

Store Trace id returned by RSC against Agreement ID in CIT txn

\
Identify MIT from API field: source: Merchant

\
Check the Target flow for MC

In VPCM we can check the Visa flow.

\
CardPaymentEngine(CPE)
