# Uniformbörse – Schützenverein

Eine einfache Plattform zum Inserieren von Uniformen beim Wechsel aus der Jugend- in die Erwachsenenformation.

## Architektur

- **Netlify** – Hosting + serverlose Functions (kostenlos)
- **Firebase Firestore** – Datenbank (kostenlos)
- **Cloudinary** – Foto-Speicher (kostenlos bis 25 GB)

Das Passwort und alle API-Keys liegen **nur auf dem Server** (Netlify Environment Variables) – nie im Browser oder im Git-Repository.

Telefonnummern werden erst nach serverseitiger Passwort-Prüfung zurückgegeben.

---

## Setup-Anleitung

### 1. Firebase einrichten

1. Gehe zu [firebase.google.com](https://firebase.google.com) → Neues Projekt anlegen
2. **Firestore Database** aktivieren → "Im Testmodus starten"
3. Firestore **Security Rules** auf "deny all" setzen (alle Zugriffe laufen über unsere Functions):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```
4. **Service Account erstellen:**
   - Projekteinstellungen → Service Accounts → "Neuen privaten Schlüssel generieren"
   - JSON-Datei herunterladen (nicht ins Git!)
   - Aus der JSON-Datei brauchst du: `project_id`, `client_email`, `private_key`

### 2. Cloudinary einrichten

1. Kostenlosen Account bei [cloudinary.com](https://cloudinary.com) anlegen
2. Settings → Upload → "Add upload preset"
   - Signing Mode: **Unsigned**
   - Folder: `uniformboerse` (oder beliebig)
   - Max file size: z.B. 5 MB
3. `Cloud name` und `Preset name` notieren

### 3. Konfiguration in der HTML eintragen

In `public/index.html` ganz unten die zwei Meta-Tags ausfüllen:
```html
<meta name="cn" content="DEIN_CLOUDINARY_CLOUD_NAME" />
<meta name="cp" content="DEIN_CLOUDINARY_UPLOAD_PRESET" />
```

### 4. Auf GitHub hochladen

```bash
git init
git add .
git commit -m "Uniformboerse initial"
git remote add origin https://github.com/DEIN_USER/uniformboerse.git
git push -u origin main
```

### 5. Netlify einrichten

1. Kostenlosen Account bei [netlify.com](https://netlify.com) anlegen
2. "Add new site" → "Import an existing project" → GitHub-Repo auswählen
3. Build-Einstellungen werden automatisch aus `netlify.toml` übernommen
4. Unter **Site Settings → Environment Variables** folgende Werte eintragen:

| Variable               | Wert                                      |
|------------------------|-------------------------------------------|
| `VEREIN_PASSWORT`      | Euer gewähltes Passwort                   |
| `FIREBASE_PROJECT_ID`  | Aus der Service-Account-JSON              |
| `FIREBASE_CLIENT_EMAIL`| Aus der Service-Account-JSON              |
| `FIREBASE_PRIVATE_KEY` | Aus der Service-Account-JSON (mit Quotes) |

5. Deploy auslösen → fertig!

---

## Passwort ändern

Einfach in Netlify unter Environment Variables den Wert von `VEREIN_PASSWORT` ändern → Re-deploy.

## Lokale Entwicklung

```bash
npm install -g netlify-cli
npm install
cp .env.example .env
# .env mit eigenen Werten befüllen
netlify dev
```
