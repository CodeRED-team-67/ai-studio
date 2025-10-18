
import { GoogleGenAI, Type } from "@google/genai";
import { Course } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const courseSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A short, engaging title for the entire course."
        },
        lessons: {
            type: Type.ARRAY,
            description: "An array of lesson objects that make up the course.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "The title of this specific lesson."
                    },
                    content: {
                        type: Type.STRING,
                        description: "The main educational content for the lesson, explained simply."
                    },
                    quiz: {
                        type: Type.OBJECT,
                        description: "An optional multiple-choice quiz for this lesson.",
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.STRING }
                        },
                        required: ["question", "options", "correctAnswer"]
                    },
                    fillInTheBlank: {
                        type: Type.OBJECT,
                        description: "An optional fill-in-the-blank exercise.",
                        properties: {
                            sentence: { type: Type.STRING, description: "The sentence with a placeholder like '___' for the blank." },
                            correctAnswer: { type: Type.STRING, description: "The word that fills the blank." }
                        },
                        required: ["sentence", "correctAnswer"]
                    },
                    scrambledSentence: {
                        type: Type.OBJECT,
                        description: "An optional scrambled sentence minigame.",
                        properties: {
                            scrambled: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of shuffled words." },
                            correctSentence: { type: Type.STRING, description: "The correctly ordered sentence." }
                        },
                        required: ["scrambled", "correctSentence"]
                    }
                },
                required: ["title", "content"]
            }
        }
    },
    required: ["title", "lessons"]
};


export const generateCourseFromContent = async (content: string): Promise<Course> => {
    const prompt = `You are an expert instructional designer specializing in gamification. Your task is to transform the following raw text content into a structured, gamified mini-course. 

    Follow these rules:
    1.  Create a concise and catchy main title for the course.
    2.  Break the content down into 3-5 short, easily digestible lessons.
    3.  Each lesson must have a clear title and its core content.
    4.  To make it interactive, add ONE of the following to most lessons: a multiple-choice quiz, a fill-in-the-blank exercise, or a scrambled sentence game. Vary the activities to keep it engaging.
    5.  The tone should be encouraging and simple, as if for a beginner.
    6.  The entire output must be a valid JSON object that strictly adheres to the provided schema. Do not include any text, markdown formatting, or explanations outside of the JSON object.
    
    Raw Content to transform:
    ---
    ${content}
    ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: courseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const courseData = JSON.parse(jsonText);

        // Basic validation
        if (!courseData.title || !Array.isArray(courseData.lessons)) {
            throw new Error("Invalid course structure received from API.");
        }

        return courseData as Course;
    } catch (error) {
        console.error("Error generating course:", error);
        throw new Error("Failed to generate the learning course. The content might be too complex or the AI service is currently unavailable. Please try again with different content.");
    }
};
