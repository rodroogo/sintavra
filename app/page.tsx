import Sintavra from "@/components/sintavra/app";
import { getChatGPTUser } from "./chatgpt-auth";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await getChatGPTUser();
  // One server timestamp is serialized for identical SSR and browser date rendering.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  return (
    <Sintavra
      now={now}
      userId={user?.userId || null}
      userName={user?.fullName?.split(" ")[0] || ""}
    />
  );
}
