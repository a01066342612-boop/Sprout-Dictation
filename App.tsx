import React, { useState, useEffect } from 'react';
import { DictationItem, StudentResult } from './types';
import { DEFAULT_ITEMS } from './constants';
import { TeacherView } from './components/TeacherView';
import { StudentView } from './components/StudentView';
import { Button } from './components/Button';
import { GraduationCap, RotateCcw, Maximize2, Minimize2, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [items, setItems] = useState<DictationItem[]>(DEFAULT_ITEMS);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Lifted state for synchronization
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playTrigger, setPlayTrigger] = useState(0); // Used to force play audio from teacher view
  
  // Version key to force reset StudentView state
  const [examVersion, setExamVersion] = useState(0);

  // Shared background constant
  const BG_IMAGE = "https://images.unsplash.com/photo-1606092195730-5d7b9af1ef4d?q=80&w=2000&auto=format&fit=crop";

  // Safeguard: Ensure currentIndex is valid when items change
  useEffect(() => {
    if (items.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= items.length) {
      setCurrentIndex(items.length - 1);
    }
  }, [items, currentIndex]);

  const handleStudentComplete = (finalResults: StudentResult[]) => {
    setResults(finalResults);
    setIsExamFinished(true);
  };

  const handleRestartExam = () => {
    setResults([]);
    setIsExamFinished(false);
    setCurrentIndex(0);
    setExamVersion(v => v + 1); // This resets the student view internal state
  };

  // Completely reset everything (Teacher side action)
  const handleResetAll = () => {
    setItems([]);
    setResults([]);
    setIsExamFinished(false);
    setCurrentIndex(0);
    setExamVersion(v => v + 1);
  };

  const handleTeacherSelectQuestion = (index: number) => {
    setCurrentIndex(index);
    setPlayTrigger(prev => prev + 1); // Increment to trigger effect in StudentView
    setIsExamFinished(false); // If looking at results, go back to exam
  };

  const handleStudentNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Logic for finishing is handled inside StudentView's calculation, 
      // but here we just ensure index doesn't overflow visually until complete
    }
  };

  const toggleFullScreen = () => {
    const newState = !isFullScreen;
    setIsFullScreen(newState);
    
    // Attempt browser fullscreen
    if (newState) {
      document.documentElement.requestFullscreen?.().catch(e => console.log('Fullscreen failed:', e));
    } else {
      document.exitFullscreen?.().catch(e => console.log('Exit fullscreen failed:', e));
    }
  };

  const renderResult = () => {
    // In "Notebook Mode", result screen is just a completion celebration and summary
    return (
      <div 
        className="h-full flex items-center justify-center p-4 bg-cover bg-center relative"
        style={{ backgroundImage: `url('${BG_IMAGE}')` }}
      >
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>
        
        <div className="relative z-10 bg-white max-w-lg w-full rounded-3xl shadow-2xl p-8 border-4 border-yellow-300 animate-scale-in">
          <div className="text-center mb-8">
            <GraduationCap size={64} className="mx-auto text-yellow-500 mb-4" />
            <h2 className="text-4xl font-cute text-gray-800 mb-2">받아쓰기 끝!</h2>
            <p className="text-xl text-gray-600 mt-4">
              모든 문제를 다 풀었어요.<br/>
              공책에 쓴 답이 맞는지 확인해보세요.
            </p>
          </div>

          <div className="space-y-3 mb-8 max-h-60 overflow-y-auto pr-2 bg-gray-50 p-4 rounded-xl border-inner">
            {items.map((item, idx) => {
              return (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                   <span className="font-bold bg-green-100 text-green-700 w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0">
                     {idx + 1}
                   </span>
                   <div className="text-lg font-medium text-gray-800">
                     {item.text}
                   </div>
                   <CheckCircle2 className="ml-auto text-green-400" size={20}/>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4">
            <Button variant="primary" className="flex-1 py-4 text-xl" onClick={handleRestartExam}>
              <RotateCcw /> 처음부터 다시하기
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden font-sans">
      {/* Left Panel: Teacher View */}
      {!isFullScreen && (
        <div className="w-full md:w-1/3 h-[40vh] md:h-full flex-shrink-0 z-10 shadow-2xl md:shadow-none transition-all duration-300">
          <TeacherView 
            items={items} 
            setItems={setItems}
            currentQuestionIndex={currentIndex}
            onSelectQuestion={handleTeacherSelectQuestion}
            onResetAll={handleResetAll}
          />
        </div>
      )}

      {/* Right Panel: Student View (or Result) */}
      <div className={`h-[60vh] md:h-full relative transition-all duration-300 ${isFullScreen ? 'w-full' : 'w-full md:w-2/3'}`}>
        {/* Toggle Full Screen Button */}
        <button 
          onClick={toggleFullScreen}
          className="absolute top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md text-gray-500 hover:text-blue-600 hover:bg-white transition-all border border-gray-200"
          title={isFullScreen ? "선생님 화면 보이기" : "학생 화면 전체로 보기"}
        >
          {isFullScreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
        </button>

        {isExamFinished ? renderResult() : (
            <StudentView 
              key={examVersion}
              items={items} 
              onComplete={handleStudentComplete}
              externalCurrentIndex={currentIndex}
              onNextStep={handleStudentNext}
              playTrigger={playTrigger}
            />
        )}
      </div>
    </div>
  );
};

export default App;