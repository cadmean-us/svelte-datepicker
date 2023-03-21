<script lang="ts">
	import DatePicker from '$lib/DatePicker.svelte';

	let date: Date;
	let dateModal: Date;
	let showModal = false;
</script>

<div style="display: flex; flex-direction: row;">
	<DatePicker bind:value={date} modal={false} />
	<div id="datepicker">
		<button on:click={() => (showModal = !showModal)}> Show DatePicker </button>
	</div>
</div>

<div style="display: flex; flex-direction: row; gap: 100px;">
	<div>Selected Date: {date}</div>
	<div>Selected Modal Date: {dateModal}</div>
</div>

<DatePicker id="datepicker" bind:value={dateModal} bind:show={showModal} />

<style>
</style>
