import axios from 'axios';
import type iPollenData from './types';

export async function getPollenData() {
	const response = await axios.get(
		'https://opendata.dwd.de/climate_environment/health/alerts/s31fg.json'
	);

	const pollenMainFranken = response.data.content.find((obj: { partregion_id: number }) => {
		return obj.partregion_id === 124;
	});

	let aktivePollen: iPollenData[] = [];
	let pollenToday: iPollenData[] = [];
	let pollenTomorrow: iPollenData[] = [];
	let pollenDayAfterTomorrow: iPollenData[] = [];

	for (const key in pollenMainFranken.Pollen) {
		if (pollenMainFranken.Pollen[key].today > '0') {
			pollenToday.push({
				name: key,
				severity: pollenMainFranken.Pollen[key].today,
				day: 'today'
			});
		}
		if (pollenMainFranken.Pollen[key].tomorrow > '0') {
			pollenTomorrow.push({
				name: key,
				severity: pollenMainFranken.Pollen[key].tomorrow,
				day: 'tomorrow'
			});
		}
		if (pollenMainFranken.Pollen[key].dayafter_to > '0') {
			pollenDayAfterTomorrow.push({
				name: key,
				severity: pollenMainFranken.Pollen[key].dayafter_to,
				day: 'dayaftertomorrow'
			});
		}
	}
	aktivePollen.push(pollenToday, pollenTomorrow, pollenDayAfterTomorrow);

	return aktivePollen;
}
