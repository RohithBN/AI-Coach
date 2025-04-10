"use server";
import { adminDb } from "@/firebase/admin";

export const getInterviews = async (userId) => {
  if (!userId) {
    console.error("getInterviews: User ID is required but received", userId);
    throw new Error("User ID is required");
  }

  try {
    const interviewsSnapshot = await adminDb
      .collection("interviews")
      .where("userId", "==", userId)
      .get(); // Removed `orderBy("createdAt")` for now

    if (interviewsSnapshot.empty) {
      console.log("No interviews found for user:", userId);
      return [];
    }

    return interviewsSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role || "Unknown Role",
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          type: data.type || "Unknown",
          level: data.level || "Unknown",
          techstack: Array.isArray(data.techstack) ? data.techstack : [],
          questionSize: Array.isArray(data.questions) ? data.questions.length : 0,
          updatedAt: data.updatedAt || null,
          overallScore:data.overallScore||null,
          hasFeedback:data.hasFeedback||false,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt); // Sort manually
  } catch (error) {
    console.error("Error fetching interviews:", error);
    throw new Error("Failed to fetch interviews");
  }
};


export  async function getInterviewById(id) {
    try {
        const interview=await adminDb.collection('interviews').doc(id).get()
        if(!interview.exists){
            console.log("Interview not found")
            return null
        }
        return interview.data()
        
    } catch (error) {
        console.error("Error fetching interview by ID:", error);
        throw new Error("Failed to fetch interview by ID");
        
    }
    
}


export async function saveFeedback({feedback,interviewId,createdAt,userId}){
    try {
        const docRef = await adminDb.collection('feedback').add({
            feedback,interviewId,createdAt,userId
        })
        return {success:true,id:docRef.id}
    } catch (error) {
        console.error("Error saving feedback:", error);
        return {success:false}
    }
}

export async function getFeedbackById(id) {
    try {
        const feedbackSnapshot = await adminDb
            .collection("feedback")
            .where("interviewId", "==", id)
            .get();
    
        if (feedbackSnapshot.empty) {
            console.log("No feedback found for interview:", id);
            return [];
        }
    
        return feedbackSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                summary: data.feedback?.summary || "No summary available",
                technical: {
                    rating: Number(data.feedback?.technical?.rating) || 0,
                    strengths: Array.isArray(data.feedback?.technical?.strengths) 
                        ? data.feedback.technical.strengths 
                        : [],
                    improvements: Array.isArray(data.feedback?.technical?.improvements) 
                        ? data.feedback.technical.improvements 
                        : []
                },
                communication: {
                    rating: Number(data.feedback?.communication?.rating) || 0,
                    strengths: Array.isArray(data.feedback?.communication?.strengths) 
                        ? data.feedback.communication.strengths 
                        : [],
                    improvements: Array.isArray(data.feedback?.communication?.improvements) 
                        ? data.feedback.communication.improvements 
                        : []
                },
                overall: {
                    score: Number(data.feedback?.overall?.score) || 0,
                    recommendations: Array.isArray(data.feedback?.overall?.recommendations) 
                        ? data.feedback.overall.recommendations 
                        : []
                },
                createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
                interviewId: data.interviewId,
                userId: data.userId
            };
        });
        
    } catch (error) {
        console.error("Error fetching feedback:", error);
        throw new Error("Failed to fetch feedback");
    }
}


export async function getLatestInterviews(userId){
    if(!userId){
        console.error("getLatestInterviews: User ID is required but received",userId)
        throw new Error("User ID is required")
    }
   
    const limit=20;
    const interviews = await adminDb
      .collection("interviews")
      .where("userId", "!=", userId)
      .get();
  
    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      questionSize: Array.isArray(doc.data().questions)
        ? doc.data().questions.length
        : 0,
    }))
  }