import axios from 'axios';
import type { iPollenData } from './types';
import { createClient } from '@supabase/supabase-js';
import {
	PUBLIC_SUPABASE_EMAIL,
	PUBLIC_SUPABASE_KEY,
	PUBLIC_SUPABASE_PASSWORD
} from '$env/static/public';
import { showToast, submitButton } from './stores';

const supabaseUrl = 'https://hobixloqfrxsnqlwfqer.supabase.co';
const supabaseKey: any = PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const svgCross: string =
	'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z';
const svgCheck: string =
	'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z';
type toastColor =
	| 'form'
	| 'none'
	| 'default'
	| 'gray'
	| 'red'
	| 'yellow'
	| 'green'
	| 'indigo'
	| 'purple'
	| 'pink'
	| 'blue'
	| 'light'
	| 'dark'
	| 'dropdown'
	| 'navbar'
	| 'navbarUl'
	| 'primary'
	| undefined;

export async function getPollenData() {
	const response = await axios.get(
		'https://cors.lukasklein1604.workers.dev/?https://opendata.dwd.de/climate_environment/health/alerts/s31fg.json'
	);

	const pollenMainFranken = response.data.content.find((obj: { partregion_id: number }) => {
		return obj.partregion_id === 124;
	});

	let aktivePollen: iPollenData[][] = [];
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

	prepBackendData(pollenToday);

	return aktivePollen;
}

let aktivePollenBackend: string = '';
export function prepBackendData(pollenToday: iPollenData[]) {
	const mapSeverityAPI = new Map<string, string>([
		['0-1', 'keine bis gerine Belastung'],
		['1', 'geringe Belastung'],
		['1-2', 'geringe bis mittlere Belastung'],
		['2', 'mittlere Belastung'],
		['2-3', 'mittlere bis hohe Belastung'],
		['3', 'hohe Belastung']
	]);

	for (const pollen of pollenToday) {
		aktivePollenBackend += `${pollen.name} - ${mapSeverityAPI.get(pollen.severity)} / `;
	}
}

function activateToast(color: toastColor, text: string, svg: string) {
	showToast.set({
		color: color,
		open: true,
		svg: svg,
		text: text
	});
	//set showtoast to false after 4 seconds
	setTimeout(() => {
		showToast.set({
			color: color,
			open: false,
			svg: svg,
			text: text
		});
	}, 4000);
}

export async function checkIfAlreadySend() {
	const current = new Date();
	current.setDate(current.getDate());
	let { data: Calendar, error } = await supabase
		.from('Calendar')
		.select('*')
		.eq(
			'Datum',
			current.getFullYear() +
				'-' +
				('0' + (current.getMonth() + 1)).slice(-2) +
				'-' +
				('0' + current.getDate()).slice(-2)
		);

	if (error) {
		console.log(error);
		return;
	} else {
		return Calendar;
	}
}

export async function sendToBackend(allComplaints: number[], medication: string[]) {
	submitButton.set('loading...');
	const current = new Date();

	try {
		if (PUBLIC_SUPABASE_EMAIL && PUBLIC_SUPABASE_PASSWORD) {
			await supabase.auth.signInWithPassword({
				email: PUBLIC_SUPABASE_EMAIL.toString(),
				password: PUBLIC_SUPABASE_PASSWORD.toString()
			});
		}
	} catch (error) {
		console.log('error during login');
		console.log(error);
	}

	let dailyData: any = [];
	dailyData = await checkIfAlreadySend();
	if (dailyData.length === 0) {
		try {
			const { data, error } = await supabase.from('Calendar').insert([
				{
					Datum: `${current.getFullYear()},${current.getMonth() + 1},${current.getDate()}`,
					Augen: allComplaints[0],
					Nase: allComplaints[1],
					'im Haus': 1,
					Draußen: 1,
					Medikamente: medication.length > 0 ? medication.toString() : '-',
					Pollenflug: aktivePollenBackend
				}
			]);
			activateToast('green', 'Inserted Data! 😊', svgCheck);
		} catch (error) {
			activateToast('red', 'There occured an error while inserting your data. 😢', svgCross);
			console.log('error during data insert');
			console.log(error);
		} finally {
			submitButton.set('Submit');
		}
	} else {
		try {
			const { data, error } = await supabase
				.from('Calendar')
				.update({
					Augen: allComplaints[0],
					Nase: allComplaints[1],
					Medikamente: medication.length > 0 ? medication.toString() : '-'
				})
				.eq(
					'Datum',
					current.getFullYear() +
						'-' +
						('0' + (current.getMonth() + 1)).slice(-2) +
						'-' +
						('0' + current.getDate()).slice(-2)
				);

			activateToast('blue', 'Updated Data! 😊', svgCheck);
		} catch {
			activateToast('red', 'There occured an error while updating your data. 😢', svgCross);
			console.log('update didnt work');
		} finally {
			submitButton.set('Submit');
		}
	}
}
