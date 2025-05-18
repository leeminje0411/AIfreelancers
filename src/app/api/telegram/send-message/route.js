import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text } = await request.json(); // chatId는 환경변수에서 가져오므로 text만 요청 본문에서 받음
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const targetChatId = process.env.TELEGRAM_CHAT_ID; 

    if (!botToken || !targetChatId) {
      console.error('Telegram bot token or chat ID is not configured in environment variables.');
      return NextResponse.json({ error: 'Server configuration error: Telegram bot token or chat ID missing.' }, { status: 500 });
    }

    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // MarkdownV2 파싱 모드 제거 및 순수 텍스트 사용
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: text, // 순수 텍스트 사용
        // parse_mode 필드 제거 (기본값이 PlainText)
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Telegram API Error:', data);
      // 텔레그램 API 오류 상세 정보를 포함하여 응답
      return NextResponse.json({ error: data.description || data.error || 'Failed to send message to Telegram.' }, { status: response.status });
    }

    return NextResponse.json({ success: true, result: data.result });

  } catch (error) {
    console.error('Server Error sending Telegram message:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 