<script lang="ts">
	import { Img, Heading, P } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { getPollenData } from '../services/APICall';
	import type { iPollenData } from '../services/types';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { writable } from 'svelte/store';
	import { pollenDataStore } from '../services/stores';

	onMount(async () => {
		const pollenData: iPollenData[] = await getPollenData();
		pollenDataStore.set(pollenData);
	});
</script>

<Img src="/images/image-1@2x.jpg" alt="sample 1" size="max-w-lg" alignment="mx-auto" />

<Heading class="p-8" tag="h1" customSize="text-3xl">Pollen-Tracker</Heading>

{#each $pollenDataStore as pollenDay}
	<Table striped={true}>
		<TableHead>
			<TableHeadCell>Name</TableHeadCell>
			<TableHeadCell>Severity</TableHeadCell>
			<TableHeadCell>Day</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each pollenDay as pollen}
				<TableBodyRow>
					<TableBodyCell>{pollen.name}</TableBodyCell>
					<TableBodyCell>{pollen.severity}</TableBodyCell>
					<TableBodyCell>{pollen.day}</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
{/each}
