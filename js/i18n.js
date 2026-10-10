/* Study Planner BD — full EN/BN UI strings */
(function (global) {
  const STRINGS = {
    en: {
      appTitle: "Study Planner BD",
      sampleData: "Sample data",
      export: "Export",
      import: "Import",
      clearAll: "Clear all",
      overallReadiness: "Overall readiness",
      subjects: "Subjects",
      topicsDone: "Topics done",
      nearestExam: "Nearest exam",
      todaysFocus: "🎯 Today's focus",
      examSchedule: "🗓 Exam schedule",
      yourSubjects: "📖 Your subjects",
      addSubject: "Add subject",
      subjectNamePh: "Subject name (e.g. Data Structures)",
      examDateHint: "Exam date is optional — add it to unlock countdowns and smart focus.",
      emptySubjects: "No subjects yet. Add your first subject above — or load sample data to explore.",
      footNote: "All data stays in your browser (localStorage). Export JSON to back up.",
      // countdown
      daysLeft: "{n} days left",
      oneDayLeft: "1 day left",
      tomorrow: "Tomorrow!",
      today: "Today!",
      examPassed: "Exam passed",
      noExamDate: "No date set",
      // passes
      pass0: "Not started",
      pass1: "1st pass",
      pass2: "2nd pass",
      pass3: "Done ✓",
      // focus
      focusEmpty: "Add a subject with topics to get a smart suggestion for today.",
      focusAllDone: "🎉 Everything is done. Take a breath — you're ready!",
      suggestedMinutes: "{n} min suggested",
      markPassDone: "Mark one pass done",
      // topics
      topicNamePh: "Topic name",
      minutesPh: "Minutes",
      addTopic: "Add",
      deleteTopic: "Delete topic",
      deleteSubject: "Delete subject",
      noTopics: "No topics yet — break this subject into topics above.",
      // exams
      upcomingExams: "Upcoming",
      pastExams: "Past",
      noExams: "No exam dates set yet.",
      readiness: "{n}% ready",
      // errors
      errEmptyName: "Please enter a subject name.",
      errDupName: "A subject with this name already exists.",
      errBadDate: "That exam date doesn't look valid.",
      errFarDate: "⚠ That exam is more than 5 years away — is the date right? (kept anyway)",
      errEmptyTopic: "Please enter a topic name.",
      errBadMinutes: "Minutes must be a positive number.",
      errBadImport: "Import failed: not a valid planner file.",
      confirmClear: "Delete ALL subjects and topics? This cannot be undone.",
      // stats
      dash: "—"
    },
    bn: {
      appTitle: "স্টাডি প্ল্যানার বিডি",
      sampleData: "নমুনা ডেটা",
      export: "এক্সপোর্ট",
      import: "ইমপোর্ট",
      clearAll: "সব মুছুন",
      overallReadiness: "সামগ্রিক প্রস্তুতি",
      subjects: "বিষয়",
      topicsDone: "সম্পন্ন টপিক",
      nearestExam: "নিকটতম পরীক্ষা",
      todaysFocus: "🎯 আজকের ফোকাস",
      examSchedule: "🗓 পরীক্ষার সময়সূচি",
      yourSubjects: "📖 আপনার বিষয়সমূহ",
      addSubject: "বিষয় যোগ করুন",
      subjectNamePh: "বিষয়ের নাম (যেমন: ডেটা স্ট্রাকচার)",
      examDateHint: "পরীক্ষার তারিখ ঐচ্ছিক — দিলে কাউন্টডাউন ও স্মার্ট ফোকাস চালু হবে।",
      emptySubjects: "এখনও কোনো বিষয় নেই। উপরে প্রথম বিষয় যোগ করুন — অথবা নমুনা ডেটা দেখুন।",
      footNote: "সব ডেটা আপনার ব্রাউজারেই থাকে (localStorage)। ব্যাকআপের জন্য JSON এক্সপোর্ট করুন।",
      daysLeft: "{n} দিন বাকি",
      oneDayLeft: "১ দিন বাকি",
      tomorrow: "আগামীকাল!",
      today: "আজই!",
      examPassed: "পরীক্ষা শেষ",
      noExamDate: "তারিখ দেওয়া হয়নি",
      pass0: "শুরু হয়নি",
      pass1: "১ম রিভিশন",
      pass2: "২য় রিভিশন",
      pass3: "সম্পন্ন ✓",
      focusEmpty: "আজকের স্মার্ট পরামর্শ পেতে টপিকসহ একটি বিষয় যোগ করুন।",
      focusAllDone: "🎉 সব শেষ! একটু বিশ্রাম নিন — আপনি প্রস্তুত!",
      suggestedMinutes: "{n} মিনিট পরামর্শ",
      markPassDone: "একটি পাস সম্পন্ন করুন",
      topicNamePh: "টপিকের নাম",
      minutesPh: "মিনিট",
      addTopic: "যোগ করুন",
      deleteTopic: "টপিক মুছুন",
      deleteSubject: "বিষয় মুছুন",
      noTopics: "এখনও টপিক নেই — উপরে বিষয়টিকে টপিকে ভাগ করুন।",
      upcomingExams: "আসন্ন",
      pastExams: "অতীত",
      noExams: "এখনও কোনো পরীক্ষার তারিখ দেওয়া হয়নি।",
      readiness: "{n}% প্রস্তুত",
      errEmptyName: "একটি বিষয়ের নাম লিখুন।",
      errDupName: "এই নামে একটি বিষয় ইতিমধ্যে আছে।",
      errBadDate: "পরীক্ষার তারিখটি বৈধ মনে হচ্ছে না।",
      errFarDate: "⚠ পরীক্ষাটি ৫ বছরেরও বেশি দূরে — তারিখ ঠিক আছে তো? (তবু রাখা হলো)",
      errEmptyTopic: "একটি টপিকের নাম লিখুন।",
      errBadMinutes: "মিনিট ধনাত্মক সংখ্যা হতে হবে।",
      errBadImport: "ইমপোর্ট ব্যর্থ: এটি বৈধ প্ল্যানার ফাইল নয়।",
      confirmClear: "সব বিষয় ও টপিক মুছে ফেলবেন? এটি ফেরানো যাবে না।",
      dash: "—"
    }
  };

  // Bengali digits for bn mode
  const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  function bnNum(v) {
    return String(v).replace(/[0-9]/g, (d) => BN_DIGITS[+d]);
  }

  global.I18N = { STRINGS, bnNum };
})(window);
