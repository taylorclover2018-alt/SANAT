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
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = `position:fixed;top:20px;right:20px;padding:12px 20px;background:${
        tipo === 'erro' ? '#f44336' : tipo === 'sucesso' ? '#4caf50' : '#2196f3'
    };color:#fff;border-radius:4px;z-index:9999;`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function aplicarTema() {
    const root = document.documentElement;
    if (state.tema === 'escuro') {
        root.style.setProperty('--bg', '#121212');
        root.style.setProperty('--text', '#eee');
        root.style.setProperty('--card', '#1e1e1e');
        root.style.setProperty('--border', '#444');
    } else {
        root.style.setProperty('--bg', '#f5f5f5');
        root.style.setProperty('--text', '#333');
        root.style.setProperty('--card', '#fff');
        root.style.setProperty('--border', '#ddd');
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
    notificar('Backup salvo', 'sucesso');
}

function carregarBackup() {
    const data = localStorage.getItem('assef_backup');
    if (data) {
        try {
            const backup = JSON.parse(data);
            state.usuarios = backup.usuarios || state.usuarios;
            state.rotas = backup.rotas || [];
            state.historicoCalculos = backup.historicoCalculos || [];
            notificar('Backup carregado', 'sucesso');
        } catch (e) {
            notificar('Erro ao carregar backup', 'erro');
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

    let html = `
        <div class="container">
            <aside class="sidebar">
                <h3>ASSEUF</h3>
                <nav>
                    <button onclick="mudarPagina('home')">Home</button>
                    <button onclick="mudarPagina('rotas')">Rotas</button>
                    <button onclick="mudarPagina('calculo')">Cálculo de Rotas</button>
                    <button onclick="mudarPagina('historico')">Histórico</button>
                    <button onclick="mudarPagina('relatorio')">Relatório</button>
                    <button onclick="mudarPagina('backup')">Backup</button>
                    <button onclick="alternarTema()">Tema</button>
                    <button onclick="logout()">Logout</button>
                </nav>
            </aside>
            <main class="main" id="main-content"></main>
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
        notificar(`Bem-vindo, ${user.usuario}`, 'sucesso');
    } else {
        notificar('Usuário ou senha inválidos', 'erro');
    }
}

function logout() {
    state.usuarioLogado = null;
    mudarPagina('login');
}

function paginaLogin() {
    return `
        <div style="max-width:300px;margin:100px auto;background:var(--card);padding:20px;border-radius:8px;">
            <h2>ASSEUF Login</h2>
            <input type="text" id="login-user" placeholder="Usuário">
            <input type="password" id="login-pass" placeholder="Senha">
            <button onclick="fazerLogin(document.getElementById('login-user').value, document.getElementById('login-pass').value)" style="width:100%;">Entrar</button>
        </div>
    `;
}

function paginaHome() {
    return `<h2>Home</h2><p>Bem-vindo ao sistema ASSEUF ENTERPRISE PRO.</p>`;
}

// ==================== ROTAS ====================
function paginaRotas() {
    let html = '<h2>Rotas</h2><button onclick="mudarPagina(\'novaRota\')">Nova Rota</button><ul>';
    state.rotas.forEach(r => {
        html += `<li>${r.nome} 
            <button onclick="mudarPagina('editarRota', {rotaId:'${r.id}'})">Editar</button>
            <button class="danger" onclick="excluirRota('${r.id}')">Excluir</button>
        </li>`;
    });
    html += '</ul>';
    return html;
}

function excluirRota(id) {
    if (state.usuarioLogado.perfil !== 'admin' && state.usuarioLogado.perfil !== 'taylor') {
        return notificar('Permissão negada', 'erro');
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
                    <button type="button" class="danger" onclick="removerVeiculo(this)">Remover</button>
                </div>
            `;
        });
    }

    // Montar HTML dos alunos
    let alunosHtml = '';
    if (rota) {
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
                    <button type="button" class="danger" onclick="removerAluno(this)">Remover</button>
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
                <label>Valor das passagens (R$):</label>
                <input type="number" id="rota-passagens" step="0.01" value="${passagens}" required>
            </div>
            <h4>Veículos</h4>
            <div id="veiculos-container">${veiculosHtml}</div>
            <button type="button" onclick="adicionarVeiculo()">Adicionar Veículo</button>
            <h4>Alunos</h4>
            <div id="alunos-container">${alunosHtml}</div>
            <button type="button" onclick="adicionarAluno()">Adicionar Aluno</button><br><br>
            <button type="submit" class="success">Salvar</button>
            <button type="button" onclick="mudarPagina('rotas')">Cancelar</button>
        </form>
    `;
}

// Funções para adicionar/remover dinamicamente
window.adicionarVeiculo = function() {
    const container = document.getElementById('veiculos-container');
    const div = document.createElement('div');
    div.className = 'veiculo-item';
    div.innerHTML = `
        <input type="text" placeholder="Nome veículo" class="veiculo-nome" required>
        <input type="number" placeholder="Diária (R$)" step="0.01" class="veiculo-diaria" required>
        <input type="number" placeholder="Qtd diárias" step="1" class="veiculo-qtd" required>
        <input type="number" placeholder="Dias rodados (opcional)" step="1" class="veiculo-dias">
        <button type="button" class="danger" onclick="removerVeiculo(this)">Remover</button>
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
        <button type="button" class="danger" onclick="removerAluno(this)">Remover</button>
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

    // Coletar alunos
    const alunos = [];
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

    if (!veiculos.length || !alunos.length) {
        return notificar('Adicione pelo menos um veículo e um aluno', 'erro');
    }

    const rota = {
        id: id || Date.now().toString(),
        nome,
        diasRodadosArray,
        passagens,
        veiculos,
        alunos
    };

    if (id) {
        const index = state.rotas.findIndex(r => r.id === id);
        if (index !== -1) state.rotas[index] = rota;
    } else {
        state.rotas.push(rota);
    }

    salvarBackup();
    notificar('Rota salva', 'sucesso');
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
    const auxilioPorRota = rotas.map(() => 0);

    for (let dia = 1; dia <= diasMaximo; dia++) {
        const rotasNoDia = rotas.filter(r => r.diasRodadosArray.includes(dia));
        if (rotasNoDia.length === rotas.length) {
            const brutos = rotasNoDia.map(r => calcularBruto(r));
            const totalBruto = brutos.reduce((a,b) => a+b, 0);
            rotasNoDia.forEach((r, idx) => {
                const proporcao = totalBruto ? brutos[idx] / totalBruto : 1/rotas.length;
                auxilioPorRota[rotas.indexOf(r)] += valorPorDia * proporcao;
            });
        } else if (rotasNoDia.length === 1) {
            const r = rotasNoDia[0];
            auxilioPorRota[rotas.indexOf(r)] += valorPorDia * 0.7;
            rotas.filter(r2 => !r2.diasRodadosArray.includes(dia)).forEach(r2 => {
                auxilioPorRota[rotas.indexOf(r2)] += valorPorDia * 0.3;
            });
        } else {
            // Mais de uma mas não todas: divisão proporcional entre as que rodaram.
            const rotasQueRodaram = rotasNoDia;
            const brutos = rotasQueRodaram.map(r => calcularBruto(r));
            const totalBruto = brutos.reduce((a,b) => a+b, 0);
            rotasQueRodaram.forEach((r, idx) => {
                const proporcao = totalBruto ? brutos[idx] / totalBruto : 1/rotasQueRodaram.length;
                auxilioPorRota[rotas.indexOf(r)] += valorPorDia * proporcao;
            });
        }
    }
    return auxilioPorRota;
}

function calcularValoresPorAluno(rota, saldoAposAuxilioEPassagens) {
    const integrais = rota.alunos.filter(a => a.integral).length;
    let somaCoef = integrais;
    rota.alunos.forEach(a => {
        if (!a.integral) somaCoef += (1 - a.desconto/100);
    });
    const valorIntegral = somaCoef ? saldoAposAuxilioEPassagens / somaCoef : 0;
    return rota.alunos.map(a => ({
        nome: a.nome,
        valor: a.integral ? valorIntegral : valorIntegral * (1 - a.desconto/100)
    }));
}

function calcularAuxilio(auxilioDinheiro, auxilioCombustivel) {
    const auxilioTotal = auxilioDinheiro + auxilioCombustivel;
    const rotas = state.rotas;
    if (!rotas.length) {
        notificar('Nenhuma rota cadastrada', 'erro');
        return [];
    }
    const brutos = rotas.map(r => calcularBruto(r));
    const auxilios = calcularDistribuicao30_70(rotas, auxilioTotal);
    const totalBruto = brutos.reduce((a,b) => a+b, 0);
    const resultados = rotas.map((r, idx) => {
        const bruto = brutos[idx];
        const auxilio = auxilios[idx];
        const aposAuxilio = bruto - auxilio;
        const aposPassagens = aposAuxilio - r.passagens;
        const alunosValores = calcularValoresPorAluno(r, aposPassagens);
        return {
            rota: r.nome,
            bruto,
            percBruto: totalBruto ? (bruto / totalBruto * 100).toFixed(2) : '0.00',
            auxilio,
            percAuxilio: auxilioTotal ? (auxilio / auxilioTotal * 100).toFixed(2) : '0.00',
            aposAuxilio,
            aposPassagens,
            alunos: alunosValores
        };
    });
    state.calculoAtual = { 
        auxilioDinheiro, 
        auxilioCombustivel, 
        auxilioTotal, 
        resultados, 
        data: new Date().toISOString() 
    };
    return resultados;
}

function paginaCalculoRotas() {
    return `
        <h2>Cálculo de Rotas e Auxílio</h2>
        <div class="card">
            <label>Auxílio em Dinheiro (R$): <input type="number" id="auxilioDinheiro" step="0.01" value="0"></label>
            <label>Auxílio em Combustível (R$): <input type="number" id="auxilioCombustivel" step="0.01" value="0"></label>
            <button onclick="executarCalculo()">Calcular</button>
        </div>
        <div id="resultado-calculo"></div>
    `;
}

window.executarCalculo = function() {
    const dinheiro = parseFloat(document.getElementById('auxilioDinheiro').value) || 0;
    const combustivel = parseFloat(document.getElementById('auxilioCombustivel').value) || 0;
    if (dinheiro + combustivel === 0) return notificar('Informe pelo menos um valor de auxílio', 'erro');
    const res = calcularAuxilio(dinheiro, combustivel);
    if (!res.length) return;
    let html = '<h3>Resultado</h3><table><thead><tr><th>Rota</th><th>Bruto (R$)</th><th>% Bruto</th><th>Auxílio (R$)</th><th>% Auxílio</th><th>Após auxílio</th><th>Após passagens</th></tr></thead><tbody>';
    res.forEach(r => {
        html += `<tr>
            <td>${r.rota}</td>
            <td>${r.bruto.toFixed(2)}</td>
            <td>${r.percBruto}%</td>
            <td>${r.auxilio.toFixed(2)}</td>
            <td>${r.percAuxilio}%</td>
            <td>${r.aposAuxilio.toFixed(2)}</td>
            <td>${r.aposPassagens.toFixed(2)}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    res.forEach(r => {
        html += `<h4>${r.rota} - Alunos</h4><ul>`;
        r.alunos.forEach(a => html += `<li>${a.nome}: R$ ${a.valor.toFixed(2)}</li>`);
        html += '</ul>';
    });
    html += '<button onclick="salvarCalculoNoHistorico()">Salvar no histórico</button>';
    document.getElementById('resultado-calculo').innerHTML = html;
};

function salvarCalculoNoHistorico() {
    if (!state.calculoAtual) return notificar('Nenhum cálculo para salvar', 'erro');
    state.historicoCalculos.push(state.calculoAtual);
    salvarBackup();
    notificar('Cálculo salvo no histórico', 'sucesso');
}

// ==================== HISTÓRICO ====================
function excluirRegistroHistorico(index) {
    if (state.usuarioLogado.perfil !== 'admin' && state.usuarioLogado.perfil !== 'taylor') {
        return notificar('Permissão negada', 'erro');
    }
    state.historicoCalculos.splice(index, 1);
    salvarBackup();
    render();
}

function paginaHistorico() {
    let html = '<h2>Histórico de Cálculos</h2>';
    if (!state.historicoCalculos.length) return html + '<p>Nenhum registro</p>';
    html += '<ul>';
    state.historicoCalculos.forEach((calc, idx) => {
        html += `<li>${new Date(calc.data).toLocaleString()} - Auxílio total: R$ ${calc.auxilioTotal} (Dinheiro: R$ ${calc.auxilioDinheiro}, Combustível: R$ ${calc.auxilioCombustivel}) 
            <button onclick="excluirRegistroHistorico(${idx})">Excluir</button>
            <button onclick="visualizarRelatorio(${idx})">Ver relatório</button>
        </li>`;
    });
    html += '</ul>';
    return html;
}

function visualizarRelatorio(index) {
    state.calculoAtual = state.historicoCalculos[index];
    mudarPagina('relatorio');
}

// ==================== RELATÓRIO ====================
function paginaRelatorio() {
    if (!state.calculoAtual) return '<h2>Relatório</h2><p>Selecione um cálculo no histórico.</p>';
    return `
        <h2>Relatório do Cálculo</h2>
        <button onclick="imprimirRelatorio()">Exportar PDF</button>
        <div id="relatorio-conteudo" class="card">
            ${gerarHTMLRelatorio(state.calculoAtual)}
        </div>
    `;
}

function gerarHTMLRelatorio(calc) {
    let html = `<h3>Data: ${new Date(calc.data).toLocaleString()}</h3>`;
    html += `<p>Auxílio total: R$ ${calc.auxilioTotal} (Dinheiro: R$ ${calc.auxilioDinheiro}, Combustível: R$ ${calc.auxilioCombustivel})</p>`;
    html += '<h4>Distribuição 30/70</h4>';
    html += '<table><thead><tr><th>Rota</th><th>Bruto (R$)</th><th>% Bruto</th><th>Auxílio (R$)</th><th>% Auxílio</th><th>Após auxílio</th><th>Após passagens</th></tr></thead><tbody>';
    calc.resultados.forEach(r => {
        html += `<tr>
            <td>${r.rota}</td>
            <td>${r.bruto.toFixed(2)}</td>
            <td>${r.percBruto}%</td>
            <td>${r.auxilio.toFixed(2)}</td>
            <td>${r.percAuxilio}%</td>
            <td>${r.aposAuxilio.toFixed(2)}</td>
            <td>${r.aposPassagens.toFixed(2)}</td>
        </tr>`;
    });
    html += '</tbody></table>';

    calc.resultados.forEach(r => {
        html += `<h4>${r.rota} - Rateio por aluno</h4>`;
        html += '<table><thead><tr><th>Aluno</th><th>Valor a pagar (R$)</th></tr></thead><tbody>';
        r.alunos.forEach(a => {
            html += `<tr><td>${a.nome}</td><td>${a.valor.toFixed(2)}</td></tr>`;
        });
        html += '</tbody></table>';
    });

    html += '<h4>Memória de cálculo (regra 30/70)</h4>';
    html += '<p>O auxílio total é dividido pelo maior número de dias rodados entre as rotas. Em cada dia:</p>';
    html += '<ul>';
    html += '<li>Se todas as rotas rodaram: divisão proporcional ao bruto do dia.</li>';
    html += '<li>Se apenas uma rota rodou: 70% para quem rodou, 30% para quem não rodou.</li>';
    html += '<li>Se mais de uma, mas não todas: divisão proporcional entre as que rodaram.</li>';
    html += '</ul>';
    return html;
}

function imprimirRelatorio() {
    if (!state.calculoAtual) return;
    const win = window.open('', '_blank');
    win.document.write(`
        <html>
            <head>
                <title>Relatório ASSEUF</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background-color: #4CAF50; color: white; }
                    .orange { background-color: #FF9800; }
                </style>
            </head>
            <body>
                ${gerarHTMLRelatorio(state.calculoAtual)}
            </body>
        </html>
    `);
    win.document.close();
    win.print();
}

// ==================== BACKUP ====================
function paginaBackup() {
    return `
        <h2>Backup</h2>
        <div class="card">
            <button onclick="exportarBackup()">Exportar Backup (JSON)</button>
            <button onclick="document.getElementById('importFile').click()">Importar Backup (JSON)</button>
            <input type="file" id="importFile" style="display:none" accept=".json" onchange="importarBackup(event)">
            <hr>
            <button onclick="imprimirRelatorio()">Exportar último cálculo como PDF</button>
        </div>
    `;
}

function exportarBackup() {
    const dataStr = JSON.stringify({
        usuarios: state.usuarios,
        rotas: state.rotas,
        historicoCalculos: state.historicoCalculos
    }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assef_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notificar('Backup exportado', 'sucesso');
}

function importarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const backup = JSON.parse(e.target.result);
            state.usuarios = backup.usuarios || state.usuarios;
            state.rotas = backup.rotas || [];
            state.historicoCalculos = backup.historicoCalculos || [];
            salvarBackup();
            notificar('Backup importado', 'sucesso');
            render();
        } catch (err) {
            notificar('Arquivo inválido', 'erro');
        }
    };
    reader.readAsText(file);
}

// ==================== INICIALIZAÇÃO ====================
window.addEventListener('load', () => {
    carregarBackup();
    criarUsuarioAdminPadrao();
    render();
});

// Expor funções globais para os onclick
window.mudarPagina = mudarPagina;
window.fazerLogin = fazerLogin;
window.logout = logout;
window.alternarTema = alternarTema;
window.excluirRota = excluirRota;
window.salvarRota = salvarRota;
window.executarCalculo = executarCalculo;
window.salvarCalculoNoHistorico = salvarCalculoNoHistorico;
window.excluirRegistroHistorico = excluirRegistroHistorico;
window.visualizarRelatorio = visualizarRelatorio;
window.imprimirRelatorio = imprimirRelatorio;
window.exportarBackup = exportarBackup;
window.importarBackup = importarBackup;
