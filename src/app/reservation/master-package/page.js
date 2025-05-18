'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function MasterPackagePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    course: 'AI 웹개발로 수익화 강의',
    miniUpsellSelected: false,
    mainUpsellSelected: false,
  });
  const [orderId, setOrderId] = useState(null);

  // 가격 상태 및 로딩 상태 추가
  const [prices, setPrices] = useState({
    basePrice: 0,
    miniUpsellPrice: 0,
    mainUpsellPrice: 0,
  });
  const [pricesLoading, setPricesLoading] = useState(true);
  const [pricesError, setPricesError] = useState(null);

  useEffect(() => {
    // URL에서 선택 상태 및 주문 ID 가져오기
    const params = new URLSearchParams(window.location.search);
    const miniUpsell = params.get('miniUpsell') === 'true';
    const mainUpsell = params.get('mainUpsell') === 'true';
    const id = params.get('orderId');
    setFormData(prev => ({ 
      ...prev, 
      miniUpsellSelected: miniUpsell,
      mainUpsellSelected: mainUpsell
    }));
    setOrderId(id);

    // 가격 정보 가져오기
    const fetchPrices = async () => {
        setPricesLoading(true);
        setPricesError(null);
        // 기본 강의, 미니 업셀, 메인 업셀 상품 ID
        const productIds = [
            'dd1b7f29-5764-4cec-8e50-39b142243d3f', // 기본 강의
            '5e56acf6-b241-47c3-894b-54f79f4b7c5a', // 미니 업셀
            '81919407-9074-4162-adde-baa18d8a9789', // 메인 업셀
        ];

        const { data, error } = await supabase
            .from('products')
            .select('id, price')
            .in('id', productIds);

        if (error) {
            console.error('Error fetching prices:', error);
            setPricesError('가격 정보를 불러오는 중 오류가 발생했습니다.');
            // 오류 발생 시 가격은 0으로 유지
        } else if (data) {
            const fetchedPrices = {};
            data.forEach(product => {
                if (product.id === 'dd1b7f29-5764-4cec-8e50-39b142243d3f') fetchedPrices.basePrice = product.price;
                else if (product.id === '5e56acf6-b241-47c3-894b-54f79f4b7c5a') fetchedPrices.miniUpsellPrice = product.price;
                else if (product.id === '81919407-9074-4162-adde-baa18d8a9789') fetchedPrices.mainUpsellPrice = product.price;
            });
            setPrices(fetchedPrices); // 가져온 가격으로 상태 업데이트
        } else {
            console.warn('Product prices not found in DB for specified IDs.');
             setPricesError('일부 상품 가격 정보를 찾을 수 없습니다.');
            // 데이터 없을 시 가격은 0으로 유지
        }

        setPricesLoading(false);
    };

    fetchPrices();

  }, []);

  // '입금 완료' 버튼 클릭 핸들러
  const handlePaymentComplete = async () => {
    if (!orderId) {
      alert('주문 정보를 찾을 수 없습니다.');
      return;
    }

    // Supabase에서 is_completed 상태 업데이트
    const { data, error } = await supabase
      .from('orders')
      .update({ is_completed: true })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      alert('주문 상태 업데이트 중 오류가 발생했습니다. 고객센터에 문의해주세요.');
    } else {
      console.log('Order status updated successfully:', data);

      // 텔레그램 알림 보내기 (입금 완료) - 주문 상품 정보 포함
      let telegramMessage = `입금 확인 알림! 💸\n\n` +
                              `주문 ID ${orderId}번의 입금이 확인되었습니다.\n\n`;

      // 주문 정보 및 상품 목록 다시 가져오기
      const { data: orderDetails, error: fetchError } = await supabase
        .from('orders')
        .select('name, email, phone, order_items(quantity, product_id, products(name, price))')
        .eq('id', orderId)
        .single(); // 해당 ID의 주문은 하나만 있다고 가정

      if (fetchError) {
        console.error('Error fetching order details for Telegram notification:', fetchError);
        telegramMessage += `(주문 상세 정보 가져오기 실패)`;
      } else if (orderDetails) {
         telegramMessage += `*주문 정보:*\n` +
                            `이름: ${orderDetails.name}\n` +
                            `이메일: ${orderDetails.email}\n` +
                            `전화번호: ${orderDetails.phone || '정보 없음'}\n\n`;

         if (orderDetails.order_items && orderDetails.order_items.length > 0) {
            telegramMessage += `*주문 상품:*\n`;
            orderDetails.order_items.forEach(item => {
                telegramMessage += `- ${item.products?.name} (수량: ${item.quantity})\n`;
            });
            // 총 금액 계산 (선택 사항이지만 알림에 유용)
            const totalAmount = orderDetails.order_items.reduce((sum, item) => {
                const price = parseFloat(item.products?.price);
                return sum + (isNaN(price) ? 0 : price * item.quantity);
            }, 0);
            telegramMessage += `\n총 결제 금액: ${totalAmount.toLocaleString()}원\n\n`;

         } else {
             telegramMessage += `*주문 상품:* 상품 정보 없음\n\n`;
         }
      } else {
          telegramMessage += `(주문 상세 정보 없음)`;
      }

      telegramMessage += `관리자 페이지에서 최종 확인 및 처리를 진행해주세요.`;

      try {
        await fetch('/api/telegram/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: telegramMessage }),
        });
        console.log('Payment complete Telegram notification sent with details.');
      } catch (teleError) {
        console.error('Failed to send Telegram notification for payment complete:', teleError);
        // 알림 실패는 페이지 이동을 막지 않음
      }

      // 예약 완료 확인 페이지로 이동
      router.push('/reservation/confirmation');
    }
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
                <span className="text-white font-semibold">
                  {pricesLoading ? '로딩 중...' : pricesError ? '오류' : `${prices.basePrice.toLocaleString()}원`}
                </span>
              </div>
              {formData.miniUpsellSelected && (
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">AI 웹개발 수익화 강화 패키지</span>
                  <span className="text-white font-semibold">
                    {pricesLoading ? '로딩 중...' : pricesError ? '오류' : `${prices.miniUpsellPrice.toLocaleString()}원`}
                  </span>
                </div>
              )}
              {formData.mainUpsellSelected && (
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">프리미엄 수익화 마스터 패키지</span>
                  <span className="text-white font-semibold">
                    {pricesLoading ? '로딩 중...' : pricesError ? '오류' : `${prices.mainUpsellPrice.toLocaleString()}원`}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-lg font-bold text-white">총 입금 금액</span>
                <span className="text-xl font-bold text-purple-400">
                  {pricesLoading || pricesError ? '계산 중...' : (() => {
                    const basePrice = prices.basePrice;
                    const miniUpsellPrice = formData.miniUpsellSelected ? prices.miniUpsellPrice : 0;
                    const mainUpsellPrice = formData.mainUpsellSelected ? prices.mainUpsellPrice : 0;
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

          {/* 입금 후 안내 및 버튼 */}
          <div className="mt-8 p-6 bg-gray-700/50 rounded-lg text-center">
       
             
             {/* 입금 안내 문구와 양 옆 화살표 */}
             <div className="flex items-center justify-center gap-2 mb-4">
               {/* 왼쪽 화살표 (아래 방향) */}
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-purple-400 animate-pulse">
                 <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v16.19l1.72-1.72a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l1.72 1.72V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
               </svg>
               <p className="text-gray-300 text-lg">위 계좌 번호로 입금후에 아래 버튼을 눌러주세요</p>
               {/* 오른쪽 화살표 (아래 방향) */}
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-400 animate-pulse">
                 <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v16.19l1.72-1.72a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l1.72 1.72V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
               </svg>
             </div>

             <button 
               onClick={handlePaymentComplete}
               className="w-full py-3 px-4 border border-transparent rounded-md text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105">
                입금 완료 버튼
             </button>
             <p className="mt-4 text-gray-400 text-sm">입금 후, 평균 3시간 이내에 신청 확정 안내를 드리고 있습니다!</p>
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
          <div className="mt-8 flex justify-center">
            <a 
              href="https://open.kakao.com/o/s9RrIYwh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-3 px-6 bg-[#FEE500] rounded-lg shadow-lg hover:bg-[#ffe066] transition-all duration-200"
              style={{ minWidth: 240 }}
            >
              {/* 카카오톡 공식 로고 (외부 SVG 파일 사용) */}
              <img 
                src="/svg/kakaotalk-svgrepo-com.svg" 
                alt="카카오톡 로고"
                className="w-7 h-7"
              />
              <span className="font-bold text-base text-[#3C1E1E]">카카오톡 24시간 고객센터</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 