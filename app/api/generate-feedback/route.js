import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { adminDb } from "@/firebase/admin";
import { NextResponse } from "next/server";

// Initialize the Google AI model
const model = google('gemini-2.0-flash-001', {
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

export async function POST(request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error('Missing API key');
    return NextResponse.json({
      success: false,
      error: "Server configuration error"
    }, { status: 500 });
  }

  try {
    const { messages, interviewId, userId } = await request.json();

    if (!messages?.length || !interviewId || !userId) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields"
      }, { status: 400 });
    }

    // Generate AI feedback
    const { text: feedback } = await generateText({
      model,
      prompt: `
Analyze this interview conversation and provide feedback:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Important: Ensure your response is a valid JSON object with the following structure:
{
  "summary": "Brief overview of the interview",
  "technical": {
    "rating": 5,
    "strengths": ["Strength 1", "Strength 2"],
    "improvements": ["Improvement 1", "Improvement 2"]
  },
  "communication": {
    "rating": 5,
    "strengths": ["Communication Strength 1"],
    "improvements": ["Communication Improvement 1"]
  },
  "overall": {
    "score": 5,
    "recommendations": ["Overall recommendation 1"]
  }
}

If the conversation is too short or lacks substantial content, use lower ratings and generic feedback.
      `.trim()
    });

    // Parse and validate feedback
    let parsedFeedback;
    try {
      // Remove any code block markers and extra whitespace
      const cleanFeedback = feedback
        .replace(/```(json)?/g, '')
        .replace(/^\s+|\s+$/g, '')
        .trim();

      console.log("Raw Feedback:", feedback);
      console.log("Clean Feedback:", cleanFeedback);

      // Attempt to parse the feedback
      parsedFeedback = JSON.parse(cleanFeedback);

      // Validate the structure
      if (!parsedFeedback.summary || 
          !parsedFeedback.technical || 
          !parsedFeedback.communication || 
          !parsedFeedback.overall) {
        throw new Error('Invalid feedback structure');
      }
    } catch (parseError) {
      console.error("Failed to parse feedback:", { 
        feedback, 
        error: parseError,
        errorMessage: parseError.message 
      });

      // Provide a fallback feedback object
      parsedFeedback = {
        summary: "Unable to generate detailed feedback",
        technical: {
          rating: 1,
          strengths: [],
          improvements: ["Failed to generate technical analysis"]
        },
        communication: {
          rating: 1,
          strengths: [],
          improvements: ["Failed to generate communication analysis"]
        },
        overall: {
          score: 1,
          recommendations: ["Please review the interview details manually"]
        }
      };
    }

    // Save to database
    try {
      const feedbackRef = adminDb.collection('feedback').doc();
      
      await adminDb.runTransaction(async (transaction) => {
        // Verify interview exists
        const interviewRef = adminDb.collection('interviews').doc(interviewId);
        const interviewDoc = await transaction.get(interviewRef);
        
        if (!interviewDoc.exists) {
          throw new Error('Interview not found');
        }

        // Ensure parsedFeedback is an object
        const feedbackToSave = parsedFeedback || {
          summary: "No feedback generated",
          technical: { rating: 1, strengths: [], improvements: [] },
          communication: { rating: 1, strengths: [], improvements: [] },
          overall: { score: 1, recommendations: [] }
        };

        // Save feedback
        transaction.set(feedbackRef, {
          feedback: feedbackToSave,
          interviewId,
          userId,
          createdAt: new Date().toISOString()
        });

        // Update interview
        transaction.update(interviewRef, {
          hasFeedback: true,
          feedbackId: feedbackRef.id,
          updatedAt: new Date().toISOString()
        });
      });

      return NextResponse.json({
        success: true,
        id: feedbackRef.id,
        feedback: parsedFeedback
      });
    } catch (dbError) {
      console.error("Database operation failed:", {
        message: dbError.message,
        stack: dbError.stack
      });
      
      return NextResponse.json({
        success: false,
        error: dbError.message || "Failed to save feedback"
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Request error:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({
      success: false,
      error: error.message || "Server error"
    }, { status: 500 });
  }
}