'use client'
import React, { useState } from 'react';
import { Search, Briefcase, MapPin, Loader2, AlertCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Add this constant before the FindJobs component
const defaultFaqs = [
  {
    question: "How do I use the job search feature?",
    answer: "Simply enter your desired job title or keywords and location in the search fields. Click the 'Search Jobs' button to find relevant positions matching your criteria."
  },
  {
    question: "What types of tech jobs can I find here?",
    answer: "Our platform covers a wide range of tech positions including Software Development, Data Science, Machine Learning, DevOps, Product Management, UI/UX Design, and more."
  },
  {
    question: "Are the job listings updated regularly?",
    answer: "Yes, our job listings are regularly updated through real-time integration with major job boards and company career pages to ensure you have access to the latest opportunities."
  },
  {
    question: "Can I search for remote positions?",
    answer: "Absolutely! You can search for remote positions by typing 'Remote' in the location field, or combine it with a specific region for hybrid opportunities."
  }
];

const FindJobs = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [faq, setFaq] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        console.log(query,location)
      const response = await fetch('https://job-scraper-vpff.onrender.com/retrieve_jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          location,
          num_results: 12
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.retrieved_jobs) {
        throw new Error('No jobs found');
      }
      console.log(data);

      setJobs(data.retrieved_jobs);
      setFaq(data.gemini_response);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs. Please try again later.');
      setJobs([]);
      setFaq('');
    } finally {
      setLoading(false);
    }
  };
  const formatFaqAnswer = (text) => {
    return text
      // Add extra newlines before bullets and numbers
      .replace(/\n\*/g, '\n\n•')
      .replace(/\n(\d+\.)/g, '\n\n$1')
      // Add extra newlines before sections
      .replace(/\n([A-Z][^:]+:)/g, '\n\n$1')
      // Convert single asterisk bullets to bullet points
      .replace(/^\*/gm, '•')
      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />

      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-white/[0.02] to-transparent pb-20 pt-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Find Your Dream Tech Role
          </h1>
          <p className="text-gray-400 text-xl md:text-2xl max-w-2xl leading-relaxed">
            Discover opportunities aligned with your skills and aspirations in the tech industry
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div className="relative max-w-6xl mx-auto px-6 -mt-10">
        <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-white/60 text-sm mb-2">Job Title or Keywords</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Frontend Developer, React, Software Engineer"
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                  required
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-white/60 text-sm mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore, Remote"
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                  required
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:hover:from-purple-500/80 disabled:hover:to-blue-500/80 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Search Jobs
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
      </div>

      {/* Jobs Grid */}
      {jobs.length > 0 && (
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-purple-400" />
            Available Positions
            <span className="text-white/40 text-lg">({jobs.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <div 
                key={index} 
                className="group bg-white/[0.02] border border-white/10 rounded-xl p-6 hover:bg-white/[0.04] transition-all hover:border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/5"
              >
                <h3 className="text-lg font-semibold mb-3 group-hover:text-purple-400 transition-colors">{job.title}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white/60">
                    <Briefcase className="h-4 w-4 text-white/40" />
                    {job.company}
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <MapPin className="h-4 w-4 text-white/40" />
                    {job.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}

      {/* FAQ Section */}
{faq ? (
  <section className="w-full py-12 md:py-24 border-t border-white/5">
    <div className="container mx-auto px-4 md:px-6">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h2>
        <p className="text-white/60">
          Essential information about {query} roles in {location}
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faq.split(/(?=\d+\.\s+)/).filter(Boolean).map((qa, index) => {
            // Extract question and answer parts
            const parts = qa.trim().split(/\n(.+)/s);
            const question = parts[0].replace(/^\d+\.\s*/, '').trim();
            const answer = parts.length > 1 ? formatFaqAnswer(parts[1].trim()) : '';
            
            return (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-white/10 bg-white/[0.02] px-4 rounded-lg mb-4"
              >
                <AccordionTrigger className="text-left text-white hover:text-gray-400">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-white/70 whitespace-pre-line leading-relaxed">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  </section>
) : (
  // Display default FAQs when no search has been performed
  <section className="w-full py-12 md:py-24 border-t border-white/5">
    <div className="container mx-auto px-4 md:px-6">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {defaultFaqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-white/10 bg-white/[0.02] px-4 rounded-lg mb-4"
            >
              <AccordionTrigger className="text-left text-white hover:text-gray-400">
                {faq.question.replace(/\*\*/g, '')}
              </AccordionTrigger>
              <AccordionContent className="text-white/70 whitespace-pre-line leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
)}
    </div>
  );
}

export default FindJobs;