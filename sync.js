/* Dranbleiben — Geräte-Sync über Supabase.
   Bewusst ohne SDK: nur fetch gegen die Web-Schnittstelle, damit die App
   offline-fähig bleibt und nichts nachlädt. */

window.SUPABASE_CONFIG = {
  url: "https://ophvhlfbkqhvweyjkvmz.supabase.co",
  // Öffentlicher Publishable-Key — gehört bewusst in den Client und darf im Repo stehen.
  // Geschützt werden die Daten durch die Row-Level-Security-Regeln (siehe supabase-setup.sql).
  anonKey: "sb_publishable_YTKzrLzQH1fMwQBnPK7ahw_KrxFtMdX"
};

(function () {
  "use strict";
  var C = window.SUPABASE_CONFIG;
  var SESS_KEY = "dranbleiben.session";
  var session = null;   // { access_token, refresh_token, expires_at, user }

  function configured() { return !!(C && C.url && C.anonKey); }

  try { session = JSON.parse(localStorage.getItem(SESS_KEY) || "null"); } catch (e) {}
  function storeSession(s) {
    session = s;
    try {
      if (s) localStorage.setItem(SESS_KEY, JSON.stringify(s));
      else localStorage.removeItem(SESS_KEY);
    } catch (e) {}
    if (Remote.onAuthChange) { try { Remote.onAuthChange(Remote.user()); } catch (e) {} }
  }

  function api(path, opts) {
    opts = opts || {};
    var headers = opts.headers || {};
    headers["apikey"] = C.anonKey;
    headers["Content-Type"] = "application/json";
    if (opts.auth !== false && session && session.access_token) {
      headers["Authorization"] = "Bearer " + session.access_token;
    }
    return fetch(C.url.replace(/\/+$/, "") + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      return r.text().then(function (t) {
        var j = null;
        try { j = t ? JSON.parse(t) : null; } catch (e) {}
        if (!r.ok) {
          var msg = (j && (j.error_description || j.msg || j.message || j.error)) || ("HTTP " + r.status);
          var err = new Error(msg); err.status = r.status; err.body = j;
          throw err;
        }
        return j;
      });
    });
  }

  function saveAuth(j) {
    if (!j || !j.access_token) throw new Error("Keine Anmeldedaten erhalten.");
    storeSession({
      access_token: j.access_token,
      refresh_token: j.refresh_token,
      expires_at: Date.now() + ((j.expires_in || 3600) - 60) * 1000,
      user: j.user ? { id: j.user.id, email: j.user.email } : (session && session.user) || null
    });
    return Remote.user();
  }

  // Access-Token läuft nach ~1 h ab -> rechtzeitig erneuern.
  function ensureFresh() {
    if (!session) return Promise.reject(new Error("Nicht angemeldet."));
    if (session.expires_at && Date.now() < session.expires_at) return Promise.resolve();
    if (!session.refresh_token) return Promise.reject(new Error("Sitzung abgelaufen."));
    return api("/auth/v1/token?grant_type=refresh_token", {
      method: "POST", auth: false, body: { refresh_token: session.refresh_token }
    }).then(saveAuth).catch(function (e) { storeSession(null); throw e; });
  }

  var Remote = {
    onAuthChange: null,

    configured: configured,
    user: function () { return (session && session.user) || null; },

    signUp: function (email, password) {
      return api("/auth/v1/signup", { method: "POST", auth: false, body: { email: email, password: password } })
        .then(function (j) {
          // Ist Mailbestätigung aktiv, kommt kein Token zurück.
          if (!j || !j.access_token) { var e = new Error("BESTAETIGUNG_NOETIG"); e.code = "confirm"; throw e; }
          return saveAuth(j);
        });
    },

    signIn: function (email, password) {
      return api("/auth/v1/token?grant_type=password", {
        method: "POST", auth: false, body: { email: email, password: password }
      }).then(saveAuth);
    },

    signOut: function () {
      var had = !!session;
      var p = had ? api("/auth/v1/logout", { method: "POST" }).catch(function () {}) : Promise.resolve();
      return p.then(function () { storeSession(null); });
    },

    /* Liefert { data, updated_at } oder null, wenn noch nichts gespeichert ist. */
    pull: function () {
      if (!configured() || !session) return Promise.resolve(null);
      return ensureFresh().then(function () {
        return api("/rest/v1/vaults?select=data,updated_at&user_id=eq." + session.user.id);
      }).then(function (rows) {
        if (!rows || !rows.length) return null;
        return { data: rows[0].data, updated_at: rows[0].updated_at };
      });
    },

    /* Schreibt den kompletten Zustand (anlegen oder überschreiben). */
    push: function (state) {
      if (!configured() || !session) return Promise.resolve(false);
      return ensureFresh().then(function () {
        return api("/rest/v1/vaults?on_conflict=user_id", {
          method: "POST",
          headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
          body: [{ user_id: session.user.id, data: state, updated_at: new Date().toISOString() }]
        });
      }).then(function () { return true; });
    }
  };

  window.Remote = Remote;
})();
