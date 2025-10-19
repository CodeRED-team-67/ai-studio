import { Subject, CourseSummary, CourseDetails } from '../types';

// The backend at cora-backend-l4df.onrender.com does not have the correct CORS headers,
// which prevents the browser from fetching data. To work around this without changing the backend,
// we route requests through a public CORS proxy.
const API_BASE_URL = 'https://corsproxy.io/?https://cora-backend-l4df.onrender.com';

export const fetchSubjects = async (): Promise<Subject[]> => {
    const response = await fetch(`${API_BASE_URL}/subjects/`);
    if (!response.ok) {
        throw new Error('Failed to fetch subjects.');
    }
    const data = await response.json();
    // Map the API response field `total_courses` to the app's expected `course_count`
    return data.subjects.map((s: any) => ({
        ...s,
        course_count: s.total_courses,
    }));
};

export const fetchCourses = async (subjectId: string): Promise<CourseSummary[]> => {
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch courses for subject: ${subjectId}`);
    }
    const data = await response.json();
    // Map the API response fields to match the CourseSummary type expected by the app.
    // This resolves the TypeError by ensuring `name` exists.
    return data.courses.map((c: any) => ({
        id: c.id,
        name: c.title, // Map `title` from API to `name`
        course_code: c.id, // Use `id` as `course_code`
    }));
};

// FIX: The URL was incorrect, it had an extra `/courses` segment. It has been removed.
export const fetchCourseDetails = async (subjectId: string, courseId: string): Promise<CourseDetails> => {
    const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}/${courseId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch course details for course ${courseId}.`);
    }
    const data = await response.json();
    return data;
};