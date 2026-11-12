import { useEffect, useState } from 'react'
import { profile } from '../config'
import { curatedProjects, type Project } from '../data/projects'

interface GhRepo {
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  homepage: string | null
  created_at: string
  pushed_at: string
  fork: boolean
  archived: boolean
}

interface GhUser {
  public_repos: number
  followers: number
  following: number
  created_at: string
  bio: string | null
}

export interface GitHubData {
  projects: Project[]
  user: GhUser | null
  live: boolean
}

const CACHE_KEY = `gh-cache-${profile.githubUser}`
const CACHE_TTL = 1000 * 60 * 30

function readCache(): { at: number; repos: GhRepo[]; user: GhUser } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Date.now() - parsed.at < CACHE_TTL ? parsed : null
  } catch {
    return null
  }
}

function writeCache(repos: GhRepo[], user: GhUser) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos, user }))
  } catch {
    /* storage unavailable: ignore */
  }
}

function prettify(name: string) {
  return name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function merge(repos: GhRepo[]): Project[] {
  const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]))
  const merged = curatedProjects
    // drop curated repos that were deleted or made private
    .filter((p) => byName.has(p.repo.toLowerCase()))
    .map((p) => {
      const r = byName.get(p.repo.toLowerCase())!
      return {
        ...p,
        stars: r.stargazers_count,
        updated: r.pushed_at.slice(0, 10),
        created: r.created_at.slice(0, 10),
        live: p.live ?? (r.homepage || undefined),
      }
    })

  const known = new Set(curatedProjects.map((p) => p.repo.toLowerCase()))
  const extra: Project[] = repos
    .filter((r) => !known.has(r.name.toLowerCase()) && !r.fork && !r.archived && r.name.toLowerCase() !== profile.githubUser.toLowerCase())
    .map((r) => ({
      repo: r.name,
      title: prettify(r.name),
      tagline: r.description || 'Fresh from GitHub',
      description: r.description || 'A newer project. Open the repository for the full details.',
      highlights: [],
      tech: r.language ? [r.language] : [],
      category: r.language === 'TypeScript' ? 'Web Apps' : 'JavaScript',
      language: r.language || 'Other',
      live: r.homepage || undefined,
      created: r.created_at.slice(0, 10),
      updated: r.pushed_at.slice(0, 10),
      stars: r.stargazers_count,
      auto: true,
    }))

  return [...extra, ...merged]
}

export function useGitHub(): GitHubData {
  const [data, setData] = useState<GitHubData>({ projects: curatedProjects, user: null, live: false })

  useEffect(() => {
    const cached = readCache()
    if (cached) {
      setData({ projects: merge(cached.repos), user: cached.user, live: true })
      return
    }
    const ctrl = new AbortController()
    const base = `https://api.github.com/users/${profile.githubUser}`
    Promise.all([
      fetch(`${base}/repos?per_page=100&sort=pushed`, { signal: ctrl.signal }).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
      fetch(base, { signal: ctrl.signal }).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    ])
      .then(([repos, user]: [GhRepo[], GhUser]) => {
        writeCache(repos, user)
        setData({ projects: merge(repos), user, live: true })
      })
      .catch(() => {
        /* rate-limited or offline: keep curated fallback */
      })
    return () => ctrl.abort()
  }, [])

  return data
}
