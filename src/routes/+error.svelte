<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Error — FLOW Natural Mineral Water</title>
</svelte:head>

<div class="bg-brand-navy text-white py-5 px-6">
  <div class="max-w-2xl mx-auto flex items-center gap-3">
    <span class="text-2xl">⚠️</span>
    <div>
      <h1 class="text-lg font-bold tracking-wide">Something went wrong</h1>
      <p class="text-white/60 text-xs mt-0.5">
        {$page.status} — {$page.error?.message ?? 'Unexpected error'}
      </p>
    </div>
  </div>
</div>

<main class="flex-1 flex flex-col items-center justify-center py-24 text-center px-4">
  <span class="text-6xl mb-5">😕</span>
  <p class="text-gray-700 font-bold text-xl mb-2">
    {$page.status === 404 ? 'Page not found' : 'Unexpected error'}
  </p>
  <p class="text-gray-400 text-sm mb-8 max-w-sm leading-relaxed">
    {$page.status === 404
      ? "The page you're looking for doesn't exist."
      : 'Something went wrong on our end. Please try again.'}
  </p>
  <a
    href="/"
    class="bg-brand-navy text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
  >
    ← Back to Home
  </a>
</main>
