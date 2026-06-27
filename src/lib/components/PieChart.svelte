<script lang="ts">
  export let data: { name: string; value: number }[];
  export let colors: string[] = ['#CC1515', '#1E1B72', '#FF9800', '#9C27B0', '#00BCD4'];

  const CX = 100, CY = 100, R = 80;

  $: total = data.reduce((s, d) => s + d.value, 0);

  $: slices = (() => {
    if (total === 0) return [];
    let angle = -Math.PI / 2;
    return data.map((d, i) => {
      const sweep = (d.value / total) * 2 * Math.PI;
      const x1 = CX + R * Math.cos(angle);
      const y1 = CY + R * Math.sin(angle);
      angle += sweep;
      const x2 = CX + R * Math.cos(angle);
      const y2 = CY + R * Math.sin(angle);
      const large = sweep > Math.PI ? 1 : 0;
      return {
        path: `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`,
        color: colors[i % colors.length],
        name: d.name,
        value: d.value,
        percent: Math.round((d.value / total) * 100),
      };
    });
  })();
</script>

{#if total === 0}
  <div class="flex items-center justify-center h-48 text-gray-300 text-sm">No data to display</div>
{:else}
  <div class="flex flex-col items-center gap-4">
    <svg viewBox="0 0 200 200" class="w-48 h-48">
      {#each slices as slice}
        <path d={slice.path} fill={slice.color} class="hover:opacity-80 transition-opacity" />
      {/each}
    </svg>
    <div class="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
      {#each slices as slice}
        <div class="flex items-center gap-1.5 text-xs text-gray-600">
          <span class="w-3 h-3 rounded-sm flex-shrink-0" style="background-color: {slice.color}"></span>
          {slice.name} {slice.percent}%
        </div>
      {/each}
    </div>
  </div>
{/if}
