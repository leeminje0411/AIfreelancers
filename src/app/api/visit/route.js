import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  console.log('API /api/visit called.');
  const cookieStore = await cookies();
  const visitorId = cookieStore.get('visitorId');
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식

  console.log('Cookies:', { visitorId: visitorId?.value, today });

  let currentVisitorId = visitorId?.value;

  // visitorId가 없으면 새로 생성
  if (!currentVisitorId) {
    currentVisitorId = uuidv4();
    console.log('New visitorId generated:', currentVisitorId);
  }

  // visitorId 쿠키 설정 (영구적 또는 장기)
  await cookieStore.set('visitorId', currentVisitorId, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365 * 10, // 10년 유효
    path: '/',
    sameSite: 'Lax',
  });

  try {
    // 1. cumulative_visit_count (총 고유 방문자) 업데이트
    if (!visitorId) {
      console.log('Initial visitorId not found, attempting to increment cumulative_visit_count.');
      const { data: cumulativeData, error: cumulativeError } = await supabase
        .from('cumulative_visit_count')
        .select('total_visits')
        .eq('id', 1)
        .single();

      if (cumulativeError && cumulativeError.code !== 'PGRST116') {
        console.error('Error fetching cumulative visits:', cumulativeError);
      } else if (cumulativeData) {
        const { error: updateCumulativeError } = await supabase
          .from('cumulative_visit_count')
          .update({ total_visits: cumulativeData.total_visits + 1 })
          .eq('id', 1);

        if (updateCumulativeError) {
          console.error('Error updating cumulative visits:', updateCumulativeError);
        }
      } else {
        const { error: insertCumulativeError } = await supabase
          .from('cumulative_visit_count')
          .insert([{ id: 1, total_visits: 1 }]);

        if (insertCumulativeError) {
          console.error('Error inserting cumulative visits:', insertCumulativeError);
        }
      }
    }

    // 2. daily_visitor_log에 방문 기록 추가
    const { error: insertLogError } = await supabase
      .from('daily_visitor_log')
      .insert([{ 
        date: today,
        visitor_id: currentVisitorId
      }])
      .select();

    if (insertLogError && insertLogError.code !== '23505') { // 23505는 unique constraint violation
      console.error('Error inserting visitor log:', insertLogError);
      return NextResponse.json({ message: 'Visit tracking failed.', error: insertLogError.message }, { status: 500 });
    }

    // 3. daily_visits 테이블 업데이트 (오늘의 순 방문자 수)
    const { data: todayVisitors, error: countError } = await supabase
      .from('daily_visitor_log')
      .select('visitor_id', { count: 'exact' })
      .eq('date', today);

    if (countError) {
      console.error('Error counting today visitors:', countError);
      return NextResponse.json({ message: 'Visit counting failed.', error: countError.message }, { status: 500 });
    }

    const todayVisitsCount = todayVisitors?.length || 0;

    // daily_visits 테이블 업데이트 또는 삽입
    const { error: upsertError } = await supabase
      .from('daily_visits')
      .upsert([{
        date: today,
        today_visits: todayVisitsCount
      }]);

    if (upsertError) {
      console.error('Error upserting daily visits:', upsertError);
      return NextResponse.json({ message: 'Daily visits update failed.', error: upsertError.message }, { status: 500 });
    }

    console.log('Visit tracking process finished successfully.');
    return NextResponse.json({ 
      message: `Visit tracking successful for ${today}.`,
      todayVisits: todayVisitsCount
    });

  } catch (e) {
    console.error('Visit tracking exception:', e);
    return NextResponse.json({ message: 'Visit tracking failed due to exception.', error: e.message }, { status: 500 });
  }
} 