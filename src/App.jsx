import { useMemo, useState } from 'react';

const correctDate = import.meta.env.VITE_CORRECT_DATE?.trim() ?? '';
const webhookUrl = import.meta.env.VITE_WEBHOOK_URL?.trim() ?? '';
const maxAttempts = 3;

const wrongFeedback = [
  'Hmm... cute guess, but no 😌',
  'Careful, babe. One more chance 💅',
  'Ouch. I’ll pretend I didn’t see that 😭',
];

function FloatingDecor() {
  return (
    <div className="floating-decor" aria-hidden="true">
      <span className="decor-heart decor-heart--one">♥</span>
      <span className="decor-heart decor-heart--two">♥</span>
      <span className="decor-heart decor-heart--three">♥</span>
      <span className="decor-spark decor-spark--one">✦</span>
      <span className="decor-spark decor-spark--two">✦</span>
      <span className="decor-spark decor-spark--three">✦</span>
    </div>
  );
}

function CelebrationBurst() {
  return (
    <div className="celebration-burst" aria-hidden="true">
      <span>♥</span>
      <span>✦</span>
      <span>♥</span>
      <span>✦</span>
      <span>♥</span>
      <span>✦</span>
    </div>
  );
}

async function notifyWinner(selectedDate) {
  const payload = {
    event: 'gift_card_challenge_won',
    selectedDate,
    timestamp: new Date().toISOString(),
  };

  if (!webhookUrl) {
    console.log('Winner notification payload:', payload);
    return;
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook request failed with status ${response.status}`);
  }
}

function App() {
  const [screen, setScreen] = useState('landing');
  const [selectedDate, setSelectedDate] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLocked = attempts >= maxAttempts;
  const remainingAttempts = Math.max(maxAttempts - attempts, 0);
  const helperText = useMemo(() => {
    if (screen === 'won') {
      return 'Honestly, I was hoping you’d get it right.';
    }

    if (isLocked) {
      return 'Challenge failed... but you’re still cute. Ask me nicely and maybe I’ll help.';
    }

    if (attempts === 0) {
      return 'You get three chances. No pressure. Okay, a little pressure.';
    }

    return feedback;
  }, [attempts, feedback, isLocked, screen]);

  const handleStart = () => {
    setScreen('challenge');
    setValidationMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (screen === 'won' || isLocked || isSubmitting) {
      return;
    }

    if (!selectedDate) {
      setValidationMessage('Pick a date first, pretty please.');
      return;
    }

    setValidationMessage('');

    if (selectedDate === correctDate && correctDate) {
      setIsSubmitting(true);

      try {
        await notifyWinner(selectedDate);
      } catch (error) {
        console.warn('Winner notification failed:', error);
      } finally {
        setIsSubmitting(false);
        setScreen('won');
      }

      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setFeedback(wrongFeedback[nextAttempts - 1] ?? wrongFeedback[wrongFeedback.length - 1]);
  };

  const handleReset = () => {
    setScreen('landing');
    setSelectedDate('');
    setAttempts(0);
    setFeedback('');
    setValidationMessage('');
    setIsSubmitting(false);
  };

  return (
    <main className={screen === 'won' ? 'app app--won' : 'app'}>
      <FloatingDecor />

      <section className="card" aria-live="polite">
        <div className="card__visual">
          <img src="/date-flowers.svg" alt="Romantic bouquet illustration" />
        </div>

        <div className="card__content">
          {screen === 'landing' && (
            <>
              <p className="eyebrow">Private little puzzle</p>
              <h1>You have a gift waiting for you... maybe 💝</h1>
              <p className="subtitle">
                But first, prove you remember something important.
              </p>
              <button className="primary-button" type="button" onClick={handleStart}>
                Start the challenge
              </button>
            </>
          )}

          {screen === 'challenge' && (
            <>
              <p className="eyebrow">Round one of romance</p>
              <h1>Choose the date of our first in-person date.</h1>
              <p className="subtitle">{helperText}</p>

              <form className="challenge-form" onSubmit={handleSubmit}>
                <label className="field-label" htmlFor="first-date">
                  Our first in-person date
                </label>
                <input
                  id="first-date"
                  className="date-input"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  disabled={isLocked || isSubmitting}
                  aria-describedby="attempts-note status-note"
                />

                <div className="status-row" id="attempts-note">
                  <span className="attempt-chip">Attempts left: {remainingAttempts}</span>
                  <span className="attempt-copy">
                    {remainingAttempts === 1 ? 'Last shot.' : 'Use them wisely.'}
                  </span>
                </div>

                {validationMessage && (
                  <p className="validation-message" role="alert">
                    {validationMessage}
                  </p>
                )}

                <div className="actions">
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={isLocked || isSubmitting}
                  >
                    {isSubmitting ? 'Checking your answer...' : 'Lock it in'}
                  </button>

                  {import.meta.env.DEV && (
                    <button className="secondary-button" type="button" onClick={handleReset}>
                      Reset
                    </button>
                  )}
                </div>
              </form>

              <p className={isLocked ? 'status-note status-note--locked' : 'status-note'} id="status-note">
                {helperText}
              </p>
            </>
          )}

          {screen === 'won' && (
            <>
              <CelebrationBurst />
              <p className="eyebrow">Challenge complete</p>
              <h1>You remembered 🥹💖</h1>
              <p className="subtitle">
                You won the gift. I’ll send your Amazon gift card soon.
              </p>
              <p className="status-note status-note--won">
                Honestly, I was hoping you’d get it right.
              </p>

              {import.meta.env.DEV && (
                <button className="secondary-button" type="button" onClick={handleReset}>
                  Reset
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
