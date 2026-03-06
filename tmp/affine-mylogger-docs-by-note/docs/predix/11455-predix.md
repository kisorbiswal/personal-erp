---
mylogger_id: 11455
tags: [predix]
added: "2016-08-11 10:30:14"
source: mylogger
---

# Note 11455

Tags: #predix

12 factor app
1.   Codebase.
  One codebase per app. Code depends on libraries, not on shared code.
2.   Dependencies
  Explicitly declare and isolate dependencies. A twelve-factor app never relies on implicit existence of system-wide packages.  If the app needs to use a system tool, that tool should be vendored into the app.
3.   Config
  Store config in the environment. 
  A litmus test for whether an app has all config correctly factored out of the code is whether the codebase could be made open source at any moment, without compromising any credentials.
  The twelve-factor app stores config in environment variables. They are never grouped together as “environments”(e.g development, test, production), but instead are independently managed for each deploy.

  * Need exampeles.
4.   Backing services
  Treat backing services as attached resources
5.   Build, release, run
  Strictly separate build and run stages.
  Releases are immutable. Run stage should have least possible moving parts.

  Build- from code to excutable.
  Release-  Build + Config
  Run-  launching some set of the app’s processes against a selected release.

6.   Processes
  Execute the app as one or more stateless processes

  The memory space or filesystem of the process can be used as a brief, single-transaction cache. Session state data is a good candidate for a datastore that offers time-expiration, such as Memcached or Redis.
  Shared Nothing Architecture.
7.   Port binding
  Export services via port binding
  Run web apps with embeded webserver. Bind a port for any service like XMPP, Reids etc.
8.   Concurrency
  Scale out via the process model
  http://12factor.net/concurrency Does this suggest to create independent system processes?

  *Did not understand clearly.
9.   Disposability
  Maximize robustness with fast startup and graceful shutdown

   Crash-only design. Design the processes to be crashed at any time.

10. Dev/prod parity
  Keep development, staging, and production as similar as possible

  Continuoues deployement. The code author and deployer should be same.
11. Logs
  Treat logs as event streams
  Open-source log routers (such as Logplex and Fluent) are available for this purpose.

12. Admin processes
  Run admin/management tasks as one-off processes
