<script lang="ts">
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
		Toast,
		Checkbox,
		Indicator,
		Badge,
		Alert
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { checkIfAlreadySend, getPollenData, sendToBackend } from '../services/APICall';
	import type { iPollenData } from '../services/types';
	import {
		dataAlreadyUploaded,
		pollenDataStore,
		showAlert,
		submitButton
	} from '../services/stores';

	let group: string[] = [];
	let rangeValues: number[] = [1, 1];
	const problemAreas: string[] = ['Augen', 'Nase'];
	const days: string[] = ['Heute', 'Morgen', 'Übermorgen'];
	const medications: string[] = ['Levocetirizin', 'Lorano'];
	let loading: boolean = true;
	let mobile: boolean;

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

	onMount(async () => {
		window.screen.width < 768 ? (mobile = true) : (mobile = false);
		const pollenData: iPollenData[] = await getPollenData();
		pollenDataStore.set(pollenData);
		checkIfAlreadySend();
		loading = false;
	});
</script>

<svelte:window on:resize={() => (window.screen.width < 768 ? (mobile = true) : (mobile = false))} />

{#if loading}
	<div class="tableGrid">
		<ListPlaceholder />
		<ListPlaceholder />
		<ListPlaceholder />
	</div>
	<TestimonialPlaceholder class="skeletonBottom" />
{:else}
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
	<div class="alreadyUploadedBadge">
		<Badge color={$dataAlreadyUploaded.color} rounded>
			<Indicator
				color={$dataAlreadyUploaded.color}
				size="xs"
				class="indicator"
			/>{$dataAlreadyUploaded.text}
		</Badge>
	</div>
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
			</div>
		{/each}
	</div>
	<Button
		disabled={$submitButton === 'Submit' ? false : true}
		color="dark"
		outline
		class="submitButton"
		on:click={() => sendToBackend(rangeValues, group)}>{$submitButton}</Button
	>
{/if}
