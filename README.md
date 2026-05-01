# 📚 Página Virada — Clube do Livro

Aplicativo completo de clube do livro com banco de dados real (Supabase).

## O que tem aqui

- Dashboard com membros e livros (dados do banco)
- Votação do livro do mês (votos salvos no banco)
- Linha do tempo de leituras
- Citações salvas por membros (tempo real)
- Agenda de encontros
- Desafios de leitura
- Fórum por capítulo com sistema anti-spoiler
- Exportar estante em vários formatos
- Sala de chat ao vivo (tempo real via Supabase Realtime)
- Pomodoro de leitura

---

## Como rodar localmente

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar o projeto
```bash
npm start
```

Vai abrir em `http://localhost:3000`

---

## Como subir no GitHub

### Primeira vez (criar repositório)

```bash
# Dentro da pasta pagina-virada:
git init
git add .
git commit -m "primeiro commit"

# Cria um repositório no github.com com o nome pagina-virada
# Depois cola os dois comandos que o GitHub te mostrar, parecidos com:
git remote add origin https://github.com/SEU_USUARIO/pagina-virada.git
git push -u origin main
```

### Atualizar depois de fazer alterações

```bash
git add .
git commit -m "descreva o que mudou"
git push
```

---

## Estrutura dos arquivos

```
pagina-virada/
├── public/
│   └── index.html        ← página HTML base
├── src/
│   ├── supabase.js       ← conexão com o banco
│   ├── App.jsx           ← todo o aplicativo
│   └── index.js          ← ponto de entrada
├── package.json          ← dependências
└── .gitignore            ← arquivos ignorados pelo Git
```

---

## Banco de dados (Supabase)

As tabelas criadas são:

| Tabela | O que guarda |
|---|---|
| `members` | Membros do clube |
| `books` | Livros lidos |
| `quotes` | Citações salvas |
| `messages` | Mensagens do chat |
| `votes` | Votos da votação |

Para popular o banco com os dados iniciais, rode o SQL abaixo no SQL Editor do Supabase:

```sql
-- Membros
insert into members (name, pages, books_read, badge, color, online) values
('Mariana', 312, 2, '🔥', '#8a6a3a', true),
('Carlos', 278, 2, '⚡', '#6a8a5a', true),
('Beatriz', 244, 1, '📚', '#5a6a8a', false),
('Felipe', 198, 1, '✨', '#8a5a6a', false),
('Lara', 156, 1, '🌿', '#6a7a5a', true);

-- Livros
insert into books (title, author, cover_url, rating, pages, genre, year, month_read) values
('Cem Anos de Solidão', 'Gabriel García Márquez', 'https://m.media-amazon.com/images/I/81t2CVWEsUL._AC_UF1000,1000_QL80_.jpg', 9.4, 448, 'Realismo Mágico', 1967, 'Jan 2026'),
('A Metamorfose', 'Franz Kafka', 'https://m.media-amazon.com/images/I/71GaLk9zHFL._AC_UF1000,1000_QL80_.jpg', 8.8, 128, 'Ficção', 1915, 'Fev 2026'),
('Dom Casmurro', 'Machado de Assis', 'https://m.media-amazon.com/images/I/71J1gDPn6rL._AC_UF1000,1000_QL80_.jpg', 9.1, 256, 'Realismo', 1899, 'Mar 2026'),
('O Apanhador no Campo de Centeio', 'J.D. Salinger', 'https://m.media-amazon.com/images/I/8125BDk3l9L._AC_UF1000,1000_QL80_.jpg', 8.6, 277, 'Bildungsroman', 1951, 'Abr 2026');
```
