/**
 * SV Fortuna Genthin – Foto-Ordner automatisch anlegen
 * =====================================================
 * Google-Apps-Script für die Google-Tabelle „Fortuna Tabelle“.
 *
 * - liest alle Spiele der Saison von https://sv-fortuna-genthin.github.io/daten/spiele.json
 * - legt im Drive-Ordner „Fortuna Fotos“ je Spiel einen Unterordner an, z. B. „2026-11-29 Wörmlitzer SV 90“
 * - stellt jeden Ordner auf „Jeder mit dem Link – Betrachter“
 * - trägt Datum, Gegner und Ordner-Link im Reiter „Fotos“ ein
 * - legt nichts doppelt an (vorhandene Ordner und Zeilen werden erkannt)
 * - abgesagte Spiele werden übersprungen
 *
 * Bedienung: Einmal die Funktion „einrichten“ ausführen. Sie legt sofort alle Ordner an
 * und startet das Skript danach automatisch einmal täglich (nur neue Spiele).
 */

var SPIELE_URL = "https://sv-fortuna-genthin.github.io/daten/spiele.json";
var ORDNER_NAME = "Fortuna Fotos";
var REITER_NAME = "Fotos";
var STUNDE = 6; // tägliche Ausführung zwischen 6 und 7 Uhr

/** Einmal ausführen: alle Ordner anlegen + täglichen Start einrichten. */
function einrichten() {
  ordnerAnlegen();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "ordnerAnlegen") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("ordnerAnlegen").timeBased().everyDays(1).atHour(STUNDE).create();
  Logger.log("Fertig. Ab jetzt läuft das Skript jeden Tag automatisch zwischen %s und %s Uhr.", STUNDE, STUNDE + 1);
}

/** Menü „Fortuna“ in der Tabelle (am Computer) zum Starten per Hand. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu("Fortuna")
    .addItem("Foto-Ordner jetzt anlegen", "ordnerAnlegen")
    .addItem("Täglichen Start einrichten", "einrichten")
    .addToUi();
}

/** Hauptfunktion: legt fehlende Ordner und Zeilen an. */
function ordnerAnlegen() {
  var sperre = LockService.getScriptLock();
  if (!sperre.tryLock(30000)) return;
  try {
    var spiele = spieleLaden_();
    var hauptordner = hauptordner_();
    var reiter = reiter_();
    var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();

    // Vorhandene Zeilen lesen; Datum immer als Text "JJJJ-MM-TT" speichern,
    // damit die Webseite es sicher erkennt.
    reiter.getRange("A:A").setNumberFormat("@");
    var letzte = reiter.getLastRow();
    var zeilen = letzte > 1 ? reiter.getRange(2, 1, letzte - 1, 3).getValues() : [];
    zeilen = zeilen.map(function (z) {
      return [datumText_(z[0], tz), String(z[1] || "").trim(), String(z[2] || "").trim()];
    }).filter(function (z) { return z[0] || z[1] || z[2]; });

    var neu = 0, ergaenzt = 0;
    spiele.forEach(function (s) {
      var name = s.datum + " " + s.gegner.replace(/[\/\\]/g, "-");
      var zeile = passendeZeile_(zeilen, s);
      if (zeile && istLink_(zeile[2])) return; // schon erledigt

      var ordner = unterordner_(hauptordner, name);
      var link = ordner.getUrl();
      if (zeile) {
        zeile[2] = link; // Zeile ohne gültigen Link (z. B. Beispielzeile) ergänzen
        ergaenzt++;
      } else {
        zeilen.push([s.datum, s.gegner, link]);
        neu++;
      }
    });

    // Sortiert zurückschreiben
    zeilen.sort(function (a, b) { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0; });
    if (letzte > 1) reiter.getRange(2, 1, letzte - 1, 3).clearContent();
    if (zeilen.length) reiter.getRange(2, 1, zeilen.length, 3).setValues(zeilen);
    Logger.log("%s neue Spiele eingetragen, %s Zeilen ergänzt, %s Spiele insgesamt.", neu, ergaenzt, spiele.length);
  } finally {
    sperre.releaseLock();
  }
}

/* ---------- Hilfsfunktionen ---------- */

function spieleLaden_() {
  var antwort = UrlFetchApp.fetch(SPIELE_URL + "?t=" + Date.now(), { muteHttpExceptions: true });
  if (antwort.getResponseCode() !== 200) throw new Error("spiele.json nicht erreichbar (" + antwort.getResponseCode() + ")");
  var daten = JSON.parse(antwort.getContentText("UTF-8"));
  return (daten.spiele || []).filter(function (s) {
    return /^\d{4}-\d{2}-\d{2}$/.test(s.datum || "") && s.gegner && !s.status; // abgesagte überspringen
  }).map(function (s) {
    return { datum: s.datum, gegner: String(s.gegner).trim() };
  });
}

function hauptordner_() {
  var it = DriveApp.getFoldersByName(ORDNER_NAME);
  var ordner = it.hasNext() ? it.next() : DriveApp.createFolder(ORDNER_NAME);
  teilen_(ordner);
  return ordner;
}

function unterordner_(hauptordner, name) {
  var it = hauptordner.getFoldersByName(name);
  var ordner = it.hasNext() ? it.next() : hauptordner.createFolder(name);
  teilen_(ordner);
  return ordner;
}

function teilen_(ordner) {
  try {
    if (ordner.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK ||
        ordner.getSharingPermission() !== DriveApp.Permission.VIEW) {
      ordner.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }
  } catch (e) {
    Logger.log("Freigabe für „%s“ nicht möglich: %s", ordner.getName(), e.message);
  }
}

function reiter_() {
  var tabelle = SpreadsheetApp.getActiveSpreadsheet();
  var reiter = tabelle.getSheetByName(REITER_NAME);
  if (!reiter) {
    reiter = tabelle.insertSheet(REITER_NAME);
  }
  if (!String(reiter.getRange("A1").getValue()).trim()) {
    reiter.getRange(1, 1, 1, 3).setValues([["Datum", "Gegner", "Link"]]).setFontWeight("bold");
  }
  return reiter;
}

/** Findet die Zeile zu einem Spiel: gleiches Datum und gleicher Gegner (auch Teil des Namens, z. B. „Hohenwarthe“). */
function passendeZeile_(zeilen, s) {
  var g = s.gegner.toLowerCase();
  var amTag = zeilen.filter(function (z) { return z[0] === s.datum; });
  return amTag.filter(function (z) {
    var zg = z[1].toLowerCase();
    return zg && (g.indexOf(zg) >= 0 || zg.indexOf(g) >= 0);
  })[0] || amTag.filter(function (z) { return !z[1]; })[0] || null;
}

function datumText_(wert, tz) {
  if (wert instanceof Date) return Utilities.formatDate(wert, tz, "yyyy-MM-dd");
  var t = String(wert || "").trim();
  var m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
  if (m) return m[1] + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[3]).slice(-2);
  m = /^(\d{1,2})[.\/](\d{1,2})[.\/](\d{2,4})/.exec(t);
  if (m) return (m[3].length === 2 ? "20" + m[3] : m[3]) + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[1]).slice(-2);
  return t;
}

function istLink_(wert) {
  return /^https?:\/\//i.test(String(wert || ""));
}
