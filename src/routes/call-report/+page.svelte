<script lang="ts">
  import { enhance } from '$app/forms';
  import { PRODUCTS, BUYER_TYPES, today } from '$lib/utils';
  import type { ActionData, PageData } from './$types';

  export let form: ActionData;
  export let data: PageData;

  $: errors  = (form?.errors  ?? {}) as Record<string, string>;
  $: values  = (form?.values  ?? {}) as Record<string, string>;

  let selectedProducts: string[] = [];
  let selectedBuyerType = '';
  let selectedUserId = '';
  let submitting = false;

  $: selectedUserId = values.userId ?? '';

  function toggleProduct(product: string) {
    selectedProducts = selectedProducts.includes(product)
      ? selectedProducts.filter((p) => p !== product)
      : [...selectedProducts, product];
  }

  function clearForm() {
    selectedProducts = [];
    selectedBuyerType = '';
    selectedUserId = '';
  }

  $: productValue = selectedProducts.join(', ');
</script>

<svelte:head>
  <title>Add Call Report — FLOW Natural Mineral Water</title>
</svelte:head>

<!-- Page header -->
<div class="bg-brand-navy text-white py-5 px-6">
  <div class="max-w-3xl mx-auto flex items-center gap-3">
    <span class="text-2xl">📋</span>
    <div>
      <h1 class="text-lg font-bold tracking-wide">Add New Call Report</h1>
      <p class="text-white/60 text-xs mt-0.5">Complete all required fields and save the report</p>
    </div>
  </div>
</div>

<main class="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">

  {#if errors.serverError}
    <div class="mb-6 flex items-start gap-3 bg-red-50 border border-red-300 text-red-800 rounded-xl px-5 py-4">
      <span class="text-xl mt-0.5">❌</span>
      <div>
        <p class="font-semibold">Failed to save report</p>
        <p class="text-sm text-red-700 mt-0.5">{errors.serverError}</p>
      </div>
    </div>
  {/if}

  <form
    method="POST"
    novalidate
    use:enhance={() => {
      submitting = true;
      return ({ update }) => {
        submitting = false;
        update();
      };
    }}
    class="space-y-6"
  >
    <input type="hidden" name="product" value={productValue} />
    <input type="hidden" name="buyerType" value={selectedBuyerType} />
    <input type="hidden" name="userId" value={selectedUserId} />

    <!-- Section 1: Customer Information -->
    <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="bg-brand-navy px-6 py-3">
        <h2 class="text-white font-bold text-sm uppercase tracking-widest">
          Section 1 — Customer Information
        </h2>
      </div>
      <div class="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Date <span class="text-brand-red">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={values.date ?? today()}
            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy {errors.date ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
          />
          {#if errors.date}
            <p class="text-brand-red text-xs mt-1">{errors.date}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Customer / Business Name <span class="text-brand-red">*</span>
          </label>
          <input
            type="text"
            name="customerName"
            value={values.customerName ?? ''}
            placeholder="e.g. Accra Foods Ltd"
            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy {errors.customerName ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
          />
          {#if errors.customerName}
            <p class="text-brand-red text-xs mt-1">{errors.customerName}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Telephone Number <span class="text-brand-red">*</span>
          </label>
          <input
            type="tel"
            name="telephone"
            value={values.telephone ?? ''}
            placeholder="e.g. 0244 123 456"
            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy {errors.telephone ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
          />
          {#if errors.telephone}
            <p class="text-brand-red text-xs mt-1">{errors.telephone}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Location <span class="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            name="location"
            value={values.location ?? ''}
            placeholder="e.g. Tema, Accra"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
        </div>

      </div>
    </section>

    <!-- Section 2: Product -->
    <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="bg-brand-navy px-6 py-3">
        <h2 class="text-white font-bold text-sm uppercase tracking-widest">
          Section 2 — Product Purchased
        </h2>
      </div>
      <div class="px-6 py-5">
        <p class="text-xs text-gray-500 mb-3">Select all that apply <span class="text-brand-red">*</span></p>
        <div class="flex flex-col sm:flex-row gap-3">
          {#each PRODUCTS as product (product)}
            {@const checked = selectedProducts.includes(product)}
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
            <label
              class="flex items-center gap-3 flex-1 cursor-pointer rounded-xl border-2 px-4 py-3 transition-colors {checked
                ? 'border-brand-navy bg-brand-navy/5 text-brand-navy'
                : 'border-gray-200 hover:border-brand-navy/40 text-gray-700'}"
            >
              <input
                type="checkbox"
                checked={checked}
                on:change={() => toggleProduct(product)}
                class="accent-brand-navy w-4 h-4"
              />
              <span class="text-sm font-medium">{product}</span>
            </label>
          {/each}
        </div>
        {#if errors.products}
          <p class="text-brand-red text-xs mt-2">{errors.products}</p>
        {/if}
      </div>
    </section>

    <!-- Section 3: Buyer Type -->
    <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="bg-brand-navy px-6 py-3">
        <h2 class="text-white font-bold text-sm uppercase tracking-widest">
          Section 3 — Buyer Type
        </h2>
      </div>
      <div class="px-6 py-5">
        <p class="text-xs text-gray-500 mb-3">Select one <span class="text-brand-red">*</span></p>
        <div class="flex flex-col sm:flex-row gap-3">
          {#each BUYER_TYPES as type (type)}
            {@const selected = selectedBuyerType === type}
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
            <label
              class="flex items-center gap-3 flex-1 cursor-pointer rounded-xl border-2 px-4 py-3 transition-colors {selected
                ? 'border-brand-navy bg-brand-navy/5 text-brand-navy'
                : 'border-gray-200 hover:border-brand-navy/40 text-gray-700'}"
            >
              <input
                type="radio"
                name="_buyerType"
                value={type}
                checked={selected}
                on:change={() => (selectedBuyerType = type)}
                class="accent-brand-navy w-4 h-4"
              />
              <span class="text-sm font-medium">{type}</span>
            </label>
          {/each}
        </div>
        {#if errors.buyerType}
          <p class="text-brand-red text-xs mt-2">{errors.buyerType}</p>
        {/if}
      </div>
    </section>

    <!-- Section 4: Call Details -->
    <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="bg-brand-navy px-6 py-3">
        <h2 class="text-white font-bold text-sm uppercase tracking-widest">
          Section 4 — Call Details
        </h2>
      </div>
      <div class="px-6 py-5 space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Comments <span class="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            name="comments"
            rows="3"
            placeholder="Notes about the call, customer needs, concerns…"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
          >{values.comments ?? ''}</textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Summary / Follow Up <span class="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            name="summary"
            rows="3"
            placeholder="What is the next action? What was agreed with the customer?"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
          >{values.summary ?? ''}</textarea>
        </div>
      </div>
    </section>

    <!-- Section 5: Follow-up Tracking -->
    <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="bg-brand-navy px-6 py-3">
        <h2 class="text-white font-bold text-sm uppercase tracking-widest">
          Section 5 — Follow-Up Tracking
        </h2>
      </div>
      <div class="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Follow Up Date <span class="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="date"
            name="followUpDate"
            value={values.followUpDate ?? ''}
            min={today()}
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Sales Rep <span class="text-brand-red">*</span>
          </label>
          {#if data.salesReps.length === 0}
            <p class="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              No sales reps found. <a href="/team" class="font-semibold underline">Add one first.</a>
            </p>
          {:else}
            <select
              bind:value={selectedUserId}
              class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy {errors.userId ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
            >
              <option value="">— Select sales rep —</option>
              {#each (data.salesReps ?? []) as rep (rep.id)}
                <option value={rep.id}>{rep.name}</option>
              {/each}
            </select>
          {/if}
          {#if errors.userId}
            <p class="text-brand-red text-xs mt-1">{errors.userId}</p>
          {/if}
        </div>
      </div>
    </section>

    <!-- Buttons -->
    <div class="flex flex-col sm:flex-row gap-3 pb-8">
      <button
        type="button"
        on:click={clearForm}
        class="flex-1 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl py-3 text-sm hover:border-gray-400 hover:bg-gray-50 transition-colors"
      >
        Clear Form
      </button>
      <button
        type="submit"
        disabled={submitting}
        class="flex-1 bg-brand-red text-white font-semibold rounded-xl py-3 text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
      >
        {#if submitting}
          <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Saving…
        {:else}
          Save Report
        {/if}
      </button>
    </div>

  </form>
</main>
