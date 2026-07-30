<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BrandIcon from './components/BrandIcon.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import HeroSection from './components/HeroSection.vue'
import NewsSection from './components/NewsSection.vue'
import NoteArticle from './components/NoteArticle.vue'
import NotesIndex from './components/NotesIndex.vue'
import OfflineSection from './components/OfflineSection.vue'
import ProjectsSection from './components/ProjectsSection.vue'
import PublicationsSection from './components/PublicationsSection.vue'
import SiteHeader from './components/SiteHeader.vue'
import { notes } from './data/notes'

const routeHash = ref(window.location.hash)
let revealObserver: IntersectionObserver | null = null

const noteSlug = computed(() => {
  const match = routeHash.value.match(/^#\/notes\/([^/?#]+)/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
})
const currentNote = computed(() => notes.find((note) => note.slug === noteSlug.value))
const isNotesIndex = computed(() => routeHash.value === '#/notes' || (noteSlug.value && !currentNote.value))
const isNotesRoute = computed(() => isNotesIndex.value || Boolean(currentNote.value))

const syncRoute = () => {
  routeHash.value = window.location.hash
}

const observeHomeSections = () => {
  revealObserver?.disconnect()
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        revealObserver?.unobserve(entry.target)
      }
    })
  }, { threshold: 0.08 })

  document.querySelectorAll('.reveal-item').forEach((item) => revealObserver?.observe(item))
}

onMounted(() => {
  window.addEventListener('hashchange', syncRoute)
  if (!isNotesRoute.value) observeHomeSections()
})

watch(routeHash, (_, previousHash) => {
  const movingBetweenNotes = previousHash.startsWith('#/notes') && routeHash.value.startsWith('#/notes')
  if (isNotesRoute.value && movingBetweenNotes) {
    window.scrollTo({ top: 0, behavior: 'auto' })
  } else if (!isNotesRoute.value) {
    nextTick(() => {
      observeHomeSections()
      if (previousHash.startsWith('#/notes')) {
        const target = document.querySelector(routeHash.value || '#home')
        target?.scrollIntoView({ behavior: 'auto' })
      }
    })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', syncRoute)
  revealObserver?.disconnect()
})
</script>

<template>
  <NoteArticle v-if="currentNote" :key="currentNote.slug" :note="currentNote" />
  <NotesIndex v-else-if="isNotesIndex" />

  <div v-else class="site-frame">
    <SiteHeader />

    <main>
      <HeroSection />
      <NewsSection />
      <ExperienceSection />
      <PublicationsSection />
      <ProjectsSection />
      <OfflineSection />
    </main>

    <footer class="site-footer page-shell">
      <div>
        <a
          class="footer-notes-entry brand-mark"
          href="#/notes"
          aria-label="Open learning notes"
          title="Learning notes"
        >
          <BrandIcon />
        </a>
        <p>© 2026 Xuewen ZHOU.</p>
      </div>
      <p>Last updated: July 2026</p>
      <a class="back-to-top" href="#home">Back to top ↑</a>
    </footer>
  </div>
</template>
