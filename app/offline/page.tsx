"use client";
import { useEffect, useState } from "react";
import Sintavra from "@/components/sintavra/app";
import { localSnapshot } from "@/lib/offline";
export default function Offline() {
  const [session, setSession] = useState<{ key: string; now: number } | null>(
    null,
  );
  useEffect(() => {
    localSnapshot("session-index")
      .then((s) =>
        setSession({
          key: (s as { key?: string })?.key || "guest",
          now: Date.now(),
        }),
      )
      .catch(() => setSession({ key: "guest", now: Date.now() }));
  }, []);
  return session ? (
    <Sintavra
      userId={null}
      userName=""
      localKey={session.key}
      now={session.now}
    />
  ) : (
    <p>Abriendo tu espacio local…</p>
  );
}
