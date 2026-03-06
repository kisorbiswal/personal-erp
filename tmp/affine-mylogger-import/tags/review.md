# tag: review

total: 19

## #46446
- added: 2023-02-21 07:04:07

- [ ] Always do testing and attach test evidences.\n\n\\\n- [ ] Requested product name should match the folder name, some times multiple folders are created for same source repository.\n- [ ] Always check the build info to ensure the generated artifact is same as requested.\n- [ ] If error check run command log\n- [ ] If error comes before even build started, there could be mistake in input, like branch name, folder name etc.\n\n\\\n

---

## #46445
- added: 2023-02-21 07:04:07

Al

---

## #45898
- added: 2022-06-10 09:55:50

If working on backend ensure to test it from UI too, Don’t assume it will be called from existing flow. I missed it in completion score.

---

## #45895
- added: 2022-06-09 11:11:56

Self evaluation by 20th

---

## #45893
- added: 2022-06-09 09:04:31

Limitations\n\nCounts that are computed, can’t be translated.

---

## #45890
- added: 2022-06-07 06:36:05

Team, the following users can be used to login for Stage and Dev environments: \\n catalog_admin / Welcome@12345 \\n super_user / Welcome@12345\n\n2\n\n[12:06](https://proddev-erp-cx.slack.com/archives/GF4SFE6KX/p1654583783122699)\n\nPlease refer to ‘How to Test’ section for testing BOSS api (using POSTMAN)

---

## #45889
- added: 2022-06-06 04:51:54

[Message Board](https://www.oracle.com/webfolder/technetwork/jet/jetCookbook.html?component=messages&demo=inline)

---

## #45877
- added: 2022-05-27 11:40:37

Delete braches by story number when moving to 25 status

---

## #45867
- added: 2022-05-26 10:14:44

FYI. From now on words, if we want to add or remove any fields from **products** index, we need add the field information in products-mapping.json as well. \\n other indexes no mapping file changes are required.

---

## #45866
- added: 2022-05-26 09:29:59

Below are few guidelines for DEMO. Please setup the valid data accordingly\n\n- [ ] **1.** Do not create segments, products or assets with names like Test, 123, personal names etc.,. \\n Use proper names you can use names like Samsung F11, Samsung F12, iPhone I2, iPhone I3 etc., \\n **2.** Before taking any action, explain what you are going to do like I’m going to segments list view and click on create button to create a segment \\n **3.** Don’t scroll the screen or switch to other screen when someone speaking about some topic in the demo flow. Wait until the completes the discussion or until they show some other screen. \\n **4.** If some flow is not working don’t try to troubleshoot during demo. You can say there is some issue and continue with next flow. \\n **5.** Demo only happy path scenarios, do not cover all scenarios or validations of the story\n\n\\\n

---

## #45865
- added: 2022-05-26 09:29:59

Below are a few guidelines for DEMO. Please setup the valid data accordingly\n\n- [ ] Do not create segments, products or assets with names like Test, 123, personal names etc.,. \\n Use proper names you can use names like Samsung F11, Samsung F12, iPhone I2, iPhone I3 etc.,\n- [ ] Before taking any action, explain what you are going to do like I’m going to segments list view and click on create button to create a segment\n- [ ] Don’t scroll the screen or switch to other screen when someone speaking about some topic in the demo flow. Wait until the completes the discussion or until they show some other screen.\n- [ ] If some flow is not working don’t try to troubleshoot during demo. You can say there is some issue and continue with next flow.\n- [ ] Demo only happy path scenarios, do not cover all scenarios or validations of the story\n\n\\\n

---

## #45809
- added: 2022-05-05 06:32:28

\\#976\n\n- [ ] Action chain references by default look in the current context. So if the chain is in application level and refers one more chain, we have to explicitly write application:chainId\n\n\\\n

---

## #45777
- added: 2022-04-27 05:41:42

[Learn DevOps](https://mylearn.oracle.com/learning-path/become-an-oci-devops-professional/35644/105156?elqTrackId=E7BD72F705B6C420F9FD380BF51A03BA&elqTrack=true)

---

## #45677
- added: 2022-03-22 11:46:25

iExpenses conferences, check what vendors we have

---

## #45589
- added: 2022-02-22 10:42:08

\\#Standup\n\n\\\nERD is generated from Stage, if we have to update do before MR, then it is done manually. Do we need it?\n\n\\\nIf have to do then, better to keep the

---

## #45415
- added: 2022-01-25 10:16:57

\\#Demo\n\nShow the confluence before APIs.

---

## #45403
- added: 2022-01-24 13:22:50

Test code with a different module, push to cxpcat only after testing. Broken code blocks other users.

---

## #45281
- added: 2022-01-04 06:04:37

Pain\n\n\\\n- [ ] No way to select which files to commit in visual builder.\n- [ ] why do everything from scratch instead of using existing tools? e.g We have something called ALM, a GitHub like software, lacks the basic functionalities like preventing merge when a comment is not addressed.\n  - [ ] If one reviewer's marks need attention previous approvals should be removed automatically. Not happening.\n- [ ] Any changes made to boss-module needs to be pushed with a different context to ge\n\n\\\n

---

## #45273
- added: 2022-01-03 07:06:04

- [ ] feature-cpxcatalog-462 like branch\n- [ ] cpxcatalog-462 example message\n- [ ] Do not commit auth code.\n- [ ] See the warnings in lint.\n  - [ ] ARIA labels where required.\n- [ ] Raise MR only after Jenkin is successful.\n- [ ] Ensure the history columns are not updatable. Also see any other columns should not be updateable, e.g BoType, userId in segment.\n- [ ] If the requirement is not clear/ambiguous, talk to the reporter.\n- [ ] Need to add segment status to opensearch/logstash config?\n- [ ] Confluence to have stage link, not a dev.\n\n\\\n\\#After Commit\n\n- [ ] Test on stage.\n- [ ] Any feedback received should be updated in confluence. e.g The attribute names were not valid in the segment group.\n\n\\\n- [ ] Level of abstraction e.g the domain/url if taking two parameters, should be concatenated in properties file not in java. Don’t keep passing it around separately.\n\n\\\n

---
