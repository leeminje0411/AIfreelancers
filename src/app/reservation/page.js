'use client';

import { useState } from 'react';

export default function ReservationPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    preferredDate: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 폼 제출 로직 구현
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">강의 사전예약</h1>
          <p className="text-gray-600 mb-8">원하시는 강의를 미리 예약하시면 빠른 시일 내에 연락드리겠습니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">전화번호</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700">희망 강의</label>
            <select
              name="course"
              id="course"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.course}
              onChange={handleChange}
            >
              <option value="">강의를 선택해주세요</option>
              <option value="course1">프로그래밍 기초</option>
              <option value="course2">웹 개발 심화</option>
              <option value="course3">데이터 사이언스</option>
            </select>
          </div>

          <div>
            <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700">희망 수강일</label>
            <input
              type="date"
              name="preferredDate"
              id="preferredDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.preferredDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">추가 메시지</label>
            <textarea
              name="message"
              id="message"
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              예약하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 