/*  
===========================================================
APP.JS — SUPER ASSEUF ENTERPRISE PRO (COMPLETO)
===========================================================
*/

// ---------------------------------------------------------
// CONFIGURAÇÃO DE PERFIS E PERMISSÕES PADRÃO
// ---------------------------------------------------------
const PERFIS = {
    admin: {
        rotas: true, chat: true, calendario: true, tarefas: true,
        drive: true, perfis: true, notificacoes: true, logs: true,
        dashboard: true, auditoria: true, configuracoes: true, relatorios: true
    },
    taylor: {
        rotas: true, chat: true, calendario: true, tarefas: true,
        drive: true, perfis: true, notificacoes: true, logs: true,
        dashboard: true, auditoria: true, configuracoes: true, relatorios: true
    },
    usuario: {
        rotas: true, tarefas: true, relatorios: true,
        chat: false, calendario: false, drive: false, perfis: false,
        notificacoes: false, logs: false, dashboard: false,
        auditoria: false, configuracoes: false
    },
    associado: {
        rotas: true, chat: true, calendario: true, tarefas: true,
        drive: true, perfis: true, notificacoes: true, logs: true,
        dashboard: true, auditoria: true, configuracoes: true, relatorios: true
    }
};

// ---------------------------------------------------------
// STATE GLOBAL
// ---------------------------------------------------------
let state = {
    paginaAtual: "login",
    usuarioLogado: null,
    usuarios: [],
    rotas: [],
    chat: { mensagens: [] },
    calendario: { eventos: [] },
    tarefas: [],
    drive: { arquivos: [] },
    favoritos: [],
    auditoria: [],
    notificacoes: [],
    logsTecnicos: [],
    tema: "claro",
    grupos: [],
    tickets: [],
    avisosGlobais: [],
    changelog: []
};

// ---------------------------------------------------------
// STORAGE
// ---------------------------------------------------------
function salvarBackup() {
    try {
        localStorage.setItem("ASSEUF_ENTERPRISE_PRO_STATE", JSON.stringify(state));
    } catch (e) {
        console.error("Erro ao salvar backup:", e);
    }
}

function carregarBackup() {
    try {
        const salvo = localStorage.getItem("ASSEUF_ENTERPRISE_PRO_STATE");
        if (salvo) {
            state = JSON.parse(salvo);
        } else {
            criarUsuariosIniciais();
            salvarBackup();
        }
    } catch (e) {
        console.error("Erro ao carregar backup:", e);
    }
}

function criarUsuariosIniciais() {
    state.usuarios = [
        {
            usuario: "admin",
            senha: "0000",
            perfil: "admin",
            permissoes: { ...PERFIS.admin },
            perfilAvancado: { foto: "", bio: "", telefone: "", email: "", cargo: "Administrador", observacoes: "" }
        },
        {
            usuario: "Taylor",
            senha: "1296",
            perfil: "taylor",
            permissoes: { ...PERFIS.taylor },
            perfilAvancado: { foto: "", bio: "", telefone: "", email: "", cargo: "Desenvolvedor", observacoes: "" }
        },
        {
            usuario: "Usuario",
            senha: "1234",
            perfil: "usuario",
            permissoes: { ...PERFIS.usuario },
            perfilAvancado: { foto: "", bio: "", telefone: "", email: "", cargo: "Usuário Comum", observacoes: "" }
        }
    ];
}

// ---------------------------------------------------------
// UI BÁSICO
// ---------------------------------------------------------
const UI = {
    logo() {
        return `<div style="text-align:center; margin-bottom:10px;"><h1>ASSEUF ENTERPRISE PRO</h1></div>`;
    },
    titulo(txt) {
        return `<h2 style="margin-bottom:10px;">${txt}</h2>`;
    }
};

// ---------------------------------------------------------
// TEMA
// ---------------------------------------------------------
function aplicarTema() {
    const root = document.documentElement;
    if (state.tema === "escuro") {
        root.style.setProperty("--bg", "#121212");
        root.style.setProperty("--card", "#1e1e1e");
        root.style.setProperty("--card2", "#2a2a2a");
        root.style.setProperty("--texto", "#ffffff");
        root.style.setProperty("--primaria", "#4A90E2");
    } else {
        root.style.setProperty("--bg", "#f5f5f5");
        root.style.setProperty("--card", "#ffffff");
        root.style.setProperty("--card2", "#f0f0f0");
        root.style.setProperty("--texto", "#333333");
        root.style.setProperty("--primaria", "#4A90E2");
    }
}

function alternarTema() {
    state.tema = state.tema === "claro" ? "escuro" : "claro";
    aplicarTema();
    salvarBackup();
    render();
}

// ---------------------------------------------------------
// NOTIFICAÇÕES (TOAST)
// ---------------------------------------------------------
function notificar(msg, tipo = "info") {
    console.log(`[${tipo}] ${msg}`);
    const area = document.getElementById("toastArea");
    if (!area) return;
    const div = document.createElement("div");
    div.className = "toast " + tipo;
    div.innerText = msg;
    area.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}

// ---------------------------------------------------------
// AUDITORIA
// ---------------------------------------------------------
function auditar(acao, detalhe, tipo = "acao") {
    state.auditoria.push({
        id: Date.now(),
        usuario: state.usuarioLogado ? state.usuarioLogado.usuario : "sistema",
        acao,
        detalhe,
        tipo,
        data: new Date().toLocaleString()
    });
    salvarBackup();
}

// ---------------------------------------------------------
// RENDER SEGURO
// ---------------------------------------------------------
function renderSeguro(html) {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = `
        <div id="menuLateral" class="menu-lateral"></div>
        <div class="conteudo-principal">
            ${html}
        </div>
        <div id="toastArea" class="toast-area"></div>
    `;
    inserirMenuLateral();
}

// ---------------------------------------------------------
// NAVEGAÇÃO
// ---------------------------------------------------------
function mudarPagina(pagina, param) {
    state.paginaAtual = pagina;
    state.parametroPagina = param;
    salvarBackup();
    render(pagina, param);
}

// ---------------------------------------------------------
// MENU LATERAL
// ---------------------------------------------------------
function inserirMenuLateral() {
    const menu = document.getElementById("menuLateral");
    if (!menu) return;

    if (!state.usuarioLogado) {
        menu.innerHTML = "";
        return;
    }

    let html = `
        <div style="padding:10px;">
            <div style="margin-bottom:10px;">
                <b>${state.usuarioLogado.usuario}</b><br>
                <small>${state.usuarioLogado.perfil}</small>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">🏠 Início</button>
            <button class="btn btn-secondary" onclick="mudarPagina('meuPerfil')">👤 Meu Perfil</button>
            <button class="btn btn-secondary" onclick="mudarPagina('diretorioUsuarios')">👥 Diretório</button>
            <button class="btn btn-secondary" onclick="mudarPagina('chat')">💬 Chat</button>
            <button class="btn btn-secondary" onclick="mudarPagina('grupos')">👥 Grupos</button>
            <button class="btn btn-secondary" onclick="mudarPagina('calendario')">📅 Calendário</button>
            <button class="btn btn-secondary" onclick="mudarPagina('tarefas')">📝 Tarefas</button>
            <button class="btn btn-secondary" onclick="mudarPagina('drive')">📂 Drive</button>
            <button class="btn btn-secondary" onclick="mudarPagina('notificacoes')">🔔 Notificações</button>
            <button class="btn btn-secondary" onclick="mudarPagina('dashboardAnalitico')">📊 Dashboard</button>
            <button class="btn btn-secondary" onclick="mudarPagina('relatorios')">📄 Relatórios</button>
            <button class="btn btn-secondary" onclick="mudarPagina('tickets')">🆘 Suporte</button>
            <button class="btn btn-secondary" onclick="mudarPagina('logsTecnicos')">🛠️ Logs</button>
            <button class="btn btn-secondary" onclick="mudarPagina('backup')">💾 Backup</button>
    `;

    // Links exclusivos para admin/taylor
    if (state.usuarioLogado.perfil === "admin" || state.usuarioLogado.perfil === "taylor") {
        html += `
            <button class="btn btn-secondary" onclick="mudarPagina('gerenciarPermissoes')">🔐 Permissões</button>
            <button class="btn btn-secondary" onclick="mudarPagina('gerenciarAvisos')">📢 Avisos Globais</button>
            <button class="btn btn-secondary" onclick="mudarPagina('changelog')">📝 Changelog</button>
        `;
    }

    html += `
            <hr>
            <button class="btn btn-secondary" onclick="alternarTema()">Tema: ${state.tema === "claro" ? "☀️ Claro" : "🌙 Escuro"}</button>
            <button class="btn btn-danger" onclick="logout()">Sair</button>
        </div>
    `;

    menu.innerHTML = html;
}

// ---------------------------------------------------------
// LOGIN / LOGOUT
// ---------------------------------------------------------
function paginaLogin() {
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Login")}
            <div class="card">
                <label>Usuário:</label>
                <input id="loginUsuario">
                <label>Senha:</label>
                <input id="loginSenha" type="password">
                <button class="btn btn-primary" onclick="fazerLogin()">Entrar</button>
            </div>
        </div>
    `;
}

function fazerLogin() {
    const usuario = document.getElementById("loginUsuario").value.trim();
    const senha = document.getElementById("loginSenha").value.trim();

    const u = state.usuarios.find(x => x.usuario === usuario && x.senha === senha);
    if (!u) {
        notificar("Usuário ou senha inválidos.", "error");
        return;
    }

    state.usuarioLogado = u;
    salvarBackup();
    auditar("Login", `Usuário ${u.usuario} entrou`, "login");
    mudarPagina("home");
}

function logout() {
    auditar("Logout", `Usuário ${state.usuarioLogado?.usuario || ""} saiu`, "logout");
    state.usuarioLogado = null;
    salvarBackup();
    mudarPagina("login");
}

// ---------------------------------------------------------
// HOME
// ---------------------------------------------------------
function paginaHome() {
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Início")}
            <div class="card">
                <p>Bem-vindo, <b>${state.usuarioLogado.usuario}</b>.</p>
                <p>Use o menu lateral para navegar pelos módulos do sistema.</p>
            </div>
        </div>
    `;
}

// ---------------------------------------------------------
// BACKUP (EXPORTAR / IMPORTAR)
// ---------------------------------------------------------
function paginaBackup() {
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Backup e Restauração")}
            <div class="card">
                <h3>Exportar backup</h3>
                <button class="btn btn-primary" onclick="exportarBackup()">Baixar backup (JSON)</button>
            </div>
            <div class="card">
                <h3>Importar backup</h3>
                <input id="inputBackup" type="file" accept="application/json">
                <button class="btn btn-secondary" onclick="importarBackup()">Importar</button>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function exportarBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-asseuf-enterprise-pro.json";
    a.click();
    URL.revokeObjectURL(url);
    notificar("Backup exportado.", "success");
}

function importarBackup() {
    const input = document.getElementById("inputBackup");
    if (!input.files || input.files.length === 0) {
        notificar("Selecione um arquivo de backup.", "error");
        return;
    }
    const arquivo = input.files[0];
    const leitor = new FileReader();
    leitor.onload = function (e) {
        try {
            const dados = JSON.parse(e.target.result);
            state = dados;
            salvarBackup();
            aplicarTema();
            notificar("Backup importado com sucesso.", "success");
            render();
        } catch (err) {
            notificar("Arquivo de backup inválido.", "error");
        }
    };
    leitor.readAsText(arquivo);
}

// ---------------------------------------------------------
// ROTAS, VEÍCULOS, ALUNOS, FAVORITOS
// ---------------------------------------------------------
function garantirRotas() { if (!state.rotas) state.rotas = []; }

function paginaRotas() {
    garantirRotas();
    const isAssoc = isAssociado();
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Rotas")}
            ${!isAssoc ? '<button class="btn btn-primary" onclick="mudarPagina(\'novaRota\')">Nova Rota</button>' : ''}
            <div class="card">
                ${state.rotas.map(r => `
                    <div class="card" style="border-left:6px solid var(--primaria);">
                        <b>${r.nome}</b> ${botaoFavorito("rota", r.nome)}
                        <p><small>${r.veiculos.length} veículos • ${r.alunos.length} alunos</small></p>
                        <button class="btn btn-secondary" onclick="mudarPagina('rotaDetalhe','${r.nome}')">Abrir</button>
                    </div>
                `).join("")}
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function paginaNovaRota() {
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Nova Rota")}
            <div class="card">
                <label>Nome da rota:</label>
                <input id="rotaNome">
                <button class="btn btn-primary" onclick="salvarNovaRota()">Salvar</button>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('rotas')">Voltar</button>
        </div>
    `;
}

function salvarNovaRota() {
    const nome = document.getElementById("rotaNome").value.trim();
    if (!nome) { notificar("Informe o nome da rota.", "error"); return; }
    if (state.rotas.some(r => r.nome === nome)) { notificar("Já existe uma rota com esse nome.", "error"); return; }
    state.rotas.push({ nome, veiculos: [], alunos: [] });
    salvarBackup();
    auditar("Criou rota", nome);
    mudarPagina("rotas");
}

function paginaRotaDetalhe(nome) {
    const r = state.rotas.find(x => x.nome === nome);
    if (!r) { notificar("Rota não encontrada.", "error"); mudarPagina("rotas"); return ""; }
    const isAssoc = isAssociado();
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Rota: " + nome)}
            <div class="card">
                <h3>Veículos</h3>
                ${r.veiculos.map(v => `<div class="card"><b>${v.placa}</b> — ${v.motorista}</div>`).join("")}
                ${!isAssoc ? `<button class="btn btn-primary" onclick="mudarPagina('novoVeiculo','${nome}')">Adicionar veículo</button>` : ''}
            </div>
            <div class="card">
                <h3>Alunos</h3>
                ${r.alunos.map(a => `<div class="card"><b>${a.nome}</b> — ${a.ponto}</div>`).join("")}
                ${!isAssoc ? `<button class="btn btn-primary" onclick="mudarPagina('novoAluno','${nome}')">Adicionar aluno</button>` : ''}
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('rotas')">Voltar</button>
        </div>
    `;
}

function paginaNovoVeiculo(nomeRota) {
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Novo Veículo")}
            <div class="card">
                <label>Placa:</label><input id="veicPlaca">
                <label>Motorista:</label><input id="veicMotorista">
                <button class="btn btn-primary" onclick="salvarNovoVeiculo('${nomeRota}')">Salvar</button>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('rotaDetalhe','${nomeRota}')">Voltar</button>
        </div>
    `;
}

function salvarNovoVeiculo(nomeRota) {
    const r = state.rotas.find(x => x.nome === nomeRota);
    if (!r) return;
    const placa = document.getElementById("veicPlaca").value.trim();
    const motorista = document.getElementById("veicMotorista").value.trim();
    if (!placa || !motorista) { notificar("Preencha todos os campos.", "error"); return; }
    r.veiculos.push({ placa, motorista });
    salvarBackup();
    auditar("Adicionou veículo", placa);
    mudarPagina("rotaDetalhe", nomeRota);
}

function paginaNovoAluno(nomeRota) {
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Novo Aluno")}
            <div class="card">
                <label>Nome:</label><input id="alunoNome">
                <label>Ponto de embarque:</label><input id="alunoPonto">
                <button class="btn btn-primary" onclick="salvarNovoAluno('${nomeRota}')">Salvar</button>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('rotaDetalhe','${nomeRota}')">Voltar</button>
        </div>
    `;
}

function salvarNovoAluno(nomeRota) {
    const r = state.rotas.find(x => x.nome === nomeRota);
    if (!r) return;
    const nome = document.getElementById("alunoNome").value.trim();
    const ponto = document.getElementById("alunoPonto").value.trim();
    if (!nome || !ponto) { notificar("Preencha todos os campos.", "error"); return; }
    r.alunos.push({ nome, ponto });
    salvarBackup();
    auditar("Adicionou aluno", nome);
    mudarPagina("rotaDetalhe", nomeRota);
}

// ---------------------------------------------------------
// FAVORITOS
// ---------------------------------------------------------
function garantirFavoritos() { if (!state.favoritos) state.favoritos = []; }

function botaoFavorito(tipo, id) {
    garantirFavoritos();
    const existe = state.favoritos.some(f => f.tipo === tipo && f.id == id);
    return `<span onclick="alternarFavorito('${tipo}','${id}')" style="cursor:pointer; font-size:20px; margin-left:10px;">${existe ? "⭐" : "☆"}</span>`;
}

function alternarFavorito(tipo, id) {
    garantirFavoritos();
    const i = state.favoritos.findIndex(f => f.tipo === tipo && f.id == id);
    if (i >= 0) state.favoritos.splice(i, 1);
    else state.favoritos.push({ tipo, id });
    salvarBackup();
    render();
}

function paginaFavoritos() {
    garantirFavoritos();
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Favoritos")}
            <div class="card">
                ${state.favoritos.length === 0 ? "<p>Nenhum favorito salvo.</p>" : state.favoritos.map(f => renderItemFavorito(f)).join("")}
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function renderItemFavorito(f) {
    if (f.tipo === "rota") return `<div class="card"><b>Rota:</b> ${f.id}<br><button class="btn btn-primary" onclick="mudarPagina('rotaDetalhe','${f.id}')">Abrir</button> <button class="btn btn-danger" onclick="removerFavorito('${f.tipo}','${f.id}')">Remover</button></div>`;
    if (f.tipo === "tarefa") return `<div class="card"><b>Tarefa:</b> ${f.id}<br><button class="btn btn-primary" onclick="mudarPagina('tarefaDetalhe',${f.id})">Abrir</button> <button class="btn btn-danger" onclick="removerFavorito('${f.tipo}','${f.id}')">Remover</button></div>`;
    if (f.tipo === "arquivo") return `<div class="card"><b>Arquivo:</b> ${f.id}<br><button class="btn btn-primary" onclick="mudarPagina('drive')">Abrir Drive</button> <button class="btn btn-danger" onclick="removerFavorito('${f.tipo}','${f.id}')">Remover</button></div>`;
    return "";
}

function removerFavorito(tipo, id) {
    state.favoritos = state.favoritos.filter(f => !(f.tipo === tipo && f.id == id));
    salvarBackup();
    render();
}

// ---------------------------------------------------------
// CHAT INTERNO
// ---------------------------------------------------------
function garantirChat() { if (!state.chat) state.chat = { mensagens: [] }; }

function paginaChat() {
    garantirChat();
    const u = state.usuarioLogado.usuario;
    const usuarios = state.usuarios.filter(x => x.usuario !== u).map(x => x.usuario);
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Chat")}
            <div class="card">
                ${usuarios.map(outro => `
                    <div class="card" style="display:flex; align-items:center; justify-content:space-between;">
                        <div style="display:flex; align-items:center;">${avatarUsuario(outro, 40)}<b>${outro}</b></div>
                        <button class="btn btn-secondary" onclick="mudarPagina('chatConversa','${outro}')">Abrir</button>
                    </div>
                `).join("")}
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function paginaChatConversa(outroUsuario) {
    garantirChat();
    const u = state.usuarioLogado.usuario;
    const msgs = state.chat.mensagens.filter(m => (m.de === u && m.para === outroUsuario) || (m.de === outroUsuario && m.para === u));
    const htmlMsgs = msgs.map(m => `
        <div style="display:flex; margin:8px 0; ${m.de === u ? "flex-direction:row-reverse;" : ""}">
            ${avatarUsuario(m.de, 32)}
            <div style="background:${m.de === u ? "var(--primaria)" : "var(--card2)"}; color:${m.de === u ? "white" : "var(--texto)"}; padding:10px; border-radius:8px; max-width:80%;">
                <b>${m.de}</b><br>${m.texto}<br><small>${m.data}</small>
            </div>
        </div>
    `).join("");
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Chat com " + outroUsuario)}
            <div class="card" style="max-height:400px; overflow-y:auto;">${htmlMsgs || "<p>Nenhuma mensagem ainda.</p>"}</div>
            <div class="card">
                <textarea id="msgChat" placeholder="Digite sua mensagem..." style="width:100%; height:80px;"></textarea>
                <button class="btn btn-primary" onclick="enviarMensagemChat('${outroUsuario}')">Enviar</button>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('chat')">Voltar</button>
        </div>
    `;
}

function enviarMensagemChat(destino) {
    garantirChat();
    const texto = document.getElementById("msgChat").value.trim();
    if (!texto) return;
    const u = state.usuarioLogado.usuario;
    state.chat.mensagens.push({ id: Date.now(), de: u, para: destino, texto, data: new Date().toLocaleString() });
    salvarBackup();
    auditar("Enviou mensagem", `Para ${destino}`);
    mudarPagina("chatConversa", destino);
}

// ---------------------------------------------------------
// CHAT EM GRUPO
// ---------------------------------------------------------
function garantirGrupos() { if (!state.grupos) state.grupos = []; }

function paginaGrupos() {
    garantirGrupos();
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Grupos")}
            ${!isAssociado() ? '<button class="btn btn-primary" onclick="mudarPagina(\'novoGrupo\')">Novo Grupo</button>' : ''}
            <div class="card">
                ${state.grupos.map(g => `
                    <div class="card" style="border-left:6px solid var(--primaria);">
                        <b>${g.nome}</b><br><small>${g.participantes.length} participantes</small><br>
                        <button class="btn btn-secondary" onclick="mudarPagina('grupoChat',${g.id})">Entrar</button>
                    </div>
                `).join("")}
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function paginaNovoGrupo() {
    const usuarios = state.usuarios.map(u => `<option value="${u.usuario}">${u.usuario}</option>`).join("");
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Novo Grupo")}
            <div class="card">
                <label>Nome do grupo:</label><input id="grupoNome">
                <label>Participantes:</label><select id="grupoParticipantes" multiple>${usuarios}</select>
                <button class="btn btn-primary" onclick="salvarNovoGrupo()">Criar Grupo</button>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('grupos')">Voltar</button>
        </div>
    `;
}

function salvarNovoGrupo() {
    garantirGrupos();
    const nome = document.getElementById("grupoNome").value.trim();
    const participantes = Array.from(document.getElementById("grupoParticipantes").selectedOptions).map(o => o.value);
    if (!nome) { notificar("Informe o nome do grupo.", "error"); return; }
    if (participantes.length === 0) { notificar("Selecione pelo menos um participante.", "error"); return; }
    if (!participantes.includes(state.usuarioLogado.usuario)) participantes.push(state.usuarioLogado.usuario);
    state.grupos.push({ id: Date.now(), nome, participantes, mensagens: [] });
    salvarBackup();
    auditar("Criou grupo", nome);
    mudarPagina("grupos");
}

function paginaGrupoChat(id) {
    garantirGrupos();
    const g = state.grupos.find(x => x.id == id);
    if (!g) { notificar("Grupo não encontrado.", "error"); mudarPagina("grupos"); return ""; }
    const msgs = g.mensagens.map(m => `
        <div style="display:flex; margin:8px 0; ${m.usuario === state.usuarioLogado.usuario ? "flex-direction:row-reverse;" : ""}">
            ${avatarUsuario(m.usuario, 32)}
            <div style="background:${m.usuario === state.usuarioLogado.usuario ? "var(--primaria)" : "var(--card2)"}; color:${m.usuario === state.usuarioLogado.usuario ? "white" : "var(--texto)"}; padding:10px; border-radius:8px; max-width:80%;">
                <b>${m.usuario}</b><br>${m.texto}<br><small>${m.data}</small>
            </div>
        </div>
    `).join("");
    const listaParticipantes = g.participantes.map(p => `<span style="margin-right:10px;">${avatarUsuario(p, 25)} ${p}</span>`).join("");
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo(g.nome)}
            <div class="card"><h3>Participantes</h3>${listaParticipantes}</div>
            <div class="card" style="max-height:400px; overflow-y:auto;">${msgs || "<p>Nenhuma mensagem ainda.</p>"}</div>
            <div class="card">
                <textarea id="msgGrupo" placeholder="Digite sua mensagem..." style="width:100%; height:80px;"></textarea>
                <button class="btn btn-primary" onclick="enviarMensagemGrupo(${id})">Enviar</button>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('grupos')">Voltar</button>
        </div>
    `;
}

function enviarMensagemGrupo(id) {
    garantirGrupos();
    const g = state.grupos.find(x => x.id == id);
    if (!g) return;
    const texto = document.getElementById("msgGrupo").value.trim();
    if (!texto) return;
    g.mensagens.push({ id: Date.now(), usuario: state.usuarioLogado.usuario, texto, data: new Date().toLocaleString() });
    salvarBackup();
    auditar("Mensagem em grupo", g.nome);
    mudarPagina("grupoChat", id);
}

// ---------------------------------------------------------
// CALENDÁRIO, EVENTOS, PRESENÇAS
// ---------------------------------------------------------
function garantirCalendario() { if (!state.calendario) state.calendario = { eventos: [] }; }

function paginaCalendario() {
    garantirCalendario();
    const eventos = [...state.calendario.eventos].sort((a,b)=>a.data.localeCompare(b.data));
    const isAssoc = isAssociado();
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Calendário")}
            ${!isAssoc ? '<button class="btn btn-primary" onclick="mudarPagina(\'novoEvento\')">Novo Evento</button>' : ''}
            <div class="card">
                ${eventos.map(e => `
                    <div class="card" style="border-left:6px solid var(--primaria);">
                        <b>${e.titulo}</b><br><small>${e.data} ${e.hora || ""}</small><br>
                        <button class="btn btn-secondary" onclick="mudarPagina('eventoDetalhe',${e.id})">Abrir</button>
                    </div>
                `).join("")}
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function paginaNovoEvento() {
    const rotas = state.rotas.map(r => `<option value="${r.nome}">${r.nome}</option>`).join("");
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Novo Evento")}
            <div class="card">
                <label>Título:</label><input id="evTitulo">
                <label>Data:</label><input id="evData" type="date">
                <label>Hora (opcional):</label><input id="evHora" type="time">
                <label>Rotas relacionadas:</label><select id="evRotas" multiple>${rotas}</select>
                <button class="btn btn-primary" onclick="salvarNovoEvento()">Salvar</button>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('calendario')">Voltar</button>
        </div>
    `;
}

function salvarNovoEvento() {
    garantirCalendario();
    const titulo = document.getElementById("evTitulo").value.trim();
    const data = document.getElementById("evData").value;
    const hora = document.getElementById("evHora").value;
    const rotas = Array.from(document.getElementById("evRotas").selectedOptions).map(o => o.value);
    if (!titulo || !data) { notificar("Preencha título e data.", "error"); return; }
    state.calendario.eventos.push({ id: Date.now(), titulo, data, hora, rotas, criador: state.usuarioLogado.usuario, presencas: [] });
    salvarBackup();
    auditar("Criou evento", titulo);
    mudarPagina("calendario");
}

function paginaEventoDetalhe(id) {
    garantirCalendario();
    const e = state.calendario.eventos.find(x => x.id == id);
    if (!e) { notificar("Evento não encontrado.", "error"); mudarPagina("calendario"); return ""; }
    const listaPresencas = e.presencas.map(p => `<div class="card"><b>${p.usuario}</b> — ${p.status}</div>`).join("");
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo(e.titulo)}
            <div class="card"><p><b>Data:</b> ${e.data}</p><p><b>Hora:</b> ${e.hora || "—"}</p><p><b>Rotas:</b> ${e.rotas.join(", ") || "—"}</p><p><b>Criador:</b> ${e.criador}</p></div>
            <div class="card">
                <h3>Presenças</h3>${listaPresencas || "<p>Ninguém marcou presença ainda.</p>"}
                <button class="btn btn-primary" onclick="marcarPresenca(${id},'presente')">Estou presente</button>
                <button class="btn btn-secondary" onclick="marcarPresenca(${id},'ausente')">Estou ausente</button>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('calendario')">Voltar</button>
        </div>
    `;
}

function marcarPresenca(id, status) {
    garantirCalendario();
    const e = state.calendario.eventos.find(x => x.id == id);
    if (!e) return;
    const u = state.usuarioLogado.usuario;
    const existente = e.presencas.find(p => p.usuario === u);
    if (existente) existente.status = status;
    else e.presencas.push({ usuario: u, status });
    salvarBackup();
    auditar("Presença marcada", `${u} → ${status}`);
    mudarPagina("eventoDetalhe", id);
}

// ---------------------------------------------------------
// TAREFAS
// ---------------------------------------------------------
function garantirTarefas() { if (!state.tarefas) state.tarefas = []; }

function corStatusTarefa(status) { return { pendente: "#e67e22", andamento: "#3498db", concluida: "#2ecc71", cancelada: "#e74c3c" }[status] || "var(--primaria)"; }

function paginaTarefas() {
    garantirTarefas();
    const lista = [...state.tarefas].sort((a,b)=>b.id - a.id);
    const isAssoc = isAssociado();
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Tarefas")}
            ${!isAssoc ? '<button class="btn btn-primary" onclick="mudarPagina(\'novaTarefa\')">Nova Tarefa</button>' : ''}
            <div class="card">
                ${lista.map(t => `
                    <div class="card" style="border-left:6px solid ${corStatusTarefa(t.status)};">
                        <b>${t.titulo}</b> ${botaoFavorito("tarefa", t.id)}
                        <p>${t.descricao}</p><small>Status: ${t.status}</small><br><small>Atribuído a: ${t.atribuido || "—"}</small><br>
                        <button class="btn btn-secondary" onclick="mudarPagina('tarefaDetalhe',${t.id})">Abrir</button>
                    </div>
                `).join("")}
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function paginaNovaTarefa() {
    const usuarios = state.usuarios.map(u => `<option value="${u.usuario}">${u.usuario}</option>`).join("");
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Nova Tarefa")}
            <div class="card">
                <label>Título:</label><input id="tarefaTitulo">
                <label>Descrição:</label><textarea id="tarefaDescricao"></textarea>
                <label>Status:</label><select id="tarefaStatus"><option value="pendente">Pendente</option><option value="andamento">Em andamento</option><option value="concluida">Concluída</option><option value="cancelada">Cancelada</option></select>
                <label>Atribuir a:</label><select id="tarefaAtribuido"><option value="">—</option>${usuarios}</select>
                <button class="btn btn-primary" onclick="salvarNovaTarefa()">Salvar</button>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('tarefas')">Voltar</button>
        </div>
    `;
}

function salvarNovaTarefa() {
    garantirTarefas();
    const titulo = document.getElementById("tarefaTitulo").value.trim();
    const descricao = document.getElementById("tarefaDescricao").value.trim();
    const status = document.getElementById("tarefaStatus").value;
    const atribuido = document.getElementById("tarefaAtribuido").value;
    if (!titulo) { notificar("Informe o título.", "error"); return; }
    state.tarefas.push({ id: Date.now(), titulo, descricao, status, atribuido, criador: state.usuarioLogado.usuario, data: new Date().toLocaleString() });
    salvarBackup();
    auditar("Criou tarefa", titulo);
    mudarPagina("tarefas");
}

function paginaTarefaDetalhe(id) {
    garantirTarefas();
    const t = state.tarefas.find(x => x.id == id);
    if (!t) { notificar("Tarefa não encontrada.", "error"); mudarPagina("tarefas"); return ""; }
    const usuarios = state.usuarios.map(u => `<option value="${u.usuario}" ${t.atribuido===u.usuario?"selected":""}>${u.usuario}</option>`).join("");
    const isAssoc = isAssociado();
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Tarefa")}
            <div class="card">
                <label>Título:</label><input id="tarefaTituloEdit" value="${t.titulo}">
                <label>Descrição:</label><textarea id="tarefaDescricaoEdit">${t.descricao}</textarea>
                <label>Status:</label><select id="tarefaStatusEdit"><option value="pendente" ${t.status==="pendente"?"selected":""}>Pendente</option><option value="andamento" ${t.status==="andamento"?"selected":""}>Em andamento</option><option value="concluida" ${t.status==="concluida"?"selected":""}>Concluída</option><option value="cancelada" ${t.status==="cancelada"?"selected":""}>Cancelada</option></select>
                <label>Atribuir a:</label><select id="tarefaAtribuidoEdit"><option value="">—</option>${usuarios}</select>
                ${!isAssoc ? `<button class="btn btn-primary" onclick="salvarEdicaoTarefa(${id})">Salvar alterações</button><button class="btn btn-danger" onclick="excluirTarefa(${id})">Excluir</button>` : ''}
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('tarefas')">Voltar</button>
        </div>
    `;
}

function salvarEdicaoTarefa(id) {
    const t = state.tarefas.find(x => x.id == id);
    if (!t) return;
    t.titulo = document.getElementById("tarefaTituloEdit").value.trim();
    t.descricao = document.getElementById("tarefaDescricaoEdit").value.trim();
    t.status = document.getElementById("tarefaStatusEdit").value;
    t.atribuido = document.getElementById("tarefaAtribuidoEdit").value;
    salvarBackup();
    auditar("Editou tarefa", t.titulo);
    mudarPagina("tarefaDetalhe", id);
}

function excluirTarefa(id) {
    state.tarefas = state.tarefas.filter(x => x.id != id);
    salvarBackup();
    auditar("Excluiu tarefa", id);
    mudarPagina("tarefas");
}

// ---------------------------------------------------------
// DRIVE CORPORATIVO
// ---------------------------------------------------------
function garantirDrive() { if (!state.drive) state.drive = { arquivos: [] }; }

function paginaDrive() {
    garantirDrive();
    const lista = [...state.drive.arquivos].sort((a,b)=>b.id - a.id);
    const isAssoc = isAssociado();
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Drive")}
            ${!isAssoc ? `
                <div class="card">
                    <label>Enviar arquivo:</label>
                    <input id="driveUpload" type="file">
                    <button class="btn btn-primary" onclick="uploadArquivoDrive()">Enviar</button>
                </div>
            ` : ''}
            <div class="card">
                ${lista.map(a => `
                    <div class="card" style="border-left:6px solid var(--primaria);">
                        <b>${a.nome}</b> ${botaoFavorito("arquivo", a.id)}<br>
                        <small>${a.tipo} — ${a.tamanho} KB</small><br>
                        <small>Enviado por: ${a.usuario}</small><br>
                        <button class="btn btn-secondary" onclick="baixarArquivoDrive(${a.id})">Baixar</button>
                        ${!isAssoc ? `<button class="btn btn-danger" onclick="excluirArquivoDrive(${a.id})">Excluir</button>` : ''}
                    </div>
                `).join("")}
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function uploadArquivoDrive() {
    garantirDrive();
    const input = document.getElementById("driveUpload");
    if (!input.files || input.files.length === 0) { notificar("Selecione um arquivo.", "error"); return; }
    const arquivo = input.files[0];
    const leitor = new FileReader();
    leitor.onload = function (e) {
        state.drive.arquivos.push({ id: Date.now(), nome: arquivo.name, tipo: arquivo.type || "desconhecido", tamanho: Math.round(arquivo.size / 1024), conteudo: e.target.result, usuario: state.usuarioLogado.usuario, data: new Date().toLocaleString() });
        salvarBackup();
        auditar("Upload arquivo", arquivo.name);
        mudarPagina("drive");
    };
    leitor.readAsDataURL(arquivo);
}

function baixarArquivoDrive(id) {
    const a = state.drive.arquivos.find(x => x.id == id);
    if (!a) return;
    const link = document.createElement("a");
    link.href = a.conteudo;
    link.download = a.nome;
    link.click();
}

function excluirArquivoDrive(id) {
    state.drive.arquivos = state.drive.arquivos.filter(x => x.id != id);
    salvarBackup();
    auditar("Excluiu arquivo", id);
    mudarPagina("drive");
}

// ---------------------------------------------------------
// PERFIS AVANÇADOS
// ---------------------------------------------------------
function garantirPerfisAvancados() {
    state.usuarios.forEach(u => { if (!u.perfilAvancado) u.perfilAvancado = { foto: "", bio: "", telefone: "", email: "", cargo: "", observacoes: "" }; });
}

function avatarUsuario(usuario, tamanho = 50) {
    const u = state.usuarios.find(x => x.usuario === usuario);
    if (!u) return "";
    const foto = u.perfilAvancado?.foto || "";
    if (foto) return `<img src="${foto}" style="width:${tamanho}px; height:${tamanho}px; border-radius:50%; object-fit:cover; margin-right:8px;">`;
    return `<div style="width:${tamanho}px; height:${tamanho}px; border-radius:50%; background:var(--primaria); color:white; display:flex; align-items:center; justify-content:center; margin-right:8px; font-weight:bold;">${usuario.charAt(0).toUpperCase()}</div>`;
}

function paginaMeuPerfil() {
    garantirPerfisAvancados();
    const u = state.usuarioLogado;
    const p = u.perfilAvancado;
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Meu Perfil")}
            <div class="card" style="text-align:center;">
                ${avatarUsuario(u.usuario, 100)}
                <h2>${u.usuario}</h2><p><b>Cargo:</b> ${p.cargo || "—"}</p><p><b>Email:</b> ${p.email || "—"}</p><p><b>Telefone:</b> ${p.telefone || "—"}</p><p><b>Bio:</b> ${p.bio || "—"}</p><p><b>Observações:</b> ${p.observacoes || "—"}</p>
                <button class="btn btn-primary" onclick="mudarPagina('editarPerfil')">Editar Perfil</button>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function paginaEditarPerfil() {
    garantirPerfisAvancados();
    const u = state.usuarioLogado;
    const p = u.perfilAvancado;
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Editar Perfil")}
            <div class="card">
                <label>Foto (upload):</label><input id="perfilFoto" type="file" accept="image/*">
                <label>Cargo:</label><input id="perfilCargo" value="${p.cargo || ""}">
                <label>Email:</label><input id="perfilEmail" value="${p.email || ""}">
                <label>Telefone:</label><input id="perfilTelefone" value="${p.telefone || ""}">
                <label>Bio:</label><textarea id="perfilBio">${p.bio || ""}</textarea>
                <label>Observações:</label><textarea id="perfilObs">${p.observacoes || ""}</textarea>
                <button class="btn btn-primary" onclick="salvarPerfil()">Salvar</button>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('meuPerfil')">Voltar</button>
        </div>
    `;
}

function salvarPerfil() {
    garantirPerfisAvancados();
    const u = state.usuarioLogado;
    const p = u.perfilAvancado;
    const fotoInput = document.getElementById("perfilFoto");
    const cargo = document.getElementById("perfilCargo").value.trim();
    const email = document.getElementById("perfilEmail").value.trim();
    const telefone = document.getElementById("perfilTelefone").value.trim();
    const bio = document.getElementById("perfilBio").value.trim();
    const obs = document.getElementById("perfilObs").value.trim();
    p.cargo = cargo; p.email = email; p.telefone = telefone; p.bio = bio; p.observacoes = obs;
    if (fotoInput.files && fotoInput.files.length > 0) {
        const leitor = new FileReader();
        leitor.onload = function (e) { p.foto = e.target.result; salvarBackup(); auditar("Editou perfil", u.usuario); mudarPagina("meuPerfil"); };
        leitor.readAsDataURL(fotoInput.files[0]);
    } else { salvarBackup(); auditar("Editou perfil", u.usuario); mudarPagina("meuPerfil"); }
}

// ---------------------------------------------------------
// DIRETÓRIO DE USUÁRIOS
// ---------------------------------------------------------
function garantirPerfisDiretorio() { garantirPerfisAvancados(); }

function paginaDiretorioUsuarios() {
    garantirPerfisDiretorio();
    const isAdmin = state.usuarioLogado.perfil === "admin" || state.usuarioLogado.perfil === "taylor";
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Diretório de Usuários")}
            <div class="card">
                <input id="buscaDiretorio" type="text" placeholder="Buscar usuário..." oninput="filtrarDiretorioUsuarios()" style="width:100%; padding:10px; font-size:16px;">
            </div>
            ${isAdmin ? '<button class="btn btn-primary" onclick="mudarPagina(\'novoUsuario\')" style="margin-bottom:10px;">➕ Novo Usuário</button>' : ''}
            <div id="listaDiretorio">${renderListaDiretorio(state.usuarios)}</div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function renderListaDiretorio(lista) {
    if (!lista || lista.length === 0) return "<p>Nenhum usuário encontrado.</p>";
    return lista.map(u => {
        const p = u.perfilAvancado;
        return `
            <div class="card" style="display:flex; align-items:center; gap:10px;">
                ${avatarUsuario(u.usuario, 60)}
                <div style="flex:1;"><h3 style="margin:0;">${u.usuario}</h3><p style="margin:0;"><b>${p.cargo || "Sem cargo"}</b></p><p style="margin:0; font-size:14px;">${p.email || "Sem e-mail"} • ${p.telefone || "Sem telefone"}</p></div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <button class="btn btn-primary" onclick="mudarPagina('perfilUsuario','${u.usuario}')">Ver Perfil</button>
                    <button class="btn btn-secondary" onclick="mudarPagina('chatConversa','${u.usuario}')">Chat</button>
                </div>
            </div>
        `;
    }).join("");
}

function filtrarDiretorioUsuarios() {
    const termo = document.getElementById("buscaDiretorio").value.toLowerCase();
    const filtrados = state.usuarios.filter(u => u.usuario.toLowerCase().includes(termo) || (u.perfilAvancado.cargo || "").toLowerCase().includes(termo) || (u.perfilAvancado.email || "").toLowerCase().includes(termo) || (u.perfilAvancado.telefone || "").toLowerCase().includes(termo));
    document.getElementById("listaDiretorio").innerHTML = renderListaDiretorio(filtrados);
}

function paginaPerfilUsuario(usuario) {
    garantirPerfisDiretorio();
    const u = state.usuarios.find(x => x.usuario === usuario);
    if (!u) { notificar("Usuário não encontrado.", "error"); mudarPagina("diretorioUsuarios"); return ""; }
    const p = u.perfilAvancado;
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Perfil de " + usuario)}
            <div class="card" style="display:flex; align-items:center;">${avatarUsuario(usuario, 70)}<div><h2>${usuario}</h2><p><b>Cargo:</b> ${p.cargo || "—"}</p><p><b>Email:</b> ${p.email || "—"}</p><p><b>Telefone:</b> ${p.telefone || "—"}</p></div></div>
            <div class="card"><h3>Informações</h3><p><b>Bio:</b> ${p.bio || "—"}</p><p><b>Observações:</b> ${p.observacoes || "—"}</p></div>
            <button class="btn btn-primary" onclick="mudarPagina('chatConversa','${usuario}')">Enviar Mensagem</button>
            <button class="btn btn-secondary" onclick="mudarPagina('diretorioUsuarios')">Voltar</button>
        </div>
    `;
}

// ---------------------------------------------------------
// CRIAÇÃO DE NOVOS USUÁRIOS (ADMIN/TAYLOR)
// ---------------------------------------------------------
function paginaNovoUsuario() {
    const perfisOptions = Object.keys(PERFIS).map(p => `<option value="${p}">${p}</option>`).join('');
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Criar Novo Usuário")}
            <div class="card">
                <label>Nome de usuário:</label><input id="novoUsuarioNome">
                <label>Senha:</label><input id="novoUsuarioSenha" type="password">
                <label>Perfil:</label><select id="novoUsuarioPerfil">${perfisOptions}</select>
                <button class="btn btn-primary" onclick="salvarNovoUsuario()">Criar</button>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('diretorioUsuarios')">Voltar</button>
        </div>
    `;
}

function salvarNovoUsuario() {
    const nome = document.getElementById("novoUsuarioNome").value.trim();
    const senha = document.getElementById("novoUsuarioSenha").value.trim();
    const perfil = document.getElementById("novoUsuarioPerfil").value;
    if (!nome || !senha) { notificar("Preencha nome e senha.", "error"); return; }
    if (state.usuarios.some(u => u.usuario === nome)) { notificar("Usuário já existe.", "error"); return; }
    state.usuarios.push({
        usuario: nome,
        senha: senha,
        perfil: perfil,
        permissoes: { ...PERFIS[perfil] },
        perfilAvancado: { foto: "", bio: "", telefone: "", email: "", cargo: "", observacoes: "" }
    });
    salvarBackup();
    auditar("Criou usuário", nome);
    mudarPagina("diretorioUsuarios");
}

// ---------------------------------------------------------
// NOTIFICAÇÕES PERSISTENTES
// ---------------------------------------------------------
function garantirNotificacoes() { if (!state.notificacoes) state.notificacoes = []; }

function criarNotificacao(titulo, mensagem, link = null, usuario = null) {
    garantirNotificacoes();
    const alvo = usuario || state.usuarioLogado?.usuario;
    if (!alvo) return;
    state.notificacoes.push({ id: Date.now(), usuario: alvo, titulo, mensagem, data: new Date().toLocaleString(), lida: false, link });
    salvarBackup();
}

const notificarOriginal = notificar;
notificar = function (msg, tipo = "info") {
    notificarOriginal(msg, tipo);
    criarNotificacao("Notificação", msg);
};

function paginaNotificacoes() {
    garantirNotificacoes();
    const u = state.usuarioLogado.usuario;
    const minhas = state.notificacoes.filter(n => n.usuario === u).sort((a,b)=>b.id - a.id);
    const html = minhas.map(n => `
        <div class="card" style="border-left:6px solid ${n.lida ? 'var(--card2)' : 'var(--primaria)'};">
            <h3>${n.titulo}</h3><p>${n.mensagem}</p><small>${n.data}</small><br><br>
            ${n.link ? `<button class="btn btn-primary" onclick="abrirNotificacao(${n.id})">Abrir</button>` : ""}
            <button class="btn btn-secondary" onclick="marcarNotificacaoLida(${n.id})">${n.lida ? "Marcar como não lida" : "Marcar como lida"}</button>
        </div>
    `).join("");
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Notificações")}
            <div class="card"><button class="btn btn-danger" onclick="limparNotificacoes()">Limpar todas</button></div>
            ${html || "<p>Nenhuma notificação.</p>"}
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function marcarNotificacaoLida(id) {
    const n = state.notificacoes.find(x => x.id == id);
    if (!n) return;
    n.lida = !n.lida;
    salvarBackup();
    render();
}

function abrirNotificacao(id) {
    const n = state.notificacoes.find(x => x.id == id);
    if (!n || !n.link) return;
    n.lida = true;
    salvarBackup();
    mudarPagina(n.link.pagina, n.link.param);
}

function limparNotificacoes() {
    const u = state.usuarioLogado.usuario;
    state.notificacoes = state.notificacoes.filter(n => n.usuario !== u);
    salvarBackup();
    render();
}

function contarNotificacoesNaoLidas() {
    const u = state.usuarioLogado?.usuario;
    if (!u) return 0;
    return state.notificacoes.filter(n => n.usuario === u && !n.lida).length;
}

function atualizarBotaoNotificacoesMenu() {
    const menu = document.getElementById("menuLateral");
    if (!menu) return;
    const qtd = contarNotificacoesNaoLidas();
    const botao = menu.querySelector("button[onclick=\"mudarPagina('notificacoes')\"]");
    if (!botao) return;
    botao.innerHTML = qtd > 0 ? `🔔 Notificações (${qtd})` : `🔔 Notificações`;
}

// ---------------------------------------------------------
// LOGS TÉCNICOS
// ---------------------------------------------------------
function garantirLogsTecnicos() { if (!state.logsTecnicos) state.logsTecnicos = []; }

function registrarLog(tipo, mensagem, detalhe = "") {
    garantirLogsTecnicos();
    state.logsTecnicos.push({ id: Date.now(), tipo, mensagem, detalhe, data: new Date().toLocaleString() });
    salvarBackup();
}

window.onerror = function (msg, url, linha, coluna, erro) { registrarLog("erro", msg, `${url} [${linha}:${coluna}]`); };

function paginaLogsTecnicos() {
    garantirLogsTecnicos();
    const lista = [...state.logsTecnicos].sort((a,b)=>b.id - a.id);
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Logs Técnicos")}
            <div class="card">
                <label>Filtrar por tipo:</label>
                <select id="filtroLogs" onchange="filtrarLogsTecnicos()"><option value="">Todos</option><option value="erro">Erros</option><option value="aviso">Avisos</option><option value="info">Informações</option></select>
                <button class="btn btn-danger" onclick="limparLogsTecnicos()">Limpar tudo</button>
            </div>
            <div id="listaLogsTecnicos">${renderListaLogs(lista)}</div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function renderListaLogs(lista) {
    if (!lista || lista.length === 0) return "<p>Nenhum log registrado.</p>";
    return lista.map(l => `<div class="card" style="border-left:6px solid ${corLog(l.tipo)};"><b>[${l.tipo.toUpperCase()}]</b> — ${l.data}<br><p>${l.mensagem}</p>${l.detalhe ? `<small>${l.detalhe}</small>` : ""}</div>`).join("");
}

function corLog(tipo) { return { erro: "#e74c3c", aviso: "#f1c40f", info: "#3498db" }[tipo] || "var(--primaria)"; }

function filtrarLogsTecnicos() {
    const filtro = document.getElementById("filtroLogs").value;
    const lista = filtro ? state.logsTecnicos.filter(l => l.tipo === filtro) : state.logsTecnicos;
    document.getElementById("listaLogsTecnicos").innerHTML = renderListaLogs(lista.sort((a,b)=>b.id - a.id));
}

function limparLogsTecnicos() {
    state.logsTecnicos = [];
    salvarBackup();
    render();
}

// ---------------------------------------------------------
// DASHBOARD ANALÍTICO
// ---------------------------------------------------------
function indicadoresDashboard() {
    return {
        totalUsuarios: state.usuarios.length,
        totalRotas: state.rotas.length,
        totalTarefas: state.tarefas.length,
        totalArquivos: state.drive.arquivos.length,
        totalEventos: state.calendario.eventos.length
    };
}

function graficoBarras(label, valor, max) {
    const largura = max > 0 ? (valor / max) * 100 : 0;
    return `<div style="margin-bottom:10px;"><b>${label}: ${valor}</b><div style="background:#ddd; height:12px; border-radius:6px; overflow:hidden;"><div style="width:${largura}%; height:100%; background:var(--primaria);"></div></div></div>`;
}

function paginaDashboardAnalitico() {
    const ind = indicadoresDashboard();
    const max = Math.max(ind.totalUsuarios, ind.totalRotas, ind.totalTarefas, ind.totalArquivos, ind.totalEventos, 1);
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Dashboard Analítico")}
            <div class="card"><h3>Indicadores Gerais</h3>${graficoBarras("Usuários", ind.totalUsuarios, max)}${graficoBarras("Rotas", ind.totalRotas, max)}${graficoBarras("Tarefas", ind.totalTarefas, max)}${graficoBarras("Arquivos no Drive", ind.totalArquivos, max)}${graficoBarras("Eventos no Calendário", ind.totalEventos, max)}</div>
            <div class="card"><h3>Resumo Rápido</h3><p><b>Usuários:</b> ${ind.totalUsuarios}</p><p><b>Rotas:</b> ${ind.totalRotas}</p><p><b>Tarefas:</b> ${ind.totalTarefas}</p><p><b>Arquivos:</b> ${ind.totalArquivos}</p><p><b>Eventos:</b> ${ind.totalEventos}</p></div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

// ---------------------------------------------------------
// AUDITORIA
// ---------------------------------------------------------
function garantirAuditoria() { if (!state.auditoria) state.auditoria = []; }

function paginaAuditoria() {
    garantirAuditoria();
    const lista = [...state.auditoria].sort((a,b)=>b.id - a.id);
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Auditoria do Sistema")}
            <div class="card">
                <label>Filtrar por tipo:</label>
                <select id="filtroAuditoria" onchange="filtrarAuditoria()"><option value="">Todos</option><option value="acao">Ações</option><option value="login">Logins</option><option value="logout">Logouts</option></select>
                <button class="btn btn-primary" onclick="exportarAuditoria()">Exportar JSON</button>
                <button class="btn btn-danger" onclick="limparAuditoria()">Limpar tudo</button>
            </div>
            <div id="listaAuditoria">${renderListaAuditoria(lista)}</div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function renderListaAuditoria(lista) {
    if (!lista || lista.length === 0) return "<p>Nenhum registro encontrado.</p>";
    return lista.map(a => `<div class="card" style="border-left:6px solid ${corAuditoria(a.tipo)};"><b>${a.acao}</b><br><small>${a.data}</small><br><small>Usuário: ${a.usuario}</small><br><br><button class="btn btn-secondary" onclick="mudarPagina('auditoriaDetalhe',${a.id})">Detalhes</button></div>`).join("");
}

function corAuditoria(tipo) { return { acao: "#3498db", login: "#2ecc71", logout: "#e67e22" }[tipo] || "var(--primaria)"; }

function filtrarAuditoria() {
    const filtro = document.getElementById("filtroAuditoria").value;
    const lista = filtro ? state.auditoria.filter(a => a.tipo === filtro) : state.auditoria;
    document.getElementById("listaAuditoria").innerHTML = renderListaAuditoria(lista.sort((a,b)=>b.id - a.id));
}

function paginaAuditoriaDetalhe(id) {
    garantirAuditoria();
    const a = state.auditoria.find(x => x.id == id);
    if (!a) { notificar("Registro não encontrado.", "error"); mudarPagina("auditoria"); return ""; }
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Detalhes da Auditoria")}
            <div class="card"><p><b>Ação:</b> ${a.acao}</p><p><b>Usuário:</b> ${a.usuario}</p><p><b>Data:</b> ${a.data}</p><p><b>Tipo:</b> ${a.tipo}</p><p><b>Detalhe:</b><br>${a.detalhe || "—"}</p></div>
            <button class="btn btn-secondary" onclick="mudarPagina('auditoria')">Voltar</button>
        </div>
    `;
}

function exportarAuditoria() {
    garantirAuditoria();
    const blob = new Blob([JSON.stringify(state.auditoria, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "auditoria.json";
    a.click();
    URL.revokeObjectURL(url);
}

function limparAuditoria() {
    state.auditoria = [];
    salvarBackup();
    render();
}

// ---------------------------------------------------------
// CONFIGURAÇÕES
// ---------------------------------------------------------
function garantirConfiguracoes() {
    if (!state.config) state.config = { tema: state.tema || "claro", notificacoesAtivas: true, logsAtivos: true };
}

function paginaConfiguracoes() {
    garantirConfiguracoes();
    const c = state.config;
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Configurações do Sistema")}
            <div class="card"><h3>Tema</h3><select id="cfgTema"><option value="claro" ${c.tema === "claro" ? "selected" : ""}>Claro</option><option value="escuro" ${c.tema === "escuro" ? "selected" : ""}>Escuro</option></select></div>
            <div class="card"><h3>Notificações</h3><select id="cfgNotif"><option value="true" ${c.notificacoesAtivas ? "selected" : ""}>Ativadas</option><option value="false" ${!c.notificacoesAtivas ? "selected" : ""}>Desativadas</option></select></div>
            <div class="card"><h3>Logs Técnicos</h3><select id="cfgLogs"><option value="true" ${c.logsAtivos ? "selected" : ""}>Ativados</option><option value="false" ${!c.logsAtivos ? "selected" : ""}>Desativados</option></select></div>
            <div class="card"><h3>Reset Parcial</h3><button class="btn btn-danger" onclick="resetParcial()">Limpar dados temporários</button></div>
            <button class="btn btn-primary" onclick="salvarConfiguracoes()">Salvar</button>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function salvarConfiguracoes() {
    garantirConfiguracoes();
    state.config.tema = document.getElementById("cfgTema").value;
    state.config.notificacoesAtivas = document.getElementById("cfgNotif").value === "true";
    state.config.logsAtivos = document.getElementById("cfgLogs").value === "true";
    state.tema = state.config.tema;
    aplicarTema();
    salvarBackup();
    auditar("Alterou configurações", "Configurações atualizadas");
    mudarPagina("home");
}

function resetParcial() {
    state.notificacoes = [];
    state.logsTecnicos = [];
    salvarBackup();
    render();
}

// ---------------------------------------------------------
// NAVEGAÇÃO INTELIGENTE
// ---------------------------------------------------------
function garantirHistorico() { if (!state.historicoNavegacao) state.historicoNavegacao = []; }

function registrarNavegacao(pagina, param = null) {
    garantirHistorico();
    state.historicoNavegacao.push({ id: Date.now(), pagina, param, data: new Date().toLocaleString() });
    if (state.historicoNavegacao.length > 200) state.historicoNavegacao.shift();
    salvarBackup();
}

function voltarPagina() {
    garantirHistorico();
    if (state.historicoNavegacao.length < 2) { mudarPagina("home"); return; }
    state.historicoNavegacao.pop();
    const ultima = state.historicoNavegacao[state.historicoNavegacao.length - 1];
    mudarPagina(ultima.pagina, ultima.param);
}

function iconePagina(p) { return { home: "🏠", chat: "💬", chatConversa: "💬", calendario: "📅", tarefas: "📝", drive: "📂", diretorioUsuarios: "👥", meuPerfil: "👤", favoritos: "⭐", auditoria: "📜", logsTecnicos: "🛠️", dashboardAnalitico: "📊", configuracoes: "⚙️", rotas: "🚌", rotaDetalhe: "🚌" }[p] || "➡️"; }
function nomePagina(p) { return { home: "Início", chat: "Chat", chatConversa: "Conversa", calendario: "Calendário", tarefas: "Tarefas", drive: "Drive", diretorioUsuarios: "Diretório", meuPerfil: "Meu Perfil", favoritos: "Favoritos", auditoria: "Auditoria", logsTecnicos: "Logs", dashboardAnalitico: "Dashboard", configuracoes: "Configurações", rotas: "Rotas", rotaDetalhe: "Rota" }[p] || p; }

function sugestoesNavegacao() {
    garantirHistorico();
    const ultimas = [...state.historicoNavegacao].slice(-5).reverse();
    return ultimas.map(h => `<button class="btn btn-secondary" onclick="mudarPagina('${h.pagina}','${h.param || ""}')">${iconePagina(h.pagina)} ${nomePagina(h.pagina)}</button>`).join("");
}

// ---------------------------------------------------------
// PERMISSÕES
// ---------------------------------------------------------
function garantirPermissoes() {
    state.usuarios.forEach(u => { if (!u.permissoes) u.permissoes = { rotas: true, chat: true, calendario: true, tarefas: true, drive: true, perfis: true, notificacoes: true, logs: false, dashboard: true, auditoria: false, configuracoes: false }; });
}

function temPermissao(modulo) {
    if (!state.usuarioLogado) return false;
    garantirPermissoes();
    return !!state.usuarioLogado.permissoes[modulo];
}

function isAssociado() { return state.usuarioLogado?.perfil === "associado"; }

function bloquearAcesso() {
    return `<div class="container">${UI.logo()}${UI.titulo("Acesso Negado")}<div class="card"><p>Você não tem permissão para acessar esta área.</p></div><button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button></div>`;
}

function paginaGerenciarPermissoes() {
    garantirPermissoes();
    const lista = state.usuarios;
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Gerenciar Permissões")}
            ${lista.map(u => `<div class="card"><h3>${u.usuario}</h3>${renderPermissoesUsuario(u)}<button class="btn btn-primary" onclick="salvarPermissoesUsuario('${u.usuario}')">Salvar</button></div>`).join("")}
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function renderPermissoesUsuario(u) {
    const p = u.permissoes;
    return `${renderTogglePerm("Rotas", "rotas", p.rotas)}${renderTogglePerm("Chat", "chat", p.chat)}${renderTogglePerm("Calendário", "calendario", p.calendario)}${renderTogglePerm("Tarefas", "tarefas", p.tarefas)}${renderTogglePerm("Drive", "drive", p.drive)}${renderTogglePerm("Perfis", "perfis", p.perfis)}${renderTogglePerm("Notificações", "notificacoes", p.notificacoes)}${renderTogglePerm("Logs Técnicos", "logs", p.logs)}${renderTogglePerm("Dashboard", "dashboard", p.dashboard)}${renderTogglePerm("Auditoria", "auditoria", p.auditoria)}${renderTogglePerm("Configurações", "configuracoes", p.configuracoes)}`;
}

function renderTogglePerm(label, campo, valor) { return `<label style="display:flex; align-items:center; gap:10px; margin:5px 0;"><input type="checkbox" id="perm_${campo}_${label}" ${valor ? "checked" : ""}> ${label}</label>`; }

function salvarPermissoesUsuario(usuario) {
    const u = state.usuarios.find(x => x.usuario === usuario);
    if (!u) return;
    const campos = ["rotas","chat","calendario","tarefas","drive","perfis","notificacoes","logs","dashboard","auditoria","configuracoes"];
    campos.forEach(c => { const el = document.querySelector(`#perm_${c}_${c.charAt(0).toUpperCase()+c.slice(1)}`); if (el) u.permissoes[c] = el.checked; });
    salvarBackup();
    auditar("Alterou permissões", usuario);
    render();
}

// ---------------------------------------------------------
// RELATÓRIOS
// ---------------------------------------------------------
function paginaRelatorios() {
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Relatórios")}
            <div class="card">
                <h3>Gerar Relatório</h3>
                <label>Tipo de relatório:</label>
                <select id="relatorioTipo">
                    <option value="usuarios">Usuários</option><option value="rotas">Rotas</option><option value="tarefas">Tarefas</option>
                    <option value="eventos">Eventos</option><option value="arquivos">Arquivos do Drive</option><option value="auditoria">Auditoria</option>
                </select>
                <button class="btn btn-primary" onclick="gerarRelatorio()">Gerar</button>
            </div>
            <div id="relatorioResultado"></div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function gerarRelatorio() {
    const tipo = document.getElementById("relatorioTipo").value;
    let html = "";
    if (tipo === "usuarios") html = relatorioUsuarios();
    if (tipo === "rotas") html = relatorioRotas();
    if (tipo === "tarefas") html = relatorioTarefas();
    if (tipo === "eventos") html = relatorioEventos();
    if (tipo === "arquivos") html = relatorioArquivos();
    if (tipo === "auditoria") html = relatorioAuditoria();
    document.getElementById("relatorioResultado").innerHTML = `<div class="card">${html}<button class="btn btn-primary" onclick="exportarRelatorio('${tipo}')">Exportar JSON</button></div>`;
}

function relatorioUsuarios() { return `<h3>Relatório de Usuários</h3><p>Total: ${state.usuarios.length}</p><ul>${state.usuarios.map(u => `<li>${u.usuario} — ${u.perfilAvancado?.cargo || "Sem cargo"}</li>`).join("")}</ul>`; }
function relatorioRotas() { return `<h3>Relatório de Rotas</h3><p>Total: ${state.rotas.length}</p><ul>${state.rotas.map(r => `<li>${r.nome} — ${r.veiculos?.length || 0} veículos</li>`).join("")}</ul>`; }
function relatorioTarefas() { return `<h3>Relatório de Tarefas</h3><p>Total: ${state.tarefas.length}</p><ul>${state.tarefas.map(t => `<li>${t.titulo} — ${t.status}</li>`).join("")}</ul>`; }
function relatorioEventos() { return `<h3>Relatório de Eventos</h3><p>Total: ${state.calendario.eventos.length}</p><ul>${state.calendario.eventos.map(e => `<li>${e.titulo} — ${e.data}</li>`).join("")}</ul>`; }
function relatorioArquivos() { return `<h3>Relatório de Arquivos</h3><p>Total: ${state.drive.arquivos.length}</p><ul>${state.drive.arquivos.map(a => `<li>${a.nome} — ${a.tamanho} KB</li>`).join("")}</ul>`; }
function relatorioAuditoria() { return `<h3>Relatório de Auditoria</h3><p>Total: ${state.auditoria.length}</p><ul>${state.auditoria.map(a => `<li>${a.acao} — ${a.usuario} — ${a.data}</li>`).join("")}</ul>`; }

function exportarRelatorio(tipo) {
    let dados = {};
    if (tipo === "usuarios") dados = state.usuarios;
    if (tipo === "rotas") dados = state.rotas;
    if (tipo === "tarefas") dados = state.tarefas;
    if (tipo === "eventos") dados = state.calendario.eventos;
    if (tipo === "arquivos") dados = state.drive.arquivos;
    if (tipo === "auditoria") dados = state.auditoria;
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_${tipo}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ---------------------------------------------------------
// SUPORTE (TICKETS)
// ---------------------------------------------------------
function garantirTickets() { if (!state.tickets) state.tickets = []; }

function corTicket(status) { return { aberto: "#e67e22", andamento: "#3498db", resolvido: "#2ecc71", fechado: "#7f8c8d" }[status] || "var(--primaria)"; }

function paginaTickets() {
    garantirTickets();
    const lista = [...state.tickets].sort((a,b)=>b.id - a.id);
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Suporte Interno")}
            <button class="btn btn-primary" onclick="mudarPagina('novoTicket')">Novo Ticket</button>
            <div class="card">${lista.map(t => `<div class="card" style="border-left:6px solid ${corTicket(t.status)};"><b>${t.titulo}</b><br><small>Status: ${t.status}</small><br><small>Aberto por: ${t.usuario}</small><br><button class="btn btn-secondary" onclick="mudarPagina('ticketDetalhe',${t.id})">Abrir</button></div>`).join("")}</div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function paginaNovoTicket() {
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Novo Ticket")}
            <div class="card">
                <label>Título:</label><input id="ticketTitulo">
                <label>Descrição:</label><textarea id="ticketDescricao"></textarea>
                <button class="btn btn-primary" onclick="salvarNovoTicket()">Enviar</button>
            </div>
            <button class="btn btn-secondary" onclick="mudarPagina('tickets')">Voltar</button>
        </div>
    `;
}

function salvarNovoTicket() {
    garantirTickets();
    const titulo = document.getElementById("ticketTitulo").value.trim();
    const descricao = document.getElementById("ticketDescricao").value.trim();
    if (!titulo) { notificar("Informe o título.", "error"); return; }
    state.tickets.push({ id: Date.now(), titulo, descricao, usuario: state.usuarioLogado.usuario, status: "aberto", respostas: [], data: new Date().toLocaleString() });
    salvarBackup();
    auditar("Criou ticket", titulo);
    mudarPagina("tickets");
}

function paginaTicketDetalhe(id) {
    garantirTickets();
    const t = state.tickets.find(x => x.id == id);
    if (!t) { notificar("Ticket não encontrado.", "error"); mudarPagina("tickets"); return ""; }
    const respostas = t.respostas.map(r => `<div class="card" style="margin-top:10px;"><b>${r.usuario}</b><br>${r.texto}<br><small>${r.data}</small></div>`).join("");
    const isAssoc = isAssociado();
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Ticket")}
            <div class="card"><h3>${t.titulo}</h3><p>${t.descricao}</p><p><b>Status:</b> ${t.status}</p><p><b>Aberto por:</b> ${t.usuario}</p></div>
            <div class="card"><h3>Respostas</h3>${respostas || "<p>Nenhuma resposta ainda.</p>"}<textarea id="ticketResposta" placeholder="Responder..." style="width:100%; height:80px;"></textarea><button class="btn btn-primary" onclick="responderTicket(${id})">Enviar Resposta</button></div>
            <div class="card"><h3>Status</h3><select id="ticketStatus"><option value="aberto" ${t.status==="aberto"?"selected":""}>Aberto</option><option value="andamento" ${t.status==="andamento"?"selected":""}>Em andamento</option><option value="resolvido" ${t.status==="resolvido"?"selected":""}>Resolvido</option><option value="fechado" ${t.status==="fechado"?"selected":""}>Fechado</option></select><button class="btn btn-secondary" onclick="alterarStatusTicket(${id})">Salvar Status</button></div>
            <button class="btn btn-secondary" onclick="mudarPagina('tickets')">Voltar</button>
        </div>
    `;
}

function responderTicket(id) {
    const t = state.tickets.find(x => x.id == id);
    if (!t) return;
    const texto = document.getElementById("ticketResposta").value.trim();
    if (!texto) return;
    t.respostas.push({ usuario: state.usuarioLogado.usuario, texto, data: new Date().toLocaleString() });
    salvarBackup();
    auditar("Respondeu ticket", t.titulo);
    mudarPagina("ticketDetalhe", id);
}

function alterarStatusTicket(id) {
    const t = state.tickets.find(x => x.id == id);
    if (!t) return;
    t.status = document.getElementById("ticketStatus").value;
    salvarBackup();
    auditar("Alterou status do ticket", t.titulo);
    mudarPagina("ticketDetalhe", id);
}

// ---------------------------------------------------------
// AVISOS GLOBAIS
// ---------------------------------------------------------
function garantirAvisosGlobais() { if (!state.avisosGlobais) state.avisosGlobais = []; }

function inserirBannerAvisos() {
    garantirAvisosGlobais();
    const container = document.getElementById("bannerAvisos");
    if (!container) return;
    const ativos = state.avisosGlobais.filter(a => a.ativo);
    if (ativos.length === 0) { container.innerHTML = ""; return; }
    const a = ativos[0];
    container.innerHTML = `<div style="background:#f1c40f; padding:10px; text-align:center; font-weight:bold; border-bottom:3px solid #d4ac0d;">${a.texto}<button onclick="fecharAviso(${a.id})" style="margin-left:10px; background:none; border:none; font-size:18px; cursor:pointer;">✖</button></div>`;
}

function fecharAviso(id) {
    const a = state.avisosGlobais.find(x => x.id == id);
    if (!a) return;
    a.ativo = false;
    salvarBackup();
    inserirBannerAvisos();
}

function paginaGerenciarAvisos() {
    garantirAvisosGlobais();
    const lista = [...state.avisosGlobais].sort((a,b)=>b.id - a.id);
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Avisos Globais")}
            <div class="card"><label>Novo aviso:</label><textarea id="novoAvisoTexto" placeholder="Digite o aviso..." style="width:100%; height:80px;"></textarea><button class="btn btn-primary" onclick="criarAvisoGlobal()">Criar Aviso</button></div>
            <div class="card"><h3>Avisos Criados</h3>${lista.map(a => `<div class="card" style="border-left:6px solid ${a.ativo ? '#f1c40f' : '#7f8c8d'};"><p>${a.texto}</p><small>${a.data}</small><br><button class="btn btn-secondary" onclick="alternarAviso(${a.id})">${a.ativo ? "Desativar" : "Ativar"}</button><button class="btn btn-danger" onclick="excluirAviso(${a.id})">Excluir</button></div>`).join("")}</div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function criarAvisoGlobal() {
    garantirAvisosGlobais();
    const texto = document.getElementById("novoAvisoTexto").value.trim();
    if (!texto) { notificar("Digite um aviso.", "error"); return; }
    state.avisosGlobais.push({ id: Date.now(), texto, ativo: true, data: new Date().toLocaleString() });
    salvarBackup();
    auditar("Criou aviso global", texto);
    mudarPagina("gerenciarAvisos");
}

function alternarAviso(id) {
    const a = state.avisosGlobais.find(x => x.id == id);
    if (!a) return;
    a.ativo = !a.ativo;
    salvarBackup();
    inserirBannerAvisos();
    render();
}

function excluirAviso(id) {
    state.avisosGlobais = state.avisosGlobais.filter(x => x.id != id);
    salvarBackup();
    inserirBannerAvisos();
    render();
}

// ---------------------------------------------------------
// CHANGELOG
// ---------------------------------------------------------
function garantirChangelog() {
    if (!state.changelog) state.changelog = [{ id: Date.now(), versao: "1.0.0", titulo: "Sistema iniciado", descricao: "Primeira versão do sistema registrada automaticamente.", data: new Date().toLocaleString() }];
}

function registrarAtualizacao(versao, titulo, descricao) {
    garantirChangelog();
    state.changelog.push({ id: Date.now(), versao, titulo, descricao, data: new Date().toLocaleString() });
    salvarBackup();
}

function paginaChangelog() {
    garantirChangelog();
    const lista = [...state.changelog].sort((a,b)=>b.id - a.id);
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Changelog do Sistema")}
            <div class="card"><label>Versão:</label><input id="chgVersao" placeholder="Ex: 1.2.0"><label>Título:</label><input id="chgTitulo"><label>Descrição:</label><textarea id="chgDescricao" style="height:80px;"></textarea><button class="btn btn-primary" onclick="salvarChangelog()">Registrar Atualização</button></div>
            <div class="card"><h3>Histórico de Atualizações</h3>${lista.map(c => `<div class="card" style="border-left:6px solid var(--primaria);"><b>Versão ${c.versao}</b><br><p>${c.titulo}</p><small>${c.descricao}</small><br><small>${c.data}</small></div>`).join("")}</div>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}

function salvarChangelog() {
    const versao = document.getElementById("chgVersao").value.trim();
    const titulo = document.getElementById("chgTitulo").value.trim();
    const descricao = document.getElementById("chgDescricao").value.trim();
    if (!versao || !titulo) { notificar("Preencha versão e título.", "error"); return; }
    registrarAtualizacao(versao, titulo, descricao);
    auditar("Registrou atualização", versao);
    mudarPagina("changelog");
}

// ---------------------------------------------------------
// RENDER PRINCIPAL (COM CONTROLE DE ACESSO)
// ---------------------------------------------------------
function render(param1, param2) {
    aplicarTema();

    // Se não estiver logado e não for página de login, redireciona
    if (!state.usuarioLogado && state.paginaAtual !== "login") {
        state.paginaAtual = "login";
    }

    // Bloqueio de páginas de criação/edição para associados
    const paginasRestritas = ["novaRota", "novoVeiculo", "novoAluno", "novaTarefa", "novoEvento", "novoTicket", "editarPerfil", "gerenciarPermissoes", "novoUsuario", "gerenciarAvisos", "changelog"];
    if (isAssociado() && paginasRestritas.includes(state.paginaAtual)) {
        renderSeguro(bloquearAcesso());
        return;
    }

    // Controle de permissões baseado em módulos
    const mapaPerm = {
        rotas: "rotas", rotaDetalhe: "rotas", novoVeiculo: "rotas", novoAluno: "rotas", novaRota: "rotas",
        chat: "chat", chatConversa: "chat",
        calendario: "calendario", novoEvento: "calendario", eventoDetalhe: "calendario",
        tarefas: "tarefas", novaTarefa: "tarefas", tarefaDetalhe: "tarefas",
        drive: "drive",
        diretorioUsuarios: "perfis", perfilUsuario: "perfis",
        notificacoes: "notificacoes",
        logsTecnicos: "logs",
        dashboardAnalitico: "dashboard",
        auditoria: "auditoria", auditoriaDetalhe: "auditoria",
        configuracoes: "configuracoes",
        relatorios: "relatorios",
        grupos: "chat", novoGrupo: "chat", grupoChat: "chat",
        tickets: "chat", novoTicket: "chat", ticketDetalhe: "chat"
    };

    if (mapaPerm[state.paginaAtual] && !temPermissao(mapaPerm[state.paginaAtual])) {
        renderSeguro(bloquearAcesso());
        return;
    }

    // Páginas exclusivas para admin/taylor
    if ((state.paginaAtual === "gerenciarPermissoes" || state.paginaAtual === "gerenciarAvisos" || state.paginaAtual === "changelog") && state.usuarioLogado?.perfil !== "admin" && state.usuarioLogado?.perfil !== "taylor") {
        renderSeguro(bloquearAcesso());
        return;
    }

    // Renderização de cada página
    if (state.paginaAtual === "login") { renderSeguro(paginaLogin()); return; }
    if (state.paginaAtual === "home") { renderSeguro(paginaHome()); return; }
    if (state.paginaAtual === "backup") { renderSeguro(paginaBackup()); return; }
    if (state.paginaAtual === "rotas") { renderSeguro(paginaRotas()); return; }
    if (state.paginaAtual === "novaRota") { renderSeguro(paginaNovaRota()); return; }
    if (state.paginaAtual === "rotaDetalhe") { renderSeguro(paginaRotaDetalhe(param1)); return; }
    if (state.paginaAtual === "novoVeiculo") { renderSeguro(paginaNovoVeiculo(param1)); return; }
    if (state.paginaAtual === "novoAluno") { renderSeguro(paginaNovoAluno(param1)); return; }
    if (state.paginaAtual === "chat") { renderSeguro(paginaChat()); return; }
    if (state.paginaAtual === "chatConversa") { renderSeguro(paginaChatConversa(param1)); return; }
    if (state.paginaAtual === "grupos") { renderSeguro(paginaGrupos()); return; }
    if (state.paginaAtual === "novoGrupo") { renderSeguro(paginaNovoGrupo()); return; }
    if (state.paginaAtual === "grupoChat") { renderSeguro(paginaGrupoChat(param1)); return; }
    if (state.paginaAtual === "calendario") { renderSeguro(paginaCalendario()); return; }
    if (state.paginaAtual === "novoEvento") { renderSeguro(paginaNovoEvento()); return; }
    if (state.paginaAtual === "eventoDetalhe") { renderSeguro(paginaEventoDetalhe(param1)); return; }
    if (state.paginaAtual === "tarefas") { renderSeguro(paginaTarefas()); return; }
    if (state.paginaAtual === "novaTarefa") { renderSeguro(paginaNovaTarefa()); return; }
    if (state.paginaAtual === "tarefaDetalhe") { renderSeguro(paginaTarefaDetalhe(param1)); return; }
    if (state.paginaAtual === "drive") { renderSeguro(paginaDrive()); return; }
    if (state.paginaAtual === "meuPerfil") { renderSeguro(paginaMeuPerfil()); return; }
    if (state.paginaAtual === "editarPerfil") { renderSeguro(paginaEditarPerfil()); return; }
    if (state.paginaAtual === "diretorioUsuarios") { renderSeguro(paginaDiretorioUsuarios()); return; }
    if (state.paginaAtual === "perfilUsuario") { renderSeguro(paginaPerfilUsuario(param1)); return; }
    if (state.paginaAtual === "novoUsuario") { renderSeguro(paginaNovoUsuario()); return; }
    if (state.paginaAtual === "notificacoes") { renderSeguro(paginaNotificacoes()); return; }
    if (state.paginaAtual === "logsTecnicos") { renderSeguro(paginaLogsTecnicos()); return; }
    if (state.paginaAtual === "dashboardAnalitico") { renderSeguro(paginaDashboardAnalitico()); return; }
    if (state.paginaAtual === "favoritos") { renderSeguro(paginaFavoritos()); return; }
    if (state.paginaAtual === "auditoria") { renderSeguro(paginaAuditoria()); return; }
    if (state.paginaAtual === "auditoriaDetalhe") { renderSeguro(paginaAuditoriaDetalhe(param1)); return; }
    if (state.paginaAtual === "configuracoes") { renderSeguro(paginaConfiguracoes()); return; }
    if (state.paginaAtual === "relatorios") { renderSeguro(paginaRelatorios()); return; }
    if (state.paginaAtual === "tickets") { renderSeguro(paginaTickets()); return; }
    if (state.paginaAtual === "novoTicket") { renderSeguro(paginaNovoTicket()); return; }
    if (state.paginaAtual === "ticketDetalhe") { renderSeguro(paginaTicketDetalhe(param1)); return; }
    if (state.paginaAtual === "gerenciarAvisos") { renderSeguro(paginaGerenciarAvisos()); return; }
    if (state.paginaAtual === "changelog") { renderSeguro(paginaChangelog()); return; }
    if (state.paginaAtual === "gerenciarPermissoes") { renderSeguro(paginaGerenciarPermissoes()); return; }

    // Fallback
    renderSeguro(paginaHome());
}

// ---------------------------------------------------------
// INICIALIZAÇÃO
// ---------------------------------------------------------
window.addEventListener("load", () => {
    carregarBackup();
    aplicarTema();
    render();
    inserirBannerAvisos();
});
