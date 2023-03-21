<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import Arrow from '$lib/Arrow.svelte';

	export function iso(date) {
		const pad = (n) => (n < 10 ? '0' + n : n);
		return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
	}

	export let value: Date | null = null;
	export let days = 'Su Mo Tu We Th Fr Sa'.split(' ');
	export let months =
		'January|February|March|April|May|June|July|August|September|October|November|December'.split(
			'|',
		);
	export let start = 0; // first day of the week (0 = Sunday, 1 = Monday)
	export let offset = 0; // offset in months from currently selected date
	export let id = ' ';
	export let show = false;
	export let duration = '4';
	export let xOffset = 0;
	export let yOffset = 0;
	export let modal = true;
	export let blockedDates = [];

	let date = null;
	let today: Date = new Date();
	let viewDate: Date;
	let month;
	let year;
	let weeks;
	let durationValue;

	const selectedOffset = 5;
	const dispatch = createEventDispatcher();

	onMount(() => {
		durationValue = parseInt(duration);
	});

	$: acceptDate(value);

	function acceptDate(value) {
		if (!value) {
			return;
		}
		const newDate = new Date(value);

		if (newDate) {
			date = iso(newDate);
		}
	}

	function includesInterval(dates, startDate, endDate) {
		while (startDate <= endDate) {
			if (dates.some((date) => date.toDateString() === startDate.toDateString())) {
				return true;
			}
			startDate.setDate(startDate.getDate() + 1);
		}

		return false;
	}

	$: {
		s(durationValue);
	}

	function s(_) {
		selectDate({ val: date, class: [] }, true);
	}

	function selectDate(newValue, changeDuration = false) {
		if (!newValue.val) {
			return;
		}
		if (newValue.class.includes('blocked')) {
			return;
		}
		newValue = newValue.val;
		let end = new Date(newValue);
		end = getDateWithTimezoneOffset(end);
		end.setDate(end.getDate() + durationValue - 1);
		let newValueDate = new Date(newValue);
		newValueDate = getDateWithTimezoneOffset(newValueDate);
		if (includesInterval(blockedDates, newValueDate, end)) {
			dispatch('intervalError', changeDuration);
			return;
		}
		if (end.getDay() == 0) {
			dispatch('sundayError', changeDuration);
		}
		date = newValue;
		value = new Date(newValue);
		value = getDateWithTimezoneOffset(value);
		offset = 0;
		dispatch('dateSelected');
	}

	$: viewDate = viewDateFrom(date, offset);

	$: month = months[viewDate.getMonth()];

	$: year = viewDate.getFullYear();

	$: {
		durationValue = parseInt(duration);
		weeks = weeksFrom(viewDate, date, start);
	}

	function getDateWithTimezoneOffset(date: Date) {
		let userTimezoneOffset = date.getTimezoneOffset() * 60000;
		return new Date(date.getTime() + userTimezoneOffset);
	}

	function viewDateFrom(date, offset) {
		if (!date) {
			return new Date();
		}
		let viewDate = new Date(date);
		viewDate.setMonth(viewDate.getMonth() + offset);
		return viewDate;
	}

	function checkDuration(val, date) {
		let to: Date = new Date(date);
		to = getDateWithTimezoneOffset(to);
		to.setDate(to.getDate() + durationValue - 1);
		return val >= date && val <= iso(to);
	}

	function isBlocked(val, selectedWithOffset) {
		let d = new Date(val);
		d = getDateWithTimezoneOffset(d);
		return (
			d.getDay() == 0 ||
			d.getTime() < selectedWithOffset.getTime() ||
			blockedDates.some((b) => compareDates(b, d))
		);
	}

	function weeksFrom(viewDate, date, start) {
		let first = new Date(viewDate.getTime());
		first.setDate(1);
		first.setDate(first.getDate() + ((start - first.getDay() - 7) % 7));

		let last = new Date(viewDate.getTime());
		last.setDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate());
		last.setDate(last.getDate() + ((start - last.getDay() + 6) % 7));

		let d = new Date(first.getTime()),
			M = viewDate.getMonth(),
			Y = viewDate.getFullYear(),
			week = [],
			weeks = [week];

		while (d.getTime() <= last.getTime()) {
			let dd = d.getDate(),
				mm = d.getMonth(),
				yy = d.getFullYear(),
				val = iso(d),
				selectedWithOffset = new Date(today);

			selectedWithOffset.setDate(today.getDate() + selectedOffset - 1);

			week.push({
				date: dd,
				val,
				class: [
					isBlocked(val, selectedWithOffset) ? 'blocked' : '',
					iso(d) === iso(today) && iso(d) != date ? 'today' : '',
					checkDuration(val, date) ? 'selected' : '',
					// mm == M ? "" : ((mm > M ? yy >= Y : yy > Y) ? "future" : "past")
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

	let x;
	let y;

	function getCoordinates() {
		const element = document.querySelector('#' + id);
		const position = element.getBoundingClientRect();
		x = position.left + xOffset;
		y = position.top + yOffset;
	}

	function compareDates(date1: Date, date2: Date) {
		return (
			date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate()
		);
	}

	$: {
		if (show) {
			if (typeof value == 'string') {
				value = new Date(value);
			}
			getCoordinates();
		}
	}

	function leftClick() {
		viewDate.setMonth(viewDate.getMonth() - 1);
		viewDate = viewDate;
	}

	function rightClick() {
		viewDate.setMonth(viewDate.getMonth() + 1);
		viewDate = viewDate;
	}
</script>

{#if show || !modal}
	<div
		class="datepicker-container"
		style="z-index:10; {modal ? `position: absolute; top: ${y + 40}px; left: ${x}px` : ''};"
	>
		<div class="dp-row" style="justify-content: space-between; align-items: center">
			<Arrow on:click={leftClick} width="24px" transform="rotate(180deg)" />
			<div class="h6" style="height: 20px; padding-bottom: 5px">{month}, {year}</div>
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
							}}>{day.date}</td
						>
					{/each}
				</tr>
			{/each}
		</table>
	</div>
{/if}

<style>
	.date {
		font-family: Roboto;
		font-style: normal;
		font-weight: normal;
		font-size: 18px;
		line-height: 155%;

		color: #bdbdbd;
	}
	@media (max-width: 1201px) {
		.date {
			font-size: 16px;
			line-height: 20px;
		}
	}

	.datepicker-container {
		padding: 5px 10px 10px 10px;
		border-radius: 10px;
		width: 400px;
		box-shadow: 0 2px 4px rgba(187, 187, 187, 0.2);
		background: white;
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
		cursor: auto;
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
