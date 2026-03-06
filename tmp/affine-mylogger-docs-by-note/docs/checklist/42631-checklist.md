---
mylogger_id: 42631
tags: [checklist]
added: "2020-07-18 14:47:01"
source: mylogger
---

# Note 42631

Tags: #checklist

#### In Regular Intervals

- [ ] Check if the stories are covering the entire feature correctly. Create a page of stories so the list should be comprehensible.

### OnCreate

* A story under story should not be created.
* Correct PI, Feature
* Details is populated
* Estimation: Analyse the changes needed, dependencies for KT, Ops and time required for them. Dev time.
* If created by copying delete the previous tasks.
* Acceptance criteria aligned with feature AC.
* High Level stories should have clear and less coupled Acceptance Criteria(AC) so blockage of one story does not cause the dependent stories to spillover.
* Story points are aligned with feature points, try to get estimations correct.
* In Which all place do need to node tool change?

### OnTeamsChannel

* FeatureNo OneWord Requirement Owner
* OnInprogress
  * Attach Sonar before change
  * Do not merge code until we get Default value for QA/Prod. e.g The jks path we have not given.
  * PoC should be doing the real unknown parts.
  * Scope should be agreed with feature owner, by 1st iteration.
  * Once the approach is defined, we should create dependency stories for BizOps etc, do not need to wait for our implementation.
  * If security feature, do the threat risk assessment.
  * [https://fusion.mastercard.int/confluence/display/\\\~e054919/Threat+Risk+Assessment+Process](https://fusion.mastercard.int/confluence/display/%5C\~e054919/Threat+Risk+Assessment+Process)
  * Move any email communications that is significant to the feature to 1 year retention. Also attach to the story.
  * Add the PR to the corresponding story.
  * Any special dependencies in environment, should be noted. Better to have the handover doc created in the beginning so developers can keep updating when they encounter something that needs to be mentioned in handouts, we are not designed to remember details. Humans are story tellers :)
  * Keep track of the branch cut dates and release dates
  * Attach Sonar after change
  * Keep updating the Handout doc.
  * If Analysis story, keep the doc updating. Do not wait.
  * Organize import, format before commit
  * Observe and fix code quality and test coverage issues from sonar.
* \

==OnComplete/Accept==

- [ ] Log changes documented to handover to bizops
- [ ] Node tool changes with value, environment and which file to change for each environment documented, to handover to bizops
- [ ] All the tasks are completed
- [ ] Actual hours burnt
- [ ] PR is already Accepted/Closed
- [ ] Acceptance criteria met.
- [ ] Discussions: Add evidence of PR, Demo Videos
- [ ] Check if any of the information in Story needs to be in Feature level.
- [ ] Test cases and logs are added.

\
\
* OnRelease
  * Ensure we are testing appropriate Test cases and again appropriate dependencies e.g Simulator and other serservices.
  * Plan when to release and dependencies. If simulator changed other people might have changed.
  * Regression tests need to be added to the team tab for the release to show any issues with the code
  * Do not have dependencies on separate applications being deployed on certain dates as schedules often change.
  * If you are changing the way the Gateway currently works in production you need to have a way to disable that change if it causes customer impact (i.e., site properties, feature toggle, configuration, etc).
  * Ensure that you understand how Features will be used in Production and build automated test cases that covers those scenarios during your development to ensure exiting flows are not broken.
  * In case of column alteration/addition table gets locked, it is recommended to use json data columns.
  * If WSAPI should go only with Major release.
  * If your code going with Minor releases ensure your code is merged to minor branch explicitly. So your branch merges to master and minor both branches.
  * If Your code goes with Major release, ensure merged before code cut date.
  * Get All features and Stories are tagged.
  * Update priority <https://fusion.mastercard.int/confluence/pages/editpage.action?pageId=446219963>
  * In priority call, update Priority
  * Handover Page
  * Release summary
  * Team Deliverable <https://fusion.mastercard.int/confluence/display/MPGSREL/MPGS+20.3+-+Team+Deliverables>
  * Add handover document
  * Dependencies, jar version gaps
  * Gating flags
  * Removing gating flags
  * Certifications
  * You must not include any Database SQL (DDL or DML) in any release other than a Major Release. Minor Release, Maintenance Releases and Emergency Releases do not support database changes.
  * Always communicate there is a Cassandra/Postrgres/Oracle dependencies during BizOps Protect handovers so they are aware of the changes and always include a DBA in code reviews that include SQL including Cassandra statements execute by the services at startup.
* #PIClosing
* As we are nearing the end of PI, could you all please make sure the below activities are completed?

  Feature Level:
* Updating Feature State -> Staging by Feature Owner.
* Move the unfinished stories to new carryover feature if applicable.
* Ensure ALM updates are correct User Story:
* Task vs Story status verification. All Tasks should be in complete state whenever the stories are accepted.
* Make sure all stories are in Ready to Ship state.
* Validate evidence for applicable stories.
* Ensure Defect state is closed
* Ensure GCS stories are created wherever applicable.
* Documentation is updated for PI2 as documented here
* Design Document

  <https://www.toptal.com/freelance/why-design-documents-matter>
  * Description of the desired application, criteria for completion, and milestones.
  * Include implementation plan if any preference expressed by the customer. Or you want the customer to agree on the approach.
  * UI you got is not made by a programmer. The designer may have not thought of state changes, animations, what actions on each control clicked.
  * Non functional requirements. Performance, security, maintenance plan, failure handling.
  * List any concerns/risks/assumptions
* \
  Agile Best Practice
  * Have all stories defined by 1st day.
  * Do not remove stories from iteration in middle of the iteration.
  * Keep the stories and features updated with any major changes decided.

\
