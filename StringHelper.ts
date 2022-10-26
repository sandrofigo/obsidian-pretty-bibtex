
export abstract class StringHelper {
	public static sanitizeKeyString(key: string): string {
		const allLowerCase = key.toLowerCase();
		return allLowerCase.charAt(0).toUpperCase() + allLowerCase.slice(1);
	}

	public static trim(str: string, trim: string): string {
		var start = 0, end = str.length;

		while (start < end && str[start] === trim)
			++start;

		while (end > start && str[end - 1] === trim)
			--end;

		return (start > 0 || end < str.length) ? str.substring(start, end) : str;
	}
}
