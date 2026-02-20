import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { EditVideoForm } from "@/components/EditVideoForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) notFound();

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-start justify-center px-8 py-8">
      <div className="w-full max-w-[1200px]">
        <Link
          href="/admin"
          className="mb-4 inline-block text-sm font-medium text-[#B79953] hover:underline"
        >
          ← Back to admin
        </Link>
        <h1 className="mb-6 text-3xl font-bold text-[#333] transition-colors duration-300 [text-shadow:none] dark:text-[#e0e0e0] dark:[text-shadow:2px_2px_4px_rgba(0,0,0,0.2)]">
          Edit video
        </h1>
        <div className="rounded-xl border-2 border-transparent bg-white p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300 dark:bg-[#2d2d44] dark:shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
          <EditVideoForm video={video} />
        </div>
      </div>
    </main>
  );
}
