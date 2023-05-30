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
		TableHeadCell
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { getPollenData, sendToBackend } from '../services/APICall';
	import type { iPollenData } from '../services/types';
	import { pollenDataStore } from '../services/stores';

	let rangeValues: number[] = [1, 1];
	const problemAreas: string[] = ['Augen', 'Nase'];
	const days: string[] = ['Heute', 'Morgen', 'Übermorgen'];
	let loading: boolean = true;
	let mobile: boolean;

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
		window.screen.width < 768 ? (mobile = true) : (mobile = false);
		const pollenData: iPollenData[] = await getPollenData();
		pollenDataStore.set(pollenData);
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
{/if}
