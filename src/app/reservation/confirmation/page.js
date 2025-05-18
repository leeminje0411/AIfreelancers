'use client';

import { useEffect } from 'react';

export default function ReservationConfirmationPage() {

  // TODO: 필요하다면 여기서 추가 로직 (예: 추적 코드 발송 등) 구현

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
       {/* Background Overlay or Image - 기존 페이지 디자인 유지 */}
       <div className="absolute inset-0 bg-[url('/images/profile.jpg')] bg-cover bg-center opacity-10"></div>
       <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 to-blue-900/70"></div>

      <div className="relative z-10 max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          {/* Profile Image - 기존 페이지 디자인 유지 */}
     
          
          {/* 체크 아이콘 with Gradient Background */}
          <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-6 shadow-lg">
             {/* 체크 아이콘 */}
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title" aria-describedby="desc" role="img" className="h-12 w-12 sm:h-14 sm:w-14 text-white" fill="white">
               <title>Checkmark</title>
               <desc>A color styled icon from Orion Icon Library.</desc>
               <path data-name="layer1" d="M28 48L14.879 34.121a3 3 0 0 1 4.242-4.243L28 39l18.83-20.072a3 3 0 0 1 4.34 4.143z" fill="white"></path>
             </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-blue-300 drop-shadow-lg">사전 예약 신청이 완료되었습니다.</h1>
          <p className="text-gray-300 text-lg sm:text-xl">감사합니다!</p>
        </div>

        {/* 추가 안내 문구 */}
        <div className="mt-8 p-6 bg-gray-800/70 rounded-lg shadow-2xl">
          <p className="text-gray-300 text-lg">
             평균 3시간 이내에 기재하신 이메일로 신청 확정 안내 드릴 예정입니다!
          </p>
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

        {/* TODO: 홈으로 돌아가기 버튼 등 추가 가능 */}

      </div>
    </div>
  );
}