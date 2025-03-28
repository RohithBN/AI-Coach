"use client";
import { getFeedbackById } from '@/app/lib/actions/firebase.actions';
import { useEffect, useState } from 'react';
import { Star, TrendingUp, MessageSquare, Award, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';

const Page = ({ params }) => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const resolvedParams = use(params);
  const interviewId = resolvedParams?.id;

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!interviewId) {
        setError('Interview ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getFeedbackById(interviewId);
        
        if (!data?.[0]) {
          setError('Feedback not found');
          return;
        }

        setFeedback(data[0]);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        setError(error.message || 'Failed to fetch feedback');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-16 h-16 border-t-4 border-white/80 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="min-h-screen bg-black p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-6 bg-white/[0.02] border border-white/10 rounded-xl p-12">
            <div className="text-white/80 text-xl font-medium text-center">
              {error || 'Feedback not found'}
            </div>
            <Link 
              href="/interviews" 
              className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Interviews</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Rest of your component remains the same...
  return (
    <div className="min-h-screen bg-black p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
            Interview Feedback
          </h1>
          <p className="mt-3 text-gray-400">
            Detailed analysis and recommendations for your interview performance
          </p>
        </div>

        {/* Summary Section */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <h2 className="text-xl font-medium text-white mb-4">Summary</h2>
          <p className="text-gray-300 leading-relaxed">{feedback.summary}</p>
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ScoreCard
            title="Technical"
            score={feedback.technical.rating}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <ScoreCard
            title="Communication"
            score={feedback.communication.rating}
            icon={<MessageSquare className="h-5 w-5" />}
          />
          <ScoreCard
            title="Overall"
            score={feedback.overall.score}
            icon={<Award className="h-5 w-5" />}
          />
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          <FeedbackSection
            title="Technical Skills"
            strengths={feedback.technical.strengths}
            improvements={feedback.technical.improvements}
          />
          <FeedbackSection
            title="Communication Skills"
            strengths={feedback.communication.strengths}
            improvements={feedback.communication.improvements}
          />
          <FeedbackSection
            title="Recommendations"
            recommendations={feedback.overall.recommendations}
          />
        </div>
      </div>
    </div>
  );
};

const ScoreCard = ({ title, score, icon }) => (
  <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 backdrop-blur-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-white/80 font-medium">{title}</h3>
      {icon}
    </div>
    <div className="flex items-baseline">
      <span className="text-3xl font-bold text-white">{score}</span>
      <span className="text-white/40 ml-1">/10</span>
    </div>
  </div>
);

const FeedbackSection = ({ title, strengths, improvements, recommendations }) => (
  <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 backdrop-blur-sm">
    <h2 className="text-xl font-medium text-white mb-6">{title}</h2>
    {strengths && (
      <div className="mb-6">
        <h3 className="text-white/80 text-sm font-medium mb-3">Strengths</h3>
        <ul className="space-y-2">
          {strengths.map((item, i) => (
            <li key={i} className="text-gray-300 flex items-start">
              <Star className="h-4 w-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    )}
    {improvements && (
      <div className="mb-6">
        <h3 className="text-white/80 text-sm font-medium mb-3">Areas for Improvement</h3>
        <ul className="space-y-2">
          {improvements.map((item, i) => (
            <li key={i} className="text-gray-300 flex items-start">
              <TrendingUp className="h-4 w-4 text-blue-400 mr-2 mt-1 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    )}
    {recommendations && (
      <div>
        <h3 className="text-white/80 text-sm font-medium mb-3">Recommendations</h3>
        <ul className="space-y-2">
          {recommendations.map((item, i) => (
            <li key={i} className="text-gray-300 flex items-start">
              <Award className="h-4 w-4 text-purple-400 mr-2 mt-1 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export default Page;