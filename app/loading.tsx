export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-500" />
        </div>
        <p className="text-sm text-gray-500">加载中…</p>
      </div>
    </div>
  );
}
