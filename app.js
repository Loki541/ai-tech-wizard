const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const send = document.getElementById("send");

/* ===== SESSION STATE ===== */
const session = {
  stage: "start",
  problem: null,
  confirmed: false,
  stepsDone: [],
};

/* ===== HELPERS ===== */
function ai(text) {
  chat.innerHTML += `<div class="msg ai">🤖 ${text}</div>`;
  chat.scrollTop = chat.scrollHeight;
}

function user(text) {
  chat.innerHTML += `<div class="msg user">${text}</div>`;
  chat.scrollTop = chat.scrollHeight;
}

function nextQuestion() {
  if (!session.problem) {
    ai("Opisz krótko główny problem. (np. wysokie temperatury, niski FPS, czarny ekran)");
    return;
  }

  if (!session.confirmed) {
    ai(`Rozumiem. Problem: "${session.problem}". Czy to się zgadza? (tak / nie)`);
    return;
  }

  if (!session.stepsDone.includes("basic_check")) {
    ai("Krok 1: Sprawdź temperatury CPU i GPU (HWMonitor). Czy temperatury przekraczają 85°C?");
    return;
  }

  if (!session.stepsDone.includes("airflow")) {
    ai("Krok 2: Czy obudowa ma dobry przepływ powietrza? (tak / nie)");
    return;
  }

  ai("Na podstawie odpowiedzi: problem prawdopodobnie wynika z chłodzenia. Zalecam czyszczenie, wymianę pasty i poprawę airflow.");
}

/* ===== INPUT HANDLING ===== */
send.onclick = () => {
  const txt = input.value.trim().toLowerCase();
  if (!txt) return;

  user(txt);
  input.value = "";

  if (!session.problem) {
    session.problem = txt;
    nextQuestion();
    return;
  }

  if (!session.confirmed) {
    if (txt.startsWith("t")) {
      session.confirmed = true;
    } else {
      session.problem = null;
    }
    nextQuestion();
    return;
  }

  if (!session.stepsDone.includes("basic_check")) {
    session.stepsDone.push("basic_check");
    nextQuestion();
    return;
  }

  if (!session.stepsDone.includes("airflow")) {
    session.stepsDone.push("airflow");
    nextQuestion();
    return;
  }
};

/* ===== INIT ===== */
ai("Cześć. Jestem AI Tech Wizard. Przeprowadzę Cię przez diagnostykę krok po kroku.");
nextQuestion();

