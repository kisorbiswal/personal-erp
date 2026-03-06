# tag: sec

total: 6

## #44769
- added: 2021-09-07 11:43:34

[Input validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)\n\n[Regex](https://medium.com/factory-mind/regex-tutorial-a-simple-cheatsheet-by-examples-649dc1c3f285)\n\n\\\n

---

## #44768
- added: 2021-09-07 11:43:34

INput

---

## #44766
- added: 2021-09-07 11:18:48

Input validation/Sanitization(Type format & length)\n\n syntactic(Date, Namber) & Semantic Validation ( Business logic)\n\noutput  Encoding\n\n\\\nEncoding ? Transform to safe format \n\n Before sending to Server, saving to Database\n\nHTML \n\n XSS, SQL Injection \n\n\\\nAvoid overly permissive regex. E.g. Using \\[o-9\\] for phone no validation.\n\n Instead use country specific patterns.\n\n\\\nAllow list is better than block list.\n\n\\\n Pattern pattern = Pattern. compile(“Mypattern“, Case.Senstine)\n\nMatcher matcher=pattern. matcher(“The Input string " );\n\nboolean foundMatch  = matcher.find();\n\n \n\nPresentation on Mastercard PKI & Authentication

---

## #13013
- added: 2017-06-05 16:07:19

SQL injection preventaion

---

## #13012
- added: 2017-06-05 15:55:07

Replay attack, how this happens and how to prevent.

---

## #13011
- added: 2017-06-05 15:54:18

DOS, DDOS how this happens and how to prevent

---
