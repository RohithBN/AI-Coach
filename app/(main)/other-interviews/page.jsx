"use client";
import React, { useEffect, useState } from "react";
import { getLatestInterviews } from "@/app/lib/actions/firebase.actions";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Layers, ArrowRight, Award, ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Page = () => {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded } = useUser();
  const [searchVal,setSearchVal]=useState('')
  const [filteredInterviews, setFilteredInterviews] = useState([]);

  useEffect(() => {
    const filtered = interviews.filter((interview) =>
      interview.role.toLowerCase().includes(searchVal.toLowerCase())
    );
    setFilteredInterviews(filtered);
  }, [searchVal, interviews]);
  

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded) return;
      if (!user?.id) {
        console.error("User ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getLatestInterviews(user.id);
        console.log(data)
        setInterviews(data);
        setFilteredInterviews(data);
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id, isLoaded]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-16 h-16 border-t-4 border-white/80 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white/80 text-xl font-medium bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 shadow-xl">
          Please sign in to view others interviews
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
            Your Interviews
          </h1>
          <p className="mt-3 text-gray-400 max-w-2xl">
            Review your scheduled and completed interviews. Prepare and improve with each session.
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search interviews..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border-white/10 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-white/20 transition-all"
            />
          </div>

          <Link href="/other-interviews">
            <Button 
              className="group bg-white/5 hover:bg-white/10 text-white border border-white/10 
                       px-6 py-2 rounded-xl flex items-center gap-3 transition-all duration-300
                       hover:border-white/20 hover:shadow-lg hover:shadow-white/5"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              Other Interviews
            </Button>
          </Link>
        </div>
    
  </div>
  
        {/* Interview Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredInterviews.map((interview) => (
            <div 
            key={interview.id} 
            className="relative group overflow-hidden rounded-2xl bg-black border border-white/10 shadow-xl transition-all duration-300 hover:border-white/20 flex flex-col h-[260px]"
          >
            <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="p-6 relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-white">{interview.role.replace(/\b\w/g, char => char.toUpperCase())}</h2>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3 text-white/50" />
                    <p className="text-white/50 text-sm">{new Date(interview.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="px-3 py-1 bg-black rounded-full">
                  <span className="text-xs font-medium text-white/80">{interview.type.replace(/\b\w/g, char => char.toUpperCase())}</span>
                </div>
              </div>
          
              {/* Details */}
              <div className="space-y-4 flex-grow">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-white/70" />
                    <span className="text-sm text-white/70">Level: </span>
                    <span className="text-sm text-white">
                      {interview.level.replace(/\b\w/g, char => char.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-white/70" />
                    <span className="text-sm text-white/70">No of Questions: </span>
                    <span className="text-sm text-white">
                      {interview?.questionSize || 0}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="mt-auto pt-4">
                <Link href={`/interview-id/${interview.id}`} className="block w-full">
                  <Button className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/10 gap-2 transition-all duration-300">
                    View Interview
                    <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredInterviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 mt-8 bg-black border border-white/10 rounded-2xl">
            <Layers className="h-16 w-16 text-white/20 mb-4" />
            <p className="text-white/80 text-xl font-medium mb-2">No interviews found</p>
            <p className="text-white/50 text-center max-w-md mb-6">Start by creating a new interview to practice and improve your skills</p>
            <Link href="/mock-interview">
              <Button className="bg-white/10 hover:bg-white/15 text-white border border-white/10">
                Schedule Interview
              </Button>
            </Link>
          </div>
        )}
      </div>
      </div>
  );
};
export default Page;