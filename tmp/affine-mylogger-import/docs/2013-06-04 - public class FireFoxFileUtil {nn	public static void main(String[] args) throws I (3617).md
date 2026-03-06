---
source: mylogger
mylogger_id: 3617
created: 2013-06-04T16:50:35+00:00
created_raw: 2013-06-04 16:50:35
completed_raw: 2013-06-11 16:41:41
tags:
  - dsife
---

public class FireFoxFileUtil {nn	public static void main(String[] args) throws IOException {n		File src = new File("E:\\sife\\OfficeFirefox.txt");n		File dest = new File("E:\\sife\\officeff.txt");n		if (!dest.exists()) {n			dest.createNewFile();n		}nn		BufferedReader br = new BufferedReader(new FileReader(src));n		BufferedWriter bw = new BufferedWriter(new FileWriter(dest));nn		String line = null;n		while ((line = br.readLine()) != null) {n			String[] split = line.split("\t");n			String timestamp = split[0];n			Date date = new Date(getInt(timestamp));n			String dateString = getFormattedDate(date);n			line = line.replace(timestamp, dateString);n			bw.write(line + "\n");n		}n		br.close();n		bw.close();n	}nn	private static String getFormattedDate(Date date) {n		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");n		String formattedDate = format.format(date);n		return formattedDate;n	}nn	private static long getInt(String timestamp) {n		long i = 0;n		try {n			i = Long.parseLong(timestamp);n		} catch (Exception e) {n			e.printStackTrace();n		}n		return i;n	}nn}
