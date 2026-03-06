---
source: mylogger
mylogger_id: 7039
created: 2014-12-24T09:16:29+00:00
created_raw: 2014-12-24 09:16:29
completed_raw: 
tags:
  - edo
---

/**n	 * Fast helper method to convert small doubles to 32-bit int.n	 *n	 * <p>n	 * Note: you should be aware that this uses JavaScript rounding and thusn	 * does NOT provide the same semantics asn	 * <code>int b = (int) someDouble;</code>. In particular, if x is outsiden	 * the range [-2^31,2^31), then toInt32(x) would return a value equivalentn	 * to x modulo 2^32, whereas (int) x would evaluate to either MIN_INT orn	 * MAX_INT.n	 */n	private static int toInt32(double val) {n		// TODOn		return 0;n	}
