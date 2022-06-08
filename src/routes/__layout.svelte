<script>
  import '../app.css'
  import '../prism.css'
  import 'focus-visible'
  import MoonIcon from 'heroicons-svelte/solid/MoonIcon.svelte'
  import SunIcon from 'heroicons-svelte/solid/SunIcon.svelte'
  import { browser } from '$app/env'
  import { name } from '$lib/info'
  import EmailIcon from '$lib/components/EmailIcon.svelte'
  import GithubIcon from '$lib/components/GithubIcon.svelte';

  let prefersLight = browser ? Boolean(JSON.parse(localStorage.getItem('prefersLight'))) : false

  function toggleLightDarkMode() {
    prefersLight = !prefersLight
    localStorage.setItem('prefersLight', prefersLight.toString())
    if (prefersLight) {
      document.querySelector('html').classList.remove('dark')
    } else {
      document.querySelector('html').classList.add('dark')
    }
  }
</script>

<div class="flex flex-col min-h-screen">
  <div class="mx-auto flex flex-col flex-grow w-full max-w-4xl">
    <div class="flex h-16 px-4 py-2 justify-between items-center">
      <h2
        class="!text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500 dark:from-violet-500 dark:to-pink-500"
      >
        <a class="text-lg sm:text-2xl font-bold" rel="nofollow noopener noreferrer" target="_blank" href="/">
          {name}
        </a>
        |
        <a rel="nofollow noopener noreferrer" target="_blank" href="https://www.kvistsolutions.com/" class="ml-0 dark:text-white text-gray-800 text-xs font-bold group">
          CTO at 
          <span class="group-hover:underline">
            Kvist Solutions
          </span>
        </a>
      </h2>
      <div class="flex items-center">
        <div class="dark:text-white text-black flex items-center gap-3 mr-6">
          <a class="text-xs" rel="nofollow noopener noreferrer" target="_blank" href="https://github.com/MathiasWP" title="My GitHub profile">
            <GithubIcon />
          </a>
          <a class="text-xs" href="mailto:picker@kvistsolutions.com" title="Email me at picker@kvistsolutions.com">
            <EmailIcon />
          </a>
        </div>
        <button
          type="button"
          role="switch"
          aria-label="Toggle Dark Mode"
          aria-checked={!prefersLight}
          class="h-4 w-4 sm:h-8 sm:w-8 sm:p-1"
          on:click={toggleLightDarkMode}
        >
          {#if browser}
            {#if prefersLight}
              <MoonIcon class="text-slate-500" />
            {:else}
              <SunIcon class="text-slate-400" />
            {/if}
          {/if}
        </button>
      </div>
    </div>
    <main
      class="prose prose-slate prose-sm sm:prose sm:prose-slate sm:prose-lg sm:max-w-none dark:prose-invert flex flex-col w-full flex-grow py-4 px-4"
    >
      <slot />
    </main>
  </div>
</div>
