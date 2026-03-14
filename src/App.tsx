/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  RotateCcw, 
  BookOpen, 
  Trophy,
  Info,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { QUESTIONS } from './data/questions';
import { Question, UserAnswer } from './types';

// --- Components ---

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-8">
    <motion.div 
      className="bg-emerald-500 h-full"
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const colors = {
    Beginner: 'bg-green-100 text-green-700 border-green-200',
    Intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
    Advanced: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[difficulty as keyof typeof colors]}`}>
      {difficulty}
    </span>
  );
};

const ExplanationCard = ({ 
  blank, 
  selectedAnswer, 
  onClose 
}: { 
  blank: any; 
  selectedAnswer: string; 
  onClose: () => void 
}) => {
  const isCorrect = selectedAnswer === blank.correctAnswer;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-6 ${isCorrect ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle2 className="text-emerald-500 w-8 h-8" />
              ) : (
                <XCircle className="text-rose-500 w-8 h-8" />
              )}
              <h3 className="text-xl font-bold text-slate-800">
                {isCorrect ? '太棒了！回答正确' : '别灰心，再接再厉'}
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">正确答案</p>
                <p className="text-lg font-mono font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg inline-block">
                  {blank.correctAnswer}
                </p>
              </div>
              {!isCorrect && (
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">你的选择</p>
                  <p className="text-lg font-mono font-bold text-rose-600 bg-rose-100 px-3 py-1 rounded-lg inline-block">
                    {selectedAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <h4>语法详解</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {blank.explanation.rule}
            </p>
          </section>

          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold">
              <Info className="w-5 h-5 text-amber-500" />
              <h4>典型例句</h4>
            </div>
            <p className="text-slate-600 italic">
              "{blank.explanation.example}"
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold">
              <XCircle className="w-5 h-5 text-rose-400" />
              <h4>常见错误</h4>
            </div>
            <p className="text-slate-600">
              {blank.explanation.commonMistake}
            </p>
          </section>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            继续练习 <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ScoreSummary = ({ score, total, onRestart }: { score: number; total: number; onRestart: () => void }) => {
  const percentage = Math.round((score / total) * 100);
  
  const getMessage = () => {
    if (percentage === 100) return "完美！你已经掌握了这些语法点！";
    if (percentage >= 80) return "非常出色！你的语法基础很扎实。";
    if (percentage >= 60) return "不错哦，继续加油，你会更棒的！";
    return "加油！多练习几次，你一定能掌握。";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center py-12 px-6"
    >
      <div className="mb-8 inline-block p-6 bg-indigo-50 rounded-full">
        <Trophy className="w-20 h-20 text-indigo-500" />
      </div>
      
      <h2 className="text-4xl font-black text-slate-900 mb-4">练习完成！</h2>
      <div className="text-6xl font-black text-indigo-600 mb-6">
        {score} <span className="text-slate-300 text-4xl">/</span> {total}
      </div>
      
      <p className="text-xl text-slate-600 mb-10 max-w-md mx-auto">
        {getMessage()}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-slate-400 font-bold text-sm uppercase mb-2">正确率</h4>
          <p className="text-3xl font-black text-slate-800">{percentage}%</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-slate-400 font-bold text-sm uppercase mb-2">推荐复习</h4>
          <a href="#" className="text-indigo-600 font-bold flex items-center justify-center gap-1 hover:underline">
            复合句结构辨析 <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <button 
        onClick={onRestart}
        className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 mx-auto"
      >
        <RotateCcw className="w-5 h-5" /> 重新开始
      </button>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'start' | 'quiz' | 'result'>('start');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [activeBlankIndex, setActiveBlankIndex] = useState<number | null>(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const categories = useMemo(() => ['All', ...new Set(QUESTIONS.map(q => q.category))], []);
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredQuestions = useMemo(() => {
    return QUESTIONS.filter(q => 
      (selectedCategory === 'All' || q.category === selectedCategory) &&
      (selectedDifficulty === 'All' || q.difficulty === selectedDifficulty)
    );
  }, [selectedCategory, selectedDifficulty]);

  const currentQuestion = filteredQuestions[currentIndex];
  const currentAnswer = userAnswers.find(a => a.questionId === currentQuestion?.id);

  const handleStart = () => {
    if (filteredQuestions.length > 0) {
      setView('quiz');
      setCurrentIndex(0);
      setUserAnswers([]);
      setActiveBlankIndex(0);
    }
  };

  const handleSelectOption = (option: string) => {
    if (currentAnswer?.submitted) return;

    setUserAnswers(prev => {
      const existing = prev.find(a => a.questionId === currentQuestion.id);
      const newAnswers = { ...(existing?.answers || {}), [activeBlankIndex!]: option };
      
      if (existing) {
        return prev.map(a => a.questionId === currentQuestion.id ? { ...a, answers: newAnswers } : a);
      } else {
        return [...prev, { questionId: currentQuestion.id, answers: newAnswers, isCorrect: [], submitted: false }];
      }
    });
  };

  const handleSubmit = () => {
    if (!currentAnswer || Object.keys(currentAnswer.answers).length < currentQuestion.blanks.length) return;

    const isCorrect = currentQuestion.blanks.map((blank, idx) => 
      currentAnswer.answers[idx] === blank.correctAnswer
    );

    setUserAnswers(prev => prev.map(a => 
      a.questionId === currentQuestion.id ? { ...a, isCorrect, submitted: true } : a
    ));

    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setActiveBlankIndex(0);
    } else {
      setView('result');
    }
  };

  const handleRestart = () => {
    setView('start');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setCurrentIndex(0);
    setUserAnswers([]);
    setActiveBlankIndex(0);
    setShowExplanation(false);
  };

  const totalScore = useMemo(() => {
    return userAnswers.reduce((acc, curr) => {
      const correctCount = curr.isCorrect.filter(c => c).length;
      return acc + (correctCount === curr.isCorrect.length && curr.submitted ? 1 : 0);
    }, 0);
  }, [userAnswers]);

  if (view === 'start') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 sm:p-16 text-center"
        >
          <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-200">
            <BookOpen className="text-white w-10 h-10" />
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">English Grammar Master</h1>
          <p className="text-slate-500 text-lg mb-12">提升你的英语复合句辨析能力，掌握地道语法表达。</p>

          <div className="space-y-8 text-left mb-12">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">选择语法分类</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${selectedCategory === cat ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}
                  >
                    {cat === 'All' ? '全部题目' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">选择难度</label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${selectedDifficulty === diff ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}
                  >
                    {diff === 'All' ? '全部难度' : diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl mb-12 flex items-center justify-between">
            <div className="text-left">
              <p className="text-slate-400 text-xs font-bold uppercase">预计题目数量</p>
              <p className="text-2xl font-black text-slate-800">{filteredQuestions.length} 题</p>
            </div>
            <button
              onClick={handleStart}
              disabled={filteredQuestions.length === 0}
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg disabled:opacity-30 flex items-center gap-2"
            >
              开始练习 <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {filteredQuestions.length === 0 && (
            <p className="text-rose-500 font-bold text-sm">当前筛选条件下没有题目，请尝试更改筛选条件。</p>
          )}
        </motion.div>
      </div>
    );
  }

  if (view === 'result') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <ScoreSummary score={totalScore} total={filteredQuestions.length} onRestart={handleRestart} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-bottom border-slate-200 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleRestart} className="bg-indigo-600 p-2 rounded-xl hover:bg-indigo-700 transition-colors">
              <BookOpen className="text-white w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight">Grammar Master</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedCategory === 'All' ? '综合练习' : selectedCategory}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-400">进度</p>
            <p className="text-lg font-black text-indigo-600">{currentIndex + 1} / {filteredQuestions.length}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8">
        <ProgressBar current={currentIndex + 1} total={filteredQuestions.length} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Question Area */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-6">
                <DifficultyBadge difficulty={currentQuestion.difficulty} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{currentQuestion.category}</span>
              </div>

              <div className="text-2xl sm:text-3xl leading-relaxed font-medium text-slate-800 mb-8">
                {currentQuestion.sentenceParts.map((part, idx) => (
                  <React.Fragment key={idx}>
                    {part}
                    {idx < currentQuestion.blanks.length && (
                      <button
                        onClick={() => !currentAnswer?.submitted && setActiveBlankIndex(idx)}
                        className={`
                          mx-2 px-4 py-1 rounded-xl border-2 transition-all min-w-[100px] inline-block text-center
                          ${activeBlankIndex === idx ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-inner' : 'border-slate-200 bg-slate-50 text-slate-400'}
                          ${currentAnswer?.submitted ? (currentAnswer.isCorrect[idx] ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-rose-500 bg-rose-50 text-rose-700') : ''}
                          ${currentAnswer?.answers[idx] ? 'font-bold text-slate-800' : 'italic text-sm'}
                        `}
                      >
                        {currentAnswer?.answers[idx] || '点击填充'}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-400">
                  <Info className="w-4 h-4" />
                  <span className="text-sm">选择最合适的语法结构填充空格</span>
                </div>
                
                {!currentAnswer?.submitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!currentAnswer || Object.keys(currentAnswer.answers).length < currentQuestion.blanks.length}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    提交答案 <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    下一题 <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Options Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 sticky top-24">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Info className="w-4 h-4" /> 备选项
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {activeBlankIndex !== null && currentQuestion.blanks[activeBlankIndex].options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    disabled={currentAnswer?.submitted}
                    className={`
                      w-full p-4 rounded-2xl text-left font-bold transition-all border-2
                      ${currentAnswer?.answers[activeBlankIndex] === option 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                        : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'}
                      ${currentAnswer?.submitted ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {currentAnswer?.submitted && (
                <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-indigo-700 text-sm font-medium mb-3">
                    想了解更多？
                  </p>
                  <button 
                    onClick={() => setShowExplanation(true)}
                    className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    查看详细解析 <Info className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Explanation Modal */}
      <AnimatePresence>
        {showExplanation && activeBlankIndex !== null && (
          <ExplanationCard 
            blank={currentQuestion.blanks[activeBlankIndex]}
            selectedAnswer={currentAnswer?.answers[activeBlankIndex] || ''}
            onClose={() => setShowExplanation(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
