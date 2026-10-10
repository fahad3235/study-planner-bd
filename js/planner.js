/* Study Planner BD — core logic: countdown math, revision-weight progress, focus engine, store.
   Pure functions take an explicit "asof" date so tests can freeze "today". */
(function (global) {
  "use strict";

  const DAY_MS = 86400000;
  const STORE_KEY = "study-planner-bd-v1";
  const MAX_PASSES = 3; // Not started(0) -> 1st -> 2nd -> Done(3)

  // --- date helpers ---------------------------------------------------------
  // Strict ISO YYYY-MM-DD parse; returns a local-midnight Date or null.
  function parseISODate(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
    return d;
  }

  function midnight(d) {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
  }

  // Whole days from asof (default: real today) to dateStr. Negative = past.
  function daysUntil(dateStr, asofStr) {
    const target = parseISODate(dateStr);
    if (!target) return null;
    const base = asofStr ? parseISODate(asofStr) : new Date();
    if (!base) return null;
    return Math.round((midnight(target) - midnight(base)) / DAY_MS);
  }

  // Urgency bucket for a countdown value.
  function examState(days) {
    if (days === null || days === undefined) return "none";
    if (days < 0) return "passed";
    if (days === 0) return "today";
    if (days === 1) return "tomorrow";
    if (days <= 7) return "week";
    return "plenty";
  }

  // --- progress --------------------------------------------------------------
  // Each revision pass counts 1/3 of a topic. 0 topics => 0%.
  function subjectProgress(subject) {
    const topics = subject.topics || [];
    if (!topics.length) return 0;
    const earned = topics.reduce((a, t) => a + Math.min(MAX_PASSES, t.passes | 0), 0);
    return (earned / (MAX_PASSES * topics.length)) * 100;
  }

  // Overall readiness: all passes earned / all passes possible, across subjects.
  function overallProgress(subjects) {
    let earned = 0, possible = 0;
    (subjects || []).forEach((s) => {
      (s.topics || []).forEach((t) => {
        earned += Math.min(MAX_PASSES, t.passes | 0);
        possible += MAX_PASSES;
      });
    });
    return possible ? (earned / possible) * 100 : 0;
  }

  function cyclePasses(p) {
    return (((p | 0) + 1) % (MAX_PASSES + 1));
  }

  // --- focus engine ------------------------------------------------------------
  // Pick the nearest upcoming exam's least-completed topic.
  // Overdue/no-date subjects sort after upcoming ones; fully-done subjects excluded.
  function suggestFocus(subjects, asofStr) {
    const incomplete = (subjects || []).filter((s) =>
      (s.topics || []).some((t) => (t.passes | 0) < MAX_PASSES)
    );
    if (!incomplete.length) return null;
    const ranked = incomplete.map((s) => {
      const d = s.examDate ? daysUntil(s.examDate, asofStr) : null;
      const key = d === null || d < 0 ? Infinity : d;
      return { s, key };
    });
    ranked.sort((a, b) => a.key - b.key);
    const pick = ranked[0].s;
    const topic = pick.topics
      .filter((t) => (t.passes | 0) < MAX_PASSES)
      .sort((a, b) => (a.passes | 0) - (b.passes | 0))[0];
    return { subjectId: pick.id, topicId: topic.id };
  }

  // --- store -------------------------------------------------------------------
  function blankState() {
    return { lang: "en", subjects: [] };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return blankState();
      const st = JSON.parse(raw);
      if (!st || !Array.isArray(st.subjects)) return blankState();
      return { lang: st.lang === "bn" ? "bn" : "en", subjects: st.subjects };
    } catch (e) {
      return blankState();
    }
  }

  function save(state) {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }

  function uid() {
    return "id" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }

  const COLORS = ["#2563eb", "#16a34a", "#d97706", "#7c3aed", "#dc2626", "#0891b2", "#db2777", "#65a30d"];

  global.Planner = {
    DAY_MS, MAX_PASSES, COLORS, STORE_KEY,
    parseISODate, daysUntil, examState,
    subjectProgress, overallProgress, cyclePasses, suggestFocus,
    load, save, blankState, uid
  };
})(window);
