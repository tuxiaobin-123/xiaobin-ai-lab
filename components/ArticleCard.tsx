import Link from 'next/link';

export default function ArticleCard({ article }: { article: any }) {
  return (
    <Link href={`/articles/${article.slug}`} className="block rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.05] transition">
      <div className="text-xs text-indigo-300">{article.category}</div>
      <h3 className="mt-3 text-xl font-semibold text-white">{article.title}</h3>
      <p className="mt-2 text-sm text-gray-400">{article.summary}</p>
      <time className="mt-4 block text-xs text-gray-500">{article.date}</time>
    </Link>
  );
}
