<script lang="ts">
	import { Heading, P, Range, Label, Rating, Button } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { getPollenData, sendToBackend } from '../services/APICall';
	import type { iPollenData } from '../services/types';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { backendData, pollenDataStore } from '../services/stores';

	let rangeValues: number[] = [1, 1];
	const problemAreas: string[] = ['Augen', 'Nase'];
	const days: string[] = ['Heute', 'Morgen', 'Übermorgen'];

	const intensityMap = new Map<number, string>([
		[0, 'Keine'],
		[1, 'Mittlere'],
		[2, 'Starke']
	]);

	const mapSeverityRating = new Map<string, number>([
		['0-1', 1],
		['1', 1],
		['1-2', 2],
		['2', 2],
		['2-3', 3],
		['3', 3]
	]);

	onMount(async () => {
		const pollenData: iPollenData[] = await getPollenData();
		pollenDataStore.set(pollenData);
	});
</script>

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
								><Rating total={3} rating={mapSeverityRating.get(pollen.severity)} /></TableBodyCell
							>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{/each}
</div>
<div class="problemAreasGrid">
	{#each problemAreas as problemArea, i}
		<div>
			<Label>{problemArea}</Label>
			<Range id="range-steps" min="0" max="2" step="1" bind:value={rangeValues[i]} />
			<P>{intensityMap.get(rangeValues[i])} Beschwerden</P>
		</div>
	{/each}
</div>
<Button pill class="submitButton" on:click={() => sendToBackend(rangeValues)}>Submit</Button>
