import { getChatGPTUser } from "@/app/chatgpt-auth";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function identify(req: Request, write = false) {
  if (write) {
    const origin = req.headers.get("origin");
    if (origin && origin !== new URL(req.url).origin)
      throw new HttpError(403, "Origen no permitido.");
    if (req.headers.get("content-type")?.split(";")[0] !== "application/json")
      throw new HttpError(415, "Se requiere JSON.");
  }
  const user = await getChatGPTUser();
  if (!user)
    throw new HttpError(401, "Inicia sesión para sincronizar tu progreso.");
  return user;
}
export async function body(req: Request) {
  const raw = await req.text();
  if (raw.length > 180000)
    throw new HttpError(413, "El contenido es demasiado grande.");
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "JSON no válido.");
  }
}
export function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export function fail(error: unknown) {
  if (error instanceof HttpError)
    return json({ error: error.message }, error.status);
  console.error(
    "Sintavra request failed",
    error instanceof Error ? error.name : "Unknown",
  );
  return json(
    {
      error:
        "No se pudo guardar o cargar. Tu contenido sigue en el editor; vuelve a intentarlo.",
    },
    503,
  );
}
