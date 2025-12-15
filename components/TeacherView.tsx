import React, { useState } from 'react';
import { DictationItem } from '../types';
import { Button } from './Button';
import { Plus, Trash2, BookOpen, Volume2, Wand2, Loader2, RefreshCw } from 'lucide-react';
import { generateDictationQuestions } from '../services/geminiService';

interface TeacherViewProps {
  items: DictationItem[];
  setItems: React.Dispatch<React.SetStateAction<DictationItem[]>>;
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  onResetAll: () => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({ 
  items, 
  setItems, 
  currentQuestionIndex, 
  onSelectQuestion,
  onResetAll 
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newItem: DictationItem = {
      id: Date.now().toString(),
      text: inputText.trim()
    };

    setItems(prev => [...prev, newItem]);
    setInputText('');
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleResetClick = () => {
    if (window.confirm("모든 문제가 삭제되고 시험이 1번부터 다시 시작됩니다. 정말 초기화 하시겠습니까?")) {
      onResetAll();
    }
  };

  // When teacher clicks, we just select it. StudentView handles the audio.
  const handleItemClick = (index: number) => {
    onSelectQuestion(index);
  };

  const handleAutoGenerate = async (type: 'word' | 'sentence') => {
    setIsGenerating(true);
    try {
      const existingTexts = items.map(item => item.text);
      const newTexts = await generateDictationQuestions(type, 1, existingTexts);
      
      const newItems: DictationItem[] = newTexts.map(text => ({
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        text: text
      }));

      setItems(prev => [...prev, ...newItems]);
    } catch (error) {
      alert("문제 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-green-50 p-4 border-r-4 border-green-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-cute text-green-800 flex items-center gap-2">
          <BookOpen className="text-green-600" /> 선생님 문제집
        </h2>
        
        <div className="flex items-center gap-2">
           <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
            {items.length} 문제
          </span>
          {items.length > 0 && (
            <button 
              type="button"
              onClick={handleResetClick}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all text-sm font-bold shadow-sm"
              title="모든 문제 삭제하고 다시 시작하기"
            >
              <RefreshCw size={14} /> 다시 시작
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-green-200 mb-4">
        <label className="block text-gray-600 font-bold mb-2 font-cute text-sm">
          직접 문제 쓰기
        </label>
        <form onSubmit={handleAddItem} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="예: 학교"
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl text-lg focus:border-green-500 focus:outline-none"
          />
          <Button type="submit" variant="primary" size="sm">
            <Plus size={20} />
          </Button>
        </form>
      </div>

      <div className="bg-blue-50 p-4 rounded-2xl shadow-sm border-2 border-blue-200 mb-4">
        <label className="block text-blue-800 font-bold mb-2 font-cute text-sm flex items-center gap-2">
          <Wand2 size={16} /> AI 자동 문제 만들기 (1개씩)
        </label>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => handleAutoGenerate('word')} 
            variant="secondary" 
            size="sm" 
            className="flex-1 bg-white text-sm"
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={16}/> : "단어 추가"}
          </Button>
          <Button 
            onClick={() => handleAutoGenerate('sentence')} 
            variant="secondary" 
            size="sm" 
            className="flex-1 bg-white text-sm"
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={16}/> : "문장 추가"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-inner border-2 border-gray-100 p-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
            <BookOpen size={40} className="mb-2 opacity-20" />
            <p className="font-cute">문제를 추가하면<br/>학생 화면에 나타나요!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => {
              const isActive = currentQuestionIndex === index;
              return (
                <li 
                  key={item.id} 
                  className={`
                    flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none
                    ${isActive 
                      ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-200 shadow-md transform scale-[1.02]' 
                      : 'bg-gray-50 border-gray-100 hover:bg-green-50 hover:border-green-200'}
                  `}
                  onClick={() => handleItemClick(index)}
                  title="클릭하여 학생에게 들려주기"
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <span className={`
                      font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs flex-shrink-0
                      ${isActive ? 'bg-blue-500 text-white' : 'bg-green-200 text-green-800'}
                    `}>
                      {index + 1}
                    </span>
                    <span className={`text-lg truncate ${isActive ? 'text-blue-800 font-bold' : 'text-gray-800'}`}>
                      {item.text}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {isActive && (
                      <div className="text-blue-500 mr-1 animate-pulse" title="현재 재생 중">
                        <Volume2 size={20} />
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors ml-1"
                      aria-label="삭제"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};