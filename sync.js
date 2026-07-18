/*
 * Dranbleiben — Cloud-Sync-Adapter (Platzhalter)
 *
 * Solange keine Supabase-Zugangsdaten eingetragen sind, läuft die App rein
 * LOKAL (offline-first, Daten im Browser). Sobald unten die Config gesetzt ist,
 * wird window.Remote mit { push(state), pull() } belegt und app.js synchronisiert
 * automatisch (siehe die Remote-Hooks in app.js: save() ruft Remote.push,
 * beim Start ruft die App Remote.pull).
 *
 * NÄCHSTER SCHRITT (wenn Supabase-Konto steht):
 *   1) url + anonKey unten eintragen.
 *   2) Supabase-Auth (Magic Link) + Tabelle `states` (user_id, data jsonb, updated_at)
 *      mit Row-Level-Security anbinden und window.Remote implementieren.
 */
window.SUPABASE_CONFIG = {
  url: "",       // z.B. "https://xxxx.supabase.co"
  anonKey: ""    // öffentlicher anon-Key (kein Secret; RLS schützt die Daten)
};

(function () {
  var c = window.SUPABASE_CONFIG;
  if (!c || !c.url || !c.anonKey) {
    // Nicht konfiguriert -> App bleibt lokal. Kein window.Remote.
    return;
  }
  // TODO: Supabase-Anbindung, sobald Keys vorhanden sind.
  // window.Remote = { push: function (state) { ... }, pull: function () { return Promise...; } };
})();
