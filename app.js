/*  
===========================================================
SUPER APP.JS — PARTE 1/20
NÚCLEO DO SISTEMA + ESTADO GLOBAL + TEMA CLARO/ESCURO
===========================================================
*/

// ---------------------------------------------------------
// ESTADO GLOBAL DO SISTEMA
// ---------------------------------------------------------
const state = {
    paginaAtual: "login",

    // usuário logado
    usuarioLogado: null,

    // configurações do mês
    mesReferencia: null,
    anoReferencia: null,
    auxilioMensal: 0,

    // rotas
    rotas: [],
    proximaRotaId: 1,
    rotaSelecionada: null,

    // veículos
    veiculoSelecionado: null,

    // descontos
    descontoSelecionado: null,

    // histórico
    historico: [],
    proximoHistoricoId: 1,
    historicoSelecionado: null,

    // logs avançados
    logs: [],

    // tema
    tema: "claro", // claro | escuro

    // modo simulação
    simulacaoAtiva: false,
    simulacaoBackup: null
};


// ---------------------------------------------------------
// FUNÇÃO: ALTERAR TEMA (CLARO/ESCURO)
// ---------------------------------------------------------
function alternarTema() {
    state.tema = state.tema === "claro" ? "escuro" : "claro";
    localStorage.setItem("tema", state.tema);
    aplicarTema();
}

function aplicarTema() {
    document.body.className = state.tema;
}

// carregar tema salvo
(function () {
    const salvo = localStorage.getItem("tema");
    if (salvo) state.tema = salvo;
    aplicarTema();
})();


// ---------------------------------------------------------
// FUNÇÕES UTILITÁRIAS GERAIS
// ---------------------------------------------------------
function formatarMoeda(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarPercentual(v) {
    return v.toFixed(2) + "%";
}

function logInterno(acao, tipo = "info") {
    state.logs.push({
        data: new Date().toLocaleString("pt-BR"),
        usuario: state.usuarioLogado ? state.usuarioLogado.usuario : "sistema",
        acao,
        tipo
    });
}


// ---------------------------------------------------------
// SISTEMA DE NAVEGAÇÃO
// ---------------------------------------------------------
function mudarPagina(p) {
    state.paginaAtual = p;
    render();
}


// ---------------------------------------------------------
// SISTEMA DE RENDERIZAÇÃO BASE
// (será expandido nas próximas partes)
// ---------------------------------------------------------
function render() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div style="padding:20px; text-align:center;">
            <h2>Carregando...</h2>
        </div>
    `;
}


// ---------------------------------------------------------
// COMPONENTES DE UI (BASE)
// ---------------------------------------------------------
const UI = {
    logo() {
        return `
            <h1 style="margin-bottom:10px;">ASSEUF ENTERPRISE PRO</h1>
        `;
    },

    titulo(t) {
        return `<h2 style="margin-bottom:20px;">${t}</h2>`;
    },

    alerta(msg) {
        return `
            <div style="
                background:#ffe6e6;
                padding:10px;
                border-radius:6px;
                color:#900;
                margin:10px 0;
            ">
                ${msg}
            </div>
        `;
    }
};


// ---------------------------------------------------------
// ESTILOS GERAIS (TEMA CLARO + ESCURO)
// ---------------------------------------------------------
const estiloGlobal = document.createElement("style");
estiloGlobal.innerHTML = `
    body.claro {
        background:#f5f5f5;
        color:#222;
        font-family: Arial, sans-serif;
    }

    body.escuro {
        background:#1a1a1a;
        color:#eee;
        font-family: Arial, sans-serif;
    }

    .container {
        max-width: 900px;
        margin: auto;
        padding: 20px;
    }

    .card {
        background: var(--card-bg);
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        box-shadow: 0 0 10px #0002;
    }

    body.claro .card {
        --card-bg: #fff;
    }

    body.escuro .card {
        --card-bg: #2a2a2a;
    }

    .input {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 6px;
        border: 1px solid #ccc;
        font-size: 16px;
    }

    body.escuro .input {
        background:#333;
        color:#fff;
        border:1px solid #555;
    }

    .btn {
        padding: 10px 15px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        margin: 5px;
        font-size: 16px;
    }

    .btn-primary {
        background: #007bff;
        color: white;
    }

    .btn-secondary {
        background: #6c757d;
        color: white;
    }

    .btn-danger {
        background: #dc3545;
        color: white;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
    }

    table th, table td {
        border: 1px solid #ccc;
        padding: 8px;
    }

    body.escuro table th, 
    body.escuro table td {
        border: 1px solid #555;
    }

    .linha {
        margin: 20px 0;
        border: none;
        border-top: 1px solid #ccc;
    }

    body.escuro .linha {
        border-top: 1px solid #555;
    }
`;
document.head.appendChild(estiloGlobal);
/*  
===========================================================
SUPER APP.JS — PARTE 2/20
SISTEMA DE LOGIN + PERFIS AVANÇADOS
===========================================================
*/

// ---------------------------------------------------------
// USUÁRIOS DO SISTEMA (pode expandir depois)
// ---------------------------------------------------------
const usuariosSistema = [
    { usuario: "admin", senha: "123", perfil: "administrador" },
    { usuario: "financeiro", senha: "123", perfil: "financeiro" },
    { usuario: "motorista", senha: "123", perfil: "motorista" },
    { usuario: "auditor", senha: "123", perfil: "auditor" },
    { usuario: "visual", senha: "123", perfil: "visualizador" }
];


// ---------------------------------------------------------
// FUNÇÃO DE LOGIN
// ---------------------------------------------------------
function fazerLogin() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value.trim();

    const encontrado = usuariosSistema.find(u => u.usuario === user && u.senha === pass);

    if (!encontrado) {
        alert("Usuário ou senha incorretos.");
        return;
    }

    state.usuarioLogado = {
        usuario: encontrado.usuario,
        perfil: encontrado.perfil
    };

    logInterno(`Login realizado por ${encontrado.usuario}`, "login");

    mudarPagina("home");
}


// ---------------------------------------------------------
// FUNÇÃO DE LOGOUT
// ---------------------------------------------------------
function logout() {
    logInterno(`Logout de ${state.usuarioLogado.usuario}`, "logout");
    state.usuarioLogado = null;
    mudarPagina("login");
}


// ---------------------------------------------------------
// PÁGINA DE LOGIN
// ---------------------------------------------------------
function paginaLogin() {
    return `
        <div class="container" style="max-width:400px; margin-top:60px;">
            ${UI.logo()}
            ${UI.titulo("Acesso ao Sistema")}

            <div class="card">

                <label class="label">Usuário</label>
                <input id="loginUser" class="input" placeholder="Digite seu usuário">

                <label class="label">Senha</label>
                <input id="loginPass" class="input" type="password" placeholder="Digite sua senha">

                <button class="btn btn-primary" onclick="fazerLogin()">Entrar</button>

                <hr class="linha">

                <button class="btn btn-secondary" onclick="alternarTema()">
                    Alternar Tema (${state.tema})
                </button>
            </div>
        </div>
    `;
}


// ---------------------------------------------------------
// REGISTRO DA PÁGINA NO RENDER
// ---------------------------------------------------------
const renderOriginalParte2 = render;
render = function () {
    const app = document.getElementById("app");
    let html = "";

    switch (state.paginaAtual) {

        case "login":
            html = paginaLogin();
            break;

        default:
            html = renderOriginalParte2();
    }

    app.innerHTML = html;
};
/*  
===========================================================
SUPER APP.JS — PARTE 3/20
CONFIGURAÇÃO DO MÊS + AUXÍLIO + BACKUP AUTOMÁTICO
===========================================================
*/


// ---------------------------------------------------------
// SALVAR CONFIGURAÇÕES DO MÊS
// ---------------------------------------------------------
function salvarConfigMes() {
    const mes = Number(document.getElementById("cfgMes").value);
    const ano = Number(document.getElementById("cfgAno").value);
    const aux = Number(document.getElementById("cfgAux").value);

    if (!mes || mes < 1 || mes > 12) {
        alert("Informe um mês válido (1 a 12).");
        return;
    }

    if (!ano || ano < 2000) {
        alert("Informe um ano válido.");
        return;
    }

    if (!aux || aux <= 0) {
        alert("Informe um valor de auxílio válido.");
        return;
    }

    state.mesReferencia = mes;
    state.anoReferencia = ano;
    state.auxilioMensal = aux;

    logInterno(`Configuração do mês salva: ${mes}/${ano}, auxílio ${aux}`, "config");

    salvarBackup();

    alert("Configurações salvas com sucesso!");
    mudarPagina("home");
}


// ---------------------------------------------------------
// PÁGINA DE CONFIGURAÇÃO DO MÊS
// ---------------------------------------------------------
function paginaConfigMes() {
    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Configurar Mês e Auxílio")}

            <div class="card">

                <label class="label">Mês</label>
                <input id="cfgMes" class="input" type="number" min="1" max="12" 
                    value="${state.mesReferencia || ""}">

                <label class="label">Ano</label>
                <input id="cfgAno" class="input" type="number" min="2000" 
                    value="${state.anoReferencia || ""}">

                <label class="label">Auxílio Mensal (R$)</label>
                <input id="cfgAux" class="input" type="number" min="1" 
                    value="${state.auxilioMensal || ""}">

                <button class="btn btn-primary" onclick="salvarConfigMes()">Salvar</button>

                <hr class="linha">

                <button class="btn btn-secondary" onclick="alternarTema()">
                    Alternar Tema (${state.tema})
                </button>

                <button class="btn btn-secondary" onclick="mudarPagina('home')">
                    Voltar
                </button>
            </div>

            <div class="card">
                <h3>Backup</h3>

                <button class="btn btn-primary" onclick="exportarBackup()">
                    Exportar Backup (.json)
                </button>

                <input type="file" id="importBackupFile" 
                    style="margin-top:10px;" onchange="importarBackup(event)">
            </div>
        </div>
    `;
}


// ---------------------------------------------------------
// BACKUP AUTOMÁTICO (localStorage)
// ---------------------------------------------------------
function salvarBackup() {
    const dados = JSON.stringify(state);
    localStorage.setItem("ASSEUF_BACKUP", dados);
}

function carregarBackup() {
    const salvo = localStorage.getItem("ASSEUF_BACKUP");
    if (!salvo) return;

    try {
        const dados = JSON.parse(salvo);

        // restaurar apenas partes seguras
        state.mesReferencia = dados.mesReferencia;
        state.anoReferencia = dados.anoReferencia;
        state.auxilioMensal = dados.auxilioMensal;
        state.rotas = dados.rotas || [];
        state.proximaRotaId = dados.proximaRotaId || 1;
        state.historico = dados.historico || [];
        state.proximoHistoricoId = dados.proximoHistoricoId || 1;

        logInterno("Backup carregado automaticamente", "backup");

    } catch (e) {
        console.error("Erro ao carregar backup:", e);
    }
}

// carregar backup ao iniciar
carregarBackup();


// ---------------------------------------------------------
// EXPORTAR BACKUP (.json)
// ---------------------------------------------------------
function exportarBackup() {
    const dados = JSON.stringify(state, null, 2);
    const blob = new Blob([dados], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "backup_asseuf.json";
    a.click();

    URL.revokeObjectURL(url);

    logInterno("Backup exportado", "backup");
}


// ---------------------------------------------------------
// IMPORTAR BACKUP (.json)
// ---------------------------------------------------------
function importarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const dados = JSON.parse(e.target.result);

            Object.assign(state, dados);

            salvarBackup();

            alert("Backup importado com sucesso!");
            logInterno("Backup importado", "backup");

            mudarPagina("home");

        } catch (err) {
            alert("Arquivo inválido.");
        }
    };

    reader.readAsText(file);
}


// ---------------------------------------------------------
// REGISTRO DA PÁGINA NO RENDER
// ---------------------------------------------------------
const renderOriginalParte3 = render;
render = function () {
    const app = document.getElementById("app");
    let html = "";

    switch (state.paginaAtual) {

        case "configMes":
            html = paginaConfigMes();
            break;

        default:
            html = renderOriginalParte3();
    }

    app.innerHTML = html;
};
/*  
===========================================================
SUPER APP.JS — PARTE 4/20
CADASTRO DE ROTAS + DUPLICAR MÊS (BASE)
===========================================================
*/


// ---------------------------------------------------------
// ADICIONAR NOVA ROTA
// ---------------------------------------------------------
function adicionarRota() {
    const nome = document.getElementById("novaRotaNome").value.trim();

    if (!nome) {
        alert("Informe o nome da rota.");
        return;
    }

    state.rotas.push({
        id: state.proximaRotaId++,
        nome,
        diasRodados: 0,
        passagens: 0,
        veiculos: [],
        alunos: {
            integrais: 0,
            descontos: []
        },
        calculos: {
            bruto: 0,
            percentualBruto: 0,
            auxilioRecebido: 0,
            valorIntegral: 0,
            valoresDescontos: [],
            totalFinal: 0
        }
    });

    logInterno(`Rota adicionada: ${nome}`, "rota");

    salvarBackup();
    mudarPagina("rotas");
}


// ---------------------------------------------------------
// EXCLUIR ROTA
// ---------------------------------------------------------
function excluirRota(id) {
    const rota = state.rotas.find(r => r.id === id);

    if (!rota) return;

    if (!confirm(`Deseja realmente excluir a rota "${rota.nome}"?`)) return;

    state.rotas = state.rotas.filter(r => r.id !== id);

    logInterno(`Rota excluída: ${rota.nome}`, "rota");

    salvarBackup();
    mudarPagina("rotas");
}


// ---------------------------------------------------------
// SELECIONAR ROTA PARA EDIÇÃO
// ---------------------------------------------------------
function editarRota(id) {
    state.rotaSelecionada = id;
    mudarPagina("editarRota");
}


// ---------------------------------------------------------
// SALVAR EDIÇÃO DA ROTA
// ---------------------------------------------------------
function salvarEdicaoRota() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);

    if (!rota) return;

    const nome = document.getElementById("editRotaNome").value.trim();
    const dias = Number(document.getElementById("editRotaDias").value);
    const pass = Number(document.getElementById("editRotaPass").value);

    if (!nome) {
        alert("Informe o nome da rota.");
        return;
    }

    if (dias < 0) {
        alert("Dias rodados inválidos.");
        return;
    }

    if (pass < 0) {
        alert("Valor de passagens inválido.");
        return;
    }

    rota.nome = nome;
    rota.diasRodados = dias;
    rota.passagens = pass;

    logInterno(`Rota editada: ${nome}`, "rota");

    salvarBackup();
    mudarPagina("rotas");
}


// ---------------------------------------------------------
// PÁGINA DE LISTAGEM DE ROTAS
// ---------------------------------------------------------
function paginaRotas() {

    let tabela = "";

    if (state.rotas.length === 0) {
        tabela = UI.alerta("Nenhuma rota cadastrada.");
    } else {
        tabela = `
            <table>
                <tr>
                    <th>Nome</th>
                    <th>Dias</th>
                    <th>Passagens</th>
                    <th>Ações</th>
                </tr>
                ${state.rotas.map(r => `
                    <tr>
                        <td>${r.nome}</td>
                        <td>${r.diasRodados}</td>
                        <td>${formatarMoeda(r.passagens)}</td>
                        <td>
                            <button class="btn btn-secondary" onclick="editarRota(${r.id})">Editar</button>
                            <button class="btn btn-danger" onclick="excluirRota(${r.id})">Excluir</button>
                        </td>
                    </tr>
                `).join("")}
            </table>
        `;
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Rotas")}

            <div class="card">
                <h3>Adicionar Nova Rota</h3>

                <input id="novaRotaNome" class="input" placeholder="Nome da rota">

                <button class="btn btn-primary" onclick="adicionarRota()">Adicionar</button>
            </div>

            <div class="card">
                <h3>Rotas Cadastradas</h3>
                ${tabela}
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// PÁGINA DE EDIÇÃO DE ROTA
// ---------------------------------------------------------
function paginaEditarRota() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);

    if (!rota) {
        alert("Rota não encontrada.");
        mudarPagina("rotas");
        return "";
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Editar Rota")}

            <div class="card">

                <label class="label">Nome da Rota</label>
                <input id="editRotaNome" class="input" value="${rota.nome}">

                <label class="label">Dias Rodados</label>
                <input id="editRotaDias" class="input" type="number" min="0" value="${rota.diasRodados}">

                <label class="label">Passagens (R$)</label>
                <input id="editRotaPass" class="input" type="number" min="0" value="${rota.passagens}">

                <button class="btn btn-primary" onclick="salvarEdicaoRota()">Salvar</button>

                <hr class="linha">

                <button class="btn btn-primary" onclick="mudarPagina('veiculosRota')">
                    Gerenciar Veículos
                </button>

                <button class="btn btn-primary" onclick="mudarPagina('alunosRota')">
                    Gerenciar Alunos
                </button>

                <button class="btn btn-secondary" onclick="mudarPagina('rotas')">Voltar</button>
            </div>
        </div>
    `;
}


// ---------------------------------------------------------
// DUPLICAR MÊS (estrutura base — será expandida na parte 4)
// ---------------------------------------------------------
function duplicarMes() {
    if (!confirm("Deseja duplicar o mês atual para o próximo?")) return;

    state.mesReferencia++;
    if (state.mesReferencia > 12) {
        state.mesReferencia = 1;
        state.anoReferencia++;
    }

    // duplicar rotas (sem cálculos)
    state.rotas = state.rotas.map(r => ({
        ...r,
        diasRodados: 0,
        passagens: 0,
        calculos: {
            bruto: 0,
            percentualBruto: 0,
            auxilioRecebido: 0,
            valorIntegral: 0,
            valoresDescontos: [],
            totalFinal: 0
        }
    }));

    salvarBackup();
    logInterno("Mês duplicado", "sistema");

    alert("Mês duplicado com sucesso!");
    mudarPagina("home");
}


// ---------------------------------------------------------
// REGISTRO DA PÁGINA NO RENDER
// ---------------------------------------------------------
const renderOriginalParte4 = render;
render = function () {
    const app = document.getElementById("app");
    let html = "";

    switch (state.paginaAtual) {

        case "rotas":
            html = paginaRotas();
            break;

        case "editarRota":
            html = paginaEditarRota();
            break;

        default:
            html = renderOriginalParte4();
    }

    app.innerHTML = html;
};
/*  
===========================================================
SUPER APP.JS — PARTE 5/20
VEÍCULOS POR ROTA (VERSÃO PRO)
===========================================================
*/


// ---------------------------------------------------------
// ABRIR GERENCIAMENTO DE VEÍCULOS DA ROTA
// ---------------------------------------------------------
function abrirVeiculosRota() {
    if (!state.rotaSelecionada) {
        alert("Nenhuma rota selecionada.");
        return;
    }
    mudarPagina("veiculosRota");
}


// ---------------------------------------------------------
// ADICIONAR VEÍCULO À ROTA
// ---------------------------------------------------------
function adicionarVeiculo() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    if (!rota) return;

    const nome = document.getElementById("novoVeiculoNome").value.trim();
    const diaria = Number(document.getElementById("novoVeiculoDiaria").value);
    const dias = Number(document.getElementById("novoVeiculoDias").value);

    if (!nome) {
        alert("Informe o nome do veículo.");
        return;
    }

    if (diaria <= 0) {
        alert("Informe uma diária válida.");
        return;
    }

    if (dias < 0) {
        alert("Dias inválidos.");
        return;
    }

    rota.veiculos.push({
        id: Date.now(),
        nome,
        diaria,
        dias,
        bruto: diaria * dias
    });

    logInterno(`Veículo adicionado à rota ${rota.nome}: ${nome}`, "veiculo");

    salvarBackup();
    mudarPagina("veiculosRota");
}


// ---------------------------------------------------------
// EXCLUIR VEÍCULO
// ---------------------------------------------------------
function excluirVeiculo(id) {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    if (!rota) return;

    const veiculo = rota.veiculos.find(v => v.id === id);
    if (!veiculo) return;

    if (!confirm(`Excluir o veículo "${veiculo.nome}"?`)) return;

    rota.veiculos = rota.veiculos.filter(v => v.id !== id);

    logInterno(`Veículo excluído: ${veiculo.nome}`, "veiculo");

    salvarBackup();
    mudarPagina("veiculosRota");
}


// ---------------------------------------------------------
// EDITAR VEÍCULO
// ---------------------------------------------------------
function editarVeiculo(id) {
    state.veiculoSelecionado = id;
    mudarPagina("editarVeiculo");
}


// ---------------------------------------------------------
// SALVAR EDIÇÃO DO VEÍCULO
// ---------------------------------------------------------
function salvarEdicaoVeiculo() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    if (!rota) return;

    const veiculo = rota.veiculos.find(v => v.id === state.veiculoSelecionado);
    if (!veiculo) return;

    const nome = document.getElementById("editVeiculoNome").value.trim();
    const diaria = Number(document.getElementById("editVeiculoDiaria").value);
    const dias = Number(document.getElementById("editVeiculoDias").value);

    if (!nome) {
        alert("Informe o nome do veículo.");
        return;
    }

    if (diaria <= 0) {
        alert("Informe uma diária válida.");
        return;
    }

    if (dias < 0) {
        alert("Dias inválidos.");
        return;
    }

    veiculo.nome = nome;
    veiculo.diaria = diaria;
    veiculo.dias = dias;
    veiculo.bruto = diaria * dias;

    logInterno(`Veículo editado: ${nome}`, "veiculo");

    salvarBackup();
    mudarPagina("veiculosRota");
}


// ---------------------------------------------------------
// PÁGINA DE VEÍCULOS DA ROTA
// ---------------------------------------------------------
function paginaVeiculosRota() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);

    if (!rota) {
        alert("Rota não encontrada.");
        mudarPagina("rotas");
        return "";
    }

    let tabela = "";

    if (rota.veiculos.length === 0) {
        tabela = UI.alerta("Nenhum veículo cadastrado.");
    } else {
        tabela = `
            <table>
                <tr>
                    <th>Veículo</th>
                    <th>Diária</th>
                    <th>Dias</th>
                    <th>Bruto</th>
                    <th>Ações</th>
                </tr>
                ${rota.veiculos.map(v => `
                    <tr>
                        <td>${v.nome}</td>
                        <td>${formatarMoeda(v.diaria)}</td>
                        <td>${v.dias}</td>
                        <td>${formatarMoeda(v.bruto)}</td>
                        <td>
                            <button class="btn btn-secondary" onclick="editarVeiculo(${v.id})">Editar</button>
                            <button class="btn btn-danger" onclick="excluirVeiculo(${v.id})">Excluir</button>
                        </td>
                    </tr>
                `).join("")}
            </table>
        `;
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Veículos da Rota: " + rota.nome)}

            <div class="card">
                <h3>Adicionar Veículo</h3>

                <input id="novoVeiculoNome" class="input" placeholder="Nome do veículo">
                <input id="novoVeiculoDiaria" class="input" type="number" placeholder="Diária (R$)">
                <input id="novoVeiculoDias" class="input" type="number" placeholder="Dias rodados">

                <button class="btn btn-primary" onclick="adicionarVeiculo()">Adicionar</button>
            </div>

            <div class="card">
                <h3>Veículos Cadastrados</h3>
                ${tabela}
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('editarRota')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// PÁGINA DE EDIÇÃO DE VEÍCULO
// ---------------------------------------------------------
function paginaEditarVeiculo() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    if (!rota) return "";

    const veiculo = rota.veiculos.find(v => v.id === state.veiculoSelecionado);
    if (!veiculo) {
        alert("Veículo não encontrado.");
        mudarPagina("veiculosRota");
        return "";
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Editar Veículo")}

            <div class="card">

                <label class="label">Nome</label>
                <input id="editVeiculoNome" class="input" value="${veiculo.nome}">

                <label class="label">Diária (R$)</label>
                <input id="editVeiculoDiaria" class="input" type="number" value="${veiculo.diaria}">

                <label class="label">Dias Rodados</label>
                <input id="editVeiculoDias" class="input" type="number" value="${veiculo.dias}">

                <button class="btn btn-primary" onclick="salvarEdicaoVeiculo()">Salvar</button>

                <button class="btn btn-secondary" onclick="mudarPagina('veiculosRota')">Voltar</button>
            </div>
        </div>
    `;
}


// ---------------------------------------------------------
// REGISTRO NO RENDER
// ---------------------------------------------------------
const renderOriginalParte5 = render;
render = function () {
    const app = document.getElementById("app");
    let html = "";

    switch (state.paginaAtual) {

        case "veiculosRota":
            html = paginaVeiculosRota();
            break;

        case "editarVeiculo":
            html = paginaEditarVeiculo();
            break;

        default:
            html = renderOriginalParte5();
    }

    app.innerHTML = html;
};
/*  
===========================================================
SUPER APP.JS — PARTE 6/20
ALUNOS + DESCONTOS (VERSÃO PRO)
===========================================================
*/


// ---------------------------------------------------------
// ABRIR GERENCIAMENTO DE ALUNOS DA ROTA
// ---------------------------------------------------------
function abrirAlunosRota() {
    if (!state.rotaSelecionada) {
        alert("Nenhuma rota selecionada.");
        return;
    }
    mudarPagina("alunosRota");
}


// ---------------------------------------------------------
// SALVAR ALUNOS INTEGRAIS
// ---------------------------------------------------------
function salvarAlunosIntegrais() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    if (!rota) return;

    const qtd = Number(document.getElementById("alunosIntegrais").value);

    if (qtd < 0) {
        alert("Quantidade inválida.");
        return;
    }

    rota.alunos.integrais = qtd;

    logInterno(`Alunos integrais atualizados na rota ${rota.nome}: ${qtd}`, "alunos");

    salvarBackup();
    mudarPagina("alunosRota");
}


// ---------------------------------------------------------
// ADICIONAR DESCONTO
// ---------------------------------------------------------
function adicionarDesconto() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    if (!rota) return;

    const perc = Number(document.getElementById("novoDescPerc").value);
    const qtd = Number(document.getElementById("novoDescQtd").value);

    if (perc <= 0 || perc >= 100) {
        alert("Percentual inválido (1 a 99).");
        return;
    }

    if (qtd <= 0) {
        alert("Quantidade inválida.");
        return;
    }

    rota.alunos.descontos.push({
        id: Date.now(),
        percentual: perc,
        quantidade: qtd
    });

    logInterno(`Desconto adicionado na rota ${rota.nome}: ${perc}% (${qtd} alunos)`, "alunos");

    salvarBackup();
    mudarPagina("alunosRota");
}


// ---------------------------------------------------------
// EXCLUIR DESCONTO
// ---------------------------------------------------------
function excluirDesconto(id) {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    if (!rota) return;

    const desc = rota.alunos.descontos.find(d => d.id === id);
    if (!desc) return;

    if (!confirm(`Excluir desconto de ${desc.percentual}% (${desc.quantidade} alunos)?`)) return;

    rota.alunos.descontos = rota.alunos.descontos.filter(d => d.id !== id);

    logInterno(`Desconto excluído: ${desc.percentual}%`, "alunos");

    salvarBackup();
    mudarPagina("alunosRota");
}


// ---------------------------------------------------------
// EDITAR DESCONTO
// ---------------------------------------------------------
function editarDesconto(id) {
    state.descontoSelecionado = id;
    mudarPagina("editarDesconto");
}


// ---------------------------------------------------------
// SALVAR EDIÇÃO DO DESCONTO
// ---------------------------------------------------------
function salvarEdicaoDesconto() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    if (!rota) return;

    const desc = rota.alunos.descontos.find(d => d.id === state.descontoSelecionado);
    if (!desc) return;

    const perc = Number(document.getElementById("editDescPerc").value);
    const qtd = Number(document.getElementById("editDescQtd").value);

    if (perc <= 0 || perc >= 100) {
        alert("Percentual inválido.");
        return;
    }

    if (qtd <= 0) {
        alert("Quantidade inválida.");
        return;
    }

    desc.percentual = perc;
    desc.quantidade = qtd;

    logInterno(`Desconto editado: ${perc}% (${qtd} alunos)`, "alunos");

    salvarBackup();
    mudarPagina("alunosRota");
}


// ---------------------------------------------------------
// PÁGINA DE ALUNOS DA ROTA
// ---------------------------------------------------------
function paginaAlunosRota() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);

    if (!rota) {
        alert("Rota não encontrada.");
        mudarPagina("rotas");
        return "";
    }

    let tabelaDescontos = "";

    if (rota.alunos.descontos.length === 0) {
        tabelaDescontos = UI.alerta("Nenhum desconto cadastrado.");
    } else {
        tabelaDescontos = `
            <table>
                <tr>
                    <th>Percentual</th>
                    <th>Quantidade</th>
                    <th>Ações</th>
                </tr>
                ${rota.alunos.descontos.map(d => `
                    <tr>
                        <td>${d.percentual}%</td>
                        <td>${d.quantidade}</td>
                        <td>
                            <button class="btn btn-secondary" onclick="editarDesconto(${d.id})">Editar</button>
                            <button class="btn btn-danger" onclick="excluirDesconto(${d.id})">Excluir</button>
                        </td>
                    </tr>
                `).join("")}
            </table>
        `;
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Alunos da Rota: " + rota.nome)}

            <div class="card">
                <h3>Alunos Integrais</h3>

                <input id="alunosIntegrais" class="input" type="number" min="0"
                    value="${rota.alunos.integrais}">

                <button class="btn btn-primary" onclick="salvarAlunosIntegrais()">Salvar</button>
            </div>

            <div class="card">
                <h3>Adicionar Desconto</h3>

                <input id="novoDescPerc" class="input" type="number" placeholder="Percentual (%)">
                <input id="novoDescQtd" class="input" type="number" placeholder="Quantidade">

                <button class="btn btn-primary" onclick="adicionarDesconto()">Adicionar</button>
            </div>

            <div class="card">
                <h3>Descontos Cadastrados</h3>
                ${tabelaDescontos}
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('editarRota')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// PÁGINA DE EDIÇÃO DE DESCONTO
// ---------------------------------------------------------
function paginaEditarDesconto() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    if (!rota) return "";

    const desc = rota.alunos.descontos.find(d => d.id === state.descontoSelecionado);
    if (!desc) {
        alert("Desconto não encontrado.");
        mudarPagina("alunosRota");
        return "";
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Editar Desconto")}

            <div class="card">

                <label class="label">Percentual (%)</label>
                <input id="editDescPerc" class="input" type="number" value="${desc.percentual}">

                <label class="label">Quantidade</label>
                <input id="editDescQtd" class="input" type="number" value="${desc.quantidade}">

                <button class="btn btn-primary" onclick="salvarEdicaoDesconto()">Salvar</button>

                <button class="btn btn-secondary" onclick="mudarPagina('alunosRota')">Voltar</button>
            </div>
        </div>
    `;
}


// ---------------------------------------------------------
// REGISTRO NO RENDER
// ---------------------------------------------------------
const renderOriginalParte6 = render;
render = function () {
    const app = document.getElementById("app");
    let html = "";

    switch (state.paginaAtual) {

        case "alunosRota":
            html = paginaAlunosRota();
            break;

        case "editarDesconto":
            html = paginaEditarDesconto();
            break;

        default:
            html = renderOriginalParte6();
    }

    app.innerHTML = html;
};
/*  
===========================================================
SUPER APP.JS — PARTE 7/20
CÁLCULO BRUTO OTIMIZADO (VERSÃO PRO)
===========================================================
*/


// ---------------------------------------------------------
// CALCULAR BRUTO DE TODAS AS ROTAS
// ---------------------------------------------------------
function calcularBrutoRotas() {

    if (state.rotas.length === 0) {
        alert("Nenhuma rota cadastrada.");
        return;
    }

    let totalBrutoGeral = 0;

    // 1) calcular bruto individual
    state.rotas.forEach(rota => {

        let bruto = 0;

        rota.veiculos.forEach(v => {
            bruto += v.diaria * v.dias;
        });

        rota.calculos.bruto = bruto;
        totalBrutoGeral += bruto;
    });

    // 2) calcular percentual de participação
    state.rotas.forEach(rota => {
        if (totalBrutoGeral === 0) {
            rota.calculos.percentualBruto = 0;
        } else {
            rota.calculos.percentualBruto = (rota.calculos.bruto / totalBrutoGeral) * 100;
        }
    });

    logInterno("Cálculo bruto realizado", "calculo");

    salvarBackup();
}


// ---------------------------------------------------------
// PÁGINA DE VISUALIZAÇÃO DO BRUTO (opcional)
// ---------------------------------------------------------
function paginaBruto() {

    if (state.rotas.length === 0) {
        return `
            <div class="container">
                ${UI.logo()}
                ${UI.titulo("Cálculo Bruto")}

                <div class="card">
                    ${UI.alerta("Nenhuma rota cadastrada.")}
                </div>

                <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
            </div>
        `;
    }

    let tabela = `
        <table>
            <tr>
                <th>Rota</th>
                <th>Bruto</th>
                <th>% do Bruto</th>
            </tr>
    `;

    state.rotas.forEach(r => {
        tabela += `
            <tr>
                <td>${r.nome}</td>
                <td>${formatarMoeda(r.calculos.bruto)}</td>
                <td>${formatarPercentual(r.calculos.percentualBruto)}</td>
            </tr>
        `;
    });

    tabela += `</table>`;

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Cálculo Bruto")}

            <div class="card">
                <h3>Resultado</h3>
                ${tabela}
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// REGISTRO NO RENDER
// ---------------------------------------------------------
const renderOriginalParte7 = render;
render = function () {
    const app = document.getElementById("app");
    let html = "";

    switch (state.paginaAtual) {

        case "bruto":
            html = paginaBruto();
            break;

        default:
            html = renderOriginalParte7();
    }

    app.innerHTML = html;
};
/*  
===========================================================
SUPER APP.JS — PARTE 8/20
REGRA 30/70 OTIMIZADA (VERSÃO PRO)
===========================================================
*/


// ---------------------------------------------------------
// REGRA 30/70 — DISTRIBUIR AUXÍLIO ENTRE AS ROTAS
// ---------------------------------------------------------
function distribuirAuxilio30_70() {

    if (!state.auxilioMensal || state.auxilioMensal <= 0) {
        alert("Configure o auxílio mensal antes de calcular.");
        return;
    }

    if (state.rotas.length === 0) {
        alert("Nenhuma rota cadastrada.");
        return;
    }

    // 1) Identificar o maior número de dias rodados
    const maiorDias = Math.max(...state.rotas.map(r => r.diasRodados));

    if (maiorDias === 0) {
        alert("Nenhuma rota possui dias rodados.");
        return;
    }

    // 2) Calcular auxílio por dia
    const auxPorDia = state.auxilioMensal / maiorDias;

    // 3) Calcular total de dias rodados de todas as rotas
    const somaDias = state.rotas.reduce((acc, r) => acc + r.diasRodados, 0);

    // 4) Aplicar regra 30/70
    state.rotas.forEach(rota => {

        const parte30 = (state.auxilioMensal * 0.30) * (rota.diasRodados / maiorDias);

        const parte70 = (state.auxilioMensal * 0.70) * (rota.diasRodados / somaDias);

        const totalAux = parte30 + parte70;

        rota.calculos.auxilioRecebido = totalAux;
    });

    logInterno("Regra 30/70 aplicada", "calculo");

    salvarBackup();
}


// ---------------------------------------------------------
// PÁGINA DE VISUALIZAÇÃO DA REGRA 30/70 (opcional)
// ---------------------------------------------------------
function paginaAuxilio() {

    if (state.rotas.length === 0) {
        return `
            <div class="container">
                ${UI.logo()}
                ${UI.titulo("Distribuição do Auxílio")}

                <div class="card">
                    ${UI.alerta("Nenhuma rota cadastrada.")}
                </div>

                <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
            </div>
        `;
    }

    let tabela = `
        <table>
            <tr>
                <th>Rota</th>
                <th>Dias</th>
                <th>Auxílio Recebido</th>
            </tr>
    `;

    state.rotas.forEach(r => {
        tabela += `
            <tr>
                <td>${r.nome}</td>
                <td>${r.diasRodados}</td>
                <td>${formatarMoeda(r.calculos.auxilioRecebido)}</td>
            </tr>
        `;
    });

    tabela += `</table>`;

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Distribuição do Auxílio (30/70)")}

            <div class="card">
                <h3>Resultado</h3>
                ${tabela}
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// REGISTRO NO RENDER
// ---------------------------------------------------------
const renderOriginalParte8 = render;
render = function () {
    const app = document.getElementById("app");
    let html = "";

    switch (state.paginaAtual) {

        case "auxilio":
            html = paginaAuxilio();
            break;

        default:
            html = renderOriginalParte8();
    }

    app.innerHTML = html;
};
/*  
===========================================================
SUPER APP.JS — PARTE 9/20
CÁLCULO FINAL POR ROTA (VERSÃO PRO)
===========================================================
*/


// ---------------------------------------------------------
// CALCULAR VALOR FINAL DE TODAS AS ROTAS
// ---------------------------------------------------------
function calcularValorFinalRotas() {

    if (state.rotas.length === 0) {
        alert("Nenhuma rota cadastrada.");
        return;
    }

    state.rotas.forEach(rota => {

        const bruto = rota.calculos.bruto || 0;
        const aux = rota.calculos.auxilioRecebido || 0;
        const pass = rota.passagens || 0;

        // 1) Subtrair auxílio
        const aposAuxilio = bruto - aux;

        // 2) Subtrair passagens
        const aposPassagens = aposAuxilio - pass;

        // 3) Calcular peso total dos alunos
        let peso = rota.alunos.integrais;

        rota.alunos.descontos.forEach(d => {
            peso += d.quantidade * (d.percentual / 100);
        });

        if (peso <= 0) {
            rota.calculos.valorIntegral = 0;
            rota.calculos.valoresDescontos = [];
            rota.calculos.totalFinal = aposPassagens;
            return;
        }

        // 4) Valor integral por aluno
        const valorIntegral = aposPassagens / peso;

        rota.calculos.valorIntegral = valorIntegral;

        // 5) Valores com desconto
        rota.calculos.valoresDescontos = rota.alunos.descontos.map(d => ({
            percentual: d.percentual,
            quantidade: d.quantidade,
            valor: valorIntegral * (d.percentual / 100)
        }));

        // 6) Total final da rota
        rota.calculos.totalFinal = aposPassagens;
    });

    logInterno("Cálculo final das rotas concluído", "calculo");

    salvarBackup();
}


// ---------------------------------------------------------
// PÁGINA DE VISUALIZAÇÃO DO CÁLCULO FINAL (opcional)
// ---------------------------------------------------------
function paginaCalculoFinal() {

    if (state.rotas.length === 0) {
        return `
            <div class="container">
                ${UI.logo()}
                ${UI.titulo("Cálculo Final")}

                <div class="card">
                    ${UI.alerta("Nenhuma rota cadastrada.")}
                </div>

                <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
            </div>
        `;
    }

    let tabela = `
        <table>
            <tr>
                <th>Rota</th>
                <th>Bruto</th>
                <th>Auxílio</th>
                <th>Passagens</th>
                <th>Total Final</th>
                <th>Valor Integral</th>
                <th>Descontos</th>
            </tr>
    `;

    state.rotas.forEach(r => {

        let descHTML = "";
        r.calculos.valoresDescontos.forEach(d => {
            descHTML += `${d.percentual}% → ${formatarMoeda(d.valor)} (x${d.quantidade})<br>`;
        });

        tabela += `
            <tr>
                <td>${r.nome}</td>
                <td>${formatarMoeda(r.calculos.bruto)}</td>
                <td>${formatarMoeda(r.calculos.auxilioRecebido)}</td>
                <td>${formatarMoeda(r.passagens)}</td>
                <td>${formatarMoeda(r.calculos.totalFinal)}</td>
                <td>${formatarMoeda(r.calculos.valorIntegral)}</td>
                <td style="text-align:left">${descHTML}</td>
            </tr>
        `;
    });

    tabela += `</table>`;

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Cálculo Final")}

            <div class="card">
                <h3>Resultado</h3>
                ${tabela}
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// REGISTRO NO RENDER
// ---------------------------------------------------------
const renderOriginalParte9 = render;
render = function () {
    const app = document.getElementById("app");
    let html = "";

    switch (state.paginaAtual) {

        case "calculoFinal":
            html = paginaCalculoFinal();
            break;

        default:
            html = renderOriginalParte9();
    }

    app.innerHTML = html;
};
/*  
===========================================================
SUPER APP.JS — PARTE 10/20
RELATÓRIO GERAL (VERSÃO PRO)
===========================================================
*/


// ---------------------------------------------------------
// PÁGINA DO RELATÓRIO GERAL
// ---------------------------------------------------------
function paginaRelatorioGeral() {

    if (state.rotas.length === 0) {
        return `
            <div class="container">
                ${UI.logo()}
                ${UI.titulo("Relatório Geral")}

                <div class="card">
                    ${UI.alerta("Nenhuma rota cadastrada.")}
                </div>

                <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
            </div>
        `;
    }

    // totais
    const totalBruto = state.rotas.reduce((acc, r) => acc + (r.calculos.bruto || 0), 0);
    const totalAux = state.rotas.reduce((acc, r) => acc + (r.calculos.auxilioRecebido || 0), 0);
    const totalFinal = state.rotas.reduce((acc, r) => acc + (r.calculos.totalFinal || 0), 0);

    // tabela
    let tabela = `
        <table>
            <tr>
                <th>Rota</th>
                <th>Bruto</th>
                <th>% Bruto</th>
                <th>Auxílio</th>
                <th>Passagens</th>
                <th>Total Final</th>
                <th>Valor Integral</th>
                <th>Descontos</th>
            </tr>
    `;

    state.rotas.forEach(r => {

        let descHTML = "";
        r.calculos.valoresDescontos.forEach(d => {
            descHTML += `${d.percentual}% → ${formatarMoeda(d.valor)} (x${d.quantidade})<br>`;
        });

        tabela += `
            <tr>
                <td>${r.nome}</td>
                <td>${formatarMoeda(r.calculos.bruto)}</td>
                <td>${formatarPercentual(r.calculos.percentualBruto)}</td>
                <td>${formatarMoeda(r.calculos.auxilioRecebido)}</td>
                <td>${formatarMoeda(r.passagens)}</td>
                <td>${formatarMoeda(r.calculos.totalFinal)}</td>
                <td>${formatarMoeda(r.calculos.valorIntegral)}</td>
                <td style="text-align:left">${descHTML}</td>
            </tr>
        `;
    });

    tabela += `</table>`;

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Relatório Geral")}

            <div class="card">
                <h3>Resumo do Mês</h3>
                <p><b>Mês/Ano:</b> ${state.mesReferencia}/${state.anoReferencia}</p>
                <p><b>Auxílio Total:</b> ${formatarMoeda(state.auxilioMensal)}</p>
                <p><b>Bruto Total:</b> ${formatarMoeda(totalBruto)}</p>
                <p><b>Auxílio Distribuído:</b> ${formatarMoeda(totalAux)}</p>
                <p><b>Total Final das Rotas:</b> ${formatarMoeda(totalFinal)}</p>
            </div>

            <div class="card">
                <h3>Detalhamento por Rota</h3>
                ${tabela}
            </div>

            <button class="btn btn-primary" onclick="mudarPagina('memoriaCalculo')">
                Memória de Cálculo
            </button>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">
                Voltar
            </button>
        </div>
    `;
}


// ---------------------------------------------------------
// REGISTRO NO RENDER
// ---------------------------------------------------------
const renderOriginalParte10 = render;
render = function () {
    const app = document.getElementById("app");
    let html = "";

    switch (state.paginaAtual) {

        case "relatorioGeral":
            html = paginaRelatorioGeral();
            break;

        default:
            html = renderOriginalParte10();
    }

    app.innerHTML = html;
};
/*  
===========================================================
SUPER APP.JS — PARTE 11/20
MEMÓRIA DE CÁLCULO (VERSÃO PRO)
===========================================================
*/


// ---------------------------------------------------------
// PÁGINA DA MEMÓRIA DE CÁLCULO
// ---------------------------------------------------------
function paginaMemoriaCalculo() {

    if (state.rotas.length === 0) {
        return `
            <div class="container">
                ${UI.logo()}
                ${UI.titulo("Memória de Cálculo")}

                <div class="card">
                    ${UI.alerta("Nenhuma rota cadastrada.")}
                </div>

                <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
            </div>
        `;
    }

    const maiorDias = Math.max(...state.rotas.map(r => r.diasRodados));
    const auxPorDia = maiorDias > 0 ? state.auxilioMensal / maiorDias : 0;

    let htmlRotas = "";

    state.rotas.forEach(r => {

        let descontosHTML = "";
        r.calculos.valoresDescontos.forEach(d => {
            descontosHTML += `
                ${d.percentual}% → ${formatarMoeda(d.valor)} (x${d.quantidade})<br>
            `;
        });

        htmlRotas += `
            <div class="card">
                <h3>${r.nome}</h3>

                <p><b>1) Cálculo Bruto:</b></p>
                <p>Somatório das diárias × dias dos veículos.</p>
                <p><b>Bruto:</b> ${formatarMoeda(r.calculos.bruto)}</p>
                <p><b>Percentual do Bruto:</b> ${formatarPercentual(r.calculos.percentualBruto)}</p>

                <hr class="linha">

                <p><b>2) Regra 30/70:</b></p>
                <p><b>Dias Rodados:</b> ${r.diasRodados}</p>
                <p><b>Auxílio Recebido:</b> ${formatarMoeda(r.calculos.auxilioRecebido)}</p>

                <hr class="linha">

                <p><b>3) Subtrações:</b></p>
                <p>Bruto – Auxílio – Passagens</p>
                <p><b>Passagens:</b> ${formatarMoeda(r.passagens)}</p>
                <p><b>Total Final:</b> ${formatarMoeda(r.calculos.totalFinal)}</p>

                <hr class="linha">

                <p><b>4) Divisão pelos Alunos:</b></p>
                <p><b>Valor Integral:</b> ${formatarMoeda(r.calculos.valorIntegral)}</p>

                <p><b>Descontos:</b><br>${descontosHTML}</p>
            </div>
        `;
    });

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Memória de Cálculo")}

            <div class="card">
                <h3>Informações Gerais</h3>
                <p><b>Mês/Ano:</b> ${state.mesReferencia}/${state.anoReferencia}</p>
                <p><b>Auxílio Total:</b> ${formatarMoeda(state.auxilioMensal)}</p>
                <p><b>Maior Número de Dias Rodados:</b> ${maiorDias}</p>
                <p><b>Auxílio por Dia:</b> ${formatarMoeda(auxPorDia)}</p>
            </div>

            ${htmlRotas}

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// REGISTRO NO RENDER
// ---------------------------------------------------------
const renderOriginalParte11 = render;
render = function () {
    const app = document.getElementById("app");
    let html = "";

    switch (state.paginaAtual) {

        case "memoriaCalculo":
            html = paginaMemoriaCalculo();
            break;

        default:
            html = renderOriginalParte11();
    }

    app.innerHTML = html;
};
/*  
===========================================================
SUPER APP.JS — PARTE 12/20
HISTÓRICO AVANÇADO + LOGS AVANÇADOS
===========================================================
*/


// ---------------------------------------------------------
// SALVAR MÊS NO HISTÓRICO
// ---------------------------------------------------------
function salvarMesNoHistorico() {

    if (!state.mesReferencia || !state.anoReferencia) {
        alert("Configure o mês antes de salvar no histórico.");
        return;
    }

    if (state.rotas.length === 0) {
        alert("Nenhuma rota cadastrada.");
        return;
    }

    const copia = JSON.parse(JSON.stringify({
        id: state.proximoHistoricoId++,
        mes: state.mesReferencia,
        ano: state.anoReferencia,
        auxilio: state.auxilioMensal,
        rotas: state.rotas,
        dataSalvo: new Date().toLocaleString("pt-BR")
    }));

    state.historico.push(copia);

    logInterno(`Mês ${state.mesReferencia}/${state.anoReferencia} salvo no histórico`, "historico");

    salvarBackup();

    alert("Mês salvo no histórico com sucesso!");
}


// ---------------------------------------------------------
// ABRIR HISTÓRICO
// ---------------------------------------------------------
function abrirHistorico() {
    mudarPagina("historico");
}


// ---------------------------------------------------------
// EXCLUIR ITEM DO HISTÓRICO
// ---------------------------------------------------------
function excluirHistorico(id) {
    const item = state.historico.find(h => h.id === id);
    if (!item) return;

    if (!confirm(`Excluir histórico do mês ${item.mes}/${item.ano}?`)) return;

    state.historico = state.historico.filter(h => h.id !== id);

    logInterno(`Histórico excluído: ${item.mes}/${item.ano}`, "historico");

    salvarBackup();
    mudarPagina("historico");
}


// ---------------------------------------------------------
// REABRIR MÊS DO HISTÓRICO
// ---------------------------------------------------------
function reabrirHistorico(id) {
    const item = state.historico.find(h => h.id === id);
    if (!item) return;

    if (!confirm(`Reabrir mês ${item.mes}/${item.ano}? Isso substituirá os dados atuais.`)) return;

    state.mesReferencia = item.mes;
    state.anoReferencia = item.ano;
    state.auxilioMensal = item.auxilio;
    state.rotas = JSON.parse(JSON.stringify(item.rotas));

    logInterno(`Histórico reaberto: ${item.mes}/${item.ano}`, "historico");

    salvarBackup();
    mudarPagina("home");
}


// ---------------------------------------------------------
// PÁGINA DO HISTÓRICO
// ---------------------------------------------------------
function paginaHistorico() {

    if (state.historico.length === 0) {
        return `
            <div class="container">
                ${UI.logo()}
                ${UI.titulo("Histórico")}

                <div class="card">
                    ${UI.alerta("Nenhum mês salvo no histórico.")}
                </div>

                <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
            </div>
        `;
    }

    let tabela = `
        <table>
            <tr>
                <th>Mês/Ano</th>
                <th>Auxílio</th>
                <th>Rotas</th>
                <th>Salvo em</th>
                <th>Ações</th>
            </tr>
    `;

    state.historico.forEach(h => {
        tabela += `
            <tr>
                <td>${h.mes}/${h.ano}</td>
                <td>${formatarMoeda(h.auxilio)}</td>
                <td>${h.rotas.length}</td>
                <td>${h.dataSalvo}</td>
                <td>
                    <button class="btn btn-primary" onclick="reabrirHistorico(${h.id})">Reabrir</button>
                    <button class="btn btn-danger" onclick="excluirHistorico(${h.id})">Excluir</button>
                </td>
            </tr>
        `;
    });

    tabela += `</table>`;

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Histórico")}

            <div class="card">
                <h3>Meses Salvos</h3>
                ${tabela}
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// PÁGINA DE LOGS AVANÇADOS
// ---------------------------------------------------------
function paginaLogs() {

    if (state.logs.length === 0) {
        return `
            <div class="container">
                ${UI.logo()}
                ${UI.titulo("Logs do Sistema")}

                <div class="card">
                    ${UI.alerta("Nenhum log registrado ainda.")}
                </div>

                <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
            </div>
        `;
    }

    let tabela = `
        <table>
            <tr>
                <th>Data</th>
                <th>Usuário</th>
                <th>Ação</th>
                <th>Tipo</th>
            </tr>
    `;

    state.logs.slice().reverse().forEach(l => {
        tabela += `
            <tr>
                <td>${l.data}</td>
                <td>${l.usuario}</td>
                <td>${l.acao}</td>
                <td>${l.tipo}</td>
            </tr>
        `;
    });

    tabela += `</table>`;

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Logs do Sistema")}

            <div class="card">
                <h3>Registros</h3>
                ${tabela}
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// REGISTRO NO RENDER
// ---------------------------------------------------------
const renderOriginalParte12 = render;
render = function () {
    const app = document.getElementById("app");
    let html = "";

    switch (state.paginaAtual) {

        case "historico":
            html = paginaHistorico();
            break;

        case "logs":
            html = paginaLogs();
            break;

        default:
            html = renderOriginalParte12();
    }

    app.innerHTML = html;
};
/*  
===========================================================
SUPER APP.JS — PARTE 13/20
DASHBOARD COM GRÁFICOS (CHART.JS)
===========================================================
*/


// ---------------------------------------------------------
// CARREGAR CHART.JS (CDN)
// ---------------------------------------------------------
const scriptChart = document.createElement("script");
scriptChart.src = "https://cdn.jsdelivr.net/npm/chart.js";
document.head.appendChild(scriptChart);


// ---------------------------------------------------------
// DASHBOARD
// ---------------------------------------------------------
function paginaDashboard() {

    if (state.rotas.length === 0) {
        return `
            <div class="container">
                ${UI.logo()}
                ${UI.titulo("Dashboard")}

                <div class="card">
                    ${UI.alerta("Nenhuma rota cadastrada.")}
                </div>

                <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
            </div>
        `;
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Dashboard")}

            <div class="card">
                <h3>Bruto por Rota</h3>
                <canvas id="graficoBruto"></canvas>
            </div>

            <div class="card">
                <h3>Participação no Bruto (%)</h3>
                <canvas id="graficoPercentual"></canvas>
            </div>

            <div class="card">
                <h3>Evolução do Total Final (Histórico)</h3>
                <canvas id="graficoHistorico"></canvas>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// FUNÇÃO PARA DESENHAR OS GRÁFICOS
// ---------------------------------------------------------
function desenharGraficos() {

    if (typeof Chart === "undefined") {
        setTimeout(desenharGraficos, 200);
        return;
    }

    // Dados das rotas
    const nomes = state.rotas.map(r => r.nome);
    const brutos = state.rotas.map(r => r.calculos.bruto);
    const percentuais = state.rotas.map(r => r.calculos.percentualBruto);

    // Dados do histórico
    const histLabels = state.historico.map(h => `${h.mes}/${h.ano}`);
    const histValores = state.historico.map(h =>
        h.rotas.reduce((acc, r) => acc + (r.calculos.totalFinal || 0), 0)
    );

    // Gráfico 1 — Bruto por rota
    new Chart(document.getElementById("graficoBruto"), {
        type: "bar",
        data: {
            labels: nomes,
            datasets: [{
                label: "Bruto (R$)",
                data: brutos,
                backgroundColor: "#007bff"
            }]
        }
    });

    // Gráfico 2 — Percentual do bruto
    new Chart(document.getElementById("graficoPercentual"), {
        type: "pie",
        data: {
            labels: nomes,
            datasets: [{
                data: percentuais,
                backgroundColor: [
                    "#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1",
                    "#20c997", "#fd7e14", "#6610f2", "#17a2b8", "#343a40"
                ]
            }]
        }
    });

    // Gráfico 3 — Histórico
    new Chart(document.getElementById("graficoHistorico"), {
        type: "line",
        data: {
            labels: histLabels,
            datasets: [{
                label: "Total Final (R$)",
                data: histValores,
                borderColor: "#28a745",
                fill: false,
                tension: 0.2
            }]
        }
    });
}


// ---------------------------------------------------------
// REGISTRO NO RENDER
// ---------------------------------------------------------
const renderOriginalParte13 = render;
render = function () {
    const app = document.getElementById("app");
    let html = "";

    switch (state.paginaAtual) {

        case "dashboard":
            html = paginaDashboard();
            break;

        default:
            html = renderOriginalParte13();
    }

    app.innerHTML = html;

    // desenhar gráficos após renderizar
    if (state.paginaAtual === "dashboard") {
        desenharGraficos();
    }
};
/*  
===========================================================
SUPER APP.JS — PARTE 14/20
EXPORTAÇÃO PARA PDF (JSPDF)
===========================================================
*/


// ---------------------------------------------------------
// CARREGAR jsPDF (CDN)
// ---------------------------------------------------------
const scriptPDF = document.createElement("script");
scriptPDF.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
document.head.appendChild(scriptPDF);


// ---------------------------------------------------------
// EXPORTAR RELATÓRIO GERAL PARA PDF
// ---------------------------------------------------------
async function exportarRelatorioPDF() {

    if (typeof window.jspdf === "undefined") {
        alert("Carregando módulo PDF… aguarde 1 segundo e tente novamente.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    let y = 40;

    doc.setFontSize(18);
    doc.text("ASSEUF ENTERPRISE PRO", 40, y);
    y += 30;

    doc.setFontSize(14);
    doc.text(`Relatório Geral — ${state.mesReferencia}/${state.anoReferencia}`, 40, y);
    y += 20;

    doc.setFontSize(12);
    doc.text(`Auxílio Total: ${formatarMoeda(state.auxilioMensal)}`, 40, y);
    y += 20;

    doc.text("--------------------------------------------------------------", 40, y);
    y += 20;

    state.rotas.forEach(r => {

        if (y > 760) {
            doc.addPage();
            y = 40;
        }

        doc.setFontSize(14);
        doc.text(`Rota: ${r.nome}`, 40, y);
        y += 20;

        doc.setFontSize(12);
        doc.text(`Bruto: ${formatarMoeda(r.calculos.bruto)}`, 40, y);
        y += 15;

        doc.text(`% Bruto: ${formatarPercentual(r.calculos.percentualBruto)}`, 40, y);
        y += 15;

        doc.text(`Auxílio Recebido: ${formatarMoeda(r.calculos.auxilioRecebido)}`, 40, y);
        y += 15;

        doc.text(`Passagens: ${formatarMoeda(r.passagens)}`, 40, y);
        y += 15;

        doc.text(`Total Final: ${formatarMoeda(r.calculos.totalFinal)}`, 40, y);
        y += 15;

        doc.text(`Valor Integral: ${formatarMoeda(r.calculos.valorIntegral)}`, 40, y);
        y += 15;

        if (r.calculos.valoresDescontos.length > 0) {
            doc.text("Descontos:", 40, y);
            y += 15;

            r.calculos.valoresDescontos.forEach(d => {
                doc.text(
                    `• ${d.percentual}% → ${formatarMoeda(d.valor)} (x${d.quantidade})`,
                    60,
                    y
                );
                y += 15;
            });
        }

        y += 10;
        doc.text("--------------------------------------------------------------", 40, y);
        y += 20;
    });

    doc.save(`Relatorio_${state.mesReferencia}_${state.anoReferencia}.pdf`);

    logInterno("Relatório PDF exportado", "pdf");
}


// ---------------------------------------------------------
// EXPORTAR MEMÓRIA DE CÁLCULO PARA PDF
// ---------------------------------------------------------
async function exportarMemoriaPDF() {

    if (typeof window.jspdf === "undefined") {
        alert("Carregando módulo PDF… aguarde 1 segundo e tente novamente.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    let y = 40;

    doc.setFontSize(18);
    doc.text("ASSEUF ENTERPRISE PRO", 40, y);
    y += 30;

    doc.setFontSize(14);
    doc.text(`Memória de Cálculo — ${state.mesReferencia}/${state.anoReferencia}`, 40, y);
    y += 20;

    doc.setFontSize(12);
    doc.text(`Auxílio Total: ${formatarMoeda(state.auxilioMensal)}`, 40, y);
    y += 20;

    const maiorDias = Math.max(...state.rotas.map(r => r.diasRodados));
    const auxPorDia = maiorDias > 0 ? state.auxilioMensal / maiorDias : 0;

    doc.text(`Maior número de dias rodados: ${maiorDias}`, 40, y);
    y += 15;

    doc.text(`Auxílio por dia: ${formatarMoeda(auxPorDia)}`, 40, y);
    y += 20;

    doc.text("--------------------------------------------------------------", 40, y);
    y += 20;

    state.rotas.forEach(r => {

        if (y > 760) {
            doc.addPage();
            y = 40;
        }

        doc.setFontSize(14);
        doc.text(`Rota: ${r.nome}`, 40, y);
        y += 20;

        doc.setFontSize(12);
        doc.text(`Bruto: ${formatarMoeda(r.calculos.bruto)}`, 40, y);
        y += 15;

        doc.text(`% Bruto: ${formatarPercentual(r.calculos.percentualBruto)}`, 40, y);
        y += 15;

        doc.text(`Auxílio Recebido: ${formatarMoeda(r.calculos.auxilioRecebido)}`, 40, y);
        y += 15;

        doc.text(`Passagens: ${formatarMoeda(r.passagens)}`, 40, y);
        y += 15;

        doc.text(`Total Final: ${formatarMoeda(r.calculos.totalFinal)}`, 40, y);
        y += 15;

        doc.text(`Valor Integral: ${formatarMoeda(r.calculos.valorIntegral)}`, 40, y);
        y += 15;

        if (r.calculos.valoresDescontos.length > 0) {
            doc.text("Descontos:", 40, y);
            y += 15;

            r.calculos.valoresDescontos.forEach(d => {
                doc.text(
                    `• ${d.percentual}% → ${formatarMoeda(d.valor)} (x${d.quantidade})`,
                    60,
                    y
                );
                y += 15;
            });
        }

        y += 10;
        doc.text("--------------------------------------------------------------", 40, y);
        y += 20;
    });

    doc.save(`Memoria_${state.mesReferencia}_${state.anoReferencia}.pdf`);

    logInterno("Memória de cálculo PDF exportada", "pdf");
}


// ---------------------------------------------------------
// BOTÕES NAS PÁGINAS
// ---------------------------------------------------------
function adicionarBotoesPDF() {
    const app = document.getElementById("app");

    if (state.paginaAtual === "relatorioGeral") {
        app.innerHTML = app.innerHTML.replace(
            "</div>\n            <button",
            `
            <button class="btn btn-primary" onclick="exportarRelatorioPDF()">
                Exportar PDF
            </button>
            </div>
            <button`
        );
    }

    if (state.paginaAtual === "memoriaCalculo") {
        app.innerHTML = app.innerHTML.replace(
            "</div>\n            <button",
            `
            <button class="btn btn-primary" onclick="exportarMemoriaPDF()">
                Exportar PDF
            </button>
            </div>
            <button`
        );
    }
}


// ---------------------------------------------------------
// REGISTRO NO RENDER
// ---------------------------------------------------------
const renderOriginalParte14 = render;
render = function () {
    renderOriginalParte14();

    // adicionar botões após renderizar
    adicionarBotoesPDF();
};
/*  
===========================================================
SUPER APP.JS — PARTE 15/20
EXPORTAÇÃO PARA EXCEL (SHEETJS)
===========================================================
*/


// ---------------------------------------------------------
// CARREGAR SheetJS (CDN)
// ---------------------------------------------------------
const scriptXLSX = document.createElement("script");
scriptXLSX.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
document.head.appendChild(scriptXLSX);


// ---------------------------------------------------------
// EXPORTAR RELATÓRIO GERAL PARA EXCEL
// ---------------------------------------------------------
function exportarRelatorioExcel() {

    if (typeof XLSX === "undefined") {
        alert("Carregando módulo Excel… aguarde 1 segundo e tente novamente.");
        return;
    }

    const dados = [];

    dados.push([
        "Rota",
        "Bruto",
        "% Bruto",
        "Auxílio Recebido",
        "Passagens",
        "Total Final",
        "Valor Integral",
        "Descontos"
    ]);

    state.rotas.forEach(r => {

        let desc = "";
        r.calculos.valoresDescontos.forEach(d => {
            desc += `${d.percentual}% = ${formatarMoeda(d.valor)} (x${d.quantidade}) | `;
        });

        dados.push([
            r.nome,
            r.calculos.bruto,
            r.calculos.percentualBruto,
            r.calculos.auxilioRecebido,
            r.passagens,
            r.calculos.totalFinal,
            r.calculos.valorIntegral,
            desc
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Relatório Geral");

    XLSX.writeFile(wb, `Relatorio_${state.mesReferencia}_${state.anoReferencia}.xlsx`);

    logInterno("Relatório Excel exportado", "excel");
}


// ---------------------------------------------------------
// EXPORTAR MEMÓRIA DE CÁLCULO PARA EXCEL
// ---------------------------------------------------------
function exportarMemoriaExcel() {

    if (typeof XLSX === "undefined") {
        alert("Carregando módulo Excel… aguarde 1 segundo e tente novamente.");
        return;
    }

    const dados = [];

    dados.push(["Memória de Cálculo"]);
    dados.push(["Mês", state.mesReferencia]);
    dados.push(["Ano", state.anoReferencia]);
    dados.push(["Auxílio Total", state.auxilioMensal]);

    const maiorDias = Math.max(...state.rotas.map(r => r.diasRodados));
    const auxPorDia = maiorDias > 0 ? state.auxilioMensal / maiorDias : 0;

    dados.push(["Maior número de dias", maiorDias]);
    dados.push(["Auxílio por dia", auxPorDia]);
    dados.push([]);

    state.rotas.forEach(r => {

        dados.push(["Rota", r.nome]);
        dados.push(["Bruto", r.calculos.bruto]);
        dados.push(["% Bruto", r.calculos.percentualBruto]);
        dados.push(["Auxílio Recebido", r.calculos.auxilioRecebido]);
        dados.push(["Passagens", r.passagens]);
        dados.push(["Total Final", r.calculos.totalFinal]);
        dados.push(["Valor Integral", r.calculos.valorIntegral]);

        if (r.calculos.valoresDescontos.length > 0) {
            dados.push(["Descontos"]);
            r.calculos.valoresDescontos.forEach(d => {
                dados.push([
                    `${d.percentual}%`,
                    d.valor,
                    `Qtd: ${d.quantidade}`
                ]);
            });
        }

        dados.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Memória");

    XLSX.writeFile(wb, `Memoria_${state.mesReferencia}_${state.anoReferencia}.xlsx`);

    logInterno("Memória Excel exportada", "excel");
}


// ---------------------------------------------------------
// INSERIR BOTÕES NAS PÁGINAS
// ---------------------------------------------------------
function adicionarBotoesExcel() {
    const app = document.getElementById("app");

    if (state.paginaAtual === "relatorioGeral") {
        app.innerHTML = app.innerHTML.replace(
            "</div>\n            <button",
            `
            <button class="btn btn-primary" onclick="exportarRelatorioExcel()">
                Exportar Excel
            </button>
            </div>
            <button`
        );
    }

    if (state.paginaAtual === "memoriaCalculo") {
        app.innerHTML = app.innerHTML.replace(
            "</div>\n            <button",
            `
            <button class="btn btn-primary" onclick="exportarMemoriaExcel()">
                Exportar Excel
            </button>
            </div>
            <button`
        );
    }
}


// ---------------------------------------------------------
// REGISTRO NO RENDER
// ---------------------------------------------------------
const renderOriginalParte15 = render;
render = function () {
    renderOriginalParte15();

    // adicionar botões após renderizar
    adicionarBotoesExcel();
};
/*  
===========================================================
SUPER APP.JS — PARTE 16/20
MODO SIMULAÇÃO (VERSÃO PRO)
===========================================================
*/


// ---------------------------------------------------------
// ATIVAR SIMULAÇÃO
// ---------------------------------------------------------
function ativarSimulacao() {

    if (state.simulacaoAtiva) {
        alert("A simulação já está ativa.");
        return;
    }

    // salvar estado real
    state.simulacaoBackup = JSON.parse(JSON.stringify(state));

    state.simulacaoAtiva = true;

    logInterno("Simulação ativada", "simulacao");

    alert("Modo simulação ativado! Agora você pode testar valores sem alterar o mês real.");

    salvarBackup();
    mudarPagina("home");
}


// ---------------------------------------------------------
// DESATIVAR SIMULAÇÃO
// ---------------------------------------------------------
function desativarSimulacao() {

    if (!state.simulacaoAtiva) {
        alert("A simulação não está ativa.");
        return;
    }

    if (!confirm("Deseja realmente sair da simulação e restaurar os dados reais?")) return;

    // restaurar estado real
    const backup = state.simulacaoBackup;

    state.mesReferencia = backup.mesReferencia;
    state.anoReferencia = backup.anoReferencia;
    state.auxilioMensal = backup.auxilioMensal;
    state.rotas = backup.rotas;
    state.historico = backup.historico;
    state.logs = backup.logs;
    state.proximaRotaId = backup.proximaRotaId;
    state.proximoHistoricoId = backup.proximoHistoricoId;

    state.simulacaoAtiva = false;
    state.simulacaoBackup = null;

    logInterno("Simulação desativada e dados reais restaurados", "simulacao");

    alert("Simulação encerrada. Dados reais restaurados.");

    salvarBackup();
    mudarPagina("home");
}


// ---------------------------------------------------------
// INDICADOR VISUAL DE SIMULAÇÃO
// ---------------------------------------------------------
function indicadorSimulacao() {
    if (!state.simulacaoAtiva) return "";

    return `
        <div style="
            background:#ffcc00;
            padding:10px;
            border-radius:8px;
            margin-bottom:15px;
            text-align:center;
            font-weight:bold;
            color:#000;
        ">
            ⚠️ MODO SIMULAÇÃO ATIVO — Alterações NÃO serão salvas no mês real
        </div>
    `;
}


// ---------------------------------------------------------
// INSERIR BOTÕES DE SIMULAÇÃO NA HOME
// ---------------------------------------------------------
function inserirBotoesSimulacao() {
    const app = document.getElementById("app");

    if (state.paginaAtual === "home") {

        const botoes = state.simulacaoAtiva
            ? `
                <button class="btn btn-danger" onclick="desativarSimulacao()">
                    Encerrar Simulação
                </button>
            `
            : `
                <button class="btn btn-primary" onclick="ativarSimulacao()">
                    Ativar Simulação
                </button>
            `;

        app.innerHTML = app.innerHTML.replace(
            "</div>",
            `
            <div class="card">
                <h3>Modo Simulação</h3>
                ${botoes}
            </div>
            </div>
            `
        );
    }
}


// ---------------------------------------------------------
// INJETAR INDICADOR DE SIMULAÇÃO EM TODAS AS PÁGINAS
// ---------------------------------------------------------
function inserirIndicadorSimulacao() {
    const app = document.getElementById("app");

    if (state.simulacaoAtiva) {
        app.innerHTML = indicadorSimulacao() + app.innerHTML;
    }
}


// ---------------------------------------------------------
// REGISTRO NO RENDER
// ---------------------------------------------------------
const renderOriginalParte16 = render;
render = function () {
    renderOriginalParte16();

    inserirIndicadorSimulacao();
    inserirBotoesSimulacao();
};
/*  
===========================================================
SUPER APP.JS — PARTE 17/20
UX + ANIMAÇÕES (VERSÃO PRO)
===========================================================
*/


// ---------------------------------------------------------
// ANIMAÇÃO DE TRANSIÇÃO ENTRE PÁGINAS
// ---------------------------------------------------------
function animarTransicao() {
    const app = document.getElementById("app");

    app.style.opacity = 0;
    setTimeout(() => {
        app.style.transition = "opacity 0.35s ease";
        app.style.opacity = 1;
    }, 50);
}


// ---------------------------------------------------------
// ANIMAÇÃO EM BOTÕES (efeito de clique)
// ---------------------------------------------------------
document.addEventListener("click", e => {
    if (e.target.classList.contains("btn")) {
        e.target.classList.add("btn-click");

        setTimeout(() => {
            e.target.classList.remove("btn-click");
        }, 150);
    }
});


// ---------------------------------------------------------
// ANIMAÇÃO EM CARDS (hover)
// ---------------------------------------------------------
function ativarAnimacaoCards() {
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        card.style.transition = "transform 0.25s ease, box-shadow 0.25s ease";

        card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-4px)";
            card.style.boxShadow = "0 6px 18px rgba(0,0,0,0.15)";
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "translateY(0)";
            card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
        });
    });
}


// ---------------------------------------------------------
// MELHORIA DE UX: SCROLL PARA O TOPO AO MUDAR DE PÁGINA
// ---------------------------------------------------------
function scrollTopo() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}


// ---------------------------------------------------------
// REGISTRO NO RENDER
// ---------------------------------------------------------
const renderOriginalParte17 = render;
render = function () {
    renderOriginalParte17();

    // animações
    animarTransicao();
    ativarAnimacaoCards();
    scrollTopo();
};
/*  
===========================================================
SUPER APP.JS — PARTE 18/20
NAVEGAÇÃO INTELIGENTE (VERSÃO PRO)
===========================================================
*/


// ---------------------------------------------------------
// BREADCRUMB (caminho da página)
// ---------------------------------------------------------
function gerarBreadcrumb() {

    const nomesPaginas = {
        home: "Início",
        rotas: "Rotas",
        editarRota: "Editar Rota",
        veiculosRota: "Veículos da Rota",
        editarVeiculo: "Editar Veículo",
        alunosRota: "Alunos da Rota",
        editarDesconto: "Editar Desconto",
        bruto: "Cálculo Bruto",
        auxilio: "Regra 30/70",
        calculoFinal: "Cálculo Final",
        relatorioGeral: "Relatório Geral",
        memoriaCalculo: "Memória de Cálculo",
        historico: "Histórico",
        logs: "Logs",
        dashboard: "Dashboard",
        configMes: "Configurar Mês",
        login: "Login"
    };

    const nome = nomesPaginas[state.paginaAtual] || "Página";

    return `
        <div style="
            margin-bottom:15px;
            padding:8px 12px;
            background:var(--card);
            border-radius:8px;
            font-size:14px;
            opacity:0.9;
        ">
            📍 <b>${nome}</b>
        </div>
    `;
}


// ---------------------------------------------------------
// MENU LATERAL DINÂMICO
// ---------------------------------------------------------
function gerarMenuLateral() {

    if (state.paginaAtual === "login") return "";

    return `
        <div id="menuLateral" style="
            position:fixed;
            left:0;
            top:0;
            width:210px;
            height:100%;
            background:var(--card);
            padding:20px;
            box-shadow:2px 0 8px rgba(0,0,0,0.15);
            z-index:999;
        ">
            <h3 style="margin-bottom:20px;">Menu</h3>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">🏠 Início</button>
            <button class="btn btn-secondary" onclick="mudarPagina('rotas')">🛣️ Rotas</button>
            <button class="btn btn-secondary" onclick="mudarPagina('dashboard')">📊 Dashboard</button>
            <button class="btn btn-secondary" onclick="mudarPagina('relatorioGeral')">📄 Relatório</button>
            <button class="btn btn-secondary" onclick="mudarPagina('historico')">📚 Histórico</button>
            <button class="btn btn-secondary" onclick="mudarPagina('logs')">📝 Logs</button>
            <button class="btn btn-secondary" onclick="mudarPagina('configMes')">⚙️ Configurações</button>

            <hr class="linha">

            <button class="btn btn-danger" onclick="logout()">Sair</button>
        </div>
    `;
}


// ---------------------------------------------------------
// ATALHOS DE TECLADO
// ---------------------------------------------------------
document.addEventListener("keydown", e => {

    if (e.ctrlKey && e.key === "1") mudarPagina("home");
    if (e.ctrlKey && e.key === "2") mudarPagina("rotas");
    if (e.ctrlKey && e.key === "3") mudarPagina("dashboard");
    if (e.ctrlKey && e.key === "4") mudarPagina("relatorioGeral");
    if (e.ctrlKey && e.key === "5") mudarPagina("historico");

    if (e.key === "Escape") mudarPagina("home");
});


// ---------------------------------------------------------
// INSERIR BREADCRUMB E MENU EM TODAS AS PÁGINAS
// ---------------------------------------------------------
function inserirNavegacaoInteligente() {
    const app = document.getElementById("app");

    if (state.paginaAtual !== "login") {
        app.innerHTML = gerarMenuLateral() + `
            <div style="margin-left:230px;">
                ${gerarBreadcrumb()}
                ${app.innerHTML}
            </div>
        `;
    }
}


// ---------------------------------------------------------
// REGISTRO NO RENDER
// ---------------------------------------------------------
const renderOriginalParte18 = render;
render = function () {
    renderOriginalParte18();

    inserirNavegacaoInteligente();
};
/*  
===========================================================
SUPER APP.JS — PARTE 19/20
PERMISSÕES AVANÇADAS POR PERFIL
===========================================================
*/


// ---------------------------------------------------------
// TABELA DE PERMISSÕES
// ---------------------------------------------------------
const permissoes = {

    administrador: {
        editarRotas: true,
        editarVeiculos: true,
        editarAlunos: true,
        acessarCalculos: true,
        acessarRelatorios: true,
        acessarHistorico: true,
        acessarDashboard: true,
        acessarConfig: true,
        exportar: true
    },

    financeiro: {
        editarRotas: false,
        editarVeiculos: false,
        editarAlunos: false,
        acessarCalculos: true,
        acessarRelatorios: true,
        acessarHistorico: true,
        acessarDashboard: true,
        acessarConfig: true,
        exportar: true
    },

    auditor: {
        editarRotas: false,
        editarVeiculos: false,
        editarAlunos: false,
        acessarCalculos: true,
        acessarRelatorios: true,
        acessarHistorico: true,
        acessarDashboard: true,
        acessarConfig: false,
        exportar: false
    },

    motorista: {
        editarRotas: false,
        editarVeiculos: false,
        editarAlunos: false,
        acessarCalculos: false,
        acessarRelatorios: false,
        acessarHistorico: false,
        acessarDashboard: false,
        acessarConfig: false,
        exportar: false
    },

    visualizador: {
        editarRotas: false,
        editarVeiculos: false,
        editarAlunos: false,
        acessarCalculos: false,
        acessarRelatorios: true,
        acessarHistorico: false,
        acessarDashboard: true,
        acessarConfig: false,
        exportar: false
    }
};


// ---------------------------------------------------------
// FUNÇÃO CENTRAL DE VERIFICAÇÃO
// ---------------------------------------------------------
function pode(permissao) {
    if (!state.usuarioLogado) return false;

    const perfil = state.usuarioLogado.perfil;
    const regras = permissoes[perfil];

    if (!regras) return false;

    return regras[permissao] === true;
}


// ---------------------------------------------------------
// BLOQUEAR ACESSO A PÁGINAS PROIBIDAS
// ---------------------------------------------------------
function protegerPagina(pagina) {

    const paginasProtegidas = {
        rotas: "editarRotas",
        editarRota: "editarRotas",
        veiculosRota: "editarVeiculos",
        editarVeiculo: "editarVeiculos",
        alunosRota: "editarAlunos",
        editarDesconto: "editarAlunos",
        bruto: "acessarCalculos",
        auxilio: "acessarCalculos",
        calculoFinal: "acessarCalculos",
        relatorioGeral: "acessarRelatorios",
        memoriaCalculo: "acessarRelatorios",
        historico: "acessarHistorico",
        dashboard: "acessarDashboard",
        configMes: "acessarConfig"
    };

    const permissaoNecessaria = paginasProtegidas[pagina];

    if (!permissaoNecessaria) return true;

    if (!pode(permissaoNecessaria)) {
        logInterno(`Acesso negado à página: ${pagina}`, "acesso");
        alert("Você não tem permissão para acessar esta página.");
        mudarPagina("home");
        return false;
    }

    return true;
}


// ---------------------------------------------------------
// OCULTAR BOTÕES CONFORME PERFIL
// ---------------------------------------------------------
function aplicarPermissoesUI() {
    const app = document.getElementById("app");

    if (!state.usuarioLogado) return;

    const perfil = state.usuarioLogado.perfil;

    // remover botões proibidos
    if (!pode("editarRotas")) {
        app.innerHTML = app.innerHTML.replace(/Editar Rota/g, "Visualizar");
        app.innerHTML = app.innerHTML.replace(/Adicionar Rota/g, "");
    }

    if (!pode("editarVeiculos")) {
        app.innerHTML = app.innerHTML.replace(/Gerenciar Veículos/g, "Ver Veículos");
        app.innerHTML = app.innerHTML.replace(/Adicionar Veículo/g, "");
    }

    if (!pode("editarAlunos")) {
        app.innerHTML = app.innerHTML.replace(/Gerenciar Alunos/g, "Ver Alunos");
        app.innerHTML = app.innerHTML.replace(/Adicionar Desconto/g, "");
    }

    if (!pode("exportar")) {
        app.innerHTML = app.innerHTML.replace(/Exportar PDF/g, "");
        app.innerHTML = app.innerHTML.replace(/Exportar Excel/g, "");
    }

    if (!pode("acessarConfig")) {
        app.innerHTML = app.innerHTML.replace(/Configurações/g, "");
    }
}


// ---------------------------------------------------------
// INTEGRAR PERMISSÕES AO RENDER
// ---------------------------------------------------------
const renderOriginalParte19 = render;
render = function () {

    // proteger página antes de renderizar
    if (!protegerPagina(state.paginaAtual)) return;

    renderOriginalParte19();

    aplicarPermissoesUI();
};
/*  
===========================================================
SUPER APP.JS — PARTE 20/20
FINALIZAÇÃO + OTIMIZAÇÕES + MODO PRODUÇÃO
===========================================================
*/


// ---------------------------------------------------------
// OTIMIZAÇÃO: PROTEGER O STATE CONTRA DADOS CORROMPIDOS
// ---------------------------------------------------------
function validarState() {
    try {
        if (!state) throw "State inexistente";

        if (!Array.isArray(state.rotas)) state.rotas = [];
        if (!Array.isArray(state.historico)) state.historico = [];
        if (!Array.isArray(state.logs)) state.logs = [];

        if (!state.mesReferencia) state.mesReferencia = new Date().getMonth() + 1;
        if (!state.anoReferencia) state.anoReferencia = new Date().getFullYear();

        if (!state.auxilioMensal) state.auxilioMensal = 0;

        if (!state.proximaRotaId) state.proximaRotaId = 1;
        if (!state.proximoHistoricoId) state.proximoHistoricoId = 1;

        if (!state.usuarioLogado) state.usuarioLogado = null;

    } catch (e) {
        console.error("Erro ao validar state:", e);
        alert("Ocorreu um erro ao carregar os dados. O sistema restaurou valores padrão.");
        state = criarStateInicial();
        salvarBackup();
    }
}


// ---------------------------------------------------------
// OTIMIZAÇÃO: MODO PRODUÇÃO (desabilita logs no console)
// ---------------------------------------------------------
function ativarModoProducao() {
    console.log = function () {};
    console.warn = function () {};
    console.error = function () {};
}


// ---------------------------------------------------------
// OTIMIZAÇÃO: RENDER MAIS RÁPIDO
// ---------------------------------------------------------
function renderSeguro(html) {
    const app = document.getElementById("app");
    app.innerHTML = html;
}


// ---------------------------------------------------------
// TRATAMENTO GLOBAL DE ERROS
// ---------------------------------------------------------
window.onerror = function (msg, url, line) {
    logInterno(`Erro global: ${msg} (linha ${line})`, "erro");
    alert("Ocorreu um erro inesperado. Verifique os dados ou recarregue a página.");
};


// ---------------------------------------------------------
// MENSAGEM DE BOAS-VINDAS INTELIGENTE
// ---------------------------------------------------------
function mensagemBoasVindas() {
    if (!state.usuarioLogado) return "";

    const nome = state.usuarioLogado.usuario;
    const perfil = state.usuarioLogado.perfil;

    return `
        <div class="card" style="background:var(--card2); margin-bottom:20px;">
            <h3>Bem-vindo, ${nome}!</h3>
            <p>Perfil: <b>${perfil}</b></p>
        </div>
    `;
}


// ---------------------------------------------------------
// INTEGRAR MELHORIAS AO RENDER
// ---------------------------------------------------------
const renderOriginalParte20 = render;
render = function () {

    validarState();

    renderOriginalParte20();

    // inserir boas-vindas na home
    if (state.paginaAtual === "home") {
        const app = document.getElementById("app");
        app.innerHTML = mensagemBoasVindas() + app.innerHTML;
    }
};
/*  
===========================================================
SUPER APP.JS — PARTE 21/20
CRIAR CONTAS + CONTA TAYLOR (ACESSO TOTAL)
===========================================================
*/


// ---------------------------------------------------------
// ADICIONAR CONTA FIXA "taylor / 1926"
// ---------------------------------------------------------
function garantirContaTaylor() {

    const existe = state.usuarios?.some(u => u.usuario === "taylor");

    if (!existe) {
        if (!state.usuarios) state.usuarios = [];

        state.usuarios.push({
            usuario: "taylor",
            senha: "1926",
            perfil: "administrador",
            fixo: true // não pode ser apagado
        });

        logInterno("Conta fixa 'taylor' criada automaticamente", "sistema");
        salvarBackup();
    }
}


// ---------------------------------------------------------
// TELA DE CRIAÇÃO DE CONTA
// ---------------------------------------------------------
function paginaCriarConta() {

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Criar Conta")}

            <div class="card">

                <label>Usuário:</label>
                <input id="novoUsuario" type="text">

                <label>Senha:</label>
                <input id="novaSenha" type="password">

                <label>Confirmar Senha:</label>
                <input id="confirmarSenha" type="password">

                <label>Perfil:</label>
                <select id="novoPerfil">
                    <option value="visualizador">Visualizador</option>
                    <option value="motorista">Motorista</option>
                    <option value="auditor">Auditor</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="administrador">Administrador</option>
                </select>

                <button class="btn btn-primary" onclick="criarConta()">Criar Conta</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('login')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// LÓGICA DE CRIAÇÃO DE CONTA
// ---------------------------------------------------------
function criarConta() {

    const usuario = document.getElementById("novoUsuario").value.trim();
    const senha = document.getElementById("novaSenha").value;
    const confirmar = document.getElementById("confirmarSenha").value;
    const perfil = document.getElementById("novoPerfil").value;

    if (!usuario || !senha || !confirmar) {
        alert("Preencha todos os campos.");
        return;
    }

    if (senha !== confirmar) {
        alert("As senhas não coincidem.");
        return;
    }

    if (senha.length < 3) {
        alert("A senha deve ter pelo menos 3 caracteres.");
        return;
    }

    if (!state.usuarios) state.usuarios = [];

    const existe = state.usuarios.some(u => u.usuario === usuario);

    if (existe) {
        alert("Este usuário já existe.");
        return;
    }

    state.usuarios.push({
        usuario,
        senha,
        perfil,
        fixo: false
    });

    logInterno(`Nova conta criada: ${usuario} (${perfil})`, "usuario");

    salvarBackup();

    alert("Conta criada com sucesso!");
    mudarPagina("login");
}


// ---------------------------------------------------------
// BOTÃO "CRIAR CONTA" NA TELA DE LOGIN
// ---------------------------------------------------------
function inserirBotaoCriarConta() {
    const app = document.getElementById("app");

    if (state.paginaAtual === "login") {
        app.innerHTML = app.innerHTML.replace(
            "</div>",
            `
            <button class="btn btn-secondary" onclick="mudarPagina('criarConta')">
                Criar Conta
            </button>
            </div>
            `
        );
    }
}


// ---------------------------------------------------------
// PROTEGER EXCLUSÃO DE CONTAS FIXAS
// ---------------------------------------------------------
function excluirUsuario(usuario) {

    const alvo = state.usuarios.find(u => u.usuario === usuario);

    if (!alvo) return;

    if (alvo.fixo) {
        alert("Esta conta é fixa e não pode ser apagada.");
        return;
    }

    state.usuarios = state.usuarios.filter(u => u.usuario !== usuario);

    logInterno(`Usuário excluído: ${usuario}`, "usuario");

    salvarBackup();
}


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte21 = render;
render = function () {

    garantirContaTaylor();

    renderOriginalParte21();

    inserirBotaoCriarConta();
};
/*  
===========================================================
SUPER APP.JS — PARTE 22/20
GERENCIAMENTO COMPLETO DE USUÁRIOS (ADMIN)
===========================================================
*/


// ---------------------------------------------------------
// PÁGINA: LISTAR USUÁRIOS
// ---------------------------------------------------------
function paginaUsuarios() {

    if (!pode("acessarConfig")) {
        alert("Você não tem permissão para acessar usuários.");
        mudarPagina("home");
        return "";
    }

    let linhas = "";

    state.usuarios.forEach(u => {
        linhas += `
            <tr>
                <td>${u.usuario}</td>
                <td>${u.perfil}</td>
                <td>${u.fixo ? "Sim" : "Não"}</td>
                <td>
                    <button class="btn btn-primary" onclick="mudarPagina('editarUsuario', '${u.usuario}')">Editar</button>
                    ${u.fixo ? "" : `<button class="btn btn-danger" onclick="excluirUsuarioPainel('${u.usuario}')">Excluir</button>`}
                </td>
            </tr>
        `;
    });

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Gerenciar Usuários")}

            <div class="card">
                <table class="tabela">
                    <tr>
                        <th>Usuário</th>
                        <th>Perfil</th>
                        <th>Fixo</th>
                        <th>Ações</th>
                    </tr>
                    ${linhas}
                </table>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// PÁGINA: EDITAR USUÁRIO
// ---------------------------------------------------------
function paginaEditarUsuario(usuarioAlvo) {

    const u = state.usuarios.find(x => x.usuario === usuarioAlvo);

    if (!u) {
        alert("Usuário não encontrado.");
        mudarPagina("usuarios");
        return "";
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Editar Usuário")}

            <div class="card">

                <label>Usuário:</label>
                <input id="editUsuario" type="text" value="${u.usuario}" ${u.fixo ? "disabled" : ""}>

                <label>Nova Senha (opcional):</label>
                <input id="editSenha" type="password">

                <label>Perfil:</label>
                <select id="editPerfil">
                    <option value="visualizador" ${u.perfil === "visualizador" ? "selected" : ""}>Visualizador</option>
                    <option value="motorista" ${u.perfil === "motorista" ? "selected" : ""}>Motorista</option>
                    <option value="auditor" ${u.perfil === "auditor" ? "selected" : ""}>Auditor</option>
                    <option value="financeiro" ${u.perfil === "financeiro" ? "selected" : ""}>Financeiro</option>
                    <option value="administrador" ${u.perfil === "administrador" ? "selected" : ""}>Administrador</option>
                </select>

                <button class="btn btn-primary" onclick="salvarEdicaoUsuario('${u.usuario}')">Salvar Alterações</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('usuarios')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// SALVAR EDIÇÃO DE USUÁRIO
// ---------------------------------------------------------
function salvarEdicaoUsuario(usuarioOriginal) {

    const novoUsuario = document.getElementById("editUsuario").value.trim();
    const novaSenha = document.getElementById("editSenha").value;
    const novoPerfil = document.getElementById("editPerfil").value;

    const u = state.usuarios.find(x => x.usuario === usuarioOriginal);

    if (!u) {
        alert("Erro: usuário não encontrado.");
        return;
    }

    // impedir renomear contas fixas
    if (u.fixo && novoUsuario !== usuarioOriginal) {
        alert("Este usuário é fixo e não pode ser renomeado.");
        return;
    }

    // impedir duplicados
    if (novoUsuario !== usuarioOriginal) {
        const existe = state.usuarios.some(x => x.usuario === novoUsuario);
        if (existe) {
            alert("Já existe um usuário com esse nome.");
            return;
        }
    }

    // aplicar alterações
    u.usuario = novoUsuario;
    u.perfil = novoPerfil;

    if (novaSenha.trim() !== "") {
        u.senha = novaSenha;
    }

    logInterno(`Usuário editado: ${usuarioOriginal} → ${novoUsuario}`, "usuario");

    salvarBackup();

    alert("Alterações salvas com sucesso.");
    mudarPagina("usuarios");
}


// ---------------------------------------------------------
// EXCLUIR USUÁRIO PELO PAINEL
// ---------------------------------------------------------
function excluirUsuarioPainel(usuario) {

    const u = state.usuarios.find(x => x.usuario === usuario);

    if (!u) return;

    if (u.fixo) {
        alert("Este usuário é fixo e não pode ser apagado.");
        return;
    }

    if (!confirm(`Deseja realmente excluir o usuário "${usuario}"?`)) return;

    state.usuarios = state.usuarios.filter(x => x.usuario !== usuario);

    logInterno(`Usuário excluído pelo admin: ${usuario}`, "usuario");

    salvarBackup();

    mudarPagina("usuarios");
}


// ---------------------------------------------------------
// INTEGRAR NOVAS PÁGINAS AO RENDER
// ---------------------------------------------------------
const renderOriginalParte22 = render;
render = function (param1, param2) {

    if (state.paginaAtual === "usuarios") {
        renderSeguro(paginaUsuarios());
        inserirNavegacaoInteligente();
        return;
    }

    if (state.paginaAtual === "editarUsuario") {
        renderSeguro(paginaEditarUsuario(param1));
        inserirNavegacaoInteligente();
        return;
    }

    renderOriginalParte22(param1, param2);
};
/*  
===========================================================
SUPER APP.JS — PARTE 23/20
TROCA DE SENHA PELO PRÓPRIO USUÁRIO
===========================================================
*/


// ---------------------------------------------------------
// PÁGINA: ALTERAR SENHA
// ---------------------------------------------------------
function paginaAlterarSenha() {

    if (!state.usuarioLogado) {
        alert("Você precisa estar logado.");
        mudarPagina("login");
        return "";
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Alterar Senha")}

            <div class="card">

                <label>Senha Atual:</label>
                <input id="senhaAtual" type="password">

                <label>Nova Senha:</label>
                <input id="novaSenhaUser" type="password">

                <label>Confirmar Nova Senha:</label>
                <input id="confirmarNovaSenhaUser" type="password">

                <button class="btn btn-primary" onclick="alterarSenhaUsuario()">Salvar Nova Senha</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// LÓGICA DE ALTERAÇÃO DE SENHA
// ---------------------------------------------------------
function alterarSenhaUsuario() {

    const atual = document.getElementById("senhaAtual").value;
    const nova = document.getElementById("novaSenhaUser").value;
    const confirmar = document.getElementById("confirmarNovaSenhaUser").value;

    const user = state.usuarioLogado;

    const registro = state.usuarios.find(u => u.usuario === user.usuario);

    if (!registro) {
        alert("Erro interno: usuário não encontrado.");
        return;
    }

    if (registro.senha !== atual) {
        alert("Senha atual incorreta.");
        return;
    }

    if (nova.length < 3) {
        alert("A nova senha deve ter pelo menos 3 caracteres.");
        return;
    }

    if (nova !== confirmar) {
        alert("As senhas não coincidem.");
        return;
    }

    registro.senha = nova;

    logInterno(`Usuário alterou a própria senha: ${registro.usuario}`, "seguranca");

    salvarBackup();

    alert("Senha alterada com sucesso!");
    mudarPagina("home");
}


// ---------------------------------------------------------
// BOTÃO NO MENU LATERAL
// ---------------------------------------------------------
function inserirBotaoAlterarSenha() {

    if (!state.usuarioLogado) return;

    const menu = document.getElementById("menuLateral");

    if (!menu) return;

    if (!menu.innerHTML.includes("Alterar Senha")) {
        menu.innerHTML += `
            <button class="btn btn-secondary" onclick="mudarPagina('alterarSenha')">
                🔐 Alterar Senha
            </button>
        `;
    }
}


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte23 = render;
render = function (param1, param2) {

    if (state.paginaAtual === "alterarSenha") {
        renderSeguro(paginaAlterarSenha());
        inserirNavegacaoInteligente();
        return;
    }

    renderOriginalParte23(param1, param2);

    inserirBotaoAlterarSenha();
};
/*  
===========================================================
SUPER APP.JS — PARTE 24/20
RECUPERAÇÃO DE SENHA (PERGUNTA SECRETA)
===========================================================
*/


// ---------------------------------------------------------
// ADICIONAR CAMPOS DE PERGUNTA SECRETA A USUÁRIOS ANTIGOS
// ---------------------------------------------------------
function garantirPerguntasSecretas() {

    if (!state.usuarios) state.usuarios = [];

    state.usuarios.forEach(u => {
        if (!u.pergunta) u.pergunta = "Qual é a sua cor favorita?";
        if (!u.resposta) u.resposta = "azul"; // padrão até o usuário editar
    });

    salvarBackup();
}


// ---------------------------------------------------------
// TELA: ESQUECI MINHA SENHA
// ---------------------------------------------------------
function paginaEsqueciSenha() {

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Recuperar Senha")}

            <div class="card">

                <label>Usuário:</label>
                <input id="recUsuario" type="text">

                <button class="btn btn-primary" onclick="carregarPerguntaSecreta()">
                    Continuar
                </button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('login')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// CARREGAR PERGUNTA SECRETA
// ---------------------------------------------------------
function carregarPerguntaSecreta() {

    const usuario = document.getElementById("recUsuario").value.trim();

    const u = state.usuarios.find(x => x.usuario === usuario);

    if (!u) {
        alert("Usuário não encontrado.");
        return;
    }

    state.recuperacaoUsuario = usuario;

    mudarPagina("responderPergunta");
}


// ---------------------------------------------------------
// TELA: RESPONDER PERGUNTA SECRETA
// ---------------------------------------------------------
function paginaResponderPergunta() {

    const usuario = state.recuperacaoUsuario;

    const u = state.usuarios.find(x => x.usuario === usuario);

    if (!u) {
        alert("Erro interno.");
        mudarPagina("login");
        return "";
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Pergunta Secreta")}

            <div class="card">

                <p><b>${u.pergunta}</b></p>

                <label>Sua resposta:</label>
                <input id="respostaSecreta" type="text">

                <button class="btn btn-primary" onclick="validarRespostaSecreta()">
                    Validar Resposta
                </button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('esqueciSenha')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// VALIDAR RESPOSTA SECRETA
// ---------------------------------------------------------
function validarRespostaSecreta() {

    const usuario = state.recuperacaoUsuario;
    const resposta = document.getElementById("respostaSecreta").value.trim().toLowerCase();

    const u = state.usuarios.find(x => x.usuario === usuario);

    if (!u) {
        alert("Erro interno.");
        mudarPagina("login");
        return;
    }

    if (resposta !== u.resposta.toLowerCase()) {
        alert("Resposta incorreta.");
        return;
    }

    mudarPagina("novaSenhaRecuperacao");
}


// ---------------------------------------------------------
// TELA: DEFINIR NOVA SENHA
// ---------------------------------------------------------
function paginaNovaSenhaRecuperacao() {

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Definir Nova Senha")}

            <div class="card">

                <label>Nova Senha:</label>
                <input id="novaSenhaRec" type="password">

                <label>Confirmar Nova Senha:</label>
                <input id="confirmarNovaSenhaRec" type="password">

                <button class="btn btn-primary" onclick="salvarNovaSenhaRecuperacao()">
                    Salvar Nova Senha
                </button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('login')">Cancelar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// SALVAR NOVA SENHA
// ---------------------------------------------------------
function salvarNovaSenhaRecuperacao() {

    const nova = document.getElementById("novaSenhaRec").value;
    const confirmar = document.getElementById("confirmarNovaSenhaRec").value;

    if (nova.length < 3) {
        alert("A senha deve ter pelo menos 3 caracteres.");
        return;
    }

    if (nova !== confirmar) {
        alert("As senhas não coincidem.");
        return;
    }

    const usuario = state.recuperacaoUsuario;
    const u = state.usuarios.find(x => x.usuario === usuario);

    if (!u) {
        alert("Erro interno.");
        mudarPagina("login");
        return;
    }

    u.senha = nova;

    logInterno(`Senha redefinida via recuperação: ${usuario}`, "seguranca");

    salvarBackup();

    alert("Senha redefinida com sucesso!");
    mudarPagina("login");
}


// ---------------------------------------------------------
// BOTÃO "ESQUECI MINHA SENHA" NO LOGIN
// ---------------------------------------------------------
function inserirBotaoEsqueciSenha() {

    if (state.paginaAtual === "login") {
        const app = document.getElementById("app");

        app.innerHTML = app.innerHTML.replace(
            "</div>",
            `
            <button class="btn btn-secondary" onclick="mudarPagina('esqueciSenha')">
                Esqueci minha senha
            </button>
            </div>
            `
        );
    }
}


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte24 = render;
render = function (param1, param2) {

    garantirPerguntasSecretas();

    if (state.paginaAtual === "esqueciSenha") {
        renderSeguro(paginaEsqueciSenha());
        return;
    }

    if (state.paginaAtual === "responderPergunta") {
        renderSeguro(paginaResponderPergunta());
        return;
    }

    if (state.paginaAtual === "novaSenhaRecuperacao") {
        renderSeguro(paginaNovaSenhaRecuperacao());
        return;
    }

    renderOriginalParte24(param1, param2);

    inserirBotaoEsqueciSenha();
};
/*  
===========================================================
SUPER APP.JS — PARTE 25/20
PAINEL AVANÇADO DO ADMINISTRADOR
===========================================================
*/


// ---------------------------------------------------------
// PÁGINA: PAINEL DO ADMINISTRADOR
// ---------------------------------------------------------
function paginaPainelAdmin() {

    if (!state.usuarioLogado || state.usuarioLogado.perfil !== "administrador") {
        alert("Acesso restrito ao administrador.");
        mudarPagina("home");
        return "";
    }

    const totalUsuarios = state.usuarios?.length || 0;
    const totalRotas = state.rotas?.length || 0;

    let totalVeiculos = 0;
    let totalAlunos = 0;

    state.rotas.forEach(r => {
        totalVeiculos += r.veiculos?.length || 0;
        totalAlunos += r.alunos?.length || 0;
    });

    const logsRecentes = state.logs.slice(-5).reverse().map(l => `
        <tr>
            <td>${l.data}</td>
            <td>${l.tipo}</td>
            <td>${l.msg}</td>
        </tr>
    `).join("");

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Painel do Administrador")}

            <div class="card">
                <h3>Resumo do Sistema</h3>
                <p><b>Mês de Referência:</b> ${state.mesReferencia}/${state.anoReferencia}</p>
                <p><b>Modo Simulação:</b> ${state.simulacaoAtiva ? "Ativo" : "Desativado"}</p>
            </div>

            <div class="card">
                <h3>Estatísticas Gerais</h3>
                <p><b>Usuários:</b> ${totalUsuarios}</p>
                <p><b>Rotas:</b> ${totalRotas}</p>
                <p><b>Veículos:</b> ${totalVeiculos}</p>
                <p><b>Alunos:</b> ${totalAlunos}</p>
            </div>

            <div class="card">
                <h3>Logs Recentes</h3>
                <table class="tabela">
                    <tr>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Mensagem</th>
                    </tr>
                    ${logsRecentes}
                </table>
            </div>

            <div class="card">
                <h3>Ações Rápidas</h3>
                <button class="btn btn-primary" onclick="mudarPagina('usuarios')">Gerenciar Usuários</button>
                <button class="btn btn-primary" onclick="mudarPagina('logs')">Ver Todos os Logs</button>
                <button class="btn btn-primary" onclick="mudarPagina('configMes')">Configurar Mês</button>
                <button class="btn btn-primary" onclick="mudarPagina('dashboard')">Dashboard</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// BOTÃO NO MENU LATERAL (somente admin)
// ---------------------------------------------------------
function inserirBotaoPainelAdmin() {

    if (!state.usuarioLogado) return;
    if (state.usuarioLogado.perfil !== "administrador") return;

    const menu = document.getElementById("menuLateral");
    if (!menu) return;

    if (!menu.innerHTML.includes("Painel do Administrador")) {
        menu.innerHTML = `
            <button class="btn btn-secondary" onclick="mudarPagina('painelAdmin')">
                🛠️ Painel do Administrador
            </button>
            ${menu.innerHTML}
        `;
    }
}


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte25 = render;
render = function (param1, param2) {

    if (state.paginaAtual === "painelAdmin") {
        renderSeguro(paginaPainelAdmin());
        inserirNavegacaoInteligente();
        return;
    }

    renderOriginalParte25(param1, param2);

    inserirBotaoPainelAdmin();
};
/*  
===========================================================
SUPER APP.JS — PARTE 26/20
SISTEMA DE NOTIFICAÇÕES INTERNAS (TOAST + BANNER)
===========================================================
*/


// ---------------------------------------------------------
// ESTILOS DAS NOTIFICAÇÕES (injetados automaticamente)
// ---------------------------------------------------------
(function adicionarEstilosNotificacoes() {
    const estilo = document.createElement("style");
    estilo.innerHTML = `
        #toastContainer {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
        }

        .toast {
            background: var(--card2);
            padding: 12px 18px;
            margin-top: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            opacity: 0;
            transform: translateX(50px);
            transition: all 0.4s ease;
            font-size: 15px;
            min-width: 220px;
        }

        .toast.show {
            opacity: 1;
            transform: translateX(0);
        }

        .toast-success { border-left: 6px solid #4CAF50; }
        .toast-error { border-left: 6px solid #F44336; }
        .toast-warning { border-left: 6px solid #FFC107; }
        .toast-info { border-left: 6px solid #2196F3; }

        #bannerNotificacao {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            padding: 14px;
            text-align: center;
            font-size: 16px;
            background: var(--card2);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 99998;
            display: none;
        }
    `;
    document.head.appendChild(estilo);
})();


// ---------------------------------------------------------
// CONTAINER PARA TOASTS
// ---------------------------------------------------------
function garantirToastContainer() {
    if (!document.getElementById("toastContainer")) {
        const div = document.createElement("div");
        div.id = "toastContainer";
        document.body.appendChild(div);
    }
}


// ---------------------------------------------------------
// FUNÇÃO PRINCIPAL DE NOTIFICAÇÃO (TOAST)
// ---------------------------------------------------------
function notificar(msg, tipo = "info", duracao = 3500) {

    garantirToastContainer();

    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = msg;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, duracao);

    logInterno(`Notificação (${tipo}): ${msg}`, "notificacao");
}


// ---------------------------------------------------------
// NOTIFICAÇÃO PERSISTENTE (BANNER)
// ---------------------------------------------------------
function mostrarBanner(msg, tipo = "info") {

    let banner = document.getElementById("bannerNotificacao");

    if (!banner) {
        banner = document.createElement("div");
        banner.id = "bannerNotificacao";
        document.body.appendChild(banner);
    }

    banner.style.display = "block";
    banner.innerHTML = msg;

    banner.style.borderBottom =
        tipo === "success" ? "4px solid #4CAF50" :
        tipo === "error"   ? "4px solid #F44336" :
        tipo === "warning" ? "4px solid #FFC107" :
                             "4px solid #2196F3";

    logInterno(`Banner (${tipo}): ${msg}`, "notificacao");
}


// ---------------------------------------------------------
// REMOVER BANNER
// ---------------------------------------------------------
function esconderBanner() {
    const banner = document.getElementById("bannerNotificacao");
    if (banner) banner.style.display = "none";
}


// ---------------------------------------------------------
// INTEGRAR NOTIFICAÇÕES AO RENDER
// ---------------------------------------------------------
const renderOriginalParte26 = render;
render = function (param1, param2) {

    renderOriginalParte26(param1, param2);

    // exemplo: banner quando modo simulação está ativo
    if (state.simulacaoAtiva) {
        mostrarBanner("⚠️ MODO SIMULAÇÃO ATIVO — Nenhuma alteração será salva.", "warning");
    } else {
        esconderBanner();
    }
};
/*  
===========================================================
SUPER APP.JS — PARTE 27/20
TEMA PERSONALIZADO (CORES, LOGO, BRANDING)
===========================================================
*/


// ---------------------------------------------------------
// TEMA PADRÃO
// ---------------------------------------------------------
const temasDisponiveis = {
    padrao: {
        nome: "Padrão",
        "--bg": "#f2f2f2",
        "--card": "#ffffff",
        "--card2": "#e9e9e9",
        "--texto": "#222",
        "--primaria": "#4A90E2",
        "--secundaria": "#7B8D93"
    },

    escuro: {
        nome: "Escuro",
        "--bg": "#1e1e1e",
        "--card": "#2a2a2a",
        "--card2": "#333",
        "--texto": "#f5f5f5",
        "--primaria": "#6ab0ff",
        "--secundaria": "#999"
    },

    roxo: {
        nome: "Roxo",
        "--bg": "#f5f0ff",
        "--card": "#ffffff",
        "--card2": "#efe6ff",
        "--texto": "#2a003f",
        "--primaria": "#8e44ad",
        "--secundaria": "#b57edc"
    },

    verde: {
        nome: "Verde",
        "--bg": "#f3fff5",
        "--card": "#ffffff",
        "--card2": "#e6ffe9",
        "--texto": "#003f1a",
        "--primaria": "#27ae60",
        "--secundaria": "#2ecc71"
    }
};


// ---------------------------------------------------------
// APLICAR TEMA
// ---------------------------------------------------------
function aplicarTema(nomeTema) {

    const tema = temasDisponiveis[nomeTema];

    if (!tema) return;

    const root = document.documentElement;

    Object.keys(tema).forEach(chave => {
        if (chave.startsWith("--")) {
            root.style.setProperty(chave, tema[chave]);
        }
    });

    state.temaAtual = nomeTema;
    salvarBackup();

    logInterno(`Tema aplicado: ${nomeTema}`, "tema");
}


// ---------------------------------------------------------
// GARANTIR QUE O TEMA EXISTE
// ---------------------------------------------------------
function garantirTema() {
    if (!state.temaAtual) {
        state.temaAtual = "padrao";
        salvarBackup();
    }
    aplicarTema(state.temaAtual);
}


// ---------------------------------------------------------
// PÁGINA: CONFIGURAR TEMA
// ---------------------------------------------------------
function paginaTema() {

    let opcoes = "";

    Object.keys(temasDisponiveis).forEach(key => {
        const t = temasDisponiveis[key];
        opcoes += `
            <option value="${key}" ${state.temaAtual === key ? "selected" : ""}>
                ${t.nome}
            </option>
        `;
    });

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Personalização de Tema")}

            <div class="card">

                <label>Selecione um tema:</label>
                <select id="selectTema">${opcoes}</select>

                <button class="btn btn-primary" onclick="salvarTemaEscolhido()">
                    Aplicar Tema
                </button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// SALVAR TEMA ESCOLHIDO
// ---------------------------------------------------------
function salvarTemaEscolhido() {
    const tema = document.getElementById("selectTema").value;
    aplicarTema(tema);
    notificar("Tema aplicado com sucesso!", "success");
}


// ---------------------------------------------------------
// BOTÃO NO MENU LATERAL
// ---------------------------------------------------------
function inserirBotaoTema() {

    if (!state.usuarioLogado) return;

    const menu = document.getElementById("menuLateral");
    if (!menu) return;

    if (!menu.innerHTML.includes("Tema")) {
        menu.innerHTML += `
            <button class="btn btn-secondary" onclick="mudarPagina('tema')">
                🎨 Tema
            </button>
        `;
    }
}


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte27 = render;
render = function (param1, param2) {

    garantirTema();

    if (state.paginaAtual === "tema") {
        renderSeguro(paginaTema());
        inserirNavegacaoInteligente();
        return;
    }

    renderOriginalParte27(param1, param2);

    inserirBotaoTema();
};
/*  
===========================================================
SUPER APP.JS — PARTE 28/20
BACKUP E RESTAURAÇÃO (EXPORTAR / IMPORTAR)
===========================================================
*/


// ---------------------------------------------------------
// EXPORTAR BACKUP
// ---------------------------------------------------------
function exportarBackup() {

    if (!pode("acessarConfig")) {
        notificar("Você não tem permissão para exportar backup.", "error");
        return;
    }

    const dados = JSON.stringify(state, null, 2);

    const blob = new Blob([dados], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_asseuf_${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);

    logInterno("Backup exportado pelo administrador", "backup");
    notificar("Backup exportado com sucesso!", "success");
}


// ---------------------------------------------------------
// IMPORTAR BACKUP
// ---------------------------------------------------------
function importarBackupArquivo(event) {

    const arquivo = event.target.files[0];

    if (!arquivo) {
        notificar("Nenhum arquivo selecionado.", "warning");
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function (e) {

        try {
            const dados = JSON.parse(e.target.result);

            if (!dados || typeof dados !== "object") {
                throw "Arquivo inválido";
            }

            // proteger contas fixas
            if (!dados.usuarios) dados.usuarios = [];

            const existeTaylor = dados.usuarios.some(u => u.usuario === "taylor");
            const existeAdmin = dados.usuarios.some(u => u.usuario === "admin");

            if (!existeTaylor) {
                dados.usuarios.push({
                    usuario: "taylor",
                    senha: "1926",
                    perfil: "administrador",
                    fixo: true
                });
            }

            if (!existeAdmin) {
                dados.usuarios.push({
                    usuario: "admin",
                    senha: "123",
                    perfil: "administrador",
                    fixo: true
                });
            }

            state = dados;
            salvarBackup();

            logInterno("Backup restaurado com sucesso", "backup");
            notificar("Backup restaurado com sucesso!", "success");

            mudarPagina("home");

        } catch (erro) {
            console.error(erro);
            notificar("Erro ao importar backup.", "error");
        }
    };

    leitor.readAsText(arquivo);
}


// ---------------------------------------------------------
// PÁGINA DE BACKUP
// ---------------------------------------------------------
function paginaBackup() {

    if (!pode("acessarConfig")) {
        alert("Você não tem permissão para acessar backups.");
        mudarPagina("home");
        return "";
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Backup e Restauração")}

            <div class="card">
                <h3>Exportar Backup</h3>
                <p>Baixe um arquivo contendo todos os dados do sistema.</p>
                <button class="btn btn-primary" onclick="exportarBackup()">Exportar Backup</button>
            </div>

            <div class="card">
                <h3>Importar Backup</h3>
                <p>Selecione um arquivo .json gerado pelo sistema.</p>
                <input type="file" id="inputBackup" accept=".json" onchange="importarBackupArquivo(event)">
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// BOTÃO NO MENU LATERAL
// ---------------------------------------------------------
function inserirBotaoBackup() {

    if (!state.usuarioLogado) return;
    if (!pode("acessarConfig")) return;

    const menu = document.getElementById("menuLateral");
    if (!menu) return;

    if (!menu.innerHTML.includes("Backup")) {
        menu.innerHTML += `
            <button class="btn btn-secondary" onclick="mudarPagina('backup')">
                💾 Backup
            </button>
        `;
    }
}


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte28 = render;
render = function (param1, param2) {

    if (state.paginaAtual === "backup") {
        renderSeguro(paginaBackup());
        inserirNavegacaoInteligente();
        return;
    }

    renderOriginalParte28(param1, param2);

    inserirBotaoBackup();
};
/*  
===========================================================
SUPER APP.JS — PARTE 29/20
AUDITORIA AVANÇADA (RASTREAMENTO COMPLETO)
===========================================================
*/


// ---------------------------------------------------------
// FUNÇÃO CENTRAL DE AUDITORIA
// ---------------------------------------------------------
function auditar(acao, detalhes = "", tipo = "info") {

    if (!state.auditoria) state.auditoria = [];

    const registro = {
        id: state.auditoria.length + 1,
        usuario: state.usuarioLogado ? state.usuarioLogado.usuario : "sistema",
        acao,
        detalhes,
        tipo,
        pagina: state.paginaAtual,
        data: new Date().toLocaleString()
    };

    state.auditoria.push(registro);
    salvarBackup();

    logInterno(`AUDITORIA: ${acao} (${detalhes})`, "auditoria");
}


// ---------------------------------------------------------
// PÁGINA: AUDITORIA
// ---------------------------------------------------------
function paginaAuditoria() {

    if (!pode("acessarConfig")) {
        alert("Você não tem permissão para acessar auditoria.");
        mudarPagina("home");
        return "";
    }

    const registros = state.auditoria || [];

    let linhas = registros
        .slice()
        .reverse()
        .map(r => `
            <tr>
                <td>${r.id}</td>
                <td>${r.usuario}</td>
                <td>${r.acao}</td>
                <td>${r.detalhes}</td>
                <td>${r.tipo}</td>
                <td>${r.pagina}</td>
                <td>${r.data}</td>
            </tr>
        `)
        .join("");

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Auditoria do Sistema")}

            <div class="card">
                <h3>Filtros</h3>

                <label>Usuário:</label>
                <input id="filtroUsuario" type="text" oninput="filtrarAuditoria()">

                <label>Tipo:</label>
                <select id="filtroTipo" onchange="filtrarAuditoria()">
                    <option value="">Todos</option>
                    <option value="info">Info</option>
                    <option value="acao">Ação</option>
                    <option value="erro">Erro</option>
                    <option value="seguranca">Segurança</option>
                </select>

                <label>Texto:</label>
                <input id="filtroTexto" type="text" oninput="filtrarAuditoria()">
            </div>

            <div class="card">
                <h3>Registros</h3>
                <table class="tabela" id="tabelaAuditoria">
                    <tr>
                        <th>ID</th>
                        <th>Usuário</th>
                        <th>Ação</th>
                        <th>Detalhes</th>
                        <th>Tipo</th>
                        <th>Página</th>
                        <th>Data</th>
                    </tr>
                    ${linhas}
                </table>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// FILTRAR AUDITORIA
// ---------------------------------------------------------
function filtrarAuditoria() {

    const usuario = document.getElementById("filtroUsuario").value.toLowerCase();
    const tipo = document.getElementById("filtroTipo").value;
    const texto = document.getElementById("filtroTexto").value.toLowerCase();

    const registros = state.auditoria || [];

    const filtrados = registros.filter(r => {

        if (usuario && !r.usuario.toLowerCase().includes(usuario)) return false;
        if (tipo && r.tipo !== tipo) return false;

        const conjunto = `${r.acao} ${r.detalhes} ${r.pagina}`.toLowerCase();
        if (texto && !conjunto.includes(texto)) return false;

        return true;
    });

    const tabela = document.getElementById("tabelaAuditoria");

    tabela.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Usuário</th>
            <th>Ação</th>
            <th>Detalhes</th>
            <th>Tipo</th>
            <th>Página</th>
            <th>Data</th>
        </tr>
        ${filtrados
            .slice()
            .reverse()
            .map(r => `
                <tr>
                    <td>${r.id}</td>
                    <td>${r.usuario}</td>
                    <td>${r.acao}</td>
                    <td>${r.detalhes}</td>
                    <td>${r.tipo}</td>
                    <td>${r.pagina}</td>
                    <td>${r.data}</td>
                </tr>
            `)
            .join("")}
    `;
}


// ---------------------------------------------------------
// BOTÃO NO MENU LATERAL
// ---------------------------------------------------------
function inserirBotaoAuditoria() {

    if (!state.usuarioLogado) return;
    if (!pode("acessarConfig")) return;

    const menu = document.getElementById("menuLateral");
    if (!menu) return;

    if (!menu.innerHTML.includes("Auditoria")) {
        menu.innerHTML += `
            <button class="btn btn-secondary" onclick="mudarPagina('auditoria')">
                📜 Auditoria
            </button>
        `;
    }
}


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte29 = render;
render = function (param1, param2) {

    if (state.paginaAtual === "auditoria") {
        renderSeguro(paginaAuditoria());
        inserirNavegacaoInteligente();
        return;
    }

    renderOriginalParte29(param1, param2);

    inserirBotaoAuditoria();
};
/*  
===========================================================
SUPER APP.JS — PARTE 30/20
PERMISSÕES AVANÇADAS (DINÂMICAS POR USUÁRIO)
===========================================================
*/


// ---------------------------------------------------------
// PERMISSÕES PADRÃO POR PERFIL
// ---------------------------------------------------------
const permissoesPadrao = {
    visualizador: {
        verRotas: true,
        verVeiculos: true,
        verAlunos: true,
        editarRotas: false,
        editarVeiculos: false,
        editarAlunos: false,
        acessarFinanceiro: false,
        acessarConfig: false,
        acessarAuditoria: false
    },

    motorista: {
        verRotas: true,
        verVeiculos: true,
        verAlunos: true,
        editarRotas: false,
        editarVeiculos: false,
        editarAlunos: false,
        acessarFinanceiro: false,
        acessarConfig: false,
        acessarAuditoria: false
    },

    auditor: {
        verRotas: true,
        verVeiculos: true,
        verAlunos: true,
        editarRotas: false,
        editarVeiculos: false,
        editarAlunos: false,
        acessarFinanceiro: false,
        acessarConfig: false,
        acessarAuditoria: true
    },

    financeiro: {
        verRotas: true,
        verVeiculos: true,
        verAlunos: true,
        editarRotas: false,
        editarVeiculos: false,
        editarAlunos: false,
        acessarFinanceiro: true,
        acessarConfig: false,
        acessarAuditoria: false
    },

    administrador: {
        verRotas: true,
        verVeiculos: true,
        verAlunos: true,
        editarRotas: true,
        editarVeiculos: true,
        editarAlunos: true,
        acessarFinanceiro: true,
        acessarConfig: true,
        acessarAuditoria: true
    }
};


// ---------------------------------------------------------
// GARANTIR PERMISSÕES EM TODOS OS USUÁRIOS
// ---------------------------------------------------------
function garantirPermissoes() {

    if (!state.usuarios) return;

    state.usuarios.forEach(u => {

        if (!u.permissoes) {
            u.permissoes = JSON.parse(JSON.stringify(permissoesPadrao[u.perfil]));
        }
    });

    salvarBackup();
}


// ---------------------------------------------------------
// FUNÇÃO CENTRAL DE PERMISSÃO
// ---------------------------------------------------------
function pode(acao) {

    if (!state.usuarioLogado) return false;

    const u = state.usuarioLogado;

    // administrador fixo sempre pode tudo
    if (u.perfil === "administrador") return true;

    return u.permissoes?.[acao] === true;
}


// ---------------------------------------------------------
// PÁGINA: EDITAR PERMISSÕES DE UM USUÁRIO
// ---------------------------------------------------------
function paginaPermissoesUsuario(usuarioAlvo) {

    const u = state.usuarios.find(x => x.usuario === usuarioAlvo);

    if (!u) {
        alert("Usuário não encontrado.");
        mudarPagina("usuarios");
        return "";
    }

    let checkboxes = "";

    Object.keys(permissoesPadrao.administrador).forEach(key => {
        checkboxes += `
            <label class="linhaPerm">
                <input type="checkbox" id="perm_${key}" ${u.permissoes[key] ? "checked" : ""}>
                ${key}
            </label>
        `;
    });

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Permissões de " + usuarioAlvo)}

            <div class="card">
                ${checkboxes}

                <button class="btn btn-primary" onclick="salvarPermissoesUsuario('${usuarioAlvo}')">
                    Salvar Permissões
                </button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('usuarios')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// SALVAR PERMISSÕES
// ---------------------------------------------------------
function salvarPermissoesUsuario(usuarioAlvo) {

    const u = state.usuarios.find(x => x.usuario === usuarioAlvo);

    if (!u) return;

    Object.keys(permissoesPadrao.administrador).forEach(key => {
        const check = document.getElementById("perm_" + key);
        u.permissoes[key] = check.checked;
    });

    salvarBackup();

    auditar("Alterou permissões", usuarioAlvo, "seguranca");
    notificar("Permissões atualizadas!", "success");

    mudarPagina("usuarios");
}


// ---------------------------------------------------------
// BOTÃO NA LISTA DE USUÁRIOS
// ---------------------------------------------------------
function inserirBotaoPermissoes() {

    const tabela = document.querySelectorAll("table.tabela tr");

    tabela.forEach((linha, i) => {

        if (i === 0) return;

        const usuario = linha.children[0].innerText;

        if (!linha.innerHTML.includes("Permissões")) {
            linha.children[3].innerHTML += `
                <button class="btn btn-secondary" onclick="mudarPagina('permissoesUsuario', '${usuario}')">
                    Permissões
                </button>
            `;
        }
    });
}


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte30 = render;
render = function (param1, param2) {

    garantirPermissoes();

    if (state.paginaAtual === "permissoesUsuario") {
        renderSeguro(paginaPermissoesUsuario(param1));
        inserirNavegacaoInteligente();
        return;
    }

    renderOriginalParte30(param1, param2);

    if (state.paginaAtual === "usuarios") {
        inserirBotaoPermissoes();
    }
};
/*  
===========================================================
SUPER APP.JS — PARTE 31/20
LOGS VISUAIS (GRÁFICOS + ESTATÍSTICAS + DASHBOARD)
===========================================================
*/


// ---------------------------------------------------------
// CARREGAR CHART.JS AUTOMATICAMENTE
// ---------------------------------------------------------
(function carregarChartJS() {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    document.head.appendChild(script);
})();


// ---------------------------------------------------------
// PÁGINA: DASHBOARD VISUAL
// ---------------------------------------------------------
function paginaDashboard() {

    if (!state.usuarioLogado) {
        alert("Você precisa estar logado.");
        mudarPagina("login");
        return "";
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Dashboard Visual")}

            <div class="card">
                <h3>Rotas, Veículos e Alunos</h3>
                <canvas id="graficoRotas"></canvas>
            </div>

            <div class="card">
                <h3>Ações por Tipo (Auditoria)</h3>
                <canvas id="graficoAuditoria"></canvas>
            </div>

            <div class="card">
                <h3>Acessos por Usuário</h3>
                <canvas id="graficoAcessos"></canvas>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// GERAR GRÁFICOS
// ---------------------------------------------------------
function gerarGraficosDashboard() {

    if (typeof Chart === "undefined") {
        setTimeout(gerarGraficosDashboard, 200);
        return;
    }

    // -----------------------------
    // GRÁFICO 1 — Rotas / Veículos / Alunos
    // -----------------------------
    const totalRotas = state.rotas.length;
    let totalVeiculos = 0;
    let totalAlunos = 0;

    state.rotas.forEach(r => {
        totalVeiculos += r.veiculos?.length || 0;
        totalAlunos += r.alunos?.length || 0;
    });

    new Chart(document.getElementById("graficoRotas"), {
        type: "bar",
        data: {
            labels: ["Rotas", "Veículos", "Alunos"],
            datasets: [{
                label: "Quantidade",
                data: [totalRotas, totalVeiculos, totalAlunos],
                backgroundColor: ["#4A90E2", "#50E3C2", "#B8E986"]
            }]
        }
    });


    // -----------------------------
    // GRÁFICO 2 — Auditoria por Tipo
    // -----------------------------
    const tipos = {};
    (state.auditoria || []).forEach(a => {
        tipos[a.tipo] = (tipos[a.tipo] || 0) + 1;
    });

    new Chart(document.getElementById("graficoAuditoria"), {
        type: "pie",
        data: {
            labels: Object.keys(tipos),
            datasets: [{
                data: Object.values(tipos),
                backgroundColor: ["#F44336", "#FFC107", "#4CAF50", "#2196F3"]
            }]
        }
    });


    // -----------------------------
    // GRÁFICO 3 — Acessos por Usuário
    // -----------------------------
    const acessos = {};

    (state.auditoria || []).forEach(a => {
        if (a.acao === "login") {
            acessos[a.usuario] = (acessos[a.usuario] || 0) + 1;
        }
    });

    new Chart(document.getElementById("graficoAcessos"), {
        type: "line",
        data: {
            labels: Object.keys(acessos),
            datasets: [{
                label: "Acessos",
                data: Object.values(acessos),
                borderColor: "#8e44ad",
                backgroundColor: "#d7b3ff"
            }]
        }
    });
}


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte31 = render;
render = function (param1, param2) {

    if (state.paginaAtual === "dashboard") {
        renderSeguro(paginaDashboard());
        inserirNavegacaoInteligente();
        setTimeout(gerarGraficosDashboard, 300);
        return;
    }

    renderOriginalParte31(param1, param2);
};
/*  
===========================================================
SUPER APP.JS — PARTE 32/20
RELATÓRIOS AVANÇADOS (PDF + CSV + FILTROS)
===========================================================
*/


// ---------------------------------------------------------
// CARREGAR jsPDF AUTOMATICAMENTE
// ---------------------------------------------------------
(function carregarJsPDF() {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    document.head.appendChild(script);
})();


// ---------------------------------------------------------
// PÁGINA PRINCIPAL DE RELATÓRIOS
// ---------------------------------------------------------
function paginaRelatorios() {

    if (!pode("acessarFinanceiro") && !pode("acessarConfig")) {
        alert("Você não tem permissão para acessar relatórios.");
        mudarPagina("home");
        return "";
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Relatórios Avançados")}

            <div class="card">
                <h3>Escolha um relatório</h3>

                <button class="btn btn-primary" onclick="mudarPagina('relatorioRotas')">Rotas</button>
                <button class="btn btn-primary" onclick="mudarPagina('relatorioVeiculos')">Veículos</button>
                <button class="btn btn-primary" onclick="mudarPagina('relatorioAlunos')">Alunos</button>
                <button class="btn btn-primary" onclick="mudarPagina('relatorioUsuarios')">Usuários</button>
                <button class="btn btn-primary" onclick="mudarPagina('relatorioAuditoria')">Auditoria</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// FUNÇÃO GERAL PARA EXPORTAR CSV
// ---------------------------------------------------------
function exportarCSV(nome, linhas) {

    let csv = "";

    linhas.forEach(l => {
        csv += l.join(";") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = nome + ".csv";
    a.click();

    URL.revokeObjectURL(url);

    notificar("CSV exportado!", "success");
}


// ---------------------------------------------------------
// FUNÇÃO GERAL PARA EXPORTAR PDF
// ---------------------------------------------------------
async function exportarPDF(titulo, linhas) {

    if (!window.jspdf) {
        notificar("Carregando módulo PDF… tente novamente.", "warning");
        return;
    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(titulo, 10, 15);

    doc.setFontSize(12);

    let y = 30;

    linhas.forEach(l => {
        doc.text(l.join(" | "), 10, y);
        y += 8;
    });

    doc.save(titulo + ".pdf");

    notificar("PDF exportado!", "success");
}


// ---------------------------------------------------------
// RELATÓRIO DE ROTAS
// ---------------------------------------------------------
function paginaRelatorioRotas() {

    let linhas = state.rotas.map(r => `
        <tr>
            <td>${r.nome}</td>
            <td>${r.veiculos.length}</td>
            <td>${r.alunos.length}</td>
        </tr>
    `).join("");

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Relatório de Rotas")}

            <div class="card">
                <table class="tabela">
                    <tr>
                        <th>Rota</th>
                        <th>Veículos</th>
                        <th>Alunos</th>
                    </tr>
                    ${linhas}
                </table>

                <button class="btn btn-primary" onclick="exportarCSV('relatorio_rotas', gerarLinhasRotas())">Exportar CSV</button>
                <button class="btn btn-primary" onclick="exportarPDF('Relatório de Rotas', gerarLinhasRotas())">Exportar PDF</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('relatorios')">Voltar</button>
        </div>
    `;
}

function gerarLinhasRotas() {
    const linhas = [["Rota", "Veículos", "Alunos"]];
    state.rotas.forEach(r => {
        linhas.push([r.nome, r.veiculos.length, r.alunos.length]);
    });
    return linhas;
}


// ---------------------------------------------------------
// RELATÓRIO DE VEÍCULOS
// ---------------------------------------------------------
function paginaRelatorioVeiculos() {

    let linhas = "";

    state.rotas.forEach(r => {
        r.veiculos.forEach(v => {
            linhas += `
                <tr>
                    <td>${v.nome}</td>
                    <td>${v.placa}</td>
                    <td>${r.nome}</td>
                </tr>
            `;
        });
    });

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Relatório de Veículos")}

            <div class="card">
                <table class="tabela">
                    <tr>
                        <th>Veículo</th>
                        <th>Placa</th>
                        <th>Rota</th>
                    </tr>
                    ${linhas}
                </table>

                <button class="btn btn-primary" onclick="exportarCSV('relatorio_veiculos', gerarLinhasVeiculos())">Exportar CSV</button>
                <button class="btn btn-primary" onclick="exportarPDF('Relatório de Veículos', gerarLinhasVeiculos())">Exportar PDF</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('relatorios')">Voltar</button>
        </div>
    `;
}

function gerarLinhasVeiculos() {
    const linhas = [["Veículo", "Placa", "Rota"]];
    state.rotas.forEach(r => {
        r.veiculos.forEach(v => {
            linhas.push([v.nome, v.placa, r.nome]);
        });
    });
    return linhas;
}


// ---------------------------------------------------------
// RELATÓRIO DE ALUNOS
// ---------------------------------------------------------
function paginaRelatorioAlunos() {

    let linhas = "";

    state.rotas.forEach(r => {
        r.alunos.forEach(a => {
            linhas += `
                <tr>
                    <td>${a.nome}</td>
                    <td>${a.escola}</td>
                    <td>${r.nome}</td>
                </tr>
            `;
        });
    });

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Relatório de Alunos")}

            <div class="card">
                <table class="tabela">
                    <tr>
                        <th>Aluno</th>
                        <th>Escola</th>
                        <th>Rota</th>
                    </tr>
                    ${linhas}
                </table>

                <button class="btn btn-primary" onclick="exportarCSV('relatorio_alunos', gerarLinhasAlunos())">Exportar CSV</button>
                <button class="btn btn-primary" onclick="exportarPDF('Relatório de Alunos', gerarLinhasAlunos())">Exportar PDF</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('relatorios')">Voltar</button>
        </div>
    `;
}

function gerarLinhasAlunos() {
    const linhas = [["Aluno", "Escola", "Rota"]];
    state.rotas.forEach(r => {
        r.alunos.forEach(a => {
            linhas.push([a.nome, a.escola, r.nome]);
        });
    });
    return linhas;
}


// ---------------------------------------------------------
// RELATÓRIO DE USUÁRIOS
// ---------------------------------------------------------
function paginaRelatorioUsuarios() {

    let linhas = state.usuarios.map(u => `
        <tr>
            <td>${u.usuario}</td>
            <td>${u.perfil}</td>
            <td>${u.fixo ? "Sim" : "Não"}</td>
        </tr>
    `).join("");

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Relatório de Usuários")}

            <div class="card">
                <table class="tabela">
                    <tr>
                        <th>Usuário</th>
                        <th>Perfil</th>
                        <th>Fixo</th>
                    </tr>
                    ${linhas}
                </table>

                <button class="btn btn-primary" onclick="exportarCSV('relatorio_usuarios', gerarLinhasUsuarios())">Exportar CSV</button>
                <button class="btn btn-primary" onclick="exportarPDF('Relatório de Usuários', gerarLinhasUsuarios())">Exportar PDF</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('relatorios')">Voltar</button>
        </div>
    `;
}

function gerarLinhasUsuarios() {
    const linhas = [["Usuário", "Perfil", "Fixo"]];
    state.usuarios.forEach(u => {
        linhas.push([u.usuario, u.perfil, u.fixo ? "Sim" : "Não"]);
    });
    return linhas;
}


// ---------------------------------------------------------
// RELATÓRIO DE AUDITORIA
// ---------------------------------------------------------
function paginaRelatorioAuditoria() {

    let linhas = (state.auditoria || []).map(a => `
        <tr>
            <td>${a.usuario}</td>
            <td>${a.acao}</td>
            <td>${a.tipo}</td>
            <td>${a.pagina}</td>
            <td>${a.data}</td>
        </tr>
    `).join("");

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Relatório de Auditoria")}

            <div class="card">
                <table class="tabela">
                    <tr>
                        <th>Usuário</th>
                        <th>Ação</th>
                        <th>Tipo</th>
                        <th>Página</th>
                        <th>Data</th>
                    </tr>
                    ${linhas}
                </table>

                <button class="btn btn-primary" onclick="exportarCSV('relatorio_auditoria', gerarLinhasAuditoria())">Exportar CSV</button>
                <button class="btn btn-primary" onclick="exportarPDF('Relatório de Auditoria', gerarLinhasAuditoria())">Exportar PDF</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('relatorios')">Voltar</button>
        </div>
    `;
}

function gerarLinhasAuditoria() {
    const linhas = [["Usuário", "Ação", "Tipo", "Página", "Data"]];
    (state.auditoria || []).forEach(a => {
        linhas.push([a.usuario, a.acao, a.tipo, a.pagina, a.data]);
    });
    return linhas;
}


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte32 = render;
render = function (param1, param2) {

    if (state.paginaAtual === "relatorios") {
        renderSeguro(paginaRelatorios());
        inserirNavegacaoInteligente();
        return;
    }

    if (state.paginaAtual === "relatorioRotas") {
        renderSeguro(paginaRelatorioRotas());
        inserirNavegacaoInteligente();
        return;
    }

    if (state.paginaAtual === "relatorioVeiculos") {
        renderSeguro(paginaRelatorioVeiculos());
        inserirNavegacaoInteligente();
        return;
    }

    if (state.paginaAtual === "relatorioAlunos") {
        renderSeguro(paginaRelatorioAlunos());
        inserirNavegacaoInteligente();
        return;
    }

    if (state.paginaAtual === "relatorioUsuarios") {
        renderSeguro(paginaRelatorioUsuarios());
        inserirNavegacaoInteligente();
        return;
    }

    if (state.paginaAtual === "relatorioAuditoria") {
        renderSeguro(paginaRelatorioAuditoria());
        inserirNavegacaoInteligente();
        return;
    }

    renderOriginalParte32(param1, param2);
};
/*  
===========================================================
SUPER APP.JS — PARTE 33/20
IMPRESSÃO INTELIGENTE (PRINT OTIMIZADO)
===========================================================
*/


// ---------------------------------------------------------
// INJETAR CSS DE IMPRESSÃO
// ---------------------------------------------------------
(function cssImpressao() {

    const estilo = document.createElement("style");

    estilo.innerHTML = `
        @media print {

            body {
                background: white !important;
                color: black !important;
            }

            #menuLateral,
            .btn,
            button,
            .no-print,
            .navegacaoInteligente {
                display: none !important;
            }

            .container {
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            .card {
                box-shadow: none !important;
                border: 1px solid #ccc !important;
                padding: 10px !important;
                margin-bottom: 20px !important;
            }

            table {
                width: 100% !important;
                border-collapse: collapse !important;
            }

            table th,
            table td {
                border: 1px solid #000 !important;
                padding: 6px !important;
            }

            h1, h2, h3 {
                color: black !important;
            }
        }
    `;

    document.head.appendChild(estilo);

})();
    

// ---------------------------------------------------------
// BOTÃO UNIVERSAL DE IMPRESSÃO
// ---------------------------------------------------------
function botaoImprimir() {
    return `
        <button class="btn btn-primary no-print" onclick="window.print()">
            🖨️ Imprimir
        </button>
    `;
}


// ---------------------------------------------------------
// INTEGRAR BOTÃO DE IMPRESSÃO EM RELATÓRIOS
// ---------------------------------------------------------
const renderOriginalParte33 = render;
render = function (param1, param2) {

    renderOriginalParte33(param1, param2);

    // inserir botão de impressão apenas em páginas que têm tabelas
    const paginasComTabela = [
        "relatorioRotas",
        "relatorioVeiculos",
        "relatorioAlunos",
        "relatorioUsuarios",
        "relatorioAuditoria",
        "dashboard",
        "usuarios",
        "auditoria"
    ];

    if (paginasComTabela.includes(state.paginaAtual)) {

        const container = document.querySelector(".container");

        if (container && !container.innerHTML.includes("🖨️ Imprimir")) {
            container.innerHTML = botaoImprimir() + container.innerHTML;
        }
    }
};
/*  
===========================================================
SUPER APP.JS — PARTE 34/20
SISTEMA DE FAVORITOS (ROTAS, VEÍCULOS, ALUNOS, PÁGINAS)
===========================================================
*/


// ---------------------------------------------------------
// GARANTIR FAVORITOS NO USUÁRIO
// ---------------------------------------------------------
function garantirFavoritos() {

    if (!state.usuarios) return;

    state.usuarios.forEach(u => {
        if (!u.favoritos) {
            u.favoritos = {
                rotas: [],
                veiculos: [],
                alunos: [],
                paginas: []
            };
        }
    });

    salvarBackup();
}


// ---------------------------------------------------------
// ADICIONAR / REMOVER FAVORITO
// ---------------------------------------------------------
function toggleFavorito(tipo, valor) {

    const u = state.usuarioLogado;
    if (!u) return;

    const lista = u.favoritos[tipo];

    const existe = lista.includes(valor);

    if (existe) {
        u.favoritos[tipo] = lista.filter(x => x !== valor);
        notificar("Removido dos favoritos", "warning");
        auditar("Removeu favorito", `${tipo}: ${valor}`, "acao");
    } else {
        u.favoritos[tipo].push(valor);
        notificar("Adicionado aos favoritos!", "success");
        auditar("Adicionou favorito", `${tipo}: ${valor}`, "acao");
    }

    salvarBackup();
    render();
}


// ---------------------------------------------------------
// BOTÃO DE FAVORITAR (estrela)
// ---------------------------------------------------------
function botaoFavorito(tipo, valor) {

    const u = state.usuarioLogado;
    if (!u) return "";

    const marcado = u.favoritos[tipo].includes(valor);

    return `
        <span 
            class="favoritoIcon" 
            onclick="toggleFavorito('${tipo}', '${valor}')"
            style="cursor:pointer; font-size:22px; margin-left:10px;"
        >
            ${marcado ? "⭐" : "☆"}
        </span>
    `;
}


// ---------------------------------------------------------
// INSERIR FAVORITOS EM PÁGINAS COM TABELAS
// ---------------------------------------------------------
function inserirFavoritosEmListas() {

    if (!state.usuarioLogado) return;

    // Rotas
    if (state.paginaAtual === "rotas") {
        document.querySelectorAll("table.tabela tr").forEach((linha, i) => {
            if (i === 0) return;
            const nome = linha.children[0].innerText;
            linha.children[0].innerHTML += botaoFavorito("rotas", nome);
        });
    }

    // Veículos
    if (state.paginaAtual === "veiculos") {
        document.querySelectorAll("table.tabela tr").forEach((linha, i) => {
            if (i === 0) return;
            const nome = linha.children[0].innerText;
            linha.children[0].innerHTML += botaoFavorito("veiculos", nome);
        });
    }

    // Alunos
    if (state.paginaAtual === "alunos") {
        document.querySelectorAll("table.tabela tr").forEach((linha, i) => {
            if (i === 0) return;
            const nome = linha.children[0].innerText;
            linha.children[0].innerHTML += botaoFavorito("alunos", nome);
        });
    }
}


// ---------------------------------------------------------
// FAVORITAR PÁGINA ATUAL
// ---------------------------------------------------------
function botaoFavoritarPagina() {

    const u = state.usuarioLogado;
    if (!u) return "";

    const pagina = state.paginaAtual;

    const marcado = u.favoritos.paginas.includes(pagina);

    return `
        <button class="btn btn-secondary no-print" onclick="toggleFavorito('paginas', '${pagina}')">
            ${marcado ? "⭐ Página Favorita" : "☆ Favoritar Página"}
        </button>
    `;
}


// ---------------------------------------------------------
// MENU LATERAL DE FAVORITOS
// ---------------------------------------------------------
function inserirMenuFavoritos() {

    if (!state.usuarioLogado) return;

    const u = state.usuarioLogado;
    const menu = document.getElementById("menuLateral");
    if (!menu) return;

    let html = `<h3 style="margin-top:20px;">⭐ Favoritos</h3>`;

    // páginas
    u.favoritos.paginas.forEach(p => {
        html += `
            <button class="btn btn-secondary" onclick="mudarPagina('${p}')">
                📄 ${p}
            </button>
        `;
    });

    // rotas
    u.favoritos.rotas.forEach(r => {
        html += `
            <button class="btn btn-secondary" onclick="mudarPagina('rotas')">
                🚌 ${r}
            </button>
        `;
    });

    // veículos
    u.favoritos.veiculos.forEach(v => {
        html += `
            <button class="btn btn-secondary" onclick="mudarPagina('veiculos')">
                🚐 ${v}
            </button>
        `;
    });

    // alunos
    u.favoritos.alunos.forEach(a => {
        html += `
            <button class="btn btn-secondary" onclick="mudarPagina('alunos')">
                🎒 ${a}
            </button>
        `;
    });

    if (!menu.innerHTML.includes("⭐ Favoritos")) {
        menu.innerHTML += html;
    }
}


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte34 = render;
render = function (param1, param2) {

    garantirFavoritos();

    renderOriginalParte34(param1, param2);

    inserirFavoritosEmListas();

    const container = document.querySelector(".container");
    if (container && !container.innerHTML.includes("Favoritar Página")) {
        container.innerHTML = botaoFavoritarPagina() + container.innerHTML;
    }

    inserirMenuFavoritos();
};
/*  
===========================================================
SUPER APP.JS — PARTE 35/20
BUSCA GLOBAL (PESQUISA INSTANTÂNEA EM TODO O SISTEMA)
===========================================================
*/


// ---------------------------------------------------------
// GARANTIR ESTRUTURA DE BUSCA
// ---------------------------------------------------------
function garantirBuscaGlobal() {
    if (!state.buscaGlobal) {
        state.buscaGlobal = {
            historico: []
        };
    }
}


// ---------------------------------------------------------
// CAIXA DE BUSCA GLOBAL (TOPO DO SISTEMA)
// ---------------------------------------------------------
function barraDeBuscaGlobal() {
    return `
        <div class="buscaGlobal no-print" style="margin-bottom:15px;">
            <input 
                id="inputBuscaGlobal" 
                type="text" 
                placeholder="🔍 Buscar em todo o sistema..."
                oninput="executarBuscaGlobal()"
                style="width:100%; padding:10px; font-size:16px;"
            >
        </div>
    `;
}


// ---------------------------------------------------------
// PÁGINA DE RESULTADOS DA BUSCA
// ---------------------------------------------------------
function paginaBuscaGlobal() {

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Busca Global")}

            ${barraDeBuscaGlobal()}

            <div id="resultadosBusca"></div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// EXECUTAR BUSCA GLOBAL
// ---------------------------------------------------------
function executarBuscaGlobal() {

    const termo = document.getElementById("inputBuscaGlobal").value.toLowerCase();
    const div = document.getElementById("resultadosBusca");

    if (!termo || termo.length < 2) {
        div.innerHTML = "<p>Digite pelo menos 2 caracteres.</p>";
        return;
    }

    const resultados = {
        rotas: [],
        veiculos: [],
        alunos: [],
        usuarios: [],
        paginas: [],
        auditoria: []
    };

    // ROTAS
    state.rotas.forEach(r => {
        if (r.nome.toLowerCase().includes(termo)) {
            resultados.rotas.push(r.nome);
        }
    });

    // VEÍCULOS
    state.rotas.forEach(r => {
        r.veiculos.forEach(v => {
            if (v.nome.toLowerCase().includes(termo) || v.placa.toLowerCase().includes(termo)) {
                resultados.veiculos.push(`${v.nome} (${v.placa})`);
            }
        });
    });

    // ALUNOS
    state.rotas.forEach(r => {
        r.alunos.forEach(a => {
            if (a.nome.toLowerCase().includes(termo) || a.escola.toLowerCase().includes(termo)) {
                resultados.alunos.push(`${a.nome} — ${a.escola}`);
            }
        });
    });

    // USUÁRIOS
    state.usuarios.forEach(u => {
        if (u.usuario.toLowerCase().includes(termo)) {
            resultados.usuarios.push(`${u.usuario} (${u.perfil})`);
        }
    });

    // PÁGINAS
    const paginas = [
        "home", "dashboard", "usuarios", "rotas", "veiculos", "alunos",
        "auditoria", "relatorios", "tema", "backup", "painelAdmin"
    ];

    paginas.forEach(p => {
        if (p.toLowerCase().includes(termo)) {
            resultados.paginas.push(p);
        }
    });

    // AUDITORIA
    (state.auditoria || []).forEach(a => {
        const texto = `${a.usuario} ${a.acao} ${a.detalhes} ${a.pagina}`.toLowerCase();
        if (texto.includes(termo)) {
            resultados.auditoria.push(`${a.usuario} — ${a.acao} — ${a.data}`);
        }
    });

    // MONTAR HTML
    let html = "";

    function bloco(titulo, lista, tipo) {
        if (lista.length === 0) return "";
        return `
            <div class="card">
                <h3>${titulo}</h3>
                ${lista.map(item => `
                    <p style="cursor:pointer;" onclick="acaoResultadoBusca('${tipo}', '${item.replace(/'/g, "\\'")}')">
                        🔎 ${item}
                    </p>
                `).join("")}
            </div>
        `;
    }

    html += bloco("Rotas", resultados.rotas, "rota");
    html += bloco("Veículos", resultados.veiculos, "veiculo");
    html += bloco("Alunos", resultados.alunos, "aluno");
    html += bloco("Usuários", resultados.usuarios, "usuario");
    html += bloco("Páginas", resultados.paginas, "pagina");
    html += bloco("Auditoria", resultados.auditoria, "auditoria");

    div.innerHTML = html || "<p>Nenhum resultado encontrado.</p>";
}


// ---------------------------------------------------------
// AÇÃO AO CLICAR EM UM RESULTADO
// ---------------------------------------------------------
function acaoResultadoBusca(tipo, valor) {

    auditar("Busca Global — clique", `${tipo}: ${valor}`, "acao");

    switch (tipo) {

        case "pagina":
            mudarPagina(valor);
            break;

        case "rota":
            mudarPagina("rotas");
            notificar("Rota localizada!", "info");
            break;

        case "veiculo":
            mudarPagina("veiculos");
            notificar("Veículo localizado!", "info");
            break;

        case "aluno":
            mudarPagina("alunos");
            notificar("Aluno localizado!", "info");
            break;

        case "usuario":
            mudarPagina("usuarios");
            notificar("Usuário localizado!", "info");
            break;

        case "auditoria":
            mudarPagina("auditoria");
            notificar("Registro de auditoria localizado!", "info");
            break;
    }
}


// ---------------------------------------------------------
// BOTÃO DE BUSCA NO MENU LATERAL
// ---------------------------------------------------------
function inserirBotaoBuscaGlobal() {

    if (!state.usuarioLogado) return;

    const menu = document.getElementById("menuLateral");
    if (!menu) return;

    if (!menu.innerHTML.includes("Buscar")) {
        menu.innerHTML = `
            <button class="btn btn-secondary" onclick="mudarPagina('buscaGlobal')">
                🔍 Buscar
            </button>
        ` + menu.innerHTML;
    }
}


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte35 = render;
render = function (param1, param2) {

    garantirBuscaGlobal();

    if (state.paginaAtual === "buscaGlobal") {
        renderSeguro(paginaBuscaGlobal());
        inserirNavegacaoInteligente();
        return;
    }

    renderOriginalParte35(param1, param2);

    inserirBotaoBuscaGlobal();
};
/*  
===========================================================
SUPER APP.JS — PARTE 36/20
CHAT INTERNO ENTRE USUÁRIOS
===========================================================
*/


// ---------------------------------------------------------
// GARANTIR ESTRUTURA DE CHAT
// ---------------------------------------------------------
function garantirChat() {

    if (!state.chat) {
        state.chat = {
            mensagens: [] // {de, para, texto, data}
        };
    }
}


// ---------------------------------------------------------
// PÁGINA: LISTA DE CONVERSAS
// ---------------------------------------------------------
function paginaChat() {

    const u = state.usuarioLogado;
    if (!u) {
        alert("Você precisa estar logado.");
        mudarPagina("login");
        return "";
    }

    const conversas = new Set();

    state.chat.mensagens.forEach(m => {
        if (m.de === u.usuario) conversas.add(m.para);
        if (m.para === u.usuario) conversas.add(m.de);
    });

    let htmlConversas = "";

    conversas.forEach(outro => {
        htmlConversas += `
            <div class="card" style="cursor:pointer;" onclick="mudarPagina('chatConversa', '${outro}')">
                <b>💬 ${outro}</b>
            </div>
        `;
    });

    if (htmlConversas === "") {
        htmlConversas = "<p>Nenhuma conversa ainda.</p>";
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Chat Interno")}

            <div class="card">
                <h3>Conversas</h3>
                ${htmlConversas}
            </div>

            <div class="card">
                <h3>Nova Conversa</h3>
                <select id="novoChatUsuario">
                    ${state.usuarios
                        .filter(x => x.usuario !== u.usuario)
                        .map(x => `<option value="${x.usuario}">${x.usuario}</option>`)
                        .join("")}
                </select>

                <button class="btn btn-primary" onclick="iniciarConversa()">Iniciar</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// INICIAR NOVA CONVERSA
// ---------------------------------------------------------
function iniciarConversa() {
    const alvo = document.getElementById("novoChatUsuario").value;
    mudarPagina("chatConversa", alvo);
}


// ---------------------------------------------------------
// PÁGINA: CONVERSA INDIVIDUAL
// ---------------------------------------------------------
function paginaChatConversa(outroUsuario) {

    const u = state.usuarioLogado;

    const msgs = state.chat.mensagens.filter(m =>
        (m.de === u.usuario && m.para === outroUsuario) ||
        (m.de === outroUsuario && m.para === u.usuario)
    );

    let htmlMsgs = msgs
        .map(m => `
            <div style="
                background:${m.de === u.usuario ? 'var(--primaria)' : 'var(--card2)'};
                color:${m.de === u.usuario ? 'white' : 'var(--texto)'};
                padding:10px;
                margin:8px 0;
                border-radius:8px;
                max-width:80%;
                ${m.de === u.usuario ? 'margin-left:auto;' : ''}
            ">
                <b>${m.de}</b><br>
                ${m.texto}<br>
                <small>${m.data}</small>
            </div>
        `)
        .join("");

    if (htmlMsgs === "") htmlMsgs = "<p>Nenhuma mensagem ainda.</p>";

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Chat com " + outroUsuario)}

            <div class="card" style="max-height:400px; overflow-y:auto;">
                ${htmlMsgs}
            </div>

            <div class="card">
                <textarea id="msgChat" placeholder="Digite sua mensagem..." style="width:100%; height:80px;"></textarea>
                <button class="btn btn-primary" onclick="enviarMensagemChat('${outroUsuario}')">Enviar</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('chat')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// ENVIAR MENSAGEM
// ---------------------------------------------------------
function enviarMensagemChat(destino) {

    const texto = document.getElementById("msgChat").value.trim();
    if (!texto) return;

    const u = state.usuarioLogado;

    state.chat.mensagens.push({
        de: u.usuario,
        para: destino,
        texto,
        data: new Date().toLocaleString()
    });

    salvarBackup();

    notificar("Mensagem enviada!", "success");
    auditar("Enviou mensagem", `para ${destino}`, "acao");

    mudarPagina("chatConversa", destino);
}


// ---------------------------------------------------------
// BOTÃO DE CHAT NO MENU LATERAL
// ---------------------------------------------------------
function inserirBotaoChat() {

    if (!state.usuarioLogado) return;

    const menu = document.getElementById("menuLateral");
    if (!menu) return;

    if (!menu.innerHTML.includes("Chat")) {
        menu.innerHTML = `
            <button class="btn btn-secondary" onclick="mudarPagina('chat')">
                💬 Chat
            </button>
        ` + menu.innerHTML;
    }
}


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte36 = render;
render = function (param1, param2) {

    garantirChat();

    if (state.paginaAtual === "chat") {
        renderSeguro(paginaChat());
        inserirNavegacaoInteligente();
        return;
    }

    if (state.paginaAtual === "chatConversa") {
        renderSeguro(paginaChatConversa(param1));
        inserirNavegacaoInteligente();
        return;
    }

    renderOriginalParte36(param1, param2);

    inserirBotaoChat();
};
/*  
===========================================================
SUPER APP.JS — PARTE 37/20
ANEXOS NO CHAT (ENVIAR ARQUIVOS)
===========================================================
*/


// ---------------------------------------------------------
// GARANTIR ESTRUTURA DE ANEXOS
// ---------------------------------------------------------
function garantirAnexos() {

    if (!state.chat) state.chat = { mensagens: [] };

    state.chat.mensagens.forEach(m => {
        if (!m.anexos) m.anexos = [];
    });

    salvarBackup();
}


// ---------------------------------------------------------
// INPUT DE ARQUIVO PARA O CHAT
// ---------------------------------------------------------
function inputAnexoChat() {
    return `
        <input 
            id="inputAnexoChat" 
            type="file" 
            class="no-print"
            style="margin-top:10px;"
        >
    `;
}


// ---------------------------------------------------------
// ENVIAR ANEXO
// ---------------------------------------------------------
function enviarAnexoChat(destino) {

    const input = document.getElementById("inputAnexoChat");
    if (!input || !input.files || input.files.length === 0) {
        notificar("Nenhum arquivo selecionado.", "warning");
        return;
    }

    const arquivo = input.files[0];

    const leitor = new FileReader();

    leitor.onload = function (e) {

        const base64 = e.target.result;

        state.chat.mensagens.push({
            de: state.usuarioLogado.usuario,
            para: destino,
            texto: "(Anexo enviado)",
            data: new Date().toLocaleString(),
            anexos: [{
                nome: arquivo.name,
                tipo: arquivo.type,
                tamanho: arquivo.size,
                conteudo: base64
            }]
        });

        salvarBackup();

        notificar("Anexo enviado!", "success");
        auditar("Enviou anexo", `${arquivo.name} para ${destino}`, "acao");

        mudarPagina("chatConversa", destino);
    };

    leitor.readAsDataURL(arquivo);
}


// ---------------------------------------------------------
// RENDERIZAR ANEXOS NA CONVERSA
// ---------------------------------------------------------
function renderizarAnexos(msg) {

    if (!msg.anexos || msg.anexos.length === 0) return "";

    return msg.anexos.map(a => `
        <div style="margin-top:8px;">
            📎 <b>${a.nome}</b>  
            <br>
            <a 
                href="${a.conteudo}" 
                download="${a.nome}" 
                style="color:var(--primaria); text-decoration:underline;"
            >
                Baixar arquivo
            </a>
        </div>
    `).join("");
}


// ---------------------------------------------------------
// SUBSTITUIR A PÁGINA DE CONVERSA PARA INCLUIR ANEXOS
// ---------------------------------------------------------
const paginaChatConversaOriginal37 = paginaChatConversa;
paginaChatConversa = function (outroUsuario) {

    const u = state.usuarioLogado;

    const msgs = state.chat.mensagens.filter(m =>
        (m.de === u.usuario && m.para === outroUsuario) ||
        (m.de === outroUsuario && m.para === u.usuario)
    );

    let htmlMsgs = msgs
        .map(m => `
            <div style="
                background:${m.de === u.usuario ? 'var(--primaria)' : 'var(--card2)'};
                color:${m.de === u.usuario ? 'white' : 'var(--texto)'};
                padding:10px;
                margin:8px 0;
                border-radius:8px;
                max-width:80%;
                ${m.de === u.usuario ? 'margin-left:auto;' : ''}
            ">
                <b>${m.de}</b><br>
                ${m.texto}<br>
                <small>${m.data}</small>
                ${renderizarAnexos(m)}
            </div>
        `)
        .join("");

    if (htmlMsgs === "") htmlMsgs = "<p>Nenhuma mensagem ainda.</p>";

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Chat com " + outroUsuario)}

            <div class="card" style="max-height:400px; overflow-y:auto;">
                ${htmlMsgs}
            </div>

            <div class="card">
                <textarea id="msgChat" placeholder="Digite sua mensagem..." style="width:100%; height:80px;"></textarea>
                <button class="btn btn-primary" onclick="enviarMensagemChat('${outroUsuario}')">Enviar</button>

                <hr>

                <h4>Anexar arquivo</h4>
                ${inputAnexoChat()}
                <button class="btn btn-secondary" onclick="enviarAnexoChat('${outroUsuario}')">Enviar Anexo</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('chat')">Voltar</button>
        </div>
    `;
};


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte37 = render;
render = function (param1, param2) {

    garantirAnexos();

    renderOriginalParte37(param1, param2);
};
/*  
===========================================================
SUPER APP.JS — PARTE 38/20
CALENDÁRIO & AGENDA INTERNA
===========================================================
*/


// ---------------------------------------------------------
// GARANTIR ESTRUTURA DO CALENDÁRIO
// ---------------------------------------------------------
function garantirCalendario() {

    if (!state.calendario) {
        state.calendario = {
            eventos: [] // {id, titulo, descricao, data, hora, cor, criador, participantes}
        };
    }
}


// ---------------------------------------------------------
// PÁGINA PRINCIPAL DO CALENDÁRIO
// ---------------------------------------------------------
function paginaCalendario() {

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Calendário Interno")}

            <div class="card">
                <h3>${mesNome(mes)} / ${ano}</h3>
                ${renderCalendarioMes(ano, mes)}
            </div>

            <button class="btn btn-primary" onclick="mudarPagina('novoEvento')">Novo Evento</button>
            <button class="btn btn-secondary" onclick="mudarPagina('home')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// NOME DO MÊS
// ---------------------------------------------------------
function mesNome(m) {
    const nomes = [
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ];
    return nomes[m];
}


// ---------------------------------------------------------
// RENDERIZAR CALENDÁRIO MENSAL
// ---------------------------------------------------------
function renderCalendarioMes(ano, mes) {

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    let html = `<table class="tabela"><tr>
        <th>Dom</th><th>Seg</th><th>Ter</th><th>Qua</th>
        <th>Qui</th><th>Sex</th><th>Sáb</th>
    </tr><tr>`;

    let diaSemana = 0;

    for (let i = 0; i < primeiroDia; i++) {
        html += "<td></td>";
        diaSemana++;
    }

    for (let dia = 1; dia <= diasNoMes; dia++) {

        const dataStr = `${ano}-${(mes+1).toString().padStart(2,"0")}-${dia.toString().padStart(2,"0")}`;

        const eventos = state.calendario.eventos.filter(e => e.data === dataStr);

        html += `
            <td style="vertical-align:top; cursor:pointer;" onclick="mudarPagina('diaCalendario','${dataStr}')">
                <b>${dia}</b>
                ${eventos.map(e => `
                    <div style="
                        background:${e.cor};
                        color:white;
                        padding:2px 4px;
                        margin-top:4px;
                        border-radius:4px;
                        font-size:12px;
                    ">
                        ${e.titulo}
                    </div>
                `).join("")}
            </td>
        `;

        diaSemana++;

        if (diaSemana === 7) {
            html += "</tr><tr>";
            diaSemana = 0;
        }
    }

    html += "</tr></table>";

    return html;
}


// ---------------------------------------------------------
// PÁGINA DO DIA
// ---------------------------------------------------------
function paginaDiaCalendario(dataStr) {

    const eventos = state.calendario.eventos.filter(e => e.data === dataStr);

    let htmlEventos = eventos.map(e => `
        <div class="card" style="border-left:6px solid ${e.cor}">
            <h3>${e.titulo}</h3>
            <p><b>Horário:</b> ${e.hora}</p>
            <p>${e.descricao}</p>
            <button class="btn btn-secondary" onclick="mudarPagina('editarEvento','${e.id}')">Editar</button>
        </div>
    `).join("");

    if (htmlEventos === "") htmlEventos = "<p>Nenhum evento neste dia.</p>";

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Eventos de " + dataStr)}

            ${htmlEventos}

            <button class="btn btn-primary" onclick="mudarPagina('novoEvento','${dataStr}')">Novo Evento</button>
            <button class="btn btn-secondary" onclick="mudarPagina('calendario')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// PÁGINA: NOVO EVENTO
// ---------------------------------------------------------
function paginaNovoEvento(dataPre) {

    const data = dataPre || "";

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Novo Evento")}

            <div class="card">
                <label>Título:</label>
                <input id="evTitulo">

                <label>Descrição:</label>
                <textarea id="evDesc"></textarea>

                <label>Data:</label>
                <input id="evData" type="date" value="${data}">

                <label>Hora:</label>
                <input id="evHora" type="time">

                <label>Cor:</label>
                <input id="evCor" type="color" value="#4A90E2">

                <button class="btn btn-primary" onclick="salvarNovoEvento()">Salvar</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('calendario')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// SALVAR NOVO EVENTO
// ---------------------------------------------------------
function salvarNovoEvento() {

    const titulo = document.getElementById("evTitulo").value.trim();
    const desc = document.getElementById("evDesc").value.trim();
    const data = document.getElementById("evData").value;
    const hora = document.getElementById("evHora").value;
    const cor = document.getElementById("evCor").value;

    if (!titulo || !data) {
        notificar("Título e data são obrigatórios.", "error");
        return;
    }

    const id = Date.now();

    state.calendario.eventos.push({
        id,
        titulo,
        descricao: desc,
        data,
        hora,
        cor,
        criador: state.usuarioLogado.usuario,
        participantes: []
    });

    salvarBackup();

    notificar("Evento criado!", "success");
    auditar("Criou evento", titulo, "acao");

    mudarPagina("diaCalendario", data);
}


// ---------------------------------------------------------
// PÁGINA: EDITAR EVENTO
// ---------------------------------------------------------
function paginaEditarEvento(id) {

    const e = state.calendario.eventos.find(x => x.id == id);
    if (!e) {
        notificar("Evento não encontrado.", "error");
        mudarPagina("calendario");
        return "";
    }

    return `
        <div class="container">
            ${UI.logo()}
            ${UI.titulo("Editar Evento")}

            <div class="card">
                <label>Título:</label>
                <input id="evTitulo" value="${e.titulo}">

                <label>Descrição:</label>
                <textarea id="evDesc">${e.descricao}</textarea>

                <label>Data:</label>
                <input id="evData" type="date" value="${e.data}">

                <label>Hora:</label>
                <input id="evHora" type="time" value="${e.hora}">

                <label>Cor:</label>
                <input id="evCor" type="color" value="${e.cor}">

                <button class="btn btn-primary" onclick="salvarEdicaoEvento(${id})">Salvar Alterações</button>
            </div>

            <button class="btn btn-secondary" onclick="mudarPagina('diaCalendario','${e.data}')">Voltar</button>
        </div>
    `;
}


// ---------------------------------------------------------
// SALVAR EDIÇÃO
// ---------------------------------------------------------
function salvarEdicaoEvento(id) {

    const e = state.calendario.eventos.find(x => x.id == id);
    if (!e) return;

    e.titulo = document.getElementById("evTitulo").value.trim();
    e.descricao = document.getElementById("evDesc").value.trim();
    e.data = document.getElementById("evData").value;
    e.hora = document.getElementById("evHora").value;
    e.cor = document.getElementById("evCor").value;

    salvarBackup();

    notificar("Evento atualizado!", "success");
    auditar("Editou evento", e.titulo, "acao");

    mudarPagina("diaCalendario", e.data);
}


// ---------------------------------------------------------
// LEMBRETES AUTOMÁTICOS (verifica a cada minuto)
// ---------------------------------------------------------
setInterval(() => {

    if (!state.usuarioLogado) return;

    const agora = new Date();
    const agoraData = agora.toISOString().split("T")[0];
    const agoraHora = agora.toTimeString().slice(0,5);

    state.calendario.eventos.forEach(e => {

        if (e.data === agoraData && e.hora === agoraHora) {
            notificar(`Lembrete: ${e.titulo}`, "info");
        }
    });

}, 60000);


// ---------------------------------------------------------
// BOTÃO NO MENU LATERAL
// ---------------------------------------------------------
function inserirBotaoCalendario() {

    if (!state.usuarioLogado) return;

    const menu = document.getElementById("menuLateral");
    if (!menu) return;

    if (!menu.innerHTML.includes("Calendário")) {
        menu.innerHTML = `
            <button class="btn btn-secondary" onclick="mudarPagina('calendario')">
                📅 Calendário
            </button>
        ` + menu.innerHTML;
    }
}


// ---------------------------------------------------------
// INTEGRAR AO RENDER
// ---------------------------------------------------------
const renderOriginalParte38 = render;
render = function (param1, param2) {

    garantirCalendario();

    if (state.paginaAtual === "calendario") {
        renderSeguro(paginaCalendario());
        inserirNavegacaoInteligente();
        return;
    }

    if (state.paginaAtual === "diaCalendario") {
        renderSeguro(paginaDiaCalendario(param1));
        inserirNavegacaoInteligente();
        return;
    }

    if (state.paginaAtual === "novoEvento") {
        renderSeguro(paginaNovoEvento(param1));
        inserirNavegacaoInteligente();
        return;
    }

    if (state.paginaAtual === "editarEvento") {
        renderSeguro(paginaEditarEvento(param1));
        inserirNavegacaoInteligente();
        return;
    }

    renderOriginalParte38(param1, param2);

    inserirBotaoCalendario();
};
/*  
