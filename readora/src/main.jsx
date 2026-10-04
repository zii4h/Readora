import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  LayoutDashboard,
  Library,
  ChartNoAxesCombined,
  Award,
  Users,
  Settings,
  LogOut,
  ArrowRight,
  ChevronRight,
  Check,
  CheckCircle2,
  X,
  XCircle,
  Clock,
  Search,
  Flame,
  Sparkles,
  Target,
  Leaf,
  Sun,
  Compass,
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  Link,
  ShieldCheck,
  Menu,
  BookMarked,
  GraduationCap,
  Copy,
  Eye,
} from "lucide-react";
import "./styles.css";
const SKILLS = [
  "Literal Understanding",
  "Vocabulary in Context",
  "Main Idea",
  "Inference",
];
const shortSkill = {
  "Literal Understanding": "Literal",
  "Vocabulary in Context": "Vocabulary",
  "Main Idea": "Main idea",
  Inference: "Inference",
};
const badges = {
  "first-step": ["First step", "Complete your first activity."],
  "three-chapters": ["Turning pages", "Complete 3 different activities."],
  "reading-rhythm": ["Reading rhythm", "Complete 6 different activities."],
  "clear-reader": ["Crystal clear", "Score 100% on one activity."],
  "all-rounder": [
    "All-round reader",
    "Reach 75% in each skill, with at least 5 answers per skill.",
  ],
};
async function api(action, data = {}) {
  const res = await fetch("/api/handler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
  });
  const value = await res.json();
  if (!res.ok || value.error)
    throw new Error(value.error || "Something went wrong.");
  return value;
}
const date = (x) =>
  new Date(x).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const pct = (n, d) => (d ? Math.round((100 * n) / d) : 0);
function App() {
  const [session, setSession] = useState(null),
    [ready, setReady] = useState(false),
    [demo, setDemo] = useState(false),
    [page, setPage] = useState(location.hash.slice(1) || "home"),
    [catalog, setCatalog] = useState([]),
    [data, setData] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [auth, setAuth] = useState(null),
    [busy, setBusy] = useState(false),
    [attempt, setAttempt] = useState(null),
    [result, setResult] = useState(null),
    [detail, setDetail] = useState(null),
    [editor, setEditor] = useState(null),
    [mobile, setMobile] = useState(false),
    [confirm, setConfirm] = useState(null);
  const go = (p) => {
    location.hash = p;
    setPage(p);
    setError("");
    setData(null);
    setMobile(false);
  };
  useEffect(() => {
    const h = () => {
      setPage(location.hash.slice(1) || "home");
      setError("");
      setData(null);
    };
    window.addEventListener("hashchange", h);
    Promise.all([api("session"), api("catalog")])
      .then(([s, c]) => {
        setSession(s.user);
        setDemo(s.demo);
        setCatalog(c.exercises);
      })
      .catch((e) => setError(e.message))
      .finally(() => setReady(true));
    return () => window.removeEventListener("hashchange", h);
  }, []);
  const load = async () => {
    if (!session) return;
    const action =
      session.role === "learner"
        ? "dashboard"
        : session.role === "supervisor"
          ? "supervisor"
          : "admin";
    setData(await api(action));
  };
  useEffect(() => {
    if (session) load().catch((e) => setError(e.message));
  }, [session, page]);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 5000);
      return () => clearTimeout(t);
    }
  }, [notice]);
  const run = async (fn) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const start = (id) => {
    if (!session) {
      setDetail(null);
      setAuth("register");
      return;
    }
    run(async () => {
      const r = await api("start", { exerciseId: id });
      setAttempt(r.attempt);
      setResult(null);
      setDetail(null);
      go("read");
    });
  };
  const resume = (id) =>
    run(async () => {
      const r = await api("attempt", { id });
      setAttempt(r.attempt);
      setResult(null);
      go(r.attempt.completed ? "result" : "read");
    });
  const exitRead = () => {
    setAttempt(null);
    go("home");
  };
  const learner = session?.role === "learner",
    admin = session?.role === "admin",
    supervisor = session?.role === "supervisor";
  const nav = admin
    ? [
        ["home", "Overview", LayoutDashboard],
        ["catalog", "Content manager", Library],
      ]
    : supervisor
      ? [
          ["home", "My learners", Users],
          ["assignments", "Assignments", BookMarked],
          ["catalog", "Exercise catalog", Library],
        ]
      : [
          [
            "home",
            session ? "My learning" : "Discover Readora",
            LayoutDashboard,
          ],
          ["catalog", "Exercise catalog", Library],
          ...(learner
            ? [
                ["progress", "My progress", ChartNoAxesCombined],
                ["achievements", "Achievements", Award],
                ["connections", "My supervisors", Users],
              ]
            : []),
        ];
  if (!ready)
    return (
      <div className="loading">
        <BookOpen size={38} />
        <p>Opening Readora…</p>
      </div>
    );
  return (
    <>
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <a href="#home" className="brand">
          <span className="brandmark">
            <BookOpen size={24} />
          </span>
          readora<span className="branddot">.</span>
        </a>
        <div className="workspace-label">
          {admin
            ? "CONTENT WORKSPACE"
            : supervisor
              ? "SUPERVISOR WORKSPACE"
              : "YOUR READING SPACE"}
        </div>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              className={page === id ? "nav-item active" : "nav-item"}
              onClick={() => go(id)}
            >
              <Icon size={19} />
              {label}
              {page === id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Leaf size={23} />
            <strong>A little every day.</strong>
            <p>
              Small reading moments.
              <br />
              Deeper understanding.
            </p>
          </div>
          {session ? (
            <>
              <div className="usercard">
                <span className="avatar">
                  {session.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <strong>{session.name}</strong>
                  <small>{session.role}</small>
                </div>
                <button
                  title="Sign out"
                  className="icon-btn"
                  onClick={() =>
                    run(async () => {
                      await api("logout");
                      setSession(null);
                      setAttempt(null);
                      setData(null);
                      go("home");
                    })
                  }
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <button
              className="button primary full"
              onClick={() => setAuth("login")}
            >
              Sign in <ArrowRight size={16} />
            </button>
          )}
        </div>
      </aside>
      {mobile && <div className="scrim" onClick={() => setMobile(false)} />}
      <main className="main">
        <header className="topbar">
          <button
            className="icon-btn mobile-toggle"
            aria-label="Open navigation"
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            Your space <ChevronRight size={14} />
            <span>
              {page === "read"
                ? "Reading room"
                : page === "result"
                  ? "Exercise results"
                  : nav.find((n) => n[0] === page)?.[1] || "My learning"}
            </span>
          </div>
          <div className="top-right">
            {learner && data?.stats && (
              <>
                <span className="xp-pill">
                  <Sparkles size={15} />
                  {data.stats.xp} XP
                </span>
                <span className="level-pill">
                  Level {data.stats.playerLevel}
                </span>
              </>
            )}
            {!session ? (
              <button
                className="button small primary"
                onClick={() => setAuth("register")}
              >
                Get started <ArrowRight size={15} />
              </button>
            ) : (
              <span className="avatar small-avatar">{session.name[0]}</span>
            )}
          </div>
        </header>
        {error && (
          <div className="alert error" role="alert">
            <XCircle size={18} />
            <span>{error}</span>
            <button
              className="icon-btn"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="content">
          {page === "read" && attempt ? (
            <Reader
              attempt={attempt}
              busy={busy}
              run={run}
              setAttempt={setAttempt}
              onExit={exitRead}
              onFinish={(r) => {
                setAttempt(r.attempt);
                setResult(r);
                go("result");
                if (r.unlocked.length)
                  setNotice(
                    "Achievement unlocked: " +
                      r.unlocked.map((x) => badges[x][0]).join(", "),
                  );
              }}
            />
          ) : page === "result" && attempt ? (
            <Results
              attempt={attempt}
              result={result}
              onHome={() => go("home")}
              onCatalog={() => go("catalog")}
            />
          ) : page === "catalog" ? (
            admin ? (
              <AdminCatalog
                data={data}
                onEdit={(e) => setEditor(e)}
                onNew={() => setEditor(newExercise())}
                onDelete={(e) =>
                  setConfirm({
                    title: "Delete this exercise?",
                    text: `“${e.title}” will leave the catalog. Saved attempts and results stay intact.`,
                    action: () =>
                      run(async () => {
                        await api("deleteExercise", { id: e.id });
                        await load();
                        setCatalog((await api("catalog")).exercises);
                        setConfirm(null);
                        setNotice("Exercise deleted.");
                      }),
                  })
                }
              />
            ) : (
              <Catalog exercises={catalog} onOpen={setDetail} />
            )
          ) : !session ? (
            <Guest
              onStart={() => setAuth("register")}
              onBrowse={() => go("catalog")}
              exercises={catalog}
              onOpen={setDetail}
            />
          ) : learner && data?.stats ? (
            <>
              {page === "progress" ? (
                <Progress stats={data.stats} onReview={resume} />
              ) : page === "achievements" ? (
                <Achievements stats={data.stats} />
              ) : page === "connections" ? (
                <Connections
                  data={data}
                  busy={busy}
                  run={run}
                  load={load}
                  setConfirm={setConfirm}
                  setNotice={setNotice}
                />
              ) : (
                <Dashboard
                  user={session}
                  data={data}
                  catalog={catalog}
                  start={start}
                  resume={resume}
                  go={go}
                  onOpen={setDetail}
                />
              )}
            </>
          ) : supervisor && data?.learners ? (
            <Supervisor
              data={data}
              catalog={catalog}
              page={page}
              run={run}
              busy={busy}
              reload={load}
              setConfirm={setConfirm}
              setNotice={setNotice}
            />
          ) : admin && data?.exercises ? (
            <AdminOverview
              data={data}
              go={go}
              onNew={() => setEditor(newExercise())}
            />
          ) : (
            <div className="empty">
              <BookOpen />
              <h2>Loading your space…</h2>
              <p>If this takes too long, refresh the page.</p>
            </div>
          )}
        </div>
        <footer>
          Readora <span>Practice with purpose. Progress at your pace.</span>
          <small>Initial MVP · Original practice passages</small>
        </footer>
      </main>
      {notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          {notice}
        </div>
      )}
      {auth && (
        <Modal
          title={
            auth === "login"
              ? "Welcome back."
              : "Your next chapter starts here."
          }
          onClose={() => setAuth(null)}
        >
          <Auth
            mode={auth}
            setMode={setAuth}
            demo={demo}
            onSuccess={(u) => {
              setSession(u);
              setAuth(null);
              go("home");
            }}
          />
        </Modal>
      )}
      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)}>
          <div className="detail-art">
            <BookOpen size={70} />
            <span>{detail.category}</span>
          </div>
          <div className="tag-row">
            <span className={"tag " + detail.level.toLowerCase()}>
              {detail.level}
            </span>
            <span className="meta">
              <Clock size={14} /> ~{detail.minutes} min
            </span>
          </div>
          <p>{detail.description}</p>
          <div className="detail-grid">
            <div>
              <strong>{detail.sectionCount}</strong>
              <span>reading sections</span>
            </div>
            <div>
              <strong>{detail.questionCount}</strong>
              <span>questions with feedback</span>
            </div>
          </div>
          <h4>Skills you’ll practice</h4>
          <div className="tag-row">
            {detail.skills.map((s) => (
              <span className="tag muted" key={s}>
                {s}
              </span>
            ))}
          </div>
          <p className="muted-text source">{detail.source}</p>
          {(!session || learner) && (
            <button
              className="button primary full"
              disabled={busy}
              onClick={() => start(detail.id)}
            >
              {session ? "Start exercise" : "Create an account to practice"}
              <ArrowRight size={17} />
            </button>
          )}
        </Modal>
      )}
      {editor && (
        <Modal
          title={editor.id ? "Edit exercise" : "Create an exercise"}
          wide
          onClose={() => setEditor(null)}
        >
          <Editor
            initial={editor}
            onSaved={async () => {
              setEditor(null);
              await load();
              setCatalog((await api("catalog")).exercises);
              setNotice("Exercise saved.");
            }}
          />
        </Modal>
      )}
      {confirm && (
        <Modal title={confirm.title} onClose={() => setConfirm(null)}>
          <p>{confirm.text}</p>
          <div className="actions">
            <button className="button" onClick={() => setConfirm(null)}>
              Cancel
            </button>
            <button
              className="button danger"
              disabled={busy}
              onClick={confirm.action}
            >
              Confirm
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function Modal({ title, onClose, children, wide = false }) {
  const ref = React.useRef();
  useEffect(() => {
    const prev = document.activeElement;
    const el = ref.current;
    el.showModal();
    return () => {
      el.close();
      prev?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={"modal " + (wide ? "wide" : "")}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="icon-btn"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Auth({ mode, setMode, onSuccess, demo }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = Object.fromEntries(new FormData(e.currentTarget));
      const r = await api(mode === "login" ? "login" : "register", d);
      onSuccess(r.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className="muted-text">
        {mode === "login"
          ? "Sign in to pick up where you left off."
          : "Build comprehension one thoughtful reading session at a time."}
      </p>
      <form onSubmit={submit} className="form">
        {mode === "register" && (
          <>
            <label>
              Your name
              <input
                name="name"
                required
                maxLength={80}
                autoComplete="name"
                placeholder="What should we call you?"
              />
            </label>
            <label>
              I’m joining as
              <select name="role">
                <option value="learner">Learner</option>
                <option value="supervisor">
                  Supervisor — teacher or parent/guardian
                </option>
              </select>
            </label>
          </>
        )}
        <label>
          Username
          <input
            name="username"
            required
            minLength={3}
            maxLength={40}
            pattern="[A-Za-z0-9_]+"
            autoComplete="username"
            placeholder="e.g. alex_reads"
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={12}
            maxLength={128}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            placeholder="At least 12 characters"
          />
        </label>
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
        <button className="button primary full" disabled={busy}>
          {busy
            ? "Please wait…"
            : mode === "login"
              ? "Sign in"
              : "Create account"}
          <ArrowRight size={16} />
        </button>
      </form>
      <p className="auth-switch">
        {mode === "login" ? "New to Readora?" : "Already have an account?"}{" "}
        <button
          className="text-button"
          onClick={() => {
            setError("");
            setMode(mode === "login" ? "register" : "login");
          }}
        >
          {mode === "login" ? "Create an account" : "Sign in"}
        </button>
      </p>
      {demo && (
        <div className="demo-note">
          <strong>Local demo accounts</strong>
          <p>
            Usernames: learner · supervisor · admin
            <br />
            Password: <code>ReadoraDemo123!</code>
          </p>
        </div>
      )}
    </>
  );
}
function Heading({ eyebrow, title, children, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
      {action}
    </div>
  );
}
function BookArt({ variant = 0 }) {
  return (
    <div aria-hidden="true" className={"book-art variant-" + variant}>
      <div className="orbit one" />
      <div className="orbit two" />
      <span className="art-spark s1">✦</span>
      <span className="art-spark s2">✧</span>
      <div className="book b-back" />
      <div className="book b-front">
        <Leaf size={39} />
        <span>
          ONE PAGE
          <br />
          AT A TIME
        </span>
        <div className="book-line" />
      </div>
      <div className="art-ground" />
    </div>
  );
}
function Guest({ onStart, onBrowse, exercises, onOpen }) {
  return (
    <>
      <Heading
        title="Read a little. Understand more."
      >
        Comprehension is a skill. Let’s make room to practice it.
      </Heading>
      <section className="hero guest-hero">
        <div className="hero-copy">
          <span className="hero-label">
            <Sparkles size={15} /> MEANINGFUL PRACTICE, SMALL STEPS
          </span>
          <h2>
            Go beyond
            <br />
            the last page.
          </h2>
          <p>
            Pause. Think. Read between the lines.
            <br />
            Short passages, thoughtful questions, and a clearer picture of how
            you’re growing.
          </p>
          <button className="button cream" onClick={onStart}>
            Find your starting point <ArrowRight size={17} />
          </button>
          <span className="hero-foot">
            Four comprehension skills. Your own pace.
          </span>
        </div>
        <BookArt />
      </section>
      <div className="feature-row">
        {[
          [
            BookOpen,
            "Read in small sections",
            "A question at the right moment, not just a quiz at the end.",
          ],
          [
            Target,
            "Know what to work on",
            "Feedback and recommendations across four reading skills.",
          ],
          [
            Award,
            "Make progress feel good",
            "Earn XP and milestones while building understanding.",
          ],
        ].map(([Icon, t, p]) => (
          <div className="feature" key={t}>
            <Icon />
            <h3>{t}</h3>
            <p>{p}</p>
          </div>
        ))}
      </div>
      <SectionTitle
        title="Find your next read"
        subtitle="A few minutes. A new perspective."
        action={
          <button className="text-button" onClick={onBrowse}>
            Explore catalog <ArrowRight size={16} />
          </button>
        }
      />
      <div className="cards">
        {exercises.slice(0, 3).map((e, i) => (
          <ExerciseCard key={e.id} e={e} index={i} onOpen={onOpen} />
        ))}
      </div>
    </>
  );
}
function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
function Dashboard({ user, data, catalog, start, resume, go, onOpen }) {
  const { stats: s, weakest } = data;
  const assessed = s.readingLevel !== "Not Assessed";
  return (
    <>
      <Heading
        eyebrow="LET’S MAKE A LITTLE PROGRESS"
        title={`Hello, ${user.name.split(" ")[0]}.`}
      >
        Your next chapter of understanding starts here.
      </Heading>
      <div className="dashboard-top">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-label">
              <Leaf size={15} />
              {assessed ? "YOUR DAILY READING MOMENT" : "START WHERE YOU ARE"}
            </span>
            <h2>
              {assessed ? (
                <>
                  A little reading.
                  <br />A deeper understanding.
                </>
              ) : (
                <>
                  Every reader has
                  <br />a starting point.
                </>
              )}
            </h2>
            <p>
              {assessed
                ? `Make room for a short exercise today. ${weakest ? `Let’s give ${shortSkill[weakest].toLowerCase()} a little extra practice.` : ""}`
                : "Discover your strengths with a short baseline assessment. No pressure, just a place to begin."}
            </p>
            <button
              className="button cream"
              onClick={() => (assessed ? go("catalog") : start("baseline"))}
            >
              {assessed ? "Find an exercise" : "Take baseline assessment"}
              <ArrowRight size={17} />
            </button>
            <span className="hero-foot">
              {assessed
                ? "Learn at your pace. Every section counts."
                : "~5 minutes · 8 questions · All four skills"}
            </span>
          </div>
          <BookArt />
        </section>
        <aside className="level-card">
          <div className="eyebrow">YOUR READING JOURNEY</div>
          <div className="level-medallion">
            <BookOpen size={32} />
          </div>
          <h3>{s.readingLevel}</h3>
          <p>
            {assessed
              ? "Your current reading level"
              : "Take the baseline to find your level"}
          </p>
          <div className="divider" />
          <div className="spread">
            <span>
              Player level <strong>{s.playerLevel}</strong>
            </span>
            <span className="xp-text">{s.xp} XP</span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${s.xp % 100}%` }} />
          </div>
          <small>{100 - (s.xp % 100)} XP to the next player level</small>
        </aside>
      </div>
      <div className="stat-row">
        <Stat
          icon={BookOpen}
          label="Exercises completed"
          value={s.completed}
          note={`${s.unique} different activities`}
        />
        <Stat
          icon={Target}
          label="Overall comprehension"
          value={s.overall === null ? "—" : s.overall + "%"}
          note={
            s.total
              ? `${s.correct} of ${s.total} answers correct`
              : "Your results will appear here"
          }
        />
        <Stat
          icon={Award}
          label="Achievements earned"
          value={s.achievements.length}
          note="Little milestones, lasting progress"
        />
      </div>
      {data.active.length > 0 && (
        <section className="resume-panel">
          <BookMarked />
          <div>
            <strong>Pick up where you left off</strong>
            <p>
              {data.active[0].title} · Section {data.active[0].section} of{" "}
              {data.active[0].sections}
            </p>
          </div>
          <button
            className="button small"
            onClick={() => resume(data.active[0].id)}
          >
            Continue <ArrowRight size={16} />
          </button>
        </section>
      )}
      <SectionTitle
        title={
          assessed ? "Picked for your next step" : "Explore the reading shelf"
        }
        subtitle={
          assessed
            ? data.recommendations.length
              ? `${s.readingLevel} practice${weakest ? ` with a focus on ${shortSkill[weakest].toLowerCase()}` : ""}.`
              : "No exact level-and-skill match yet. Explore these available exercises."
            : "All reading levels are open to you."
        }
        action={
          <button className="text-button" onClick={() => go("catalog")}>
            View catalog <ArrowRight size={16} />
          </button>
        }
      />
      <div className="cards">
        {(data.recommendations.length ? data.recommendations : catalog)
          .slice(0, 3)
          .map((e, i) => (
            <ExerciseCard
              key={e.id}
              e={e}
              index={i}
              onOpen={onOpen}
              completed={s.history.some((h) => h.exerciseId === e.id)}
            />
          ))}
      </div>
      <div className="two-col">
        <section className="panel">
          <SectionTitle
            title="Your skill snapshot"
            action={
              <button className="text-button" onClick={() => go("progress")}>
                See progress <ArrowRight size={15} />
              </button>
            }
          />
          <SkillBars stats={s} />
        </section>
        <section className="panel">
          <SectionTitle
            title="From your supervisor"
            subtitle="A little direction for your next session."
          />
          {data.assignments.length ? (
            data.assignments.slice(0, 3).map((a) => (
              <div className="assignment-mini" key={a.id}>
                <span className={"checkbox " + (a.done ? "done" : "")}>
                  {a.done ? <Check size={14} /> : <BookOpen size={14} />}
                </span>
                <div>
                  <strong>{a.title}</strong>
                  <small>
                    {a.supervisor_name} · Due {date(a.due_date)}
                  </small>
                  {a.note && <p>{a.note}</p>}
                </div>
                {a.done ? (
                  <span className="tag beginner">Done</span>
                ) : a.available ? (
                  <button
                    className="icon-btn"
                    aria-label={"Start " + a.title}
                    onClick={() => start(a.exercise_id)}
                  >
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <span className="tag muted">Unavailable</span>
                )}
              </div>
            ))
          ) : (
            <div className="small-empty">
              <Users size={28} />
              <h3>Your support team starts here.</h3>
              <p>
                Connect with a teacher or parent to receive exercises and share
                your progress.
              </p>
              <button className="text-button" onClick={() => go("connections")}>
                Connect a supervisor <ArrowRight size={15} />
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
function Stat({ icon: Icon, label, value, note }) {
  return (
    <div className="stat">
      <div className="stat-icon">
        <Icon size={21} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </div>
  );
}
function ExerciseCard({ e, index, onOpen, completed }) {
  return (
    <button className="exercise-card" onClick={() => onOpen(e)}>
      <div className={"card-art art-" + (index % 3)}>
        <div className="art-lines" />
        {index % 3 === 0 ? (
          <Compass size={64} strokeWidth={1} />
        ) : index % 3 === 1 ? (
          <Leaf size={64} strokeWidth={1} />
        ) : (
          <Sun size={64} strokeWidth={1} />
        )}
        <span className="category">{e.category}</span>
        {completed && (
          <span className="completed-mark">
            <Check size={15} /> Completed
          </span>
        )}
      </div>
      <div className="card-content">
        <div className="spread">
          <span className={"tag " + e.level.toLowerCase()}>{e.level}</span>
          <span className="meta">
            <Clock size={13} /> ~{e.minutes} min
          </span>
        </div>
        <h3>{e.title}</h3>
        <p>{e.description}</p>
        <div className="card-skills">
          {e.skills.map((s) => (
            <span key={s}>{shortSkill[s]}</span>
          ))}
        </div>
        <div className="card-footer">
          <span>
            {e.sectionCount} sections · {e.questionCount} questions
          </span>
          <ArrowRight size={18} />
        </div>
      </div>
    </button>
  );
}
function Catalog({ exercises, onOpen }) {
  const [search, setSearch] = useState(""),
    [level, setLevel] = useState("All levels"),
    [skill, setSkill] = useState("All skills");
  const filtered = exercises.filter(
    (e) =>
      (level === "All levels" || e.level === level) &&
      (skill === "All skills" || e.skills.includes(skill)) &&
      `${e.title} ${e.category} ${e.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <Heading title="The Reading Shelf">
        Short exercises. Four skills. Every level open to you.
      </Heading>
      <div className="catalog-toolbar">
        <label className="search">
          <Search size={19} />
          <input
            aria-label="Search exercises"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories, topics, or titles…"
          />
        </label>
        <select
          aria-label="Filter by reading level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          {["All levels", "Beginner", "Intermediate", "Advanced"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          aria-label="Filter by skill"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        >
          {["All skills", ...SKILLS].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <p className="results-count">{filtered.length} exercises to explore</p>
      <div className="cards">
        {filtered.map((e, i) => (
          <ExerciseCard key={e.id} e={e} index={i} onOpen={onOpen} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty">
          <Search />
          <h2>No exercises found</h2>
          <p>Try another search or change your filters.</p>
          <button
            className="button"
            onClick={() => {
              setSearch("");
              setLevel("All levels");
              setSkill("All skills");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
function SkillBars({ stats }) {
  return (
    <div className="skill-bars">
      {SKILLS.map((s, i) => {
        const x = stats.skills[s];
        return (
          <div key={s}>
            <div className="spread">
              <span>{s}</span>
              <strong>
                {x.percent === null ? "Not practiced" : x.percent + "%"}
              </strong>
            </div>
            <div className={"progress-track skill-" + i}>
              <span style={{ width: `${x.percent || 0}%` }} />
            </div>
            <small>
              {x.total
                ? `${x.correct} correct out of ${x.total}`
                : "Complete questions to build this skill profile."}
            </small>
          </div>
        );
      })}
    </div>
  );
}
function Progress({ stats: s, onReview }) {
  return (
    <>
      <Heading
        eyebrow="UNDERSTANDING YOUR GROWTH"
        title="Progress you can see."
      >
        Every completed attempt helps build a clearer picture.
      </Heading>
      <div className="stat-row">
        <Stat
          icon={GraduationCap}
          label="Reading level"
          value={s.readingLevel}
          note="Based on comprehension, not XP"
        />
        <Stat
          icon={Target}
          label="Overall performance"
          value={s.overall === null ? "—" : s.overall + "%"}
          note={`${s.correct} correct / ${s.total} questions`}
        />
        <Stat
          icon={Sparkles}
          label={"Player level " + s.playerLevel}
          value={s.xp + " XP"}
          note="100 XP per player level"
        />
      </div>
      <div className="two-col">
        <section className="panel">
          <SectionTitle title="Four skills, one stronger reader" />
          <SkillBars stats={s} />
        </section>
        <section className="panel">
          <SectionTitle title="How your progress works" />
          <div className="explain">
            <Target />
            <div>
              <h3>Comprehension comes first</h3>
              <p>
                Correct answers ÷ all answered questions in completed activities
                × 100. Baseline and repeat attempts count; unfinished work does
                not.
              </p>
            </div>
          </div>
          <div className="level-scale">
            <span>
              Beginner <b>0–49%</b>
            </span>
            <span>
              Intermediate <b>50–74%</b>
            </span>
            <span>
              Advanced <b>75–100%</b>
            </span>
          </div>
          <p className="muted-text">
            Level boundaries use the unrounded score. Complete the baseline to
            receive your starting level. This practice indicator is not a
            standardized reading diagnosis.
          </p>
          <div className="explain">
            <Award />
            <div>
              <h3>XP celebrates participation</h3>
              <p>
                50 XP for the baseline and 30 XP for each different exercise.
                Repeats award 0 XP. Achievements stay earned.
              </p>
            </div>
          </div>
        </section>
      </div>
      <section className="panel history">
        <SectionTitle
          title="Your reading history"
          subtitle="Revisit your answers and feedback."
        />
        {s.history.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Completed</th>
                  <th>Result</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {s.history.map((h) => (
                  <tr key={h.id}>
                    <td>
                      <strong>{h.title}</strong>
                      {h.baseline && <small>Baseline assessment</small>}
                    </td>
                    <td>{date(h.completedAt)}</td>
                    <td>
                      <span className="tag muted">
                        {h.correct}/{h.total} · {pct(h.correct, h.total)}%
                      </span>
                    </td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => onReview(h.id)}
                      >
                        Feedback <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="small-empty">
            <BookOpen />
            <p>Your completed activities will appear here.</p>
          </div>
        )}
      </section>
    </>
  );
}
function Achievements({ stats }) {
  return (
    <>
      <Heading eyebrow="THE SMALL WINS MATTER" title="Your milestone shelf.">
        Earned through practice. Yours to keep.
      </Heading>
      <div className="achievement-grid">
        {Object.entries(badges).map(([code, [title, description]], i) => {
          const earned = stats.achievements.find((a) => a.code === code);
          return (
            <div
              className={"achievement " + (earned ? "earned" : "locked")}
              key={code}
            >
              <div className="badge-icon">
                {i % 2 ? <BookMarked size={34} /> : <Award size={34} />}
              </div>
              <span className="eyebrow">
                {earned ? "UNLOCKED" : "AHEAD OF YOU"}
              </span>
              <h2>{title}</h2>
              <p>{description}</p>
              <small>
                {earned
                  ? "Earned " + date(earned.earned_at)
                  : "Keep practicing to unlock"}
              </small>
            </div>
          );
        })}
      </div>
    </>
  );
}
function Connections({ data, run, busy, load, setConfirm, setNotice }) {
  const [code, setCode] = useState("");
  return (
    <>
      <Heading eyebrow="LEARNING, WITH SUPPORT" title="Your support team.">
        You decide who can view your progress and assign exercises.
      </Heading>
      <section className="panel connect-panel">
        <div className="connect-icon">
          <Link size={30} />
        </div>
        <div>
          <h2>Invite a teacher or parent</h2>
          <p>
            Share a one-time connection code with your chosen supervisor. It
            expires in 24 hours. Connecting gives them access to your scores and
            reading history.
          </p>
          <button
            className="button primary"
            disabled={busy}
            onClick={() => run(async () => setCode((await api("invite")).code))}
          >
            {code ? "Generate a new code" : "Generate connection code"}
            <Plus size={16} />
          </button>
          {code && (
            <div className="connection-code">
              <code>{code}</code>
              <button
                className="icon-btn"
                aria-label="Copy connection code"
                onClick={() =>
                  run(async () => {
                    await navigator.clipboard.writeText(code);
                    setNotice("Connection code copied.");
                  })
                }
              >
                <Copy size={18} />
              </button>
            </div>
          )}
        </div>
      </section>
      <SectionTitle title="Connected supervisors" />
      {data.connections.length ? (
        data.connections.map((c) => (
          <div className="connection-row panel" key={c.id}>
            <span className="avatar">{c.name[0]}</span>
            <div>
              <strong>{c.name}</strong>
              <small>@{c.username}</small>
            </div>
            <button
              className="button small"
              onClick={() =>
                setConfirm({
                  title: "Disconnect supervisor?",
                  text: `${c.name} will lose access to your progress. Their assignments to you will be removed.`,
                  action: () =>
                    run(async () => {
                      await api("disconnect", { supervisorId: c.id });
                      await load();
                      setConfirm(null);
                      setNotice("Supervisor disconnected.");
                    }),
                })
              }
            >
              Disconnect
            </button>
          </div>
        ))
      ) : (
        <div className="empty">
          <Users />
          <h2>No supervisors connected</h2>
          <p>
            You can practice independently or invite someone when you’re ready.
          </p>
        </div>
      )}
    </>
  );
}
function Reader({ attempt: a, busy, run, setAttempt, onExit, onFinish }) {
  const [selected, setSelected] = useState({});
  useEffect(() => setSelected({}), [a.sectionIndex, a.id]);
  const sec = a.section;
  return (
    <div className="reader">
      <button className="text-button back" onClick={onExit}>
        <ArrowLeft size={16} /> Save & leave
      </button>
      <div className="reader-heading">
        <span className="eyebrow">
          {a.baseline ? "BASELINE ASSESSMENT" : "YOUR READING ROOM"}
        </span>
        <h1>{a.title}</h1>
        <p>
          Section {a.sectionIndex + 1} of {a.sectionCount} · Read thoughtfully.
          There’s no timer.
        </p>
        <div className="section-steps">
          {Array.from({ length: a.sectionCount }, (_, i) => (
            <div key={i} className={i <= a.sectionIndex ? "filled" : ""} />
          ))}
        </div>
      </div>
      <article className="passage">
        <span className="eyebrow">
          SECTION {String(a.sectionIndex + 1).padStart(2, "0")}
        </span>
        <h2>{sec.title}</h2>
        {sec.text.split("\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>
      <div className="question-intro">
        <Sparkles size={19} />
        <span>Pause & think</span>
        <small>You can look back at the passage while answering.</small>
      </div>
      {sec.questions.map((q, i) => {
        const answer = a.answers.find((x) => x.questionId === q.id);
        return (
          <section className="question panel" key={q.id}>
            <div className="spread">
              <span className="eyebrow">QUESTION {i + 1}</span>
              <span className="tag muted">{q.skill}</span>
            </div>
            <h3>{q.prompt}</h3>
            <fieldset disabled={!!answer || busy}>
              <legend className="sr-only">{q.prompt}</legend>
              {q.options.map((o, j) => (
                <label
                  key={j}
                  className={
                    "option " +
                    ((answer ? answer.selected : selected[q.id]) === j
                      ? "selected "
                      : "") +
                    (answer && answer.correctIndex === j
                      ? "correct-option"
                      : "")
                  }
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={j}
                    checked={(answer ? answer.selected : selected[q.id]) === j}
                    onChange={() => setSelected({ ...selected, [q.id]: j })}
                  />
                  <span className="option-letter">
                    {String.fromCharCode(65 + j)}
                  </span>
                  <span>{o}</span>
                  {answer?.correctIndex === j && <Check size={18} />}
                </label>
              ))}
            </fieldset>
            {answer ? (
              <div
                className={
                  "feedback " + (answer.correct ? "positive" : "reflect")
                }
                role="status"
              >
                {answer.correct ? (
                  <CheckCircle2 size={21} />
                ) : (
                  <Compass size={21} />
                )}
                <div>
                  <strong>
                    {answer.correct
                      ? "That’s right."
                      : "A chance to look closer."}
                  </strong>
                  <p>{answer.explanation}</p>
                  {!answer.correct && (
                    <p>
                      Correct answer: <b>{q.options[answer.correctIndex]}</b>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <button
                className="button primary"
                disabled={busy || selected[q.id] === undefined}
                onClick={() =>
                  run(async () =>
                    setAttempt(
                      (
                        await api("answer", {
                          id: a.id,
                          questionId: q.id,
                          selected: selected[q.id],
                        })
                      ).attempt,
                    ),
                  )
                }
              >
                Check answer <Check size={16} />
              </button>
            )}
          </section>
        );
      })}
      <div className="reader-actions">
        <small>Answers save automatically after you check them.</small>
        {a.sectionIndex < a.sectionCount - 1 ? (
          <button
            className="button primary"
            disabled={!a.answeredSection || busy}
            onClick={() =>
              run(async () => {
                setAttempt((await api("next", { id: a.id })).attempt);
                window.scrollTo(0, 0);
              })
            }
          >
            Next section <ArrowRight size={17} />
          </button>
        ) : (
          <button
            className="button primary"
            disabled={!a.allAnswered || busy}
            onClick={() =>
              run(async () => {
                onFinish(await api("finish", { id: a.id }));
                window.scrollTo(0, 0);
              })
            }
          >
            Finish & see results <ArrowRight size={17} />
          </button>
        )}
      </div>
      <p className="source muted-text">{a.source}</p>
    </div>
  );
}
function Results({ attempt: a, result, onHome, onCatalog }) {
  const skill = Object.fromEntries(
    SKILLS.map((s) => [s, { correct: 0, total: 0, percent: null }]),
  );
  a.answers.forEach((x) => {
    skill[x.skill].total++;
    if (x.correct) skill[x.skill].correct++;
  });
  Object.values(skill).forEach(
    (x) => (x.percent = x.total ? pct(x.correct, x.total) : null),
  );
  return (
    <>
      <Heading
        eyebrow="ONE MORE STEP FORWARD"
        title="A little more understood."
      >
        Here’s what you took away from “{a.title}”.
      </Heading>
      <div className="result-hero">
        <div className="score-circle">
          <strong>
            {pct(a.correct, a.total)}
            <span>%</span>
          </strong>
          <small>
            {a.correct} of {a.total} correct
          </small>
        </div>
        <div>
          <span className="eyebrow">EXERCISE COMPLETED</span>
          <h2>
            {a.correct === a.total
              ? "A clear understanding."
              : "Every answer is a learning moment."}
          </h2>
          <p>
            {result
              ? `+${result.xpEarned} XP${result.xpEarned === 0 ? " · Repeat practice earns no additional XP." : " · Keep the momentum going."}`
              : "Review your saved answers and explanations below."}
          </p>
          {result?.stats && (
            <p>
              Reading level: <strong>{result.stats.readingLevel}</strong> ·
              Player level: <strong>{result.stats.playerLevel}</strong>
            </p>
          )}
          <div className="actions">
            <button className="button primary" onClick={onCatalog}>
              Find another exercise <ArrowRight size={16} />
            </button>
            <button className="button" onClick={onHome}>
              My learning
            </button>
          </div>
        </div>
      </div>
      <div className="panel">
        <SectionTitle title="This exercise, by skill" />
        <SkillBars stats={{ skills: skill }} />
      </div>
      <SectionTitle
        title="Take a second look"
        subtitle="Your answers, with the reasoning behind them."
      />
      {a.review?.map((s) => (
        <section className="panel review-section" key={s.id}>
          <details>
            <summary>
              {s.title} <span>View passage</span>
            </summary>
            <p className="review-passage">{s.text}</p>
          </details>
          {s.questions.map((q) => (
            <div className="review-question" key={q.id}>
              <div className="spread">
                <strong>{q.prompt}</strong>
                {q.answer.correct ? (
                  <CheckCircle2 className="green" size={20} />
                ) : (
                  <XCircle className="amber" size={20} />
                )}
              </div>
              <p>Your answer: {q.options[q.answer.selected]}</p>
              {!q.answer.correct && (
                <p>
                  Correct answer: <b>{q.options[q.correct]}</b>
                </p>
              )}
              <div className="feedback positive">
                <p>{q.explanation}</p>
              </div>
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
function Supervisor({
  data,
  catalog,
  page,
  run,
  busy,
  reload,
  setConfirm,
  setNotice,
}) {
  const [code, setCode] = useState(""),
    [selected, setSelected] = useState(null),
    [assign, setAssign] = useState(null);
  const remove = (a) =>
    setConfirm({
      title: "Remove assignment?",
      text: "This removes the assignment, but the learner keeps any saved results.",
      action: () =>
        run(async () => {
          await api("deleteAssignment", { id: a.id });
          await reload();
          setConfirm(null);
        }),
    });
  return (
    <>
      <Heading
        eyebrow="SUPERVISOR WORKSPACE"
        title={
          page === "assignments"
            ? "A little direction goes a long way."
            : "Support their next chapter."
        }
      >
        {page === "assignments"
          ? "Assign purposeful practice and see what’s complete."
          : "Connect with learners, notice their strengths, and guide their practice."}
      </Heading>
      {page !== "assignments" && (
        <section className="panel supervisor-connect">
          <div>
            <h3>
              <Link size={20} /> Connect with a learner
            </h3>
            <p>
              Ask the learner to share a code from their My supervisors page.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await api("connect", { code });
                setCode("");
                await reload();
                setNotice("Learner connected.");
              });
            }}
          >
            <input
              aria-label="Learner connection code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="12-character code"
              minLength={12}
              maxLength={12}
            />
            <button className="button primary" disabled={busy}>
              Connect
            </button>
          </form>
        </section>
      )}
      {page === "assignments" ? (
        <>
          <button
            className="button primary"
            disabled={!data.learners.length}
            onClick={() => setAssign(data.learners[0]?.id)}
          >
            Assign an exercise <Plus size={17} />
          </button>
          <section className="panel history">
            <Assignments
              rows={data.assignments}
              learners={data.learners}
              remove={remove}
            />
          </section>
        </>
      ) : (
        <>
          {data.learners.length ? (
            <div className="learner-grid">
              {data.learners.map((l) => (
                <section className="panel learner-card" key={l.id}>
                  <div className="connection-row">
                    <span className="avatar">{l.name[0]}</span>
                    <div>
                      <h3>{l.name}</h3>
                      <small>@{l.username}</small>
                    </div>
                    <span className="tag muted">{l.stats.readingLevel}</span>
                  </div>
                  <div className="mini-stats">
                    <span>
                      <strong>
                        {l.stats.overall === null ? "—" : l.stats.overall + "%"}
                      </strong>
                      comprehension
                    </span>
                    <span>
                      <strong>{l.stats.completed}</strong>completed
                    </span>
                    <span>
                      <strong>{l.stats.xp}</strong>XP earned
                    </span>
                  </div>
                  <SkillBars stats={l.stats} />
                  <div className="actions">
                    <button
                      className="button primary small"
                      onClick={() => setAssign(l.id)}
                    >
                      Assign exercise <Plus size={15} />
                    </button>
                    <button
                      className="button small"
                      onClick={() => setSelected(l)}
                    >
                      View history
                    </button>
                  </div>
                  <button
                    className="text-button muted-text"
                    onClick={() =>
                      setConfirm({
                        title: "Disconnect learner?",
                        text: "You will lose access to their progress and your assignments to them will be removed.",
                        action: () =>
                          run(async () => {
                            await api("disconnect", { learnerId: l.id });
                            await reload();
                            setConfirm(null);
                          }),
                      })
                    }
                  >
                    Disconnect
                  </button>
                </section>
              ))}
            </div>
          ) : (
            <div className="empty">
              <Users size={36} />
              <h2>Your learners will appear here.</h2>
              <p>
                Connect using a learner’s code to view real progress and assign
                an exercise.
              </p>
            </div>
          )}
        </>
      )}
      {selected && (
        <Modal
          title={selected.name + " · Reading history"}
          onClose={() => setSelected(null)}
        >
          {selected.stats.history.length ? (
            selected.stats.history.map((h) => (
              <div className="history-row" key={h.id}>
                <div>
                  <strong>{h.title}</strong>
                  <small>{date(h.completedAt)}</small>
                </div>
                <span className="tag muted">
                  {h.correct}/{h.total} · {pct(h.correct, h.total)}%
                </span>
              </div>
            ))
          ) : (
            <p>No completed exercises yet.</p>
          )}
        </Modal>
      )}
      {assign && (
        <Modal
          title="Assign purposeful practice"
          onClose={() => setAssign(null)}
        >
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = Object.fromEntries(new FormData(e.currentTarget));
              run(async () => {
                await api("assign", f);
                setAssign(null);
                await reload();
                setNotice("Exercise assigned.");
              });
            }}
          >
            <label>
              Learner
              <select name="learnerId" defaultValue={assign}>
                {data.learners.map((l) => (
                  <option value={l.id} key={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Exercise
              <select name="exerciseId">
                {catalog.map((e) => (
                  <option value={e.id} key={e.id}>
                    {e.title} · {e.level}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Due date
              <input name="dueDate" type="date" required />
            </label>
            <label>
              Note (optional)
              <textarea
                name="note"
                maxLength={500}
                placeholder="A little encouragement or an area to focus on…"
              />
            </label>
            <button
              className="button primary"
              disabled={busy || !catalog.length}
            >
              Assign exercise <ArrowRight size={16} />
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
function Assignments({ rows, learners, remove }) {
  return rows.length ? (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Learner</th>
            <th>Due</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td>
                <strong>{a.title}</strong>
                <small>{a.note}</small>
              </td>
              <td>
                {learners.find((l) => l.id === a.learner_id)?.name ||
                  "Disconnected"}
              </td>
              <td>{date(a.due_date)}</td>
              <td>
                <span className={"tag " + (a.done ? "beginner" : "muted")}>
                  {a.done
                    ? "Completed"
                    : a.due_date < new Date().toISOString().slice(0, 10)
                      ? "Overdue"
                      : "Assigned"}
                </span>
              </td>
              <td>
                <button
                  className="icon-btn"
                  aria-label={"Remove assignment " + a.title}
                  onClick={() => remove(a)}
                >
                  <Trash2 size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="small-empty">
      <BookMarked />
      <h3>No assignments yet</h3>
      <p>Choose an exercise for a connected learner to get started.</p>
    </div>
  );
}
function AdminOverview({ data, go, onNew }) {
  return (
    <>
      <Heading
        eyebrow="ADMINISTRATOR WORKSPACE"
        title="Make every exercise count."
      >
        Create thoughtful practice and keep the reading shelf growing.
      </Heading>
      <div className="stat-row">
        <Stat
          icon={Library}
          label="Catalog exercises"
          value={data.exercises.filter((e) => !e.baseline).length}
          note="Across three reading levels"
        />
        <Stat
          icon={Eye}
          label="Published activities"
          value={data.exercises.filter((e) => e.published).length}
          note="Including the baseline assessment"
        />
        <Stat
          icon={Users}
          label="Registered accounts"
          value={data.userCount}
          note="Learners, supervisors, administrators"
        />
      </div>
      <section className="hero admin-hero">
        <div className="hero-copy">
          <span className="hero-label">
            THOUGHTFUL CONTENT, MEANINGFUL PRACTICE
          </span>
          <h2>
            Build the next
            <br />
            learning moment.
          </h2>
          <p>
            Add a passage, divide it into sections, and ask questions that
            invite understanding.
          </p>
          <button className="button cream" onClick={onNew}>
            Create exercise <Plus size={16} />
          </button>
        </div>
        <BookArt />
      </section>
      <section className="panel history">
        <SectionTitle
          title="Content management"
          subtitle="Edit passages, review answer keys, and publish when ready."
          action={
            <button className="button" onClick={() => go("catalog")}>
              Manage catalog <ArrowRight size={16} />
            </button>
          }
        />
        <p>
          Existing attempts preserve their original questions and feedback when
          you edit or delete an exercise. Learner records remain intact.
        </p>
      </section>
    </>
  );
}
function AdminCatalog({ data, onEdit, onNew, onDelete }) {
  return (
    <>
      <Heading
        eyebrow="CONTENT MANAGEMENT"
        title="Your reading shelf."
        action={
          <button className="button primary" onClick={onNew}>
            New exercise <Plus size={17} />
          </button>
        }
      >
        Create, edit, publish, or remove comprehension exercises.
      </Heading>
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Level</th>
                <th>Content</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.exercises?.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong>{e.title}</strong>
                    <small>
                      {e.baseline ? "Baseline assessment" : e.category}
                    </small>
                  </td>
                  <td>{e.level}</td>
                  <td>
                    {e.sectionCount} sections · {e.questionCount} questions
                  </td>
                  <td>
                    <span
                      className={"tag " + (e.published ? "beginner" : "muted")}
                    >
                      {e.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="icon-btn"
                        aria-label={"Edit " + e.title}
                        onClick={() => onEdit(e)}
                      >
                        <Pencil size={17} />
                      </button>
                      {!e.baseline && (
                        <button
                          className="icon-btn"
                          aria-label={"Delete " + e.title}
                          onClick={() => onDelete(e)}
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
const newQuestion = () => ({
  skill: SKILLS[0],
  prompt: "",
  options: ["", "", "", ""],
  correct: 0,
  explanation: "",
});
const newSection = () => ({ title: "", text: "", questions: [newQuestion()] });
const newExercise = () => ({
  title: "",
  description: "",
  category: "Everyday stories",
  level: "Beginner",
  minutes: 5,
  source: "",
  published: false,
  sections: [newSection()],
});
function Editor({ initial, onSaved }) {
  const [e, setE] = useState(() => structuredClone(initial)),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const field = (key, value) => setE({ ...e, [key]: value });
  const section = (i, key, value) =>
    setE({
      ...e,
      sections: e.sections.map((s, j) =>
        j === i ? { ...s, [key]: value } : s,
      ),
    });
  const question = (i, j, key, value) =>
    section(
      i,
      "questions",
      e.sections[i].questions.map((q, k) =>
        k === j ? { ...q, [key]: value } : q,
      ),
    );
  return (
    <form
      className="form editor"
      onSubmit={async (ev) => {
        ev.preventDefault();
        setBusy(true);
        setError("");
        try {
          await api("saveExercise", e);
          await onSaved();
        } catch (err) {
          setError(err.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="two-col">
        <label>
          Title
          <input
            required
            maxLength={120}
            value={e.title}
            onChange={(v) => field("title", v.target.value)}
          />
        </label>
        <label>
          Category
          <input
            required
            maxLength={60}
            value={e.category}
            onChange={(v) => field("category", v.target.value)}
          />
        </label>
        <label>
          Reading level
          <select
            value={e.level}
            onChange={(v) => field("level", v.target.value)}
          >
            {["Beginner", "Intermediate", "Advanced"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Estimated minutes
          <input
            type="number"
            required
            min="1"
            max="60"
            value={e.minutes}
            onChange={(v) => field("minutes", Number(v.target.value))}
          />
        </label>
      </div>
      <label>
        Short description
        <textarea
          required
          maxLength={500}
          value={e.description}
          onChange={(v) => field("description", v.target.value)}
        />
      </label>
      <label>
        Source and reuse permission
        <textarea
          required
          maxLength={1000}
          placeholder="Original text, or source URL + author + license/public-domain basis"
          value={e.source}
          onChange={(v) => field("source", v.target.value)}
        />
      </label>
      {e.sections.map((s, i) => (
        <section className="editor-section" key={i}>
          <div className="spread">
            <h3>Section {i + 1}</h3>
            {e.sections.length > 1 && (
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  field(
                    "sections",
                    e.sections.filter((_, j) => i !== j),
                  )
                }
              >
                Remove section
              </button>
            )}
          </div>
          <label>
            Section heading
            <input
              required
              maxLength={120}
              value={s.title}
              onChange={(v) => section(i, "title", v.target.value)}
            />
          </label>
          <label>
            Passage
            <textarea
              required
              className="passage-input"
              maxLength={12000}
              value={s.text}
              onChange={(v) => section(i, "text", v.target.value)}
            />
          </label>
          {s.questions.map((q, j) => (
            <div className="editor-question" key={j}>
              <div className="spread">
                <h4>Question {j + 1}</h4>
                {s.questions.length > 1 && (
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Remove question"
                    onClick={() =>
                      section(
                        i,
                        "questions",
                        s.questions.filter((_, k) => k !== j),
                      )
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <label>
                Skill
                <select
                  value={q.skill}
                  onChange={(v) => question(i, j, "skill", v.target.value)}
                >
                  {SKILLS.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Question
                <input
                  required
                  maxLength={500}
                  value={q.prompt}
                  onChange={(v) => question(i, j, "prompt", v.target.value)}
                />
              </label>
              <div className="two-col">
                {q.options.map((o, k) => (
                  <label key={k}>
                    Option {String.fromCharCode(65 + k)}
                    <input
                      required
                      maxLength={500}
                      value={o}
                      onChange={(v) =>
                        question(
                          i,
                          j,
                          "options",
                          q.options.map((x, n) =>
                            n === k ? v.target.value : x,
                          ),
                        )
                      }
                    />
                  </label>
                ))}
              </div>
              <label>
                Correct answer
                <select
                  value={q.correct}
                  onChange={(v) =>
                    question(i, j, "correct", Number(v.target.value))
                  }
                >
                  {q.options.map((o, k) => (
                    <option value={k} key={k}>
                      {String.fromCharCode(65 + k)}
                      {o ? " — " + o : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Explanation / feedback
                <textarea
                  required
                  maxLength={1500}
                  value={q.explanation}
                  onChange={(v) =>
                    question(i, j, "explanation", v.target.value)
                  }
                />
              </label>
            </div>
          ))}
          <button
            type="button"
            className="button small"
            disabled={s.questions.length >= 8}
            onClick={() =>
              section(i, "questions", [...s.questions, newQuestion()])
            }
          >
            <Plus size={15} /> Add question
          </button>
        </section>
      ))}
      <button
        className="button"
        type="button"
        disabled={e.sections.length >= 12}
        onClick={() => field("sections", [...e.sections, newSection()])}
      >
        <Plus size={17} /> Add reading section
      </button>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={!!e.published}
          onChange={(v) => field("published", v.target.checked)}
        />
        Publish in the catalog
      </label>
      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}
      <button className="button primary" disabled={busy}>
        {busy ? "Saving…" : "Save exercise"}
        <Check size={17} />
      </button>
    </form>
  );
}
createRoot(document.getElementById("root")).render(<App />);
