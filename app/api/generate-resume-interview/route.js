import { adminDb } from "@/firebase/admin";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";  // Add this import

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const data = formData.get('data');
        
        if (!file) {
            return Response.json({
                success: false,
                message: "Resume file is required",
            }, { status: 400 });
        }

        const { role, type, level, amount, techstack, userid } = JSON.parse(data);
        console.log("role:", role, "type:", type, "level:", level, "amount:", amount, "techstack:", techstack, "userid:", userid);
        
        // Validate all required fields
        if (!role || !type || !level || !techstack || !amount || !userid) {
            return Response.json({
                success: false,
                message: "Missing required fields",
            }, { status: 400 });
        }

        const fileContent = await file.text();
        const { text: questions } = await generateText({
            model: google('gemini-2.0-flash-001', {
                apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY  // Add API key
            }),
            prompt: `You are an expert technical interviewer. Analyze the provided resume and generate relevant interview questions.
            Role: ${role}
            Level: ${level}
            Tech Stack: ${techstack}
            Interview Type: ${type}
            Questions Required: ${amount}

            Resume Content:
            ${fileContent}

            Instructions:
            1. Analyze the candidate's experience and skills from their resume
            2. Generate ${amount} questions that:
            - Match the job role requirements
            - Are appropriate for the ${level} experience level
            - Focus on the specified tech stack: ${techstack}
            - Maintain a balance with ${type} focus
            3. Include a mix of:
            - Technical competency questions based on their listed skills
            - Experience-based questions from their work history
            - Problem-solving scenarios relevant to ${role}
            - Questions that assess cultural fit and soft skills

            Format Rules:
            - Return a JSON array of strings only
            - No special characters (/, *, [], {}, etc.)
            - Keep questions clear and concise
            - Each question should be complete and self-contained

            Example Format:
            ["Tell me about your experience with [technology] at [company]",
            "How would you implement [specific feature] using [technology]",
            "Describe a challenging project from your resume"]

            Return only the JSON array of questions, no additional text or formatting.`.trim(),
        });

        console.log("resume-questions:", questions);  // Fixed typo in console.log

        // Parse questions before using them
        let parsedQuestions;
        try {
            parsedQuestions = JSON.parse(questions.replace(/```(json)?/g, '').trim());
        } catch (parseError) {
            console.error("Failed to parse questions:", parseError);
            return Response.json({
                success: false,
                message: "Failed to parse generated questions"
            }, { status: 500 });
        }

        const interview = {
            role,
            type,
            level,
            techstack: Array.isArray(techstack) ? techstack : techstack.split(","),
            questions: parsedQuestions,
            userId: userid,
            finalized: true,
            createdAt: new Date().toISOString()
        };

       const docRef= await adminDb.collection('interviews').add(interview);
        
        return Response.json({
            success: true,
            message: "Interview created successfully",
            questions: parsedQuestions,
            interviewId: docRef.id,
        });
        
    } catch (error) {
        console.error("Error generating interview:", error);
        return Response.json({
            success: false,
            message: "Failed to generate interview"
        }, { status: 500 });  // Added status code
    }
}