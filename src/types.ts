export interface LinkItem {
  label: string
  url: string
  icon: 'github' | 'x' | 'scholar' | 'mail' | 'file' | 'arrow'
}

export interface Publication {
  id: number
  type: 'conference' | 'journal'
  title: string
  authors: string
  highlightAuthor?: string
  venue: string
  year: number
  summary: string
  image: string
  highlight?: string
  links: { label: string; url: string }[]
}

export interface Project {
  id: number
  title: string
  period: string
  description: string
  image: string
  tags: string[]
  links: { label: string; url: string }[]
}

export interface ExperienceItem {
  period: string
  role: string
  organization: string
  description: string
  type: 'education' | 'research' | 'internship'
}

export interface NewsItem {
  id: number
  date: string
  dateLabel: string
  text: string
  href?: string
}

export interface OfflineItem {
  icon: string
  text: string
}

export interface NoteHeading {
  id: string
  text: string
  level: number
}

export interface Note {
  slug: string
  title: string
  summary: string
  date: string
  dateLabel: string
  readingTime: number
  tags: string[]
  source?: {
    title: string
    author: string
    url: string
  }
  html: string
  headings: NoteHeading[]
}
