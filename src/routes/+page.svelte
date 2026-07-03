<svelte:head>
  <title>FLOW Natural Mineral Water — Call Report System</title>
  <meta name="description" content="Call report management system for FLOW Natural Mineral Water" />
</svelte:head>

<!-- Hero Banner -->
<div class="bg-brand-navy py-6 text-center">
  <p class="text-white text-3xl sm:text-4xl" style="font-family: 'Dancing Script', cursive">
    Oh Yes! Flow Water, Our Own!
  </p>
</div>

<main class="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-8">
  <div class="flex flex-col lg:flex-row gap-8 items-start">

    <!-- Left Column -->
    <div class="flex-1 space-y-6">

      <!-- Product card -->
      <div class="bg-blue-900 rounded-2xl overflow-hidden shadow-md flex flex-col sm:flex-row items-center gap-4 p-6">
        <div class="text-white flex-shrink-0">
          <p class="text-3xl font-black tracking-wide leading-none">FLOW</p>
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-blue-200 mt-1">
            Natural Mineral Water
          </p>
          <div class="flex flex-wrap gap-2 mt-4">
            {#each ['500ml', '1.5L', '5L', '20L'] as size}
              <span class="border border-white/60 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {size}
              </span>
            {/each}
          </div>
        </div>
        <div class="flex-1 flex justify-center sm:justify-end">
          <div class="bg-white rounded-xl p-3 shadow-inner">
            <img
              src="/flow-products.png"
              alt="FLOW water products"
              class="object-contain w-[300px] h-[210px]"
            />
          </div>
        </div>
      </div>

      <!-- Welcome text -->
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          Welcome to the{' '}
          <span class="text-brand-red">Call Report System</span>
        </h1>
        <p class="text-gray-500 text-sm mt-2 max-w-md leading-relaxed">
          Capture and manage follow up calls with our valued customers — efficiently and reliably.
        </p>
      </div>

      <!-- Distributor info -->
      <div class="flex items-start gap-4">
        <img
          src="/desert-lion-logo.jpeg"
          alt="Desert Lion International Ltd."
          class="rounded-full flex-shrink-0 object-cover border-2 border-gray-200 w-16 h-16"
        />
        <div class="text-sm text-gray-600 leading-relaxed">
          <p class="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-0.5">
            Produced in Ghana by:
          </p>
          <p class="font-bold text-gray-900 text-base">Desert Lion International Ltd.</p>
          <p>P.O.Box 14283, Kumasi – Ashanti Region</p>
        </div>
      </div>

      <!-- Contact -->
      <p class="font-bold text-gray-900 text-base sm:text-lg">
        Contact: 0500106010 / 0248744533 / 0598676581
      </p>
    </div>

    <!-- Right Column – Quick Actions -->
    <div class="w-full lg:w-80 xl:w-96 flex-shrink-0">
      <div class="bg-white rounded-2xl shadow-md p-6">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Quick Actions</p>

        <a
          href="/call-report"
          class="flex items-center gap-4 w-full bg-brand-red text-white rounded-xl px-5 py-4 mb-3 transition-opacity hover:opacity-90 group"
        >
          <span class="text-xl flex-shrink-0">📋</span>
          <div class="text-left flex-1">
            <p class="font-bold text-base">Add New Call Report</p>
            <p class="text-red-200 text-xs font-normal mt-0.5">Record a new customer call</p>
          </div>
          <svg class="w-4 h-4 text-red-300 group-hover:translate-x-1 transition-transform flex-shrink-0"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>

        <a
          href="/reports"
          class="flex items-center gap-4 w-full bg-white text-gray-800 rounded-xl px-5 py-4 mb-3 border-2 border-gray-200 hover:border-gray-400 transition-colors group"
        >
          <span class="text-xl flex-shrink-0">📊</span>
          <div class="text-left flex-1">
            <p class="font-bold text-base">View All Reports</p>
            <p class="text-gray-400 text-xs font-normal mt-0.5">Browse and filter call history</p>
          </div>
          <svg class="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>

        <a
          href="/dashboard"
          class="flex items-center gap-4 w-full bg-brand-navy text-white rounded-xl px-5 py-4 transition-opacity hover:opacity-90 group"
        >
          <span class="text-xl flex-shrink-0">📈</span>
          <div class="text-left flex-1">
            <p class="font-bold text-base">Manager Dashboard</p>
            <p class="text-blue-300 text-xs font-normal mt-0.5">Summary, charts &amp; exports</p>
          </div>
          <svg class="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform flex-shrink-0"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      <div class="mt-4 rounded-xl px-5 py-4 text-sm bg-red-50 border border-red-100">
        <p class="font-bold text-brand-red mb-1 flex items-center gap-1.5">
          <span>📍</span> Quick tip
        </p>
        <p class="text-red-600 text-xs leading-relaxed">
          After every customer call, add a report immediately to keep follow-up dates accurate.
        </p>
      </div>
    </div>

  </div>
</main>
