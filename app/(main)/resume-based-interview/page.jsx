'use client';
import { useState } from 'react';
import { Upload, X, Plus, Loader2, Briefcase, Users, Code, List } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const ResumeBasedInterview = () => {
    const { user } = useUser();    
    const router=useRouter();
    const [formData, setFormData] = useState({
        role: '',
        type: 'Technical', // default value
        level: 'Entry', // default value
        techstack: [],
        amount: 5, // default value
      });
      const [techInput, setTechInput] = useState('');
      const [file, setFile] = useState(null);
      const [loading, setLoading] = useState(false);
    
      const handleTechAdd = (e) => {
        e.preventDefault();
        if (techInput.trim()) {
          setFormData(prev => ({
            ...prev,
            techstack: [...prev.techstack, techInput.trim()]
          }));
          setTechInput('');
        }
      };
    
      const removeTech = (indexToRemove) => {
        setFormData(prev => ({
          ...prev,
          techstack: prev.techstack.filter((_, index) => index !== indexToRemove)
        }));
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            
            formDataToSend.append('file', file);
            
            const dataToSend = {
                ...formData,
                userid: user?.id
            };
            
            formDataToSend.append('data', JSON.stringify(dataToSend));
    
            const response = await fetch('/api/generate-resume-interview', {
                method: 'POST',
                body: formDataToSend
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to generate interview questions");
            }
    
            const data = await response.json();
            
            if (data.success) {
                console.log("Questions generated:", data.questions);
                router.push(`/interview-id/${data.interviewId}`);
            }
    
        } catch (error) {
            console.error("Error generating interview questions:", error);
            // You might want to show an error toast/alert here
        } finally {
            setLoading(false);
        }
    };
      
        return (
          <div className="min-h-screen bg-black">
            {/* Hero Section */}
            <div className="w-full bg-gradient-to-b from-white/[0.02] to-transparent pb-20 pt-10">
              <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                  AI Interview Generator
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl">
                  Create personalized technical interviews based on your resume and experience level.
                </p>
              </div>
            </div>
      
            {/* Main Form Section */}
            <div className="max-w-4xl mx-auto px-6 -mt-10">
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Role Input */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-white/40" />
                      Job Role
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/25 focus:border-transparent transition-all"
                      required
                      placeholder="e.g. Senior Frontend Developer"
                    />
                  </div>
      
                  {/* Three Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Interview Type */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-white/40" />
                        Interview Type
                      </label>
                      <input
                        type="text"
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/25 focus:border-transparent transition-all"
                        placeholder="e.g. technical, behavioral, mixed"
                        required
                      />
                    </div>
      
                    {/* Experience Level */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                        <Code className="h-4 w-4 text-white/40" />
                        Experience Level
                      </label>
                      <input
                        type="text"
                        value={formData.level}
                        onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/25 focus:border-transparent transition-all"
                        placeholder="e.g. entry, mid, senior"
                        required
                      />
                    </div>
      
                    {/* Number of Questions */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                        <List className="h-4 w-4 text-white/40" />
                        Number of Questions
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/25 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
      
                  {/* Tech Stack */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4 text-white/40" />
                      Tech Stack
                    </label>
                    <div className="flex gap-3 mb-3">
                      <input
                        type="text"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/25 focus:border-transparent transition-all"
                        placeholder="Add technologies..."
                        onKeyPress={(e) => e.key === 'Enter' && handleTechAdd(e)}
                      />
                      <button
                        onClick={handleTechAdd}
                        type="button"
                        className="px-4 py-3 bg-white/5 text-white/80 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.techstack.map((tech, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-white/5 text-white/80 rounded-xl text-sm flex items-center gap-2 hover:bg-white/10 transition-colors"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() => removeTech(index)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
      
                  {/* Resume Upload */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Resume Upload
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-black/40 hover:bg-black/60 transition-all group">
                      <div className="flex flex-col items-center justify-center py-6 px-4">
                        {file ? (
                          <div className="text-white flex items-center gap-3 group">
                            <span className="text-white/80">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => setFile(null)}
                              className="text-white/40 hover:text-red-400 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-white/20 mb-3 group-hover:text-white/40 transition-colors" />
                            <p className="text-sm text-white/50 text-center group-hover:text-white/70 transition-colors">
                              Drag and drop your resume here, or click to browse
                            </p>
                            <p className="text-xs text-white/30 mt-2">
                              Supports PDF, DOC, DOCX, and TXT files
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => setFile(e.target.files[0])}
                        required
                      />
                    </label>
                  </div>
      
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !file || formData.techstack.length === 0}
                    className="w-full px-6 py-4 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5 font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Generate Interview Questions
                        <List className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      };

export default ResumeBasedInterview;