# tag: oracle

total: 85

## #46655
- added: 2023-05-26 04:39:41

[TPP Build Process](https://confluence.oraclecorp.com/confluence/pages/viewpage.action?spaceKey=FRE&title=TPP+Build+Process)\n\n[TPP Build General Guideline](https://confluence.oraclecorp.com/confluence/display/FRE/Thirdparty+Application+-+General+guidance+for+building+open-source+products)\n\n[TPP Build FAQ](https://confluence.oraclecorp.com/confluence/display/FRE/Tpp+build+process+checklist+and+FAQ)\n\n\\\n[OSCS Pipeline](http://phoenix43176.ad1.fusionappsdphx1.oraclevcn.com:8111/buildConfiguration/FreTppCodeScaning_FRETppCodeScan#all-projects)\n\n[TPP Build Pipeline](http://phoenix43176.ad1.fusionappsdphx1.oraclevcn.com:8111/buildConfiguration/FREThirdpartyProd_FreTppSourceBuildDevProcessing)\n\n\\\n[Monolith Repo](https://alm.oraclecorp.com/fusionapps/#projects/12c-fusionapps-tpp/)\n\n[Spectra Repo](https://alm.oraclecorp.com/fusionapps/#projects/spectra-fusionapps-tpp)  Click again after logging in to open the correct project.\n\n\\\n\\\n[BA Request details Monolith](https://oscs.us.oracle.com/oscs/pls/isplsapproved?baid=115456)\n\n[BA Request details Spectra](https://apex.oraclecorp.com/pls/apex/r/fretpp/spectra-thirdparty-management-application/product-all1?session=100874507517069)

---

## #46563
- added: 2023-04-25 04:57:13

US team is not giving compete information on the pipeline we use, no documentation of the XML input we give to the pipeline.\n\n\\\nWe are discovering the rules by seeing existing configs.\n\n\\\nOn Friday 21st April 2023 1.21pm they sent the requirement. We completed by Monday but they say we missed a release because of that. It had 314pps, camunda bpm 7.19.0 is the 3pp. \n\n\\\nGot syntax error but they say it’s config issue, the [pipeline](http://phoenix43176.ad1.fusionappsdphx1.oraclevcn.com:8111/buildConfiguration/FREThirdpartyProd_FreTppSourceBuildDevProcessing/31814?buildTab=overview). Asked them how to see such log, waiting.\n\n\\\nKrishna, says if got some issue you have to solve on your own. Can’t depend on US team.

---

## #46491
- added: 2023-03-08 10:17:38

[TPP Build General Guideline](https://confluence.oraclecorp.com/confluence/display/FRE/Thirdparty+Application+-+General+guidance+for+building+open-source+products)\n\n[TPP Build Process](https://confluence.oraclecorp.com/confluence/display/FRE/TPP+Build+Process)\n\n\\\n- [ ] Look for the branch/tag for the required version\n- [ ] Check the commit history of pom or build.gradle to find specific version\n\n\\\n

---

## #46362
- added: 2023-01-20 07:18:34

Steps\n\n1. login to [oim.oraclecorp.com](http://oim.oraclecorp.com/)\n2. Click on Reset Passwords\n3. Select More..\n4. Kerberos row re Reset Password\n\n\\\n

---

## #46326
- added: 2022-12-22 06:31:58

Nagarjuna Pampati  [11:53 AM](https://proddev-erp-cx.slack.com/archives/D03TS77RD1N/p1671690199726479) \\n <https://blogs.oracle.com/apex/post/building-a-rest-api-to-deploy-apex-apps>blogs.oracle.com[Building a REST API to Deploy APEX Apps](https://blogs.oracle.com/apex/post/building-a-rest-api-to-deploy-apex-apps)Every APEX developer knows how to export and import applications using the Application Builder. And since an APEX export file is actually a SQL script, it's also pretty obvious, that one can use SQL\\*Plus or SQLcl to deploy the application on the target system. So far, so good. The export part of the...<https://blogs.oracle.com/apex/post/building-a-rest-api-to-deploy-apex-apps>\n\n\n---\n\nNew\n\nNagarjuna Pampati  [11:59 AM](https://proddev-erp-cx.slack.com/archives/D03TS77RD1N/p1671690593852649) \\n <https://confluence.oci.oraclecorp.com/pages/viewpage.action?spaceKey=DCISMS&title=APEX+Application+Development>

---

## #46303
- added: 2022-12-01 06:44:45

[Apex Book](https://learning.oreilly.com/library/view/understanding-oracle-apex/9781484209899/9781484209905_Ch03.xhtml#Sec32)

---

## #46288
- added: 2022-11-24 05:11:41
- completed: 2022-11-24 05:11:47

1. Artifactory that contains real data about the artifacts/jars\n2. BA Report\n3. Helidon code\n   Call 1 and 2 compare them\n   Create a JSON\n   Push to report artifactory\n\n   /Generate Also this has a cron job running daily to create JSOn and upload to Artifactory jSON/HTML.\n   /Reportname/5\n   Read form 3.1\n   /artifacts of a given repo then you pass the report name that already exist in artifactory\n   Return the artifacts with statuses\n\n   3\\.1 Report artifactory\n4. Apex code\n   Reading\n   Reprots\n   Repos\n   Artifacts\n\n   ```\n    Reading all these form the data base. That is not being upulated from May.\n   ```\n\nWrite new apex application to call the APIs from 3. Helidon service do not depend on the database

---

## #46286
- added: 2022-11-23 09:56:41

* [How to refresh a series ( FA / FABUILDT / FATOOLS / FATP )](https://confluence.oraclecorp.com/confluence/pages/viewpage.action?pageId=5351171933) ( <https://confluence.oraclecorp.com/confluence/pages/viewpage.action?pageId=5351171933> )\n* New confluence page has been created; if time permits, please read it once before the afternoon meeting tomorrow. Thanks\n\n\\\n

---

## #46278
- added: 2022-11-23 05:22:50
- completed: 2022-11-23 05:22:57

\\#Suman #Properties\nthis is how we mention => https://helidon.io/docs/v3/#/mp/config/advanced-configuration

---

## #46276
- added: 2022-11-22 11:08:55

fre_tpp_dev\n\nOracle_kisor\n\nhttps://apex.oraclecorp.com/pls/apex/f?p=4550:1:106977985990576:::::

---

## #46275
- added: 2022-11-22 06:04:10

\\n Here is the link for Propel Redwood shores recordings – otube:\n\n__<https://otube.oracle.com/playlist/dedicated/276435163/1_sk1ihzbk/1_5bdi3ul1>__

---

## #46272
- added: 2022-11-21 08:45:35

Starter/CDRM DB - <https://otube.oracle.com/media/t/1_a515m9ho>

---

## #46271
- added: 2022-11-21 07:32:43
- completed: 2022-11-22 12:17:25

\\#Suman #Properties\nthis is how we mention => <https://helidon.io/docs/v3/#/mp/config/advanced-configuration>

---

## #46270
- added: 2022-11-21 07:26:54
- completed: 2022-11-22 12:16:47

\\#Raghu\n\n__<https://confluence.oraclecorp.com/confluence/display/P2L/Propel+2022+BOSS+Lab+Prerequisites>__\n\n[12:55](https://appsdev-core-srv.slack.com/archives/C023LJLDD1Q/p1669015535261239)\n\n* Questions related to the BOSS Lab?  reach out via [#propel2022_idc_boss_lab](https://appsdev-core-srv.slack.com/archives/C0449N0P55Z)\n\n[12:56](https://appsdev-core-srv.slack.com/archives/C023LJLDD1Q/p1669015605826689)\n\n* [Propel 2022 BOSS Lab HYD](https://confluence.oraclecorp.com/confluence/display/PROPEL/Propel+2022+BOSS+Lab+HYD) - <https://confluence.oraclecorp.com/confluence/display/PROPEL/Propel+2022+BOSS+Lab+HYD#Propel2022BOSSLabHYD-Overview>\n\n\\\n

---

## #46253
- added: 2022-11-04 13:27:20

What are different families we have?

---

## #46250
- added: 2022-11-01 06:48:44

TPP App Rest API Doc: https://confluence.oraclecorp.com/confluence/display/FRE/Third+Party+Products+BA+Expiry+date

---

## #46174
- added: 2022-09-16 09:10:15

Self-paced, online learning offered by Oracle (Learning Paths, LinkedIn, Harvard, O'Reilly, etc.)\nOracle Mentoring Program\nUniversity for credit course using Oracle tuition reimbursement\n\nOracle Volunteering.

---

## #46160
- added: 2022-09-12 09:42:39

Explore the Jar sining code in BuildTak/BuildTaskNextGen that will be later implemented independently.

---

## #46138
- added: 2022-09-05 09:27:40

- [ ] <https://confluence.oraclecorp.com/confluence/display/FRE/TPP+Knowledge+Transfer+-+Prashant>\n\n\\\n

---

## #46122
- added: 2022-09-02 05:04:11

Personal access token used for orahub git

---

## #46113
- added: 2022-09-01 07:10:58

<https://uno.oraclecorp.com/uno/hostdevices> Used to restart the VM, but not working for me.

---

## #46107
- added: 2022-08-30 06:01:03

[myaccess-india.oraclevpn.com](http://myaccess-india.oraclevpn.com/)\n\n[sydney-twvpn.oraclevpn.com](http://sydney-twvpn.oraclevpn.com/)\n\n[tokyo-twvpn.oraclevpn.com](http://tokyo-twvpn.oraclevpn.com/)\n\n[singapore-twvpn.oraclevpn.com](http://singapore-twvpn.oraclevpn.com/)\n\n[myaccess.oraclevpn.com](http://myaccess-india.oraclevpn.com/)

---

## #46103
- added: 2022-08-29 06:27:13

<https://confluence.oraclecorp.com/confluence/display/FRE/FRE+TechTalks>\n\n\\\n

---

## #46102
- added: 2022-08-29 06:27:13

<https://confluence.oraclecorp.com/confluence/display/FRE/FRE+TechTalks>

---

## #46099
- added: 2022-08-26 10:51:26

https://confluence.oraclecorp.com/confluence/pages/viewpage.action?pageId=1829000568\nhttps://ngfabs.oraclecorp.com/\nhttps://confluence.oraclecorp.com/confluence/display/DBRM/ADE+4.1+Command+Reference\nhttps://pd-sgd-phx.appoci.oraclecorp.com/

---

## #46092
- added: 2022-08-24 04:37:29

VNC Credentials should work for Office WIFI\n\n\\\n<http://vsupport.oracle.com/wifi>

---

## #46083
- added: 2022-08-23 08:11:03

**To reset your LDAP DSEE and PDIT NIS UNIX/Linux password now, follow these steps:** \\n \n\n1. Login to OIM with SSO credentials, using [oim.oraclecorp. \\n com/identity/faces/flow?tf=resetpasswd&accountId=21023153&nextUrl=/identity](https://oim.oraclecorp.com/identity/faces/flow?tf=resetpasswd&accountId=21023153&nextUrl=/identity)\n\n\\\n

---

## #46082
- added: 2022-08-23 07:42:16
- completed: 2022-08-24 05:09:46

Employee: New Hire Badge Request®\nhttps://otube.oracle.com/media/\nEmployeeA+New+Hire+Badge+Request/0_\nzSy4p7e7/118078322\nEmployee: Activate your new Oracle badge\nhttps://otube.oracle.com/media/EmployeeA+\nActivate+your+new+Oracle+badge/0_p696cpyi\nEmployee: Request building access by\nEmployee or Contractor\nhttps://otube.oracle.com/media/EmployeeA+\nRequest+building+access+by+Employee+or+\nContractor/O v88bzuu\nEmployee: Report a Lost or Damaged badge\nhttps://otube.oracle.com/media/EmployeeA+\nReport+a+Lost+or+Damaged+badge/0_5kdxrz4n\nEmployee: Manage and Update Upcoming\nMeetings\nhttps://otube.oracle.com/media/\nEmployeeA+Manage+and+Update+Upcoming+\nMeetings/O_vr2qzrag

---

## #46080
- added: 2022-08-23 04:39:31

Forgotten  **SSO** Password Reset:<https://profile.oracle.com/myprofile/account/forgot-password.jspx>

---

## #45930
- added: 2022-06-23 05:26:21
- completed: 2022-08-23 04:57:32

Okay cluster.

---

## #45922
- added: 2022-06-21 09:37:46
- completed: 2022-08-23 04:58:11

Switch Listener issue\n\n<https://proddev-erp-cx.slack.com/archives/CFXE9SXR7/p1655804530861459>\n\n\\\n

---

## #45913
- added: 2022-06-16 03:51:44
- completed: 2022-08-23 04:58:14

**Alex Mondragon**\n\njamondra\n\nUX Designer

---

## #45876
- added: 2022-05-27 10:58:00
- completed: 2022-08-23 04:58:35

[Question in spectra](https://proddev-erp-cx.slack.com/archives/C014S592WE7/p1653649343564979) for Empty space click in card view

---

## #45747
- added: 2022-04-18 05:02:00

How to port PRAN to Oracle?\n\n\\\nEmail to <__[finserve-hyd_in@oracle.com](mailto:finserve-hyd_in@oracle.com)__> before march 31st\n\nFidelity Login\n\nuser: kisorbiswal\n\nMy Emp Code 1502948\n\nParticipant I Number I04206252\n\n\\\nI want to enrol for Employer NPS, but I see the following message.\n\n\\\nNote: Before allocating to NPS - Ensure you have a valid PRAN & the number has been ported to Oracle Point of Presence (HDFC Securities )\n\n\\\nHow do I port my PRAN number?\n\n\\\nHere is my PRAN: 110114945695\n\nI have created it through HDFC in __<https://cra-nsdl.com/CRA/>__. Can I use this number?

---

## #45745
- added: 2022-04-14 14:22:47

[Payroll Queries](https://apex.oraclecorp.com/pls/apex/r/payroll_prod/payroll-query-template-25361/pqt-home?clear=RP&session=3435057582161)

---

## #45718
- added: 2022-04-05 08:45:01
- completed: 2022-08-23 05:01:03

Salarpuria Cyber Park, Plot no 67, Hitech City Rd, Jubilee Enclave, HITEC City, Hyderabad, Telangana 500081

---

## #45716
- added: 2022-04-05 06:18:16
- completed: 2023-02-27 10:16:51

<http://redwood-ux.us.oracle.com:8000/vb/webApps/spectra/vp/sp-comp-usage-demos>

---

## #45710
- added: 2022-04-01 11:54:08
- completed: 2022-09-05 09:28:28

<https://confluence.oraclecorp.com/confluence/pages/viewpage.action?spaceKey=\\~shyam.karri@oracle.com&title=BOSS+setup+on+MAC+machine+locally>\n\n[Shyam Karri](https://app.slack.com/team/U02J4JQTZRB)  [4:56 PM](https://oracle-one.slack.com/archives/D02KM9UAY3F/p1648812376381899)

---

## #45698
- added: 2022-03-31 07:54:27
- completed: 2022-09-05 09:28:22

Sprint = "CXP Sprint 10 (4-Apr - 24-Apr)" AND "Epic Link" = "Segment Products 22b (May)"

---

## #45676
- added: 2022-03-22 11:34:58
- completed: 2022-09-05 09:28:19

Take some responsibility from Suman.

---

## #45579
- added: 2022-02-17 05:24:38
- completed: 2022-09-05 09:28:17

security json roles to be removed, it will be taken from IDCS/SPS.

---

## #45557
- added: 2022-02-10 11:37:54
- completed: 2022-09-05 09:28:09

\\#boss-user [Check](https://oracle-one.slack.com/archives/C01JRU1DQ4B/p1644493186315039)\n\nDynamic lookup gives 500 error.

---

## #45551
- added: 2022-02-09 08:57:27
- completed: 2022-02-09 12:27:02

[ \\n Suman Macherla](https://app.slack.com/team/WHURS86CT)  [9:59 AM](https://proddev-erp-cx.slack.com/archives/GF4SFE6KX/p1644380965192309) \\n @here, Team, follow this document for responsive design for styling/spacing .. \\n <https://www.oracle.com/webfolder/technetwork/jet/jsdocs/ResponsiveSpacing.html>1\n\n[Suman Macherla](https://app.slack.com/team/WHURS86CT)  [1:43 PM](https://proddev-erp-cx.slack.com/archives/GF4SFE6KX/p1644394430550279) \\n @here, Team, find the commerce integration architecture, how data flows from panthera to commerce \\n <https://confluence.oraclecorp.com/confluence/display/CXPCat/v4>

---

## #45549
- added: 2022-02-09 07:23:40
- completed: 2022-08-26 09:24:29

How is the component table(BO) used?\n\n\\\nHow Products and SKUs are stored for different sizes, colors, and varieties.\n\n\\\nBOSS accessors\n\n\\\nexternallyConfigSKU?\n\nproductClassification?

---

## #45545
- added: 2022-02-08 05:49:06

\\* Self-Service Apps > Me > Career and Performance > Goals

---

## #45544
- added: 2022-02-08 05:48:54
- completed: 2022-02-09 12:16:34

Check OCNA status. OCI

---

## #45543
- added: 2022-02-08 05:13:18
- completed: 2022-02-09 12:27:50

> #OCI #Shomu \\n Going forward I am thinking that we can manage all OCI access requests through the OCI. This will enable us to manage all access to all of our tenancies (dev / pre-prod / prod) from a central place (which is BOAT / OCI Internal IdP). Users onboarded through BOAT can login using this URL: **<https://console.us-phoenix-1.oraclecloud.com/?tenant=bmc_operator_access&provider=ocna-saml&override_tenant=ocid1.tenancy.oc1..aaaaaaaaogzlbbyxuved4rhcvadekq7qgdal37r6eftj3alyogo7zj2fcjnq>.** \n>\n> ** \\n **\n>\n> As a trial, I am trying to onboard Raj, Kisor and Divya using this method. \n>\n> \\\n> Users will require yubikey to access OCI using the internal IdP. Steps to request yubikey is here - <https://confluence.oraclecorp.com/confluence/display/OCIID/Ordering+and+Activating+your+YubiKey+for+OCNA+and+OCI>\n>\n> \\\n> As we are restructuring the tenancy layout to align with the Commerce standards, I think this will a good time to move all dev team members to the Internal IdP (all dev will need to request Yubikey).\n>\n> \\\n> Please let me know if in case of any questions, comments or concerns.\n\n\\\n

---

## #45542
- added: 2022-02-08 05:01:10
- completed: 2022-02-09 12:28:08

Divya, What is Ubikey for?

---

## #45530
- added: 2022-02-07 05:22:04
- completed: 2022-02-09 12:27:58

Suman, Rafi\n\n\\\nSame VCM in OCI for DB and Open search.

---

## #45448
- added: 2022-01-28 12:03:51
- completed: 2022-08-25 15:51:30

[Check](https://oracle-one.slack.com/archives/C01JRU1DQ4B/p1643371612296800) #boss-users\n\n\\\nI have different conditions for read privilege and update privilege configured in security.josn5 for a BO. When I'm calling update(HTTP PATCH) API, boss is validating against read privilege condition instead of update privilege condition. How to fix this?

---

## #45434
- added: 2022-01-27 10:14:20
- completed: 2022-08-25 15:51:22

Related tags\n\n\\\nSprint7, olearnb, Oraclei

---

## #45429
- added: 2022-01-27 05:14:34
- completed: 2022-06-09 09:04:16

The Flags and some other fields directly we have under BO should move to lookup table, to translation will work. Also we don’t have to do test ourselves.\n\n\\\nCounts that are computed not gets translated.

---

## #45410
- added: 2022-01-25 06:45:00
- completed: 2022-08-25 15:51:20

Take up some responsibilities from Suman, like db migration scripts, new env setup, POCs etc.

---

## #45408
- added: 2022-01-25 06:08:39
- completed: 2022-01-25 06:09:46

Sawan Chopra, Surekha Garre(joined with me) left after I joined.

---

## #45406
- added: 2022-01-25 05:55:12
- completed: 2022-06-09 09:03:20

\\#BestIntention\n\n \n\n115\n\ngowthami.lakshmikantha@oracle.com \n\nkisor.biswal@oracle.com\n\nparthasarathi.parthasarathi@oracle.com\n\nrakesh.rg.gupta@oracle.com\n\nvikash.s.sharma@oracle.com\n\nvinesh.k.kumar@oracle.com

---

## #45402
- added: 2022-01-24 12:52:26
- completed: 2022-08-25 15:51:15

__#Debug #HttpHeader[ \\n Venkatesh Gurram](https://app.slack.com/team/U01UA5P298D)__  for query plans in debug\n\nbaggage-debug 5

---

## #45400
- added: 2022-01-24 12:34:31
- completed: 2022-08-25 15:51:10

Roles, Privileges of BOSS.\n\n\\\nThe current understanding is users have roles assigned from the physical file /scratch/boss_1/docker-env.properties. Then these roles are getting privileges like read, Update etc on specific objects by security.json5 config. In the config one more level of filter is done users having the role and meeting the given condition only get the privilege. e.g Users having \n\nGLOBAL_ROLE_SEGMENT and (creator = currentUser). If no condition is given all users with that role get the privilege.\n\n\\\nBut the HTTP error we get for the insufficient privilege is not consistent, sometimes it’s

---

## #45391
- added: 2022-01-24 05:17:39
- completed: 2022-08-25 15:51:08

Check #boss-users for response\n\n\\\nHow to read get user context in the validation trigger?

---

## #45377
- added: 2022-01-21 14:47:55
- completed: 2022-08-25 15:51:05

- [ ] Read and watch the boss release doc, demo videos\n- [ ] Monitor #boss-users channel for possible scenarios\n\n\\\n

---

## #45371
- added: 2022-01-21 05:03:03
- completed: 2022-01-27 10:14:48

\\#BigPicture\n\n* __[Career Development planning](https://my.oracle.com/site/hr/LearningDevelopment/CD/index.html)__\n* __[Learning blog](http://news.oraclecorp.com/learning/)__\n* Virtual Library: virtuallibrary.oraclecorp.com\n* Slack: \n\no   #ww-learning-careerdev\n\no   #ww-techinfo-int\n\n·         link to access the CX IDC Single stop page\n\n__<https://oradocs-prodapp.ocecdn.oraclecloud.com/site/authsite/CX-IDC/>__\n\n

---

## #45357
- added: 2022-01-19 11:58:09
- completed: 2022-01-19 11:58:10

[Microsoft TODO app](https://to-do.office.com/tasks/id/AAMkAGEyZGRlMGExLTljM2MtNDI4Ny1hMjNiLWVmMGFiYzBhOGMyMABGAAAAAACVYPUq1DJcS4nxs6dLn8vTBwAqUQdIdujAT57zALH7JSX7AAAAAAESAAAqUQdIdujAT57zALH7JSX7AAAZN5hJAAA=/details)

---

## #45356
- added: 2022-01-19 10:35:24
- completed: 2022-08-25 15:50:46

Collect saved messages and read required links e.g BO testing process.

---

## #45352
- added: 2022-01-19 05:12:00
- completed: 2022-01-28 07:50:30

Child Centric approach.

---

## #45313
- added: 2022-01-13 11:32:26
- completed: 2022-01-26 16:39:03

Helidon\n\nSpectra Service\n\nBOSS\n\nOJET\n\nVBCS

---

## #45309
- added: 2022-01-12 14:47:26
- completed: 2022-02-09 12:30:49

Structure of table and relationships\n\ncxp_*catalogs_b*\n\ncxp_*catalogs_tl*\n\n\\\ncxp_lookup_*values_*b\n\ncxp_lookup_*values_*tl

---

## #45276
- added: 2022-01-03 10:18:22
- completed: 2022-08-25 15:50:49

==Release Existing boss module to 8081==\n\ncd \\~/dev/cxp/boss-modules\n\ngit status //Ensure no change there.\n\ngit pull\n\nboss metadata package\n\ncd \\~/dev/kisor-poc\n\ncurl -u super_user:welcome1 -X PUT --data-binary @bmd.zip http://cc-cx-3.ad2.fusionappsdephx.oraclevcn.com:8081/metadata\n\n\\\n==Release existing boss module to 8081 with custom module==\n\n- [ ] cd \\~/dev/kisor-poc\n- [ ] delete everything inside\n- [ ] boss module create -m kmodule\n- [ ] copy contents of cxpcat to kmodule folder\n- [ ] Replace cxpcat with module everywhere.\n- [ ] boss metadata package\n- [ ] curl -u super_user:welcome1 -X PUT --data-binary @bmd.zip http://cc-cx-3.ad2.fusionappsdephx.oraclevcn.com:8081/metadata\n\n\\\n\\\nDelete the cxpcat folder form kisor-poc\nboss module create -m cxpcat\nupdate boss-module\ncopy the cxpcat of boss-module to kisor-poc\n\nboss metadata package\ncurl -u super_user:welcome1 -X PUT --data-binary @bmd.zip http://cc-cx-3.ad2.fusionappsdephx.oraclevcn.com:8081/metadata

---

## #45238
- added: 2021-12-21 13:31:23
- completed: 2022-08-25 15:50:30

[Oracle Documents/Content](https://oradocs-prodapp.cec.ocp.oraclecloud.com/documents/home)\n\n[Stage Dev Woskapce](https://stagedev-vboci.integration.test.ocp.oc-test.com/ic/builder/)\n\n[OpenSearch Dashboard](http://cc-cx-2.ad2.fusionappsdephx.oraclevcn.com:5601/app/home#/)\n\n[OJET JsField](https://jsfiddle.net/OracleJET/o1n6ay04/)\n\n\\\n[OJET Youtube Playlist](https://www.youtube.com/watch?v=CdJ23oroPcw&list=PLKCk3OyNwIztCYiFvqx2UU8Sg8YfK3Om4&ab_channel=OracleLearning)\n\n[Service Data Provider](https://docs.oracle.com/en/cloud/paas/integration-cloud/visual-developer/service-data-provider.html)

---

## #45225
- added: 2021-12-10 12:25:36
- completed: 2022-01-19 11:59:30

https://nb.fidelity.com/public/nb/worldwide/home Stock, RSU

---

## #45131
- added: 2021-11-24 08:15:45
- completed: 2022-02-02 14:37:07

Track ID card print and dispatch.\n\nSubject: Re: Need Access/ID badge for Kisor Biswal\n\n\\\nRemove praveen.p.reddy  while sending email next time.

---

## #45118
- added: 2021-11-23 14:38:33
- completed: 2022-01-19 11:58:14

Emp Code 1502948 from Salary slip\n\n**Your participant number is I04206252.**

---

## #45068
- added: 2021-11-16 12:01:08
- completed: 2022-02-02 14:36:57

KT by Roshni\n\n\\\n[Catalog Translation](http://cc-cx-2.ad2.fusionappsdephx.oraclevcn.com:7988/objects/cxp/v1/catalogTranslation)\n\nAuthorization Basic c3VwZXJfdXNlcjp3ZWxjb21lMQ==\n\nIDCS security for renewing Auth tokens

---

## #45031
- added: 2021-11-08 06:55:46
- completed: 2022-08-25 15:50:16

<https://mylearn.oracle.com/home>\n\n[Oracle Learning Subscription](https://learn.oracle.com/ols/user-portal)(This shows a message to use mylearn)\n\n\\\n[OCI certified Architect](https://mylearn.oracle.com/learning-path/become-oci-architect-professional/35644/97984)\n\n- [ ] [Helidon](https://helidon.io/docs/latest/#/se/guides/01_overview)\n- [ ] [Spectra Service](https://confluence.oraclecorp.com/confluence/display/SPECTRA/Project+Spectra+Home)\n  - [ ] UX team\n- [ ] [BOSS ](https://confluence.oraclecorp.com/confluence/display/BOSS/BOSS+Roadmap)Roadmap\n  - [ ] [BOSS Release Home](https://confluence.oraclecorp.com/confluence/display/BOSS/M4)\n  - [ ] [BOSS Architecture Image](https://confluence.oraclecorp.com/confluence/download/attachments/2715040222/BOSS%20Modules.png?version=2&modificationDate=1628709677000&api=v2)\n  - [ ] [Getting started](https://confluence.oraclecorp.com/confluence/display/BOSS/Get+Started)\n  - [ ] [Department, Employee example](https://confluence.oraclecorp.com/confluence/display/BOSS/Getting+Started+with+BOSS%3A+Department-Employee+Tutorial)\n  - [ ] [New WIP, Getting started](https://confluence.oraclecorp.com/confluence/display/BOSS/Getting+Started+with+BOSS+Tutorial+WIP)\n  - [ ] [Boss Query execution](https://confluence.oraclecorp.com/confluence/pages/viewpage.action?spaceKey=FFT&title=BOSS+complex+query+execution#BOSScomplexqueryexecution-setup)\n  - [ ] Docker\n  - [ ] \\[Day 2 KT\\](file:///Users/kcbiswal/Documents/KT/Day2_recording.mp4)\n  - [ ] BOSS\n- [ ] OJET\n- [ ] [VBCS KT by Asim](https://proddev-erp-cx.slack.com/files/U01MP6JV54Z/F01SD7D7TK9/zoom_0.mp4)\n  - [ ] \\[VBCS Book\\](file:///Users/kcbiswal/Oracle%20Content%20-%20Accounts/Oracle%20Content/vbcs_training/VBCS.pdf)\n  - [ ] **\\[VBCS Activity Book\\](file:///Users/kcbiswal/Oracle%20Content%20-%20Accounts/Oracle%20Content/vbcs_training/VBCS_Activity.pdf)**\n- [ ] [Oracle Streaming Service(OSS)](https://blogs.oracle.com/developers/post/getting-started-with-oracle-streaming-service-oss)\n- [ ] [Oracle Certifications](https://degreed.com/plan/1224293#/)\n  - [ ] [Java Explorer](https://learn.oracle.com/ols/learning-path/java-explorer/40805/79726) Certification\n\n\\\n\\\nMaster VBCS Env\n\n[CX IDC Website](https://oradocs-prodapp.ocecdn.oraclecloud.com/site/authsite/CX-IDC/)\n\n\\\n[Functional & Technical SMEs](https://confluence.oraclecorp.com/confluence/pages/viewpage.action?pageId=3077625900)\n\n[CXP Data models](https://confluence.oraclecorp.com/confluence/display/CXPCat/CX+Product+Catalog+Data+Model)\n\n[CXP Environments](https://confluence.oraclecorp.com/confluence/display/CXPCat/Environment+Details)\n\nGuru Channel Videos\n\n[Spectra Steps - Relevant to CX Integration team](https://confluence.oraclecorp.com/confluence/pages/viewpage.action?pageId=3055950525)\n\n[Jaeger URL](http://adfbuild-jaeger.subnet3ad3phx.devdevcsphx.oraclevcn.com:16686/trace/bece88e807940188)\n\n[How to do BO validations? Validate+with+Adhoc+Queries by Shashikant](https://confluence.oraclecorp.com/confluence/display/CXPCat/Validate+with+Adhoc+Queries)\n\n[BOSS data security, validation with Privilege By Venkat Gurram](https://confluence.oraclecorp.com/confluence/display/BOSS/BOSS+Data+Security)\n\n\\\n\\\n\\\n[Redwood Tutorials, sent by Shyam](https://confluence.oraclecorp.com/confluence/display/REX/B1%3A+Hello%2C+Redwood+World%21+Tutorial)\n\n\\\nCloud: crosscx\n\n\\\nShashikant Jaishwal has BOSS Docker setup\n\n\\\nAuthorization for BOSS and OpenSearch APIs\n\n\\\nBasic c3VwZXJfdXNlcjp3ZWxjb21lMQ==\n\nBasic YWRtaW46YWRtaW4=\n\n`"type": "vb/DefaultSecurityProvider",`\n\ncxpcat\n\nvb_51e32838-3624-4404-830c-5f56792ab879\n\nvb_76a7fced-5e1a-40df-bf57-0c4b25ad8267\n\nvb_7f7e844c-6334-4565-9f8f-2d8328f4215d\n\n\\\n\\\n`"type": "vb/DefaultSecurityProvider",`\n\n\\\n"userConfig": {\n\n"type": "resources/js/idcs_authentication",\n\n"configuration": {},\n\n"embedding": "deny"\n\n},\n\n"security": {\n\n"access": {\n\n"requiresAuthentication": true\n\n}\n\n},\n\n\\\nDev\n\nvb_b2f86741-8859-4764-809e-e1d48d638c8a\n\nvb_6f500129-eadc-4ea6-bab7-f9b412557d8a\n\n\\\n

---

## #44970
- added: 2021-10-28 08:09:54
- completed: 2021-11-09 06:45:48

Leave\n\nNotify manager, OoO in Common calendar with participants \n\nCX Product Catalog Calendar [cxpc-calendar_ww@oracle.com](mailto:cxpc-calendar_ww@oracle.com); cxpc-event-notifications_ww_grp [cxpc-event-notifications_ww_grp@oracle.com](mailto:cxpc-event-notifications_ww_grp@oracle.com).

---

## #44965
- added: 2021-10-27 11:01:47
- completed: 2022-02-02 14:36:09

1)[cxpc-calendar_ww@oracle.com](mailto:cxpc-calendar_ww@oracle.com)  2) [cxpc-event-notifications_ww_grp@oracle.com](mailto:cxpc-event-notifications_ww_grp@oracle.com) to that event.

---

## #44950
- added: 2021-10-25 12:33:41
- completed: 2021-11-09 06:45:01

Profile in https://people.oracle.com/ gets created a day after joining

---

## #44933
- added: 2021-10-22 10:39:38
- completed: 2021-11-09 06:45:53

VB CS, BOSS not enough documentation.

---

## #44929
- added: 2021-10-22 05:05:53
- completed: 2022-02-02 14:36:05

#### #KT\n\n***Day 1***\n\n- [ ] <https://confluence.oraclecorp.com/confluence/pages/viewpage.action?pageId=3034130838>\n- [ ] <https://confluence.oraclecorp.com/confluence/display/CXPCat/CX+Product+Catalog+Data+Model>\n\n\\\n*Day 2*\n\n\\[Recording\\](file:///Users/kcbiswal/Documents/KT/Day2_recording.mp4)\n\n<https://confluence.oraclecorp.com/confluence/display/BOSS/Get+Started>[4:04](https://proddev-erp-cx.slack.com/archives/C02JGQQMGTB/p1634812450000400)\n\n<https://confluence.oraclecorp.com/confluence/display/BOSS/Get+Started>\n\n<https://confluence.oraclecorp.com/confluence/display/BOSS/Getting+Started+with+BOSS+Tutorial>\n\n<https://confluence.oraclecorp.com/confluence/display/BOSS/Design>\n\n<https://confluence.oraclecorp.com/confluence/display/BOSS/BOSS+Roadmap+CY+2021>\n\n<https://alm.oraclecorp.com/cxp/#projects/cx-product-catalog-1/scm/boss-modules.git/tree/?revision=develop>\n\n<https://helidon.io/docs/latest/#/se/guides/01_overview>\n\n\\\nDay 3\n\n<https://confluence.oraclecorp.com/confluence/display/CXPCat/Environment+Details>\n\n\\\nSelf Learn:\n\n- [ ] Guru channel videos\n- [ ] <https://oracle.enterprise.slack.com/files/U01MP6JV54Z/F01SD7D7TK9/zoom_0.mp4>\n- [ ] [https://proddev-erp-cx.slack.com/archives/C02K6MVLZDY/p1635319732013100]()\n- [ ] [https://docs.oracle.com/en/cloud/paas/integration-cloud/visual-developer/create-applications.html#GUID-BEDD6915-CC4B-441E-98E9-FAD5262C33E0](https://proddev-erp-cx.slack.com/archives/C02K6MVLZDY/p1635319732013100)\n\n\\\n[BOSS learning resource from Suman](https://confluence.oraclecorp.com/confluence/pages/viewpage.action?pageId=3055950525)

---

## #44917
- added: 2021-10-21 02:41:29
- completed: 2021-10-25 12:35:24

Oracle_GMC@mediassistindia.com\n\n\\\nMy SSO is not working on MediBuddy. Fails with following error, please help.

---

## #44916
- added: 2021-10-21 00:08:24
- completed: 2021-10-25 04:34:48

Where we apply leaves.

---

## #44885
- added: 2021-10-18 16:02:57
- completed: 2021-11-09 06:44:45

Also as first day task, please go through the All-hands by Applications DEV group head.\n\n \n\n<https://otube.oracle.com/media/Oracle+Applications+DevelopmentA+Divisional+Hall+Hands+All+Hands+-+Q3FY21/1_xj1ehaqy>\n\n \n\nAlso there are few mandatory compliance courses that you should complete in first week.\n\nTo confirm your completion status, please [view](https://learning.oracle.com/) your *My Learning*

---

## #44863
- added: 2021-10-14 12:22:58
- completed: 2021-10-22 03:36:25

Your access to the payroll portal is now ready, please use the below URL to login<https://login.oracle.com/oamfed/idp/initiatesso?providerid=ess-excelityglobal-com-ACS>

---

## #44857
- added: 2021-10-13 11:06:06
- completed: 2021-10-19 15:59:22

19th Induction

---

## #44852
- added: 2021-10-11 11:30:55
- completed: 2021-10-22 03:16:49

- [x] Change Timezone in Slack\n- [x] \\[New Hire checklist\\](file:///Users/kisorbiswal/Documents/Oracle/Welcome/New%20Hire%20Essentials_SEP%2021%20.pdf)\n- [x] Catalog overview, PPT Product catalog,\n- [x] Confluence - Pending\n- [x] Jira git-pending\n\n\\\n

---

## #44670
- added: 2021-08-15 03:15:57
- completed: 2021-10-11 11:30:50

Tasks\n\n- [ ] Fill and sign the physical documents needed on first day.\n- [ ] 4 Bright white background passport size pics.\n- [ ] Checklist of docs\n\n\\\n

---

## #44653
- added: 2021-08-12 20:26:10
- completed: 2021-08-15 03:16:25

\\\n\\\nQuestions\n\n- [x] What version of Java is used in the project?\n- [x] How is it to work at Oracle? Hierarchy Structure, information flow etc?\n- [x] Do we work from own laptop?\n- [x] How is internal growth? Reviews show no hikes, no promotions.- Single digit.\n- [x] Do we really get any bonus over the CTC? Sometimes we get. RSUs are really good money.\n- [x] How is leave policy? I see casual/sick leave is different from normal leaves. Can we take them really?\n- [x] How is work life balance? Work from home in non Covid time etc?\n- [x] Know about CX(T) Team? What kind of work we expect?\n  - [x] Monolithic in general, not microservices.\n  - [x] No breaking.\n\n\\\n

---
