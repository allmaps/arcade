<script lang="ts">
  import { Logo } from '@allmaps/ui'

  import Diamonds from '$lib/components/Diamonds.svelte'
</script>

<div class="relative contents">
  <svg
    class="absolute top-1/8s w-full"
    viewBox="-20 -20 240 140"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <path id="title-path" d="M0,100C0,44.8,44.8,0,100,0s100,44.8,100,100" stroke="black" />
    </defs>
    <text class="font-bold fill-white text-2xl">
      <textPath startOffset="50%" text-anchor="middle" href="#title-path">Allmaps Arcade</textPath>
    </text>
  </svg>
  <div class="w-1/4">
    <Logo />
  </div>

  <div class="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden">
    <Diamonds />
  </div>
</div>
