import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  const cookieStore = await cookies();
  const visitorId = cookieStore.get('visitorId');
  const lastVisitDate = cookieStore.get('lastVisitDate');
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식

  let currentVisitorId = visitorId?.value;
  let isFirstVisitToday = !lastVisitDate || lastVisitDate.value !== today;
  // let isNewVisitor = !currentVisitorId; // 총 방문자 계산용 - 이제 cumulative_visit_count 테이블에서 관리

  // visitorId가 없으면 새로 생성
  if (!currentVisitorId) {
      currentVisitorId = uuidv4();
  }

  // visitorId 쿠키 설정 (영구적 또는 장기)
  // 이미 쿠키가 있더라도 갱신하여 maxAge를 연장합니다.
  await cookieStore.set('visitorId', currentVisitorId, { 
      httpOnly: true, // JavaScript에서 접근 불가
      secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
      maxAge: 60 * 60 * 24 * 365 * 10, // 10년 유효
      path: '/',
      sameSite: 'Lax',
  });

  // lastVisitDate 쿠키 설정 (오늘 날짜, 하루 유효)
  // 오늘 첫 방문인 경우에만 설정하여 내일 초기화되도록 합니다.
  if (isFirstVisitToday) {
      await cookieStore.set('lastVisitDate', today, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24, // 24시간 유효
          path: '/',
          sameSite: 'Lax',
      });
  }

  try {
    // 1. cumulative_visit_count (총 고유 방문자) 업데이트 로직
    // visitorId가 처음 생성된 경우 (쿠키가 없었던 경우) 총 방문자 수 증가
    if (!visitorId) { // isNewVisitor 대신 초기 visitorId 부재 여부 확인
        const { data: cumulativeData, error: cumulativeError } = await supabase
          .from('cumulative_visit_count')
          .select('total_visits')
          .eq('id', 1)
          .single();

        if (cumulativeError && cumulativeError.code !== 'PGRST116') { // PGRST116: 데이터 없음
             console.error('Error fetching cumulative visits:', cumulativeError);
             // 오류 발생해도 진행
        } else if (cumulativeData) {
            // 기존 레코드 업데이트
            const { error: updateCumulativeError } = await supabase
                .from('cumulative_visit_count')
                .update({ total_visits: cumulativeData.total_visits + 1 })
                .eq('id', 1);

            if (updateCumulativeError) {
                 console.error('Error updating cumulative visits:', updateCumulativeError);
                 // 오류 발생해도 진행
            }
        } else {
            // 레코드가 없으면 삽입 (id=1)
            const { error: insertCumulativeError } = await supabase
                 .from('cumulative_visit_count')
                 .insert([{ id: 1, total_visits: 1 }]);

            if (insertCumulativeError) {
                 console.error('Error inserting cumulative visits:', insertCumulativeError);
                 // 오류 발생해도 진행
            }
        }
    }

    // 2. daily_visits (일간 총 페이지 뷰 및 일일 순 방문자) 업데이트 로직
    const { data: existingDailyVisit, error: fetchDailyError } = await supabase
      .from('daily_visits')
      .select('total_visits, today_visits') // total_visits는 페이지뷰로, today_visits는 순방문자로 사용
      .eq('date', today)
      .single();

    if (fetchDailyError && fetchDailyError.code !== 'PGRST116') { // PGRST116은 데이터 없음을 의미
       console.error('Error fetching existing daily visit by date:', fetchDailyError);
       return NextResponse.json({ message: 'Visit tracking fetch failed.', error: fetchDailyError.message }, { status: 500 });
    }

    let dailyUpdatePayload = {};
    if (existingDailyVisit) {
      // 해당 날짜의 레코드가 이미 있는 경우
      // 일간 총 페이지 뷰 (total_visits)는 무조건 증가
      dailyUpdatePayload.total_visits = existingDailyVisit.total_visits + 1;

      // 일일 순 방문자 (today_visits)는 해당 날짜 첫 방문인 경우에만 증가
      if (isFirstVisitToday) {
           dailyUpdatePayload.today_visits = existingDailyVisit.today_visits + 1;
      } else {
          // 오늘 이미 방문했으면 today_visits는 그대로 유지
          dailyUpdatePayload.today_visits = existingDailyVisit.today_visits;
      }

      const { error: updateDailyError } = await supabase
          .from('daily_visits')
          .update(dailyUpdatePayload)
          .eq('date', today); // 날짜 기준으로 업데이트

      if (updateDailyError) {
         console.error('Error updating daily_visits by date:', updateDailyError);
         return NextResponse.json({ message: 'Visit tracking daily update failed.', error: updateDailyError.message }, { status: 500 });
      }

      console.log(`Daily visit tracked for ${today}: Updated existing record.`);
    } else {
      // 해당 날짜의 레코드가 없는 경우: 새로운 레코드 삽입
      // 이 경우는 isFirstVisitToday가 항상 true임.
      const dailyInsertPayload = {
          date: today,
          total_visits: 1, // 첫 페이지 뷰
          today_visits: 1, // 첫 순 방문자
      };

      const { error: insertDailyError } = await supabase
          .from('daily_visits')
          .insert([dailyInsertPayload]); // 새로운 레코드 삽입

      if (insertDailyError) {
         console.error('Error inserting daily_visits:', insertDailyError);
         return NextResponse.json({ message: 'Visit tracking daily insert failed.', error: insertDailyError.message }, { status: 500 });
      }

      console.log(`Daily visit tracked for ${today}: Inserted new record.`);
    }

    // 모든 업데이트 성공 시 최종 응답
    return NextResponse.json({ message: `Visit tracking successful for ${today}.` });

  } catch (e) {
    console.error('Visit tracking exception:', e);
    return NextResponse.json({ message: 'Visit tracking failed due to exception.', error: e.message }, { status: 500 });
  }
} 