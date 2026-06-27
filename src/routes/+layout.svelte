<script>
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import { navigating } from '$app/stores';
</script>

{#if $navigating}
  <div class="fixed top-0 left-0 right-0 z-50 h-1 bg-brand-navy/10">
    <div class="h-full bg-brand-navy animate-pulse w-full"></div>
  </div>
{/if}

<div class="min-h-screen flex flex-col bg-gray-50">
  <Navbar />
  <slot />
  <footer class="bg-brand-navy text-white/70 text-center text-xs py-4 mt-auto">
    &copy; {new Date().getFullYear()} FLOW Natural Mineral Water. All rights reserved.
  </footer>
</div>
