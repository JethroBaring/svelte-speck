<div class="relative min-h-screen bg-white dark:bg-gray-900">
	<header class="fixed left-0 top-0 z-50 w-full bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
		<div class="container mx-auto px-4">
			<div class="flex h-20 items-center justify-between">
				<div class="flex items-center">
					<a href="/" class="flex items-center gap-3">
						<img class="rounded-lg" src="/images/speck-logo.png" alt="Speck Logo" width={32} height={32} />
						<span class="text-2xl font-medium text-gray-800 dark:text-white"> Speck </span>
					</a>
				</div>
				<nav class="hidden items-center gap-8 md:flex">
					<a
						href="#features"
						class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
					>
						Features
					</a>
					<a
						href="#pricing"
						class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
					>
						Pricing
					</a>
					<a
						href="#contact"
						class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
					>
						Contact
					</a>
					<a
						href="/signin"
						class="bg-brand-600 hover:bg-brand-700 rounded-lg px-4 py-2 text-sm font-medium text-white"
					>
						Sign In
					</a>
				</nav>
			</div>
		</div>
	</header>

	<section class="relative overflow-hidden pb-32 pt-32">
		<div
			class="from-brand-50 to-brand-100/50 dark:from-brand-900/20 dark:to-brand-800/20 absolute inset-0 bg-gradient-to-br via-white dark:via-gray-900"
		/>

		<div
			class="bg-brand-100 dark:bg-brand-900/30 absolute left-10 top-20 h-20 w-20 animate-pulse rounded-full opacity-60"
		/>
		<div
			class="bg-success-100 dark:bg-success-900/30 absolute right-16 top-40 h-16 w-16 animate-bounce rounded-full opacity-40"
			style:animationDelay="1s"
		/>
		<div
			class="bg-warning-100 dark:bg-warning-900/30 absolute bottom-32 left-20 h-12 w-12 animate-pulse rounded-full opacity-50"
			style:animationDelay="2s"
		/>

		<div class="container relative mx-auto px-4">
			<div class="grid items-center gap-12 lg:grid-cols-2">
				<div class="text-center lg:text-left">
					<div
						class="bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 mb-6 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
					>
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width={2}
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
						Powered by Modern Testing
					</div>

					<h1 class="mb-6 text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
						Build Tests
						<span class="text-brand-600 dark:text-brand-400 block">Visually</span>
					</h1>

					<p class="mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
						Create, organize, and execute automated tests with our intuitive visual platform. No
						complex scripts needed - just write tests in plain language.
					</p>

					<div class="mb-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
						<a
							href="/signup"
							class="from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 rounded-xl bg-gradient-to-r px-8 py-4 text-base font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl"
						>
							Start Testing Free
						</a>
						<a
							href="#demo"
							class="rounded-xl border border-gray-300 bg-white px-8 py-4 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
						>
							Watch Demo
						</a>
					</div>

					<div class="grid grid-cols-3 gap-8 border-t border-gray-200 pt-8 dark:border-gray-800">
						<div>
							<div class="text-2xl font-bold text-gray-900 dark:text-white">10k+</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">Tests Created</div>
						</div>
						<div>
							<div class="text-2xl font-bold text-gray-900 dark:text-white">99.9%</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
						</div>
						<div>
							<div class="text-2xl font-bold text-gray-900 dark:text-white">500+</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">Teams</div>
						</div>
					</div>
				</div>

				<div class="relative">
					<div
						class="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
					>
						<div
							class="border-b border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-600 dark:bg-gray-700"
						>
							<div class="flex items-center gap-2">
								<div class="h-3 w-3 rounded-full bg-red-500"></div>
								<div class="h-3 w-3 rounded-full bg-yellow-500"></div>
								<div class="h-3 w-3 rounded-full bg-green-500"></div>
								<div
									class="ml-4 flex-1 rounded bg-gray-200 px-3 py-1 text-xs text-gray-600 dark:bg-gray-600 dark:text-gray-400"
								>
									speck.dev/projects/ecommerce
								</div>
							</div>
						</div>

						<div class="p-6">
							<div class="mb-6 flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div
										class="bg-brand-100 dark:bg-brand-900 flex h-8 w-8 items-center justify-center rounded-lg"
									>
										<svg
											class="text-brand-600 dark:text-brand-400 h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width={2}
												d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z"
											/>
										</svg>
									</div>
									<div>
										<div class="font-semibold text-gray-900 dark:text-white">E-commerce Tests</div>
										<div class="text-sm text-gray-500 dark:text-gray-400">12 test cases</div>
									</div>
								</div>
								<div
									class="bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400 rounded-full px-3 py-1 text-sm font-medium"
								>
									Passing
								</div>
							</div>

							<div class="space-y-3">
								<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
									<div class="bg-success-500 h-2 w-2 rounded-full"></div>
									<div class="flex-1 text-sm text-gray-700 dark:text-gray-300">
										Login with valid credentials
									</div>
									<div class="text-xs text-gray-500 dark:text-gray-400">2.3s</div>
								</div>
								<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
									<div class="bg-success-500 h-2 w-2 rounded-full"></div>
									<div class="flex-1 text-sm text-gray-700 dark:text-gray-300">
										Add product to cart
									</div>
									<div class="text-xs text-gray-500 dark:text-gray-400">1.8s</div>
								</div>
								<div
									class="flex animate-pulse items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
								>
									<div class="h-2 w-2 animate-spin rounded-full bg-blue-500"></div>
									<div class="flex-1 text-sm text-gray-700 dark:text-gray-300">
										Complete checkout process
									</div>
									<div class="text-xs text-blue-500">Running...</div>
								</div>
							</div>
						</div>
					</div>

					<div
						class="absolute -right-8 top-8 hidden max-w-xs rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-lg lg:block dark:bg-gray-800"
					>
						<div class="mb-2 text-xs text-gray-400">Test Code</div>
						<div class="font-mono text-xs text-green-400">goto "https://shop.com"</div>
						<div class="font-mono text-xs text-blue-400">click "Login"</div>
						<div class="font-mono text-xs text-yellow-400">type @username into "#email"</div>
						<div class="font-mono text-xs text-purple-400">assert "Dashboard" is visible</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section id="features" class="bg-gray-50 py-32 dark:bg-gray-800/50">
		<div class="container mx-auto px-4">
			<div class="mb-20 text-center">
				<div
					class="bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 mb-6 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
				>
					<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width={2}
							d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"
						/>
					</svg>
					Powerful Features
				</div>
				<h2 class="mb-6 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
					Everything you need to test
					<span class="text-brand-600 dark:text-brand-400 block">better and faster</span>
				</h2>
				<p class="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-400">
					From visual test creation to comprehensive reporting, Speck provides all the tools your
					team needs for modern test automation.
				</p>
			</div>

			<div class="mb-20 grid grid-cols-1 gap-16 lg:grid-cols-2">
				<div class="flex items-center gap-8">
					<div class="flex-1">
						<h3 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
							Visual Test Builder
						</h3>
						<p class="mb-6 text-lg text-gray-600 dark:text-gray-400">
							Write tests in plain language with our intelligent editor. Get syntax highlighting,
							auto-completion, and real-time validation as you build your test scenarios.
						</p>
						<ul class="space-y-3">
							<li class="flex items-center gap-3">
								<div
									class="bg-success-100 dark:bg-success-900/30 flex h-5 w-5 items-center justify-center rounded-full"
								>
									<svg
										class="text-success-600 dark:text-success-400 h-3 w-3"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<span class="text-gray-700 dark:text-gray-300">Intelligent auto-completion</span>
							</li>
							<li class="flex items-center gap-3">
								<div
									class="bg-success-100 dark:bg-success-900/30 flex h-5 w-5 items-center justify-center rounded-full"
								>
									<svg
										class="text-success-600 dark:text-success-400 h-3 w-3"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<span class="text-gray-700 dark:text-gray-300">Real-time syntax validation</span>
							</li>
							<li class="flex items-center gap-3">
								<div
									class="bg-success-100 dark:bg-success-900/30 flex h-5 w-5 items-center justify-center rounded-full"
								>
									<svg
										class="text-success-600 dark:text-success-400 h-3 w-3"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<span class="text-gray-700 dark:text-gray-300">Built-in testing helpers</span>
							</li>
						</ul>
					</div>
					<div class="flex-1">
						<div class="rounded-xl border border-gray-700 bg-gray-900 p-6 dark:bg-gray-800">
							<div class="mb-4 flex items-center gap-2">
								<div class="h-3 w-3 rounded-full bg-red-500"></div>
								<div class="h-3 w-3 rounded-full bg-yellow-500"></div>
								<div class="h-3 w-3 rounded-full bg-green-500"></div>
								<span class="ml-2 text-sm text-gray-400">test-editor.speck</span>
							</div>
							<div class="space-y-2 font-mono text-sm">
								<div class="text-gray-500">1</div>
								<div class="text-gray-500">2</div>
								<div class="text-gray-500">3</div>
								<div class="text-gray-500">4</div>
								<div class="text-gray-500">5</div>
								<div class="text-gray-500">6</div>
							</div>
							<div class="absolute -mt-6 ml-8 space-y-2 font-mono text-sm">
								<div>
									<span class="text-purple-400">goto</span>
									<span class="text-green-400">"https://mystore.com"</span>
								</div>
								<div>
									<span class="text-blue-400">click</span>
									<span class="text-yellow-400">"Login"</span>
								</div>
								<div>
									<span class="text-purple-400">type</span>
									<span class="text-orange-400">@username</span>
									<span class="text-blue-400">into</span>
									<span class="text-yellow-400">"#email"</span>
								</div>
								<div>
									<span class="text-purple-400">type</span>
									<span class="text-orange-400">@password</span>
									<span class="text-blue-400">into</span>
									<span class="text-yellow-400">"#password"</span>
								</div>
								<div>
									<span class="text-blue-400">click</span>
									<span class="text-yellow-400">"Submit"</span>
								</div>
								<div>
									<span class="text-red-400">assert</span>
									<span class="text-yellow-400">"Welcome"</span>
									<span class="text-blue-400">is visible</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-8">
					<div class="flex-1">
						<div
							class="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
						>
							<div class="mb-4 flex items-center justify-between">
								<h4 class="font-semibold text-gray-900 dark:text-white">Project: E-commerce App</h4>
								<div
									class="bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400 rounded px-2 py-1 text-xs"
								>
									All Passing
								</div>
							</div>
							<div class="space-y-3">
								<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
									<div
										class="bg-brand-100 dark:bg-brand-900 flex h-8 w-8 items-center justify-center rounded-lg"
									>
										<svg
											class="text-brand-600 dark:text-brand-400 h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width={2}
												d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z"
											/>
										</svg>
									</div>
									<div class="flex-1">
										<div class="font-medium text-gray-900 dark:text-white">
											Authentication Tests
										</div>
										<div class="text-sm text-gray-500 dark:text-gray-400">8 test cases</div>
									</div>
									<div class="text-success-500">✓</div>
								</div>
								<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
									<div
										class="bg-brand-100 dark:bg-brand-900 flex h-8 w-8 items-center justify-center rounded-lg"
									>
										<svg
											class="text-brand-600 dark:text-brand-400 h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width={2}
												d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z"
											/>
										</svg>
									</div>
									<div class="flex-1">
										<div class="font-medium text-gray-900 dark:text-white">Shopping Cart Tests</div>
										<div class="text-sm text-gray-500 dark:text-gray-400">12 test cases</div>
									</div>
									<div class="text-success-500">✓</div>
								</div>
								<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
									<div
										class="bg-brand-100 dark:bg-brand-900 flex h-8 w-8 items-center justify-center rounded-lg"
									>
										<svg
											class="text-brand-600 dark:text-brand-400 h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width={2}
												d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z"
											/>
										</svg>
									</div>
									<div class="flex-1">
										<div class="font-medium text-gray-900 dark:text-white">Checkout Flow Tests</div>
										<div class="text-sm text-gray-500 dark:text-gray-400">6 test cases</div>
									</div>
									<div class="text-success-500">✓</div>
								</div>
							</div>
						</div>
					</div>
					<div class="flex-1">
						<h3 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
							Smart Test Organization
						</h3>
						<p class="mb-6 text-lg text-gray-600 dark:text-gray-400">
							Group related tests into suites with shared variables and functions. Manage
							dependencies and run tests in the optimal order.
						</p>
						<ul class="space-y-3">
							<li class="flex items-center gap-3">
								<div
									class="bg-success-100 dark:bg-success-900/30 flex h-5 w-5 items-center justify-center rounded-full"
								>
									<svg
										class="text-success-600 dark:text-success-400 h-3 w-3"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<span class="text-gray-700 dark:text-gray-300">Shared variables & functions</span>
							</li>
							<li class="flex items-center gap-3">
								<div
									class="bg-success-100 dark:bg-success-900/30 flex h-5 w-5 items-center justify-center rounded-full"
								>
									<svg
										class="text-success-600 dark:text-success-400 h-3 w-3"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<span class="text-gray-700 dark:text-gray-300">Hierarchical test structure</span>
							</li>
							<li class="flex items-center gap-3">
								<div
									class="bg-success-100 dark:bg-success-900/30 flex h-5 w-5 items-center justify-center rounded-full"
								>
									<svg
										class="text-success-600 dark:text-success-400 h-3 w-3"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<span class="text-gray-700 dark:text-gray-300">Parallel execution support</span>
							</li>
						</ul>
					</div>
				</div>

				<div
					class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
				>
					<div
						class="bg-brand-100 dark:bg-brand-900 mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
					>
						<svg
							class="text-brand-600 dark:text-brand-400 h-6 w-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width={2}
								d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
					</div>
					<h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
						Real-time Execution
					</h3>
					<p class="text-gray-600 dark:text-gray-400">
						Execute your test suites instantly with real-time feedback, detailed logs, and
						comprehensive reporting.
					</p>
				</div>

				<div
					class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
				>
					<div
						class="bg-brand-100 dark:bg-brand-900 mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
					>
						<svg
							class="text-brand-600 dark:text-brand-400 h-6 w-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width={2}
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
					</div>
					<h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
						Team Collaboration
					</h3>
					<p class="text-gray-600 dark:text-gray-400">
						Collaborate seamlessly with your team through project sharing, role-based access, and
						team invitations.
					</p>
				</div>

				<div
					class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
				>
					<div
						class="bg-brand-100 dark:bg-brand-900 mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
					>
						<svg
							class="text-brand-600 dark:text-brand-400 h-6 w-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width={2}
								d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
							/>
						</svg>
					</div>
					<h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
						Variable & Function Management
					</h3>
					<p class="text-gray-600 dark:text-gray-400">
						Define reusable variables and functions at project and test suite levels for efficient
						test maintenance.
					</p>
				</div>

				<div
					class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
				>
					<div
						class="bg-brand-100 dark:bg-brand-900 mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
					>
						<svg
							class="text-brand-600 dark:text-brand-400 h-6 w-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width={2}
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
					</div>
					<h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
						Detailed Reporting
					</h3>
					<p class="text-gray-600 dark:text-gray-400">
						Comprehensive test results with step-by-step execution logs, screenshots, and
						performance metrics.
					</p>
				</div>
			</div>
		</div>
	</section>

	<footer class="bg-gray-900 text-white">
		<div class="container mx-auto px-4 py-12">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
				<div>
					<h3 class="mb-4 text-lg font-semibold">Speck</h3>
					<p class="text-gray-400">
						Visual test automation platform for modern development workflows.
					</p>
				</div>
				<div>
					<h3 class="mb-4 text-lg font-semibold">Product</h3>
					<ul class="space-y-2">
						<li>
							<a href="#features" class="text-gray-400 hover:text-white"> Features </a>
						</li>
						<li>
							<a href="#pricing" class="text-gray-400 hover:text-white"> Pricing </a>
						</li>
					</ul>
				</div>
				<div>
					<h3 class="mb-4 text-lg font-semibold">Company</h3>
					<ul class="space-y-2">
						<li>
							<a href="#about" class="text-gray-400 hover:text-white"> About </a>
						</li>
						<li>
							<a href="#contact" class="text-gray-400 hover:text-white"> Contact </a>
						</li>
					</ul>
				</div>
				<div>
					<h3 class="mb-4 text-lg font-semibold">Legal</h3>
					<ul class="space-y-2">
						<li>
							<a href="#privacy" class="text-gray-400 hover:text-white"> Privacy Policy </a>
						</li>
						<li>
							<a href="#terms" class="text-gray-400 hover:text-white"> Terms of Service </a>
						</li>
					</ul>
				</div>
			</div>
			<div class="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
				<p>&copy; {new Date().getFullYear()} Speck. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>
