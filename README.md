# SV Fortuna Genthin – Vereinswebseite

Webseite der Herrenmannschaft (Kreisliga). Reines HTML, CSS und JavaScript – läuft kostenlos auf GitHub Pages.

## Wo stehen die Daten?

| Datei | Inhalt |
|---|---|
| `daten/spiele.json` | Spiele & Ergebnisse (automatisch von fussball.de) + Google-Drive-Links |
| `daten/verein.json` | Kontaktdaten, Trainingszeiten, Social-Media-Links, Link zur Google-Tabelle |
| **Google-Tabelle** | Spieler, Trainer und Foto-Ordner – vom Handy pflegbar (siehe unten) |
| `impressum.html` | Impressum (Pflichtangaben) |
| `bilder/logo.png` | Vereinslogo (Tab-Symbole: `favicon-48.png`, `apple-touch-icon.png`) |

Alles, was **PLATZHALTER** enthält, wird auf der Seite gelb gestrichelt markiert, bis es ersetzt ist.

## Spiele kommen automatisch von fussball.de

Die GitHub Action `.github/workflows/webseite.yml` holt Spielplan und Ergebnisse der Herren
(Team-ID `fussballde_team_id` in `daten/verein.json`) und schreibt sie in `daten/spiele.json`:

- am Spielwochenende (Sa/So) stündlich, sonst zweimal täglich,
- bei jeder Änderung an `main`,
- sofort per Hand: **Actions → „Spiele aktualisieren & Webseite veröffentlichen“ → Run workflow**.

Nur das Feld `fotos` trägst du selbst ein – es bleibt bei jedem Abruf erhalten.
Alle anderen Felder überschreibt der Abruf.

## Mannschaft & Fotos vom Handy pflegen (Google-Tabelle)

Spieler, Trainer und Spielfotos kommen aus **einer Google-Tabelle**. Änderungen dort sind
nach 1–5 Minuten auf der Webseite – ohne GitHub, ohne Code. Kostenlos, ein Google-Konto genügt.

### Einmalig einrichten

1. Vorlage `vorlagen/fortuna-tabelle.xlsx` in Google Drive hochladen, öffnen und
   **Datei → Als Google Tabellen speichern** (oder selbst eine Tabelle mit den Reitern unten anlegen).
2. **Teilen → Allgemeiner Zugriff: „Jeder mit dem Link“ – Betrachter**.
3. Link kopieren und in `daten/verein.json` bei `"google_tabelle": ""` einfügen (einmalig auf github.com, Stift-Symbol).
4. In Google Drive einen Ordner **„Fortuna Fotos“** anlegen → **Teilen → „Jeder mit dem Link“ – Betrachter**.
   Alle Unterordner darin sind dann automatisch öffentlich lesbar.

Die Reiter (Namen und Spaltenüberschriften genau so):

| Reiter | Spalten |
|---|---|
| `Spieler` | Nummer · Name · Position (Tor / Abwehr / Mittelfeld / Sturm) · Foto |
| `Trainer` | Name · Rolle · Foto |
| `Fotos` | Datum (z. B. 29.11.2026) · Gegner (nur nötig bei 2 Spielen am selben Tag) · Link |

- **Hinzufügen:** neue Zeile. **Ändern:** Zelle antippen. **Löschen:** Zeile lang drücken → „Zeile löschen“.
- **Foto eines Spielers (optional):** Bild in Drive hochladen, „Jeder mit dem Link“ freigeben, Link in Spalte `Foto`.

### Spielfotos hochladen (du oder ein Helfer)

1. Google-Drive-App → Ordner „Fortuna Fotos“ → **+ → Ordner**, z. B. `2026-11-29 Wörmlitz`.
2. Ordner öffnen → **+ → Hochladen** → Fotos auswählen.
3. Am Ordner **⋮ → Link kopieren**.
4. Google-Tabellen-App → Reiter `Fotos` → neue Zeile: Datum des Spiels + Link einfügen.

Die Fotos erscheinen in der Galerie beim passenden Spiel (direkt ansehbar und kostenlos herunterladbar).

### Einem Helfer Zugriff geben

- Ordner „Fortuna Fotos“ → **Teilen** → Google-Mail-Adresse des Helfers → Rolle **Bearbeiter** → Senden.
- Google-Tabelle → **Teilen** → gleiche Adresse → **Bearbeiter**.
- Zugriff entziehen: dort wieder **Teilen** → beim Namen **Zugriff entfernen**.

Alternativ geht der Drive-Link auch weiterhin direkt in `daten/spiele.json` bei `"fotos": ""`.

Ein Spiel, das nicht auf fussball.de steht, kannst du von Hand ergänzen. Mit `"manuell": true`
wird es vom Abruf nie verändert:

```json
    {
      "manuell": true,
      "datum": "2027-07-10",
      "uhrzeit": "15:00",
      "gegner": "Name des Gegners",
      "heim": true,
      "wettbewerb": "Freundschaftsspiel",
      "ergebnis": "",
      "fotos": ""
    },
```

`ergebnis`: zuerst unsere Tore, z. B. `"3:1"`.

## Neue Saison

Die Team-ID bleibt bei fussball.de normalerweise gleich. Falls nach dem Saisonwechsel keine
Spiele mehr kommen: Mannschaftsseite auf fussball.de öffnen, die Zeichenkette hinter
`team-id/` in der Adresse kopieren und in `daten/verein.json` bei `fussballde_team_id` eintragen.

## Google-Drive-Ordner freigeben

Ordner in Google Drive → **Teilen** → „Allgemeiner Zugriff“ auf **Jeder mit dem Link** (Betrachter) → **Link kopieren** → in `fotos` einfügen.

## Lokal testen

Die Daten laden nur über einen Webserver, z. B. `python3 -m http.server` im Projektordner, dann `http://localhost:8000` öffnen.
