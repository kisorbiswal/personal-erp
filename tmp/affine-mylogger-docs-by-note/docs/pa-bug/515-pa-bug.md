---
mylogger_id: 515
tags: [pa-bug]
added: "2011-10-20 06:33:47"
source: mylogger
---

# Note 515

Tags: #pa-bug

** BEGIN NESTED EXCEPTION **

java.net.SocketException
MESSAGE: Broken pipe

STACKTRACE:

java.net.SocketException: Broken pipe
        at java.net.SocketOutputStream.socketWrite0(Native Method)
        at java.net.SocketOutputStream.socketWrite(SocketOutputStream.java:109)
        at java.net.SocketOutputStream.write(SocketOutputStream.java:153)
        at java.io.BufferedOutputStream.flushBuffer(BufferedOutputStream.java:82)
        at java.io.BufferedOutputStream.flush(BufferedOutputStream.java:140)
        at com.mysql.jdbc.MysqlIO.send(MysqlIO.java:2744)
        at com.mysql.jdbc.MysqlIO.sendCommand(MysqlIO.java:1612)
        at com.mysql.jdbc.MysqlIO.sqlQueryDirect(MysqlIO.java:1723)
        at com.mysql.jdbc.Connection.execSQL(Connection.java:3283)
        at com.mysql.jdbc.PreparedStatement.executeInternal(PreparedStatement.java:1332)
        at com.mysql.jdbc.PreparedStatement.executeQuery(PreparedStatement.java:1467)
        at com.kisorbiswal.mylogger.core.SendTest$MessageParrot.processQuery(SendTest.java:110)
        at com.kisorbiswal.mylogger.core.SendTest$MessageParrot.processPacket(SendTest.java:83)
        at org.jivesoftware.smack.Connection$ListenerWrapper.notifyListener(Connection.java:813)
        at org.jivesoftware.smack.PacketReader$ListenerNotification.run(PacketReader.java:453)
        at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:471)
        at java.util.concurrent.FutureTask$Sync.innerRun(FutureTask.java:334)
        at java.util.concurrent.FutureTask.run(FutureTask.java:166)
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1110)
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:603)
        at java.lang.Thread.run(Thread.java:636)


** END NESTED EXCEPTION **
