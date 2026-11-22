# SV Fortuna Genthin – Vereinswebseite

Webseite der Herrenmannschaft (Kreisliga). Reines HTML, CSS und JavaScript – läuft kostenlos auf GitHub Pages.

## Wo stehen die Daten?

| Datei | Inhalt |
|---|---|
| `daten/spiele.json` | Alle Spiele, Ergebnisse und Google-Drive-Links für die Galerie |
| `daten/verein.json` | Spieler, Trainer, Kontaktdaten, Trainingszeiten, Social-Media-Links |
| `impressum.html` | Impressum (Pflichtangaben) |
| `bilder/wappen.svg` | Vereinswappen (derzeit Platzhalter) |

Alles, was **PLATZHALTER** enthält, wird auf der Seite gelb gestrichelt markiert, bis es ersetzt ist.

## Neues Spiel eintragen (vom Handy)

1. Auf github.com das Repository öffnen → Ordner `daten` → `spiele.json`.
2. Auf das **Stift-Symbol** (Bearbeiten) tippen.
3. Den letzten Spiel-Block kopieren und **vor** der Zeile `  ]` einfügen. Wichtig: zwischen zwei Blöcken steht ein Komma `},` – nach dem allerletzten Block **kein** Komma.

```json
    {
      "datum": "2026-12-13",
      "uhrzeit": "14:00",
      "gegner": "Name des Gegners",
      "heim": true,
      "wettbewerb": "Kreisliga",
      "ergebnis": "",
      "fotos": ""
    }
```

| Feld | Bedeutung |
|---|---|
| `datum` | Immer `JJJJ-MM-TT`, z. B. `2026-12-13` |
| `uhrzeit` | z. B. `14:00` |
| `heim` | `true` = Heimspiel, `false` = Auswärtsspiel (ohne Anführungszeichen) |
| `ergebnis` | Leer lassen `""`, solange nicht gespielt. Danach **zuerst unsere Tore**: `"3:1"` = wir haben 3:1 gewonnen – auch bei Auswärtsspielen |
| `fotos` | Link zum freigegebenen Google-Drive-Ordner, sonst `""` |

4. Unten auf **Commit changes** tippen. Nach 1–2 Minuten ist die Seite aktualisiert.

Ein gespieltes Spiel erscheint automatisch unter „Ergebnisse“ und in der Galerie. Bei einem Tippfehler zeigt die Seite einen Hinweis, was nicht stimmt.

## Google-Drive-Ordner freigeben

Ordner in Google Drive → **Teilen** → „Allgemeiner Zugriff“ auf **Jeder mit dem Link** (Betrachter) → **Link kopieren** → in `fotos` einfügen.

## Lokal testen

Die Daten laden nur über einen Webserver, z. B. `python3 -m http.server` im Projektordner, dann `http://localhost:8000` öffnen.
