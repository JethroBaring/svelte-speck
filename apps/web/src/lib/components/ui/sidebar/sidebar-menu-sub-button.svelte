<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		children,
		child,
		class: className,
		size = "md",
		isActive = false,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		size?: "sm" | "md";
		isActive?: boolean;
	} = $props();

	const mergedProps = $derived({
		class: cn(
			"text-sidebar-foreground ring-sidebar-ring hover:bg-white/5 hover:text-gray-300 active:bg-white/5 active:text-gray-300 [&>svg]:text-gray-300 outline-hidden flex h-9 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-sm px-2 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
			"data-[active=true]:bg-white/5 data-[active=true]:text-gray-300",
			size === "sm" && "text-xs",
			size === "md" && "text-sm",
			"group-data-[collapsible=icon]:hidden",
			className
		),
		"data-slot": "sidebar-menu-sub-button",
		"data-sidebar": "menu-sub-button",
		"data-size": size,
		"data-active": isActive,
		...restProps,
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<a bind:this={ref} {...mergedProps}>
		{@render children?.()}
	</a>
{/if}
