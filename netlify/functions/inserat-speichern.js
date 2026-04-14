const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue }      = require("firebase-admin/firestore");

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}

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

  const { passwort, titel, groesse, preis, zustand, beschreibung,
          zubehoer, fotos, name, telefon } = body;

  // Passwort prüfen
  if (!passwort || passwort !== process.env.VEREIN_PASSWORT) {
    return { statusCode: 401, body: JSON.stringify({ error: "Falsches Passwort" }) };
  }

  // Pflichtfelder
  if (!titel || !groesse || !preis || !name || !telefon || !fotos?.length) {
    return { statusCode: 400, body: JSON.stringify({ error: "Pflichtfelder fehlen" }) };
  }

  try {
    const db  = getDb();
    const ref = await db.collection("inserate").add({
      titel, groesse, preis: Number(preis), zustand,
      beschreibung: beschreibung || "",
      zubehoer: zubehoer || [],
      fotos, name, telefon,
      verkauft: false,
      erstellt: FieldValue.serverTimestamp(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: ref.id }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Serverfehler" }) };
  }
};
