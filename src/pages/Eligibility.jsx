import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Search, ShieldCheck } from 'lucide-react';
import { z } from 'zod';

const eligibilitySchema = z.object({
  age: z.number().int().min(0).max(120),
  citizenship: z.enum(['yes', 'no']),
  residency: z.enum(['yes', 'no']),
  criminalRecord: z.enum(['yes', 'no'])
});

const Eligibility = () => {
  const [formData, setFormData] = useState({
    age: '',
    citizenship: 'yes',
    residency: 'yes',
    criminalRecord: 'no'
  });
  
  const [result, setResult] = useState(null);

  const checkEligibility = (e) => {
    e.preventDefault();
    
    try {
      const validatedData = eligibilitySchema.parse({
        ...formData,
        age: parseInt(formData.age, 10)
      });

      if (validatedData.citizenship === 'no') {
      setResult({ 
        status: 'ineligible', 
        title: 'Not Eligible',
        message: 'You must be a citizen of the country to vote in national elections.',
        action: 'Learn about citizenship requirements'
      });
    } else if (validatedData.age < 18) {
      setResult({ 
        status: 'ineligible',
        title: 'Not Eligible Yet', 
        message: `You must be at least 18 years old to vote. You can register in ${18 - validatedData.age} year(s).`,
        action: 'Learn about pre-registration'
      });
    } else if (validatedData.residency === 'no') {
       setResult({ 
        status: 'warning',
        title: 'Further Action Required', 
        message: 'You may need to establish residency or apply for an absentee ballot if you live abroad.',
        action: 'View absentee voting guidelines'
      });
    } else {
      setResult({ 
        status: 'eligible', 
        title: 'You are Eligible!',
        message: 'Based on the information provided, you meet the basic requirements to vote.',
        action: 'Register to vote now'
      });
    }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setResult({ status: 'error', title: 'Invalid Input', message: 'Please check your inputs and try again.', action: null });
      } else {
        setResult({ status: 'error', title: 'Error', message: 'An unexpected error occurred.', action: null });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Reset result when user changes input
    if (result) setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-red-100 text-red-600 rounded-2xl mb-4 shadow-sm">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Voter Eligibility Checker</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Not sure if you can vote? Answer a few quick questions to find out your eligibility status instantly.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8"
        >
          <form onSubmit={checkEligibility} className="space-y-6">
            <div>
              <label htmlFor="age" className="block text-sm font-semibold text-slate-700 mb-2">
                What is your age?
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="0"
                max="120"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-shadow text-slate-900 bg-slate-50 focus:bg-white"
                placeholder="e.g. 25"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Are you a citizen of the country where you wish to vote?
              </label>
              <div className="flex gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors has-[:checked]:bg-red-50 has-[:checked]:border-red-500 has-[:checked]:text-red-700 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="citizenship"
                    value="yes"
                    checked={formData.citizenship === 'yes'}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <span className="font-medium">Yes</span>
                </label>
                <label className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors has-[:checked]:bg-slate-100 has-[:checked]:border-slate-500 has-[:checked]:text-slate-700 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="citizenship"
                    value="no"
                    checked={formData.citizenship === 'no'}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <span className="font-medium">No</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Are you a resident of the district/state you want to vote in?
              </label>
              <div className="flex gap-4">
                 <label className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors has-[:checked]:bg-red-50 has-[:checked]:border-red-500 has-[:checked]:text-red-700 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="residency"
                    value="yes"
                    checked={formData.residency === 'yes'}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <span className="font-medium">Yes</span>
                </label>
                <label className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors has-[:checked]:bg-slate-100 has-[:checked]:border-slate-500 has-[:checked]:text-slate-700 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="residency"
                    value="no"
                    checked={formData.residency === 'no'}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <span className="font-medium">No</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-lg shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Search size={20} />
              Check Eligibility
            </button>
          </form>
        </motion.div>

        {/* Results Section */}
        <div className="h-full">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50/50 min-h-[300px]"
              >
                <ShieldCheck size={48} className="text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">Fill out the form to see your eligibility status</p>
                <p className="text-sm text-slate-400 mt-2 max-w-xs">Note: This tool provides general guidance. Official rules vary by jurisdiction.</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className={`h-full flex flex-col justify-center p-8 rounded-3xl shadow-xl text-center relative overflow-hidden ${
                  result.status === 'eligible' 
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' 
                    : result.status === 'warning'
                    ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white'
                    : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 border border-slate-300'
                }`}
              >
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-6">
                    {result.status === 'eligible' && <CheckCircle2 size={80} className="text-white drop-shadow-md" />}
                    {result.status === 'warning' && <AlertCircle size={80} className="text-white drop-shadow-md" />}
                    {result.status === 'ineligible' && <XCircle size={80} className="text-slate-400 drop-shadow-sm" />}
                    {result.status === 'error' && <AlertCircle size={80} className="text-red-500 drop-shadow-sm" />}
                  </div>
                  
                  <h2 className={`text-3xl font-extrabold mb-4 ${result.status === 'ineligible' ? 'text-slate-800' : ''}`}>
                    {result.title}
                  </h2>
                  
                  <p className={`text-lg mb-8 ${result.status === 'eligible' || result.status === 'warning' ? 'text-white/90' : 'text-slate-600'}`}>
                    {result.message}
                  </p>
                  
                  {result.action && (
                    <button className={`px-6 py-3 rounded-full font-bold shadow-md transition-transform hover:-translate-y-0.5 ${
                      result.status === 'eligible' || result.status === 'warning'
                        ? 'bg-white text-slate-900' 
                        : 'bg-slate-800 text-white'
                    }`}>
                      {result.action}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Eligibility;
