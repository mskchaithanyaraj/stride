"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.push("/overview");
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl font-bold text-red-500 mb-4">Stride</div>
        <div className="text-[var(--muted)]">Loading...</div>
      </div>
    </div>
  );
}
