// ============================================
// SISTEMA DE TRANSPORTE PRO - VERSÃO PREMIUM
// ============================================

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBv1XzJxZq5L8K9WqY3p8X7vZ9qW5rT2uY",
    authDomain: "transporte-pro.firebaseapp.com",
    projectId: "transporte-pro",
    storageBucket: "transporte-pro.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456ghi789jkl"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Variáveis Globais
let graficoComparativo = null;
let graficoDistribuicao = null;
let historicoRateios = [];
let veiculosCadastrados = [];
let usuarioAtual = null;
let nivelAcesso = 'usuario';

// ============================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================

function fazerLogin() {
    const usuario = document.getElementById('loginUser').value;
    const senha = document.getElementById('loginPassword').value;
    
    // Credenciais fixas (em produção, usar Firebase Auth)
    const usuarios = {
        'taylor': { senha: '1296', nivel: 'admin', nome: 'Taylor' },
        'tesoureiro': { senha: '0000', nivel: 'tesoureiro', nome: 'Tesoureiro' },
        'usuario': { senha: '1010', nivel: 'usuario', nome: 'Usuário' }
    };
    
    if (usuarios[usuario] && usuarios[usuario].senha === senha) {
        usuarioAtual = {
            id: usuario,
            nome: usuarios[usuario].nome,
            nivel: usuarios[usuario].nivel
        };
        nivelAcesso = usuarios[usuario].nivel;
        
        // Esconder tela de login
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('appWrapper').style.display = 'flex';
        
        // Atualizar informações do usuário
        document.getElementById('userName').textContent = usuarioAtual.nome;
        document.getElementById('userRole').textContent = 
            usuarioAtual.nivel === 'admin' ? 'Administrador' : 
            usuarioAtual.nivel === 'tesoureiro' ? 'Tesoureiro' : 'Usuário';
        
        // Aplicar permissões
        aplicarPermissoes();
        
        // Inicializar app
        inicializarApp();
        
        mostrarToast(`Bem-vindo, ${usuarioAtual.nome}!`);
    } else {
        mostrarToast('Usuário ou senha inválidos!', 'error');
    }
}

function logout() {
    usuarioAtual = null;
    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('appWrapper').style.display = 'none';
}

function aplicarPermissoes() {
    // Desabilitar itens baseado no nível de acesso
    document.querySelectorAll('.nav-item').forEach(item => {
        if (nivelAcesso === 'usuario') {
            if (item.dataset.page === 'rateio' || item.dataset.page === 'veiculos' || item.dataset.page === 'configuracoes') {
                item.style.display = 'none';
            }
        }
    });
    
    // Desabilitar botões de ação
    if (nivelAcesso === 'usuario') {
        document.getElementById('btnSalvarRateio')?.setAttribute('disabled', 'true');
        document.getElementById('btnNovoVeiculo')?.setAttribute('disabled', 'true');
        document.getElementById('btnLimparHistorico')?.setAttribute('disabled', 'true');
        
        // Desabilitar inputs de rateio
        document.querySelectorAll('#rateio-page input, #rateio-page select').forEach(input => {
            input.setAttribute('disabled', 'true');
        });
        
        // Desabilitar inputs de veículos
        document.querySelectorAll('#veiculos-page button').forEach(btn => {
            if (!btn.classList.contains('btn-view')) {
                btn.setAttribute('disabled', 'true');
            }
        });
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

function inicializarApp() {
    // Carregar dados
    carregarHistorico();
    carregarVeiculos();
    
    // Inicializar data atual
    atualizarDataAtual();
    
    // Inicializar datepicker
    if (document.querySelector('.datepicker')) {
        flatpickr('.datepicker', {
            locale: 'pt',
            dateFormat: 'd/m/Y',
            defaultDate: 'today'
        });
    }
    
    // Inicializar dashboards
    atualizarDashboard();
    
    // Inicializar tabela de recentes
    atualizarTabelaRecente();
    
    // Inicializar listeners
    inicializarListeners();
    
    // Gerar veículos iniciais vazios
    gerarVeiculos(0, 1);
    gerarVeiculos(1, 1);
    
    // Atualizar contadores de alunos
    atualizarContadoresAlunos();
    
    // Limpar campos
    limparCamposRateio();
}

function limparCamposRateio() {
    document.getElementById('auxilioTotal').value = '';
    document.getElementById('integral0').value = '';
    document.getElementById('desc0').value = '';
    document.getElementById('integral1').value = '';
    document.getElementById('desc1').value = '';
    document.getElementById('passagens0').value = '0';
    document.getElementById('passagens1').value = '0';
    document.getElementById('rateioDescricao').value = '';
    document.getElementById('rateioData').value = '';
}

function inicializarListeners() {
    // Theme toggle
    document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
    
    // Menu toggle (mobile)
    document.querySelector('.menu-toggle').addEventListener('click', toggleSidebar);
    
    // Navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.classList.contains('disabled')) return;
            const page = this.dataset.page;
            mudarPagina(page);
        });
    });
    
    // Inputs de alunos
    document.querySelectorAll('.aluno-input').forEach(input => {
        input.addEventListener('input', atualizarContadoresAlunos);
    });
    
    // Chart period
    document.getElementById('chartPeriod')?.addEventListener('change', function() {
        atualizarGraficos();
    });
}

// ============================================
// FUNÇÕES DE TEMA E INTERFACE
// ============================================

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = document.querySelector('.theme-toggle i');
    if (document.body.classList.contains('dark-theme')) {
        icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

function mudarPagina(pagina) {
    // Verificar permissão
    if (nivelAcesso === 'usuario' && (pagina === 'rateio' || pagina === 'veiculos' || pagina === 'configuracoes')) {
        mostrarToast('Você não tem permissão para acessar esta página!', 'warning');
        return;
    }
    
    // Atualizar active na navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pagina) {
            item.classList.add('active');
        }
    });
    
    // Atualizar página visível
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${pagina}-page`).classList.add('active');
    
    // Atualizar título
    const titles = {
        'dashboard': 'Dashboard',
        'rateio': 'Rateio',
        'historico': 'Histórico',
        'veiculos': 'Veículos',
        'relatorios': 'Relatórios',
        'configuracoes': 'Configurações'
    };
    document.getElementById('page-title').textContent = titles[pagina];
    
    // Atualizar conteúdo específico da página
    if (pagina === 'dashboard') {
        atualizarDashboard();
    } else if (pagina === 'historico') {
        atualizarTabelaHistorico();
    } else if (pagina === 'veiculos') {
        atualizarGridVeiculos();
    }
}

function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');
    
    toastMessage.textContent = mensagem;
    
    if (tipo === 'success') {
        icon.className = 'fas fa-check-circle';
        toast.style.background = 'linear-gradient(135deg, #06d6a0 0%, #05b588 100%)';
    } else if (tipo === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        toast.style.background = 'linear-gradient(135deg, #ef476f 0%, #d43f63 100%)';
    } else if (tipo === 'warning') {
        icon.className = 'fas fa-exclamation-triangle';
        toast.style.background = 'linear-gradient(135deg, #ffd166 0%, #ffb347 100%)';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function atualizarDataAtual() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('pt-BR', options);
    document.getElementById('currentDate').textContent = today;
}

// ============================================
// FUNÇÕES DE VEÍCULOS
// ============================================

function gerarVeiculos(rota, qtd) {
    let container = document.getElementById("veiculos" + rota);
    container.innerHTML = "";
    
    for (let i = 0; i < qtd; i++) {
        let veiculoDiv = document.createElement('div');
        veiculoDiv.className = 'veiculo-card';
        veiculoDiv.style.animation = 'fadeIn 0.3s ease';
        veiculoDiv.style.animationDelay = `${i * 0.1}s`;
        
        // Verificar se existe veículo cadastrado para sugerir nome
        const veiculoSugerido = veiculosCadastrados.find(v => v.rotaPadrao == rota);
        const nomeSugerido = veiculoSugerido ? veiculoSugerido.nome : `Veículo ${i + 1}`;
        
        veiculoDiv.innerHTML = `
            <h4><i class="fas fa-bus"></i> ${nomeSugerido}</h4>
            <div class="input-group">
                <label><i class="fas fa-tag"></i> Nome:</label>
                <input type="text" value="${nomeSugerido}" placeholder="Ex: Ônibus A" ${nivelAcesso === 'usuario' ? 'disabled' : ''}>
            </div>
            <div class="input-group">
                <label><i class="fas fa-dollar-sign"></i> Diária (R$):</label>
                <input type="number" step="0.01" min="0" value="150" ${nivelAcesso === 'usuario' ? 'disabled' : ''}>
            </div>
            <div class="input-group">
                <label><i class="fas fa-calendar-alt"></i> Nº Diárias:</label>
                <input type="number" min="0" value="1" ${nivelAcesso === 'usuario' ? 'disabled' : ''}>
            </div>
        `;
        
        container.appendChild(veiculoDiv);
    }
    
    // Atualizar contador de veículos
    document.getElementById(`totalVeiculos${rota}`).textContent = qtd;
}

function calcularTotalRota(rota) {
    let container = document.getElementById("veiculos" + rota);
    let veiculos = container.querySelectorAll(".veiculo-card");
    let total = 0;
    
    veiculos.forEach(veiculo => {
        let inputs = veiculo.querySelectorAll("input");
        if (inputs.length >= 3) {
            let diaria = parseFloat(inputs[1].value) || 0;
            let qtd = parseFloat(inputs[2].value) || 0;
            total += diaria * qtd;
        }
    });
    
    return total;
}

// ============================================
// FUNÇÕES DE CÁLCULO (MANTIDAS DO ORIGINAL)
// ============================================

function calcular() {
    // Cálculos principais
    let bruto0 = calcularTotalRota(0);
    let bruto1 = calcularTotalRota(1);
    let brutoGeral = bruto0 + bruto1;

    let auxTotal = parseFloat(document.getElementById("auxilioTotal").value) || 0;

    let passagens0 = parseFloat(document.getElementById("passagens0").value) || 0;
    let passagens1 = parseFloat(document.getElementById("passagens1").value) || 0;

    // Rateio do auxílio
    let aux0 = brutoGeral > 0 ? (bruto0 / brutoGeral) * auxTotal : 0;
    let aux1 = brutoGeral > 0 ? (bruto1 / brutoGeral) * auxTotal : 0;

    let rateio0 = bruto0 - aux0 - passagens0;
    let rateio1 = bruto1 - aux1 - passagens1;

    let integral0 = parseInt(document.getElementById("integral0").value) || 0;
    let desc0 = parseInt(document.getElementById("desc0").value) || 0;

    let integral1 = parseInt(document.getElementById("integral1").value) || 0;
    let desc1 = parseInt(document.getElementById("desc1").value) || 0;

    let peso0 = integral0 + (desc0 * 0.5);
    let peso1 = integral1 + (desc1 * 0.5);

    let valorInt0 = peso0 > 0 ? rateio0 / peso0 : 0;
    let valorDesc0 = valorInt0 / 2;

    let valorInt1 = peso1 > 0 ? rateio1 / peso1 : 0;
    let valorDesc1 = valorInt1 / 2;

    // Atualizar tabela de resultado
    let tbody = document.querySelector("#tabelaResultado tbody");
    tbody.innerHTML = `
        <tr>
            <td><i class="fas fa-map-pin" style="color: #4361ee;"></i> 7 Lagoas</td>
            <td>R$ ${bruto0.toFixed(2)}</td>
            <td>R$ ${aux0.toFixed(2)}</td>
            <td>R$ ${passagens0.toFixed(2)}</td>
            <td class="destaque">R$ ${rateio0.toFixed(2)}</td>
            <td>R$ ${valorInt0.toFixed(2)}</td>
            <td>R$ ${valorDesc0.toFixed(2)}</td>
        </tr>
        <tr>
            <td><i class="fas fa-map-pin" style="color: #06d6a0;"></i> Curvelo</td>
            <td>R$ ${bruto1.toFixed(2)}</td>
            <td>R$ ${aux1.toFixed(2)}</td>
            <td>R$ ${passagens1.toFixed(2)}</td>
            <td class="destaque">R$ ${rateio1.toFixed(2)}</td>
            <td>R$ ${valorInt1.toFixed(2)}</td>
            <td>R$ ${valorDesc1.toFixed(2)}</td>
        </tr>
    `;

    // Mostrar preview do resultado
    document.getElementById('resultadoPreview').style.display = 'block';

    return {
        rotas: [
            { 
                nome: '7 Lagoas', 
                bruto: bruto0, 
                auxilio: aux0, 
                passagens: passagens0, 
                rateio: rateio0, 
                integral: valorInt0, 
                meia: valorDesc0,
                qtdIntegral: integral0,
                qtdMeia: desc0
            },
            { 
                nome: 'Curvelo', 
                bruto: bruto1, 
                auxilio: aux1, 
                passagens: passagens1, 
                rateio: rateio1, 
                integral: valorInt1, 
                meia: valorDesc1,
                qtdIntegral: integral1,
                qtdMeia: desc1
            }
        ],
        totalGeral: brutoGeral,
        auxTotal: auxTotal
    };
}

function calcularComHistorico() {
    if (nivelAcesso === 'usuario') {
        mostrarToast('Você não tem permissão para salvar rateios!', 'warning');
        return;
    }
    
    const resultado = calcular();
    
    // Validar campos obrigatórios
    if (!document.getElementById('auxilioTotal').value) {
        mostrarToast('Preencha o valor do auxílio total!', 'warning');
        return;
    }
    
    if (!document.getElementById('integral0').value || !document.getElementById('integral1').value) {
        mostrarToast('Preencha a quantidade de alunos!', 'warning');
        return;
    }
    
    // Obter descrição
    let descricao = document.getElementById('rateioDescricao').value;
    if (!descricao) {
        descricao = `Rateio - ${new Date().toLocaleDateString('pt-BR')}`;
    }
    
    // Obter data
    let dataInput = document.getElementById('rateioData').value;
    let data = dataInput ? dataInput : new Date().toLocaleDateString('pt-BR');
    
    // Criar registro de histórico
    const registro = {
        id: Date.now(),
        data: data,
        descricao: descricao,
        auxTotal: resultado.auxTotal,
        totalGeral: resultado.totalGeral,
        rotas: resultado.rotas,
        timestamp: new Date().toISOString(),
        usuario: usuarioAtual?.nome || 'Sistema'
    };
    
    // Salvar no Firebase
    salvarHistoricoFirebase(registro);
}

// ============================================
// FUNÇÕES DE HISTÓRICO (COM FIREBASE)
// ============================================

async function salvarHistoricoFirebase(registro) {
    try {
        await db.collection('historico').add(registro);
        
        // Adicionar ao array local
        historicoRateios.unshift(registro);
        
        // Atualizar interfaces
        atualizarTabelaRecente();
        atualizarDashboard();
        
        mostrarToast('Rateio salvo no histórico com sucesso!');
        
        // Limpar campos após salvar
        limparCamposRateio();
    } catch (error) {
        console.error('Erro ao salvar:', error);
        mostrarToast('Erro ao salvar rateio!', 'error');
    }
}

async function carregarHistorico() {
    try {
        const snapshot = await db.collection('historico')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();
        
        historicoRateios = [];
        snapshot.forEach(doc => {
            historicoRateios.push({ id: doc.id, ...doc.data() });
        });
        
        if (historicoRateios.length === 0) {
            // Dados de exemplo apenas para demonstração
            historicoRateios = gerarDadosExemplo();
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        historicoRateios = gerarDadosExemplo();
    }
}

function gerarDadosExemplo() {
    const dados = [];
    const hoje = new Date();
    
    for (let i = 0; i < 5; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        
        const bruto0 = Math.random() * 5000 + 3000;
        const bruto1 = Math.random() * 4000 + 2000;
        const auxTotal = 4000;
        
        dados.push({
            id: Date.now() - i * 86400000,
            data: data.toLocaleDateString('pt-BR'),
            descricao: `Rateio ${data.toLocaleDateString('pt-BR')}`,
            auxTotal: auxTotal,
            totalGeral: bruto0 + bruto1,
            rotas: [
                { 
                    nome: '7 Lagoas', 
                    bruto: bruto0, 
                    auxilio: (bruto0/(bruto0+bruto1))*auxTotal, 
                    passagens: 150, 
                    rateio: bruto0 - (bruto0/(bruto0+bruto1))*auxTotal - 150,
                    integral: 85.50,
                    meia: 42.75,
                    qtdIntegral: 12,
                    qtdMeia: 2
                },
                { 
                    nome: 'Curvelo', 
                    bruto: bruto1, 
                    auxilio: (bruto1/(bruto0+bruto1))*auxTotal, 
                    passagens: 120, 
                    rateio: bruto1 - (bruto1/(bruto0+bruto1))*auxTotal - 120,
                    integral: 78.30,
                    meia: 39.15,
                    qtdIntegral: 10,
                    qtdMeia: 3
                }
            ]
        });
    }
    
    return dados;
}

function atualizarTabelaRecente() {
    const tbody = document.getElementById('recentTableBody');
    if (!tbody) return;
    
    const recentes = historicoRateios.slice(0, 5);
    
    tbody.innerHTML = recentes.map(item => {
        let rows = '';
        item.rotas.forEach(rota => {
            rows += `
                <tr>
                    <td>${item.data}</td>
                    <td>${rota.nome}</td>
                    <td>R$ ${rota.rateio.toFixed(2)}</td>
                    <td><span class="badge-status success">Concluído</span></td>
                </tr>
            `;
        });
        return rows;
    }).join('');
}

function atualizarTabelaHistorico() {
    const tbody = document.getElementById('historicoTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = historicoRateios.map(item => {
        let rows = '';
        item.rotas.forEach((rota, index) => {
            rows += `
                <tr>
                    ${index === 0 ? `<td rowspan="${item.rotas.length}">${item.data}</td>` : ''}
                    ${index === 0 ? `<td rowspan="${item.rotas.length}">${item.descricao}</td>` : ''}
                    <td>${rota.nome}</td>
                    <td>R$ ${rota.bruto.toFixed(2)}</td>
                    <td>R$ ${rota.auxilio.toFixed(2)}</td>
                    <td>R$ ${rota.passagens.toFixed(2)}</td>
                    <td>R$ ${rota.rateio.toFixed(2)}</td>
                    <td>R$ ${rota.integral.toFixed(2)}</td>
                    <td>R$ ${rota.meia.toFixed(2)}</td>
                    <td>
                        <button class="btn-icon" onclick="visualizarDetalhes('${item.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${nivelAcesso !== 'usuario' ? `
                            <button class="btn-icon" onclick="excluirRateio('${item.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
        return rows;
    }).join('');
}

function visualizarDetalhes(id) {
    const rateio = historicoRateios.find(r => r.id == id);
    if (!rateio) return;
    
    const modalBody = document.getElementById('detalhesRateioBody');
    
    let html = `
        <div class="detalhes-rateio">
            <h4>Informações Gerais</h4>
            <p><strong>Data:</strong> ${rateio.data}</p>
            <p><strong>Descrição:</strong> ${rateio.descricao}</p>
            <p><strong>Usuário:</strong> ${rateio.usuario || 'Sistema'}</p>
            <p><strong>Auxílio Total:</strong> R$ ${rateio.auxTotal.toFixed(2)}</p>
            <p><strong>Total Geral:</strong> R$ ${rateio.totalGeral.toFixed(2)}</p>
            
            <h4 style="margin-top: 20px;">Detalhamento por Rota</h4>
    `;
    
    rateio.rotas.forEach(rota => {
        html += `
            <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h5 style="color: var(--primary);">${rota.nome}</h5>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px;">
                    <p><strong>Alunos Integrais:</strong> ${rota.qtdIntegral || 0}</p>
                    <p><strong>Alunos Meia:</strong> ${rota.qtdMeia || 0}</p>
                    <p><strong>Valor Integral:</strong> R$ ${rota.integral.toFixed(2)}</p>
                    <p><strong>Valor Meia:</strong> R$ ${rota.meia.toFixed(2)}</p>
                    <p><strong>Total Bruto:</strong> R$ ${rota.bruto.toFixed(2)}</p>
                    <p><strong>Total Rateado:</strong> R$ ${rota.rateio.toFixed(2)}</p>
                </div>
            </div>
        `;
    });
    
    modalBody.innerHTML = html;
    document.getElementById('detalhesRateioModal').style.display = 'flex';
}

function fecharModalDetalhes() {
    document.getElementById('detalhesRateioModal').style.display = 'none';
}

async function excluirRateio(id) {
    if (nivelAcesso === 'usuario') {
        mostrarToast('Você não tem permissão para excluir!', 'warning');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir este rateio?')) {
        try {
            await db.collection('historico').doc(id).delete();
            historicoRateios = historicoRateios.filter(r => r.id != id);
            atualizarTabelaHistorico();
            atualizarDashboard();
            mostrarToast('Rateio excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir:', error);
            mostrarToast('Erro ao excluir rateio!', 'error');
        }
    }
}

function filtrarHistorico() {
    const busca = document.getElementById('historicoBusca').value.toLowerCase();
    const periodo = document.getElementById('historicoPeriodo').value;
    
    let filtrados = [...historicoRateios];
    
    // Filtrar por busca
    if (busca) {
        filtrados = filtrados.filter(item => 
            item.descricao.toLowerCase().includes(busca) ||
            item.rotas.some(r => r.nome.toLowerCase().includes(busca))
        );
    }
    
    // Filtrar por período
    if (periodo !== 'all') {
        const hoje = new Date();
        filtrados = filtrados.filter(item => {
            const [dia, mes, ano] = item.data.split('/');
            const dataItem = new Date(ano, mes - 1, dia);
            
            if (periodo === 'today') {
                return dataItem.toDateString() === hoje.toDateString();
            } else if (periodo === 'week') {
                const umaSemana = new Date(hoje);
                umaSemana.setDate(hoje.getDate() - 7);
                return dataItem >= umaSemana;
            } else if (periodo === 'month') {
                return dataItem.getMonth() === hoje.getMonth() && 
                       dataItem.getFullYear() === hoje.getFullYear();
            }
        });
    }
    
    // Atualizar tabela com filtrados
    const tbody = document.getElementById('historicoTableBody');
    tbody.innerHTML = filtrados.map(item => {
        let rows = '';
        item.rotas.forEach((rota, index) => {
            rows += `
                <tr>
                    ${index === 0 ? `<td rowspan="${item.rotas.length}">${item.data}</td>` : ''}
                    ${index === 0 ? `<td rowspan="${item.rotas.length}">${item.descricao}</td>` : ''}
                    <td>${rota.nome}</td>
                    <td>R$ ${rota.bruto.toFixed(2)}</td>
                    <td>R$ ${rota.auxilio.toFixed(2)}</td>
                    <td>R$ ${rota.passagens.toFixed(2)}</td>
                    <td>R$ ${rota.rateio.toFixed(2)}</td>
                    <td>R$ ${rota.integral.toFixed(2)}</td>
                    <td>R$ ${rota.meia.toFixed(2)}</td>
                    <td>
                        <button class="btn-icon" onclick="visualizarDetalhes('${item.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${nivelAcesso !== 'usuario' ? `
                            <button class="btn-icon" onclick="excluirRateio('${item.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
        return rows;
    }).join('');
}

async function limparHistorico() {
    if (nivelAcesso !== 'admin') {
        mostrarToast('Apenas administradores podem limpar o histórico!', 'warning');
        return;
    }
    
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
        try {
            const snapshot = await db.collection('historico').get();
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            
            historicoRateios = [];
            atualizarTabelaHistorico();
            atualizarDashboard();
            mostrarToast('Histórico limpo com sucesso!');
        } catch (error) {
            console.error('Erro ao limpar histórico:', error);
            mostrarToast('Erro ao limpar histórico!', 'error');
        }
    }
}

function exportarHistoricoCSV() {
    let csv = 'Data,Descrição,Rota,Total Bruto,Auxílio,Passagens,Total Rateado,Valor Integral,Valor 50%\n';
    
    historicoRateios.forEach(item => {
        item.rotas.forEach(rota => {
            csv += `${item.data},${item.descricao},${rota.nome},${rota.bruto.toFixed(2)},${rota.auxilio.toFixed(2)},${rota.passagens.toFixed(2)},${rota.rateio.toFixed(2)},${rota.integral.toFixed(2)},${rota.meia.toFixed(2)}\n`;
        });
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_rateios_${new Date().toLocaleDateString()}.csv`;
    a.click();
    
    mostrarToast('CSV exportado com sucesso!');
}

// ============================================
// FUNÇÕES DE DASHBOARD
// ============================================

function atualizarDashboard() {
    atualizarStats();
    atualizarGraficos();
}

function atualizarStats() {
    if (historicoRateios.length === 0) return;
    
    // Total rateado no mês
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    let totalRateadoMes = 0;
    let totalVeiculos = 0;
    let totalAlunos = 0;
    
    historicoRateios.forEach(item => {
        const [dia, mes, ano] = item.data.split('/');
        if (parseInt(mes) - 1 === mesAtual && parseInt(ano) === anoAtual) {
            item.rotas.forEach(rota => {
                totalRateadoMes += rota.rateio;
            });
        }
        
        // Estimar veículos e alunos (baseado no último rateio)
        if (item === historicoRateios[0]) {
            item.rotas.forEach(rota => {
                if (rota.nome.includes('7 Lagoas')) {
                    totalVeiculos += 1;
                    totalAlunos += (rota.qtdIntegral || 12) + (rota.qtdMeia || 2);
                } else {
                    totalVeiculos += 1;
                    totalAlunos += (rota.qtdIntegral || 12) + (rota.qtdMeia || 2);
                }
            });
        }
    });
    
    // Ticket médio
    const ticketMedio = totalAlunos > 0 ? totalRateadoMes / totalAlunos : 0;
    
    document.getElementById('totalRateadoMes').textContent = `R$ ${totalRateadoMes.toFixed(2)}`;
    document.getElementById('totalVeiculos').textContent = totalVeiculos;
    document.getElementById('totalAlunos').textContent = totalAlunos;
    document.getElementById('ticketMedio').textContent = `R$ ${ticketMedio.toFixed(2)}`;
}

function atualizarGraficos() {
    const periodo = document.getElementById('chartPeriod')?.value || 30;
    
    // Preparar dados para o gráfico comparativo
    const ultimosRateios = historicoRateios.slice(0, parseInt(periodo));
    
    const dados7Lagoas = [];
    const dadosCurvelo = [];
    const labels = [];
    
    ultimosRateios.reverse().forEach(item => {
        labels.push(item.data);
        const rota0 = item.rotas.find(r => r.nome.includes('7 Lagoas'));
        const rota1 = item.rotas.find(r => r.nome.includes('Curvelo'));
        dados7Lagoas.push(rota0 ? rota0.rateio : 0);
        dadosCurvelo.push(rota1 ? rota1.rateio : 0);
    });
    
    // Gráfico Comparativo
    const optionsComparativo = {
        series: [
            {
                name: '7 Lagoas',
                data: dados7Lagoas
            },
            {
                name: 'Curvelo',
                data: dadosCurvelo
            }
        ],
        chart: {
            type: 'area',
            height: 350,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        colors: ['#4361ee', '#06d6a0'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3
            }
        },
        xaxis: {
            categories: labels,
            labels: {
                rotate: -45,
                rotateAlways: true,
                style: {
                    fontSize: '10px'
                }
            }
        },
        yaxis: {
            title: {
                text: 'Valor (R$)'
            },
            labels: {
                formatter: function(value) {
                    return 'R$ ' + value.toFixed(2);
                }
            }
        },
        tooltip: {
            y: {
                formatter: function(value) {
                    return 'R$ ' + value.toFixed(2);
                }
            }
        },
        legend: {
            position: 'top'
        }
    };
    
    if (graficoComparativo) {
        graficoComparativo.destroy();
    }
    
    graficoComparativo = new ApexCharts(document.querySelector("#comparativoChart"), optionsComparativo);
    graficoComparativo.render();
    
    // Gráfico de Distribuição
    if (historicoRateios.length > 0) {
        const ultimo = historicoRateios[0];
        const totalGeral = ultimo.totalGeral;
        const totalAuxilio = ultimo.auxTotal;
        const totalPassagens = ultimo.rotas.reduce((acc, r) => acc + r.passagens, 0);
        const totalRateado = ultimo.rotas.reduce((acc, r) => acc + r.rateio, 0);
        
        const optionsDistribuicao = {
            series: [totalGeral, totalAuxilio, totalPassagens, totalRateado],
            chart: {
                type: 'donut',
                height: 350
            },
            labels: ['Total Bruto', 'Auxílio', 'Passagens', 'Total Rateado'],
            colors: ['#4361ee', '#06d6a0', '#ffd166', '#ef476f'],
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: function(w) {
                                    return 'R$ ' + totalGeral.toFixed(2);
                                }
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val.toFixed(1) + '%';
                }
            },
            legend: {
                position: 'bottom'
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 300
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        };
        
        if (graficoDistribuicao) {
            graficoDistribuicao.destroy();
        }
        
        graficoDistribuicao = new ApexCharts(document.querySelector("#distribuicaoChart"), optionsDistribuicao);
        graficoDistribuicao.render();
    }
}

// ============================================
// FUNÇÕES DE VEÍCULOS (CADASTRO)
// ============================================

function carregarVeiculos() {
    const veiculosSalvos = localStorage.getItem('veiculosCadastrados');
    if (veiculosSalvos) {
        veiculosCadastrados = JSON.parse(veiculosSalvos);
    } else {
        veiculosCadastrados = [];
    }
}

function salvarVeiculos() {
    localStorage.setItem('veiculosCadastrados', JSON.stringify(veiculosCadastrados));
}

function atualizarGridVeiculos() {
    const grid = document.getElementById('veiculosGrid');
    if (!grid) return;
    
    grid.innerHTML = veiculosCadastrados.map(veiculo => `
        <div class="veiculo-card-detalhado">
            <div class="veiculo-header">
                <i class="fas fa-bus"></i>
                <h4>${veiculo.nome}</h4>
                <span class="veiculo-status ativo">Ativo</span>
            </div>
            <div class="veiculo-body">
                <p><i class="fas fa-id-card"></i> Placa: ${veiculo.placa}</p>
                <p><i class="fas fa-users"></i> Capacidade: ${veiculo.capacidade} alunos</p>
                <p><i class="fas fa-route"></i> Rota: ${veiculo.rotaPadrao == 0 ? '7 Lagoas' : 'Curvelo'}</p>
            </div>
            <div class="veiculo-footer">
                <button class="btn-icon" onclick="visualizarVeiculo('${veiculo.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                ${nivelAcesso !== 'usuario' ? `
                    <button class="btn-icon" onclick="editarVeiculo('${veiculo.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="excluirVeiculo('${veiculo.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function abrirModalVeiculo() {
    if (nivelAcesso === 'usuario') {
        mostrarToast('Você não tem permissão para cadastrar veículos!', 'warning');
        return;
    }
    
    document.getElementById('veiculoModal').style.display = 'flex';
    document.getElementById('veiculoNome').value = '';
    document.getElementById('veiculoPlaca').value = '';
    document.getElementById('veiculoCapacidade').value = '';
    document.getElementById('veiculoRota').value = '0';
}

function fecharModalVeiculo() {
    document.getElementById('veiculoModal').style.display = 'none';
}

function salvarVeiculo() {
    const nome = document.getElementById('veiculoNome').value;
    const placa = document.getElementById('veiculoPlaca').value;
    const capacidade = document.getElementById('veiculoCapacidade').value;
    const rota = document.getElementById('veiculoRota').value;
    
    if (!nome || !placa || !capacidade) {
        mostrarToast('Preencha todos os campos!', 'warning');
        return;
    }
    
    const novoVeiculo = {
        id: Date.now(),
        nome: nome,
        placa: placa,
        capacidade: parseInt(capacidade),
        rotaPadrao: parseInt(rota)
    };
    
    veiculosCadastrados.push(novoVeiculo);
    salvarVeiculos();
    atualizarGridVeiculos();
    fecharModalVeiculo();
    
    mostrarToast('Veículo cadastrado com sucesso!');
}

function visualizarVeiculo(id) {
    const veiculo = veiculosCadastrados.find(v => v.id == id);
    if (!veiculo) return;
    
    alert(`
        Veículo: ${veiculo.nome}
        Placa: ${veiculo.placa}
        Capacidade: ${veiculo.capacidade} alunos
        Rota: ${veiculo.rotaPadrao == 0 ? '7 Lagoas' : 'Curvelo'}
    `);
}

function editarVeiculo(id) {
    if (nivelAcesso === 'usuario') {
        mostrarToast('Você não tem permissão para editar veículos!', 'warning');
        return;
    }
    
    const veiculo = veiculosCadastrados.find(v => v.id == id);
    if (!veiculo) return;
    
    document.getElementById('veiculoNome').value = veiculo.nome;
    document.getElementById('veiculoPlaca').value = veiculo.placa;
    document.getElementById('veiculoCapacidade').value = veiculo.capacidade;
    document.getElementById('veiculoRota').value = veiculo.rotaPadrao;
    
    abrirModalVeiculo();
    
    // Remover veículo antigo
    veiculosCadastrados = veiculosCadastrados.filter(v => v.id != id);
}

function excluirVeiculo(id) {
    if (nivelAcesso === 'usuario') {
        mostrarToast('Você não tem permissão para excluir veículos!', 'warning');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
        veiculosCadastrados = veiculosCadastrados.filter(v => v.id != id);
        salvarVeiculos();
        atualizarGridVeiculos();
        mostrarToast('Veículo excluído com sucesso!');
    }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function atualizarContadoresAlunos() {
    const integral0 = parseInt(document.getElementById('integral0').value) || 0;
    const desc0 = parseInt(document.getElementById('desc0').value) || 0;
    const integral1 = parseInt(document.getElementById('integral1').value) || 0;
    const desc1 = parseInt(document.getElementById('desc1').value) || 0;
    
    document.getElementById('totalAlunos0').textContent = integral0 + desc0;
    document.getElementById('totalAlunos1').textContent = integral1 + desc1;
}

function salvarRascunho() {
    const rascunho = {
        auxTotal: document.getElementById('auxilioTotal').value,
        integral0: document.getElementById('integral0').value,
        desc0: document.getElementById('desc0').value,
        passagens0: document.getElementById('passagens0').value,
        integral1: document.getElementById('integral1').value,
        desc1: document.getElementById('desc1').value,
        passagens1: document.getElementById('passagens1').value,
        descricao: document.getElementById('rateioDescricao').value,
        data: document.getElementById('rateioData').value
    };
    
    localStorage.setItem('rascunhoRateio', JSON.stringify(rascunho));
    mostrarToast('Rascunho salvo com sucesso!');
}

function carregarRascunho() {
    const rascunho = localStorage.getItem('rascunhoRateio');
    if (!rascunho) {
        mostrarToast('Nenhum rascunho encontrado!', 'warning');
        return;
    }
    
    const dados = JSON.parse(rascunho);
    
    document.getElementById('auxilioTotal').value = dados.auxTotal || '';
    document.getElementById('integral0').value = dados.integral0 || '';
    document.getElementById('desc0').value = dados.desc0 || '';
    document.getElementById('passagens0').value = dados.passagens0 || '0';
    document.getElementById('integral1').value = dados.integral1 || '';
    document.getElementById('desc1').value = dados.desc1 || '';
    document.getElementById('passagens1').value = dados.passagens1 || '0';
    document.getElementById('rateioDescricao').value = dados.descricao || '';
    document.getElementById('rateioData').value = dados.data || '';
    
    mostrarToast('Rascunho carregado com sucesso!');
}

function exportarJSON() {
    const dados = {
        data: new Date().toISOString(),
        configuracoes: {
            auxTotal: document.getElementById('auxilioTotal').value,
            integral0: document.getElementById('integral0').value,
            desc0: document.getElementById('desc0').value,
            passagens0: document.getElementById('passagens0').value,
            integral1: document.getElementById('integral1').value,
            desc1: document.getElementById('desc1').value,
            passagens1: document.getElementById('passagens1').value,
            descricao: document.getElementById('rateioDescricao').value
        },
        veiculos: veiculosCadastrados
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transporte_dados_${new Date().toLocaleDateString()}.json`;
    a.click();
    
    mostrarToast('Dados exportados com sucesso!');
}

// ============================================
// FUNÇÕES DE RELATÓRIOS DETALHADOS
// ============================================

async function gerarRelatorioMensal() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Cabeçalho
    doc.setFillColor(67, 97, 238);
    doc.rect(0, 0, 297, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório Mensal de Transporte - Detalhado', 20, 13);

    // Data
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.text(`Gerado em: ${dataAtual}`, 250, 13);

    // Filtrar dados do mês atual
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    const rateiosMes = historicoRateios.filter(item => {
        const [dia, mes, ano] = item.data.split('/');
        return parseInt(mes) - 1 === mesAtual && parseInt(ano) === anoAtual;
    });

    // Resumo
    doc.setTextColor(43, 45, 66);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo do Mês', 20, 35);

    let totalBruto = 0;
    let totalAuxilio = 0;
    let totalPassagens = 0;
    let totalRateado = 0;
    let totalAlunos = 0;

    rateiosMes.forEach(item => {
        totalBruto += item.totalGeral;
        totalAuxilio += item.auxTotal;
        item.rotas.forEach(rota => {
            totalPassagens += rota.passagens;
            totalRateado += rota.rateio;
            totalAlunos += (rota.qtdIntegral || 0) + (rota.qtdMeia || 0);
        });
    });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de rateios: ${rateiosMes.length}`, 20, 45);
    doc.text(`Total bruto: R$ ${totalBruto.toFixed(2)}`, 20, 52);
    doc.text(`Total auxílio: R$ ${totalAuxilio.toFixed(2)}`, 20, 59);
    doc.text(`Total passagens: R$ ${totalPassagens.toFixed(2)}`, 20, 66);
    doc.text(`Total rateado: R$ ${totalRateado.toFixed(2)}`, 20, 73);
    doc.text(`Total alunos: ${totalAlunos}`, 20, 80);

    // Detalhamento por rota e valores individuais
    let yPos = 95;
    
    rateiosMes.forEach((item, index) => {
        if (yPos > 180) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 97, 238);
        doc.text(`${item.descricao} - ${item.data}`, 20, yPos);
        yPos += 5;
        
        item.rotas.forEach(rota => {
            if (yPos > 180) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(43, 45, 66);
            doc.text(rota.nome, 25, yPos);
            yPos += 5;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Alunos Integrais: ${rota.qtdIntegral || 0} x R$ ${rota.integral.toFixed(2)} = R$ ${((rota.qtdIntegral || 0) * rota.integral).toFixed(2)}`, 30, yPos);
            yPos += 5;
            doc.text(`Alunos 50%: ${rota.qtdMeia || 0} x R$ ${rota.meia.toFixed(2)} = R$ ${((rota.qtdMeia || 0) * rota.meia).toFixed(2)}`, 30, yPos);
            yPos += 5;
            doc.text(`Total da rota: R$ ${rota.rateio.toFixed(2)}`, 30, yPos);
            yPos += 8;
        });
        
        yPos += 5;
    });

    doc.save('relatorio_mensal_detalhado.pdf');
    mostrarToast('Relatório mensal detalhado gerado com sucesso!');
}

function gerarRelatorioAlunos() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Cabeçalho
    doc.setFillColor(67, 97, 238);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Valores por Aluno', 20, 13);

    // Data
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.text(`Gerado em: ${dataAtual}`, 170, 13);

    if (historicoRateios.length === 0) {
        mostrarToast('Nenhum dado disponível para gerar relatório!', 'warning');
        return;
    }

    const ultimoRateio = historicoRateios[0];
    let yPos = 35;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(43, 45, 66);
    doc.text(`Último Rateio: ${ultimoRateio.descricao} - ${ultimoRateio.data}`, 20, yPos);
    yPos += 10;

    ultimoRateio.rotas.forEach(rota => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 97, 238);
        doc.text(rota.nome, 20, yPos);
        yPos += 5;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(43, 45, 66);
        
        // Alunos Integrais
        if (rota.qtdIntegral > 0) {
            doc.text(`Alunos Integrais: ${rota.qtdIntegral}`, 25, yPos);
            yPos += 5;
            doc.text(`Valor por aluno: R$ ${rota.integral.toFixed(2)}`, 30, yPos);
            yPos += 5;
            doc.text(`Total Integrais: R$ ${(rota.qtdIntegral * rota.integral).toFixed(2)}`, 30, yPos);
            yPos += 8;
        }
        
        // Alunos Meia
        if (rota.qtdMeia > 0) {
            doc.text(`Alunos 50%: ${rota.qtdMeia}`, 25, yPos);
            yPos += 5;
            doc.text(`Valor por aluno: R$ ${rota.meia.toFixed(2)}`, 30, yPos);
            yPos += 5;
            doc.text(`Total 50%: R$ ${(rota.qtdMeia * rota.meia).toFixed(2)}`, 30, yPos);
            yPos += 8;
        }
        
        doc.text(`Total da rota: R$ ${rota.rateio.toFixed(2)}`, 25, yPos);
        yPos += 12;
    });

    // Resumo final
    if (yPos > 230) {
        doc.addPage();
        yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 97, 238);
    doc.text('Resumo Final', 20, yPos);
    yPos += 5;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(43, 45, 66);
    doc.text(`Total Geral Rateado: R$ ${ultimoRateio.rotas.reduce((acc, r) => acc + r.rateio, 0).toFixed(2)}`, 25, yPos);
    yPos += 5;
    doc.text(`Total de Alunos: ${ultimoRateio.rotas.reduce((acc, r) => acc + (r.qtdIntegral || 0) + (r.qtdMeia || 0), 0)}`, 25, yPos);

    doc.save('relatorio_valores_por_aluno.pdf');
    mostrarToast('Relatório por aluno gerado com sucesso!');
}

function gerarRelatorioRotas() {
    gerarRelatorioMensal(); // Reutilizando o mensal que já tem detalhamento
}

function gerarRelatorioFinanceiro() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Cabeçalho
    doc.setFillColor(67, 97, 238);
    doc.rect(0, 0, 297, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório Financeiro Detalhado', 20, 13);

    // Data
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.text(`Gerado em: ${dataAtual}`, 250, 13);

    // Análise financeira
    if (historicoRateios.length === 0) {
        mostrarToast('Nenhum dado disponível!', 'warning');
        return;
    }

    doc.setTextColor(43, 45, 66);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Análise de Custos e Receitas', 20, 35);

    let yPos = 45;
    
    // Totais gerais
    const totalGeral = historicoRateios.reduce((acc, item) => acc + item.totalGeral, 0);
    const totalAuxilio = historicoRateios.reduce((acc, item) => acc + item.auxTotal, 0);
    const totalPassagens = historicoRateios.reduce((acc, item) => 
        acc + item.rotas.reduce((sum, r) => sum + r.passagens, 0), 0);
    const totalRateado = historicoRateios.reduce((acc, item) => 
        acc + item.rotas.reduce((sum, r) => sum + r.rateio, 0), 0);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Bruto Acumulado: R$ ${totalGeral.toFixed(2)}`, 20, yPos);
    yPos += 7;
    doc.text(`Total Auxílio Acumulado: R$ ${totalAuxilio.toFixed(2)}`, 20, yPos);
    yPos += 7;
    doc.text(`Total Passagens Acumulado: R$ ${totalPassagens.toFixed(2)}`, 20, yPos);
    yPos += 7;
    doc.text(`Total Rateado Acumulado: R$ ${totalRateado.toFixed(2)}`, 20, yPos);
    yPos += 10;
    
    // Médias
    const mediaBruto = totalGeral / historicoRateios.length;
    const mediaRateado = totalRateado / historicoRateios.length;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Médias por Rateio', 20, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`Média Bruto: R$ ${mediaBruto.toFixed(2)}`, 20, yPos);
    yPos += 7;
    doc.text(`Média Rateado: R$ ${mediaRateado.toFixed(2)}`, 20, yPos);

    doc.save('relatorio_financeiro.pdf');
    mostrarToast('Relatório financeiro gerado com sucesso!');
}

// ============================================
// INICIALIZAÇÃO DOS GRÁFICOS
// ============================================

// Verificar tema salvo
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.querySelector('.theme-toggle i').className = 'fas fa-sun';
}
