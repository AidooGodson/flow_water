<script lang="ts">
  import PieChart from '$lib/components/PieChart.svelte';
  import { fmt, STATUS_OPTIONS, PRODUCT_OPTIONS, BUYER_TYPE_OPTIONS } from '$lib/utils';
  import { isToday, parseISO } from 'date-fns';
  import type { PageData } from './$types';
  import type { Report } from '$lib/types';

  export let data: PageData;

  const PIE_COLORS_PRODUCT = ['#CC1515', '#1E1B72', '#FF9800'];
  const PIE_COLORS_BUYER = ['#9C27B0', '#00BCD4', '#E91E63'];

  let fromDate = '';
  let toDate = '';
  let productFilter = 'All';
  let buyerTypeFilter = 'All';
  let statusFilter = 'All';

  $: reports = (data.reports ?? []) as Report[];

  $: filtered = reports.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (productFilter !== 'All' && !r.product.includes(productFilter)) return false;
    if (buyerTypeFilter !== 'All' && r.buyerType !== buyerTypeFilter) return false;
    if (fromDate && new Date(r.date) < new Date(fromDate)) return false;
    if (toDate && new Date(r.date) > new Date(toDate + 'T23:59:59')) return false;
    return true;
  });

  $: stats = {
    total: filtered.length,
    pending: filtered.filter((r) => r.status === 'Pending').length,
    today: filtered.filter((r) => { try { return isToday(parseISO(r.date)); } catch { return false; } }).length,
    completed: filtered.filter((r) => r.status === 'Completed').length,
  };

  $: productChartData = (() => {
    const counts: Record<string, number> = {};
    filtered.forEach((r) => {
      r.product.split(',').forEach((p) => {
        const key = p.trim();
        if (key) counts[key] = (counts[key] ?? 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  $: buyerTypeChartData = (() => {
    const counts: Record<string, number> = {};
    filtered.forEach((r) => {
      if (r.buyerType) counts[r.buyerType] = (counts[r.buyerType] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  $: recentFollowUps = filtered
    .filter((r) => r.followUpDate && (r.status === 'Pending' || r.status === 'New'))
    .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime())
    .slice(0, 5);

  $: activeFilters = fromDate || toDate || productFilter !== 'All' || buyerTypeFilter !== 'All' || statusFilter !== 'All';

  function resetFilters() {
    fromDate = '';
    toDate = '';
    productFilter = 'All';
    buyerTypeFilter = 'All';
    statusFilter = 'All';
  }

  function exportToCSV() {
    const headers = [
      'Date', 'Customer Name', 'Telephone', 'Location', 'Product',
      'Buyer Type', 'Status', 'Follow-up Date', 'Followed Up By', 'Comments', 'Summary',
    ];
    const escape = (v: string | null | undefined) =>
      `"${String(v ?? '').replace(/"/g, '""')}"`;

    const rows = filtered.map((r) =>
      [
        fmt(r.date), r.customerName, r.telephone, r.location,
        r.product, r.buyerType, r.status, fmt(r.followUpDate),
        r.followedUpBy, r.comments, r.summary,
      ].map(escape).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freshwater-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const statusBadge: Record<string, string> = {
    New: 'bg-blue-100 text-blue-800',
    Pending: 'bg-amber-100 text-amber-800',
    Completed: 'bg-green-100 text-green-800',
    Reviewed: 'bg-purple-100 text-purple-800',
  };

  const summaryCardDefs = [
    { title: 'Total Reports',   subtitle: () => activeFilters ? 'Filtered' : 'All Time', icon: '📋', colorClass: 'bg-brand-navy',  key: 'total'     as const },
    { title: 'Follow Ups',      subtitle: () => 'Awaiting Action',                        icon: '⏰', colorClass: 'bg-amber-500',   key: 'pending'   as const },
    { title: "Today's Reports", subtitle: () => 'Submitted Today',                        icon: '📅', colorClass: 'bg-brand-red',   key: 'today'     as const },
    { title: 'Completed',       subtitle: () => activeFilters ? 'Filtered' : 'All Time', icon: '✅', colorClass: 'bg-emerald-600', key: 'completed' as const },
  ];
</script>

<svelte:head>
  <title>Manager Dashboard — FLOW Natural Mineral Water</title>
</svelte:head>

<!-- Page header -->
<div class="bg-brand-navy text-white py-5 px-6">
  <div class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div class="flex items-center gap-3">
      <span class="text-2xl">🏠</span>
      <div>
        <h1 class="text-lg font-bold tracking-wide">Manager Dashboard</h1>
        <p class="text-white/60 text-xs mt-0.5">Overview of all call report activity</p>
      </div>
    </div>
    <div class="flex items-center gap-3 flex-wrap">
      <a href="/" class="text-white/70 hover:text-white text-sm transition-colors">← Back to Home</a>
      <button
        on:click={exportToCSV}
        disabled={filtered.length === 0}
        class="bg-white text-brand-navy font-semibold text-sm px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ⬇ Export CSV
      </button>
      <a
        href="/call-report"
        class="bg-brand-red hover:opacity-90 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-opacity"
      >
        + Add Report
      </a>
    </div>
  </div>
</div>

<main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">

  <!-- Summary Cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {#each summaryCardDefs as card (card.key)}
      <div class="text-white rounded-2xl p-5 shadow-md {card.colorClass}">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-white/70 text-xs font-semibold uppercase tracking-wider">{card.title}</p>
            <p class="text-4xl font-extrabold mt-2 leading-none">{stats[card.key]}</p>
            <p class="text-white/60 text-xs mt-2">{card.subtitle()}</p>
          </div>
          <span class="text-3xl opacity-80">{card.icon}</span>
        </div>
      </div>
    {/each}
  </div>

  <!-- Filters -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wide">Filters</h2>
      {#if activeFilters}
        <button
          on:click={resetFilters}
          class="text-xs text-brand-red hover:opacity-70 font-semibold transition-opacity"
        >
          ✕ Clear All
        </button>
      {/if}
    </div>
    <div class="flex flex-wrap gap-3">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">From</label>
        <input type="date" bind:value={fromDate}
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">To</label>
        <input type="date" bind:value={toDate}
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Product</label>
        <select bind:value={productFilter}
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy min-w-[150px]">
          {#each PRODUCT_OPTIONS as p (p)}<option>{p}</option>{/each}
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Buyer Type</label>
        <select bind:value={buyerTypeFilter}
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy min-w-[140px]">
          {#each BUYER_TYPE_OPTIONS as b (b)}<option>{b}</option>{/each}
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</label>
        <select bind:value={statusFilter}
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy min-w-[130px]">
          {#each STATUS_OPTIONS as s (s)}<option>{s}</option>{/each}
        </select>
      </div>
    </div>
  </div>

  <!-- Reports Table -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
      <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wide">Reports</h2>
      <div class="flex items-center gap-4">
        <span class="text-xs text-gray-400">
          Showing <span class="font-semibold text-gray-600">{Math.min(10, filtered.length)}</span>
          {' '}of{' '}
          <span class="font-semibold text-gray-600">{reports.length}</span>
          {' '}reports{activeFilters ? ' (filtered)' : ''}
        </span>
        <a href="/reports" class="text-xs text-brand-navy hover:underline font-semibold">
          View All →
        </a>
      </div>
    </div>

    {#if filtered.length === 0}
      <div class="py-12 text-center text-gray-400">
        <span class="text-4xl block mb-3">📋</span>
        <p class="text-sm">{reports.length === 0 ? 'No reports yet.' : 'No reports match the current filters.'}</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              {#each ['Date', 'Customer Name', 'Telephone', 'Product', 'Buyer Type', 'Status', 'Follow-up'] as h (h)}
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              {/each}
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            {#each filtered.slice(0, 10) as r, i (r.id)}
              <tr class="hover:bg-gray-50 transition-colors {i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}">
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{fmt(r.date)}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <p class="text-sm font-semibold text-gray-900">{r.customerName}</p>
                  {#if r.location}<p class="text-xs text-gray-400">{r.location}</p>{/if}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{r.telephone}</td>
                <td class="px-4 py-3 text-sm text-gray-600 max-w-[140px]">
                  <span class="block truncate" title={r.product}>{r.product}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{r.buyerType}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold {statusBadge[r.status] ?? 'bg-gray-100 text-gray-700'}">
                    {r.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{fmt(r.followUpDate)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>

  <!-- Charts -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">📦 Reports by Product</h2>
      <PieChart data={productChartData} colors={PIE_COLORS_PRODUCT} />
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">👥 Reports by Buyer Type</h2>
      <PieChart data={buyerTypeChartData} colors={PIE_COLORS_BUYER} />
    </div>
  </div>

  <!-- Upcoming Follow-ups -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
      <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wide">⏰ Upcoming Follow-ups</h2>
      <span class="text-xs text-gray-400">{recentFollowUps.length} pending</span>
    </div>

    {#if recentFollowUps.length === 0}
      <div class="py-10 text-center text-gray-400">
        <span class="text-3xl block mb-2">✅</span>
        <p class="text-sm">No pending follow-ups. All caught up!</p>
      </div>
    {:else}
      <ul class="divide-y divide-gray-50">
        {#each recentFollowUps as r (r.id)}
          <li class="px-5 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">{r.customerName}</p>
              <p class="text-xs text-gray-400 mt-0.5">{r.telephone}{r.location ? ` · ${r.location}` : ''}</p>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <div class="text-right">
                <p class="text-xs font-semibold text-amber-600">{fmt(r.followUpDate)}</p>
                <p class="text-xs text-gray-400 mt-0.5">Follow-up</p>
              </div>
              <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold {statusBadge[r.status] ?? 'bg-gray-100 text-gray-700'}">
                {r.status}
              </span>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

</main>
