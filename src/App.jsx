import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// ─── DADOS ESTÁTICOS (não mudam com frequência) ──────────────────────────────

const HOT_TOPICS = [
  { tag: "#canonocidental", posts: 34, heat: 95 },
  { tag: "#traducoes", posts: 21, heat: 78 },
  { tag: "#leituraslenta", posts: 18, heat: 65 },
  { tag: "#machado2024", posts: 15, heat: 55 },
];

const CURRENT_BOOK = {
  title: "Dom Casmurro", author: "Machado de Assis",
  cover: "https://m.media-amazon.com/images/I/71J1gDPn6rL._AC_UF1000,1000_QL80_.jpg",
  totalPages: 256, currentPage: 168, dueDate: "28 abr", members: 12, reading: 9,
};

const VOTE_CANDIDATES = [
  { id: 1, title: "Grande Sertão: Veredas", author: "Guimarães Rosa", cover: "https://m.media-amazon.com/images/I/81sGpXXNKKL._AC_UF1000,1000_QL80_.jpg" },
  { id: 2, title: "Ensaio sobre a Cegueira", author: "José Saramago", cover: "https://m.media-amazon.com/images/I/71KsBMwNbHL._AC_UF1000,1000_QL80_.jpg" },
  { id: 3, title: "Memórias Póstumas de Brás Cubas", author: "Machado de Assis", cover: "https://m.media-amazon.com/images/I/71RrJmHADrL._AC_UF1000,1000_QL80_.jpg" },
  { id: 4, title: "A Hora da Estrela", author: "Clarice Lispector", cover: "https://m.media-amazon.com/images/I/61g3x3AVSRL._AC_UF1000,1000_QL80_.jpg" },
];

const AGENDA = [
  { id: 1, title: "Encontro Mensal · Dom Casmurro", date: "28 Abr", time: "19h00", type: "online", platform: "Google Meet", confirmed: 9 },
  { id: 2, title: "Votação · Livro de Maio", date: "30 Abr", time: "23h59", type: "online", platform: "Plataforma", confirmed: 12 },
  { id: 3, title: "Encontro Presencial · Café Literário", date: "10 Mai", time: "16h00", type: "presencial", platform: "Café Figueira", confirmed: 6 },
];

const CHALLENGES = [
  { id: 1, title: "Leia um clássico brasileiro", deadline: "Abr 2026", total: 12, done: 8, icon: "🇧🇷" },
  { id: 2, title: "50 páginas por semana", deadline: "Maio 2026", total: 12, done: 10, icon: "📄" },
  { id: 3, title: "Um livro traduzido", deadline: "Jun 2026", total: 12, done: 5, icon: "🌍" },
];

const FORUM_THREADS = [
  { id: 1, book: "Dom Casmurro", chapter: "Cap. 1–5", title: "A narração em primeira pessoa é confiável?", replies: 14, last: "Mariana · 2h", spoiler: false },
  { id: 2, book: "Dom Casmurro", chapter: "Cap. 6–12", title: "O papel de Capitu na sociedade do séc. XIX", replies: 8, last: "Felipe · 5h", spoiler: false },
  { id: 3, book: "Dom Casmurro", chapter: "Cap. 13+", title: "⚠️ SPOILER — O desfecho e a culpa de Bentinho", replies: 21, last: "Beatriz · 1h", spoiler: true },
];

// ─── ESTILOS BASE ────────────────────────────────────────────────────────────

const S = {
  card: { background: "#13100c", border: "1px solid #2a2218", padding: "28px" },
  label: { fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4a3c2e" },
  title: { fontFamily: "'Playfair Display', Georgia, serif", color: "#e8d5b0" },
  muted: { fontSize: "11px", color: "#5a4a3a" },
};

function Label({ children, style }) {
  return <div style={{ ...S.label, marginBottom: "20px", ...style }}>{children}</div>;
}

function Avatar({ name, color, size = 32, online }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: color + "22", border: `1px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, color: "#c8b89a" }}>
        {name[0]}
      </div>
      {online !== undefined && (
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: online ? "#7ab89a" : "#3a3228", border: "1px solid #0f0c09" }} />
      )}
    </div>
  );
}

function Loading() {
  return <div style={{ fontSize: "11px", color: "#3a2e22", fontStyle: "italic", padding: "20px 0" }}>Carregando...</div>;
}

// ─── POMODORO ────────────────────────────────────────────────────────────────

function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState("focus");
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s === 0) {
            setMinutes(m => {
              if (m === 0) {
                setActive(false);
                const next = mode === "focus" ? "break" : "focus";
                if (mode === "focus") setCycles(c => c + 1);
                setMode(next);
                return next === "focus" ? 25 : 5;
              }
              return m - 1;
            });
            return 59;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [active, mode]);

  const total = mode === "focus" ? 25 * 60 : 5 * 60;
  const elapsed = total - (minutes * 60 + seconds);
  const pct = elapsed / total;
  const circ = 2 * Math.PI * 54;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
      <div style={{ display: "flex", gap: "6px" }}>
        {["focus", "break"].map(m => (
          <button key={m} onClick={() => { setMode(m); setActive(false); setMinutes(m === "focus" ? 25 : 5); setSeconds(0); }}
            style={{ padding: "3px 12px", borderRadius: "20px", border: "1px solid", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s", background: mode === m ? "#e8d5b0" : "transparent", borderColor: mode === m ? "#e8d5b0" : "#3a3228", color: mode === m ? "#1a1410" : "#8a7a68" }}>
            {m === "focus" ? "Foco" : "Pausa"}
          </button>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="60" cy="60" r="54" fill="none" stroke="#2a2218" strokeWidth="5" />
          <circle cx="60" cy="60" r="54" fill="none" stroke={mode === "focus" ? "#e8d5b0" : "#7ab89a"} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={circ - pct * circ}
            style={{ transition: "stroke-dashoffset 0.5s ease", strokeLinecap: "round" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "26px", color: "#e8d5b0", letterSpacing: "-1px" }}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <div style={{ fontSize: "9px", color: "#5a4a3a", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            {mode === "focus" ? "Leitura" : "Pausa"}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => setActive(a => !a)}
          style={{ padding: "6px 20px", border: "none", cursor: "pointer", fontFamily: "'Playfair Display', serif", fontSize: "12px", transition: "all 0.2s", background: active ? "#3a3228" : "#e8d5b0", color: active ? "#e8d5b0" : "#1a1410" }}>
          {active ? "Pausar" : "Iniciar"}
        </button>
        <button onClick={() => { setActive(false); setMinutes(mode === "focus" ? 25 : 5); setSeconds(0); }}
          style={{ padding: "6px 12px", border: "1px solid #3a3228", cursor: "pointer", background: "transparent", color: "#6a5a48", fontSize: "11px" }}>↺</button>
      </div>
      <div style={{ display: "flex", gap: "5px" }}>
        {[...Array(4)].map((_, i) => <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: i < cycles % 4 ? "#e8d5b0" : "#2a2218", transition: "background 0.3s" }} />)}
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function Dashboard() {
  const [hovered, setHovered] = useState(null);
  // 🔗 SUPABASE: busca membros e livros do banco
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // busca membros ordenados por páginas lidas
      const { data: membersData } = await supabase
        .from('members')
        .select('*')
        .order('pages', { ascending: false });

      // busca livros ordenados por nota
      const { data: booksData } = await supabase
        .from('books')
        .select('*')
        .order('rating', { ascending: false });

      if (membersData) setMembers(membersData);
      if (booksData) setBooks(booksData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const pct = Math.round((CURRENT_BOOK.currentPage / CURRENT_BOOK.totalPages) * 100);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px" }}>

      {/* Leitura do mês */}
      <div style={{ ...S.card, gridColumn: "span 2", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "16px", right: "16px", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#3a2e22", background: "#1a1610", padding: "4px 10px", border: "1px solid #2a2218" }}>leitura do mês</div>
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
          <img src={CURRENT_BOOK.cover} alt="" style={{ width: "76px", height: "114px", objectFit: "cover", filter: "sepia(25%)", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
          <div style={{ flex: 1 }}>
            <div style={{ ...S.title, fontSize: "20px", fontStyle: "italic", marginBottom: "4px" }}>{CURRENT_BOOK.title}</div>
            <div style={{ ...S.muted, marginBottom: "18px" }}>{CURRENT_BOOK.author}</div>
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={S.muted}>Progresso coletivo</span>
                <span style={{ fontSize: "11px", color: "#e8d5b0" }}>{pct}%</span>
              </div>
              <div style={{ height: "2px", background: "#2a2218" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(to right, #8a6a3a, #e8d5b0)" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "20px" }}>
              {[["membros", CURRENT_BOOK.members], ["lendo", CURRENT_BOOK.reading], ["prazo", CURRENT_BOOK.dueDate]].map(([k, v]) => (
                <div key={k}><div style={{ ...S.label, marginBottom: "3px" }}>{k}</div><div style={{ ...S.title, fontSize: "17px" }}>{v}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pautas quentes */}
      <div style={S.card}>
        <Label>Pautas quentes</Label>
        {HOT_TOPICS.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: "3px", height: "32px", flexShrink: 0, background: `rgba(232,213,176,${t.heat / 100})` }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", color: "#c8b89a", marginBottom: "4px" }}>{t.tag}</div>
              <div style={{ height: "1px", background: "#2a2218" }}><div style={{ height: "100%", width: `${t.heat}%`, background: "#5a4a3a" }} /></div>
            </div>
            <div style={{ fontSize: "10px", color: "#3a2e22" }}>{t.posts}</div>
          </div>
        ))}
      </div>

      {/* Membros — vem do Supabase */}
      <div style={S.card}>
        <Label>Engajamento · Abril</Label>
        {loading ? <Loading /> : members.slice(0, 5).map((m, i) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <Avatar name={m.name} color={m.color || "#8a6a3a"} online={m.online} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: i === 0 ? "#e8d5b0" : "#8a7a68" }}>{m.name}</span>
                <span>{m.badge}</span>
              </div>
              <div style={{ fontSize: "10px", color: "#3a2e22" }}>{m.pages} págs</div>
            </div>
          </div>
        ))}
      </div>

      {/* Melhores notas — vem do Supabase */}
      <div style={S.card}>
        <Label>Melhores notas</Label>
        {loading ? <Loading /> : books.slice(0, 4).map((b, i) => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#2a2218", width: "20px" }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "11px", color: "#c8b89a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.title}</div>
              <div style={{ fontSize: "10px", color: "#4a3c2e" }}>{b.author}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <span style={{ color: "#8a6a3a", fontSize: "9px" }}>★</span>
              <span style={{ fontSize: "12px", color: "#e8d5b0", fontFamily: "'Playfair Display', serif" }}>{b.rating}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Estante — vem do Supabase */}
      <div style={{ ...S.card, gridColumn: "span 2" }}>
        <Label>Estante do clube</Label>
        {loading ? <Loading /> : (
          <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "4px" }}>
            {books.map(b => (
              <div key={b.id} onMouseEnter={() => setHovered(b.id)} onMouseLeave={() => setHovered(null)} style={{ flexShrink: 0, cursor: "pointer", position: "relative" }}>
                <img src={b.cover_url} alt={b.title} style={{ width: "66px", height: "100px", objectFit: "cover", filter: "sepia(20%)", display: "block", transition: "all 0.3s", transform: hovered === b.id ? "translateY(-4px)" : "none", boxShadow: hovered === b.id ? "0 10px 20px rgba(0,0,0,0.6)" : "none" }} onError={e => e.target.style.display = "none"} />
                {hovered === b.id && <div style={{ position: "absolute", inset: 0, background: "rgba(15,12,9,0.88)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "6px", textAlign: "center" }}>
                  <div style={{ color: "#e8d5b0", fontSize: "9px", lineHeight: 1.3 }}>{b.title}</div>
                  <div style={{ color: "#8a6a3a", fontSize: "9px", marginTop: "4px" }}>★ {b.rating}</div>
                </div>}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ─── VOTAÇÃO ─────────────────────────────────────────────────────────────────

function VotingSection() {
  // 🔗 SUPABASE: votos salvos e lidos do banco
  const [votes, setVotes] = useState({});
  const [voted, setVoted] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVotes();
  }, []);

  async function fetchVotes() {
    const { data } = await supabase.from('votes').select('candidate_id');
    if (data) {
      const count = {};
      data.forEach(v => { count[v.candidate_id] = (count[v.candidate_id] || 0) + 1; });
      setVotes(count);
    }
    setLoading(false);
  }

  async function vote(candidateId) {
    if (voted !== null) return;
    setVoted(candidateId);
    // salva no banco
    await supabase.from('votes').insert({ candidate_id: candidateId, member_name: 'Você' });
    fetchVotes(); // atualiza contagem
  }

  const total = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ ...S.label, marginBottom: "8px" }}>Votação aberta · fecha 30 abr</div>
        <h2 style={{ ...S.title, fontSize: "28px", fontStyle: "italic", margin: 0, fontWeight: 400 }}>Livro de Maio</h2>
        <p style={{ ...S.muted, marginTop: "6px" }}>{total} votos registrados até agora.</p>
      </div>
      {loading ? <Loading /> : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
          {VOTE_CANDIDATES.map(c => {
            const v = votes[c.id] || 0;
            const pct = total > 0 ? Math.round((v / total) * 100) : 0;
            const isLeading = v === Math.max(...Object.values(votes), 0) && v > 0;
            return (
              <div key={c.id} onClick={() => vote(c.id)} style={{ ...S.card, cursor: voted === null ? "pointer" : "default", border: `1px solid ${voted === c.id ? "#8a6a3a" : isLeading && voted !== null ? "#3a4a3a" : "#2a2218"}`, transition: "all 0.3s", position: "relative" }}>
                {isLeading && voted !== null && <div style={{ position: "absolute", top: "12px", right: "12px", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#7ab89a" }}>liderando</div>}
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "16px" }}>
                  <img src={c.cover} alt="" style={{ width: "60px", height: "90px", objectFit: "cover", filter: "sepia(20%)", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
                  <div>
                    <div style={{ ...S.title, fontSize: "15px", fontStyle: "italic", marginBottom: "4px" }}>{c.title}</div>
                    <div style={S.muted}>{c.author}</div>
                    {voted !== null && <div style={{ marginTop: "8px", fontSize: "20px", ...S.title }}>{v} <span style={{ fontSize: "11px", color: "#5a4a3a" }}>votos</span></div>}
                  </div>
                </div>
                {voted !== null && (
                  <div style={{ height: "2px", background: "#2a2218" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: voted === c.id ? "#e8d5b0" : isLeading ? "#7ab89a" : "#5a4a3a", transition: "width 0.8s ease" }} />
                  </div>
                )}
                {voted === null && <div style={{ fontSize: "11px", color: "#4a3c2e", letterSpacing: "0.1em", textTransform: "uppercase" }}>Clique para votar →</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── LINHA DO TEMPO ───────────────────────────────────────────────────────────

function Timeline() {
  // 🔗 SUPABASE: histórico de livros do banco
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('books').select('*').order('created_at', { ascending: true });
      if (data) setBooks(data);
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={S.label}>Histórico do clube</div>
        <h2 style={{ ...S.title, fontSize: "28px", fontStyle: "italic", margin: "8px 0 0", fontWeight: 400 }}>Linha do tempo</h2>
      </div>
      {loading ? <Loading /> : (
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: "140px", top: 0, bottom: 0, width: "1px", background: "linear-gradient(to bottom, transparent, #3a3228 5%, #3a3228 95%, transparent)" }} />
          {books.map(b => (
            <div key={b.id} style={{ display: "flex", alignItems: "flex-start", marginBottom: "40px" }}>
              <div style={{ width: "140px", textAlign: "right", paddingRight: "24px", flexShrink: 0 }}>
                <div style={{ ...S.title, fontSize: "13px" }}>{b.month_read}</div>
                <div style={{ fontSize: "10px", color: "#3a2e22", marginTop: "2px" }}>★ {b.rating}</div>
              </div>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#e8d5b0", border: "2px solid #0f0c09", marginTop: "4px" }} />
              </div>
              <div style={{ paddingLeft: "24px", flex: 1 }}>
                <div style={{ ...S.card, padding: "20px", display: "flex", gap: "16px" }}>
                  <img src={b.cover_url} alt="" style={{ width: "52px", height: "78px", objectFit: "cover", filter: "sepia(20%)", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
                  <div>
                    <div style={{ ...S.title, fontSize: "16px", fontStyle: "italic", marginBottom: "3px" }}>{b.title}</div>
                    <div style={{ ...S.muted, marginBottom: "8px" }}>{b.author} · {b.year}</div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span style={{ fontSize: "10px", color: "#5a4a3a" }}>{b.pages} págs</span>
                      <span style={{ fontSize: "10px", color: "#5a4a3a" }}>{b.genre}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {books.length === 0 && <div style={{ ...S.muted, fontStyle: "italic" }}>Nenhum livro registrado ainda.</div>}
        </div>
      )}
    </div>
  );
}

// ─── CITAÇÕES ─────────────────────────────────────────────────────────────────

function Quotes() {
  // 🔗 SUPABASE: citações lidas e salvas no banco
  const [quotesList, setQuotesList] = useState([]);
  const [newQuote, setNewQuote] = useState("");
  const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchQuotes() {
    const { data } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setQuotesList(data);
    setLoading(false);
  }

  fetchQuotes();

  const channel = supabase
    .channel('quotes-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quotes' },
      (payload) => {
        setQuotesList(prev => [payload.new, ...prev]);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);

  async function fetchQuotes() {
    const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
    if (data) setQuotesList(data);
    setLoading(false);
  }

  async function addQuote() {
    if (!newQuote.trim()) return;
    await supabase.from('quotes').insert({ text: newQuote, book_title: 'Dom Casmurro', member_name: 'Você' });
    setNewQuote("");
  }

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={S.label}>Trechos marcantes</div>
        <h2 style={{ ...S.title, fontSize: "28px", fontStyle: "italic", margin: "8px 0 0", fontWeight: 400 }}>Citações</h2>
      </div>
      <div style={{ ...S.card, marginBottom: "18px" }}>
        <Label>Salvar trecho</Label>
        <textarea value={newQuote} onChange={e => setNewQuote(e.target.value)}
          placeholder="Cole ou escreva o trecho aqui..."
          style={{ width: "100%", background: "#0f0c09", border: "1px solid #2a2218", color: "#c8b89a", padding: "12px", fontSize: "13px", fontFamily: "Georgia, serif", fontStyle: "italic", resize: "vertical", minHeight: "80px", outline: "none", boxSizing: "border-box" }} />
        <button onClick={addQuote} style={{ marginTop: "10px", padding: "8px 20px", background: "#e8d5b0", color: "#1a1410", border: "none", cursor: "pointer", fontFamily: "'Playfair Display', serif", fontSize: "12px" }}>
          Salvar citação
        </button>
      </div>
      {loading ? <Loading /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {quotesList.map(q => (
            <div key={q.id} style={{ ...S.card, borderLeft: "3px solid #3a3228" }}>
              <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "14px", color: "#c8b89a", lineHeight: 1.7, marginBottom: "14px" }}>"{q.text}"</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", color: "#5a4a3a" }}>{q.book_title}</span>
                <span style={{ fontSize: "11px", color: "#4a3c2e" }}>— {q.member_name}</span>
              </div>
            </div>
          ))}
          {quotesList.length === 0 && <div style={{ ...S.muted, fontStyle: "italic" }}>Nenhuma citação salva ainda. Seja o primeiro!</div>}
        </div>
      )}
    </div>
  );
}

// ─── CHAT AO VIVO ─────────────────────────────────────────────────────────────

function LiveChat() {
  // 🔗 SUPABASE: mensagens em tempo real via Realtime
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [activeRoom, setActiveRoom] = useState("geral");
  const [members, setMembers] = useState([]);
  const bottomRef = useRef(null);

  const rooms = [
    { id: "geral", label: "# geral" },
    { id: "domcasmurro", label: "# dom-casmurro" },
    { id: "indicacoes", label: "# indicações" },
    { id: "off", label: "# off-topic" },
  ];

 useEffect(() => {
  async function fetchMsgs() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('room', activeRoom)
      .order('created_at', { ascending: true })
      .limit(50);
    if (data) setMsgs(data);
  }

  async function fetchMembers() {
    const { data } = await supabase.from('members').select('*').eq('online', true);
    if (data) setMembers(data);
  }

  fetchMsgs();
  fetchMembers();

  const channel = supabase
    .channel(`chat-${activeRoom}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages',
        filter: `room=eq.${activeRoom}` },
      (payload) => {
        setMsgs(prev => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [activeRoom]);

  async function send() {
  if (!input.trim()) return;
  const msg = { member_name: "Você", member_color: "#8a6a3a", text: input, room: activeRoom };
  setInput("");
  const { error } = await supabase.from('messages').insert(msg);
  if (error) console.error("Erro ao enviar:", error);
}

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div style={S.label}>Tempo real</div>
        <h2 style={{ ...S.title, fontSize: "28px", fontStyle: "italic", margin: "8px 0 0", fontWeight: 400 }}>Sala de leitura</h2>
      </div>
      <div style={{ display: "flex", height: "520px", border: "1px solid #2a2218", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: "180px", background: "#0d0a07", borderRight: "1px solid #2a2218", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 14px 10px", ...S.label }}>Canais</div>
          {rooms.map(r => (
            <button key={r.id} onClick={() => setActiveRoom(r.id)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: activeRoom === r.id ? "#1a1610" : "none", border: "none", cursor: "pointer", textAlign: "left", borderLeft: activeRoom === r.id ? "2px solid #8a6a3a" : "2px solid transparent", transition: "all 0.15s" }}>
              <span style={{ fontSize: "12px", color: activeRoom === r.id ? "#c8b89a" : "#4a3c2e" }}>{r.label}</span>
            </button>
          ))}
          <div style={{ padding: "16px 14px 10px", marginTop: "8px", ...S.label, borderTop: "1px solid #1e1a14" }}>Online</div>
          {members.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 14px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#7ab89a", flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: "#5a4a3a" }}>{m.name}</span>
            </div>
          ))}
        </div>

        {/* Chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#13100c" }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid #2a2218", fontSize: "12px", color: "#5a4a3a" }}>
            #{activeRoom}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {msgs.map(m => (
              <div key={m.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: (m.member_color || "#8a6a3a") + "22", border: `1px solid ${m.member_color || "#8a6a3a"}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#c8b89a", flexShrink: 0 }}>
                  {m.member_name[0]}
                </div>
                <div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "baseline", marginBottom: "3px" }}>
                    <span style={{ fontSize: "12px", color: (m.member_color || "#8a6a3a") + "cc", fontWeight: "bold" }}>{m.member_name}</span>
                    <span style={{ fontSize: "10px", color: "#2a2218" }}>{new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#a89878", lineHeight: 1.5 }}>{m.text}</div>
                </div>
              </div>
            ))}
            {msgs.length === 0 && <div style={{ ...S.muted, fontStyle: "italic" }}>Nenhuma mensagem ainda. Comece a conversa!</div>}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: "12px 18px", borderTop: "1px solid #2a2218", display: "flex", gap: "10px" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
              placeholder={`Mensagem em #${activeRoom}...`}
              style={{ flex: 1, background: "#0f0c09", border: "1px solid #2a2218", color: "#c8b89a", padding: "8px 14px", fontSize: "13px", fontFamily: "Georgia, serif", outline: "none" }} />
            <button onClick={send} style={{ padding: "8px 18px", background: "#e8d5b0", color: "#1a1410", border: "none", cursor: "pointer", fontFamily: "'Playfair Display', serif", fontSize: "12px" }}>
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SEÇÕES ESTÁTICAS ─────────────────────────────────────────────────────────

function AgendaSection() {
  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={S.label}>Próximos eventos</div>
        <h2 style={{ ...S.title, fontSize: "28px", fontStyle: "italic", margin: "8px 0 0", fontWeight: 400 }}>Agenda</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {AGENDA.map((ev, i) => (
          <div key={ev.id} style={{ ...S.card, display: "flex", gap: "24px", alignItems: "center", border: i === 0 ? "1px solid #4a3a2a" : "1px solid #2a2218" }}>
            <div style={{ textAlign: "center", flexShrink: 0, minWidth: "60px" }}>
              <div style={{ ...S.title, fontSize: "22px" }}>{ev.date.split(" ")[0]}</div>
              <div style={{ fontSize: "10px", color: "#4a3c2e" }}>{ev.date.split(" ")[1]}</div>
            </div>
            <div style={{ width: "1px", height: "48px", background: "#2a2218", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", color: "#c8b89a", marginBottom: "4px" }}>{ev.title}</div>
              <div style={{ display: "flex", gap: "14px" }}>
                <span style={{ fontSize: "11px", color: "#4a3c2e" }}>⏰ {ev.time}</span>
                <span style={{ fontSize: "11px", color: ev.type === "online" ? "#7ab89a" : "#e8c87a" }}>
                  {ev.type === "online" ? "● Online" : "◆ Presencial"} · {ev.platform}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ ...S.title, fontSize: "18px" }}>{ev.confirmed}</div>
              <div style={{ fontSize: "10px", color: "#3a2e22" }}>confirmados</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Challenges() {
  const colors = ["#8a6a3a", "#6a8a5a", "#5a6a8a", "#8a5a6a", "#6a7a5a"];
  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={S.label}>Progresso coletivo</div>
        <h2 style={{ ...S.title, fontSize: "28px", fontStyle: "italic", margin: "8px 0 0", fontWeight: 400 }}>Desafios de leitura</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
        {CHALLENGES.map(ch => {
          const pct = Math.round((ch.done / ch.total) * 100);
          return (
            <div key={ch.id} style={S.card}>
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>{ch.icon}</div>
              <div style={{ fontSize: "14px", color: "#c8b89a", marginBottom: "4px" }}>{ch.title}</div>
              <div style={{ fontSize: "10px", color: "#3a2e22", marginBottom: "16px" }}>Prazo: {ch.deadline}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={S.muted}>{ch.done} de {ch.total} membros</span>
                <span style={{ fontSize: "11px", color: "#e8d5b0" }}>{pct}%</span>
              </div>
              <div style={{ height: "3px", background: "#2a2218", borderRadius: "2px" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: pct >= 75 ? "#7ab89a" : "#8a6a3a", borderRadius: "2px", transition: "width 1s ease" }} />
              </div>
              <div style={{ display: "flex", gap: "4px", marginTop: "12px", flexWrap: "wrap" }}>
                {[...Array(ch.done)].map((_, i) => (
                  <div key={i} style={{ width: "22px", height: "22px", borderRadius: "50%", background: colors[i % colors.length] + "22", border: `1px solid ${colors[i % colors.length]}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#c8b89a" }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Forum() {
  const [openThread, setOpenThread] = useState(null);
  const [showSpoiler, setShowSpoiler] = useState({});
  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={S.label}>Discussões por capítulo</div>
        <h2 style={{ ...S.title, fontSize: "28px", fontStyle: "italic", margin: "8px 0 0", fontWeight: 400 }}>Fórum · Dom Casmurro</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {FORUM_THREADS.map(t => (
          <div key={t.id}>
            <div onClick={() => setOpenThread(openThread === t.id ? null : t.id)}
              style={{ ...S.card, cursor: "pointer", border: openThread === t.id ? "1px solid #4a3a2a" : "1px solid #2a2218", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#4a3c2e", background: "#1a1610", padding: "2px 8px", border: "1px solid #2a2218" }}>{t.chapter}</span>
                    {t.spoiler && <span style={{ fontSize: "9px", textTransform: "uppercase", color: "#8a5a3a", background: "#1a1008", padding: "2px 8px", border: "1px solid #3a2218" }}>⚠ spoiler</span>}
                  </div>
                  {t.spoiler && !showSpoiler[t.id]
                    ? <div style={{ fontSize: "13px", color: "#3a2e22", fontStyle: "italic" }}>Conteúdo oculto · <span onClick={e => { e.stopPropagation(); setShowSpoiler(s => ({ ...s, [t.id]: true })); }} style={{ color: "#8a6a3a", cursor: "pointer", textDecoration: "underline" }}>revelar</span></div>
                    : <div style={{ fontSize: "13px", color: "#c8b89a" }}>{t.title}</div>
                  }
                </div>
                <div style={{ textAlign: "right", marginLeft: "16px" }}>
                  <div style={{ ...S.title, fontSize: "18px" }}>{t.replies}</div>
                  <div style={{ fontSize: "9px", color: "#3a2e22" }}>respostas</div>
                </div>
              </div>
              <div style={{ fontSize: "10px", color: "#3a2e22", marginTop: "8px" }}>Última: {t.last}</div>
            </div>
            {openThread === t.id && (
              <div style={{ background: "#0d0a07", border: "1px solid #2a2218", borderTop: "none", padding: "20px 28px" }}>
                <div style={{ fontSize: "12px", color: "#5a4a3a", fontStyle: "italic" }}>[{t.replies} mensagens nesta thread]</div>
                <button style={{ marginTop: "10px", padding: "6px 16px", background: "transparent", border: "1px solid #3a3228", color: "#8a7a68", cursor: "pointer", fontSize: "11px" }}>Participar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportShelf() {
  const [books, setBooks] = useState([]);
  const [format, setFormat] = useState("text");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('books').select('*').order('created_at');
      if (data) setBooks(data);
      setLoading(false);
    }
    fetch();
  }, []);

  const outputs = {
    text: books.map((b, i) => `${i + 1}. ${b.title} — ${b.author} (${b.year}) ★ ${b.rating}`).join("\n"),
    markdown: "| Título | Autor | Ano | Nota |\n|---|---|---|---|\n" + books.map(b => `| ${b.title} | ${b.author} | ${b.year} | ★ ${b.rating} |`).join("\n"),
    csv: "Título,Autor,Ano,Gênero,Nota\n" + books.map(b => `"${b.title}","${b.author}",${b.year},"${b.genre}",${b.rating}`).join("\n"),
  };

  const copy = () => {
    navigator.clipboard.writeText(outputs[format]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div style={S.label}>Compartilhar leituras</div>
        <h2 style={{ ...S.title, fontSize: "28px", fontStyle: "italic", margin: "8px 0 0", fontWeight: 400 }}>Exportar estante</h2>
      </div>
      <div style={S.card}>
        <Label>Formato</Label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {["text", "markdown", "csv"].map(f => (
            <button key={f} onClick={() => setFormat(f)} style={{ padding: "6px 16px", border: "1px solid", cursor: "pointer", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s", background: format === f ? "#e8d5b0" : "transparent", borderColor: format === f ? "#e8d5b0" : "#3a3228", color: format === f ? "#1a1410" : "#8a7a68" }}>
              {f}
            </button>
          ))}
        </div>
        {loading ? <Loading /> : (
          <>
            <pre style={{ background: "#0d0a07", border: "1px solid #2a2218", padding: "20px", fontSize: "12px", color: "#8a7a68", fontFamily: "monospace", overflowX: "auto", lineHeight: 1.8, margin: 0 }}>
              {outputs[format] || "Nenhum livro cadastrado ainda."}
            </pre>
            <button onClick={copy} style={{ marginTop: "14px", padding: "10px 24px", background: copied ? "#3a4a3a" : "#e8d5b0", color: copied ? "#7ab89a" : "#1a1410", border: "none", cursor: "pointer", fontFamily: "'Playfair Display', serif", fontSize: "13px", transition: "all 0.3s" }}>
              {copied ? "✓ Copiado!" : "Copiar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── NAV + ROOT ───────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "vote", label: "Votação", icon: "◐" },
  { id: "timeline", label: "Linha do tempo", icon: "◫" },
  { id: "quotes", label: "Citações", icon: "❝" },
  { id: "agenda", label: "Agenda", icon: "◻" },
  { id: "challenges", label: "Desafios", icon: "◆" },
  { id: "forum", label: "Fórum", icon: "◑" },
  { id: "export", label: "Exportar", icon: "↗" },
  { id: "chat", label: "Sala ao vivo", icon: "●", live: true },
];

export default function App() {
  const [section, setSection] = useState("dashboard");
  const [sidebarAberta, setSidebarAberta] = useState(false);

  const renderSection = () => {
    switch (section) {
      case "dashboard": return <Dashboard />;
      case "vote": return <VotingSection />;
      case "timeline": return <Timeline />;
      case "quotes": return <Quotes />;
      case "agenda": return <AgendaSection />;
      case "challenges": return <Challenges />;
      case "forum": return <Forum />;
      case "export": return <ExportShelf />;
      case "chat": return <LiveChat />;
      default: return <Dashboard />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0c09", color: "#c8b89a", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div style={{ position: "fixed", inset: 0, opacity: 0.035, zIndex: 0, pointerEvents: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "128px" }} />

      {/* BOTÃO ☰ fixo — sempre visível */}
      <button
        onClick={() => setSidebarAberta(a => !a)}
        style={{
          position: "fixed", top: "24px", left: "20px", zIndex: 20,
          background: "none", border: "none", cursor: "pointer",
          color: "#e8d5b0", fontSize: "20px", lineHeight: 1,
          padding: "6px 8px",
          transition: "opacity 0.2s",
        }}>
        ☰
      </button>

      {/* OVERLAY — fundo escuro ao abrir */}
      {sidebarAberta && (
        <div
          onClick={() => setSidebarAberta(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 11, transition: "opacity 0.3s",
          }}
        />
      )}

      {/* SIDEBAR */}
      <aside style={{
        position: "fixed", left: 0, top: 0, width: "260px", height: "100vh",
        background: "#0d0a07", borderRight: "1px solid #1e1a14",
        display: "flex", flexDirection: "column", zIndex: 12,
        transform: sidebarAberta ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
      }}>
        <div style={{ padding: "32px 28px 24px", borderBottom: "1px solid #1e1a14", paddingLeft: "52px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#3a2e22", marginBottom: "5px" }}>clube do livro</div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", color: "#e8d5b0", fontStyle: "italic", lineHeight: 1.2 }}>Página<br />Virada</div>
        </div>
        <nav style={{ padding: "16px 0", flex: 1, overflowY: "auto" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => { setSection(item.id); setSidebarAberta(false); }}
              style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 28px", background: "none", border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.2s", color: section === item.id ? "#e8d5b0" : "#4a3c2e", borderLeft: section === item.id ? "2px solid #e8d5b0" : "2px solid transparent" }}>
              <span style={{ fontSize: "13px", position: "relative" }}>
                {item.icon}
                {item.live && <span style={{ position: "absolute", top: "-2px", right: "-6px", width: "5px", height: "5px", borderRadius: "50%", background: "#7ab89a" }} />}
              </span>
              <span style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: "20px 28px", borderTop: "1px solid #1e1a14" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#3a2e22", marginBottom: "16px" }}>Pomodoro</div>
          <Pomodoro />
        </div>
      </aside>

      {/* MAIN — ocupa a tela toda agora */}
      <main style={{ padding: "44px 44px 60px 72px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
          <div style={{ paddingLeft: "16px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#3a2e22", marginBottom: "6px" }}>Abril 2026 · Semana 3</div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "32px", color: "#e8d5b0", fontWeight: 400, margin: 0 }}>Bom dia, Mariana.</h1>
            <p style={{ color: "#4a3a2e", fontSize: "12px", marginTop: "4px", fontStyle: "italic" }}>Você está no ritmo. Continue assim.</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#3a2e22" }}>Próximo encontro</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#e8d5b0", marginTop: "3px" }}>28 abr · 19h</div>
          </div>
        </div>
        {renderSection()}
        <div style={{ marginTop: "48px", paddingTop: "20px", borderTop: "1px solid #1a1610", display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: "10px", color: "#2a2218", fontStyle: "italic" }}>"Uma sala sem livros é como um corpo sem alma." — Cícero</div>
          <div style={{ fontSize: "10px", color: "#2a2218" }}>Página Virada · 2026</div>
        </div>
      </main>
    </div>
  );
}
