# tag: issue

total: 2

## #2156
- added: 2013-01-17 10:40:09

At some point of time the application becomes unresponsive, happes for all users at same time, suspect issue in server side.

---

## #1308
- added: 2012-09-18 13:27:32

java.lang.NullPointerException \n     at javax.crypto.Cipher.<init>(Cipher.java:197) \n     at com.sun.crypto.provider.CipherForKeyProtector.<init>(KeyProtector.java:377) \n     at com.sun.crypto.provider.KeyProtector.unseal(KeyProtector.java:347) \n     at com.sun.crypto.provider.JceKeyStore.engineGetKey(JceKeyStore.java:133) \n     at java.security.KeyStore.getKey(KeyStore.java:779) \n     at com.securegrc.cloud.server.scanner.nexpose.utils.CryptoUtil.<init>(CryptoUtil.java:50) \n     at com.securegrc.cloud.server.scanner.nexpose.utils.CryptoUtil.getInstance(CryptoUtil.java:58) \n     at com.securegrc.cloud.server.apps.grc.security.builder.SecurityReportBuilder.buildReport(SecurityReportBuilder.java:243) \n     at com.securegrc.cloud.server.apps.grc.rpc.SecurityReportServiceImpl.generateReport(SecurityReportServiceImpl.java:76)

---
