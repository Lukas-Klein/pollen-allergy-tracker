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

export async function checkIfAlreadySend() {
	const current = new Date();
	let { data: Calendar, error } = await supabase
		.from('Calendar')
		.select('*')
		.eq('date', `${current.getDate()}.${current.getMonth() + 1}.${current.getFullYear()}`);

	return Calendar;
}

export async function sendToBackend(allComplaints: number[]) {
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
					date: `${current.getDate()}.${current.getMonth() + 1}.${current.getFullYear()}`,
					Augen: allComplaints[0],
					Nase: allComplaints[1],
					Husten: 0,
					Haut: 0,
					aktive_Pollen: aktivePollenBackend
				}
			]);
			showToast.set({
				color: 'green',
				open: true,
				svg: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
				text: 'Inserted Data! 😊'
			});
			//set showtoast to false after 4 seconds
			setTimeout(() => {
				showToast.set({
					color: 'green',
					open: false,
					svg: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
					text: 'Inserted Data! 😊'
				});
			}, 4000);
		} catch (error) {
			showToast.set({
				color: 'red',
				open: true,
				svg: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z',
				text: 'There occured an error while inserting your data. 😢'
			});
			setTimeout(() => {
				showToast.set({
					color: 'blue',
					open: false,
					svg: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
					text: 'Updated Data! 😊'
				});
			});
			console.log('error during data insert');
			console.log(error);
		}
	} else {
		try {
			const { data, error } = await supabase
				.from('Calendar')
				.update({ Augen: allComplaints[0], Nase: allComplaints[1] })
				.eq('date', `${current.getDate()}.${current.getMonth() + 1}.${current.getFullYear()}`);

			showToast.set({
				color: 'blue',
				open: true,
				svg: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
				text: 'Updated Data! 😊'
			});
			setTimeout(() => {
				showToast.set({
					color: 'blue',
					open: false,
					svg: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
					text: 'Updated Data! 😊'
				});
			}, 4000);
		} catch {
			showToast.set({
				color: 'red',
				open: true,
				svg: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z',
				text: 'There occured an error while updating your data. 😢'
			});
			setTimeout(() => {
				showToast.set({
					color: 'blue',
					open: false,
					svg: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
					text: 'Updated Data! 😊'
				});
			});
			console.log('update didnt work');
		}
	}
	submitButton.set('Submit');
}
