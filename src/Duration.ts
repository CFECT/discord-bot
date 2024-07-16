const tokens = new Map([
	['nanosecond', 1 / 1e6],
	['nanoseconds', 1 / 1e6],
	['ns', 1 / 1e6],

	['millisecond', 1],
	['milliseconds', 1],
	['ms', 1],

	['second', 1000],
	['seconds', 1000],
	['sec', 1000],
	['secs', 1000],
	['s', 1000],

	['minute', 1000 * 60],
	['minutes', 1000 * 60],
	['min', 1000 * 60],
	['mins', 1000 * 60],
	['m', 1000 * 60],

	['hour', 1000 * 60 * 60],
	['hours', 1000 * 60 * 60],
	['hr', 1000 * 60 * 60],
	['hrs', 1000 * 60 * 60],
	['h', 1000 * 60 * 60],

	['day', 1000 * 60 * 60 * 24],
	['days', 1000 * 60 * 60 * 24],
	['d', 1000 * 60 * 60 * 24],

	['week', 1000 * 60 * 60 * 24 * 7],
	['weeks', 1000 * 60 * 60 * 24 * 7],
	['wk', 1000 * 60 * 60 * 24 * 7],
	['wks', 1000 * 60 * 60 * 24 * 7],
	['w', 1000 * 60 * 60 * 24 * 7],

	['month', 1000 * 60 * 60 * 24 * (365.25 / 12)],
	['months', 1000 * 60 * 60 * 24 * (365.25 / 12)],
	['mm', 1000 * 60 * 60 * 24 * (365.25 / 12)],
	['b', 1000 * 60 * 60 * 24 * (365.25 / 12)],

	['year', 1000 * 60 * 60 * 24 * 365.25],
	['years', 1000 * 60 * 60 * 24 * 365.25],
	['yr', 1000 * 60 * 60 * 24 * 365.25],
	['yrs', 1000 * 60 * 60 * 24 * 365.25],
	['y', 1000 * 60 * 60 * 24 * 365.25]
]);

/**
 * Converts duration strings into ms and future dates
 */
export default class Duration {

	/**
     * The offset
     */
	offset: number;

	/**
	 * The RegExp used for the pattern parsing
	 */
	private static regex = /(-?\d*\.?\d+(?:e[-+]?\d+)?)\s*([a-zμ]*)/ig;

	/**
	 * The RegExp used for removing commas
	 */
	private static commas = /,/g;

	/**
	 * The RegExp used for replacing a/an with 1
	 */
	private static aan = /\ban?\b/ig;

	/**
	 * Create a new Duration instance
	 * @param pattern The string to parse
	 */
	constructor(pattern: string) {
		const Constructor = this.constructor as typeof Duration;

		/**
		 * The offset
		 */
		this.offset = Constructor._parse(pattern.toLowerCase());
	}

	/**
	 * Get the date from now
	 */
	get fromNow(): Date {
		return this.dateFrom(new Date());
	}

	/**
	 * Get the date from
	 * @param date The Date instance to get the date from
	 */
	dateFrom(date: Date): Date {
		return new Date(date.getTime() + this.offset);
	}

	/**
	 * Parse the pattern
	 * @param pattern The pattern to parse
	 */
	private static _parse(pattern: string): number {
		let result = 0;

		pattern
			// ignore commas
			.replace(this.commas, '')
			// a / an = 1
			.replace(this.aan, '1')
			// do math
			.replace(this.regex, (_match, i, units) => {
				units = tokens.get(units) || 0;
				result += Number(i) * units;
				return '';
			});

		return result;
	}

	/**
	 * Shows the user friendly duration of time between a period and now.
	 * @param earlier The time to compare
	 * @param showIn Whether the output should be prefixed
	 */
	static toNow(earlier: Date | number | string, showIn?: boolean): string {
		if (!(earlier instanceof Date)) earlier = new Date(earlier);
		const returnString = showIn ? 'in ' : '';
		let duration = Math.abs((Date.now() - earlier.getTime()) / 1000);

		// Compare the duration in seconds
		if (duration < 45) return `${returnString}seconds`;
		else if (duration < 90) return `${returnString}a minute`;

		// Compare the duration in minutes
		duration /= 60;
		if (duration < 45) return `${returnString + Math.round(duration)} minutes`;
		else if (duration < 90) return `${returnString}an hour`;

		// Compare the duration in hours
		duration /= 60;
		if (duration < 22) return `${returnString + Math.round(duration)} hours`;
		else if (duration < 36) return `${returnString}a day`;

		// Compare the duration in days
		duration /= 24;
		if (duration < 26) return `${returnString + Math.round(duration)} days`;
		else if (duration < 46) return `${returnString}a month`;
		else if (duration < 320) return `${returnString + Math.round(duration / 30)} months`;
		else if (duration < 548) return `${returnString}a year`;

		return `${returnString + Math.round(duration / 365)} years`;
	}

	/**
	 * Parses a timestamp to a given token
	 * @param time The date to parse
	 */
	static duration(time: Date | number | string = new Date()): DurationResponse {
		if (!(time instanceof Date)) time = new Date(time);
		const duration = Math.abs(time.getTime());
		const durations: DurationResponse = {};
		let _duration = duration;

		const chainTokens = ['years', 'months', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'];

		for (const token of chainTokens) {
			const tokenVal = Math.floor(_duration / tokens.get(token)!);

			if (tokenVal < 0) {
				durations[token as keyof DurationResponse] = 0;
				continue;
			}

			durations[token as keyof DurationResponse] = tokenVal;
			_duration -= durations[token as keyof DurationResponse]! * tokens.get(token)!;
		}

		return durations;
	}

}

type DurationResponse = {
	years?: number;
	months?: number;
	days?: number;
	hours?: number;
	minutes?: number;
	seconds?: number;
	milliseconds?: number;
};
