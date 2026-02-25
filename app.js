// ==============================================
// ASSEUF ENTERPRISE - SISTEMA PROFISSIONAL
// PARTE 1/2 - ESTADO GLOBAL E FUNÇÕES AUXILIARES
// ==============================================

const state = {
    paginaAtual: 'home',
    usuarioLogado: null,
    usuarios: [
        { usuario: 'admin', senha: '0000', perfil: 'admin' },
        { usuario: 'taylor', senha: '1296', perfil: 'taylor' },
        { usuario: 'operador', senha: '4321', perfil: 'operador' },
        { usuario: 'visitante', senha: '1234', perfil: 'visitante' }
    ],
    rotas: [],
    historicoCalculos: [],
    calculoAtual: null,
    tema: 'light',
    notificacoes: []
};

// ========== FUNÇÕES DE NOTIFICAÇÃO ==========
function mostrarNotificacao(mensagem, tipo = 'info', duracao = 3000) {
    const container = document.getElementById('toast-area');
    if (!container) return;

    const id = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.id = id;
    
    const icones = {
        info: 'fa-circle-info',
        success: 'fa-circle-check',
        error: 'fa-circle-exclamation'
    };

    toast.innerHTML = `
        <i class="fas ${icones[tipo] || icones.info}"></i>
        <div class="toast-content">
            <div class="toast-title">${tipo.toUpperCase()}</div>
            <div class="toast-message">${mensagem}</div>
        </div>
        <button class="toast-close" onclick="fecharNotificacao('${id}')">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.style.opacity = '0';
            elemento.style.transform = 'translateX(20px)';
            setTimeout(() => elemento.remove(), 300);
        }
    }, duracao);
}

window.fecharNotificacao = (id) => {
    const toast = document.getElementById(id);
    if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }
};

// ========== FUNÇÕES DE TEMA ==========
function alternarTema() {
    state.tema = state.tema === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.tema);
    render();
}

// ========== FUNÇÕES DE BACKUP ==========
function salvarBackup() {
    const backup = {
        usuarios: state.usuarios,
        rotas: state.rotas,
        historicoCalculos: state.historicoCalculos
    };
    localStorage.setItem('assef_backup', JSON.stringify(backup));
    mostrarNotificacao('Backup salvo com sucesso!', 'success');
}

function carregarBackup() {
    const backup = localStorage.getItem('assef_backup');
    if (backup) {
        try {
            const dados = JSON.parse(backup);
            state.usuarios = dados.usuarios || state.usuarios;
            state.rotas = dados.rotas || [];
            state.historicoCalculos = dados.historicoCalculos || [];
            mostrarNotificacao('Backup carregado!', 'success');
        } catch (error) {
            mostrarNotificacao('Erro ao carregar backup', 'error');
        }
    }
}

// ========== FUNÇÕES DE LOGIN ==========
function fazerLogin() {
    const usuario = document.getElementById('login-usuario')?.value;
    const senha = document.getElementById('login-senha')?.value;
    
    if (!usuario || !senha) {
        mostrarNotificacao('Preencha todos os campos', 'error');
        return;
    }

    const user = state.usuarios.find(u => u.usuario === usuario && u.senha === senha);
    
    if (user) {
        state.usuarioLogado = user;
        mostrarNotificacao(`Bem-vindo, ${user.usuario}!`, 'success');
        render();
    } else {
        mostrarNotificacao('Usuário ou senha inválidos', 'error');
    }
}

function logout() {
    state.usuarioLogado = null;
    mostrarNotificacao('Logout realizado', 'info');
    render();
}

// ========== FUNÇÕES DE CÁLCULO ==========
function calcularBruto(rota) {
    return rota.veiculos.reduce((total, v) => {
        if (v.diasRodados) {
            return total + (v.valorDiaria * v.qtdDiarias * v.diasRodados);
        }
        return total + (v.valorDiaria * v.qtdDiarias);
    }, 0);
}

function calcularDistribuicao30_70(rotas, auxilioTotal) {
    const diasMaximo = Math.max(...rotas.map(r => Math.max(...(r.diasRodadosArray || [0]))));
    if (diasMaximo === 0) return rotas.map(() => 0);
    
    const valorPorDia = auxilioTotal / diasMaximo;
    const auxilioPorRota = new Array(rotas.length).fill(0);

    for (let dia = 1; dia <= diasMaximo; dia++) {
        const rotasNoDia = rotas.filter(r => (r.diasRodadosArray || []).includes(dia));
        
        if (rotasNoDia.length === rotas.length) {
            const brutos = rotasNoDia.map(r => calcularBruto(r));
            const totalBruto = brutos.reduce((a, b) => a + b, 0);
            rotasNoDia.forEach((r, idx) => {
                const proporcao = totalBruto ? brutos[idx] / totalBruto : 1 / rotas.length;
                auxilioPorRota[rotas.indexOf(r)] += valorPorDia * proporcao;
            });
        } 
        else if (rotasNoDia.length === 1) {
            const r = rotasNoDia[0];
            auxilioPorRota[rotas.indexOf(r)] += valorPorDia * 0.7;
            rotas.filter(r2 => !(r2.diasRodadosArray || []).includes(dia)).forEach(r2 => {
                auxilioPorRota[rotas.indexOf(r2)] += valorPorDia * 0.3;
            });
        }
    }
    
    return auxilioPorRota;
}

function calcularAuxilio(auxilioDinheiro, auxilioCombustivel) {
    const auxilioTotal = auxilioDinheiro + auxilioCombustivel;
    const rotas = state.rotas;
    
    if (!rotas.length) {
        mostrarNotificacao('Nenhuma rota cadastrada', 'error');
        return [];
    }

    const brutos = rotas.map(r => calcularBruto(r));
    const auxilios = calcularDistribuicao30_70(rotas, auxilioTotal);
    const totalBruto = brutos.reduce((a, b) => a + b, 0);

    return rotas.map((r, idx) => {
        const bruto = brutos[idx];
        const auxilio = auxilios[idx];
        const aposAuxilio = bruto - auxilio;
        const aposPassagens = aposAuxilio - (r.passagens || 0);
        
        return {
            rota: r.nome,
            bruto,
            percBruto: totalBruto ? ((bruto / totalBruto) * 100).toFixed(2) : '0',
            auxilio,
            percAuxilio: auxilioTotal ? ((auxilio / auxilioTotal) * 100).toFixed(2) : '0',
            aposAuxilio,
            aposPassagens,
            alunos: r.alunos || []
        };
    });
}

// ==============================================
// PARTE 2/2 - RENDERIZAÇÃO E COMPONENTES
// ==============================================

function render() {
    const root = document.getElementById('root');
    if (!root) return;

    if (!state.usuarioLogado) {
        root.innerHTML = renderLogin();
        return;
    }

    root.innerHTML = `
        <div class="app-layout">
            ${renderSidebar()}
            <main class="main-content">
                ${renderConteudo()}
            </main>
        </div>
    `;

    // Atualizar item ativo no menu
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.page === state.paginaAtual) {
            item.classList.add('active');
        }
    });
}

function renderLogin() {
    return `
        <div class="main-content" style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);">
            <div class="card" style="max-width: 400px; width: 100%; animation: slideIn 0.5s ease;">
                <div class="text-center mb-4">
                    <div class="logo" style="font-size: 2rem; font-weight: 700;">ASSEUF</div>
                    <div style="color: var(--text-muted);">Enterprise Pro</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Usuário</label>
                    <input type="text" id="login-usuario" class="form-control" placeholder="Digite seu usuário">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Senha</label>
                    <input type="password" id="login-senha" class="form-control" placeholder="Digite sua senha">
                </div>
                
                <button onclick="fazerLogin()" class="btn" style="width: 100%;">
                    <i class="fas fa-sign-in-alt"></i>
                    Entrar
                </button>
                
                <div class="text-center mt-4" style="color: var(--text-muted); font-size: 0.9rem;">
                    <i class="fas fa-shield-alt"></i> Sistema seguro • v2.0
                </div>
            </div>
        </div>
    `;
}

function renderSidebar() {
    const user = state.usuarioLogado;
    
    return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo">ASSEUF</div>
                <div class="subtitle">ENTERPRISE PRO</div>
            </div>
            
            <div class="user-info">
                <div class="user-name">
                    <i class="fas fa-user-circle"></i> ${user.usuario}
                </div>
                <div class="user-role">
                    Perfil: <span class="role-badge">${user.perfil}</span>
                </div>
            </div>
            
            <nav class="nav-menu">
                <button class="nav-item" data-page="home" onclick="mudarPagina('home')">
                    <i class="fas fa-home"></i>
                    Home
                </button>
                
                <button class="nav-item" data-page="rotas" onclick="mudarPagina('rotas')">
                    <i class="fas fa-route"></i>
                    Rotas
                </button>
                
                <button class="nav-item" data-page="calculo" onclick="mudarPagina('calculo')">
                    <i class="fas fa-calculator"></i>
                    Cálculo de Auxílio
                </button>
                
                <button class="nav-item" data-page="historico" onclick="mudarPagina('historico')">
                    <i class="fas fa-history"></i>
                    Histórico
                </button>
                
                <button class="nav-item" data-page="relatorio" onclick="mudarPagina('relatorio')">
                    <i class="fas fa-file-pdf"></i>
                    Relatório
                </button>
                
                <button class="nav-item" data-page="backup" onclick="mudarPagina('backup')">
                    <i class="fas fa-database"></i>
                    Backup
                </button>
                
                <button class="nav-item" onclick="alternarTema()">
                    <i class="fas ${state.tema === 'light' ? 'fa-moon' : 'fa-sun'}"></i>
                    ${state.tema === 'light' ? 'Tema Escuro' : 'Tema Claro'}
                </button>
                
                <button class="nav-item logout" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    Sair
                </button>
            </nav>
        </aside>
    `;
}

function renderConteudo() {
    switch (state.paginaAtual) {
        case 'home': return renderHome();
        case 'rotas': return renderRotas();
        case 'novaRota': return renderNovaRota();
        case 'calculo': return renderCalculo();
        case 'historico': return renderHistorico();
        case 'relatorio': return renderRelatorio();
        case 'backup': return renderBackup();
        default: return renderHome();
    }
}

function renderHome() {
    return `
        <div class="card" style="animation: fadeInUp 0.4s ease;">
            <div class="card-header">
                <h2 class="card-title">
                    <i class="fas fa-tachometer-alt" style="margin-right: 0.5rem;"></i>
                    Dashboard
                </h2>
                <span class="badge badge-primary">Online</span>
            </div>
            
            <div class="grid">
                <div class="card hover-lift">
                    <i class="fas fa-route" style="font-size: 2rem; color: var(--primary); margin-bottom: 1rem;"></i>
                    <h3>${state.rotas.length}</h3>
                    <p style="color: var(--text-muted);">Rotas Ativas</p>
                </div>
                
                <div class="card hover-lift">
                    <i class="fas fa-calculator" style="font-size: 2rem; color: var(--success); margin-bottom: 1rem;"></i>
                    <h3>${state.historicoCalculos.length}</h3>
                    <p style="color: var(--text-muted);">Cálculos Realizados</p>
                </div>
                
                <div class="card hover-lift">
                    <i class="fas fa-users" style="font-size: 2rem; color: var(--warning); margin-bottom: 1rem;"></i>
                    <h3>${state.usuarioLogado.usuario}</h3>
                    <p style="color: var(--text-muted);">Usuário Atual</p>
                </div>
            </div>
            
            <div style="text-align: center; padding: 2rem; background: var(--body-bg); border-radius: var(--radius-md);">
                <i class="fas fa-chart-line" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
                <h3>Sistema de Gerenciamento de Rotas</h3>
                <p style="color: var(--text-muted);">Versão 2.0 • Interface Profissional</p>
            </div>
        </div>
    `;
}

function mudarPagina(pagina) {
    state.paginaAtual = pagina;
    render();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarBackup();
    render();
});

// Exportar funções globais
window.fazerLogin = fazerLogin;
window.logout = logout;
window.mudarPagina = mudarPagina;
window.alternarTema = alternarTema;
window.salvarBackup = salvarBackup;
