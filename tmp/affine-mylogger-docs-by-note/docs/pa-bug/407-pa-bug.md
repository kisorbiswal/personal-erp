---
mylogger_id: 407
tags: [pa-bug]
added: "2011-10-04 06:40:06"
source: mylogger
---

# Note 407

Tags: #pa-bug

javax.net.ssl.SSLHandshakeException: Remote host closed connection during handshake
        at sun.security.ssl.SSLSocketImpl.readRecord(SSLSocketImpl.java:837)
        at sun.security.ssl.SSLSocketImpl.performInitialHandshake(SSLSocketImpl.java:1158)
        at sun.security.ssl.SSLSocketImpl.startHandshake(SSLSocketImpl.java:1185)
        at sun.security.ssl.SSLSocketImpl.startHandshake(SSLSocketImpl.java:1169)
        at org.jivesoftware.smack.XMPPConnection.proceedTLSReceived(XMPPConnection.java:806)
        at org.jivesoftware.smack.PacketReader.parsePackets(PacketReader.java:267)
        at org.jivesoftware.smack.PacketReader.access$000(PacketReader.java:43)
        at org.jivesoftware.smack.PacketReader$1.run(PacketReader.java:70)
Caused by: java.io.EOFException: SSL peer shut down incorrectly
        at sun.security.ssl.InputRecord.read(InputRecord.java:352)
        at sun.security.ssl.SSLSocketImpl.readRecord(SSLSocketImpl.java:818)
