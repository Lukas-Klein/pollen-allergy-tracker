import axios, { all } from 'axios';
import type iPollenData from './types';
import { createClient } from '@supabase/supabase-js';
import {
	PUBLIC_SUPABASE_EMAIL,
	PUBLIC_SUPABASE_KEY,
	PUBLIC_SUPABASE_PASSWORD
} from '$env/static/public';

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

export async function sendToBackend(allComplaints: number[]) {
	try {
		if (PUBLIC_SUPABASE_EMAIL && PUBLIC_SUPABASE_PASSWORD) {
			await supabase.auth.signInWithPassword({
				email: PUBLIC_SUPABASE_EMAIL.toString(),
				password: PUBLIC_SUPABASE_PASSWORD.toString()
			});
		}
		console.log('logged in');
	} catch (error) {
		console.log('error during login');
		console.log(error);
	}

	try {
		const current = new Date();
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
		console.log('data inserted');
	} catch (error) {
		console.log('error during data insert');
		console.log(error);
	}
}
