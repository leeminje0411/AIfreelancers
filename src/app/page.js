'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isPulsing, setIsPulsing] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [visitorCount, setVisitorCount] = useState(Math.floor(Math.random() * (25 - 2 + 1)) + 2); // Initial random count between 2 and 25

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const deadline = new Date(2025, 5, 1, 0, 0, 0); // June is month 5 (0-indexed)
      const now = new Date();
      const difference = deadline.getTime() - now.getTime();

      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return timeLeft;
    };

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      if (Object.keys(newTimeLeft).length) {
        setTimeLeft(newTimeLeft);
        setIsTimeUp(false);
      } else {
        setIsTimeUp(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const visitorInterval = setInterval(() => {
      setVisitorCount(prevCount => {
        const min = 2;
        const max = 25;
        // Generate a random change between -2 and +3 for more gradual changes
        const change = Math.floor(Math.random() * 6) - 2; 
        let newCount = prevCount + change;

        // Ensure the new count stays within the min/max range
        if (newCount < min) newCount = min;
        if (newCount > max) newCount = max;

        return newCount;
      });
    }, 3000); // Update every 3 seconds
    return () => clearInterval(visitorInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative pt-5 pb-5 sm:pt-14 sm:pb-6 px-4">
          {/* Background Image and Overlay */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97')] bg-cover bg-center opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-800/70 to-blue-800/70"></div> {/* Gradient overlay */}
          <div className="relative z-20 max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-0 sm:mb-5 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 leading-tight drop-shadow-lg">
              AI로 완성하는<br />수익 창출 웹사이트 강의
            </h1>
        

            {/* Discount Timer */}
            <div className="w-full max-w-5xl mx-auto mt-2 sm:mt-5 p-4 sm:p-5 bg-gray-800/70 rounded-3xl backdrop-blur-lg border border-purple-500/30 shadow-xl shadow-purple-500/10">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                  <div className="relative">
                    <div className={`w-5 h-5 rounded-full ${isPulsing ? 'bg-purple-500 animate-pulse' : 'bg-purple-500'} shadow-lg shadow-purple-500/50`}></div>
                    <div className="absolute inset-0 rounded-full animate-ping bg-purple-500/30"></div>
                  </div>
                  <span className="text-sm sm:text-xl text-white font-semibold uppercase tracking-wider">80% 할인 마감까지</span>
                </div>
                
                {isTimeUp ? (
                  <span className="text-3xl sm:text-4xl font-bold text-white drop-shadow-md text-center">마감되었습니다.</span>
                ) : (
                  <div className="flex justify-center items-center space-x-2 sm:space-x-3">
                    {/* Days Card */}
                    <div className="flex flex-col items-center justify-center bg-gray-900/70 px-3 py-2 rounded-xl shadow-lg shadow-black/30 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
                      <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400 drop-shadow-md">{timeLeft.days}</span>
                      <span className="text-xs sm:text-sm text-gray-300 uppercase tracking-wider mt-1">일</span>
                    </div>
                    {/* Hours Card */}
                    <div className="flex flex-col items-center justify-center bg-gray-900/70 px-3 py-2 rounded-xl shadow-lg shadow-black/30 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
                      <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400 drop-shadow-md">{timeLeft.hours < 10 ? `0${timeLeft.hours}` : timeLeft.hours}</span>
                      <span className="text-xs sm:text-sm text-gray-300 uppercase tracking-wider mt-1">시간</span>
                    </div>
                    {/* Minutes Card */}
                    <div className="flex flex-col items-center justify-center bg-gray-900/70 px-3 py-2 rounded-xl shadow-lg shadow-black/30 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
                      <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400 drop-shadow-md">{timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes}</span>
                      <span className="text-xs sm:text-sm text-gray-300 uppercase tracking-wider mt-1">분</span>
                    </div>
                    {/* Seconds Card */}
                    <div className="flex flex-col items-center justify-center bg-gray-900/70 px-3 py-2 rounded-xl shadow-lg shadow-black/30 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
                      <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400 drop-shadow-md">{timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}</span>
                      <span className="text-xs sm:text-sm text-gray-300 uppercase tracking-wider mt-1">초</span>
                    </div>
                  </div>
                )}

                {/* Value Proposition Section - Moved inside Timer Container */}
                <div className="w-full mt-0 pt-3 sm:mt-8 sm:pt-8 border-t border-white/20">
                  <h3 className="text-xl sm:text-2xl font-bold text-center mb-5 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400 drop-shadow-md">
                    이 강의의 하나로, 여러분이 얻는 건?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    {/* Value Proposition Item 1 */}
                    <div className="flex items-center gap-3 px-2 py-1 sm:p-4 bg-gray-900/70 rounded-xl backdrop-blur-lg border border-green-500/30 shadow-lg">
                      <div className="text-xl">✅</div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        AI로 코딩 1도 몰라도 웹사이트 만들기
                      </p>
                    </div>
                    {/* Value Proposition Item 2 */}
                    <div className="flex items-center gap-3 px-2 py-1 sm:p-4 bg-gray-900/70 rounded-xl backdrop-blur-lg border border-green-500/30 shadow-lg">
                      <div className="text-xl">✅</div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        숨고에서 한달에 100~400만 원 수익화
                      </p>
                    </div>
                    {/* Value Proposition Item 3 */}
                    <div className="flex items-center gap-3 px-2 py-1 sm:p-4 bg-gray-900/70 rounded-xl backdrop-blur-lg border border-green-500/30 shadow-lg">
                      <div className="text-xl">✅</div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        프리랜서 계약서 양식 등 A to Z 전부 포함
                      </p>
                    </div>
                     {/* Value Proposition Item 4 */}
                     <div className="flex items-center gap-3 px-2 py-1 sm:p-4 bg-gray-900/70 rounded-xl backdrop-blur-lg border border-green-500/30 shadow-lg">
                      <div className="text-xl">✅</div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        실제 1년간 시행착오로 겪은 노하우 직접 전수
                      </p>
                    </div>
                     {/* Value Proposition Item 5 */}
                    
                  </div>
                </div>

                {/* Course Value and Discount Info (Actual Value Line Remains) */}
                <div className="w-full mt-0 pt-0 sm:pt-3 text-center">
                  <p className="text-lg sm:text-xl text-gray-300 mb-0 leading-relaxed">
                    이 강의의 실제 가치: <span className="font-bold text-white">860,000원</span>
                  </p>
                   <p className="text-xl sm:text-2xl font-bold text-green-400 mb-0 sm:mb-4 drop-shadow-md">
                     지금 <span className="text-yellow-300">6월 1일 전</span> 사전 예약 시
                  </p>
                </div>

                {/* Discount Call to Action Area */}
                <div className="w-full -mt-[0.5px] sm:mt-0 pt-0 flex flex-col items-center px- sm:px-0 sticky bottom-0 py-0 sm:py-4 -mt-3 sm:mt-0">
                 
                  <Link
                    href="/reservation"
                    className="inline-block w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 sm:px-16 py-2 sm:py-5 rounded-full font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/40 hover:shadow-purple-500/50 text-center tracking-wide relative overflow-hidden group"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-2xl sm:text-3xl font-extrabold mb-1">
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 drop-shadow-md">160,000원</span> <span className="text-base sm:text-lg font-bold text-white/90">(80% 할인)</span>
                      </span>
                      <span className="text-sm sm:text-base text-white/90">지금 바로 사전예약하기</span>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="relative">
                          <div className={`w-2 h-2 rounded-full ${isPulsing ? 'bg-red-500 animate-pulse' : 'bg-red-500'} shadow-md shadow-red-500/50`}></div>
                          <div className="absolute inset-0 rounded-full animate-ping bg-red-500/30"></div>
                        </div>
                        <span className="text-sm text-red-300 font-semibold whitespace-nowrap">선착순 300명 중</span>
                        <span className="text-sm font-bold animate-pulse drop-shadow-md whitespace-nowrap">
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">16</span><span className="text-white">명 신청</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Progress Section - Moved below Hero */}
        <div className="py-6 sm:py-24 px-4 bg-gray-800/50 flex flex-col items-center">
           <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 drop-shadow-md">
             강의 제작률 <span className="text-white">80% 완료!</span>
           </h3>
           <div className="w-full max-w-lg h-4 bg-white/20 rounded-full overflow-hidden shadow-inner">
             <div className="w-[80%] h-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse shadow-lg shadow-green-500/50"></div>
           </div>
           <span className="text-sm sm:text-base text-gray-400 font-medium mt-3">
             예상 마감일: 6월 1일
           </span>
        </div>

        {/* Course Features */}
        <div className="py-7 sm:py-24 px-4 bg-gray-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 drop-shadow-md">
              AI 웹사이트 개발 및 수익 창출<br/>핵심 커리큘럼
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-900/70 p-8 rounded-2xl backdrop-blur-lg border border-purple-500/30 hover:border-purple-400 transition-all shadow-xl shadow-black/20">
                <div className="text-4xl mb-6">🤖</div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-white">AI 기반 개발</h3>
                <p className="text-gray-300 text-base">
                  최신 AI 도구인 Cursor를 활용하여<br />
                  웹사이트 개발 생산성을 극대화합니다.
                </p>
              </div>
              <div className="bg-gray-900/70 p-8 rounded-2xl backdrop-blur-lg border border-blue-500/30 hover:border-blue-400 transition-all shadow-xl shadow-black/20">
                <div className="text-4xl mb-6">💰</div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-white">프리랜서 수익화</h3>
                <p className="text-gray-300 text-base">
                  숨고, 크몽 등 주요 프리랜서 플랫폼에서<br />
                  지속적으로 의뢰를 받고 수익을 창출하는 노하우를 공개합니다.
                </p>
              </div>
              <div className="bg-gray-900/70 p-8 rounded-2xl backdrop-blur-lg border border-pink-500/30 hover:border-pink-400 transition-all shadow-xl shadow-black/20">
                <div className="text-4xl mb-6">🚀</div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-white">실전 프로젝트 중심</h3>
                <p className="text-gray-300 text-base">
                  이론만으로는 부족합니다. 실제 클라이언트 프로젝트를 통해<br />
                  즉시 활용 가능한 실무 경험을 쌓습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Stories / Stats */}
        <div className="py-16 sm:py-24 px-4 bg-gray-900/70">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-12 sm:mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 drop-shadow-md">
              숫자로 증명하는<br/>수강생들의 놀라운 성과
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gray-800/50 rounded-2xl backdrop-blur-lg border border-white/10 shadow-lg shadow-black/20">
                <div className="text-4xl sm:text-5xl font-extrabold text-purple-400 mb-3 drop-shadow">
                  500만+<span className="text-lg text-gray-400 font-semibold">원</span>
                </div>
                <p className="text-sm sm:text-base text-gray-300">월 평균 수익</p>
              </div>
              <div className="text-center p-6 bg-gray-800/50 rounded-2xl backdrop-blur-lg border border-white/10 shadow-lg shadow-black/20">
                <div className="text-4xl sm:text-5xl font-extrabold text-purple-400 mb-3 drop-shadow">
                  100+<span className="text-lg text-gray-400 font-semibold">건</span>
                </div>
                <p className="text-sm sm:text-base text-gray-300">누적 프로젝트</p>
              </div>
              <div className="text-center p-6 bg-gray-800/50 rounded-2xl backdrop-blur-lg border border-white/10 shadow-lg shadow-black/20">
                <div className="text-4xl sm:text-5xl font-extrabold text-purple-400 mb-3 drop-shadow">
                  4.9/5.0
                </div>
                <p className="text-sm sm:text-base text-gray-300">평균 만족도</p>
              </div>
              <div className="text-center p-6 bg-gray-800/50 rounded-2xl backdrop-blur-lg border border-white/10 shadow-lg shadow-black/20">
                <div className="text-4xl sm:text-5xl font-extrabold text-purple-400 mb-3 drop-shadow">
                  90%<span className="text-lg text-gray-400 font-semibold">이상</span>
                </div>
                <p className="text-sm sm:text-base text-gray-300">재계약 및 추천율</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 sm:py-24 px-4 bg-gray-800/50">
          <div className="max-w-4xl mx-auto text-center p-8 bg-gray-900/70 rounded-3xl backdrop-blur-lg border border-blue-500/30 shadow-xl shadow-black/20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400 drop-shadow-md">
              성공적인 프리랜서 커리어,<br/>지금 바로 시작하세요!
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              단순히 코드를 배우는 것을 넘어,<br className="hidden sm:block"/>실질적인 수익 창출 능력과 비즈니스 노하우를 알려드립니다.
            </p>
            <Link 
              href="/reservation"
              className="inline-block w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-500 text-white px-12 sm:px-16 py-5 sm:py-6 rounded-full text-lg sm:text-xl font-bold hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-110 shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/60 text-center tracking-wide"
            >
              무료 상담 신청하고<br className="sm:hidden"/>성공 전략 알아보기
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 px-4 text-center text-gray-500 text-sm">
          <div className="max-w-7xl mx-auto">
            <p>&copy; 2023 AI-fleelancers Class. All rights reserved.</p>
            <p className="mt-2">본 페이지 또한  Cursor AI로 </p>
            <p>코드 한 줄 치지 않고 제작한 페이지입니다.</p>
          </div>
      </footer>
      </div>
    </div>
  );
}
