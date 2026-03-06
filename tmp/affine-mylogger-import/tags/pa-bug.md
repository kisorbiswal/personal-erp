# tag: pa bug

total: 11

## #609
- added: 2012-04-17 04:41:30

stream:error (text)\n        at org.jivesoftware.smack.PacketReader.parsePackets(PacketReader.java:306)\n        at org.jivesoftware.smack.PacketReader.access$000(PacketReader.java:44)\n        at org.jivesoftware.smack.PacketReader$1.run(PacketReader.java:76)\nstream:error (text)\n        at org.jivesoftware.smack.PacketReader.parsePackets(PacketReader.java:306)\n        at org.jivesoftware.smack.PacketReader.access$000(PacketReader.java:44)\n        at org.jivesoftware.smack.PacketReader$1.run(PacketReader.java:76)

---

## #589
- added: 2012-04-07 14:37:07

com.mysql.jdbc.exceptions.jdbc4.CommunicationsException: Communications link failure

---

## #583
- added: 2012-04-06 04:13:46

com.mysql.jdbc.exceptions.jdbc4.MySQLNonTransientConnectionException: No operations allowed after connection closed.Connection was implicitly closed by the driver.

---

## #515
- added: 2011-10-20 06:33:47

** BEGIN NESTED EXCEPTION **\n\njava.net.SocketException\nMESSAGE: Broken pipe\n\nSTACKTRACE:\n\njava.net.SocketException: Broken pipe\n        at java.net.SocketOutputStream.socketWrite0(Native Method)\n        at java.net.SocketOutputStream.socketWrite(SocketOutputStream.java:109)\n        at java.net.SocketOutputStream.write(SocketOutputStream.java:153)\n        at java.io.BufferedOutputStream.flushBuffer(BufferedOutputStream.java:82)\n        at java.io.BufferedOutputStream.flush(BufferedOutputStream.java:140)\n        at com.mysql.jdbc.MysqlIO.send(MysqlIO.java:2744)\n        at com.mysql.jdbc.MysqlIO.sendCommand(MysqlIO.java:1612)\n        at com.mysql.jdbc.MysqlIO.sqlQueryDirect(MysqlIO.java:1723)\n        at com.mysql.jdbc.Connection.execSQL(Connection.java:3283)\n        at com.mysql.jdbc.PreparedStatement.executeInternal(PreparedStatement.java:1332)\n        at com.mysql.jdbc.PreparedStatement.executeQuery(PreparedStatement.java:1467)\n        at com.kisorbiswal.mylogger.core.SendTest$MessageParrot.processQuery(SendTest.java:110)\n        at com.kisorbiswal.mylogger.core.SendTest$MessageParrot.processPacket(SendTest.java:83)\n        at org.jivesoftware.smack.Connection$ListenerWrapper.notifyListener(Connection.java:813)\n        at org.jivesoftware.smack.PacketReader$ListenerNotification.run(PacketReader.java:453)\n        at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:471)\n        at java.util.concurrent.FutureTask$Sync.innerRun(FutureTask.java:334)\n        at java.util.concurrent.FutureTask.run(FutureTask.java:166)\n        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1110)\n        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:603)\n        at java.lang.Thread.run(Thread.java:636)\n\n\n** END NESTED EXCEPTION **

---

## #407
- added: 2011-10-04 06:40:06

javax.net.ssl.SSLHandshakeException: Remote host closed connection during handshake\n        at sun.security.ssl.SSLSocketImpl.readRecord(SSLSocketImpl.java:837)\n        at sun.security.ssl.SSLSocketImpl.performInitialHandshake(SSLSocketImpl.java:1158)\n        at sun.security.ssl.SSLSocketImpl.startHandshake(SSLSocketImpl.java:1185)\n        at sun.security.ssl.SSLSocketImpl.startHandshake(SSLSocketImpl.java:1169)\n        at org.jivesoftware.smack.XMPPConnection.proceedTLSReceived(XMPPConnection.java:806)\n        at org.jivesoftware.smack.PacketReader.parsePackets(PacketReader.java:267)\n        at org.jivesoftware.smack.PacketReader.access$000(PacketReader.java:43)\n        at org.jivesoftware.smack.PacketReader$1.run(PacketReader.java:70)\nCaused by: java.io.EOFException: SSL peer shut down incorrectly\n        at sun.security.ssl.InputRecord.read(InputRecord.java:352)\n        at sun.security.ssl.SSLSocketImpl.readRecord(SSLSocketImpl.java:818)

---

## #384
- added: 2011-09-29 04:51:24

com.mysql.jdbc.exceptions.MySQLNonTransientConnectionException: No operations allowed after statement closed.

---

## #371
- added: 2011-09-28 11:56:48

XMPP Message Error\nMessage delivery to mylogger@jabber.org/Smack failed: status=UNREACHABLE (Code 503) from

---

## #368
- added: 2011-09-28 09:09:36

xmpp message error 404 from pidgin and "did not receive your chat."

---

## #177
- added: 2011-08-23 05:50:55

I was not able to retrieve list of some category later found that the problem is where the description contains double quote, I wander how the it was not escaped by addslashes method, if not how it was working it today afternoon. With same code I&apos;m able to &quot;double quoted&quot; sentences.

---

## #64
- added: 2011-08-20 09:53:55

Looks like when I search for only l its not returning the full content of gas

---

## #56
- added: 2011-08-20 08:46:34

Changed the data type of description from Varchar(256) to mediumtext

---
