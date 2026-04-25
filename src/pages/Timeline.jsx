import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CalendarCheck, Megaphone, Vote, BarChart4 } from 'lucide-react';
import { getGroqResponse } from '../lib/groq';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';

const steps = [
  {
    id: 1,
    title: 'Voter Registration',
    icon: CalendarCheck,
    color: 'bg-blue-500',
    shortDesc: 'Ensuring you are eligible and registered to vote.',
    prompt: 'Explain the voter registration process simply. Include why it is important and what documents are generally needed.'
  },
  {
    id: 2,
    title: 'Campaigning',
    icon: Megaphone,
    color: 'bg-purple-500',
    shortDesc: 'Candidates present their platforms to the public.',
    prompt: 'Explain the political campaigning phase of an election. What happens during this time and what should voters look out for?'
  },
  {
    id: 3,
    title: 'Voting Day',
    icon: Vote,
    color: 'bg-emerald-500',
    shortDesc: 'Citizens cast their ballots at polling stations.',
    prompt: 'Describe what happens on election voting day. Walk through the steps a voter takes at the polling station.'
  },
  {
    id: 4,
    title: 'Counting & Results',
    icon: BarChart4,
    color: 'bg-orange-500',
    shortDesc: 'Votes are tallied and winners are declared.',
    prompt: 'Explain how votes are counted and election results are declared. Keep it simple and easy to understand.'
  }
];

const Timeline = () => {
  const [activeStep, setActiveStep] = useState(steps[0]);
  const [detailedContent, setDetailedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [cache, setCache] = useState({});

  // Fetch detailed explanation from Gemini when a step is clicked
  const handleStepClick = useCallback(async (step) => {
    setActiveStep(step);
    
    if (cache[step.id]) {
      setDetailedContent(cache[step.id]);
      return;
    }

    setIsLoading(true);
    setDetailedContent('');
    
    // Call the AI API using the prompt
    const response = await getGroqResponse(step.prompt);
    
    if (!response.includes("Whoops!") && !response.includes("I'm sorry")) {
      setCache(prev => ({ ...prev, [step.id]: response }));
    }
    
    setDetailedContent(response);
    setIsLoading(false);
  }, [cache]);

  // Fetch initial content on mount
  useEffect(() => {
    handleStepClick(steps[0]);
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">The Election Journey</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Explore the fundamental steps of the democratic process. Click on any phase to learn more.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Timeline Navigation */}
        <div className="lg:w-1/3 relative">
          <div className="absolute left-6 top-8 bottom-8 w-1 bg-slate-200 rounded-full hidden md:block"></div>
          
          <div className="flex flex-col gap-4">
            {steps.map((step) => {
              const isActive = activeStep.id === step.id;
              const Icon = step.icon;
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step)}
                  aria-selected={isActive}
                  aria-label={`View details for ${step.title}`}
                  className={`relative flex items-center p-4 rounded-2xl transition-all duration-300 text-left overflow-hidden group ${
                    isActive 
                      ? 'bg-white shadow-lg border border-slate-200' 
                      : 'hover:bg-white/60 hover:shadow-md border border-transparent'
                  }`}
                >
                  {/* Background highlight for active state */}
                  {isActive && (
                    <motion.div
                      layoutId="active-step-bg"
                      className="absolute inset-0 bg-gradient-to-r from-primary-50 to-transparent opacity-50"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white transition-transform duration-300 ${isActive ? 'scale-110 shadow-md ' + step.color : 'bg-slate-300 group-hover:scale-105'}`}>
                    <Icon size={24} />
                  </div>
                  
                  <div className="relative z-10 ml-4 flex-1">
                    <h3 className={`font-bold text-lg transition-colors ${isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm mt-1 transition-colors ${isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                      {step.shortDesc}
                    </p>
                  </div>

                  <ChevronRight 
                    size={20} 
                    className={`relative z-10 transition-all ${isActive ? 'text-primary-500 opacity-100 translate-x-0' : 'text-slate-300 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} 
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Content Panel */}
        <div className="lg:w-2/3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden h-full flex flex-col"
            >
              {/* Header */}
              <div className={`p-8 pb-10 relative overflow-hidden`}>
                {/* Decorative background element */}
                <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10 blur-3xl ${activeStep.color}`}></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`p-4 rounded-2xl text-white shadow-lg ${activeStep.color}`}>
                    <activeStep.icon size={32} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold tracking-wider uppercase text-slate-500">Phase {activeStep.id}</span>
                    <h2 className="text-3xl font-extrabold text-slate-900">{activeStep.title}</h2>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 pb-8 flex-1 relative">
                {isLoading ? (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Generating detailed explanation...</p>
                  </div>
                ) : null}
                
                <div className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-primary-600 prose-li:text-slate-600">
                  <ReactMarkdown>{DOMPurify.sanitize(detailedContent)}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default memo(Timeline);
