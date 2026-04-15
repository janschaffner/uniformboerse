exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Ungültige Anfrage" }) };
  }

  const { passwort } = body;

  if (!passwort || passwort !== process.env.VEREIN_PASSWORT) {
    return { statusCode: 401, body: JSON.stringify({ error: "Falsches Passwort" }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
