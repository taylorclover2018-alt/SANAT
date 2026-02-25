// ==================== app.js - PARTE 1 ====================
// Estado global
const state = {
    paginaAtual: 'login',
    usuarioLogado: null,
    usuarios: [
        { usuario: 'admin', senha: '0000', perfil: 'admin' },
        { usuario: 'taylor', senha: '1296', perfil: 'taylor' },
        { usuario: 'operador', senha: '4321', perfil: 'operador' },
        { usuario: 'visitante', senha: '1234', perfil: 'visitante' }
    ],
    rotas: [],
    tema: 'claro',
    historicoCalculos: [],
    calculoAtual: null,
    rotaEmEdicao: null
};

// Função de notificação
function notificar(msg, tipo = 'info') {
    const toastArea = document.getElementById('toastArea');
    if (!toastArea) {
        console.warn('ToastArea não encontrada');
        return;
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = msg;
    toastArea.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Tema
function aplicarTema() {
    const root = document.documentElement;
    if (state.tema === 'escuro') {
        root.style.setProperty('--bg', '#121212');
        root.style.setProperty('--card', '#1e1e1e');
        root.style.setProperty('--card2', '#2d2d2d');
        root.style.setProperty('--texto', '#eee');
        root.style.setProperty('--border', '#444');
    } else {
        root.style.setProperty('--bg', '#f5f5f5');
        root.style.setProperty('--card', '#ffffff');
        root.style.setProperty('--card2', '#f0f0f0');
        root.style.setProperty('--texto', '#333333');
        root.style.setProperty('--border', '#ddd');
    }
}

function alternarTema() {
    state.tema = state.tema === 'claro' ? 'escuro' : 'claro';
    aplicarTema();
    render();
}

// Backup
function salvarBackup() {
    const backup = {
        usuarios: state.usuarios,
        rotas: state.rotas,
        historicoCalculos: state.historicoCalculos
    };
    localStorage.setItem('assef_backup', JSON.stringify(backup));
    notificar('Backup salvo', 'success');
}

function carregarBackup() {
    const data = localStorage.getItem('assef_backup');
    if (data) {
        try {
            const backup = JSON.parse(data);
            state.usuarios = backup.usuarios || state.usuarios;
            state.rotas = backup.rotas || [];
            state.historicoCalculos = backup.historicoCalculos || [];
            notificar('Backup carregado', 'success');
        } catch (e) {
            notificar('Erro ao carregar backup', 'error');
        }
    }
    aplicarTema();
}

// Login
function fazerLogin() {
    const user = document.getElementById('login-user')?.value;
    const pass = document.getElementById('login-pass')?.value;
    const encontrado = state.usuarios.find(u => u.usuario === user && u.senha === pass);
    if (encontrado) {
        state.usuarioLogado = encontrado;
        notificar('Login bem-sucedido', 'success');
        render();
    } else {
        notificar('Usuário ou senha inválidos', 'error');
    }
}

function logout() {
    state.usuarioLogado = null;
    render();
}

// Navegação
function mudarPagina(pagina, params = {}) {
    state.paginaAtual = pagina;
    if (params.rotaId) state.rotaEmEdicao = params.rotaId;
    render();
}

// Renderização principal
function render() {
    const root = document.getElementById('root');
    if (!root) return;

    if (!state.usuarioLogado) {
        // Tela de login
        root.innerHTML = `
            <div style="max-width:320px;margin:60px auto;" class="card">
                <h2>ASSEUF Login</h2>
                <input type="text" id="login-user" placeholder="Usuário">
                <input type="password" id="login-pass" placeholder="Senha">
                <button onclick="fazerLogin()" style="width:100%;">Entrar</button>
            </div>
        `;
        return;
    }

    const usuario = state.usuarioLogado;
    // Layout principal
    root.innerHTML = `
        <div class="app-layout">
            <aside id="menuLateral">
                <div class="menu-usuario">
                    <div class="menu-usuario-nome">${usuario.usuario}</div>
                    <div class="menu-usuario-perfil">${usuario.perfil}</div>
                </div>
                <div class="menu-grupo">
                    <button class="menu-botao" onclick="mudarPagina('home')">Home</button>
                    <button class="menu-botao" onclick="mudarPagina('rotas')">Rotas</button>
                    <button class="menu-botao" onclick="mudarPagina('calculo')">Cálculo</button>
                    <button class="menu-botao" onclick="mudarPagina('historico')">Histórico</button>
                    <button class="menu-botao" onclick="mudarPagina('relatorio')">Relatório</button>
                    <button class="menu-botao" onclick="mudarPagina('backup')">Backup</button>
                    <button class="menu-botao" onclick="alternarTema()">Tema</button>
                    <button class="menu-botao menu-botao-principal" onclick="logout()">Logout</button>
                </div>
            </aside>
            <main class="conteudo-principal">
                <div class="container" id="main-content"></div>
            </main>
        </div>
    `;
    const main = document.getElementById('main-content');
    if (!main) return;
    // Roteamento simples
    switch (state.paginaAtual) {
        case 'home': main.innerHTML = paginaHome(); break;
        case 'rotas': main.innerHTML = paginaRotas(); break;
        case 'novaRota': main.innerHTML = paginaNovaRota(); break;
        case 'editarRota': main.innerHTML = paginaEditarRota(); break;
        case 'calculo': main.innerHTML = paginaCalculo(); break;
        case 'historico': main.innerHTML = paginaHistorico(); break;
        case 'relatorio': main.innerHTML = paginaRelatorio(); break;
        case 'backup': main.innerHTML = paginaBackup(); break;
        default: main.innerHTML = paginaHome();
    }
}

function paginaHome() {
    return `<h2>Home</h2><p>Bem-vindo ao sistema ASSEUF.</p>`;
}
