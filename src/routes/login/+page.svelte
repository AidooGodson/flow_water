<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;
  let loading = false;
</script>

<svelte:head>
  <title>Sign In — FLOW Natural Mineral Water</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

  <div class="w-full max-w-sm">

    <!-- Logo -->
    <div class="flex justify-center mb-8">
      <img src="/flow-logo.jpeg" alt="FLOW Natural Mineral Water" class="h-16 object-contain" />
    </div>

    <!-- Card -->
    <div class="bg-white rounded-2xl shadow-md p-8">
      <h1 class="text-xl font-extrabold text-gray-900 mb-1">Sign in</h1>
      <p class="text-sm text-gray-400 mb-6">FLOW Call Report System</p>

      {#if form?.error}
        <div class="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {form.error}
        </div>
      {/if}

      <form
        method="POST"
        action="?/login"
        use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            loading = false;
            await update();
          };
        }}
        class="space-y-4"
      >
        <div>
          <label for="email" class="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label for="password" class="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full bg-brand-navy text-white font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>

    <p class="text-center text-xs text-gray-400 mt-6">
      &copy; {new Date().getFullYear()} FLOW Natural Mineral Water
    </p>
  </div>
</div>
