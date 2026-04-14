const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore }                  = require("firebase-admin/firestore");

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

  const { passwort, id } = body;

  // Passwort prüfen – läuft nur auf dem Server, nie im Browser sichtbar
  if (!passwort || passwort !== process.env.VEREIN_PASSWORT) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Falsches Passwort" }),
    };
  }

  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: "Keine ID angegeben" }) };
  }

  try {
    const db  = getDb();
    const doc = await db.collection("inserate").doc(id).get();

    if (!doc.exists) {
      return { statusCode: 404, body: JSON.stringify({ error: "Inserat nicht gefunden" }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefon: doc.data().telefon }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Serverfehler" }) };
  }
};
