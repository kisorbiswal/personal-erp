---
mylogger_id: 6644
tags: [bevening]
added: "2014-10-30 08:50:58"
completed: "2014-12-18 11:41:47"
source: mylogger
---

# Note 6644

Tags: #bevening

Farmer chicken problem
public class A {	public static void main(String[] args) {		A a = new A();		a.run(140);	}
	public int[][] run(int sum) {		int p = 10, q = 16, r = 26;		int x = 1;		while (true) {			int a = 1;			while (true) {				int[] result = findYB(x, a, p, sum);				if (result != null) {					int[] res = findAB(x, result[0], q, sum);					if (res != null) {						int[] last = findAB(x, result[0], r, sum);						if (last != null) {							System.out.println("x=" + x + ",y=" + result[0]									+ ",a=" + a + ",b=" + result[1] + ",c="									+ res[0] + ",d=" + res[1] + ",e=" + last[0]									+ ",f=" + last[1]);						}					}				}				a++;				if (a == p) {					break;				}			}			x++;			if (x == sum) {				break;			}		}		return null;	}
	private int[] findAB(int x, int y, int items, int sum) {		int a = 1;		while (true) {			int b = items - a;			int total = a * x + b * y;			if (total == sum) {				return new int[] { a, b };			}			a++;			if (a == items) {				break;			}		}		return null;	}
	private int[] findYB(int x, int a, int items, int sum) {		// a+b=items		int b = items - a;		// ax+by=sum		// by=sum-ax;		int by = sum - (a * x);		// y=(sum-sx)/b;		if (by % b != 0) {			return null;		}
		int y = by / b;		if (y <= 0) {			return null;		}		return new int[] { y, b };	}}
