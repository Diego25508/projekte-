/* SV Fortuna Genthin – gemeinsames Script für alle Seiten.
   Die Inhalte kommen aus daten/spiele.json und daten/verein.json.
   Hier muss normalerweise nichts geändert werden. */
(function () {
  "use strict";

  var VEREIN = "SV Fortuna Genthin";
  var VEREIN_KURZ = "Fortuna Genthin";

  /* ---------- Icons ---------- */
  var ICON = {
    start: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    spielplan: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    mannschaft: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.9.4 5 2.9 5 5.8"/>',
    galerie: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>',
    kontakt: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/>',
    telefon: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/>',
    ort: '<path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
    link: '<path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1"/><path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + "</svg>";
  }

  /* ---------- Kopf, Navigation, Fuß ---------- */
  var SEITEN = [
    { id: "start", titel: "Start", url: "index.html" },
    { id: "spielplan", titel: "Spielplan", url: "spielplan.html" },
    { id: "mannschaft", titel: "Team", url: "mannschaft.html" },
    { id: "galerie", titel: "Galerie", url: "galerie.html" },
    { id: "kontakt", titel: "Kontakt", url: "kontakt.html" }
  ];
  var seite = document.body.getAttribute("data-seite");

  function baueRahmen() {
    var nav = SEITEN.map(function (s) {
      return '<a href="' + s.url + '"' + (s.id === seite ? ' aria-current="page"' : "") + ">" + icon(s.id) + "<span>" + s.titel + "</span></a>";
    }).join("");
    var kopf = document.createElement("header");
    kopf.className = "kopf";
    kopf.innerHTML =
      '<div class="container">' +
      '<a class="marke" href="index.html"><span class="logo-schild"><img src="bilder/logo.png" alt="Vereinslogo Fortuna 89" width="27" height="40"></span><span><strong>' + VEREIN + "</strong><small>Herren · Kreisliga</small></span></a>" +
      '<nav class="nav" aria-label="Hauptmenü">' + nav + "</nav>" +
      "</div>";
    document.body.insertBefore(kopf, document.body.firstChild);

    var fuss = document.createElement("footer");
    fuss.className = "fuss";
    fuss.innerHTML = '<div class="container"><p><strong>' + VEREIN + "</strong> · Grün-Weiß seit jeher</p>" +
      '<p>Spielplan &amp; Ergebnisse: <a href="https://www.fussball.de" target="_blank" rel="noopener">fussball.de</a></p>' +
      '<p><a href="kontakt.html">Kontakt</a> · <a href="impressum.html">Impressum &amp; Datenschutz</a></p></div>';
    document.body.appendChild(fuss);
  }

  /* ---------- Hilfsfunktionen ---------- */
  function esc(wert) {
    return String(wert == null ? "" : wert)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function istPlatzhalter(wert) {
    return /PLATZHALTER/i.test(String(wert || ""));
  }
  // Text ausgeben – Platzhalter werden gelb markiert
  function t(wert) {
    var s = esc(wert);
    return istPlatzhalter(wert) ? '<span class="platzhalter" title="Bitte in der JSON-Datei ersetzen">' + s + "</span>" : s;
  }
  function sichererLink(url) {
    return /^https?:\/\//i.test(String(url || "").trim()) && !istPlatzhalter(url);
  }

  function ladeJson(pfad) {
    return fetch(pfad + "?v=" + Date.now(), { cache: "no-store" })
      .then(function (antwort) {
        if (!antwort.ok) throw new Error("Datei <code>" + pfad + "</code> wurde nicht gefunden.");
        return antwort.text();
      })
      .then(function (text) {
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error("In <code>" + pfad + "</code> ist ein Tippfehler. Häufige Ursachen: fehlendes Komma zwischen zwei Spielen, " +
            "ein Komma zu viel nach dem letzten Eintrag oder fehlende Anführungszeichen. <br><small>Technische Meldung: " + esc(e.message) + "</small>");
        }
      });
  }

  /* ---------- Google-Tabelle (Mannschaft & Fotos vom Handy pflegen) ----------
     In daten/verein.json steht bei "google_tabelle" der Link zur Tabelle.
     Reiter: "Spieler" (Nummer, Name, Position, Foto), "Trainer" (Name, Rolle, Foto),
     "Fotos" (Datum, Gegner, Link). Die Tabelle muss für "Jeder mit dem Link" lesbar sein. */
  var vereinCache = null;
  function ladeVereinRoh() {
    if (!vereinCache) vereinCache = ladeJson("daten/verein.json");
    return vereinCache;
  }
  function tabellenId(wert) {
    wert = String(wert || "").trim();
    var m = /\/d\/([a-zA-Z0-9_-]{20,})/.exec(wert);
    if (m) return m[1];
    return /^[a-zA-Z0-9_-]{20,}$/.test(wert) ? wert : "";
  }
  function parseCsv(text) {
    var zeilen = [], zeile = [], feld = "", inQ = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { feld += '"'; i++; } else inQ = false; }
        else feld += c;
      } else if (c === '"') inQ = true;
      else if (c === ",") { zeile.push(feld); feld = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        zeile.push(feld); zeilen.push(zeile); zeile = []; feld = "";
      } else feld += c;
    }
    if (feld || zeile.length) { zeile.push(feld); zeilen.push(zeile); }
    return zeilen;
  }
  var SPALTEN = {
    nummer: ["nummer", "nr", "nr.", "rückennummer", "trikotnummer"],
    name: ["name", "vorname nachname", "spieler", "trainer"],
    position: ["position", "pos"],
    foto: ["foto", "bild", "foto-link", "fotolink"],
    rolle: ["rolle", "funktion", "aufgabe"],
    datum: ["datum", "spieltag", "spieldatum"],
    gegner: ["gegner"],
    link: ["link", "fotos", "drive-link", "drivelink", "ordner", "ordner-link", "google drive"]
  };
  // Liest einen Reiter der Google-Tabelle als Liste von Objekten
  function ladeReiter(id, reiter, pflicht) {
    var url = "https://docs.google.com/spreadsheets/d/" + id + "/gviz/tq?tqx=out:csv&headers=1&sheet=" + encodeURIComponent(reiter) + "&t=" + Date.now();
    return fetch(url, { cache: "no-store" }).then(function (a) {
      if (!a.ok) throw new Error("Google-Tabelle nicht erreichbar (" + a.status + ")");
      return a.text();
    }).then(function (text) {
      var z = parseCsv(text);
      if (!z.length) return [];
      var kopf = z[0].map(function (h) { return h.trim().toLowerCase(); });
      var index = {};
      Object.keys(SPALTEN).forEach(function (k) {
        for (var i = 0; i < kopf.length; i++) if (SPALTEN[k].indexOf(kopf[i]) >= 0) { index[k] = i; return; }
      });
      // Fehlt ein Reiter, liefert Google den ersten – dann passen die Spalten nicht.
      if (pflicht.some(function (k) { return index[k] == null; })) throw new Error("Reiter „" + reiter + "“ fehlt oder hat andere Spaltennamen");
      return z.slice(1).map(function (r) {
        var o = {};
        Object.keys(index).forEach(function (k) { o[k] = String(r[index[k]] || "").trim(); });
        return o;
      });
    });
  }
  // Verein laden – Spieler und Trainer kommen aus der Google-Tabelle, falls eingetragen
  function ladeVerein() {
    return ladeVereinRoh().then(function (daten) {
      var id = tabellenId(daten.google_tabelle);
      if (!id) return daten;
      return Promise.all([
        ladeReiter(id, "Spieler", ["name"]),
        ladeReiter(id, "Trainer", ["name"]).catch(function () { return null; })
      ]).then(function (r) {
        var kopie = Object.assign({}, daten);
        kopie.spieler = r[0].filter(function (p) { return p.name; });
        if (r[1]) kopie.trainer = r[1].filter(function (p) { return p.name; });
        return kopie;
      }).catch(function (e) {
        console.warn("Google-Tabelle:", e);
        return daten;
      });
    });
  }
  function datumAusTabelle(wert) {
    wert = String(wert || "").trim();
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(wert);
    if (m) return m[1] + "-" + m[2].padStart(2, "0") + "-" + m[3].padStart(2, "0");
    m = /^(\d{1,2})[./](\d{1,2})[./](\d{2,4})/.exec(wert);
    if (m) return (m[3].length === 2 ? "20" + m[3] : m[3]) + "-" + m[2].padStart(2, "0") + "-" + m[1].padStart(2, "0");
    return "";
  }
  // Spiele laden – Foto-Links aus dem Reiter "Fotos" der Google-Tabelle werden dazugemischt
  function ladeSpiele() {
    return Promise.all([ladeJson("daten/spiele.json"), ladeVereinRoh().catch(function () { return {}; })]).then(function (r) {
      var daten = r[0], id = tabellenId(r[1].google_tabelle);
      if (!id || !daten || !Array.isArray(daten.spiele)) return daten;
      return ladeReiter(id, "Fotos", ["datum", "link"]).then(function (fotos) {
        fotos.forEach(function (f) {
          var tag = datumAusTabelle(f.datum);
          if (!tag || !/^https?:\/\//i.test(f.link)) return;
          var amTag = daten.spiele.filter(function (s) { return s.datum === tag; });
          var g = (f.gegner || "").toLowerCase();
          var treffer = (g && amTag.filter(function (s) { return String(s.gegner || "").toLowerCase().indexOf(g) >= 0; })[0]) || amTag[0];
          if (treffer) treffer.fotos = f.link;
        });
        return daten;
      }).catch(function (e) {
        console.warn("Google-Tabelle (Fotos):", e);
        return daten;
      });
    });
  }
  // Google-Drive-Links in einbettbare Adressen umwandeln
  function driveDateiId(url) {
    var m = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([a-zA-Z0-9_-]{10,})/.exec(String(url || ""));
    return m ? m[1] : "";
  }
  function driveOrdnerId(url) {
    var m = /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]{10,})/.exec(String(url || ""));
    return m ? m[1] : "";
  }
  function bildAdresse(pfad) {
    var id = driveDateiId(pfad);
    return id ? "https://drive.google.com/thumbnail?id=" + id + "&sz=w600" : String(pfad || "").trim();
  }

  function zeigeFehler(ziel, fehler) {
    if (!ziel) return;
    var meldung = fehler && fehler.message ? fehler.message : String(fehler);
    if (location.protocol === "file:") {
      meldung = "Die Seite wurde direkt als Datei geöffnet. Die Daten laden nur über einen Webserver, z.&nbsp;B. auf GitHub Pages.";
    }
    ziel.innerHTML = '<div class="fehler"><strong>Daten konnten nicht geladen werden.</strong><br>' + meldung + "</div>";
  }

  var WOCHENTAG = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var MONAT = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  var MONAT_LANG = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

  function datumLang(d) {
    return WOCHENTAG[d.getDay()] + ", " + d.getDate() + ". " + MONAT_LANG[d.getMonth()] + " " + d.getFullYear();
  }

  /* ---------- Spiele aufbereiten ---------- */
  function bereiteSpieleVor(daten) {
    var liste = (daten && Array.isArray(daten.spiele)) ? daten.spiele : [];
    var probleme = [];
    var spiele = [];

    liste.forEach(function (roh, i) {
      var nr = i + 1;
      var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(roh.datum || "").trim());
      if (!m) {
        probleme.push("Spiel Nr. " + nr + " (" + esc(roh.gegner || "ohne Gegner") + "): Datum „" + esc(roh.datum) + "“ bitte im Format JJJJ-MM-TT schreiben, z.&nbsp;B. 2026-11-29.");
        return;
      }
      var zeit = /^(\d{1,2}):(\d{2})$/.exec(String(roh.uhrzeit || "").trim());
      var d = new Date(+m[1], +m[2] - 1, +m[3], zeit ? +zeit[1] : 0, zeit ? +zeit[2] : 0);

      var tore = null;
      var erg = String(roh.ergebnis || "").trim();
      if (erg && !roh.status) {
        var e = /^(\d+)\s*[:\-]\s*(\d+)$/.exec(erg);
        if (e) tore = { wir: +e[1], die: +e[2] };
        else probleme.push("Spiel Nr. " + nr + " (" + esc(roh.gegner) + "): Ergebnis „" + esc(erg) + "“ bitte so schreiben: 2:1 (zuerst unsere Tore).");
      }

      var heim = roh.heim !== false;
      var ausgang = null;
      if (tore) ausgang = tore.wir > tore.die ? "s" : (tore.wir === tore.die ? "u" : "n");

      spiele.push({
        datum: d,
        hatUhrzeit: !!zeit,
        uhrzeit: zeit ? zeit[1].padStart(2, "0") + ":" + zeit[2] : "",
        gegner: roh.gegner || "Gegner offen",
        heim: heim,
        wettbewerb: roh.wettbewerb || "",
        tore: tore,
        ausgang: ausgang,
        fotos: String(roh.fotos || "").trim(),
        status: String(roh.status || "").trim(),
        liga: roh.typ ? roh.typ === "ME" : /liga/i.test(roh.wettbewerb || ""),
        ort: String(roh.ort || "").trim(),
        link: String(roh.link || "").trim()
      });
    });

    spiele.sort(function (a, b) { return a.datum - b.datum; });
    return { spiele: spiele, probleme: probleme, saison: daten && daten.saison };
  }

  function gespielt(spiele) { return spiele.filter(function (s) { return s.tore; }); }
  function kommend(spiele) {
    var heute = new Date(); heute.setHours(0, 0, 0, 0);
    return spiele.filter(function (s) { return !s.tore && !s.status && s.datum >= heute; });
  }
  function istAbgesagt(s) { return !!s.status; }
  function statusText(s) {
    return /absetz/i.test(s.status) ? "abgesagt" : s.status;
  }

  function heimGast(s) {
    var wir = '<span class="team wir">' + VEREIN_KURZ + "</span>";
    var die = '<span class="team">' + t(s.gegner) + "</span>";
    return s.heim ? [wir, die] : [die, wir];
  }
  function standText(s) {
    return s.heim ? s.tore.wir + ":" + s.tore.die : s.tore.die + ":" + s.tore.wir;
  }
  var AUSGANG = { s: "Sieg", u: "Unentschieden", n: "Niederlage" };
  var MARKER = { s: "S", u: "U", n: "N" };

  function spielKopf(s) {
    return '<div class="spiel-kopf">' +
      (s.wettbewerb ? '<span class="wettbewerb">' + t(s.wettbewerb) + "</span>" : "") +
      "<span>" + datumLang(s.datum) + (s.hatUhrzeit ? " · " + s.uhrzeit + " Uhr" : "") + "</span>" +
      "<span>" + (s.heim ? "Heimspiel" : "Auswärts") + "</span></div>";
  }

  function paarung(s, mitErgebnis) {
    var t2 = heimGast(s);
    var mitte = mitErgebnis && s.tore
      ? '<span class="stand" aria-label="Endstand ' + standText(s) + '">' + standText(s) + "</span>"
      : '<span class="stand offen">' + (s.hatUhrzeit ? s.uhrzeit : "vs.") + "</span>";
    return '<div class="paarung">' + t2[0] + mitte + t2[1] + "</div>";
  }

  function countdown(s) {
    var heute = new Date(); heute.setHours(0, 0, 0, 0);
    var tag = new Date(s.datum); tag.setHours(0, 0, 0, 0);
    var diff = Math.round((tag - heute) / 86400000);
    if (diff === 0) return "Heute ist Spieltag!";
    if (diff === 1) return "Morgen ist Spieltag";
    return "Noch " + diff + " Tage";
  }

  function problemHinweis(probleme) {
    if (!probleme.length) return "";
    return '<div class="hinweis-platzhalter"><strong>Hinweis zu spiele.json:</strong><ul style="margin:.4em 0 0;padding-left:1.2em">' +
      probleme.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul></div>";
  }

  function zeileHtml(s) {
    var rechts = istAbgesagt(s)
      ? '<span class="status">' + esc(statusText(s)) + "</span>"
      : s.tore
      ? '<span class="resultat"><span class="text-' + s.ausgang + '">' + standText(s) + '</span><span class="marker ' + s.ausgang + '" title="' + AUSGANG[s.ausgang] + '">' + MARKER[s.ausgang] + "</span></span>"
      : (s.datum < new Date() ? '<span class="status">Ergebnis folgt</span>' : '<span class="uhr">' + (s.hatUhrzeit ? s.uhrzeit : "–") + "</span>");
    var gegnerZeile = (s.heim ? VEREIN_KURZ + " – " + t(s.gegner) : t(s.gegner) + " – " + VEREIN_KURZ);
    var stark = sichererLink(s.link) ? '<a href="' + esc(s.link) + '" target="_blank" rel="noopener">' + gegnerZeile + "</a>" : gegnerZeile;
    return '<li class="zeile' + (istAbgesagt(s) ? " abgesagt" : "") + '">' +
      '<span class="datum"><b>' + s.datum.getDate() + "</b><small>" + MONAT[s.datum.getMonth()] + "</small></span>" +
      '<span class="info"><strong>' + stark + "</strong><small>" + WOCHENTAG[s.datum.getDay()] + " · " +
      (s.heim ? "Heim" : "Auswärts") + (s.wettbewerb ? " · " + t(s.wettbewerb) : "") + "</small></span>" +
      rechts + "</li>";
  }

  function bilanzHtml(spiele) {
    var g = gespielt(spiele).filter(function (s) { return s.liga; });
    var z = { s: 0, u: 0, n: 0, tw: 0, td: 0 };
    g.forEach(function (s) { z[s.ausgang]++; z.tw += s.tore.wir; z.td += s.tore.die; });
    return '<div class="bilanz">' +
      "<div><b>" + z.s + "</b><span>Siege</span></div>" +
      "<div><b>" + z.u + "</b><span>Remis</span></div>" +
      "<div><b>" + z.n + "</b><span>Niederl.</span></div>" +
      "<div><b>" + z.tw + ":" + z.td + "</b><span>Tore</span></div></div>" +
      '<p class="bilanz-hinweis">' + g.length + " Ligaspiele · Freundschafts- und Pokalspiele nicht mitgezählt</p>";
  }

  /* Spielort: auswärts die Adresse von fussball.de, daheim unsere Vereinsadresse.
     (Liegt ein Heimspiel laut fussball.de in einem anderen Ort, z. B. ein Turnier, gilt fussball.de.) */
  function spielort(s, verein) {
    var k = (verein && verein.kontakt) || {};
    var unsere = !istPlatzhalter(k.sportplatz) && k.sportplatz ? k.sportplatz : (!istPlatzhalter(k.vereinsadresse) ? k.vereinsadresse || "" : "");
    var teile = s.ort ? s.ort.split(",").map(function (x) { return x.trim(); }) : [];
    // fussball.de: "Platzart, Sportstätte, Straße, PLZ Ort"
    var fd = teile.length >= 3 ? { platz: teile.slice(0, teile.length - 2).join(", "), adresse: teile.slice(-2).join(", ") } : { platz: "", adresse: s.ort };
    if (s.heim && unsere && (!s.ort || /genthin/i.test(teile[teile.length - 1] || ""))) {
      return { platz: "Heimspiel – " + (fd.platz || "Stadion Genthin"), adresse: unsere };
    }
    return fd;
  }

  /* ---------- Seiten ---------- */
  function seiteStart() {
    var ziel = document.getElementById("inhalt");
    Promise.all([ladeSpiele(), ladeVereinRoh().catch(function () { return {}; })]).then(function (r) {
      var daten = r[0], verein = r[1];
      var v = bereiteSpieleVor(daten);
      var naechstes = kommend(v.spiele)[0];
      var g = gespielt(v.spiele);
      var letztes = g[g.length - 1];

      var html = problemHinweis(v.probleme) + '<div class="raster raster-2">';

      html += '<section class="karte"><p class="etikett">Nächstes Spiel</p>';
      if (naechstes) {
        html += spielKopf(naechstes) + paarung(naechstes, false) + '<p class="countdown">' + countdown(naechstes) + "</p>";
        var ort = spielort(naechstes, verein);
        if (ort.adresse) {
          html += '<p class="spielort">' + icon("ort") + "<span>" + (ort.platz ? "<strong>" + esc(ort.platz) + "</strong><br>" : "") + esc(ort.adresse) + "</span></p>" +
            '<div class="buttons"><a class="button zweit" href="https://www.google.com/maps/search/?api=1&amp;query=' +
            encodeURIComponent(ort.adresse) + '" target="_blank" rel="noopener">' + icon("ort") + "Route zum Spielort</a></div>";
        }
      } else {
        html += '<p class="leer">Aktuell ist kein Spiel angesetzt.</p>';
      }
      html += "</section>";

      html += '<section class="karte"><p class="etikett">Letztes Ergebnis</p>';
      if (letztes) {
        html += spielKopf(letztes) + paarung(letztes, true) +
          '<p class="ergebnis-hinweis text-' + letztes.ausgang + '">' + AUSGANG[letztes.ausgang] + "</p>";
        var knoepfe = "";
        if (sichererLink(letztes.fotos)) knoepfe += '<a class="button" href="' + esc(letztes.fotos) + '" target="_blank" rel="noopener">' + icon("galerie") + "Fotos vom Spiel</a>";
        if (sichererLink(letztes.link)) knoepfe += '<a class="button zweit" href="' + esc(letztes.link) + '" target="_blank" rel="noopener">' + icon("link") + "Spiel auf fussball.de</a>";
        if (knoepfe) html += '<div class="buttons">' + knoepfe + "</div>";
      } else {
        html += '<p class="leer">Noch keine Ergebnisse in dieser Saison.</p>';
      }
      html += "</section></div>";

      html += '<section><div class="abschnitt-kopf"><h2>Kreisliga ' + (v.saison ? esc(v.saison) : "") + '</h2><a href="spielplan.html">Alle Spiele →</a></div>' +
        '<div class="karte">' + bilanzHtml(v.spiele) + "</div></section>";

      var weitere = kommend(v.spiele).slice(1, 4);
      if (weitere.length) {
        html += '<section><div class="abschnitt-kopf"><h2>Danach</h2><a href="spielplan.html">Spielplan →</a></div>' +
          '<div class="karte"><ul class="liste">' + weitere.map(zeileHtml).join("") + "</ul></div></section>";
      }

      ziel.innerHTML = html;
    }).catch(function (e) { zeigeFehler(ziel, e); });
  }

  function seiteSpielplan() {
    var ziel = document.getElementById("inhalt");
    ladeSpiele().then(function (daten) {
      var v = bereiteSpieleVor(daten);
      var offen = kommend(v.spiele);
      var heute0 = new Date(); heute0.setHours(0, 0, 0, 0);
      var fertig = v.spiele.filter(function (s) { return s.tore || s.datum < heute0; }).reverse();

      ziel.innerHTML = problemHinweis(v.probleme) +
        '<div class="karte" style="margin-bottom:14px">' + bilanzHtml(v.spiele) + "</div>" +
        '<div class="reiter" role="tablist">' +
        '<button role="tab" id="tab-k" aria-controls="panel-k" aria-selected="true">Kommende (' + offen.length + ")</button>" +
        '<button role="tab" id="tab-e" aria-controls="panel-e" aria-selected="false">Ergebnisse (' + fertig.length + ")</button></div>" +
        '<div class="karte" role="tabpanel" id="panel-k" aria-labelledby="tab-k">' +
        (offen.length ? '<ul class="liste">' + offen.map(zeileHtml).join("") + "</ul>" : '<p class="leer">Keine kommenden Spiele eingetragen.</p>') + "</div>" +
        '<div class="karte" role="tabpanel" id="panel-e" aria-labelledby="tab-e" hidden>' +
        (fertig.length ? '<ul class="liste">' + fertig.map(zeileHtml).join("") + "</ul>" : '<p class="leer">Noch keine Ergebnisse.</p>') + "</div>";

      var tabs = ziel.querySelectorAll('[role="tab"]');
      function waehle(id) {
        tabs.forEach(function (b) {
          var aktiv = b.id === id;
          b.setAttribute("aria-selected", aktiv);
          document.getElementById(b.getAttribute("aria-controls")).hidden = !aktiv;
        });
      }
      tabs.forEach(function (b) { b.addEventListener("click", function () { waehle(b.id); }); });
      if (location.hash === "#ergebnisse") waehle("tab-e");
    }).catch(function (e) { zeigeFehler(ziel, e); });
  }

  function seiteGalerie() {
    var ziel = document.getElementById("inhalt");
    ladeSpiele().then(function (daten) {
      var v = bereiteSpieleVor(daten);
      var liste = v.spiele.filter(function (s) { return s.tore || sichererLink(s.fotos); }).reverse();
      if (!liste.length) {
        ziel.innerHTML = problemHinweis(v.probleme) + '<div class="karte"><p class="leer">Noch keine Spiele mit Fotos.</p></div>';
        return;
      }
      ziel.innerHTML = problemHinweis(v.probleme) + '<div class="raster raster-3">' + liste.map(function (s) {
        var button;
        var ordner = driveOrdnerId(s.fotos);
        if (sichererLink(s.fotos)) {
          button = (ordner ? '<button type="button" class="button zweit fotos-zeigen" data-ordner="' + esc(ordner) + '">' + icon("galerie") + "Fotos hier anzeigen</button>" : "") +
            '<a class="button" href="' + esc(s.fotos) + '" target="_blank" rel="noopener">' + icon("download") + "Fotos ansehen &amp; herunterladen</a>";
        } else if (istPlatzhalter(s.fotos)) {
          button = '<span class="button platzhalter" aria-disabled="true">Drive-Link fehlt (PLATZHALTER)</span>';
        } else {
          button = '<span class="button" aria-disabled="true">Fotos folgen in Kürze</span>';
        }
        return '<article class="karte galerie-karte"><div class="oben">' + spielKopf(s) + paarung(s, true) + "</div>" +
          '<div class="unten">' + button + "</div></article>";
      }).join("") + "</div>" +
        '<p class="bilanz-hinweis">Tipp: In Google Drive oben rechts auf <strong>⋮ → Alle herunterladen</strong> tippen, um alle Fotos eines Spiels auf einmal zu speichern.</p>';
      // Fotos direkt in der Karte einblenden (Google-Drive-Ordneransicht)
      ziel.querySelectorAll(".fotos-zeigen").forEach(function (b) {
        b.addEventListener("click", function () {
          var rahmen = document.createElement("iframe");
          rahmen.className = "drive-ordner";
          rahmen.title = "Fotos vom Spiel";
          rahmen.loading = "lazy";
          rahmen.src = "https://drive.google.com/embeddedfolderview?id=" + encodeURIComponent(b.getAttribute("data-ordner")) + "#grid";
          b.parentNode.insertBefore(rahmen, b);
          b.remove();
        });
      });
    }).catch(function (e) { zeigeFehler(ziel, e); });
  }

  function initialen(name) {
    if (istPlatzhalter(name)) return "?";
    return String(name).split(/\s+/).filter(Boolean).map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase();
  }

  function personKarte(p, unterzeile, nummer) {
    var bild = sichererBild(p.foto)
      ? '<img src="' + esc(bildAdresse(p.foto)) + '" referrerpolicy="no-referrer" alt="' + esc(p.name) + '" loading="lazy">'
      : "<span>" + esc(initialen(p.name)) + "</span>";
    return '<div class="karte spieler"><div class="bild">' + bild +
      (nummer != null && nummer !== "" ? '<span class="nummer">' + esc(nummer) + "</span>" : "") +
      '</div><div class="name"><strong>' + t(p.name) + "</strong><small>" + t(unterzeile) + "</small></div></div>";
  }
  function sichererBild(pfad) {
    pfad = String(pfad || "").trim();
    return pfad && !istPlatzhalter(pfad) && !/^(javascript|data):/i.test(pfad);
  }

  function seiteMannschaft() {
    var ziel = document.getElementById("inhalt");
    ladeVerein().then(function (daten) {
      var spieler = Array.isArray(daten.spieler) ? daten.spieler : [];
      var trainer = Array.isArray(daten.trainer) ? daten.trainer : [];
      var reihenfolge = ["Tor", "Abwehr", "Mittelfeld", "Sturm"];
      var gruppen = {};
      spieler.forEach(function (p) {
        var pos = p.position || "Weitere";
        (gruppen[pos] = gruppen[pos] || []).push(p);
      });
      Object.keys(gruppen).forEach(function (k) { if (reihenfolge.indexOf(k) < 0) reihenfolge.push(k); });

      var html = "";
      if (trainer.length) {
        html += '<section><h2>Trainerteam</h2><div class="spieler-raster">' +
          trainer.map(function (p) { return personKarte(p, p.rolle || "Trainer", null); }).join("") + "</div></section>";
      }
      reihenfolge.forEach(function (pos) {
        var g = gruppen[pos];
        if (!g) return;
        g.sort(function (a, b) { return (+a.nummer || 999) - (+b.nummer || 999); });
        html += "<section><h2>" + esc(pos) + '</h2><div class="spieler-raster">' +
          g.map(function (p) { return personKarte(p, pos, p.nummer); }).join("") + "</div></section>";
      });
      ziel.innerHTML = html || '<div class="karte"><p class="leer">Noch keine Spieler eingetragen.</p></div>';
    }).catch(function (e) { zeigeFehler(ziel, e); });
  }

  function seiteKontakt() {
    var ziel = document.getElementById("inhalt");
    ladeVereinRoh().then(function (daten) {
      var k = daten.kontakt || {};
      var zeilen = [];
      if (k.ansprechpartner) zeilen.push(["person", k.funktion || "Ansprechpartner", t(k.ansprechpartner)]);
      if (k.telefon) {
        var tel = String(k.telefon).replace(/[^\d+]/g, "");
        zeilen.push(["telefon", "Telefon", istPlatzhalter(k.telefon) ? t(k.telefon) : '<a href="tel:' + esc(tel) + '">' + esc(k.telefon) + "</a>"]);
      }
      if (k.email) zeilen.push(["kontakt", "E-Mail", istPlatzhalter(k.email) ? t(k.email) : '<a href="mailto:' + esc(k.email) + '">' + esc(k.email) + "</a>"]);
      if (k.vereinsadresse) zeilen.push(["ort", "Vereinsadresse", t(k.vereinsadresse)]);

      var links = [["instagram", "Instagram"], ["facebook", "Facebook"], ["fussballde", "fussball.de"]]
        .filter(function (l) { return sichererLink(k[l[0]]); })
        .map(function (l) { return '<a class="button zweit" href="' + esc(k[l[0]]) + '" target="_blank" rel="noopener">' + icon("link") + l[1] + "</a>"; });

      var karte = k.sportplatz && !istPlatzhalter(k.sportplatz)
        ? '<div class="buttons"><a class="button" href="https://www.google.com/maps/search/?api=1&amp;query=' + encodeURIComponent(k.sportplatz) + '" target="_blank" rel="noopener">' + icon("ort") + "Route zum Sportplatz</a></div>"
        : "";

      var training = Array.isArray(k.training) ? k.training : [];

      ziel.innerHTML = '<div class="raster raster-2">' +
        '<section class="karte"><h2>Ansprechpartner</h2><ul class="kontakt-liste">' +
        zeilen.map(function (z) { return "<li>" + icon(z[0]) + "<div><small>" + esc(z[1]) + "</small>" + z[2] + "</div></li>"; }).join("") +
        "</ul>" + (k.email && !istPlatzhalter(k.email) ? '<div class="buttons"><a class="button" href="mailto:' + esc(k.email) + '">' + icon("kontakt") + "E-Mail schreiben</a></div>" : "") +
        "</section>" +
        '<section class="karte"><h2>Sportplatz</h2><ul class="kontakt-liste"><li>' + icon("ort") + "<div><small>Adresse</small>" + t(k.sportplatz || "–") + "</div></li></ul>" + karte + "</section>" +
        (training.length ? '<section class="karte"><h2>Training</h2><table class="training"><tbody>' +
          training.map(function (z) { return "<tr><td>" + t(z.tag) + "</td><td>" + t(z.zeit) + "</td></tr>"; }).join("") +
          '</tbody></table><p style="margin:.8em 0 0;color:var(--text-leise);font-size:.9rem">Neue Spieler sind jederzeit willkommen – komm einfach zum Probetraining vorbei!</p></section>' : "") +
        (links.length ? '<section class="karte"><h2>Folge uns</h2><div class="buttons">' + links.join("") + "</div></section>" : "") +
        "</div>";
    }).catch(function (e) { zeigeFehler(ziel, e); });
  }

  baueRahmen();
  var ROUTEN = { start: seiteStart, spielplan: seiteSpielplan, galerie: seiteGalerie, mannschaft: seiteMannschaft, kontakt: seiteKontakt };
  if (ROUTEN[seite]) ROUTEN[seite]();
})();
