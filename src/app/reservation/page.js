'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function ReservationPage() {
  const [formData, setFormData] = useState({
    name: '',
    emailLocalPart: '',
    emailDomain: '',
    emailDirectInput: '',
    phone: '',
    course: 'AI 웹개발로 수익화 강의',
    upsellPackageSelected: false,
  });

  // 미니 업셀 가격 상태 추가 및 로딩 상태
  const [miniUpsellPrice, setMiniUpsellPrice] = useState(0); // 기본값 0
  const [pricesLoading, setPricesLoading] = useState(true);
  const [pricesError, setPricesError] = useState(null);

  // 강의 제작률 및 오픈 날짜 상태 추가
  const [courseProgress, setCourseProgress] = useState(80); // 강의 제작률 상태 (기본값 80)
  const [loadingProgress, setLoadingProgress] = useState(true); // 강의 제작률 로딩 상태
  const [activeDate, setActiveDate] = useState(null); // 오픈 날짜 상태 추가
  const [loadingDate, setLoadingDate] = useState(true); // 오픈 날짜 로딩 상태 추가

  // 가격 정보를 가져오는 useEffect
  useEffect(() => {
    const fetchPrices = async () => {
      setPricesLoading(true);
      setPricesError(null);
      // 미니 업셀 상품 ID (5e56acf6-b241-47c3-894b-54f79f4b7c5a)
      const miniUpsellProductId = '5e56acf6-b241-47c3-894b-54f79f4b7c5a';

      const { data, error } = await supabase
        .from('products')
        .select('price')
        .eq('id', miniUpsellProductId)
        .single();

      if (error) {
        console.error('Error fetching mini upsell price:', error);
        setPricesError('가격 정보를 불러오는 중 오류가 발생했습니다.');
        setMiniUpsellPrice(0); // 오류 발생 시 기본값 0
      } else if (data) {
        setMiniUpsellPrice(data.price);
      } else {
         console.warn('Mini upsell product not found in DB.');
         setPricesError('미니 업셀 상품 가격 정보를 찾을 수 없습니다.');
         setMiniUpsellPrice(0); // 데이터 없을 시 기본값 0
      }
      setPricesLoading(false);
    };

    fetchPrices();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 강의 제작률 및 오픈 날짜 정보를 가져오는 useEffect
  useEffect(() => {
    const fetchProgressAndSchedule = async () => {
      setLoadingProgress(true);
      setLoadingDate(true);

      // course_progress 테이블에서 제작률 가져오기
      const { data: progressData, error: progressError } = await supabase
        .from('course_progress')
        .select('progress')
        .limit(1);

      if (progressError) {
        console.error('Error fetching course progress:', progressError);
        setCourseProgress(80); // 오류 시 기본값 80
      } else if (progressData && progressData.length > 0) {
        setCourseProgress(progressData[0].progress); // 제작률 상태 업데이트
      } else {
        setCourseProgress(80); // 데이터 없으면 기본값 80
        console.warn('course_progress table is empty.');
      }
      setLoadingProgress(false); // 강의 제작률 로딩 완료

      // schedule_config 테이블에서 오픈 날짜 가져오기
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedule_config')
        .select('active_date')
        .limit(1);

      if (scheduleError) {
        console.error('Error fetching schedule config:', scheduleError);
        setActiveDate(null); // 오류 시 activeDate는 null 유지
      } else if (scheduleData && scheduleData.length > 0) {
        setActiveDate(scheduleData[0].active_date); // active_date 상태 업데이트
      } else {
         setActiveDate(null); // 데이터 없으면 null
         console.warn('schedule_config table is empty.');
      }
      setLoadingDate(false); // 오픈 날짜 로딩 완료
    };

    fetchProgressAndSchedule();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!formData.name || !formData.emailLocalPart || !formData.emailDomain || (formData.emailDomain === 'direct' && !formData.emailDirectInput)) {
      alert('이름, 이메일은 필수 입력 항목입니다.');
      // 첫 번째 비어있는 필수 필드로 스크롤 이동 및 포커스
      let elementToScroll = null;
      if (!formData.name) {
        elementToScroll = document.getElementById('name');
      } else if (!formData.emailLocalPart) {
        elementToScroll = document.getElementById('emailLocalPart');
      } else if (!formData.emailDomain) {
        elementToScroll = document.getElementById('emailDomain');
      } else if (formData.emailDomain === 'direct' && !formData.emailDirectInput) {
        elementToScroll = document.getElementById('emailDirectInput');
      }

      if (elementToScroll) {
        elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
        elementToScroll.focus();
      }
      return;
    }

    // 이메일 형식 유효성 검사 (간단한 패턴 사용)
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(`${formData.emailLocalPart}@${formData.emailDomain}`)) {
        alert('유효한 이메일 주소를 입력해주세요.');
        document.getElementById('emailLocalPart').focus(); // 이메일 아이디 필드에 포커스
        return;
    }

    // Supabase에 데이터 삽입
    // orders 테이블에 주문 기본 정보 삽입
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          name: formData.name,
          email: `${formData.emailLocalPart}@${formData.emailDomain === 'direct' ? formData.emailDirectInput : formData.emailDomain}`,
          phone: formData.phone,
          // product_id는 orders 테이블에서 제거되었으므로 더 이상 삽입하지 않음
          is_completed: false,
        },
      ])
      .select(); // 삽입된 주문 데이터 (주문 ID 포함) 반환

    if (orderError) {
      console.error('Error inserting order:', orderError);
      alert('주문 정보를 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.');
      return;
    }

    if (!orderData || orderData.length === 0) {
        console.error('Insert order operation returned no data.');
        alert('주문 정보를 저장했지만, 확인에 문제가 발생했습니다. 고객센터에 문의해주세요.');
        return;
    }

    const orderId = orderData[0].id;
    console.log('Order inserted successfully with ID:', orderId);

    // order_items 테이블에 선택된 상품들 삽입
    const itemsToInsert = [
      { order_id: orderId, product_id: 'dd1b7f29-5764-4cec-8e50-39b142243d3f', quantity: 1 }, // 기본 강의
    ];

    if (formData.upsellPackageSelected) {
      itemsToInsert.push({ order_id: orderId, product_id: '5e56acf6-b241-47c3-894b-54f79f4b7c5a', quantity: 1 }); // 미니 업셀
    }

    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (orderItemsError) {
      console.error('Error inserting order items:', orderItemsError);
      alert('상품 정보를 저장하는 중 오류가 발생했습니다. 고객센터에 문의해주세요. (주문은 생성됨)');
      // 이 경우 주문은 생성되었으나 상품 정보 저장이 실패했으므로 관리자 확인 필요
      // 사용자는 다음 페이지로 진행시키되, 문제 발생을 알림
    } else {
        console.log('Order items inserted successfully:', orderItemsData);
    }

    // 텔레그램 알림 보내기 (새로운 주문)
    const orderedItemsList = itemsToInsert.map(item => {
        if (item.product_id === 'dd1b7f29-5764-4cec-8e50-39b142243d3f') return '- AI 웹개발로 수익화 강의';
        if (item.product_id === '5e56acf6-b241-47c3-894b-54f79f4b7c5a') return '- 미니 업셀 패키지';
        return '- 알 수 없는 상품';
    }).join('\n');

    const telegramMessage = `*새로운 사전예약 신청!* 🎉\n\n` +
                            `*주문 ID:* ${orderId}\n` +
                            `*이름:* ${formData.name}\n` +
                            `*이메일:* ${formData.emailLocalPart}@${formData.emailDomain === 'direct' ? formData.emailDirectInput : formData.emailDomain}\n` +
                            `*전화번호:* ${formData.phone || '정보 없음'}\n\n` +
                            `*주문 상품:*\n${orderedItemsList}`; // 상품 목록은 별도로 구성

    try {
      await fetch('/api/telegram/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: telegramMessage }),
      });
      console.log('New order Telegram notification sent.');
    } catch (teleError) {
      console.error('Failed to send Telegram notification for new order:', teleError);
      // 알림 실패는 페이지 이동을 막지 않음
    }

    // 메인 업셀 페이지로 이동 시 주문 ID와 업셀 선택 상태 전달
    window.location.href = `/reservation/main-upsell?orderId=${orderId}&miniUpsell=${formData.upsellPackageSelected}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // 이메일 관련 필드 처리는 개별 input/select의 onChange에서 이미 처리됨
    if (name !== 'emailLocalPart' && name !== 'emailDomain' && name !== 'emailDirectInput') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
       {/* Background Overlay or Image */}
       <div className="absolute inset-0 bg-[url('/images/profile.jpg')] bg-cover bg-center opacity-10"></div> {/* Example using the image */}
       <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 to-blue-900/70"></div> {/* Dark Gradient Overlay */}


      <div className="relative z-10 max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pb-32">
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
             강의 제작률 <span className="text-white">{loadingProgress ? '로딩 중...' : `${courseProgress || 0}%`} 완료!</span>
           </h3>
           <div className="w-full max-w-sm h-3 bg-white/20 rounded-full overflow-hidden shadow-inner leading-none">
             {loadingProgress ? (
                <div className="w-full h-full bg-gray-600 animate-pulse"></div> // 로딩 중 회색 애니메이션
              ) : (
              <div 
                className={`h-full bg-gradient-to-r from-green-400 to-blue-500 shadow-lg shadow-green-500/50`}
                style={{ width: `${courseProgress || 0}%` }} // 동적으로 너비 설정
              ></div>
             )}
           </div>
           <span className="text-xs sm:text-sm text-gray-400 font-medium mt-2">
            예상 마감일: {loadingDate ? '로딩 중...' : (activeDate ? `${new Date(activeDate).getMonth() + 1}월 ${new Date(activeDate).getDate()}일` : '정보 없음')}
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
                <p className="text-sm sm:text-base text-purple-300 font-semibold mt-2 text-center">
                  {loadingDate ? '로딩 중...' : (activeDate ? `${new Date(activeDate).getMonth() + 1}월 ${new Date(activeDate).getDate()}일 전` : '오픈 전')} 신청 시에만 적용되는 특별 가격입니다.
                </p>
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
            <div className="flex items-stretch mt-1 rounded-md overflow-hidden border border-gray-600 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 shadow-sm">
              <input
                type="text"
                name="emailLocalPart"
                id="emailLocalPart"
                required
                placeholder="이메일"
                className="flex-1 block w-full bg-gray-700 text-white p-3 focus:outline-none border-none"
                value={formData.emailLocalPart}
                onChange={(e) => setFormData(prev => ({ ...prev, emailLocalPart: e.target.value }))}
              />
              <span className="inline-flex items-center px-3 bg-gray-700 text-gray-300 text-sm">
                @
              </span>
              {/* 도메인 선택 또는 직접 입력 필드 */}
              {formData.emailDomain === 'direct' ? (
                <input
                  type="text"
                  name="emailDirectInput"
                  id="emailDirectInput"
                  required
                  placeholder="직접 입력"
                  className="flex-1 block w-full bg-gray-700 text-white p-3 focus:outline-none border-none"
                  value={formData.emailDirectInput}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailDirectInput: e.target.value }))}
                />
              ) : (
                <select
                  name="emailDomain"
                  id="emailDomain"
                  required
                  className="flex-1 block w-full bg-gray-700 text-white p-3 focus:outline-none border-none"
                  value={formData.emailDomain}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    emailDomain: e.target.value,
                    // '직접입력'이 아닌 다른 옵션 선택 시 직접입력 필드 값 초기화
                    emailDirectInput: e.target.value === 'direct' ? formData.emailDirectInput : '',
                   }))}
                >
                  <option value="">--선택--</option>
                  <option value="gmail.com">gmail.com</option>
                  <option value="naver.com">naver.com</option>
                  <option value="daum.net">daum.net</option>
                  <option value="hanmail.net">hanmail.net</option>
                  <option value="nate.com">nate.com</option>
                  <option value="direct">직접입력</option>
                </select>
              )}
            </div>
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
              placeholder="010-1234-5678"
            />
          </div>

          {/* Upsell Package Section */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-lg sm:text-xl font-bold text-center mb-4 text-white">함께 신청하면 수익 극대화! (선택 사항)</h3>
            
            {/* Upsell Package Item Box */}
            <div 
              className={`mt-2 w-full rounded-xl bg-gray-800/70 border-2 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center gap-4 transition-all duration-300 cursor-pointer relative overflow-hidden
                ${formData.upsellPackageSelected ? 'border-teal-500 hover:border-teal-400 bg-gray-700/70' : 'border-gray-600 hover:border-gray-500'}`}
              onClick={() => setFormData(prev => ({ ...prev, upsellPackageSelected: !prev.upsellPackageSelected }))}
            >
               {/* Ribbon for Selected Upsell Package */}
               {formData.upsellPackageSelected && (
                 <div className="absolute top-[10px] left-[-35px] w-40 bg-gradient-to-r from-green-400 to-teal-400 text-center text-white text-sm font-bold py-1 rotate-[-30deg] shadow-md">
                   선택됨
                 </div>
               )}

              <div className="flex-grow ml-0 md:ml-4 mt-4 md:mt-0">
                <p className="font-bold text-xl text-white mb-2">AI 웹개발 수익화 강화 패키지</p>
                <p className="text-sm text-gray-300 mb-3">실전 수익 창출 노하우와 1:1 코칭 포함</p>
                
                {/* 미니 업셀 가치 포지셔닝 항목들 */}
                <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 mb-3">
                  <li>견적 요청 터지게 하는 프로필 & 소개문 템플릿</li>
                  <li>처음부터 믿음 주는 견적 제안서 템플릿 (PDF)</li>
                  <li>초반 신뢰 뿜뿜 상담 문장 15선</li>
                  <li>피해야 할 클라이언트 유형 리스트</li>
                  <li>후기/평점 유도 스크립트</li>
                  <li>견적서 포맷 + 작성 요령 요약본</li>
                </ul>

                <p className="text-lg font-bold text-green-400">
                   가격: {pricesLoading ? '로딩 중...' : pricesError ? '오류' : `${miniUpsellPrice.toLocaleString()}원`}
                </p>
              </div>

              {/* Social Proof */}
              <div className="flex-shrink-0 text-right self-center md:self-start">
                 <p className="text-sm text-teal-300 font-semibold">69% 신청자 선택</p>
              </div>
            </div>
          </div>
        </form>

        {/* Calculate Total Price and Fixed Button - MOVED OUTSIDE FORM */}
        {(() => {
          const basePrice = 160000; // 기본 강의 가격 (하드코딩)
          // 미니 업셀 가격을 DB에서 가져온 상태 변수 사용
          const currentMiniUpsellPrice = miniUpsellPrice; 
          const total = basePrice + (formData.upsellPackageSelected ? currentMiniUpsellPrice : 0);
          const formattedTotal = total.toLocaleString(); // Format with commas

          return (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-lg py-3 px-4 z-50">
              <button
                type="button"
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