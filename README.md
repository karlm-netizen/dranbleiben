# Dranbleiben

Täglicher Ziel-/Habit-Tracker als installierbare PWA: Ziele abhaken, Serien (🔥), Konsistenz-Statistiken und Heatmap. Läuft offline; funktioniert auf iPhone und PC.

## Funktionen (v2)

- **Tages- und Wochen-Ziele** — pro Ziel „täglich" oder „×/Woche" (Fortschrittsbalken pro Woche).
- **Vergangene Tage nachtragen** — im Heute-Tab per Pfeilen bis zu 60 Tage zurückblättern und abhaken.
- **Ziele verwalten** — im Bearbeiten-Modus umsortieren (↑/↓), umbenennen, Emoji und Häufigkeit ändern, löschen.
- **Serien & Meilensteine** — „perfekter Tag" = alle Tages-Ziele erledigt; Flammen-Animation, Konfetti und Meilenstein-Hinweise (7/14/30/… Tage). „Perfekter Tag" ignoriert Wochen-Ziele, damit die Serie sauber bleibt.
- **Statistik** — aktuelle/längste Serie, Konsistenz 30 T., diese Woche, gesamt erledigt, aktive Tage, 12-Wochen-Heatmap, Pro-Ziel-Auswertung.
- **Extras** — Theme-Umschalter (auto/hell/dunkel), Haptik auf dem Handy, viele Mikro-Animationen, Export/Import (JSON).

## Struktur

- `index.html` — die komplette App (HTML/CSS/JS in einer Datei).
- `manifest.webmanifest` — macht sie installierbar (Home-Bildschirm, Standalone).
- `sw.js` — Service Worker, cacht die App-Shell für Offline-Betrieb.
- `sync.js` — Cloud-Sync-Adapter (**Platzhalter**; App läuft bis dahin rein lokal).
- `icon.svg` — App-Icon.

## Live schalten (GitHub Pages, kostenlos)

1. Leeres **öffentliches** Repo `dranbleiben` auf GitHub anlegen.
2. Dieses Verzeichnis pushen (Remote steht nach `git remote add origin …`).
3. GitHub → Repo → **Settings → Pages** → Source: `Deploy from a branch`, Branch: `main` / `root` → Save.
4. Nach ~1 Min live unter `https://<user>.github.io/dranbleiben/`.
   Auf dem iPhone in Safari öffnen → Teilen → **Zum Home-Bildschirm**.

## Geräte-Sync aktivieren (später, mit Supabase)

Aktuell speichert jedes Gerät lokal. Für echten Sync über iPhone + PC:

1. Kostenloses **Supabase**-Projekt anlegen (Login mit GitHub).
2. Tabelle `states` (`user_id uuid`, `data jsonb`, `updated_at timestamptz`) + Row-Level-Security.
3. In `sync.js` `url` + `anonKey` eintragen und `window.Remote` implementieren
   (Auth per Magic-Link, `push` = upsert, `pull` = select). Die Hooks in
   `index.html` (`save()` → `Remote.push`, Start → `Remote.pull`) sind schon da.

## Später: in die Stores

Mit **Capacitor** in eine native Hülle wrappen — zuerst Google Play (25 $ einmalig),
Apple wenn es sich lohnt (99 $/Jahr + Mac/Cloud-Build). Für die Store-Freigabe vorher
**Erinnerungen** (Web-Push/native Notifications) ergänzen.
