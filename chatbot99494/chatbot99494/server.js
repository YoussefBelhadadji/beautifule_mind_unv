// ✅ server.js (مُعدّل لضمان استجابة منظمة)
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = 3001;
const HISTORY_DIR = path.join(__dirname, 'history');

const chatHistories = {};

// Ensure history directory exists
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

// Function to save chat history to a file
function saveChatHistory(sessionId, history) {
  const filePath = path.join(HISTORY_DIR, `${sessionId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
}

// Function to load chat history from a file
function loadChatHistory(sessionId) {
  const filePath = path.join(HISTORY_DIR, `${sessionId}.json`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return null;
}

const SESSION_STAGES = {
  GREETING: "greeting",
  EXPLORATION: "exploration",
  INTERVENTION: "intervention",
  CLOSURE: "closure",
};

function determineSessionStage(history, userMessage, currentStage) {
  if (currentStage === SESSION_STAGES.GREETING && history.length > 4) {
    return SESSION_STAGES.EXPLORATION;
  }
  if (
    currentStage === SESSION_STAGES.EXPLORATION &&
    /مشكلة|أشعر بـ|قلق|تعب|أحتاج مساعدة|حل|ماذا أفعل|كيف أحل/.test(userMessage)
  ) {
    return SESSION_STAGES.INTERVENTION;
  }
  if (/شكرًا|أنهي الجلسة|يكفي لليوم/.test(userMessage)) {
    return SESSION_STAGES.CLOSURE;
  }
  return currentStage;
}

const apiKey = process.env.VITE_CHATBOT_API_KEY || process.env.NEXT_PUBLIC_CHATBOT_KEY || process.env.API_KEY;
if (!apiKey) {
  console.error("Error: API_KEY is not set in environment variables.");
  process.exit(1);
}
console.log("API Key loaded:", apiKey ? "*****" : "Not loaded");

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generationConfig = {
  temperature: 0.3,
  topP: 0.5,
  topK: 30,
  maxOutputTokens: 2048,
};

const systemInstruction = `
تعليمات صارمة للمساعد:
- يجب أن يكون كل رد منظمًا وواضحًا، مع استخدام تنسيق Markdown بشكل فعال.
- ابدأ بمقدمة قصيرة ومباشرة.
- استخدم عناوين فرعية (مثل **عنوان فرعي**) لتنظيم المحتوى.
- استخدم القوائم (النقاط أو الأرقام) لتقديم المعلومات بشكل مرتب، مع ترك سطر فارغ بين كل عنصر في القائمة لسهولة القراءة.
- اختتم الرد بخاتمة تحدد الخطوة التالية أو سؤال مفتوح لتشجيع المستخدم على مواصلة المحادثة.
- تجنب الفقرات الطويلة؛ قسم المعلومات إلى جمل قصيرة وواضحة.
- استخدم لغة داعمة ومتعاطفة، مع التركيز على تقديم الدعم النفسي والإرشادي.
- لا تقم بتشخيص أي حالات طبية أو نفسية.
- لا تستخدم مصطلحات طبية، تجارية، أو نهائية.
- عند مناقشة الأعراض أو المشاعر، اطلب دائمًا تفاصيل إضافية ومحددة مثل:
  - متى بدأت هذه الأعراض/المشاعر؟
  - ما مدى شدتها أو تأثيرها على حياتك اليومية؟
  - هل هناك أي عوامل معينة تزيدها سوءًا أو تحسنها؟
  - هل جربت أي طرق للتعامل معها من قبل؟ وماذا كانت النتائج؟
- كن تفاعليًا للغاية من خلال طرح أسئلة مفتوحة تشجع المستخدم على التعبير عن نفسه بحرية وتقديم معلومات أعمق.
- قدم اقتراحات عامة وعملية للتعامل مع المشاعر أو المواقف الصعبة، مع التأكيد دائمًا على أنك لست بديلاً عن الاستشارة المتخصصة (مثل الأطباء أو المعالجين النفسيين).
- حافظ على نبرة صوت إيجابية ومشجعة.
- تأكد من أن جميع الردود ذات صلة مباشرة بسياق المحادثة وتلبي احتياجات المستخدم بدقة.
`;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000' // Assuming your main website runs on port 3000
}));


app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const sessionId = req.body.sessionId || "default-session";

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!chatHistories[sessionId]) {
    const loadedHistory = loadChatHistory(sessionId);
    if (loadedHistory) {
      chatHistories[sessionId] = loadedHistory;
    } else {
      chatHistories[sessionId] = {
        userHistory: [],
        currentStage: SESSION_STAGES.GREETING,
      };
    }
  }

  const currentStage = chatHistories[sessionId].currentStage;
  const nextStage = determineSessionStage(chatHistories[sessionId].userHistory, userMessage, currentStage);

  if (nextStage !== currentStage) {
    let stageMessage = "";
    if (nextStage === SESSION_STAGES.EXPLORATION) {
      stageMessage = "استكشاف الحالة\nسأطرح عليك بعض الأسئلة لفهم حالتك بشكل أفضل.";
    } else if (nextStage === SESSION_STAGES.INTERVENTION) {
      stageMessage = "تدخل مبدئي\nسأقترح بعض الخطوات البسيطة لمساعدتك.";
    } else if (nextStage === SESSION_STAGES.CLOSURE) {
      stageMessage = "نهاية الجلسة\nشكرًا لمشاركتك، واعتنِ بنفسك دائمًا.";
    }
    chatHistories[sessionId].userHistory.push({ role: "user", parts: [{ text: stageMessage }] });
    chatHistories[sessionId].currentStage = nextStage;
  }

  chatHistories[sessionId].userHistory.push({ role: "user", parts: [{ text: userMessage }] });

  const fullHistory = [
    { role: "user", parts: [{ text: systemInstruction }] },
    ...chatHistories[sessionId].userHistory,
  ];

  try {
    const chatSession = model.startChat({
      generationConfig,
      history: fullHistory,
    });

    const result = await chatSession.sendMessage(userMessage);
    const responseText = result.response.text();
    console.log("Raw responseText from Gemini API:", responseText);

    if (!responseText?.trim()) {
      return res.json({ response: "تعذر توليد استجابة. الرجاء المحاولة مجددًا." });
    }

    chatHistories[sessionId].userHistory.push({ role: "model", parts: [{ text: responseText }] });
    saveChatHistory(sessionId, chatHistories[sessionId]); // Save history after each interaction
    res.setHeader("Content-Type", "application/json");
    res.json({ response: responseText });
  } catch (error) {
    console.error("Error in chat session:", error);
    res.status(500).json({ response: "حدث خطأ داخلي. الرجاء المحاولة لاحقًا.", details: error.message });
  }
});

app.get("/chat/history/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  const history = loadChatHistory(sessionId);
  if (history) {
    res.json(history.userHistory);
  } else {
    res.json([]);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
