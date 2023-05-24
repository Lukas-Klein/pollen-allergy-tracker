import { writable } from 'svelte/store';
import type { iPollenData } from './types';

export const pollenDataStore = writable<iPollenData[]>([]);

export const backendData = writable({ Augen: '0', Nase: '0' });
