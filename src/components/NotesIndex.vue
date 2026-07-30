<script setup lang="ts">
import { computed, ref } from 'vue'
import { notes } from '../data/notes'
import BrandIcon from './BrandIcon.vue'

const activeSubject = ref<string | null>(null)
const subjects = [...new Set(notes.flatMap((note) => note.tags))].map((label) => ({
  label,
  count: notes.filter((note) => note.tags.includes(label)).length,
}))
const visibleNotes = computed(() => (
  activeSubject.value
    ? notes.filter((note) => note.tags.includes(activeSubject.value as string))
    : notes
))

const selectSubject = (subject: string | null) => {
  activeSubject.value = activeSubject.value === subject ? null : subject
}
</script>

<template>
  <div class="notes-site">
    <header class="notes-header notes-shell">
      <a class="notes-brand" href="#home" aria-label="Back to portfolio">
        <BrandIcon />
        <span>XUEWEN / NOTES</span>
      </a>
      <span class="notes-issue">N° {{ String(notes.length).padStart(3, '0') }}</span>
    </header>

    <main>
      <section class="notes-hero notes-shell">
        <p class="notes-kicker">技术学习记录</p>
        <h1>Notes</h1>
        <div class="notes-rule" aria-hidden="true">
          <span></span>
          <i></i>
        </div>
      </section>

      <section class="notes-archive notes-shell">
        <div class="notes-archive-main">
          <div class="notes-archive-toolbar">
            <h2>Archive</h2>
            <span>{{ String(visibleNotes.length).padStart(2, '0') }} entries</span>
          </div>

          <div class="notes-list" aria-live="polite">
            <article
              v-for="(note, index) in visibleNotes"
              :key="note.slug"
              class="note-row"
            >
              <a :href="`#/notes/${note.slug}`">
                <div class="note-row__index">{{ String(index + 1).padStart(2, '0') }}</div>
                <div class="note-row__body">
                  <div class="note-row__meta">
                    <time :datetime="note.date">{{ note.dateLabel }}</time>
                  </div>
                  <h3>{{ note.title }}</h3>
                  <p v-if="note.summary">{{ note.summary }}</p>
                  <div class="note-row__tags">
                    <span v-for="tag in note.tags" :key="tag">{{ tag }}</span>
                  </div>
                </div>
                <span class="note-row__read">
                  {{ note.readingTime }} MIN
                  <b aria-hidden="true">↗</b>
                </span>
              </a>
            </article>
          </div>
        </div>

        <aside class="notes-aside">
          <div>
            <span class="notes-aside__label">INDEX / 01</span>
            <p>{{ notes.length }} entries<br />since July 2026</p>
          </div>
          <div>
            <span class="notes-aside__label">SUBJECTS</span>
            <ul class="subject-filter">
              <li>
                <button
                  type="button"
                  :class="{ 'is-active': activeSubject === null }"
                  :aria-pressed="activeSubject === null"
                  @click="selectSubject(null)"
                >
                  <span>All subjects</span>
                  <b>{{ notes.length }}</b>
                </button>
              </li>
              <li v-for="subject in subjects" :key="subject.label">
                <button
                  type="button"
                  :class="{ 'is-active': activeSubject === subject.label }"
                  :aria-pressed="activeSubject === subject.label"
                  @click="selectSubject(subject.label)"
                >
                  <span>{{ subject.label }}</span>
                  <b>{{ subject.count }}</b>
                </button>
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </main>

    <footer class="notes-footer notes-shell">
      <p>Notes by Xuewen ZHOU</p>
      <a href="#home">Back to portfolio ↑</a>
    </footer>
  </div>
</template>
