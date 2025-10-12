<script lang="ts">
	import EditorCommandIcon from '@lucide/svelte/icons/zap';
	import EditorFunctionIcon from '@lucide/svelte/icons/wrench';
	import EditorKeywordIcon from '@lucide/svelte/icons/key-round';
	import EditorVariableIcon from '@lucide/svelte/icons/box';
	import EditorSelectorIcon from '@lucide/svelte/icons/square-dashed-mouse-pointer';
	import { onMount } from 'svelte';

	interface TextEditorProps {
		class?: string;
		code: string;
		onChange: (value: string) => void;
		functions?: string[];
		variables?: string[];
	}

	let { class: className, code, onChange, functions = [], variables = [] }: TextEditorProps = $props();

	let editorRef = $state<HTMLDivElement | null>(null);
	let titleRef = $state<HTMLDivElement | null>(null);

	let caretPosition = $state(0);
	let showPlaceholder = $state(true);
	let isEditingTitle = $state(false);
	let titleDraft = $state('');

	// $effect(() => {
	// 	if (testCase?.data?.name != null) {
	// 		titleDraft = String(testCase.data.name);
	// 	}
	// });

	$effect(() => {
		if (isEditingTitle && titleRef) {
			const el = titleRef;
			el.focus();
			// place caret at end
			const selection = window.getSelection();
			const range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			selection?.removeAllRanges();
			selection?.addRange(range);
		}
	});

	// Maintainable syntax categories
	const COMMAND_WORDS = [
		'goto',
		'type',
		'click',
		'press',
		'wait',
		'select',
		'open',
		'close',
		'hover',
		'scroll',
		'assert',
		'expect',
		'call'
	];
	const KEYWORDS = [
		'into',
		'from',
		'as',
		'if',
		'else',
		'and',
		'or',
		'not',
		'in',
		'on',
		'to',
		'with',
		'by',
		'then',
		'case',
		'when',
		'end'
	];
	// Use provided functions and variables, with fallback to defaults
	const FUNCTION_WORDS = $derived(functions.length > 0 ? functions : ['input']);
	const VARIABLE_WORDS = $derived(variables.length > 0 ? variables : ['sample']);

	// Create reactive sets for efficient lookup
	const VARIABLE_WORDS_SET = $derived(new Set(VARIABLE_WORDS.map((w: string) => w.toLowerCase())));
	const FUNCTION_WORDS_SET = $derived(new Set(FUNCTION_WORDS.map((w: string) => w.toLowerCase())));
	const COLORS = {
		// command: '#3641f5', // brand-600 (blue)
		// string: '#039855', // success-600 (green)
		// selector: '#fb6514', // orange-500 (orange)
		// function: '#7a5af8', // theme-purple-500 (purple)
		// keyword: '#2a31d8', // brand-700 (darker blue)
		// punctuation: '#475467', // gray-600 (gray)
		// comment: '#98a2b3', // gray-400 (optional)
		// variable: '#0086c9', // blue-light-600 (optional)
		// number: '#dc6803' // warning-600 (optional)
		command: '#7592ff', // brand-400 (softer, more readable blue)
		string: '#039855', // success-300 (brighter green, better contrast)
		selector: '#fd853a', // orange-400 (slightly softer orange)
		function: '#9cb9ff', // brand-300 (lighter purple-blue for functions)
		keyword: '#36bffa', // blue-light-400 (cyan-blue for keywords)
		punctuation: '#98a2b3', // gray-400 (keep as is, good neutral)
		comment: '#667085', // gray-500 (slightly darker for better hierarchy)
		variable: '#0ba5ec', // blue-light-500 (vibrant cyan)
		number: '#fec84b'
	};

	const ZERO_WIDTH_SPACE = '\u200B';

	// Autocomplete state
	type Suggestion = {
		value: string;
		description: string;
		kind: 'command' | 'function' | 'keyword' | 'variable' | 'selector';
	};
	let isDropdownOpen = $state(false);
	let suggestions = $state<Suggestion[]>([]);
	let highlightedIndex = $state(0);
	let dropdownPos = $state<{ top: number; left: number }>({ top: 0, left: 0 });

	$effect(() => {
		if (!editorRef) return;
		const incoming = code ?? '';
		const currentRaw = editorRef.innerText || '';
		const current = currentRaw.replace(/\u200B/g, '');
		if (current === incoming) return;

		// Always place caret at end when switching test cases (testCaseId changes)
		const shouldPlaceCaretAtEnd = current.length === 0 || current !== incoming;

		rebuildContentWithSyntaxHighlighting(incoming);
		addCaretAnchorIfNeeded(incoming);
		showPlaceholder = incoming.length === 0;

		// Place caret at end when switching test cases or when content is completely different
		if (shouldPlaceCaretAtEnd) {
			restoreCaretPosition(incoming.length);
		}
	});

	const COMMAND_DESCRIPTIONS: Record<string, string> = {
		goto: 'navigate the browser to a URL',
		type: 'enter text into the target input',
		click: 'click the target element',
		press: 'press one or more keyboard keys',
		wait: 'wait for a time, element, or condition',
		select: 'choose an option from a dropdown or list',
		open: 'open a modal, menu, or new tab/context',
		close: 'close a modal, menu, or tab/context',
		hover: 'move the mouse over the target element',
		scroll: 'scroll the page or container to a target or offset',
		assert: 'verify a condition; fail the test if it is false',
		expect: 'validate a value against a matcher or condition'
	};

	// Precompiled regex helpers
	const COMMAND_RE = $derived(new RegExp(
		`^(?:${COMMAND_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
		'i'
	));
	const KEYWORD_RE = $derived(new RegExp(
		`^(?:${KEYWORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
		'i'
	));
	const NUMBER_RE = /^\b\d+(?:\.\d+)?\b/;
	const ID_SELECTOR_RE = /^#[A-Za-z_][\w-]*/;
	const CLASS_SELECTOR_RE = /^\.[A-Za-z_][\w-]*/;
	const ATTR_SELECTOR_RE = /^\[[^\]\n]*\]/;
	const PUNCTUATION_RE = /^[()\[\]{}.,:;"']/;

	// Counts characters in a DOM subtree, where text nodes count as their visible length (ZWSP ignored) and <br> counts as 1
	const countTextAndBreaks = (node: Node): number => {
		let count = 0;
		if (node.nodeType === Node.TEXT_NODE) {
			const content = (node.textContent || '').replace(/\u200B/g, '');
			count += content.length;
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			const el = node as HTMLElement;
			if (el.tagName === 'BR') {
				count += 1;
			} else {
				for (const child of Array.from(node.childNodes)) {
					count += countTextAndBreaks(child);
				}
			}
		}
		return count;
	};

	// Compute caret position in characters counting <br> as one char
	const getCaretPosition = (): number => {
		if (!editorRef) return 0;
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return 0;
		const range = selection.getRangeAt(0);

		const preRange = document.createRange();
		preRange.selectNodeContents(editorRef);
		preRange.setEnd(range.startContainer, range.startOffset);
		const fragment = preRange.cloneContents();
		let pos = 0;
		for (const child of Array.from(fragment.childNodes)) {
			pos += countTextAndBreaks(child);
		}
		return pos;
	};

	const getCharPositionFor = (container: Node, offset: number): number => {
		if (!editorRef) return 0;
		const preRange = document.createRange();
		preRange.selectNodeContents(editorRef);
		preRange.setEnd(container, offset);
		const fragment = preRange.cloneContents();
		let pos = 0;
		for (const child of Array.from(fragment.childNodes)) {
			pos += countTextAndBreaks(child);
		}
		return pos;
	};

	const getSelectionRangePositions = (): {
		start: number;
		end: number;
		collapsed: boolean;
	} => {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) {
			const pos = getCaretPosition();
			return { start: pos, end: pos, collapsed: true };
		}
		const range = selection.getRangeAt(0);
		const start = getCharPositionFor(range.startContainer, range.startOffset);
		const end = getCharPositionFor(range.endContainer, range.endOffset);
		return {
			start: Math.min(start, end),
			end: Math.max(start, end),
			collapsed: range.collapsed
		};
	};

	const addCaretAnchorIfNeeded = (text: string) => {
		if (!editorRef) return;
		const root = editorRef;
		const last = root.lastChild;
		const hasAnchor =
			last?.nodeType === Node.TEXT_NODE && (last.textContent || '') === ZERO_WIDTH_SPACE;
		const needsAnchor = text.length === 0 || text.endsWith('\n') || !last;
		if (!hasAnchor && needsAnchor) {
			root.appendChild(document.createTextNode(ZERO_WIDTH_SPACE));
		}
	};

	const getEditorRelativeCaretRect = (): { top: number; left: number } => {
		if (!editorRef) return { top: 0, left: 0 };
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return { top: 0, left: 0 };
		const range = selection.getRangeAt(0);
		let rect: DOMRect | undefined;
		const rects = range.getClientRects();
		rect = rects && rects.length > 0 ? rects[0] : range.getBoundingClientRect();
		const editorRect = editorRef.getBoundingClientRect();
		const top = (rect?.bottom || editorRect.top) - editorRect.top;
		const left = (rect?.left || editorRect.left) - editorRect.left;
		return { top, left };
	};

	const getCurrentToken = (
		text: string,
		caret: number
	): { start: number; end: number; value: string } => {
		// Identify simple word token made of letters only for commands
		let start = caret;
		while (start > 0 && /[A-Za-z]/.test(text[start - 1])) start -= 1;
		let end = caret;
		while (end < text.length && /[A-Za-z]/.test(text[end])) end += 1;
		return { start, end, value: text.slice(start, caret) };
	};

	const updateAutocomplete = () => {
		if (!editorRef) return;
		const text = (editorRef.innerText || '').replace(/\u200B/g, '');
		const caret = getCaretPosition();
		const { start, value } = getCurrentToken(text, caret);
		const prefix = value.toLowerCase();

		if (!prefix || !/^[a-z]+$/.test(prefix)) {
			isDropdownOpen = false;
			suggestions = [];
			return;
		}

		const cmdMatches = COMMAND_WORDS.filter((w: string) => w.toLowerCase().startsWith(prefix));
		const kwMatches = KEYWORDS.filter((w: string) => w.toLowerCase().startsWith(prefix));
		const fnMatches = FUNCTION_WORDS.filter((w: string) => w.toLowerCase().startsWith(prefix));
		const varMatches = VARIABLE_WORDS.filter((w: string) => w.toLowerCase().startsWith(prefix));
		const hasMatches = cmdMatches.length > 0 || kwMatches.length > 0 || fnMatches.length > 0 || varMatches.length > 0;
		if (!hasMatches) {
			isDropdownOpen = false;
			suggestions = [];
			return;
		}

		const cmdSug: Suggestion[] = cmdMatches.map((m: string) => ({
			value: m,
			description: COMMAND_DESCRIPTIONS[m as keyof typeof COMMAND_DESCRIPTIONS] || '',
			kind: 'command'
		}));
		const kwSug: Suggestion[] = kwMatches.map((m: string) => ({
			value: m,
			description: 'keyword',
			kind: 'keyword'
		}));
		const fnSug: Suggestion[] = fnMatches.map((m: string) => ({
			value: m,
			description: 'function',
			kind: 'function'
		}));
		const varSug: Suggestion[] = varMatches.map((m: string) => ({
			value: m,
			description: 'variable',
			kind: 'variable'
		}));
		const sug = [...cmdSug, ...kwSug, ...fnSug, ...varSug];
		suggestions = sug;
		highlightedIndex = 0;
		const pos = getEditorRelativeCaretRect();
		dropdownPos = { top: pos.top + 6, left: pos.left };
		isDropdownOpen = true;
	};

	const acceptSuggestion = (index: number) => {
		if (!editorRef || suggestions.length === 0) return;
		const chosen = suggestions[Math.max(0, Math.min(index, suggestions.length - 1))];
		const rawText = editorRef.innerText || '';
		const currentText = rawText.replace(/\u200B/g, '');
		const caret = getCaretPosition();
		const { start } = getCurrentToken(currentText, caret);

		let inserted = chosen.value;
		let newCaret: number;
		if (chosen.kind === 'function') {
			// Just insert the function name without parentheses
			inserted = `${chosen.value} `;
			newCaret = start + inserted.length;
		} else if (chosen.kind === 'variable') {
			// For variables, prepend $ and don't add space
			inserted = `$${chosen.value} `;
			newCaret = start + inserted.length;
		} else {
			newCaret = start + inserted.length;
			const nextChar = currentText[caret] ?? '';
			if (!(nextChar && (/\s/.test(nextChar) || /[)\]\},.;:]/.test(nextChar)))) {
				inserted += ' ';
				newCaret += 1;
			}
		}
		const newText = currentText.slice(0, start) + inserted + currentText.slice(caret);

		rebuildContentWithSyntaxHighlighting(newText);
		addCaretAnchorIfNeeded(newText);
		restoreCaretPosition(newCaret);
		isDropdownOpen = false;
		suggestions = [];
		onChange?.(newText);
	};

	const handleInput = (e: InputEvent) => {
		const position = getCaretPosition();
		caretPosition = position;
		const raw = (e.target as HTMLDivElement).innerText || '';
		const text = raw.replace(/\u200B/g, '');

		// Show/hide placeholder based on content
		showPlaceholder = text.length === 0;

		rebuildContentWithSyntaxHighlighting(text);
		addCaretAnchorIfNeeded(text);
		restoreCaretPosition(position);
		updateAutocomplete();
		onChange?.(text);
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (!editorRef) return;

		// Autocomplete navigation
		if (isDropdownOpen) {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				highlightedIndex = (highlightedIndex + 1) % suggestions.length;
				return;
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				highlightedIndex = (highlightedIndex - 1 + suggestions.length) % suggestions.length;
				return;
			}
			if (e.key === 'Enter' || e.key === 'Tab') {
				e.preventDefault();
				acceptSuggestion(highlightedIndex);
				return;
			}
			if (e.key === 'Escape') {
				e.preventDefault();
				isDropdownOpen = false;
				return;
			}
		}

		const rawText = editorRef.innerText || '';
		const currentText = rawText.replace(/\u200B/g, '');
		const { start, end, collapsed } = getSelectionRangePositions();

		// TABOUT: if right before a closing ), ] or " then move caret past it
		if (e.key === 'Tab' && !isDropdownOpen) {
			e.preventDefault();
			if (collapsed) {
				const pos = getCaretPosition();
				const ch = currentText[pos] ?? '';
				if (ch === ')' || ch === ']' || ch === '"') {
					restoreCaretPosition(pos + 1);
					isDropdownOpen = false;
					return;
				}
			}
		}

		// Auto-pair quotes and place caret between them
		if (e.key === '"' || e.key === "'") {
			e.preventDefault();
			const quote = e.key;
			if (!collapsed) {
				const newText =
					currentText.slice(0, start) +
					quote +
					currentText.slice(start, end) +
					quote +
					currentText.slice(end);
				rebuildContentWithSyntaxHighlighting(newText);
				addCaretAnchorIfNeeded(newText);
				// caret after the opening quote and selected content
				restoreCaretPosition(end + 1);
				updateAutocomplete();
				showPlaceholder = newText.length === 0;
				onChange?.(newText);
				return;
			}
			const caretPos = getCaretPosition();
			// If the next character is already the same quote, just move past it
			if (currentText[caretPos] === quote) {
				restoreCaretPosition(caretPos + 1);
				updateAutocomplete();
				return;
			}
			const newText = currentText.slice(0, caretPos) + quote + quote + currentText.slice(caretPos);
			rebuildContentWithSyntaxHighlighting(newText);
			addCaretAnchorIfNeeded(newText);
			restoreCaretPosition(caretPos + 1);
			updateAutocomplete();
			showPlaceholder = newText.length === 0;
			onChange?.(newText);
			return;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			// Remove selection then insert a newline at start
			const base = collapsed ? currentText : currentText.slice(0, start) + currentText.slice(end);
			const insertPos = start;
			const newText = base.slice(0, insertPos) + '\n' + base.slice(insertPos);
			rebuildContentWithSyntaxHighlighting(newText);
			addCaretAnchorIfNeeded(newText);
			restoreCaretPosition(insertPos + 1);
			isDropdownOpen = false;
			onChange?.(newText);
			return;
		}

		if (e.key === 'Backspace') {
			e.preventDefault();
			if (!collapsed) {
				const newText = currentText.slice(0, start) + currentText.slice(end);
				rebuildContentWithSyntaxHighlighting(newText);
				addCaretAnchorIfNeeded(newText);
				restoreCaretPosition(start);
				updateAutocomplete();
				onChange?.(newText);
				return;
			}
			const caretPos = getCaretPosition();
			if (caretPos === 0) return; // nothing to delete
			const newText = currentText.slice(0, caretPos - 1) + currentText.slice(caretPos);

			showPlaceholder = newText.length === 0;
			rebuildContentWithSyntaxHighlighting(newText);
			addCaretAnchorIfNeeded(newText);
			restoreCaretPosition(caretPos - 1);
			updateAutocomplete();
			onChange?.(newText);
			return;
		}

		if (e.key === 'Delete') {
			e.preventDefault();
			if (!collapsed) {
				const newText = currentText.slice(0, start) + currentText.slice(end);
				rebuildContentWithSyntaxHighlighting(newText);
				addCaretAnchorIfNeeded(newText);
				restoreCaretPosition(start);
				updateAutocomplete();
				onChange?.(newText);
				return;
			}
			if (start >= currentText.length) return; // nothing to delete
			const newText = currentText.slice(0, start) + currentText.slice(start + 1);
			rebuildContentWithSyntaxHighlighting(newText);
			addCaretAnchorIfNeeded(newText);
			restoreCaretPosition(start);
			updateAutocomplete();
			onChange?.(newText);
			return;
		}

		if (
			e.key === 'ArrowLeft' ||
			e.key === 'ArrowRight' ||
			e.key === 'ArrowUp' ||
			e.key === 'ArrowDown'
		) {
			setTimeout(() => {
				caretPosition = getCaretPosition();
				updateAutocomplete();
			}, 0);
		}
	};

	const handleClick = () => {
		setTimeout(() => {
			caretPosition = getCaretPosition();
			updateAutocomplete();
		}, 0);
	};

	// Map a character index back to a DOM position. <br> counts as 1, caret is placed after it (at parent, childIndex+1)
	const findNodeAndOffsetAtPosition = (targetPosition: number): [Node, number] | null => {
		if (!editorRef) return null;
		let currentOffset = 0;

		const locateIn = (node: Node): [Node, number] | null => {
			const children = Array.from(node.childNodes);
			for (let i = 0; i < children.length; i += 1) {
				const child = children[i];
				if (child.nodeType === Node.TEXT_NODE) {
					const textLength = (child.textContent || '').replace(/\u200B/g, '').length;
					if (targetPosition <= currentOffset + textLength) {
						return [child, targetPosition - currentOffset];
					}
					currentOffset += textLength;
				} else if (child.nodeType === Node.ELEMENT_NODE) {
					const el = child as HTMLElement;
					if (el.tagName === 'BR') {
						if (targetPosition <= currentOffset + 1) {
							return [node, i + 1];
						}
						currentOffset += 1;
					} else {
						const found = locateIn(child);
						if (found) return found;
					}
				}
			}
			return null;
		};

		const root = editorRef as Node;
		const found = locateIn(root);
		if (found) return found;

		// If we got here, place at end
		if (root.lastChild) {
			const last = root.lastChild;
			if (last.nodeType === Node.TEXT_NODE) {
				return [last, (last.textContent || '').length];
			}
			return [root, root.childNodes.length];
		}
		return [root, 0];
	};

	const rebuildContentWithSyntaxHighlighting = (text: string) => {
		if (!editorRef) return;
		editorRef.innerHTML = '';
		if (text.length === 0) return;

		let i = 0;
		const root = editorRef;

		const isBoundaryBefore = (index: number) =>
			index === 0 || /[^A-Za-z0-9_-]/.test(text[index - 1] || '');
		const isBoundaryAfter = (index: number, len: number) => {
			const j = index + len;
			return j >= text.length || /[^A-Za-z0-9_-]/.test(text[j] || '');
		};

		const appendSpan = (content: string, colorVar: string) => {
			if (!content) return;
			const span = document.createElement('span');
			span.style.color = colorVar;
			span.textContent = content;
			root.appendChild(span);
		};

		while (i < text.length) {
			const ch = text[i];

			// Newlines
			if (ch === '\n') {
				root.appendChild(document.createElement('br'));
				i += 1;
				continue;
			}

			// Comments: // to end of line
			if (text.startsWith('//', i)) {
				const nextNl = text.indexOf('\n', i);
				const end = nextNl === -1 ? text.length : nextNl;
				appendSpan(text.slice(i, end), COLORS.comment);
				i = end;
				continue;
			}

			// Strings: '...' or "..." with simple escape handling
			if (ch === '"' || ch === "'") {
				const quote = ch;
				let j = i + 1;
				let foundClosing = false;
				while (j < text.length) {
					if (text[j] === '\\') {
						j += 2;
						continue;
					}
					if (text[j] === '\n') {
						break;
					}
					if (text[j] === quote) {
						foundClosing = true;
						j += 1;
						break;
					}
					j += 1;
				}
				// opening quote as punctuation
				appendSpan(quote, COLORS.string);
				// content
				const contentEnd = foundClosing ? j - 1 : j;
				if (contentEnd > i + 1) {
					appendSpan(text.slice(i + 1, contentEnd), COLORS.string);
				}
				// closing quote as punctuation only if we actually found one
				if (foundClosing) {
					appendSpan(quote, COLORS.string);
				}
				i = j;
				continue;
			}

			// Attribute selectors: [attr=value]
			if (ch === '[') {
				const close = text.indexOf(']', i + 1);
				const nextNl = text.indexOf('\n', i + 1);
				if (close !== -1 && (nextNl === -1 || close < nextNl)) {
					appendSpan(text.slice(i, close + 1), COLORS.selector);
					i = close + 1;
					continue;
				}
			}

			// ID/Class selectors
			if (ch === '#' && ID_SELECTOR_RE.test(text.slice(i))) {
				const m = text.slice(i).match(ID_SELECTOR_RE)!;
				appendSpan(m[0], COLORS.selector);
				i += m[0].length;
				continue;
			}
			if (ch === '.' && CLASS_SELECTOR_RE.test(text.slice(i))) {
				const m = text.slice(i).match(CLASS_SELECTOR_RE)!;
				appendSpan(m[0], COLORS.selector);
				i += m[0].length;
				continue;
			}

			// Variables: $identifier
			if (ch === '$' && /[A-Za-z_]/.test(text[i + 1] || '')) {
				let j = i + 2;
				while (j < text.length && /[A-Za-z0-9_-]/.test(text[j])) j += 1;
				appendSpan(text.slice(i, j), COLORS.variable);
				i = j;
				continue;
			}

			// Function names from defined list (highlight name without requiring parentheses)
			if (isBoundaryBefore(i)) {
				const identMatch = text.slice(i).match(/^[A-Za-z_][\w-]*/);
				if (identMatch) {
					const name = identMatch[0];
					if (FUNCTION_WORDS_SET.has(name.toLowerCase()) && isBoundaryAfter(i, name.length)) {
						appendSpan(name, COLORS.function);
						i += name.length;
						continue;
					}
				}
			}

			// Highlight defined variable names (in VARIABLE_WORDS_SET) as variables only outside string, comment, selector
			if (isBoundaryBefore(i)) {
				const identMatch = text.slice(i).match(/^[A-Za-z_][\w-]*/);
				if (identMatch) {
					const name = identMatch[0];
					if (VARIABLE_WORDS_SET.has(name.toLowerCase()) && isBoundaryAfter(i, name.length)) {
						appendSpan(name, COLORS.variable);
						i += name.length;
						continue;
					}
				}
			}

			// Numbers
			if (NUMBER_RE.test(text.slice(i))) {
				const m = text.slice(i).match(NUMBER_RE)!;
				appendSpan(m[0], COLORS.number);
				i += m[0].length;
				continue;
			}

			// Commands
			if (isBoundaryBefore(i)) {
				const cm = text.slice(i).match(COMMAND_RE);
				if (cm) {
					const word = cm[0];
					if (isBoundaryAfter(i, word.length)) {
						appendSpan(word, COLORS.command);
						i += word.length;
						continue;
					}
				}
			}

			// Keywords
			if (isBoundaryBefore(i)) {
				const km = text.slice(i).match(KEYWORD_RE);
				if (km) {
					const word = km[0];
					if (isBoundaryAfter(i, word.length)) {
						appendSpan(word, COLORS.keyword);
						i += word.length;
						continue;
					}
				}
			}

			// Punctuation
			if (PUNCTUATION_RE.test(text.slice(i, i + 1))) {
				appendSpan(text[i], COLORS.punctuation);
				i += 1;
				continue;
			}

			// Fallback: plain character
			root.appendChild(document.createTextNode(text[i]));
			i += 1;
		}
	};

	const restoreCaretPosition = (charPosition: number) => {
		if (!editorRef) return;
		const selection = window.getSelection();
		if (!selection) return;
		const range = document.createRange();
		const result = findNodeAndOffsetAtPosition(charPosition);
		if (result) {
			const [node, offset] = result;
			range.setStart(node, offset);
			range.setEnd(node, offset);
			selection.removeAllRanges();
			selection.addRange(range);
			caretPosition = charPosition;
		}
	};
</script>

<div class={`relative h-full ${className}`}>
	{#if showPlaceholder}
		<div class="pointer-events-none absolute left-0 top-0 text-gray-400 dark:text-gray-500">
			Type here
		</div>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div
		bind:this={editorRef}
		contenteditable={true}
		spellcheck={false}
		class="relative z-10 h-full w-full max-w-full resize-none overflow-hidden whitespace-pre-wrap break-words focus:border-gray-200 focus:outline-none focus:ring-0 dark:focus:border-gray-800"
		oninput={(e) => handleInput(e as unknown as InputEvent)}
		onkeydown={handleKeydown}
		onclick={handleClick}
	/>

	{#if isDropdownOpen}
		<div
			class="bg-popover text-popover-foreground absolute z-50 min-w-[350px] rounded-sm border p-1"
			style={`top: ${dropdownPos.top}px; left: ${dropdownPos.left}px;`}
		>
			{#each suggestions as s, idx}
				<button
					onclick={(e) => {
						e.preventDefault();
						acceptSuggestion(idx);
					}}
					class={idx === highlightedIndex
						? 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400 block w-full cursor-pointer rounded-sm text-left text-sm'
						: 'block w-full rounded-sm text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-300'}
				>
					<div class="flex w-full items-center justify-between px-2 py-2">
						<div class="flex items-center gap-1">
							<div class="h-4 w-4">
								{#if s.kind === 'command'}
									<EditorCommandIcon class="size-4" />
								{:else if s.kind === 'function'}
									<EditorFunctionIcon class="size-4" />
								{:else if s.kind === 'keyword'}
									<EditorKeywordIcon class="size-4" />
								{:else if s.kind === 'variable'}
									<EditorVariableIcon class="size-4" />
								{:else if s.kind === 'selector'}
									<EditorSelectorIcon class="size-4" />
								{/if}
							</div>
							<span>{s.value}</span>
						</div>
						<span class="text-gray-500">{s.description}</span>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
