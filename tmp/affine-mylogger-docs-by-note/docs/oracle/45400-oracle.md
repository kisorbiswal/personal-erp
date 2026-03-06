---
mylogger_id: 45400
tags: [oracle]
added: "2022-01-24 12:34:31"
completed: "2022-08-25 15:51:10"
source: mylogger
---

# Note 45400

Tags: #oracle

Roles, Privileges of BOSS.

\
The current understanding is users have roles assigned from the physical file /scratch/boss_1/docker-env.properties. Then these roles are getting privileges like read, Update etc on specific objects by security.json5 config. In the config one more level of filter is done users having the role and meeting the given condition only get the privilege. e.g Users having 

GLOBAL_ROLE_SEGMENT and (creator = currentUser). If no condition is given all users with that role get the privilege.

\
But the HTTP error we get for the insufficient privilege is not consistent, sometimes it’s
