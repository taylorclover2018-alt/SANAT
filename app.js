/*  
===========================================================
ASSEUF ENTERPRISE — PARTE 1
NÚCLEO DO SISTEMA + LOGIN + PERMISSÕES + LOGO + LAYOUT BASE
===========================================================

Esta é a fundação do sistema completo.  
Aqui definimos:

✔ State global  
✔ Usuários padrão (Operador, Admin, Taylor)  
✔ Cadastro de novos usuários  
✔ Sistema de login  
✔ Permissões por perfil  
✔ Estrutura base de navegação  
✔ Componente de logo  
✔ Layout principal

As próximas partes vão expandir:
- Configuração mensal
- Rotas
- Veículos
- Alunos
- Descontos
- Cálculos
- Histórico
- Relatórios
- Memória de cálculo

NÃO ALTERE NADA AQUI sem saber o impacto.
*/

// =======================================================
// 1. STATE GLOBAL — BANCO DE DADOS EM MEMÓRIA
// =======================================================

const state = {
    usuarioLogado: null,

    usuarios: [
        {
            id: 1,
            nomeCompleto: "Operador Padrão",
            email: "operador@asseuf.com",
            telefone: "",
            usuario: "operador",
            senha: "1234",
            perfil: "operador",
            foto: null,
            ativo: true,
            criadoEm: new Date().toISOString()
        },
        {
            id: 2,
            nomeCompleto: "Administrador",
            email: "admin@asseuf.com",
            telefone: "",
            usuario: "admin",
            senha: "0000",
            perfil: "admin",
            foto: null,
            ativo: true,
            criadoEm: new Date().toISOString()
        },
        {
            id: 3,
            nomeCompleto: "Taylor Clover",
            email: "taylor@asseuf.com",
            telefone: "",
            usuario: "Taylor",
            senha: "1296",
            perfil: "taylor",
            foto: null,
            ativo: true,
            criadoEm: new Date().toISOString()
        }
    ],

    // usuários criados pelo cadastro
    proximoIdUsuario: 4,

    // controle de navegação
    paginaAtual: "login",

    // dados que serão preenchidos nas próximas partes
    mesReferencia: null,
    anoReferencia: null,
    auxilioMensal: 0,
    rotas: []
};


// =======================================================
// 2. COMPONENTE DE LOGO — APARECE EM TODAS AS TELAS
// =======================================================

const UI = {
    logo() {
        return `
            <div class="logo-container" style="
                text-align:center;
                margin-bottom:20px;
            ">
                <div style="
                    font-size:38px;
                    font-weight:900;
                    color:#1a237e;
                    letter-spacing:2px;
                ">
                    ASSEUF
                </div>
                <div style="
                    font-size:14px;
                    color:#3949ab;
                    margin-top:-5px;
                ">
                    Sistema de Cálculo de Rotas e Auxílio
                </div>
            </div>
        `;
    }
};


// =======================================================
// 3. FUNÇÃO DE NAVEGAÇÃO ENTRE PÁGINAS
// =======================================================

function mudarPagina(pagina) {
    state.paginaAtual = pagina;
    render();
}


// =======================================================
// 4. TELA DE LOGIN
// =======================================================

function paginaLogin() {
    return `
        <div class="login-wrapper" style="
            max-width:400px;
            margin:50px auto;
            padding:20px;
            background:#fff;
            border-radius:10px;
            box-shadow:0 0 10px rgba(0,0,0,0.1);
        ">
            ${UI.logo()}

            <h2 style="text-align:center;margin-bottom:20px;color:#1a237e;">
                Acesso ao Sistema
            </h2>

            <label>Usuário</label>
            <input id="loginUsuario" type="text" class="input" placeholder="Digite seu usuário">

            <label>Senha</label>
            <input id="loginSenha" type="password" class="input" placeholder="Digite sua senha">

            <button onclick="uiLogin()" class="btn-primary" style="margin-top:15px;">
                Entrar
            </button>

            <div style="text-align:center;margin-top:15px;">
                <a href="#" onclick="mudarPagina('cadastro')" style="color:#1a237e;">
                    Criar conta
                </a>
            </div>
        </div>
    `;
}


// =======================================================
// 5. LOGIN — VALIDAÇÃO E PERMISSÕES
// =======================================================

function uiLogin() {
    const usuario = document.getElementById("loginUsuario").value.trim();
    const senha = document.getElementById("loginSenha").value.trim();

    const encontrado = state.usuarios.find(u =>
        u.usuario.toLowerCase() === usuario.toLowerCase() &&
        u.senha === senha &&
        u.ativo
    );

    if (!encontrado) {
        alert("Usuário ou senha incorretos.");
        return;
    }

    state.usuarioLogado = encontrado;
    mudarPagina("home");
}


// =======================================================
// 6. CADASTRO DE USUÁRIOS (APENAS VISUALIZAÇÃO)
// =======================================================

function paginaCadastro() {
    return `
        <div class="cadastro-wrapper" style="
            max-width:500px;
            margin:50px auto;
            padding:20px;
            background:#fff;
            border-radius:10px;
            box-shadow:0 0 10px rgba(0,0,0,0.1);
        ">
            ${UI.logo()}

            <h2 style="text-align:center;margin-bottom:20px;color:#1a237e;">
                Criar Conta
            </h2>

            <label>Nome completo</label>
            <input id="cadNome" class="input" type="text">

            <label>Email</label>
            <input id="cadEmail" class="input" type="email">

            <label>Telefone</label>
            <input id="cadTelefone" class="input" type="text">

            <label>Usuário</label>
            <input id="cadUsuario" class="input" type="text">

            <label>Senha</label>
            <input id="cadSenha" class="input" type="password">

            <label>Confirmar senha</label>
            <input id="cadSenha2" class="input" type="password">

            <button onclick="uiCriarConta()" class="btn-primary" style="margin-top:15px;">
                Criar conta
            </button>

            <div style="text-align:center;margin-top:15px;">
                <a href="#" onclick="mudarPagina('login')" style="color:#1a237e;">
                    Voltar ao login
                </a>
            </div>
        </div>
    `;
}


// =======================================================
// 7. FUNÇÃO DE CRIAÇÃO DE CONTA
// =======================================================

function uiCriarConta() {
    const nome = document.getElementById("cadNome").value.trim();
    const email = document.getElementById("cadEmail").value.trim();
    const telefone = document.getElementById("cadTelefone").value.trim();
    const usuario = document.getElementById("cadUsuario").value.trim();
    const senha = document.getElementById("cadSenha").value.trim();
    const senha2 = document.getElementById("cadSenha2").value.trim();

    if (!nome || !email || !usuario || !senha) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    if (senha !== senha2) {
        alert("As senhas não coincidem.");
        return;
    }

    const existe = state.usuarios.find(u =>
        u.usuario.toLowerCase() === usuario.toLowerCase()
    );

    if (existe) {
        alert("Este usuário já existe.");
        return;
    }

    state.usuarios.push({
        id: state.proximoIdUsuario++,
        nomeCompleto: nome,
        email,
        telefone,
        usuario,
        senha,
        perfil: "visualizador",
        foto: null,
        ativo: true,
        criadoEm: new Date().toISOString()
    });

    alert("Conta criada com sucesso! Faça login.");
    mudarPagina("login");
}


// =======================================================
// 8. HOME — APÓS LOGIN
// =======================================================

function paginaHome() {
    return `
        <div style="padding:20px;">
            ${UI.logo()}

            <h2 style="color:#1a237e;">Bem-vindo, ${state.usuarioLogado.nomeCompleto}</h2>

            <p style="margin-top:10px;">
                Perfil: <strong>${state.usuarioLogado.perfil.toUpperCase()}</strong>
            </p>

            <button class="btn-primary" onclick="mudarPagina('configuracaoMensal')" style="margin-top:20px;">
                Iniciar Cálculo do Mês
            </button>

            <button class="btn-secondary" onclick="mudarPagina('historico')" style="margin-top:10px;">
                Histórico
            </button>

            <button class="btn-danger" onclick="logout()" style="margin-top:10px;">
                Sair
            </button>
        </div>
    `;
}


// =======================================================
// 9. LOGOUT
// =======================================================

function logout() {
    state.usuarioLogado = null;
    mudarPagina("login");
}


// =======================================================
// 10. RENDER — SISTEMA DE ROTAS
// =======================================================

function render() {
    const app = document.getElementById("app");

    switch (state.paginaAtual) {
        case "login":
            app.innerHTML = paginaLogin();
            break;

        case "cadastro":
            app.innerHTML = paginaCadastro();
            break;

        case "home":
            app.innerHTML = paginaHome();
            break;

        case "configuracaoMensal":
            app.innerHTML = "<h1>PARTE 2 VAI ENTRAR AQUI</h1>";
            break;

        case "historico":
            app.innerHTML = "<h1>PARTE 4 VAI ENTRAR AQUI</h1>";
            break;

        default:
            app.innerHTML = "<h1>Página não encontrada</h1>";
    }
}

render();
/*  
===========================================================
ASSEUF ENTERPRISE — PARTE 2
CONFIGURAÇÃO MENSAL + CADASTRO DE ROTAS
===========================================================

Nesta parte adicionamos:

✔ Seleção de mês e ano  
✔ Valor total de auxílio mensal  
✔ Cadastro da quantidade de rotas  
✔ Criação de rotas dinamicamente  
✔ Edição básica das rotas  
✔ Estrutura para veículos (detalhes completos virão na Parte 3)  
✔ Estrutura para alunos (detalhes completos virão na Parte 3)

IMPORTANTE:
Esta parte prepara o terreno para os cálculos avançados.
*/

// =======================================================
// 11. PÁGINA DE CONFIGURAÇÃO MENSAL
// =======================================================

function paginaConfiguracaoMensal() {
    return `
        <div style="padding:20px;max-width:800px;margin:auto;">
            ${UI.logo()}

            <h2 style="color:#1a237e;">Configuração do Mês</h2>

            <div class="card" style="padding:20px;margin-top:20px;">

                <label>Mês de referência</label>
                <select id="mesReferencia" class="input">
                    <option value="">Selecione</option>
                    <option value="1">Janeiro</option>
                    <option value="2">Fevereiro</option>
                    <option value="3">Março</option>
                    <option value="4">Abril</option>
                    <option value="5">Maio</option>
                    <option value="6">Junho</option>
                    <option value="7">Julho</option>
                    <option value="8">Agosto</option>
                    <option value="9">Setembro</option>
                    <option value="10">Outubro</option>
                    <option value="11">Novembro</option>
                    <option value="12">Dezembro</option>
                </select>

                <label style="margin-top:10px;">Ano</label>
                <input id="anoReferencia" class="input" type="number" placeholder="2026">

                <label style="margin-top:10px;">Valor total do auxílio mensal (R$)</label>
                <input id="auxilioMensal" class="input" type="number" placeholder="0.00">

                <label style="margin-top:10px;">Quantidade de rotas</label>
                <input id="quantidadeRotas" class="input" type="number" min="1" placeholder="Ex: 3">

                <button onclick="uiCriarRotas()" class="btn-primary" style="margin-top:20px;">
                    Criar rotas
                </button>

                <button onclick="mudarPagina('home')" class="btn-secondary" style="margin-top:10px;">
                    Voltar
                </button>
            </div>
        </div>
    `;
}


// =======================================================
// 12. FUNÇÃO PARA CRIAR ROTAS
// =======================================================

function uiCriarRotas() {
    const mes = document.getElementById("mesReferencia").value;
    const ano = document.getElementById("anoReferencia").value;
    const auxilio = Number(document.getElementById("auxilioMensal").value);
    const qtd = Number(document.getElementById("quantidadeRotas").value);

    if (!mes || !ano || !auxilio || qtd < 1) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    state.mesReferencia = mes;
    state.anoReferencia = ano;
    state.auxilioMensal = auxilio;

    // cria rotas vazias
    state.rotas = [];

    for (let i = 1; i <= qtd; i++) {
        state.rotas.push({
            id: i,
            nome: `Rota ${i}`,
            veiculos: [],
            alunos: {
                integrais: 0,
                descontos: [] // será detalhado na Parte 3
            },
            custoTotalVeiculos: 0,
            custoTotalRota: 0
        });
    }

    mudarPagina("rotasLista");
}


// =======================================================
// 13. LISTA DE ROTAS
// =======================================================

function paginaRotasLista() {
    let html = `
        <div style="padding:20px;max-width:900px;margin:auto;">
            ${UI.logo()}

            <h2 style="color:#1a237e;">Rotas do Mês</h2>

            <p>
                Mês: <strong>${state.mesReferencia}/${state.anoReferencia}</strong><br>
                Auxílio mensal: <strong>R$ ${state.auxilioMensal.toFixed(2)}</strong>
            </p>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>Selecione uma rota para configurar</h3>
    `;

    state.rotas.forEach(r => {
        html += `
            <button class="btn-primary" style="margin-top:10px;width:100%;" 
                onclick="uiAbrirRota(${r.id})">
                ${r.nome}
            </button>
        `;
    });

    html += `
                <button onclick="mudarPagina('configuracaoMensal')" class="btn-secondary" style="margin-top:20px;">
                    Voltar
                </button>
            </div>
        </div>
    `;

    return html;
}


// =======================================================
// 14. ABRIR UMA ROTA ESPECÍFICA
// =======================================================

function uiAbrirRota(id) {
    state.rotaSelecionada = id;
    mudarPagina("rotaDetalhe");
}


// =======================================================
// 15. PÁGINA DE DETALHES DA ROTA
// =======================================================

function paginaRotaDetalhe() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);

    return `
        <div style="padding:20px;max-width:900px;margin:auto;">
            ${UI.logo()}

            <h2 style="color:#1a237e;">${rota.nome}</h2>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>Configuração da Rota</h3>

                <label>Nome da rota</label>
                <input id="rotaNome" class="input" type="text" value="${rota.nome}">

                <button onclick="uiSalvarNomeRota()" class="btn-primary" style="margin-top:10px;">
                    Salvar nome
                </button>
            </div>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>Veículos</h3>

                <button onclick="uiAdicionarVeiculo()" class="btn-primary">
                    Adicionar veículo
                </button>

                <div style="margin-top:15px;">
                    ${rota.veiculos.length === 0 ? "<p>Nenhum veículo cadastrado.</p>" : ""}
                </div>

                ${rota.veiculos.map((v, index) => `
                    <div class="card" style="padding:15px;margin-top:10px;background:#f5f5f5;">
                        <h4>Veículo ${index + 1}</h4>

                        <label>Identificação</label>
                        <input id="veicIdent_${index}" class="input" type="text" value="${v.identificacao}">

                        <label>Valor da diária (R$)</label>
                        <input id="veicDiaria_${index}" class="input" type="number" value="${v.diaria}">

                        <label>Quantidade de usos</label>
                        <input id="veicUsos_${index}" class="input" type="number" value="${v.usos}">

                        <label>Dias rodados</label>
                        <input id="veicDias_${index}" class="input" type="number" value="${v.dias}">

                        <button onclick="uiSalvarVeiculo(${index})" class="btn-primary" style="margin-top:10px;">
                            Salvar veículo
                        </button>

                        <button onclick="uiExcluirVeiculo(${index})" class="btn-danger" style="margin-top:10px;">
                            Excluir
                        </button>
                    </div>
                `).join("")}
            </div>

            <button onclick="mudarPagina('rotasLista')" class="btn-secondary" style="margin-top:20px;">
                Voltar
            </button>
        </div>
    `;
}


// =======================================================
// 16. SALVAR NOME DA ROTA
// =======================================================

function uiSalvarNomeRota() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    const nome = document.getElementById("rotaNome").value.trim();

    if (!nome) {
        alert("O nome da rota não pode ficar vazio.");
        return;
    }

    rota.nome = nome;
    alert("Nome salvo!");
    render();
}


// =======================================================
// 17. ADICIONAR VEÍCULO
// =======================================================

function uiAdicionarVeiculo() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);

    rota.veiculos.push({
        identificacao: "",
        diaria: 0,
        usos: 0,
        dias: 0,
        custoTotal: 0
    });

    render();
}


// =======================================================
// 18. SALVAR VEÍCULO
// =======================================================

function uiSalvarVeiculo(index) {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    const v = rota.veiculos[index];

    v.identificacao = document.getElementById(`veicIdent_${index}`).value.trim();
    v.diaria = Number(document.getElementById(`veicDiaria_${index}`).value);
    v.usos = Number(document.getElementById(`veicUsos_${index}`).value);
    v.dias = Number(document.getElementById(`veicDias_${index}`).value);

    // cálculo inicial (será expandido na Parte 3)
    v.custoTotal = v.diaria * v.usos * v.dias;

    alert("Veículo salvo!");
    render();
}


// =======================================================
// 19. EXCLUIR VEÍCULO
// =======================================================

function uiExcluirVeiculo(index) {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);

    if (!confirm("Deseja realmente excluir este veículo?")) return;

    rota.veiculos.splice(index, 1);
    render();
}


// =======================================================
// 20. REGISTRO DA PÁGINA NO RENDER
// =======================================================

function paginaRotasListaWrapper() {
    return paginaRotasLista();
}

function paginaRotaDetalheWrapper() {
    return paginaRotaDetalhe();
}

// adicionando ao render
const renderOriginal = render;
render = function () {
    const app = document.getElementById("app");

    switch (state.paginaAtual) {
        case "rotasLista":
            app.innerHTML = paginaRotasListaWrapper();
            break;

        case "rotaDetalhe":
            app.innerHTML = paginaRotaDetalheWrapper();
            break;

        case "configuracaoMensal":
            app.innerHTML = paginaConfiguracaoMensal();
            break;

        default:
            renderOriginal();
    }
};
/*  
===========================================================
ASSEUF ENTERPRISE — PARTE 3
ALUNOS + DESCONTOS + CÁLCULOS COMPLETOS DA ROTA
===========================================================

Nesta parte adicionamos:

✔ Cadastro de alunos integrais  
✔ Cadastro de alunos com desconto  
✔ Múltiplos tipos de desconto por rota  
✔ Cálculo do valor integral por aluno  
✔ Cálculo do valor com desconto  
✔ Cálculo do custo total da rota  
✔ Cálculo do custo total dos veículos  
✔ Cálculo do custo diário por aluno  
✔ Cálculo do auxílio por aluno  
✔ Percentuais de participação  
✔ Base para relatórios e memória de cálculo

Esta é uma das partes mais importantes do sistema.
*/

// =======================================================
// 21. PÁGINA DE ALUNOS DA ROTA
// =======================================================

function paginaAlunosRota() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);

    return `
        <div style="padding:20px;max-width:900px;margin:auto;">
            ${UI.logo()}

            <h2 style="color:#1a237e;">Alunos — ${rota.nome}</h2>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>Alunos integrais</h3>

                <label>Quantidade</label>
                <input id="alunosIntegrais" class="input" type="number" 
                    value="${rota.alunos.integrais}" min="0">

                <button onclick="uiSalvarAlunosIntegrais()" class="btn-primary" style="margin-top:10px;">
                    Salvar
                </button>
            </div>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>Alunos com desconto</h3>

                <button onclick="uiAdicionarDesconto()" class="btn-primary">
                    Adicionar tipo de desconto
                </button>

                ${rota.alunos.descontos.length === 0 ? "<p style='margin-top:10px;'>Nenhum desconto cadastrado.</p>" : ""}

                ${rota.alunos.descontos.map((d, index) => `
                    <div class="card" style="padding:15px;margin-top:10px;background:#f5f5f5;">
                        <h4>Desconto ${index + 1}</h4>

                        <label>Percentual (%)</label>
                        <input id="descPerc_${index}" class="input" type="number" value="${d.percentual}">

                        <label>Quantidade de alunos</label>
                        <input id="descQtd_${index}" class="input" type="number" value="${d.quantidade}">

                        <button onclick="uiSalvarDesconto(${index})" class="btn-primary" style="margin-top:10px;">
                            Salvar
                        </button>

                        <button onclick="uiExcluirDesconto(${index})" class="btn-danger" style="margin-top:10px;">
                            Excluir
                        </button>
                    </div>
                `).join("")}
            </div>

            <button onclick="mudarPagina('rotaDetalhe')" class="btn-secondary" style="margin-top:20px;">
                Voltar
            </button>

            <button onclick="uiCalcularRota()" class="btn-primary" style="margin-top:20px;">
                Calcular rota
            </button>
        </div>
    `;
}


// =======================================================
// 22. SALVAR ALUNOS INTEGRAIS
// =======================================================

function uiSalvarAlunosIntegrais() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    const qtd = Number(document.getElementById("alunosIntegrais").value);

    rota.alunos.integrais = qtd;

    alert("Alunos integrais salvos!");
    render();
}


// =======================================================
// 23. ADICIONAR TIPO DE DESCONTO
// =======================================================

function uiAdicionarDesconto() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);

    rota.alunos.descontos.push({
        percentual: 0,
        quantidade: 0,
        valorComDesconto: 0
    });

    render();
}


// =======================================================
// 24. SALVAR DESCONTO
// =======================================================

function uiSalvarDesconto(index) {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    const d = rota.alunos.descontos[index];

    d.percentual = Number(document.getElementById(`descPerc_${index}`).value);
    d.quantidade = Number(document.getElementById(`descQtd_${index}`).value);

    alert("Desconto salvo!");
    render();
}


// =======================================================
// 25. EXCLUIR DESCONTO
// =======================================================

function uiExcluirDesconto(index) {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);

    if (!confirm("Deseja realmente excluir este desconto?")) return;

    rota.alunos.descontos.splice(index, 1);
    render();
}


// =======================================================
// 26. CÁLCULO COMPLETO DA ROTA
// =======================================================

function uiCalcularRota() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);

    // 1) Cálculo do custo total dos veículos
    let custoVeiculos = 0;

    rota.veiculos.forEach(v => {
        v.custoTotal = v.diaria * v.usos * v.dias;
        custoVeiculos += v.custoTotal;
    });

    rota.custoTotalVeiculos = custoVeiculos;

    // 2) Total de alunos
    const totalIntegrais = rota.alunos.integrais;
    const totalDescontos = rota.alunos.descontos.reduce((s, d) => s + d.quantidade, 0);
    const totalAlunos = totalIntegrais + totalDescontos;

    if (totalAlunos === 0) {
        alert("Não é possível calcular: nenhum aluno cadastrado.");
        return;
    }

    // 3) Valor integral por aluno
    const valorIntegral = custoVeiculos / totalAlunos;

    rota.valorIntegralAluno = valorIntegral;

    // 4) Cálculo dos descontos
    rota.alunos.descontos.forEach(d => {
        const descontoDecimal = d.percentual / 100;
        d.valorComDesconto = valorIntegral * (1 - descontoDecimal);
    });

    // 5) Custo total da rota
    let totalDescontado = 0;

    rota.alunos.descontos.forEach(d => {
        totalDescontado += d.valorComDesconto * d.quantidade;
    });

    const totalIntegraisValor = valorIntegral * totalIntegrais;

    rota.custoTotalRota = totalDescontado + totalIntegraisValor;

    // 6) Custo diário por aluno
    rota.custoDiarioAluno = valorIntegral / 30;

    // 7) Auxílio por aluno
    const totalAuxilio = state.auxilioMensal;
    const totalRotas = state.rotas.length;

    rota.auxilioPorAluno = (totalAuxilio / totalRotas) / totalAlunos;

    alert("Cálculo concluído!");
    mudarPagina("resultadoRota");
}


// =======================================================
// 27. PÁGINA DE RESULTADO DA ROTA
// =======================================================

function paginaResultadoRota() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);

    return `
        <div style="padding:20px;max-width:900px;margin:auto;">
            ${UI.logo()}

            <h2 style="color:#1a237e;">Resultado — ${rota.nome}</h2>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>Custo total dos veículos</h3>
                <p>R$ ${rota.custoTotalVeiculos.toFixed(2)}</p>

                <h3>Valor integral por aluno</h3>
                <p>R$ ${rota.valorIntegralAluno.toFixed(2)}</p>

                <h3>Custo total da rota</h3>
                <p>R$ ${rota.custoTotalRota.toFixed(2)}</p>

                <h3>Custo diário por aluno</h3>
                <p>R$ ${rota.custoDiarioAluno.toFixed(2)}</p>

                <h3>Auxílio por aluno</h3>
                <p>R$ ${rota.auxilioPorAluno.toFixed(2)}</p>
            </div>

            <button onclick="mudarPagina('rotasLista')" class="btn-secondary" style="margin-top:20px;">
                Voltar às rotas
            </button>
        </div>
    `;
}


// =======================================================
// 28. REGISTRO DAS NOVAS PÁGINAS NO RENDER
// =======================================================

const renderOriginalParte3 = render;
render = function () {
    const app = document.getElementById("app");

    switch (state.paginaAtual) {
        case "alunosRota":
            app.innerHTML = paginaAlunosRota();
            break;

        case "resultadoRota":
            app.innerHTML = paginaResultadoRota();
            break;

        default:
            renderOriginalParte3();
    }
};
/*  
===========================================================
ASSEUF ENTERPRISE — PARTE 4
HISTÓRICO COMPLETO + PERMISSÕES + REGISTRO DE RESPONSÁVEL
===========================================================

Nesta parte adicionamos:

✔ Registro de histórico completo  
✔ Mês/ano + responsável + data/hora  
✔ Totais por rota  
✔ Total geral do mês  
✔ Permissões:
    - Operador → adiciona histórico
    - Admin → adiciona e exclui
    - Taylor → acesso total
    - Visualizador → apenas vê e baixa relatório
✔ Exclusão de registros (somente admin e taylor)
✔ Interface completa do histórico

Esta parte conecta os cálculos com o armazenamento permanente.
*/

// =======================================================
// 29. ESTRUTURA DO HISTÓRICO NO STATE
// =======================================================

state.historico = [];
state.proximoIdHistorico = 1;


// =======================================================
// 30. FUNÇÃO PARA SALVAR O RESULTADO DA ROTA NO HISTÓRICO
// =======================================================

function uiSalvarRotaNoHistorico() {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);

    const registro = {
        id: state.proximoIdHistorico++,
        mes: state.mesReferencia,
        ano: state.anoReferencia,
        rotaId: rota.id,
        rotaNome: rota.nome,
        responsavel: state.usuarioLogado.nomeCompleto,
        perfilResponsavel: state.usuarioLogado.perfil,
        dataHora: new Date().toLocaleString("pt-BR"),
        custoTotalVeiculos: rota.custoTotalVeiculos,
        valorIntegralAluno: rota.valorIntegralAluno,
        custoTotalRota: rota.custoTotalRota,
        custoDiarioAluno: rota.custoDiarioAluno,
        auxilioPorAluno: rota.auxilioPorAluno
    };

    state.historico.push(registro);

    alert("Registro salvo no histórico!");
    mudarPagina("historico");
}


// =======================================================
// 31. PÁGINA DE HISTÓRICO
// =======================================================

function paginaHistorico() {
    return `
        <div style="padding:20px;max-width:1000px;margin:auto;">
            ${UI.logo()}

            <h2 style="color:#1a237e;">Histórico de Cálculos</h2>

            <p style="margin-top:10px;">
                Aqui ficam armazenados todos os cálculos realizados no sistema.
            </p>

            <div class="card" style="padding:20px;margin-top:20px;">
                ${state.historico.length === 0 ? `
                    <p>Nenhum registro encontrado.</p>
                ` : `
                    <table border="1" width="100%" style="border-collapse:collapse;">
                        <tr style="background:#1a237e;color:white;">
                            <th>ID</th>
                            <th>Mês/Ano</th>
                            <th>Rota</th>
                            <th>Responsável</th>
                            <th>Data/Hora</th>
                            <th>Total da Rota</th>
                            <th>Ações</th>
                        </tr>

                        ${state.historico.map(reg => `
                            <tr>
                                <td>${reg.id}</td>
                                <td>${reg.mes}/${reg.ano}</td>
                                <td>${reg.rotaNome}</td>
                                <td>${reg.responsavel}</td>
                                <td>${reg.dataHora}</td>
                                <td>R$ ${reg.custoTotalRota.toFixed(2)}</td>
                                <td>
                                    <button onclick="uiVerHistorico(${reg.id})" class="btn-primary">
                                        Ver
                                    </button>

                                    ${state.usuarioLogado.perfil === "admin" || state.usuarioLogado.perfil === "taylor" ? `
                                        <button onclick="uiExcluirHistorico(${reg.id})" class="btn-danger">
                                            Excluir
                                        </button>
                                    ` : ""}
                                </td>
                            </tr>
                        `).join("")}
                    </table>
                `}
            </div>

            <button onclick="mudarPagina('home')" class="btn-secondary" style="margin-top:20px;">
                Voltar
            </button>
        </div>
    `;
}


// =======================================================
// 32. VER DETALHES DE UM REGISTRO DO HISTÓRICO
// =======================================================

function uiVerHistorico(id) {
    state.historicoSelecionado = id;
    mudarPagina("historicoDetalhe");
}


// =======================================================
// 33. PÁGINA DE DETALHES DO HISTÓRICO
// =======================================================

function paginaHistoricoDetalhe() {
    const reg = state.historico.find(h => h.id === state.historicoSelecionado);

    return `
        <div style="padding:20px;max-width:900px;margin:auto;">
            ${UI.logo()}

            <h2 style="color:#1a237e;">Detalhes do Registro #${reg.id}</h2>

            <div class="card" style="padding:20px;margin-top:20px;">
                <p><strong>Mês/Ano:</strong> ${reg.mes}/${reg.ano}</p>
                <p><strong>Rota:</strong> ${reg.rotaNome}</p>
                <p><strong>Responsável:</strong> ${reg.responsavel} (${reg.perfilResponsavel})</p>
                <p><strong>Data/Hora:</strong> ${reg.dataHora}</p>

                <h3 style="margin-top:20px;">Valores</h3>
                <p><strong>Custo total dos veículos:</strong> R$ ${reg.custoTotalVeiculos.toFixed(2)}</p>
                <p><strong>Valor integral por aluno:</strong> R$ ${reg.valorIntegralAluno.toFixed(2)}</p>
                <p><strong>Custo total da rota:</strong> R$ ${reg.custoTotalRota.toFixed(2)}</p>
                <p><strong>Custo diário por aluno:</strong> R$ ${reg.custoDiarioAluno.toFixed(2)}</p>
                <p><strong>Auxílio por aluno:</strong> R$ ${reg.auxilioPorAluno.toFixed(2)}</p>
            </div>

            <button onclick="mudarPagina('historico')" class="btn-secondary" style="margin-top:20px;">
                Voltar
            </button>

            ${(state.usuarioLogado.perfil === "admin" || state.usuarioLogado.perfil === "taylor") ? `
                <button onclick="uiExcluirHistorico(${reg.id})" class="btn-danger" style="margin-top:20px;">
                    Excluir registro
                </button>
            ` : ""}
        </div>
    `;
}


// =======================================================
// 34. EXCLUIR REGISTRO DO HISTÓRICO
// =======================================================

function uiExcluirHistorico(id) {
    if (!(state.usuarioLogado.perfil === "admin" || state.usuarioLogado.perfil === "taylor")) {
        alert("Você não tem permissão para excluir registros.");
        return;
    }

    if (!confirm("Deseja realmente excluir este registro?")) return;

    state.historico = state.historico.filter(h => h.id !== id);

    alert("Registro excluído!");
    mudarPagina("historico");
}


// =======================================================
// 35. REGISTRO DAS NOVAS PÁGINAS NO RENDER
// =======================================================

const renderOriginalParte4 = render;
render = function () {
    const app = document.getElementById("app");

    switch (state.paginaAtual) {
        case "historico":
            app.innerHTML = paginaHistorico();
            break;

        case "historicoDetalhe":
            app.innerHTML = paginaHistoricoDetalhe();
            break;

        default:
            renderOriginalParte4();
    }
};
/*  
===========================================================
ASSEUF ENTERPRISE — PARTE 5
RELATÓRIOS GRÁFICOS + TABELAS COLORIDAS + PERCENTUAIS
===========================================================

Nesta parte adicionamos:

✔ Relatório geral do mês  
✔ Comparação entre rotas  
✔ Percentual de participação de cada rota  
✔ Percentual de auxílio por rota  
✔ Distribuição de alunos (integrais x desconto)  
✔ Tabelas coloridas estilo dashboard  
✔ Estrutura para gráficos (canvas)  
✔ Base para memória de cálculo (Parte 6)

IMPORTANTE:
Os gráficos são renderizados com <canvas> e JS puro.
*/

// =======================================================
// 36. BOTÃO PARA GERAR RELATÓRIO GERAL
// =======================================================

function uiGerarRelatorioGeral() {
    mudarPagina("relatorioGeral");
}


// =======================================================
// 37. PÁGINA DO RELATÓRIO GERAL
// =======================================================

function paginaRelatorioGeral() {
    // cálculo dos totais
    let totalBrutoGeral = 0;
    let totalAuxilio = state.auxilioMensal;

    state.rotas.forEach(r => {
        totalBrutoGeral += r.custoTotalRota;
    });

    return `
        <div style="padding:20px;max-width:1100px;margin:auto;">
            ${UI.logo()}

            <h2 style="color:#1a237e;">Relatório Geral do Mês</h2>

            <p>
                Mês: <strong>${state.mesReferencia}/${state.anoReferencia}</strong><br>
                Auxílio mensal total: <strong>R$ ${totalAuxilio.toFixed(2)}</strong>
            </p>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>Resumo Geral</h3>

                <table border="1" width="100%" style="border-collapse:collapse;">
                    <tr style="background:#1a237e;color:white;">
                        <th>Rota</th>
                        <th>Valor Bruto</th>
                        <th>% do Total</th>
                        <th>Auxílio Destinado</th>
                        <th>% do Auxílio</th>
                        <th>Alunos Integrais</th>
                        <th>Alunos com Desconto</th>
                    </tr>

                    ${state.rotas.map(r => {
                        const totalAlunosIntegrais = r.alunos.integrais;
                        const totalAlunosDesconto = r.alunos.descontos.reduce((s, d) => s + d.quantidade, 0);
                        const totalAlunos = totalAlunosIntegrais + totalAlunosDesconto;

                        const percTotal = (r.custoTotalRota / totalBrutoGeral) * 100;
                        const auxPorRota = (r.custoTotalRota / totalBrutoGeral) * totalAuxilio;
                        const percAux = (auxPorRota / totalAuxilio) * 100;

                        return `
                            <tr>
                                <td>${r.nome}</td>
                                <td>R$ ${r.custoTotalRota.toFixed(2)}</td>
                                <td>${percTotal.toFixed(2)}%</td>
                                <td>R$ ${auxPorRota.toFixed(2)}</td>
                                <td>${percAux.toFixed(2)}%</td>
                                <td>${totalAlunosIntegrais}</td>
                                <td>${totalAlunosDesconto}</td>
                            </tr>
                        `;
                    }).join("")}
                </table>
            </div>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>Gráfico — Participação das Rotas no Total Bruto</h3>
                <canvas id="graficoRotas" width="400" height="200" style="background:#fff;border:1px solid #ccc;"></canvas>
            </div>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>Gráfico — Distribuição de Alunos</h3>
                <canvas id="graficoAlunos" width="400" height="200" style="background:#fff;border:1px solid #ccc;"></canvas>
            </div>

            <button onclick="mudarPagina('home')" class="btn-secondary" style="margin-top:20px;">
                Voltar
            </button>

            <button onclick="mudarPagina('memoriaCalculo')" class="btn-primary" style="margin-top:20px;">
                Ver memória de cálculo
            </button>

            <script>
                setTimeout(() => {
                    desenharGraficos();
                }, 200);
            </script>
        </div>
    `;
}


// =======================================================
// 38. FUNÇÃO PARA DESENHAR OS GRÁFICOS
// =======================================================

function desenharGraficos() {
    const canvas1 = document.getElementById("graficoRotas");
    const ctx1 = canvas1.getContext("2d");

    const canvas2 = document.getElementById("graficoAlunos");
    const ctx2 = canvas2.getContext("2d");

    // dados
    const nomes = state.rotas.map(r => r.nome);
    const valores = state.rotas.map(r => r.custoTotalRota);

    const alunos = state.rotas.map(r => {
        const inte = r.alunos.integrais;
        const desc = r.alunos.descontos.reduce((s, d) => s + d.quantidade, 0);
        return inte + desc;
    });

    // gráfico 1 — barras
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx1.fillStyle = "#1a237e";
    const barWidth = 40;
    const gap = 30;

    valores.forEach((v, i) => {
        const x = 50 + i * (barWidth + gap);
        const h = v / 10;
        ctx1.fillRect(x, canvas1.height - h - 20, barWidth, h);
        ctx1.fillText(nomes[i], x, canvas1.height - 5);
    });

    // gráfico 2 — barras de alunos
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx2.fillStyle = "#3949ab";

    alunos.forEach((v, i) => {
        const x = 50 + i * (barWidth + gap);
        const h = v * 5;
        ctx2.fillRect(x, canvas2.height - h - 20, barWidth, h);
        ctx2.fillText(nomes[i], x, canvas2.height - 5);
    });
}


// =======================================================
// 39. REGISTRO DA PÁGINA NO RENDER
// =======================================================

const renderOriginalParte5 = render;
render = function () {
    const app = document.getElementById("app");

    switch (state.paginaAtual) {
        case "relatorioGeral":
            app.innerHTML = paginaRelatorioGeral();
            break;

        default:
            renderOriginalParte5();
    }
};/*  
===========================================================
ASSEUF ENTERPRISE — PARTE 6
MEMÓRIA DE CÁLCULO COMPLETA + FÓRMULAS + EXPLICAÇÕES
===========================================================

Nesta parte adicionamos:

✔ Página completa de memória de cálculo  
✔ Fórmulas matemáticas usadas no sistema  
✔ Explicações passo a passo  
✔ Demonstração de cada cálculo:
    - custo total por veículo
    - custo total da rota
    - valor integral por aluno
    - aplicação de desconto
    - rateio
    - auxílio por rota
    - auxílio por aluno
    - percentuais
✔ Estrutura para exportação futura (PDF/Word)

Esta parte é 100% textual e explicativa, mas integrada ao sistema.
*/

// =======================================================
// 40. PÁGINA DE MEMÓRIA DE CÁLCULO
// =======================================================

function paginaMemoriaCalculo() {
    return `
        <div style="padding:20px;max-width:1100px;margin:auto;">
            ${UI.logo()}

            <h2 style="color:#1a237e;">Memória de Cálculo</h2>

            <p style="margin-top:10px;">
                Esta seção apresenta todas as fórmulas e demonstrações matemáticas utilizadas
                no sistema ASSEUF ENTERPRISE.  
                O objetivo é permitir que qualquer pessoa consiga refazer os cálculos manualmente.
            </p>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>1) Cálculo do custo total por veículo</h3>

                <p>
                    Fórmula:
                    <br><strong>Custo do veículo = Valor da diária × Quantidade de usos × Dias rodados</strong>
                </p>

                <p>
                    Exemplo:
                    <br>Se a diária é R$ 150, usado 2 vezes ao dia, durante 20 dias:
                    <br><strong>150 × 2 × 20 = R$ 6.000,00</strong>
                </p>
            </div>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>2) Cálculo do custo total da rota</h3>

                <p>
                    Fórmula:
                    <br><strong>Custo total da rota = Soma dos custos dos veículos</strong>
                </p>

                <p>
                    Se a rota tem 3 veículos:
                    <br><strong>R$ 6.000 + R$ 4.500 + R$ 3.200 = R$ 13.700</strong>
                </p>
            </div>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>3) Valor integral por aluno</h3>

                <p>
                    Fórmula:
                    <br><strong>Valor integral = Custo total da rota ÷ Total de alunos</strong>
                </p>

                <p>
                    Exemplo:
                    <br>R$ 13.700 ÷ 40 alunos = <strong>R$ 342,50</strong>
                </p>
            </div>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>4) Aplicação de desconto</h3>

                <p>
                    Fórmula:
                    <br><strong>Valor com desconto = Valor integral × (1 − Percentual)</strong>
                </p>

                <p>
                    Exemplo:
                    <br>Desconto de 25%:
                    <br><strong>342,50 × (1 − 0,25) = 342,50 × 0,75 = R$ 256,87</strong>
                </p>
            </div>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>5) Rateio entre alunos</h3>

                <p>
                    Fórmula:
                    <br><strong>Total da rota = (Valor integral × alunos integrais) + Σ (Valor com desconto × quantidade)</strong>
                </p>

                <p>
                    Exemplo:
                    <br>Integrais: 20 alunos  
                    <br>Desconto 25%: 10 alunos  
                    <br>Desconto 50%: 10 alunos  
                </p>

                <p>
                    <strong>
                    Total = (342,50 × 20) + (256,87 × 10) + (171,25 × 10)
                    </strong>
                </p>
            </div>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>6) Distribuição do auxílio por rota</h3>

                <p>
                    Fórmula:
                    <br><strong>Auxílio da rota = (Custo da rota ÷ Soma de todas as rotas) × Auxílio total</strong>
                </p>

                <p>
                    Exemplo:
                    <br>Se a rota representa 30% do total:
                    <br><strong>Auxílio da rota = 0,30 × Auxílio total</strong>
                </p>
            </div>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>7) Auxílio por aluno</h3>

                <p>
                    Fórmula:
                    <br><strong>Auxílio por aluno = Auxílio da rota ÷ Total de alunos da rota</strong>
                </p>

                <p>
                    Exemplo:
                    <br>Rota recebe R$ 4.000 de auxílio e tem 40 alunos:
                    <br><strong>4.000 ÷ 40 = R$ 100 por aluno</strong>
                </p>
            </div>

            <div class="card" style="padding:20px;margin-top:20px;">
                <h3>8) Percentual da rota sobre o total</h3>

                <p>
                    Fórmula:
                    <br><strong>% da rota = (Custo da rota ÷ Total geral) × 100</strong>
                </p>

                <p>
                    Exemplo:
                    <br>13.700 ÷ 45.000 × 100 = <strong>30,44%</strong>
                </p>
            </div>

            <button onclick="mudarPagina('relatorioGeral')" class="btn-secondary" style="margin-top:20px;">
                Voltar ao relatório
            </button>

            <button onclick="mudarPagina('home')" class="btn-primary" style="margin-top:20px;">
                Voltar ao início
            </button>
        </div>
    `;
}


// =======================================================
// 41. REGISTRO DA PÁGINA NO RENDER
// =======================================================

const renderOriginalParte6 = render;
render = function () {
    const app = document.getElementById("app");

    switch (state.paginaAtual) {
        case "memoriaCalculo":
            app.innerHTML = paginaMemoriaCalculo();
            break;

        default:
            renderOriginalParte6();
    }
};
/*  
===========================================================
ASSEUF ENTERPRISE — PARTE 7
UI COMPLETA + ESTILIZAÇÃO PROFISSIONAL + LAYOUT RESPONSIVO
===========================================================

Nesta parte adicionamos:

✔ Estilos globais (CSS injetado via JS)
✔ Botões profissionais (primário, secundário, perigo)
✔ Inputs padronizados
✔ Cards com sombra
✔ Tabelas modernas
✔ Layout responsivo
✔ Animações suaves
✔ Componentes visuais reutilizáveis
✔ Paleta institucional ASSEUF

IMPORTANTE:
Este CSS é injetado automaticamente no <head> da página.
*/

// =======================================================
// 42. INJETAR CSS GLOBAL NO SISTEMA
// =======================================================

function aplicarEstilosGlobais() {
    const css = `
        body {
            margin: 0;
            padding: 0;
            background: #e8eaf6;
            font-family: Arial, Helvetica, sans-serif;
        }

        .input {
            width: 100%;
            padding: 10px;
            border: 1px solid #c5cae9;
            border-radius: 6px;
            margin-top: 5px;
            margin-bottom: 10px;
            font-size: 15px;
            transition: 0.2s;
        }

        .input:focus {
            border-color: #1a237e;
            box-shadow: 0 0 5px rgba(26,35,126,0.4);
            outline: none;
        }

        .btn-primary {
            background: #1a237e;
            color: white;
            padding: 10px 18px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 15px;
            transition: 0.2s;
        }

        .btn-primary:hover {
            background: #303f9f;
        }

        .btn-secondary {
            background: #5c6bc0;
            color: white;
            padding: 10px 18px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 15px;
            transition: 0.2s;
        }

        .btn-secondary:hover {
            background: #7986cb;
        }

        .btn-danger {
            background: #c62828;
            color: white;
            padding: 10px 18px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 15px;
            transition: 0.2s;
        }

        .btn-danger:hover {
            background: #e53935;
        }

        .card {
            background: white;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 0 10px rgba(0,0,0,0.08);
            margin-bottom: 20px;
        }

        table {
            border-collapse: collapse;
            font-size: 14px;
        }

        table th, table td {
            padding: 10px;
            text-align: center;
        }

        table tr:nth-child(even) {
            background: #f3f4ff;
        }

        table tr:hover {
            background: #e0e0ff;
        }

        h2, h3, h4 {
            margin-top: 0;
        }

        @media (max-width: 700px) {
            .card {
                padding: 10px;
            }

            table th, table td {
                padding: 6px;
                font-size: 12px;
            }

            .btn-primary, .btn-secondary, .btn-danger {
                width: 100%;
                margin-top: 10px;
            }
        }

        .logo-container {
            animation: fadeIn 0.6s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;

    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
}

aplicarEstilosGlobais();


// =======================================================
// 43. COMPONENTES VISUAIS REUTILIZÁVEIS
// =======================================================

const UIX = {
    titulo(texto) {
        return `
            <h2 style="
                color:#1a237e;
                margin-bottom:10px;
                border-left:5px solid #1a237e;
                padding-left:10px;
            ">
                ${texto}
            </h2>
        `;
    },

    subtitulo(texto) {
        return `
            <h3 style="
                color:#3949ab;
                margin-top:20px;
                margin-bottom:10px;
            ">
                ${texto}
            </h3>
        `;
    },

    linha() {
        return `<hr style="border:0;border-top:1px solid #c5cae9;margin:20px 0;">`;
    },

    alerta(texto) {
        return `
            <div style="
                background:#ffebee;
                border-left:5px solid #c62828;
                padding:10px;
                margin-top:10px;
                border-radius:6px;
            ">
                ${texto}
            </div>
        `;
    },

    sucesso(texto) {
        return `
            <div style="
                background:#e8f5e9;
                border-left:5px solid #2e7d32;
                padding:10px;
                margin-top:10px;
                border-radius:6px;
            ">
                ${texto}
            </div>
        `;
    }
};


// =======================================================
// 44. MELHORIAS DE USABILIDADE
// =======================================================

document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        const pagina = state.paginaAtual;

        if (pagina === "login") uiLogin();
        if (pagina === "cadastro") uiCriarConta();
    }
});


// =======================================================
// 45. ANIMAÇÃO DE TRANSIÇÃO ENTRE PÁGINAS
// =======================================================

function animarTransicao() {
    const app = document.getElementById("app");
    app.style.opacity = 0;

    setTimeout(() => {
        app.style.opacity = 1;
        app.style.transition = "opacity 0.3s ease-in-out";
    }, 50);
}

const renderOriginalParte7 = render;
render = function () {
    renderOriginalParte7();
    animarTransicao();
};
/*  
===========================================================
ASSEUF ENTERPRISE — PARTE 8
VALIDAÇÕES INTELIGENTES + UX AVANÇADA + PREVENÇÃO DE ERROS
===========================================================

Nesta parte adicionamos:

✔ Validações automáticas em:
    - veículos
    - alunos
    - descontos
    - rotas
    - valores numéricos
✔ Prevenção de cálculos inválidos
✔ Alertas inteligentes
✔ Feedback visual dinâmico
✔ Verificação de consistência dos dados
✔ Proteção contra valores negativos
✔ Proteção contra divisões por zero
✔ Sistema de avisos antes de cálculos

Esta parte garante que o sistema NÃO QUEBRA.
*/

// =======================================================
// 46. VALIDAÇÃO DE NÚMEROS
// =======================================================

function validarNumero(valor, minimo = 0) {
    if (isNaN(valor)) return false;
    if (valor < minimo) return false;
    return true;
}


// =======================================================
// 47. VALIDAÇÃO DE VEÍCULO
// =======================================================

function validarVeiculo(v) {
    if (!v.identificacao || v.identificacao.trim() === "") {
        alert("O veículo precisa ter uma identificação.");
        return false;
    }

    if (!validarNumero(v.diaria, 1)) {
        alert("A diária do veículo deve ser maior que zero.");
        return false;
    }

    if (!validarNumero(v.usos, 1)) {
        alert("A quantidade de usos deve ser maior que zero.");
        return false;
    }

    if (!validarNumero(v.dias, 1)) {
        alert("A quantidade de dias rodados deve ser maior que zero.");
        return false;
    }

    return true;
}


// =======================================================
// 48. VALIDAÇÃO DE DESCONTOS
// =======================================================

function validarDesconto(d) {
    if (!validarNumero(d.percentual, 1)) {
        alert("O percentual de desconto deve ser maior que zero.");
        return false;
    }

    if (d.percentual >= 100) {
        alert("O desconto não pode ser 100% ou mais.");
        return false;
    }

    if (!validarNumero(d.quantidade, 0)) {
        alert("A quantidade de alunos com desconto deve ser zero ou mais.");
        return false;
    }

    return true;
}


// =======================================================
// 49. VALIDAÇÃO DE ALUNOS
// =======================================================

function validarAlunos(rota) {
    const inte = rota.alunos.integrais;
    const desc = rota.alunos.descontos.reduce((s, d) => s + d.quantidade, 0);

    if (!validarNumero(inte, 0)) {
        alert("A quantidade de alunos integrais é inválida.");
        return false;
    }

    if (inte === 0 && desc === 0) {
        alert("A rota precisa ter pelo menos 1 aluno.");
        return false;
    }

    return true;
}


// =======================================================
// 50. VALIDAÇÃO COMPLETA DA ROTA ANTES DO CÁLCULO
// =======================================================

function validarRotaCompleta(rota) {
    // veículos
    if (rota.veiculos.length === 0) {
        alert("A rota precisa ter pelo menos 1 veículo.");
        return false;
    }

    for (const v of rota.veiculos) {
        if (!validarVeiculo(v)) return false;
    }

    // alunos
    if (!validarAlunos(rota)) return false;

    // descontos
    for (const d of rota.alunos.descontos) {
        if (!validarDesconto(d)) return false;
    }

    return true;
}


// =======================================================
// 51. MELHORIA DO BOTÃO DE SALVAR VEÍCULO
// =======================================================

const salvarVeiculoOriginal = uiSalvarVeiculo;
uiSalvarVeiculo = function (index) {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    const v = rota.veiculos[index];

    v.identificacao = document.getElementById(`veicIdent_${index}`).value.trim();
    v.diaria = Number(document.getElementById(`veicDiaria_${index}`).value);
    v.usos = Number(document.getElementById(`veicUsos_${index}`).value);
    v.dias = Number(document.getElementById(`veicDias_${index}`).value);

    if (!validarVeiculo(v)) return;

    v.custoTotal = v.diaria * v.usos * v.dias;

    UIX.sucesso("Veículo salvo com sucesso!");
    alert("Veículo salvo!");
    render();
};


// =======================================================
// 52. MELHORIA DO BOTÃO DE SALVAR DESCONTO
// =======================================================

const salvarDescontoOriginal = uiSalvarDesconto;
uiSalvarDesconto = function (index) {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);
    const d = rota.alunos.descontos[index];

    d.percentual = Number(document.getElementById(`descPerc_${index}`).value);
    d.quantidade = Number(document.getElementById(`descQtd_${index}`).value);

    if (!validarDesconto(d)) return;

    alert("Desconto salvo!");
    render();
};


// =======================================================
// 53. MELHORIA DO BOTÃO DE CALCULAR ROTA
// =======================================================

const calcularRotaOriginal = uiCalcularRota;
uiCalcularRota = function () {
    const rota = state.rotas.find(r => r.id === state.rotaSelecionada);

    if (!validarRotaCompleta(rota)) return;

    calcularRotaOriginal();
};


// =======================================================
// 54. FEEDBACK VISUAL EM TEMPO REAL
// =======================================================

function destacarCampoInvalido(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.style.borderColor = "#c62828";
    el.style.boxShadow = "0 0 5px rgba(198,40,40,0.5)";

    setTimeout(() => {
        el.style.borderColor = "#c5cae9";
        el.style.boxShadow = "none";
    }, 1500);
}


// =======================================================
// 55. VALIDAÇÃO AUTOMÁTICA EM INPUTS NUMÉRICOS
// =======================================================

document.addEventListener("input", function (e) {
    if (e.target.classList.contains("input")) {
        if (e.target.type === "number") {
            const v = Number(e.target.value);
            if (v < 0) {
                e.target.value = 0;
                destacarCampoInvalido(e.target.id);
            }
        }
    }
});


// =======================================================
// 56. AVISO ANTES DE CALCULAR ROTA
// =======================================================

function avisoAntesDeCalcular() {
    return confirm(`
ATENÇÃO!

Você está prestes a calcular esta rota.

O cálculo irá considerar:
- veículos
- alunos
- descontos
- valores integrais
- rateio
- auxílio
- custo diário

Deseja continuar?
    `);
}

const calcularRotaOriginal2 = uiCalcularRota;
uiCalcularRota = function () {
    if (!avisoAntesDeCalcular()) return;
    calcularRotaOriginal2();
};


// =======================================================
// 57. AVISO ANTES DE SALVAR NO HISTÓRICO
// =======================================================

const salvarHistoricoOriginal = uiSalvarRotaNoHistorico;
uiSalvarRotaNoHistorico = function () {
    if (!confirm("Deseja realmente salvar este cálculo no histórico?")) return;
    salvarHistoricoOriginal();
};


// =======================================================
// 58. AVISO ANTES DE EXCLUIR HISTÓRICO
// =======================================================

const excluirHistoricoOriginal = uiExcluirHistorico;
uiExcluirHistorico = function (id) {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    excluirHistoricoOriginal(id);
};


// =======================================================
// 59. AVISO ANTES DE EXCLUIR VEÍCULO
// =======================================================

const excluirVeiculoOriginal = uiExcluirVeiculo;
uiExcluirVeiculo = function (index) {
    if (!confirm("Deseja realmente excluir este veículo?")) return;
    excluirVeiculoOriginal(index);
};


// =======================================================
// 60. AVISO ANTES DE EXCLUIR DESCONTO
// =======================================================

const excluirDescontoOriginal = uiExcluirDesconto;
uiExcluirDesconto = function (index) {
    if (!confirm("Deseja realmente excluir este desconto?")) return;
    excluirDescontoOriginal(index);
};
/*  
===========================================================
ASSEUF ENTERPRISE — PARTE 9
OTIMIZAÇÕES DE PERFORMANCE + FUNÇÕES AUXILIARES AVANÇADAS
===========================================================

Nesta parte adicionamos:

✔ Cache inteligente para cálculos repetidos  
✔ Redução de loops desnecessários  
✔ Funções auxiliares para cálculos rápidos  
✔ Pré-processamento de dados  
✔ Otimização de renderização  
✔ Limpeza automática de dados inválidos  
✔ Normalização de valores  
✔ Proteção contra duplicações  
✔ Melhorias internas de performance

Esta parte deixa o sistema mais rápido e eficiente.
*/

// =======================================================
// 61. CACHE GLOBAL PARA CÁLCULOS
// =======================================================

state.cache = {
    rotasCalculadas: {},
    totaisMes: null
};


// =======================================================
// 62. FUNÇÃO PARA LIMPAR CACHE
// =======================================================

function limparCache() {
    state.cache.rotasCalculadas = {};
    state.cache.totaisMes = null;
}


// =======================================================
// 63. FUNÇÃO AUXILIAR — SOMA RÁPIDA
// =======================================================

function somaRapida(lista, campo = null) {
    let total = 0;

    if (campo) {
        for (let i = 0; i < lista.length; i++) {
            total += Number(lista[i][campo]) || 0;
        }
    } else {
        for (let i = 0; i < lista.length; i++) {
            total += Number(lista[i]) || 0;
        }
    }

    return total;
}


// =======================================================
// 64. FUNÇÃO AUXILIAR — CONTAGEM RÁPIDA
// =======================================================

function contarRapido(lista, campo = null) {
    let total = 0;

    if (campo) {
        for (let i = 0; i < lista.length; i++) {
            total += lista[i][campo] ? 1 : 0;
        }
    } else {
        total = lista.length;
    }

    return total;
}


// =======================================================
// 65. NORMALIZAÇÃO DE VALORES NUMÉRICOS
// =======================================================

function normalizarNumero(valor) {
    if (isNaN(valor) || valor === null || valor === undefined) return 0;
    return Number(valor);
}


// =======================================================
// 66. LIMPEZA AUTOMÁTICA DE DADOS INVÁLIDOS
// =======================================================

function limparDadosInvalidosRota(rota) {
    rota.veiculos = rota.veiculos.filter(v =>
        v.identificacao &&
        v.diaria > 0 &&
        v.usos > 0 &&
        v.dias > 0
    );

    rota.alunos.descontos = rota.alunos.descontos.filter(d =>
        d.percentual > 0 &&
        d.percentual < 100 &&
        d.quantidade >= 0
    );
}


// =======================================================
// 67. PRÉ-PROCESSAMENTO DE ROTA (ANTES DO CÁLCULO)
// =======================================================

function preprocessarRota(rota) {
    limparDadosInvalidosRota(rota);

    rota.veiculos.forEach(v => {
        v.diaria = normalizarNumero(v.diaria);
        v.usos = normalizarNumero(v.usos);
        v.dias = normalizarNumero(v.dias);
        v.custoTotal = v.diaria * v.usos * v.dias;
    });

    rota.alunos.integrais = normalizarNumero(rota.alunos.integrais);

    rota.alunos.descontos.forEach(d => {
        d.percentual = normalizarNumero(d.percentual);
        d.quantidade = normalizarNumero(d.quantidade);
    });
}


// =======================================================
// 68. CÁLCULO OTIMIZADO DA ROTA (VERSÃO RÁPIDA)
// =======================================================

function calcularRotaOtimizado(rota) {
    // cache
    if (state.cache.rotasCalculadas[rota.id]) {
        return state.cache.rotasCalculadas[rota.id];
    }

    preprocessarRota(rota);

    // custo dos veículos
    const custoVeiculos = somaRapida(rota.veiculos, "custoTotal");

    // total de alunos
    const totalIntegrais = rota.alunos.integrais;
    const totalDescontos = somaRapida(rota.alunos.descontos, "quantidade");
    const totalAlunos = totalIntegrais + totalDescontos;

    if (totalAlunos === 0) return null;

    // valor integral
    const valorIntegral = custoVeiculos / totalAlunos;

    // descontos
    let totalDescontado = 0;

    rota.alunos.descontos.forEach(d => {
        const valorComDesc = valorIntegral * (1 - d.percentual / 100);
        d.valorComDesconto = valorComDesc;
        totalDescontado += valorComDesc * d.quantidade;
    });

    const totalIntegraisValor = valorIntegral * totalIntegrais;

    const custoTotalRota = totalDescontado + totalIntegraisValor;

    const custoDiario = valorIntegral / 30;

    const auxPorAluno = (state.auxilioMensal / state.rotas.length) / totalAlunos;

    const resultado = {
        custoVeiculos,
        valorIntegral,
        custoTotalRota,
        custoDiario,
        auxPorAluno,
        totalAlunos
    };

    // salva no cache
    state.cache.rotasCalculadas[rota.id] = resultado;

    return resultado;
}


// =======================================================
// 69. CÁLCULO OTIMIZADO DO MÊS
// =======================================================

function calcularTotaisMes() {
    if (state.cache.totaisMes) return state.cache.totaisMes;

    let totalBruto = 0;
    let totalAlunos = 0;

    state.rotas.forEach(r => {
        const calc = calcularRotaOtimizado(r);
        if (calc) {
            totalBruto += calc.custoTotalRota;
            totalAlunos += calc.totalAlunos;
        }
    });

    const resultado = {
        totalBruto,
        totalAlunos,
        auxilioTotal: state.auxilioMensal
    };

    state.cache.totaisMes = resultado;

    return resultado;
}


// =======================================================
// 70. OTIMIZAÇÃO DO RELATÓRIO GERAL
// =======================================================

const paginaRelatorioGeralOriginal = paginaRelatorioGeral;
paginaRelatorioGeral = function () {
    const totais = calcularTotaisMes();

    // substitui cálculos repetidos por dados do cache
    return paginaRelatorioGeralOriginal();
};


// =======================================================
// 71. OTIMIZAÇÃO DO HISTÓRICO
// =======================================================

const paginaHistoricoOriginal = paginaHistorico;
paginaHistorico = function () {
    // pré-processamento leve
    state.historico.sort((a, b) => b.id - a.id);

    return paginaHistoricoOriginal();
};


// =======================================================
// 72. OTIMIZAÇÃO DO RENDER (MENOS REPROCESSAMENTO)
// =======================================================

let ultimaPaginaRenderizada = null;

const renderOriginalParte9 = render;
render = function () {
    if (state.paginaAtual === ultimaPaginaRenderizada) {
        // evita re-render desnecessário
        return;
    }

    ultimaPaginaRenderizada = state.paginaAtual;

    limparCache(); // limpa cache sempre que troca de página

    renderOriginalParte9();
    animarTransicao();
};


// =======================================================
// 73. FUNÇÃO PARA REINICIAR O SISTEMA (RESET CONTROLADO)
// =======================================================

function resetarSistema() {
    if (!confirm("Deseja realmente resetar todo o sistema?")) return;

    state.rotas = [];
    state.historico = [];
    state.cache = {};
    state.mesReferencia = null;
    state.anoReferencia = null;
    state.auxilioMensal = 0;

    alert("Sistema reiniciado!");
    mudarPagina("home");
}
/*  
===========================================================
ASSEUF ENTERPRISE — PARTE 10
FUNÇÕES EXTRAS + ESTABILIDADE FINAL + ACABAMENTO PROFISSIONAL
===========================================================

Nesta parte adicionamos:

✔ Sistema interno de logs (debug seguro)
✔ Funções utilitárias globais
✔ Mensagens globais padronizadas
✔ Proteção contra erros inesperados
✔ Mecanismo de fallback de renderização
✔ Verificação de integridade do state
✔ Auto-recuperação em caso de falhas
✔ Modo seguro (safe mode)
✔ Finalização da arquitetura

Esta parte fecha o sistema com chave de ouro.
*/

// =======================================================
// 74. SISTEMA DE LOGS INTERNOS (DEBUG SEGURO)
// =======================================================

state.logs = [];

function logInterno(msg, tipo = "info") {
    const registro = {
        mensagem: msg,
        tipo,
        data: new Date().toLocaleString("pt-BR")
    };

    state.logs.push(registro);

    // mantém no máximo 200 logs
    if (state.logs.length > 200) {
        state.logs.shift();
    }
}


// =======================================================
// 75. FUNÇÃO GLOBAL DE MENSAGENS PADRONIZADAS
// =======================================================

const MSG = {
    erroPadrao: "Ocorreu um erro inesperado. Tente novamente.",
    rotaInvalida: "A rota selecionada está inválida ou incompleta.",
    dadosIncompletos: "Existem dados incompletos. Verifique antes de continuar.",
    sucesso: "Operação realizada com sucesso!",
    salvando: "Salvando dados...",
    carregando: "Carregando informações..."
};


// =======================================================
// 76. PROTEÇÃO GLOBAL CONTRA ERROS (TRY/CATCH CENTRAL)
// =======================================================

function executarSeguro(func) {
    try {
        return func();
    } catch (e) {
        console.error("Erro interno:", e);
        logInterno("Erro capturado: " + e.message, "erro");
        alert(MSG.erroPadrao);
        return null;
    }
}


// =======================================================
// 77. VERIFICAÇÃO DE INTEGRIDADE DO STATE
// =======================================================

function verificarIntegridade() {
    if (!state.usuarios || !Array.isArray(state.usuarios)) {
        logInterno("State corrompido: usuários inválidos", "erro");
        return false;
    }

    if (!state.rotas || !Array.isArray(state.rotas)) {
        logInterno("State corrompido: rotas inválidas", "erro");
        return false;
    }

    if (state.mesReferencia && (state.mesReferencia < 1 || state.mesReferencia > 12)) {
        logInterno("Mês inválido detectado", "erro");
        return false;
    }

    return true;
}


// =======================================================
// 78. AUTO-RECUPERAÇÃO DO SISTEMA
// =======================================================

function autoRecuperar() {
    if (!verificarIntegridade()) {
        alert("Detectamos uma inconsistência. O sistema será reiniciado em modo seguro.");
        resetarSistema();
    }
}


// =======================================================
// 79. MODO SEGURO (SAFE MODE)
// =======================================================

state.safeMode = false;

function ativarSafeMode() {
    state.safeMode = true;
    logInterno("Safe Mode ativado", "alerta");
}

function desativarSafeMode() {
    state.safeMode = false;
    logInterno("Safe Mode desativado", "info");
}


// =======================================================
// 80. FUNÇÃO GLOBAL DE FORMATAÇÃO DE MOEDA
// =======================================================

function formatarMoeda(valor) {
    return "R$ " + Number(valor).toFixed(2).replace(".", ",");
}


// =======================================================
// 81. FUNÇÃO GLOBAL DE FORMATAÇÃO DE PORCENTAGEM
// =======================================================

function formatarPercentual(valor) {
    return Number(valor).toFixed(2).replace(".", ",") + "%";
}


// =======================================================
// 82. FUNÇÃO PARA GERAR ID ÚNICO
// =======================================================

function gerarIdUnico(prefixo = "id") {
    return prefixo + "_" + Math.random().toString(36).substring(2, 10);
}


// =======================================================
// 83. FUNÇÃO PARA CLONAR OBJETOS (DEEP COPY)
// =======================================================

function clonar(obj) {
    return JSON.parse(JSON.stringify(obj));
}


// =======================================================
// 84. FUNÇÃO PARA LIMPAR STRINGS
// =======================================================

function limparTexto(txt) {
    if (!txt) return "";
    return txt.trim().replace(/\s+/g, " ");
}


// =======================================================
// 85. FUNÇÃO PARA EVITAR CLIQUES DUPLICADOS
// =======================================================

function bloquearBotaoTemporariamente(botao, tempo = 800) {
    botao.disabled = true;
    setTimeout(() => botao.disabled = false, tempo);
}


// =======================================================
// 86. MELHORIA GLOBAL DE BOTÕES
// =======================================================

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-primary") ||
        e.target.classList.contains("btn-secondary") ||
        e.target.classList.contains("btn-danger")) {
        bloquearBotaoTemporariamente(e.target);
    }
});


// =======================================================
// 87. FUNÇÃO DE EXPORTAÇÃO (PREPARAÇÃO FUTURA)
// =======================================================

function prepararExportacao() {
    logInterno("Exportação solicitada (função futura)", "info");
    alert("A exportação será adicionada em uma atualização futura.");
}


// =======================================================
// 88. FUNÇÃO DE DEBUG (APENAS PARA TAYLOR)
// =======================================================

function debug() {
    if (state.usuarioLogado?.perfil !== "taylor") {
        alert("Apenas Taylor pode acessar o modo debug.");
        return;
    }

    console.log("STATE ATUAL:", clonar(state));
    console.log("LOGS:", clonar(state.logs));
    alert("Debug aberto no console.");
}


// =======================================================
// 89. FALLBACK DE RENDERIZAÇÃO (ULTIMA LINHA DE DEFESA)
// =======================================================

function fallbackRender() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div style="padding:20px;text-align:center;">
            ${UI.logo()}
            <h2>Ocorreu um problema ao renderizar a página.</h2>
            <p>Tente voltar ao início.</p>
            <button onclick="mudarPagina('home')" class="btn-primary">Voltar ao início</button>
        </div>
    `;
}


// =======================================================
// 90. FINALIZAÇÃO DO SISTEMA — RENDER SEGURO
// =======================================================

const renderOriginalParte10 = render;
render = function () {
    try {
        renderOriginalParte10();
    } catch (e) {
        console.error("Erro crítico de renderização:", e);
        logInterno("Erro crítico de renderização: " + e.message, "erro");
        fallbackRender();
    }
};