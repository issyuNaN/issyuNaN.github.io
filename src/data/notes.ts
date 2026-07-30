import MarkdownIt from 'markdown-it'
import type { Note, NoteHeading } from '../types'

type FrontMatter = Record<string, string>
type RenderEnvironment = {
  assetDirectory: string
  headings: NoteHeading[]
  headingIds: Map<string, number>
}

const noteFiles = import.meta.glob('../../data/notes/*/main.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const noteAssets = import.meta.glob(
  '../../data/notes/**/*.{avif,gif,jpeg,jpg,png,svg,webp}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, string>

const markdown = new MarkdownIt({
  breaks: false,
  html: false,
  linkify: true,
  typographer: false,
})

const defaultImageRenderer = markdown.renderer.rules.image
  ?? ((tokens, index, options, _environment, renderer) => renderer.renderToken(tokens, index, options))

markdown.renderer.rules.heading_open = (tokens, index, options, environment, renderer) => {
  const env = environment as RenderEnvironment
  const headingToken = tokens[index]
  const inlineToken = tokens[index + 1]
  const text = inlineToken?.content.trim() || 'section'
  const baseId = slugify(text)
  const occurrence = env.headingIds.get(baseId) ?? 0
  const id = occurrence === 0 ? baseId : `${baseId}-${occurrence + 1}`
  const level = Number(headingToken.tag.slice(1))

  env.headingIds.set(baseId, occurrence + 1)
  headingToken.attrSet('id', id)
  if (level === 2 || level === 3) env.headings.push({ id, text, level })

  return renderer.renderToken(tokens, index, options)
}

markdown.renderer.rules.link_open = (tokens, index, options, environment, renderer) => {
  const href = tokens[index].attrGet('href')
  if (href?.startsWith('http://') || href?.startsWith('https://')) {
    tokens[index].attrSet('target', '_blank')
    tokens[index].attrSet('rel', 'noreferrer')
  }
  return renderer.renderToken(tokens, index, options)
}

markdown.renderer.rules.table_open = () => '<div class="article-table"><table>'
markdown.renderer.rules.table_close = () => '</table></div>'

markdown.renderer.rules.image = (tokens, index, options, environment, renderer) => {
  const env = environment as RenderEnvironment
  const token = tokens[index]
  const source = token.attrGet('src')

  if (source && isRelativeAsset(source)) {
    const assetPath = normalizePath(`${env.assetDirectory}/${source.replace(/^\.\//, '')}`)
    const resolvedSource = noteAssets[assetPath]
    if (resolvedSource) token.attrSet('src', resolvedSource)
  }

  token.attrSet('loading', 'lazy')
  token.attrSet('decoding', 'async')
  const alt = markdown.utils.escapeHtml(token.content)
  const image = defaultImageRenderer(tokens, index, options, environment, renderer)
  return `<span class="article-figure">${image}<span class="article-figure__caption">${alt}</span></span>`
}

const parseFrontMatter = (raw: string) => {
  const normalized = raw.replace(/^\uFEFF/, '')
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { attributes: {} as FrontMatter, body: normalized }

  const attributes: FrontMatter = {}
  match[1].split(/\r?\n/).forEach((line) => {
    const separator = line.indexOf(':')
    if (separator < 0) return
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
    attributes[key] = stripQuotes(value)
  })

  return {
    attributes,
    body: normalized.slice(match[0].length),
  }
}

const stripQuotes = (value: string) => {
  const quote = value[0]
  if ((quote === '"' || quote === "'") && value.at(-1) === quote) return value.slice(1, -1)
  return value
}

const parseList = (value = '') => {
  const content = value.startsWith('[') && value.endsWith(']')
    ? value.slice(1, -1)
    : value
  return content
    .split(',')
    .map((item) => stripQuotes(item.trim()))
    .filter(Boolean)
}

const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-') || 'section'

const normalizePath = (value: string) => value.replace(/\\/g, '/').replace(/\/\.\//g, '/')
const isRelativeAsset = (value: string) => !/^(?:[a-z]+:|\/|#)/i.test(value)

const createNote = (filePath: string, raw: string): Note => {
  const { attributes, body } = parseFrontMatter(raw)
  const date = attributes.date || '1970-01-01'
  const environment: RenderEnvironment = {
    assetDirectory: filePath.slice(0, filePath.lastIndexOf('/')),
    headings: [],
    headingIds: new Map(),
  }
  const html = markdown.render(body, environment)

  return {
    slug: attributes.slug || slugify(attributes.title || filePath),
    title: attributes.title || 'Untitled note',
    summary: attributes.summary || '',
    date,
    dateLabel: attributes.dateLabel || date.replaceAll('-', '.'),
    readingTime: Number(attributes.readingTime) || Math.max(1, Math.ceil(body.length / 700)),
    tags: parseList(attributes.tags),
    source: attributes.sourceUrl
      ? {
          title: attributes.sourceTitle || 'Original article',
          author: attributes.sourceAuthor || 'Unknown author',
          url: attributes.sourceUrl,
        }
      : undefined,
    html,
    headings: environment.headings,
  }
}

export const notes = Object.entries(noteFiles)
  .map(([filePath, raw]) => createNote(filePath, raw))
  .sort((a, b) => b.date.localeCompare(a.date))
