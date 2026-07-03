<script lang="ts">
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';

  const links = [
    { label: 'Home',      href: '/'          },
    { label: 'Reports',   href: '/reports'   },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Team',      href: '/team'      },
  ];

  let open = false;

  $: user = $page.data.session?.user;
  $: initials = user?.email?.slice(0, 2).toUpperCase() ?? '??';
</script>

<nav class="bg-white shadow-sm relative z-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-8">
    <div class="flex items-center justify-between h-20">

      <a href="/" on:click={() => (open = false)}>
        <img
          src="/flow-logo.jpeg"
          alt="FLOW Natural Mineral Water"
          class="object-contain w-40 sm:w-64 md:w-72 h-14"
        />
      </a>

      <div class="hidden sm:flex items-center gap-8 text-sm font-semibold">
        {#each links as { label, href }}
          {@const active = $page.url.pathname === href}
          <a
            {href}
            class="pb-0.5 border-b-2 transition-colors {active
              ? 'text-gray-900 border-brand-red'
              : 'text-gray-500 border-transparent hover:text-gray-800'}"
          >
            {label}
          </a>
        {/each}

        {#if user}
          <div class="flex items-center gap-3 pl-4 border-l border-gray-100">
            <div class="w-8 h-8 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <form method="POST" action="/login?/logout" use:enhance>
              <button type="submit" class="text-xs text-gray-400 hover:text-brand-red transition-colors font-semibold">
                Sign out
              </button>
            </form>
          </div>
        {/if}
      </div>

      <button
        class="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        on:click={() => (open = !open)}
        aria-label="Toggle menu"
      >
        {#if open}
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else}
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        {/if}
      </button>

    </div>
  </div>

  {#if open}
    <div class="sm:hidden border-t border-gray-100 bg-white shadow-lg absolute w-full left-0">
      {#each links as { label, href }}
        {@const active = $page.url.pathname === href}
        <a
          {href}
          on:click={() => (open = false)}
          class="flex items-center px-6 py-4 text-sm font-semibold border-b border-gray-50 transition-colors {active
            ? 'bg-brand-navy text-white'
            : 'text-gray-700 hover:bg-gray-50'}"
        >
          {label}
        </a>
      {/each}

      {#if user}
        <div class="px-6 py-4 flex items-center justify-between border-t border-gray-100">
          <span class="text-xs text-gray-400 truncate max-w-[180px]">{user.email}</span>
          <form method="POST" action="/login?/logout" use:enhance>
            <button type="submit" class="text-xs text-brand-red font-semibold">Sign out</button>
          </form>
        </div>
      {/if}
    </div>
  {/if}
</nav>
