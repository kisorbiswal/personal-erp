# tag: retro

total: 21

## #45996
- added: 2022-07-12 12:29:42

Better to have module/code base owners. Now we have code in segment difficult to undestand why the code is written, nobody recognizes them. So if we have owner they can review, and can be contacted in case of issues while refacting or reusing the code.

---

## #45971
- added: 2022-07-06 10:26:36

Better to get proper UI from UX, not description. They are confusing when description says something and image shows something, also often we find contradictory things there.

---

## #45932
- added: 2022-06-23 06:48:42

Unformatted code.

---

## #45927
- added: 2022-06-22 14:06:19

What exactly we do when we release? What is API for commerce? Do they have access to our DB, the Ids make sense to them?

---

## #45924
- added: 2022-06-22 07:03:46

Can we get stable env? Lot of time going in env issues.\n\n\\\nLogstash fails, e.g Who looks into it? Maybe should have owners 2 people, so they understand what changes and what’s expected now.

---

## #45923
- added: 2022-06-22 05:21:56

Discuss the architecture and data flow. How SaaS, Commerce, Open Search, IDCS etc are connected?

---

## #45902
- added: 2022-06-13 09:27:58

Just noticed some people have committed code only to main, not to develop. So while we try to take it from main and try to merge to develop, we get conflict in their code.

---

## #45901
- added: 2022-06-13 05:52:07

I'm getting 400 error for all BOSS APIs\n\nNow, we can't really work without running the app. And this is not in our control, env always breaks.

---

## #45881
- added: 2022-05-30 06:55:52

It will be helpful if we attach the PRs to the stories. If something is broken later, it will be easy to find what was the code when implemented.

---

## #45873
- added: 2022-05-27 05:05:34

When we refactor the code, the common code should not have conditions based on input, I think it’s better to transform the input before passing to the common code.

---

## #45862
- added: 2022-05-24 06:38:37

BOSS changes not reflecting if script changes pushed: Restart the containers if the script is changed else periodic restart like twice a day.

---

## #45801
- added: 2022-05-04 08:57:22

\\#976\n\nIf something is done in a different place that dosn’’t always means less work. Code is not directly reusable. Refactoring while keeping other parts working is not easy.

---

## #45799
- added: 2022-05-04 05:18:48
- completed: 2022-07-18 09:29:20

\\#1011\n\nSomeone broke my code. No response when asked in the common channel. \n\n\\\nIt was data corruption from backend.

---

## #45775
- added: 2022-04-25 08:29:01
- completed: 2022-07-18 09:29:14

Remember to calculate effort for card view and listview separately. Now the code flow is different, but we often have only one story, so overlook the effort.

---

## #45706
- added: 2022-04-01 06:17:19
- completed: 2022-07-18 09:29:04

Disk full for BOSS. Maybe we should get larger machine or have own boss.

---

## #45697
- added: 2022-03-31 07:49:58

Duplicate codes in different places. like main product, products card and list pages.\n\n\\\nCan we have own boss? So restarts does not impact others?\n\n\\\nWe should allow merging in chunks to avoid merge conflict. Merging is difficult with this auto generated code.

---

## #45681
- added: 2022-03-23 04:55:46
- completed: 2022-07-18 09:20:12

\\#Problem\n\nNo way to revert single file on VBCS\n\nThe json blocks for action chain elements are scattered, and difficult to refactor.\n\nHow to navigate to endpoint from SDP?

---

## #45272
- added: 2022-01-03 05:07:31
- completed: 2022-04-20 06:40:42

Thank you so much, Sarath for your help in UI.

---

## #44186
- added: 2021-05-25 14:37:43
- completed: 2022-01-03 05:07:25

Too many times we had to update nudetect and callback interface nodet tools.

---

## #44173
- added: 2021-05-24 07:50:39
- completed: 2022-01-03 05:07:24

Nodetools for minor version are skipped should be added to upcoming versions.

---

## #44054
- added: 2021-05-05 13:57:54
- completed: 2021-05-19 10:34:22

F7Gme6XwPmF74gl/Mj+VYdpmFGu/Gh1XuLzcI6i9VR7gQBPrd1YHqRBT9/4QL3eY4iQ7a/7D7MNO3bl5QK41SgPKui6TTq4Ef6DmE2TMIp8m6V70e7mlesCpblk284VehRefwQjKiUMMEooTBXjANso+SdzRjwzHTWqpQ0j02GZdE9vzp9kmTd33ILvY2ge0Wzs0VvMKmDeMLQxwTZ7/zKvWGasE0MT8gOvuhOJNbPK8YUYbULPddczv0pbXQKotHc9DnIOtbfBcwRsOnOPPG1gXw7/vAaKAnuxgYuNciAZ4IDf+QFzIZNs1MfQoQgtNcHThtlRyaA9MRQESRE4AWOcTjlEu7ISqNjk6weNIYGRugiL7QSXZO1gVMZzMxyzSKp+68buWKreVqldJscgE8yiowW0uMSo0pqCuqiElC/U5csg+aON+LS7RvJaoi3C65iL0viYJSDCO7OMSKMsf+9w+/jAzOzqFWhxvWblsH25SSQ18JKJG23vptYKgoULTCNmWKMtEoo+d02/R1bk91r139IpLQeWp73YNitI8x6Gfl6LvAZ0dtdgNSVF/Ri4uoIRk93Qiz6KNJ5x0xF9KVx/lD20Zg5oLD6RJu72Lp8xpSRIGp7Cid4DvCQgHewV2+MNzurWkBidjHcOWknCqt5eXx0tuNNMrSLrRz1O7aYYQdBIkEaL/ih3MHv+yhFBjkXb+NHtGohHtC7+Of6LU2o55+LPKuSnDH28D/wF1O+2TqkU+SgUQ4cZNsqn2plrzifAx9hJUidgzlR6ez+OTwFnLGzDYgsvWC4HiX6yXqOWpKxRLMdqKExs3IGIhRsUgwFeCjjqaypmIAW+T8hJ52q8jBeD4lbP6spNM3zRh5/sv3mPYFtnX65DgvAa8lF/dmyC7Z6pKGkT5RisLUKJ00T9aeldeWCXU1ONy/QJ9lFLmUgw+ED8q5I38g4nIJoqmeyoWAyivtPC+3HG7YDr86ZjO20LvsMNyYSf8TcnYNDaW7HE3F+6AJ4iPeuQPmQcATDJxRzSffx+0B4jLu4/RDqIrlpxRbPNf04E+KqmVLEQsuyMZwpZUUozjBu7QrvLBpfqxHfk0DT2JOnoSGH9SbxanKAkEuHy9+PlTnccbDxiIUYnQIv8VqVvjANn6JrwsiArTZ3deszBacuGFQpMqpDgQgBgZuQLdBGXmxIpyY9mLOjB3c3wiP1Y2imMIP5glxk+JYxO1r9YM98LMm7sMdWCZP65NwZxfzrakdUSss8u2/TJbJ5aaVlRDQHmYYIUO+ituRQvr/7pPcH+tIOOk9HGFD9Rntkd5qEzYmMQsRiByjbcv7H/D5kDFHkq+ezXIAOKNzLVXeh/U3grZAUdSUueY5/4H1+CzDdLW4FerqP/c75Kd/p9nOVvUavnoe3nKJFS0W3MgpbLCymecESIxFndlDB+vQLcewCe6Ef0wXS+bh+pFLxnFBNPCmjWoOqNbCBMRz2RqExKWOeDVr8Ydk8Xax8DtNNREBFQVtgIyzSV+y2oVCRs8rURhs1Ztvhiny7eCTBWL2OWDBWm9kqeWVZfYxvC+MrHi95L73DkfAM4=

---
