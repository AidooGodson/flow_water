<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let showForm = false;
  let removeConfirmId: string | null = null;

  $: members = data.members ?? [];

  $: if (form?.success) {
    showForm = false;
  }

  const roleBadge: Record<string, string> = {
    manager:   'bg-brand-navy/10 text-brand-navy',
    sales_rep: 'bg-emerald-100 text-emerald-800',
  };

  const roleLabel: Record<string, string> = {
    manager:   'Manager',
    sales_rep: 'Sales Rep',
  };
</script>

<svelte:head>
  <title>Team — FLOW Natural Mineral Water</title>
</svelte:head>

<!-- Page header -->
<div class="bg-brand-navy text-white py-5 px-6">
  <div class="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div class="flex items-center gap-3">
      <span class="text-2xl">👥</span>
      <div>
        <h1 class="text-lg font-bold tracking-wide">Team Members</h1>
        <p class="text-white/60 text-xs mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
    <button
      on:click={() => (showForm = !showForm)}
      class="bg-brand-red hover:opacity-90 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-opacity self-start sm:self-auto"
    >
      {showForm ? '✕ Cancel' : '+ Add Member'}
    </button>
  </div>
</div>

<main class="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-5">

  <!-- Add member form -->
  {#if showForm}
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="bg-brand-navy/5 border-b border-gray-100 px-6 py-3">
        <h2 class="text-sm font-bold text-brand-navy uppercase tracking-widest">New Team Member</h2>
      </div>
      <form
        method="POST"
        action="?/create"
        use:enhance
        class="px-6 py-5"
      >
        {#if form?.errors?.serverError}
          <div class="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {form.errors.serverError}
          </div>
        {/if}

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span class="text-brand-red">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form?.values?.name ?? ''}
              placeholder="e.g. Kofi Mensah"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy {form?.errors?.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
            />
            {#if form?.errors?.name}
              <p class="text-brand-red text-xs mt-1">{form.errors.name}</p>
            {/if}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email <span class="text-brand-red">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form?.values?.email ?? ''}
              placeholder="e.g. kofi@flowwater.com"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy {form?.errors?.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
            />
            {#if form?.errors?.email}
              <p class="text-brand-red text-xs mt-1">{form.errors.email}</p>
            {/if}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={form?.values?.role ?? 'sales_rep'}
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
            >
              <option value="sales_rep">Sales Rep</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        </div>

        <div class="mt-4 flex justify-end">
          <button
            type="submit"
            class="bg-brand-navy text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Add Member
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Team list -->
  {#if members.length === 0}
    <div class="flex flex-col items-center justify-center py-24 text-center">
      <span class="text-6xl mb-4">👥</span>
      <p class="text-gray-700 font-bold text-xl mb-2">No team members yet</p>
      <p class="text-gray-400 text-sm mb-6">Add your first sales rep to get started.</p>
      <button
        on:click={() => (showForm = true)}
        class="bg-brand-red text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
      >
        + Add First Member
      </button>
    </div>
  {:else}
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gray-50">
          <tr>
            {#each ['Member', 'Email', 'Role', 'Joined', ''] as h, i (i)}
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          {#each members as member (member.id)}
            <tr class="hover:bg-gray-50 transition-colors">
              <!-- Avatar + name -->
              <td class="px-5 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
                    <span class="text-white text-sm font-bold">{member.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <p class="text-sm font-semibold text-gray-900">{member.name}</p>
                </div>
              </td>
              <td class="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{member.email}</td>
              <td class="px-5 py-4 whitespace-nowrap">
                <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold {roleBadge[member.role] ?? 'bg-gray-100 text-gray-700'}">
                  {roleLabel[member.role] ?? member.role}
                </span>
              </td>
              <td class="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">
                {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </td>
              <td class="px-5 py-4 whitespace-nowrap text-right">
                {#if removeConfirmId === member.id}
                  <div class="flex items-center justify-end gap-1.5">
                    <span class="text-xs text-brand-red font-semibold">Remove?</span>
                    <form method="POST" action="?/remove" use:enhance={() => {
                      return ({ update }) => {
                        members = members.filter(m => m.id !== member.id);
                        removeConfirmId = null;
                        update({ reset: false });
                      };
                    }}>
                      <input type="hidden" name="id" value={member.id} />
                      <button type="submit" class="text-xs bg-brand-red hover:opacity-80 text-white px-2 py-1 rounded-md font-semibold transition-opacity">Yes</button>
                    </form>
                    <button
                      on:click={() => (removeConfirmId = null)}
                      class="text-xs border border-gray-300 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
                    >No</button>
                  </div>
                {:else}
                  <button
                    on:click={() => (removeConfirmId = member.id)}
                    class="text-xs text-gray-400 hover:text-brand-red transition-colors font-medium"
                  >Remove</button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

</main>
