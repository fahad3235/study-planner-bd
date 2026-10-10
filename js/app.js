/* Study Planner BD — UI wiring, rendering, events, i18n application */
(function () {
  "use strict";

  const P = window.Planner;
  const ASOF = new URLSearchParams(location.search).get("asof"); // test hook: freeze "today"
  let state = P.load();

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  // --- i18n -------------------------------------------------------------------
  function t(key, vars) {
    const lang = state.lang;
    let s = (window.I18N.STRINGS[lang] && window.I18N.STRINGS[lang][key]) ||
            window.I18N.STRINGS.en[key] || key;
    if (vars) Object.keys(vars).forEach((k) => {
      s = s.replace("{" + k + "}", vars[k]);
    });
    return s;
  }

  function num(v) {
    return state.lang === "bn" ? window.I18N.bnNum(v) : String(v);
  }

  function fmtPct(x) {
    const r = Math.round(x * 10) / 10;
    const s = (r % 1 === 0) ? r.toFixed(0) : r.toFixed(1);
    return num(s) + "%";
  }

  function applyI18n() {
    document.documentElement.lang = state.lang === "bn" ? "bn" : "en";
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.getAttribute("data-i18n")); });
    $$("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.getAttribute("data-i18n-ph")); });
    $("#langToggle").textContent = state.lang === "bn" ? "English" : "বাংলা";
    document.title = t("appTitle") + " — " + (state.lang === "bn" ? "Study Planner BD" : "স্টাডি প্ল্যানার");
  }

  // --- countdown label ----------------------------------------------------------
  function countdownLabel(days) {
    const st = P.examState(days);
    if (st === "none") return { text: t("noExamDate"), cls: "none" };
    if (st === "passed") return { text: t("examPassed"), cls: "passed" };
    if (st === "today") return { text: t("today"), cls: "today" };
    if (st === "tomorrow") return { text: t("tomorrow"), cls: "tomorrow" };
    if (st === "week") return {
      text: days === 1 ? t("oneDayLeft") : t("daysLeft", { n: num(days) }), cls: "week"
    };
    return { text: t("daysLeft", { n: num(days) }), cls: "plenty" };
  }

  // --- render ---------------------------------------------------------------------
  function renderStats() {
    $("#statReadiness").textContent = fmtPct(P.overallProgress(state.subjects));
    $("#statSubjects").textContent = num(state.subjects.length);
    let done = 0, total = 0;
    state.subjects.forEach((s) => (s.topics || []).forEach((x) => {
      total++; if ((x.passes | 0) >= P.MAX_PASSES) done++;
    }));
    $("#statTopicsDone").textContent = num(done) + "/" + num(total);
    const upcoming = state.subjects
      .map((s) => ({ s, d: s.examDate ? P.daysUntil(s.examDate, ASOF) : null }))
      .filter((o) => o.d !== null && o.d >= 0)
      .sort((a, b) => a.d - b.d)[0];
    $("#statNearest").textContent = upcoming
      ? upcoming.s.name + " · " + num(upcoming.d) + (state.lang === "bn" ? "দি" : "d")
      : t("dash");
  }

  function renderFocus() {
    const body = $("#focusBody");
    const sug = P.suggestFocus(state.subjects, ASOF);
    if (!sug) {
      const anyTopics = state.subjects.some((s) => (s.topics || []).length);
      body.innerHTML = '<p class="hint">' + esc(anyTopics ? t("focusAllDone") : t("focusEmpty")) + "</p>";
      return;
    }
    const sub = state.subjects.find((s) => s.id === sug.subjectId);
    const topic = sub.topics.find((x) => x.id === sug.topicId);
    body.innerHTML =
      '<div class="focus-box">' +
        '<div class="focus-main">' +
          '<div class="focus-subject"><span class="dot" style="background:' + esc(sub.color) +
            ';display:inline-block;vertical-align:-2px;margin-right:6px"></span>' + esc(sub.name) + "</div>" +
          '<div class="focus-topic">' + esc(topic.name) + "</div>" +
          '<div class="hint">' + esc(t("suggestedMinutes", { n: num(topic.minutes) })) +
            " · " + esc(t("pass" + Math.min(P.MAX_PASSES, topic.passes | 0))) + "</div>" +
        "</div>" +
        '<button class="btn primary" id="focusDoneBtn">' + esc(t("markPassDone")) + "</button>" +
      "</div>";
    $("#focusDoneBtn").addEventListener("click", () => {
      topic.passes = Math.min(P.MAX_PASSES, (topic.passes | 0) + 1);
      persist();
      render();
    });
  }

  function renderExams() {
    const list = $("#examList");
    const withDates = state.subjects
      .filter((s) => s.examDate && P.parseISODate(s.examDate))
      .map((s) => ({ s, d: P.daysUntil(s.examDate, ASOF) }))
      .sort((a, b) => a.d - b.d);
    if (!withDates.length) {
      list.innerHTML = '<p class="hint">' + esc(t("noExams")) + "</p>";
      return;
    }
    const up = withDates.filter((o) => o.d >= 0);
    const past = withDates.filter((o) => o.d < 0);
    let html = "";
    if (up.length) {
      html += '<p class="hint">' + esc(t("upcomingExams")) + "</p>";
      up.forEach((o) => { html += examRow(o, false); });
    }
    if (past.length) {
      html += '<p class="hint" style="margin-top:10px">' + esc(t("pastExams")) + "</p>";
      past.forEach((o) => { html += examRow(o, true); });
    }
    list.innerHTML = html;
  }

  function examRow(o, isPast) {
    const lab = countdownLabel(o.d);
    const prog = fmtPct(P.subjectProgress(o.s));
    return '<div class="exam-row' + (isPast ? " past" : "") + '">' +
      '<span class="dot" style="background:' + esc(o.s.color) + '"></span>' +
      '<span class="exam-name">' + esc(o.s.name) + "</span>" +
      '<span class="badge ' + lab.cls + '">' + esc(lab.text) + "</span>" +
      '<span class="exam-meta">' + esc(t("readiness", { n: prog.replace("%", "") })) + "</span>" +
    "</div>";
  }

  function topicRow(sub, topic) {
    const p = Math.min(P.MAX_PASSES, topic.passes | 0);
    return '<div class="topic" data-topic-id="' + esc(topic.id) + '">' +
      '<span class="topic-name">' + esc(topic.name) + "</span>" +
      '<span class="topic-min">' + num(topic.minutes) + (state.lang === "bn" ? " মি" : " min") + "</span>" +
      '<button class="pass-pill p' + p + '" data-action="cycle" title="' + esc(t("pass" + p)) + '">' +
        esc(t("pass" + p)) + "</button>" +
      '<button class="icon-btn" data-action="del-topic" title="' + esc(t("deleteTopic")) + '">✕</button>' +
    "</div>";
  }

  function renderSubjects() {
    const list = $("#subjectList");
    $("#emptySubjects").style.display = state.subjects.length ? "none" : "";
    list.innerHTML = state.subjects.map((s) => {
      const days = s.examDate ? P.daysUntil(s.examDate, ASOF) : null;
      const lab = countdownLabel(days);
      const prog = P.subjectProgress(s);
      const topics = (s.topics || []).map((x) => topicRow(s, x)).join("") ||
        '<p class="hint">' + esc(t("noTopics")) + "</p>";
      return '<div class="subject subject-card" data-subject-id="' + esc(s.id) + '">' +
        '<div class="subject-head">' +
          '<span class="dot" style="background:' + esc(s.color) + '"></span>' +
          '<h3 class="subject-name">' + esc(s.name) + "</h3>" +
          '<span class="badge countdown-badge ' + lab.cls + '">' + esc(lab.text) + "</span>" +
          '<button class="icon-btn" data-action="del-subject" title="' + esc(t("deleteSubject")) + '">🗑</button>' +
        "</div>" +
        '<div class="progress" role="progressbar" aria-valuenow="' + Math.round(prog) + '">' +
          "<i style=\"width:" + prog.toFixed(1) + '%"></i></div>' +
        '<div class="progress-label">' + fmtPct(prog) + "</div>" +
        '<form class="topic-form" data-topic-form="' + esc(s.id) + '" novalidate>' +
          '<input type="text" class="topic-name-input" maxlength="80" placeholder="' + esc(t("topicNamePh")) + '">' +
          '<input type="number" class="topic-min-input" min="1" max="10080" placeholder="' + esc(t("minutesPh")) + '">' +
          '<button type="submit" class="btn small">' + esc(t("addTopic")) + "</button>" +
        "</form>" +
        '<p class="form-error" data-topic-error hidden></p>' +
        '<div class="topics">' + topics + "</div>" +
      "</div>";
    }).join("");
  }

  function render() {
    applyI18n();
    renderStats();
    renderFocus();
    renderExams();
    renderSubjects();
  }

  function persist() {
    P.save(state);
  }

  // --- actions ----------------------------------------------------------------------
  function showError(el, msg) {
    el.textContent = msg;
    el.hidden = !msg;
  }

  function addSubject(name, examDate) {
    const errEl = $("#subjectError"), warnEl = $("#subjectWarn");
    showError(errEl, ""); showError(warnEl, "");
    name = (name || "").trim();
    if (!name) { showError(errEl, t("errEmptyName")); return false; }
    if (state.subjects.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      showError(errEl, t("errDupName")); return false;
    }
    let date = null;
    if (examDate) {
      if (!P.parseISODate(examDate)) { showError(errEl, t("errBadDate")); return false; }
      date = examDate;
      const d = P.daysUntil(date, ASOF);
      if (d !== null && d > 5 * 365) showError(warnEl, t("errFarDate"));
    }
    const color = P.COLORS[state.subjects.length % P.COLORS.length];
    state.subjects.push({ id: P.uid(), name, color, examDate: date, topics: [] });
    persist(); render();
    return true;
  }

  function addTopic(subjectId, name, minutes) {
    const card = $('.subject-card[data-subject-id="' + subjectId + '"]');
    const errEl = card ? $('[data-topic-error]', card) : null;
    const fail = (msg) => { if (errEl) showError(errEl, msg); return false; };
    name = (name || "").trim();
    if (!name) return fail(t("errEmptyTopic"));
    const mins = Number(minutes);
    if (!Number.isFinite(mins) || mins <= 0) return fail(t("errBadMinutes"));
    const sub = state.subjects.find((s) => s.id === subjectId);
    if (!sub) return false;
    sub.topics.push({ id: P.uid(), name, minutes: Math.round(mins), passes: 0 });
    if (errEl) showError(errEl, "");
    persist(); render();
    return true;
  }

  function exportJSON() {
    return JSON.stringify({ app: "study-planner-bd", version: 1, exportedAt: new Date().toISOString(), state }, null, 2);
  }

  function importData(obj) {
    if (!obj || !obj.state || !Array.isArray(obj.state.subjects)) return false;
    try {
      const subs = obj.state.subjects.map((s) => ({
        id: String(s.id || P.uid()),
        name: String(s.name || "Untitled"),
        color: String(s.color || P.COLORS[0]),
        examDate: s.examDate && P.parseISODate(s.examDate) ? s.examDate : null,
        topics: (Array.isArray(s.topics) ? s.topics : []).map((x) => ({
          id: String(x.id || P.uid()),
          name: String(x.name || "Untitled"),
          minutes: Math.max(1, Math.round(Number(x.minutes) || 30)),
          passes: Math.min(P.MAX_PASSES, Math.max(0, x.passes | 0))
        }))
      }));
      state = { lang: obj.state.lang === "bn" ? "bn" : "en", subjects: subs };
      persist(); render();
      return true;
    } catch (e) {
      return false;
    }
  }

  function sampleData() {
    const dstr = (offsetDays) => {
      const d = new Date(); d.setDate(d.getDate() + offsetDays);
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return d.getFullYear() + "-" + m + "-" + day;
    };
    const mk = (name, color, examOff, topics) => ({
      id: P.uid(), name, color,
      examDate: examOff === null ? null : dstr(examOff),
      topics: topics.map((x) => ({ id: P.uid(), name: x[0], minutes: x[1], passes: x[2] | 0 }))
    });
    state.subjects = [
      mk("Data Structures", P.COLORS[0], 6, [
        ["Arrays & Linked Lists", 90, 3], ["Stacks & Queues", 60, 2],
        ["Trees & BST", 120, 1], ["Graphs & BFS/DFS", 120, 0]
      ]),
      mk("Computer Architecture", P.COLORS[3], 13, [
        ["Number Systems", 45, 3], ["ALU & Datapath", 90, 1], ["Pipelining", 90, 0]
      ]),
      mk("English", P.COLORS[1], null, [
        ["Essay Writing", 60, 1], ["Grammar Rules", 45, 0]
      ])
    ];
    persist(); render();
  }

  // --- events -------------------------------------------------------------------------
  function bind() {
    $("#subjectForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = addSubject($("#subjectName").value, $("#examDate").value);
      if (ok) { $("#subjectName").value = ""; $("#examDate").value = ""; $("#subjectName").focus(); }
    });

    $("#subjectList").addEventListener("submit", (e) => {
      const form = e.target.closest("[data-topic-form]");
      if (!form) return;
      e.preventDefault();
      const sid = form.getAttribute("data-topic-form");
      const name = $(".topic-name-input", form).value;
      const mins = $(".topic-min-input", form).value;
      addTopic(sid, name, mins);
    });

    $("#subjectList").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const card = e.target.closest(".subject-card");
      const sid = card.getAttribute("data-subject-id");
      const sub = state.subjects.find((s) => s.id === sid);
      if (!sub) return;
      const action = btn.getAttribute("data-action");
      if (action === "del-subject") {
        state.subjects = state.subjects.filter((s) => s.id !== sid);
      } else if (action === "del-topic") {
        const row = e.target.closest(".topic");
        const tid = row.getAttribute("data-topic-id");
        sub.topics = sub.topics.filter((x) => x.id !== tid);
      } else if (action === "cycle") {
        const row = e.target.closest(".topic");
        const tid = row.getAttribute("data-topic-id");
        const topic = sub.topics.find((x) => x.id === tid);
        topic.passes = P.cyclePasses(topic.passes);
      }
      persist(); render();
    });

    $("#sampleBtn").addEventListener("click", sampleData);

    $("#exportBtn").addEventListener("click", () => {
      const blob = new Blob([exportJSON()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "study-planner-bd-backup.json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    });

    $("#importBtn").addEventListener("click", () => $("#importFile").click());
    $("#importFile").addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        let ok = false;
        try { ok = importData(JSON.parse(r.result)); } catch (err) { ok = false; }
        if (!ok) alert(t("errBadImport"));
      };
      r.readAsText(f);
      e.target.value = "";
    });

    $("#clearBtn").addEventListener("click", () => {
      if (!state.subjects.length) return;
      if (confirm(t("confirmClear"))) {
        state.subjects = [];
        persist(); render();
      }
    });

    $("#langToggle").addEventListener("click", () => {
      state.lang = state.lang === "bn" ? "en" : "bn";
      persist(); render();
    });
  }

  // test hooks
  window.__app = {
    get state() { return state; },
    render, addSubject, addTopic, importData, exportJSON, sampleData, t, num, fmtPct, countdownLabel,
    get ASOF() { return ASOF; }
  };

  bind();
  render();
})();
