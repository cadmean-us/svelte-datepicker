<script lang="ts">
	import DatePicker from '$lib/DatePicker.svelte';

	let date;
</script>

<DatePicker bind:value={date} modal={false} />

<style>
</style>
