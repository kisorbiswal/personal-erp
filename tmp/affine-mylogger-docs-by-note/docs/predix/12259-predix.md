---
mylogger_id: 12259
tags: [predix]
added: "2016-12-22 11:35:00"
source: mylogger
---

# Note 12259

Tags: #predix

UAA
URL: https://kuaa.predix-uaa.run.aws-usw02-pr.ice.predix.io
name: kuaa
scret: se&;23d
subdomain: kuaa


Grant Type = AuthCode.  
The Basic Auth code is a base64 encoding of the application clientId and secret,

A more performant App will store the AuthCode and UserToken in the User's Session in a global cache.  The Reference App and Dashboard Seed show how to do this.

ACS
name: kacs
uses: kuaa

grant_type of "client_credentials- Client token

Clients

id: powerup_client
grant_type: client_credentials
scret: pu&;23d
base64: cG93ZXJ1cF9jbGllbnQ6cHUmOzIzZA==
scope: powerup_data
scope: powerup_static_data
access token validity 2min: 120000
refresh token validity 7days: 604800000

id: powerup_cms
grant_type: client_credentials
scret: cms&;23d
base64: cG93ZXJ1cF9jbXM6Y21zJjsyM2Q=
scope: powerup_cms_data
scope: powerup_cms_static_data
access token validity 2min: 120000
refresh token validity 7days: 604800000
