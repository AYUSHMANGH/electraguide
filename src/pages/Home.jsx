import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BrainCircuit, GraduationCap, CheckCircle2, MapPin, ArrowRight } from 'lucide-react';

const Home = () => {
  const features = [
    {
      title: "AI Election Assistant",
      description: "Ask any question about the election process and get simple, step-by-step answers powered by AI.",
      icon: BrainCircuit,
      color: "from-blue-500 to-indigo-500",
      path: "/assistant"
    },
    {
      title: "Interactive Timeline",
      description: "Explore the electoral journey from registration to counting through an interactive visual timeline.",
      icon: GraduationCap,
      color: "from-emerald-500 to-teal-500",
      path: "/timeline"
    },
    {
      title: "Eligibility Checker",
      description: "Quickly verify your eligibility to vote based on your age and citizenship status.",
      icon: MapPin,
      color: "from-orange-500 to-red-500",
      path: "/eligibility"
    },
    {
      title: "Quiz Mode",
      description: "Test your knowledge with AI-generated quizzes and learn more about the democratic process.",
      icon: CheckCircle2,
      color: "from-purple-500 to-pink-500",
      path: "/quiz"
    },
    {
      title: "Local Map",
      description: "Discover the dominating political parties and election landscape in your specific area.",
      icon: MapPin,
      color: "from-blue-600 to-indigo-600",
      path: "/map"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block"
        >
          <span className="px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold tracking-wide uppercase shadow-sm border border-primary-200">
            Powered by Google Gemini AI
          </span>
        </motion.div>
        
        <motion.h1 
          className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Democracy, <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
            Simplified for Everyone.
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-xl text-slate-600 leading-relaxed"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          ElectraGuide is your personal, AI-powered election assistant. 
          Learn how voting works, check your eligibility, and master the electoral process.
        </motion.p>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="pt-4 flex flex-wrap justify-center gap-4"
        >
          <Link to="/assistant" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2">
            Ask AI Assistant <BrainCircuit size={20} />
          </Link>
          <Link to="/timeline" className="px-8 py-3.5 rounded-xl bg-white text-slate-700 font-semibold text-lg shadow-md border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5 transition-all">
            View Timeline
          </Link>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mt-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
          >
            <Link 
              to={feature.path}
              className="group block h-full p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-md`}>
                  <feature.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-primary-600 transition-colors flex items-center gap-2">
                    {feature.title}
                    <ArrowRight size={16} className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  </h3>
                  <p className="mt-2 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
