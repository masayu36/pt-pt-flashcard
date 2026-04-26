import React, { useEffect, useRef, useState } from 'react';
import { Check, Mic, RotateCcw, Settings, Volume2, X } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';

// Official Azure Speech pt-pt voice candidates we can try locally.
const AZURE_VOICES = [
    { shortName: "pt-pt-RaquelNeural", label: "Raquel", lang: "pt-pt", gender: "Female" },
    { shortName: "pt-pt-DuarteNeural", label: "Duarte", lang: "pt-pt", gender: "Male" },
    { shortName: "pt-pt-FernandaNeural", label: "Fernanda", lang: "pt-pt", gender: "Female" },
];

const DATA = [
    { jp1: "遅刻している。", pt1: "Estou atrasado.", comment: "atrasado = late" },
    { jp1: "迷った。", pt1: "Estou perdida.", comment: "" },
    { jp1: "お腹空いている。", pt1: "Estou com fome.", comment: "com fome = hungry; estar com = ～の状態である" },
    { jp1: "喉乾いている。", pt1: "Estou com sede.", comment: "com sede = thirsty" },
    { jp1: "熱がある。", pt1: "Estou com febre.", comment: "com febre = have a fever" },
    { jp1: "(私) 寒い。", pt1: "Estou com frio.", comment: "com frio = cold" },
    { jp1: "(私) 熱い。", pt1: "Estou com calor.", comment: "com calor = hot" },
    { jp1: "(外) 寒い。", pt1: "Está frio.", comment: "天候、気温の場合はitが主語だが、ポル語は表現しない。" },
    { jp1: "(外) 暑い。", pt1: "Está calor/quente.", comment: "天候、気温の場合はitが主語だが、ポル語は表現しない。" },
    { jp1: "(お前) 遅刻だよ。", pt1: "Estás atrasado.", comment: "atrasado = late" },
    { jp1: "(あなた) 遅刻だよ。", pt1: "Está atrasado.", comment: "atrasado = late" },
    { jp1: "(お前) お腹空いてる？", pt1: "Estás com fome?", comment: "com fome = hungry" },
    { jp1: "(あなた) お腹空いてます？", pt1: "Está com fome?", comment: "com fome = hungry" },
    { jp1: "(お前) 熱があるよ。", pt1: "Estás com febre.", comment: "com febre = have a fever" },
    { jp1: "(あなた) 熱がありますよ。", pt1: "Está com febre.", comment: "com febre = have a fever" },
    { jp1: "私はコウセイです。", pt1: "Eu sou o Kosei.", comment: "本質" },
    { jp1: "私は日本人だよ。", pt1: "Eu sou japonês.", comment: "強調する時は主語を言っても良い。" },
    { jp1: "君は中国人か？", pt1: "Tu és chinês?", comment: "強調する時は主語を言っても良い。" },
    {
        jp1: "あなたはポルトガル人ですか？",
        pt1: "Você é português?",
        jp2: "いいえ、ブラジル人です。",
        pt2: "Não, eu sou brasileiro.",
        comment: "会話形式",
    },
    { jp1: "（君）日本のどこ出身なの？", pt1: "De onde és no Japão?", jp2: "東京出身です。", pt2: "Eu sou de Tóquio." },
    { jp1: "ポルトガルはどこにあるの？", pt1: "Onde fica Portugal?", jp2: "ヨーロッパの西にあるよ。", pt2: "Fica no oeste da Europa." },
    { jp1: "何の音楽を聴くの？", pt1: "Que música ouves?", jp2: "ビートルズを聴くよ。", pt2: "Eu ouço os Beatles." },
    { jp1: "休みの日は何してる？", pt1: "O que fazes nos tempos livres?", jp2: "映画を観るよ。", pt2: "Eu assisto a filmes." },
    { jp1: "太宰治って誰？有名なの？    ", pt1: "Quem é Osamu Dazai? É famoso?", jp2: "うん、そうだよ。", pt2: "Sim, é." },
    { jp1: "どういう意味？", pt1: `O que é que significa "famoso"?`, jp2: "「有名」っていう意味だよ。", pt2: `Significa "famous"` },
    {
        jp1: 'その本いくら？',
        pt1: 'Quanto é que custa esse livro?',
        jp2: '10ユーロだよ。',
        pt2: 'Custa 10 euros.',
        comment: 'quanto = how much'
    },
    {
        jp1: 'How are you?（調子）',
        pt1: 'Como estás?',
        jp2: 'I\'m good/well.',
        pt2: 'Estou bem.',
        comment: ''
    },
    {
        jp1: '彼はどんな人？',
        pt1: 'Como é ele?',
        jp2: '彼は背が高いよ。',
        pt2: 'Ele é alto.',
        comment: ''
    },
    {
        jp1: 'How is he?（調子）',
        pt1: 'Como está ele?',
        jp2: '彼はちょっと病気だよ。',
        pt2: 'Ele está um pouco doente.',
        comment: 'doente = sick'
    },
    {
        jp1: '何のジュースが飲みたい？',
        pt1: 'Que sumo queres beber?',
        jp2: 'オレンジジュースが飲みたい。',
        pt2: 'Quero beber sumo de laranja.',
        comment: 'sumo = juice'
    },
    {
        jp1: 'How many bags do you have?',
        pt1: 'Quantas malas tu tens?',
        jp2: '2つあります。',
        pt2: 'Tenho duas malas',
        comment: ''
    },
    {
        jp1: 'Why are you sad?',
        pt1: 'Porque é que estás triste?',
        jp2: '',
        pt2: '',
        comment: ''
    },
    {
        jp1: '住所は何ですか？',
        pt1: 'Qual é a morada?',
        jp2: '',
        pt2: '',
        comment: 'O que é X? は、Xの定義を尋ねることになる。'
    },
    {
        jp1: '国籍は何ですか？',
        pt1: 'Qual é a nacionalidade?',
        jp2: '',
        pt2: '',
        comment: 'O que é X? は、Xの定義を尋ねることになる。'
    },
    {
        jp1: 'sumoって何？',
        pt1: 'O que é sumo?',
        jp2: 'sumoはジュースのことだよ。',
        pt2: 'Sumo significa "juice".',
        comment: ''
    },
    {
        jp1: 'どの通りに住んでるの？',
        pt1: 'Em que rua mora?',
        jp2: 'Nova Santa Cruz通りに住んでるよ。',
        pt2: 'Moro na Rua Nova Santa Cruz.',
        comment: 'rua = street'
    },
    {
        jp1: 'Who has a question? 質問ある人？',
        pt1: 'Quem tem uma pergunta?',
        jp2: '私です。一個あります。',
        pt2: 'Eu tenho.',
        comment: 'ter = have'
    },
    {
        jp1: 'いつポルトガルに行くの？',
        pt1: 'Quando é que (tu) vais para Portugal?',
        jp2: '９月に行くよ。',
        pt2: 'vou em setembro.',
        comment: '月は小文字。'
    },
    {
        jp1: 'いつからポルトガルにいるの？',
        pt1: 'Desde quando estás em Portugal?',
        jp2: '９月からいるよ。',
        pt2: 'Estou desde setembro.',
        comment: 'desde = since'
    },
    {
        jp1: 'どれがおすすめですか？',
        pt1: 'Quais recomenda?',
        jp2: 'この本とあの本をおすすめします。',
        pt2: 'Recomendo este livro e aquele livro.',
        comment: 'qual > quais'
    },
    {
        jp1: 'いつまで日本にいるの？',
        pt1: 'Até quando ficas no Japão?',
        jp2: '８月まで日本にいるよ。',
        pt2: 'Fico até agosto.',
        comment: ''
    },
    {
        jp1: 'Wi-fiのパスワードはなに？',
        pt1: 'Qual é a senha do Wi-fi?',
        jp2: '',
        pt2: '',
        comment: ''
    },

    {
        jp1: 'APPLEはポルトガル語で何て言うの？',
        pt1: 'Como se diz "APPLE" em português?',
        jp2: '',
        pt2: '',
        comment: ''
    },
    {
        jp1: '何時に着くの？',
        pt1: 'A que horas é que vais chegar?',
        jp2: '',
        pt2: '',
        comment: ''
    },
    {
        jp1: '授業は何時から？',
        pt1: 'A que horas é a aula?',
        jp2: '',
        pt2: '',
        comment: ''
    },
    {
        jp1: 'トイレはどこですか？',
        pt1: 'Onde é que fica a casa de banho?',
        jp2: 'あっちの突き当たりだよ。',
        pt2: 'Fica ali ao fundo.',
        comment: ''
    },
    {
        jp1: '一日に何時間勉強する？',
        pt1: 'Quantas horas estudas por dia?',
        jp2: '3時間くらい',
        pt2: 'Mais ou menos 3 horas.',
        comment: '3 = três'
    }



];

const MODE_OptIONS = [
    {
        id: "review",
        label: "確認",
        description: "タップで答えを表示して確認する",
    },
    {
        id: "typed",
        label: "記述",
        description: "入力欄にポルトガル語を書いて答え合わせする",
    },
    {
        id: "speech",
        label: "音声",
        description: "音声入力して発話内容を判定する",
    },
];

const QUESTION_COUNT_OptIONS = [5, 10, DATA.length];

const shuffleIndices = () => {
    const indices = DATA.map((_, index) => index);

    for (let i = indices.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    return indices;
};

const normalizeText = (text) =>
    text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[¿?!.,;:()[\]"]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const expandAnswerVariants = (text) => {
    const segments = text.split(/(\S*\/\S*)/g).filter(Boolean);
    let variants = [""];

    segments.forEach((segment) => {
        if (!segment.includes("/")) {
            variants = variants.map((variant) => `${variant}${segment}`);
            return;
        }

        const choices = segment.split("/");
        variants = variants.flatMap((variant) =>
            choices.map((choice) => `${variant}${choice}`)
        );
    });

    return [...new Set(variants.map(normalizeText))];
};

const buildPromptLines = (item) => {
    const lines = [{ jp: item.jp1, pt: item.pt1, voiceSlot: 0 }];
    if (item.jp2 && item.pt2) {
        lines.push({ jp: item.jp2, pt: item.pt2, voiceSlot: 1 });
    }
    return lines;
};

export default function App() {
    const [selectedMode, setSelectedMode] = useState("review");
    const [selectedQuestionCount, setSelectedQuestionCount] = useState(DATA.length);
    const [sessionDeck, setSessionDeck] = useState([]);
    const [sessionActive, setSessionActive] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [showComment, setShowComment] = useState(false);
    const [typedAnswers, setTypedAnswers] = useState([]);
    const [speechResults, setSpeechResults] = useState([]);
    const [voiceA, setVoiceA] = useState(AZURE_VOICES[1].shortName);
    const [voiceB, setVoiceB] = useState(AZURE_VOICES[0].shortName);
    const [activeSpeaker, setActiveSpeaker] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [listeningIndex, setListeningIndex] = useState(null);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [swipeActive, setSwipeActive] = useState(false);
    const audioRef = useRef(null);
    const audioUrlRef = useRef(null);
    const playbackIdRef = useRef(0);
    const recognitionRef = useRef(null);
    const recognitionLineRef = useRef(null);
    const speechDraftRef = useRef("");
    const speechStopRequestedRef = useRef(false);

    useEffect(() => {
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setSpeechSupported(Boolean(Recognition));

        return () => {
            playbackIdRef.current += 1;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
            }
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const stopAudio = () => {
        playbackIdRef.current += 1;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = "";
        }
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }
        setActiveSpeaker(null);
    };

    const stopRecognition = (mode = "abort") => {
        if (recognitionRef.current) {
            if (mode === "abort") {
                recognitionRef.current.onend = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.onresult = null;
                recognitionRef.current.abort();
                recognitionLineRef.current = null;
                speechDraftRef.current = "";
                speechStopRequestedRef.current = false;
                recognitionRef.current = null;
                setListeningIndex(null);
            } else {
                speechStopRequestedRef.current = true;
                recognitionRef.current.stop();
            }
        }
    };

    const finalizeSpeechRecognition = (lineIndex, transcript, error = "") => {
        const trimmedTranscript = transcript.trim();
        const matched = trimmedTranscript ? judgeAnswer(trimmedTranscript, promptLines[lineIndex].pt) : null;

        setSpeechResults((prev) =>
            prev.map((entry, index) =>
                index === lineIndex
                    ? {
                        ...entry,
                        transcript: trimmedTranscript,
                        matched,
                        error,
                        revealAnswer: true,
                    }
                    : entry
            )
        );
    };

    const resetPerQuestionState = (lines) => {
        setShowAnswer(false);
        setShowComment(false);
        setTypedAnswers(lines.map(() => ""));
        setSpeechResults(lines.map(() => ({ transcript: "", matched: null, error: "", revealAnswer: false })));
        stopAudio();
        stopRecognition();
    };

    const startSession = () => {
        const nextDeck = shuffleIndices().slice(0, selectedQuestionCount);
        const firstItem = DATA[nextDeck[0]];
        setSessionDeck(nextDeck);
        setCurrentPosition(0);
        setSessionActive(true);
        resetPerQuestionState(buildPromptLines(firstItem));
    };

    const leaveSession = () => {
        setSessionActive(false);
        setCurrentPosition(0);
        setSessionDeck([]);
        stopAudio();
        stopRecognition();
        setShowAnswer(false);
        setShowComment(false);
        setTypedAnswers([]);
        setSpeechResults([]);
    };

    const moveToPosition = (nextPosition) => {
        const item = DATA[sessionDeck[nextPosition]];
        setCurrentPosition(nextPosition);
        setSwipeOffset(0);
        setSwipeActive(false);
        resetPerQuestionState(buildPromptLines(item));
    };

    const nextCard = () => {
        if (!sessionDeck.length) return;
        const nextPosition = (currentPosition + 1) % sessionDeck.length;
        moveToPosition(nextPosition);
    };

    const prevCard = () => {
        if (!sessionDeck.length) return;
        const nextPosition = (currentPosition - 1 + sessionDeck.length) % sessionDeck.length;
        moveToPosition(nextPosition);
    };

    const currentIndex = sessionDeck[currentPosition];
    const currentItem = currentIndex == null ? null : DATA[currentIndex];
    const promptLines = currentItem ? buildPromptLines(currentItem) : [];

    const synthesizeSpeech = async (text, voiceName) => {
        const response = await fetch("/api/tts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text,
                voiceName,
            }),
        });

        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.error || `Azure TTS request failed with status ${response.status}`);
        }

        return response.blob();
    };

    const playSpeech = async (text, voiceName, speakerIndex) => {
        if (!text) return;

        const playbackId = playbackIdRef.current + 1;
        playbackIdRef.current = playbackId;
        stopAudio();
        playbackIdRef.current = playbackId;
        setActiveSpeaker(speakerIndex);

        try {
            const blob = await synthesizeSpeech(text, voiceName);
            if (playbackIdRef.current !== playbackId) return;

            const url = URL.createObjectURL(blob);
            audioUrlRef.current = url;

            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => {
                if (playbackIdRef.current === playbackId) {
                    setActiveSpeaker(null);
                }
            };
            await audio.play();
        } catch (error) {
            if (playbackIdRef.current === playbackId) {
                setActiveSpeaker(null);
            }
        }
    };

    const toggleAnswer = () => {
        if (selectedMode !== "review") return;
        setShowAnswer((prev) => !prev);
    };

    const updateTypedAnswer = (lineIndex, value) => {
        setTypedAnswers((prev) => prev.map((entry, index) => (index === lineIndex ? value : entry)));
    };

    const judgeAnswer = (userAnswer, correctAnswer) => {
        const normalizedUser = normalizeText(userAnswer);
        if (!normalizedUser) return false;
        return expandAnswerVariants(correctAnswer).includes(normalizedUser);
    };

    const startSpeechRecognition = (lineIndex) => {
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Recognition) return;

        if (listeningIndex === lineIndex) {
            stopRecognition("stop");
            return;
        }

        stopRecognition();

        const recognition = new Recognition();
        recognition.lang = "pt-pt";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;
        recognitionLineRef.current = lineIndex;
        speechDraftRef.current = "";
        speechStopRequestedRef.current = false;
        setListeningIndex(lineIndex);
        setSpeechResults((prev) =>
            prev.map((entry, index) =>
                index === lineIndex
                    ? { ...entry, transcript: "", matched: null, error: "" }
                    : entry
            )
        );

        recognition.onresult = (event) => {
            const latestTranscript = Array.from(event.results)
                .map((result) => result[0]?.transcript ?? "")
                .join(" ")
                .trim();

            speechDraftRef.current = latestTranscript;

            const finalTranscript = Array.from(event.results)
                .filter((result) => result.isFinal)
                .map((result) => result[0]?.transcript ?? "")
                .join(" ")
                .trim();

            if (!finalTranscript) return;

            stopRecognition();
            finalizeSpeechRecognition(lineIndex, finalTranscript);
        };

        recognition.onerror = () => {
            finalizeSpeechRecognition(lineIndex, speechDraftRef.current, "音声入力に失敗しました。もう一度試してください。");
            recognitionLineRef.current = null;
            speechDraftRef.current = "";
            speechStopRequestedRef.current = false;
            recognitionRef.current = null;
            setListeningIndex(null);
        };

        recognition.onend = () => {
            const stoppedLineIndex = recognitionLineRef.current;
            if (speechStopRequestedRef.current && stoppedLineIndex != null) {
                finalizeSpeechRecognition(stoppedLineIndex, speechDraftRef.current);
            }
            recognitionRef.current = null;
            recognitionLineRef.current = null;
            speechDraftRef.current = "";
            speechStopRequestedRef.current = false;
            setListeningIndex(null);
        };

        recognition.start();
    };

    const checkTypedAnswers = () => {
        setShowAnswer(true);
    };

    const swipeHandlers = useSwipeable({
        trackMouse: true,
        trackTouch: true,
        preventScrollOnSwipe: true,
        delta: 50,
        onSwipeStart: () => {
            setSwipeActive(true);
        },
        onSwiping: ({ deltaX, deltaY }) => {
            if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
            const limitedOffset = Math.max(-96, Math.min(96, deltaX));
            setSwipeActive(true);
            setSwipeOffset(limitedOffset);
        },
        onSwipedLeft: () => {
            setSwipeOffset(0);
            setSwipeActive(false);
            nextCard();
        },
        onSwipedRight: () => {
            setSwipeOffset(0);
            setSwipeActive(false);
            prevCard();
        },
        onSwiped: () => {
            setSwipeOffset(0);
            setSwipeActive(false);
        },
    });

    const renderJapanesePrompt = () => {
        if (!currentItem) return null;

        if (currentItem.jp2) {
            return (
                <div className="mt-4 space-y-2">
                    <div className="max-w-[88%] rounded-[28px] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                        <p className="text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl">
                            {currentItem.jp1}
                        </p>
                    </div>
                    <div className="ml-auto max-w-[88%] rounded-[28px] bg-emerald-950 px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.10)]">
                        <p className="text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl">
                            {currentItem.jp2}
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="mt-3">
                <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
                    {currentItem.jp1}
                </h1>
            </div>
        );
    };

    const renderReviewMode = () => (
        <div className="space-y-3">
            {promptLines.map((line, index) => (
                <div
                    key={`${currentIndex}-${index}-review`}
                    className={`flex items-center gap-4 rounded-[24px] border px-4 py-4 transition-all ${activeSpeaker === index ? "border-emerald-300 bg-emerald-50" : "border-stone-200 bg-stone-50"}`}
                >
                    <div className="min-w-0 flex-1">
                        <p className="mt-1 text-2xl font-semibold leading-tight text-slate-900">
                            {showAnswer ? line.pt : "••••••••••"}
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="音声を再生"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (showAnswer) {
                                playSpeech(line.pt, index === 0 ? voiceA : voiceB, index);
                            }
                        }}
                        className={`rounded-2xl p-3 transition-colors ${activeSpeaker === index ? "bg-emerald-700 text-white" : "bg-white text-slate-500 hover:bg-stone-100"}`}
                    >
                        <Volume2 size={18} />
                    </button>
                </div>
            ))}
        </div>
    );

    const renderTypedMode = () => (
        <div className="space-y-3">
            {promptLines.map((line, index) => {
                const matched = showAnswer ? judgeAnswer(typedAnswers[index], line.pt) : null;

                return (
                    <div key={`${currentIndex}-${index}-typed`} className="rounded-[24px] border border-stone-200 bg-stone-50 p-4">
                        <textarea
                            value={typedAnswers[index] ?? ""}
                            onChange={(e) => updateTypedAnswer(index, e.target.value)}
                            placeholder="ここにポルトガル語を入力"
                            className="h-24 w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-lg font-medium text-slate-900 outline-none transition-colors focus:border-emerald-400"
                        />
                        {showAnswer && (
                            <div className={`mt-3 rounded-2xl px-4 py-3 text-sm ${matched ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-950"}`}>
                                <p className="font-bold">{matched ? "正解" : "確認"}</p>
                                <p className="mt-1">{line.pt}</p>
                            </div>
                        )}
                    </div>
                );
            })}
            <button
                type="button"
                onClick={checkTypedAnswers}
                className="w-full rounded-[22px] bg-slate-900 px-4 py-4 text-base font-black text-white"
            >
                答え合わせ
            </button>
        </div>
    );

    const renderSpeechMode = () => (
        <div className="space-y-3">
            {!speechSupported && (
                <div className="rounded-[24px] bg-amber-100 px-4 py-3 text-sm text-amber-950">
                    このブラウザでは音声入力が使えません。
                </div>
            )}
            {promptLines.map((line, index) => {
                const result = speechResults[index] ?? { transcript: "", matched: null, error: "", revealAnswer: false };

                return (
                    <div key={`${currentIndex}-${index}-speech`} className="rounded-[24px] border border-stone-200 bg-stone-50 p-4">
                        <button
                            type="button"
                            disabled={!speechSupported}
                            onClick={() => startSpeechRecognition(index)}
                            className={`flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-base font-black ${listeningIndex === index ? "bg-rose-600 text-white" : "bg-slate-900 text-white"} disabled:bg-stone-300 disabled:text-stone-500`}
                        >
                            <Mic size={20} />
                            {listeningIndex === index ? "停止" : "音声入力"}
                        </button>

                        {(result.transcript || result.error || result.revealAnswer) && (
                            <div className="mt-3 space-y-2 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
                                {result.transcript && (
                                    <p>
                                        <span className="font-bold">認識結果:</span> {result.transcript}
                                    </p>
                                )}
                                {result.matched != null && (
                                    <p className={result.matched ? "font-bold text-emerald-700" : "font-bold text-amber-700"}>
                                        {result.matched ? "正解" : "一致しません"}
                                    </p>
                                )}
                                {result.error && <p className="font-bold text-rose-700">{result.error}</p>}
                                {result.revealAnswer && <p><span className="font-bold">答え:</span> {line.pt}</p>}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    if (!sessionActive) {
        return (
            <div className="min-h-screen bg-stone-100 text-slate-900">
                <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-6 sm:px-6">
                    <main className="rounded-[36px] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-8">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-700">Portuguese study</p>
                        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                            学習モードを選ぶ
                        </h1>
                        <p className="mt-3 text-base leading-7 text-slate-600">
                            問題形式と問題数を選んでから開始します。
                        </p>

                        <section className="mt-8">
                            <p className="mb-3 text-sm font-bold text-slate-700">問題形式</p>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {MODE_OptIONS.map((mode) => (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        onClick={() => setSelectedMode(mode.id)}
                                        className={`rounded-[24px] border px-4 py-5 text-left transition-colors ${selectedMode === mode.id ? "border-emerald-500 bg-emerald-50" : "border-stone-200 bg-stone-50 hover:bg-stone-100"}`}
                                    >
                                        <p className="text-lg font-black text-slate-900">{mode.label}</p>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">{mode.description}</p>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="mt-8">
                            <p className="mb-3 text-sm font-bold text-slate-700">問題数</p>
                            <div className="flex gap-3">
                                {QUESTION_COUNT_OptIONS.map((count) => (
                                    <button
                                        key={count}
                                        type="button"
                                        onClick={() => setSelectedQuestionCount(count)}
                                        className={`rounded-full px-5 py-3 text-sm font-bold transition-colors ${selectedQuestionCount === count ? "bg-slate-900 text-white" : "bg-stone-100 text-slate-700 hover:bg-stone-200"}`}
                                    >
                                        {count === DATA.length ? `全${DATA.length}問` : `${count}問`}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <button
                            type="button"
                            onClick={startSession}
                            className="mt-10 w-full rounded-[26px] bg-emerald-500 px-6 py-5 text-lg font-black text-slate-950 shadow-[0_16px_35px_rgba(16,185,129,0.28)]"
                        >
                            この設定で始める
                        </button>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100 text-slate-900 select-none">
            <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-4 sm:px-6">
                <main className="flex w-full flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                            {currentPosition + 1} / {sessionDeck.length}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={leaveSession}
                                className="rounded-2xl border border-stone-200 bg-white p-3 text-slate-400 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-colors hover:text-slate-700"
                            >
                                <RotateCcw size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowSettings(true)}
                                className="rounded-2xl border border-stone-200 bg-white p-3 text-slate-400 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-colors hover:text-slate-700"
                            >
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>

                    <section
                        {...swipeHandlers}
                        className="min-w-0 flex-1 overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)] [touch-action:pan-y]"
                    >
                        <div
                            onClick={toggleAnswer}
                            className={selectedMode === "review" ? "relative cursor-pointer outline-none focus:outline-none" : "relative outline-none focus:outline-none"}
                            role={selectedMode === "review" ? "button" : undefined}
                            tabIndex={selectedMode === "review" ? 0 : undefined}
                            onKeyDown={(e) => {
                                if (selectedMode === "review" && (e.key === "Enter" || e.key === " ")) {
                                    e.preventDefault();
                                    toggleAnswer();
                                }
                            }}
                            style={{
                                transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.03}deg)`,
                                transition: swipeActive ? "none" : "transform 220ms ease",
                            }}
                        >
                            <div
                                className={`absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-emerald-100/80 to-transparent transition-opacity ${
                                    swipeOffset > 12 ? "opacity-100" : "opacity-0"
                                }`}
                            />
                            <div
                                className={`absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-sky-100/80 to-transparent transition-opacity ${
                                    swipeOffset < -12 ? "opacity-100" : "opacity-0"
                                }`}
                            />
                                <div className="border-b border-stone-200 bg-[linear-gradient(135deg,#f7f4ec_0%,#ffffff_48%,#eef6f1_100%)] px-5 py-5 sm:px-6">
                                    {renderJapanesePrompt()}
                                </div>

                                <div className="px-5 py-5 sm:px-6">
                                {selectedMode === "review" && (
                                    <p className="mb-4 text-center text-sm font-semibold text-slate-400">
                                        カードをタップして答えを{showAnswer ? "隠す" : "表示"}
                                    </p>
                                )}
                                {selectedMode === "typed" && (
                                    <p className="mb-4 text-center text-sm font-semibold text-slate-400">
                                        ポルトガル語を入力して答え合わせ
                                    </p>
                                )}
                                {selectedMode === "speech" && (
                                    <p className="mb-4 text-center text-sm font-semibold text-slate-400">
                                        音声入力して発話を判定
                                    </p>
                                )}

                                {selectedMode === "review" && renderReviewMode()}
                                {selectedMode === "typed" && renderTypedMode()}
                                {selectedMode === "speech" && renderSpeechMode()}

                                <div className="mt-4 min-h-[72px]">
                                    {!!currentItem?.comment ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowComment((prev) => !prev);
                                            }}
                                            className="block h-[72px] w-full rounded-[20px] bg-stone-100 px-4 text-left text-sm text-slate-600"
                                        >
                                            <div className="flex h-full items-center justify-center">
                                                {showAnswer || showComment ? (
                                                    <span className="w-full text-left leading-relaxed">{currentItem.comment}</span>
                                                ) : (
                                                    <span className="font-semibold text-slate-400">ヒントを見る</span>
                                                )}
                                            </div>
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {showSettings && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
                        <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-xl font-bold">
                                    <Settings className="text-indigo-600" /> Settings
                                </h3>
                                <button type="button" onClick={() => setShowSettings(false)} className="rounded-full bg-slate-100 p-2 text-slate-500">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 space-y-6 overflow-y-auto">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-indigo-600">Speaker A Voice</label>
                                    <div className="grid gap-2">
                                        {AZURE_VOICES.map((voice) => (
                                            <button
                                                key={`a-${voice.shortName}`}
                                                type="button"
                                                onClick={() => setVoiceA(voice.shortName)}
                                                className={`flex items-center justify-between rounded-xl border-2 p-3 text-left ${voiceA === voice.shortName ? "border-indigo-500 bg-indigo-50" : "border-slate-100"}`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">{voice.label}</span>
                                                    <span className="text-[10px] uppercase text-slate-400">{voice.lang} / {voice.gender}</span>
                                                </div>
                                                {voiceA === voice.shortName && <Check size={18} className="text-indigo-600" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-emerald-600">Speaker B Voice</label>
                                    <div className="grid gap-2">
                                        {AZURE_VOICES.map((voice) => (
                                            <button
                                                key={`b-${voice.shortName}`}
                                                type="button"
                                                onClick={() => setVoiceB(voice.shortName)}
                                                className={`flex items-center justify-between rounded-xl border-2 p-3 text-left ${voiceB === voice.shortName ? "border-emerald-500 bg-emerald-50" : "border-slate-100"}`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">{voice.label}</span>
                                                    <span className="text-[10px] uppercase text-slate-400">{voice.lang} / {voice.gender}</span>
                                                </div>
                                                {voiceB === voice.shortName && <Check size={18} className="text-emerald-600" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button type="button" onClick={() => setShowSettings(false)} className="mt-6 w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
