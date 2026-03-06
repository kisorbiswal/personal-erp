# tag: 3pp

total: 17

## #44500
- added: 2021-07-06 07:25:15

New Features\n\nF368438\nF372804

---

## #44456
- added: 2021-06-29 05:20:05

- [ ] If toggle on what would have been blocked.\n\n\\\n

---

## #44393
- added: 2021-06-17 11:14:56

- [ ] Change the code to see only query parameters not including the post parameters.\n\n\\\n

---

## #44381
- added: 2021-06-16 00:50:07

- [ ] POST coming as GET. \n  - [ ] One group JD identified. Cookies.\n  - [ ] Query Parameters: submit Parameters. Ian is identifying them.\n\n\\\n

---

## #44293
- added: 2021-06-07 07:18:23
- completed: 2021-06-14 04:55:41

As discussed, the next steps are:\n\n\n\n* Add all the anomalies that were analysed should be added to GREEN list  this includes safe and unsafe merchants\n  * Only excluded merchants that were notified\n* Add all the FORGOTTEN merchants to the green list\n* For any merchant added to the GREEN list, also add its TEST merchant\n* For any TEST merchant profile in the GREEN list that does not have a matching PROD merchant in the GEEN list, add the PROD merchant to the GREEN list as well\n* Add all the merchants who have exceptions to the UNSAFE database list - the CBA merchant plus the additional ones Farenn supplied\n* Review safe field list and provide to Ian\n  * Potentially update CRQ with changes to safe field list\n\n\\\n

---

## #44261
- added: 2021-06-04 04:02:57
- completed: 2021-06-14 04:55:47

Use V3 of Exception list.\n\n10th June morning to 11th Evening. AP time.

---

## #44229
- added: 2021-06-01 09:05:46
- completed: 2021-06-14 04:53:58

The safe list we sent to Julie are old safe list. Does that mean we need to communicate merchants with new fields?\n\n\\\n- [ ] The Unsafe merchants need additional confirmation from Farenn.\n- [ ] Code change to consider more CBA 47 like merchant. Unsafe.\n- [ ] MTF Smoke test CRQ can be raised next week.\n- [ ] 3pp handover final.- Monday\n\n\\\n

---

## #44213
- added: 2021-05-31 05:35:57
- completed: 2021-06-14 04:55:30

Remove existing data. and update new.\n\nOnly 47 CBAs are unsafe, any more unsafe should be discussed\n\nGet splunk queries from Ed, update anything required.\n\nDocument should be an user manual.\n| **Region** | **Zip File** | **Assigned** |\n|----|----|----|\n| AP | Mar_25_Apr_07 | Anup |\n| AP | Apr_07_Apr_20 | Arpan |\n| AP | Apr_20_May_03 | Kishan |\n| AP | May_03_May_16 | Veera |\n| IN | Feb_09_Mar_05 | Arpan |\n| IN | Mar_05_Mar_29 | Amrisha |\n| IN | Mar_29_Apr_22 | Veera |\n| IN | Apr_22_May_16 | Kishan |\n\n\\\n

---

## #44202
- added: 2021-05-27 16:20:10
- completed: 2021-06-14 04:55:27

THINK: What will happen when safe list changes? Toggle and state of safe unsafe data in table.

---

## #44195
- added: 2021-05-27 03:42:56

dH47CK6kV5AzQudWcLxKIv+GAaGdwBPFAOWMjLFrX0nxtXlFevmQzbRUCq9mhuKFaZ6GKcNq4u0Sp32OGTWXoY4aOHWmgrDGYqs7k1ipKDbiZvfV46llqAYgttJdA4b7cHyv+6++mEA/sT2Wiqm+f2M/qXhimE5+/dX9kjt3xO57QLyilNYtlr9dgcVQNt7Bud9N5mK7TYtJudiD0cY3maGd0OOM/Fvo0yTkJ0q9nDZwbxQnzCHTA6G8jZGGYqOqEcoOa1NCzIIS2U7902CYCBhEkvlk5Zw4t1DGazVxIJcvctNEUODQv/LwLpd6sZ5hU+YgO5oYhF+GMnXIXthTbLQKvyDLEq42J8+8nQ9Xy8cO4cUGHiIi6uMAfWI/ShuxSGy9g/CrA7bSrVubS+yehjzMhtOlBu+/bIrRY3O0uZInZngsK4Y/9I4kYcYEFsCOBITz8cktnehuzaSqlYcIuHXPPO+5LMZYGB8xAh6afmDEfnwDuUMY7Y3WSJuqm3z3ijspAN7OOrFk86SDJAOEPCj2vMTY416VL+3BnFGj7/1/H095ZBrWglhxWRuknQJBLps0ssVbnSXHeIpDiCaVaKnIS54zzdrn1rLeJM8dl0t2YcfimD+bAWQbBjzWrr0aOuBDk5pxXcB5TgfMwI+7Q5eiTc5StRVcgR7ZFkjHk2k=

---

## #44192
- added: 2021-05-26 06:23:12

IlJL8N48tMPUw/mMEIheMzXT6yq1Z//s6q+kuocNw+tlWXWd0Tu2GgLPHgUiecm7c+B9EFsbg+vqwjwy2NTr6BA8/EqiRn+6BFJvU8ABtApYgn7tub9MIG7TWfcXzeDcE6Jk3BYfT+5d1+lkXnOrLiMqm/28c5AHTfVBKEBUcvkx7MlLtH/erLzmMrg5Rbzn8axtYkSQczG6Ctspe54zAio8TnK8ApweI6Ipu0F+BHOB/6xey0JTVuHqqepMmrKeUQBKzaQuHyY/IIvE0R/gsSjZfRovfM31CiWpVrV3ZT/KWnhY46MnwFxlG5pU8tC0pTlBE5/UhiKHJn4B9jWFdSr/TEeQOIgSzZ4ZKtkXXzsXrZslK/hco/n4ikaayV2BD3IKUuVCS7ve7OLbiGMNp9Y8clNTV82RKvpDX+9ajerUnwPRQHMNbNEzt5VFarPZtLwVa6UYA5dxCuYy4Yqz0WR1RJypY+YjfxiWI6xjTJad2vEmZ444IqEG74enQKA+o0RN1jpIkfnbc+OOkHLa/IEEMX7U2gIW4kNQ+aDsFHcGM0s8Z0PAzQLntUhrJdOOl6JNzlK1FVyBHtkWSMeTaQ==

---

## #44175
- added: 2021-05-24 15:50:42
- completed: 2021-06-14 04:55:14

| SL# | CRQ Number | Region | ENV | Date Raised | Execution Date | Status |\n|----|----|----|----|----|----|----|\n| 1 | CRQ000000545357 | Prod AP: VPCM Data Insertion | AP | May-24 | May-27 | Requested for change |\n| 2 | CRQ000000545733 | Prod IN: VPCM  Old Data removal/New data insertion | IN | May-24 | May-27 | Draft |\n| 3 | CRQ000000545360 | Prod AP: VPCT  Data Insertion | AP | May-24 | May-27 | Requested for change |\n| 4 | CRQ000000545817 | Prod IN: VPCT  Old Data removal/New Data insertion | IN | May-24 | May-27 | Draft |\n| 5 | CRQ000000545686 | Prod NA: VPCT  Old Data removal/New Data insertion | NA | May-24 | May-27 | Draft |\n|    |    |    |    |    |    |    |\n|    |    |    |    |    |    |    |\n|    |    |    |    |    |    |    |\n\n\\\n

---

## #44170
- added: 2021-05-24 04:13:15
- completed: 2021-06-14 04:55:07

#### IN region, Smoke Failure\n\nTESTSMK_VPCM-7\n\nTESTSMK_VPCM-5\n\nTESTSMK_NON3DS-5\n\nTESTSMK_VPCM-6\n\nTESTSMK_NON3DS-6\n\nTESTSMK_VPCM-4\n\nTESTSMK_VPCM-7

---

## #44133
- added: 2021-05-21 05:36:31

LpX5Cv2U3h6s5r6RRwSffh1oPzHwhVsk4MAWS/QoOA+f28wNFEi7VGTCDCsVSX6nVLRqrHCDlCgVs/PxIawaNcaC0UnFUJpNyoMf8XrxlTl63InQf0rBI2s3Zwq5pRv7RmuFeRZ5IEZLM4/bR58gJO5cwouLjRx1aDigqMNSgmhNS9tJYT/+MoUwF0VCf4C1M/tXWlFXfT3lhYNL4pMQHfDODHAwRY/IVxZPvzkrTe5YI+6PhhVlvgYCNOl+BWbOOTNseqqCZBfU8ZfC1GS7JnveljepTDzlXIq/zVquMbsaS00EDYehBGm38Pq3Gi2H9scS+czelv31Stv6KmO8l00g6KfuFclcrlY+iEqOdZKO3ljX68NZ7WdT1WY2lrR/k8+wjGcWT80ahMFbGFb/xR5N3GQipVnqih/49pYJNtBetW7qREqfAQ83BhQb8vVk1HQYoOuAa6Yc29iw7fZEmn6YZIlfpK3/lefXuuyZQJRHTxHHajqAfB/c9OAvjMkestUudgKpqhhgWd9WG/he25eiTc5StRVcgR7ZFkjHk2k=

---

## #44121
- added: 2021-05-20 05:20:28

WO0000003844981 : Request to run query in Postgres and Oracle Prod DB in AP, NA  IN region datacenters\n| **Merchant** | **Action** |\n|----|----|\n| ALAZHAR | None |\n| BESTBUYINS | None |\n| 273251090002 | Disable toggle for this merchant |\n| 10701400214 | Disable toggle for this merchant |\n| GTB111030B02 | None |\n| BESTBUYINS | None |\n| TEST001070004766 | None |\n| HVTRAITIM | None |\n| E02679901 | Disable toggle for this merchant |\n\n\\\n

---

## #44107
- added: 2021-05-18 13:42:58
- completed: 2021-06-14 04:54:04

| **Region** | **Splunk** | **Toggle Enablement date** |\n|----|----|----|\n| AP | region=sy OR region=bn | 25th March |\n| NA | region=st OR region=ks | 25th January, collected from 1st Feb |\n| IN | region=pn OR region=de | 9th February |\n\n\\\n

---

## #43626
- added: 2020-12-11 10:50:44
- completed: 2020-12-16 11:55:03

YFguNzTVZbsmipTDVrxP8jCwi3ImyCsa1rMEpoesrou1EZe9veDq6tPfOPckqay9NqRPzq9YnOz5Flopo2oR3j9HI+F6r7IoQqSMHh0ZXC93uDIHB9p/IGMo1bBmu1gvpfy1Gkg3dV1dFyax1fZoZxNxF2B8+MeLoqCkFzRJG0ffUZNjBNJrrIlkOCcuLZLEjNfhpB+2mpsPyOuhz9O25wLiuyRRUSsQQAhssuvdlRNhv1/Ih+EEnm5ygM+/dBsX6QvAjmb8awn6sH5Y7Lk/740dJ6TlDZ0VNrXmuSG1i3qDr9ku5jPnjn/ESdRgG7u0a5ZyZByyFTZ6n17Z3S3g1AmgOlnTCskpnaNFrjjKfV7urB/ojw/jPNCxLaHWZi5ejpYyB3DcdZJGom18/KkDvy6qo6/H5xh+AxhJBSGeD9n32tvTnyfT5ynUrbY3lWd1kP5NNWkmzdkVCVSJLAvpKGRejy3xw0zEgm7C6zvEM35RApYFz+8DaRQFj+FA+/k6+fxx3aP3FrgSwlrsM6DBPKYsOwavwDSjFgp2886Be39LQ+ohXfPO9w4ML2IzzgV4smyd07Y7ZazFZOPGqSuLSQ/C+jWK3VjHGm+c1MlfoSyZZTmz++SuXfvHs/eDRpfJ67VmSpOsnSc4AuA9iCm476Pdon+1L7ZO8xBgVzetiObz71FZv35Rzvip+3E1HONOpctdEE3WYJdlXWrx7+MYU20zSui17iXMJQkm8rfY3eBxf8z+cjv5hyREp8kWJz3zb2bTfu1CpTfpr+mYAvNEX9N5J63QtazZ4GquqVM9fszEwPnjlJH5ePXh8uSB23zJJv+qj5O1+1ypFjtvnZq0FdLDlT6ZGv4tnzrfHotDMRUYqdtcH3KZUoI3MDirH6tufdgMyREpTiehaY6zpcIF+Q==

---
