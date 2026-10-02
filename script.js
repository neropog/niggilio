/* ==========================================================
   script.js — navegação (rotas por #), páginas e interações.
   Páginas: #/ (início) · #/shorts · #/subscriptions · #/history
            #/watchlater · #/liked · #/watch/ID · #/results/TEXTO
            #/channel/ID · #/trending · #/explore/CATEGORIA
   ========================================================== */
(function () {
    'use strict';

    const { IMG, CHANNELS, CATEGORIES, VIDEOS, SHORTS, COMMENTS } = window.MG;

    /* ---------- utilidades ---------- */
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const body = document.body;
    const app = $('#app');

    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const norm = (t) => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const store = {
        get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v === null || v === undefined ? d : v; } catch (e) { return d; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } }
    };

    const state = {
        mini: store.get('mg_mini', false),
        theme: store.get('mg_theme', 'dark'),
        history: store.get('mg_history', []),
        later: store.get('mg_later', []),
        liked: store.get('mg_liked', []),
        disliked: store.get('mg_disliked', []),
        subs: store.get('mg_subs', ['morgilio']),
        custom: store.get('mg_custom', []),
        searches: store.get('mg_searches', []),
        homeCat: 'Tudo'
    };
    const save = (k) => store.set('mg_' + k, state[k]);

    const allVideos = () => [...state.custom, ...VIDEOS];
    const byId = (id) => allVideos().find((v) => v.id === id);
    const chan = (id) => CHANNELS.find((c) => c.id === id) || CHANNELS[0];

    function fmtViews(n) {
        if (n === 1) return '1 visualização';
        if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',').replace(',0', '') + ' mi de visualizações';
        if (n >= 1e3) return Math.round(n / 1e3) + ' mil visualizações';
        return n + ' visualizações';
    }
    function fmtCount(n) {
        if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',').replace(',0', '') + ' mi';
        if (n >= 1e3) return (n / 1e3).toFixed(1).replace('.', ',').replace(',0', '') + ' mil';
        return String(n);
    }
    const parseDur = (d) => d.split(':').map(Number).reduce((a, b) => a * 60 + b, 0);
    function fmtTime(s) {
        s = Math.floor(s);
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
        const ss = String(sec).padStart(2, '0');
        return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
    }

    function toast(msg) {
        const t = document.createElement('div');
        t.className = 'toast';
        t.textContent = msg;
        $('#toasts').appendChild(t);
        requestAnimationFrame(() => t.classList.add('show'));
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2800);
    }

    function copyLink(id) {
        const url = location.origin + location.pathname + '#/watch/' + id;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => toast('Link copiado para a área de transferência'), () => toast('Link: ' + url));
        } else {
            toast('Link: ' + url);
        }
    }

    function toggleIn(list, id) {
        const i = list.indexOf(id);
        if (i >= 0) { list.splice(i, 1); return false; }
        list.unshift(id);
        return true;
    }

    /* ---------- templates ---------- */
    const avatar = (cls = '') => `<img class="avatar ${cls}" src="${IMG}" alt="" loading="lazy">`;
    const meta = (v) => `${fmtViews(v.views)} • ${v.age}`;
    const thumb = (v) => `<div class="thumb-wrap"><img class="thumbnail" src="${IMG}" alt="Miniatura: ${esc(v.title)}" loading="lazy"><span class="duration">${v.duration}</span><span class="preview-bar"></span></div>`;
    const kebab = (id) => `<button class="kebab" data-kebab="${id}" aria-label="Mais ações"><i class="fas fa-ellipsis-vertical"></i></button>`;

    function card(v) {
        const c = chan(v.ch);
        return `<article class="video-card" data-id="${v.id}" tabindex="0">
            ${thumb(v)}
            <div class="video-info">
                <a href="#/channel/${c.id}" class="avatar-link" aria-label="${esc(c.name)}">${avatar()}</a>
                <div class="video-text">
                    <h3 class="video-title">${esc(v.title)}</h3>
                    <a class="channel-name" href="#/channel/${c.id}">${esc(c.name)}</a>
                    <p class="meta">${meta(v)}</p>
                </div>
                ${kebab(v.id)}
            </div>
        </article>`;
    }
    function hcard(v, rank) {
        const c = chan(v.ch);
        return `<article class="video-card hcard" data-id="${v.id}" tabindex="0">
            ${rank ? `<span class="rank">${rank}</span>` : ''}
            ${thumb(v)}
            <div class="hc-body">
                <h3 class="video-title">${esc(v.title)}</h3>
                <p class="meta">${meta(v)}</p>
                <a class="hc-channel channel-name" href="#/channel/${c.id}">${avatar()}<span>${esc(c.name)}</span></a>
                <p class="hc-desc">${esc(v.desc || '')}</p>
                ${kebab(v.id)}
            </div>
        </article>`;
    }
    function ccard(v) {
        const c = chan(v.ch);
        return `<article class="video-card ccard" data-id="${v.id}" tabindex="0">
            ${thumb(v)}
            <div class="cc-body">
                <h3 class="video-title">${esc(v.title)}</h3>
                <a class="channel-name" href="#/channel/${c.id}">${esc(c.name)}</a>
                <p class="meta">${meta(v)}</p>
                ${kebab(v.id)}
            </div>
        </article>`;
    }
    const skeleton = (n = 12) => `<div class="video-grid">${Array.from({ length: n }, () => `
        <div class="sk-card"><div class="sk sk-thumb"></div><div class="sk-row"><div class="sk sk-av"></div>
        <div class="sk-lines"><div class="sk sk-line"></div><div class="sk sk-line short"></div></div></div></div>`).join('')}</div>`;
    const empty = (icon, title, text, btn = '') => `<div class="empty"><i class="${icon}"></i><h2>${title}</h2><p>${text}</p>${btn}</div>`;
    const homeBtn = '<a class="pill primary" href="#/">Ir para o início</a>';

    /* ---------- layout (menu lateral) ---------- */
    let route = { name: 'home', arg: '' };
    const drawerMode = () => window.innerWidth <= 1000 || route.name === 'watch';

    function applyLayout() {
        const d = drawerMode();
        body.classList.toggle('drawer-mode', d);
        body.classList.toggle('mini', !d && state.mini);
        if (!d) body.classList.remove('drawer-open');
    }
    $('#menuBtn').addEventListener('click', () => {
        if (drawerMode()) body.classList.toggle('drawer-open');
        else { state.mini = !state.mini; save('mini'); applyLayout(); }
    });
    $('#drawerClose').addEventListener('click', () => body.classList.remove('drawer-open'));
    $('#backdrop').addEventListener('click', () => body.classList.remove('drawer-open'));
    $('#sidebar').addEventListener('click', (e) => { if (e.target.closest('a')) body.classList.remove('drawer-open'); });
    window.addEventListener('resize', applyLayout);

    function setActiveNav() {
        let key = route.name;
        if (route.name === 'home') key = '';
        else if (route.name === 'explore') key = 'explore/' + route.arg;
        else if (route.name === 'channel') key = 'channel/' + route.arg;
        $$('.nav-item').forEach((a) => a.classList.toggle('active', a.dataset.key === key));
    }

    /* ---------- tema ---------- */
    function applyTheme() {
        document.documentElement.dataset.theme = state.theme;
        $('#themeLabel').textContent = 'Aparência: tema ' + (state.theme === 'dark' ? 'escuro' : 'claro');
        $('#themeIcon').className = 'fas ' + (state.theme === 'dark' ? 'fa-moon' : 'fa-sun');
    }

    /* ---------- notificações ---------- */
    function renderNotifs() {
        $('#notifList').innerHTML = allVideos().slice(0, 5).map((v) => `
            <a class="notif" href="#/watch/${v.id}">
                ${avatar()}
                <div><b>${esc(chan(v.ch).name)}</b> postou: ${esc(v.title)}<small>${v.age}</small></div>
                <img class="notif-thumb" src="${IMG}" alt="">
            </a>`).join('');
    }

    /* ---------- menus suspensos e ações globais ---------- */
    let popupEl = null;
    const closePopup = () => { if (popupEl) { popupEl.remove(); popupEl = null; } };

    function openPopup(btn, id) {
        closePopup();
        const r = btn.getBoundingClientRect();
        const later = state.later.includes(id);
        const el = document.createElement('div');
        el.className = 'popup';
        el.innerHTML = `
            <button data-pa="later"><i class="fas fa-clock"></i>${later ? 'Remover de Assistir mais tarde' : 'Salvar em Assistir mais tarde'}</button>
            <button data-pa="share"><i class="fas fa-share"></i>Compartilhar</button>
            <button data-pa="hide"><i class="fas fa-ban"></i>Não tenho interesse</button>`;
        document.body.appendChild(el);
        const w = 260, h = el.offsetHeight;
        el.style.left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8)) + 'px';
        el.style.top = (r.bottom + h + 8 > window.innerHeight ? r.top - h - 4 : r.bottom + 4) + 'px';
        popupEl = el;
        el.addEventListener('click', (ev) => {
            const b = ev.target.closest('button');
            if (!b) return;
            ev.stopPropagation();
            const a = b.dataset.pa;
            if (a === 'later') {
                const on = toggleIn(state.later, id);
                save('later');
                toast(on ? 'Salvo em Assistir mais tarde' : 'Removido de Assistir mais tarde');
                if (route.name === 'watchlater' && !on) router();
            } else if (a === 'share') {
                copyLink(id);
            } else if (a === 'hide') {
                const c = btn.closest('.video-card');
                if (c) { c.classList.add('removing'); setTimeout(() => c.remove(), 300); }
                toast('Ok, vamos mostrar menos vídeos assim');
            }
            closePopup();
        });
    }

    function closeMenus() { $$('.menu.open').forEach((m) => m.classList.remove('open')); }

    const actions = {
        theme() { state.theme = state.theme === 'dark' ? 'light' : 'dark'; save('theme'); applyTheme(); },
        upload() { openUpload(); },
        live() { toast('Transmissões ao vivo chegam em breve'); },
        reset() {
            if (confirm('Apagar histórico, curtidas, inscrições e vídeos enviados deste navegador?')) {
                Object.keys(localStorage).filter((k) => k.indexOf('mg_') === 0).forEach((k) => localStorage.removeItem(k));
                location.reload();
            }
        }
    };

    document.addEventListener('click', (e) => {
        // popup de três pontinhos
        if (popupEl && !e.target.closest('.popup')) closePopup();
        const kb = e.target.closest('[data-kebab]');
        if (kb) { e.preventDefault(); e.stopPropagation(); openPopup(kb, kb.dataset.kebab); return; }

        // menus do cabeçalho
        const mb = e.target.closest('[data-menu]');
        $$('.menu.open').forEach((m) => { if (!mb || m.id !== mb.dataset.menu) m.classList.remove('open'); });
        if (mb) { $('#' + mb.dataset.menu).classList.toggle('open'); return; }
        const act = e.target.closest('.menu [data-action]');
        if (act) { actions[act.dataset.action](); closeMenus(); return; }
        if (e.target.closest('.menu a')) closeMenus();

        // fechar sugestões de busca
        if (!e.target.closest('.search-wrap')) $('#suggest').classList.remove('open');

        // chips de categoria na página inicial
        const chip = e.target.closest('.chip[data-cat]');
        if (chip && route.name === 'home') {
            state.homeCat = chip.dataset.cat;
            $$('#chips .chip').forEach((c) => c.classList.toggle('active', c === chip));
            fillFeed(false);
            return;
        }

        // clicar no card abre o vídeo
        const c = e.target.closest('.video-card');
        if (c && !e.target.closest('a, button')) location.hash = '#/watch/' + c.dataset.id;
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('video-card')) {
            location.hash = '#/watch/' + e.target.dataset.id;
        }
        if (e.key === 'Escape') {
            closeMenus(); closePopup(); closeVoice(); closeModal();
            $('#suggest').classList.remove('open');
            body.classList.remove('drawer-open');
        }
    });
    window.addEventListener('scroll', closePopup, { passive: true });

    /* ---------- busca ---------- */
    const input = $('#searchInput');
    const sug = $('#suggest');

    function renderSuggest() {
        const raw = input.value.trim();
        const q = norm(raw);
        let items;
        if (!q) {
            items = state.searches.slice(0, 6).map((t) => ({ t, h: true }));
        } else {
            const pool = Array.from(new Set([...allVideos().map((v) => v.title), 'olá morgilio', 'morgilio ao vivo', 'morgilio melhores momentos']));
            items = pool.filter((t) => norm(t).indexOf(q) >= 0).slice(0, 8).map((t) => ({ t, h: false }));
            if (!items.length) items = [{ t: raw, h: false }];
        }
        sug.innerHTML = items.map((i) => `<li data-q="${esc(i.t)}"><i class="fas ${i.h ? 'fa-clock-rotate-left' : 'fa-magnifying-glass'}"></i><span>${esc(i.t)}</span></li>`).join('');
        sug.classList.toggle('open', items.length > 0);
    }
    function doSearch() {
        const q = input.value.trim();
        if (!q) return;
        sug.classList.remove('open');
        input.blur();
        location.hash = '#/results/' + encodeURIComponent(q);
    }
    input.addEventListener('focus', renderSuggest);
    input.addEventListener('input', renderSuggest);
    sug.addEventListener('mousedown', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        e.preventDefault();
        input.value = li.dataset.q;
        doSearch();
    });
    $('#searchForm').addEventListener('submit', (e) => { e.preventDefault(); doSearch(); });

    /* ---------- busca por voz (de brincadeira) ---------- */
    const voice = $('#voice');
    let voiceTimer = null;
    function closeVoice() { clearTimeout(voiceTimer); voice.classList.remove('open'); }
    $('#micBtn').addEventListener('click', () => {
        voice.classList.add('open');
        $('#voiceText').textContent = 'Ouvindo…';
        voiceTimer = setTimeout(() => {
            $('#voiceText').textContent = '“olá morgilio”';
            voiceTimer = setTimeout(() => { closeVoice(); input.value = 'olá morgilio'; doSearch(); }, 900);
        }, 2200);
    });
    voice.addEventListener('click', closeVoice);

    /* ---------- modal de upload ---------- */
    function closeModal() { $('#modalRoot').innerHTML = ''; }
    function openUpload() {
        $('#modalRoot').innerHTML = `
            <div class="modal-back" id="modalBack">
                <div class="modal" role="dialog" aria-modal="true" aria-labelledby="upTitle">
                    <h2 id="upTitle">Enviar vídeo</h2>
                    <p class="hint">A miniatura será sempre a mesma. Esse é o charme.</p>
                    <div class="preview"><img src="${IMG}" alt=""></div>
                    <label for="upName">Título</label>
                    <input id="upName" maxlength="90" placeholder="Ex.: Morgilio descobre o que é um upload">
                    <label for="upCat">Categoria</label>
                    <select id="upCat">${CATEGORIES.map((c) => `<option>${c}</option>`).join('')}</select>
                    <div class="upload-bar" id="upBar"><span></span></div>
                    <div class="modal-actions">
                        <button class="pill" id="upCancel">Cancelar</button>
                        <button class="pill primary" id="upPublish">Publicar</button>
                    </div>
                </div>
            </div>`;
        $('#upName').focus();
        $('#upCancel').onclick = closeModal;
        $('#modalBack').addEventListener('mousedown', (e) => { if (e.target.id === 'modalBack') closeModal(); });
        $('#upPublish').onclick = () => {
            const title = $('#upName').value.trim();
            if (!title) { toast('Digite um título para o vídeo'); $('#upName').focus(); return; }
            const cat = $('#upCat').value;
            $('#upPublish').disabled = true;
            $('#upBar').style.display = 'block';
            let p = 0;
            const t = setInterval(() => {
                p += 8 + Math.random() * 12;
                $('#upBar span').style.width = Math.min(p, 100) + '%';
                if (p >= 100) {
                    clearInterval(t);
                    const dur = `${1 + Math.floor(Math.random() * 12)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
                    state.custom.unshift({ id: 'u' + Date.now(), title, ch: 'morgilio', views: 0, age: 'agora mesmo', duration: dur, cat, desc: 'Vídeo enviado por você.' });
                    save('custom');
                    closeModal();
                    renderNotifs();
                    toast('Vídeo publicado!');
                    state.homeCat = 'Tudo';
                    if (location.hash === '#/' || location.hash === '' || location.hash === '#') router();
                    else location.hash = '#/';
                }
            }, 150);
        };
    }

    /* ---------- roteador ---------- */
    let cleanup = null;
    let renderToken = 0;

    function parseHash() {
        const h = location.hash.replace(/^#\/?/, '');
        const parts = h.split('/');
        let arg = parts.slice(1).join('/');
        try { arg = decodeURIComponent(arg); } catch (e) { /* mantém */ }
        return { name: parts[0] || 'home', arg };
    }

    function router() {
        if (cleanup) { cleanup(); cleanup = null; }
        closePopup();
        renderToken++;
        route = parseHash();
        applyLayout();
        body.classList.remove('drawer-open');
        app.classList.toggle('shorts-mode', route.name === 'shorts');
        window.scrollTo(0, 0);
        const pages = {
            home: pageHome, shorts: pageShorts, subscriptions: pageSubs, history: pageHistory,
            watchlater: pageLater, liked: pageLiked, watch: pageWatch, results: pageResults,
            channel: pageChannel, trending: pageTrending, explore: pageExplore
        };
        (pages[route.name] || pageNotFound)(route.arg);
        setActiveNav();
        app.classList.remove('page-enter');
        void app.offsetWidth;
        app.classList.add('page-enter');
    }
    window.addEventListener('hashchange', router);

    /* ---------- página: início ---------- */
    function pageHome() {
        document.title = 'YouTube';
        app.innerHTML = `<div class="chips" id="chips">${['Tudo', ...CATEGORIES].map((c) =>
            `<button class="chip ${c === state.homeCat ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('')}</div><div id="feed"></div>`;
        fillFeed(true);
    }
    function fillFeed(first) {
        const feed = $('#feed');
        if (!feed) return;
        const tok = renderToken;
        feed.innerHTML = skeleton();
        setTimeout(() => {
            if (tok !== renderToken) return;
            const list = allVideos().filter((v) => state.homeCat === 'Tudo' || v.cat === state.homeCat);
            feed.innerHTML = list.length
                ? `<div class="video-grid">${list.map(card).join('')}</div>`
                : empty('fas fa-film', 'Nada por aqui ainda', 'Nenhum vídeo nesta categoria.');
        }, first ? 650 : 350);
    }

    /* ---------- páginas de listas ---------- */
    function listPage(title, list, extra = '', rankOn = false) {
        return `<div class="list-page"><div class="list-head"><h1>${title}</h1>${extra}</div>${list.map((v, i) => hcard(v, rankOn ? i + 1 : 0)).join('')}</div>`;
    }

    function pageHistory() {
        document.title = 'Histórico - YouTube';
        const list = state.history.map(byId).filter(Boolean);
        if (!list.length) { app.innerHTML = empty('fas fa-clock-rotate-left', 'Seu histórico está vazio', 'Os vídeos que você assistir aparecerão aqui.', homeBtn); return; }
        app.innerHTML = listPage('Histórico de exibição', list, '<button class="pill" id="clearHistory"><i class="fas fa-trash"></i>Limpar histórico</button>');
        $('#clearHistory').onclick = () => { state.history = []; save('history'); toast('Histórico apagado'); router(); };
    }
    function pageLater() {
        document.title = 'Assistir mais tarde - YouTube';
        const list = state.later.map(byId).filter(Boolean);
        app.innerHTML = list.length
            ? listPage('Assistir mais tarde', list)
            : empty('fas fa-clock', 'Nada para assistir depois', 'Use os três pontinhos de um vídeo e escolha "Salvar em Assistir mais tarde".', homeBtn);
    }
    function pageLiked() {
        document.title = 'Vídeos que gostei - YouTube';
        const list = state.liked.map(byId).filter(Boolean);
        app.innerHTML = list.length
            ? listPage('Vídeos que gostei', list)
            : empty('fas fa-thumbs-up', 'Nenhum vídeo curtido', 'Curta um vídeo e ele aparece aqui.', homeBtn);
    }
    function pageTrending() {
        document.title = 'Em alta - YouTube';
        const list = allVideos().slice().sort((a, b) => b.views - a.views);
        app.innerHTML = listPage('Em alta', list, '', true);
    }
    function pageExplore(cat) {
        document.title = cat + ' - YouTube';
        const list = allVideos().filter((v) => v.cat === cat);
        app.innerHTML = list.length ? listPage(esc(cat), list) : empty('fas fa-film', 'Nada por aqui ainda', 'Nenhum vídeo nesta categoria.', homeBtn);
    }

    function pageSubs() {
        document.title = 'Inscrições - YouTube';
        const subs = state.subs.map(chan).filter(Boolean);
        if (!subs.length) { app.innerHTML = empty('fas fa-circle-play', 'Você não tem inscrições', 'Inscreva-se em canais para ver os vídeos mais recentes aqui.', homeBtn); return; }
        const list = allVideos().filter((v) => state.subs.includes(v.ch));
        app.innerHTML = `<div class="subs-strip">${subs.map((c) => `<a class="sub-chip" href="#/channel/${c.id}">${avatar('xl')}<span>${esc(c.name)}</span></a>`).join('')}</div>
            <h2 class="section-title">Mais recentes</h2>
            <div class="video-grid">${list.map(card).join('')}</div>`;
    }

    function pageResults(q) {
        document.title = q + ' - YouTube';
        if (q) {
            state.searches = [q, ...state.searches.filter((s) => s !== q)].slice(0, 10);
            save('searches');
        }
        const words = norm(q).split(/\s+/).filter(Boolean);
        const list = allVideos().filter((v) => {
            const hay = norm(v.title + ' ' + (v.desc || '') + ' ' + chan(v.ch).name + ' ' + v.cat);
            return words.every((w) => hay.indexOf(w) >= 0);
        });
        app.innerHTML = list.length
            ? `<div class="list-page"><p class="list-sub">${list.length} resultado${list.length > 1 ? 's' : ''} para “${esc(q)}”</p>${list.map((v) => hcard(v)).join('')}</div>`
            : empty('fas fa-magnifying-glass', 'Nenhum resultado encontrado', `Não achamos nada para “${esc(q)}”. Tente "olá morgilio".`, homeBtn);
    }

    function pageNotFound() {
        document.title = 'Página não encontrada - YouTube';
        app.innerHTML = empty('fas fa-compass', 'Esta página não existe', 'Volte para o início e continue assistindo.', homeBtn);
    }

    /* ---------- página: canal ---------- */
    function pageChannel(id) {
        const c = chan(id);
        document.title = c.name + ' - YouTube';
        const vids = allVideos().filter((v) => v.ch === c.id);
        const subbed = state.subs.includes(c.id);
        app.innerHTML = `<div class="channel-page">
            <div class="banner"><img src="${IMG}" alt=""></div>
            <div class="channel-head">
                ${avatar('xxl')}
                <div>
                    <h1>${esc(c.name)}</h1>
                    <p>${esc(c.handle)} • ${esc(c.subs)} • ${vids.length} vídeo${vids.length === 1 ? '' : 's'}</p>
                    <p>${esc(c.about)}</p>
                    <button class="sub-btn ${subbed ? 'subscribed' : ''}" id="chSub">${subbed ? '<i class="fas fa-bell"></i>Inscrito' : 'Inscrever-se'}</button>
                </div>
            </div>
            <div class="tabs" role="tablist">
                <button class="tab active" data-tab="videos">Vídeos</button>
                <button class="tab" data-tab="shorts">Shorts</button>
                <button class="tab" data-tab="about">Sobre</button>
            </div>
            <div class="tab-panel show" data-panel="videos">${vids.length ? `<div class="video-grid">${vids.map(card).join('')}</div>` : empty('fas fa-film', 'Sem vídeos', 'Este canal ainda não publicou nada.')}</div>
            <div class="tab-panel" data-panel="shorts"><div class="shorts-grid">${SHORTS.map((s) => `
                <a class="short-thumb" href="#/shorts"><div class="st-img"><img src="${IMG}" alt="" loading="lazy"></div><b>${esc(s.title)}</b><small>${s.likes} curtidas</small></a>`).join('')}</div></div>
            <div class="tab-panel" data-panel="about"><div class="about-box"><h3>Descrição</h3><p>${esc(c.about)}</p><h3>Detalhes</h3><p>${esc(c.handle)}<br>${esc(c.subs)}<br>Todas as miniaturas: iguais.</p></div></div>
        </div>`;
        $$('.tab', app).forEach((t) => t.addEventListener('click', () => {
            $$('.tab', app).forEach((x) => x.classList.toggle('active', x === t));
            $$('.tab-panel', app).forEach((p) => p.classList.toggle('show', p.dataset.panel === t.dataset.tab));
        }));
        $('#chSub').addEventListener('click', (e) => {
            const on = toggleIn(state.subs, c.id);
            save('subs');
            const b = e.currentTarget;
            b.classList.toggle('subscribed', on);
            b.innerHTML = on ? '<i class="fas fa-bell"></i>Inscrito' : 'Inscrever-se';
            toast(on ? 'Inscrição adicionada' : 'Inscrição removida');
        });
    }

    /* ---------- página: shorts ---------- */
    function pageShorts() {
        document.title = 'Shorts - YouTube';
        app.innerHTML = `<div class="shorts-wrap" id="shorts">${SHORTS.map((s, i) => `
            <section class="short" data-i="${i}">
                <div class="short-card">
                    <img src="${IMG}" alt="">
                    <div class="short-shade"></div>
                    <div class="short-progress"><span></span></div>
                    <div class="short-info">
                        <div class="short-ch">${avatar()}<b>@morgilio</b><button class="sub-btn sm" data-sub>Inscrever-se</button></div>
                        <p>${esc(s.title)}</p>
                    </div>
                    <div class="pause-icon"><i class="fas fa-pause"></i></div>
                </div>
                <div class="short-actions">
                    <button data-s="like"><i class="fas fa-thumbs-up"></i><span>${s.likes}</span></button>
                    <button data-s="dislike"><i class="fas fa-thumbs-down"></i><span>Não gostei</span></button>
                    <button data-s="comment"><i class="fas fa-comment"></i><span>${s.comments}</span></button>
                    <button data-s="share"><i class="fas fa-share"></i><span>Compartilhar</span></button>
                </div>
            </section>`).join('')}</div>
            <div class="shorts-nav"><button id="shUp" aria-label="Anterior"><i class="fas fa-chevron-up"></i></button><button id="shDown" aria-label="Próximo"><i class="fas fa-chevron-down"></i></button></div>`;

        const wrap = $('#shorts');
        const sections = $$('.short', wrap);

        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => en.target.classList.toggle('active', en.isIntersecting));
        }, { root: wrap, threshold: 0.6 });
        sections.forEach((s) => io.observe(s));

        wrap.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-s]');
            if (btn) {
                const k = btn.dataset.s;
                if (k === 'like' || k === 'dislike') {
                    const sec = btn.closest('.short');
                    const other = $(`[data-s="${k === 'like' ? 'dislike' : 'like'}"]`, sec);
                    other.classList.remove('on');
                    btn.classList.toggle('on');
                    btn.querySelector('i').classList.remove('pop');
                    void btn.offsetWidth;
                    btn.querySelector('i').classList.add('pop');
                } else if (k === 'comment') toast('Comentários ainda não estão disponíveis nos Shorts');
                else if (k === 'share') toast('Link do Short copiado');
                return;
            }
            const sub = e.target.closest('[data-sub]');
            if (sub) {
                const on = !sub.classList.contains('subscribed');
                sub.classList.toggle('subscribed', on);
                sub.textContent = on ? 'Inscrito' : 'Inscrever-se';
                return;
            }
            const cardEl = e.target.closest('.short-card');
            if (cardEl) {
                cardEl.classList.toggle('paused');
                const ic = $('.pause-icon', cardEl);
                ic.innerHTML = `<i class="fas ${cardEl.classList.contains('paused') ? 'fa-pause' : 'fa-play'}"></i>`;
                ic.classList.remove('show'); void ic.offsetWidth; ic.classList.add('show');
            }
        });

        const step = (dir) => wrap.scrollBy({ top: dir * wrap.clientHeight, behavior: 'smooth' });
        $('#shUp').onclick = () => step(-1);
        $('#shDown').onclick = () => step(1);
        const onKey = (e) => {
            if (e.target.matches('input, textarea')) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); step(1); }
            if (e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
        };
        document.addEventListener('keydown', onKey);
        cleanup = () => { io.disconnect(); document.removeEventListener('keydown', onKey); };
    }

    /* ---------- página: vídeo ---------- */
    function pageWatch(id) {
        const v = byId(id);
        if (!v) { pageNotFound(); return; }
        document.title = v.title + ' - YouTube';

        state.history = [id, ...state.history.filter((x) => x !== id)].slice(0, 100);
        save('history');

        const c = chan(v.ch);
        const baseLikes = Math.round(v.views * 0.045);
        const subbed = state.subs.includes(c.id);
        const isLiked = state.liked.includes(id);
        const isDisliked = state.disliked.includes(id);
        const isLater = state.later.includes(id);
        const comments = COMMENTS.slice();

        const relatedList = (mode) => {
            let list = allVideos().filter((x) => x.id !== id);
            if (mode === 'channel') list = list.filter((x) => x.ch === v.ch);
            if (mode === 'related') list = list.filter((x) => x.cat === v.cat);
            return list.length ? list.map(ccard).join('') : '<p class="meta">Nenhum vídeo por aqui.</p>';
        };
        const commentHTML = (m, isNew) => `
            <div class="comment ${isNew ? 'new' : ''}">${avatar()}<div>
                <b>${esc(m.name)}</b><small>${m.ago}</small>
                <div>${esc(m.text)}</div>
                <div class="comment-actions"><button data-cl><i class="fas fa-thumbs-up"></i><span>${m.likes}</span></button><button><i class="fas fa-thumbs-down"></i></button></div>
            </div></div>`;

        app.innerHTML = `<div class="watch">
            <div class="primary">
                <div class="player paused" id="player" tabindex="0" aria-label="Player de vídeo">
                    <img class="bg" src="${IMG}" alt=""><img class="fg" src="${IMG}" alt="${esc(v.title)}">
                    <div class="flash" id="flash"><i class="fas fa-play"></i></div>
                    <button class="big-replay" id="replay" aria-label="Assistir novamente"><i class="fas fa-rotate-right"></i></button>
                    <div class="controls">
                        <div class="progress" id="progress"><div class="progress-fill" id="pfill"></div></div>
                        <div class="ctrl-row">
                            <button id="pPlay" aria-label="Reproduzir"><i class="fas fa-play"></i></button>
                            <button id="pMute" aria-label="Som"><i class="fas fa-volume-high"></i></button>
                            <span class="time" id="ptime">0:00 / ${v.duration}</span>
                            <span class="spacer"></span>
                            <button class="speed" id="pSpeed" aria-label="Velocidade">1x</button>
                            <button id="pFull" aria-label="Tela cheia"><i class="fas fa-expand"></i></button>
                        </div>
                    </div>
                </div>

                <h1 class="watch-title">${esc(v.title)}</h1>
                <div class="watch-row">
                    <div class="watch-channel">
                        <a href="#/channel/${c.id}">${avatar()}</a>
                        <div><a href="#/channel/${c.id}"><b>${esc(c.name)}</b></a><small>${esc(c.subs)}</small></div>
                        <button class="sub-btn ${subbed ? 'subscribed' : ''}" id="wSub">${subbed ? '<i class="fas fa-bell"></i>Inscrito' : 'Inscrever-se'}</button>
                    </div>
                    <div class="watch-actions">
                        <div class="pill-group">
                            <button class="pill ${isLiked ? 'on' : ''}" id="wLike"><i class="${isLiked ? 'fas' : 'fa-regular'} fa-thumbs-up"></i><span id="wLikeN">${fmtCount(baseLikes + (isLiked ? 1 : 0))}</span></button>
                            <span class="sep"></span>
                            <button class="pill ${isDisliked ? 'on' : ''}" id="wDislike" aria-label="Não gostei"><i class="${isDisliked ? 'fas' : 'fa-regular'} fa-thumbs-down"></i></button>
                        </div>
                        <button class="pill" id="wShare"><i class="fas fa-share"></i>Compartilhar</button>
                        <button class="pill ${isLater ? 'on' : ''}" id="wLater"><i class="fas fa-clock"></i><span>${isLater ? 'Salvo' : 'Salvar'}</span></button>
                    </div>
                </div>

                <div class="desc-box" id="descBox">
                    <b>${fmtViews(v.views)} • ${v.age}</b>
                    <div class="desc-text">${esc(v.desc || '')}<br>Categoria: ${esc(v.cat)}<br>Deixe seu like e se inscreva no canal!</div>
                    <div class="desc-more" id="descMore">...mais</div>
                </div>

                <div class="comments-head"><h2 id="cCount">${comments.length} comentários</h2></div>
                <div class="comment-form" id="cForm">
                    <div class="profile-pic">M</div>
                    <div class="cf-body">
                        <input id="cInput" placeholder="Adicione um comentário..." autocomplete="off">
                        <div class="cf-buttons"><button class="pill" id="cCancel">Cancelar</button><button class="pill primary" id="cSend">Comentar</button></div>
                    </div>
                </div>
                <div id="cList">${comments.map((m) => commentHTML(m)).join('')}</div>
            </div>

            <aside class="secondary">
                <div class="chips" id="relChips">
                    <button class="chip active" data-rel="all">Tudo</button>
                    <button class="chip" data-rel="channel">Do canal</button>
                    <button class="chip" data-rel="related">Relacionados</button>
                </div>
                <div id="relList">${relatedList('all')}</div>
            </aside>
        </div>`;

        /* --- ações --- */
        const likeBtn = $('#wLike'), disBtn = $('#wDislike');
        const pop = (el) => { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); };
        const paintVotes = () => {
            const l = state.liked.includes(id), d = state.disliked.includes(id);
            likeBtn.classList.toggle('on', l); disBtn.classList.toggle('on', d);
            $('i', likeBtn).className = (l ? 'fas' : 'fa-regular') + ' fa-thumbs-up';
            $('i', disBtn).className = (d ? 'fas' : 'fa-regular') + ' fa-thumbs-down';
            $('#wLikeN').textContent = fmtCount(baseLikes + (l ? 1 : 0));
        };
        likeBtn.onclick = () => {
            const on = toggleIn(state.liked, id);
            if (on) state.disliked = state.disliked.filter((x) => x !== id);
            save('liked'); save('disliked'); paintVotes(); pop($('i', likeBtn));
            if (on) toast('Adicionado a Vídeos que gostei');
        };
        disBtn.onclick = () => {
            const on = toggleIn(state.disliked, id);
            if (on) state.liked = state.liked.filter((x) => x !== id);
            save('liked'); save('disliked'); paintVotes(); pop($('i', disBtn));
        };
        $('#wShare').onclick = () => copyLink(id);
        $('#wLater').onclick = () => {
            const on = toggleIn(state.later, id);
            save('later');
            $('#wLater').classList.toggle('on', on);
            $('#wLater span').textContent = on ? 'Salvo' : 'Salvar';
            toast(on ? 'Salvo em Assistir mais tarde' : 'Removido de Assistir mais tarde');
        };
        $('#wSub').onclick = (e) => {
            const on = toggleIn(state.subs, c.id);
            save('subs');
            const b = e.currentTarget;
            b.classList.toggle('subscribed', on);
            b.innerHTML = on ? '<i class="fas fa-bell"></i>Inscrito' : 'Inscrever-se';
            if (on) { const bell = $('i', b); if (bell) pop(bell); }
        };
        $('#descBox').onclick = () => {
            const box = $('#descBox');
            box.classList.toggle('open');
            $('#descMore').textContent = box.classList.contains('open') ? 'Mostrar menos' : '...mais';
        };
        $('#relChips').addEventListener('click', (e) => {
            const b = e.target.closest('[data-rel]');
            if (!b) return;
            $$('#relChips .chip').forEach((x) => x.classList.toggle('active', x === b));
            $('#relList').innerHTML = relatedList(b.dataset.rel);
        });

        /* --- comentários --- */
        const cForm = $('#cForm'), cInput = $('#cInput');
        cInput.addEventListener('focus', () => cForm.classList.add('focus'));
        $('#cCancel').onclick = () => { cInput.value = ''; cForm.classList.remove('focus'); };
        const sendComment = () => {
            const text = cInput.value.trim();
            if (!text) return;
            comments.unshift({ name: '@voce', text, likes: 0, ago: 'agora mesmo' });
            $('#cList').insertAdjacentHTML('afterbegin', commentHTML(comments[0], true));
            $('#cCount').textContent = comments.length + ' comentários';
            cInput.value = ''; cForm.classList.remove('focus'); cInput.blur();
        };
        $('#cSend').onclick = sendComment;
        cInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendComment(); });
        $('#cList').addEventListener('click', (e) => {
            const b = e.target.closest('[data-cl]');
            if (!b) return;
            const n = $('span', b);
            const on = !b.classList.contains('on');
            b.classList.toggle('on', on);
            n.textContent = Number(n.textContent) + (on ? 1 : -1);
            pop($('i', b));
        });

        /* --- player simulado --- */
        const player = $('#player');
        const dur = parseDur(v.duration);
        const speeds = [1, 1.5, 2, 0.5];
        let t = 0, playing = false, timer = null, muted = false, si = 0;

        const paint = () => {
            $('#pfill').style.width = (t / dur * 100) + '%';
            $('#ptime').textContent = fmtTime(t) + ' / ' + v.duration;
        };
        const flash = (icon) => {
            const f = $('#flash');
            f.innerHTML = `<i class="fas ${icon}"></i>`;
            f.classList.remove('show'); void f.offsetWidth; f.classList.add('show');
        };
        const setPlayIcon = () => { $('#pPlay i').className = 'fas ' + (playing ? 'fa-pause' : 'fa-play'); };
        const play = () => {
            if (t >= dur) t = 0;
            playing = true;
            player.classList.add('playing'); player.classList.remove('paused', 'ended');
            clearInterval(timer);
            timer = setInterval(() => {
                t += 0.25 * speeds[si];
                if (t >= dur) { t = dur; pause(true); }
                paint();
            }, 250);
            setPlayIcon();
        };
        const pause = (ended) => {
            playing = false;
            clearInterval(timer);
            player.classList.remove('playing');
            player.classList.add('paused');
            if (ended === true) player.classList.add('ended');
            setPlayIcon();
        };
        const toggle = () => { if (playing) { pause(); flash('fa-pause'); } else { play(); flash('fa-play'); } };
        const seek = (s) => { t = Math.max(0, Math.min(dur, s)); if (t < dur) player.classList.remove('ended'); paint(); };
        const toggleFull = () => {
            if (document.fullscreenElement) document.exitFullscreen();
            else if (player.requestFullscreen) player.requestFullscreen();
        };

        player.addEventListener('click', (e) => { if (!e.target.closest('.controls, .big-replay')) toggle(); });
        player.addEventListener('dblclick', (e) => { if (!e.target.closest('.controls')) toggleFull(); });
        $('#pPlay').onclick = toggle;
        $('#replay').onclick = () => { t = 0; play(); };
        $('#pMute').onclick = () => {
            muted = !muted;
            $('#pMute i').className = 'fas ' + (muted ? 'fa-volume-xmark' : 'fa-volume-high');
        };
        $('#pSpeed').onclick = () => { si = (si + 1) % speeds.length; $('#pSpeed').textContent = speeds[si] + 'x'; };
        $('#pFull').onclick = toggleFull;
        $('#progress').addEventListener('click', (e) => {
            const r = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - r.left) / r.width) * dur);
        });

        const onKey = (e) => {
            if (e.target.matches('input, textarea, select') || e.ctrlKey || e.metaKey || e.altKey) return;
            const k = e.key.toLowerCase();
            if (k === ' ' || k === 'k') { e.preventDefault(); toggle(); }
            else if (e.key === 'ArrowRight') seek(t + 5);
            else if (e.key === 'ArrowLeft') seek(t - 5);
            else if (k === 'm') $('#pMute').click();
            else if (k === 'f') toggleFull();
        };
        document.addEventListener('keydown', onKey);
        cleanup = () => {
            clearInterval(timer);
            document.removeEventListener('keydown', onKey);
            if (document.fullscreenElement) document.exitFullscreen();
        };

        setTimeout(() => { if (route.name === 'watch' && route.arg === id) play(); }, 300);
    }

    /* ---------- início ---------- */
    applyTheme();
    renderNotifs();
    router();
})();
