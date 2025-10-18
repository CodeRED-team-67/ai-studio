
import React, { useState, useCallback, useEffect } from 'react';
import { Course, GameState, Lesson, Quiz, FillInTheBlank, ScrambledSentence } from './types';
import { generateCourseFromContent } from './services/geminiService';
import { Sprite, SpriteMood } from './components/Sprite';
import { ArrowRightIcon, RefreshCwIcon, SparklesIcon } from './components/icons';
import { ProgressBar } from './components/ProgressBar';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
    const [courseContent, setCourseContent] = useState<string>('');
    const [generatedCourse, setGeneratedCourse] = useState<Course | null>(null);
    const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
    const [error, setError] = useState<string>('');
    const [spriteMood, setSpriteMood] = useState<SpriteMood>('idle');
    
    // State for all games
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null); // For Quiz
    const [fillInBlankAnswer, setFillInBlankAnswer] = useState(''); // For FillInTheBlank
    const [scrambledBank, setScrambledBank] = useState<string[]>([]); // For ScrambledSentence
    const [scrambledAnswer, setScrambledAnswer] = useState<string[]>([]); // For ScrambledSentence
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    const handleGenerateCourse = useCallback(async () => {
        if (!courseContent.trim()) {
            setError('Please enter some content to create a course.');
            setGameState(GameState.ERROR);
            return;
        }
        setGameState(GameState.GENERATING);
        setError('');
        setSpriteMood('thinking');
        try {
            const course = await generateCourseFromContent(courseContent);
            setGeneratedCourse(course);
            setCurrentLessonIndex(0);
            setGameState(GameState.IN_COURSE);
            setSpriteMood('happy');
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setGameState(GameState.ERROR);
            setSpriteMood('idle');
        }
    }, [courseContent]);

    const resetAllGameStates = () => {
        setSelectedAnswer(null);
        setFeedbackMessage(null);
        setFillInBlankAnswer('');
        setScrambledBank([]);
        setScrambledAnswer([]);
    };

    const handleNext = () => {
        resetAllGameStates();
        if (currentLessonIndex < (generatedCourse?.lessons.length ?? 0) - 1) {
            setCurrentLessonIndex(prev => prev + 1);
            setSpriteMood('talking');
        } else {
            setGameState(GameState.COMPLETED);
            setSpriteMood('happy');
        }
    };

    const handleCheckAnswer = () => {
        const lesson = generatedCourse?.lessons[currentLessonIndex];
        if (!lesson) return;

        let isCorrect = false;
        let feedback = '';

        if (lesson.quiz && selectedAnswer) {
            isCorrect = selectedAnswer === lesson.quiz.correctAnswer;
            feedback = isCorrect ? 'Correct! Well done!' : `Not quite! The correct answer was: ${lesson.quiz.correctAnswer}`;
        } else if (lesson.fillInTheBlank) {
            isCorrect = fillInBlankAnswer.trim().toLowerCase() === lesson.fillInTheBlank.correctAnswer.toLowerCase();
            feedback = isCorrect ? "That's right! Excellent!" : `Good try! The correct answer is: ${lesson.fillInTheBlank.correctAnswer}`;
        } else if (lesson.scrambledSentence) {
            isCorrect = scrambledAnswer.join(' ') === lesson.scrambledSentence.correctSentence;
            feedback = isCorrect ? 'Perfect! You unscrambled it!' : `Almost! The correct sentence is: "${lesson.scrambledSentence.correctSentence}"`;
        }

        setFeedbackMessage(feedback);
        setSpriteMood(isCorrect ? 'happy' : 'thinking');
    };

    const handleRestart = () => {
        setGameState(GameState.IDLE);
        setCourseContent('');
        setGeneratedCourse(null);
        setCurrentLessonIndex(0);
        setError('');
        setSpriteMood('idle');
        resetAllGameStates();
    };
    
    const currentLesson = generatedCourse?.lessons[currentLessonIndex];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-indigo-100">
            <main className="w-full max-w-4xl bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-200/50 overflow-hidden border border-slate-200">
                {gameState === GameState.IDLE && <CourseInputScreen onGenerate={handleGenerateCourse} setContent={setCourseContent} content={courseContent} />}
                
                {gameState === GameState.GENERATING && <LoadingScreen />}

                {(gameState === GameState.IN_COURSE || gameState === GameState.COMPLETED) && generatedCourse && (
                    <TutorScreen
                        course={generatedCourse}
                        lesson={currentLesson}
                        lessonIndex={currentLessonIndex}
                        onNext={handleNext}
                        onRestart={handleRestart}
                        onCheckAnswer={handleCheckAnswer}
                        feedbackMessage={feedbackMessage}
                        isCompleted={gameState === GameState.COMPLETED}
                        spriteMood={spriteMood}
                        // Game-specific props
                        selectedAnswer={selectedAnswer}
                        setSelectedAnswer={setSelectedAnswer}
                        fillInBlankAnswer={fillInBlankAnswer}
                        setFillInBlankAnswer={setFillInBlankAnswer}
                        scrambledBank={scrambledBank}
                        setScrambledBank={setScrambledBank}
                        scrambledAnswer={scrambledAnswer}
                        setScrambledAnswer={setScrambledAnswer}
                    />
                )}
                
                {gameState === GameState.ERROR && <ErrorScreen error={error} onRestart={handleRestart} />}

            </main>
            <footer className="text-center mt-6 text-sm text-slate-500">
                <p>Powered by Gemini. Created with passion.</p>
            </footer>
        </div>
    );
};

const CourseInputScreen: React.FC<{onGenerate: () => void, setContent: (c: string) => void, content: string}> = ({ onGenerate, setContent, content }) => (
    <div className="p-8 md:p-12 flex flex-col items-center text-center">
        <div className="w-24 h-24 mb-4">
            <Sprite mood="happy" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Welcome to your AI Tutor!</h1>
        <p className="text-slate-600 mb-6 max-w-xl">Paste your study material below, and I'll create a fun, interactive course for you.</p>
        <textarea
            className="w-full h-48 p-4 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-300 resize-none mb-4"
            placeholder="For example: Photosynthesis is a process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <button
            onClick={onGenerate}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
            <SparklesIcon className="w-5 h-5" />
            Generate Course
        </button>
    </div>
);

const LoadingScreen: React.FC = () => (
    <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-32 h-32 mb-4">
            <Sprite mood="thinking" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-700 animate-pulse">Crafting your course...</h2>
        <p className="text-slate-500 mt-2">The AI is working its magic!</p>
    </div>
);

const ErrorScreen: React.FC<{error: string, onRestart: () => void}> = ({ error, onRestart }) => (
     <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-32 h-32 mb-4">
            <Sprite mood="idle" />
        </div>
        <h2 className="text-2xl font-bold text-red-600">Oops! Something went wrong.</h2>
        <p className="text-slate-600 my-4 max-w-md">{error}</p>
        <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-all"
        >
            <RefreshCwIcon className="w-5 h-5" />
            Try Again
        </button>
    </div>
);

// Minigame Components
const QuizComponent: React.FC<{ quiz: Quiz; selectedAnswer: string | null; setSelectedAnswer: (a: string) => void; isAnswered: boolean; }> = 
({ quiz, selectedAnswer, setSelectedAnswer, isAnswered }) => (
    <div>
        <p className="font-semibold text-lg mb-3">{quiz.question}</p>
        <div className="space-y-2">
            {quiz.options.map((option) => (
                <button
                    key={option}
                    onClick={() => !isAnswered && setSelectedAnswer(option)}
                    disabled={isAnswered}
                    className={`w-full text-left p-3 border-2 rounded-lg transition-all ${
                        selectedAnswer === option
                            ? 'border-indigo-500 bg-indigo-100 ring-2 ring-indigo-300'
                            : 'border-slate-200 bg-white hover:bg-slate-100'
                    } ${isAnswered ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

const FillInTheBlankComponent: React.FC<{ game: FillInTheBlank; answer: string; setAnswer: (a: string) => void; isAnswered: boolean; }> = 
({ game, answer, setAnswer, isAnswered }) => (
    <div>
        <p className="text-slate-700 mb-4 text-lg leading-relaxed">{game.sentence.split('___')[0]}
            <input 
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={isAnswered}
                className="inline-block w-36 mx-2 px-2 py-1 border-b-2 border-indigo-300 focus:border-indigo-500 focus:outline-none bg-transparent"
                placeholder="type here"
            />
        {game.sentence.split('___')[1]}</p>
    </div>
);

const ScrambledSentenceComponent: React.FC<{ game: ScrambledSentence; bank: string[]; setBank: (b: string[])=>void; answer: string[]; setAnswer: (a: string[])=>void; isAnswered: boolean; }> =
({ game, bank, setBank, answer, setAnswer, isAnswered }) => {
    
    useEffect(() => {
        setBank(game.scrambled.sort(() => Math.random() - 0.5));
        setAnswer([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game]);

    const selectWord = (word: string, index: number) => {
        if(isAnswered) return;
        setBank(prev => prev.filter((_, i) => i !== index));
        setAnswer(prev => [...prev, word]);
    };
    
    const deselectWord = (word: string, index: number) => {
        if(isAnswered) return;
        setAnswer(prev => prev.filter((_, i) => i !== index));
        setBank(prev => [...prev, word]);
    };
    
    return (
        <div>
            <p className="font-semibold text-lg mb-3">Unscramble this sentence!</p>
            <div className="min-h-[4rem] p-3 mb-3 bg-white border-2 border-slate-200 rounded-lg flex flex-wrap gap-2">
                {answer.map((word, index) => (
                    <button key={`${word}-${index}`} onClick={() => deselectWord(word, index)} className="px-3 py-1 bg-indigo-500 text-white rounded-md shadow-sm">{word}</button>
                ))}
                {!answer.length && <span className="text-slate-400">Click words below to build your sentence here...</span>}
            </div>
             <div className="p-3 bg-slate-100 rounded-lg flex flex-wrap gap-2">
                {bank.map((word, index) => (
                     <button key={`${word}-${index}`} onClick={() => selectWord(word, index)} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md">{word}</button>
                ))}
            </div>
        </div>
    );
};

// Main Tutor Screen
interface TutorScreenProps {
    course: Course;
    lesson?: Lesson;
    lessonIndex: number;
    onNext: () => void;
    onRestart: () => void;
    onCheckAnswer: () => void;
    feedbackMessage: string | null;
    isCompleted: boolean;
    spriteMood: SpriteMood;
    // Game state props
    selectedAnswer: string | null;
    setSelectedAnswer: (answer: string) => void;
    fillInBlankAnswer: string;
    setFillInBlankAnswer: (answer: string) => void;
    scrambledBank: string[];
    setScrambledBank: (bank: string[]) => void;
    scrambledAnswer: string[];
    setScrambledAnswer: (answer: string[]) => void;
}

const TutorScreen: React.FC<TutorScreenProps> = (props) => {
    const { course, lesson, lessonIndex, onNext, onRestart, onCheckAnswer, feedbackMessage, isCompleted, spriteMood } = props;

    if (isCompleted) {
        return (
            <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
                <div className="w-32 h-32 mb-4">
                    <Sprite mood="happy" />
                </div>
                <h2 className="text-3xl font-bold text-indigo-600">Course Complete!</h2>
                <p className="text-slate-600 my-4">You did an amazing job finishing the "{course.title}" course!</p>
                <button
                    onClick={onRestart}
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all"
                >
                    <RefreshCwIcon className="w-5 h-5" />
                    Start a New Course
                </button>
            </div>
        );
    }
    
    if (!lesson) return null;

    const isGameMode = !!lesson.quiz || !!lesson.fillInTheBlank || !!lesson.scrambledSentence;
    const isAnswered = !!feedbackMessage;
    
    let isCheckButtonDisabled = true;
    if (lesson.quiz) isCheckButtonDisabled = !props.selectedAnswer;
    if (lesson.fillInTheBlank) isCheckButtonDisabled = !props.fillInBlankAnswer.trim();
    if (lesson.scrambledSentence) isCheckButtonDisabled = props.scrambledAnswer.length === 0;

    return (
        <div className="p-6 md:p-8">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-center mb-2">{course.title}</h1>
                <ProgressBar current={lessonIndex + 1} total={course.lessons.length} />
                <p className="text-center text-sm text-slate-500 mt-2">Lesson {lessonIndex + 1} of {course.lessons.length}</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col items-center">
                    <div className="w-40 h-40 md:w-48 md:h-48">
                        <Sprite mood={spriteMood} />
                    </div>
                </div>
                <div className="md:col-span-2 bg-indigo-50/50 p-6 rounded-lg border border-indigo-200">
                    <h2 className="text-xl font-semibold mb-3">{lesson.title}</h2>
                    <p className="text-slate-700 whitespace-pre-wrap mb-4">{lesson.content}</p>
                    
                    {isGameMode && <div className="border-t border-indigo-200 my-4"></div>}

                    {lesson.quiz && <QuizComponent quiz={lesson.quiz} selectedAnswer={props.selectedAnswer} setSelectedAnswer={props.setSelectedAnswer} isAnswered={isAnswered} />}
                    {lesson.fillInTheBlank && <FillInTheBlankComponent game={lesson.fillInTheBlank} answer={props.fillInBlankAnswer} setAnswer={props.setFillInBlankAnswer} isAnswered={isAnswered} />}
                    {lesson.scrambledSentence && <ScrambledSentenceComponent game={lesson.scrambledSentence} bank={props.scrambledBank} setBank={props.setScrambledBank} answer={props.scrambledAnswer} setAnswer={props.setScrambledAnswer} isAnswered={isAnswered}/>}

                    {feedbackMessage && (
                        <p className={`mt-4 font-semibold ${feedbackMessage.startsWith('Correct') || feedbackMessage.startsWith('That\'s') || feedbackMessage.startsWith('Perfect') ? 'text-green-600' : 'text-red-600'}`}>{feedbackMessage}</p>
                    )}
                </div>
            </div>
            <footer className="mt-6 flex justify-end">
                {isGameMode && !isAnswered && (
                     <button
                        onClick={onCheckAnswer}
                        disabled={isCheckButtonDisabled}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        Check Answer
                    </button>
                )}
                 {(!isGameMode || isAnswered) && (
                    <button
                        onClick={onNext}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all transform hover:scale-105"
                    >
                        {lessonIndex === course.lessons.length - 1 ? 'Finish Course' : 'Next'}
                        <ArrowRightIcon className="w-5 h-5" />
                    </button>
                 )}
            </footer>
        </div>
    );
};


export default App;
