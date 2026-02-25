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
    calculoAtual: null
};

// Função de notificação
function notificar(msg, tipo = 'info') {
    const toastArea = document.getElementById('toastArea');
    if (!toastArea) return;
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
    } else {
        root.style.setProperty('--bg', '#f5f5f5');
        root.style.setProperty('--card', '#ffffff');
        root.style.setProperty('--card2', '#f0f0f0');
        root.style.setProperty('--texto', '#333333');
    }
}

function alternarTema() {
    state.tema = state.tema === 'claro' ? 'escuro' : 'claro';
    aplicarTema();
    render();
}

// Renderização principal
function render() {
    const root = document.getElementById('root');
    if (!root) return;

    if (!state.usuarioLogado) {
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

    // Menu simples
    root.innerHTML = `
        <div style="display:flex;">
            <aside style="width:200px;background:#111827;color:white;padding:20px;">
                <h3>ASSEUF</h3>
                <nav style="display:flex;flex-direction:column;gap:8px;">
                    <button class="menu-botao" onclick="mudarPagina('home')">Home</button>
                    <button class="menu-botao" onclick="mudarPagina('rotas')">Rotas</button>
                    <button class="menu-botao" onclick="mudarPagina('calculo')">Cálculo</button>
                    <button class="menu-botao" onclick="mudarPagina('historico')">Histórico</button>
                    <button class="menu-botao" onclick="mudarPagina('relatorio')">Relatório</button>
                    <button class="menu-botao" onclick="mudarPagina('backup')">Backup</button>
                    <button class="menu-botao" onclick="alternarTema()">Tema</button>
                    <button class="menu-botao" onclick="logout()">Logout</button>
                </nav>
            </aside>
            <main style="flex:1;padding:20px;" id="main-content"></main>
        </div>
    `;
    const main = document.getElementById('main-content');
    if (state.paginaAtual === 'home') main.innerHTML = '<h2>Home</h2><p>Bem-vindo!</p>';
    else if (state.paginaAtual === 'rotas') main.innerHTML = '<h2>Rotas</h2><p>Em breve...</p>';
    else if (state.paginaAtual === 'calculo') main.innerHTML = '<h2>Cálculo</h2><p>Em breve...</p>';
    else if (state.paginaAtual === 'historico') main.innerHTML = '<h2>Histórico</h2><p>Em breve...</p>';
    else if (state.paginaAtual === 'relatorio') main.innerHTML = '<h2>Relatório</h2><p>Em breve...</p>';
    else if (state.paginaAtual === 'backup') main.innerHTML = '<h2>Backup</h2><p>Em breve...</p>';
    else main.innerHTML = '<h2>Home</h2><p>Bem-vindo!</p>';
}

// Funções de navegação
function mudarPagina(pagina) {
    state.paginaAtual = pagina;
    render();
}

function fazerLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const encontrado = state.usuarios.find(u => u.usuario === user && u.senha === pass);
    if (encontrado) {
        state.usuarioLogado = encontrado;
        render();
        notificar('Login realizado', 'success');
    } else {
        notificar('Usuário ou senha inválidos', 'error');
    }
}

function logout() {
    state.usuarioLogado = null;
    render();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    aplicarTema();
    render();
});

// Exportar funções globais
window.fazerLogin = fazerLogin;
window.mudarPagina = mudarPagina;
window.alternarTema = alternarTema;
window.logout = logout;
