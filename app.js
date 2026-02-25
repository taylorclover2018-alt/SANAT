// ==================== ESTADO GLOBAL ====================
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

// ==================== FUNÇÕES AUXILIARES ====================
function notificar(msg, tipo = 'info') {
    const toastArea = document.getElementById('toastArea');
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = msg;
    toastArea.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

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

function criarUsuarioAdminPadrao() {
    if (!state.usuarios.find(u => u.usuario === 'admin')) {
        state.usuarios.push({ usuario: 'admin', senha: '0000', perfil: 'admin' });
    }
}

// ==================== RENDERIZAÇÃO PRINCIPAL ====================
function render() {
    const root = document.getElementById('root');
    if (!root) return;

    if (!state.usuarioLogado) {
        root.innerHTML = paginaLogin();
        return;
    }

    const usuario = state.usuarioLogado;
    const html = `
        <div class="app-layout">
            <aside id="menuLateral">
                <div class="menu-usuario">
                    <div class="menu-usuario-nome">${usuario.usuario}</div>
                    <div class="menu-usuario-perfil">${usuario.perfil}</div>
                </div>
                <div class="menu-grupo">
                    <button class="menu-botao" onclick="mudarPagina('home')">Home</button>
                    <button class="menu-botao" onclick="mudarPagina('rotas')">Rotas</button>
                    <button class="menu-botao" onclick="mudarPagina('calculo')">Cálculo de Rotas</button>
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
    root.innerHTML = html;
    const main = document.getElementById('main-content');
    switch (state.paginaAtual) {
        case 'home': main.innerHTML = paginaHome(); break;
        case 'rotas': main.innerHTML = paginaRotas(); break;
        case 'novaRota': main.innerHTML = paginaNovaRota(); break;
        case 'editarRota': main.innerHTML = paginaEditarRota(); break;
        case 'calculo': main.innerHTML = paginaCalculoRotas(); break;
        case 'historico': main.innerHTML = paginaHistorico(); break;
        case 'relatorio': main.innerHTML = paginaRelatorio(); break;
        case 'backup': main.innerHTML = paginaBackup(); break;
        default: main.innerHTML = paginaHome();
    }
}

function mudarPagina(pagina, params = {}) {
    state.paginaAtual = pagina;
    if (params.rotaId) state.rotaEmEdicao = params.rotaId;
    render();
}

// ==================== LOGIN ====================
function fazerLogin(usuario, senha) {
    const user = state.usuarios.find(u => u.usuario === usuario && u.senha === senha);
    if (user) {
        state.usuarioLogado = user;
        mudarPagina('home');
        notificar(`Bem-vindo, ${user.usuario}`, 'success');
    } else {
        notificar('Usuário ou senha inválidos', 'error');
    }
}

function logout() {
    state.usuarioLogado = null;
    mudarPagina('login');
}

function paginaLogin() {
    return `
        <div class="card" style="max-width:320px;margin:60px auto;">
            <h2>ASSEUF Login</h2>
            <input type="text" id="login-user" placeholder="Usuário">
            <input type="password" id="login-pass" placeholder="Senha">
            <button onclick="fazerLogin(document.getElementById('login-user').value, document.getElementById('login-pass').value)" style="width:100%;">Entrar</button>
        </div>
    `;
}

function paginaHome() {
    return `
        <h2>Home</h2>
        <p>Bem-vindo ao sistema ASSEUF ENTERPRISE PRO.</p>
    `;
}

// ==================== ROTAS ====================
function paginaRotas() {
    let html = '<h2>Rotas</h2><button onclick="mudarPagina(\'novaRota\')">Nova Rota</button><ul>';
    state.rotas.forEach(r => {
        html += `<li>${r.nome} 
            <button onclick="mudarPagina('editarRota', {rotaId:'${r.id}'})">Editar</button>
            <button class="botao-perigo" onclick="excluirRota('${r.id}')">Excluir</button>
        </li>`;
    });
    html += '</ul>';
    return html;
}

function excluirRota(id) {
    if (state.usuarioLogado.perfil !== 'admin' && state.usuarioLogado.perfil !== 'taylor') {
        return notificar('Permissão negada', 'error');
    }
    state.rotas = state.rotas.filter(r => r.id !== id);
    salvarBackup();
    render();
}

function paginaNovaRota() {
    state.rotaEmEdicao = null;
    return formularioRota();
}

function paginaEditarRota() {
    const rota = state.rotas.find(r => r.id === state.rotaEmEdicao);
    if (!rota) return '<p>Rota não encontrada</p>';
    return formularioRota(rota);
}

function formularioRota(rota = null) {
    const id = rota ? rota.id : '';
    const nome = rota ? rota.nome : '';
    const diasRodados = rota ? rota.diasRodadosArray.join(',') : '';
    const passagens = rota ? rota.passagens : '';

    // Determinar modo atual (se rota existir)
    const modoAlunos = rota && rota._modoAlunos ? rota._modoAlunos : 'detalhado'; // padrao detalhado

    // Montar HTML dos veículos
    let veiculosHtml = '';
    if (rota) {
        rota.veiculos.forEach((v, idx) => {
            veiculosHtml += `
                <div class="veiculo-item" data-index="${idx}">
                    <input type="text" placeholder="Nome veículo" class="veiculo-nome" value="${v.nome}" required>
                    <input type="number" placeholder="Diária (R$)" step="0.01" class="veiculo-diaria" value="${v.valorDiaria}" required>
                    <input type="number" placeholder="Qtd diárias" step="1" class="veiculo-qtd" value="${v.qtdDiarias}" required>
                    <input type="number" placeholder="Dias rodados (opcional)" step="1" class="veiculo-dias" value="${v.diasRodados || ''}">
                    <button type="button" class="botao-perigo" onclick="removerVeiculo(this)">Remover</button>
                </div>
            `;
        });
    }

    // Montar HTML dos alunos conforme modo
    let alunosHtml = '';
    if (rota) {
        if (modoAlunos === 'detalhado') {
            rota.alunos.forEach((a, idx) => {
                const tipo = a.integral ? 'integral' : 'desconto';
                alunosHtml += `
                    <div class="aluno-item" data-index="${idx}">
                        <input type="text" placeholder="Nome aluno" class="aluno-nome" value="${a.nome}" required>
                        <select class="aluno-tipo">
                            <option value="integral" ${tipo==='integral'?'selected':''}>Integral</option>
                            <option value="desconto" ${tipo==='desconto'?'selected':''}>Com desconto</option>
                        </select>
                        <input type="number" placeholder="Desconto %" step="0.01" class="aluno-desconto" value="${a.desconto || 0}">
                        <button type="button" class="botao-perigo" onclick="removerAluno(this)">Remover</button>
                    </div>
                `;
            });
        } else {
            // modo resumido: contar integrais e com desconto
            const integrais = rota.alunos.filter(a => a.integral).length;
            const comDesconto = rota.alunos.filter(a => !a.integral);
            // assumir mesmo desconto para todos com desconto (pegar o primeiro se existir)
            const descontoPadrao = comDesconto.length > 0 ? comDesconto[0].desconto : 0;
            alunosHtml = `
                <div class="aluno-resumo">
                    <label>Número de alunos integrais</label>
                    <input type="number" id="alunos-integrais" value="${integrais}" min="0" step="1">
                    <label>Número de alunos com desconto</label>
                    <input type="number" id="alunos-desconto-qtd" value="${comDesconto.length}" min="0" step="1">
                    <label>Desconto (%) para alunos com desconto</label>
                    <input type="number" id="alunos-desconto-valor" value="${descontoPadrao}" min="0" max="100" step="0.1">
                </div>
            `;
        }
    } else {
        // nova rota: padrão detalhado (sem alunos)
        alunosHtml = ''; // vazio, o usuário adiciona
    }

    return `
        <h2>${rota ? 'Editar' : 'Nova'} Rota</h2>
        <form onsubmit="salvarRota(event)">
            <input type="hidden" id="rota-id" value="${id}">
            <div class="card">
                <label>Nome da rota:</label>
                <input type="text" id="rota-nome" value="${nome}" required>
                <label>Dias rodados (ex: 1,2,3,4):</label>
                <input type="text" id="rota-dias" value="${diasRodados}" required>
                <label>Valor das passagens (R$):</label>
                <input type="number" id="rota-passagens" step="0.01" value="${passagens}" required>
            </div>
            <h4>Veículos</h4>
            <div id="veiculos-container">${veiculosHtml}</div>
            <button type="button" onclick="adicionarVeiculo()">Adicionar Veículo</button>

            <h4>Alunos</h4>
            <div style="margin-bottom:10px;">
                <label>Modo de cadastro:</label>
                <select id="modo-alunos" onchange="toggleModoAlunos()">
                    <option value="detalhado" ${modoAlunos==='detalhado'?'selected':''}>Detalhado (nome a nome)</option>
                    <option value="resumido" ${modoAlunos==='resumido'?'selected':''}>Resumido (apenas números)</option>
                </select>
            </div>
            <div id="alunos-container">${alunosHtml}</div>
            <div id="alunos-resumo-container" style="display:${modoAlunos==='resumido'?'block':'none'};"></div>
            <div id="alunos-botoes" style="display:${modoAlunos==='detalhado'?'block':'none'};">
                <button type="button" onclick="adicionarAluno()">Adicionar Aluno</button>
            </div>
            <br><br>
            <button type="submit" class="botao-principal">Salvar</button>
            <button type="button" onclick="mudarPagina('rotas')">Cancelar</button>
        </form>
    `;
}

// Função para alternar entre modos de aluno no formulário
window.toggleModoAlunos = function() {
    const select = document.getElementById('modo-alunos');
    const modo = select.value;
    const containerDetalhado = document.getElementById('alunos-container');
    const containerResumo = document.getElementById('alunos-resumo-container');
    const botoes = document.getElementById('alunos-botoes');

    if (modo === 'detalhado') {
        containerDetalhado.style.display = 'block';
        containerResumo.style.display = 'none';
        botoes.style.display = 'block';
        // Se não houver nenhum aluno detalhado, adicionar um padrão?
        if (containerDetalhado.children.length === 0) {
            adicionarAluno(); // adiciona um aluno em branco
        }
    } else {
        containerDetalhado.style.display = 'none';
        containerResumo.style.display = 'block';
        botoes.style.display = 'none';
        // Criar campos de resumo se não existirem
        if (containerResumo.children.length === 0) {
            containerResumo.innerHTML = `
                <div class="aluno-resumo">
                    <label>Número de alunos integrais</label>
                    <input type="number" id="alunos-integrais" value="0" min="0" step="1">
                    <label>Número de alunos com desconto</label>
                    <input type="number" id="alunos-desconto-qtd" value="0" min="0" step="1">
                    <label>Desconto (%) para alunos com desconto</label>
                    <input type="number" id="alunos-desconto-valor" value="0" min="0" max="100" step="0.1">
                </div>
            `;
        }
    }
};

// Funções para adicionar/remover dinamicamente (modo detalhado)
window.adicionarVeiculo = function() {
    const container = document.getElementById('veiculos-container');
    const div = document.createElement('div');
    div.className = 'veiculo-item';
    div.innerHTML = `
        <input type="text" placeholder="Nome veículo" class="veiculo-nome" required>
        <input type="number" placeholder="Diária (R$)" step="0.01" class="veiculo-diaria" required>
        <input type="number" placeholder="Qtd diárias" step="1" class="veiculo-qtd" required>
        <input type="number" placeholder="Dias rodados (opcional)" step="1" class="veiculo-dias">
        <button type="button" class="botao-perigo" onclick="removerVeiculo(this)">Remover</button>
    `;
    container.appendChild(div);
};

window.removerVeiculo = function(btn) {
    btn.closest('.veiculo-item').remove();
};

window.adicionarAluno = function() {
    const container = document.getElementById('alunos-container');
    const div = document.createElement('div');
    div.className = 'aluno-item';
    div.innerHTML = `
        <input type="text" placeholder="Nome aluno" class="aluno-nome" required>
        <select class="aluno-tipo">
            <option value="integral">Integral</option>
            <option value="desconto">Com desconto</option>
        </select>
        <input type="number" placeholder="Desconto %" step="0.01" class="aluno-desconto" value="0">
        <button type="button" class="botao-perigo" onclick="removerAluno(this)">Remover</button>
    `;
    container.appendChild(div);
};

window.removerAluno = function(btn) {
    btn.closest('.aluno-item').remove();
};

function salvarRota(e) {
    e.preventDefault();
    const id = document.getElementById('rota-id').value;
    const nome = document.getElementById('rota-nome').value;
    const diasStr = document.getElementById('rota-dias').value;
    const passagens = parseFloat(document.getElementById('rota-passagens').value) || 0;
    const diasRodadosArray = diasStr.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));

    // Coletar veículos
    const veiculos = [];
    document.querySelectorAll('#veiculos-container .veiculo-item').forEach((item, idx) => {
        const nome = item.querySelector('.veiculo-nome').value;
        const diaria = parseFloat(item.querySelector('.veiculo-diaria').value);
        const qtd = parseInt(item.querySelector('.veiculo-qtd').value);
        const diasRodados = parseInt(item.querySelector('.veiculo-dias').value);
        if (nome && !isNaN(diaria) && !isNaN(qtd)) {
            veiculos.push({
                id: 'v' + Date.now() + idx,
                nome,
                valorDiaria: diaria,
                qtdDiarias: qtd,
                diasRodados: isNaN(diasRodados) ? null : diasRodados
            });
        }
    });

    // Coletar alunos conforme modo
    const modo = document.getElementById('modo-alunos').value;
    let alunos = [];
    if (modo === 'detalhado') {
        document.querySelectorAll('#alunos-container .aluno-item').forEach((item, idx) => {
            const nome = item.querySelector('.aluno-nome').value;
            const tipo = item.querySelector('.aluno-tipo').value;
            const desconto = parseFloat(item.querySelector('.aluno-desconto').value) || 0;
            if (nome) {
                alunos.push({
                    id: 'a' + Date.now() + idx,
                    nome,
                    integral: tipo === 'integral',
                    desconto: tipo === 'integral' ? 0 : desconto
                });
            }
        });
    } else {
        // modo resumido
        const integrais = parseInt(document.getElementById('alunos-integrais').value) || 0;
        const comDescontoQtd = parseInt(document.getElementById('alunos-desconto-qtd').value) || 0;
        const descontoValor = parseFloat(document.getElementById('alunos-desconto-valor').value) || 0;
        for (let i = 0; i < integrais; i++) {
            alunos.push({
                id: 'a' + Date.now() + i + '_int',
                nome: `Integral ${i+1}`,
                integral: true,
                desconto: 0
            });
        }
        for (let i = 0; i < comDescontoQtd; i++) {
            alunos.push({
                id: 'a' + Date.now() + i + '_desc',
                nome: `Desconto ${i+1}`,
                integral: false,
                desconto: descontoValor
            });
        }
    }

    if (!veiculos.length) {
        return notificar('Adicione pelo menos um veículo', 'error');
    }
    if (alunos.length === 0) {
        return notificar('Adicione pelo menos um aluno', 'error');
    }

    const rota = {
        id: id || Date.now().toString(),
        nome,
        diasRodadosArray,
        passagens,
        veiculos,
        alunos,
        _modoAlunos: modo // salvar o modo usado para edição futura
    };

    if (id) {
        const index = state.rotas.findIndex(r => r.id === id);
        if (index !== -1) state.rotas[index] = rota;
    } else {
        state.rotas.push(rota);
    }

    salvarBackup();
    notificar('Rota salva', 'success');
    mudarPagina('rotas');
}

// ==================== CÁLCULOS ====================
function calcularBruto(rota) {
    let bruto = 0;
    rota.veiculos.forEach(v => {
        if (v.diasRodados) {
            bruto += v.valorDiaria * v.qtdDiarias * v.diasRodados;
        } else {
            bruto += v.valorDiaria * v.qtdDiarias;
        }
    });
    return bruto;
}

function calcularDistribuicao30_70(rotas, auxilioTotal) {
    const diasMaximo = Math.max(...rotas.map(r => Math.max(...r.diasRodadosArray, 0)));
    if (diasMaximo === 0) return rotas.map(() => 0);
    const valorPorDia = auxilioTotal / diasMaximo;
    const auxilioP
