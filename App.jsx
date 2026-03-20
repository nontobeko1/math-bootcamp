import React, { useState, useEffect, useRef } from "react";

const CURRICULUM = [
  {
    id: 1,
    week: "Week 1",
    title: "Number Systems & Algebra Foundations",
    icon: "∑",
    color: "#00C9A7",
    topics: ["Integers, rationals, irrationals, real numbers", "Laws of exponents and surds", "Factorisation and algebraic manipulation", "Solving linear and quadratic equations"],
    difficulty: "Foundation",
  },
  {
    id: 2,
    week: "Week 2",
    title: "Functions & Graphs",
    icon: "f(x)",
    color: "#845EC2",
    topics: ["Definition of a function, domain & range", "Linear, quadratic, exponential, logarithmic functions", "Transformations and sketching", "Inverse functions"],
    difficulty: "Foundation",
  },
  {
    id: 3,
    week: "Week 3",
    title: "Sequences, Series & Financial Maths",
    icon: "∞",
    color: "#FF6B6B",
    topics: ["Arithmetic and geometric sequences", "Sum formulas for series", "Simple and compound interest", "Annuities and loan repayments (key actuarial concept)"],
    difficulty: "Intermediate",
  },
  {
    id: 4,
    week: "Week 4",
    title: "Trigonometry",
    icon: "θ",
    color: "#FFC75F",
    topics: ["Trig ratios and the unit circle", "Trig identities and equations", "Sine & cosine rules", "2D and 3D applications"],
    difficulty: "Intermediate",
  },
  {
    id: 5,
    week: "Week 5",
    title: "Euclidean Geometry & Analytical Geometry",
    icon: "△",
    color: "#4ECDC4",
    topics: ["Circle theorems and proofs", "Distance, midpoint, gradient formulas", "Equations of lines and circles", "Coordinate geometry problems"],
    difficulty: "Intermediate",
  },
  {
    id: 6,
    week: "Week 6",
    title: "Calculus – Differentiation",
    icon: "d/dx",
    color: "#F9A03F",
    topics: ["Limits and the concept of a derivative", "Rules: power, product, chain rule", "Applications: tangents, rates of change", "Optimisation problems"],
    difficulty: "Advanced",
  },
  {
    id: 7,
    week: "Week 7",
    title: "Calculus – Integration & Statistics",
    icon: "∫",
    color: "#C34A36",
    topics: ["Indefinite and definite integrals", "Area under a curve", "Probability basics, permutations & combinations", "Normal distribution (actuarial foundation)"],
    difficulty: "Advanced",
  },
  {
    id: 8,
    week: "Week 8",
    title: "Exam Simulation & Actuarial Readiness",
    icon: "★",
    color: "#2C73D2",
    topics: ["Full timed mock exam (3 hours)", "ASSA CT1 Financial Mathematics preview", "Review of all weak areas", "Exam strategy and time management"],
    difficulty: "Exam Prep",
  },
];

const DIFFICULTY_COLORS = {
  Foundation: "#00C9A7",
  Intermediate: "#FFC75F",
  Advanced: "#FF6B6B",
  "Exam Prep": "#2C73D2",
};

const SAMPLE_QUESTIONS = {
  1: [
    { q: "Simplify: 2³ × 2⁵", a: "2⁸ = 256", hint: "When multiplying same base, add the exponents." },
    { q: "Factorise: x² - 5x + 6", a: "(x - 2)(x - 3)", hint: "Find two numbers that multiply to 6 and add to -5." },
    { q: "Solve for x: 3x + 7 = 22", a: "x = 5", hint: "Subtract 7 from both sides, then divide by 3." },
  ],
  3: [
    { q: "The 1st term of an arithmetic sequence is 3, common difference is 5. What is the 10th term?", a: "48", hint: "Use Tₙ = a + (n-1)d" },
    { q: "R10,000 is invested at 8% compound interest for 3 years. What is the final amount?", a: "R12,597.12", hint: "Use A = P(1 + r)ⁿ" },
    { q: "Find the sum of the first 6 terms: 2, 6, 18, 54...", a: "728", hint: "Geometric series: Sₙ = a(rⁿ - 1)/(r - 1)" },
  ],
  6: [
    { q: "Differentiate: f(x) = 3x⁴ - 2x² + 7", a: "f'(x) = 12x³ - 4x", hint: "Power rule: bring down the exponent, reduce it by 1." },
    { q: "Find the gradient of y = x² at the point x = 3", a: "6", hint: "Differentiate first, then substitute x = 3." },
    { q: "A rectangle has perimeter 40cm. Find dimensions for maximum area.", a: "10cm × 10cm (square)", hint: "Express area as function of one variable, then differentiate and set to 0." },
  ],
};

export default function MathBootcamp() {
  const [activeTab, setActiveTab] = useState("curriculum");
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "👋 Hi! I'm your AI maths tutor. Ask me anything — from basic algebra to financial mathematics. I'll explain it step by step. What are you struggling with?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [practiceMode, setPracticeMode] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    const userMsg = userInput.trim();
    setUserInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an expert South African high school and university mathematics tutor helping a student prepare for actuarial science exams. The student has matric-level mathematics (46%) and wants to qualify for ASSA actuarial exams. 

Your job:
- Explain concepts clearly with step-by-step workings
- Use South African curriculum context (NSC/matric level building to university level)
- Focus on: algebra, functions, sequences/series, financial maths, trigonometry, calculus, statistics, probability
- Always show working, not just answers
- Be encouraging but honest about difficulty
- Use LaTeX-style notation written plainly (e.g. x^2, sqrt(x))
- Keep responses concise but thorough — max 3-4 paragraphs
- When relevant, connect concepts to actuarial work (risk, interest rates, probability)`,
          messages: [
            ...chatMessages.slice(-6).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text })),
            { role: "user", content: userMsg }
          ]
        })
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Sorry, I couldn't process that. Try again!";
      setChatMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", text: "Connection error. Please try again." }]);
    }
    setIsLoading(false);
  };

  const startPractice = (weekId) => {
    const qs = SAMPLE_QUESTIONS[weekId];
    if (!qs) {
      setChatMessages(prev => [...prev, { role: "assistant", text: `Great choice! Week ${weekId} practice is coming soon. For now, ask me any question on the topics in that week and I'll walk you through them. 💪` }]);
      setActiveTab("tutor");
      return;
    }
    setPracticeMode({ weekId, questions: qs });
    setCurrentQ(0);
    setShowAnswer(false);
    setShowHint(false);
    setActiveTab("practice");
  };

  const markComplete = (weekId) => {
    if (!completedWeeks.includes(weekId)) {
      setCompletedWeeks(prev => [...prev, weekId]);
    }
  };

  const progressPct = Math.round((completedWeeks.length / CURRICULUM.length) * 100);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 50%, #0a0a1a 100%)",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e8e8f0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #00C9A7 0%, #2C73D2 50%, #845EC2 100%)",
        padding: "3px 0",
      }} />
      <div style={{ padding: "28px 24px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "linear-gradient(135deg, #00C9A7, #2C73D2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: "bold", color: "#fff"
          }}>∑</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: "bold", color: "#fff", letterSpacing: "-0.5px" }}>
              Actuarial Math Bootcamp
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#8899bb" }}>
              8-Week Intensive · Matric → ASSA Readiness · AI-Powered Tutoring
            </p>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#00C9A7" }}>{progressPct}%</div>
            <div style={{ fontSize: 11, color: "#8899bb" }}>Complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: "#1a2035", borderRadius: 3, margin: "16px 0", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${progressPct}%`,
            background: "linear-gradient(90deg, #00C9A7, #2C73D2)",
            borderRadius: 3, transition: "width 0.5s ease"
          }} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {[
            { id: "curriculum", label: "📚 Curriculum" },
            { id: "tutor", label: "🤖 AI Tutor" },
            { id: "practice", label: "✏️ Practice" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 13, fontFamily: "inherit", fontWeight: activeTab === tab.id ? "bold" : "normal",
              background: activeTab === tab.id ? "linear-gradient(135deg, #00C9A7, #2C73D2)" : "#131c2e",
              color: activeTab === tab.id ? "#fff" : "#8899bb",
              transition: "all 0.2s"
            }}>{tab.label}</button>
          ))}
        </div>

        {/* CURRICULUM TAB */}
        {activeTab === "curriculum" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {CURRICULUM.map(week => {
                const done = completedWeeks.includes(week.id);
                return (
                  <div key={week.id} onClick={() => setSelectedWeek(selectedWeek === week.id ? null : week.id)}
                    style={{
                      background: done ? "linear-gradient(135deg, #0d2a1f, #0d1b2a)" : "#111827",
                      border: `1px solid ${done ? week.color + "55" : "#1e2d45"}`,
                      borderLeft: `3px solid ${week.color}`,
                      borderRadius: 10, padding: 16, cursor: "pointer",
                      transition: "all 0.2s", opacity: done ? 0.85 : 1,
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 11, color: week.color, fontWeight: "bold", marginBottom: 2, letterSpacing: 1 }}>
                          {week.week.toUpperCase()}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: "bold", color: "#e8e8f0", marginBottom: 6, lineHeight: 1.3 }}>
                          {week.title}
                        </div>
                      </div>
                      <div style={{
                        fontSize: 18, width: 36, height: 36, display: "flex", alignItems: "center",
                        justifyContent: "center", background: week.color + "22",
                        borderRadius: 8, color: week.color, flexShrink: 0, marginLeft: 8
                      }}>{done ? "✓" : week.icon}</div>
                    </div>

                    <div style={{
                      display: "inline-block", fontSize: 10, padding: "2px 8px",
                      borderRadius: 20, background: DIFFICULTY_COLORS[week.difficulty] + "22",
                      color: DIFFICULTY_COLORS[week.difficulty], marginBottom: 8
                    }}>{week.difficulty}</div>

                    {selectedWeek === week.id && (
                      <div style={{ marginTop: 8 }}>
                        <ul style={{ margin: 0, paddingLeft: 16, listStyle: "none" }}>
                          {week.topics.map((t, i) => (
                            <li key={i} style={{ fontSize: 12, color: "#8899bb", marginBottom: 4, paddingLeft: 0 }}>
                              <span style={{ color: week.color, marginRight: 6 }}>›</span>{t}
                            </li>
                          ))}
                        </ul>
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button onClick={(e) => { e.stopPropagation(); startPractice(week.id); }} style={{
                            padding: "6px 14px", background: week.color, border: "none",
                            borderRadius: 6, color: "#000", fontSize: 12, fontWeight: "bold",
                            cursor: "pointer", fontFamily: "inherit"
                          }}>Practice</button>
                          <button onClick={(e) => { e.stopPropagation(); markComplete(week.id); }} style={{
                            padding: "6px 14px", background: done ? "#1e2d45" : "#1e2d45",
                            border: `1px solid ${done ? week.color : "#2e3d55"}`,
                            borderRadius: 6, color: done ? week.color : "#8899bb",
                            fontSize: 12, cursor: "pointer", fontFamily: "inherit"
                          }}>{done ? "✓ Done" : "Mark Done"}</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tips box */}
            <div style={{
              marginTop: 20, padding: 16,
              background: "#0d1b2a", border: "1px solid #1e3a5f",
              borderLeft: "3px solid #2C73D2", borderRadius: 10
            }}>
              <div style={{ fontSize: 13, fontWeight: "bold", color: "#2C73D2", marginBottom: 8 }}>
                🎯 Your Actuarial Roadmap
              </div>
              <div style={{ fontSize: 12, color: "#8899bb", lineHeight: 1.8 }}>
                <strong style={{ color: "#e8e8f0" }}>Goal:</strong> Weeks 1–7 build you to NSC Level 6+, Week 8 introduces ASSA CT1 concepts.<br />
                <strong style={{ color: "#e8e8f0" }}>Daily commitment:</strong> 1–2 hours/day · Use the AI Tutor tab for any concept you're stuck on.<br />
                <strong style={{ color: "#e8e8f0" }}>Key focus areas:</strong> Week 3 (financial maths) and Week 7 (probability) are the most actuarially relevant.<br />
                <strong style={{ color: "#e8e8f0" }}>After this bootcamp:</strong> Attempt ASSA CT1 (now CM1) — Financial Mathematics exam.
              </div>
            </div>
          </div>
        )}

        {/* TUTOR TAB */}
        {activeTab === "tutor" && (
          <div style={{ display: "flex", flexDirection: "column", height: "62vh" }}>
            <div style={{
              flex: 1, overflowY: "auto", padding: "4px 0 12px",
              scrollbarWidth: "thin", scrollbarColor: "#1e2d45 transparent"
            }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 12
                }}>
                  {msg.role === "assistant" && (
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, #00C9A7, #2C73D2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, color: "#fff", marginRight: 8, marginTop: 2
                    }}>∑</div>
                  )}
                  <div style={{
                    maxWidth: "75%", padding: "10px 14px", borderRadius: 12,
                    background: msg.role === "user" ? "linear-gradient(135deg, #2C73D2, #845EC2)" : "#111827",
                    border: msg.role === "user" ? "none" : "1px solid #1e2d45",
                    fontSize: 13, lineHeight: 1.65, color: "#e8e8f0",
                    borderBottomRightRadius: msg.role === "user" ? 2 : 12,
                    borderBottomLeftRadius: msg.role === "assistant" ? 2 : 12,
                    whiteSpace: "pre-wrap"
                  }}>{msg.text}</div>
                </div>
              ))}
              {isLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 36 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: "50%", background: "#00C9A7",
                      animation: "pulse 1.2s infinite", animationDelay: `${i * 0.2}s`
                    }} />
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick prompts */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {[
                "Explain compound interest step by step",
                "How do I factorise a quadratic?",
                "What is a derivative used for?",
                "Show me the normal distribution",
              ].map(prompt => (
                <button key={prompt} onClick={() => { setUserInput(prompt); }} style={{
                  padding: "4px 10px", background: "#111827", border: "1px solid #1e2d45",
                  borderRadius: 20, color: "#8899bb", fontSize: 11, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.2s"
                }}>{prompt}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Ask me any maths question..."
                style={{
                  flex: 1, padding: "11px 14px", background: "#111827",
                  border: "1px solid #1e2d45", borderRadius: 10,
                  color: "#e8e8f0", fontSize: 13, fontFamily: "inherit",
                  outline: "none"
                }}
              />
              <button onClick={sendMessage} disabled={isLoading} style={{
                padding: "11px 20px", background: isLoading ? "#1e2d45" : "linear-gradient(135deg, #00C9A7, #2C73D2)",
                border: "none", borderRadius: 10, color: "#fff",
                fontSize: 13, fontWeight: "bold", cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "all 0.2s"
              }}>Send →</button>
            </div>
          </div>
        )}

        {/* PRACTICE TAB */}
        {activeTab === "practice" && (
          <div>
            {!practiceMode ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✏️</div>
                <div style={{ fontSize: 16, color: "#8899bb", marginBottom: 20 }}>
                  Select a week from the Curriculum tab and click <strong style={{ color: "#e8e8f0" }}>Practice</strong> to start.
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {[1, 3, 6].map(id => {
                    const w = CURRICULUM.find(c => c.id === id);
                    return (
                      <button key={id} onClick={() => startPractice(id)} style={{
                        padding: "10px 18px", background: "#111827",
                        border: `1px solid ${w.color}44`, borderRadius: 8,
                        color: w.color, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
                      }}>Try Week {id}: {w.title.split("&")[0].trim()}</button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: "#8899bb" }}>
                    Question {currentQ + 1} of {practiceMode.questions.length}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {practiceMode.questions.map((_, i) => (
                      <div key={i} style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: i < currentQ ? "#00C9A7" : i === currentQ ? "#2C73D2" : "#1e2d45"
                      }} />
                    ))}
                  </div>
                </div>

                <div style={{
                  background: "#111827", border: "1px solid #1e2d45",
                  borderLeft: "3px solid #2C73D2", borderRadius: 12, padding: 24, marginBottom: 16
                }}>
                  <div style={{ fontSize: 11, color: "#2C73D2", letterSpacing: 1, marginBottom: 10 }}>QUESTION</div>
                  <div style={{ fontSize: 16, color: "#e8e8f0", lineHeight: 1.6 }}>
                    {practiceMode.questions[currentQ].q}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <button onClick={() => setShowHint(!showHint)} style={{
                    padding: "8px 16px", background: "#111827",
                    border: "1px solid #FFC75F44", borderRadius: 8,
                    color: "#FFC75F", fontSize: 12, cursor: "pointer", fontFamily: "inherit"
                  }}>💡 {showHint ? "Hide" : "Show"} Hint</button>
                  <button onClick={() => setShowAnswer(!showAnswer)} style={{
                    padding: "8px 16px", background: showAnswer ? "linear-gradient(135deg, #00C9A7, #2C73D2)" : "#111827",
                    border: "1px solid #00C9A744", borderRadius: 8,
                    color: showAnswer ? "#fff" : "#00C9A7", fontSize: 12, cursor: "pointer", fontFamily: "inherit"
                  }}>✓ {showAnswer ? "Hide" : "Show"} Answer</button>
                </div>

                {showHint && (
                  <div style={{
                    background: "#1a1500", border: "1px solid #FFC75F33",
                    borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13, color: "#FFC75F"
                  }}>
                    💡 <strong>Hint:</strong> {practiceMode.questions[currentQ].hint}
                  </div>
                )}

                {showAnswer && (
                  <div style={{
                    background: "#001a14", border: "1px solid #00C9A733",
                    borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14,
                    color: "#00C9A7", fontWeight: "bold"
                  }}>
                    ✓ Answer: {practiceMode.questions[currentQ].a}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {currentQ > 0 && (
                    <button onClick={() => { setCurrentQ(q => q - 1); setShowAnswer(false); setShowHint(false); }} style={{
                      padding: "8px 16px", background: "#111827", border: "1px solid #1e2d45",
                      borderRadius: 8, color: "#8899bb", fontSize: 12, cursor: "pointer", fontFamily: "inherit"
                    }}>← Previous</button>
                  )}
                  {currentQ < practiceMode.questions.length - 1 ? (
                    <button onClick={() => { setCurrentQ(q => q + 1); setShowAnswer(false); setShowHint(false); }} style={{
                      padding: "8px 16px", background: "linear-gradient(135deg, #2C73D2, #845EC2)",
                      border: "none", borderRadius: 8, color: "#fff",
                      fontSize: 12, cursor: "pointer", fontFamily: "inherit"
                    }}>Next Question →</button>
                  ) : (
                    <button onClick={() => { markComplete(practiceMode.weekId); setPracticeMode(null); setActiveTab("curriculum"); }} style={{
                      padding: "8px 16px", background: "linear-gradient(135deg, #00C9A7, #2C73D2)",
                      border: "none", borderRadius: 8, color: "#fff",
                      fontSize: 12, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit"
                    }}>🎉 Complete Week ✓</button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ height: 32 }} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        * { box-sizing: border-box; }
        input::placeholder { color: #3a4a60; }
      `}</style>
    </div>
  );
}
