// FIX: Replaced placeholder content with type definitions. This makes it a valid module.
export interface Subject {
    id: string;
    name: string;
    course_count: number;
}

export interface CourseSummary {
    id: string;
    name: string;
    course_code: string;
}

export interface CourseDetails {
    id: string;
    name: string;
    course_code: string;
    description: string;
    prerequisites_str: string;
    prerequisites: string[];
    corequisites: string[];
    prerequisites_text: string;
    corequisites_text: string;
    units: number;
    repeatability: string;
    grading: string;
    concurrent_with: string[];
    same_as: string[];
    restriction_text: string;
    overlaps_with: string[];
    faculty_link: string;
}
