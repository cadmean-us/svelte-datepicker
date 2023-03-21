<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import Arrow from '$lib/Arrow.svelte';
	import Close from '$lib/Close.svelte';

	export let value: Date | null = null;
	export let start = 0; // first day of the week (0 = Sunday, 1 = Monday)
	export let offset = 0; // offset in months from currently selected date
	export let days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
	export let months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];
	export let id = ' ';
	export let show = false;
	export let xOffset = 0;
	export let yOffset = 0;
	export let modal = true;
	export let showToday = true;
	export let blockedDates: Date[] = [];
	export let blockPastDays = false;
	export let blockedDaysOfWeek: number[] = [];

	let viewDate: Date;
	let weeks: { date: number; val: string; class: string }[][];
	let dispatch = createEventDispatcher();
	let today: Date = new Date();
	let x: number;
	let y: number;
	let mounted = false;
	let offsetDays = days.splice(0, start);
	days = days.concat(offsetDays);

	onMount(() => {
		mounted = true;
	});

	function closeModal(): void {
		show = false;
	}

	function pad(n: number): string {
		return n < 10 ? '0' + n : n.toString();
	}

	function iso(date: Date): string {
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
	}

	function isBlocked(val: string): boolean {
		let d = new Date(val);
		d.setDate(d.getDate() + 1);
		return (
			blockedDaysOfWeek.includes(d.getDay()) ||
			(blockPastDays && d.getTime() < new Date().getTime()) ||
			blockedDates.some((b) => compareDates(b, d))
		);
	}

	function weeksFrom(
		viewDate: Date,
		value: Date | null,
	): { date: number; val: string; class: string }[][] {
		let first = new Date(viewDate.getTime());
		first.setDate(1);
		first.setDate(first.getDate() + ((start - first.getDay() - 7) % 7));

		let last = new Date(viewDate.getTime());
		last.setDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate());
		last.setDate(last.getDate() + ((start - last.getDay() + 6) % 7));

		viewDate.getMonth();
		viewDate.getFullYear();
		let d = new Date(first.getTime()),
			week = [],
			weeks = [week];

		let valueIso = value ? iso(value) : '';
		while (d.getTime() <= last.getTime()) {
			d.getMonth();
			d.getFullYear();
			let dd = d.getDate(),
				val = iso(d);
			week.push({
				date: dd,
				val: val,
				class: [
					showToday && val === iso(today) && val != valueIso ? 'today' : '',
					val === valueIso ? 'selected' : '',
					isBlocked(val) ? 'blocked' : '',
				].join(' '),
			});

			d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

			if (d.getDay() === start) {
				week = [];
				weeks.push(week);
			}
		}

		weeks.pop();

		return weeks;
	}

	function getDateWithTimezoneOffset(date: Date): Date {
		let userTimezoneOffset = date.getTimezoneOffset() * 60000;
		return new Date(date.getTime() + userTimezoneOffset);
	}

	function viewDateFrom(value: Date | null, offset: number): void {
		let newViewDate = value ? new Date(value.getTime()) : new Date();
		newViewDate.setMonth(newViewDate.getMonth() + offset);
		viewDate = newViewDate;
	}

	function compareDates(date1: Date, date2: Date): boolean {
		return (
			date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate()
		);
	}

	function selectDate(newValue: { val: string; class: string[] }): void {
		if (!newValue.val || newValue.class.includes('blocked')) return;
		const selectedDate = new Date(newValue.val);
		const end = getDateWithTimezoneOffset(new Date(selectedDate.getTime()));
		end.setDate(end.getDate() - 1);
		value = new Date(newValue.val);
		value = getDateWithTimezoneOffset(value);
		offset = 0;
		dispatch('dateSelected');
	}

	function getCoordinates(): void {
		const element = document.querySelector('#' + id);
		if (!element) return;
		const position = element.getBoundingClientRect();
		x = position.left + xOffset;
		y = position.top + yOffset;
	}

	function leftClick(): void {
		viewDate.setMonth(viewDate.getMonth() - 1);
		viewDate = viewDate;
	}

	function rightClick(): void {
		viewDate.setMonth(viewDate.getMonth() + 1);
		viewDate = viewDate;
	}

	$: viewDateFrom(value, offset);

	$: {
		if (show && mounted) getCoordinates();
	}

	$: {
		weeks = weeksFrom(viewDate, value);
	}
</script>

{#if show || !modal}
	<div
		class="datepicker-container"
		style="z-index: 10; {modal ? `position: absolute; top: ${y + 40}px; left: ${x}px` : ''};"
	>
		{#if modal}
			<div class="dp-row" style="justify-content: end">
				<Close on:click={closeModal} />
			</div>
		{/if}
		<div class="dp-row" style="justify-content: space-between; align-items: center">
			<Arrow on:click={leftClick} width="24px" transform="rotate(180deg)" />
			<div class="h6" style="height: 20px;">
				{months[viewDate.getMonth()]}, {viewDate.getFullYear()}
			</div>
			<Arrow on:click={rightClick} width="24px" />
		</div>
		<table>
			<tr class="b1" style="color: #7166EC">
				{#each days as day}
					<th>{day}</th>
				{/each}
			</tr>
			{#each weeks as week}
				<tr>
					{#each week as day}
						<td
							class="b1 btn {day.class}"
							on:click={() => {
								selectDate(day);
							}}
						>
							{day.date}
						</td>
					{/each}
				</tr>
			{/each}
		</table>
	</div>
{/if}

<style>
	.datepicker-container {
		padding: 5px 10px 10px 10px;
		border-radius: 10px;
		width: 420px;
		box-shadow: 0 2px 4px rgba(187, 187, 187, 0.2);
		background: white;
		box-sizing: border-box;
	}

	table {
		width: auto;
		height: auto;
		background: #ffffff;
		border-spacing: 18px;
		border-collapse: separate;
	}

	td,
	th {
		width: 35px;
		height: 35px;
		text-align: center;
		margin: 0;
		border-radius: 100px;
		transition: 0.25s;
	}

	td.past,
	td.future {
		background: white;
		color: #bdbdbd;
	}

	.btn {
		cursor: pointer;
	}

	.btn:hover {
		background: #7166ec;
		color: white;
	}

	td.blocked {
		color: #231f20;
		background-color: #f3f3f3;
	}

	td.blocked:hover {
		cursor: auto;
		color: #231f20;
		background-color: #f3f3f3;
	}

	td.today {
		color: #ffffff;
		background-color: rgba(113, 102, 236, 0.5);
	}

	td.today:hover {
		cursor: pointer;
		color: #ffffff;
		background-color: rgba(113, 102, 236, 0.5);
	}

	td.selected {
		color: #ffffff;
		background-color: #7166ec;
	}

	.h6 {
		font-family: 'Roboto';
		font-style: normal;
		font-weight: 400;
		font-size: 20px;
		line-height: 24px;
		color: #231f20;
	}

	.dp-row {
		display: flex;
		flex-direction: row;
	}

	@media (max-width: 1201px) {
		table {
			border-spacing: 12px;
		}

		.datepicker-container {
			width: 290px;
		}

		.h6 {
			font-weight: 400;
			font-size: 16px;
			line-height: 20px;
		}

		td,
		th {
			width: 26px;
			height: 26px;
			font-size: 12px;
		}
	}
</style>
