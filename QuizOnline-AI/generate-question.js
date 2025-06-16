// netlify/functions/generate-question.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Lấy API key từ biến môi trường của Netlify (AN TOÀN)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async function (event, context) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const prompt = `
      Hãy tạo một câu hỏi trắc nghiệm ngắn về tiếng Nhật trình độ N5.
      Câu hỏi có thể về Kanji, từ vựng, ngữ pháp hoặc đọc hiểu đơn giản.
      Chỉ trả về một đối tượng JSON duy nhất và không có gì khác.
      Đối tượng JSON phải có cấu trúc: { "question": "nội dung câu hỏi", "answer": "đáp án chính xác" }.
      Ví dụ: { "question": "Chữ Hán của「みず」 (nước) là gì?", "answer": "水" }.
      Không sử dụng markdown, chỉ trả về JSON thô.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Đảm bảo đầu ra là JSON hợp lệ
    const jsonResponse = JSON.parse(text);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonResponse),
    };
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Không thể tạo câu hỏi từ AI." }),
    };
  }
};