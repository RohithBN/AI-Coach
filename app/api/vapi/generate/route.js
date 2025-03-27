import { adminDb } from "@/firebase/admin"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function GET(){
    return Response.json({
        success:true,
        message:"GET request to /api/vapi/generate/route"
    })
}


export async function POST(request){
try {
    const {role,type,level,techstack,amount,userid} = await request.json()
    if (!role || !type || !level || !techstack || !amount || !userid) {
        return Response.json({
          success: false,
          message: "Missing required fields",
        }, { status: 400 });
      }
    const {text:questions}=await generateText({
        model:google('gemini-2.0-flash-001'),
        prompt:`Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    })
    console.log("questions:",questions)
    const interview={
        role,type,level,
        techstack:techstack.split(","),
        questions:JSON.parse(questions),
        userId:userid,
        finalized:true,
        createdAt:new Date().toISOString()
    }
    try {
        const docRef = await adminDb.collection('interviews').add(interview);
        
        return Response.json({
          success: true,
          message: "Interview created successfully",
          interviewId: docRef.id,
          params: { role, type, level, techstack, amount, userid }
        });
      } catch (dbError) {
        console.error("Firebase Error:", dbError);
        return Response.json({
          success: false,
          message: "Database operation failed",
          error: dbError.message
        }, { status: 500 });
      }
    } catch (error) {
      console.error("API Error:", error);
      return Response.json({
        success: false,
        message: "API request failed",
        error: error.message
      }, { status: 500 });
    }
  }