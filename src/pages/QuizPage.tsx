import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { collections } from '../data/collections';
import SEO from '../components/SEO';

interface QuizOption {
    label: string;
    collectionIndex: number;
}

interface QuizQuestion {
    question: string;
    options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
    {
        question: '당신의 아침을 향으로 표현한다면?',
        options: [
            { label: '달콤하고 포근한 느낌', collectionIndex: 0 },
            { label: '깨끗하고 편안한 느낌', collectionIndex: 1 },
            { label: '차분하고 깊은 느낌', collectionIndex: 2 },
        ],
    },
    {
        question: '가장 끌리는 계절은?',
        options: [
            { label: '따스한 봄, 활기찬 여름', collectionIndex: 0 },
            { label: '선선한 초가을, 맑은 날씨', collectionIndex: 1 },
            { label: '깊어가는 가을, 고요한 겨울', collectionIndex: 2 },
        ],
    },
    {
        question: '오늘 나에게 필요한 무드는?',
        options: [
            { label: '사랑스럽고 다정한 위로', collectionIndex: 0 },
            { label: '군더더기 없는 편안함', collectionIndex: 1 },
            { label: '조용히 몰입되는 신비로움', collectionIndex: 2 },
        ],
    },
    {
        question: '향수를 고를 때 가장 중요한 건?',
        options: [
            { label: '스치는 순간의 강한 첫인상', collectionIndex: 0 },
            { label: '은은하게 오래가는 잔향', collectionIndex: 1 },
            { label: '깊이 있게 남는 여운', collectionIndex: 2 },
        ],
    },
];

export default function QuizPage() {
    const [step, setStep] = useState(0);
    const [scores, setScores] = useState<Record<number, number>>({});
    const [resultIndex, setResultIndex] = useState<number | null>(null);

    const handleAnswer = (collectionIndex: number) => {
        const next = { ...scores, [collectionIndex]: (scores[collectionIndex] ?? 0) + 1 };
        setScores(next);

        if (step + 1 < QUESTIONS.length) {
            setStep(step + 1);
        } else {
            const topIndex = Number(
                Object.entries(next).sort((a, b) => b[1] - a[1])[0][0]
            );
            setResultIndex(topIndex);
        }
    };

    const restart = () => {
        setStep(0);
        setScores({});
        setResultIndex(null);
    };

    const matched = useMemo(
        () => (resultIndex !== null ? collections[resultIndex] : null),
        [resultIndex]
    );
    const firstProduct = matched?.products?.[0];

    if (matched) {
        return (
            <div className="pt-20 min-h-screen pb-24">
                <SEO
                    title="향 추천 퀴즈 결과"
                    description={`당신에게 어울리는 향은 ${matched.name}입니다.`}
                    image={matched.heroImage}
                />
                <div className="max-w-[600px] mx-auto px-6 pt-16 text-center">
                    <p className="font-pretendard font-light text-[13px] tracking-[0.3em] text-muted-foreground uppercase mb-4">
                        당신에게 어울리는 향
                    </p>
                    <div className="relative aspect-[4/5] rounded-[20px] overflow-hidden bg-[#f5f3f0] mb-8">
                        <img src={matched.heroImage} alt={matched.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="font-pretendard text-[16px] text-foreground mb-1">{matched.koreanName}</p>
                    <h1 className="font-cormorant text-[44px] font-normal text-foreground mb-6">{matched.name}</h1>
                    {matched.description.map((line, i) => (
                        <p key={i} className="font-pretendard font-light text-[14px] leading-loose text-foreground/75">
                            {line}
                        </p>
                    ))}
                    <div className="flex gap-3 justify-center mt-5 mb-10 flex-wrap">
                        {matched.tags.map((tag) => (
                            <span key={tag} className="font-pretendard text-[12px] text-muted-foreground">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-4 justify-center flex-wrap">
                        {firstProduct && (
                            <Link
                                to={`/collection/${firstProduct.id}`}
                                className="font-pretendard font-light text-[12px] tracking-[0.25em] text-background bg-foreground px-8 py-4 hover:bg-foreground/85 transition-all duration-300"
                            >
                                이 향수 보러가기
                            </Link>
                        )}
                        <Link
                            to="/collection"
                            className="font-pretendard font-light text-[12px] tracking-[0.25em] text-foreground border border-foreground px-8 py-4 hover:bg-foreground hover:text-background transition-all duration-300"
                        >
                            전체 컬렉션 보기
                        </Link>
                        <button
                            onClick={restart}
                            className="font-pretendard font-light text-[12px] tracking-[0.25em] text-muted-foreground border border-border px-8 py-4 hover:border-foreground hover:text-foreground transition-all duration-300"
                        >
                            다시 하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const question = QUESTIONS[step];

    return (
        <div className="pt-20 min-h-screen pb-24">
            <SEO title="향 추천 퀴즈" description="몇 가지 질문으로 나에게 어울리는 AERHER 향수를 찾아보세요." />
            <div className="max-w-[600px] mx-auto px-6 pt-16">
                <div
                    className="flex items-center gap-2 mb-10"
                    role="progressbar"
                    aria-valuenow={step + 1}
                    aria-valuemin={1}
                    aria-valuemax={QUESTIONS.length}
                    aria-label={`${step + 1} / ${QUESTIONS.length} 단계`}
                >
                    {QUESTIONS.map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 h-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-foreground' : 'bg-border'
                                }`}
                        />
                    ))}
                </div>

                <p className="font-pretendard font-light text-[12px] tracking-[0.3em] text-muted-foreground uppercase mb-4">
                    Q{step + 1}
                </p>
                <h1 className="font-cormorant text-[32px] md:text-[38px] font-normal text-foreground mb-10 leading-snug">
                    {question.question}
                </h1>

                <div className="flex flex-col gap-3">
                    {question.options.map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => handleAnswer(opt.collectionIndex)}
                            className="text-left font-pretendard font-light text-[15px] text-foreground border border-border px-6 py-5 hover:border-foreground hover:bg-foreground/5 transition-all duration-200"
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}