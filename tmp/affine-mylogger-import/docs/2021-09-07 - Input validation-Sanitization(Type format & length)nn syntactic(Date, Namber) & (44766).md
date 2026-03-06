---
source: mylogger
mylogger_id: 44766
created: 2021-09-07T11:18:48+00:00
created_raw: 2021-09-07 11:18:48
completed_raw: 
tags:
  - Sec
---

Input validation/Sanitization(Type format & length)nn syntactic(Date, Namber) & Semantic Validation ( Business logic)nnoutput  Encodingnn\nEncoding ? Transform to safe format nn Before sending to Server, saving to DatabasennHTML nn XSS, SQL Injection nn\nAvoid overly permissive regex. E.g. Using \[o-9\] for phone no validation.nn Instead use country specific patterns.nn\nAllow list is better than block list.nn\n Pattern pattern = Pattern. compile(“Mypattern“, Case.Senstine)nnMatcher matcher=pattern. matcher(“The Input string " );nnboolean foundMatch  = matcher.find();nn nnPresentation on Mastercard PKI & Authentication
