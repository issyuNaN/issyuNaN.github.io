<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Note } from '../types'
import BrandIcon from './BrandIcon.vue'

const props = defineProps<{
  note: Note
}>()

const progress = ref(0)
const sourceDomain = (url: string) => {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  progress.value = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0
}

onMounted(() => {
  updateProgress()
  window.addEventListener('scroll', updateProgress, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress)
})
</script>

<template>
  <div class="note-article-site">
    <div class="reading-progress" :style="{ transform: `scaleX(${progress / 100})` }"></div>

    <header class="notes-header notes-shell">
      <a class="notes-brand" href="#/notes" aria-label="Back to all notes">
        <BrandIcon />
        <span>XUEWEN / NOTES</span>
      </a>
      <a class="article-back" href="#/notes">Archive ↑</a>
    </header>

    <main>
      <article>
        <header class="article-hero notes-shell">
          <div class="article-hero__meta">
            <time :datetime="note.date">{{ note.dateLabel }}</time>
            <span>{{ note.readingTime }} min read</span>
          </div>
          <h1>{{ note.title }}</h1>
          <p v-if="note.summary">{{ note.summary }}</p>
          <a
            v-if="note.source"
            class="article-source"
            :href="note.source.url"
            target="_blank"
            rel="noreferrer"
          >
            <span class="article-source__label">原文出处</span>
            <span class="article-source__copy">
              <strong>{{ note.source.title }}</strong>
              <small>{{ note.source.author }} · {{ sourceDomain(note.source.url) }}</small>
            </span>
            <span class="article-source__action">
              打开原文
              <b aria-hidden="true">↗</b>
            </span>
          </a>
        </header>

        <div class="article-layout notes-shell">
          <aside class="article-toc">
            <span>ON THIS PAGE</span>
            <nav aria-label="Article contents">
              <a
                v-for="heading in note.headings"
                :key="heading.id"
                :class="{ 'is-subheading': heading.level === 3 }"
                :href="`#${heading.id}`"
              >
                {{ heading.text }}
              </a>
            </nav>
          </aside>

          <div class="article-body">
            <div class="article-markdown" v-html="note.html"></div>

            <footer class="article-end">
              <span>END / {{ note.dateLabel }}</span>
              <a href="#/notes">回到全部笔记 ↑</a>
            </footer>
          </div>
        </div>
      </article>
    </main>
  </div>
</template>
