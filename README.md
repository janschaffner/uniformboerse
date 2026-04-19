# Uniformbörse – Schützenverein

Eine einfache Plattform zum Inserieren von Uniformen.

## Architektur

- **Netlify** – Hosting + serverlose Functions (kostenlos)
- **Firebase Firestore** – Datenbank (kostenlos)
- **Cloudinary** – Foto-Speicher (kostenlos bis 25 GB)

Das Passwort und alle API-Keys liegen **nur auf dem Server** (Netlify Environment Variables) – nie im Browser oder im Git-Repository.

Telefonnummern werden erst nach serverseitiger Passwort-Prüfung zurückgegeben.