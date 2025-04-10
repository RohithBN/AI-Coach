// Helper function to convert entries to markdown
export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const dateRange = entry.current
          ? `${entry.startDate} - Present`
          : `${entry.startDate} - ${entry.endDate}`;
        return `### ${entry.title} @ ${entry.organization}\n${dateRange}\n\n${entry.description}`;
      })
      .join("\n\n")
  );
}


export function calculateAverageScore(interviews) {
  if (!interviews.length) return 0; // Handle empty list case

  const validInterviews=interviews.filter((interview)=>(
    interview.hasFeedback
  ))

  // Summing up all the overall scores
  const totalSum = validInterviews.reduce(
    (sum, interview) => sum + (interview.overallScore || 0),
    0
  );


  return Math.round((totalSum / (validInterviews.length * 10)) * 100);
}

export function calculateAverageDuration(interviews) {
  if (!interviews?.length) return '0m';

  // Filter interviews with valid timestamps and feedback
  const completedInterviews = interviews.filter(interview => 
    interview.hasFeedback && 
    interview.createdAt && 
    interview.updatedAt
  );

  if (!completedInterviews.length) return '0m';

  try {
    const totalDuration = completedInterviews.reduce((sum, interview) => {
      const start = new Date(interview.createdAt).getTime();
      const end = new Date(interview.updatedAt).getTime();
      const duration = (end - start) / (1000 * 60); // Convert to minutes immediately
      
      // Log individual interview duration
      console.log('Interview duration:', {
        id: interview.id,
        duration: Math.round(duration),
        startTime: new Date(start).toLocaleTimeString(),
        endTime: new Date(end).toLocaleTimeString()
      });

      return sum + duration;
    }, 0);

    const avgMinutes = Math.round(totalDuration / completedInterviews.length);
    
    // Cap maximum duration at 120 minutes
    const cappedDuration = Math.min(avgMinutes, 120);

    // Log the calculations
    console.log('Duration calculations:', {
      totalInterviews: completedInterviews.length,
      rawAverage: avgMinutes,
      cappedDuration: cappedDuration
    });

    return `${cappedDuration}m`;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return '0m';
  }
}

export function calculateCompletionRate(interviews) {
  if (!interviews?.length) return 0;

  const completedInterviews = interviews.filter(interview => interview.hasFeedback).length;
  const rate = Math.round((completedInterviews / interviews.length) * 100);

  // Log for debugging
  console.log('Completion rate:', {
    total: interviews.length,
    completed: completedInterviews,
    rate: rate
  });

  return rate;
}