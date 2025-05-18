'use client';

import { useState } from 'react';

export default function ReservationPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: 'AI 웹개발로 수익화 강의',
    upsellPackageSelected: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 필수 입력 필드 검증
    if (!formData.name || !formData.email) {
      // 필수 입력 필드가 비어있으면 해당 필드로 스크롤
      const emptyField = !formData.name ? 'name' : 'email';
      const element = document.getElementById(emptyField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    // 메인 업셀 페이지로 이동하면서 미니 업셀 선택 상태 전달
    window.location.href = `/reservation/main-upsell?miniUpsell=${formData.upsellPackageSelected}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
       {/* Background Overlay or Image */}
       <div className="absolute inset-0 bg-[url('/images/profile.jpg')] bg-cover bg-center opacity-10"></div> {/* Example using the image */}
       <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 to-blue-900/70"></div> {/* Dark Gradient Overlay */}


      <div className="relative z-10 max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-8">
          {/* Profile Image as Logo */}
          <img 
            src="/images/profile.jpg" 
            alt="Profile Image"
            className="mx-auto rounded-full w-20 h-20 sm:w-24 sm:h-24 object-cover mb-6 shadow-lg border-2 border-purple-500"
          />
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 drop-shadow-lg">사전예약 신청</h1>
          <p className="text-gray-300 text-lg sm:text-xl">지금 바로 신청하고 특별 혜택을 받아보세요.</p>
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

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/70 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-purple-500/30">
          {/* 주문 상품 섹션 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">주문 상품</label>
            {/* Selected Course Item Box with Ribbon */}
            <div className="mt-1 w-full rounded-lg bg-gray-700/50 border-2 border-blue-500 text-white p-4 shadow-lg flex items-center gap-4 transition-all duration-300 hover:shadow-xl hover:border-blue-400 cursor-default relative overflow-hidden pt-10">
              {/* Prominent Ribbon */}
              <div className="absolute top-[10px] left-[-35px] w-40 bg-gradient-to-r from-green-400 to-teal-400 text-center text-white text-sm font-bold py-1 rotate-[-30deg]">
                선택됨
              </div>
              
              {/* Content adjusted for ribbon */}
              <div className="flex-grow ml-4">
                <p className="font-semibold text-lg">AI 웹개발로 수익화 강의</p>
                <p className="text-lg font-bold text-purple-400 mt-1">
                  <span className="text-sm text-gray-500 font-normal line-through mr-2">860,000원</span>
                  160,000원
                  <span className="text-base font-bold text-blue-400 ml-2">(80% 할인)</span>
                </p>
                <p className="text-sm sm:text-base text-purple-300 font-semibold mt-2 text-center">6월 1일 전 신청 시에만 적용되는 특별 가격입니다.</p>
                <p className="text-sm text-gray-400 mt-1">이 상품은 기본 선택이며 변경할 수 없습니다.</p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">이름 (입금자 성함과 동일하게 작성해주세요)</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">이메일</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">연락처 (선택)</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Upsell Package Section */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-lg sm:text-xl font-bold text-center mb-4 text-white">✅ 함께 신청하면 수익 극대화! (선택 사항)</h3>
            
            {/* Upsell Package Item Box */}
            <div 
              className={`mt-2 w-full rounded-lg bg-gray-800/50 border-2 p-4 shadow-lg flex items-center gap-4 transition-all duration-300 cursor-pointer relative overflow-hidden pt-10
                ${formData.upsellPackageSelected ? 'border-teal-500 hover:border-teal-400' : 'border-gray-600 hover:border-gray-500'}`}
              onClick={() => setFormData(prev => ({ ...prev, upsellPackageSelected: !prev.upsellPackageSelected }))}
            >
               {/* Ribbon for Selected Upsell Package */}
               {formData.upsellPackageSelected && (
                 <div className="absolute top-[10px] left-[-35px] w-40 bg-gradient-to-r from-green-400 to-teal-400 text-center text-white text-sm font-bold py-1 rotate-[-30deg]">
                   선택됨
                 </div>
               )}

              <div className="flex-grow ml-4">
                <p className="font-semibold text-lg">AI 웹개발 수익화 강화 패키지</p>
                <p className="text-sm text-gray-400 mt-1 mb-2">실전 수익 창출 노하우와 1:1 코칭 포함</p>
                <p className="text-lg font-bold text-green-400">가격: 39,000원</p>
              </div>

              {/* Social Proof */}
              <div className="flex-shrink-0 text-right">
                 <p className="text-xs text-teal-300 font-semibold">69% 신청자 선택</p>
              </div>
            </div>
          </div>
        </form>

        {/* Calculate Total Price and Fixed Button - MOVED OUTSIDE FORM */}
        {(() => {
          const basePrice = 160000;
          const upsellPrice = 39000;
          const total = basePrice + (formData.upsellPackageSelected ? upsellPrice : 0);
          const formattedTotal = total.toLocaleString(); // Format with commas

          return (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-lg py-3 px-4 z-50">
              <button
                onClick={handleSubmit}
                className="w-full flex flex-col items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105"
              >
                <span className="text-xl sm:text-2xl font-extrabold mb-1">
                   총 결제 금액: <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 drop-shadow-md">{formattedTotal}원</span>
                </span>
                <span className="text-sm sm:text-base text-white/90">지금 바로 사전예약하기</span>
              </button>
            </div>
          );
        })()}

      </div>
    </div>
  );
} 