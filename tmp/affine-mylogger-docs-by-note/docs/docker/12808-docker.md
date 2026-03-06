---
mylogger_id: 12808
tags: [docker]
added: "2017-04-25 09:37:44"
source: mylogger
---

# Note 12808

Tags: #docker

Docker file -- build -> image -- run --> Containerdd


docker run --name user-management -p 3000:3000 user-management
docker build -t user-management .
docker images

docker ps -a
docker rm $(docker ps -a -q)
