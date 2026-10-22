// @ts-nocheck
const MODELO = "gemini-flash-lite-latest";

function respuestaJson(cuerpo: unknown, estado = 200): Response {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { "Content-Type": "application/json" },
  });
}

async function usuarioValido(req: Request): Promise<boolean> {
  const respuesta = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
    headers: {
      Authorization: req.headers.get("Authorization") ?? "",
      apikey: req.headers.get("apikey") ?? "",
    },
    signal: AbortSignal.timeout(10000),
  });
  return respuesta.ok;
}

Deno.serve(async (req) => {
  try {
    console.log("Verificando usuario");
    if (!(await usuarioValido(req))) {
      console.log("Usuario no autorizado");
      return respuestaJson({ error: "No autorizado" }, 401);
    }

    const { nuevo, actuales } = await req.json();

    if (typeof nuevo !== "string" || !Array.isArray(actuales)) {
      return respuestaJson({ error: "Datos inválidos" }, 400);
    }

    const prompt = `Eres un asistente farmacéutico. Un paciente quiere agregar el medicamento "${nuevo}" y ya toma: ${actuales.join(", ")}.
Indica si existen interacciones conocidas entre el medicamento nuevo y cada uno de los actuales.
Responde SOLO con JSON con este formato:
{"nivel": "ninguna" | "precaucion" | "grave", "interacciones": [{"medicamentos": "A + B", "descripcion": "explicación breve en español"}]}
Reglas: "nivel" es el más alto encontrado. Si no hay interacciones conocidas, usa "ninguna" y una lista vacía. No recomiendes dosis. Si no reconoces un medicamento, indícalo con nivel "precaucion".`;

    console.log("Consultando a Gemini");
    const respuesta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": Deno.env.get("GEMINI_API_KEY") ?? "",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      console.log("Error de Gemini", respuesta.status, detalle);
      return respuestaJson({ error: `Gemini respondió ${respuesta.status}` }, 502);
    }

    const datos = await respuesta.json();
    const texto = datos.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    console.log("Respuesta de Gemini", texto);
    return respuestaJson(JSON.parse(texto));
  } catch (e) {
    console.log("Error en la función", String(e));
    return respuestaJson({ error: String(e) }, 500);
  }
});