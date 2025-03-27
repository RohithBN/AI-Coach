"use client";
import React, { useEffect, useState } from "react";
import { getInterviews } from "@/app/lib/actions/firebase.actions";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Page = () => {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded } = useUser();

  console.log("user:", user?.id); // Debugging: Check if user ID is available

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded) return;
      if (!user?.id) {
        console.error("User ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getInterviews(user.id);
        console.log(data)
        setInterviews(data);
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id, isLoaded]);

  if (!isLoaded || isLoading) {
    return <div>Loading...</div>;
  }

  if (!user?.id) {
    return <div>Please sign in to view your interviews</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Interviews</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {interviews.map((interview) => (
          <div key={interview.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold">{interview.role}</h2>
            <p className="text-gray-600 text-sm">{new Date(interview.createdAt).toLocaleDateString()}</p>
            <p className="mt-2">Type: {interview.type}</p>
            <p>Level: {interview.level}</p>
            <div className="mt-2">
              <p className="font-medium">Tech Stack:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {interview.techstack.map((tech, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <Link href={`/interview-id/${interview.id}`}>
            <Button>View Interview</Button></Link>
            
          </div>
        ))}
      </div>
      {interviews.length === 0 && (
        <div className="text-center text-gray-500 mt-8">No interviews found. Start by creating a new interview!</div>
      )}
    </div>
  );
};

export default Page;
