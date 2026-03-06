---
source: mylogger
mylogger_id: 515
created: 2011-10-20T06:33:47+00:00
created_raw: 2011-10-20 06:33:47
completed_raw: 
tags:
  - pa bug
---

** BEGIN NESTED EXCEPTION **nnjava.net.SocketExceptionnMESSAGE: Broken pipennSTACKTRACE:nnjava.net.SocketException: Broken pipen        at java.net.SocketOutputStream.socketWrite0(Native Method)n        at java.net.SocketOutputStream.socketWrite(SocketOutputStream.java:109)n        at java.net.SocketOutputStream.write(SocketOutputStream.java:153)n        at java.io.BufferedOutputStream.flushBuffer(BufferedOutputStream.java:82)n        at java.io.BufferedOutputStream.flush(BufferedOutputStream.java:140)n        at com.mysql.jdbc.MysqlIO.send(MysqlIO.java:2744)n        at com.mysql.jdbc.MysqlIO.sendCommand(MysqlIO.java:1612)n        at com.mysql.jdbc.MysqlIO.sqlQueryDirect(MysqlIO.java:1723)n        at com.mysql.jdbc.Connection.execSQL(Connection.java:3283)n        at com.mysql.jdbc.PreparedStatement.executeInternal(PreparedStatement.java:1332)n        at com.mysql.jdbc.PreparedStatement.executeQuery(PreparedStatement.java:1467)n        at com.kisorbiswal.mylogger.core.SendTest$MessageParrot.processQuery(SendTest.java:110)n        at com.kisorbiswal.mylogger.core.SendTest$MessageParrot.processPacket(SendTest.java:83)n        at org.jivesoftware.smack.Connection$ListenerWrapper.notifyListener(Connection.java:813)n        at org.jivesoftware.smack.PacketReader$ListenerNotification.run(PacketReader.java:453)n        at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:471)n        at java.util.concurrent.FutureTask$Sync.innerRun(FutureTask.java:334)n        at java.util.concurrent.FutureTask.run(FutureTask.java:166)n        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1110)n        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:603)n        at java.lang.Thread.run(Thread.java:636)nnn** END NESTED EXCEPTION **
