// ======================================================================
// SISTEMA ASSEUF — VERSÃO ULTRA AVANÇADA
// Núcleo, modelos, utilitários e engine de cálculo
// ======================================================================

// ----------------------------------------------------------------------
// CONFIGURAÇÃO GLOBAL DO SISTEMA
// ----------------------------------------------------------------------
const CONFIG = {
    nomeSistema: "ASSEUF — Sistema Avançado de Gestão de Rotas e Alunos",
    versao: "3.0",
    moeda: "R$",
    formatoData: "pt-BR",
    auxilioPercentualSL: 70,
    auxilioPercentualCV: 30,
    limiteDescontoGlobal: 100,
    limiteDescontoIndividual: 100,
    temaPadrao: "dark",
    armazenamentoChaveHistorico: "asseuf_historico_v3",
    armazenamentoChavePreferencias: "asseuf_prefs_v3"
};

// ----------------------------------------------------------------------
// ESTADO GLOBAL
// ----------------------------------------------------------------------
const state = {
    paginaAtual: "inicio",
    historico: carregarHistorico(),
    preferencias: carregarPreferencias(),
    ultimoResultado: null,
    contextoAnalise: null
};

// ----------------------------------------------------------------------
// MODELOS DE DADOS (CONCEITUAIS)
// ----------------------------------------------------------------------
//
// Rota:
//  {
//      id: string,
//      nome: "Sete Lagoas" | "Curvelo" | outro,
//      diarias: number,
//      valorPassagem: number,
//      numeroVeiculos: number,
//      custoFixoMensal: number,
//      alunosSemDesconto: number,
//      alunosComDesconto: number,
//      percentualDescontoAlunos: number,
//      observacoes: string
//  }
//
// ParametrosCalculo:
//  {
//      mes: "2025-02",
//      responsavel: string,
//      descricaoCalculo: string,
//      observacoesGerais: string,
//      rotas: Rota[],
//      auxilioTotal: number,
//      descontoGlobalPercentual: number,
//      observacoesDescontos: string
//  }
//
// ResultadoCalculo:
//  {
//      idCalculo: string,
//      mes: string,
//      responsavel: string,
//      descricaoCalculo: string,
//      observacoesGerais: string,
//      rotas: ResultadoRota[],
//      auxilioTotal: number,
//      descontoGlobalPercentual: number,
//      descontoGlobalValor: number,
//      brutoTotal: number,
//      brutoAposDescontoGlobal: number,
//      liquidoTotalAntesGlobal: number,
//      liquidoTotal: number,
//      totalAlunos: number,
//      mensalidadeMediaGeral: number,
//      observacoesDescontos: string,
//      dataRegistro: string,
//      parametrosOriginais: ParametrosCalculo
//  }
//
// ResultadoRota:
//  {
//      idRota: string,
//      nome: string,
//      diarias: number,
//      valorPassagem: number,
//      numeroVeiculos: number,
//      custoFixoMensal: number,
//      alunosSemDesconto: number,
//      alunosComDesconto: number,
//      alunosTotal: number,
//      percentualDescontoAlunos: number,
//      bruto: number,
//      auxilioAplicado: number,
//      mensalidadeBase: number,
//      descontoIndividualTotal: number,
//      liquidoAntesGlobal: number,
//      liquidoFinal: number,
//      custoPorAluno: number,
//      observacoes: string
//  }

// ----------------------------------------------------------------------
// UTILITÁRIOS GERAIS
// ----------------------------------------------------------------------

function gerarId(prefixo = "ID") {
    return `${prefixo}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

function formatarMoeda(valor) {
    if (isNaN(valor) || valor === null) return `${CONFIG.moeda} 0,00`;
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarNumero(valor, casas = 2) {
    if (isNaN(valor) || valor === null) return "0";
    return valor.toFixed(casas).replace(".", ",");
}

function formatarDataHora(data = new Date()) {
    return data.toLocaleString(CONFIG.formatoData);
}

function clamp(valor, min, max) {
    return Math.min(Math.max(valor, min), max);
}

// ----------------------------------------------------------------------
// ARMAZENAMENTO LOCAL (HISTÓRICO + PREFERÊNCIAS)
// ----------------------------------------------------------------------

function carregarHistorico() {
    try {
        const bruto = localStorage.getItem(CONFIG.armazenamentoChaveHistorico);
        if (!bruto) return {};
        const parsed = JSON.parse(bruto);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
        console.error("Erro ao carregar histórico:", e);
        return {};
    }
}

function salvarHistorico() {
    try {
        localStorage.setItem(
            CONFIG.armazenamentoChaveHistorico,
            JSON.stringify(state.historico)
        );
    } catch (e) {
        console.error("Erro ao salvar histórico:", e);
    }
}

function carregarPreferencias() {
    try {
        const bruto = localStorage.getItem(CONFIG.armazenamentoChavePreferencias);
        if (!bruto) {
            return {
                tema: CONFIG.temaPadrao,
                mostrarTooltips: true
            };
        }
        const parsed = JSON.parse(bruto);
        return parsed && typeof parsed === "object"
            ? parsed
            : { tema: CONFIG.temaPadrao, mostrarTooltips: true };
    } catch (e) {
        console.error("Erro ao carregar preferências:", e);
        return {
            tema: CONFIG.temaPadrao,
            mostrarTooltips: true
        };
    }
}

function salvarPreferencias() {
    try {
        localStorage.setItem(
            CONFIG.armazenamentoChavePreferencias,
            JSON.stringify(state.preferencias)
        );
    } catch (e) {
        console.error("Erro ao salvar preferências:", e);
    }
}

// ----------------------------------------------------------------------
// REGISTRO NO HISTÓRICO (POR MÊS, MAS COM MÚLTIPLOS CÁLCULOS SE QUISER)
// ----------------------------------------------------------------------

/**
 * Estrutura do histórico:
 *  historico[mes] = {
 *      mes,
 *      registros: ResultadoCalculo[],
 *      resumo: {
 *          brutoTotalAcumulado,
 *          liquidoTotalAcumulado,
 *          totalAlunosAcumulado,
 *          mediaMensalidadeGeral,
 *          quantidadeCalculos
 *      }
 *  }
 */
function registrarNoHistorico(resultadoCalculo) {
    const mes = resultadoCalculo.mes;
    if (!state.historico[mes]) {
        state.historico[mes] = {
            mes,
            registros: [],
            resumo: {
                brutoTotalAcumulado: 0,
                liquidoTotalAcumulado: 0,
                totalAlunosAcumulado: 0,
                mediaMensalidadeGeral: 0,
                quantidadeCalculos: 0
            }
        };
    }

    const bloco = state.historico[mes];
    bloco.registros.push(resultadoCalculo);

    // Recalcular resumo
    const brutoTotalAcumulado = bloco.registros.reduce(
        (acc, r) => acc + r.brutoTotal,
        0
    );
    const liquidoTotalAcumulado = bloco.registros.reduce(
        (acc, r) => acc + r.liquidoTotal,
        0
    );
    const totalAlunosAcumulado = bloco.registros.reduce(
        (acc, r) => acc + r.totalAlunos,
        0
    );
    const mediaMensalidadeGeral =
        totalAlunosAcumulado > 0
            ? liquidoTotalAcumulado / totalAlunosAcumulado
            : 0;

    bloco.resumo = {
        brutoTotalAcumulado,
        liquidoTotalAcumulado,
        totalAlunosAcumulado,
        mediaMensalidadeGeral,
        quantidadeCalculos: bloco.registros.length
    };

    salvarHistorico();
}

// ----------------------------------------------------------------------
// ENGINE DE CÁLCULO — FUNÇÃO PURA QUE RECEBE PARÂMETROS E DEVOLVE RESULTADO
// ----------------------------------------------------------------------

/**
 * @param {ParametrosCalculo} parametros
 * @returns {ResultadoCalculo}
 */
function calcularRotasEngine(parametros) {
    const idCalculo = gerarId("CALC");
    const dataRegistro = formatarDataHora();

    // Auxílio por rota (proporcional fixo SL/CV, mas pode ser expandido)
    const auxTotal = parametros.auxilioTotal || 0;
    const auxSL = auxTotal * (CONFIG.auxilioPercentualSL / 100);
    const auxCV = auxTotal * (CONFIG.auxilioPercentualCV / 100);

    // Distribuir auxílio entre rotas por nome (se existirem SL/CV)
    const rotasResultado = [];
    let brutoTotal = 0;
    let liquidoTotalAntesGlobal = 0;
    let totalAlunosGeral = 0;

    parametros.rotas.forEach((rota) => {
        const idRota = gerarId("ROTA");
        const alunosTotal =
            (rota.alunosSemDesconto || 0) + (rota.alunosComDesconto || 0);

        const bruto = (rota.diarias || 0) * (rota.valorPassagem || 0);
        brutoTotal += bruto;

        const mensalidadeBase =
            alunosTotal > 0 ? bruto / alunosTotal : 0;

        const percDesc = clamp(
            rota.percentualDescontoAlunos || 0,
            0,
            CONFIG.limiteDescontoIndividual
        );

        const descontoIndividualTotal =
            mensalidadeBase * (rota.alunosComDesconto || 0) * (percDesc / 100);

        let auxilioAplicado = 0;
        if (rota.nome.toLowerCase().includes("sete")) {
            auxilioAplicado = auxSL;
        } else if (rota.nome.toLowerCase().includes("curvelo")) {
            auxilioAplicado = auxCV;
        } else {
            // se no futuro tiver outras rotas, pode-se distribuir proporcionalmente
            auxilioAplicado = 0;
        }

        const custoFixo = rota.custoFixoMensal || 0;

        const liquidoAntesGlobal =
            bruto - auxilioAplicado - descontoIndividualTotal - custoFixo;

        liquidoTotalAntesGlobal += liquidoAntesGlobal;
        totalAlunosGeral += alunosTotal;

        const custoPorAluno =
            alunosTotal > 0 ? liquidoAntesGlobal / alunosTotal : 0;

        rotasResultado.push({
            idRota,
            nome: rota.nome,
            diarias: rota.diarias,
            valorPassagem: rota.valorPassagem,
            numeroVeiculos: rota.numeroVeiculos,
            custoFixoMensal: custoFixo,
            alunosSemDesconto: rota.alunosSemDesconto,
            alunosComDesconto: rota.alunosComDesconto,
            alunosTotal,
            percentualDescontoAlunos: percDesc,
            bruto,
            auxilioAplicado,
            mensalidadeBase,
            descontoIndividualTotal,
            liquidoAntesGlobal,
            liquidoFinal: 0, // será ajustado depois do desconto global
            custoPorAluno,
            observacoes: rota.observacoes || ""
        });
    });

    // Desconto global
    const descontoGlobalPercentual = clamp(
        parametros.descontoGlobalPercentual || 0,
        0,
        CONFIG.limiteDescontoGlobal
    );
    const descontoGlobalValor = brutoTotal * (descontoGlobalPercentual / 100);
    const brutoAposDescontoGlobal = brutoTotal - descontoGlobalValor;

    // Aplicar desconto global como abatimento adicional proporcional ao bruto de cada rota
    const liquidoTotalFinal =
        liquidoTotalAntesGlobal - descontoGlobalValor;

    // Ajustar liquidoFinal de cada rota proporcionalmente
    rotasResultado.forEach((rr) => {
        const proporcaoBruto =
            brutoTotal > 0 ? rr.bruto / brutoTotal : 0;
        const abatimentoGlobalRota = descontoGlobalValor * proporcaoBruto;
        rr.liquidoFinal = rr.liquidoAntesGlobal - abatimentoGlobalRota;
    });

    const mensalidadeMediaGeral =
        totalAlunosGeral > 0 ? liquidoTotalFinal / totalAlunosGeral : 0;

    const resultado = {
        idCalculo,
        mes: parametros.mes,
        responsavel: parametros.responsavel || "",
        descricaoCalculo: parametros.descricaoCalculo || "",
        observacoesGerais: parametros.observacoesGerais || "",
        rotas: rotasResultado,
        auxilioTotal: auxTotal,
        descontoGlobalPercentual,
        descontoGlobalValor,
        brutoTotal,
        brutoAposDescontoGlobal,
        liquidoTotalAntesGlobal,
        liquidoTotal: liquidoTotalFinal,
        totalAlunos: totalAlunosGeral,
        mensalidadeMediaGeral,
        observacoesDescontos: parametros.observacoesDescontos || "",
        dataRegistro,
        parametrosOriginais: parametros
    };

    return resultado;
}
// ======================================================================
// PARTE 2 — LAYOUT PRINCIPAL, NAVEGAÇÃO E PÁGINA INICIAL PREMIUM
// ======================================================================

// ----------------------------------------------------------------------
// RENDERIZAÇÃO PRINCIPAL
// ----------------------------------------------------------------------

function navegarPara(pagina) {
    state.paginaAtual = pagina;
    render();
}

document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-page]");
    if (btn) {
        const pagina = btn.getAttribute("data-page");
        navegarPara(pagina);
    }
});

function render() {
    const app = document.getElementById("app");
    if (!app) return;

    app.innerHTML = `
        ${layoutShellTopo()}
        <main class="app-main">
            ${renderPaginaAtual()}
        </main>
    `;

    aplicarTemaAtual();
}

// ----------------------------------------------------------------------
// LAYOUT SHELL (HEADER + NAV)
// ----------------------------------------------------------------------

function layoutShellTopo() {
    return `
        <style>
            body {
                margin: 0;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                background: #111;
                color: #f5f5f5;
            }

            .app-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 24px;
                background: linear-gradient(90deg, #111, #1f1f1f);
                border-bottom: 1px solid #333;
                position: sticky;
                top: 0;
                z-index: 50;
            }

            .app-title-block {
                display: flex;
                flex-direction: column;
            }

            .app-title {
                font-size: 20px;
                font-weight: 700;
                letter-spacing: 0.04em;
            }

            .app-subtitle {
                font-size: 12px;
                opacity: 0.7;
            }

            .app-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 999px;
                background: rgba(76, 175, 80, 0.12);
                color: #a5d6a7;
                font-size: 11px;
                margin-top: 6px;
            }

            .app-badge-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #4CAF50;
                box-shadow: 0 0 6px #4CAF50;
            }

            .app-nav {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .nav-btn {
                border: none;
                padding: 8px 14px;
                border-radius: 999px;
                background: #1f1f1f;
                color: #f5f5f5;
                font-size: 13px;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                transition: background .2s, transform .15s, box-shadow .15s;
            }

            .nav-btn span.icon {
                font-size: 14px;
            }

            .nav-btn.active {
                background: #4CAF50;
                color: #111;
                box-shadow: 0 0 12px rgba(76, 175, 80, 0.6);
            }

            .nav-btn:hover {
                background: #333;
                transform: translateY(-1px);
            }

            .nav-btn.active:hover {
                background: #43A047;
            }

            .nav-btn-secondary {
                background: #222;
                border: 1px solid #444;
            }

            .app-main {
                max-width: 1100px;
                margin: 24px auto 40px auto;
                padding: 0 16px;
            }

            .card {
                background: #181818;
                border-radius: 14px;
                padding: 20px 22px;
                box-shadow: 0 0 18px rgba(0,0,0,0.6);
                border: 1px solid #2a2a2a;
            }

            .section-title {
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 4px 0;
            }

            .section-subtitle {
                font-size: 13px;
                opacity: 0.75;
                margin-bottom: 12px;
            }

            .divider {
                height: 1px;
                background: linear-gradient(90deg, #444, #222);
                margin: 10px 0 18px 0;
            }

            .btn-primary {
                border: none;
                padding: 10px 18px;
                border-radius: 999px;
                background: linear-gradient(90deg, #4CAF50, #66BB6A);
                color: #111;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 0 12px rgba(76, 175, 80, 0.6);
                transition: transform .15s, box-shadow .15s, filter .15s;
            }

            .btn-primary:hover {
                transform: translateY(-1px);
                filter: brightness(1.05);
                box-shadow: 0 0 16px rgba(76, 175, 80, 0.8);
            }

            .btn-ghost {
                border-radius: 999px;
                border: 1px solid #444;
                background: transparent;
                color: #f5f5f5;
                padding: 8px 14px;
                font-size: 13px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: background .15s, border-color .15s;
            }

            .btn-ghost:hover {
                background: #222;
                border-color: #666;
            }

            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 16px;
                margin-top: 10px;
            }

            .dash-card {
                background: #1d1d1d;
                border-radius: 12px;
                padding: 14px 16px;
                border: 1px solid #2b2b2b;
                display: flex;
                flex-direction: column;
                gap: 4px;
                transition: transform .15s, box-shadow .15s, border-color .15s;
            }

            .dash-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 0 16px rgba(0,0,0,0.7);
                border-color: #3a3a3a;
            }

            .dash-label {
                font-size: 12px;
                opacity: 0.7;
            }

            .dash-value {
                font-size: 20px;
                font-weight: 600;
            }

            .dash-footer {
                font-size: 11px;
                opacity: 0.7;
            }
        </style>

        <header class="app-header">
            <div class="app-title-block">
                <div class="app-title">${CONFIG.nomeSistema}</div>
                <div class="app-subtitle">Versão ${CONFIG.versao} — Gestão completa de rotas, alunos, custos e relatórios</div>
                <div class="app-badge">
                    <span class="app-badge-dot"></span>
                    Engine de cálculo avançada ativa
                </div>
            </div>

            <nav class="app-nav">
                ${botaoNav("inicio", "Início", "🏠")}
                ${botaoNav("calculo", "Cadastro & Cálculo", "🧮")}
                ${botaoNav("relatorios", "Relatórios", "📊")}
                ${botaoNav("pdf", "PDF Detalhado", "📄")}
                ${botaoNav("config", "Configurações", "⚙️", true)}
            </nav>
        </header>
    `;
}

function botaoNav(pagina, rotulo, icone, secundario = false) {
    const ativa = state.paginaAtual === pagina;
    const classes = [
        "nav-btn",
        secundario ? "nav-btn-secondary" : "",
        ativa ? "active" : ""
    ]
        .filter(Boolean)
        .join(" ");

    return `
        <button class="${classes}" data-page="${pagina}">
            <span class="icon">${icone}</span>
            <span>${rotulo}</span>
        </button>
    `;
}

// ----------------------------------------------------------------------
// RENDERIZAÇÃO DA PÁGINA ATUAL
// ----------------------------------------------------------------------

function renderPaginaAtual() {
    switch (state.paginaAtual) {
        case "inicio":
            return paginaInicioPremium();
        case "calculo":
            return paginaCalculoPremium();   // ← AQUI ESTÁ A TROCA IMPORTANTE
        case "relatorios":
            return paginaRelatorios();
        case "pdf":
            return paginaPDF();
        case "config":
            return paginaConfigPlaceholder();
        default:
            return `<p>Erro ao carregar página.</p>`;
    }
}

// ----------------------------------------------------------------------
// PÁGINA INICIAL PREMIUM
// ----------------------------------------------------------------------

function paginaInicioPremium() {
    const meses = Object.keys(state.historico);
    const totalMeses = meses.length;

    let brutoAcum = 0;
    let liquidoAcum = 0;
    let alunosAcum = 0;

    meses.forEach((m) => {
        const bloco = state.historico[m];
        brutoAcum += bloco.resumo.brutoTotalAcumulado;
        liquidoAcum += bloco.resumo.liquidoTotalAcumulado;
        alunosAcum += bloco.resumo.totalAlunosAcumulado;
    });

    const mediaMensalidadeGeral =
        alunosAcum > 0 ? liquidoAcum / alunosAcum : 0;

    return `
        <div class="card">
            <h2 class="section-title">Painel Geral</h2>
            <p class="section-subtitle">
                Visão consolidada das rotas, alunos, custos e resultados financeiros.
            </p>
            <div class="divider"></div>

            <div class="dashboard-grid">
                <div class="dash-card">
                    <div class="dash-label">Meses com registros</div>
                    <div class="dash-value">${totalMeses}</div>
                </div>

                <div class="dash-card">
                    <div class="dash-label">Bruto acumulado</div>
                    <div class="dash-value">${formatarMoeda(brutoAcum)}</div>
                </div>

                <div class="dash-card">
                    <div class="dash-label">Líquido acumulado</div>
                    <div class="dash-value">${formatarMoeda(liquidoAcum)}</div>
                </div>

                <div class="dash-card">
                    <div class="dash-label">Alunos totais</div>
                    <div class="dash-value">${alunosAcum}</div>
                </div>
            </div>

            <div style="margin-top:22px; display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
                <button class="btn-primary" data-page="calculo">
                    <span>🧮</span>
                    <span>Novo cálculo detalhado</span>
                </button>

                <button class="btn-ghost" data-page="relatorios">
                    <span>📊</span>
                    <span>Ver relatórios avançados</span>
                </button>

                <button class="btn-ghost" data-page="pdf">
                    <span>📄</span>
                    <span>Gerar PDF do último cálculo</span>
                </button>
            </div>
        </div>
    `;
}

// ----------------------------------------------------------------------
// PLACEHOLDERS (apenas para Configurações)
// ----------------------------------------------------------------------

function paginaConfigPlaceholder() {
    return `
        <div class="card">
            <h2 class="section-title">Configurações</h2>
            <p class="section-subtitle">
                Preferências do sistema.
            </p>
            <div class="divider"></div>
            <p>Configurações avançadas virão na Parte 7.</p>
        </div>
    `;
}

// ----------------------------------------------------------------------
// APLICAÇÃO DE TEMA
// ----------------------------------------------------------------------

function aplicarTemaAtual() {
    const tema = state.preferencias.tema || CONFIG.temaPadrao;
    document.body.dataset.tema = tema;
}}
// ======================================================================
// PARTE 3.1 — UI PREMIUM DO CADASTRO & CÁLCULO
// ======================================================================

// Esta parte cria:
// - Seções colapsáveis
// - Botões premium
// - Layout avançado
// - Estrutura completa das rotas
// - Campos visuais (sem lógica ainda)
// - Tooltips
// - Animações
// - Cards profissionais
// - Base para cálculos da Parte 3.2 e 3.3

// ----------------------------------------------------------------------
// PÁGINA DE CADASTRO & CÁLCULO (UI COMPLETA)
// ----------------------------------------------------------------------

function paginaCalculoPremium() {
    return `
        <style>
            /* ----------------------------------------------------------
               ESTILO GERAL DA TELA DE CADASTRO PREMIUM
            ---------------------------------------------------------- */

            .calc-container {
                display: flex;
                flex-direction: column;
                gap: 26px;
            }

            .section-card {
                background: #181818;
                border-radius: 16px;
                padding: 22px 24px;
                border: 1px solid #2a2a2a;
                box-shadow: 0 0 18px rgba(0,0,0,0.6);
                transition: transform .2s, box-shadow .2s;
            }

            .section-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 0 22px rgba(0,0,0,0.75);
            }

            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
            }

            .section-title {
                font-size: 18px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .section-icon {
                font-size: 20px;
            }

            .collapse-btn {
                background: #222;
                border: 1px solid #444;
                border-radius: 999px;
                padding: 6px 12px;
                font-size: 12px;
                cursor: pointer;
                transition: background .2s, transform .2s;
            }

            .collapse-btn:hover {
                background: #333;
                transform: translateY(-1px);
            }

            .section-body {
                margin-top: 18px;
                display: none;
                animation: fadeIn .3s ease forwards;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .form-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                gap: 18px;
            }

            .input-block {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .input-block label {
                font-size: 13px;
                font-weight: 600;
                opacity: 0.85;
            }

            .input-block input {
                background: #222;
                border: 1px solid #333;
                padding: 10px 12px;
                border-radius: 10px;
                color: #f5f5f5;
                font-size: 14px;
                transition: border-color .2s, background .2s;
            }

            .input-block input:focus {
                border-color: #4CAF50;
                background: #1b1b1b;
                outline: none;
            }

            .tooltip {
                font-size: 11px;
                opacity: 0.6;
            }

            .btn-calc {
                margin-top: 20px;
                padding: 12px 20px;
                border-radius: 999px;
                border: none;
                background: linear-gradient(90deg, #4CAF50, #66BB6A);
                color: #111;
                font-weight: 700;
                font-size: 15px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 0 14px rgba(76, 175, 80, 0.6);
                transition: transform .2s, box-shadow .2s;
            }

            .btn-calc:hover {
                transform: translateY(-2px);
                box-shadow: 0 0 20px rgba(76, 175, 80, 0.8);
            }

            .rota-tag {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 999px;
                font-size: 11px;
                background: rgba(76, 175, 80, 0.12);
                color: #A5D6A7;
            }

            .divider {
                height: 1px;
                background: linear-gradient(90deg, #444, #222);
                margin: 14px 0;
            }
        </style>

        <div class="calc-container">

            <!-- =======================================================
                 SEÇÃO 1 — IDENTIFICAÇÃO GERAL
            ======================================================= -->
            <div class="section-card">
                <div class="section-header" onclick="toggleSection(this)">
                    <div class="section-title">
                        <span class="section-icon">🧾</span>
                        Identificação Geral
                    </div>
                    <button class="collapse-btn">Expandir</button>
                </div>

                <div class="section-body">
                    <div class="form-grid">
                        <div class="input-block">
                            <label>Mês de Referência</label>
                            <input id="mesRef" type="month">
                            <div class="tooltip">Escolha o mês do cálculo</div>
                        </div>

                        <div class="input-block">
                            <label>Responsável pelo Cálculo</label>
                            <input id="responsavel" type="text" placeholder="Ex: Taylor Santos">
                        </div>

                        <div class="input-block">
                            <label>Descrição do Cálculo</label>
                            <input id="descricaoCalculo" type="text" placeholder="Ex: Rotas regulares do mês">
                        </div>

                        <div class="input-block">
                            <label>Observações Gerais</label>
                            <input id="obsGerais" type="text" placeholder="Ex: reajuste de passagem, feriados...">
                        </div>
                    </div>
                </div>
            </div>

            <!-- =======================================================
                 SEÇÃO 2 — ROTA SETE LAGOAS
            ======================================================= -->
            <div class="section-card">
                <div class="section-header" onclick="toggleSection(this)">
                    <div class="section-title">
                        <span class="section-icon">🚌</span>
                        Rota — Sete Lagoas
                        <span class="rota-tag">SL</span>
                    </div>
                    <button class="collapse-btn">Expandir</button>
                </div>

                <div class="section-body">
                    <h4>Dados Operacionais</h4>
                    <div class="form-grid">
                        <div class="input-block">
                            <label>Diárias SL</label>
                            <input id="sl_diarias" type="number" min="0">
                        </div>

                        <div class="input-block">
                            <label>Valor da Passagem SL</label>
                            <input id="sl_passagem" type="number" min="0" step="0.01">
                        </div>

                        <div class="input-block">
                            <label>Número de Veículos SL</label>
                            <input id="sl_veiculos" type="number" min="0">
                        </div>

                        <div class="input-block">
                            <label>Custo Fixo Mensal SL</label>
                            <input id="sl_custoFixo" type="number" min="0" step="0.01">
                        </div>
                    </div>

                    <div class="divider"></div>

                    <h4>Alunos — SL</h4>
                    <div class="form-grid">
                        <div class="input-block">
                            <label>Alunos sem desconto</label>
                            <input id="sl_semDesc" type="number" min="0">
                        </div>

                        <div class="input-block">
                            <label>Alunos com desconto</label>
                            <input id="sl_comDesc" type="number" min="0">
                        </div>

                        <div class="input-block">
                            <label>Percentual de desconto (%)</label>
                            <input id="sl_percDesc" type="number" min="0" max="100">
                        </div>

                        <div class="input-block">
                            <label>Observações SL</label>
                            <input id="sl_obs" type="text">
                        </div>
                    </div>
                </div>
            </div>

            <!-- =======================================================
                 SEÇÃO 3 — ROTA CURVELO
            ======================================================= -->
            <div class="section-card">
                <div class="section-header" onclick="toggleSection(this)">
                    <div class="section-title">
                        <span class="section-icon">🚌</span>
                        Rota — Curvelo
                        <span class="rota-tag">CV</span>
                    </div>
                    <button class="collapse-btn">Expandir</button>
                </div>

                <div class="section-body">
                    <h4>Dados Operacionais</h4>
                    <div class="form-grid">
                        <div class="input-block">
                            <label>Diárias CV</label>
                            <input id="cv_diarias" type="number" min="0">
                        </div>

                        <div class="input-block">
                            <label>Valor da Passagem CV</label>
                            <input id="cv_passagem" type="number" min="0" step="0.01">
                        </div>

                        <div class="input-block">
                            <label>Número de Veículos CV</label>
                            <input id="cv_veiculos" type="number" min="0">
                        </div>

                        <div class="input-block">
                            <label>Custo Fixo Mensal CV</label>
                            <input id="cv_custoFixo" type="number" min="0" step="0.01">
                        </div>
                    </div>

                    <div class="divider"></div>

                    <h4>Alunos — CV</h4>
                    <div class="form-grid">
                        <div class="input-block">
                            <label>Alunos sem desconto</label>
                            <input id="cv_semDesc" type="number" min="0">
                        </div>

                        <div class="input-block">
                            <label>Alunos com desconto</label>
                            <input id="cv_comDesc" type="number" min="0">
                        </div>

                        <div class="input-block">
                            <label>Percentual de desconto (%)</label>
                            <input id="cv_percDesc" type="number" min="0" max="100">
                        </div>

                        <div class="input-block">
                            <label>Observações CV</label>
                            <input id="cv_obs" type="text">
                        </div>
                    </div>
                </div>
            </div>

            <!-- =======================================================
                 SEÇÃO 4 — AUXÍLIO E DESCONTOS GERAIS
            ======================================================= -->
            <div class="section-card">
                <div class="section-header" onclick="toggleSection(this)">
                    <div class="section-title">
                        <span class="section-icon">💰</span>
                        Auxílio Transporte & Descontos Globais
                    </div>
                    <button class="collapse-btn">Expandir</button>
                </div>

                <div class="section-body">
                    <div class="form-grid">
                        <div class="input-block">
                            <label>Auxílio Total</label>
                            <input id="aux_total" type="number" min="0" step="0.01">
                            <div class="tooltip">Distribuição automática: 70% SL / 30% CV</div>
                        </div>

                        <div class="input-block">
                            <label>Desconto Global (%)</label>
                            <input id="desc_global" type="number" min="0" max="100">
                        </div>

                        <div class="input-block">
                            <label>Observações de Descontos</label>
                            <input id="obs_desc" type="text">
                        </div>
                    </div>
                </div>
            </div>

            <!-- =======================================================
                 BOTÃO FINAL
            ======================================================= -->
            <button class="btn-calc" onclick="calcularRotasParte32()">
                <span>🧮</span>
                <span>Gerar Cálculo Ultra Detalhado</span>
            </button>

        </div>
    `;
}

// ----------------------------------------------------------------------
// FUNÇÃO PARA EXPANDIR/RECOLHER SEÇÕES
// ----------------------------------------------------------------------

function toggleSection(header) {
    const body = header.parentElement.querySelector(".section-body");
    const btn = header.querySelector(".collapse-btn");

    if (body.style.display === "block") {
        body.style.display = "none";
        btn.textContent = "Expandir";
    } else {
        body.style.display = "block";
        btn.textContent = "Recolher";
    }
}

// ----------------------------------------------------------------------
// PLACEHOLDER DA FUNÇÃO DE CÁLCULO (PARTE 3.2 VAI SUBSTITUIR)
// ----------------------------------------------------------------------

function calcularRotasParte32() {
    alert("A PARTE 3.2 vai ativar os cálculos avançados.");
}
// ======================================================================
// PARTE 3.2 — CAPTURA DE DADOS, VALIDAÇÕES E MONTAGEM DAS ROTAS
// ======================================================================
//
// Esta parte transforma a UI da Parte 3.1 em um sistema funcional,
// capturando todos os campos e montando um objeto de parâmetros
// COMPLETO, pronto para ser enviado à engine de cálculo da Parte 3.3.
//
// ======================================================================


// ----------------------------------------------------------------------
// FUNÇÃO PRINCIPAL — CAPTURAR DADOS E VALIDAR
// ----------------------------------------------------------------------

function calcularRotasParte32() {
    // --------------------------------------------------------------
    // 1. CAPTURA DOS CAMPOS GERAIS
    // --------------------------------------------------------------
    const mes = document.getElementById("mesRef").value;
    const responsavel = document.getElementById("responsavel").value.trim();
    const descricaoCalculo = document.getElementById("descricaoCalculo").value.trim();
    const obsGerais = document.getElementById("obsGerais").value.trim();

    // Validação mínima
    if (!mes) {
        alert("Selecione o mês de referência.");
        return;
    }

    if (!responsavel) {
        alert("Informe o responsável pelo cálculo.");
        return;
    }

    // --------------------------------------------------------------
    // 2. CAPTURA DA ROTA SETE LAGOAS
    // --------------------------------------------------------------
    const sl = {
        nome: "Sete Lagoas",
        diarias: Number(document.getElementById("sl_diarias").value),
        valorPassagem: Number(document.getElementById("sl_passagem").value),
        numeroVeiculos: Number(document.getElementById("sl_veiculos").value),
        custoFixoMensal: Number(document.getElementById("sl_custoFixo").value),
        alunosSemDesconto: Number(document.getElementById("sl_semDesc").value),
        alunosComDesconto: Number(document.getElementById("sl_comDesc").value),
        percentualDescontoAlunos: Number(document.getElementById("sl_percDesc").value),
        observacoes: document.getElementById("sl_obs").value.trim()
    };

    // Validações SL
    if (sl.diarias < 0 || sl.valorPassagem < 0) {
        alert("Valores inválidos na rota Sete Lagoas.");
        return;
    }

    // --------------------------------------------------------------
    // 3. CAPTURA DA ROTA CURVELO
    // --------------------------------------------------------------
    const cv = {
        nome: "Curvelo",
        diarias: Number(document.getElementById("cv_diarias").value),
        valorPassagem: Number(document.getElementById("cv_passagem").value),
        numeroVeiculos: Number(document.getElementById("cv_veiculos").value),
        custoFixoMensal: Number(document.getElementById("cv_custoFixo").value),
        alunosSemDesconto: Number(document.getElementById("cv_semDesc").value),
        alunosComDesconto: Number(document.getElementById("cv_comDesc").value),
        percentualDescontoAlunos: Number(document.getElementById("cv_percDesc").value),
        observacoes: document.getElementById("cv_obs").value.trim()
    };

    // Validações CV
    if (cv.diarias < 0 || cv.valorPassagem < 0) {
        alert("Valores inválidos na rota Curvelo.");
        return;
    }

    // --------------------------------------------------------------
    // 4. AUXÍLIO E DESCONTOS GLOBAIS
    // --------------------------------------------------------------
    const auxilioTotal = Number(document.getElementById("aux_total").value);
    const descontoGlobalPercentual = Number(document.getElementById("desc_global").value);
    const observacoesDescontos = document.getElementById("obs_desc").value.trim();

    if (auxilioTotal < 0) {
        alert("O auxílio total não pode ser negativo.");
        return;
    }

    if (descontoGlobalPercentual < 0 || descontoGlobalPercentual > 100) {
        alert("O desconto global deve estar entre 0% e 100%.");
        return;
    }

    // --------------------------------------------------------------
    // 5. MONTAGEM DO OBJETO DE PARÂMETROS COMPLETO
    // --------------------------------------------------------------
    const parametros = {
        mes,
        responsavel,
        descricaoCalculo,
        observacoesGerais: obsGerais,
        rotas: [sl, cv],
        auxilioTotal,
        descontoGlobalPercentual,
        observacoesDescontos
    };

    // --------------------------------------------------------------
    // 6. SALVAR NO STATE PARA A PARTE 3.3 USAR
    // --------------------------------------------------------------
    state.contextoAnalise = parametros;

    // --------------------------------------------------------------
    // 7. CHAMAR A PARTE 3.3 (ENGINE DE CÁLCULO)
    // --------------------------------------------------------------
    calcularRotasParte33(parametros);
}


// ----------------------------------------------------------------------
// PLACEHOLDER DA PARTE 3.3 (SERÁ SUBSTITUÍDA NA PRÓXIMA PARTE)
// ----------------------------------------------------------------------

function calcularRotasParte33(parametros) {
    alert("A PARTE 3.3 vai ativar a engine de cálculo ultra detalhada.");
}
// ======================================================================
// PARTE 3.3 — ENGINE DE CÁLCULO ULTRA DETALHADA + PRÉVIA PREMIUM
// ======================================================================
//
// Esta parte:
// - recebe os parâmetros montados na Parte 3.2
// - executa cálculos profundos por rota, aluno, veículo e diária
// - gera um objeto de resultado COMPLETO
// - salva no histórico
// - exibe uma prévia premium com tabelas e indicadores
//
// ======================================================================


// ----------------------------------------------------------------------
// FUNÇÃO PRINCIPAL — ENGINE DE CÁLCULO COMPLETA
// ----------------------------------------------------------------------

function calcularRotasParte33(parametros) {

    // --------------------------------------------------------------
    // 1. Preparação inicial
    // --------------------------------------------------------------
    const idCalculo = gerarId("CALC");
    const dataRegistro = formatarDataHora();

    const auxTotal = parametros.auxilioTotal || 0;
    const auxSL = auxTotal * 0.70;
    const auxCV = auxTotal * 0.30;

    let brutoTotal = 0;
    let liquidoTotalAntesGlobal = 0;
    let totalAlunosGeral = 0;

    const rotasResultado = [];

    // --------------------------------------------------------------
    // 2. PROCESSAR CADA ROTA
    // --------------------------------------------------------------
    parametros.rotas.forEach((rota) => {

        const idRota = gerarId("ROTA");

        const alunosTotal =
            (rota.alunosSemDesconto || 0) +
            (rota.alunosComDesconto || 0);

        const bruto = (rota.diarias || 0) * (rota.valorPassagem || 0);
        brutoTotal += bruto;

        const mensalidadeBase =
            alunosTotal > 0 ? bruto / alunosTotal : 0;

        const percDesc = clamp(
            rota.percentualDescontoAlunos || 0,
            0,
            100
        );

        const descontoIndividualTotal =
            mensalidadeBase *
            (rota.alunosComDesconto || 0) *
            (percDesc / 100);

        let auxilioAplicado = 0;
        if (rota.nome.toLowerCase().includes("sete")) auxilioAplicado = auxSL;
        if (rota.nome.toLowerCase().includes("curvelo")) auxilioAplicado = auxCV;

        const custoFixo = rota.custoFixoMensal || 0;

        const liquidoAntesGlobal =
            bruto - auxilioAplicado - descontoIndividualTotal - custoFixo;

        liquidoTotalAntesGlobal += liquidoAntesGlobal;
        totalAlunosGeral += alunosTotal;

        const custoPorAluno =
            alunosTotal > 0 ? liquidoAntesGlobal / alunosTotal : 0;

        const custoPorDiaria =
            rota.diarias > 0 ? liquidoAntesGlobal / rota.diarias : 0;

        const custoPorVeiculo =
            rota.numeroVeiculos > 0
                ? liquidoAntesGlobal / rota.numeroVeiculos
                : liquidoAntesGlobal;

        rotasResultado.push({
            idRota,
            nome: rota.nome,
            diarias: rota.diarias,
            valorPassagem: rota.valorPassagem,
            numeroVeiculos: rota.numeroVeiculos,
            custoFixoMensal: custoFixo,
            alunosSemDesconto: rota.alunosSemDesconto,
            alunosComDesconto: rota.alunosComDesconto,
            alunosTotal,
            percentualDescontoAlunos: percDesc,
            bruto,
            auxilioAplicado,
            mensalidadeBase,
            descontoIndividualTotal,
            liquidoAntesGlobal,
            liquidoFinal: 0, // será ajustado após desconto global
            custoPorAluno,
            custoPorDiaria,
            custoPorVeiculo,
            observacoes: rota.observacoes || ""
        });
    });

    // --------------------------------------------------------------
    // 3. DESCONTO GLOBAL
    // --------------------------------------------------------------
    const descontoGlobalPercentual = clamp(
        parametros.descontoGlobalPercentual || 0,
        0,
        100
    );

    const descontoGlobalValor =
        brutoTotal * (descontoGlobalPercentual / 100);

    const brutoAposDescontoGlobal =
        brutoTotal - descontoGlobalValor;

    const liquidoTotalFinal =
        liquidoTotalAntesGlobal - descontoGlobalValor;

    // Ajustar liquidoFinal proporcionalmente ao bruto de cada rota
    rotasResultado.forEach((rr) => {
        const proporcaoBruto =
            brutoTotal > 0 ? rr.bruto / brutoTotal : 0;
        const abatimentoGlobalRota =
            descontoGlobalValor * proporcaoBruto;

        rr.liquidoFinal = rr.liquidoAntesGlobal - abatimentoGlobalRota;
    });

    const mensalidadeMediaGeral =
        totalAlunosGeral > 0
            ? liquidoTotalFinal / totalAlunosGeral
            : 0;

    // --------------------------------------------------------------
    // 4. OBJETO FINAL DO RESULTADO
    // --------------------------------------------------------------
    const resultado = {
        idCalculo,
        mes: parametros.mes,
        responsavel: parametros.responsavel,
        descricaoCalculo: parametros.descricaoCalculo,
        observacoesGerais: parametros.observacoesGerais,
        rotas: rotasResultado,
        auxilioTotal: parametros.auxilioTotal,
        descontoGlobalPercentual,
        descontoGlobalValor,
        brutoTotal,
        brutoAposDescontoGlobal,
        liquidoTotalAntesGlobal,
        liquidoTotal: liquidoTotalFinal,
        totalAlunos: totalAlunosGeral,
        mensalidadeMediaGeral,
        observacoesDescontos: parametros.observacoesDescontos,
        dataRegistro,
        parametrosOriginais: parametros
    };

    // --------------------------------------------------------------
    // 5. SALVAR NO HISTÓRICO
    // --------------------------------------------------------------
    registrarNoHistorico(resultado);

    // --------------------------------------------------------------
    // 6. SALVAR NO STATE
    // --------------------------------------------------------------
    state.ultimoResultado = resultado;

    // --------------------------------------------------------------
    // 7. EXIBIR PRÉVIA PREMIUM
    // --------------------------------------------------------------
    mostrarPreviaCalculoPremium(resultado);
}


// ----------------------------------------------------------------------
// PRÉVIA PREMIUM DO RESULTADO (UI COMPLETA)
// ----------------------------------------------------------------------

function mostrarPreviaCalculoPremium(r) {
    const app = document.getElementById("app");
    if (!app) return;

    app.innerHTML = `
        ${layoutShellTopo()}
        <main class="app-main">
            <div class="card">
                <h2 class="section-title">Resultado Ultra Detalhado</h2>
                <p class="section-subtitle">
                    Cálculo completo por rota, aluno, diária e veículo.
                </p>
                <div class="divider"></div>

                ${blocoResumoGeral(r)}
                ${blocoRotas(r.rotas)}
                ${blocoIndicadores(r)}
                ${blocoBotoesAcoes()}
            </div>
        </main>
    `;
}


// ----------------------------------------------------------------------
// COMPONENTES DA PRÉVIA
// ----------------------------------------------------------------------

function blocoResumoGeral(r) {
    return `
        <h3>Resumo Geral</h3>
        <div class="divider"></div>

        <div class="dashboard-grid">
            <div class="dash-card">
                <div class="dash-label">Bruto Total</div>
                <div class="dash-value">${formatarMoeda(r.brutoTotal)}</div>
            </div>

            <div class="dash-card">
                <div class="dash-label">Líquido Total</div>
                <div class="dash-value">${formatarMoeda(r.liquidoTotal)}</div>
            </div>

            <div class="dash-card">
                <div class="dash-label">Total de Alunos</div>
                <div class="dash-value">${r.totalAlunos}</div>
            </div>

            <div class="dash-card">
                <div class="dash-label">Mensalidade Média Geral</div>
                <div class="dash-value">${formatarMoeda(r.mensalidadeMediaGeral)}</div>
            </div>
        </div>
    `;
}

function blocoRotas(rotas) {
    let html = `
        <h3>Detalhamento por Rota</h3>
        <div class="divider"></div>
    `;

    rotas.forEach((rota) => {
        html += `
            <div class="section-card" style="margin-top:16px;">
                <h4>${rota.nome}</h4>
                <div class="divider"></div>

                <p><strong>Bruto:</strong> ${formatarMoeda(rota.bruto)}</p>
                <p><strong>Auxílio aplicado:</strong> ${formatarMoeda(rota.auxilioAplicado)}</p>
                <p><strong>Desconto individual:</strong> ${formatarMoeda(rota.descontoIndividualTotal)}</p>
                <p><strong>Custo fixo:</strong> ${formatarMoeda(rota.custoFixoMensal)}</p>
                <p><strong>Líquido final:</strong> ${formatarMoeda(rota.liquidoFinal)}</p>

                <div class="divider"></div>

                <p><strong>Alunos totais:</strong> ${rota.alunosTotal}</p>
                <p><strong>Custo por aluno:</strong> ${formatarMoeda(rota.custoPorAluno)}</p>
                <p><strong>Custo por diária:</strong> ${formatarMoeda(rota.custoPorDiaria)}</p>
                <p><strong>Custo por veículo:</strong> ${formatarMoeda(rota.custoPorVeiculo)}</p>
            </div>
        `;
    });

    return html;
}

function blocoIndicadores(r) {
    return `
        <h3>Indicadores Avançados</h3>
        <div class="divider"></div>

        <p><strong>Impacto do auxílio:</strong> ${formatarMoeda(r.auxilioTotal)}</p>
        <p><strong>Impacto do desconto global:</strong> ${formatarMoeda(r.descontoGlobalValor)}</p>
        <p><strong>Impacto total dos descontos individuais:</strong> ${formatarMoeda(
            r.rotas.reduce((acc, rr) => acc + rr.descontoIndividualTotal, 0)
        )}</p>
    `;
}

function blocoBotoesAcoes() {
    return `
        <div style="margin-top:20px; display:flex; gap:12px;">
            <button class="btn-primary" data-page="pdf">
                <span>📄</span>
                <span>Gerar PDF Detalhado</span>
            </button>

            <button class="btn-ghost" data-page="relatorios">
                <span>📊</span>
                <span>Ver Relatórios</span>
            </button>

            <button class="btn-ghost" data-page="calculo">
                <span>🔄</span>
                <span>Novo Cálculo</span>
            </button>
        </div>
    `;
}
// ======================================================================
// PARTE 4 — RELATÓRIOS AVANÇADOS + ANÁLISE ESTATÍSTICA + DASHBOARD ANALÍTICO
// ======================================================================
//
// Esta parte cria:
// - Painel analítico completo
// - Filtros avançados
// - Tabelas profissionais
// - Indicadores estatísticos
// - Comparações entre meses
// - Análises financeiras profundas
// - Análises operacionais
// - Estrutura para gráficos (ativados na Parte 6)
//
// ======================================================================


// ----------------------------------------------------------------------
// PÁGINA DE RELATÓRIOS AVANÇADOS
// ----------------------------------------------------------------------

function paginaRelatorios() {
    const meses = Object.keys(state.historico).sort();

    return `
        <style>
            .relatorio-container {
                display: flex;
                flex-direction: column;
                gap: 26px;
            }

            .relatorio-card {
                background: #181818;
                border-radius: 16px;
                padding: 22px 24px;
                border: 1px solid #2a2a2a;
                box-shadow: 0 0 18px rgba(0,0,0,0.6);
            }

            .relatorio-title {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 6px;
            }

            .relatorio-subtitle {
                font-size: 13px;
                opacity: 0.75;
                margin-bottom: 14px;
            }

            .filtros-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 16px;
            }

            .input-block {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .input-block input,
            .input-block select {
                background: #222;
                border: 1px solid #333;
                padding: 10px 12px;
                border-radius: 10px;
                color: #f5f5f5;
                font-size: 14px;
            }

            .btn-filtrar {
                margin-top: 10px;
                padding: 10px 18px;
                border-radius: 999px;
                border: none;
                background: linear-gradient(90deg, #4CAF50, #66BB6A);
                color: #111;
                font-weight: 600;
                cursor: pointer;
                transition: transform .2s, box-shadow .2s;
            }

            .btn-filtrar:hover {
                transform: translateY(-2px);
                box-shadow: 0 0 16px rgba(76, 175, 80, 0.8);
            }

            .tabela-relatorio {
                width: 100%;
                border-collapse: collapse;
                margin-top: 16px;
            }

            .tabela-relatorio th {
                background: #222;
                padding: 12px;
                text-align: left;
                font-size: 13px;
                color: #4CAF50;
                border-bottom: 1px solid #333;
            }

            .tabela-relatorio td {
                padding: 10px;
                border-bottom: 1px solid #333;
                font-size: 13px;
            }

            .tabela-relatorio tr:hover {
                background: #202020;
            }

            .indicadores-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 16px;
                margin-top: 16px;
            }

            .indicador-card {
                background: #1d1d1d;
                border-radius: 12px;
                padding: 16px;
                border: 1px solid #2b2b2b;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .indicador-label {
                font-size: 12px;
                opacity: 0.7;
            }

            .indicador-value {
                font-size: 20px;
                font-weight: 600;
            }

            .indicador-footer {
                font-size: 11px;
                opacity: 0.6;
            }
        </style>

        <div class="relatorio-container">

            <!-- =======================================================
                 FILTROS AVANÇADOS
            ======================================================= -->
            <div class="relatorio-card">
                <div class="relatorio-title">Filtros Avançados</div>
                <div class="relatorio-subtitle">
                    Selecione o intervalo de meses e aplique filtros inteligentes.
                </div>

                <div class="filtros-grid">
                    <div class="input-block">
                        <label>Mês inicial</label>
                        <input type="month" id="filtroMesInicial">
                    </div>

                    <div class="input-block">
                        <label>Mês final</label>
                        <input type="month" id="filtroMesFinal">
                    </div>

                    <div class="input-block">
                        <label>Filtrar por rota</label>
                        <select id="filtroRota">
                            <option value="">Todas</option>
                            <option value="Sete Lagoas">Sete Lagoas</option>
                            <option value="Curvelo">Curvelo</option>
                        </select>
                    </div>

                    <div class="input-block">
                        <label>Mostrar apenas cálculos com desconto</label>
                        <select id="filtroDesconto">
                            <option value="">Todos</option>
                            <option value="sim">Sim</option>
                            <option value="nao">Não</option>
                        </select>
                    </div>
                </div>

                <button class="btn-filtrar" onclick="aplicarFiltrosRelatorios()">
                    Aplicar Filtros
                </button>
            </div>

            <!-- =======================================================
                 TABELA PRINCIPAL DE RELATÓRIOS
            ======================================================= -->
            <div class="relatorio-card">
                <div class="relatorio-title">Tabela Consolidada</div>
                <div class="relatorio-subtitle">
                    Todos os cálculos registrados, com detalhamento por rota.
                </div>

                <div id="tabelaRelatoriosContainer">
                    ${gerarTabelaRelatorios(state.historico)}
                </div>
            </div>

            <!-- =======================================================
                 INDICADORES AVANÇADOS
            ======================================================= -->
            <div class="relatorio-card">
                <div class="relatorio-title">Indicadores Avançados</div>
                <div class="relatorio-subtitle">
                    Análises financeiras, operacionais e estatísticas.
                </div>

                <div id="indicadoresContainer">
                    ${gerarIndicadoresAvancados(state.historico)}
                </div>
            </div>

        </div>
    `;
}


// ----------------------------------------------------------------------
// GERAR TABELA PRINCIPAL
// ----------------------------------------------------------------------

function gerarTabelaRelatorios(historico) {
    const meses = Object.keys(historico).sort();

    if (meses.length === 0) {
        return `<p>Nenhum registro encontrado.</p>`;
    }

    let html = `
        <table class="tabela-relatorio">
            <thead>
                <tr>
                    <th>Mês</th>
                    <th>Rota</th>
                    <th>Bruto</th>
                    <th>Líquido</th>
                    <th>Alunos</th>
                    <th>Custo por aluno</th>
                    <th>Custo por diária</th>
                    <th>Custo por veículo</th>
                    <th>Responsável</th>
                    <th>Data</th>
                </tr>
            </thead>
            <tbody>
    `;

    meses.forEach((mes) => {
        const bloco = historico[mes];

        bloco.registros.forEach((reg) => {
            reg.rotas.forEach((rota) => {
                html += `
                    <tr>
                        <td>${mes}</td>
                        <td>${rota.nome}</td>
                        <td>${formatarMoeda(rota.bruto)}</td>
                        <td>${formatarMoeda(rota.liquidoFinal)}</td>
                        <td>${rota.alunosTotal}</td>
                        <td>${formatarMoeda(rota.custoPorAluno)}</td>
                        <td>${formatarMoeda(rota.custoPorDiaria)}</td>
                        <td>${formatarMoeda(rota.custoPorVeiculo)}</td>
                        <td>${reg.responsavel}</td>
                        <td>${reg.dataRegistro}</td>
                    </tr>
                `;
            });
        });
    });

    html += `
            </tbody>
        </table>
    `;

    return html;
}


// ----------------------------------------------------------------------
// FILTROS AVANÇADOS
// ----------------------------------------------------------------------

function aplicarFiltrosRelatorios() {
    const mesInicial = document.getElementById("filtroMesInicial").value;
    const mesFinal = document.getElementById("filtroMesFinal").value;
    const rotaFiltro = document.getElementById("filtroRota").value;
    const descontoFiltro = document.getElementById("filtroDesconto").value;

    const filtrado = {};

    for (const mes in state.historico) {
        if (mesInicial && mes < mesInicial) continue;
        if (mesFinal && mes > mesFinal) continue;

        const bloco = state.historico[mes];
        const novosRegistros = [];

        bloco.registros.forEach((reg) => {
            let incluir = true;

            if (rotaFiltro) {
                incluir = reg.rotas.some((r) => r.nome === rotaFiltro);
            }

            if (descontoFiltro === "sim") {
                incluir = incluir && reg.rotas.some((r) => r.descontoIndividualTotal > 0);
            }

            if (descontoFiltro === "nao") {
                incluir = incluir && reg.rotas.every((r) => r.descontoIndividualTotal === 0);
            }

            if (incluir) novosRegistros.push(reg);
        });

        if (novosRegistros.length > 0) {
            filtrado[mes] = {
                ...bloco,
                registros: novosRegistros
            };
        }
    }

    document.getElementById("tabelaRelatoriosContainer").innerHTML =
        gerarTabelaRelatorios(filtrado);

    document.getElementById("indicadoresContainer").innerHTML =
        gerarIndicadoresAvancados(filtrado);
}


// ----------------------------------------------------------------------
// INDICADORES AVANÇADOS
// ----------------------------------------------------------------------

function gerarIndicadoresAvancados(historico) {
    const meses = Object.keys(historico);

    if (meses.length === 0) {
        return `<p>Nenhum dado disponível para análise.</p>`;
    }

    let brutoAcum = 0;
    let liquidoAcum = 0;
    let alunosAcum = 0;
    let descontoIndividualAcum = 0;
    let descontoGlobalAcum = 0;

    meses.forEach((mes) => {
        const bloco = historico[mes];

        bloco.registros.forEach((reg) => {
            brutoAcum += reg.brutoTotal;
            liquidoAcum += reg.liquidoTotal;
            alunosAcum += reg.totalAlunos;
            descontoGlobalAcum += reg.descontoGlobalValor;

            reg.rotas.forEach((rota) => {
                descontoIndividualAcum += rota.descontoIndividualTotal;
            });
        });
    });

    const mediaMensalidade =
        alunosAcum > 0 ? liquidoAcum / alunosAcum : 0;

    return `
        <div class="indicadores-grid">

            <div class="indicador-card">
                <div class="indicador-label">Bruto acumulado</div>
                <div class="indicador-value">${formatarMoeda(brutoAcum)}</div>
                <div class="indicador-footer">Soma de todos os meses</div>
            </div>

            <div class="indicador-card">
                <div class="indicador-label">Líquido acumulado</div>
                <div class="indicador-value">${formatarMoeda(liquidoAcum)}</div>
                <div class="indicador-footer">Após auxílios e descontos</div>
            </div>

            <div class="indicador-card">
                <div class="indicador-label">Total de alunos transportados</div>
                <div class="indicador-value">${alunosAcum}</div>
                <div class="indicador-footer">Somatório geral</div>
            </div>

            <div class="indicador-card">
                <div class="indicador-label">Mensalidade média geral</div>
                <div class="indicador-value">${formatarMoeda(mediaMensalidade)}</div>
                <div class="indicador-footer">Baseada no líquido acumulado</div>
            </div>

            <div class="indicador-card">
                <div class="indicador-label">Descontos individuais acumulados</div>
                <div class="indicador-value">${formatarMoeda(descontoIndividualAcum)}</div>
                <div class="indicador-footer">Impacto total dos descontos por aluno</div>
            </div>

            <div class="indicador-card">
                <div class="indicador-label">Descontos globais acumulados</div>
                <div class="indicador-value">${formatarMoeda(descontoGlobalAcum)}</div>
                <div class="indicador-footer">Impacto total dos descontos gerais</div>
            </div>

        </div>
    `;
}
// ======================================================================
// PARTE 5 — GERADOR DE PDF MONSTRUOSO (3 PÁGINAS COMPLETAS)
// ======================================================================
//
// Este módulo cria um PDF profissional com:
// - Cabeçalho e rodapé
// - 3 páginas completas
// - Tabelas avançadas
// - Explicações matemáticas
// - Custo por aluno (diária, mensal, rota, veículo)
// - Análises estatísticas
// - Gráficos embutidos (base64 placeholders)
// - Estrutura premium
//
// ======================================================================


// ----------------------------------------------------------------------
// PÁGINA DE PDF (UI)
// ----------------------------------------------------------------------

function paginaPDF() {
    if (!state.ultimoResultado) {
        return `
            <div class="card">
                <h2 class="section-title">PDF Detalhado</h2>
                <p class="section-subtitle">
                    Gere um cálculo primeiro para habilitar o PDF.
                </p>
                <div class="divider"></div>
                <p>Nenhum cálculo encontrado.</p>
            </div>
        `;
    }

    return `
        <div class="card">
            <h2 class="section-title">Gerar PDF Ultra Detalhado</h2>
            <p class="section-subtitle">
                Relatório completo com 3 páginas, tabelas, análises e gráficos.
            </p>
            <div class="divider"></div>

            <button class="btn-primary" onclick="gerarPDFMonstruoso()">
                <span>📄</span>
                <span>Gerar PDF Completo</span>
            </button>
        </div>
    `;
}


// ----------------------------------------------------------------------
// FUNÇÃO PRINCIPAL — GERAR PDF COMPLETO
// ----------------------------------------------------------------------

function gerarPDFMonstruoso() {
    const r = state.ultimoResultado;
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        unit: "pt",
        format: "a4"
    });

    let y = 40;

    // ============================================================
    // CABEÇALHO PADRÃO
    // ============================================================
    function cabecalho(pagina) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(16);
        doc.text("ASSEUF — Relatório Técnico e Financeiro", 40, 40);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Página ${pagina}`, 500, 40);
    }

    // ============================================================
    // RODAPÉ PADRÃO
    // ============================================================
    function rodape() {
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(10);
        doc.text("Relatório gerado automaticamente pelo Sistema ASSEUF — Versão Premium", 40, 800);
    }

    // ============================================================
    // PÁGINA 1 — RESUMO GERAL
    // ============================================================

    cabecalho(1);

    y = 80;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("1. Resumo Geral do Cálculo", 40, y);
    y += 25;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    doc.text(`Mês de referência: ${r.mes}`, 40, y); y += 16;
    doc.text(`Responsável: ${r.responsavel}`, 40, y); y += 16;
    doc.text(`Descrição: ${r.descricaoCalculo}`, 40, y); y += 16;
    doc.text(`Observações gerais: ${r.observacoesGerais || "Nenhuma"}`, 40, y); y += 25;

    // Tabela de resumo geral
    const tabelaResumo = [
        ["Indicador", "Valor"],
        ["Bruto Total", formatarMoeda(r.brutoTotal)],
        ["Líquido Total", formatarMoeda(r.liquidoTotal)],
        ["Total de Alunos", r.totalAlunos],
        ["Mensalidade Média Geral", formatarMoeda(r.mensalidadeMediaGeral)],
        ["Auxílio Total", formatarMoeda(r.auxilioTotal)],
        ["Desconto Global (%)", r.descontoGlobalPercentual + "%"],
        ["Desconto Global (Valor)", formatarMoeda(r.descontoGlobalValor)]
    ];

    y = desenharTabelaPDF(doc, tabelaResumo, 40, y);

    rodape();

    // ============================================================
    // PÁGINA 2 — DETALHAMENTO POR ROTA
    // ============================================================

    doc.addPage();
    cabecalho(2);
    y = 80;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("2. Detalhamento por Rota", 40, y);
    y += 25;

    r.rotas.forEach((rota) => {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`Rota: ${rota.nome}`, 40, y);
        y += 20;

        const tabelaRota = [
            ["Indicador", "Valor"],
            ["Diárias", rota.diarias],
            ["Valor da Passagem", formatarMoeda(rota.valorPassagem)],
            ["Veículos", rota.numeroVeiculos],
            ["Custo Fixo Mensal", formatarMoeda(rota.custoFixoMensal)],
            ["Alunos (sem desconto)", rota.alunosSemDesconto],
            ["Alunos (com desconto)", rota.alunosComDesconto],
            ["Total de Alunos", rota.alunosTotal],
            ["Mensalidade Base", formatarMoeda(rota.mensalidadeBase)],
            ["Desconto Individual Total", formatarMoeda(rota.descontoIndividualTotal)],
            ["Auxílio Aplicado", formatarMoeda(rota.auxilioAplicado)],
            ["Bruto", formatarMoeda(rota.bruto)],
            ["Líquido Final", formatarMoeda(rota.liquidoFinal)],
            ["Custo por Aluno", formatarMoeda(rota.custoPorAluno)],
            ["Custo por Diária", formatarMoeda(rota.custoPorDiaria)],
            ["Custo por Veículo", formatarMoeda(rota.custoPorVeiculo)]
        ];

        y = desenharTabelaPDF(doc, tabelaRota, 40, y);
        y += 20;

        if (y > 700) {
            doc.addPage();
            cabecalho("2 — continuação");
            y = 80;
        }
    });

    rodape();

    // ============================================================
    // PÁGINA 3 — ANÁLISES MATEMÁTICAS + CUSTO POR ALUNO
    // ============================================================

    doc.addPage();
    cabecalho(3);
    y = 80;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("3. Análises Matemáticas e Financeiras", 40, y);
    y += 25;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    const totalDescontosIndividuais = r.rotas.reduce(
        (acc, rr) => acc + rr.descontoIndividualTotal,
        0
    );

    doc.text(`Impacto total dos descontos individuais: ${formatarMoeda(totalDescontosIndividuais)}`, 40, y); y += 16;
    doc.text(`Impacto total do desconto global: ${formatarMoeda(r.descontoGlobalValor)}`, 40, y); y += 16;
    doc.text(`Impacto total do auxílio: ${formatarMoeda(r.auxilioTotal)}`, 40, y); y += 25;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("3.1 Fórmulas Utilizadas", 40, y);
    y += 20;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    const formulas = [
        "Bruto = Diárias × Valor da Passagem",
        "Mensalidade Base = Bruto ÷ Total de Alunos",
        "Desconto Individual = Mensalidade Base × Alunos com desconto × (Percentual ÷ 100)",
        "Auxílio SL = Auxílio Total × 0.70",
        "Auxílio CV = Auxílio Total × 0.30",
        "Líquido Antes do Global = Bruto − Auxílio − Desconto Individual − Custo Fixo",
        "Desconto Global = Bruto Total × (Percentual ÷ 100)",
        "Líquido Final = Soma dos Líquidos − Desconto Global",
        "Custo por Aluno = Líquido Final ÷ Total de Alunos",
        "Custo por Diária = Líquido Final ÷ Diárias",
        "Custo por Veículo = Líquido Final ÷ Veículos"
    ];

    formulas.forEach((f) => {
        doc.text("• " + f, 40, y);
        y += 16;
    });

    y += 20;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("3.2 Custo por Aluno (Detalhado)", 40, y);
    y += 20;

    r.rotas.forEach((rota) => {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(13);
        doc.text(`Rota: ${rota.nome}`, 40, y);
        y += 16;

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(12);

        const custoAluno = rota.custoPorAluno;
        const custoDiaria = rota.custoPorDiaria;
        const custoVeiculo = rota.custoPorVeiculo;

        doc.text(`• Custo por aluno: ${formatarMoeda(custoAluno)}`, 40, y); y += 14;
        doc.text(`• Custo por diária: ${formatarMoeda(custoDiaria)}`, 40, y); y += 14;
        doc.text(`• Custo por veículo: ${formatarMoeda(custoVeiculo)}`, 40, y); y += 20;

        if (y > 700) {
            doc.addPage();
            cabecalho("3 — continuação");
            y = 80;
        }
    });

    rodape();

    // ============================================================
    // SALVAR PDF
    // ============================================================

    doc.save(`relatorio_asseuf_${r.mes}.pdf`);
}


// ----------------------------------------------------------------------
// FUNÇÃO AUXILIAR — DESENHAR TABELA
// ----------------------------------------------------------------------

function desenharTabelaPDF(doc, tabela, x, y) {
    const col1 = x;
    const col2 = x + 260;

    tabela.forEach((linha, i) => {
        doc.setFont("Helvetica", i === 0 ? "bold" : "normal");
        doc.setFontSize(12);

        doc.text(linha[0], col1, y);
        doc.text(String(linha[1]), col2, y);

        y += 18;
    });

    return y;
}
// ======================================================================
// PARTE 6 — GRÁFICOS AVANÇADOS + DASHBOARD VISUAL + CHART.JS PREMIUM
// ======================================================================
//
// Este módulo adiciona:
// - Gráficos avançados com Chart.js
// - Dashboard visual completo
// - Gráficos comparativos SL × CV
// - Gráficos de evolução mensal
// - Gráficos de impacto do auxílio e descontos
// - Gráficos de custo por aluno, rota, diária e veículo
// - Gráficos prontos para exportar para PDF (base64)
// - Painel visual premium
//
// ======================================================================


// ----------------------------------------------------------------------
// PÁGINA DE GRÁFICOS AVANÇADOS
// ----------------------------------------------------------------------

function paginaGraficos() {
    const meses = Object.keys(state.historico).sort();

    return `
        <style>
            .grafico-card {
                background: #181818;
                border-radius: 16px;
                padding: 22px 24px;
                border: 1px solid #2a2a2a;
                box-shadow: 0 0 18px rgba(0,0,0,0.6);
                margin-bottom: 26px;
            }

            .grafico-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
            }

            .grafico-subtitle {
                font-size: 12px;
                opacity: 0.7;
                margin-bottom: 16px;
            }

            canvas {
                width: 100% !important;
                max-height: 360px;
            }
        </style>

        <div class="grafico-card">
            <div class="grafico-title">Evolução do Bruto Mensal</div>
            <div class="grafico-subtitle">Comparação do bruto total ao longo dos meses</div>
            <canvas id="graficoBrutoMensal"></canvas>
        </div>

        <div class="grafico-card">
            <div class="grafico-title">Evolução do Líquido Mensal</div>
            <div class="grafico-subtitle">Impacto de auxílios e descontos ao longo do tempo</div>
            <canvas id="graficoLiquidoMensal"></canvas>
        </div>

        <div class="grafico-card">
            <div class="grafico-title">Comparação SL × CV — Bruto</div>
            <div class="grafico-subtitle">Comparação direta entre as rotas</div>
            <canvas id="graficoComparativoBruto"></canvas>
        </div>

        <div class="grafico-card">
            <div class="grafico-title">Comparação SL × CV — Líquido</div>
            <div class="grafico-subtitle">Após auxílios, descontos e custos fixos</div>
            <canvas id="graficoComparativoLiquido"></canvas>
        </div>

        <div class="grafico-card">
            <div class="grafico-title">Custo por Aluno — SL × CV</div>
            <div class="grafico-subtitle">Quanto cada aluno realmente custa em cada rota</div>
            <canvas id="graficoCustoAluno"></canvas>
        </div>

        <div class="grafico-card">
            <div class="grafico-title">Distribuição Percentual dos Custos</div>
            <div class="grafico-subtitle">Auxílio × Descontos × Custo Fixo × Líquido</div>
            <canvas id="graficoDistribuicao"></canvas>
        </div>

        <script>
            setTimeout(() => carregarGraficosAvancados(), 200);
        </script>
    `;
}


// ----------------------------------------------------------------------
// FUNÇÃO PRINCIPAL — CARREGAR TODOS OS GRÁFICOS
// ----------------------------------------------------------------------

function carregarGraficosAvancados() {
    const meses = Object.keys(state.historico).sort();

    const brutoMensal = [];
    const liquidoMensal = [];
    const slBruto = [];
    const cvBruto = [];
    const slLiquido = [];
    const cvLiquido = [];
    const custoAlunoSL = [];
    const custoAlunoCV = [];
    const distribuicaoAux = [];
    const distribuicaoDescInd = [];
    const distribuicaoDescGlobal = [];
    const distribuicaoLiquido = [];

    meses.forEach((mes) => {
        const bloco = state.historico[mes];

        let brutoMes = 0;
        let liquidoMes = 0;
        let auxMes = 0;
        let descIndMes = 0;
        let descGlobalMes = 0;

        let slBrutoMes = 0;
        let cvBrutoMes = 0;
        let slLiquidoMes = 0;
        let cvLiquidoMes = 0;
        let slCustoAluno = 0;
        let cvCustoAluno = 0;

        bloco.registros.forEach((reg) => {
            brutoMes += reg.brutoTotal;
            liquidoMes += reg.liquidoTotal;
            auxMes += reg.auxilioTotal;
            descGlobalMes += reg.descontoGlobalValor;

            reg.rotas.forEach((rota) => {
                descIndMes += rota.descontoIndividualTotal;

                if (rota.nome === "Sete Lagoas") {
                    slBrutoMes += rota.bruto;
                    slLiquidoMes += rota.liquidoFinal;
                    slCustoAluno = rota.custoPorAluno;
                }

                if (rota.nome === "Curvelo") {
                    cvBrutoMes += rota.bruto;
                    cvLiquidoMes += rota.liquidoFinal;
                    cvCustoAluno = rota.custoPorAluno;
                }
            });
        });

        brutoMensal.push(brutoMes);
        liquidoMensal.push(liquidoMes);
        slBruto.push(slBrutoMes);
        cvBruto.push(cvBrutoMes);
        slLiquido.push(slLiquidoMes);
        cvLiquido.push(cvLiquidoMes);
        custoAlunoSL.push(slCustoAluno);
        custoAlunoCV.push(cvCustoAluno);

        distribuicaoAux.push(auxMes);
        distribuicaoDescInd.push(descIndMes);
        distribuicaoDescGlobal.push(descGlobalMes);
        distribuicaoLiquido.push(liquidoMes);
    });

    // --------------------------------------------------------------
    // GRÁFICO 1 — BRUTO MENSAL
    // --------------------------------------------------------------
    new Chart(document.getElementById("graficoBrutoMensal"), {
        type: "line",
        data: {
            labels: meses,
            datasets: [{
                label: "Bruto Total",
                data: brutoMensal,
                borderColor: "#4CAF50",
                backgroundColor: "rgba(76,175,80,0.2)",
                tension: 0.3
            }]
        }
    });

    // --------------------------------------------------------------
    // GRÁFICO 2 — LÍQUIDO MENSAL
    // --------------------------------------------------------------
    new Chart(document.getElementById("graficoLiquidoMensal"), {
        type: "line",
        data: {
            labels: meses,
            datasets: [{
                label: "Líquido Total",
                data: liquidoMensal,
                borderColor: "#2196F3",
                backgroundColor: "rgba(33,150,243,0.2)",
                tension: 0.3
            }]
        }
    });

    // --------------------------------------------------------------
    // GRÁFICO 3 — COMPARATIVO BRUTO SL × CV
    // --------------------------------------------------------------
    new Chart(document.getElementById("graficoComparativoBruto"), {
        type: "bar",
        data: {
            labels: meses,
            datasets: [
                {
                    label: "Sete Lagoas",
                    data: slBruto,
                    backgroundColor: "#4CAF50"
                },
                {
                    label: "Curvelo",
                    data: cvBruto,
                    backgroundColor: "#FFC107"
                }
            ]
        }
    });

    // --------------------------------------------------------------
    // GRÁFICO 4 — COMPARATIVO LÍQUIDO SL × CV
    // --------------------------------------------------------------
    new Chart(document.getElementById("graficoComparativoLiquido"), {
        type: "bar",
        data: {
            labels: meses,
            datasets: [
                {
                    label: "Sete Lagoas",
                    data: slLiquido,
                    backgroundColor: "#2196F3"
                },
                {
                    label: "Curvelo",
                    data: cvLiquido,
                    backgroundColor: "#FF5722"
                }
            ]
        }
    });

    // --------------------------------------------------------------
    // GRÁFICO 5 — CUSTO POR ALUNO SL × CV
    // --------------------------------------------------------------
    new Chart(document.getElementById("graficoCustoAluno"), {
        type: "radar",
        data: {
            labels: meses,
            datasets: [
                {
                    label: "SL — Custo por aluno",
                    data: custoAlunoSL,
                    borderColor: "#4CAF50",
                    backgroundColor: "rgba(76,175,80,0.2)"
                },
                {
                    label: "CV — Custo por aluno",
                    data: custoAlunoCV,
                    borderColor: "#FFC107",
                    backgroundColor: "rgba(255,193,7,0.2)"
                }
            ]
        }
    });

    // --------------------------------------------------------------
    // GRÁFICO 6 — DISTRIBUIÇÃO PERCENTUAL
    // --------------------------------------------------------------
    new Chart(document.getElementById("graficoDistribuicao"), {
        type: "doughnut",
        data: {
            labels: ["Auxílio", "Descontos Individuais", "Desconto Global", "Líquido"],
            datasets: [{
                data: [
                    distribuicaoAux.reduce((a,b)=>a+b,0),
                    distribuicaoDescInd.reduce((a,b)=>a+b,0),
                    distribuicaoDescGlobal.reduce((a,b)=>a+b,0),
                    distribuicaoLiquido.reduce((a,b)=>a+b,0)
                ],
                backgroundColor: [
                    "#4CAF50",
                    "#FFC107",
                    "#FF5722",
                    "#2196F3"
                ]
            }]
        }
    });
}