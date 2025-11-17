
import React, { useState, useCallback } from 'react';
import { Recommendation, AnalyticsType } from '../types';
import { SparklesIcon, BookOpenIcon, CheckCircleIcon } from './icons';
import { getMicroLesson } from '../services/geminiService';

interface AnalyticsCardProps {
  type: AnalyticsType;
  recommendation: Recommendation;
  children: React.ReactNode;
  onAskAi: (topic: AnalyticsType, question: string) => void;
  onLessonCompleted: () => void;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ type, recommendation, children, onAskAi, onLessonCompleted }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [lessonContent, setLessonContent] = useState('');
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  const handleLearnMore = useCallback(async () => {
    setModalOpen(true);
    if (!lessonContent) {
        setIsLoadingLesson(true);
        const content = await getMicroLesson(type);
        setLessonContent(content);
        setIsLoadingLesson(false);
    }
  }, [type, lessonContent]);
  
  const handleCompleteLesson = () => {
    onLessonCompleted();
    setModalOpen(false);
  };
  
  const formattedLesson = lessonContent
    .replace(/### (.*)/g, '<h3 class="text-xl font-semibold text-purple-300 mt-4 mb-2">$1</h3>')
    .replace(/## (.*)/g, '<h2 class="text-2xl font-bold text-purple-300 mt-6 mb-3">$1</h2>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\* (.*)/g, '<li class="ml-5 list-disc">$1</li>');

  return (
    <>
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300 flex flex-col h-full">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">{type}</h3>
          <p className="text-sm text-purple-300 mt-1">{recommendation.title}</p>
        </div>
        <div className="flex-grow p-4">
          {children}
        </div>
        <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-lg">
          <p className="text-sm text-gray-300"><span className="font-semibold text-gray-100">Insight:</span> {recommendation.explanation}</p>
          <p className="text-sm text-gray-300 mt-2"><span className="font-semibold text-gray-100">Next Step:</span> {recommendation.nextStep}</p>
          <div className="flex items-center justify-end space-x-2 mt-4">
            <button
              onClick={() => onAskAi(type, `Tell me more about ${type}.`)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600/50 rounded-md hover:bg-purple-600 transition-colors flex items-center"
            >
              <SparklesIcon className="h-4 w-4 mr-1.5" />
              Ask AI
            </button>
            <button
              onClick={handleLearnMore}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600/50 rounded-md hover:bg-teal-600 transition-colors flex items-center"
            >
              <BookOpenIcon className="h-4 w-4 mr-1.5" />
              Learn More
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">Micro-Lesson: {type}</h2>
            </div>
            <div className="p-5 overflow-y-auto flex-grow">
                {isLoadingLesson ? (
                    <div className="flex items-center justify-center h-48">
                        <SparklesIcon className="h-12 w-12 text-purple-400 animate-pulse"/>
                    </div>
                ) : (
                    <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: formattedLesson }} />
                )}
            </div>
            <div className="p-4 border-t border-gray-700 bg-gray-900/50 rounded-b-lg flex justify-end">
                <button
                    onClick={handleCompleteLesson}
                    disabled={isLoadingLesson}
                    className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Complete Lesson (+100 XP)
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnalyticsCard;
