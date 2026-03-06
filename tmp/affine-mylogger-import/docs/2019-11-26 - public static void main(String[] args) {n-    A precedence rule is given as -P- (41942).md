---
source: mylogger
mylogger_id: 41942
created: 2019-11-26T08:02:22+00:00
created_raw: 2019-11-26 08:02:22
completed_raw: 2019-12-09 16:12:19
tags:
  - t
---

public static void main(String[] args) {n//    A precedence rule is given as "P>E", which means that letter n    // "P" is followed directly by the letter "E".n    // Write a function, given an array of precedence rules, that finds the wordn    // represented by the given rules.n//n//    Note: Each represented word contains a set of unique characters, i.e. the word does not contain duplicate letters.n//n//    Examples:n//    findWord(["P>E","E>R","R>U"]) // PERUn//    findWord(["I>N","A>I","P>A","S>P"]) // SPAINn    System.out.println(findWord(new String[] { "P>E", "E>R", "R>U" }));n    System.out.println(findWord(new String[] { "I>N", "A>I", "P>A", "S>P" }));n    System.out.println(findWord(new String[] { "U>N", "G>A", "R>Y", "H>U", "N>G", "A>R" })); // HUNGARYn    System.out.println(findWord(new String[] { "I>F", "W>I", "S>W", "F>T" })); // SWIFTn    System.out.println(findWord(new String[] { "R>T", "A>L", "P>O", "O>R", "G>A", "T>U", "U>G" })); // PORTUGALn    System.out.println(n        findWord(new String[] { "W>I", "R>L", "T>Z", "Z>E", "S>W", "E>R", "L>A", "A>N", "N>D", "I>T" })); // SWITZERLANDnn  }
