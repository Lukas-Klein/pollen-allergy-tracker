import axios from 'axios';
import type { iDailyData, iPollenData } from './types';
import { createClient } from '@supabase/supabase-js';
import {
	PUBLIC_SUPABASE_EMAIL,
	PUBLIC_SUPABASE_KEY,
	PUBLIC_SUPABASE_PASSWORD
} from '$env/static/public';
import { dataAlreadyUploaded, showAlert, submitButton } from './stores';

// Define Supabase URL, API key, and initialize a Supabase client
const supabaseUrl = 'https://hobixloqfrxsnqlwfqer.supabase.co';
const supabaseKey: any = PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define SVG icons
const svgCross: string =
	'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z';
const svgCheck: string =
	'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z';

// Define type for specifying the color of a Alert notification
type AlertColor =
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

// Retrieve pollen count data using Axios, and organize it into arrays of iPollenData objects
export async function getPollenData() {
	const response = await axios.get(
		'https://cors.lukasklein1604.workers.dev/?https://opendata.dwd.de/climate_environment/health/alerts/s31fg.json'
	);

	// Find the data for the Franken region within the response content
	const pollenMainFranken = response.data.content.find((obj: { partregion_id: number }) => {
		return obj.partregion_id === 124;
	});

	// Create arrays of iPollenData objects for today, tomorrow, and the day after tomorrow
	let aktivePollen: iPollenData[][] = [];
	let pollenToday: iPollenData[] = [];
	let pollenTomorrow: iPollenData[] = [];
	let pollenDayAfterTomorrow: iPollenData[] = [];

	// For each key in the pollen data, check if the severity for today, tomorrow, or day after tomorrow is greater than 0, and add an iPollenData object to the appropriate array
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

	// Add the today, tomorrow, and day after tomorrow arrays to aktivePollen
	aktivePollen.push(pollenToday, pollenTomorrow, pollenDayAfterTomorrow);

	// Call prepBackendData with the today pollen count data as an argument
	prepBackendData(pollenToday);

	return aktivePollen;
}

// Get data from the Supabase backend for the current date
export async function getBackendData() {
	const current = new Date();
	current.setDate(current.getDate());

	// Construct a query using the Supabase client library, and retrieve data for the Augen, Nase, and Medikamente columns for the current date
	const { data, error } = await supabase
		.from('Calendar')
		.select('Augen, Nase, Medikamente')
		.eq(
			'Datum',
			current.getFullYear() +
				'-' +
				('0' + (current.getMonth() + 1)).slice(-2) +
				'-' +
				('0' + current.getDate()).slice(-2)
		);

	// If an error occurred, log it and return
	if (error) {
		console.log(error);
		return;
	}

	return data;
}

let aktivePollenBackend: string = '';

// Generate a string of the formatted pollen count for the current date (for storing in the backend)
export function prepBackendData(pollenToday: iPollenData[]) {
	// Map severity values to user-friendly strings
	const mapSeverityAPI = new Map<string, string>([
		['0-1', 'keine bis gerine Belastung'],
		['1', 'geringe Belastung'],
		['1-2', 'geringe bis mittlere Belastung'],
		['2', 'mittlere Belastung'],
		['2-3', 'mittlere bis hohe Belastung'],
		['3', 'hohe Belastung']
	]);

	// For each pollen type in the today data, add a formatted string to aktivePollenBackend
	for (const pollen of pollenToday) {
		aktivePollenBackend += `${pollen.name} - ${mapSeverityAPI.get(pollen.severity)} / `;
	}
}

// Display a Alert notification with the specified color, text, and SVG icon
function activateAlert(color: AlertColor, text: string, svg: string) {
	showAlert.set({
		color: color,
		open: true,
		svg: svg,
		text: text
	});

	// Hide the Alert notification after 4 seconds
	setTimeout(() => {
		showAlert.set({
			color: color,
			open: false,
			svg: svg,
			text: text
		});
	}, 4000);
}

// Check if data for the current date has already been submitted to the backend
export async function checkIfAlreadySent() {
	const current = new Date();
	current.setDate(current.getDate());

	// Construct a query using the Supabase client library, and retrieve all data for the current date
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

	// If there is no data for the current date, set dataAlreadyUploaded to a message indicating that data has not been uploaded
	if (Calendar === null || Calendar.length === 0) {
		dataAlreadyUploaded.set({ color: 'red', text: 'Keine Daten hochgeladen' });
	} else {
		// If data exists for the current date, set dataAlreadyUploaded to a message indicating that data exists
		dataAlreadyUploaded.set({ color: 'green', text: 'Daten bereits hochgeladen' });
	}

	// If an error occurred, log it and return
	if (error) {
		console.log(error);
		return;
	} else {
		return Calendar;
	}
}

// Insert or update data for the current date in the Supabase backend
export async function sendToBackend(allComplaints: number[], medication: string[]) {
	// Set the submit button text to "loading" while data is being sent
	submitButton.set('loading...');

	const current = new Date();

	// Login to Supabase using provided email and password
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

	// Check if data for the current date has already been sent to the backend
	dailyData = await checkIfAlreadySent();

	// If data for the current date has not been sent, insert a new row in the backend
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
			activateAlert('green', 'Inserted Data! 😊', svgCheck);

			// Set dataAlreadyUploaded to a message indicating that data has been uploaded
			dataAlreadyUploaded.set({ color: 'green', text: 'Daten vorhanden' });
		} catch (error) {
			activateAlert('red', 'There occured an error while inserting your data. 😢', svgCross);
			console.log('error during data insert');
			console.log(error);
		} finally {
			// Reset the submit button text
			submitButton.set('Submit');
		}
	} else {
		// If data for the current date has already been sent, update the existing row in the backend
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

			// Display a success Alert notification
			activateAlert('blue', 'Updated Data! 😊', svgCheck);
		} catch {
			// Display an error Alert notification if an error occurred
			activateAlert('red', 'There occured an error while updating your data. 😢', svgCross);
			console.log('update didnt work');
		} finally {
			// Reset the submit button text
			submitButton.set('Submit');
		}
	}
}
