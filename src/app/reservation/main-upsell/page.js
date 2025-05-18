'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function MainUpsellPage() {
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
    // 메인 업셀 선택 상태는 이 페이지에서 사용자 선택으로 결정되므로 URL에서 가져오지 않음
    const id = params.get('orderId');
    setFormData(prev => ({ ...prev, miniUpsellSelected: miniUpsell }));
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
            setPrices(prev => ({...prev, ...fetchedPrices})); // 가져온 가격으로 상태 업데이트
        } else {
            console.warn('Product prices not found in DB for specified IDs.');
             setPricesError('일부 상품 가격 정보를 찾을 수 없습니다.');
            // 데이터 없을 시 가격은 0으로 유지
        }

        setPricesLoading(false);
    };

    fetchPrices();

  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 메인 업셀이 선택되었다면 order_items 테이블에 추가
    if (formData.mainUpsellSelected && orderId) {
      const { data, error } = await supabase
        .from('order_items')
        .insert([
          {
            order_id: orderId,
            product_id: '81919407-9074-4162-adde-baa18d8a9789', // 메인 업셀 ID
            quantity: 1,
          },
        ]);

      if (error) {
        console.error('Error inserting main upsell item:', error);
        // 오류 발생 시 사용자에게 알리거나 로깅 필요. 다음 단계 진행은 일단 유지.
        alert('메인 업셀 정보 저장 중 오류가 발생했습니다. 고객센터에 문의해주세요.');
      } else {
        console.log('Main upsell item inserted successfully:', data);
      }
    }

    // 입금 안내 페이지로 이동 시 주문 ID와 업셀 선택 상태 전달
    window.location.href = `/reservation/master-package?orderId=${orderId}&miniUpsell=${formData.miniUpsellSelected}&mainUpsell=${formData.mainUpsellSelected}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Background Overlay or Image */}
      <div className="absolute inset-0 bg-[url('/images/profile.jpg')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 to-blue-900/70"></div>

      <div className="relative z-10 max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pb-32">
        <div className="text-center mb-8">
       
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 drop-shadow-lg">잠깐! 이런 상품도 있어요</h1>
          <p className="text-gray-300 text-lg sm:text-xl">더 큰 성공을 위한 프리미엄 혜택을 확인해보세요</p>
        </div>

        {/* Course Progress Section - REMOVED */}
        
        <div className="space-y-6 bg-gray-800/70 backdrop-blur-lg p-5 sm:p-8 rounded-xl shadow-2xl border border-purple-500/30">
          {/* 메인 업셀 패키지 */}
          <div>
            <h3 className="text-xl sm:text-3xl font-bold text-center mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 animate-gradient-x drop-shadow-lg">
                💎 실전 프리미엄 전담 패키지 💎
              </span>
            </h3>
            
            <div 
              className={`mt-2 w-full rounded-lg border-2 p-4 shadow-lg flex items-center gap-4 transition-all duration-300 cursor-pointer relative overflow-hidden pt-10
                ${formData.mainUpsellSelected 
                  ? 'bg-purple-800/50 border-purple-500 hover:border-purple-400' 
                  : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                }`}
              onClick={() => setFormData(prev => ({ ...prev, mainUpsellSelected: !prev.mainUpsellSelected }))}
            >
              {formData.mainUpsellSelected && (
                <div className="absolute top-[10px] left-[-35px] w-40 bg-gradient-to-r from-purple-400 to-blue-400 text-center text-white text-sm font-bold py-1 rotate-[-30deg]">
                  선택됨
                </div>
              )}
              {/* 미선택 상태 표시 */}
              {!formData.mainUpsellSelected && (
                <span className="absolute top-3 right-3 text-gray-400 text-sm font-semibold">미선택</span>
              )}

              <div className="flex-grow ml-4">
                <p className="font-semibold text-lg">실전 프리미엄 전담 패키지</p>
            
                <ul className="mt-3 text-gray-300 text-sm space-y-3">
                  <li>
                    <span className="font-semibold text-purple-300">✅ 1:1 카카오톡 Q&A 핫라인 (무제한)</span>
                    <p className="mt-1">&quot;개발하다 막히면 바로 톡 주세요. 최대한 실시간으로 응답드려요.&quot;</p>
                    <ul className="mt-1 ml-4 space-y-1 text-gray-400">
                      <li>👉 개인 카톡 공개, 실전 상황에서 바로 물어보고 바로 피드백 받는 채널</li>
                      <li>👉 클라이언트랑 대화 꼬였다?</li>
                      <li>👉 견적서 어떻게 줘야 할지 모르겠다?</li>
                      <li>👉 갑자기 이상한 요청 받았다?</li>
                    </ul>
                    <p className="mt-1 text-right text-yellow-300 font-bold">예상 가치: 70,000원</p>
                  </li>
                  <li>
                    <span className="font-semibold text-purple-300">✅ 실전 SOS 줌 실시간 통화 피드백 7회 제공</span>
                    <p className="mt-1">👉 개발 마감일은 다가오고 개발 중에 막힌 부분이 있다?</p>
                    <p className="mt-1">📞 바로 Zoom으로 실시간 도움 드릴게요!</p>
                    <p className="mt-1 text-gray-400">→ 마감 앞둔 급한 상황, 꼬인 채팅, 기능 오류까지 OK</p>
                    <p className="mt-1 text-right text-yellow-300 font-bold">예상 가치: 260,000원</p>
                  </li>
                  <li>
                    <span className="font-semibold text-purple-300">✅ 실제 작업물 or 포트폴리오 심층분석 (2회)</span>
                    <p className="mt-1">작업 중인 사이트나 포트폴리오 →</p>
                    <p className="mt-1 text-gray-400">→ 클라이언트에게 최종 납품 전에 심층 검토 지원</p>
                    <p className="mt-1 text-gray-400">→ 실전 관점에서 진단 피드백</p>
                    <p className="mt-1 text-right text-yellow-300 font-bold">예상 가치: 160,000원</p>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                  <p className="text-center text-gray-300">
                    <span className="font-semibold">실제 시장 예상 가치: 490,000원</span>
                    <br />
                    <span className="text-xl font-bold text-gray-300">
                      지금 함께 구매하면{' '}
                      <span className="text-3xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-300 drop-shadow-lg">
                        {pricesLoading ? '로딩 중...' : pricesError ? '오류' : `${prices.mainUpsellPrice.toLocaleString()}원`}
                      </span>
                    </span>
                  </p>
                </div>
                <p className="text-lg font-bold text-purple-400 mt-3">
                  가격: {pricesLoading ? '로딩 중...' : pricesError ? '오류' : `${prices.mainUpsellPrice.toLocaleString()}원`}
                </p>
              </div>

              {/* Social Proof - REMOVED */}
              
            </div>
          </div>
        </div>

        {/* Calculate Total Price and Fixed Button */}
        {(() => {
          // DB에서 가져온 가격 상태 사용
          const basePrice = prices.basePrice;
          const miniUpsellPrice = formData.miniUpsellSelected ? prices.miniUpsellPrice : 0;
          const mainUpsellPrice = formData.mainUpsellSelected ? prices.mainUpsellPrice : 0;
          const total = basePrice + miniUpsellPrice + mainUpsellPrice;
          const formattedTotal = pricesLoading || pricesError ? '계산 중...' : total.toLocaleString();

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