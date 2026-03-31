import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const chaptersDirectory = path.join(process.cwd(), "content/chapters");

export type ChapterMeta = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  order: number;
  estimatedReadingTime: number;
  tags: string[];
};

export type Chapter = ChapterMeta & {
  content: string;
};

export function getAllChapterSlugs(): string[] {
  const files = fs.readdirSync(chaptersDirectory);
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
    .sort();
}

export function getChapterBySlug(slug: string): Chapter {
  const fullPath = path.join(chaptersDirectory, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title || "",
    subtitle: data.subtitle || "",
    description: data.description || "",
    order: data.order || 0,
    estimatedReadingTime: Math.ceil(stats.minutes),
    tags: data.tags || [],
    content,
  };
}

export function getAllChapters(): ChapterMeta[] {
  const slugs = getAllChapterSlugs();
  return slugs
    .map((slug) => {
      const chapter = getChapterBySlug(slug);
      const { content: _, ...meta } = chapter;
      return meta;
    })
    .sort((a, b) => a.order - b.order);
}

export function getAdjacentChapters(slug: string) {
  const chapters = getAllChapters();
  const index = chapters.findIndex((c) => c.slug === slug);
  return {
    prev: index > 0 ? chapters[index - 1] : null,
    next: index < chapters.length - 1 ? chapters[index + 1] : null,
  };
}
