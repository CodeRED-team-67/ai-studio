// FIX: Replaced placeholder content with a full Gemini service implementation.
import { GoogleGenAI } from "@google/genai";
import { CourseDetails } from "../types";

// FIX: Initialize GoogleGenAI with apiKey object as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const explainCourse = async (course: CourseDetails): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        const prompt = `Explain the following university course in a simple and easy-to-understand way for a new student. Focus on what they will learn and what the course is about.
        
Course Name: ${course.name} (${course.course_code})
Course Description: ${course.description}
Prerequisites: ${course.prerequisites_text || 'None'}
Units: ${course.units}
Grading: ${course.grading}

Provide a concise explanation.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        
        // FIX: Extract text from response using the .text property as per guidelines.
        return response.text;
    } catch (error) {
        console.error("Error explaining course with Gemini:", error);
        throw new Error("Failed to get explanation from AI. Please try again later.");
    }
};

export const suggestPrerequisites = async (course: CourseDetails): Promise<string> => {
    if (!course.prerequisites_text) {
        return "This course has no prerequisites.";
    }

    try {
        const model = 'gemini-2.5-pro'; // Use pro for more complex reasoning
        const prompt = `A student is looking at the course "${course.name} (${course.course_code})". 
        The prerequisites are listed as: "${course.prerequisites_text}".

        Please analyze these prerequisites and provide advice for the student.
        1. Explain what these prerequisite courses likely cover.
        2. Suggest a logical order to take them if there are multiple.
        3. Give some tips on how to succeed in the prerequisite courses to be well-prepared for "${course.name}".

        Keep the tone helpful and encouraging.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        // FIX: Extract text from response using the .text property as per guidelines.
        return response.text;

    } catch (error) {
        console.error("Error suggesting prerequisites with Gemini:", error);
        throw new Error("Failed to get advice on prerequisites from AI. Please try again later.");
    }
};
