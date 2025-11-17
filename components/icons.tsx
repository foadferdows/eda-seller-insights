
import React from 'react';

type IconProps = {
  className?: string;
};

export const BrainCircuitIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.993 1.004"/>
    <path d="M12 5a3 3 0 1 1 5.993 1.004"/>
    <path d="M15 11a3 3 0 1 0-5.993 1.004"/>
    <path d="M15 11a3 3 0 1 1 5.993 1.004"/>
    <path d="M9 17a3 3 0 1 0-5.993 1.004"/>
    <path d="M9 17a3 3 0 1 1 5.993 1.004"/>
    <path d="M14 5.5h-4"/>
    <path d="M16 11.5h-4"/>
    <path d="M8 17.5h-4"/>
    <path d="M17.5 8a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>
    <path d="M5.5 8a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>
    <path d="M11.5 14a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>
    <path d="M11 14v-3"/>
    <path d="M6 14v-3"/>
    <path d="M18 14v-3"/>
    <path d="M14 8V6"/>
    <path d="M10 8V6"/>
  </svg>
);

export const StarIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 1.9-1.1-3-1.1 3-1.9-1.9L3 12l1.9 1.9 3 1.1-3 1.1 1.9 1.9L12 21l1.9-1.9 1.1 3 1.1-3 1.9 1.9L21 12l-1.9-1.9-3-1.1 3-1.1-1.9-1.9Z"/>
  </svg>
);

export const BookOpenIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export const CampaignIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="M12 12l-4 -4"/>
        <path d="M16 12l-4 4"/>
        <path d="M12 12l4 4"/>
        <path d="M12 16l4-4"/>
    </svg>
);

export const CompetitorIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h2.5a3.5 3.5 0 1 0 0-5H2"/>
        <path d="M22 12h-2.5a3.5 3.5 0 1 1 0-5H22"/>
        <path d="M12 2v2.5a3.5 3.5 0 1 1-5 0V2"/>
        <path d="M12 22v-2.5a3.5 3.5 0 1 0 5 0V22"/>
    </svg>
);

export const ChatBubbleIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.083-3.083A7.002 7.002 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.75 12.375a.75.75 0 01.75-.75h9.5a.75.75 0 010 1.5h-9.5a.75.75 0 01-.75-.75zm0-3a.75.75 0 01.75-.75h9.5a.75.75 0 010 1.5h-9.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);
  
export const CloseIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);
  
export const PaperAirplaneIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

export const UserIcon: React.FC<IconProps> = (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);
