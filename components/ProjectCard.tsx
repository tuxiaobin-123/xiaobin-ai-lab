import { ArrowUpRight } from 'lucide-react';

export default function ProjectCard({ project }: { project: any }) {
  return (
    <article className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-white/20">
      <div className="mb-4 text-xs text-indigo-300">{project.category}</div>
      <h3 className="text-2xl font-semibold text-white">{project.title}</h3>
      <p className="mt-3 text-sm leading-6 text-gray-400">{project.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.tags.map((tag:string)=>(
          <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">{tag}</span>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-1 text-sm text-white opacity-60 group-hover:opacity-100">
        Explore <ArrowUpRight size={14}/>
      </div>
    </article>
  );
}
