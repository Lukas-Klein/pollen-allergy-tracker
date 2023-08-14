<script lang="ts">
	// Import necessary UI elements from 'flowbite-svelte' library and onMount function from Svelte
	import {
		Heading,
		P,
		Range,
		Label,
		Rating,
		Button,
		ListPlaceholder,
		TestimonialPlaceholder,
		Accordion,
		AccordionItem,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Checkbox,
		Indicator,
		Badge,
		Alert
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';
	// Import functions from custom APICall service and type definition
	import {
		checkIfAlreadySent,
		getBackendData,
		getPollenData,
		sendToBackend
	} from '../services/APICall';
	import type { iPollenData } from '../services/types';
	// Import necessary stores from services
	import {
		dataAlreadyUploaded,
		pollenDataStore,
		showAlert,
		submitButton
	} from '../services/stores';

	// Define initial state variables
	let group: string[] = [];
	let rangeValues: number[] = [];
	const problemAreas: string[] = ['Augen', 'Nase'];
	const days: string[] = ['Heute', 'Morgen', 'Übermorgen'];
	const medications: string[] = ['Levocetirizin', 'Lorano'];
	let loading: boolean = true;
	let mobile: boolean;
	let dayData: { Augen: string; Nase: string; Medikamente: string }[] = [
		{ Augen: '1', Nase: '1', Medikamente: '' }
	];

	// Define Maps for symptom intensity and severity rating
	const intensityMap = new Map<number, string>([
		[0, 'Keine'],
		[1, 'Leichte'],
		[2, 'Mittlere'],
		[3, 'Starke']
	]);

	const mapSeverityRating = new Map<string, number>([
		['0-1', 0.5],
		['1', 1],
		['1-2', 1.5],
		['2', 2],
		['2-3', 2.5],
		['3', 3]
	]);

	// Fetch data when component is mounted
	onMount(async () => {
		const fetchAndSetInitialData = async () => {
			// Retrieve data for today from the backend and set initial range values for the symptoms and the checkbox value of the medicaments based on retrieved data
			dayData = await getBackendData();
			rangeValues =
				dayData.length > 0 ? [parseInt(dayData[0].Augen), parseInt(dayData[0].Nase)] : [0, 0];
			group = dayData.length > 0 ? dayData[0].Medikamente.split(',') : [];
			// Retrieve pollen data from backend and update pollen data store with retrieved data
			const pollenData: iPollenData[] = await getPollenData();
			pollenDataStore.set(pollenData);

			// Check if data has already been submitted today and set loading state to false after data has been fetched and set initial state variables
			checkIfAlreadySent();
			loading = false;
		};
		await fetchAndSetInitialData();

		// Set initial state for mobile view based on window width
		window.screen.width < 768 ? (mobile = true) : (mobile = false);
	});
</script>

<!-- Display loading placeholder or actual UI based on loading variable -->
<svelte:window on:resize={() => (window.screen.width < 768 ? (mobile = true) : (mobile = false))} />

{#if loading}
	<div class="tableGrid">
		<ListPlaceholder />
		<ListPlaceholder />
		<ListPlaceholder />
	</div>
	<TestimonialPlaceholder class="skeletonBottom" />
{:else}
	<!-- Display alert if showAlert variable is set to open -->
	{#if $showAlert.open}
		<Alert color={$showAlert.color} dismissable>
			<span slot="icon"
				><svg
					aria-hidden="true"
					class="w-5 h-5"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
					><path fill-rule="evenodd" d={$showAlert.svg} clip-rule="evenodd" /></svg
				>
			</span>
			<span class="font-medium">{$showAlert.text}</span>
		</Alert>
	{/if}

	<!-- Display badge if data has already been uploaded -->
	<div class="alreadyUploadedBadge">
		<Badge color={$dataAlreadyUploaded.color} rounded>
			<Indicator
				color={$dataAlreadyUploaded.color}
				size="xs"
				class="indicator"
			/>{$dataAlreadyUploaded.text}
		</Badge>
	</div>

	<!-- Display pollen allergy data table, medication checkboxes, and problem areas sliders -->
	{#if mobile}
		<div class="tableGrid">
			{#each $pollenDataStore as pollenDay, i}
				<Accordion flush>
					{#if i === 0}
						<AccordionItem open>
							<span slot="header">{days[i]}</span>
							<Table striped={true}>
								<TableHead>
									<TableHeadCell>Name</TableHeadCell>
									<TableHeadCell>Stärke</TableHeadCell>
								</TableHead>
								<TableBody>
									{#each pollenDay as pollen}
										<TableBodyRow>
											<TableBodyCell>{pollen.name}</TableBodyCell>
											<TableBodyCell
												><Rating
													total={3}
													rating={mapSeverityRating.get(pollen.severity)}
												/></TableBodyCell
											>
										</TableBodyRow>
									{/each}
								</TableBody>
							</Table>
						</AccordionItem>
					{:else}
						<AccordionItem>
							<span slot="header">{days[i]}</span>
							<Table striped={true}>
								<TableHead>
									<TableHeadCell>Name</TableHeadCell>
									<TableHeadCell>Stärke</TableHeadCell>
								</TableHead>
								<TableBody>
									{#each pollenDay as pollen}
										<TableBodyRow>
											<TableBodyCell>{pollen.name}</TableBodyCell>
											<TableBodyCell
												><Rating
													total={3}
													rating={mapSeverityRating.get(pollen.severity)}
												/></TableBodyCell
											>
										</TableBodyRow>
									{/each}
								</TableBody>
							</Table>
						</AccordionItem>
					{/if}
				</Accordion>
			{/each}
		</div>
	{:else}
		<div class="tableGrid">
			{#each $pollenDataStore as pollenDay, i}
				<div class="table">
					<Heading tag="h2" customSize="text-xl">{days[i]}</Heading>
					<Table striped={true}>
						<TableHead>
							<TableHeadCell>Name</TableHeadCell>
							<TableHeadCell>Stärke</TableHeadCell>
						</TableHead>
						<TableBody>
							{#each pollenDay as pollen}
								<TableBodyRow>
									<TableBodyCell>{pollen.name}</TableBodyCell>
									<TableBodyCell
										><Rating
											total={3}
											rating={mapSeverityRating.get(pollen.severity)}
										/></TableBodyCell
									>
								</TableBodyRow>
							{/each}
						</TableBody>
					</Table>
				</div>
			{/each}
		</div>
	{/if}
	<div class="medicationButtons">
		{#each medications as medication, i}
			<Checkbox bind:group value={medication}>{medication}</Checkbox>
		{/each}
	</div>
	<div class="problemAreasGrid">
		{#each problemAreas as problemArea, i}
			<div>
				<Label>{problemArea}</Label>
				<Range id="range-steps" min="0" max="3" step="1" bind:value={rangeValues[i]} />
				<P>{intensityMap.get(rangeValues[i])} Beschwerden</P>
				<!-- Show selected symptom intensity value -->
			</div>
		{/each}
	</div>

	<!-- Display button to submit data to the backend -->
	<Button
		disabled={$submitButton === 'Submit' ? false : true}
		color="dark"
		outline
		class="submitButton"
		on:click={() => sendToBackend(rangeValues, group)}>{$submitButton}</Button
	>
{/if}
