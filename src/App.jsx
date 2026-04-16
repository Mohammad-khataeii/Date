import { useEffect, useMemo, useRef, useState } from 'react';

const notes = [
  'I found a table for two in my imagination.',
  'There may be dessert. There will definitely be me smiling too much.',
  'You bring the cute face. I will bring the plan.',
  'This button is legally required to say yes.',
  'I checked the forecast. It says 100% chance of cute.',
  'Tiny proposal, huge butterflies.',
  'Say yes and I promise to act normal for at least seven minutes.',
  'I already told my playlist to dress nicely.',
  'A date with you sounds better than literally any other plan.',
  'The stars said yes. The moon nodded. Very official.',
  'One yes unlocks snacks, smiles, and suspiciously good company.',
  'I can be charming, punctual, and only mildly dramatic.',
  'This could be the start of our favorite little story.',
  'Your smile deserves a reservation.',
  'I have a plan. It includes you, me, and something sweet.',
  'No pressure. Except from the runaway button. It is biased.',
  'My heart made this website and refused to be subtle.',
  'If yes were a flower, I would bring the whole garden.',
  'Dinner? Coffee? Walk? I am flexible, as long as you are there.',
  'The no button has not been emotionally available for years.',
];

function pickSpot() {
  const padding = 18;
  const width = Math.min(160, window.innerWidth * 0.34);
  const height = 56;
  return {
    left: Math.max(padding, Math.random() * (window.innerWidth - width - padding)),
    top: Math.max(padding, Math.random() * (window.innerHeight - height - padding)),
  };
}

export default function App() {
  const [answer, setAnswer] = useState('waiting');
  const [noSpot, setNoSpot] = useState(null);
  const [runCount, setRunCount] = useState(0);
  const noButtonRef = useRef(null);
  const runTimerRef = useRef(null);
  const lastRunRef = useRef(0);
  const note = useMemo(() => notes[runCount % notes.length], [runCount]);

  useEffect(() => {
    return () => {
      if (runTimerRef.current) {
        window.clearTimeout(runTimerRef.current);
      }
    };
  }, []);

  const makeNoRun = () => {
    const button = noButtonRef.current;
    const now = Date.now();

    if (!button || now - lastRunRef.current < 520) {
      return;
    }

    lastRunRef.current = now;
    const box = button.getBoundingClientRect();
    const startSpot = {
      left: box.left,
      top: box.top,
    };

    if (runTimerRef.current) {
      window.clearTimeout(runTimerRef.current);
    }

    setNoSpot(startSpot);
    setRunCount((count) => count + 1);
    runTimerRef.current = window.setTimeout(() => {
      setNoSpot(pickSpot());
    }, 45);
  };

  const guardNoButton = (event) => {
    const button = noButtonRef.current;
    if (!button || answer === 'yes') {
      return;
    }

    const box = button.getBoundingClientRect();
    const pointerX = event.clientX;
    const pointerY = event.clientY;
    const dangerZone = 115;
    const isClose =
      pointerX > box.left - dangerZone &&
      pointerX < box.right + dangerZone &&
      pointerY > box.top - dangerZone &&
      pointerY < box.bottom + dangerZone;

    if (isClose) {
      makeNoRun();
    }
  };

  return (
    <main className={answer === 'yes' ? 'page page--yes' : 'page'} onMouseMove={guardNoButton}>
      <div className="sparkle-field" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <section className="invite" aria-live="polite">
        <div className="photo-strip">
          <img
            src="/date-flowers.svg"
            alt="A cute bouquet with hearts"
          />
        </div>

        <div className="copy">
          <p className="eyebrow">
            <span aria-hidden="true">♡</span>
            one very important question
          </p>

          {answer === 'yes' ? (
            <>
              <h1>Perfect. It is a date.</h1>
              <p className="lead">
                I knew the universe had excellent taste. I will plan something sweet, cozy,
                and just a little bit ridiculous.
              </p>
              <div className="celebration">
                <span aria-hidden="true">♥</span>
                <span>Yes accepted. Heart officially doing cartwheels.</span>
                <span aria-hidden="true">✦</span>
              </div>
            </>
          ) : (
            <>
              <h1>Will you go on a date with me?</h1>
              <p className="lead">{note}</p>
              <div className="button-row">
                <button className="yes-button" type="button" onClick={() => setAnswer('yes')}>
                  Yes
                </button>
                <button
                  ref={noButtonRef}
                  className={noSpot ? 'no-button no-button--loose' : 'no-button'}
                  style={noSpot ? { left: `${noSpot.left}px`, top: `${noSpot.top}px` } : undefined}
                  type="button"
                  onMouseEnter={makeNoRun}
                  onFocus={makeNoRun}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    makeNoRun();
                  }}
                >
                  No
                </button>
              </div>
              <p className="tiny-text">
                Warning: the no button has commitment issues and excellent cardio.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
