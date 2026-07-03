<script lang="ts">
  import { fmt, STATUS_OPTIONS, PRODUCT_OPTIONS } from '$lib/utils';
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import type { Report } from '$lib/types';

  export let data: PageData;

  const PAGE_SIZE = 10;

  type SortField = 'date' | 'customerName' | 'status';
  type SortDir = 'asc' | 'desc';

  let statusFilter = 'All';
  let productFilter = 'All';
  let fromDate = '';
  let toDate = '';
  let sortField: SortField = 'date';
  let sortDir: SortDir = 'desc';
  let page = 1;
  let viewReport: Report | null = null;
  let deleteConfirmId: string | null = null;

  $: reports = (data.reports ?? []) as Report[];

  $: filtered = reports.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (productFilter !== 'All' && !r.product.includes(productFilter)) return false;
    if (fromDate && new Date(r.date) < new Date(fromDate)) return false;
    if (toDate && new Date(r.date) > new Date(toDate + 'T23:59:59')) return false;
    return true;
  });

  $: sorted = [...filtered].sort((a, b) => {
    if (sortField === 'date') {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === 'asc' ? diff : -diff;
    }
    const av = (a[sortField] ?? '').toLowerCase();
    const bv = (b[sortField] ?? '').toLowerCase();
    const cmp = av.localeCompare(bv);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  $: totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  $: paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  $: startIdx = sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  $: endIdx = Math.min(page * PAGE_SIZE, sorted.length);
  $: activeFilters = statusFilter !== 'All' || productFilter !== 'All' || fromDate || toDate;

  function handleSort(field: SortField) {
    if (sortField === field) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDir = 'desc';
    }
    page = 1;
  }

  function applyFilter() { page = 1; }

  function clearFilters() {
    statusFilter = 'All';
    productFilter = 'All';
    fromDate = '';
    toDate = '';
    page = 1;
  }

  function sortIcon(field: SortField): string {
    if (sortField !== field) return '↕';
    return sortDir === 'asc' ? '↑' : '↓';
  }

  const statusBadge: Record<string, string> = {
    New: 'bg-blue-100 text-blue-800',
    Pending: 'bg-amber-100 text-amber-800',
    Completed: 'bg-green-100 text-green-800',
    Reviewed: 'bg-purple-100 text-purple-800',
  };

  type ColDef = { label: string; field?: SortField; sortable: boolean };
  const columns: ColDef[] = [
    { label: 'Date',          field: 'date',         sortable: true  },
    { label: 'Customer Name', field: 'customerName',  sortable: true  },
    { label: 'Telephone',                             sortable: false },
    { label: 'Product',                               sortable: false },
    { label: 'Buyer Type',                            sortable: false },
    { label: 'Status',        field: 'status',        sortable: true  },
    { label: 'Follow-up Date',                        sortable: false },
    { label: 'Actions',                               sortable: false },
  ];
</script>

<svelte:head>
  <title>All Reports — FLOW Natural Mineral Water</title>
</svelte:head>

<!-- Page header -->
<div class="bg-brand-navy text-white py-5 px-6">
  <div class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div class="flex items-center gap-3">
      <span class="text-2xl">📊</span>
      <div>
        <h1 class="text-lg font-bold tracking-wide">All Call Reports</h1>
        <p class="text-white/60 text-xs mt-0.5">
          {reports.length} total report{reports.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
    <div class="flex items-center gap-3 flex-wrap">
      <a href="/" class="text-white/70 hover:text-white text-sm transition-colors">← Back to Home</a>
      <a
        href="/call-report"
        class="bg-brand-red hover:opacity-90 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-opacity"
      >
        + Add New Report
      </a>
    </div>
  </div>
</div>

<main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">

  <!-- Filters -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
    <div class="flex flex-wrap gap-3 items-end">

      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
        <select bind:value={statusFilter} on:change={applyFilter}
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy min-w-[130px]">
          {#each STATUS_OPTIONS as s (s)}<option>{s}</option>{/each}
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</label>
        <select bind:value={productFilter} on:change={applyFilter}
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy min-w-[150px]">
          {#each PRODUCT_OPTIONS as p (p)}<option>{p}</option>{/each}
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">From Date</label>
        <input type="date" bind:value={fromDate} on:change={applyFilter}
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">To Date</label>
        <input type="date" bind:value={toDate} on:change={applyFilter}
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
      </div>

      {#if activeFilters}
        <button
          on:click={clearFilters}
          class="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors self-end"
        >
          Clear Filters
        </button>
      {/if}

      <p class="text-sm text-gray-400 self-end ml-auto">
        {sorted.length} result{sorted.length !== 1 ? 's' : ''}
        {#if activeFilters} (filtered from {reports.length}){/if}
      </p>
    </div>
  </div>

  <!-- Empty state -->
  {#if sorted.length === 0}
    <div class="flex flex-col items-center justify-center py-24 text-center">
      <span class="text-6xl mb-5">📋</span>
      <p class="text-gray-700 font-bold text-xl mb-2">No reports found</p>
      <p class="text-gray-400 text-sm mb-8 max-w-xs">
        {reports.length === 0
          ? 'No call reports yet. Create the first one to get started!'
          : 'No reports match your current filters. Try clearing them.'}
      </p>
      {#if reports.length === 0}
        <a
          href="/call-report"
          class="bg-brand-red text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
        >
          + Add First Report
        </a>
      {:else}
        <button
          on:click={clearFilters}
          class="border-2 border-gray-300 text-gray-700 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Clear Filters
        </button>
      {/if}
    </div>

  {:else}
    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              {#each columns as col (col.label)}
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap select-none {col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}"
                  on:click={() => col.sortable && col.field && handleSort(col.field)}
                >
                  {col.label}
                  {#if col.sortable && col.field}
                    <span class="ml-1 text-xs {sortField === col.field ? 'text-brand-navy' : 'text-gray-300'}">
                      {sortIcon(col.field)}
                    </span>
                  {/if}
                </th>
              {/each}
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {#each paginated as report, idx (report.id)}
              <tr class="hover:bg-gray-50 transition-colors {idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}">
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{fmt(report.date)}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <p class="text-sm font-semibold text-gray-900">{report.customerName}</p>
                  {#if report.location}<p class="text-xs text-gray-400 mt-0.5">{report.location}</p>{/if}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{report.telephone}</td>
                <td class="px-4 py-3 text-sm text-gray-600 max-w-[160px]">
                  <span class="block truncate" title={report.product}>{report.product}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{report.buyerType}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold {statusBadge[report.status] ?? 'bg-gray-100 text-gray-700'}">
                    {report.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{fmt(report.followUpDate)}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  {#if deleteConfirmId === report.id}
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs text-brand-red font-semibold">Sure?</span>
                      <form
                        method="POST"
                        action="?/delete"
                        use:enhance={() => {
                          return ({ update }) => {
                            reports = reports.filter((r) => r.id !== report.id);
                            deleteConfirmId = null;
                            if (viewReport?.id === report.id) viewReport = null;
                            update({ reset: false });
                          };
                        }}
                      >
                        <input type="hidden" name="id" value={report.id} />
                        <button
                          type="submit"
                          class="text-xs bg-brand-red hover:opacity-80 text-white px-2 py-1 rounded-md font-semibold transition-opacity"
                        >Yes</button>
                      </form>
                      <button
                        on:click={() => (deleteConfirmId = null)}
                        class="text-xs border border-gray-300 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
                      >No</button>
                    </div>
                  {:else}
                    <div class="flex items-center gap-2">
                      <button
                        on:click={() => (viewReport = report)}
                        class="text-xs bg-brand-navy/5 hover:bg-brand-navy/10 text-brand-navy border border-brand-navy/20 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                      >View</button>
                      <button
                        on:click={() => (deleteConfirmId = report.id)}
                        class="text-xs bg-red-50 hover:bg-red-100 text-brand-red border border-red-200 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                      >Delete</button>
                    </div>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      <p class="text-sm text-gray-500 order-2 sm:order-1">
        Showing <span class="font-semibold text-gray-700">{startIdx}–{endIdx}</span>
        {' '}of{' '}
        <span class="font-semibold text-gray-700">{sorted.length}</span>
        {' '}report{sorted.length !== 1 ? 's' : ''}
      </p>
      <div class="flex items-center gap-2 order-1 sm:order-2">
        <button
          on:click={() => (page = Math.max(1, page - 1))}
          disabled={page === 1}
          class="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >← Previous</button>
        <span class="text-sm text-gray-500 px-1">{page} / {totalPages}</span>
        <button
          on:click={() => (page = Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          class="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >Next →</button>
      </div>
    </div>
  {/if}

</main>

<!-- View Detail Modal -->
{#if viewReport}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    on:click={(e) => { if (e.target === e.currentTarget) viewReport = null; }}
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

      <div class="bg-brand-navy text-white px-6 py-4 rounded-t-2xl flex items-start justify-between flex-shrink-0">
        <div>
          <h2 class="font-bold text-base leading-tight">{viewReport.customerName}</h2>
          <div class="flex items-center gap-3 mt-1">
            <span class="text-white/60 text-xs">{fmt(viewReport.date)}</span>
            <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold {statusBadge[viewReport.status] ?? 'bg-gray-100 text-gray-700'}">
              {viewReport.status}
            </span>
          </div>
        </div>
        <button
          on:click={() => (viewReport = null)}
          class="text-white/60 hover:text-white text-2xl leading-none ml-4 flex-shrink-0"
          aria-label="Close"
        >×</button>
      </div>

      <div class="overflow-y-auto flex-1 px-6 py-5 space-y-5">
        <div class="grid grid-cols-2 gap-4">
          {#each [
            { label: 'Telephone',      value: viewReport.telephone },
            { label: 'Location',       value: viewReport.location ?? '—' },
            { label: 'Product',        value: viewReport.product },
            { label: 'Buyer Type',     value: viewReport.buyerType },
            { label: 'Follow-up Date', value: fmt(viewReport.followUpDate) },
            { label: 'Followed Up By', value: viewReport.followedUpBy },
            { label: 'Created By',     value: viewReport.createdBy },
            { label: 'Created At',     value: fmt(viewReport.createdAt) },
          ] as field (field.label)}
            <div>
              <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{field.label}</p>
              <p class="text-gray-800 text-sm">{field.value || '—'}</p>
            </div>
          {/each}
        </div>

        {#if viewReport.comments}
          <div>
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5">Comments</p>
            <p class="text-gray-700 bg-gray-50 rounded-xl px-4 py-3 text-sm leading-relaxed border border-gray-100">
              {viewReport.comments}
            </p>
          </div>
        {/if}

        {#if viewReport.summary}
          <div>
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5">Summary / Follow Up</p>
            <p class="text-gray-700 bg-gray-50 rounded-xl px-4 py-3 text-sm leading-relaxed border border-gray-100">
              {viewReport.summary}
            </p>
          </div>
        {/if}

        <p class="text-xs text-gray-300 pt-1 border-t border-gray-100">ID: {viewReport.id}</p>
      </div>

      <div class="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
        <button
          on:click={() => {
            const id = viewReport?.id;
            if (id) deleteConfirmId = id;
            viewReport = null;
          }}
          class="flex-1 border-2 border-red-200 text-brand-red font-semibold py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm"
        >Delete Report</button>
        <button
          on:click={() => (viewReport = null)}
          class="flex-1 bg-brand-navy text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
        >Close</button>
      </div>

    </div>
  </div>
{/if}
