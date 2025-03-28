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
            prompt: `Prepare questions for a job interview based on the resume content provided.
                The job role is ${role}.
                The job experience level is ${level}.
                The tech stack used in the job is: ${techstack}.
                The focus between behavioural and technical questions should lean towards: ${type}.
                The amount of questions required is: ${amount}.
                The resume content is as follows: ${fileContent}.
                Please return only the questions, without any additional text.
                The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
                Return the questions formatted like this:
                ["Question 1", "Question 2", "Question 3"]
            `.trim()
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