# tag: mis

total: 23

## #44627
- added: 2021-08-06 14:58:45

Google Interview:\n\nQueue in Java that purges data based on expire time, like time to live. Without this Complexity is M, with purging, only size enough.\n\nEnumHashMap

---

## #44618
- added: 2021-08-03 10:50:52

Component scanning of entire package is resource waste, we can do instead @Ben and @Configuration\n\n\\\nCache eviction in multi instance env, and what happens when stripe switch happens.

---

## #44569
- added: 2021-07-23 02:17:32

**Stream**\n\n```javascript\nmap.put(fruits[j], map.getOrDefault(fruits[j], 0) + 1);\n```\n\n\\\n

---

## #44544
- added: 2021-07-17 08:29:42

Fruit basket(Sliding window)\n\n- [ ] I kept count of first and second. But made a mistake when first increases 2nd should be updated only if that is not already same as first.\n- [ ] Bigger mistake is I have overlooked that I should pick fruits only consecutive trees. Can not skip trees.\n\n\\\n

---

## #44541
- added: 2021-07-16 11:04:47

In Unique email program I checked localName+domain name without adding the @ in between, It is wrong.\n\n\\\nSimilar mistake I did in License key formatter. When concatenating strings I’m forgetting the delimiter.

---

## #44540
- added: 2021-07-16 10:33:57

"string".replace() is character sequence replace not regex. "string".split() is taking regex. \n\n"string".replaceAll() takes regex and String\n\n\\\nthe `\\U` will cause all following chars to be upper\n\nSimilarly `\\L` can be used to convert chars to lower case \n\nthe `\\E` will turn off the `\\U`\n\nSplit a string by into groups of k length: \n\n(.{" + k + "})\n\n```javascript\n.$ end of a line in Java Regex\n```\n\n[Regex Cheat sheet ](https://www.jrebel.com/blog/java-regular-expressions-cheat-sheet)

---

## #44442
- added: 2021-06-24 03:27:37

Arrays.stream() does not take char[] array. It has only long, int, double etc.

---

## #44441
- added: 2021-06-24 03:24:33

List<char[]> list = Arrays.asList("Kisor".toCharArray());//Not List<Character> as expected. Not sure why it does this list of char[]

---

## #44440
- added: 2021-06-24 03:14:12

String a = "Kisor"; Arrays.asList(a.toCharArray()).contains('K')==false; //As the objects are different

---

## #44439
- added: 2021-06-24 02:58:56

When pre initializing from array or list, by index 0 ensure that is non empty and also remember the value to be treated as if inside the loop.

---

## #44436
- added: 2021-06-24 02:39:40

String.join("-", arrayOfStringsVarArgAlsoWorks)\n\n"String".toCharArray()\n\n"String".toUpperCase();\n\n“String”.charAt(i);\n\n"String".length();\n\n\\\n“String”.substring(int beginIndex, int endIndex) here beginning index remains same but end index -1 is done in implementation. So if want till 4th index send 5 and 2nd arg.\n\nString group1 = s.substring(0, mod);\nString group2 = s.substring(mod);

---

## #44396
- added: 2021-06-17 16:14:36

param assigned to local variable still points to the original object.

---

## #44347
- added: 2021-06-12 07:26:57

Turing test:\n\n- [ ] Given a string check if palindrome arrangement possible, I was writing program to test if palindrome. \n- [ ] String has a method length() not an attribute.\n- [ ] The variables declared in method accessible to for loops so getting conflict of i, js while using while and for loops one by one.\n- [ ] Be careful to use appropriate counter when using nested loops. Remember to update counters in while loop.\n- [ ] Visualize the array shifts first before writing code.\n- [ ] K > N/2 different case \n- [ ] K > N also should be differently, use modulo and do left shift of k = n - k; \n\n\\\n

---

## #44344
- added: 2021-06-11 16:22:57

While appending to a LinkedList need 2 pointers one to hold the result(pointer to first node) and the last node where the next node will be referred.

---

## #44343
- added: 2021-06-11 16:03:39

Merge K sorted linked lists, forgotten to initialise k with array.length, also tried to use array.size() which does not exist. Forgotten to return the result ListNode.

---

## #44329
- added: 2021-06-11 09:19:17

I copy pasted dfsPreOrder to create Inorder and Postorder, the new method's recursive calls were still calling the old pre order method.

---

## #44322
- added: 2021-06-10 17:16:08

List<Integer> Stream should use map, there is no mapToObj(Here obj is added as the array was of primitive type) like in Arrays.stream.

---

## #44318
- added: 2021-06-10 10:25:10

Missed to reduce counter in outer while loop in my BubbleSort implementation. Also the condition to break when the array is sorted used is if no swap in an iteration, forgotten to update it when swapped.

---

## #44304
- added: 2021-06-08 17:23:27
- completed: 2021-06-12 14:41:09

l9jG8L4yseL3kvvcOR8Azg==

---

## #44303
- added: 2021-06-08 17:22:47

Binary Search Tree should have entire left sub tree smaller, not just the immediate children.\n\n \n\nValidate BST, compare only with parents not left siblings.

---

## #44302
- added: 2021-06-08 16:35:38

node.right.val > node.val. I was comparing node.right > node.val

---

## #44297
- added: 2021-06-07 15:03:38

Remember to break/continue the loop when appropriate condition reached. e.g Missed this when writing Integer to Roman converter.

---

## #44250
- added: 2021-06-02 13:59:06

- [ ] int/int is int losing the decimal point. e.g double d = 5/2; //Here d becomes 2, not 2.5. use 2.0\n- [ ] Merging two sorted arrays of different size needs 3 loops\n\n\\\n

---
