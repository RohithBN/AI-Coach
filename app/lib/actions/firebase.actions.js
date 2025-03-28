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
            feedback: data.feedback || "No feedback provided",
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
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
    }))
  }