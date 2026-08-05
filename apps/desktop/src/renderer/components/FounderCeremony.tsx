import { Check, Loader2, Rocket, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type FlowStage = "prep" | "silence" | "ceremony" | "epilogue";
type CeremonyPhase = "entering" | "active" | "holding" | "leaving";

type FounderCeremonyProps = {
  onComplete: () => void;
  onSlotsTick: (slots: number) => void;
  slots: number;
};

type PrepStep = {
  id: number;
  label: string;
  doneAt: number; // progress % when marked done
};

const PREP_STEPS: PrepStep[] = [
  { id: 1, label: "Verifica licenza…", doneAt: 22 },
  { id: 2, label: "Preparazione certificato Founder…", doneAt: 48 },
  { id: 3, label: "Riservando uno dei 100 posti…", doneAt: 74 },
  { id: 4, label: "Quasi fatto…", doneAt: 96 }
];

const PREP_DURATION_MS = 4800;

function getAudioContext(): AudioContext | null {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    return new Ctx();
  } catch {
    return null;
  }
}

/**
 * Soft anticipatory drumroll — elegant, slow → slightly faster.
 * Hook point: replace with a real audio asset when available.
 */
function playFounderDrumroll(durationSec: number): { stop: () => void } {
  const ctx = getAudioContext();
  if (!ctx) return { stop: () => undefined };

  const master = ctx.createGain();
  master.gain.value = 0.07;
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 180;
  filter.Q.value = 0.7;
  filter.connect(master);

  const start = ctx.currentTime;
  const end = start + durationSec;
  const timers: number[] = [];
  let stopped = false;

  const hit = (t: number, intensity: number) => {
    if (stopped) return;
    const bufferSize = 2 * ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.exp(-i / (ctx.sampleRate * 0.035));
      data[i] = (Math.random() * 2 - 1) * env * intensity;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.value = 0.9;
    src.connect(g);
    g.connect(filter);
    src.start(t);
  };

  // Soft pulse rhythm that gently accelerates
  let t = start + 0.15;
  let gap = 0.42;
  while (t < end - 0.35) {
    const progress = (t - start) / durationSec;
    const intensity = 0.35 + progress * 0.55;
    hit(t, intensity);
    gap = Math.max(0.14, 0.42 - progress * 0.26);
    t += gap;
  }
  // Final soft accent
  hit(end - 0.2, 0.75);

  return {
    stop: () => {
      stopped = true;
      timers.forEach((id) => window.clearTimeout(id));
      try {
        master.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        window.setTimeout(() => void ctx.close(), 250);
      } catch {
        void ctx.close();
      }
    }
  };
}

/** Soft celebratory chime — hook point for a real asset later. */
function playFounderChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const tones = [523.25, 659.25, 783.99];
  tones.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.04 + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4 + i * 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + 1.6 + i * 0.12);
  });
  window.setTimeout(() => void ctx.close(), 2200);
}

type Particle = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  kind: "dot" | "star" | "glow" | "burst";
};

function buildParticles(): Particle[] {
  const list: Particle[] = [];
  for (let i = 0; i < 28; i++) {
    list.push({
      id: i,
      left: `${12 + Math.random() * 76}%`,
      top: `${18 + Math.random() * 64}%`,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 2.2,
      duration: 1.8 + Math.random() * 2.4,
      kind: i % 5 === 0 ? "star" : i % 7 === 0 ? "glow" : "dot"
    });
  }
  for (let b = 0; b < 3; b++) {
    list.push({
      id: 100 + b,
      left: `${28 + b * 22}%`,
      top: `${32 + (b % 2) * 18}%`,
      size: 48,
      delay: 0.6 + b * 1.4,
      duration: 1.6,
      kind: "burst"
    });
  }
  return list;
}

export default function FounderCeremony({ onComplete, onSlotsTick, slots }: FounderCeremonyProps) {
  const [stage, setStage] = useState<FlowStage>("prep");
  const [progress, setProgress] = useState(0);
  const drumroll = useRef<{ stop: () => void } | null>(null);
  const completed = useRef(false);

  // ─── Prep + silence orchestration ─────────────────────
  useEffect(() => {
    const timers: number[] = [];
    const started = performance.now();
    drumroll.current = playFounderDrumroll(PREP_DURATION_MS / 1000);

    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - started;
      const pct = Math.min(100, (elapsed / PREP_DURATION_MS) * 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        drumroll.current?.stop();
        drumroll.current = null;
        setProgress(100);
        setStage("silence");
        timers.push(
          window.setTimeout(() => {
            setStage("ceremony");
          }, 500)
        );
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
      drumroll.current?.stop();
      drumroll.current = null;
    };
  }, []);

  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    onComplete();
  };

  if (stage === "prep" || stage === "silence") {
    return (
      <div className="nb-ceremony is-prep" role="dialog" aria-modal="true" aria-label="Preparazione Founder">
        <div className="nb-ceremonyBackdrop isSoft" />
        <div className={`nb-prepCardWrap ${stage === "silence" ? "isHold" : "isVisible"}`}>
          <article className="nb-prepCard">
            <div className="nb-prepIcon" aria-hidden={true}>
              {progress >= 100 ? (
                <Check className="nb-prepIconSvg" />
              ) : (
                <Loader2 className="nb-prepIconSvg isSpin" />
              )}
            </div>
            <h2 className="nb-prepTitle">Preparazione Founder Edition</h2>
            <p className="nb-prepSubtitle">Stiamo preparando il tuo posto tra i primi 100 Founder…</p>

            <div className="nb-prepBarTrack" aria-hidden={true}>
              <div className="nb-prepBarFill" style={{ width: `${progress}%` }} />
            </div>
            <div className="nb-prepPct">{Math.round(progress)}%</div>

            <ul className="nb-prepSteps">
              {PREP_STEPS.map((step) => {
                const done = progress >= step.doneAt;
                const active =
                  !done &&
                  progress >= (PREP_STEPS.find((s) => s.id === step.id - 1)?.doneAt ?? 0);
                return (
                  <li
                    key={step.id}
                    className={`nb-prepStep ${done ? "isDone" : ""} ${active ? "isActive" : ""}`}
                  >
                    <span className="nb-prepStepMark" aria-hidden={true}>
                      {done ? <Check className="nb-prepStepCheck" /> : <span className="nb-prepStepDot" />}
                    </span>
                    <span className="nb-prepStepLabel">{step.label}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        </div>
      </div>
    );
  }

  if (stage === "ceremony") {
    return (
      <CeremonyReveal
        slots={slots}
        onSlotsTick={onSlotsTick}
        onFinished={() => setStage("epilogue")}
      />
    );
  }

  return <FounderEpilogue onFinished={finish} />;
}

function CeremonyReveal({
  slots,
  onSlotsTick,
  onFinished
}: {
  slots: number;
  onSlotsTick: (n: number) => void;
  onFinished: () => void;
}) {
  const [phase, setPhase] = useState<CeremonyPhase>("entering");
  const [cardVisible, setCardVisible] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const done = useRef(false);
  const particles = useMemo(() => buildParticles(), []);

  useEffect(() => {
    const timers: number[] = [];

    timers.push(
      window.setTimeout(() => {
        setPhase("active");
        setCardVisible(true);
        playFounderChime();
      }, 500)
    );

    timers.push(
      window.setTimeout(() => {
        setShowParticles(true);
      }, 700)
    );

    timers.push(
      window.setTimeout(() => {
        onSlotsTick(82);
      }, 1600)
    );

    timers.push(
      window.setTimeout(() => {
        setShowParticles(false);
        setPhase("holding");
      }, 7500)
    );

    timers.push(
      window.setTimeout(() => {
        setPhase("leaving");
        setCardVisible(false);
      }, 9500)
    );

    timers.push(
      window.setTimeout(() => {
        if (!done.current) {
          done.current = true;
          onFinished();
        }
      }, 10050)
    );

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [onFinished, onSlotsTick]);

  return (
    <div
      className={`nb-ceremony is-${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label="Founder Ceremony"
    >
      <div className="nb-ceremonyBackdrop" />

      {showParticles ? (
        <div className="nb-ceremonyParticles" aria-hidden={true}>
          {particles.map((p) => (
            <span
              key={p.id}
              className={`nb-ceremonyParticle is-${p.kind}`}
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`
              }}
            />
          ))}
        </div>
      ) : null}

      <div className={`nb-ceremonyCardWrap ${cardVisible ? "isVisible" : ""}`}>
        <article className="nb-ceremonyCard">
          <div className="nb-ceremonyStar" aria-hidden={true}>
            <Sparkles className="nb-ceremonyStarIcon" />
          </div>
          <h2 className="nb-ceremonyTitle">Benvenuto nella Founder Edition</h2>
          <p className="nb-ceremonyBody">
            Grazie per essere uno dei primi
            <strong> 100 centri estetici </strong>
            ad aver creduto in NovaBeauty.
          </p>
          <p className="nb-ceremonyBody soft">
            Il tuo supporto contribuirà a costruire il futuro del progetto.
          </p>
          <div className="nb-ceremonySlots" aria-live="polite">
            <span className="nb-ceremonySlotsLabel">Posti disponibili</span>
            <span className="nb-ceremonySlotsValue">{slots} / 100</span>
            <div className="nb-ceremonySlotsBar" aria-hidden={true}>
              <span style={{ width: `${slots}%` }} />
            </div>
          </div>
          <div className="nb-ceremonyRocket" aria-hidden={true}>
            <Rocket className="nb-ceremonyRocketIcon" />
          </div>
        </article>
      </div>
    </div>
  );
}

function FounderEpilogue({ onFinished }: { onFinished: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setVisible(true), 40);
    const t2 = window.setTimeout(() => setVisible(false), 1800);
    const t3 = window.setTimeout(() => onFinished(), 2300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onFinished]);

  return (
    <div className="nb-ceremony is-epilogue" role="dialog" aria-modal="true" aria-label="Founder confermato">
      <div className="nb-ceremonyBackdrop isSoft" />
      <div className={`nb-epilogueCardWrap ${visible ? "isVisible" : ""}`}>
        <article className="nb-epilogueCard">
          <div className="nb-epilogueStar" aria-hidden={true}>
            <Sparkles className="nb-epilogueStarIcon" />
          </div>
          <div className="nb-epilogueLabel">Founder dal</div>
          <div className="nb-epilogueDate">5 Agosto 2026</div>
          <p className="nb-epilogueText">Uno dei primi 100 Founder.</p>
        </article>
      </div>
    </div>
  );
}
