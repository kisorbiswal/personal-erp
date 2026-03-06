---
source: mylogger
mylogger_id: 12278
created: 2016-12-25T18:22:15+00:00
created_raw: 2016-12-25 18:22:15
completed_raw: 
tags:
  - prob
---

Installing cf in scaleway not workingnnsudo apt-get install -y software-properties-commonnsudo apt-get  updatennsudo apt-add-repository "deb http://download.virtualbox.org/virtualbox/debian xenial contrib"nwget -q https://www.virtualbox.org/download/oracle_vbox_2016.asc -O- | sudo apt-key add -nwget -q https://www.virtualbox.org/download/oracle_vbox.asc -O- | sudo apt-key add -nsudo apt-get updatensudo apt-get install -y virtualbox-5.0nsudo apt-get install -y vagrantnngem install bosh_cli —no-ri —no-rdocnnnvagrant up —provider=virtualboxnnsudo /usr/lib/virtualbox/vboxdrv.sh setupnvboxdrv.sh: Building VirtualBox kernel modules.ndpkg-query: no path found matching pattern /lib/modules/4.5.7-std-3/kernelnThis system is not currently set up to build kernel modules (system extensions).nRunning the following commands should set the system up correctly:nn  apt-get install -headers-4.5.7-std-3n(The last command may fail if your system is not fully updated.)n  apt-get install -headers-3nvboxdrv.sh: failed: Look at /var/log/vbox-install.log to find out what went wrong.
