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
// ==================== app.js - PARTE 2 ====================
// Funções de rota
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
    if (!['admin','taylor'].includes(state.usuarioLogado.perfil)) {
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
    const modoAlunos = (rota && rota._modoAlunos) ? rota._modoAlunos : 'detalhado';

    // Veículos
    let veiculosHtml = '';
    if (rota) {
        rota.veiculos.forEach((v, idx) => {
            veiculosHtml += `
                <div class="veiculo-item">
                    <input type="text" placeholder="Nome" class="veiculo-nome" value="${v.nome}" required>
                    <input type="number" placeholder="Diária" step="0.01" class="veiculo-diaria" value="${v.valorDiaria}" required>
                    <input type="number" placeholder="Qtd diárias" step="1" class="veiculo-qtd" value="${v.qtdDiarias}" required>
                    <input type="number" placeholder="Dias rodados (opcional)" step="1" class="veiculo-dias" value="${v.diasRodados || ''}">
                    <button type="button" class="botao-perigo" onclick="removerVeiculo(this)">Remover</button>
                </div>
            `;
        });
    }

    // Alunos (detalhado)
    let alunosHtml = '';
    if (rota && modoAlunos === 'detalhado') {
        rota.alunos.forEach((a, idx) => {
            const tipo = a.integral ? 'integral' : 'desconto';
            alunosHtml += `
                <div class="aluno-item">
                    <input type="text" placeholder="Nome" class="aluno-nome" value="${a.nome}" required>
                    <select class="aluno-tipo">
                        <option value="integral" ${tipo==='integral'?'selected':''}>Integral</option>
                        <option value="desconto" ${tipo==='desconto'?'selected':''}>Com desconto</option>
                    </select>
                    <input type="number" placeholder="Desconto %" step="0.01" class="aluno-desconto" value="${a.desconto || 0}">
                    <button type="button" class="botao-perigo" onclick="removerAluno(this)">Remover</button>
                </div>
            `;
        });
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
                <label>Passagens (R$):</label>
                <input type="number" id="rota-passagens" step="0.01" value="${passagens}" required>
            </div>
            <h4>Veículos</h4>
            <div id="veiculos-container">${veiculosHtml}</div>
            <button type="button" onclick="adicionarVeiculo()">Adicionar Veículo</button>

            <h4>Alunos</h4>
            <div style="margin-bottom:10px;">
                <label>Modo:</label>
                <select id="modo-alunos" onchange="toggleModoAlunos()">
                    <option value="detalhado" ${modoAlunos==='detalhado'?'selected':''}>Detalhado</option>
                    <option value="resumido" ${modoAlunos==='resumido'?'selected':''}>Resumido</option>
                </select>
            </div>
            <div id="alunos-container">${alunosHtml}</div>
            <div id="alunos-resumo-container" style="display:${modoAlunos==='resumido'?'block':'none'};"></div>
            <div id="alunos-botoes" style="display:${modoAlunos==='detalhado'?'block':'none'};">
                <button type="button" onclick="adicionarAluno()">Adicionar Aluno</button>
            </div>
            <br>
            <button type="submit" class="botao-principal">Salvar</button>
            <button type="button" onclick="mudarPagina('rotas')">Cancelar</button>
        </form>
    `;
}

// Funções auxiliares do formulário
window.adicionarVeiculo = function() {
    const container = document.getElementById('veiculos-container');
    const div = document.createElement('div');
    div.className = 'veiculo-item';
    div.innerHTML = `
        <input type="text" placeholder="Nome" class="veiculo-nome" required>
        <input type="number" placeholder="Diária" step="0.01" class="veiculo-diaria" required>
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
        <input type="text" placeholder="Nome" class="aluno-nome" required>
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
        if (containerDetalhado.children.length === 0) adicionarAluno();
    } else {
        containerDetalhado.style.display = 'none';
        containerResumo.style.display = 'block';
        botoes.style.display = 'none';
        if (containerResumo.children.length === 0) {
            containerResumo.innerHTML = `
                <div class="aluno-resumo">
                    <label>Alunos integrais (quantidade)</label>
                    <input type="number" id="alunos-integrais" value="0" min="0">
                    <label>Alunos com desconto (quantidade)</label>
                    <input type="number" id="alunos-desconto-qtd" value="0" min="0">
                    <label>Desconto (%)</label>
                    <input type="number" id="alunos-desconto-valor" value="0" min="0" max="100" step="0.1">
                </div>
            `;
        }
    }
};

function salvarRota(e) {
    e.preventDefault();
    const id = document.getElementById('rota-id').value;
    const nome = document.getElementById('rota-nome').value;
    const diasStr = document.getElementById('rota-dias').value;
    const passagens = parseFloat(document.getElementById('rota-passagens').value) || 0;
    const diasRodadosArray = diasStr.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));

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
        const integrais = parseInt(document.getElementById('alunos-integrais').value) || 0;
        const comDescontoQtd = parseInt(document.getElementById('alunos-desconto-qtd').value) || 0;
        const descontoValor = parseFloat(document.getElementById('alunos-desconto-valor').value) || 0;
        for (let i = 0; i < integrais; i++) {
            alunos.push({ id: 'a'+Date.now()+i+'_int', nome: `Integral ${i+1}`, integral: true, desconto: 0 });
        }
        for (let i = 0; i < comDescontoQtd; i++) {
            alunos.push({ id: 'a'+Date.now()+i+'_desc', nome: `Desconto ${i+1}`, integral: false, desconto: descontoValor });
        }
    }

    if (!veiculos.length) return notificar('Adicione veículos', 'error');
    if (alunos.length === 0) return notificar('Adicione alunos', 'error');

    const rota = {
        id: id || Date.now().toString(),
        nome,
        diasRodadosArray,
        passagens,
        veiculos,
        alunos,
        _modoAlunos: modo
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
        if (v.diasRodados) bruto += v.valorDiaria * v.qtdDiarias * v.diasRodados;
        else bruto += v.valorDiaria * v.qtdDiarias;
    });
    return bruto;
}

function calcularDistribuicao30_70(rotas, auxilioTotal) {
    const diasMaximo = Math.max(...rotas.map(r => Math.max(...r.diasRodadosArray, 0)));
    if (diasMaximo === 0) return rotas.map(() => 0);
    const valorPorDia = auxilioTotal / diasMaximo;
    const auxilioPorRota = rotas.map(() => 0);
    for (let dia = 1; dia <= diasMaximo; dia++) {
        const rotasNoDia = rotas.filter(r => r.diasRodadosArray.includes(dia));
        if (rotasNoDia.length === rotas.length) {
            const brutos = rotasNoDia.map(r => calcularBruto(r));
            const total = brutos.reduce((a,b) => a+b, 0);
            rotasNoDia.forEach((r, idx) => {
                auxilioPorRota[rotas.indexOf(r)] += valorPorDia * (total ? brutos[idx]/total : 1/rotas.length);
            });
        } else if (rotasNoDia.length === 1) {
            const r = rotasNoDia[0];
            auxilioPorRota[rotas.indexOf(r)] += valorPorDia * 0.7;
            rotas.filter(r2 => !r2.diasRodadosArray.includes(dia)).forEach(r2 => {
                auxilioPorRota[rotas.indexOf(r2)] += valorPorDia * 0.3;
            });
        } else {
            const brutos = rotasNoDia.map(r => calcularBruto(r));
            const total = brutos.reduce((a,b) => a+b, 0);
            rotasNoDia.forEach((r, idx) => {
                auxilioPorRota[rotas.indexOf(r)] += valorPorDia * (total ? brutos[idx]/total : 1/rotasNoDia.length);
            });
        }
    }
    return auxilioPorRota;
}

function calcularValoresPorAluno(rota, saldo) {
    const integrais = rota.alunos.filter(a => a.integral).length;
    let somaCoef = integrais;
    rota.alunos.forEach(a => { if (!a.integral) somaCoef += (1 - a.desconto/100); });
    const valorIntegral = somaCoef ? saldo / somaCoef : 0;
    return rota.alunos.map(a => ({
        nome: a.nome,
        valor: a.integral ? valorIntegral : valorIntegral * (1 - a.desconto/100)
    }));
}

function calcularAuxilio(dinheiro, combustivel) {
    const total = dinheiro + combustivel;
    const rotas = state.rotas;
    if (!rotas.length) { notificar('Nenhuma rota', 'error'); return []; }
    const brutos = rotas.map(r => calcularBruto(r));
    const auxilios = calcularDistribuicao30_70(rotas, total);
    const totalBruto = brutos.reduce((a,b) => a+b, 0);
    const resultados = rotas.map((r, idx) => {
        const bruto = brutos[idx];
        const auxilio = auxilios[idx];
        const aposAuxilio = bruto - auxilio;
        const aposPassagens = aposAuxilio - r.passagens;
        const alunos = calcularValoresPorAluno(r, aposPassagens);
        return {
            rota: r.nome,
            bruto,
            percBruto: totalBruto ? (bruto/totalBruto*100).toFixed(2) : '0',
            auxilio,
            percAuxilio: total ? (auxilio/total*100).toFixed(2) : '0',
            aposAuxilio,
            aposPassagens,
            alunos
        };
    });
    state.calculoAtual = { dinheiro, combustivel, total, resultados, data: new Date().toISOString() };
    return resultados;
}

function paginaCalculo() {
    return `
        <h2>Cálculo</h2>
        <div class="card">
            <label>Auxílio Dinheiro (R$): <input type="number" id="auxilioDinheiro" value="0" step="0.01"></label>
            <label>Auxílio Combustível (R$): <input type="number" id="auxilioCombustivel" value="0" step="0.01"></label>
            <button onclick="executarCalculo()">Calcular</button>
        </div>
        <div id="resultado"></div>
    `;
}

window.executarCalculo = function() {
    const d = parseFloat(document.getElementById('auxilioDinheiro').value) || 0;
    const c = parseFloat(document.getElementById('auxilioCombustivel').value) || 0;
    if (d+c === 0) return notificar('Informe auxílio', 'error');
    const res = calcularAuxilio(d, c);
    if (!res.length) return;
    let html = '<h3>Resultado</h3><table class="tabela"><tr><th>Rota</th><th>Bruto</th><th>%</th><th>Auxílio</th><th>%</th><th>Após auxílio</th><th>Após passagens</th></tr>';
    res.forEach(r => {
        html += `<tr><td>${r.rota}</td><td>${r.bruto.toFixed(2)}</td><td>${r.percBruto}%</td><td>${r.auxilio.toFixed(2)}</td><td>${r.percAuxilio}%</td><td>${r.aposAuxilio.toFixed(2)}</td><td>${r.aposPassagens.toFixed(2)}</td></tr>`;
    });
    html += '</table>';
    res.forEach(r => {
        html += `<h4>${r.rota}</h4><ul>`;
        r.alunos.forEach(a => html += `<li>${a.nome}: R$ ${a.valor.toFixed(2)}</li>`);
        html += '</ul>';
    });
    html += '<button onclick="salvarCalculo()">Salvar no histórico</button>';
    document.getElementById('resultado').innerHTML = html;
};

window.salvarCalculo = function() {
    if (!state.calculoAtual) return notificar('Nada a salvar', 'error');
    state.historicoCalculos.push(state.calculoAtual);
    salvarBackup();
    notificar('Salvo', 'success');
};

// ==================== HISTÓRICO ====================
function excluirRegistroHistorico(index) {
    if (!['admin','taylor'].includes(state.usuarioLogado.perfil)) return notificar('Permissão negada', 'error');
    state.historicoCalculos.splice(index, 1);
    salvarBackup();
    render();
}

function paginaHistorico() {
    let html = '<h2>Histórico</h2>';
    if (!state.historicoCalculos.length) return html + '<p>Vazio</p>';
    html += '<ul>';
    state.historicoCalculos.forEach((c, i) => {
        html += `<li>${new Date(c.data).toLocaleString()} - Total R$ ${c.total} 
            <button onclick="excluirRegistroHistorico(${i})">Excluir</button>
            <button onclick="verRelatorio(${i})">Ver</button>
        </li>`;
    });
    html += '</ul>';
    return html;
}

function verRelatorio(i) {
    state.calculoAtual = state.historicoCalculos[i];
    mudarPagina('relatorio');
}

// ==================== RELATÓRIO ====================
function paginaRelatorio() {
    if (!state.calculoAtual) return '<p>Selecione um cálculo</p>';
    return `
        <h2>Relatório</h2>
        <button onclick="imprimirRelatorio()">PDF</button>
        <div class="card">${gerarHTMLRelatorio(state.calculoAtual)}</div>
    `;
}

function gerarHTMLRelatorio(c) {
    let html = `<h3>${new Date(c.data).toLocaleString()}</h3>`;
    html += `<p>Dinheiro: R$ ${c.dinheiro}, Combustível: R$ ${c.combustivel}, Total: R$ ${c.total}</p>`;
    html += '<table class="tabela"><tr><th>Rota</th><th>Bruto</th><th>%</th><th>Auxílio</th><th>%</th><th>Após auxílio</th><th>Após passagens</th></tr>';
    c.resultados.forEach(r => {
        html += `<tr><td>${r.rota}</td><td>${r.bruto.toFixed(2)}</td><td>${r.percBruto}%</td><td>${r.auxilio.toFixed(2)}</td><td>${r.percAuxilio}%</td><td>${r.aposAuxilio.toFixed(2)}</td><td>${r.aposPassagens.toFixed(2)}</td></tr>`;
    });
    html += '</table>';
    c.resultados.forEach(r => {
        html += `<h4>${r.rota}</h4><table class="tabela"><tr><th>Aluno</th><th>Valor</th></tr>`;
        r.alunos.forEach(a => html += `<tr><td>${a.nome}</td><td>R$ ${a.valor.toFixed(2)}</td></tr>`);
        html += '</table>';
    });
    html += '<div class="memoria-bloco"><p>Regra 30/70 aplicada.</p></div>';
    return html;
}

function imprimirRelatorio() {
    if (!state.calculoAtual) return;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><link rel="stylesheet" href="style.css"></head><body>${gerarHTMLRelatorio(state.calculoAtual)}</body></html>`);
    w.document.close();
    w.print();
}

// ==================== BACKUP ====================
function paginaBackup() {
    return `
        <h2>Backup</h2>
        <div class="card">
            <button onclick="exportarBackup()">Exportar JSON</button>
            <button onclick="document.getElementById('importFile').click()">Importar JSON</button>
            <input type="file" id="importFile" style="display:none" accept=".json" onchange="importarBackup(event)">
            <hr>
            <button onclick="imprimirRelatorio()">PDF do último</button>
        </div>
    `;
}

function exportarBackup() {
    const data = JSON.stringify({ usuarios: state.usuarios, rotas: state.rotas, historicoCalculos: state.historicoCalculos }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notificar('Exportado', 'success');
}

function importarBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        try {
            const backup = JSON.parse(ev.target.result);
            state.usuarios = backup.usuarios || state.usuarios;
            state.rotas = backup.rotas || [];
            state.historicoCalculos = backup.historicoCalculos || [];
            salvarBackup();
            notificar('Importado', 'success');
            render();
        } catch { notificar('Arquivo inválido', 'error'); }
    };
    reader.readAsText(file);
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    carregarBackup();
    render();
});

// Expor funções globais (para uso nos botões)
window.fazerLogin = fazerLogin;
window.logout = logout;
window.mudarPagina = mudarPagina;
window.alternarTema = alternarTema;
window.excluirRota = excluirRota;
window.salvarRota = salvarRota;
window.executarCalculo = executarCalculo;
window.salvarCalculo = salvarCalculo;
window.excluirRegistroHistorico = excluirRegistroHistorico;
window.verRelatorio = verRelatorio;
window.imprimirRelatorio = imprimirRelatorio;
window.exportarBackup = exportarBackup;
window.importarBackup = importarBackup;
