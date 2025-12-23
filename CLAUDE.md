# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A markdown-based blog built with React, Vite, and Convex. Content is written in markdown files and synced to Convex for real-time delivery. The site features SEO optimization, AI/LLM accessibility, real-time analytics, and theme switching.

## Common Commands

### Development
```bash
npm run dev              # Start Vite dev server (port 5173)
npm run dev:convex       # Start Convex dev backend
npx convex dev           # Initialize and run Convex development environment
```

### Content Syncing
```bash
npm run sync             # Sync content to development deployment
npm run sync:prod        # Sync content to production deployment
```

**Important**: When syncing to production, ensure `.env.production.local` exists with `VITE_CONVEX_URL=https://your-prod-deployment.convex.cloud`. Production sync uses the `SYNC_ENV=production` environment variable.

### Build and Deploy
```bash
npm run build            # Build for production
npm run typecheck        # Run TypeScript type checking
npm run lint             # Run ESLint
npm run deploy           # Sync content + build
npm run deploy:prod      # Deploy Convex functions + sync to production
```

### Netlify Build Command
```bash
npm ci --include=dev && npx convex deploy --cmd 'npm run build'
```

**Note**: `--include=dev` is required because Netlify sets `NODE_ENV=production` which skips devDependencies. Convex is in devDependencies.

## Architecture

### Content Flow

1. **Markdown files** in `content/blog/` and `content/pages/` with frontmatter
2. **Sync script** (`scripts/sync-posts.ts`) reads markdown files and uploads to Convex
3. **Convex backend** stores posts/pages in database tables
4. **React frontend** queries Convex for content and renders with react-markdown
5. **Netlify edge functions** proxy HTTP endpoints for RSS, sitemap, and API

### Two-Tier Deployment System

The app uses separate Convex deployments for dev and production:

| Environment | Config File | Sync Command | Purpose |
|-------------|-------------|--------------|---------|
| Development | `.env.local` | `npm run sync` | Local testing, created by `npx convex dev` |
| Production | `.env.production.local` | `npm run sync:prod` | Live site, manually created |

Both files are gitignored. The sync script (`scripts/sync-posts.ts`) loads the appropriate environment file based on `SYNC_ENV`:

```typescript
// Production sync
const isProduction = process.env.SYNC_ENV === "production";
if (isProduction) {
  dotenv.config({ path: ".env.production.local" });
}
```

### Data Model

**Posts Table** (`convex/schema.ts`):
- `slug` - URL path (unique, indexed)
- `title`, `description`, `content` - Post data
- `date` - ISO date string (indexed for sorting)
- `published` - Boolean flag (indexed for filtering)
- `tags` - Array of strings
- `readTime` - Optional "5 min read" string
- `image` - Optional OG image URL
- `lastSyncedAt` - Sync timestamp

**Pages Table**: Static pages (About, Projects, Contact)
- `slug`, `title`, `content`, `published`
- `order` - Optional number for navigation ordering

**Analytics Tables** (event records pattern to avoid write conflicts):
- `pageViews` - Individual view events with sessionId, path, timestamp
- `activeSessions` - Current visitors with sessionId, currentPath, lastSeen
- `viewCounts` - Legacy counter table (prefer event records)

### Analytics Architecture

The `/stats` page shows real-time visitor data using Convex subscriptions. Key patterns:

**Event Records Pattern**: Page views are stored as individual records (not counters) to prevent write conflicts when multiple users visit simultaneously.

**Heartbeat System**:
- Frontend sends heartbeat every 30 seconds (`HEARTBEAT_INTERVAL_MS` in `src/hooks/usePageTracking.ts`)
- Backend has 10-second dedup window (`HEARTBEAT_DEDUP_MS` in `convex/stats.ts`) to prevent write conflicts
- Sessions expire after 2 minutes without heartbeat (`SESSION_TIMEOUT_MS`)
- Cron job cleans up stale sessions every 5 minutes

**Deduplication**:
- Page views: 30-minute window (same session + path = 1 view)
- Heartbeats: 10-second window on backend, 5-second debounce on frontend
- Frontend uses refs (`isHeartbeatPending`, `lastHeartbeatTime`) to prevent duplicate calls

See `prds/howstatsworks.md` for detailed documentation.

### HTTP Endpoints

Convex HTTP routes (`convex/http.ts`) are proxied by Netlify edge functions (`netlify/edge-functions/`) to work around deployment URL issues:

| Route | Handler | Purpose |
|-------|---------|---------|
| `/rss.xml` | `convex/rss.ts:rssFeed` | RSS with descriptions only |
| `/rss-full.xml` | `convex/rss.ts:rssFullFeed` | RSS with full content for LLMs |
| `/sitemap.xml` | `convex/http.ts` | Dynamic XML sitemap |
| `/api/posts` | `convex/http.ts` | JSON list of all posts |
| `/api/post?slug=xxx` | `convex/http.ts` | Single post JSON or markdown |
| `/meta/post?slug=xxx` | `convex/http.ts` | OG metadata HTML for crawlers |

**Why Netlify edge functions?** Convex HTTP endpoints require the full deployment URL, but the site is hosted on Netlify. Edge functions proxy requests to Convex using `VITE_CONVEX_URL` from environment variables.

### SEO and Discovery

- **Structured data**: JSON-LD in `src/pages/Post.tsx` for rich results
- **Open Graph**: Meta tags in `Post.tsx` and `Home.tsx`
- **Twitter Cards**: Meta tags for social sharing
- **Crawlers**: `public/robots.txt` with AI crawler rules, `public/llms.txt` for agent discovery
- **Bot detection**: `netlify/edge-functions/botMeta.ts` serves static HTML to crawlers

### Theme System

Four themes: Dark, Light, Tan (default), Cloud

**Implementation**:
- `src/context/ThemeContext.tsx` - Context provider with localStorage persistence
- `src/styles/global.css` - CSS variables for each theme (`[data-theme="dark"]`, etc.)
- `src/components/ThemeToggle.tsx` - Cycle button with theme-specific icons

**To change default theme**: Edit `DEFAULT_THEME` in `src/context/ThemeContext.tsx`

## Convex Best Practices

### Preventing Write Conflicts

This codebase follows strict patterns to avoid Convex write conflicts. See `.cursor/rules/convex-write-conflicts.mdc` for comprehensive guidelines.

**Critical patterns**:

1. **Patch directly without reading first** (when possible):
```typescript
// Good - no read before write
await ctx.db.patch(args.id, { content: args.content });

// Bad - read creates conflict window
const doc = await ctx.db.get(args.id);
await ctx.db.patch(args.id, { content: args.content });
```

2. **Make mutations idempotent** (early return when no change needed):
```typescript
const existing = await ctx.db.get(id);
if (existing?.status === "completed") {
  return null; // Already in desired state
}
await ctx.db.patch(id, { status: "completed" });
```

3. **Use event records for high-frequency counters** (avoid updating same document):
```typescript
// Good - individual records
await ctx.db.insert("pageViews", { path, sessionId, timestamp });

// Bad - counter on document (conflicts under load)
await ctx.db.patch(pageId, { views: page.views + 1 });
```

4. **Use indexed queries** to minimize read scope:
```typescript
// Good - filtered by index
const sessions = await ctx.db
  .query("activeSessions")
  .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
  .first();
```

5. **Debounce rapid frontend mutations** (typing, heartbeats):
```typescript
// 300-500ms for user input, 5s for heartbeats
const debouncedUpdate = useCallback(
  debounce((id, content) => updateNote({ id, content }), 500),
  [updateNote]
);
```

6. **Use refs to prevent duplicate calls**:
```typescript
const isHeartbeatPending = useRef(false);
if (isHeartbeatPending.current) return;
isHeartbeatPending.current = true;
try {
  await heartbeatMutation({ sessionId, currentPath });
} finally {
  isHeartbeatPending.current = false;
}
```

### Schema Design

Always define indexes for common query patterns:

```typescript
posts: defineTable({ ... })
  .index("by_slug", ["slug"])           // Unique lookup
  .index("by_date", ["date"])           // Sorting
  .index("by_published", ["published"]) // Filtering
  .searchIndex("search_content", {      // Full-text search
    searchField: "content",
    filterFields: ["published"],
  })
```

### Function Patterns

**Queries**: Read-only, real-time subscriptions
```typescript
export const getAllPosts = query({
  args: {},
  returns: v.array(v.object({ ... })),
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .collect();
  },
});
```

**Mutations**: Write operations, transactional
```typescript
export const syncPostsPublic = mutation({
  args: { posts: v.array(v.object({ ... })) },
  returns: v.object({ created: v.number(), updated: v.number(), deleted: v.number() }),
  handler: async (ctx, args) => {
    // Validate, upsert, track changes
  },
});
```

**Internal Mutations**: Called by crons, no auth
```typescript
export const cleanupStaleSessions = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    // Cleanup logic
  },
});
```

**HTTP Actions**: REST endpoints
```typescript
http.route({
  path: "/api/posts",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const posts = await ctx.runQuery(api.posts.getAllPosts);
    return new Response(JSON.stringify(posts), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});
```

## Content Management

### Writing Blog Posts

Create markdown files in `content/blog/` with required frontmatter:

```markdown
---
title: "Post Title"
description: "Brief description for SEO and previews"
date: "2025-01-15"
slug: "url-slug"
published: true
tags: ["tag1", "tag2"]
readTime: "5 min read"  # Optional, auto-calculated if omitted
image: "/images/og-image.png"  # Optional OG image
---

Your content here...
```

**Slugs**: Must be unique across all posts. Used for URL routing (`yourdomain.com/slug`).

**Images**:
- OG images: 1200x630 recommended, set via `image` frontmatter field
- Inline images: Place in `public/images/`, reference as `![alt text](/images/file.png)`
- Default OG image: Replace `public/images/og-default.svg`

### Creating Static Pages

Create markdown files in `content/pages/`:

```markdown
---
title: "About"
slug: "about"
published: true
order: 1  # Lower numbers appear first in nav
---

Page content...
```

Pages appear as navigation links next to the theme toggle.

### Syncing Workflow

1. Write or edit markdown files in `content/blog/` or `content/pages/`
2. Run `npm run sync` (dev) or `npm run sync:prod` (production)
3. Script reads markdown, parses frontmatter, uploads to Convex
4. Convex triggers real-time updates to connected browsers
5. No rebuild or redeploy needed

**Upsert logic**: Sync compares markdown to database:
- New slug → create post
- Existing slug + changed content → update post
- Database slug not in markdown → delete post

## Code Organization

```
├── content/
│   ├── blog/           # Markdown blog posts
│   └── pages/          # Static pages (About, Projects, etc.)
├── convex/
│   ├── _generated/     # Auto-generated Convex types
│   ├── schema.ts       # Database table definitions
│   ├── posts.ts        # Post queries/mutations
│   ├── pages.ts        # Page queries/mutations
│   ├── stats.ts        # Analytics mutations/queries
│   ├── rss.ts          # RSS feed generation
│   ├── http.ts         # HTTP routes (sitemap, API)
│   ├── crons.ts        # Scheduled jobs
│   └── convex.config.ts
├── netlify/
│   └── edge-functions/ # Proxies for Convex HTTP endpoints
│       ├── api.ts      # /api/* routes
│       ├── rss.ts      # /rss*.xml routes
│       ├── sitemap.ts  # /sitemap.xml
│       └── botMeta.ts  # Crawler detection
├── public/
│   ├── images/         # Static images, OG images
│   ├── robots.txt      # Crawler rules (includes AI crawlers)
│   ├── llms.txt        # AI agent discovery
│   └── favicon.svg
├── scripts/
│   └── sync-posts.ts   # Content sync script
└── src/
    ├── components/
    │   ├── BlogPost.tsx        # Markdown rendering with syntax highlighting
    │   ├── PostList.tsx        # Post list with date sorting
    │   ├── Layout.tsx          # Page wrapper with nav
    │   ├── ThemeToggle.tsx     # Theme cycling button
    │   └── CopyPageDropdown.tsx # Copy to ChatGPT/Claude
    ├── context/
    │   └── ThemeContext.tsx    # Theme state management
    ├── hooks/
    │   └── usePageTracking.ts  # Analytics tracking hook
    ├── pages/
    │   ├── Home.tsx            # Homepage with post list
    │   ├── Post.tsx            # Individual post page
    │   └── Stats.tsx           # Real-time analytics page
    ├── styles/
    │   └── global.css          # CSS variables, theme definitions
    ├── App.tsx                 # Router setup
    └── main.tsx                # React entry point
```

## Frontend Patterns

### Convex Hooks

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// Query - real-time subscription
const posts = useQuery(api.posts.getAllPosts);
if (posts === undefined) return <div>Loading...</div>;

// Mutation - write operation
const syncPosts = useMutation(api.posts.syncPostsPublic);
await syncPosts({ posts: [...] });
```

### Markdown Rendering

`BlogPost.tsx` uses `react-markdown` with:
- `remark-gfm` - GitHub Flavored Markdown (tables, strikethrough)
- `remark-breaks` - Convert line breaks to `<br>`
- `react-syntax-highlighter` - Code block highlighting with Prism

### Theme Context

All pages wrapped in `ThemeProvider`:

```typescript
import { useTheme } from "../context/ThemeContext";

const { theme, setTheme } = useTheme();
// theme: "dark" | "light" | "tan" | "cloud"
```

### Analytics Tracking

Auto-tracked via `usePageTracking` hook in `App.tsx`:

```typescript
import usePageTracking from "./hooks/usePageTracking";

function App() {
  usePageTracking(); // Records views and heartbeats
  return <RouterProvider router={router} />;
}
```

**Session ID**: Persistent UUID in localStorage, no cookies or PII.

## Development Guidelines

### Type Safety

- All Convex functions use validators (`v.string()`, `v.object()`, etc.)
- TypeScript strict mode enabled
- Auto-generated types in `convex/_generated/`

### Performance

- Use indexed queries (never `collect()` without filters)
- Minimize reads before writes (patch directly when possible)
- Use Promise.all for parallel operations
- Debounce high-frequency mutations (typing, heartbeats)

### Security

- Escape HTML in HTTP endpoints (`escapeHtml` function in `convex/http.ts`)
- No user authentication currently (all content is public)
- Session IDs are anonymous UUIDs (no PII)

### Configuration

Site-wide settings in `convex/http.ts`:

```typescript
const SITE_URL = process.env.SITE_URL || "https://markdowncms.netlify.app";
const SITE_NAME = "Markdown Site";
```

Logo and branding in `src/pages/Home.tsx`:

```typescript
const siteConfig = {
  logo: "/images/logo.svg", // null to hide
  title: "Your Name",
  subtitle: "What you do",
};
```

## Common Tasks

### Adding a New Feature

1. **Backend**: Add Convex query/mutation in `convex/[feature].ts`
2. **Schema**: Update `convex/schema.ts` if adding tables/fields
3. **Frontend**: Create component in `src/components/` or page in `src/pages/`
4. **Types**: Run `npx convex dev` to regenerate types
5. **Test**: Verify in dev environment before deploying

### Modifying Analytics

1. **Constants**: Adjust dedup windows in `convex/stats.ts` or `src/hooks/usePageTracking.ts`
2. **Schema**: Modify `pageViews` or `activeSessions` tables in `convex/schema.ts`
3. **UI**: Update `src/pages/Stats.tsx` for display changes
4. **Docs**: Update `prds/howstatsworks.md` if changing behavior

### Changing Themes

1. **Add theme**: Define CSS variables in `src/styles/global.css` under `[data-theme="newtheme"]`
2. **Update type**: Add to `Theme` type in `src/context/ThemeContext.tsx`
3. **Add icon**: Update `ThemeToggle.tsx` with icon for new theme
4. **Cycle order**: Modify `THEME_ORDER` array in `ThemeContext.tsx`

### Debugging Sync Issues

1. Check environment file exists (`.env.local` or `.env.production.local`)
2. Verify `VITE_CONVEX_URL` is set and matches Convex dashboard
3. Run sync with verbose output: `npm run sync` (logs each parsed file)
4. Check Convex dashboard logs for mutation errors
5. Verify frontmatter has required fields (`title`, `slug`, `date`)

## Deployment Checklist

### Netlify Setup

1. Connect repo to Netlify
2. Set build command: `npm ci --include=dev && npx convex deploy --cmd 'npm run build'`
3. Set publish directory: `dist`
4. Add environment variables:
   - `CONVEX_DEPLOY_KEY` - From Convex dashboard > Deploy Key
   - `VITE_CONVEX_URL` - Production Convex URL (e.g., `https://xyz.convex.cloud`)
   - `SITE_URL` - Your Netlify domain (for sitemap/RSS)

### Production Sync

1. Create `.env.production.local`:
   ```
   VITE_CONVEX_URL=https://your-prod-deployment.convex.cloud
   ```
2. Run `npm run sync:prod` to upload content to production
3. Verify posts appear on live site

### First Deploy

1. `npx convex deploy` - Deploy Convex functions to production
2. Note production URL from output
3. Add production URL to `.env.production.local`
4. `npm run sync:prod` - Sync initial content
5. Deploy frontend to Netlify
6. Verify all endpoints work: `/rss.xml`, `/sitemap.xml`, `/api/posts`
