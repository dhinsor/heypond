---
title: "How to Publish a Blog Post"
description: "A quick guide to writing and publishing markdown blog posts using Cursor after your blog is set up."
date: "2025-01-17"
slug: "how-to-publish"
published: true
tags: ["tutorial", "markdown", "cursor", "publishing"]
readTime: "3 min read"
---

# How to Publish a Blog Post

Your blog is set up. Now you want to publish. This guide walks through writing a markdown post and syncing it to your live site using Cursor.

## Create a New Post

In Cursor, create a new file in `content/blog/`:

```
content/blog/my-new-post.md
```

The filename can be anything. The URL comes from the `slug` field in the frontmatter.

## Add Frontmatter

Every post starts with frontmatter between triple dashes:

```markdown
---
title: "Your Post Title"
description: "A one-sentence summary for SEO and social sharing"
date: "2025-01-17"
slug: "your-post-url"
published: true
tags: ["tag1", "tag2"]
readTime: "5 min read"
---
```

| Field         | Required | What It Does                        |
| ------------- | -------- | ----------------------------------- |
| `title`       | Yes      | Displays as the post heading        |
| `description` | Yes      | Shows in search results and sharing |
| `date`        | Yes      | Publication date (YYYY-MM-DD)       |
| `slug`        | Yes      | Becomes the URL path                |
| `published`   | Yes      | Set `true` to show, `false` to hide |
| `tags`        | Yes      | Topic labels for the post           |
| `readTime`    | No       | Estimated reading time              |
| `image`       | No       | Open Graph image for social sharing |

## Write Your Content

Below the frontmatter, write your post in markdown:

```markdown
# Your Post Title

Opening paragraph goes here.

## First Section

Content for the first section.

### Subheading

More details here.

- Bullet point one
- Bullet point two

## Code Example

\`\`\`typescript
const greeting = "Hello, world";
console.log(greeting);
\`\`\`

## Conclusion

Wrap up your thoughts.
```

## Sync to Convex

Open Cursor's terminal and run:

```bash
npm run sync
```

This reads all markdown files in `content/blog/`, parses the frontmatter, and uploads them to your Convex database.

You should see output like:

```
Syncing posts to Convex...
Synced: my-new-post
Done! Synced 1 post(s).
```

Your post is now live. No rebuild. No redeploy. The site updates in real time.

## Publish to Production

If you have separate dev and prod Convex deployments, sync to production.

**First-time setup:** Create `.env.production.local` in your project root:

```
VITE_CONVEX_URL=https://your-prod-deployment.convex.cloud
```

Get your production URL from the [Convex Dashboard](https://dashboard.convex.dev) by selecting your project and switching to the Production deployment.

**Sync to production:**

```bash
npm run sync:prod
```

### Environment Files

| File                    | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `.env.local`            | Dev deployment (created by `npx convex dev`) |
| `.env.production.local` | Prod deployment (create manually)            |

Both files are gitignored.

## Quick Workflow in Cursor

Here is the full workflow:

1. **Create file**: `content/blog/my-post.md`
2. **Add frontmatter**: Title, description, date, slug, published, tags
3. **Write content**: Markdown with headings, lists, code blocks
4. **Sync**: Run `npm run sync` in terminal
5. **View**: Open your site and navigate to `/your-slug`

## Tips

**Draft posts**: Set `published: false` to save a post without showing it on the site.

**Update existing posts**: Edit the markdown file and run `npm run sync` again. Changes appear instantly.

**Delete posts**: Remove the markdown file from `content/blog/` and run sync. The post will be removed from the database.

**Unique slugs**: Each post needs a unique slug. The sync will fail if two posts share the same slug.

**Date format**: Use YYYY-MM-DD format for the date field.

## Adding Images

Place images in `public/images/` and reference them in your post:

```markdown
![Screenshot of the dashboard](/images/dashboard.png)
```

For the Open Graph image (social sharing), add to frontmatter:

```yaml
image: "/images/my-post-og.png"
```

## Checking Your Post

After syncing, verify your post:

1. Open your local dev server: `http://localhost:5173`
2. Your post should appear in the post list
3. Click through to check formatting
4. Test code blocks and images render correctly

## Adding Static Pages

You can also create static pages like About, Projects, or Contact. These appear as navigation links in the top right.

1. Create a file in `content/pages/`:

```
content/pages/about.md
```

2. Add frontmatter:

```markdown
---
title: "About"
slug: "about"
published: true
order: 1
---

Your page content here...
```

3. Run `npm run sync`

The page will appear in the navigation. Use `order` to control the display sequence (lower numbers appear first).

## Summary

Publishing is three steps:

1. Write markdown in `content/blog/` or `content/pages/`
2. Run `npm run sync`
3. Done

The Convex database updates immediately. Your site reflects changes in real time. No waiting for builds or deployments.
