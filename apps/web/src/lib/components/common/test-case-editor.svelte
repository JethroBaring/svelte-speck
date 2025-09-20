<script lang="ts">
	import { Dropdown, EditorSuggestionDropdownItem } from "@/lib/components/ui/dropdown";


</script>

<div class="relative h-full {className}">
  {#if showPlaceholder}
  <div
  class="absolute top-0 left-0 pointer-events-none text-gray-400 dark:text-gray-500"
>
  Type here
</div>
  {/if}
  <div
    ref={editorRef}
    contentEditable={true}
    spellCheck={false}
    class="overflow-hidden focus:outline-none focus:ring-0 focus:border-gray-200 dark:focus:border-gray-800 text resize-none h-full relative z-10"
    style={{
      wordWrap: "break-word",
      whiteSpace: "pre-wrap",
      overflowWrap: "break-word",
      maxWidth: "100%",
      width: "100%",
      height: "100%",
    }}
    onInput={handleInput}
    onKeyDown={handleKeydown}
    onClick={handleClick}
  />

  <Dropdown
    isOpen={isDropdownOpen}
    onClose={() => setIsDropdownOpen(false)}
    class="min-w-[350px]"
    style={{ top: dropdownPos.top, left: dropdownPos.left }}
  >

    {#each suggestions as suggestion}
    <EditorSuggestionDropdownItem
    key={`${s.value}-${idx}`}
    baseclass={
      idx === highlightedIndex
        ? "block w-full text-left px-2 py-1 text-sm cursor-pointer"
        : "block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    }
    class={idx === highlightedIndex ? "menu-item-active" : "menu-item-inactive"}
    onItemClick={() => acceptSuggestion(idx)}
  >
    <div class="flex w-full items-center justify-between px-2 py-2">
      <div class="flex items-center gap-1">
        <div class="w-4 h-4">
          {s.kind === "command" && <EditorCommandIcon />}
          {s.kind === "function" && <EditorFunctionIcon />}
          {s.kind === "keyword" && <EditorKeywordIcon />}
          {s.kind === "variable" && <EditorVariableIcon />}
          {s.kind === "selector" && <EditorSelectorIcon />}
        </div>

        <span>{s.value}</span>
      </div>
      <span class="text-gray-500">{s.description}</span>
    </div>
  </EditorSuggestionDropdownItem>
    {/each}
  </Dropdown>
</div>