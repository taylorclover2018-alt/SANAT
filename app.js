// ===============================
// PARTE 1 — ESTADO GLOBAL E HISTÓRICO
// ===============================

// Estado principal do sistema
const state = {
    paginaAtual: "inicio",
    resultado: null,
    historico: carregarHistorico()
};

// Carrega histórico salvo no navegador (por mês)
function carregarHistorico() {
    const salvo = localStorage.getItem("historicoRotas");
    return salvo ? JSON.parse(salvo) : {};
}

// Salva histórico no navegador
function salvarHistorico() {
    localStorage.setItem("historicoRotas", JSON.stringify(state.historico));
}

// Registra cálculo no histórico (H1 — por mês)
function registrarHistorico(mes, dados) {
    state.historico[mes] = {
        ...dados,
        dataRegistro: new Date().toLocaleString("pt-BR")
    };
    salvarHistorico();
}

// ===============================
// NAVEGAÇÃO ENTRE PÁGINAS
// ===============================

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

// ===============================
// RENDERIZAÇÃO PRINCIPAL
// ===============================

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
            carregarGraficos();
            break;

        case "pdf":
            app.innerHTML = paginaPDF();
            break;

        default:
            app.innerHTML = "<p>Erro ao carregar página.</p>";
    }
}
// ===============================
// PARTE 2 — PÁGINA INÍCIO
// ===============================

function paginaInicio() {
    return `
        <div class="card">
            <h2 class="section-title">Bem-vindo ao Sistema ASSEUF</h2>
            <div class="divider"></div>

            <p>
                Este sistema foi desenvolvido para facilitar o cálculo financeiro das rotas de transporte
                universitário da ASSEUF, permitindo registrar valores, gerar relatórios, acompanhar histórico
                mensal e emitir PDFs detalhados.
            </p>

            <p>
                Utilize o menu acima para navegar entre as funções:
            </p>

            <ul>
                <li><strong>Cadastro e Cálculo:</strong> registre os valores e gere o cálculo completo.</li>
                <li><strong>Relatórios:</strong> veja o histórico mensal e gráficos.</li>
                <li><strong>PDF:</strong> gere um documento completo com todos os cálculos.</li>
            </ul>

            <p style="margin-top: 20px; opacity: 0.8;">
                Sistema ASSEUF — Desenvolvido com dedicação<br>
                Versão 1.0 — Modo Avançado disponível
            </p>
        </div>
    `;
}
// ===============================
// PARTE 3 — PÁGINA DE CÁLCULO COMPLETA
// ===============================

function paginaCalculo() {
    return `
        <div class="card">
            <h2 class="section-title">Cadastro e Cálculo das Rotas</h2>
            <div class="divider"></div>

            <div class="form-grid">

                <label>Mês de Referência:</label>
                <input id="mesRef" type="month">

                <label>Diárias (Sete Lagoas):</label>
                <input id="diariasSL" type="number" min="0">

                <label>Diárias (Curvelo):</label>
                <input id="diariasCV" type="number" min="0">

                <label>Valor da Passagem (Sete Lagoas):</label>
                <input id="passagemSL" type="number" min="0" step="0.01">

                <label>Valor da Passagem (Curvelo):</label>
                <input id="passagemCV" type="number" min="0" step="0.01">

                <label>Auxílio Transporte Total:</label>
                <input id="auxilio" type="number" min="0" step="0.01">

                <label>Número de Alunos (Sete Lagoas):</label>
                <input id="alunosSL" type="number" min="0">

                <label>Número de Alunos (Curvelo):</label>
                <input id="alunosCV" type="number" min="0">

                <label>Desconto (%)</label>
                <input id="desconto" type="number" min="0" max="100" value="0">

            </div>

            <button class="btn-primary" onclick="calcularRotas()">Calcular</button>

            <div id="resultadoCalculo" class="resultado"></div>
        </div>
    `;
}

// ===============================
// FUNÇÃO PRINCIPAL DE CÁLCULO
// ===============================

function calcularRotas() {
    const mes = document.getElementById("mesRef").value;

    const diariasSL = Number(document.getElementById("diariasSL").value);
    const diariasCV = Number(document.getElementById("diariasCV").value);

    const passagemSL = Number(document.getElementById("passagemSL").value);
    const passagemCV = Number(document.getElementById("passagemCV").value);

    const auxilio = Number(document.getElementById("auxilio").value);

    const alunosSL = Number(document.getElementById("alunosSL").value);
    const alunosCV = Number(document.getElementById("alunosCV").value);

    const desconto = Number(document.getElementById("desconto").value);

    // Validação básica
    if (!mes) {
        alert("Selecione o mês de referência.");
        return;
    }

    // Cálculo bruto das rotas
    const brutoSL = diariasSL * passagemSL;
    const brutoCV = diariasCV * passagemCV;

    const brutoTotal = brutoSL + brutoCV;

    // Desconto aplicado ao bruto
    const brutoComDesconto = brutoTotal * (1 - desconto / 100);

    // Divisão do auxílio (70% SL, 30% CV)
    const auxSL = auxilio * 0.7;
    const auxCV = auxilio * 0.3;

    // Abatimento do auxílio
    const liquidoSL = brutoSL - auxSL;
    const liquidoCV = brutoCV - auxCV;

    const liquidoTotal = liquidoSL + liquidoCV;

    // Mensalidade média por aluno
    const totalAlunos = alunosSL + alunosCV;
    const mensalidadeMedia = totalAlunos > 0 ? liquidoTotal / totalAlunos : 0;

    // Resultado final
    const resultado = {
        mes,
        brutoSL,
        brutoCV,
        brutoTotal,
        brutoComDesconto,
        auxSL,
        auxCV,
        liquidoSL,
        liquidoCV,
        liquidoTotal,
        alunosSL,
        alunosCV,
        totalAlunos,
        mensalidadeMedia,
        desconto
    };

    // Salva no estado
    state.resultado = resultado;

    // Salva no histórico mensal (H1)
    registrarHistorico(mes, resultado);

    // Exibe o resultado
    mostrarResultado(resultado);
}

// ===============================
// EXIBIR RESULTADO NA TELA
// ===============================

function mostrarResultado(r) {
    const div = document.getElementById("resultadoCalculo");

    div.innerHTML = `
        <h3>Resultado do Cálculo</h3>
        <div class="divider"></div>

        <p><strong>Bruto Sete Lagoas:</strong> R$ ${r.brutoSL.toFixed(2)}</p>
        <p><strong>Bruto Curvelo:</strong> R$ ${r.brutoCV.toFixed(2)}</p>
        <p><strong>Bruto Total:</strong> R$ ${r.brutoTotal.toFixed(2)}</p>

        <p><strong>Auxílio SL (70%):</strong> R$ ${r.auxSL.toFixed(2)}</p>
        <p><strong>Auxílio CV (30%):</strong> R$ ${r.auxCV.toFixed(2)}</p>

        <p><strong>Líquido SL:</strong> R$ ${r.liquidoSL.toFixed(2)}</p>
        <p><strong>Líquido CV:</strong> R$ ${r.liquidoCV.toFixed(2)}</p>

        <p><strong>Líquido Total:</strong> R$ ${r.liquidoTotal.toFixed(2)}</p>

        <p><strong>Total de Alunos:</strong> ${r.totalAlunos}</p>
        <p><strong>Mensalidade Média:</strong> R$ ${r.mensalidadeMedia.toFixed(2)}</p>

        <p><strong>Desconto Aplicado:</strong> ${r.desconto}%</p>

        <div class="divider"></div>
        <p style="opacity:0.7;">Cálculo salvo no histórico mensal.</p>
    `;
}
// ===============================
// PARTE 4 — RELATÓRIOS + GRÁFICOS
// ===============================

function paginaRelatorios() {
    const historico = state.historico;

    if (!historico || Object.keys(historico).length === 0) {
        return `
            <div class="card">
                <h2 class="section-title">Relatórios</h2>
                <div class="divider"></div>
                <p>Nenhum cálculo registrado ainda.</p>
            </div>
        `;
    }

    let linhas = "";
    for (const mes in historico) {
        const h = historico[mes];
        linhas += `
            <tr>
                <td>${mes}</td>
                <td>R$ ${h.brutoTotal.toFixed(2)}</td>
                <td>R$ ${h.liquidoTotal.toFixed(2)}</td>
                <td>${h.totalAlunos}</td>
                <td>R$ ${h.mensalidadeMedia.toFixed(2)}</td>
                <td>${h.dataRegistro}</td>
            </tr>
        `;
    }

    return `
        <div class="card">
            <h2 class="section-title">Relatórios Mensais</h2>
            <div class="divider"></div>

            <table class="tabela-relatorio">
                <thead>
                    <tr>
                        <th>Mês</th>
                        <th>Bruto Total</th>
                        <th>Líquido Total</th>
                        <th>Alunos</th>
                        <th>Mensalidade Média</th>
                        <th>Registrado em</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhas}
                </tbody>
            </table>

            <h3 class="section-title" style="margin-top: 30px;">Gráficos</h3>
            <div class="divider"></div>

            <canvas id="graficoEvolucao" height="120"></canvas>
            <canvas id="graficoComparacao" height="120" style="margin-top: 40px;"></canvas>
        </div>
    `;
}

// ===============================
// GRÁFICOS (Chart.js)
// ===============================

function carregarGraficos() {
    const historico = state.historico;
    const meses = Object.keys(historico);

    const brutoTotal = meses.map(m => historico[m].brutoTotal);
    const liquidoTotal = meses.map(m => historico[m].liquidoTotal);
    const mensalidadeMedia = meses.map(m => historico[m].mensalidadeMedia);

    // Gráfico 1 — Evolução mensal
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
                        tension: 0.2
                    },
                    {
                        label: "Líquido Total",
                        data: liquidoTotal,
                        borderColor: "#2196F3",
                        fill: false,
                        tension: 0.2
                    },
                    {
                        label: "Mensalidade Média",
                        data: mensalidadeMedia,
                        borderColor: "#FFC107",
                        fill: false,
                        tension: 0.2
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "top" }
                }
            }
        });
    }

    // Gráfico 2 — Comparação SL × CV
    const ctx2 = document.getElementById("graficoComparacao");
    if (ctx2) {
        const sl = meses.map(m => historico[m].brutoSL);
        const cv = meses.map(m => historico[m].brutoCV);

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
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "top" }
                }
            }
        });
    }
}
// ===============================
// PARTE 5 — PÁGINA PDF + GERADOR DE PDF DETALHADO
// ===============================

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
            <h2 class="section-title">Gerar PDF Detalhado</h2>
            <div class="divider"></div>

            <p>O PDF incluirá:</p>
            <ul>
                <li>Resumo das rotas</li>
                <li>Cálculos detalhados</li>
                <li>Explicação matemática</li>
                <li>Fechamento total</li>
                <li>Valores por aluno</li>
            </ul>

            <button class="btn-primary" onclick="gerarPdfDetalhado()">Gerar PDF</button>
        </div>
    `;
}

// ===============================
// GERADOR DE PDF DETALHADO (CORRIGIDO PARA jsPDF UMD)
// ===============================

function gerarPdfDetalhado() {
    if (!state.resultado) {
        alert("Nenhum cálculo encontrado.");
        return;
    }

    const r = state.resultado;

    // IMPORTANTE: jsPDF UMD
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        unit: "pt",
        format: "a4"
    });

    let y = 40;

    // Cabeçalho
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Relatório Detalhado — Sistema ASSEUF", 40, y);
    y += 30;

    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    doc.text(`Mês de Referência: ${r.mes}`, 40, y);
    y += 20;

    // Divisor
    doc.setDrawColor(0);
    doc.line(40, y, 550, y);
    y += 25;

    // Seção 1 — Resumo das Rotas
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("1. Resumo das Rotas", 40, y);
    y += 20;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Bruto Sete Lagoas: R$ ${r.brutoSL.toFixed(2)}`, 40, y); y += 18;
    doc.text(`Bruto Curvelo: R$ ${r.brutoCV.toFixed(2)}`, 40, y); y += 18;
    doc.text(`Bruto Total: R$ ${r.brutoTotal.toFixed(2)}`, 40, y); y += 25;

    // Seção 2 — Auxílio
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("2. Auxílio Transporte", 40, y);
    y += 20;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Auxílio SL (70%): R$ ${r.auxSL.toFixed(2)}`, 40, y); y += 18;
    doc.text(`Auxílio CV (30%): R$ ${r.auxCV.toFixed(2)}`, 40, y); y += 25;

    // Seção 3 — Líquido
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("3. Valores Líquidos", 40, y);
    y += 20;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Líquido SL: R$ ${r.liquidoSL.toFixed(2)}`, 40, y); y += 18;
    doc.text(`Líquido CV: R$ ${r.liquidoCV.toFixed(2)}`, 40, y); y += 18;
    doc.text(`Líquido Total: R$ ${r.liquidoTotal.toFixed(2)}`, 40, y); y += 25;

    // Seção 4 — Alunos
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("4. Alunos e Mensalidade", 40, y);
    y += 20;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Alunos SL: ${r.alunosSL}`, 40, y); y += 18;
    doc.text(`Alunos CV: ${r.alunosCV}`, 40, y); y += 18;
    doc.text(`Total de Alunos: ${r.totalAlunos}`, 40, y); y += 18;
    doc.text(`Mensalidade Média: R$ ${r.mensalidadeMedia.toFixed(2)}`, 40, y); y += 25;

    // Seção 5 — Desconto
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("5. Descontos Aplicados", 40, y);
    y += 20;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Desconto aplicado: ${r.desconto}%`, 40, y); y += 25;

    // Rodapé
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(10);
    doc.text("Sistema ASSEUF — Relatório Gerado Automaticamente", 40, 800);

    // Baixar PDF
    doc.save(`relatorio_rotas_${r.mes}.pdf`);
}
// ===============================
// PARTE 6 — INICIALIZAÇÃO DO SISTEMA
// ===============================

// Renderiza a primeira página ao abrir o sistema
document.addEventListener("DOMContentLoaded", () => {
    render();
});