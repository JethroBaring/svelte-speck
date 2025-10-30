<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Circle from '@lucide/svelte/icons/circle';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { getTestCasesStore } from '$lib/stores/ui/test-cases-store.svelte';
	import { Scanner, Parser } from '@repo/interpreter';
	import { cn } from '$lib/utils';
	interface TestCaseCardProps {
		testCase: any;
	}

	let { testCase }: TestCaseCardProps = $props();

	const getUrl = () => {
		const url = new URL(page.url);
		url.searchParams.set('testCaseId', testCase.id);
		goto(url.toString());
	};

	const testCasesStore = getTestCasesStore();
	const testCaseRun = $derived(
		testCasesStore.testCaseRuns.find((testCaseRun) => testCaseRun.testCaseId === testCase.id)
	);

	const scanner = $derived(new Scanner(testCaseRun?.code!));
	const tokens = $derived(scanner.scanTokens());
	const parser = $derived(new Parser(tokens));
	const statements = $derived(parser.parse());

	$effect(() => {
		console.log(statements);
	});

	function getOrdinal(n: number) {
		const s = ['th', 'st', 'nd', 'rd'];
		const v = n % 100;
		return n + (s[(v - 20) % 10] || s[v] || s[0]);
	}

	function getValueFromToken(token: any): string {
		// Handle variable reference (has name property with token info)
		if (token?.name?.lexeme) {
			return token.name.lexeme;
		}

		// Handle literal value (has value property)
		if (token?.value) {
			return `"${token.value}"`;
		}

		// Handle direct string
		if (typeof token === 'string') {
			return `"${token}"`;
		}

		// Handle token object directly
		if (token?.lexeme) {
			return `"${token.lexeme}"`;
		}

		return '';
	}
</script>

{testCaseRun?.code}
<Card.Root onclick={getUrl}>
	<Card.Content>
		<Collapsible.Root class="flex flex-col gap-4 text-sm">
			<Collapsible.Trigger onclick={(e) => e.stopPropagation()}>
				{#snippet child({ props })}
					<div class="flex items-center justify-between gap-2">
						<div class="flex items-center gap-2">
							{#if testCaseRun?.status === 'RUNNING'}
								<LoaderCircle class="size-4 animate-spin text-yellow-500" />
							{:else if testCaseRun?.status === 'PASSED'}
								<CircleCheck class="size-4 text-green-500" />
							{:else if testCaseRun?.status === 'FAILED'}
								<CircleX class="size-4 text-red-500" />
							{:else}
								<Circle class="size-4" />
							{/if}
							{testCase.name}
						</div>
						<Button
							variant="ghost"
							class="flex size-6 items-center justify-center rounded-[calc(var(--radius)-5px)] hover:bg-gray-800 active:bg-gray-800"
							{...props}
						>
							<ChevronDownIcon class="size-4" />
						</Button>
					</div>
				{/snippet}
			</Collapsible.Trigger>
			<Collapsible.Content class="flex flex-col gap-2">
				<div class="flex flex-col gap-4">
					{#each statements as statement, index}
						<div class="flex flex-col gap-2">
							<Collapsible.Root>
								<Collapsible.Trigger>
									{@const stmtType = (statement as any).stmtType}
									{@const converted = statement as any}
									<div class="flex items-center gap-2">
										{#if testCaseRun?.stepResults?.[index]?.status === 'RUNNING'}
											<LoaderCircle class="size-4 animate-spin text-yellow-500" />
										{:else if testCaseRun?.stepResults?.[index]?.status === 'PASSED'}
											<CircleCheck class="size-4 text-green-500" />
										{:else if testCaseRun?.stepResults?.[index]?.status === 'FAILED'}
											<CircleX class="size-4 text-red-500" />
										{:else}
											<Circle class="size-4" />
										{/if}
										{@render renderStatement(converted, stmtType)}
									</div>
								</Collapsible.Trigger>
								{#if ['IfStmt', 'ForEachStmt', 'RepeatStmt'].includes((statement as any).stmtType)}
									{@render renderBlock(statement as any, (statement as any).stmtType)}
								{/if}
							</Collapsible.Root>

							<!-- <div
								class="flex aspect-[16/9] w-full items-center justify-center rounded-sm bg-gray-800 p-2"
							>
								<img src={(testCaseRun?.stepResults?.[index]?.screenshot as any)?.url} alt="screenshot" class="w-full h-full object-cover" />
							</div> -->
						</div>
					{/each}
				</div>
			</Collapsible.Content>
		</Collapsible.Root>
	</Card.Content>
</Card.Root>

{#snippet renderStatement(converted: any, stmtType: string)}
	{#if stmtType === 'GoStmt'}
		{#if converted.target}
			go {converted.action} {getValueFromToken(converted.target)}
		{:else}
			go {converted.action}
		{/if}
	{:else if stmtType === 'SetStmt'}
		set {converted.target} to {getValueFromToken(converted.value)}
	{:else if stmtType === 'RefreshStmt'}
		refresh page
	{:else if stmtType === 'ClickStmt'}
		{#if converted.modifier}
			click {converted.modifier === 'last'
				? 'the ' + converted.modifier
				: converted.modifier === 'all'
					? 'all'
					: 'the ' + getOrdinal(converted.value)}
			{getValueFromToken(converted.selector)}
		{:else}
			click {getValueFromToken(converted.selector)}
		{/if}
	{:else if stmtType === 'TypeStmt'}
		type {getValueFromToken(converted.value)} into {getValueFromToken(converted.selector)}
	{:else if stmtType === 'PressStmt'}
		press {getValueFromToken(converted.key)}
	{:else if stmtType === 'SelectStmt'}
		select {getValueFromToken(converted.value)} from {getValueFromToken(converted.selector)}
	{:else if stmtType === 'CheckboxStmt'}
		{converted.action} {getValueFromToken(converted.selector)}
	{:else if stmtType === 'HoverStmt'}
		hover over {getValueFromToken(converted.selector)}
	{:else if stmtType === 'ExpectStmt'}
		{#if converted.type === 'element'}
			expect {getValueFromToken(converted.target)}
			{converted.conditionType}
			{['visible', 'hidden', 'enabled', 'disabled', 'checked'].includes(converted.expectedValue)
				? converted.expectedValue
				: getValueFromToken(converted.expectedValue)}
		{:else if converted.type === 'page title'}
			expect page title {converted.conditionType} {getValueFromToken(converted.expectedValue)}
		{:else}
			expect url to contain {getValueFromToken(converted.expectedValue)}
		{/if}
	{:else if stmtType === 'WaitStmt'}
		{#if converted.type === 'time'}
			wait for {getValueFromToken(converted.value)} seconds
		{:else if converted.type === 'element'}
			wait for {getValueFromToken(converted.value)} to {converted.condition}
		{:else}
			wait for page to load
		{/if}
	{:else if stmtType === 'RepeatStmt'}
		repeat {converted.count} times
	{:else if stmtType === 'IfStmt'}
		{#if converted.condition.value}
			if {converted.condition.value}
		{:else if converted.condition.left.value}
			if {getValueFromToken(converted.condition.left)} is {getValueFromToken(
				converted.condition.right
			)}
		{:else}
			if {getValueFromToken(converted.condition.left)} equals {getValueFromToken(
				converted.condition.right
			)}
		{/if}
		<!-- if {converted.condition.left?.value ? converted.condition.left.value : getValueFromToken(converted.condition.left)} -->
	{/if}
{/snippet}

{#snippet renderBlock(converted: any, stmtType: string)}
	<Collapsible.Content>
		<ul
			data-slot="sidebar-menu-sub"
			data-sidebar="menu-sub"
			class={cn(
				'border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5',
				'group-data-[collapsible=icon]:hidden'
			)}
		>
			{#if stmtType === 'RepeatStmt'}
				{#each converted.body as item}
					{#if item.body}
						<li
							data-slot="sidebar-menu-sub-item"
							data-sidebar="menu-sub-item"
							class={cn('group/menu-sub-item relative')}
						>
							<Collapsible.Root>
								<Collapsible.Trigger>
									{@render renderStatement(item as any, item.stmtType)}
								</Collapsible.Trigger>
								{@render renderBlock(item as any, item.stmtType)}
							</Collapsible.Root>
						</li>
					{:else}
						<li
							data-slot="sidebar-menu-sub-item"
							data-sidebar="menu-sub-item"
							class={cn('group/menu-sub-item relative')}
						>
							{@render renderStatement(item as any, item.stmtType)}
						</li>
					{/if}
				{/each}
			{:else if stmtType === 'IfStmt'}
				<li
					data-slot="sidebar-menu-sub-item"
					data-sidebar="menu-sub-item"
					class={cn('group/menu-sub-item relative')}
				>
					<Collapsible.Root>
						<Collapsible.Trigger>then branch</Collapsible.Trigger>
						<Collapsible.Content>
							<ul
								data-slot="sidebar-menu-sub"
								data-sidebar="menu-sub"
								class={cn(
									'border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5',
									'group-data-[collapsible=icon]:hidden'
								)}
							>
								{#each converted.thenBranch as item}
									{#if ['IfStmt', 'ForEachStmt', 'RepeatStmt'].includes(item.stmtType)}
										<li
											data-slot="sidebar-menu-sub-item"
											data-sidebar="menu-sub-item"
											class={cn('group/menu-sub-item relative')}
										>
											<Collapsible.Root>
												<Collapsible.Trigger>
													{@render renderStatement(item as any, item.stmtType)}
												</Collapsible.Trigger>
												{@render renderBlock(item as any, item.stmtType)}
											</Collapsible.Root>
										</li>
									{:else}
										<li
											data-slot="sidebar-menu-sub-item"
											data-sidebar="menu-sub-item"
											class={cn('group/menu-sub-item relative')}
										>
											{@render renderStatement(item as any, item.stmtType)}
										</li>
									{/if}
								{/each}
							</ul>
						</Collapsible.Content>
					</Collapsible.Root>
				</li>
				{#if converted.elseBranch.length > 0}
					<li
						data-slot="sidebar-menu-sub-item"
						data-sidebar="menu-sub-item"
						class={cn('group/menu-sub-item relative')}
					>
						<Collapsible.Root>
							<Collapsible.Trigger>else branch</Collapsible.Trigger>
							<Collapsible.Content>
								<ul
									data-slot="sidebar-menu-sub"
									data-sidebar="menu-sub"
									class={cn(
										'border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5',
										'group-data-[collapsible=icon]:hidden'
									)}
								>
									{#each converted.elseBranch as item}
										{#if ['IfStmt', 'ForEachStmt', 'RepeatStmt'].includes(item.stmtType)}
											<li
												data-slot="sidebar-menu-sub-item"
												data-sidebar="menu-sub-item"
												class={cn('group/menu-sub-item relative')}
											>
												<Collapsible.Root>
													<Collapsible.Trigger>
														{@render renderStatement(item as any, item.stmtType)}
													</Collapsible.Trigger>
													{@render renderBlock(item as any, item.stmtType)}
												</Collapsible.Root>
											</li>
										{:else}
											<li
												data-slot="sidebar-menu-sub-item"
												data-sidebar="menu-sub-item"
												class={cn('group/menu-sub-item relative')}
											>
												{@render renderStatement(item as any, item.stmtType)}
											</li>
										{/if}
									{/each}
								</ul>
							</Collapsible.Content>
						</Collapsible.Root>
					</li>
				{/if}
				<!-- {#each converted.elseBranch as item}
					{#if item.elseBranch}
						<li
							data-slot="sidebar-menu-sub-item"
							data-sidebar="menu-sub-item"
							class={cn('group/menu-sub-item relative')}
						>
							<Collapsible.Root>
								<Collapsible.Trigger>
									{@render renderStatement(item as any, item.stmtType)}
								</Collapsible.Trigger>
								{@render renderBlock(item as any, item.stmtType)}
							</Collapsible.Root>
						</li>
					{:else}
						<li
							data-slot="sidebar-menu-sub-item"
							data-sidebar="menu-sub-item"
							class={cn('group/menu-sub-item relative')}
						>
							{@render renderStatement(item as any, item.stmtType)}
						</li>
					{/if}
				{/each}
				 -->
			{:else}{/if}
		</ul>
	</Collapsible.Content>
{/snippet}
