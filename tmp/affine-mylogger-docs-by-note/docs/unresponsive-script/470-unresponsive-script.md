---
mylogger_id: 470
tags: [unresponsive-script]
added: "2011-10-16 11:22:31"
source: mylogger
---

# Note 470

Tags: #unresponsive-script

1. Run Firefox. 
2. In the Firefox address bar, type about:config, and then press Enter. 
3. Scroll and locate or search with Filter text box for dom.max_script_run_time. 
4. Double click on the line of dom.max_script_run_time, and change  the value to a higher number (in seconds) that you want Firefox to wait  before getting the Unresponsive Script warning. Be default, the value is  5 or 10 seconds. You can safely set the magical number to let’s say 20.  You can set the value to 0 to instruct Firefox to wait forever – no  warning and dialog whatsoever. Note that the whole Firefox may be not  responsive and cannot be used while waiting for scripts to execute, so  the number should not set too high in order to give you an opportunity  to stop truly nasty or buggy scripts and recover use of Firefox. I set  mine to "0" 
5. Click OK. 
6. Restart Firefox.
