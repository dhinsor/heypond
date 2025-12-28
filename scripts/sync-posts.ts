import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";

// Load environment variables based on SYNC_ENV
const isProduction = process.env.SYNC_ENV === "production";

if (isProduction) {
  // Production: load .env.production.local first
  dotenv.config({ path: ".env.production.local" });
  console.log("Syncing to PRODUCTION deployment...\n");
} else {
  // Development: load .env.local
  dotenv.config({ path: ".env.local" });
}
dotenv.config();

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");
const PAGES_DIR = path.join(process.cwd(), "content", "pages");

interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  slug: string;
  published: boolean;
  tags: string[];
  readTime?: string;
  image?: string; // Header/OG image URL
}

interface ParsedPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  published: boolean;
  tags: string[];
  readTime?: string;
  image?: string; // Header/OG image URL
}

// Page frontmatter (for static pages like About, Projects, Contact)
interface PageFrontmatter {
  title: string;
  navTitle?: string; // Title for navigation bar
  description?: string; // Page description
  slug: string;
  published: boolean;
  order?: number; // Display order in navigation
}

interface ParsedPage {
  slug: string;
  title: string;
  navTitle?: string;
  description?: string;
  content: string;
  published: boolean;
  order?: number;
}

// Calculate reading time based on word count
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

// Parse a single markdown file
function parseMarkdownFile(filePath: string): ParsedPost | null {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const frontmatter = data as Partial<PostFrontmatter>;

    // Validate required fields
    if (!frontmatter.title || !frontmatter.date || !frontmatter.slug) {
      console.warn(`Skipping ${filePath}: missing required frontmatter fields`);
      return null;
    }

    return {
      slug: frontmatter.slug,
      title: frontmatter.title,
      description: frontmatter.description || "",
      content: content.trim(),
      date: frontmatter.date,
      published: frontmatter.published ?? true,
      tags: frontmatter.tags || [],
      readTime: frontmatter.readTime || calculateReadTime(content),
      image: frontmatter.image, // Header/OG image URL
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

// Get all markdown files from the content directory
function getAllMarkdownFiles(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log(`Creating content directory: ${CONTENT_DIR}`);
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(CONTENT_DIR);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(CONTENT_DIR, file));
}

// Parse a single page markdown file
function parsePageFile(filePath: string): ParsedPage | null {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const frontmatter = data as Partial<PageFrontmatter>;

    // Validate required fields
    if (!frontmatter.title || !frontmatter.slug) {
      console.warn(
        `Skipping page ${filePath}: missing required frontmatter fields`,
      );
      return null;
    }

    return {
      slug: frontmatter.slug,
      title: frontmatter.title,
      navTitle: frontmatter.navTitle,
      description: frontmatter.description,
      content: content.trim(),
      published: frontmatter.published ?? true,
      order: frontmatter.order,
    };
  } catch (error) {
    console.error(`Error parsing page ${filePath}:`, error);
    return null;
  }
}

// Get all page markdown files from the pages directory
function getAllPageFiles(): string[] {
  if (!fs.existsSync(PAGES_DIR)) {
    // Pages directory is optional, don't create it automatically
    return [];
  }

  const files = fs.readdirSync(PAGES_DIR);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(PAGES_DIR, file));
}

// Main sync function
async function syncPosts() {
  console.log("Starting post sync...\n");

  // Get Convex URL from environment
  const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) {
    console.error(
      "Error: VITE_CONVEX_URL or CONVEX_URL environment variable is not set",
    );
    process.exit(1);
  }

  // Initialize Convex client
  const client = new ConvexHttpClient(convexUrl);

  // Get all markdown files
  const markdownFiles = getAllMarkdownFiles();
  console.log(`Found ${markdownFiles.length} markdown files\n`);

  if (markdownFiles.length === 0) {
    console.log("No markdown files found. Creating sample post...");
    createSamplePost();
    // Re-read files after creating sample
    const newFiles = getAllMarkdownFiles();
    markdownFiles.push(...newFiles);
  }

  // Parse all markdown files
  const posts: ParsedPost[] = [];
  for (const filePath of markdownFiles) {
    const post = parseMarkdownFile(filePath);
    if (post) {
      posts.push(post);
      console.log(`Parsed: ${post.title} (${post.slug})`);
    }
  }

  console.log(`\nSyncing ${posts.length} posts to Convex...\n`);

  // Sync posts to Convex
  try {
    const result = await client.mutation(api.posts.syncPostsPublic, { posts });
    console.log("Sync complete!");
    console.log(`  Created: ${result.created}`);
    console.log(`  Updated: ${result.updated}`);
    console.log(`  Deleted: ${result.deleted}`);
  } catch (error) {
    console.error("Error syncing posts:", error);
    process.exit(1);
  }

  // Sync pages if pages directory exists
  const pageFiles = getAllPageFiles();
  if (pageFiles.length > 0) {
    console.log(`\nFound ${pageFiles.length} page files\n`);

    const pages: ParsedPage[] = [];
    for (const filePath of pageFiles) {
      const page = parsePageFile(filePath);
      if (page) {
        pages.push(page);
        console.log(`Parsed page: ${page.title} (${page.slug})`);
      }
    }

    if (pages.length > 0) {
      console.log(`\nSyncing ${pages.length} pages to Convex...\n`);

      try {
        const pageResult = await client.mutation(api.pages.syncPagesPublic, {
          pages,
        });
        console.log("Pages sync complete!");
        console.log(`  Created: ${pageResult.created}`);
        console.log(`  Updated: ${pageResult.updated}`);
        console.log(`  Deleted: ${pageResult.deleted}`);
      } catch (error) {
        console.error("Error syncing pages:", error);
        process.exit(1);
      }
    }
  }
}

// Create a sample post if none exist
function createSamplePost() {
  const samplePost = `---
title: "Hello World"
description: "Welcome to my blog. This is my first post."
date: "${new Date().toISOString().split("T")[0]}"
slug: "hello-world"
published: true
tags: ["introduction", "blog"]
---

# Hello World

Welcome to my blog! This is my first post.

## What to Expect

I'll be writing about:

- **Development**: Building applications with modern tools
- **AI**: Exploring artificial intelligence and machine learning
- **Productivity**: Tips and tricks for getting things done

## Code Example

Here's a simple TypeScript example:

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

## Stay Tuned

More posts coming soon. Thanks for reading!
`;

  const filePath = path.join(CONTENT_DIR, "hello-world.md");
  fs.writeFileSync(filePath, samplePost);
  console.log(`Created sample post: ${filePath}`);
}

// Run the sync
syncPosts().catch(console.error);
