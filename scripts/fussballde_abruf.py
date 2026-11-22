#!/usr/bin/env python3
"""Holt den Spielplan der Herren von fussball.de und schreibt daten/spiele.json.

- Die Team-ID steht in daten/verein.json unter "fussballde_team_id".
- Google-Drive-Links ("fotos") bleiben erhalten: Sie werden über die Spiel-ID
  ("id") dem jeweiligen Spiel wieder zugeordnet.
- Einträge mit "manuell": true werden nie verändert oder gelöscht.

fussball.de verschlüsselt die Tore mit einer wechselnden Schriftart. Die Schrift
wird hier geladen und über die Zeichennamen ("one", "two", ...) entschlüsselt.
"""
import io
import json
import re
import sys
import time
import urllib.request
from datetime import date
from pathlib import Path

from bs4 import BeautifulSoup
from fontTools.ttLib import TTFont

BASIS = Path(__file__).resolve().parent.parent
SPIELE = BASIS / "daten" / "spiele.json"
VEREIN = BASIS / "daten" / "verein.json"
FD = "https://www.fussball.de"
UA = "Mozilla/5.0 (compatible; Vereinswebseite-Spielplan/1.0)"

ZIFFERN = {"zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
           "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9", "hyphen": "-"}
TYP_NAMEN = {"FS": "Freundschaftsspiel", "PO": None, "ME": None}  # None = Namen von fussball.de übernehmen


def laden(url, versuche=3):
    for i in range(versuche):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "de-DE"})
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001
            if i == versuche - 1:
                raise
            print(f"Fehler beim Laden ({e}), neuer Versuch ...", file=sys.stderr)
            time.sleep(5 * (i + 1))


_schriften = {}


def entschluessele(span):
    """Wandelt die verschlüsselten Tore eines <span data-obfuscation> in Text um."""
    if span is None:
        return ""
    sid = span.get("data-obfuscation")
    text = "".join(span.find_all(string=True, recursive=False)).strip()
    if not sid:
        return text
    if sid not in _schriften:
        daten = laden(f"{FD}/export.fontface/-/format/woff/id/{sid}/type/font")
        _schriften[sid] = TTFont(io.BytesIO(daten)).getBestCmap()
    cmap = _schriften[sid]
    return "".join(ZIFFERN.get(cmap.get(ord(z), ""), "") for z in text)


def saison_zeitraum(heute):
    start = heute.year if heute.month >= 7 else heute.year - 1
    return date(start, 7, 1), date(start + 1, 6, 30), f"{start}/{str(start + 1)[-2:]}"


def abrufen(team_id):
    von, bis, saison = saison_zeitraum(date.today())
    url = (f"{FD}/ajax.team.matchplan/-/mode/PAGE/team-id/{team_id}/max/300"
           f"/datum-von/{von}/datum-bis/{bis}/match-type/-1/show-venues/checked")
    soup = BeautifulSoup(laden(url), "html.parser")

    spiele = {}
    for wett in soup.select("tr.row-competition"):
        zeile = wett.find_next_sibling("tr")
        if zeile is None:
            continue
        datum_txt = wett.select_one("td.column-date").get_text(" ", strip=True)
        m = re.search(r"(\d{2})\.(\d{2})\.(\d{2})", datum_txt)
        if not m:
            continue
        datum = f"20{m.group(3)}-{m.group(2)}-{m.group(1)}"
        z = re.search(r"(\d{1,2}:\d{2})\s*$", datum_txt)
        uhrzeit = z.group(1) if z else ""

        tds = wett.find_all("td")
        wettbewerb = tds[1].get_text(" ", strip=True) if len(tds) > 1 else ""
        code = tds[2].get_text(" ", strip=True) if len(tds) > 2 else ""
        typ = code.split("|")[0].strip()
        if TYP_NAMEN.get(typ):
            wettbewerb = TYP_NAMEN[typ]

        vereine = zeile.select("td.column-club")
        if len(vereine) < 2:
            continue
        namen = []
        team_ids = []
        for v in vereine:
            name_el = v.select_one(".club-name")
            namen.append(re.sub(r"\s+", " ", (name_el or v).get_text(" ", strip=True)).replace("​", ""))
            a = v.find("a", href=True)
            team_ids.append(a["href"] if a else "")
        if any(n.lower() == "spielfrei" for n in namen):
            continue
        heim = team_id in team_ids[0]
        gegner = namen[1] if heim else namen[0]

        score = zeile.select_one("td.column-score")
        link_el = score.find("a", href=True) if score else None
        link = link_el["href"] if link_el else ""
        sid = re.search(r"/spiel/([A-Z0-9]+)", link)
        spiel_id = sid.group(1) if sid else f"{datum}-{gegner}"

        info = score.select_one(".info-text") if score else None
        status = ""
        ergebnis = ""
        if info:
            info_txt = info.get_text(" ", strip=True)
            if re.match(r"\d{2}\.\d{2}\.\d{4}", info_txt):
                continue  # verlegt – das Spiel steht mit neuem Termin noch einmal in der Liste
            status = info_txt
        else:
            links_ = entschluessele(score.select_one(".score-left")) if score else ""
            rechts = entschluessele(score.select_one(".score-right")) if score else ""
            if links_.isdigit() and rechts.isdigit():
                wir, die = (links_, rechts) if heim else (rechts, links_)
                ergebnis = f"{wir}:{die}"

        ort = ""
        venue = zeile.find_next_sibling("tr")
        if venue is not None and "row-venue" in (venue.get("class") or []):
            ort = venue.get_text(" ", strip=True)

        spiele[spiel_id] = {
            "id": spiel_id,
            "datum": datum,
            "uhrzeit": uhrzeit,
            "gegner": gegner,
            "heim": heim,
            "wettbewerb": wettbewerb,
            "typ": typ,
            "ergebnis": ergebnis,
            "status": status,
            "ort": ort,
            "link": link,
            "fotos": "",
        }
    return saison, list(spiele.values())


def main():
    verein = json.loads(VEREIN.read_text(encoding="utf-8"))
    team_id = str(verein.get("fussballde_team_id", "")).strip()
    if not team_id:
        sys.exit("In daten/verein.json fehlt \"fussballde_team_id\".")

    alt = json.loads(SPIELE.read_text(encoding="utf-8")) if SPIELE.exists() else {}
    alte_spiele = alt.get("spiele", [])
    fotos = {s["id"]: s.get("fotos", "") for s in alte_spiele if s.get("id") and s.get("fotos")}
    manuell = [s for s in alte_spiele if s.get("manuell")]

    saison, neu = abrufen(team_id)
    if not neu:
        sys.exit("Keine Spiele von fussball.de erhalten – spiele.json bleibt unverändert.")

    for s in neu:
        s["fotos"] = fotos.get(s["id"], "")
    alle = sorted(neu + manuell, key=lambda s: (s.get("datum", ""), s.get("uhrzeit", "")))

    ausgabe = {
        "saison": saison,
        "hinweis": "Wird automatisch von fussball.de aktualisiert. Nur das Feld \"fotos\" selbst ausfüllen.",
        "spiele": alle,
    }
    text = json.dumps(ausgabe, ensure_ascii=False, indent=2) + "\n"
    if SPIELE.exists() and SPIELE.read_text(encoding="utf-8") == text:
        print("Keine Änderungen.")
        return
    SPIELE.write_text(text, encoding="utf-8")
    gespielt = sum(1 for s in neu if s["ergebnis"])
    print(f"{len(neu)} Spiele geschrieben ({gespielt} mit Ergebnis), {len(fotos)} Foto-Links übernommen.")


if __name__ == "__main__":
    main()
