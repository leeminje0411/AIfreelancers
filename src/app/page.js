'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';

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
  const [remainingSeats, setRemainingSeats] = useState(null);
  const [loadingSeats, setLoadingSeats] = useState(true);

  const [maxCount, setMaxCount] = useState(0); // early_access_limit에서 가져온 max_count
  const [currentOrdersCount, setCurrentOrdersCount] = useState(0); // 현재 주문 건수 - 이제 사용하지 않음
  const [displayApplicantCount, setDisplayApplicantCount] = useState(0); // 표시될 신청 인원 수

  const [activeDate, setActiveDate] = useState(null); // 오픈 날짜 상태 추가
  const [loadingDate, setLoadingDate] = useState(true); // 오픈 날짜 로딩 상태 추가

  // 강의 제작률 상태 추가
  const [courseProgress, setCourseProgress] = useState(80); // 강의 제작률 상태 (기본값 80)
  const [loadingProgress, setLoadingProgress] = useState(true); // 강의 제작률 로딩 상태

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // activeDate가 로딩되지 않았거나 유효하지 않으면 타이머 계산 안 함
      if (!activeDate || loadingDate) {
        console.log('calculateTimeLeft: activeDate not loaded or loading', { activeDate, loadingDate });
        return {};
      }

      // activeDate 문자열을 파싱하여 날짜 객체 생성 (UTC 기준으로 시도)
      // const [year, month, day] = activeDate.split('-').map(num => parseInt(num));
      // const deadline = new Date(year, month - 1, day, 23, 59, 59, 999); // 기존 로컬 파싱

      // YYYY-MM-DD 형식의 문자열은 UTC 자정으로 파싱될 수 있으므로,
      // 명확하게 로컬 시간대 기준으로 날짜 객체를 생성하거나 UTC 파싱 후 로컬 시간 적용 고려
      // 여기서는 UTC로 파싱된 날짜에 해당 날짜의 로컬 시간 23:59:59를 더해 마감일 설정
      const dateParts = activeDate.split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // 월은 0부터 시작
      const day = parseInt(dateParts[2]);

      // 로컬 시간대 기준으로 해당 날짜의 23:59:59로 마감일 설정
      const deadline = new Date(year, month, day, 23, 59, 59, 999);

      const now = new Date();
      const difference = deadline.getTime() - now.getTime();

      console.log('calculateTimeLeft:', {
        activeDate,
        deadline: deadline.toLocaleString(), // 로컬 문자열로 변환하여 출력
        now: now.toLocaleString(), // 로컬 문자열로 변환하여 출력
        difference: difference,
        isTimeUp: difference <= 0
      });

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

    // activeDate가 로드되고 로딩이 완료되면 타이머 설정
    if (activeDate && !loadingDate) {
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

        // cleanup function: 컴포넌트 언마운트 또는 의존성 변경 시 타이머 해제
        return () => clearInterval(timer);
    } else if (!activeDate && !loadingDate) {
        // 데이터 로딩은 완료되었으나 activeDate가 없는 경우 (예: 테이블 비어있음)
        setIsTimeUp(true); // 마감으로 표시
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }

    // activeDate 또는 loadingDate가 변경될 때마다 useEffect 재실행
  }, [activeDate, loadingDate]);

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

  useEffect(() => {
    const fetchEarlyAccessData = async () => {
      setLoadingSeats(true);
      setLoadingDate(true); // 오픈 날짜 로딩 시작
      setLoadingProgress(true); // 강의 제작률 로딩 시작
      console.log('Fetching early access, schedule, and progress data...');
      // early_access_limit 테이블에서 max_count와 display_applicant_count 가져오기
      const { data: limitDataArray, error: limitError } = await supabase
        .from('early_access_limit')
        .select('max_count, display_applicant_count') // display_applicant_count 추가
        .limit(1);

      if (limitError) {
        console.error('Error fetching early access limit:', limitError);
        setLoadingSeats(false);
        setRemainingSeats(null); // 오류 시 null 유지
        setMaxCount(0); // 오류 시 0으로 설정
        setDisplayApplicantCount(0); // 오류 시 0으로 설정
      } else if (limitDataArray && limitDataArray.length > 0) {
        // 데이터가 있을 경우 첫 번째 행의 값 사용
        const data = limitDataArray[0];
        setMaxCount(data.max_count); // max_count 상태 업데이트
        setDisplayApplicantCount(data.display_applicant_count); // displayApplicantCount 상태 업데이트
      } else {
          // 데이터가 없는 경우 초기값 설정
          setMaxCount(300); // 기본값 300
          setDisplayApplicantCount(0); // 기본값 0
          console.warn('early_access_limit table is empty.');
      }

      // schedule_config 테이블에서 오픈 날짜 가져오기
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedule_config')
        .select('active_date')
        .limit(1);

      if (scheduleError) {
        console.error('Error fetching schedule config:', scheduleError);
        setActiveDate(null); // 오류 시 activeDate는 null 유지
      } else if (scheduleData && scheduleData.length > 0) {
        console.log('Fetched schedule data:', scheduleData[0].active_date);
        setActiveDate(scheduleData[0].active_date); // active_date 상태 업데이트
      } else {
         setActiveDate(null); // 데이터 없으면 null
         console.warn('schedule_config table is empty.');
      }
      setLoadingDate(false); // 오픈 날짜 로딩 완료
      console.log('Finished fetching data. loadingDate set to false.');

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

      setLoadingSeats(false); // 모든 데이터 로딩 완료 후 로딩 상태 해제
    };

    fetchEarlyAccessData();
  }, []); // 최초 렌더링 시 한 번만 실행

  useEffect(() => {
    // Call the visit tracking API
    fetch('/api/visit')
      .then(response => {
        if (!response.ok) {
          console.error('Visit tracking API failed', response.statusText);
        }
        // Optional: log success or response body if needed
        // console.log('Visit tracked successfully', response);
      })
      .catch(error => {
        console.error('Error calling visit tracking API', error);
      });
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative pt-5 pb-5 sm:pt-6 sm:pb-6 px-4">
          {/* Background Image and Overlay */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97')] bg-cover bg-center opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-800/70 to-blue-800/70"></div> {/* Gradient overlay */}
          <div className="relative z-20 max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-3xl lg:text-5xl font-extrabold mb-0 sm:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 leading-tight drop-shadow-lg">
              AI로 완성하는<br />수익 창출 웹사이트 강의
            </h1>
        

            {/* Discount Timer */}
            <div className="w-full max-w-5xl mx-auto mt-2 sm:mt-2 p-4 sm:p-5 bg-gray-800/70 rounded-3xl backdrop-blur-lg border border-purple-500/30 shadow-xl shadow-purple-500/10">
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
                <div className="w-full mt-0 pt-3 sm:mt-0 sm:pt-4 border-t border-white/20">
                  <h3 className="text-xl sm:text-2xl font-bold text-center mb-5 sm:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400 drop-shadow-md">
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
                   <p className="text-xl sm:text-2xl font-bold text-green-400 mb-0 sm:mb-0 drop-shadow-md">
                    지금 {activeDate ? <span className="text-yellow-300">{new Date(activeDate).getMonth() + 1}월 {new Date(activeDate).getDate()}일 전</span> : '오픈 전'} 사전 예약 시
                  </p>
                </div>

                {/* Discount Call to Action Area */}
                <div className="w-full -mt-[0.5px] sm:-mt-[2px] pt-0 flex flex-col items-center px- sm:px-0 sticky bottom-0 py-0 sm:-py-[1px]">
                 
                  <Link
                    href="/reservation"
                    className="inline-block w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 sm:px-16 py-2 sm:py-5 rounded-full font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/40 hover:shadow-purple-500/50 text-center tracking-wide relative overflow-hidden group"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-2xl sm:text-3xl font-extrabold mb-1">
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 drop-shadow-md">160,000원</span> <span className="text-base sm:text-lg font-bold text-white/90">(80% 할인)</span>
                      </span>
                      <span className="text-sm sm:text-base text-white/90">지금 바로 사전예약하기</span>
                      
                      {/* 선착순 텍스트 - 동적 값 적용 */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="relative">
                          <div className={`w-2 h-2 rounded-full ${isPulsing ? 'bg-red-500 animate-pulse' : 'bg-red-500'} shadow-md shadow-red-500/50`}></div>
                          <div className="absolute inset-0 rounded-full animate-ping bg-red-500/30"></div>
                        </div>
                        {loadingSeats ? (
                           <span className="text-sm text-red-300 font-semibold whitespace-nowrap">정보 로딩 중...</span>
                        ) : (
                           <span className="text-sm text-red-300 font-semibold whitespace-nowrap">
                              선착순 {maxCount}명 중 <span className="font-bold">{displayApplicantCount}명</span> 신청
                           </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Progress Section - Moved below Hero */}
        <div className="py-6 sm:py-14 px-4 bg-gray-800/50 flex flex-col items-center">
           <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 drop-shadow-md">
             강의 제작률 <span className="text-white">{loadingProgress ? '로딩 중...' : `${courseProgress || 0}%`} 완료!</span>
           </h3>
           <div className="w-full max-w-lg h-4 bg-white/20 rounded-full overflow-hidden shadow-inner leading-none">
             {loadingProgress ? (
               <div className="w-full h-full bg-gray-600 animate-pulse"></div> // 로딩 중 회색 애니메이션
             ) : (
              <div 
                className={`h-full bg-gradient-to-r from-green-400 to-blue-500 shadow-lg shadow-green-500/50`}
                style={{ width: `${courseProgress || 0}%` }} // 동적으로 너비 설정
              ></div>
             )}
           </div>
           <span className="text-sm sm:text-base text-gray-400 font-medium mt-3">
            예상 마감일: {loadingDate ? '로딩 중...' : (activeDate ? `${new Date(activeDate).getMonth() + 1}월 ${new Date(activeDate).getDate()}일` : '정보 없음')}
           </span>
        </div>

        {/* Course Features */}
        <div className="py-7 sm:py-14 px-4 bg-gray-800/50">
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

        {/* 선착순 섹션 - 동적 카운터 적용 */}
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-lg mb-8">🌟 선착순 마감 임박! 지금 신청하세요! 🌟</h2>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-8">

               {/* 남은 자리 카운터 */}
               <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-yellow-500/30 flex flex-col items-center w-full sm:w-auto">
                 <span className="text-yellow-400 text-2xl sm:text-3xl font-bold">남은 자리</span>
                 {loadingSeats ? (
                    <span className="text-white text-4xl sm:text-5xl font-extrabold mt-2">로딩 중...</span>
                 ) : (
                    <span className="text-white text-4xl sm:text-5xl font-extrabold mt-2">{maxCount - displayApplicantCount}명</span>
                 )}
               </div>

               {/* 강의 제작률 카운터 */}
               <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-green-500/30 flex flex-col items-center w-full sm:w-auto">
                  <span className="text-green-400 text-2xl sm:text-3xl font-bold">강의 제작률</span>
                  <span className="text-white text-4xl sm:text-5xl font-extrabold mt-2">80%</span>
               </div>

               {/* 할인 타이머 - 삭제 또는 이동 (관리자 페이지에서 별도 관리될 수 있음) */}
               {/* 기존 할인 타이머 코드 제거 */}

            </div>

            {/* 예상 마감일 및 할인 문구 - 관리자 페이지에서 설정하거나 별도 데이터 소스 사용 고려 */}
             <p className="text-lg sm:text-xl text-gray-300 mb-8">
              예상 마감일: {loadingDate ? '로딩 중...' : (activeDate ? `${new Date(activeDate).getMonth() + 1}월 ${new Date(activeDate).getDate()}일` : '정보 없음')}<br/>
               {activeDate && !loadingDate && (
                 <span className="text-purple-300 font-semibold">80% 할인 전 신청 시 특별 가격 적용!</span>
               )}
            </p>

            {/* CTA Button */}
            <div className="mt-8">
              <a href="/reservation" className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xl sm:text-2xl font-bold py-4 px-12 rounded-full shadow-lg transform transition-transform hover:scale-105 duration-300">
                사전예약 신청하기
              </a>
            </div>

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
