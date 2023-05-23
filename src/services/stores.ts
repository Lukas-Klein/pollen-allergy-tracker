import { writable } from 'svelte/store';
import type { iPollenData } from './types';

export const pollenDataStore = writable<iPollenData[]>([]);
