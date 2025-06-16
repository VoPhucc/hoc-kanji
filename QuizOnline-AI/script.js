// Lấy các phần tử trên trang (giữ nguyên)
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');
const questionTextEl = document.getElementById('question-text');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const progressText = document.getElementById('progress-text');
const scoreText = document.getElementById('score-text');
const feedbackText = document.getElementById('feedback-text');
const finalScoreText = document.getElementById('final-score-text');
const restartBtn = document.getElementById('restart-btn');

let questions = [];
let totalQuestionsAnswered = 0;
let score = 0;

// Hàm xáo trộn mảng (giữ nguyên)
function shuffleArray(array) { /* ... code như cũ ... */ }
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


// === THAY ĐỔI: Hàm gọi AI để tạo câu hỏi mới ===
async function generateNewQuestion() {
    try {
        // Vô hiệu hóa nút để tránh spam
        submitBtn.disabled = true;
        feedbackText.textContent = 'AI đang tạo câu hỏi mới, vui lòng chờ...';
        
        // Gọi đến Netlify Function của chúng ta
        const response = await fetch('/.netlify/functions/generate-question');
        if (!response.ok) {
            throw new Error('AI không phản hồi. Sử dụng câu hỏi dự phòng.');
        }
        const newQuestion = await response.json();
        
        // Thêm câu hỏi mới vào đầu danh sách để nó xuất hiện ngay sau đó
        questions.unshift(newQuestion);
        
    } catch (error) {
        console.error(error);
        feedbackText.textContent = 'Lỗi khi tạo câu hỏi, sẽ chuyển sang câu tiếp theo.';
    } finally {
        submitBtn.disabled = false;
        // Chuyển sang câu hỏi tiếp theo (có thể là câu mới từ AI hoặc câu cũ)
        showNextQuestion();
    }
}


// Hàm tải câu hỏi ban đầu từ file JSON
async function loadInitialQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Không thể tải file questions.json!');
        const initialQuestions = await response.json();
        shuffleArray(initialQuestions);
        questions = initialQuestions; // Gán câu hỏi ban đầu
        startQuiz();
    } catch (error) {
        questionTextEl.textContent = 'Lỗi: ' + error.message;
        submitBtn.disabled = true;
    }
}

// Bắt đầu bài kiểm tra
function startQuiz() {
    totalQuestionsAnswered = 0;
    score = 0;
    resultsContainer.style.display = 'none';
    quizContainer.style.display = 'block';
    // Tải lại câu hỏi ban đầu khi bắt đầu lại
    loadInitialQuestions(); 
}

// Hiển thị câu hỏi (MODIFIED)
function showNextQuestion() {
    // Nếu hết câu hỏi, hiển thị kết quả
    if (questions.length === 0) {
        showResults();
        return;
    }
    
    resetState();
    // Lấy câu hỏi cuối cùng trong danh sách và xóa nó đi
    const currentQuestion = questions.pop(); 
    questionTextEl.textContent = currentQuestion.question;
    // Lưu câu trả lời đúng vào một thuộc tính của nút để dễ truy xuất
    submitBtn.dataset.answer = currentQuestion.answer; 

    progressText.textContent = `Câu đã trả lời: ${totalQuestionsAnswered}`;
    updateScore();
}

// Reset trạng thái (giữ nguyên)
function resetState() { /* ... code như cũ ... */ }
function resetState() {
    answerInput.value = '';
    feedbackText.textContent = '';
    feedbackText.className = '';
    answerInput.focus();
}


// Kiểm tra câu trả lời (MODIFIED)
function checkAnswer() {
    const userAnswer = answerInput.value.trim();
    if (userAnswer === '') {
        feedbackText.textContent = 'Vui lòng nhập câu trả lời!';
        feedbackText.className = 'feedback-incorrect';
        return;
    }
    
    // Lấy câu trả lời đúng từ thuộc tính data- của nút
    const correctAnswer = submitBtn.dataset.answer;

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        score++;
        feedbackText.textContent = 'Chính xác!';
        feedbackText.className = 'feedback-correct';
    } else {
        feedbackText.textContent = `Sai rồi! Đáp án đúng là: ${correctAnswer}`;
        feedbackText.className = 'feedback-incorrect';
    }
    
    totalQuestionsAnswered++;
    updateScore();

    // === THAY ĐỔI LỚN: Thay vì chuyển câu ngay, chúng ta gọi AI ===
    // Sau 2 giây, gọi hàm để tạo câu hỏi mới
    setTimeout(generateNewQuestion, 2000);
}


// Cập nhật điểm số (giữ nguyên)
function updateScore() { /* ... code như cũ ... */ }
function updateScore() {
    scoreText.textContent = `Điểm: ${score}`;
}

// Hiển thị kết quả cuối cùng (giữ nguyên)
function showResults() {
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    finalScoreText.textContent = `Bạn đã trả lời đúng ${score} / ${totalQuestionsAnswered} câu.`;
}

// Gắn sự kiện (giữ nguyên)
submitBtn.addEventListener('click', checkAnswer);
restartBtn.addEventListener('click', () => location.reload()); // Đơn giản là tải lại trang
answerInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitBtn.click();
    }
});

// Bắt đầu tải câu hỏi ban đầu
loadInitialQuestions();