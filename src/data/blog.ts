import { BLOG_ARTICLES_PART_1, BlogArticle, BlogSection } from './blog-part1';
import { BLOG_ARTICLES_PART_2 } from './blog-part2';

export type { BlogArticle, BlogSection };

export const BLOG_ARTICLES: BlogArticle[] = [
  ...BLOG_ARTICLES_PART_1,
  ...BLOG_ARTICLES_PART_2,
];

export const BLOG_BY_SLUG: Record<string, BlogArticle> = BLOG_ARTICLES.reduce(
  (acc, article) => {
    acc[article.slug] = article;
    return acc;
  },
  {} as Record<string, BlogArticle>
);
