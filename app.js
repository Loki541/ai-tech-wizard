const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const send = document.getElementById("send");

/* ===== SESJA ===== */
const session = {
  problem: null,
  confirmed: false,
  stepsDone: [],
  hypotheses: [],
  currentStep: 0,
  completed: false
};

/* ===== HIPOZTEZY I KROKI ===== */
const problemPaths = {
  overheating: [
    "Sprawdź temperatury CPU i GPU w HWMonitor. Czy przekraczają 85°C?",
    "Czy obudowa ma dobry przepływ powietrza?",
    "Sprawdź czy pasta termiczna jest świeża i poprawnie nałożona."
  ],
  lowFPS: [
    "Zaktualizuj sterowniki GPU.",
    "Sprawdź ustawienia gry – czy są zbyt wysokie dla sprzętu?",
    "Sprawdź procesy w tle, które obciążają CPU/GPU."
  ],
  blackScreen: [
    "Sprawdź kable monitora i źródło zasilania.",
    "Spróbuj resetu BIOS/CMOS.",
    "Sprawdź RAM – czy wszystkie kości są poprawnie włożone."
  ]
};

/* ===== POMOCNICZE ===== */
function ai(message) {
  const el = document.createElement("div");
  el.classList.add("msg", "ai");
  chat.appendChild(el);
  typeMessage(el, message);
}

function userMessage(message) {
  const el = document.createElement("div");
  el.classList.add("msg", "user", "show");
  el.textContent = message;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

/* ===== ANIMACJA PISANIA ===== */
function typeMessage(el, message) {
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += message[i];
    i++;
    if (i === message.length) {
      clearInterval(interval);
      el.classList.add("show");
      chat.scrollTop = chat.scrollHeight;
    }
  }, 25); // 25ms na znak
}

/* ===== LOGIKA ===== */
function nextQuestion() {
  if (!session.problem) {
    ai("Opisz krótko problem z komputerem lub grami. (np. wysokie temperatury, niski FPS, czarny ekran)");
    return;
  }

  if (!session.confirmed) {
    ai(`Rozumiem, Twój problem: "${session.problem}". Czy to się zgadza? (tak / nie)`);
    return;
  }

  if (session.hypotheses.length === 0) {
    // wybór hipotezy na podstawie słów kluczowych
    if (session.problem.includes("temperatur")) session.hypotheses.push("overheating");
    else if (session.problem.includes("fps")) session.hypotheses.push("lowFPS");
    else if (session.problem.includes("czarny ekran")) session.hypotheses.push("blackScreen");
    else session.hypotheses.push("overheating"); // domyślna
  }

  const current = problemPaths[session.hypotheses[0]];
  if (session.currentStep < current.length) {
    ai(current[session.currentStep]);
  } else {
    ai("Na podstawie dotychczasowych odpowiedzi problem prawdopodobnie wynika z powyższych kroków. Jeśli nic nie pasuje, napisz więcej szczegółów, aby spróbować alternatywnych rozwiązań.");
    session.completed = true;
  }
}

/* ===== INPUT HANDLING ===== */
send.onclick = handleInput;
input.addEventListener("keypress", (e) => { if(e.key==="Enter") handleInput(); });

function handleInput() {
  const txt = input.value.trim().toLowerCase();
  if (!txt) return;

  userMessage(input.value);
  input.value = "";

  if (!session.problem) {
    session.problem = txt;
    nextQuestion();
    return;
  }

  if (!session.confirmed) {
    if (txt.startsWith("t")) session.confirmed = true;
    else {
      ai("Ok, opisz swój problem ponownie.");
      session.problem = null;
    }
    nextQuestion();
    return;
  }

  if (!session.completed) {
    session.currentStep++;
    nextQuestion();
    return;
  }

  // obsługa alternatyw po ukończeniu
  if (txt.includes("nie") || txt.includes("odrzucam") || txt.includes("nie pasuje")) {
    ai("Rozumiem, spróbujmy alternatywnej ścieżki diagnostycznej.");
    session.hypotheses.push("lowFPS"); // przykład alternatywy
    session.currentStep = 0;
    session.completed = false;
    nextQuestion();
    return;
  }

  ai("Dziękuję za informacje. Możesz dalej pisać szczegóły, abyśmy przeszli kolejne kroki diagnostyki.");
}

/* ===== INIT ===== */
ai("Witaj w AI Tech Wizard. Przeprowadzę Cię przez diagnostykę krok po kroku.");
nextQuestion();
