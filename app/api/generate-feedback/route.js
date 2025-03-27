import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(request) {
  try {
    const { messages, interviewId, userId } = await request.json();

    if (!messages || !interviewId || !userId) {
      return Response.json({
        success: false,
        error: "Missing required fields"
      }, { status: 400 });
    }

    // Process messages to create a conversation summary
    const conversationSummary = messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const { text: feedback } = await generateText({
      model: google('gemini-2.0-flash-001', {
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
      }),
      prompt: `As an HR professional, analyze this interview conversation and provide structured feedback:
        
        Interview Conversation:
        ${conversationSummary}
        
        Provide feedback in JSON format:
        {
          "strengths": ["point1", "point2"],
          "improvements": ["point1", "point2"],
          "overallRating": "score out of 10",
          "summary": "brief summary"
        }`
    });

    // Save feedback to database
    const feedbackDoc = {
      feedback: JSON.parse(feedback),
      interviewId,
      userId,
      createdAt: new Date().toISOString()
    };

    return Response.json({
      success: true,
      id: interviewId,
      feedback: feedbackDoc
    });

  } catch (error) {
    console.error('Feedback generation error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Failed to generate feedback'
    }, { status: 500 });
  }
}