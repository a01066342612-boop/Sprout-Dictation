import React, { useState, useEffect } from 'react';
import { DictationItem, StudentResult } from '../types';
import { playTextToSpeech } from '../services/geminiService';
import { Button } from './Button';
import { Volume2, ArrowRight, PenTool, Ear, Eye, List, X, Printer, Type, Star, Palette, Shuffle, Image as ImageIcon } from 'lucide-react';

interface StudentViewProps {
  items: DictationItem[];
  onComplete: (results: StudentResult[]) => void;
  externalCurrentIndex: number;
  onNextStep: () => void;
  playTrigger: number;
}

const FONTS = [
  { name: '기본글씨', value: "'Jua', sans-serif" },
  { name: '손글씨', value: "'Gaegu', cursive" },
  { name: '반듯반듯', value: "'Gowun Dodum', sans-serif" },
  { name: '펜글씨', value: "'Nanum Pen Script', cursive" },
  { name: '귀여운날', value: "'Single Day', cursive" },
  { name: '멜로디', value: "'Hi Melody', cursive" },
  { name: '감자꽃', value: "'Gamja Flower', cursive" },
  { name: '동글동글', value: "'Dongle', sans-serif" },
  { name: '해바라기', value: "'Sunflower', sans-serif" },
  { name: '도현체', value: "'Do Hyeon', sans-serif" },
  { name: '연성체', value: "'Yeon Sung', cursive" },
  { name: '푸어스토리', value: "'Poor Story', cursive" },
];

const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Dongle&family=Gaegu:wght@400;700&family=Gamja+Flower&family=Gowun+Dodum&family=Hi+Melody&family=Jua&family=Nanum+Pen+Script&family=Noto+Sans+KR:wght@400;700&family=Poor+Story&family=Single+Day&family=Sunflower:wght@300&family=Yeon+Sung&display=swap";

const BACKGROUNDS = [
  { name: '기본', url: "https://images.unsplash.com/photo-1618588507085-c79565432917?q=80&w=2000&auto=format&fit=crop" },
  { name: '학교', url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2000&auto=format&fit=crop" },
  { name: '들판', url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop" },
  { name: '하늘', url: "https://images.unsplash.com/photo-1595878715977-2e8f8df18ea8?q=80&w=2000&auto=format&fit=crop" },
  { name: '책상', url: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=2000&auto=format&fit=crop" },
  { name: '미술', url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=2000&auto=format&fit=crop" },
  { name: '우주', url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop" },
  { name: '바다', url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop" },
  { name: '놀이터', url: "https://images.unsplash.com/photo-1562635038-00dc188d3745?q=80&w=2000&auto=format&fit=crop" },
  { name: '도서관', url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop" },
  { name: '벚꽃', url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=2000&auto=format&fit=crop" },
  { name: '소풍', url: "https://images.unsplash.com/photo-1558190520-a6e5452d1947?q=80&w=2000&auto=format&fit=crop" },
  { name: '비', url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2000&auto=format&fit=crop" },
  { name: '숲', url: "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=2000&auto=format&fit=crop" },
  { name: '도시', url: "https://images.unsplash.com/photo-1449824913929-203a13284948?q=80&w=2000&auto=format&fit=crop" },
  { name: '무지개', url: "https://images.unsplash.com/photo-1579051564724-42b78ce13b63?q=80&w=2000&auto=format&fit=crop" },
  { name: '과일', url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2000&auto=format&fit=crop" },
  { name: '캠핑', url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2000&auto=format&fit=crop" },
];

const THEMES = [
  { id: 'notebook', name: '공책', bg: 'bg-white', border: 'border-yellow-200', shadow: 'shadow-[0_15px_30px_rgba(0,0,0,0.1)]', textColor: 'text-gray-700' },
  { id: 'bear', name: '곰돌이', bg: 'bg-amber-100', border: 'border-amber-400', shadow: 'shadow-amber-200', textColor: 'text-amber-900' },
  { id: 'rabbit', name: '토끼', bg: 'bg-pink-100', border: 'border-pink-300', shadow: 'shadow-pink-200', textColor: 'text-pink-900' },
  { id: 'frog', name: '개구리', bg: 'bg-green-100', border: 'border-green-400', shadow: 'shadow-green-200', textColor: 'text-green-900' },
  { id: 'cat', name: '고양이', bg: 'bg-orange-100', border: 'border-orange-300', shadow: 'shadow-orange-200', textColor: 'text-orange-900' },
  { id: 'blackboard', name: '칠판', bg: 'bg-[#2F4F4F]', border: 'border-[#8B4513]', shadow: 'shadow-gray-700', textColor: 'text-white' },
  { id: 'tv', name: '텔레비전', bg: 'bg-gray-100', border: 'border-gray-500', shadow: 'shadow-gray-400', textColor: 'text-gray-800' },
  { id: 'cloud', name: '구름', bg: 'bg-sky-50', border: 'border-sky-300', shadow: 'shadow-sky-200', textColor: 'text-sky-600' },
  { id: 'robot', name: '로봇', bg: 'bg-slate-200', border: 'border-slate-500', shadow: 'shadow-slate-400', textColor: 'text-slate-800' },
  { id: 'space', name: '우주', bg: 'bg-indigo-900', border: 'border-indigo-400', shadow: 'shadow-indigo-800', textColor: 'text-white' },
  { id: 'ocean', name: '바다', bg: 'bg-cyan-100', border: 'border-cyan-400', shadow: 'shadow-cyan-200', textColor: 'text-cyan-900' },
  { id: 'jungle', name: '정글', bg: 'bg-emerald-100', border: 'border-emerald-500', shadow: 'shadow-emerald-200', textColor: 'text-emerald-900' },
  { id: 'candy', name: '사탕나라', bg: 'bg-rose-50', border: 'border-rose-300', shadow: 'shadow-rose-200', textColor: 'text-rose-600' },
  { id: 'dino', name: '공룡', bg: 'bg-stone-200', border: 'border-stone-500', shadow: 'shadow-stone-400', textColor: 'text-stone-800' },
  { id: 'magic', name: '마법', bg: 'bg-violet-100', border: 'border-violet-400', shadow: 'shadow-violet-200', textColor: 'text-violet-900' },
  { id: 'construction', name: '공사장', bg: 'bg-yellow-100', border: 'border-yellow-600', shadow: 'shadow-yellow-500', textColor: 'text-yellow-900' },
  { id: 'rainbow', name: '무지개', bg: 'bg-white', border: 'border-purple-300', shadow: 'shadow-purple-200', textColor: 'text-indigo-600' },
  { id: 'winter', name: '겨울왕국', bg: 'bg-sky-50', border: 'border-sky-200', shadow: 'shadow-sky-100', textColor: 'text-sky-600' },
  { id: 'bricks', name: '블록', bg: 'bg-red-50', border: 'border-red-500', shadow: 'shadow-red-300', textColor: 'text-red-800' },
];

export const StudentView: React.FC<StudentViewProps> = ({ 
  items, 
  onComplete, 
  externalCurrentIndex, 
  onNextStep, 
  playTrigger 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0); 
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [currentFontIndex, setCurrentFontIndex] = useState(0);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const currentItem = items[externalCurrentIndex];
  const currentTheme = THEMES[currentThemeIndex];
  const currentBg = BACKGROUNDS[currentBgIndex];
  
  useEffect(() => {
    setIsAnswerVisible(false);
    setPlayCount(0);
  }, [externalCurrentIndex]);

  useEffect(() => {
    if (items[externalCurrentIndex]) {
       handlePlayAudio(items[externalCurrentIndex], externalCurrentIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalCurrentIndex, playTrigger, items]);

  const handlePlayAudio = async (item: DictationItem = currentItem, index: number = externalCurrentIndex) => {
    if (!item) return;
    
    setIsPlaying(true);
    setPlayCount(prev => prev + 1);
    try {
      const speechText = `${index + 1}번. ${item.text}`;
      await playTextToSpeech(speechText);
    } catch (error) {
      console.error("Audio error", error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (!currentItem) return;
    const newResult: StudentResult = {
      itemId: currentItem.id,
      userAnswer: currentItem.text,
      isCorrect: true,
      playCount: playCount
    };
    const newResults = [...results, newResult];
    setResults(newResults);
    if (externalCurrentIndex < items.length - 1) {
      onNextStep();
    } else {
      onComplete(newResults);
    }
  };

  const toggleFont = () => {
    setCurrentFontIndex((prev) => (prev + 1) % FONTS.length);
  };

  const toggleTheme = () => {
    setCurrentThemeIndex((prev) => (prev + 1) % THEMES.length);
  };

  const handleRandomTheme = () => {
    let nextIndex = Math.floor(Math.random() * THEMES.length);
    if (THEMES.length > 1 && nextIndex === currentThemeIndex) {
      nextIndex = (nextIndex + 1) % THEMES.length;
    }
    setCurrentThemeIndex(nextIndex);
  };

  const toggleBackground = () => {
    setCurrentBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
  };

  const handleRandomBackground = () => {
    let nextIndex = Math.floor(Math.random() * BACKGROUNDS.length);
    if (BACKGROUNDS.length > 1 && nextIndex === currentBgIndex) {
      nextIndex = (nextIndex + 1) % BACKGROUNDS.length;
    }
    setCurrentBgIndex(nextIndex);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("팝업 차단을 해제해주세요.");
      return;
    }
    const currentFontValue = FONTS[currentFontIndex].value;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>받아쓰기 정답표</title>
          <link href="${GOOGLE_FONTS_URL}" rel="stylesheet">
          <style>
            body { 
              font-family: ${currentFontValue}; 
              padding: 40px; 
              max-width: 800px; 
              margin: 0 auto; 
              border: 5px dashed #FCD34D; 
              border-radius: 30px; 
              margin-top: 20px;
            }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px dashed #FCD34D; padding-bottom: 20px; }
            h1 { color: #F59E0B; font-size: 40px; margin: 0; }
            .date { color: #6B7280; margin-top: 10px; font-family: ${currentFontValue}; font-size: 20px; }
            ul { list-style: none; padding: 0; }
            li { padding: 15px 20px; border-bottom: 1px dashed #E5E7EB; font-size: 24px; display: flex; align-items: center; }
            .number { color: #F59E0B; margin-right: 20px; width: 60px; display: inline-block; font-weight: bold; }
            .content { color: #1F2937; }
            .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #9CA3AF; font-family: ${currentFontValue}; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌱 새싹 받아쓰기 정답표</h1>
            <div class="date">${new Date().toLocaleDateString()}</div>
          </div>
          <ul>
            ${items.map((item, idx) => `
              <li>
                <span class="number">${idx + 1}번</span>
                <span class="content">${item.text}</span>
              </li>
            `).join('')}
          </ul>
          <div class="footer">
            새싹 받아쓰기 - 초등학교 1학년을 위한 AI 받아쓰기 친구
          </div>
          <script>
            // Wait for fonts to load
            document.fonts.ready.then(function() {
              window.print();
            });
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (items.length === 0) {
    return (
      <div 
        className="h-full flex flex-col items-center justify-center p-8 text-center bg-cover bg-center relative"
        style={{ backgroundImage: `url('${currentBg.url}')` }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
        <div className="relative z-10 flex flex-col items-center animate-bounce">
            <div className="bg-white p-8 rounded-full shadow-[0_10px_0_rgba(0,0,0,0.1)] mb-6 border-4 border-yellow-300">
                <Star size={64} className="text-yellow-400 fill-yellow-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2 drop-shadow-sm">선생님을 기다리고 있어요</h2>
            <p className="text-gray-600 text-2xl font-bold bg-white/80 px-6 py-2 rounded-full shadow-sm">왼쪽에서 문제를 만들어주세요!</p>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return <div className="p-10 text-center font-bold text-2xl">문제를 불러오는 중...</div>;
  }

  // --- External Decorations (Behind the card) ---
  const renderExternalExtras = () => {
    switch(currentTheme.id) {
      case 'bear':
        return (
          <>
            <div className="absolute -top-12 left-10 w-24 h-24 bg-amber-400 rounded-full border-4 border-amber-500 z-0"></div>
            <div className="absolute -top-12 right-10 w-24 h-24 bg-amber-400 rounded-full border-4 border-amber-500 z-0"></div>
          </>
        );
      case 'rabbit':
        return (
          <>
             <div className="absolute -top-24 left-10 w-20 h-40 bg-pink-100 rounded-full border-4 border-pink-300 z-0 transform -rotate-12"></div>
             <div className="absolute -top-24 right-10 w-20 h-40 bg-pink-100 rounded-full border-4 border-pink-300 z-0 transform rotate-12"></div>
          </>
        );
      case 'frog':
        return (
          <>
             <div className="absolute -top-16 left-16 w-24 h-24 bg-green-100 rounded-full border-4 border-green-400 z-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-black rounded-full absolute top-6">
                   <div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1"></div>
                </div>
             </div>
             <div className="absolute -top-16 right-16 w-24 h-24 bg-green-100 rounded-full border-4 border-green-400 z-0 flex items-center justify-center">
                 <div className="w-8 h-8 bg-black rounded-full absolute top-6">
                   <div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1"></div>
                </div>
             </div>
          </>
        );
      case 'cat':
        return (
          <>
             <div className="absolute -top-12 left-6 w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[80px] border-b-orange-300 transform -rotate-12 z-0"></div>
             <div className="absolute -top-12 right-6 w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[80px] border-b-orange-300 transform rotate-12 z-0"></div>
          </>
        );
      case 'blackboard':
        return (
          <>
             <div className="absolute -bottom-8 left-10 right-10 h-8 bg-[#5D4037] rounded-sm shadow-xl z-20 flex items-center justify-between px-6 border-t border-[#3E2723]">
                <div className="flex gap-2">
                    <div className="w-12 h-2 bg-white rounded-full opacity-90 rotate-1 shadow-sm"></div>
                    <div className="w-8 h-2 bg-yellow-200 rounded-full opacity-90 -rotate-2 shadow-sm"></div>
                </div>
                <div className="w-16 h-5 bg-blue-900 rounded-sm border-b-4 border-blue-950 shadow-sm relative">
                    <div className="absolute inset-x-0 top-0 h-2 bg-blue-800 rounded-t-sm"></div>
                </div>
             </div>
          </>
        );
      case 'tv':
        return (
           <>
              <div className="absolute -top-20 left-1/2 w-2 h-24 bg-gray-400 -translate-x-full -rotate-[20deg] transform origin-bottom z-0">
                  <div className="w-3 h-3 bg-red-500 rounded-full absolute top-0 -left-0.5"></div>
              </div>
              <div className="absolute -top-20 left-1/2 w-2 h-24 bg-gray-400 translate-x-0 rotate-[20deg] transform origin-bottom z-0">
                  <div className="w-3 h-3 bg-red-500 rounded-full absolute top-0 -left-0.5"></div>
              </div>
              <div className="absolute -top-4 left-1/2 w-20 h-6 bg-gray-500 -translate-x-1/2 rounded-t-xl z-0"></div>
              <div className="absolute -bottom-10 left-16 w-6 h-12 bg-gray-600 -rotate-12 rounded-full z-0 border-4 border-gray-400"></div>
              <div className="absolute -bottom-10 right-16 w-6 h-12 bg-gray-600 rotate-12 rounded-full z-0 border-4 border-gray-400"></div>
           </>
        );
      case 'cloud':
        return (
          <>
             <div className="absolute -top-12 left-8 w-40 h-40 bg-sky-50 border-4 border-sky-300 rounded-full z-0"></div>
             <div className="absolute -top-16 right-16 w-48 h-48 bg-sky-50 border-4 border-sky-300 rounded-full z-0"></div>
             <div className="absolute -bottom-10 left-20 w-44 h-44 bg-sky-50 border-4 border-sky-300 rounded-full z-0"></div>
             <div className="absolute -bottom-12 -right-4 w-40 h-40 bg-sky-50 border-4 border-sky-300 rounded-full z-0"></div>
          </>
        );
      case 'robot':
        return (
          <>
              <div className="absolute -top-16 left-1/2 w-3 h-16 bg-slate-400 -translate-x-1/2 z-0 border-x border-slate-500"></div>
              <div className="absolute -top-20 left-1/2 w-8 h-8 bg-yellow-400 rounded-full -translate-x-1/2 border-4 border-slate-500 shadow-md z-0 animate-pulse"></div>
              <div className="absolute top-1/2 -left-8 w-10 h-16 bg-slate-300 border-4 border-slate-500 rounded-l-lg -translate-y-1/2 shadow-lg flex flex-col justify-around py-2 items-center">
                  <div className="w-full h-1 bg-slate-400"></div>
                  <div className="w-full h-1 bg-slate-400"></div>
              </div>
              <div className="absolute top-1/2 -right-8 w-10 h-16 bg-slate-300 border-4 border-slate-500 rounded-r-lg -translate-y-1/2 shadow-lg flex flex-col justify-around py-2 items-center">
                   <div className="w-full h-1 bg-slate-400"></div>
                   <div className="w-full h-1 bg-slate-400"></div>
              </div>
          </>
        );
      case 'space':
        return (
          <>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] border-[20px] border-indigo-200/20 rounded-full z-0 pointer-events-none transform -rotate-12"></div>
             <div className="absolute -top-10 -right-10 w-20 h-20 bg-yellow-200 rounded-full blur-md opacity-50 z-0"></div>
          </>
        );
      case 'ocean':
        return (
           <>
              <div className="absolute -top-10 left-10 w-10 h-10 bg-cyan-200/50 rounded-full border-2 border-cyan-300 z-0 animate-bounce delay-700"></div>
              <div className="absolute -top-20 right-20 w-16 h-16 bg-cyan-200/50 rounded-full border-2 border-cyan-300 z-0 animate-bounce"></div>
              <div className="absolute top-1/2 -right-12 w-12 h-12 bg-pink-200 rounded-full opacity-80 z-0 shadow-sm border border-pink-300">
                   <div className="absolute bottom-0 right-0 w-full h-full border-b-4 border-r-4 border-pink-300 rounded-full"></div>
              </div>
           </>
        );
      case 'jungle':
        return (
          <>
             <div className="absolute -bottom-8 left-0 w-32 h-32 bg-emerald-500 rounded-full z-10 border-4 border-emerald-600"></div>
             <div className="absolute -bottom-12 left-20 w-32 h-32 bg-emerald-400 rounded-full z-0 border-4 border-emerald-500"></div>
             <div className="absolute -top-10 right-0 w-24 h-48 bg-emerald-600 rounded-full -rotate-45 z-0 border-4 border-emerald-700"></div>
          </>
        );
      case 'candy':
        return (
           <>
             <div className="absolute -top-12 left-10 w-24 h-24 bg-pink-300 rounded-full border-4 border-white shadow-md z-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-white rounded-full border-dashed"></div>
             </div>
             <div className="absolute -top-8 right-10 w-16 h-16 bg-yellow-300 rounded-full border-4 border-white shadow-md z-0"></div>
           </>
        );
      case 'dino':
        return (
           <>
             {/* Spikes on back */}
             <div className="absolute -top-10 left-1/4 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[40px] border-b-stone-400 z-0"></div>
             <div className="absolute -top-12 left-1/2 w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-b-[50px] border-b-stone-400 z-0"></div>
             <div className="absolute -top-10 left-3/4 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[40px] border-b-stone-400 z-0"></div>
           </>
        );
      case 'magic':
        return (
           <>
             <div className="absolute -top-24 left-10 w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[100px] border-b-violet-500 transform -rotate-12 z-0"></div>
             <div className="absolute -top-10 left-0 w-28 h-8 bg-violet-600 rounded-full -rotate-12 z-0 border-2 border-violet-300"></div>
           </>
        );
      case 'construction':
        return (
           <>
             <div className="absolute -top-6 left-0 right-0 h-6 bg-yellow-400 z-0 border-y-2 border-black" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, #fbbf24 10px, #fbbf24 20px)'}}></div>
             <div className="absolute -bottom-6 left-0 right-0 h-6 bg-yellow-400 z-0 border-y-2 border-black" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, #fbbf24 10px, #fbbf24 20px)'}}></div>
           </>
        );
      case 'rainbow':
        return (
           <>
             <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-transparent border-t-[20px] border-red-400 rounded-t-full z-0"></div>
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-52 h-26 bg-transparent border-t-[20px] border-yellow-400 rounded-t-full z-0"></div>
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-40 h-20 bg-transparent border-t-[20px] border-green-400 rounded-t-full z-0"></div>
           </>
        );
      case 'winter':
        return (
           <>
             <div className="absolute -top-16 right-10 w-24 h-24 bg-white rounded-full shadow-sm z-0 border-2 border-sky-100"></div>
             <div className="absolute -top-24 right-12 w-16 h-16 bg-white rounded-full shadow-sm z-0 border-2 border-sky-100"></div>
             <div className="absolute -top-10 left-10 text-6xl text-sky-200 opacity-80">❄️</div>
           </>
        );
      case 'bricks':
        return (
           <>
             <div className="absolute -top-6 left-10 w-20 h-8 bg-red-600 rounded-t-lg border-x-2 border-t-2 border-red-700 z-0"></div>
             <div className="absolute -top-6 left-36 w-20 h-8 bg-red-600 rounded-t-lg border-x-2 border-t-2 border-red-700 z-0"></div>
             <div className="absolute -top-6 right-10 w-20 h-8 bg-red-600 rounded-t-lg border-x-2 border-t-2 border-red-700 z-0"></div>
           </>
        );
      default:
        return null;
    }
  };

  // --- Internal Decorations (Inside the card) ---
  const renderInternalExtras = () => {
    switch(currentTheme.id) {
        case 'notebook':
            return (
                <>
                    <div className="absolute top-0 bottom-0 left-12 w-[2px] bg-red-300 opacity-60 z-0"></div>
                    <div className="absolute inset-0 opacity-40 z-0" style={{
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 39px, #60A5FA 40px)',
                        backgroundPosition: '0 30px'
                    }}></div>
                </>
            );
        case 'blackboard':
            return (
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                    backgroundSize: '15px 15px'
                }}></div>
            );
        case 'tv':
            return (
                <div className="absolute inset-0 z-0 opacity-5 pointer-events-none rounded-[2.5rem]" style={{
                     background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 3px)'
                }}></div>
            );
        case 'robot':
            return (
                <div className="absolute inset-4 border-2 border-slate-300 rounded-[2.5rem] opacity-50 z-0 pointer-events-none"></div>
            );
        case 'space':
             return (
                 <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{
                     backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
                     backgroundSize: '30px 30px'
                 }}></div>
             );
        case 'ocean':
             return (
                 <>
                   <div className="absolute bottom-4 left-10 w-4 h-4 rounded-full border-2 border-cyan-500 opacity-40"></div>
                   <div className="absolute bottom-10 left-14 w-6 h-6 rounded-full border-2 border-cyan-500 opacity-40"></div>
                 </>
             );
        case 'jungle':
             return (
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-bl-[4rem] z-0"></div>
             );
        case 'candy':
             return (
                 <div className="absolute inset-0 opacity-20 z-0" style={{
                     backgroundImage: 'radial-gradient(#f43f5e 2px, transparent 2px)',
                     backgroundSize: '20px 20px'
                 }}></div>
             );
        case 'construction':
             return (
                 <div className="absolute inset-4 border-4 border-dashed border-yellow-500 rounded-[2rem] opacity-30 z-0"></div>
             );
        case 'bricks':
             return (
                 <div className="absolute inset-0 z-0 opacity-10" style={{
                     backgroundImage: 'radial-gradient(circle, #000 5px, transparent 6px)',
                     backgroundSize: '30px 30px'
                 }}></div>
             );
        default:
            return null;
    }
  };

  return (
    <div 
      className="h-full flex flex-col p-4 md:p-6 bg-cover bg-center relative overflow-hidden"
      style={{ 
        backgroundImage: `url('${currentBg.url}')`,
        fontFamily: FONTS[currentFontIndex].value 
      }}
    >
      {/* Soft Overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-0"></div>

      {/* Header Area */}
      <div className="relative z-10 flex flex-wrap justify-between items-start mb-4 gap-2">
        <div className="bg-white/90 px-6 py-3 rounded-[2rem] shadow-[0_4px_0_rgba(0,0,0,0.1)] border-2 border-white transform rotate-1">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-700 flex items-center gap-2">
                🌱 받아쓰기
             </h2>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center justify-end">
            <button 
                onClick={toggleTheme}
                className="bg-white hover:bg-purple-50 px-4 py-2 rounded-xl shadow-[0_3px_0_rgba(0,0,0,0.1)] border-2 border-purple-100 text-purple-700 font-bold active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                title="테마 바꾸기"
            >
                <Palette size={18}/> {currentTheme.name}
            </button>
            <button
                onClick={handleRandomTheme}
                className="bg-white hover:bg-pink-50 px-4 py-2 rounded-xl shadow-[0_3px_0_rgba(0,0,0,0.1)] border-2 border-pink-100 text-pink-500 font-bold active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                title="테마 랜덤"
            >
                <Shuffle size={18}/>
            </button>

            <div className="w-[1px] h-8 bg-gray-300 mx-1"></div>

            <button 
                onClick={toggleBackground}
                className="bg-white hover:bg-blue-50 px-4 py-2 rounded-xl shadow-[0_3px_0_rgba(0,0,0,0.1)] border-2 border-blue-100 text-blue-600 font-bold active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                title="배경 바꾸기"
            >
                <ImageIcon size={18}/> {currentBg.name}
            </button>
            <button
                onClick={handleRandomBackground}
                className="bg-white hover:bg-indigo-50 px-4 py-2 rounded-xl shadow-[0_3px_0_rgba(0,0,0,0.1)] border-2 border-indigo-100 text-indigo-500 font-bold active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                title="배경 랜덤"
            >
                <Shuffle size={18}/>
            </button>

            <div className="w-[1px] h-8 bg-gray-300 mx-1"></div>

            <button 
                onClick={toggleFont}
                className="bg-white hover:bg-yellow-50 px-4 py-2 rounded-xl shadow-[0_3px_0_rgba(0,0,0,0.1)] border-2 border-yellow-100 text-yellow-700 font-bold active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
            >
                <Type size={18}/> {FONTS[currentFontIndex].name}
            </button>
            <button 
                onClick={() => setShowAllAnswers(true)}
                className="bg-white hover:bg-green-50 px-4 py-2 rounded-xl shadow-[0_3px_0_rgba(0,0,0,0.1)] border-2 border-green-100 text-green-700 font-bold active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
            >
                <List size={18}/> 정답
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 max-w-4xl mx-auto w-full pt-10">
        
        {/* Dynamic Question Card Container - Increased Size */}
        <div className="relative w-full max-w-2xl mx-auto flex justify-center items-center">
            
            {/* The Ears/Extras layer behind the main box */}
            <div className="absolute top-0 w-full h-full flex justify-center">
                 <div className="relative w-full h-full max-w-[90%]">
                    {renderExternalExtras()}
                 </div>
            </div>

            {/* Main Card */}
            <div 
              onClick={() => handlePlayAudio()}
              className={`
                relative z-10 w-full aspect-[16/10] ${currentTheme.bg} rounded-[3rem] ${currentTheme.shadow}
                overflow-hidden cursor-pointer group transition-transform active:scale-[0.98]
                border-8 ${currentTheme.border} flex flex-col items-center justify-center
              `}
            >
              {/* Internal Decorations (Lines, Textures) */}
              {renderInternalExtras()}

              {/* Content Inside the Card */}
              <div className="relative z-20 flex flex-col items-center justify-center p-6 w-full h-full">
                  <span className={`font-bold text-7xl md:text-9xl ${currentTheme.textColor} drop-shadow-sm mb-6 mt-4`}>
                    {externalCurrentIndex + 1}번
                  </span>
                  
                  <div className={`
                     flex items-center gap-3 text-3xl md:text-4xl font-bold px-8 py-4 rounded-full transition-all
                     ${isPlaying 
                        ? 'bg-blue-100 text-blue-600 scale-110 shadow-lg border-2 border-blue-200' 
                        : 'bg-white/80 text-gray-600 border-2 border-transparent group-hover:bg-white group-hover:text-black group-hover:border-current'}
                  `}>
                    {isPlaying ? (
                      <>🔊 읽어주는 중...</>
                    ) : (
                      <>👂 다시 듣기</>
                    )}
                  </div>
              </div>

               {/* Play Count Badge */}
               {playCount > 0 && (
                 <div className="absolute top-6 right-6 bg-yellow-400 text-white w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl shadow-md transform rotate-12 border-4 border-white z-30">
                    {playCount}
                 </div>
              )}
            </div>
        </div>

        <p className="text-gray-600 font-bold text-2xl bg-white/60 px-6 py-2 rounded-full mt-4 backdrop-blur-sm">
           공책에 또박또박 써보세요 ✏️
        </p>

        {/* Big Action Buttons (Sticker Style) */}
        <div className="w-full flex flex-col gap-4 items-center mt-2">
            {!isAnswerVisible ? (
                <button 
                    onClick={() => setIsAnswerVisible(true)} 
                    className="w-full max-w-lg bg-yellow-400 hover:bg-yellow-500 text-white text-4xl font-bold py-6 rounded-[2rem] shadow-[0_8px_0_#b45309] active:shadow-none active:translate-y-[8px] transition-all flex items-center justify-center gap-3 border-4 border-yellow-300"
                >
                    <Eye size={40} /> 정답 확인하기
                </button>
            ) : (
                <div className="w-full max-w-lg flex flex-col gap-4 animate-scale-in">
                    <div className="bg-white p-8 rounded-[2rem] border-4 border-dashed border-green-400 text-center shadow-lg relative transform -rotate-1">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-xl font-bold shadow-sm">
                            정답이에요!
                        </div>
                        <div className="text-6xl md:text-7xl font-bold text-gray-800 break-keep leading-tight pt-4 pb-2">
                            {currentItem.text}
                        </div>
                    </div>
                    <button 
                        onClick={handleNext} 
                        className="w-full bg-green-500 hover:bg-green-600 text-white text-4xl font-bold py-6 rounded-[2rem] shadow-[0_8px_0_#15803d] active:shadow-none active:translate-y-[8px] transition-all flex items-center justify-center gap-3 border-4 border-green-400"
                    >
                        다음 문제 <ArrowRight size={40} />
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Full Screen Answer Modal */}
      {showAllAnswers && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in" style={{ fontFamily: FONTS[currentFontIndex].value }}>
              <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-8 border-yellow-300 relative">
                  {/* Modal Header */}
                  <div className="bg-yellow-300 p-5 flex justify-between items-center relative z-10 shadow-sm">
                      <h3 className="text-3xl font-bold text-yellow-900 flex items-center gap-3">
                          📒 전체 정답표
                      </h3>
                      <div className="flex gap-2">
                          <button 
                             onClick={handlePrint}
                             className="bg-white text-yellow-800 p-2 rounded-xl shadow-[0_3px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1 hover:bg-yellow-50 transition-all font-bold text-lg px-4 flex items-center gap-2"
                          >
                             <Printer size={20}/> 인쇄하기
                          </button>
                          <button 
                             onClick={() => setShowAllAnswers(false)}
                             className="bg-white text-yellow-800 p-2 rounded-xl shadow-[0_3px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1 hover:bg-yellow-50 transition-all"
                          >
                             <X size={24} />
                          </button>
                      </div>
                  </div>
                  
                  {/* Modal List Content */}
                  <div className="p-6 overflow-y-auto flex-1 bg-yellow-50 custom-scrollbar">
                      <ul className="space-y-4">
                          {items.map((item, idx) => (
                              <li key={item.id} className="bg-white p-4 rounded-3xl border-2 border-dashed border-yellow-200 flex gap-5 items-center shadow-sm">
                                  <span className="bg-yellow-400 text-white font-bold text-xl w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 shadow-sm transform -rotate-6">
                                      {idx + 1}
                                  </span>
                                  <span className="text-3xl font-bold text-gray-700 mt-1">
                                      {item.text}
                                  </span>
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};