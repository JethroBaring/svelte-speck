<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { GoStmt } from '@repo/interpreter';
	import { cn } from '$lib/utils';
	const statements = [
		{
			target: 'x',
			value: {
				value: 'check'
			},
			stmtType: 'SetStmt'
		},
		{
			target: 'y',
			value: {
				name: {
					type: 'IDENTIFIER',
					lexeme: 'x',
					literal: null,
					line: 2
				}
			},
			stmtType: 'SetStmt'
		},
		{
			action: 'to',
			target: {
				name: {
					type: 'IDENTIFIER',
					lexeme: 'x',
					literal: null,
					line: 2
				}
			},
			stmtType: 'GoStmt'
		},
		{
			action: 'to',
			target: {
				value: 'https://example.com'
			},
			stmtType: 'GoStmt'
		},
		{
			action: 'back',
			stmtType: 'GoStmt'
		},
		{
			action: 'forward',
			stmtType: 'GoStmt'
		},
		{
			stmtType: 'RefreshStmt'
		},
		{
			selector: {
				name: {
					type: 'IDENTIFIER',
					lexeme: 'x',
					literal: null,
					line: 9
				}
			},
			value: null,
			stmtType: 'ClickStmt'
		},
		{
			selector: {
				value: 'selector'
			},
			value: null,
			stmtType: 'ClickStmt'
		},
		{
			selector: {
				value: 'selector'
			},
			modifier: 'nth',
			value: 2,
			stmtType: 'ClickStmt'
		},
		{
			selector: {
				value: 'selector'
			},
			modifier: 'last',
			value: null,
			stmtType: 'ClickStmt'
		},
		{
			selector: {
				value: 'selector'
			},
			modifier: 'all',
			value: null,
			stmtType: 'ClickStmt'
		},
		{
			value: {
				value: 'text'
			},
			selector: {
				value: 'selector'
			},
			stmtType: 'TypeStmt'
		},
		{
			value: {
				name: {
					type: 'IDENTIFIER',
					lexeme: 'variable',
					literal: null,
					line: 14
				}
			},
			selector: {
				value: 'selector'
			},
			stmtType: 'TypeStmt'
		},
		{
			key: {
				name: {
					type: 'IDENTIFIER',
					lexeme: 'Enter',
					literal: null,
					line: 16
				}
			},
			stmtType: 'PressStmt'
		},
		{
			key: {
				value: 'Tab'
			},
			stmtType: 'PressStmt'
		},
		{
			key: {
				value: 'Ctrl+A'
			},
			stmtType: 'PressStmt'
		},
		{
			value: {
				value: 'option text'
			},
			selector: {
				value: 'selector'
			},
			stmtType: 'SelectStmt'
		},
		{
			action: 'check',
			selector: {
				value: 'selector'
			},
			stmtType: 'CheckboxStmt'
		},
		{
			action: 'uncheck',
			selector: {
				value: 'selector'
			},
			stmtType: 'CheckboxStmt'
		},
		{
			selector: {
				value: 'selector'
			},
			stmtType: 'HoverStmt'
		},
		{
			type: 'element',
			target: {
				value: 'selector'
			},
			conditionType: 'to be',
			expectedValue: 'visible',
			stmtType: 'ExpectStmt'
		},
		{
			type: 'element',
			target: {
				value: 'selector'
			},
			conditionType: 'to be',
			expectedValue: 'hidden',
			stmtType: 'ExpectStmt'
		},
		{
			type: 'element',
			target: {
				value: 'selector'
			},
			conditionType: 'to contain',
			expectedValue: {
				value: 'text'
			},
			stmtType: 'ExpectStmt'
		},
		{
			type: 'element',
			target: {
				value: 'selector'
			},
			conditionType: 'to have text',
			expectedValue: {
				value: 'exact text'
			},
			stmtType: 'ExpectStmt'
		},
		{
			type: 'element',
			target: {
				value: 'selector'
			},
			conditionType: 'to be',
			expectedValue: 'enabled',
			stmtType: 'ExpectStmt'
		},
		{
			type: 'element',
			target: {
				value: 'selector'
			},
			conditionType: 'to be',
			expectedValue: 'disabled',
			stmtType: 'ExpectStmt'
		},
		{
			type: 'element',
			target: {
				value: 'selector'
			},
			conditionType: 'to be',
			expectedValue: 'checked',
			stmtType: 'ExpectStmt'
		},
		{
			type: 'page title',
			target: null,
			conditionType: 'to be',
			expectedValue: {
				value: 'Title'
			},
			stmtType: 'ExpectStmt'
		},
		{
			type: 'page title',
			target: null,
			conditionType: 'to contain',
			expectedValue: {
				value: 'Title'
			},
			stmtType: 'ExpectStmt'
		},
		{
			type: 'url',
			target: null,
			conditionType: 'to contain',
			expectedValue: {
				value: 'login'
			},
			stmtType: 'ExpectStmt'
		},
		{
			target: 'variable',
			value: {
				value: 'value'
			},
			stmtType: 'SetStmt'
		},
		{
			target: 'variable',
			value: {
				value: 5
			},
			stmtType: 'SetStmt'
		},
		{
			target: 'variable',
			value: {
				value: 'selector'
			},
			stmtType: 'SetStmt'
		},
		{
			type: 'time',
			value: {
				value: 2
			},
			stmtType: 'WaitStmt'
		},
		{
			type: 'element',
			value: {
				value: 'selector'
			},
			condition: 'appear',
			stmtType: 'WaitStmt'
		},
		{
			type: 'element',
			value: {
				value: 'selector'
			},
			condition: 'disappear',
			stmtType: 'WaitStmt'
		},
		{
			type: 'page',
			stmtType: 'WaitStmt'
		},
		{
			count: 3,
			body: [
				{
					type: 'time',
					value: {
						value: 2
					},
					stmtType: 'WaitStmt'
				},
				{
					count: 3,
					body: [
						{
							type: 'time',
							value: {
								value: 2
							},
							stmtType: 'WaitStmt'
						}
					],
					stmtType: 'RepeatStmt'
				}
			],
			stmtType: 'RepeatStmt'
		},
		{
			variable: 'item',
			collection: {
				name: {
					type: 'IDENTIFIER',
					lexeme: 'list',
					literal: null,
					line: 56
				}
			},
			body: [
				{
					type: 'time',
					value: {
						value: 2
					},
					stmtType: 'WaitStmt'
				}
			],
			stmtType: 'ForEachStmt'
		},
		{
			condition: {
				left: {
					value: 'selector'
				},
				operator: {
					type: 'EQUAL_EQUAL',
					lexeme: '==',
					literal: null,
					line: 0
				},
				right: {
					value: 'visible'
				}
			},
			thenBranch: [
				{
					type: 'time',
					value: {
						value: 2
					},
					stmtType: 'WaitStmt'
				}
			],
			elseIfConditions: [],
			elseIfBranches: [],
			elseBranch: [],
			stmtType: 'IfStmt'
		},
		{
			condition: {
				left: {
					value: 'selector'
				},
				operator: {
					type: 'EQUAL_EQUAL',
					lexeme: '==',
					literal: null,
					line: 0
				},
				right: {
					value: 'visible'
				}
			},
			thenBranch: [
				{
					type: 'time',
					value: {
						value: 2
					},
					stmtType: 'WaitStmt'
				}
			],
			elseIfConditions: [],
			elseIfBranches: [],
			elseBranch: [
				{
					type: 'time',
					value: {
						value: 2
					},
					stmtType: 'WaitStmt'
				}
			],
			stmtType: 'IfStmt'
		},
		{
			condition: {
				left: {
					name: {
						type: 'IDENTIFIER',
						lexeme: 'variable',
						literal: null,
						line: 70
					}
				},
				operator: {
					type: 'EQUAL_EQUAL',
					lexeme: '==',
					literal: null,
					line: 0
				},
				right: {
					value: 'value'
				}
			},
			thenBranch: [
				{
					type: 'time',
					value: {
						value: 2
					},
					stmtType: 'WaitStmt'
				}
			],
			elseIfConditions: [],
			elseIfBranches: [],
			elseBranch: [],
			stmtType: 'IfStmt'
		},
		{
			name: {
				type: 'IDENTIFIER',
				lexeme: 'login',
				literal: null,
				line: 74
			},
			params: [],
			body: [
				{
					value: {
						name: {
							type: 'IDENTIFIER',
							lexeme: 'username',
							literal: null,
							line: 75
						}
					},
					selector: {
						value: '#email'
					},
					stmtType: 'TypeStmt'
				},
				{
					value: {
						name: {
							type: 'IDENTIFIER',
							lexeme: 'password',
							literal: null,
							line: 76
						}
					},
					selector: {
						value: '#password'
					},
					stmtType: 'TypeStmt'
				},
				{
					selector: {
						value: '#submit'
					},
					value: null,
					stmtType: 'ClickStmt'
				}
			],
			returnType: {
				type: 'IDENTIFIER',
				lexeme: 'void',
				literal: null,
				line: 0
			},
			stmtType: 'FunctionStmt'
		},
		{
			functionName: 'login',
			args: [],
			stmtType: 'CallStmt'
		},
		{
			variable: 'user',
			collection: {
				name: {
					type: 'IDENTIFIER',
					lexeme: 'users',
					literal: null,
					line: 82
				}
			},
			body: [
				{
					value: {
						name: {
							type: 'IDENTIFIER',
							lexeme: 'user',
							literal: null,
							line: 83
						}
					},
					selector: {
						value: '#email'
					},
					stmtType: 'TypeStmt'
				}
			],
			stmtType: 'ForEachStmt'
		}
	];

	function excludeStmtType(statement: any) {
		const { stmtType, ...cleanStatement } = statement;
		return cleanStatement;
	}

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

<div>
	{#each statements as statement}
		<Collapsible.Root>
			<Collapsible.Trigger>
				{@const stmtType = statement.stmtType}
				{@const converted = statement as any}
				{@render renderStatement(converted, stmtType)}
			</Collapsible.Trigger>
			{#if ['IfStmt', 'ForEachStmt', 'RepeatStmt'].includes(statement.stmtType)}
				{@render renderBlock(statement as any, statement.stmtType)}
			{/if}
		</Collapsible.Root>
	{/each}
</div>

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
			{:else if false}{:else}{/if}
		</ul>
	</Collapsible.Content>
{/snippet}
