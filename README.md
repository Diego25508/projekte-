# SV Fortuna Genthin – Vereinswebseite

Webseite der Herrenmannschaft (Kreisliga). Reines HTML, CSS und JavaScript – läuft kostenlos auf GitHub Pages.

## Wo stehen die Daten?

| Datei | Inhalt |
|---|---|
| `daten/spiele.json` | Spiele & Ergebnisse (automatisch von fussball.de) + Google-Drive-Links |
| `daten/verein.json` | Spieler, Trainer, Kontaktdaten, Trainingszeiten, Social-Media-Links |
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

## Foto-Link zu einem Spiel eintragen (vom Handy)

1. Auf github.com: `daten/spiele.json` öffnen → **Stift-Symbol**.
2. Das Spiel suchen (Datum + Gegner) und den Drive-Link zwischen die Anführungszeichen bei `"fotos": ""` setzen:
   `"fotos": "https://drive.google.com/drive/folders/..."`
3. **Commit changes** – nach ca. 2 Minuten ist der Button in der Galerie aktiv.

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
