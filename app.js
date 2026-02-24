// =======================================================
// PARTE 1 — ESTADO GLOBAL, CONFIGURAÇÕES E HISTÓRICO
// Versão avançada do Sistema ASSEUF
// =======================================================

// Configurações gerais do sistema
const CONFIG = {
    nomeSistema: "Sistema ASSEUF — Versão Avançada",
    versao: "2.0",
    moeda: "R$",
    auxilioPercentualSL: 70,
    auxilioPercentualCV: 30,
    descontoMaximo: 100,
    tema: "dark", // reservado para futuro (tema claro/escuro)
    formatoData: "pt-BR"
};

// Estado principal do sistema
const state = {
    paginaAtual: "inicio",
    resultado: null,
    historico: carregarHistorico(),
    filtrosRelatorio: {
        mesInicial: null,
        mesFinal: null,
        mostrarSomenteComAuxilio: false
    }
};

// =======================================================
// UTILITÁRIOS GERAIS
// =======================================================

function formatarMoeda(valor) {
    if (isNaN(valor)) return `${CONFIG.moeda} 0,00`;
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarNumero(valor, casas = 2) {
    if (isNaN(valor)) return "0";
    return valor.toFixed(casas).replace(".", ",");
}

function formatarDataHora(data = new Date()) {
    return data.toLocaleString(CONFIG.formatoData);
}

function gerarIdUnico() {
    return "ID-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
}

// =======================================================
// HISTÓRICO (H1 — POR MÊS, COM DETALHES AVANÇADOS)
// =======================================================

function carregarHistorico() {
    try {
        const salvo = localStorage.getItem("historicoRotasAvancado");
        return salvo ? JSON.parse(salvo) : {};
    } catch (e) {
        console.error("Erro ao carregar histórico:", e);
        return {};
    }
}

function salvarHistorico() {
    try {
        localStorage.setItem("historicoRotasAvancado", JSON.stringify(state.historico));
    } catch (e) {
        console.error("Erro ao salvar histórico:", e);
    }
}

/**
 * Registra um cálculo no histórico mensal.
 * Estrutura:
 *  historico[mes] = {
 *      idRegistro,
 *      mes,
 *      brutoSL, brutoCV, brutoTotal,
 *      auxSL, auxCV,
 *      liquidoSL, liquidoCV, liquidoTotal,
 *      alunosSL, alunosCV, totalAlunos,
 *      mensalidadeMedia,
 *      desconto,
 *      parametrosEntrada: { ...tudo que veio do formulário... },
 *      dataRegistro
 *  }
 */
function registrarHistorico(mes, dados, parametrosEntrada) {
    const registro = {
        idRegistro: gerarIdUnico(),
        mes,
        ...dados,
        parametrosEntrada,
        dataRegistro: formatarDataHora()
    };

    // H1 — por mês: substitui o mês, mas agora com muito mais detalhes
    state.historico[mes] = registro;
    salvarHistorico();
}

// =======================================================
// NAVEGAÇÃO ENTRE PÁGINAS
// =======================================================

document.addEventListener("click", (e) => {
    if (e.target.matches("nav button")) {
        const pagina = e.target.getAttribute("data-page");
        navegarPara(pagina);
    }
});

function navegarPara(pagina) {
    state.paginaAtual = pagina;
    render();
}

// =======================================================
// RENDERIZAÇÃO PRINCIPAL
// =======================================================

function render() {
    const app = document.getElementById("app");

    switch (state.paginaAtual) {
        case "inicio":
            app.innerHTML = paginaInicio();
            break;

        case "calculo":
            app.innerHTML = paginaCalculo();
            break;

        case "relatorios":
            app.innerHTML = paginaRelatorios();
            // gráficos e componentes avançados serão carregados depois
            setTimeout(carregarGraficos, 50);
            break;

        case "pdf":
            app.innerHTML = paginaPDF();
            break;

        default:
            app.innerHTML = "<p>Erro ao carregar página.</p>";
    }
}
// =======================================================
// PARTE 2 — PÁGINA INÍCIO AVANÇADA (DASHBOARD COMPLETO)
// =======================================================

function paginaInicio() {
    const historico = state.historico;
    const meses = Object.keys(historico);

    // Estatísticas automáticas
    const totalRegistros = meses.length;

    const somaBruto = meses.reduce((acc, m) => acc + historico[m].brutoTotal, 0);
    const somaLiquido = meses.reduce((acc, m) => acc + historico[m].liquidoTotal, 0);
    const somaAlunos = meses.reduce((acc, m) => acc + historico[m].totalAlunos, 0);

    const mediaMensalidade = meses.length > 0
        ? somaLiquido / somaAlunos
        : 0;

    // Último registro
    const ultimoMes = meses.length > 0 ? meses[meses.length - 1] : null;
    const ultimo = ultimoMes ? historico[ultimoMes] : null;

    return `
        <style>
            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }

            .dash-card {
                background: #1e1e1e;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 0 10px rgba(0,0,0,0.4);
                transition: transform .2s, box-shadow .2s;
            }

            .dash-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 0 18px rgba(0,0,0,0.6);
            }

            .dash-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #4CAF50;
            }

            .dash-value {
                font-size: 26px;
                font-weight: bold;
                margin-bottom: 5px;
            }

            .dash-sub {
                opacity: 0.7;
                font-size: 14px;
            }

            .section-block {
                margin-top: 40px;
            }

            .last-report {
                background: #252525;
                padding: 20px;
                border-radius: 10px;
                margin-top: 20px;
            }

            .last-report h3 {
                margin-bottom: 10px;
            }

            .divider {
                height: 2px;
                background: #444;
                margin: 15px 0;
            }
        </style>

        <div class="card">
            <h2 class="section-title">Painel Inicial — ${CONFIG.nomeSistema}</h2>
            <div class="divider"></div>

            <p>Bem-vindo ao sistema mais avançado já criado para gestão das rotas ASSEUF.</p>
            <p>Aqui você encontra um resumo completo das operações, desempenho e histórico.</p>

            <div class="dashboard-grid">

                <div class="dash-card">
                    <div class="dash-title">Registros no Histórico</div>
                    <div class="dash-value">${totalRegistros}</div>
                    <div class="dash-sub">Cálculos salvos por mês</div>
                </div>

                <div class="dash-card">
                    <div class="dash-title">Total Bruto Acumulado</div>
                    <div class="dash-value">${formatarMoeda(somaBruto)}</div>
                    <div class="dash-sub">Soma de todos os meses</div>
                </div>

                <div class="dash-card">
                    <div class="dash-title">Total Líquido Acumulado</div>
                    <div class="dash-value">${formatarMoeda(somaLiquido)}</div>
                    <div class="dash-sub">Após abatimentos e auxílio</div>
                </div>

                <div class="dash-card">
                    <div class="dash-title">Alunos Transportados</div>
                    <div class="dash-value">${somaAlunos}</div>
                    <div class="dash-sub">Total somado de todos os meses</div>
                </div>

                <div class="dash-card">
                    <div class="dash-title">Mensalidade Média Geral</div>
                    <div class="dash-value">${formatarMoeda(mediaMensalidade)}</div>
                    <div class="dash-sub">Baseada no histórico completo</div>
                </div>

            </div>

            <div class="section-block">
                <h3 class="section-title">Último Registro</h3>
                <div class="divider"></div>

                ${
                    ultimo
                    ? `
                        <div class="last-report">
                            <h3>Mês: ${ultimo.mes}</h3>
                            <p><strong>Bruto Total:</strong> ${formatarMoeda(ultimo.brutoTotal)}</p>
                            <p><strong>Líquido Total:</strong> ${formatarMoeda(ultimo.liquidoTotal)}</p>
                            <p><strong>Total de Alunos:</strong> ${ultimo.totalAlunos}</p>
                            <p><strong>Mensalidade Média:</strong> ${formatarMoeda(ultimo.mensalidadeMedia)}</p>
                            <p><strong>Registrado em:</strong> ${ultimo.dataRegistro}</p>
                        </div>
                    `
                    : `<p>Nenhum registro encontrado.</p>`
                }
            </div>

        </div>
    `;
}
// =======================================================
// PARTE 3 — CADASTRO E CÁLCULO AVANÇADO
// =======================================================

function paginaCalculo() {
    return `
        <style>
            .form-section {
                background: #1e1e1e;
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 25px;
                box-shadow: 0 0 10px rgba(0,0,0,0.4);
            }

            .form-section h3 {
                margin-bottom: 10px;
                color: #4CAF50;
            }

            .form-grid-2 {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                gap: 15px;
            }

            .input-block label {
                font-weight: bold;
                margin-bottom: 5px;
                display: block;
            }

            .input-block input {
                width: 100%;
                padding: 10px;
                border-radius: 8px;
                border: none;
                background: #2b2b2b;
                color: white;
                font-size: 15px;
            }

            .math-box {
                background: #252525;
                padding: 15px;
                border-radius: 10px;
                margin-top: 15px;
                font-size: 14px;
                opacity: 0.9;
            }

            .resultado-avancado {
                margin-top: 30px;
                padding: 20px;
                background: #1e1e1e;
                border-radius: 12px;
                box-shadow: 0 0 10px rgba(0,0,0,0.4);
            }
        </style>

        <div class="card">
            <h2 class="section-title">Cadastro e Cálculo Avançado</h2>
            <div class="divider"></div>

            <!-- SEÇÃO 1 — IDENTIFICAÇÃO -->
            <div class="form-section">
                <h3>1. Identificação do Cálculo</h3>
                <div class="form-grid-2">
                    <div class="input-block">
                        <label>Mês de Referência</label>
                        <input id="mesRef" type="month">
                    </div>

                    <div class="input-block">
                        <label>Responsável pelo Cálculo</label>
                        <input id="responsavel" type="text" placeholder="Ex: Taylor Santos">
                    </div>
                </div>
            </div>

            <!-- SEÇÃO 2 — DIÁRIAS -->
            <div class="form-section">
                <h3>2. Quantidade de Diárias</h3>
                <div class="form-grid-2">
                    <div class="input-block">
                        <label>Diárias — Sete Lagoas</label>
                        <input id="diariasSL" type="number" min="0">
                    </div>

                    <div class="input-block">
                        <label>Diárias — Curvelo</label>
                        <input id="diariasCV" type="number" min="0">
                    </div>
                </div>

                <div class="math-box">
                    Fórmula utilizada:<br>
                    <strong>Bruto = Diárias × Valor da Passagem</strong>
                </div>
            </div>

            <!-- SEÇÃO 3 — VALORES DAS PASSAGENS -->
            <div class="form-section">
                <h3>3. Valores das Passagens</h3>
                <div class="form-grid-2">
                    <div class="input-block">
                        <label>Passagem — Sete Lagoas</label>
                        <input id="passagemSL" type="number" min="0" step="0.01">
                    </div>

                    <div class="input-block">
                        <label>Passagem — Curvelo</label>
                        <input id="passagemCV" type="number" min="0" step="0.01">
                    </div>
                </div>
            </div>

            <!-- SEÇÃO 4 — AUXÍLIO -->
            <div class="form-section">
                <h3>4. Auxílio Transporte</h3>
                <div class="form-grid-2">
                    <div class="input-block">
                        <label>Valor Total do Auxílio</label>
                        <input id="auxilio" type="number" min="0" step="0.01">
                    </div>

                    <div class="input-block">
                        <label>Distribuição do Auxílio</label>
                        <input disabled value="70% SL — 30% CV">
                    </div>
                </div>

                <div class="math-box">
                    Fórmula utilizada:<br>
                    <strong>AuxSL = Auxílio × 0.70</strong><br>
                    <strong>AuxCV = Auxílio × 0.30</strong>
                </div>
            </div>

            <!-- SEÇÃO 5 — ALUNOS -->
            <div class="form-section">
                <h3>5. Quantidade de Alunos</h3>
                <div class="form-grid-2">
                    <div class="input-block">
                        <label>Alunos — Sete Lagoas</label>
                        <input id="alunosSL" type="number" min="0">
                    </div>

                    <div class="input-block">
                        <label>Alunos — Curvelo</label>
                        <input id="alunosCV" type="number" min="0">
                    </div>
                </div>

                <div class="math-box">
                    Fórmula utilizada:<br>
                    <strong>Mensalidade Média = Total Líquido ÷ Total de Alunos</strong>
                </div>
            </div>

            <!-- SEÇÃO 6 — DESCONTOS -->
            <div class="form-section">
                <h3>6. Descontos e Ajustes</h3>
                <div class="form-grid-2">
                    <div class="input-block">
                        <label>Desconto (%)</label>
                        <input id="desconto" type="number" min="0" max="100" value="0">
                    </div>

                    <div class="input-block">
                        <label>Observações</label>
                        <input id="obs" type="text" placeholder="Ex: desconto por feriado, ajuste especial...">
                    </div>
                </div>
            </div>

            <button class="btn-primary" onclick="calcularRotasAvancado()">Gerar Cálculo Completo</button>

            <div id="resultadoCalculo" class="resultado-avancado"></div>
        </div>
    `;
}

// =======================================================
// FUNÇÃO PRINCIPAL DE CÁLCULO AVANÇADO
// =======================================================

function calcularRotasAvancado() {
    const parametros = {
        mes: document.getElementById("mesRef").value,
        responsavel: document.getElementById("responsavel").value,
        diariasSL: Number(document.getElementById("diariasSL").value),
        diariasCV: Number(document.getElementById("diariasCV").value),
        passagemSL: Number(document.getElementById("passagemSL").value),
        passagemCV: Number(document.getElementById("passagemCV").value),
        auxilio: Number(document.getElementById("auxilio").value),
        alunosSL: Number(document.getElementById("alunosSL").value),
        alunosCV: Number(document.getElementById("alunosCV").value),
        desconto: Number(document.getElementById("desconto").value),
        observacoes: document.getElementById("obs").value
    };

    if (!parametros.mes) {
        alert("Selecione o mês de referência.");
        return;
    }

    // Cálculos brutos
    const brutoSL = parametros.diariasSL * parametros.passagemSL;
    const brutoCV = parametros.diariasCV * parametros.passagemCV;
    const brutoTotal = brutoSL + brutoCV;

    // Desconto
    const brutoComDesconto = brutoTotal * (1 - parametros.desconto / 100);

    // Auxílio
    const auxSL = parametros.auxilio * 0.7;
    const auxCV = parametros.auxilio * 0.3;

    // Líquidos
    const liquidoSL = brutoSL - auxSL;
    const liquidoCV = brutoCV - auxCV;
    const liquidoTotal = liquidoSL + liquidoCV;

    // Alunos
    const totalAlunos = parametros.alunosSL + parametros.alunosCV;
    const mensalidadeMedia = totalAlunos > 0 ? liquidoTotal / totalAlunos : 0;

    const resultado = {
        ...parametros,
        brutoSL,
        brutoCV,
        brutoTotal,
        brutoComDesconto,
        auxSL,
        auxCV,
        liquidoSL,
        liquidoCV,
        liquidoTotal,
        totalAlunos,
        mensalidadeMedia
    };

    state.resultado = resultado;

    registrarHistorico(parametros.mes, resultado, parametros);

    mostrarResultadoAvancado(resultado);
}

// =======================================================
// EXIBIÇÃO DO RESULTADO AVANÇADO
// =======================================================

function mostrarResultadoAvancado(r) {
    const div = document.getElementById("resultadoCalculo");

    div.innerHTML = `
        <h3>Resultado Completo do Cálculo</h3>
        <div class="divider"></div>

        <p><strong>Responsável:</strong> ${r.responsavel || "Não informado"}</p>
        <p><strong>Mês:</strong> ${r.mes}</p>

        <h4>Valores Brutos</h4>
        <p>Sete Lagoas: ${formatarMoeda(r.brutoSL)}</p>
        <p>Curvelo: ${formatarMoeda(r.brutoCV)}</p>
        <p><strong>Total Bruto:</strong> ${formatarMoeda(r.brutoTotal)}</p>

        <h4>Auxílio Transporte</h4>
        <p>SL (70%): ${formatarMoeda(r.auxSL)}</p>
        <p>CV (30%): ${formatarMoeda(r.auxCV)}</p>

        <h4>Valores Líquidos</h4>
        <p>Líquido SL: ${formatarMoeda(r.liquidoSL)}</p>
        <p>Líquido CV: ${formatarMoeda(r.liquidoCV)}</p>
        <p><strong>Total Líquido:</strong> ${formatarMoeda(r.liquidoTotal)}</strong></p>

        <h4>Alunos</h4>
        <p>Total de Alunos: ${r.totalAlunos}</p>
        <p>Mensalidade Média: ${formatarMoeda(r.mensalidadeMedia)}</p>

        <h4>Descontos e Observações</h4>
        <p>Desconto aplicado: ${r.desconto}%</p>
        <p>Observações: ${r.observacoes || "Nenhuma"}</p>

        <div class="divider"></div>
        <p style="opacity:0.7;">Cálculo avançado salvo no histórico.</p>
    `;
}
// =======================================================
// PARTE 4 — RELATÓRIOS AVANÇADOS + DASHBOARD ANALÍTICO
// =======================================================

function paginaRelatorios() {
    const historico = state.historico;
    const meses = Object.keys(historico);

    return `
        <style>
            .relatorio-container {
                margin-top: 20px;
            }

            .filtros-box {
                background: #1e1e1e;
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 25px;
                box-shadow: 0 0 10px rgba(0,0,0,0.4);
            }

            .filtros-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 15px;
            }

            .filtros-grid input {
                padding: 10px;
                border-radius: 8px;
                border: none;
                background: #2b2b2b;
                color: white;
            }

            .tabela-relatorio {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }

            .tabela-relatorio th {
                background: #333;
                padding: 12px;
                text-align: left;
                color: #4CAF50;
            }

            .tabela-relatorio td {
                padding: 10px;
                border-bottom: 1px solid #444;
            }

            .tabela-relatorio tr:hover {
                background: #2a2a2a;
            }

            .analise-box {
                background: #1e1e1e;
                padding: 20px;
                border-radius: 12px;
                margin-top: 30px;
                box-shadow: 0 0 10px rgba(0,0,0,0.4);
            }

            .analise-box h3 {
                margin-bottom: 10px;
                color: #4CAF50;
            }

            .grafico-box {
                margin-top: 40px;
                background: #1e1e1e;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 0 10px rgba(0,0,0,0.4);
            }
        </style>

        <div class="card">
            <h2 class="section-title">Relatórios Avançados</h2>
            <div class="divider"></div>

            <div class="filtros-box">
                <h3>Filtros do Relatório</h3>
                <div class="filtros-grid">
                    <div>
                        <label>Filtrar por mês inicial</label>
                        <input type="month" id="filtroMesInicial">
                    </div>

                    <div>
                        <label>Filtrar por mês final</label>
                        <input type="month" id="filtroMesFinal">
                    </div>

                    <div>
                        <label>Mostrar somente meses com auxílio</label>
                        <input type="checkbox" id="filtroAuxilio">
                    </div>
                </div>

                <button class="btn-primary" onclick="aplicarFiltrosRelatorio()">Aplicar Filtros</button>
            </div>

            <div id="tabelaRelatorioContainer">
                ${gerarTabelaRelatorio(historico)}
            </div>

            <div class="grafico-box">
                <h3>Gráfico — Evolução Financeira</h3>
                <canvas id="graficoEvolucao" height="120"></canvas>
            </div>

            <div class="grafico-box">
                <h3>Gráfico — Comparação SL × CV</h3>
                <canvas id="graficoComparacao" height="120"></canvas>
            </div>

            <div class="analise-box">
                <h3>Análises Automáticas</h3>
                ${gerarAnalisesAvancadas(historico)}
            </div>
        </div>
    `;
}

// =======================================================
// TABELA AVANÇADA DO RELATÓRIO
// =======================================================

function gerarTabelaRelatorio(historico) {
    const meses = Object.keys(historico);

    if (meses.length === 0) {
        return `<p>Nenhum registro encontrado.</p>`;
    }

    let linhas = "";

    for (const mes of meses) {
        const h = historico[mes];

        linhas += `
            <tr>
                <td>${mes}</td>
                <td>${formatarMoeda(h.brutoSL)}</td>
                <td>${formatarMoeda(h.brutoCV)}</td>
                <td><strong>${formatarMoeda(h.brutoTotal)}</strong></td>

                <td>${formatarMoeda(h.auxSL)}</td>
                <td>${formatarMoeda(h.auxCV)}</td>

                <td>${formatarMoeda(h.liquidoSL)}</td>
                <td>${formatarMoeda(h.liquidoCV)}</td>
                <td><strong>${formatarMoeda(h.liquidoTotal)}</strong></td>

                <td>${h.totalAlunos}</td>
                <td>${formatarMoeda(h.mensalidadeMedia)}</td>

                <td>${h.responsavel || "—"}</td>
                <td>${h.dataRegistro}</td>
            </tr>
        `;
    }

    return `
        <table class="tabela-relatorio">
            <thead>
                <tr>
                    <th>Mês</th>
                    <th>Bruto SL</th>
                    <th>Bruto CV</th>
                    <th>Total Bruto</th>

                    <th>Aux SL</th>
                    <th>Aux CV</th>

                    <th>Líquido SL</th>
                    <th>Líquido CV</th>
                    <th>Total Líquido</th>

                    <th>Alunos</th>
                    <th>Mensalidade Média</th>

                    <th>Responsável</th>
                    <th>Registrado em</th>
                </tr>
            </thead>
            <tbody>
                ${linhas}
            </tbody>
        </table>
    `;
}

// =======================================================
// FILTROS AVANÇADOS
// =======================================================

function aplicarFiltrosRelatorio() {
    const mesInicial = document.getElementById("filtroMesInicial").value;
    const mesFinal = document.getElementById("filtroMesFinal").value;
    const somenteAuxilio = document.getElementById("filtroAuxilio").checked;

    const filtrado = {};

    for (const mes in state.historico) {
        const h = state.historico[mes];

        if (mesInicial && mes < mesInicial) continue;
        if (mesFinal && mes > mesFinal) continue;
        if (somenteAuxilio && h.auxilio <= 0) continue;

        filtrado[mes] = h;
    }

    document.getElementById("tabelaRelatorioContainer").innerHTML =
        gerarTabelaRelatorio(filtrado);

    setTimeout(() => carregarGraficos(filtrado), 50);
}

// =======================================================
// GRÁFICOS AVANÇADOS
// =======================================================

function carregarGraficos(historico = state.historico) {
    const meses = Object.keys(historico);

    const brutoTotal = meses.map(m => historico[m].brutoTotal);
    const liquidoTotal = meses.map(m => historico[m].liquidoTotal);
    const mensalidadeMedia = meses.map(m => historico[m].mensalidadeMedia);

    const sl = meses.map(m => historico[m].brutoSL);
    const cv = meses.map(m => historico[m].brutoCV);

    // Gráfico 1 — Evolução
    const ctx1 = document.getElementById("graficoEvolucao");
    if (ctx1) {
        new Chart(ctx1, {
            type: "line",
            data: {
                labels: meses,
                datasets: [
                    {
                        label: "Bruto Total",
                        data: brutoTotal,
                        borderColor: "#4CAF50",
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: "Líquido Total",
                        data: liquidoTotal,
                        borderColor: "#2196F3",
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: "Mensalidade Média",
                        data: mensalidadeMedia,
                        borderColor: "#FFC107",
                        fill: false,
                        tension: 0.3
                    }
                ]
            }
        });
    }

    // Gráfico 2 — Comparação SL × CV
    const ctx2 = document.getElementById("graficoComparacao");
    if (ctx2) {
        new Chart(ctx2, {
            type: "bar",
            data: {
                labels: meses,
                datasets: [
                    {
                        label: "Sete Lagoas",
                        data: sl,
                        backgroundColor: "#4CAF50"
                    },
                    {
                        label: "Curvelo",
                        data: cv,
                        backgroundColor: "#2196F3"
                    }
                ]
            }
        });
    }
}

// =======================================================
// ANÁLISES AVANÇADAS AUTOMÁTICAS
// =======================================================

function gerarAnalisesAvancadas(historico) {
    const meses = Object.keys(historico);

    if (meses.length === 0) {
        return `<p>Nenhum dado disponível para análise.</p>`;
    }

    const maiorBruto = meses.reduce((a, b) =>
        historico[a].brutoTotal > historico[b].brutoTotal ? a : b
    );

    const menorBruto = meses.reduce((a, b) =>
        historico[a].brutoTotal < historico[b].brutoTotal ? a : b
    );

    const maiorLiquido = meses.reduce((a, b) =>
        historico[a].liquidoTotal > historico[b].liquidoTotal ? a : b
    );

    const maiorMensalidade = meses.reduce((a, b) =>
        historico[a].mensalidadeMedia > historico[b].mensalidadeMedia ? a : b
    );

    return `
        <p><strong>Mês com maior bruto:</strong> ${maiorBruto} (${formatarMoeda(historico[maiorBruto].brutoTotal)})</p>
        <p><strong>Mês com menor bruto:</strong> ${menorBruto} (${formatarMoeda(historico[menorBruto].brutoTotal)})</p>
        <p><strong>Mês com maior líquido:</strong> ${maiorLiquido} (${formatarMoeda(historico[maiorLiquido].liquidoTotal)})</p>
        <p><strong>Maior mensalidade média:</strong> ${maiorMensalidade} (${formatarMoeda(historico[maiorMensalidade].mensalidadeMedia)})</p>

        <div class="divider"></div>

        <p><strong>Análise geral:</strong></p>
        <p>O sistema detectou variações significativas entre os meses, indicando mudanças no volume de alunos, valores de passagem e impacto do auxílio transporte.</p>
        <p>Essas informações serão usadas para gerar o PDF detalhado na próxima etapa.</p>
    `;
}
// =======================================================
// PARTE 5 — GERADOR DE PDF AVANÇADO E PROFISSIONAL
// =======================================================

function paginaPDF() {
    if (!state.resultado) {
        return `
            <div class="card">
                <h2 class="section-title">Gerar PDF Detalhado</h2>
                <div class="divider"></div>
                <p>Nenhum cálculo encontrado. Vá até "Cadastro e Cálculo" e gere um cálculo primeiro.</p>
            </div>
        `;
    }

    return `
        <div class="card">
            <h2 class="section-title">Gerar PDF Avançado</h2>
            <div class="divider"></div>

            <p>O PDF incluirá:</p>
            <ul>
                <li>Tabelas completas</li>
                <li>Resumo financeiro</li>
                <li>Resumo operacional</li>
                <li>Explicações matemáticas</li>
                <li>Distribuição do auxílio</li>
                <li>Comparação SL × CV</li>
                <li>Análises automáticas</li>
                <li>Detalhamento dos parâmetros de entrada</li>
                <li>Relatório técnico completo</li>
                <li>Página dupla</li>
            </ul>

            <button class="btn-primary" onclick="gerarPdfAvancado()">Gerar PDF Avançado</button>
        </div>
    `;
}

// =======================================================
// FUNÇÃO PRINCIPAL — PDF AVANÇADO
// =======================================================

function gerarPdfAvancado() {
    const r = state.resultado;
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        unit: "pt",
        format: "a4"
    });

    let y = 40;

    // =======================================================
    // CABEÇALHO PROFISSIONAL
    // =======================================================
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Relatório Técnico e Financeiro — Sistema ASSEUF", 40, y);
    y += 30;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Mês de Referência: ${r.mes}`, 40, y);
    y += 15;
    doc.text(`Responsável pelo Cálculo: ${r.responsavel || "Não informado"}`, 40, y);
    y += 25;

    doc.setDrawColor(0);
    doc.line(40, y, 550, y);
    y += 25;

    // =======================================================
    // SEÇÃO 1 — PARÂMETROS DE ENTRADA
    // =======================================================
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("1. Parâmetros de Entrada", 40, y);
    y += 25;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    const tabelaEntrada = [
        ["Campo", "Valor"],
        ["Diárias SL", r.diariasSL],
        ["Diárias CV", r.diariasCV],
        ["Passagem SL", formatarMoeda(r.passagemSL)],
        ["Passagem CV", formatarMoeda(r.passagemCV)],
        ["Auxílio Total", formatarMoeda(r.auxilio)],
        ["Alunos SL", r.alunosSL],
        ["Alunos CV", r.alunosCV],
        ["Desconto (%)", r.desconto + "%"],
        ["Observações", r.observacoes || "Nenhuma"]
    ];

    y = desenharTabela(doc, tabelaEntrada, 40, y);

    y += 20;

    // =======================================================
    // SEÇÃO 2 — CÁLCULOS FINANCEIROS
    // =======================================================
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("2. Cálculos Financeiros", 40, y);
    y += 25;

    const tabelaFinanceira = [
        ["Descrição", "Valor"],
        ["Bruto SL", formatarMoeda(r.brutoSL)],
        ["Bruto CV", formatarMoeda(r.brutoCV)],
        ["Total Bruto", formatarMoeda(r.brutoTotal)],
        ["Auxílio SL (70%)", formatarMoeda(r.auxSL)],
        ["Auxílio CV (30%)", formatarMoeda(r.auxCV)],
        ["Líquido SL", formatarMoeda(r.liquidoSL)],
        ["Líquido CV", formatarMoeda(r.liquidoCV)],
        ["Total Líquido", formatarMoeda(r.liquidoTotal)],
        ["Total de Alunos", r.totalAlunos],
        ["Mensalidade Média", formatarMoeda(r.mensalidadeMedia)]
    ];

    y = desenharTabela(doc, tabelaFinanceira, 40, y);

    y += 20;

    // =======================================================
    // SEÇÃO 3 — EXPLICAÇÕES MATEMÁTICAS
    // =======================================================
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("3. Explicações Matemáticas", 40, y);
    y += 25;

    const explicacoes = [
        "Bruto SL = Diárias SL × Valor da Passagem SL",
        "Bruto CV = Diárias CV × Valor da Passagem CV",
        "Total Bruto = Bruto SL + Bruto CV",
        "AuxSL = Auxílio Total × 0.70",
        "AuxCV = Auxílio Total × 0.30",
        "Líquido SL = Bruto SL – AuxSL",
        "Líquido CV = Bruto CV – AuxCV",
        "Total Líquido = Líquido SL + Líquido CV",
        "Mensalidade Média = Total Líquido ÷ Total de Alunos"
    ];

    explicacoes.forEach(eq => {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(12);
        doc.text("• " + eq, 40, y);
        y += 18;
    });

    y += 20;

    // =======================================================
    // SEÇÃO 4 — ANÁLISES AUTOMÁTICAS
    // =======================================================
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("4. Análises Automáticas", 40, y);
    y += 25;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    doc.text(`• A rota com maior custo bruto foi: ${r.brutoSL > r.brutoCV ? "Sete Lagoas" : "Curvelo"}`, 40, y);
    y += 18;

    doc.text(`• A rota com maior valor líquido foi: ${r.liquidoSL > r.liquidoCV ? "Sete Lagoas" : "Curvelo"}`, 40, y);
    y += 18;

    doc.text(`• A mensalidade média indica um custo por aluno de ${formatarMoeda(r.mensalidadeMedia)}`, 40, y);
    y += 18;

    doc.text(`• O desconto aplicado reduziu o valor bruto total em ${r.desconto}%`, 40, y);
    y += 18;

    y += 20;

    // =======================================================
    // SEÇÃO 5 — TABELA COMPARATIVA SL × CV
    // =======================================================
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("5. Comparação SL × CV", 40, y);
    y += 25;

    const tabelaComparativa = [
        ["Indicador", "Sete Lagoas", "Curvelo"],
        ["Bruto", formatarMoeda(r.brutoSL), formatarMoeda(r.brutoCV)],
        ["Auxílio", formatarMoeda(r.auxSL), formatarMoeda(r.auxCV)],
        ["Líquido", formatarMoeda(r.liquidoSL), formatarMoeda(r.liquidoCV)],
        ["Alunos", r.alunosSL, r.alunosCV]
    ];

    y = desenharTabela3Col(doc, tabelaComparativa, 40, y);

    y += 20;

    // =======================================================
    // RODAPÉ
    // =======================================================
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(10);
    doc.text("Relatório gerado automaticamente pelo Sistema ASSEUF — Versão Avançada", 40, 800);

    doc.save(`relatorio_avancado_${r.mes}.pdf`);
}

// =======================================================
// FUNÇÕES AUXILIARES PARA TABELAS NO PDF
// =======================================================

function desenharTabela(doc, tabela, x, y) {
    const col1 = x;
    const col2 = x + 250;

    tabela.forEach((linha, i) => {
        doc.setFont("Helvetica", i === 0 ? "bold" : "normal");
        doc.text(linha[0], col1, y);
        doc.text(String(linha[1]), col2, y);
        y += 18;
    });

    return y;
}

function desenharTabela3Col(doc, tabela, x, y) {
    const col1 = x;
    const col2 = x + 200;
    const col3 = x + 350;

    tabela.forEach((linha, i) => {
        doc.setFont("Helvetica", i === 0 ? "bold" : "normal");
        doc.text(linha[0], col1, y);
        doc.text(String(linha[1]), col2, y);
        doc.text(String(linha[2]), col3, y);
        y += 18;
    });

    return y;
}
// =======================================================
// PARTE 6 — INICIALIZAÇÃO AVANÇADA DO SISTEMA
// =======================================================

/**
 * Inicialização principal do sistema.
 * Carrega a página inicial, prepara gráficos, garante que o DOM está pronto
 * e ativa futuras expansões (tema, módulos, animações, etc.).
 */
document.addEventListener("DOMContentLoaded", () => {
    try {
        console.log("Sistema ASSEUF — Versão Avançada iniciado.");
        render();

        // Carrega gráficos se a página inicial tiver dashboard
        if (state.paginaAtual === "relatorios") {
            setTimeout(() => carregarGraficos(), 100);
        }

        // Ganchos para futuras expansões
        inicializarTema();
        inicializarAtalhosTeclado();
        inicializarMonitoramento();

    } catch (erro) {
        console.error("Erro ao iniciar o sistema:", erro);
        alert("Ocorreu um erro ao carregar o sistema. Verifique o console.");
    }
});

// =======================================================
// FUNÇÕES DE SUPORTE PARA EXPANSÕES FUTURAS
// =======================================================

/**
 * Alternância de tema (dark/light) — preparado para expansão futura.
 */
function inicializarTema() {
    // No futuro: permitir alternar entre tema claro e escuro
    // Por enquanto, mantém o tema dark padrão
    document.body.classList.add("tema-dark");
}

/**
 * Atalhos de teclado globais.
 * Exemplo:
 *  - CTRL + 1 → Página inicial
 *  - CTRL + 2 → Cálculo
 *  - CTRL + 3 → Relatórios
 *  - CTRL + 4 → PDF
 */
function inicializarAtalhosTeclado() {
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey) {
            switch (e.key) {
                case "1":
                    navegarPara("inicio");
                    break;
                case "2":
                    navegarPara("calculo");
                    break;
                case "3":
                    navegarPara("relatorios");
                    break;
                case "4":
                    navegarPara("pdf");
                    break;
            }
        }
    });
}

/**
 * Monitoramento básico do sistema.
 * Pode ser expandido para logs, auditoria, estatísticas, etc.
 */
function inicializarMonitoramento() {
    console.log("Monitoramento ativo: histórico carregado =", Object.keys(state.historico).length);
}