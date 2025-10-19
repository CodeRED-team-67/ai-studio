// FIX: Replaced placeholder content with a full App component implementation.
// This component is exported as a default module, fixing the error in index.tsx.
import React, { useState, useEffect, useMemo } from 'react';
import { fetchSubjects, fetchCourses, fetchCourseDetails } from './services/apiService';
import { explainCourse, suggestPrerequisites } from './services/geminiService';
import { Subject, CourseSummary, CourseDetails } from './types';
import { LoadingSpinner, BackIcon, SearchIcon, BrainIcon, InfoIcon } from './components/icons';
import { Sprite } from './components/Sprite';

type View = 'subjects' | 'courses' | 'details';

const App: React.FC = () => {
    const [view, setView] = useState<View>('subjects');
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [courses, setCourses] = useState<CourseSummary[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<CourseSummary | null>(null);
    const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [geminiExplanation, setGeminiExplanation] = useState('');
    const [geminiPrereqAdvice, setGeminiPrereqAdvice] = useState('');
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);

    useEffect(() => {
        const loadSubjects = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchSubjects();
                setSubjects(data);
            } catch (err) {
                setError('Failed to load subjects. Please check your connection and try again.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadSubjects();
    }, []);

    const handleSelectSubject = async (subject: Subject) => {
        setSelectedSubject(subject);
        setView('courses');
        setIsLoading(true);
        setError(null);
        setCourses([]);
        try {
            const data = await fetchCourses(subject.id);
            setCourses(data);
        } catch (err) {
            setError(`Failed to load courses for ${subject.name}.`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectCourse = async (course: CourseSummary) => {
        if (!selectedSubject) return;
        setSelectedCourse(course);
        setView('details');
        setIsLoading(true);
        setError(null);
        setCourseDetails(null);
        setGeminiExplanation('');
        setGeminiPrereqAdvice('');
        try {
            const data = await fetchCourseDetails(selectedSubject.id, course.id);
            setCourseDetails(data);
        } catch (err) {
            setError(`Failed to load details for ${course.name}.`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setError(null);
        setSearchTerm('');
        if (view === 'details') {
            setView('courses');
            setSelectedCourse(null);
            setCourseDetails(null);
        } else if (view === 'courses') {
            setView('subjects');
            setSelectedSubject(null);
            setCourses([]);
        }
    };
    
    const handleExplainCourse = async () => {
        if (!courseDetails) return;
        setIsGeminiLoading(true);
        setGeminiExplanation('');
        try {
            const explanation = await explainCourse(courseDetails);
            setGeminiExplanation(explanation);
        } catch (err) {
            setGeminiExplanation('Sorry, I couldn\'t generate an explanation right now.');
        } finally {
            setIsGeminiLoading(false);
        }
    };

    const handleSuggestPrereqs = async () => {
        if (!courseDetails) return;
        setIsGeminiLoading(true);
        setGeminiPrereqAdvice('');
        try {
            const advice = await suggestPrerequisites(courseDetails);
            setGeminiPrereqAdvice(advice);
        } catch (err) {
            setGeminiPrereqAdvice('Sorry, I couldn\'t generate advice for prerequisites right now.');
        } finally {
            setIsGeminiLoading(false);
        }
    };

    const filteredSubjects = useMemo(() =>
        subjects.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [subjects, searchTerm]
    );

    const filteredCourses = useMemo(() =>
        courses.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.course_code.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [courses, searchTerm]
    );

    const renderHeader = () => (
        <header className="bg-gray-800 text-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
            <div className="flex items-center">
                {view !== 'subjects' && (
                    <button onClick={handleBack} className="mr-4 p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <BackIcon className="h-6 w-6" />
                    </button>
                )}
                <Sprite className="w-10 h-10 mr-3" />
                <h1 className="text-2xl font-bold">Cora AI Course Explorer</h1>
            </div>
            {(view === 'subjects' || view === 'courses') && (
                 <div className="relative">
                    <input
                        type="text"
                        placeholder={view === 'subjects' ? "Search subjects..." : "Search courses..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-700 text-white rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
            )}
        </header>
    );

    const renderContent = () => {
        if (isLoading && view !== 'details') {
            return <div className="flex justify-center items-center h-64"><LoadingSpinner className="h-12 w-12 text-blue-500" /></div>;
        }

        if (error) {
            return <div className="text-center text-red-500 p-4">{error}</div>;
        }

        switch (view) {
            case 'subjects':
                return (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                        {filteredSubjects.map(subject => (
                            <li key={subject.id} onClick={() => handleSelectSubject(subject)}
                                className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transform transition-all cursor-pointer">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{subject.name}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{subject.course_count} courses</p>
                            </li>
                        ))}
                    </ul>
                );
            case 'courses':
                return (
                    <div>
                        <h2 className="text-2xl font-bold p-4 text-gray-800 dark:text-white">{selectedSubject?.name}</h2>
                        <ul className="p-4 space-y-3">
                            {filteredCourses.map(course => (
                                <li key={course.id} onClick={() => handleSelectCourse(course)}
                                    className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                                    <h3 className="text-md font-semibold text-gray-800 dark:text-white">{course.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{course.course_code}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            case 'details':
                if (isLoading) {
                     return <div className="flex justify-center items-center h-64"><LoadingSpinner className="h-12 w-12 text-blue-500" /></div>;
                }
                if (!courseDetails) {
                    return <div className="text-center text-gray-500 p-4">No course details available.</div>;
                }
                return (
                    <div className="p-4 md:p-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                             <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{courseDetails.name}</h2>
                             <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">{courseDetails.course_code}</p>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-center">
                                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Units</p>
                                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{courseDetails.units}</p>
                                </div>
                                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg col-span-2 md:col-span-2">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Grading</p>
                                    <p className="text-md font-bold text-green-900 dark:text-green-100">{courseDetails.grading}</p>
                                </div>
                             </div>

                             <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 border-b pb-2">Description</h3>
                             <p className="text-gray-600 dark:text-gray-300 mb-6">{courseDetails.description}</p>
                             
                             {courseDetails.prerequisites_text && (
                                <>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 border-b pb-2">Prerequisites</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">{courseDetails.prerequisites_text}</p>
                                </>
                            )}
                            
                            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg space-y-4">
                                <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-4">✨ AI Assistant ✨</h3>
                                <div className="space-y-4 md:space-y-0 md:flex md:space-x-4">
                                    <button onClick={handleExplainCourse} disabled={isGeminiLoading} className="w-full md:w-1/2 flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
                                        <BrainIcon className="h-5 w-5 mr-2"/>
                                        Explain This Course
                                    </button>
                                    <button onClick={handleSuggestPrereqs} disabled={isGeminiLoading || !courseDetails.prerequisites_text} className="w-full md:w-1/2 flex items-center justify-center bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors">
                                        <InfoIcon className="h-5 w-5 mr-2"/>
                                        Prerequisite Advice
                                    </button>
                                </div>
                                 {isGeminiLoading && <div className="flex justify-center items-center p-4"><LoadingSpinner className="h-8 w-8 text-gray-500" /> <span className="ml-2 text-gray-600 dark:text-gray-300">AI is thinking...</span></div>}
                                {geminiExplanation && (
                                    <div className="mt-4 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600">
                                        <h4 className="font-bold text-lg text-blue-800 dark:text-blue-200 mb-2">Course Explained</h4>
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{geminiExplanation}</p>
                                    </div>
                                )}
                                {geminiPrereqAdvice && (
                                    <div className="mt-4 p-4 bg-purple-50 dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-gray-600">
                                        <h4 className="font-bold text-lg text-purple-800 dark:text-purple-200 mb-2">Prerequisite Advice</h4>
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{geminiPrereqAdvice}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            {renderHeader()}
            <main>
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
