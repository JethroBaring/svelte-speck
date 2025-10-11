<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const sidebarMenuButtonVariants = tv({
		base: 'peer/menu-button outline-hidden ring-sidebar-ring hover:bg-white/5 hover:text-gray-300 active:bg-white/5 active:text-gray-300 group-has-data-[sidebar=menu-action]/menu-item:pr-8 data-[active=true]:bg-white/5 data-[active=true]:text-gray-300 data-[state=open]:hover:bg-white/5 data-[state=open]:hover:text-gray-300 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! flex w-full items-center gap-2 overflow-hidden rounded-sm p-2 text-left text-sm transition-[width,height,padding] focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
		variants: {
			variant: {
				default: 'hover:bg-white/5 hover:text-gray-300',
				outline:
					'bg-background hover:bg-white/5 hover:text-gray-300 border border-gray-800'
			},
			size: {
				default: 'h-9 text-sm',
				sm: 'h-7 text-xs',
				lg: 'group-data-[collapsible=icon]:p-0! h-12 text-sm'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type SidebarMenuButtonVariant = VariantProps<typeof sidebarMenuButtonVariants>['variant'];
	export type SidebarMenuButtonSize = VariantProps<typeof sidebarMenuButtonVariants>['size'];
</script>

<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { cn, type WithElementRef, type WithoutChildrenOrChild } from '$lib/utils.js';
	import { mergeProps } from 'bits-ui';
	import type { ComponentProps, Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useSidebar } from './context.svelte.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		child,
		variant = 'default',
		size = 'default',
		isActive = false,
		tooltipContent,
		tooltipContentProps,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
		isActive?: boolean;
		variant?: SidebarMenuButtonVariant;
		size?: SidebarMenuButtonSize;
		tooltipContent?: Snippet | string;
		tooltipContentProps?: WithoutChildrenOrChild<ComponentProps<typeof Tooltip.Content>>;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const sidebar = useSidebar();

	const buttonProps = $derived({
		class: cn(sidebarMenuButtonVariants({ variant, size }), className),
		'data-slot': 'sidebar-menu-button',
		'data-sidebar': 'menu-button',
		'data-size': size,
		'data-active': isActive,
		...restProps
	});
</script>

{#snippet Button({ props }: { props?: Record<string, unknown> })}
	{@const mergedProps = mergeProps(buttonProps, props)}
	{#if child}
		{@render child({ props: mergedProps })}
	{:else}
		<button bind:this={ref} {...mergedProps}>
			{@render children?.()}
		</button>
	{/if}
{/snippet}

{#if !tooltipContent}
	{@render Button({})}
{:else}
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				{@render Button({ props })}
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content
			side="right"
			align="center"
			hidden={sidebar.state !== 'collapsed' || sidebar.isMobile}
			{...tooltipContentProps}
		>
			{#if typeof tooltipContent === 'string'}
				{tooltipContent}
			{:else if tooltipContent}
				{@render tooltipContent()}
			{/if}
		</Tooltip.Content>
	</Tooltip.Root>
{/if}
