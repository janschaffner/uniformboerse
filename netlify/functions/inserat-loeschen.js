const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore }                  = require("firebase-admin/firestore");
const crypto                            = require("crypto");

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

async function loescheCloudinaryBild(url) {
  try {
    // Public ID aus URL extrahieren: .../upload/v123456/FOLDER/DATEINAME.jpg → FOLDER/DATEINAME
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    if (!match) return;
    const publicId  = match[1];
    const timestamp = Math.round(Date.now() / 1000);
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    const sigString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(sigString).digest("hex");

    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_id: publicId, timestamp, api_key: apiKey, signature }),
    });
  } catch (e) {
    console.error("Cloudinary-Löschfehler:", e);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: "Ungültige Anfrage" }) }; }

  const { passwort, id } = body;
  if (!passwort || passwort !== process.env.VEREIN_PASSWORT)
    return { statusCode: 401, body: JSON.stringify({ error: "Falsches Passwort" }) };
  if (!id)
    return { statusCode: 400, body: JSON.stringify({ error: "Keine ID" }) };

  try {
    const db  = getDb();
    const doc = await db.collection("inserate").doc(id).get();
    if (doc.exists) {
      const fotos = doc.data().fotos || [];
      await Promise.all(fotos.map(loescheCloudinaryBild));
      await db.collection("inserate").doc(id).delete();
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Serverfehler" }) };
  }
};
