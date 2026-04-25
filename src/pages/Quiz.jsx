import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, RefreshCw, Award, Loader2 } from 'lucide-react';
import { getGeminiResponse } from '../lib/gemini';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const generateQuiz = async () => {
    setIsLoading(true);
    setQuestions([]);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsFinished(false);
    setFeedback(null);

    const prompt = `Generate a 5-question multiple-choice quiz about general election processes and democracy, suitable for a beginner. 
    Return ONLY a valid JSON array of objects. 
    Format: [{"question": "Text", "options": ["A", "B", "C", "D"], "correctAnswerIndex": 0, "explanation": "Why this is correct."}]
    Do not include any markdown formatting like \`\`\`json. Just the raw JSON string.`;

    try {
      const responseText = await getGeminiResponse(prompt);
      // Clean up potential markdown formatting that Gemini might sometimes add despite instructions
      const cleanedJson = responseText.replace(/```json\n?|\n?```/gi, '').trim();
      const data = JSON.parse(cleanedJson);
      setQuestions(data);
    } catch (error) {
      console.error("Failed to parse quiz JSON:", error);
      // Fallback questions if API fails
      setQuestions([
        {
          question: "What is the primary purpose of a general election?",
          options: ["To choose government representatives", "To pass new laws directly", "To collect taxes", "To organize public events"],
          correctAnswerIndex: 0,
          explanation: "In a representative democracy, the main purpose of an election is for citizens to choose the officials who will represent them in government."
        },
        {
          question: "What is a 'ballot'?",
          options: ["A type of political party", "A place where people vote", "The device or paper used to cast a vote", "A law passed by the government"],
          correctAnswerIndex: 2,
          explanation: "A ballot is the actual piece of paper or electronic system that a voter uses to record their choices in an election."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateQuiz();
  }, []);

  const handleSelectAnswer = (idx) => {
    if (selectedAnswer !== null) return; // Prevent changing answer
    
    setSelectedAnswer(idx);
    const currentQ = questions[currentQuestionIdx];
    const isCorrect = idx === currentQ.correctAnswerIndex;
    
    if (isCorrect) setScore(prev => prev + 1);
    
    setFeedback({
      isCorrect,
      text: currentQ.explanation
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setFeedback(null);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-primary-500" />
        <h2 className="text-2xl font-bold text-slate-700">Generating AI Quiz...</h2>
        <p className="text-slate-500">Preparing fresh questions about democracy.</p>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
            <Award size={48} className="text-white" />
          </div>
          
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Quiz Completed!</h2>
          <p className="text-slate-600 text-lg mb-8">Let's see how well you understand the electoral process.</p>
          
          <div className="flex justify-center items-center gap-4 mb-10">
            <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-200 w-full max-w-xs">
              <span className="block text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Your Score</span>
              <div className="text-5xl font-black text-slate-800">
                {score} <span className="text-2xl text-slate-400 font-medium">/ {questions.length}</span>
              </div>
              <div className={`mt-3 text-sm font-bold ${percentage >= 80 ? 'text-emerald-500' : percentage >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                {percentage}% Accuracy
              </div>
            </div>
          </div>

          <button 
            onClick={generateQuiz}
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md"
          >
            <RefreshCw size={20} />
            Generate New Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Election Knowledge Check</h1>
          <p className="text-slate-500 mt-1">AI-Generated Quiz</p>
        </div>
        <div className="px-4 py-2 bg-primary-100 text-primary-800 font-bold rounded-lg border border-primary-200">
          Question {currentQuestionIdx + 1} of {questions.length}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100">
          <motion.div 
            className="h-full bg-primary-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-6 sm:p-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-snug">
            {currentQ?.question}
          </h2>

          <div className="space-y-4">
            {currentQ?.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrectAnswer = currentQ.correctAnswerIndex === idx;
              
              let buttonStyle = "bg-white border-slate-200 text-slate-700 hover:border-primary-400 hover:bg-slate-50";
              let icon = null;

              if (selectedAnswer !== null) {
                if (isCorrectAnswer) {
                  buttonStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm";
                  icon = <CheckCircle2 size={20} className="text-emerald-600" />;
                } else if (isSelected) {
                  buttonStyle = "bg-red-50 border-red-500 text-red-800 shadow-sm";
                  icon = <XCircle size={20} className="text-red-600" />;
                } else {
                  buttonStyle = "bg-white border-slate-200 text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={selectedAnswer !== null}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex justify-between items-center ${buttonStyle}`}
                >
                  <span className="font-medium text-lg">{option}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className={`p-6 rounded-2xl border ${
                  feedback.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`font-bold flex items-center gap-2 mb-2 ${
                    feedback.isCorrect ? 'text-emerald-700' : 'text-slate-700'
                  }`}>
                    {feedback.isCorrect ? "Correct!" : "Not quite right."}
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    {feedback.text}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 flex justify-end">
            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className={`px-8 py-3.5 rounded-xl font-bold text-white transition-all shadow-md ${
                selectedAnswer !== null 
                  ? 'bg-primary-600 hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-lg' 
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              {currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'View Results'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
