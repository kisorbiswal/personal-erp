# tag: util

total: 21

## #45760
- added: 2022-04-20 19:13:34

Send anything text, image, docs tag later.

---

## #45658
- added: 2022-03-15 02:32:34

RoamResearch, Building a second brain

---

## #45323
- added: 2022-01-14 17:34:14

Send without tag. Later tag. Tag using ML

---

## #45232
- added: 2021-12-20 16:34:40
- completed: 2022-01-13 11:43:14

New A 75.2.60.5

---

## #45231
- added: 2021-12-20 16:33:12
- completed: 2022-01-13 11:43:10

Old A 163.172.150.203

---

## #45222
- added: 2021-12-10 10:08:53

ssh opc@150.230.141.152

---

## #45127
- added: 2021-11-24 04:34:10

Implement infinite scroll, don’t load all data at a time, e.g now tag has a lot of data to make the application slow.

---

## #44767
- added: 2021-09-07 11:30:26

Write Anywhere & tag automatically. \n\nshould be able to write as I write on paper.

---

## #43718
- added: 2020-12-28 04:11:35

gK8tnWJiTEQkkDd5W23QUivUNbalRWrF5YsbJsk4mts=

---

## #43522
- added: 2020-11-30 13:59:38

- [x] If token expired, UI is not handling the exception. Server rejecting requests. Redirect the user to login.\n- [x] Update tag\n- [x] Sorting\n- [x] Due date\n- [ ] Allow to add #Tags in first line of all text. Process it in backend. Filter allows various combination of tags and dates.\n- [ ] Allow user to filter by tag and any of the dates.\n- [ ] Fix special characters, support utf8, check entire flow somewhere it's broken\n- [ ] On load the page is not responsive until scrolled in mobile.\n- [ ] When make get info calls the next day,  access token is already expired. User need to invoke request again. The call should be invoked programmatically.\n- [x] Give tool tip for Archive and Delete.\n- [x] Completed date and added should be more clear, now gets misinterpreted as a calendar event.\n- [ ] Do not show the delete, archive etc buttons in new card.\n- [ ] By default keep the card in view mode, e.g links clickable, double click to start editing.\n- [ ] Enable enter in get OTP and Submit OTP\n- [ ] Improve on how to search, e.g give list of tags as clickable links, auto complete tags.\n\n\\\n

---

## #43495
- added: 2020-11-29 19:09:48

WR3iQXXLqxP4ViBPcR/VYlWgAQJjUZtMswvRJ4C1Hf6dLiSL6hRUA6ojLFttoJtNuHAcSG1giWjDPOvwCaB83DM1AkfyMq7nXrNNBXFlQg8=

---

## #43493
- added: 2020-11-29 18:58:41

sNWB1F6YbGTyk61KOuYYPJbmvMggN9B8faXFDnTLUsqhgbqjLb42RQkPbGdQv+mZ9T3Mq1XTHn/YvrnBaSkWjoCYc2K1D2sqMmZVO8oZNn/lJ0bXZFwWel2mWyOdwSgs5uzwGXzPHARPmBoRmL56kO8NWmzVAR113c3Vvk9ICHqzAcPp6LkntiOus+M2QjG/

---

## #42914
- added: 2020-08-21 03:59:47

Which is cheaper? AWS, Google Cloud, Azure, OCI

---

## #42798
- added: 2020-08-03 14:57:42

yFEEs6n0SuRQGn3pfG85GYbUeEvIitNedWQGZRt9jrZbRJxhuN4zhi9dQEHUBhar8Gb/lhL27qXkZeNfbCj0UnZnDajDJnr2FJvxuRgT8gk1dVF/tJRWM1lmgjrNxS3788/O59HExzMQR6kE/fXfdjwGQkPmILo6bjl4kHxFHBk=

---

## #42786
- added: 2020-08-02 06:05:01
- completed: 2022-01-13 11:42:22

### Migration plan to Node, MongoDB, GraphQL\n\nSetup Node apollo-express\n\n* Define GraphQL schema\n* Route all requests to existing REST endpoint using Resolvers\n\n\\\nAdopt UI/Web to use GraphQL / Apollo client with apollo cache\n\n* Organize existing code\n* Use react tools to build and serve\n* Define router and routes if required\n* Add profile page\n\n\\\nImplement APIs in Node connecting to existing mysql DB\n\n* Define Database schema\n* Separate DB Layer. Make flexible to switch between databases\n* Add MyLogger Query Processor\n* Identify and add Data encryption\n\nMigrate telegram bot from Java to Node\n\nImport MySQL data to MongoDB. Start using MongoDB\n\nMigration Completed!!\n\n\\\n==Usability issues==\n\nAllow login by Email OTP, Remove Phone and FB login. Login with telegram and MS SSO. - Prasanna\n\nError handling, when OTP is wrong. Overal code review/refactoring required.(organize the code, consider react tools) - Prasanna will create new app structure, Kisor will add old code and refactor\n\n\\\nIntroduce redux\n\nRemove the + button, let user add information in Empty box. - Daljit\n\nHow will you add new empty box? We should allow to add above or below any card.\n\nEach card will have multiple tags\n\nNow it's hard coded to specific tag, allow user to add tags.(Add in the hidden bar)\n\nBackend to remember order or card in any board.\n\nMove the show all check near logout - Daljit\n\nBulk edit options: Archive, Delete, Update tags\n\nDefault board with refilled content(Kisor will write user manual here)\n\nDo not refresh data - Daljit\n\nState is disconnected form UI, fix it\n\nConfigurable boards(By detail only one, max 3)\n\nShow the tag for boards when loaded\n\n\\\n

---

## #42751
- added: 2020-07-30 14:57:34

DTMtg7Dkh3WbwtTDeU49L4hxyTbFry4BUXG5DF480Pg=

---

## #42687
- added: 2020-07-25 20:19:06

sQU63ZijCBjE+r1lxWKRrj0Koi3uFQ/6hjNfgnGRjX4V+OrITdEfm5bXEgj2urJ19kWVavhq30w49WVmu5EfmHlcPIFa12acpSJtnRfN9gSmZLkK6CnlsW5uSwHj4l19IOI4hUJy9hK/l3Aq4S/OIJXpVL3lk+55+xpLuU+twBpSfVtPTNJfM9z+5JzArpJEQEwuPiPzDle1IQghRmn9oV+1iyKZCfsd4NVX3Gor6drLhl9n2zOT+MKaJU1v03tyPXLfllLJmHBL3I65n4Dz4pfYxvC+MrHi95L73DkfAM4=

---

## #42672
- added: 2020-07-22 09:04:27

XjGpFCRM9iXTHLQW39PrI4AKKNxXqIwa2kK4F+zZbqlO9GB8qi3re5NgFt4IbxZZ1ouqg761Xt8z+kj7dlHkoE3ktSwqq7d6WdRy6kjhoQFoH61vWdsBzNW7bZNbNrgt1j2zsyWW9gbDmA92LlPW5+OMYwz2llpUZC/bPAhpVhT81KSCgY2lNB3YEIDXya2CElw0vtlBDgBKFrlIeJb0Yr1rHx7rokPkov1X4xLlu/wSXDS+2UEOAEoWuUh4lvRiERZb50/DY5iJKuKjUjwfvOZksHLhai4yyzNPo78O+dE8wsPAscaZK1o9fzqM67g1

---

## #42664
- added: 2020-07-21 18:14:24

DMTnQjrrb8sfj+qCBpFqvssLYbkHeadHLkxGEuXEtdA=

---

## #42662
- added: 2020-07-21 17:58:04

5258ALIWwMS4rlNYuwQdxazyKjzdyjI+0szUim26RXY=

---

## #42657
- added: 2020-07-21 12:14:58

DXY2LpsWgWWXYRMRzllJz2ffI7LYYFc7cJNpfMzIkZpBWu9oSfJKvRFvulqAPhEOa8lwQQvxSSd7BKl9WLc20L7W9RPAhDEPUs18ZWcZB0BTKDe+O8n+vAOtmr/wSLI5MXLZilTfxDWVPbw+qjYxSr2ssZ+RC93BtTaMqBj5sVt0FF0IqfGnD5uWvPXv44DtK0cTmLsom0vPrqiRr+G/gwCNd5CMetaD8CS9IY2F4b7qNqarGZ9W/hq1fpTw8cSmsju++FwrEBrn2DeyEP/H8Dz7BpXCi9MZTmdBFGVS4CiK0aTZ0MTU8qBxIioyB5xrWibi+DM1OqhKhOwl2c3ElcDNTtZxq3JSD6YJuxj5bisHBfMMWTcu+7W6ZF6MD5fT

---
