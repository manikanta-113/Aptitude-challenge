const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Load questions from JSON file
const questionsPath = path.join(__dirname, 'questions.json');
let questions = [];
function loadQuestions() {
  try {
    const data = fs.readFileSync(questionsPath, 'utf-8');
    questions = JSON.parse(data);
  } catch (err) {
    console.error('Error loading questions:', err);
    questions = [];
  }
}
loadQuestions();

// In-memory user responses
const userResponses = [];

// Get today's question (rotate daily)
app.get('/api/question', (req, res) => {
  const today = new Date();
  const idx = today.getDate() % questions.length;
  const question = questions[idx];
  res.json({
    id: question.id,
    text: question.text,
    options: question.options
  });
});

// Get all questions
app.get('/api/questions', (req, res) => {
  const todayQuestions = questions.map(q => ({
    id: q.id,
    text: q.text,
    options: q.options
  }));
  res.json(todayQuestions);
});

// Submit answer with username and store response with timestamp
app.post('/api/answer', (req, res) => {
  const { id, answer, username } = req.body;
  const question = questions.find(q => q.id === id);
  const isCorrect = question && parseInt(answer, 10) === question.answer;
  const now = new Date();
  // Prevent multiple submissions per user per day per question
  const alreadyAnswered = userResponses.find(r => r.username === username && r.id === id && r.date === now.toDateString());
  if (!alreadyAnswered) {
    userResponses.push({
      username,
      id,
      answer: parseInt(answer, 10),
      correct: isCorrect,
      timestamp: now.toISOString(),
      date: now.toDateString()
    });
  }
  res.json({ correct: isCorrect, alreadyAnswered: !!alreadyAnswered });
});

// (Optional) Get all responses (for leaderboard/admin)
app.get('/api/responses', (req, res) => {
  res.json(userResponses);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
