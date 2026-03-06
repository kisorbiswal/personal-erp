---
mylogger_id: 2162
tags: [pa-plan]
added: "2013-01-18 03:13:58"
source: mylogger
---

# Note 2162

Tags: #pa-plan

com.mysql.jdbc.exceptions.jdbc4.CommunicationsException: Communications link failure

The last packet successfully received from the server was 34,474,166 milliseconds ago.  The last packet sent successfully to the server was 0 milliseconds ago.
        at sun.reflect.GeneratedConstructorAccessor16.newInstance(Unknown Source)
        at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
        at java.lang.reflect.Constructor.newInstance(Constructor.java:525)
        at com.mysql.jdbc.Util.handleNewInstance(Util.java:406)
        at com.mysql.jdbc.SQLError.createCommunicationsException(SQLError.java:1074)
        at com.mysql.jdbc.MysqlIO.reuseAndReadPacket(MysqlIO.java:3052)
        at com.mysql.jdbc.MysqlIO.reuseAndReadPacket(MysqlIO.java:2938)
        at com.mysql.jdbc.MysqlIO.checkErrorPacket(MysqlIO.java:3481)
        at com.mysql.jdbc.MysqlIO.sendCommand(MysqlIO.java:1959)
        at com.mysql.jdbc.MysqlIO.sqlQueryDirect(MysqlIO.java:2109)
        at com.mysql.jdbc.ConnectionImpl.execSQL(ConnectionImpl.java:2643)
        at com.mysql.jdbc.PreparedStatement.executeInternal(PreparedStatement.java:2077)
        at com.mysql.jdbc.PreparedStatement.executeUpdate(PreparedStatement.java:2362)
        at com.mysql.jdbc.PreparedStatement.executeUpdate(PreparedStatement.java:2280)
        at com.mysql.jdbc.PreparedStatement.executeUpdate(PreparedStatement.java:2265)
        at com.kisorbiswal.mylogger.core.data.dao.MyLoggerDAO.getInsert(MyLoggerDAO.java:144)
        at com.kisorbiswal.mylogger.core.business.QueryProcessor.processCommand(QueryProcessor.java:53)
        at com.kisorbiswal.mylogger.core.business.QueryProcessor.processQuery(QueryProcessor.java:26)
        at com.kisorbiswal.mylogger.core.comm.base.MessageListner.processMessage(MessageListner.java:41)
        at com.kisorbiswal.mylogger.core.comm.base.MessageListner.processPacket(MessageListner.java:30)
        at org.jivesoftware.smack.PacketReader$ListenerWrapper.notifyListener(PacketReader.java:819)
        at org.jivesoftware.smack.PacketReader$ListenerNotification.run(PacketReader.java:799)
        at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:471)
        at java.util.concurrent.FutureTask$Sync.innerRun(FutureTask.java:334)
        at java.util.concurrent.FutureTask.run(FutureTask.java:166)
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1110)
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:603)
        at java.lang.Thread.run(Thread.java:722)
Caused by: java.io.EOFException: Can not read response from server. Expected to read 4 bytes, read 0 bytes before connection was unexpectedly lost.
        at com.mysql.jdbc.MysqlIO.readFully(MysqlIO.java:2497)
        at com.mysql.jdbc.MysqlIO.reuseAndReadPacket(MysqlIO.java:2949)
        ... 22 more
