export interface iPollenData {
	name: string;
	severity: string;
	day: string;
}

export interface iToast {
	color:
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
	svg: string;
	text: string;
	open: boolean;
}

export interface iStatus {
	color: 'red' | 'green';
	text: string;
}

export interface iDailyData {
	Augen: string;
	Nase: string;
	Medikamente: string;
}
