# tag: predix

total: 5

## #12259
- added: 2016-12-22 11:35:00

UAA\nURL: https://kuaa.predix-uaa.run.aws-usw02-pr.ice.predix.io\nname: kuaa\nscret: se&;23d\nsubdomain: kuaa\n\n\nGrant Type = AuthCode.  \nThe Basic Auth code is a base64 encoding of the application clientId and secret,\n\nA more performant App will store the AuthCode and UserToken in the User's Session in a global cache.  The Reference App and Dashboard Seed show how to do this.\n\nACS\nname: kacs\nuses: kuaa\n\ngrant_type of "client_credentials- Client token\n\nClients\n\nid: powerup_client\ngrant_type: client_credentials\nscret: pu&;23d\nbase64: cG93ZXJ1cF9jbGllbnQ6cHUmOzIzZA==\nscope: powerup_data\nscope: powerup_static_data\naccess token validity 2min: 120000\nrefresh token validity 7days: 604800000\n\nid: powerup_cms\ngrant_type: client_credentials\nscret: cms&;23d\nbase64: cG93ZXJ1cF9jbXM6Y21zJjsyM2Q=\nscope: powerup_cms_data\nscope: powerup_cms_static_data\naccess token validity 2min: 120000\nrefresh token validity 7days: 604800000

---

## #11455
- added: 2016-08-11 10:30:14

12 factor app\n1.   Codebase.\n  One codebase per app. Code depends on libraries, not on shared code.\n2.   Dependencies\n  Explicitly declare and isolate dependencies. A twelve-factor app never relies on implicit existence of system-wide packages.  If the app needs to use a system tool, that tool should be vendored into the app.\n3.   Config\n  Store config in the environment. \n  A litmus test for whether an app has all config correctly factored out of the code is whether the codebase could be made open source at any moment, without compromising any credentials.\n  The twelve-factor app stores config in environment variables. They are never grouped together as “environments”(e.g development, test, production), but instead are independently managed for each deploy.\n\n  * Need exampeles.\n4.   Backing services\n  Treat backing services as attached resources\n5.   Build, release, run\n  Strictly separate build and run stages.\n  Releases are immutable. Run stage should have least possible moving parts.\n\n  Build- from code to excutable.\n  Release-  Build + Config\n  Run-  launching some set of the app’s processes against a selected release.\n\n6.   Processes\n  Execute the app as one or more stateless processes\n\n  The memory space or filesystem of the process can be used as a brief, single-transaction cache. Session state data is a good candidate for a datastore that offers time-expiration, such as Memcached or Redis.\n  Shared Nothing Architecture.\n7.   Port binding\n  Export services via port binding\n  Run web apps with embeded webserver. Bind a port for any service like XMPP, Reids etc.\n8.   Concurrency\n  Scale out via the process model\n  http://12factor.net/concurrency Does this suggest to create independent system processes?\n\n  *Did not understand clearly.\n9.   Disposability\n  Maximize robustness with fast startup and graceful shutdown\n\n   Crash-only design. Design the processes to be crashed at any time.\n\n10. Dev/prod parity\n  Keep development, staging, and production as similar as possible\n\n  Continuoues deployement. The code author and deployer should be same.\n11. Logs\n  Treat logs as event streams\n  Open-source log routers (such as Logplex and Fluent) are available for this purpose.\n\n12. Admin processes\n  Run admin/management tasks as one-off processes

---

## #11449
- added: 2016-08-10 14:29:40

https://d1fto35gcfffzn.cloudfront.net/academy/new/Pivotal_EDU_IntroductiontoPCF_Datasheet.pdf

---

## #11448
- added: 2016-08-10 14:27:37

micro services

---

## #11447
- added: 2016-08-10 14:27:26

http://12factor.net/

---
