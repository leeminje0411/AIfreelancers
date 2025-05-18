'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import React from 'react'; // Fragment 사용을 위해 필요

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('created_at'); // 정렬 기준
  const [sortOrder, setSortOrder] = useState('desc'); // 정렬 방향: 'asc' 또는 'desc'

  const [earlyAccessLimit, setEarlyAccessLimit] = useState(null); // 선착순 제한 값 상태 (max_count)
  const [displayApplicantCount, setDisplayApplicantCount] = useState(null); // 표시될 신청 인원 수 상태
  const [newMaxCount, setNewMaxCount] = useState(''); // 수정할 선착순 제한 입력 값
  const [newDisplayApplicantCount, setNewDisplayApplicantCount] = useState(''); // 수정할 표시 신청 인원 입력 값
  const [savingLimit, setSavingLimit] = useState(false); // 제한 값 저장 중 상태

  // 상품 가격 관리 상태 추가
  const [products, setProducts] = useState([]); // 상품 목록
  const [newPrices, setNewPrices] = useState({}); // 수정할 가격 값들
  const [savingPrices, setSavingPrices] = useState(false); // 가격 저장 중 상태
  const [activeTab, setActiveTab] = useState('orders'); // 현재 활성화된 탭 ('orders', 'settings', 'products', 'schedule')
  const [selectedOrders, setSelectedOrders] = useState([]); // 선택된 주문 ID 배열
  const [isProcessing, setIsProcessing] = useState(false); // 처리 중 상태
  const [scheduleConfig, setScheduleConfig] = useState(null); // 오픈 날짜 설정 상태
  const [newActiveDate, setNewActiveDate] = useState(''); // 수정할 오픈 날짜 입력 값
  const [savingSchedule, setSavingSchedule] = useState(false); // 오픈 날짜 저장 중 상태
  const [loadingDate, setLoadingDate] = useState(true); // 오픈 날짜 로딩 상태 추가 - 혹시 누락되었다면 다시 추가

  // 강의 제작률 관리 상태 추가
  const [courseProgress, setCourseProgress] = useState(null); // 강의 제작률 값 상태
  const [newProgress, setNewProgress] = useState(''); // 수정할 강의 제작률 입력 값
  const [loadingProgress, setLoadingProgress] = useState(true); // 강의 제작률 로딩 상태
  const [savingProgress, setSavingProgress] = useState(false); // 강의 제작률 저장 중 상태

  const [visitorStats, setVisitorStats] = useState([]);
  const [loadingVisitors, setLoadingVisitors] = useState(true);
  const [totalUniqueVisitors, setTotalUniqueVisitors] = useState(0);
  const [loadingTotalVisitors, setLoadingTotalVisitors] = useState(true);

  useEffect(() => {
    const fetchOrdersAndLimit = async () => {
      setLoading(true);
      setError(null);
      setLoadingDate(true); // 오픈 날짜 로딩 시작
      setLoadingProgress(true); // 강의 제작률 로딩 시작

      // 상품 목록 가져오기
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, price')
        .order('id');

      if (productsError) {
        console.error('Error fetching products:', productsError);
        setError(prev => prev ? prev + '\n상품 정보를 불러오는 중 오류가 발생했습니다.' : '상품 정보를 불러오는 중 오류가 발생했습니다.');
      } else {
        setProducts(productsData);
        // 초기 가격 값 설정
        const initialPrices = {};
        productsData.forEach(product => {
          initialPrices[product.id] = product.price.toString();
        });
        setNewPrices(initialPrices);
      }

      // 주문 데이터 가져오기 (주문 건수는 이제 직접 사용하지 않음)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, name, email, phone, is_completed, created_at, order_items(quantity, product_id, products(name, price)) ')
        .order(sortBy, { ascending: sortOrder === 'asc' }); // 정렬 적용

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        setError('주문 정보를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
        // 주문 데이터 로딩 실패 시 선착순 제한 값은 그대로 가져오도록 함
      } else {
        setOrders(ordersData);
        // 실제 주문 건수 상태 업데이트 로직 제거
      }

      // early_access_limit 테이블에서 제한 값 및 표시 인원 가져오기
      const { data: limitDataArray, error: limitError } = await supabase
        .from('early_access_limit')
        .select('max_count, display_applicant_count') // display_applicant_count 추가
        .limit(1); // 최대 1개 행 가져오기

      if (limitError) {
          console.error('Error fetching early access limit:', limitError);
          setError(prev => prev ? prev + '\n선착순 제한 정보를 불러오는 중 오류가 발생했습니다.' : '선착순 제한 정보를 불러오는 중 오류가 발생했습니다.');
          setEarlyAccessLimit(null);
          setDisplayApplicantCount(null);
          setNewMaxCount('');
          setNewDisplayApplicantCount('');
          console.warn('early_access_limit table is empty or error fetching.');
      } else if (limitDataArray && limitDataArray.length > 0) {
          // 데이터가 있을 경우 첫 번째 행의 값 사용
          const data = limitDataArray[0];
          setEarlyAccessLimit(data.max_count);
          setDisplayApplicantCount(data.display_applicant_count);
          setNewMaxCount(data.max_count.toString()); // 입력 필드 기본값 설정
          setNewDisplayApplicantCount(data.display_applicant_count.toString()); // 입력 필드 기본값 설정
      } else {
          // 데이터가 없는 경우 초기값 설정
          setEarlyAccessLimit(null);
          setDisplayApplicantCount(null);
          setNewMaxCount('300'); // 기본값 300
          setNewDisplayApplicantCount('0'); // 기본값 0
          console.warn('early_access_limit table is empty.');
      }

      // schedule_config 테이블에서 오픈 날짜 가져오기
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedule_config')
        .select('active_date')
        .limit(1);

      if (scheduleError) {
        console.error('Error fetching schedule config:', scheduleError);
        setError(prev => prev ? prev + '\n오픈 날짜 정보를 불러오는 중 오류가 발생했습니다.' : '오픈 날짜 정보를 불러오는 중 오류가 발생했습니다.');
      } else if (scheduleData && scheduleData.length > 0) {
        setScheduleConfig(scheduleData[0]);
        setNewActiveDate(scheduleData[0].active_date);
      } else {
        setScheduleConfig(null);
        setNewActiveDate('');
      }
      setLoadingDate(false); // 오픈 날짜 로딩 완료

      // course_progress 테이블에서 제작률 가져오기
      const { data: progressData, error: progressError } = await supabase
        .from('course_progress')
        .select('progress')
        .limit(1);

      if (progressError) {
        console.error('Error fetching course progress:', progressError);
        setError(prev => prev ? prev + '\n강의 제작률 정보를 불러오는 중 오류가 발생했습니다.' : '강의 제작률 정보를 불러오는 중 오류가 발생했습니다.');
        setCourseProgress(null);
        setNewProgress('');
      } else if (progressData && progressData.length > 0) {
        setCourseProgress(progressData[0].progress);
        setNewProgress(progressData[0].progress.toString());
      } else {
        setCourseProgress(null);
        setNewProgress('80'); // 기본값 80 설정
        console.warn('course_progress table is empty.');
      }
      setLoadingProgress(false); // 강의 제작률 로딩 완료

      setLoading(false); // 모든 데이터 로딩 완료
    };

    fetchOrdersAndLimit();
  }, [sortBy, sortOrder]); // 정렬 기준/방향 변경 시 다시 불러옴

  useEffect(() => {
    fetchVisitorStats();
    fetchTotalUniqueVisitors();
  }, []);

  const fetchVisitorStats = async () => {
    setLoadingVisitors(true);
    try {
      const { data, error } = await supabase
        .from('daily_visits')
        .select('date, today_visits')
        .order('date', { ascending: false })
        .limit(30); // 최근 30일 데이터만 표시

      if (error) throw error;
      setVisitorStats(data || []);
    } catch (error) {
      console.error('Error fetching daily visitor stats:', error);
    } finally {
      setLoadingVisitors(false);
    }
  };

  const fetchTotalUniqueVisitors = async () => {
    setLoadingTotalVisitors(true);
    try {
      const { data, error } = await supabase
        .from('cumulative_visit_count')
        .select('total_visits')
        .eq('id', 1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116은 데이터 없음을 의미
        console.error('Error fetching total unique visitors:', error);
        setTotalUniqueVisitors(0); // 오류 발생 시 0으로 설정
      } else if (data) {
        setTotalUniqueVisitors(data.total_visits);
      } else {
        setTotalUniqueVisitors(0); // 데이터가 없으면 0
        console.warn('cumulative_visit_count table is empty or id=1 not found.');
      }
    } catch (error) {
      console.error('Unexpected error fetching total unique visitors:', error);
      setTotalUniqueVisitors(0);
    } finally {
      setLoadingTotalVisitors(false);
    }
  };

  // 선착순 제한 값 및 표시 인원 업데이트 핸들러
  const handleUpdateLimit = async () => {
      const maxCountInt = parseInt(newMaxCount);
      const displayCountInt = parseInt(newDisplayApplicantCount);

      if (isNaN(maxCountInt) || isNaN(displayCountInt) || maxCountInt < 0 || displayCountInt < 0) {
          alert('유효한 숫자(0 이상)를 입력해주세요.');
          return;
      }
      setSavingLimit(true);

      // early_access_limit 테이블 업데이트 또는 삽입 (id=1인 행을 대상으로 가정)
      // 테이블에 행이 없으면 삽입, 있으면 업데이트
      const { data: existingLimit } = await supabase
        .from('early_access_limit')
        .select('id')
        .eq('id', 1)
        .single();

      let updateError = null;
      if (existingLimit) {
          // id=1인 행이 있으면 업데이트
          const { error } = await supabase
              .from('early_access_limit')
              .update({ max_count: maxCountInt, display_applicant_count: displayCountInt })
              .eq('id', 1);
          updateError = error;
      } else {
          // id=1인 행이 없으면 삽입
          const { error } = await supabase
              .from('early_access_limit')
              .insert([{ id: 1, max_count: maxCountInt, display_applicant_count: displayCountInt }]);
          updateError = error;
      }

      if (updateError) {
          console.error('Error updating/inserting early access limit:', updateError);
          alert('선착순 제한 값 업데이트 중 오류가 발생했습니다.');
      } else {
          console.log('Early access limit updated/inserted successfully.');
          setEarlyAccessLimit(maxCountInt); // 상태 업데이트
          setDisplayApplicantCount(displayCountInt); // 상태 업데이트
          alert('선착순 제한 및 표시 인원이 업데이트되었습니다.');
      }
      setSavingLimit(false);
  };

  // 상품 가격 업데이트 핸들러
  const handleUpdatePrices = async () => {
    setSavingPrices(true);
    let hasError = false;

    // 모든 가격 업데이트
    for (const [productId, newPrice] of Object.entries(newPrices)) {
      const priceInt = parseInt(newPrice);
      if (isNaN(priceInt) || priceInt < 0) {
        alert('유효한 가격(0 이상)을 입력해주세요.');
        setSavingPrices(false);
        return;
      }

      const { error } = await supabase
        .from('products')
        .update({ price: priceInt })
        .eq('id', productId);

      if (error) {
        console.error('Error updating product price:', error);
        hasError = true;
      }
    }

    if (hasError) {
      alert('일부 상품 가격 업데이트 중 오류가 발생했습니다.');
    } else {
      alert('모든 상품 가격이 업데이트되었습니다.');
      // 상품 목록 새로고침
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, price')
        .order('id');
      setProducts(productsData);
    }
    setSavingPrices(false);
  };

  // 가격 입력 핸들러
  const handlePriceChange = (productId, value) => {
    setNewPrices(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  // 주문 선택 핸들러
  const handleOrderSelect = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  // 전체 선택 핸들러
  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  // 결제 완료 처리 핸들러
  const handleCompletePayment = async () => {
    if (selectedOrders.length === 0) {
      alert('선택된 주문이 없습니다.');
      return;
    }

    if (!confirm(`선택한 ${selectedOrders.length}개의 주문을 결제 완료 처리하시겠습니까?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ final_completed: true })
        .in('id', selectedOrders);

      if (error) throw error;

      alert('선택한 주문이 결제 완료 처리되었습니다.');
      
      // 텔레그램 알림 보내기 (관리자 최종 완료)
      const orderIdsMessage = selectedOrders.join(', ');
      const telegramMessage = `*관리자 최종 완료 알림!* ✅\n\n` +
                              `관리자가 다음 주문들을 최종 완료 처리했습니다:\n${orderIdsMessage}\n\n` +
                              `해당 주문들에 대한 최종 처리를 진행해주세요.`;

      try {
        await fetch('/api/telegram/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: telegramMessage }),
        });
        console.log('Admin complete Telegram notification sent.');
      } catch (teleError) {
        console.error('Failed to send Telegram notification for admin complete:', teleError);
        // 알림 실패는 주문 목록 새로고침을 막지 않음
      }

      // 주문 목록 새로고침
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, name, email, phone, is_completed, final_completed, created_at, order_items(quantity, product_id, products(name, price))')
        .order(sortBy, { ascending: sortOrder === 'asc' });
      
      setOrders(ordersData);
      setSelectedOrders([]); // 선택 초기화
    } catch (error) {
      console.error('Error completing payments:', error);
      alert('결제 완료 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 선택된 주문 삭제 핸들러
  const handleDeleteOrders = async () => {
    if (selectedOrders.length === 0) {
      alert('선택된 주문이 없습니다.');
      return;
    }

    if (!confirm(`선택한 ${selectedOrders.length}개의 주문을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      // 먼저 order_items 삭제
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', selectedOrders);

      if (itemsError) throw itemsError;

      // 그 다음 orders 삭제
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .in('id', selectedOrders);

      if (ordersError) throw ordersError;

      alert('선택한 주문이 삭제되었습니다.');
      // 주문 목록 새로고침
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, name, email, phone, is_completed, final_completed, created_at, order_items(quantity, product_id, products(name, price))')
        .order(sortBy, { ascending: sortOrder === 'asc' });
      
      setOrders(ordersData);
      setSelectedOrders([]); // 선택 초기화
    } catch (error) {
      console.error('Error deleting orders:', error);
      alert('주문 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 오픈 날짜 업데이트 핸들러
  const handleUpdateSchedule = async () => {
    if (!newActiveDate) {
      alert('오픈 날짜를 입력해주세요.');
      return;
    }

    setSavingSchedule(true);

    // schedule_config 테이블 업데이트 또는 삽입
    const { data: existingSchedule } = await supabase
      .from('schedule_config')
      .select('id')
      .limit(1);

    let updateError = null;
    if (existingSchedule && existingSchedule.length > 0) {
      // 기존 행이 있으면 업데이트
      const { error } = await supabase
        .from('schedule_config')
        .update({ active_date: newActiveDate })
        .eq('id', existingSchedule[0].id);
      updateError = error;
    } else {
      // 행이 없으면 삽입
      const { error } = await supabase
        .from('schedule_config')
        .insert([{ active_date: newActiveDate }]);
      updateError = error;
    }

    if (updateError) {
      console.error('Error updating/inserting schedule config:', updateError);
      alert('오픈 날짜 업데이트 중 오류가 발생했습니다.');
    } else {
      console.log('Schedule config updated/inserted successfully.');
      setScheduleConfig({ active_date: newActiveDate });
      alert('오픈 날짜가 업데이트되었습니다.');
    }
    setSavingSchedule(false);
  };

  // 강의 제작률 업데이트 핸들러
  const handleUpdateProgress = async () => {
    const progressValue = parseInt(newProgress);

    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      alert('강의 제작률은 0에서 100 사이의 숫자로 입력해주세요.');
      return;
    }

    setSavingProgress(true);

    // course_progress 테이블 업데이트 시도 (id가 1인 행을 대상으로)
    const { data: updateData, error: updateError, count: updateCount } = await supabase
      .from('course_progress')
      .update({ progress: progressValue })
      .eq('id', 1) // id가 1인 행을 대상으로 지정
      .select(); // 업데이트된 행의 count를 가져오기 위해 select 추가

    let finalError = null;
    if (updateError) {
        finalError = updateError; // 업데이트 중 직접적인 오류 발생
    } else if (!updateData || updateData.length === 0) {
        // id가 1인 행이 없거나 업데이트되지 않았다면, 삽입 시도
        // id를 1로 명시하여 삽입 (혹시 테이블에 1인 id가 없다면 새로 생성)
        const { data: insertData, error: insertError } = await supabase
            .from('course_progress')
            .insert([{ id: 1, progress: progressValue }]) // id를 1로 명시하여 삽입 시도
            .select(); // 삽입 후 데이터 반환 받아 확인

        if (insertError) {
             finalError = insertError; // 삽입 중 오류 발생
        } else if (!insertData || insertData.length === 0) {
             // 삽입도 실패한 경우
             finalError = new Error('Failed to update or insert course progress data with id 1.');
        }
    }
    // 만약 updateError가 null이고 updateData.length > 0 이면 업데이트 성공
    // 만약 insertError가 null이고 insertData.length > 0 이면 삽입 성공

    if (finalError) {
      console.error('Error updating course progress:', finalError);
      alert('강의 제작률 업데이트 중 오류가 발생했습니다.');
    } else {
      console.log('Course progress updated successfully.');
      setCourseProgress(progressValue); // 상태 업데이트
      alert('강의 제작률이 업데이트되었습니다.');
    }
    setSavingProgress(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">로딩 중...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">오류: {error}</div>;
  }

  // 데이터가 비어있는 경우
  if (!orders || orders.length === 0) {
      return (
        <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
           <div className="max-w-7xl mx-auto">
             <h1 className="text-3xl font-bold text-white mb-8">관리자 페이지 - 주문 목록</h1>
             <div className="text-center text-gray-400">아직 신청된 주문이 없습니다.</div>
           </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          관리자 대시보드
        </h1>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'orders'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            신청 리스트
          </button>
          <button
            onClick={() => setActiveTab('earlyAccess')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'earlyAccess'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            선착순 설정
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'products'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            상품 관리
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'schedule'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            오픈 날짜 설정
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'progress'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            강의 제작률 설정
          </button>
          <button
            onClick={() => setActiveTab('visitors')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'visitors'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            방문자 통계
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl">
          {activeTab === 'orders' && (
            <>
              {/* 정렬 옵션과 작업 버튼 */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-gray-300">정렬 기준:</span>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 bg-gray-700/50 text-white rounded-md hover:bg-gray-600/50 transition-colors"
                  >
                    신청 시각 ({sortOrder === 'asc' ? '오래된순' : '최신순'})
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSelectAll}
                    className="px-4 py-2 bg-gray-700/50 text-white rounded-md hover:bg-gray-600/50 transition-colors"
                  >
                    {selectedOrders.length === orders.length ? '전체 해제' : '전체 선택'}
                  </button>
                  <button
                    onClick={handleCompletePayment}
                    disabled={isProcessing || selectedOrders.length === 0}
                    className={`px-4 py-2 rounded-md text-white transition-colors ${
                      isProcessing || selectedOrders.length === 0
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isProcessing ? '처리 중...' : '결제 완료 처리'}
                  </button>
                  <button
                    onClick={handleDeleteOrders}
                    disabled={isProcessing || selectedOrders.length === 0}
                    className={`px-4 py-2 rounded-md text-white transition-colors ${
                      isProcessing || selectedOrders.length === 0
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isProcessing ? '처리 중...' : '선택 삭제'}
                  </button>
                </div>
              </div>

              <div className="bg-gray-800/70 backdrop-blur-lg p-6 rounded-xl shadow-2xl overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === orders.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">순서</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">이름</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">이메일</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">전화번호</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">입금 완료</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">최종 완료</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">신청 시각</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">주문 상품</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">총 결제 금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {orders.map((order, index) => {
                      const totalAmount = order.order_items.reduce((sum, item) => {
                        const price = parseFloat(item.products?.price);
                        return sum + (isNaN(price) ? 0 : price * item.quantity);
                      }, 0);
                      const formattedTotal = totalAmount.toLocaleString() + '원';

                      return (
                        <tr key={order.id} className={selectedOrders.includes(order.id) ? 'bg-gray-700/50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => handleOrderSelect(order.id)}
                              className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{order.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.phone}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${order.is_completed ? 'text-green-500' : 'text-yellow-500'}`}>
                            {order.is_completed ? '완료' : '미완료'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${order.final_completed ? 'text-green-500' : 'text-yellow-500'}`}>
                            {order.final_completed ? '완료' : '미완료'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {(() => {
                              const date = new Date(order.created_at);
                              const now = new Date();
                              const isCurrentYear = date.getFullYear() === now.getFullYear();
                              
                              return date.toLocaleString('ko-KR', {
                                year: isCurrentYear ? undefined : 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              });
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {order.order_items && order.order_items.length > 0 ? (
                              <ul className="list-disc list-inside">
                                {order.order_items.map((item, itemIndex) => (
                                  <li key={itemIndex}>{item.products?.name} (수량: {item.quantity})</li>
                                ))}
                              </ul>
                            ) : (
                              '상품 없음'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-400">{formattedTotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'earlyAccess' && (
            <div className="bg-gray-800/70 backdrop-blur-lg p-6 rounded-xl shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">선착순 정보 설정</h2>
              
              {/* 현재 설정 값 표시 */}
              {(earlyAccessLimit !== null || displayApplicantCount !== null) && (
                <div className="flex flex-col gap-2 mb-4">
                  {earlyAccessLimit !== null && (
                    <span className="text-gray-300">현재 전체 선착순 인원: <span className="text-purple-400 font-semibold">{earlyAccessLimit} 명</span></span>
                  )}
                  {displayApplicantCount !== null && (
                    <span className="text-gray-300">현재 표시될 신청 인원: <span className="text-purple-400 font-semibold">{displayApplicantCount} 명</span></span>
                  )}
                </div>
              )}

              {/* 설정 값 수정 입력 필드 */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <label htmlFor="newMaxCount" className="text-gray-300 w-32">전체 선착순 인원:</label>
                  <input
                    type="number"
                    id="newMaxCount"
                    className="px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500 focus:ring-purple-500 flex-1"
                    value={newMaxCount}
                    onChange={(e) => setNewMaxCount(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="newDisplayApplicantCount" className="text-gray-300 w-32">표시될 신청 인원:</label>
                  <input
                    type="number"
                    id="newDisplayApplicantCount"
                    className="px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500 focus:ring-purple-500 flex-1"
                    value={newDisplayApplicantCount}
                    onChange={(e) => setNewDisplayApplicantCount(e.target.value)}
                    min="0"
                  />
                </div>
                <button
                  onClick={handleUpdateLimit}
                  className={`px-4 py-2 rounded-md text-white transition-colors self-start ${savingLimit ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                  disabled={savingLimit}
                >
                  {savingLimit ? '저장 중...' : '설정 저장'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-gray-800/70 backdrop-blur-lg p-6 rounded-xl shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">상품 가격 관리</h2>
              
              <div className="space-y-4">
                {products.map(product => (
                  <div key={product.id} className="flex items-center gap-4">
                    <label htmlFor={`price-${product.id}`} className="text-gray-300 w-48">
                      {product.name}:
                    </label>
                    <input
                      type="number"
                      id={`price-${product.id}`}
                      className="px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500 focus:ring-purple-500 flex-1"
                      value={newPrices[product.id] || ''}
                      onChange={(e) => handlePriceChange(product.id, e.target.value)}
                      min="0"
                    />
                    <span className="text-gray-400">원</span>
                  </div>
                ))}
                <button
                  onClick={handleUpdatePrices}
                  className={`px-4 py-2 rounded-md text-white transition-colors self-start ${savingPrices ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                  disabled={savingPrices}
                >
                  {savingPrices ? '저장 중...' : '가격 저장'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">오픈 날짜 설정</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    현재 오픈 날짜: {scheduleConfig ? scheduleConfig.active_date : '설정되지 않음'}
                  </label>
                  <input
                    type="date"
                    value={newActiveDate}
                    onChange={(e) => setNewActiveDate(e.target.value)}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                  />
                </div>
                <button
                  onClick={handleUpdateSchedule}
                  disabled={savingSchedule}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingSchedule ? '저장 중...' : '오픈 날짜 업데이트'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">강의 제작률 설정</h2>
               {loadingProgress ? (
                 <div className="text-gray-300">로딩 중...</div>
               ) : (
               <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    현재 강의 제작률: {courseProgress !== null ? courseProgress : '설정되지 않음'}%
                  </label>
                  <input
                    type="number"
                    value={newProgress}
                    onChange={(e) => setNewProgress(e.target.value)}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                    min="0"
                    max="100"
                  />
                </div>
                <button
                  onClick={handleUpdateProgress}
                  disabled={savingProgress}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingProgress ? '저장 중...' : '강의 제작률 업데이트'}
                </button>
               </div>
               )}
            </div>
          )}

          {activeTab === 'visitors' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
                방문자 통계
              </h2>
              
              {/* 총 방문자 수 표시 */}
              <div className="bg-gray-700/50 p-4 rounded-lg shadow-md mb-6 flex items-center justify-between">
                  <span className="text-gray-300 font-semibold text-lg">총 고유 방문자</span>
                  {loadingTotalVisitors ? (
                      <span className="text-white text-xl font-bold">로딩 중...</span>
                  ) : (
                      <span className="text-white text-xl font-bold">{totalUniqueVisitors.toLocaleString()}명</span>
                  )}
              </div>

              {/* 일간 방문자 통계 테이블 */}
              <h3 className="text-xl font-bold mb-4 text-gray-300">최근 30일 일간 순 방문자</h3>

              {loadingVisitors ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-4 text-gray-400">일간 방문자 통계를 불러오는 중...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          날짜
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          일간 순 방문자
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {visitorStats.map((stat) => (
                        <tr key={stat.date} className="hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(stat.date).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {stat.today_visits.toLocaleString()}명
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}