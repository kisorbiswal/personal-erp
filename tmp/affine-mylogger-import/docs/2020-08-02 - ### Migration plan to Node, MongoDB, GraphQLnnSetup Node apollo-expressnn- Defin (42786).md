---
source: mylogger
mylogger_id: 42786
created: 2020-08-02T06:05:01+00:00
created_raw: 2020-08-02 06:05:01
completed_raw: 2022-01-13 11:42:22
tags:
  - util
---

### Migration plan to Node, MongoDB, GraphQLnnSetup Node apollo-expressnn* Define GraphQL scheman* Route all requests to existing REST endpoint using Resolversnn\nAdopt UI/Web to use GraphQL / Apollo client with apollo cachenn* Organize existing coden* Use react tools to build and serven* Define router and routes if requiredn* Add profile pagenn\nImplement APIs in Node connecting to existing mysql DBnn* Define Database scheman* Separate DB Layer. Make flexible to switch between databasesn* Add MyLogger Query Processorn* Identify and add Data encryptionnnMigrate telegram bot from Java to NodennImport MySQL data to MongoDB. Start using MongoDBnnMigration Completed!!nn\n==Usability issues==nnAllow login by Email OTP, Remove Phone and FB login. Login with telegram and MS SSO. - PrasannannError handling, when OTP is wrong. Overal code review/refactoring required.(organize the code, consider react tools) - Prasanna will create new app structure, Kisor will add old code and refactornn\nIntroduce reduxnnRemove the + button, let user add information in Empty box. - DaljitnnHow will you add new empty box? We should allow to add above or below any card.nnEach card will have multiple tagsnnNow it's hard coded to specific tag, allow user to add tags.(Add in the hidden bar)nnBackend to remember order or card in any board.nnMove the show all check near logout - DaljitnnBulk edit options: Archive, Delete, Update tagsnnDefault board with refilled content(Kisor will write user manual here)nnDo not refresh data - DaljitnnState is disconnected form UI, fix itnnConfigurable boards(By detail only one, max 3)nnShow the tag for boards when loadednn\n
