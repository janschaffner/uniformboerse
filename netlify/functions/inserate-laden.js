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

exports.handler = async () => {
  try {
    const db   = getDb();
    const snap = await db.collection("inserate").orderBy("erstellt", "desc").get();

    const inserate = snap.docs.map(doc => {
      const d = doc.data();
      return {
        id:          doc.id,
        titel:       d.titel,
        groesse:     d.groesse,
        preis:       d.preis,
        zustand:     d.zustand,
        beschreibung: d.beschreibung,
        zubehoer:    d.zubehoer,
        fotos:       d.fotos,
        name:        d.name,
        verkauft:    d.verkauft,
        erstellt:    d.erstellt?.toMillis?.() ?? null,
        // telefon wird bewusst NICHT zurückgegeben
      };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inserate),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Serverfehler" }) };
  }
};
