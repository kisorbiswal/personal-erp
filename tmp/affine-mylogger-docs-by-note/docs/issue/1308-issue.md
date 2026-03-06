---
mylogger_id: 1308
tags: [issue]
added: "2012-09-18 13:27:32"
source: mylogger
---

# Note 1308

Tags: #issue

java.lang.NullPointerException 
     at javax.crypto.Cipher.<init>(Cipher.java:197) 
     at com.sun.crypto.provider.CipherForKeyProtector.<init>(KeyProtector.java:377) 
     at com.sun.crypto.provider.KeyProtector.unseal(KeyProtector.java:347) 
     at com.sun.crypto.provider.JceKeyStore.engineGetKey(JceKeyStore.java:133) 
     at java.security.KeyStore.getKey(KeyStore.java:779) 
     at com.securegrc.cloud.server.scanner.nexpose.utils.CryptoUtil.<init>(CryptoUtil.java:50) 
     at com.securegrc.cloud.server.scanner.nexpose.utils.CryptoUtil.getInstance(CryptoUtil.java:58) 
     at com.securegrc.cloud.server.apps.grc.security.builder.SecurityReportBuilder.buildReport(SecurityReportBuilder.java:243) 
     at com.securegrc.cloud.server.apps.grc.rpc.SecurityReportServiceImpl.generateReport(SecurityReportServiceImpl.java:76)
