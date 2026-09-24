"use client";
import { useEffect, useState } from "react";
import {
  Home,
  BookOpen,
  BookMarked,
  Code2,
  FolderCode,
  ClipboardCheck,
  ChartNoAxesCombined,
  Terminal as TerminalIcon,
  Settings as SettingsIcon,
  ChevronRight,
  ArrowUpRight,
  ArrowRight,
  Check,
  CheckCircle2,
  Search,
  Flame,
  Target,
  Cloud,
  CloudOff,
  Loader2,
  KeyRound,
  Cpu,
  Download,
  Trash2,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  languages,
  lessons,
  getLanguage,
  getLesson,
  type Lesson,
} from "@/lib/content";
import { copy, type Locale } from "@/lib/i18n";
import {
  conceptStatus,
  dueLessons,
  xpFor,
  studyStreak,
} from "@/lib/core/progress";
import { useLearning, api, emptyLesson, type Settings } from "./use-learning";
import { Playground, downloadFile } from "./playground";
import { Quiz, type QuizData } from "./quiz";
import { Tutor } from "./tutor";
import { Terminal } from "./terminal";
import { Projects } from "./projects";
import { InteractiveLesson } from "./interactive-lesson";
import { createQuestions } from "@/lib/education/questions";
import { uniqueId } from "@/lib/education/offline-quiz";
const nav = [
  { id: "home", icon: Home },
  { id: "learn", icon: BookOpen },
  { id: "manual", icon: BookMarked },
  { id: "playground", icon: Code2 },
  { id: "projects", icon: FolderCode },
  { id: "exams", icon: ClipboardCheck },
  { id: "progress", icon: ChartNoAxesCombined },
  { id: "tutor", icon: Cpu },
  { id: "terminal", icon: TerminalIcon },
];
function Navigation({
  view,
  onSelect,
  locale,
  disabled,
}: {
  view: string;
  onSelect: (v: string) => void;
  locale: Locale;
  disabled: boolean;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      {nav.map((n) => (
        <SidebarMenuItem key={n.id}>
          <SidebarMenuButton
            disabled={disabled}
            isActive={view === n.id}
            onClick={() => {
              onSelect(n.id);
              setOpenMobile(false);
            }}
            className="nav-button"
          >
            <n.icon size={18} />
            <span>{copy[locale][n.id as keyof typeof copy.es]}</span>
            {view === n.id && <span className="nav-active" />}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
export default function Sintavra({
  userId,
  userName,
  now,
  localKey,
}: {
  userId: string | null;
  userName: string;
  now: number;
  localKey?: string;
}) {
  const learning = useLearning(userId, localKey);
  const { state, update, status, error, loaded, online, save, addAttempts } =
    learning;
  const s = state.settings;
  const t = copy[s.locale];
  const en = s.locale === "en";
  const [view, setView] = useState("home");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [devOpen, setDevOpen] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [devError, setDevError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [guestStarted, setGuestStarted] = useState(false);
  const [merging, setMerging] = useState(false);
  const language = getLanguage(s.language) || languages[0];
  const lesson = getLesson(s.lastLesson) || language.lessons[0];
  const lessonLanguage = getLanguage(lesson.id.split("-")[0])!;
  const title = (l: Lesson) => (en ? l.titleEn : l.title);
  const xp = xpFor(state.attempts);
  const mastered = lessons.filter(
    (l) => conceptStatus(state.attempts, l.id) === "mastered",
  ).length;
  const practiced = lessons.filter((l) =>
    state.attempts.some((a) => a.lessonId === l.id),
  ).length;
  const due = dueLessons(
    state.attempts,
    lessons.map((l) => l.id),
  );
  const weak = lessons.filter(
    (l) => conceptStatus(state.attempts, l.id) === "practice",
  );
  function settings(p: Partial<Settings>) {
    update((st) => ({ ...st, settings: { ...st.settings, ...p } }));
  }
  function go(v: string) {
    if (quiz) return;
    setView(v);
    setSearch("");
    window.scrollTo({ top: 0 });
  }
  function openLesson(id: string) {
    const l = getLesson(id);
    if (!l) return;
    settings({ lastLesson: id, language: id.split("-")[0] });
    setView("lesson");

    setSearch("");
    window.scrollTo({ top: 0 });
  }
  function setLanguage(id: string) {
    const l = getLanguage(id);
    if (l) settings({ language: id, lastLesson: l.lessons[0].id });
  }
  async function startQuiz(id: string, exam = false) {
    if (!userId || !online) {
      const questions = createQuestions(id, s.locale, exam);
      setQuiz({
        id: uniqueId(),
        kind: exam ? "exam" : "quiz",
        questions,
        offlineQuestions: questions,
        local: true,
      });
      window.scrollTo({ top: 0 });
      return;
    }
    setQuizLoading(true);
    try {
      const q = await api<QuizData>("quiz", "POST", {
        lessonId: id,
        kind: exam ? "exam" : "quiz",
        locale: s.locale,
      });
      setQuiz(q);
      window.scrollTo({ top: 0 });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setQuizLoading(false);
    }
  }
  const code = state.drafts[lesson.id] ?? lesson.code;
  function setCode(value: string) {
    update((st) => ({ ...st, drafts: { ...st.drafts, [lesson.id]: value } }));
  }
  function exportData() {
    downloadFile(
      "sintavra-progreso.json",
      JSON.stringify(
        { schemaVersion: 1, exportedAt: new Date().toISOString(), ...state },
        null,
        2,
      ),
      "application/json",
    );
  }
  useEffect(() => {
    document.documentElement.lang = s.locale;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      document.documentElement.classList.toggle(
        "dark",
        s.theme === "dark" || (s.theme === "system" && media.matches),
      );
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [s.theme, s.locale]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (!quiz) {
          setView("manual");
          document.getElementById("global-search")?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quiz]);
  useEffect(() => {
    // Restore browser-only preference after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuestStarted(localStorage.getItem("sintavra-started") === "yes");
    if ("serviceWorker" in navigator && location.protocol === "https:")
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  const navView = view === "lesson" ? "learn" : view;
  const filtered = lessons.filter(
    (l) =>
      (filter === "all" || l.id.startsWith(filter + "-")) &&
      (!search ||
        [
          l.title,
          l.titleEn,
          l.body,
          l.code,
          getLanguage(l.id.split("-")[0])!.name,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  const dayActivity = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 86400000);
    const date = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString(s.locale, {
        weekday: "short",
        timeZone: "UTC",
      }),
      count: state.attempts.filter(
        (a) => new Date(a.createdAt).toISOString().slice(0, 10) === date,
      ).length,
    };
  });
  if (!userId && !guestStarted && !localKey)
    return (
      <main className="welcome-screen">
        <div className="welcome-card">
          <span className="wordmark">
            sintavra<span className="brand-period">.</span>
          </span>
          <span className="eyebrow">APRENDE HACIENDO</span>
          <h1>
            El código empieza
            <br />a tener sentido.
          </h1>
          <p>
            Toca sus piezas, descubre cómo encajan y construye algo tuyo. Siete
            lenguajes. A tu ritmo.
          </p>
          <div className="welcome-code">
            <code>
              <span>def</span> aprender(curiosidad):
              <br />
              &nbsp;&nbsp;return curiosidad + práctica
            </code>
          </div>
          <div className="welcome-actions">
            <a className="btn primary" href="/signin-with-chatgpt?return_to=/">
              Iniciar sesión
            </a>
            <a
              className="btn secondary"
              href="/signin-with-chatgpt?return_to=/"
            >
              Crear cuenta con ChatGPT
            </a>
            <button
              className="text-button"
              disabled={!loaded}
              onClick={() => {
                localStorage.setItem("sintavra-started", "yes");
                setGuestStarted(true);
              }}
            >
              Continuar sin cuenta <ArrowRight size={16} />
            </button>
          </div>
          <p className="small-note muted">
            Sin cuenta también tienes lecciones, pruebas y progreso local.
            Podrás combinarlo con tu cuenta después.
          </p>
        </div>
      </main>
    );
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "238px" } as React.CSSProperties}
    >
      <Sidebar className="app-sidebar">
        <SidebarHeader>
          <button
            className="wordmark"
            onClick={() => go("home")}
            aria-label="Sintavra — Inicio"
          >
            <span className="brand-symbol">
              s<span>_</span>
            </span>
            <span>
              sintavra<span className="brand-period">.</span>
            </span>
          </button>
          <span className="workspace-label">
            {en ? "YOUR LEARNING SPACE" : "TU ESPACIO DE APRENDIZAJE"}
          </span>
        </SidebarHeader>
        <SidebarContent>
          <Navigation
            view={navView}
            onSelect={go}
            locale={s.locale}
            disabled={!!quiz}
          />
          <div className="sidebar-note">
            <span className="eyebrow">
              {en ? "ONE STEP AT A TIME" : "UN PASO A LA VEZ"}
            </span>
            <p>
              {en
                ? "Understanding is better than memorizing."
                : "Entender vale más que memorizar."}
            </p>
            <div>
              <span>
                {t.level} {Math.floor(xp / 100) + 1}
              </span>
              <span>{xp} XP</span>
            </div>
            <Progress value={xp % 100} aria-label="XP" />
          </div>
        </SidebarContent>
        <SidebarFooter>
          <button
            className={"settings-nav " + (view === "settings" ? "active" : "")}
            disabled={!!quiz}
            onClick={() => go("settings")}
          >
            <SettingsIcon size={18} />
            {t.settings}
          </button>
          <div className="user-box">
            <span className="avatar">
              {(s.displayName || userName || "S").slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>
                {s.displayName || userName || (en ? "Student" : "Estudiante")}
              </strong>
              <span>
                {userId
                  ? en
                    ? "Personal account"
                    : "Cuenta personal"
                  : en
                    ? "Guest · local drafts"
                    : "Invitado · progreso local"}
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <SidebarTrigger />
            <span>Sintavra</span>
            <ChevronRight size={14} />
            <strong>
              {quiz
                ? quiz.kind === "exam"
                  ? t.exams
                  : t.checks
                : view === "lesson"
                  ? title(lesson)
                  : t[navView as keyof typeof t] || t.home}
            </strong>
          </div>
          <div className="topbar-actions">
            <button
              className="search-shortcut"
              disabled={!!quiz}
              onClick={() => go("manual")}
              aria-label={t.search}
            >
              <Search size={16} />
              <span>{en ? "Search" : "Buscar"}</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="sync-status"
              onClick={() => void save()}
              title={en ? "Save and synchronize" : "Guardar y sincronizar"}
            >
              {status === "saving" ? (
                <Loader2 className="spin" size={15} />
              ) : online && status === "saved" ? (
                <Cloud size={16} />
              ) : (
                <CloudOff size={16} />
              )}
              <span>
                {!loaded
                  ? t.loading
                  : status === "saved"
                    ? t.saved
                    : status === "saving"
                      ? t.saving
                      : t.local}
              </span>
            </button>
          </div>
        </header>
        {!online && <div className="offline-banner">{t.offline}</div>}
        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={() => void save()}>
              {en ? "Retry" : "Reintentar"}
            </button>
            <button onClick={exportData}>{t.export}</button>
          </div>
        )}
        <div
          className={
            "page-content " + (view === "terminal" ? "terminal-page" : "")
          }
          id="main-content"
        >
          {quiz ? (
            <Quiz
              key={quiz.id}
              quiz={quiz}
              locale={s.locale}
              onComplete={addAttempts}
              onClose={() => setQuiz(null)}
            />
          ) : (
            <>
              {view === "home" && (
                <>
                  <div className="section-heading welcome">
                    <div>
                      <span className="eyebrow">
                        {en
                          ? "YOUR NEXT SMALL BREAKTHROUGH"
                          : "TU PRÓXIMO PEQUEÑO AVANCE"}
                      </span>
                      <h1>{t.welcome}</h1>
                      <p>{t.sub}</p>
                    </div>
                    <span className="date-stamp">
                      {new Date(now)
                        .toLocaleDateString(s.locale, {
                          day: "2-digit",
                          month: "short",
                          timeZone: "UTC",
                        })
                        .toUpperCase()}
                      <br />
                      <span>
                        {en
                          ? "A GOOD DAY TO LEARN"
                          : "UN BUEN DÍA PARA APRENDER"}
                      </span>
                    </span>
                  </div>
                  <div className="home-grid">
                    <section className="continue-card">
                      <div className="continue-copy">
                        <span className="eyebrow">
                          <span className="tiny-square" />
                          {state.attempts.length
                            ? t.continue
                            : en
                              ? "YOUR FIRST STEP"
                              : "TU PRIMER PASO"}
                        </span>
                        <span className="lesson-location">
                          {lessonLanguage.name} <span>/</span> {t.fundamentals}
                        </span>
                        <h2>{title(lesson)}</h2>
                        <p>
                          {en
                            ? "An idea, a working example and a chance to try it yourself."
                            : "Una idea, un ejemplo que funciona y una oportunidad para intentarlo tú."}
                        </p>
                        <button
                          className="btn primary"
                          onClick={() => openLesson(lesson.id)}
                        >
                          {state.attempts.length ? t.continue : t.start}
                          <ArrowRight size={17} />
                        </button>
                        <span className="duration">
                          {lesson.minutes} {t.minutes} ·{" "}
                          {en ? "Go at your pace" : "A tu ritmo"}
                        </span>
                      </div>
                      <div className="code-preview">
                        <div className="preview-header">
                          <span>main.{lessonLanguage.ext}</span>
                          <Code2 size={16} />
                        </div>
                        <pre>
                          {lesson.code
                            .split("\n")
                            .slice(0, 9)
                            .map((line, i) => (
                              <span key={i}>
                                <i>{i + 1}</i>
                                <code>{line || " "}</code>
                              </span>
                            ))}
                        </pre>
                        <div className="preview-footer">
                          {en
                            ? "Read → experiment → understand"
                            : "Leer → experimentar → entender"}
                        </div>
                      </div>
                    </section>
                    <aside className="mode-card">
                      <span className="eyebrow">SINTAVRA</span>
                      <h3>{t.welcomeMenu}</h3>
                      <div className="mode-options">
                        <button onClick={() => go("terminal")}>
                          <span>[1]</span> &gt;_ Terminal Mode{" "}
                          <ArrowUpRight size={15} />
                        </button>
                        <button onClick={() => go("learn")}>
                          <span>[2]</span> UI Mode <ArrowUpRight size={15} />
                        </button>
                        <button onClick={() => go("settings")}>
                          <span>[3]</span> {t.settings}{" "}
                          <ArrowUpRight size={15} />
                        </button>
                        <button onClick={() => setDevOpen(true)}>
                          <span>[4]</span> Developer Codes{" "}
                          <ArrowUpRight size={15} />
                        </button>
                      </div>
                    </aside>
                  </div>
                  <div className="stat-strip">
                    <div>
                      <Target size={20} />
                      <span>
                        <strong>
                          {mastered}
                          <em> / {lessons.length}</em>
                        </strong>
                        <small>
                          {en ? "concepts mastered" : "conceptos dominados"}
                        </small>
                      </span>
                    </div>
                    <div>
                      <CheckCircle2 size={20} />
                      <span>
                        <strong>{practiced}</strong>
                        <small>
                          {en ? "concepts practiced" : "conceptos practicados"}
                        </small>
                      </span>
                    </div>
                    <div>
                      <Flame size={20} />
                      <span>
                        <strong>{studyStreak(state.attempts)}</strong>
                        <small>{t.streak}</small>
                      </span>
                    </div>
                    <button onClick={() => go("progress")}>
                      {t.progress}
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                  <div className="section-heading compact-heading">
                    <h2>{t.languages}</h2>
                    <button className="text-button" onClick={() => go("learn")}>
                      {en ? "View all seven" : "Ver los siete"}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="language-grid">
                    {languages.slice(0, 3).map((l) => {
                      const n = l.lessons.filter((x) =>
                        state.attempts.some((a) => a.lessonId === x.id),
                      ).length;
                      return (
                        <button
                          className="language-card"
                          key={l.id}
                          onClick={() => {
                            setLanguage(l.id);
                            go("learn");
                          }}
                        >
                          <span
                            className="language-mark"
                            style={{ color: l.color }}
                          >
                            {l.mark}
                          </span>
                          <ArrowUpRight className="card-arrow" size={18} />
                          <h3>{l.name}</h3>
                          <p>{en ? l.en : l.desc}</p>
                          <div className="language-bottom">
                            <span>
                              {n} / {l.lessons.length}{" "}
                              {en ? "practiced" : "practicados"}
                            </span>
                            <span>{en ? "Fundamentals" : "Fundamentos"}</span>
                          </div>
                          <Progress value={(100 * n) / l.lessons.length} />
                        </button>
                      );
                    })}
                  </div>
                  <div className="home-bottom">
                    <div>
                      <span className="eyebrow">{t.review}</span>
                      <h3>
                        {due.length
                          ? `${due.length} ${en ? "concepts to revisit" : "conceptos para retomar"}`
                          : en
                            ? "A little practice goes a long way."
                            : "Un poco de práctica llega lejos."}
                      </h3>
                      <p>
                        {due.length
                          ? en
                            ? "Your next review is ready."
                            : "Tu próximo repaso está listo."
                          : en
                            ? "After your first tests, your review queue will appear here."
                            : "Después de tus primeras pruebas aparecerán aquí tus repasos."}
                      </p>
                      <button
                        className="text-button"
                        onClick={() =>
                          due.length ? openLesson(due[0]) : go("learn")
                        }
                      >
                        {due.length ? t.review : t.start}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="daily-challenge">
                      <span className="eyebrow">
                        {en ? "DAILY PRACTICE" : "PRÁCTICA DEL DÍA"}
                      </span>
                      <h3>
                        {title(
                          language.lessons[
                            Math.floor(now / 86400000) % language.lessons.length
                          ],
                        )}
                      </h3>
                      <p>
                        {en
                          ? "Three questions. A concrete idea to strengthen."
                          : "Tres preguntas. Una idea concreta que reforzar."}
                      </p>
                      <button
                        className="text-button"
                        onClick={() =>
                          startQuiz(
                            language.lessons[
                              Math.floor(now / 86400000) %
                                language.lessons.length
                            ].id,
                          )
                        }
                      >
                        {en ? "Try it" : "Intentarlo"}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
              {view === "learn" && (
                <>
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        {en ? "LEARNING PATHS" : "RUTAS DE APRENDIZAJE"}
                      </span>
                      <h1>
                        {en
                          ? "Choose a language. Start building."
                          : "Elige un lenguaje. Empieza a construir."}
                      </h1>
                    </div>
                  </div>
                  <Tabs value={language.id} onValueChange={setLanguage}>
                    <TabsList className="language-tabs">
                      {languages.map((l) => (
                        <TabsTrigger value={l.id} key={l.id}>
                          {l.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {languages.map((l) => (
                      <TabsContent key={l.id} value={l.id}>
                        <div className="path-heading">
                          <span
                            className="language-mark large"
                            style={{ color: l.color }}
                          >
                            {l.mark}
                          </span>
                          <div>
                            <h2>{l.name}</h2>
                            <p>{en ? l.en : l.desc}</p>
                            <span className="muted">
                              {l.lessons.length}{" "}
                              {en
                                ? "initial lessons · more advanced content pending"
                                : "lecciones iniciales · contenido avanzado pendiente"}
                            </span>
                          </div>
                        </div>
                        <div className="lesson-list">
                          {l.lessons.map((item, i) => {
                            const status = conceptStatus(
                              state.attempts,
                              item.id,
                            );
                            return (
                              <button
                                className="lesson-row"
                                key={item.id}
                                onClick={() => openLesson(item.id)}
                              >
                                <span className={"lesson-number " + status}>
                                  {status === "mastered" ? (
                                    <Check size={18} />
                                  ) : (
                                    String(i + 1).padStart(2, "0")
                                  )}
                                </span>
                                <span className="lesson-row-title">
                                  <strong>{title(item)}</strong>
                                  <span>
                                    {i < 4
                                      ? t.fundamentals
                                      : en
                                        ? "Basic"
                                        : "Básico"}{" "}
                                    · {item.minutes} {t.minutes}
                                  </span>
                                </span>
                                <span className={"status-pill " + status}>
                                  {t[status]}
                                </span>
                                <ChevronRight size={18} />
                              </button>
                            );
                          })}
                        </div>
                        <div className="path-note">
                          <BookOpen size={18} />
                          <p>
                            {en
                              ? "Start in order, or open any concept you need. Mastery requires correct independent tests on at least two different days."
                              : "Empieza en orden o abre el concepto que necesites. El dominio requiere pruebas independientes correctas en al menos dos días distintos."}
                          </p>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </>
              )}
              {view === "lesson" && (
                <InteractiveLesson
                  key={lesson.id}
                  lesson={lesson}
                  language={lessonLanguage}
                  locale={s.locale}
                  code={code}
                  onCode={setCode}
                  fontSize={s.fontSize}
                  onSave={() => void save()}
                  onQuiz={() => void startQuiz(lesson.id)}
                  onProject={() => go("projects")}
                  progress={state.lessonProgress[lesson.id] || emptyLesson}
                  onProgress={(p) =>
                    update((st) => ({
                      ...st,
                      lessonProgress: { ...st.lessonProgress, [lesson.id]: p },
                    }))
                  }
                  level={s.level}
                  weak={conceptStatus(state.attempts, lesson.id) === "practice"}
                />
              )}
              {view === "manual" && (
                <>
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        {en
                          ? "YOUR REFERENCE SHELF"
                          : "TU BIBLIOTECA DE CONSULTA"}
                      </span>
                      <h1>
                        {en
                          ? "The manual. Always at hand."
                          : "El manual. Siempre a mano."}
                      </h1>
                      <p className="muted">
                        {en
                          ? "Stored explanations and complete examples. No AI needed."
                          : "Explicaciones guardadas y ejemplos completos. No necesitas IA."}
                      </p>
                    </div>
                    <BookMarked size={32} />
                  </div>
                  <div className="manual-search">
                    <Search size={20} />
                    <input
                      id="global-search"
                      aria-label={t.search}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t.search}
                    />
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger aria-label={t.languages}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.all}</SelectItem>
                        {languages.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="result-count">
                    {filtered.length}{" "}
                    {en ? "concepts found" : "conceptos encontrados"}
                  </p>
                  <div className="manual-results">
                    {filtered.map((l) => (
                      <button key={l.id} onClick={() => openLesson(l.id)}>
                        <span className="eyebrow">
                          {getLanguage(l.id.split("-")[0])!.name}
                        </span>
                        <h3>
                          {title(l)}
                          <ArrowUpRight size={16} />
                        </h3>
                        <p>{(en ? l.bodyEn : l.body).slice(0, 170)}…</p>
                      </button>
                    ))}
                  </div>
                  {!filtered.length && (
                    <div className="empty-state">
                      {en
                        ? "No matches. Try “for”, “variables” or a language name."
                        : "No hay coincidencias. Prueba “for”, “variables” o el nombre de un lenguaje."}
                    </div>
                  )}
                </>
              )}
              {view === "playground" && (
                <>
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">PLAYGROUND</span>
                      <h1>
                        {en
                          ? "What if you change this?"
                          : "¿Y si cambias esto?"}
                      </h1>
                    </div>
                    <Select
                      value={lessonLanguage.id}
                      onValueChange={setLanguage}
                    >
                      <SelectTrigger aria-label={t.languages}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="muted page-intro">
                    {en
                      ? "Your draft is shared with the current lesson. Python, JavaScript and Lua run in your browser."
                      : "Tu borrador se comparte con la lección actual. Python, JavaScript y Lua se ejecutan en tu navegador."}
                  </p>
                  <Playground
                    key={lesson.id}
                    language={lessonLanguage}
                    code={code}
                    onChange={setCode}
                    original={lesson.code}
                    locale={s.locale}
                    fontSize={s.fontSize}
                    onSave={() => void save()}
                  />
                </>
              )}
              {view === "projects" && (
                <Projects
                  locale={s.locale}
                  projects={state.projects}
                  onUpdate={(id, p) =>
                    update((st) => ({
                      ...st,
                      projects: { ...st.projects, [id]: p },
                    }))
                  }
                  onSave={() => void save()}
                  fontSize={s.fontSize}
                />
              )}
              {view === "exams" && (
                <>
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">EXAM MODE</span>
                      <h1>
                        {en
                          ? "Find out what stayed with you."
                          : "Descubre qué se quedó contigo."}
                      </h1>
                      <p className="muted">
                        {en
                          ? "12 questions per language. No hints. Results by concept."
                          : "12 preguntas por lenguaje. Sin pistas. Resultados por concepto."}
                      </p>
                    </div>
                    <ClipboardCheck size={32} />
                  </div>
                  <div className="exam-list">
                    {languages.map((l) => (
                      <article key={l.id}>
                        <span
                          className="language-mark"
                          style={{ color: l.color }}
                        >
                          {l.mark}
                        </span>
                        <div>
                          <h3>
                            {l.name} · {t.fundamentals}
                          </h3>
                          <p>
                            6 {t.concepts.toLowerCase()} · 12{" "}
                            {en ? "questions" : "preguntas"}
                          </p>
                        </div>
                        <button
                          disabled={quizLoading}
                          className="btn secondary"
                          onClick={() => startQuiz(l.id, true)}
                        >
                          {en ? "Take exam" : "Hacer examen"}
                          <ArrowRight size={16} />
                        </button>
                      </article>
                    ))}
                  </div>
                  <p className="muted">
                    {en
                      ? "These are conceptual exams, not certification of professional proficiency."
                      : "Son exámenes conceptuales, no una certificación de competencia profesional."}
                  </p>
                </>
              )}
              {view === "progress" && (
                <>
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        {en
                          ? "EVIDENCE, NOT GUESSWORK"
                          : "EVIDENCIA, NO SUPOSICIONES"}
                      </span>
                      <h1>{t.progress}</h1>
                      <p className="muted">
                        {en
                          ? "Every result comes from an evaluated attempt."
                          : "Cada resultado procede de un intento evaluado."}
                      </p>
                    </div>
                    <button className="btn secondary" onClick={exportData}>
                      <Download size={16} />
                      {t.export}
                    </button>
                  </div>
                  <div className="stat-strip">
                    <div>
                      <Target />
                      <span>
                        <strong>{mastered}</strong>
                        <small>{t.mastered}</small>
                      </span>
                    </div>
                    <div>
                      <ClipboardCheck />
                      <span>
                        <strong>{state.attempts.length}</strong>
                        <small>
                          {en
                            ? "concept evaluations"
                            : "evaluaciones de conceptos"}
                        </small>
                      </span>
                    </div>
                    <div>
                      <Flame />
                      <span>
                        <strong>{xp}</strong>
                        <small>XP</small>
                      </span>
                    </div>
                  </div>
                  <div className="activity-panel">
                    <h3>{t.activity}</h3>
                    <div className="activity-bars">
                      {dayActivity.map((d, i) => (
                        <div key={i}>
                          <span>{d.count}</span>
                          <div className="bar-space">
                            <i
                              style={{
                                height:
                                  Math.max(
                                    3,
                                    (d.count /
                                      Math.max(
                                        1,
                                        ...dayActivity.map((d) => d.count),
                                      )) *
                                      100,
                                  ) + "%",
                              }}
                            />
                          </div>
                          <small>{d.day}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="section-heading compact-heading">
                    <h2>
                      {en ? "Concept by concept" : "Concepto por concepto"}
                    </h2>
                    <Select value={language.id} onValueChange={setLanguage}>
                      <SelectTrigger aria-label={t.languages}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="lesson-list">
                    {language.lessons.map((l) => (
                      <button
                        className="lesson-row"
                        key={l.id}
                        onClick={() => openLesson(l.id)}
                      >
                        <span className="lesson-row-title">
                          <strong>{title(l)}</strong>
                          <span>
                            {
                              state.attempts.filter((a) => a.lessonId === l.id)
                                .length
                            }{" "}
                            {en ? "attempts" : "intentos"}
                          </span>
                        </span>
                        <span
                          className={
                            "status-pill " + conceptStatus(state.attempts, l.id)
                          }
                        >
                          {t[conceptStatus(state.attempts, l.id)]}
                        </span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                  {weak.length > 0 && (
                    <div className="project-brief">
                      <h3>{en ? "Your review plan" : "Tu plan de repaso"}</h3>
                      {weak.map((l) => (
                        <button
                          className="text-button"
                          key={l.id}
                          onClick={() => openLesson(l.id)}
                        >
                          {getLanguage(l.id.split("-")[0])!.name} / {title(l)}{" "}
                          <ArrowRight size={15} />
                        </button>
                      ))}
                    </div>
                  )}
                  {!state.attempts.length && (
                    <p className="empty-state">{t.empty}</p>
                  )}
                </>
              )}
              {view === "tutor" && (
                <Tutor
                  key={lesson.id}
                  lesson={lesson}
                  language={lessonLanguage}
                  locale={s.locale}
                  mode={s.mode}
                  code={code}
                  onMode={(mode) => settings({ mode })}
                />
              )}
              {view === "terminal" && (
                <Terminal
                  locale={s.locale}
                  attempts={state.attempts}
                  onNavigate={go}
                  onLanguage={setLanguage}
                  onLesson={openLesson}
                  onQuiz={startQuiz}
                  name={(s.displayName || "estudiante")
                    .toLowerCase()
                    .replace(/\s+/g, "-")}
                />
              )}
              {view === "settings" && (
                <div className="settings-card">
                  <h3>{en ? "Starting level" : "Nivel de partida"}</h3>
                  {userId && (
                    <a className="text-button" href="/api/v1/backups" download>
                      {en
                        ? "Download previous account backups"
                        : "Descargar copias anteriores de la cuenta"}
                    </a>
                  )}
                  <select
                    aria-label="Nivel de partida"
                    value={s.level}
                    onChange={(e) =>
                      settings({ level: e.target.value as Settings["level"] })
                    }
                  >
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                  <p className="muted">
                    {en
                      ? "Guidance also responds to your test results."
                      : "La orientación también responde a los resultados de tus pruebas."}
                  </p>
                </div>
              )}
              {view === "settings" && (
                <>
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        {en ? "MAKE IT YOUR SPACE" : "HAZLO TU ESPACIO"}
                      </span>
                      <h1>{t.settings}</h1>
                    </div>
                    <SettingsIcon size={30} />
                  </div>
                  <div className="settings-panel">
                    <div className="setting-row">
                      <div>
                        <h3>{en ? "Display name" : "Nombre visible"}</h3>
                        <p>
                          {en
                            ? "A name for your learning space."
                            : "Un nombre para tu espacio de aprendizaje."}
                        </p>
                      </div>
                      <input
                        aria-label={en ? "Display name" : "Nombre visible"}
                        maxLength={40}
                        value={s.displayName}
                        onChange={(e) =>
                          settings({ displayName: e.target.value })
                        }
                        placeholder={userName || "Estudiante"}
                      />
                    </div>
                    <div className="setting-row">
                      <div>
                        <h3>{en ? "Language" : "Idioma"}</h3>
                        <p>Español / English</p>
                      </div>
                      <Select
                        value={s.locale}
                        onValueChange={(v) => settings({ locale: v as Locale })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="setting-row">
                      <div>
                        <h3>{en ? "Appearance" : "Apariencia"}</h3>
                        <p>
                          {en
                            ? "Choose the light that works for you."
                            : "Elige la luz con la que trabajas mejor."}
                        </p>
                      </div>
                      <Tabs
                        value={s.theme}
                        onValueChange={(v) =>
                          settings({ theme: v as Settings["theme"] })
                        }
                      >
                        <TabsList>
                          <TabsTrigger
                            value="dark"
                            aria-label={en ? "Dark" : "Oscuro"}
                          >
                            <Moon size={16} />
                          </TabsTrigger>
                          <TabsTrigger
                            value="light"
                            aria-label={en ? "Light" : "Claro"}
                          >
                            <Sun size={16} />
                          </TabsTrigger>
                          <TabsTrigger
                            value="system"
                            aria-label={en ? "System" : "Sistema"}
                          >
                            <Monitor size={16} />
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div className="setting-row">
                      <div>
                        <h3>
                          {en
                            ? "Editor text size"
                            : "Tamaño del texto del editor"}
                        </h3>
                        <p>{s.fontSize}px</p>
                      </div>
                      <div className="row">
                        <button
                          className="btn secondary"
                          disabled={s.fontSize <= 14}
                          onClick={() => settings({ fontSize: s.fontSize - 1 })}
                        >
                          −
                        </button>
                        <button
                          className="btn secondary"
                          disabled={s.fontSize >= 24}
                          onClick={() => settings({ fontSize: s.fontSize + 1 })}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="setting-row">
                      <div>
                        <h3>Developer Codes</h3>
                        <p>
                          {en
                            ? "Preferences and small extras. No administrator privileges."
                            : "Preferencias y pequeños extras. Sin privilegios de administración."}
                        </p>
                      </div>
                      <button
                        className="btn secondary"
                        onClick={() => setDevOpen(true)}
                      >
                        <KeyRound size={16} />
                        {t.open}
                      </button>
                    </div>
                  </div>
                  <h2 className="settings-subtitle">{t.privacy}</h2>
                  <div className="settings-panel">
                    <div className="setting-row">
                      <div>
                        <h3>
                          {en
                            ? "Account and synchronization"
                            : "Cuenta y sincronización"}
                        </h3>
                        <p>
                          {userId
                            ? en
                              ? "Signed in with ChatGPT. Progress is stored in the database."
                              : "Sesión con ChatGPT. El progreso se guarda en la base de datos."
                            : en
                              ? "Sign in to save progress across devices."
                              : "Inicia sesión para guardar progreso entre dispositivos."}
                        </p>
                      </div>
                      <a
                        className="btn secondary"
                        href={
                          userId
                            ? "/signout-with-chatgpt?return_to=/"
                            : "/signin-with-chatgpt?return_to=/"
                        }
                        target="_top"
                      >
                        <LogOut size={16} />
                        {userId ? t.signout : t.signin}
                      </a>
                    </div>
                    <div className="setting-row">
                      <div>
                        <h3>
                          {en
                            ? "Export your learning"
                            : "Exportar tu aprendizaje"}
                        </h3>
                        <p>
                          {en
                            ? "Download settings, drafts and graded attempts in JSON."
                            : "Descarga configuración, borradores e intentos evaluados en JSON."}
                        </p>
                      </div>
                      <button className="btn secondary" onClick={exportData}>
                        <Download size={16} />
                        {t.export}
                      </button>
                    </div>
                    <div className="setting-row">
                      <div>
                        <h3>{en ? "Offline manual" : "Manual sin conexión"}</h3>
                        <p>
                          {en
                            ? "Download the complete initial manual as a standalone HTML file."
                            : "Descarga el manual inicial completo como un archivo HTML independiente."}
                        </p>
                      </div>
                      <a
                        className="btn secondary"
                        href="/sintavra-manual.html"
                        download
                      >
                        <Download size={16} />
                        {en ? "Download manual" : "Descargar manual"}
                      </a>
                    </div>
                    <div className="setting-row">
                      <div>
                        <h3>{en ? "Source code" : "Código fuente"}</h3>
                        <p>
                          {en
                            ? "Portable source, setup instructions and current limitations."
                            : "Código portable, instrucciones de instalación y límites actuales."}
                        </p>
                      </div>
                      <a
                        className="btn secondary"
                        href="/sintavra-source.zip"
                        download
                      >
                        <Download size={16} />
                        ZIP
                      </a>
                    </div>
                    <div className="setting-row danger">
                      <div>
                        <h3>
                          {en
                            ? "Delete Sintavra data"
                            : "Eliminar datos de Sintavra"}
                        </h3>
                        <p>
                          {en
                            ? "Removes your progress and drafts. Does not delete your ChatGPT account."
                            : "Borra tu progreso y borradores. No elimina tu cuenta de ChatGPT."}
                        </p>
                      </div>
                      <button
                        className="btn secondary"
                        disabled={!userId}
                        onClick={() => setDeleteOpen(true)}
                      >
                        <Trash2 size={16} />
                        {en ? "Delete my data" : "Eliminar mis datos"}
                      </button>
                    </div>
                  </div>
                  <p className="privacy-note">
                    {en
                      ? "Code is sent to the database when saved. Browser execution does not send code to a compiler server. The optional AI runs locally; its first download contacts the model and runtime hosts. No analytics or advertising."
                      : "El código se envía a la base de datos al guardarlo. La ejecución en el navegador no envía código a un servidor compilador. La IA opcional funciona localmente; su primera descarga contacta con los proveedores del modelo y motor. Sin analítica ni publicidad."}
                  </p>
                </>
              )}
            </>
          )}
        </div>
        <footer className="app-footer">
          <span>
            sintavra<span className="brand-period">.</span> <span> / </span>
            {t.welcomeMenu}
          </span>
          <span>v0.1.0 · {en ? "Learn by doing" : "Aprende haciendo"}</span>
        </footer>
      </SidebarInset>
      <Dialog open={!!learning.guestProgress}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tu progreso viene contigo</DialogTitle>
            <DialogDescription>
              Encontramos práctica guardada sin cuenta. Elige cómo incorporarla;
              conservamos una copia local.
            </DialogDescription>
          </DialogHeader>
          {(["combine", "account", "local"] as const).map((choice, i) => (
            <button
              className="btn secondary"
              key={choice}
              disabled={merging}
              onClick={async () => {
                setMerging(true);
                try {
                  await learning.merge(choice);
                } catch (e) {
                  toast.error(String(e));
                } finally {
                  setMerging(false);
                }
              }}
            >
              {
                [
                  "Combinar ambos progresos",
                  "Conservar el de la cuenta",
                  "Usar el progreso local",
                ][i]
              }
            </button>
          ))}
        </DialogContent>
      </Dialog>
      <Dialog open={devOpen} onOpenChange={setDevOpen}>
        <DialogContent className="developer-dialog">
          <DialogHeader>
            <DialogTitle>SINTAVRA — DEVELOPER CODES</DialogTitle>
            <DialogDescription>Enter developer code:</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (devCode === "n-") {
                settings({ locale: "en" });
                setDevOpen(false);
                setDevCode("");
                setDevError("");
                toast.success("English Mode enabled.");
              } else
                setDevError(en ? "Unknown code." : "Código no reconocido.");
            }}
          >
            <label className="developer-input">
              <span>«</span>
              <input
                autoComplete="off"
                autoFocus
                aria-label="Enter developer code"
                value={devCode}
                onChange={(e) => setDevCode(e.target.value)}
                placeholder="_"
              />
              <span>»</span>
            </label>
            {devError && <p role="alert">{devError}</p>}
            <button className="btn primary" type="submit">
              Enter <ArrowRight size={16} />
            </button>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {en
                ? "Delete all your Sintavra data?"
                : "¿Eliminar todos tus datos de Sintavra?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {en
                ? "Export a copy first. This permanently removes saved drafts, tests and progress."
                : "Exporta una copia primero. Se eliminarán permanentemente los borradores, pruebas y progreso guardados."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{en ? "Cancel" : "Cancelar"}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  await learning.erase();
                  toast.success(en ? "Data deleted" : "Datos eliminados");
                  setView("home");
                } catch (e) {
                  toast.error(String(e));
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {en ? "Delete permanently" : "Eliminar permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster theme={s.theme === "light" ? "light" : "dark"} />
    </SidebarProvider>
  );
}
