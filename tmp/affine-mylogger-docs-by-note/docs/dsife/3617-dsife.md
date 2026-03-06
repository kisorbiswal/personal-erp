---
mylogger_id: 3617
tags: [dsife]
added: "2013-06-04 16:50:35"
completed: "2013-06-11 16:41:41"
source: mylogger
---

# Note 3617

Tags: #dsife

public class FireFoxFileUtil {

	public static void main(String[] args) throws IOException {
		File src = new File("E:\\sife\\OfficeFirefox.txt");
		File dest = new File("E:\\sife\\officeff.txt");
		if (!dest.exists()) {
			dest.createNewFile();
		}

		BufferedReader br = new BufferedReader(new FileReader(src));
		BufferedWriter bw = new BufferedWriter(new FileWriter(dest));

		String line = null;
		while ((line = br.readLine()) != null) {
			String[] split = line.split("\t");
			String timestamp = split[0];
			Date date = new Date(getInt(timestamp));
			String dateString = getFormattedDate(date);
			line = line.replace(timestamp, dateString);
			bw.write(line + "\n");
		}
		br.close();
		bw.close();
	}

	private static String getFormattedDate(Date date) {
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
		String formattedDate = format.format(date);
		return formattedDate;
	}

	private static long getInt(String timestamp) {
		long i = 0;
		try {
			i = Long.parseLong(timestamp);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return i;
	}

}
