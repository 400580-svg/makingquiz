import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk, useSignUp, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Link, Redirect, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import {
  Activity, ArrowLeft, ArrowRight, Award, BarChart3, Check, ChevronRight,
  Flag, Medal, RefreshCw, ShieldAlert, Sparkles, Trophy, Users, Zap,
} from 'lucide-react';
import {
  getGetAttemptQueryKey, getGetDashboardSummaryQueryKey, getGetLeaderboardQueryKey, getGetQuizQueryKey, getGetQuizQuestionsQueryKey,
  useGetAttempt, useGetDashboardSummary, useGetLeaderboard,
  useGetQuiz, useGetQuizQuestions, useHealthCheck, useListQuizzes, useSubmitAttempt,
} from '@workspace/api-client-react';
import type { Quiz } from '@workspace/api-client-react';
import { trackEvent } from '@/lib/analytics';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#1B4D3E',
    colorForeground: '#181A1B',
    colorMutedForeground: '#727971',
    colorDanger: '#b42318',
    colorBackground: '#FFFFFF',
    colorInput: '#FAF9F6',
    colorInputForeground: '#181A1B',
    colorNeutral: '#D9DDD5',
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: '0.85rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-white rounded-2xl w-[440px] max-w-full overflow-hidden border border-[#e7e6df] shadow-xl',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'font-semibold text-[#181A1B]',
    headerSubtitle: 'text-[#727971]',
    socialButtonsBlockButtonText: 'font-semibold text-[#303632]',
    formFieldLabel: 'font-semibold text-[#303632]',
    footerActionLink: 'font-semibold text-[#1B4D3E]',
    footerActionText: 'text-[#727971]',
    dividerText: 'text-[#727971]',
    identityPreviewEditButton: 'text-[#1B4D3E]',
    formFieldSuccessText: 'text-[#1B4D3E]',
    alertText: 'text-[#b42318]',
    logoBox: 'w-12 h-12 rounded-xl bg-[#1B4D3E]',
    logoImage: 'object-contain p-2',
    socialButtonsBlockButton: 'border border-[#e7e6df] rounded-xl',
    formButtonPrimary: 'bg-[#1B4D3E] hover:bg-[#23634f] text-white rounded-xl',
    formFieldInput: 'bg-[#FAF9F6] border-[#d9ddd5] text-[#181A1B] rounded-xl',
    footerAction: 'border-t border-[#e7e6df]',
    dividerLine: 'bg-[#e7e6df]',
    alert: 'bg-[#fff4f2] border border-[#f0c6c0] rounded-xl',
    otpCodeFieldInput: 'bg-[#FAF9F6] border-[#d9ddd5] text-[#181A1B] rounded-lg',
    formFieldRow: 'gap-2',
    main: 'gap-5',
  },
};

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <div className="app-shell">
    <header className="topbar">
      <Link href="/" className="brand" data-testid="link-home">
        <span className="brand-mark"><Flag size={20} strokeWidth={2.8} /></span>
        <span className="brand-word">NFL Quiz Central<small>THE FAN KNOWLEDGE LEAGUE</small></span>
      </Link>
      <nav className="navlinks" aria-label="Main navigation">
        <Link href="/" className={`nav-link ${location === '/' ? 'active' : ''}`} data-testid="link-discover">Discover</Link>
        <Link href="/leaderboard" className={`nav-link ${location === '/leaderboard' ? 'active' : ''}`} data-testid="link-leaderboard">Leaderboard<span>TOP 10</span></Link>
        <AccountActions />
      </nav>
    </header>
    {children}
    <footer className="footer"><span><strong>NFL QUIZ CENTRAL</strong> · Built for the love of the game</span><span>Every down has a story.</span></footer>
  </div>;
}

function AccountActions() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  if (!isLoaded) return null;
  if (isSignedIn) {
    return <button className="nav-link nav-signout" onClick={() => void signOut({ redirectUrl: basePath || '/' })} data-testid="button-sign-out">Sign out</button>;
  }
  return <div className="nav-account">
    <Link href="/sign-in" className="nav-link nav-account-signin" data-testid="link-sign-in">Sign in</Link>
    <Link href="/sign-up" className="nav-link nav-signup" data-testid="link-sign-up">Join</Link>
  </div>;
}

function LoadingCards() {
  return <div className="loading-grid" aria-label="Loading quizzes" data-testid="status-quizzes-loading">
    {[1, 2, 3].map((n) => <div className="skeleton" key={n} />)}
  </div>;
}

function ErrorState({ onRetry, label = 'We hit a snag.' }: { onRetry: () => void; label?: string }) {
  return <div className="state-panel" role="alert" data-testid="status-error">
    <ShieldAlert size={27} />
    <h3>{label}</h3>
    <p>The play clock is still running. Give it another try and we’ll get you back in the game.</p>
    <button className="btn small" onClick={onRetry} data-testid="button-retry"><RefreshCw size={14} /> Try again</button>
  </div>;
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return <div className="state-panel" data-testid="status-empty">
    <Trophy size={28} /><h3>{title}</h3><p>{message}</p>
  </div>;
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  return <article className="quiz-card" data-testid={`card-quiz-${quiz.id}`}>
    <div className="card-top"><span className="category-pill">{quiz.category}</span><span className="difficulty">{quiz.difficulty}</span></div>
    <h3>{quiz.title}</h3><p>{quiz.description}</p>
    <div className="card-footer">
      <span>{quiz.questionCount} QUESTIONS · {quiz.estimatedMinutes} MIN</span>
      <Link href={`/play/${quiz.id}`} className="btn small gold" data-testid={`link-play-quiz-${quiz.id}`}>Take quiz <ArrowRight size={14} /></Link>
    </div>
  </article>;
}

function SummaryStrip({ summary }: { summary: { quizzesAvailable: number; totalQuestions: number; gamesPlayed: number; averageScore: number; topScore: number } }) {
  return <section className="summary-strip" aria-label="Community stats" data-testid="summary-stats">
    <div className="summary-intro"><strong>The clubhouse board</strong><span>All fans. All-time. Every answer counts.</span></div>
    <div className="summary-item" data-testid="stat-quizzes"><strong>{summary.quizzesAvailable}</strong><span>Quizzes</span></div>
    <div className="summary-item" data-testid="stat-questions"><strong>{summary.totalQuestions}</strong><span>Questions</span></div>
    <div className="summary-item" data-testid="stat-games"><strong>{summary.gamesPlayed}</strong><span>Games played</span></div>
    <div className="summary-item" data-testid="stat-average"><strong>{summary.averageScore}%</strong><span>Avg. score</span></div>
    <div className="summary-item" data-testid="stat-top-score"><strong>{summary.topScore}%</strong><span>Top score</span></div>
  </section>;
}

function HomePage() {
  const quizzes = useListQuizzes();
  const summary = useGetDashboardSummary();
  const health = useHealthCheck();
  const [filter, setFilter] = useState('All quizzes');
  const allQuizzes = quizzes.data ?? [];
  const categories = ['All quizzes', ...Array.from(new Set(allQuizzes.map((q) => q.category)))];
  const visible = filter === 'All quizzes' ? allQuizzes : allQuizzes.filter((q) => q.category === filter);
  return <main className="page">
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">Your Sunday starts here</span>
        <h1 className="headline">Know the game.<br /><em>Own the room.</em></h1>
        <p className="subhead">From legendary plays to the little-known details, put your football IQ on the board. Quick quizzes, real explanations, bragging rights included.</p>
        <div className="hero-bottom">
          <a className="btn gold" href="#quizzes" data-testid="link-browse-quizzes">Find your first quiz <ArrowRight size={16} /></a>
          <Link href="/sign-up" className="btn" data-testid="link-create-account">Create your free account</Link>
          <div className="metrics"><div className="metric"><strong>{summary.data?.quizzesAvailable ?? '—'}</strong>QUIZZES</div><div className="metric"><strong>{summary.data?.totalQuestions ?? '—'}</strong>QUESTIONS</div></div>
        </div>
      </div>
      <div className="hero-art" aria-label="Football on a marked field illustration" data-testid="illustration-game-day">
        <div className="field-lines" /><div className="football" /><span className="art-tag">Kickoff your brain</span>
      </div>
    </section>
    <section id="quizzes">
      <div className="section-head">
        <div><span className="eyebrow">Pick your matchup</span><h2>Today’s quiz lineup</h2><p>Short on time? Every round fits between the whistles.</p></div>
        {health.data && <span className="category-pill" data-testid="status-service"><Activity size={12} /> Clubhouse open</span>}
      </div>
      {!quizzes.isLoading && allQuizzes.length > 0 && <div className="filter-row" style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
        {categories.map((category) => <button key={category} className={`btn small ${filter === category ? '' : 'ghost'}`} onClick={() => setFilter(category)} data-testid={`button-filter-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{category}</button>)}
      </div>}
      {quizzes.isLoading ? <LoadingCards /> : quizzes.isError ? <ErrorState onRetry={() => quizzes.refetch()} label="The lineup is loading slowly." /> : visible.length ? <div className="quiz-grid">{visible.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)}</div> : <EmptyState title="No quizzes on the board yet" message="Check back soon for a fresh round of football questions." />}
    </section>
    {summary.isLoading ? <div className="skeleton" style={{ minHeight: 112, marginTop: 36 }} data-testid="status-summary-loading" /> : summary.isError ? <div style={{ marginTop: 30 }}><ErrorState onRetry={() => summary.refetch()} label="Stats are taking a breather." /></div> : summary.data && <SummaryStrip summary={summary.data} />}
    <section className="club-note" style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderLeft: '3px solid #F5B041', background: '#f2f0e9' }} data-testid="text-learning-note">
      <Sparkles color="#a86f17" size={20} /><p style={{ margin: 0, fontSize: 13, color: '#626b64', lineHeight: 1.55 }}><strong style={{ color: '#1B4D3E' }}>More than a score.</strong> Every answer comes with a quick explanation, so you leave knowing one more thing about the game.</p>
    </section>
  </main>;
}

function PlayPage() {
  const params = useParams<{ quizId: string }>();
  const { user } = useUser();
  const quizId = Number(params.quizId);
  const quiz = useGetQuiz(quizId, { query: { queryKey: getGetQuizQueryKey(quizId), enabled: Number.isFinite(quizId) && quizId > 0 } });
  const questions = useGetQuizQuestions(quizId, { query: { queryKey: getGetQuizQuestionsQueryKey(quizId), enabled: Number.isFinite(quizId) && quizId > 0 } });
  const submitAttempt = useSubmitAttempt();
  const queryClient = useQueryClient();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState('');
  const startedAt = useRef(Date.now());
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!displayName && user) setDisplayName(user.firstName ?? user.username ?? '');
  }, [displayName, user]);
  const list = questions.data ?? [];
  const question = list[current];
  const onSelect = (choiceId: string) => {
    if (question) setAnswers((previous) => ({ ...previous, [question.id]: choiceId }));
  };
  const onSubmit = () => {
    const name = displayName.trim();
    if (!name) { setFormError('Add a name for the scoreboard before you submit.'); return; }
    if (name.length > 24) { setFormError('Keep your scoreboard name to 24 characters or fewer.'); return; }
    if (Object.keys(answers).length !== list.length) { setFormError('Answer every question before calling it a game.'); return; }
    setFormError('');
    const durationSeconds = Math.min(3600, Math.max(0, Math.round((Date.now() - startedAt.current) / 1000)));
    submitAttempt.mutate({ data: { quizId, displayName: name, durationSeconds, answers: list.map((item) => ({ questionId: item.id, selectedChoiceId: answers[item.id] })) } }, {
      onSuccess: (attempt) => {
        trackEvent('quiz_completed');
        void queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getGetLeaderboardQueryKey() });
        navigate(`/results/${attempt.id}`);
      },
      onError: () => setFormError('Your score could not be saved right now. Try submitting once more.'),
    });
  };
  if (quiz.isLoading || questions.isLoading) return <main className="page"><div className="play-layout"><div className="skeleton" style={{ height: 370 }} data-testid="status-play-loading" /></div></main>;
  if (quiz.isError || questions.isError || !quiz.data || !list.length) return <main className="page"><div className="play-layout"><ErrorState onRetry={() => { quiz.refetch(); questions.refetch(); }} label={!list.length && !questions.isError ? 'No questions in this round yet.' : 'We could not load this quiz.'} /></div></main>;
  const answeredCount = Object.keys(answers).length;
  return <main className="page">
    <div className="play-layout">
      <div className="play-top">
        <Link href="/" className="btn ghost small" data-testid="link-back-discover"><ArrowLeft size={14} /> Leave quiz</Link>
        <span className="category-pill">{quiz.data.category}</span>
      </div>
      <div className="progress-copy"><span><strong>{String(current + 1).padStart(2, '0')}</strong> / {String(list.length).padStart(2, '0')} QUESTIONS</span><span style={{ float: 'right' }}>{answeredCount} ANSWERED</span></div>
      <div className="progress-track" role="progressbar" aria-valuenow={current + 1} aria-valuemax={list.length}><div className="progress-fill" style={{ width: `${((current + 1) / list.length) * 100}%` }} /></div>
      <article className="question-card" data-testid={`question-card-${question.id}`}>
        <span className="question-number">Question {String(question.position).padStart(2, '0')} · {quiz.data.title}</span>
        <h1>{question.prompt}</h1>
        <div className="choice-list">
          {question.choices.map((choice, index) => <button key={choice.id} className={`choice ${answers[question.id] === choice.id ? 'selected' : ''}`} onClick={() => onSelect(choice.id)} aria-pressed={answers[question.id] === choice.id} data-testid={`choice-${question.id}-${choice.id}`}>
            <span className="choice-letter">{String.fromCharCode(65 + index)}</span><span className="choice-label">{choice.label}</span>{answers[question.id] === choice.id && <Check size={17} style={{ marginLeft: 'auto' }} />}
          </button>)}
        </div>
        <div className="play-controls">
          <div className="name-row"><label htmlFor="display-name">Scoreboard name</label><input id="display-name" value={displayName} maxLength={24} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your name" data-testid="input-display-name" /></div>
          {current < list.length - 1 ? <button className="btn" onClick={() => { if (!answers[question.id]) { setFormError('Choose an answer to move to the next play.'); return; } setFormError(''); setCurrent((n) => n + 1); }} data-testid="button-next-question">Next play <ArrowRight size={15} /></button> : <button className="btn gold" onClick={onSubmit} disabled={submitAttempt.isPending} data-testid="button-submit-attempt">{submitAttempt.isPending ? 'Saving score…' : 'Finish round'} <Check size={15} /></button>}
        </div>
        {formError && <p className="error-note" role="alert" data-testid="status-play-error">{formError}</p>}
      </article>
      {current > 0 && <button className="btn ghost small" style={{ marginTop: 15 }} onClick={() => { setFormError(''); setCurrent((n) => Math.max(0, n - 1)); }} data-testid="button-previous-question"><ArrowLeft size={14} /> Previous question</button>}
    </div>
  </main>;
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins ? `${mins}m ${secs}s` : `${secs}s`;
}

function ResultsPage() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = Number(params.attemptId);
  const attempt = useGetAttempt(attemptId, { query: { queryKey: getGetAttemptQueryKey(attemptId), enabled: Number.isFinite(attemptId) && attemptId > 0, refetchOnMount: 'always' } });
  const reviewQuestions = useGetQuizQuestions(attempt.data?.quizId ?? 0, { query: { queryKey: getGetQuizQuestionsQueryKey(attempt.data?.quizId ?? 0), enabled: !!attempt.data?.quizId } });
  if (attempt.isLoading) return <main className="page"><div className="skeleton" style={{ height: 220 }} data-testid="status-result-loading" /><div className="skeleton" style={{ height: 180, marginTop: 20 }} /></main>;
  if (attempt.isError || !attempt.data) return <main className="page"><ErrorState onRetry={() => attempt.refetch()} label="That scorecard is out of bounds." /></main>;
  const result = attempt.data;
  const score = Math.round(result.percentCorrect);
  return <main className="page">
    <section className="result-hero" data-testid="result-summary">
      <div className="result-copy"><span className="eyebrow">Final whistle · {result.displayName}</span><h1>{score >= 80 ? 'That’s a statement.' : score >= 50 ? 'A solid showing.' : 'Run it back.'}</h1><p>{result.quizTitle} · {result.correctAnswers} of {result.totalQuestions} correct · {formatDuration(result.durationSeconds)}</p></div>
      <div className="score-ring" style={{ '--score': `${score}%` } as CSSProperties} data-testid="text-result-score"><div className="score-inner"><strong>{score}%</strong><span>Final score</span></div></div>
    </section>
    <div className="result-actions"><Link href="/" className="btn gold" data-testid="link-play-again"><Zap size={15} /> Play another quiz</Link><Link href="/leaderboard" className="btn ghost" data-testid="link-results-leaderboard"><Trophy size={15} /> View leaderboard</Link></div>
    <h2 className="review-title">The film room <span style={{ font: '600 11px IBM Plex Mono,monospace', color: '#81877f', letterSpacing: 0 }}>· ANSWER REVIEW</span></h2>
    <div className="review-list">
      {result.answers.map((answer, index) => {
        const question = reviewQuestions.data?.find((item) => item.id === answer.questionId);
        const selectedLabel = question?.choices.find((choice) => choice.id === answer.selectedChoiceId)?.label ?? answer.selectedChoiceId;
        const correctLabel = question?.choices.find((choice) => choice.id === answer.correctChoiceId)?.label ?? answer.correctChoiceId;
        return <article className="review-item" key={answer.questionId} data-testid={`review-answer-${answer.questionId}`}>
          <div className="review-item-top"><h3>Play {String(index + 1).padStart(2, '0')} <span style={{ color: '#90978f', fontWeight: 500 }}>· {question?.prompt ?? `Question ${answer.questionId}`}</span></h3><span className={`answer-status ${answer.isCorrect ? 'correct' : 'incorrect'}`}>{answer.isCorrect ? 'Correct' : 'Review this one'}</span></div>
          <p className="review-answer">Your pick: <strong>{selectedLabel}</strong>{!answer.isCorrect && <> <span>·</span> Correct answer: <strong>{correctLabel}</strong></>}</p>
          <div className="explanation">{answer.explanation}</div>
        </article>;
      })}
    </div>
    <p style={{ color: '#858b84', fontSize: 11, marginTop: 18 }} data-testid="text-result-completed">Completed {new Date(result.completedAt).toLocaleString()}</p>
  </main>;
}

function LeaderboardPage() {
  const leaderboard = useGetLeaderboard(undefined);
  return <main className="page">
    <div className="page-heading"><div><span className="eyebrow">The clubhouse scoreboard</span><h1 className="headline">Legends in the <em>making.</em></h1><p className="subhead">The sharpest football minds are putting their knowledge on the line. Where will your name land?</p></div><div className="category-pill"><Users size={13} /> Fan leaderboard</div></div>
    {leaderboard.isLoading ? <div className="leaderboard-wrap"><div className="skeleton" style={{ height: 350 }} data-testid="status-leaderboard-loading" /></div> : leaderboard.isError ? <ErrorState onRetry={() => leaderboard.refetch()} label="The scoreboard is temporarily unavailable." /> : !leaderboard.data?.length ? <EmptyState title="A clean scoreboard" message="No scores have been posted yet. Play a quiz and claim the first spot." /> : <div className="leaderboard-wrap" data-testid="leaderboard-table">
      <div className="leaderboard-head"><span>Rank</span><span>Fan</span><span>Quiz played</span><span>Score</span><span>Accuracy</span><span>When</span></div>
      {leaderboard.data.map((entry) => <Link href={`/results/${entry.attemptId}`} className="leader-row" key={entry.attemptId} data-testid={`row-leaderboard-${entry.attemptId}`}>
        <span className={`rank ${entry.rank === 1 ? 'one' : ''}`}>{String(entry.rank).padStart(2, '0')}{entry.rank === 1 && <Medal size={15} style={{ marginLeft: 4, verticalAlign: 'middle' }} />}</span>
        <span className="player"><span className="player-avatar">{entry.displayName.slice(0, 2).toUpperCase()}</span>{entry.displayName}</span>
        <span className="leader-quiz">{entry.quizTitle}</span><span className="score-cell">{entry.correctAnswers}/{entry.totalQuestions}</span>
        <span className="score-chip">{entry.percentCorrect}%</span><span className="date-cell">{new Date(entry.completedAt).toLocaleDateString()}</span>
      </Link>)}
    </div>}
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 22, color: '#81877f', fontSize: 12 }}><Award size={17} color="#ba8122" /> Every score is earned one question at a time.</div>
    <div style={{ marginTop: 32 }}><Link href="/" className="btn ghost small" data-testid="link-leaderboard-home"><BarChart3 size={14} /> Explore quizzes <ChevronRight size={14} /></Link></div>
  </main>;
}

function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const { signUp } = useSignUp();
  const signupPendingObserved = useRef(false);
  const signupEventTracked = useRef(false);
  const returnPathFromQuery = new URLSearchParams(window.location.search).get('redirect_url');
  const returnPath = returnPathFromQuery?.startsWith('/') && !returnPathFromQuery.startsWith('//')
    ? returnPathFromQuery
    : '/';
  const fullReturnPath = `${basePath}${returnPath}`;
  const signInUrl = `${basePath}/sign-in?redirect_url=${encodeURIComponent(returnPath)}`;
  const signUpUrl = `${basePath}/sign-up?redirect_url=${encodeURIComponent(returnPath)}`;
  const isSignUp = mode === 'sign-up';
  useEffect(() => {
    if (!isSignUp || !signUp) return;

    if (signUp.status !== 'complete') {
      signupPendingObserved.current = true;
      return;
    }

    if (signupPendingObserved.current && !signupEventTracked.current) {
      signupEventTracked.current = true;
      trackEvent('account_created');
    }
  }, [isSignUp, signUp?.status]);

  return <main className="auth-page">
    <Link href="/" className="auth-brand" data-testid="link-auth-home">
      <span className="auth-brand-mark"><Flag size={21} strokeWidth={2.8} /></span>
      <span className="auth-brand-copy">NFL Quiz Central<small>THE FAN KNOWLEDGE LEAGUE</small></span>
    </Link>
    <section className="auth-intro">
      <span className="eyebrow">{isSignUp ? 'Your Sunday starts here' : 'Back in the clubhouse'}</span>
      <h1>{isSignUp ? 'Join the league.' : 'Welcome back.'}</h1>
      <p>{isSignUp ? 'Create an account to play quizzes and save your scores.' : 'Sign in to pick up where you left off.'}</p>
    </section>
    <div className="auth-card-wrap">
      {isSignUp
        ? <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={signInUrl} forceRedirectUrl={fullReturnPath} />
        : <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={signUpUrl} forceRedirectUrl={fullReturnPath} />}
    </div>
    <p className="auth-return"><Link href="/">← Back to quiz lineup</Link></p>
  </main>;
}

function SignUpPage() {
  return <AuthPage mode="sign-up" />;
}

function SignInPage() {
  return <AuthPage mode="sign-in" />;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [location] = useLocation();
  if (!isLoaded) return <Shell><main className="page"><div className="skeleton" style={{ height: 260 }} aria-label="Checking account" /></main></Shell>;
  if (!isSignedIn) {
    return <Redirect to={`/sign-up?redirect_url=${encodeURIComponent(location)}`} />;
  }
  return <Shell>{children}</Shell>;
}

function HomeRoute() {
  return <Shell><HomePage /></Shell>;
}

function PlayRoute() {
  return <ProtectedRoute><PlayPage /></ProtectedRoute>;
}

function ResultsRoute() {
  return <ProtectedRoute><ResultsPage /></ProtectedRoute>;
}

function LeaderboardRoute() {
  return <Shell><LeaderboardPage /></Shell>;
}

function NotFoundRoute() {
  return <Shell><NotFound /></Shell>;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function Router() {
  return <Switch>
    <Route path="/sign-in/*?" component={SignInPage} />
    <Route path="/sign-up/*?" component={SignUpPage} />
    <Route path="/" component={HomeRoute} />
    <Route path="/play/:quizId" component={PlayRoute} />
    <Route path="/results/:attemptId" component={ResultsRoute} />
    <Route path="/leaderboard" component={LeaderboardRoute} />
    <Route component={NotFoundRoute} />
  </Switch>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={clerkProxyUrl}
    appearance={clerkAppearance}
    signInUrl={`${basePath}/sign-in`}
    signUpUrl={`${basePath}/sign-up`}
    localization={{
      signIn: { start: { title: 'Welcome back, fan', subtitle: 'Sign in to get back in the game.' } },
      signUp: { start: { title: 'Join the league', subtitle: 'Create your account and put your football IQ to the test.' } },
    }}
    routerPush={(to) => setLocation(stripBase(to))}
    routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
  >
    <QueryClientProvider client={queryClient}>
      <ClerkQueryClientCacheInvalidator />
      <Router />
    </QueryClientProvider>
  </ClerkProvider>;
}

function App() {
  return <WouterRouter base={basePath}><ClerkProviderWithRoutes /></WouterRouter>;
}

export default App;
