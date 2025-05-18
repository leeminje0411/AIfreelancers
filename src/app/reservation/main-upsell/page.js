'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MainUpsellPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    course: 'AI 웹개발로 수익화 강의',
    miniUpsellSelected: false,
    mainUpsellSelected: false,
  });

  useEffect(() => {
    // URL에서 미니 업셀 선택 상태 가져오기
    const params = new URLSearchParams(window.location.search);
    const miniUpsell = params.get('miniUpsell') === 'true';
    setFormData(prev => ({ ...prev, miniUpsellSelected: miniUpsell }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // 메인 업셀 페이지로 이동하면서 미니 업셀과 메인 업셀 선택 상태 전달
    window.location.href = `/reservation/master-package?miniUpsell=${formData.miniUpsellSelected}&mainUpsell=${formData.mainUpsellSelected}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Background Overlay or Image */}
      <div className="absolute inset-0 bg-[url('/images/profile.jpg')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 to-blue-900/70"></div>

      <div className="relative z-10 max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-8">
          <img 
            src="/images/profile.jpg" 
            alt="Profile Image"
            className="mx-auto rounded-full w-20 h-20 sm:w-24 sm:h-24 object-cover mb-6 shadow-lg border-2 border-purple-500"
          />
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 drop-shadow-lg">잠깐! 이런 상품도 있어요</h1>
          <p className="text-gray-300 text-lg sm:text-xl">더 큰 성공을 위한 프리미엄 혜택을 확인해보세요</p>
        </div>

        {/* Course Progress Section */}
        <div className="py-4 px-4 flex flex-col items-center bg-gray-800/50 rounded-xl mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 drop-shadow-md">
            강의 제작률 <span className="text-white">80% 완료!</span>
          </h3>
          <div className="w-full max-w-sm h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
            <div className="w-[80%] h-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse shadow-lg shadow-green-500/50"></div>
          </div>
          <span className="text-xs sm:text-sm text-gray-400 font-medium mt-2">
            예상 마감일: 6월 1일
          </span>
        </div>

        <div className="space-y-6 bg-gray-800/70 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-purple-500/30">
          {/* 메인 업셀 패키지 */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-center mb-4 text-white">🎯 프리미엄 수익화 패키지</h3>
            
            <div 
              className={`mt-2 w-full rounded-lg bg-gray-800/50 border-2 p-4 shadow-lg flex items-center gap-4 transition-all duration-300 cursor-pointer relative overflow-hidden pt-10
                ${formData.mainUpsellSelected ? 'border-purple-500 hover:border-purple-400' : 'border-gray-600 hover:border-gray-500'}`}
              onClick={() => setFormData(prev => ({ ...prev, mainUpsellSelected: !prev.mainUpsellSelected }))}
            >
              {formData.mainUpsellSelected && (
                <div className="absolute top-[10px] left-[-35px] w-40 bg-gradient-to-r from-purple-400 to-blue-400 text-center text-white text-sm font-bold py-1 rotate-[-30deg]">
                  선택됨
                </div>
              )}

              <div className="flex-grow ml-4">
                <p className="font-semibold text-lg">프리미엄 수익화 마스터 패키지</p>
                <p className="text-sm text-gray-400 mt-1 mb-2">1:1 멘토링, 수익화 전략 컨설팅, 커뮤니티 액세스</p>
                <p className="text-lg font-bold text-purple-400">가격: 199,000원</p>
              </div>

              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-purple-300 font-semibold">42% 신청자 선택</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calculate Total Price and Fixed Button */}
        {(() => {
          const basePrice = 160000;
          const miniUpsellPrice = formData.miniUpsellSelected ? 39000 : 0;
          const mainUpsellPrice = formData.mainUpsellSelected ? 199000 : 0;
          const total = basePrice + miniUpsellPrice + mainUpsellPrice;
          const formattedTotal = total.toLocaleString();

          return (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-lg py-3 px-4 z-50">
              <button
                onClick={handleSubmit}
                className="w-full flex flex-col items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105"
              >
                <span className="text-xl sm:text-2xl font-extrabold mb-1">
                  총 결제 금액: <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 drop-shadow-md">{formattedTotal}원</span>
                </span>
                <span className="text-sm sm:text-base text-white/90">다음</span>
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
} 