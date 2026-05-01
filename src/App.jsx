import { useEffect, useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';

const baitDate = '2026-01-28';
const realDateIso = '2026-01-29';
const realDateReveal = '29/01/2026';
const signatureName = 'Clelia Guisgand';
const webhookUrl = import.meta.env.VITE_WEBHOOK_URL?.trim() ?? '';

const wrongFeedback = [
  'Hmm... cute guess, but no 😌',
  'Still wrong. I am enjoying this a little too much.',
  'Nope. You are fighting for your life against my nonsense right now.',
];

const preQuizQuestions = [
  {
    prompt: 'Will you fart against me?',
    options: [
      'Yes, proudly',
      'Only with written approval',
      'Never, I am a lady',
      'I reject this question',
    ],
  },
  {
    prompt: 'Will you poop when I’m home?',
    options: [
      'Yes, this is a real relationship',
      'No, I would hold it forever',
      'Only on national holidays',
      'I plead the fifth',
    ],
  },
  {
    prompt: 'Will you still cuddle me even if my feet are freezing?',
    options: [
      'Yes, and I will suffer beautifully',
      'No, get thermal socks',
      'Only under emergency blankets',
      'I need to speak to management',
    ],
  },
  {
    prompt: 'Will you forgive me for stealing your fries?',
    options: [
      'Yes, but with dramatic complaints',
      'No, that is a criminal act',
      'Only after compensation',
      'I will never emotionally recover',
    ],
  },
  {
    prompt: 'Will you survive 14 voice notes from me in one day?',
    options: [
      'Yes, like the brave woman I am',
      'No, I am calling the authorities',
      'Only if there are timestamps',
      'I would simply vanish',
    ],
  },
  {
    prompt: 'Will you let me be dramatic for absolutely no valid reason?',
    options: [
      'Yes, that is part of the package',
      'No, I invoice by the tantrum',
      'Only if witnesses are absent',
      'I need legal advice first',
    ],
  },
  {
    prompt: 'Will you still love me when I am being objectively annoying?',
    options: [
      'Yes, unfortunately',
      'Only on weekends',
      'No, blocked immediately',
      'Depends on the snacks',
    ],
  },
  {
    prompt: 'Will you allow emergency bathroom updates through a closed door?',
    options: [
      'Yes, sadly this is intimacy',
      'No, that is classified',
      'Only in bullet points',
      'Only after written consent',
    ],
  },
  {
    prompt: 'If I sit next to you during your skincare and judge nothing, are we okay?',
    options: [
      'Yes, you may observe the ritual',
      'No, leave the laboratory',
      'Only with safety goggles',
      'Depends how annoying your face is',
    ],
  },
  {
    prompt: 'Will you still claim me if I steal the blanket and then deny everything?',
    options: [
      'Yes, but I will file complaints',
      'No, exile immediately',
      'Only in summer',
      'Only if there is dessert',
    ],
  },
];

const confirmCopy = [
  {
    title: 'are you shure babbbbaaaa joooon??',
    body: 'This guess cost you a whole quiz question. Try not to waste the budget.',
    confirm: 'Yes, let me be wrong in peace',
  },
  {
    title: 'still going with that, azizam?',
    body: 'Bold choice. I support women’s rights and women’s wrong answers.',
    confirm: 'Yes, send it',
  },
  {
    title: 'final answer energy detected, joon delam 💋',
    body: 'This is getting serious now. Like fake-serious. But still.',
    confirm: 'Do it. Humble me.',
  },
];

const retryLines = [
  'come on babbbbaaaa, u know whats the right answer',
  'Na baba joon, try again. The right one is literally smiling at you.',
  'Akhay joonam, be serious for one second and pick the sweet answer.',
  'No no azizam, I refuse to let you sabotage this that easily. Again.',
  'Eyyy joon delam, wrong attitude. One more time.',
];

const catReleaseLines = [
  'No way bababaaa, I cannot believe you accepted. Oh look, Champagne is runnig away, catch him.',
  'Ay joonam, you actually said yes. Very suspicious. Oh look, Champagne is runnig away, catch him.',
  'Akh jigar, accepted that fast? Absolutely not. Oh look, Champagne is runnig away, catch him.',
  'Baba joon, I saw that yes. Too easy. Oh look, Champagne is runnig away, catch him.',
  'Azizammm, I cannot just hand it to you like that. Oh look, Champagne is runnig away, catch him.',
];

const rewardKinds = ['cat', 'heart', 'slider', 'gift', 'clicks', 'key', 'hold', 'bubble', 'code', 'wipe'];

const rewardIntroLines = [
  'No way bababaaa, I cannot believe you accepted. Your attempt is now a running cat. Catch the cat to get your attempt.',
  'Akh joonam, too cooperative. Fine. Your attempt turned into a stubborn heart. Tap it three times.',
  'Ey baba, accepted again? Now drag this ridiculous slider all the way if you want the attempt.',
  'Azizam, your attempt is hiding in one of these gift boxes. Pick the right one and stop guessing with your soul.',
  'Joon delam, not so fast. Beg for the attempt properly and click the button five times.',
  'Baba joon, your attempt is locked inside one of these keys. Choose the right key and pray.',
  'Akh jigar, last one. Hold the button like you mean it if you want this attempt.',
  'Ay joon, accepted again? Lovely. Now chase this floating bubble with your cursor until it gives up.',
  'Babaaa, too easy. Your attempt is trapped behind a tiny code. Tap the digits in the right order.',
  'Azizam, blanket-thief terms accepted. Now scrub this fake mess away if you want the attempt.',
];

const rewardClaimLines = {
  cat: 'Fine. You caught the cat. One attempt for you. Do not waste my generosity.',
  heart: 'Okay okay, you annoyed the heart into surrendering. One attempt for you.',
  slider: 'Khob, you dragged the whole thing. Take your attempt and behave.',
  gift: 'Wow, you actually found the right box. Suspicious. One attempt.',
  clicks: 'Begging level accepted. Here, take the attempt and keep your dignity somewhere else.',
  key: 'You picked the right key. Deeply irritating. One attempt for you.',
  hold: 'Fine. Commitment demonstrated. Take your attempt, azizam.',
  bubble: 'Khob, you chased the bubble like a champion. One attempt for you.',
  code: 'Wow. You entered the code. Disturbing competence. One attempt.',
  wipe: 'Fine, you cleaned the fake mess. Domestic queen behavior. One attempt for you.',
};

function formatChosenDate(dateString) {
  if (!dateString) {
    return '';
  }

  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

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

function buildEvidencePdf(answerHistory) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const outerX = 40;
  const outerY = 40;
  const outerWidth = pageWidth - 80;
  const outerHeight = pageHeight - 80;
  const contentLeft = 58;
  const contentWidth = pageWidth - 116;
  const footerHeight = 110;

  const paintPageShell = () => {
    doc.setFillColor(255, 248, 251);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setFillColor(255, 232, 239);
    doc.roundedRect(outerX, outerY, outerWidth, outerHeight, 16, 16, 'F');
  };

  const drawFooter = () => {
    doc.setDrawColor(220, 190, 202);
    doc.line(contentLeft, pageHeight - 120, pageWidth - 58, pageHeight - 120);
    doc.setFont('times', 'italic');
    doc.setFontSize(20);
    doc.setTextColor(132, 73, 98);
    doc.text(signatureName, contentLeft, pageHeight - 86);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(95, 101, 109);
    doc.text('Signed under teasing pressure, fake legal threat, and catastrophic cuteness.', contentLeft, pageHeight - 62);
  };

  paintPageShell();

  doc.setTextColor(96, 48, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('EVIDENCE', contentLeft, 88);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(95, 101, 109);
  doc.text('Certified proof of romantic nonsense, suspicious cooperation, and emotional liability.', contentLeft, 112);

  const acceptedFart = answerHistory.some(
    (entry) => entry.prompt === 'Will you fart against me?' && entry.earned,
  );
  const acceptedPoop = answerHistory.some(
    (entry) => entry.prompt === 'Will you poop when I’m home?' && entry.earned,
  );
  const summaryLines = [];

  if (acceptedFart) {
    summaryLines.push('You have now legally, spiritually, and romantically accepted to fart when I am home.');
  }

  if (acceptedPoop) {
    summaryLines.push('You have also accepted to poop when I am home, like a real relationship criminal.');
  }

  if (summaryLines.length === 0) {
    summaryLines.push('You tried to resist, which the court finds dramatic but unconvincing.');
  }

  summaryLines.push('If you later deny any of this, this PDF may be used against you in cort.');

  doc.setFillColor(255, 245, 208);
  doc.roundedRect(contentLeft, 132, contentWidth, 72, 12, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(96, 48, 74);
  doc.text('Official Summary Of Extremely Serious Findings', 72, 154);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(92, 99, 110);
  doc.text(summaryLines, 72, 174, { maxWidth: pageWidth - 144, lineHeightFactor: 1.35 });

  let y = 236;
  answerHistory.forEach((entry, index) => {
    const promptLines = doc.splitTextToSize(`Q${index + 1}. ${entry.prompt}`, contentWidth - 28);
    const answerLines = doc.splitTextToSize(`Answer: ${entry.answer}`, contentWidth - 28);
    const outcomeLines = doc.splitTextToSize(
      `Outcome: ${entry.earned ? '1 attempt earned' : 'No attempt earned'}`,
      contentWidth - 28,
    );
    const cardHeight = 28 + promptLines.length * 18 + answerLines.length * 16 + outcomeLines.length * 16 + 24;

    if (y + cardHeight > pageHeight - footerHeight) {
      drawFooter();
      doc.addPage();
      paintPageShell();
      y = 88;
    }

    doc.setFillColor(255, 252, 254);
    doc.roundedRect(contentLeft, y - 18, contentWidth, cardHeight, 10, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(47, 52, 64);
    doc.text(promptLines, 72, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(92, 99, 110);
    let innerY = y + promptLines.length * 18 + 8;
    doc.text(answerLines, 72, innerY);
    innerY += answerLines.length * 16 + 6;
    doc.text(outcomeLines, 72, innerY);
    y += cardHeight + 18;
  });

  drawFooter();

  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}

function randomCatSpot() {
  const padding = 24;
  const width = Math.max(window.innerWidth - 132, 120);
  const height = Math.max(window.innerHeight - 132, 120);

  return {
    left: padding + Math.random() * Math.max(width - padding * 2, 40),
    top: padding + Math.random() * Math.max(height - padding * 2, 40),
  };
}

function randomIndex(count) {
  return Math.floor(Math.random() * count);
}

function createRewardTask(index) {
  const kind = rewardKinds[index % rewardKinds.length];

  switch (kind) {
    case 'cat':
      return {
        kind,
        position: randomCatSpot(),
        movesLeft: 2 + Math.floor(Math.random() * 3),
      };
    case 'heart':
      return {
        kind,
        tapsLeft: 3,
      };
    case 'slider':
      return {
        kind,
        value: 0,
      };
    case 'gift':
      return {
        kind,
        correctIndex: randomIndex(3),
        wrongMessage: '',
      };
    case 'clicks':
      return {
        kind,
        clicksLeft: 5,
      };
    case 'key':
      return {
        kind,
        correctIndex: randomIndex(4),
        wrongMessage: '',
      };
    case 'hold':
      return {
        kind,
        holding: false,
      };
    case 'bubble':
      return {
        kind,
        hoversLeft: 4,
      };
    case 'code':
      return {
        kind,
        target: [2, 9, 1],
        progress: [],
        wrongMessage: '',
      };
    case 'wipe':
      return {
        kind,
        wipesLeft: 6,
      };
    default:
      return null;
  }
}

function App() {
  const [screen, setScreen] = useState('landing');
  const [selectedDate, setSelectedDate] = useState('');
  const [pendingGuessDate, setPendingGuessDate] = useState('');
  const [availableAttempts, setAvailableAttempts] = useState(0);
  const [usedAttempts, setUsedAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionAnswer, setCurrentQuestionAnswer] = useState(null);
  const [questionError, setQuestionError] = useState('');
  const [questionRetryCount, setQuestionRetryCount] = useState(0);
  const [questionSuccess, setQuestionSuccess] = useState('');
  const [answerHistory, setAnswerHistory] = useState([]);
  const [isPrankReveal, setIsPrankReveal] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [rewardTask, setRewardTask] = useState(null);
  const dateInputRef = useRef(null);

  const currentQuestion = preQuizQuestions[currentQuestionIndex] ?? null;
  const guessesLeft = Math.max(availableAttempts, 0);
  const questionsLeft = Math.max(preQuizQuestions.length - currentQuestionIndex, 0);
  const currentConfirmCopy = confirmCopy[Math.min(usedAttempts, confirmCopy.length - 1)];

  useEffect(() => {
    return () => {
      if (evidenceUrl) {
        URL.revokeObjectURL(evidenceUrl);
      }
    };
  }, [evidenceUrl]);

  useEffect(() => {
    if (screen !== 'won' || answerHistory.length === 0) {
      return;
    }

    const nextUrl = buildEvidencePdf(answerHistory);
    setEvidenceUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return nextUrl;
    });
  }, [answerHistory, screen]);

  useEffect(() => {
    if (!evidenceUrl || screen !== 'won') {
      return;
    }

    const link = document.createElement('a');
    link.href = evidenceUrl;
    link.download = 'EVIDENCE.pdf';
    link.click();
  }, [evidenceUrl, screen]);

  const helperText = useMemo(() => {
    if (screen === 'won') {
      return isPrankReveal
        ? `Okay okay, I know the real date was ${realDateReveal}. I just wanted to annoy you.`
        : 'Honestly, I was hoping you’d get baited by the fake date.';
    }

    if (guessesLeft === 0 && !isQuestionOpen) {
      if (rewardTask) {
        return rewardTask.kind === 'cat'
          ? 'Oh look, Champagne is runnig away, catch him.'
          : 'Your attempt is being held hostage by fresh nonsense. Finish the task and claim it.';
      }

      return questionsLeft === 0
        ? `Okay okay, I know the real date was ${realDateReveal}. I just wanted to annoy you.`
        : 'No attempts left. Time to answer another humiliating question.';
    }

    if (guessesLeft > 0) {
      return `You have ${guessesLeft} ${guessesLeft === 1 ? 'attempt' : 'attempts'} to spend. Use them badly.`;
    }

    return 'You begin with nothing. Earn your guesses one absurd yes at a time.';
  }, [guessesLeft, isPrankReveal, isQuestionOpen, questionsLeft, rewardTask, screen]);

  const openNextQuestion = () => {
    setCurrentQuestionAnswer(null);
    setQuestionError('');
    setQuestionSuccess('');
    setQuestionRetryCount(0);
    setIsQuestionOpen(true);
  };

  const handleStart = () => {
    setScreen('challenge');
    setValidationMessage('');
    openNextQuestion();
  };

  const handleQuestionSubmit = (event) => {
    event.preventDefault();

    if (currentQuestionAnswer === null) {
      setQuestionError('Answer the question, coward.');
      return;
    }

    const earned = currentQuestionAnswer === 0;
    const nextHistory = [
      ...answerHistory,
      {
        prompt: currentQuestion.prompt,
        answer: currentQuestion.options[currentQuestionAnswer],
        earned,
      },
    ];

    setAnswerHistory(nextHistory);
    if (!earned) {
      setCurrentQuestionAnswer(null);
      setQuestionRetryCount((current) => current + 1);
      setQuestionError(retryLines[questionRetryCount % retryLines.length]);
      return;
    }

    setQuestionError('');
    setQuestionSuccess(rewardIntroLines[currentQuestionIndex % rewardIntroLines.length]);
    setFeedback('First survive the bonus nonsense, then you get your attempt.');
  };

  const releaseRewardTask = () => {
    const rewardIndex = currentQuestionIndex;
    setCurrentQuestionAnswer(null);
    setQuestionRetryCount(0);
    setQuestionSuccess('');
    setIsQuestionOpen(false);
    setRewardTask(createRewardTask(rewardIndex));
    setCurrentQuestionIndex((current) => current + 1);
  };

  const handleCatRun = () => {
    setRewardTask((current) => {
      if (!current || current.kind !== 'cat' || current.movesLeft <= 0) {
        return current;
      }

      return {
        ...current,
        position: randomCatSpot(),
        movesLeft: current.movesLeft - 1,
      };
    });
  };

  const claimRewardTask = (kind) => {
    setAvailableAttempts((current) => current + 1);
    setRewardTask(null);
    setFeedback(rewardClaimLines[kind]);
  };

  const claimCatAttempt = () => {
    if (!rewardTask || rewardTask.kind !== 'cat') {
      return;
    }

    if (rewardTask.movesLeft > 0) {
      handleCatRun();
      return;
    }

    claimRewardTask('cat');
  };

  const tapHeartAttempt = () => {
    setRewardTask((current) => {
      if (!current || current.kind !== 'heart') {
        return current;
      }

      if (current.tapsLeft <= 1) {
        window.setTimeout(() => claimRewardTask('heart'), 0);
        return null;
      }

      return {
        ...current,
        tapsLeft: current.tapsLeft - 1,
      };
    });
  };

  const handleSliderAttempt = (value) => {
    const numericValue = Number(value);
    setRewardTask((current) => {
      if (!current || current.kind !== 'slider') {
        return current;
      }

      if (numericValue >= 100) {
        window.setTimeout(() => claimRewardTask('slider'), 0);
        return null;
      }

      return {
        ...current,
        value: numericValue,
      };
    });
  };

  const chooseGiftBox = (index) => {
    setRewardTask((current) => {
      if (!current || current.kind !== 'gift') {
        return current;
      }

      if (index === current.correctIndex) {
        window.setTimeout(() => claimRewardTask('gift'), 0);
        return null;
      }

      return {
        ...current,
        correctIndex: randomIndex(3),
        wrongMessage: 'Na baba joon, wrong box. They moved. Try again.',
      };
    });
  };

  const begForAttempt = () => {
    setRewardTask((current) => {
      if (!current || current.kind !== 'clicks') {
        return current;
      }

      if (current.clicksLeft <= 1) {
        window.setTimeout(() => claimRewardTask('clicks'), 0);
        return null;
      }

      return {
        ...current,
        clicksLeft: current.clicksLeft - 1,
      };
    });
  };

  const chooseKey = (index) => {
    setRewardTask((current) => {
      if (!current || current.kind !== 'key') {
        return current;
      }

      if (index === current.correctIndex) {
        window.setTimeout(() => claimRewardTask('key'), 0);
        return null;
      }

      return {
        ...current,
        correctIndex: randomIndex(4),
        wrongMessage: 'Akh joonam, wrong key. They shuffled because life is unfair.',
      };
    });
  };

  const startHoldAttempt = () => {
    setRewardTask((current) => {
      if (!current || current.kind !== 'hold') {
        return current;
      }

      return {
        ...current,
        holding: true,
      };
    });
    window.setTimeout(() => {
      setRewardTask((current) => {
        if (!current || current.kind !== 'hold' || !current.holding) {
          return current;
        }

        window.setTimeout(() => claimRewardTask('hold'), 0);
        return null;
      });
    }, 1100);
  };

  const endHoldAttempt = () => {
    setRewardTask((current) => {
      if (!current || current.kind !== 'hold') {
        return current;
      }

      return {
        ...current,
        holding: false,
      };
    });
  };

  const chaseBubble = () => {
    setRewardTask((current) => {
      if (!current || current.kind !== 'bubble') {
        return current;
      }

      if (current.hoversLeft <= 1) {
        window.setTimeout(() => claimRewardTask('bubble'), 0);
        return null;
      }

      return {
        ...current,
        hoversLeft: current.hoversLeft - 1,
      };
    });
  };

  const enterCodeDigit = (digit) => {
    setRewardTask((current) => {
      if (!current || current.kind !== 'code') {
        return current;
      }

      const nextProgress = [...current.progress, digit];
      const prefix = current.target.slice(0, nextProgress.length);
      const valid = nextProgress.every((value, index) => value === prefix[index]);

      if (!valid) {
        return {
          ...current,
          progress: [],
          wrongMessage: 'Na baba joon, wrong code. Start over and suffer properly.',
        };
      }

      if (nextProgress.length === current.target.length) {
        window.setTimeout(() => claimRewardTask('code'), 0);
        return null;
      }

      return {
        ...current,
        progress: nextProgress,
        wrongMessage: '',
      };
    });
  };

  const wipeMess = () => {
    setRewardTask((current) => {
      if (!current || current.kind !== 'wipe') {
        return current;
      }

      if (current.wipesLeft <= 1) {
        window.setTimeout(() => claimRewardTask('wipe'), 0);
        return null;
      }

      return {
        ...current,
        wipesLeft: current.wipesLeft - 1,
      };
    });
  };

  const finishWithReveal = async () => {
    setFeedback(`Okay okay, I know the real date was ${realDateReveal}. I just wanted to annoy you.`);
    setIsPrankReveal(true);
    setIsSubmitting(true);

    try {
      await notifyWinner(pendingGuessDate || selectedDate || realDateIso);
    } catch (error) {
      console.warn('Winner notification failed:', error);
    } finally {
      setIsSubmitting(false);
      setScreen('won');
    }
  };

  const submitGuess = async () => {
    if (screen === 'won' || guessesLeft <= 0 || isSubmitting) {
      return;
    }

    setValidationMessage('');
    setIsConfirmOpen(false);

    const guessDate = pendingGuessDate || selectedDate;

    if (guessDate === baitDate) {
      setIsPrankReveal(false);
      setIsSubmitting(true);

      try {
        await notifyWinner(guessDate);
      } catch (error) {
        console.warn('Winner notification failed:', error);
      } finally {
        setIsSubmitting(false);
        setPendingGuessDate('');
        setScreen('won');
      }

      return;
    }

    const nextGuesses = availableAttempts - 1;
    const nextUsedAttempts = usedAttempts + 1;
    setAvailableAttempts(nextGuesses);
    setUsedAttempts(nextUsedAttempts);
    setSelectedDate('');
    setPendingGuessDate('');
    setFeedback(
      wrongFeedback[Math.min(nextUsedAttempts - 1, wrongFeedback.length - 1)] ??
        wrongFeedback[wrongFeedback.length - 1],
    );

    if (currentQuestionIndex >= preQuizQuestions.length && nextGuesses <= 0) {
      await finishWithReveal();
      return;
    }

    if (nextGuesses <= 0 && currentQuestionIndex < preQuizQuestions.length) {
      window.setTimeout(() => {
        openNextQuestion();
      }, 280);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (screen === 'won' || guessesLeft <= 0 || isSubmitting || isQuestionOpen) {
      return;
    }

    const chosenDate = dateInputRef.current?.value || selectedDate;

    if (!chosenDate) {
      setValidationMessage('Pick a date first, pretty please.');
      return;
    }

    if (chosenDate !== selectedDate) {
      setSelectedDate(chosenDate);
    }

    setValidationMessage('');
    setPendingGuessDate(chosenDate);
    setIsConfirmOpen(true);
  };

  const handleReset = () => {
    if (evidenceUrl) {
      URL.revokeObjectURL(evidenceUrl);
    }

    setScreen('landing');
    setSelectedDate('');
    setPendingGuessDate('');
    setAvailableAttempts(0);
    setUsedAttempts(0);
    setFeedback('');
    setValidationMessage('');
    setIsSubmitting(false);
    setIsConfirmOpen(false);
    setIsQuestionOpen(false);
    setCurrentQuestionIndex(0);
    setCurrentQuestionAnswer(null);
    setQuestionError('');
    setQuestionRetryCount(0);
    setQuestionSuccess('');
    setAnswerHistory([]);
    setIsPrankReveal(false);
    setEvidenceUrl('');
    setRewardTask(null);
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
              <p className="eyebrow">Round one of chaos</p>
              <h1>Choose the date of our first in-person date.</h1>
              <p className="subtitle">{helperText}</p>

              <form className="challenge-form" onSubmit={handleSubmit}>
                <label className="field-label" htmlFor="first-date">
                  Our first in-person date
                </label>
                <input
                  ref={dateInputRef}
                  id="first-date"
                  className="date-input"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    window.setTimeout(() => {
                      dateInputRef.current?.blur();
                    }, 0);
                  }}
                  disabled={guessesLeft <= 0 || isSubmitting || isQuestionOpen || Boolean(rewardTask)}
                  aria-describedby="attempts-note status-note"
                />

                <div className="status-row" id="attempts-note">
                  <span className="attempt-chip">Attempts left: {guessesLeft}</span>
                  <span className="attempt-chip attempt-chip--alt">Questions left: {questionsLeft}</span>
                  <span className="attempt-chip attempt-chip--cat">
                    Chaos pending: {rewardTask ? 'yes' : 'no'}
                  </span>
                  <span className="attempt-copy">
                    {guessesLeft > 0
                      ? 'One wrong date and I drag you into another question.'
                      : 'No attempts right now. The modal is your boss.'}
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
                    disabled={guessesLeft <= 0 || isSubmitting || isQuestionOpen || Boolean(rewardTask)}
                  >
                    {isSubmitting ? 'Checking your answer...' : 'Submit this suspicious answer'}
                  </button>

                  {import.meta.env.DEV && (
                    <button className="secondary-button" type="button" onClick={handleReset}>
                      Reset
                    </button>
                  )}
                </div>
              </form>

              <p className="status-note" id="status-note">
                {feedback || helperText}
              </p>
            </>
          )}

          {screen === 'won' && (
            <>
              <CelebrationBurst />
              <p className="eyebrow">{isPrankReveal ? 'Okay fine, you win' : 'Challenge complete'}</p>
              <h1>{isPrankReveal ? 'I was trolling you 😌💝' : 'You out-chaosed the chaos 💖'}</h1>
              <p className="subtitle">
                {isPrankReveal
                  ? `I already know the right date is ${realDateReveal}, but I wanted to annoy you. You still won the gift card, You will get it as soon as you send me the evidence file.`
                  : 'You won the gift. I’ll send your Amazon gift card soon.'}
              </p>
              <p className="status-note status-note--won">
                Your `EVIDENCE` file has been prepared like a deeply unserious legal document.
              </p>

              <div className="actions">
                {evidenceUrl && (
                  <a className="primary-button primary-button--link" href={evidenceUrl} download="EVIDENCE.pdf">
                    Download EVIDENCE
                  </a>
                )}

                {import.meta.env.DEV && (
                  <button className="secondary-button" type="button" onClick={handleReset}>
                    Reset
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {rewardTask?.kind === 'cat' && screen === 'challenge' && (
        <button
          className="cat-attempt"
          type="button"
          style={{
            left: `${rewardTask.position.left}px`,
            top: `${rewardTask.position.top}px`,
          }}
          onMouseEnter={handleCatRun}
          onFocus={handleCatRun}
          onClick={claimCatAttempt}
        >
          <span className="cat-runner" aria-hidden="true">
            <span className="cat-runner__tail" />
            <span className="cat-runner__body">
              <span className="cat-runner__ear cat-runner__ear--left" />
              <span className="cat-runner__ear cat-runner__ear--right" />
              <span className="cat-runner__face">
                <span className="cat-runner__eye" />
                <span className="cat-runner__eye" />
                <span className="cat-runner__nose" />
              </span>
            </span>
            <span className="cat-runner__legs">
              <span className="cat-runner__leg cat-runner__leg--front" />
              <span className="cat-runner__leg cat-runner__leg--front-back" />
              <span className="cat-runner__leg cat-runner__leg--rear" />
              <span className="cat-runner__leg cat-runner__leg--rear-back" />
            </span>
          </span>
          <span className="cat-attempt__label">
            {rewardTask.movesLeft > 0 ? 'Catch me' : 'Click me'}
          </span>
        </button>
      )}

      {rewardTask?.kind === 'heart' && screen === 'challenge' && (
        <div className="reward-stage">
          <button className="reward-widget reward-widget--heart" type="button" onClick={tapHeartAttempt}>
            <span className="reward-widget__big">♥</span>
            <span className="reward-widget__text">Tap me {rewardTask.tapsLeft} times, joonam</span>
          </button>
        </div>
      )}

      {rewardTask?.kind === 'slider' && screen === 'challenge' && (
        <div className="reward-stage">
          <div className="reward-widget reward-widget--slider">
            <p className="reward-widget__text">Drag this drama meter all the way to 100.</p>
            <input
              className="reward-slider"
              type="range"
              min="0"
              max="100"
              value={rewardTask.value}
              onChange={(event) => handleSliderAttempt(event.target.value)}
            />
            <span className="reward-widget__count">{rewardTask.value}%</span>
          </div>
        </div>
      )}

      {rewardTask?.kind === 'gift' && screen === 'challenge' && (
        <div className="reward-stage">
          <div className="reward-widget reward-widget--boxes">
            <p className="reward-widget__text">Pick the correct gift box, azizam.</p>
            <div className="reward-choices">
              {[0, 1, 2].map((index) => (
                <button className="reward-choice reward-choice--gift" key={index} type="button" onClick={() => chooseGiftBox(index)}>
                  🎁
                </button>
              ))}
            </div>
            {rewardTask.wrongMessage && <span className="reward-widget__hint">{rewardTask.wrongMessage}</span>}
          </div>
        </div>
      )}

      {rewardTask?.kind === 'clicks' && screen === 'challenge' && (
        <div className="reward-stage">
          <button className="reward-widget reward-widget--clicks" type="button" onClick={begForAttempt}>
            <span className="reward-widget__big">🙏</span>
            <span className="reward-widget__text">Beg {rewardTask.clicksLeft} more times for the attempt</span>
          </button>
        </div>
      )}

      {rewardTask?.kind === 'key' && screen === 'challenge' && (
        <div className="reward-stage">
          <div className="reward-widget reward-widget--keys">
            <p className="reward-widget__text">Choose the key that apparently loves you most.</p>
            <div className="reward-choices reward-choices--keys">
              {[0, 1, 2, 3].map((index) => (
                <button className="reward-choice reward-choice--key" key={index} type="button" onClick={() => chooseKey(index)}>
                  🔑
                </button>
              ))}
            </div>
            {rewardTask.wrongMessage && <span className="reward-widget__hint">{rewardTask.wrongMessage}</span>}
          </div>
        </div>
      )}

      {rewardTask?.kind === 'hold' && screen === 'challenge' && (
        <div className="reward-stage">
          <button
            className={rewardTask.holding ? 'reward-widget reward-widget--hold reward-widget--holding' : 'reward-widget reward-widget--hold'}
            type="button"
            onMouseDown={startHoldAttempt}
            onMouseUp={endHoldAttempt}
            onMouseLeave={endHoldAttempt}
            onTouchStart={startHoldAttempt}
            onTouchEnd={endHoldAttempt}
          >
            <span className="reward-widget__text">Hold me down for one dramatic second</span>
          </button>
        </div>
      )}

      {rewardTask?.kind === 'bubble' && screen === 'challenge' && (
        <div className="reward-stage">
          <button className="reward-widget reward-widget--bubble" type="button" onMouseEnter={chaseBubble} onFocus={chaseBubble}>
            <span className="reward-widget__big">🫧</span>
            <span className="reward-widget__text">Chase this bubble {rewardTask.hoversLeft} more times</span>
          </button>
        </div>
      )}

      {rewardTask?.kind === 'code' && screen === 'challenge' && (
        <div className="reward-stage">
          <div className="reward-widget reward-widget--code">
            <p className="reward-widget__text">Tap the tiny secret code: 2, then 9, then 1.</p>
            <div className="reward-choices reward-choices--code">
              {[1, 2, 3, 9].map((digit) => (
                <button className="reward-choice reward-choice--code" key={digit} type="button" onClick={() => enterCodeDigit(digit)}>
                  {digit}
                </button>
              ))}
            </div>
            <span className="reward-widget__hint">
              {rewardTask.wrongMessage || `Progress: ${rewardTask.progress.join(' ') || 'none yet'}`}
            </span>
          </div>
        </div>
      )}

      {rewardTask?.kind === 'wipe' && screen === 'challenge' && (
        <div className="reward-stage">
          <button className="reward-widget reward-widget--wipe" type="button" onClick={wipeMess}>
            <span className="reward-widget__big">🧽</span>
            <span className="reward-widget__text">Scrub away the imaginary mess {rewardTask.wipesLeft} times</span>
          </button>
        </div>
      )}

      {isQuestionOpen && currentQuestion && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="confirm-modal confirm-modal--question"
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-title"
            aria-describedby="question-body"
          >
            <p className="confirm-modal__eyebrow">Earn one attempt</p>
            <h2 id="question-title">{currentQuestion.prompt}</h2>
            {questionSuccess ? (
              <>
                <p className="confirm-modal__body" id="question-body">
                  {questionSuccess}
                </p>
                <div className="confirm-modal__actions">
                  <button className="primary-button" type="button" onClick={releaseRewardTask}>
                    Release the nonsense
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="confirm-modal__body" id="question-body">
                  The right answer is obviously yes. Do not overthink this and ruin your own future.
                </p>

                <form className="question-form" onSubmit={handleQuestionSubmit}>
                  <div className="question-options">
                    {currentQuestion.options.map((option, optionIndex) => (
                      <label className="question-option" key={`${currentQuestionIndex}-${optionIndex}`}>
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          checked={currentQuestionAnswer === optionIndex}
                          onChange={() => setCurrentQuestionAnswer(optionIndex)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>

                  {questionError && (
                    <p className="validation-message" role="alert">
                      {questionError}
                    </p>
                  )}

                  <div className="confirm-modal__actions">
                    <button className="primary-button" type="submit">
                      Claim my attempt
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {isConfirmOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsConfirmOpen(false)}>
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-body"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="confirm-modal__eyebrow">One little pause first</p>
            <h2 id="confirm-title">{currentConfirmCopy.title}</h2>
            <p className="confirm-modal__date">You picked: {formatChosenDate(pendingGuessDate || selectedDate)}</p>
            <p className="confirm-modal__body" id="confirm-body">
              {currentConfirmCopy.body}
            </p>
            <div className="confirm-modal__actions">
              <button className="secondary-button" type="button" onClick={() => setIsConfirmOpen(false)}>
                Wait, let me rethink
              </button>
              <button className="primary-button" type="button" onClick={submitGuess}>
                {currentConfirmCopy.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
