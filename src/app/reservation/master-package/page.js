'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterPackagePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    course: 'AI 웹개발로 수익화 강의',
    miniUpsellSelected: false,
    mainUpsellSelected: false,
  });

  useEffect(() => {
    // URL에서 선택 상태 가져오기
    const params = new URLSearchParams(window.location.search);
    const miniUpsell = params.get('miniUpsell') === 'true';
    const mainUpsell = params.get('mainUpsell') === 'true';
    setFormData(prev => ({ 
      ...prev, 
      miniUpsellSelected: miniUpsell,
      mainUpsellSelected: mainUpsell
    }));
  }, []);

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
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 drop-shadow-lg">입금 계좌 안내</h1>
          <p className="text-gray-300 text-lg sm:text-xl">아래 계좌로 입금해주시면 확인 후 연락드리겠습니다</p>
        </div>

        <div className="space-y-6 bg-gray-800/70 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-purple-500/30">
          {/* 선택된 상품 요약 */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-4">선택하신 상품</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-300">AI 웹개발로 수익화 강의</span>
                <span className="text-white font-semibold">160,000원</span>
              </div>
              {formData.miniUpsellSelected && (
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">AI 웹개발 수익화 강화 패키지</span>
                  <span className="text-white font-semibold">39,000원</span>
                </div>
              )}
              {formData.mainUpsellSelected && (
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">프리미엄 수익화 마스터 패키지</span>
                  <span className="text-white font-semibold">199,000원</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-lg font-bold text-white">총 결제 금액</span>
                <span className="text-xl font-bold text-purple-400">
                  {(() => {
                    const basePrice = 160000;
                    const miniUpsellPrice = formData.miniUpsellSelected ? 39000 : 0;
                    const mainUpsellPrice = formData.mainUpsellSelected ? 199000 : 0;
                    const total = basePrice + miniUpsellPrice + mainUpsellPrice;
                    return total.toLocaleString() + '원';
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* 계좌 정보 */}
          <div className="bg-gray-700/50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-4">입금 계좌 정보</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">은행</span>
                <span className="text-white font-semibold">케이뱅크</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">계좌번호</span>
                <span className="text-white font-semibold">100-139-631067</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">예금주</span>
                <span className="text-white font-semibold">이민제</span>
              </div>
            </div>
          </div>

          {/* 안내사항 */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-white mb-4">안내사항</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="text-purple-400 mr-2">•</span>
                입금 확인 후 24시간 이내에 연락드립니다.
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2">•</span>
                입금자명이 다를 경우, 입금 후 오픈채팅으로 알려주시기 바랍니다.
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2">•</span>
                문의사항은 개민지 공식 오픈채팅 고객센터로 연락주세요.
              </li>
            </ul>
          </div>

          {/* 카카오톡 오픈채팅 버튼 */}
          <div className="mt-8">
            <a 
              href="https://open.kakao.com/o/s9RrIYwh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#FEE500] text-[#3C1E1E] rounded-lg font-bold text-lg hover:bg-[#FEE500]/90 transition-all duration-300"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.48 2 11C2 13.13 3.05 15.07 4.63 16.37L3.5 20.5L7.63 19.37C8.93 20.95 10.87 22 13 22C17.52 22 22 18.52 22 14C22 9.48 17.52 6 12 6V3Z"/>
              </svg>
              24시간 고객센터 문의하기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 