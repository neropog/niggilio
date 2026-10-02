/* ==========================================================
   data.js — todo o "conteúdo" do falso YouTube fica aqui.
   Para adicionar um vídeo, copie uma linha de VIDEOS e mude os textos.
   TODAS as imagens usam a mesma foto: IMG.
   ========================================================== */
window.MG = (function () {
  const IMG = "morgilio.png";

  const CHANNELS = [
    { id: "morgilio", name: "Canal Morgilio", handle: "@morgilio", subs: "1,2 mi de inscritos", about: "Bem-vindo ao canal oficial do Morgilio. Aqui todo vídeo tem a mesma cara. Deixa o like e ativa o sininho!" },
    { id: "games",    name: "Morgilio Games",    handle: "@morgiliogames",   subs: "840 mil inscritos", about: "Zerando jogos com a mesma expressão de sempre." },
    { id: "cozinha",  name: "Cozinha do Morgilio", handle: "@morgiliococina", subs: "512 mil inscritos", about: "Receitas que quase dão certo." },
    { id: "musica",   name: "Morgilio Music",    handle: "@morgiliomusic",   subs: "2,3 mi de inscritos", about: "Clipes, playlists e músicas de chuveiro." },
    { id: "vlog",     name: "Morgilio Vlogs",    handle: "@morgiliovlogs",   subs: "230 mil inscritos", about: "O dia a dia do Morgilio, sem filtro." }
  ];

  const CATEGORIES = ["Música", "Jogos", "Ao vivo", "Mixes", "Comédia", "Culinária"];

  // views = número de visualizações | duration = "mm:ss" ou "h:mm:ss"
  const VIDEOS = [
    { id: "v1",  title: "olá morgilio", ch: "morgilio", views: 1284000, age: "há 3 meses", duration: "3:21", cat: "Comédia", desc: "O vídeo que começou tudo. Olá, Morgilio!" },
    { id: "v2",  title: "Morgilio prova um doce verde pela primeira vez", ch: "cozinha", views: 2450000, age: "há 1 semana", duration: "8:47", cat: "Culinária", desc: "Será que é bom? A reação do Morgilio diz tudo." },
    { id: "v3",  title: "AO VIVO: Morgilio respondendo vocês", ch: "morgilio", views: 52000, age: "Transmitido há 2 dias", duration: "2:14:09", cat: "Ao vivo", desc: "Live com perguntas, respostas e muitas caretas." },
    { id: "v4",  title: "Top 10 melhores caretas do Morgilio", ch: "morgilio", views: 3100000, age: "há 6 meses", duration: "10:02", cat: "Comédia", desc: "A número 7 vai te surpreender." },
    { id: "v5",  title: "Morgilio zera o jogo sem piscar", ch: "games", views: 870000, age: "há 4 dias", duration: "42:30", cat: "Jogos", desc: "Desafio impossível aceito." },
    { id: "v6",  title: "Morgilio Mix – músicas para estudar", ch: "musica", views: 640000, age: "há 1 mês", duration: "1:03:44", cat: "Mixes", desc: "Playlist de foco total. Não garante nota." },
    { id: "v7",  title: "Morgilio canta no chuveiro (versão estendida)", ch: "musica", views: 1900000, age: "há 8 meses", duration: "5:12", cat: "Música", desc: "A acústica do banheiro faz milagres." },
    { id: "v8",  title: "Receita de bolo do Morgilio (quase deu certo)", ch: "cozinha", views: 410000, age: "há 2 semanas", duration: "12:18", cat: "Culinária", desc: "Ingredientes: fé e farinha." },
    { id: "v9",  title: "Vlog: um dia na vida do Morgilio", ch: "vlog", views: 295000, age: "há 5 dias", duration: "15:40", cat: "Comédia", desc: "Acordei, fiz careta, dormi." },
    { id: "v10", title: "Morgilio tenta não rir por 10 minutos", ch: "morgilio", views: 5200000, age: "há 1 ano", duration: "10:11", cat: "Comédia", desc: "Spoiler: ele não conseguiu." },
    { id: "v11", title: "Morgilio joga pela primeira vez (olha no que deu)", ch: "games", views: 760000, age: "há 3 semanas", duration: "27:55", cat: "Jogos", desc: "Primeira vez, primeiro erro." },
    { id: "v12", title: "Playlist Morgilio: só sucesso", ch: "musica", views: 1100000, age: "há 2 anos", duration: "58:20", cat: "Mixes", desc: "Todos os hits, todos com a mesma capa." },
    { id: "v13", title: "Morgilio reage a vídeos antigos", ch: "vlog", views: 330000, age: "há 9 dias", duration: "18:03", cat: "Comédia", desc: "Dá vergonha, mas a gente mostra." },
    { id: "v14", title: "AO VIVO: maratona de jogos com o Morgilio", ch: "games", views: 98000, age: "Transmitido há 1 semana", duration: "4:31:12", cat: "Ao vivo", desc: "Quatro horas e meia de pura resenha." },
    { id: "v15", title: "Morgilio cozinha macarrão sem ligar o fogão", ch: "cozinha", views: 1450000, age: "há 5 meses", duration: "7:36", cat: "Culinária", desc: "Funciona? Assista até o final." },
    { id: "v16", title: "Morgilio – Clipe oficial (Olá Edition)", ch: "musica", views: 8900000, age: "há 1 ano", duration: "3:48", cat: "Música", desc: "O clipe mais assistido do canal." },
    { id: "v17", title: "Eu não acredito que o Morgilio fez isso", ch: "morgilio", views: 2750000, age: "há 11 meses", duration: "9:27", cat: "Comédia", desc: "Nem ele acredita." },
    { id: "v18", title: "Morgilio vs. desafio do limão", ch: "vlog", views: 620000, age: "há 2 meses", duration: "6:09", cat: "Comédia", desc: "Azedo, mas ele aguentou." },
    { id: "v19", title: "Mix de risadas do Morgilio", ch: "vlog", views: 480000, age: "há 4 meses", duration: "34:50", cat: "Mixes", desc: "Contagiante. Use fones." },
    { id: "v20", title: "AO VIVO: Q&A – pergunte qualquer coisa", ch: "morgilio", views: 74000, age: "Transmitido há 3 semanas", duration: "1:48:02", cat: "Ao vivo", desc: "Perguntas dos inscritos, respostas do Morgilio." }
  ];

  const SHORTS = [
    { title: "Olá Morgilio #shorts", likes: "128 mil", comments: "2,1 mil" },
    { title: "A cara quando o Wi-Fi cai", likes: "340 mil", comments: "5,8 mil" },
    { title: "Morgilio experimenta o doce verde", likes: "91 mil", comments: "1,3 mil" },
    { title: "Quando alguém diz \"já vou\"", likes: "512 mil", comments: "9 mil" },
    { title: "Morgilio faz careta em câmera lenta", likes: "77 mil", comments: "980" },
    { title: "Tutorial: como ser o Morgilio", likes: "205 mil", comments: "3,4 mil" },
    { title: "Bom dia do Morgilio", likes: "43 mil", comments: "610" },
    { title: "Morgilio e os óculos (parte 2)", likes: "160 mil", comments: "2,7 mil" }
  ];

  const COMMENTS = [
    { name: "@dona_maria", text: "Esse é o melhor canal do YouTube, sem dúvida nenhuma.", likes: 482, ago: "há 2 dias" },
    { name: "@joaozinho_gameplays", text: "Já assisti 14 vezes e ainda rio da cara dele.", likes: 213, ago: "há 5 dias" },
    { name: "@anônimo123", text: "Por que todos os vídeos têm a mesma miniatura? kkkkk", likes: 97, ago: "há 1 semana" },
    { name: "@prof_carlos", text: "Quem está assistindo em 2026 deixa o like!", likes: 76, ago: "há 3 semanas" },
    { name: "@vovó_zuleide", text: "Meu neto me mostrou esse canal, agora sou inscrita.", likes: 301, ago: "há 1 mês" },
    { name: "@pedro_h", text: "O algoritmo me trouxe aqui e não me arrependo.", likes: 58, ago: "há 2 meses" }
  ];

  return { IMG, CHANNELS, CATEGORIES, VIDEOS, SHORTS, COMMENTS };
})();
