# tag: prob

total: 3

## #13591
- added: 2017-12-01 01:44:41

if I have decided to do anything I don't have patience to listen other arguments. I get angry and shut them down.

---

## #12280
- added: 2016-12-26 17:46:43

https://github.com/scaleway/kernel-tools/issues/297

---

## #12278
- added: 2016-12-25 18:22:15

Installing cf in scaleway not working\n\nsudo apt-get install -y software-properties-common\nsudo apt-get  update\n\nsudo apt-add-repository "deb http://download.virtualbox.org/virtualbox/debian xenial contrib"\nwget -q https://www.virtualbox.org/download/oracle_vbox_2016.asc -O- | sudo apt-key add -\nwget -q https://www.virtualbox.org/download/oracle_vbox.asc -O- | sudo apt-key add -\nsudo apt-get update\nsudo apt-get install -y virtualbox-5.0\nsudo apt-get install -y vagrant\n\ngem install bosh_cli —no-ri —no-rdoc\n\n\nvagrant up —provider=virtualbox\n\nsudo /usr/lib/virtualbox/vboxdrv.sh setup\nvboxdrv.sh: Building VirtualBox kernel modules.\ndpkg-query: no path found matching pattern /lib/modules/4.5.7-std-3/kernel\nThis system is not currently set up to build kernel modules (system extensions).\nRunning the following commands should set the system up correctly:\n\n  apt-get install -headers-4.5.7-std-3\n(The last command may fail if your system is not fully updated.)\n  apt-get install -headers-3\nvboxdrv.sh: failed: Look at /var/log/vbox-install.log to find out what went wrong.

---
