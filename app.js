// ======================================================================
// ASSEUF - APP.JS PARTE 1/12
// Núcleo: estado, navegação, layout e primeiro cálculo funcional
// ======================================================================

// ---------------------------
// CONFIGURAÇÃO GERAL
// ---------------------------
const CONFIG = {
  nomeSistema: "ASSEUF — Gestão de Rotas e Alunos",
  versao: "1.0.0 (Parte 1/12)",
};

// ---------------------------
// ESTADO GLOBAL
// ---------------------------
const state = {
  paginaAtual: "inicio",
  ultimoCalculo: null,
};

// ---------------------------
// HELPERS
// ---------------------------
function formatarMoeda(v) {
  if (isNaN(v)) return "R$ 0,00";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ---------------------------
// NAVEGAÇÃO
// ---------------------------
function navegarPara(pagina) {
  state.paginaAtual = pagina;
  atualizarNav();
  render();
}

function atualizarNav() {
  const navRoot = document.getElementById("nav-root");
  if (!navRoot) return;

  navRoot.innerHTML = `
    ${botaoNav("inicio", "Início", "🏠")}
    ${botaoNav("calculo", "Cadastro & Cálculo", "🧮")}
    ${botaoNav("relatorios", "Relatórios", "📊", true)}
    ${botaoNav("pdf", "PDF", "📄", true)}
    ${botaoNav("config", "Configurações", "⚙️", true)}
  `;

  // marcar ativo
  [...navRoot.querySelectorAll("[data-page]")].forEach((btn) => {
    const page = btn.getAttribute("data-page");
    if (page === state.paginaAtual) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function botaoNav(pagina, rotulo, icone, secundario = false) {
  const classes = ["nav-btn"];
  if (secundario) classes.push("secondary");
  if (pagina === state.paginaAtual) classes.push("active");

  return `
    <button class="${classes.join(" ")}" data-page="${pagina}">
      <span class="icon">${icone}</span>
      <span>${rotulo}</span>
    </button>
  `;
}

// clique global para navegação
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-page]");
  if (!btn) return;
  const pagina = btn.getAttribute("data-page");
  navegarPara(pagina);
});

// ---------------------------
// RENDERIZAÇÃO PRINCIPAL
// ---------------------------
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  let conteudo = "";

  switch (state.paginaAtual) {
    case "inicio":
      conteudo = paginaInicio();
      break;
    case "calculo":
      conteudo = paginaCalculoBasico();
      break;
    case "relatorios":
      conteudo = paginaPlaceholder("Relatórios", "Os relatórios avançados entrarão nas próximas partes.");
      break;
    case "pdf":
      conteudo = paginaPlaceholder("PDF", "O gerador de PDF detalhado virá nas próximas partes.");
      break;
    case "config":
      conteudo = paginaPlaceholder("Configurações", "As configurações avançadas serão adicionadas depois.");
      break;
    default:
      conteudo = `<div class="card"><p>Erro ao carregar página.</p></div>`;
  }

  app.innerHTML = conteudo;
}

// ---------------------------
// PÁGINA INICIAL
// ---------------------------
function paginaInicio() {
  const temCalculo = !!state.ultimoCalculo;

  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title-block">
          <div class="card-title">Painel inicial</div>
          <div class="card-subtitle">
            Bem-vindo ao ASSEUF. Esta é a base do sistema. Nas próximas partes, tudo vai ficar mais profundo e detalhado.
          </div>
        </div>
        <div class="pill">
          <span>Versão</span>
          <strong>${CONFIG.versao}</strong>
        </div>
      </div>

      <div class="divider"></div>

      <div class="dashboard-grid">
        <div class="dash-card">
          <div class="dash-label">Último cálculo registrado</div>
          <div class="dash-value">
            ${temCalculo ? formatarMoeda(state.ultimoCalculo.totalBruto) : "—"}
          </div>
          <div class="dash-footer">
            ${temCalculo ? "Baseado nos dados da última simulação." : "Nenhum cálculo foi feito ainda."}
          </div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Rotas consideradas</div>
          <div class="dash-value">Sete Lagoas & Curvelo</div>
          <div class="dash-footer">Modelo inicial de duas rotas fixas.</div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Modo de uso</div>
          <div class="dash-value">Básico</div>
          <div class="dash-footer">As próximas partes vão liberar recursos avançados.</div>
        </div>
      </div>

      <div class="actions-row">
        <button class="btn-primary" type="button" data-page="calculo">
          <span>🧮</span>
          <span>Ir para Cadastro & Cálculo</span>
        </button>

        <button class="btn-ghost" type="button" data-page="relatorios">
          <span>📊</span>
          <span>Ver relatórios (em breve)</span>
        </button>
      </div>
    </div>
  `;
}

// ---------------------------
// PÁGINA DE CÁLCULO BÁSICO (JÁ FUNCIONA)
// ---------------------------
function paginaCalculoBasico() {
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title-block">
          <div class="card-title">Cadastro & Cálculo — Base</div>
          <div class="card-subtitle">
            Informe os dados básicos das rotas Sete Lagoas e Curvelo. Nas próximas partes, vamos adicionar descontos, auxílio, custos fixos e muito mais.
          </div>
        </div>
        <div class="pill">
          <span>Módulo</span>
          <strong>Parte 1/12</strong>
        </div>
      </div>

      <div class="divider"></div>

      <h4>Rota Sete Lagoas</h4>
      <div class="dashboard-grid">
        <div class="dash-card">
          <div class="dash-label">Diárias (SL)</div>
          <input id="sl_diarias" type="number" value="20" min="0" />
        </div>
        <div class="dash-card">
          <div class="dash-label">Valor da passagem (SL)</div>
          <input id="sl_passagem" type="number" value="15" min="0" step="0.01" />
        </div>
        <div class="dash-card">
          <div class="dash-label">Alunos (SL)</div>
          <input id="sl_alunos" type="number" value="10" min="0" />
        </div>
      </div>

      <h4 style="margin-top:18px;">Rota Curvelo</h4>
      <div class="dashboard-grid">
        <div class="dash-card">
          <div class="dash-label">Diárias (CV)</div>
          <input id="cv_diarias" type="number" value="20" min="0" />
        </div>
        <div class="dash-card">
          <div class="dash-label">Valor da passagem (CV)</div>
          <input id="cv_passagem" type="number" value="18" min="0" step="0.01" />
        </div>
        <div class="dash-card">
          <div class="dash-label">Alunos (CV)</div>
          <input id="cv_alunos" type="number" value="8" min="0" />
        </div>
      </div>

      <div class="actions-row">
        <button class="btn-primary" type="button" onclick="calcularBasico()">
          <span>⚙️</span>
          <span>Calcular</span>
        </button>
      </div>

      <div id="resultado-basico" class="dashboard-grid" style="margin-top:18px; display:none;"></div>
    </div>
  `;
}

// ---------------------------
// LÓGICA DO CÁLCULO BÁSICO
// ---------------------------
function calcularBasico() {
  const sl_diarias = Number(document.getElementById("sl_diarias").value);
  const sl_passagem = Number(document.getElementById("sl_passagem").value);
  const sl_alunos = Number(document.getElementById("sl_alunos").value);

  const cv_diarias = Number(document.getElementById("cv_diarias").value);
  const cv_passagem = Number(document.getElementById("cv_passagem").value);
  const cv_alunos = Number(document.getElementById("cv_alunos").value);

  const sl_bruto = sl_diarias * sl_passagem;
  const cv_bruto = cv_diarias * cv_passagem;
  const totalBruto = sl_bruto + cv_bruto;

  const totalAlunos = sl_alunos + cv_alunos;
  const custoAlunoGeral = totalAlunos > 0 ? totalBruto / totalAlunos : 0;

  state.ultimoCalculo = {
    sl_bruto,
    cv_bruto,
    totalBruto,
    totalAlunos,
    custoAlunoGeral,
  };

  const container = document.getElementById("resultado-basico");
  if (!container) return;

  container.style.display = "grid";
  container.innerHTML = `
    <div class="dash-card">
      <div class="dash-label">Bruto Sete Lagoas</div>
      <div class="dash-value">${formatarMoeda(sl_bruto)}</div>
      <div class="dash-footer">Diárias × passagem (SL).</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Bruto Curvelo</div>
      <div class="dash-value">${formatarMoeda(cv_bruto)}</div>
      <div class="dash-footer">Diárias × passagem (CV).</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Bruto total</div>
      <div class="dash-value">${formatarMoeda(totalBruto)}</div>
      <div class="dash-footer">Soma das duas rotas.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Total de alunos</div>
      <div class="dash-value">${totalAlunos}</div>
      <div class="dash-footer">SL + CV.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Custo médio por aluno</div>
      <div class="dash-value">${formatarMoeda(custoAlunoGeral)}</div>
      <div class="dash-footer">Bruto total ÷ total de alunos.</div>
    </div>
  `;

  // Atualiza painel inicial
  render();
}

// ---------------------------
// PLACEHOLDER SIMPLES PARA OUTRAS PÁGINAS
// ---------------------------
function paginaPlaceholder(titulo, texto) {
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title-block">
          <div class="card-title">${titulo}</div>
          <div class="card-subtitle">${texto}</div>
        </div>
        <div class="pill">
          <span>Parte 1/12</span>
        </div>
      </div>
      <div class="divider"></div>
      <p style="font-size:13px; color:var(--text-muted);">
        Nesta primeira parte, apenas a tela de <strong>Cadastro & Cálculo</strong> está funcional.
        As próximas partes vão liberar relatórios, PDF, gráficos e configurações avançadas.
      </p>
    </div>
  `;
}

// ---------------------------
// INICIALIZAÇÃO
// ---------------------------
window.addEventListener("DOMContentLoaded", () => {
  atualizarNav();
  render();
});
// ======================================================================
// ASSEUF - APP.JS PARTE 2/12
// Evolução: Componentização, páginas modulares e cálculo melhorado
// ======================================================================

// ----------------------------------------------------------------------
// SISTEMA DE COMPONENTES (BASE PARA AS PRÓXIMAS PARTES)
// ----------------------------------------------------------------------

const UI = {
  titulo(secao, subtitulo = "") {
    return `
      <div class="card-header">
        <div class="card-title-block">
          <div class="card-title">${secao}</div>
          <div class="card-subtitle">${subtitulo}</div>
        </div>
        <div class="pill">
          <span>Módulo</span>
          <strong>Parte 2/12</strong>
        </div>
      </div>
      <div class="divider"></div>
    `;
  },

  input(label, id, value = "", type = "number") {
    return `
      <div class="dash-card">
        <div class="dash-label">${label}</div>
        <input id="${id}" type="${type}" value="${value}" min="0" />
      </div>
    `;
  },

  bloco(titulo) {
    return `<h4 style="margin-top:18px;">${titulo}</h4>`;
  }
};

// ----------------------------------------------------------------------
// PÁGINA DE CÁLCULO — EVOLUÇÃO PARTE 2
// ----------------------------------------------------------------------

function paginaCalculoBasico() {
  return `
    <div class="card">
      ${UI.titulo(
        "Cadastro & Cálculo — Evolução",
        "Agora com validação e estrutura modular."
      )}

      ${UI.bloco("Rota Sete Lagoas")}
      <div class="dashboard-grid">
        ${UI.input("Diárias (SL)", "sl_diarias", 20)}
        ${UI.input("Valor da passagem (SL)", "sl_passagem", 15)}
        ${UI.input("Alunos (SL)", "sl_alunos", 10)}
      </div>

      ${UI.bloco("Rota Curvelo")}
      <div class="dashboard-grid">
        ${UI.input("Diárias (CV)", "cv_diarias", 20)}
        ${UI.input("Valor da passagem (CV)", "cv_passagem", 18)}
        ${UI.input("Alunos (CV)", "cv_alunos", 8)}
      </div>

      <div class="actions-row">
        <button class="btn-primary" type="button" onclick="calcularParte2()">
          <span>⚙️</span>
          <span>Calcular (Parte 2)</span>
        </button>
      </div>

      <div id="resultado-parte2" class="dashboard-grid" style="margin-top:18px; display:none;"></div>
    </div>
  `;
}

// ----------------------------------------------------------------------
// LÓGICA DO CÁLCULO — PARTE 2
// ----------------------------------------------------------------------

function calcularParte2() {
  const sl_d = Number(document.getElementById("sl_diarias").value);
  const sl_p = Number(document.getElementById("sl_passagem").value);
  const sl_a = Number(document.getElementById("sl_alunos").value);

  const cv_d = Number(document.getElementById("cv_diarias").value);
  const cv_p = Number(document.getElementById("cv_passagem").value);
  const cv_a = Number(document.getElementById("cv_alunos").value);

  // Validação simples
  if ([sl_d, sl_p, sl_a, cv_d, cv_p, cv_a].some(v => v < 0)) {
    alert("Nenhum valor pode ser negativo.");
    return;
  }

  // Cálculos
  const sl_bruto = sl_d * sl_p;
  const cv_bruto = cv_d * cv_p;
  const totalBruto = sl_bruto + cv_bruto;

  const totalAlunos = sl_a + cv_a;
  const custoAlunoGeral = totalAlunos > 0 ? totalBruto / totalAlunos : 0;

  // Salvar no estado
  state.ultimoCalculo = {
    sl_bruto,
    cv_bruto,
    totalBruto,
    totalAlunos,
    custoAlunoGeral,
  };

  // Renderizar resultado
  const box = document.getElementById("resultado-parte2");
  box.style.display = "grid";
  box.innerHTML = `
    <div class="dash-card">
      <div class="dash-label">Bruto SL</div>
      <div class="dash-value">${formatarMoeda(sl_bruto)}</div>
      <div class="dash-footer">Parte 2</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Bruto CV</div>
      <div class="dash-value">${formatarMoeda(cv_bruto)}</div>
      <div class="dash-footer">Parte 2</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Bruto Total</div>
      <div class="dash-value">${formatarMoeda(totalBruto)}</div>
      <div class="dash-footer">Parte 2</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Total de alunos</div>
      <div class="dash-value">${totalAlunos}</div>
      <div class="dash-footer">Parte 2</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Custo médio por aluno</div>
      <div class="dash-value">${formatarMoeda(custoAlunoGeral)}</div>
      <div class="dash-footer">Parte 2</div>
    </div>
  `;

  render(); // atualiza painel inicial
}
// ======================================================================
// ASSEUF - APP.JS PARTE 3/12
// Cálculo com alunos com desconto e valor líquido por rota
// ======================================================================

// Reescreve a página de cálculo para versão mais detalhada
function paginaCalculoBasico() {
  return `
    <div class="card">
      ${UI.titulo(
        "Cadastro & Cálculo — Parte 3",
        "Agora com alunos com desconto e cálculo do valor líquido."
      )}

      ${UI.bloco("Rota Sete Lagoas")}
      <div class="dashboard-grid">
        ${UI.input("Diárias (SL)", "sl_diarias", 20)}
        ${UI.input("Valor da passagem (SL)", "sl_passagem", 15)}
        ${UI.input("Alunos SL (sem desconto)", "sl_alunos", 10)}
        ${UI.input("Alunos SL (com desconto)", "sl_alunos_desc", 2)}
        ${UI.input("% de desconto (SL)", "sl_percent_desc", 50)}
      </div>

      ${UI.bloco("Rota Curvelo")}
      <div class="dashboard-grid">
        ${UI.input("Diárias (CV)", "cv_diarias", 20)}
        ${UI.input("Valor da passagem (CV)", "cv_passagem", 18)}
        ${UI.input("Alunos CV (sem desconto)", "cv_alunos", 8)}
        ${UI.input("Alunos CV (com desconto)", "cv_alunos_desc", 1)}
        ${UI.input("% de desconto (CV)", "cv_percent_desc", 50)}
      </div>

      <div class="actions-row">
        <button class="btn-primary" type="button" onclick="calcularParte3()">
          <span>🧮</span>
          <span>Calcular (Parte 3)</span>
        </button>
      </div>

      <div id="resultado-parte3" class="dashboard-grid" style="margin-top:18px; display:none;"></div>
    </div>
  `;
}

// Lógica de cálculo avançado com desconto
function calcularParte3() {
  // SL
  const sl_d = Number(document.getElementById("sl_diarias").value);
  const sl_p = Number(document.getElementById("sl_passagem").value);
  const sl_a = Number(document.getElementById("sl_alunos").value);
  const sl_a_desc = Number(document.getElementById("sl_alunos_desc").value);
  const sl_percent = Number(document.getElementById("sl_percent_desc").value);

  // CV
  const cv_d = Number(document.getElementById("cv_diarias").value);
  const cv_p = Number(document.getElementById("cv_passagem").value);
  const cv_a = Number(document.getElementById("cv_alunos").value);
  const cv_a_desc = Number(document.getElementById("cv_alunos_desc").value);
  const cv_percent = Number(document.getElementById("cv_percent_desc").value);

  const valores = [sl_d, sl_p, sl_a, sl_a_desc, sl_percent, cv_d, cv_p, cv_a, cv_a_desc, cv_percent];
  if (valores.some(v => v < 0)) {
    alert("Nenhum valor pode ser negativo.");
    return;
  }

  // Bruto por rota
  const sl_bruto = sl_d * sl_p;
  const cv_bruto = cv_d * cv_p;

  // Total de alunos por rota
  const sl_totalAlunos = sl_a + sl_a_desc;
  const cv_totalAlunos = cv_a + cv_a_desc;

  // Mensalidade base por rota
  const sl_base = sl_totalAlunos > 0 ? sl_bruto / sl_totalAlunos : 0;
  const cv_base = cv_totalAlunos > 0 ? cv_bruto / cv_totalAlunos : 0;

  // Desconto total por rota
  const sl_descontoTotal = sl_base * sl_a_desc * (sl_percent / 100);
  const cv_descontoTotal = cv_base * cv_a_desc * (cv_percent / 100);

  // Líquido por rota
  const sl_liquido = sl_bruto - sl_descontoTotal;
  const cv_liquido = cv_bruto - cv_descontoTotal;

  // Geral
  const brutoTotal = sl_bruto + cv_bruto;
  const liquidoTotal = sl_liquido + cv_liquido;
  const totalAlunosGeral = sl_totalAlunos + cv_totalAlunos;
  const custoMedioLiquido = totalAlunosGeral > 0 ? liquidoTotal / totalAlunosGeral : 0;

  // Salva no estado
  state.ultimoCalculo = {
    sl_bruto,
    cv_bruto,
    sl_liquido,
    cv_liquido,
    brutoTotal,
    liquidoTotal,
    totalAlunosGeral,
    custoMedioLiquido,
  };

  const box = document.getElementById("resultado-parte3");
  box.style.display = "grid";
  box.innerHTML = `
    <div class="dash-card">
      <div class="dash-label">Bruto SL</div>
      <div class="dash-value">${formatarMoeda(sl_bruto)}</div>
      <div class="dash-footer">Antes dos descontos.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Líquido SL</div>
      <div class="dash-value">${formatarMoeda(sl_liquido)}</div>
      <div class="dash-footer">Após desconto de alunos.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Bruto CV</div>
      <div class="dash-value">${formatarMoeda(cv_bruto)}</div>
      <div class="dash-footer">Antes dos descontos.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Líquido CV</div>
      <div class="dash-value">${formatarMoeda(cv_liquido)}</div>
      <div class="dash-footer">Após desconto de alunos.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Bruto total</div>
      <div class="dash-value">${formatarMoeda(brutoTotal)}</div>
      <div class="dash-footer">Soma SL + CV.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Líquido total</div>
      <div class="dash-value">${formatarMoeda(liquidoTotal)}</div>
      <div class="dash-footer">Após todos os descontos.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Total de alunos</div>
      <div class="dash-value">${totalAlunosGeral}</div>
      <div class="dash-footer">SL + CV (com e sem desconto).</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Custo médio líquido por aluno</div>
      <div class="dash-value">${formatarMoeda(custoMedioLiquido)}</div>
      <div class="dash-footer">Líquido total ÷ total de alunos.</div>
    </div>
  `;

  render(); // atualiza painel inicial com o novo último cálculo
}
// ======================================================================
// ASSEUF - APP.JS PARTE 4/12
// Custos fixos, custos variáveis, custo operacional e integração total
// ======================================================================

// Expande a página de cálculo para incluir custos fixos e variáveis
function paginaCalculoBasico() {
  return `
    <div class="card">
      ${UI.titulo(
        "Cadastro & Cálculo — Parte 4",
        "Agora com custos fixos, variáveis e custo operacional completo."
      )}

      <!-- ROTAS -->
      ${UI.bloco("Rota Sete Lagoas")}
      <div class="dashboard-grid">
        ${UI.input("Diárias (SL)", "sl_diarias", 20)}
        ${UI.input("Valor da passagem (SL)", "sl_passagem", 15)}
        ${UI.input("Alunos SL (sem desconto)", "sl_alunos", 10)}
        ${UI.input("Alunos SL (com desconto)", "sl_alunos_desc", 2)}
        ${UI.input("% de desconto (SL)", "sl_percent_desc", 50)}
      </div>

      ${UI.bloco("Custos — Sete Lagoas")}
      <div class="dashboard-grid">
        ${UI.input("Custo fixo SL", "sl_custo_fixo", 1200)}
        ${UI.input("Custo variável SL", "sl_custo_var", 600)}
        ${UI.input("Custo por veículo SL", "sl_custo_veic", 300)}
        ${UI.input("Custo por diária SL", "sl_custo_diaria", 40)}
      </div>

      ${UI.bloco("Rota Curvelo")}
      <div class="dashboard-grid">
        ${UI.input("Diárias (CV)", "cv_diarias", 20)}
        ${UI.input("Valor da passagem (CV)", "cv_passagem", 18)}
        ${UI.input("Alunos CV (sem desconto)", "cv_alunos", 8)}
        ${UI.input("Alunos CV (com desconto)", "cv_alunos_desc", 1)}
        ${UI.input("% de desconto (CV)", "cv_percent_desc", 50)}
      </div>

      ${UI.bloco("Custos — Curvelo")}
      <div class="dashboard-grid">
        ${UI.input("Custo fixo CV", "cv_custo_fixo", 900)}
        ${UI.input("Custo variável CV", "cv_custo_var", 500)}
        ${UI.input("Custo por veículo CV", "cv_custo_veic", 250)}
        ${UI.input("Custo por diária CV", "cv_custo_diaria", 35)}
      </div>

      <div class="actions-row">
        <button class="btn-primary" type="button" onclick="calcularParte4()">
          <span>🧮</span>
          <span>Calcular (Parte 4)</span>
        </button>
      </div>

      <div id="resultado-parte4" class="dashboard-grid" style="margin-top:18px; display:none;"></div>
    </div>
  `;
}

// Lógica completa da Parte 4
function calcularParte4() {
  // -----------------------------
  // CAPTURA DE DADOS
  // -----------------------------

  // SL
  const sl_d = Number(sl_diarias.value);
  const sl_p = Number(sl_passagem.value);
  const sl_a = Number(sl_alunos.value);
  const sl_a_desc = Number(sl_alunos_desc.value);
  const sl_percent = Number(sl_percent_desc.value);

  const sl_fix = Number(sl_custo_fixo.value);
  const sl_var = Number(sl_custo_var.value);
  const sl_veic = Number(sl_custo_veic.value);
  const sl_diaria_custo = Number(sl_custo_diaria.value);

  // CV
  const cv_d = Number(cv_diarias.value);
  const cv_p = Number(cv_passagem.value);
  const cv_a = Number(cv_alunos.value);
  const cv_a_desc = Number(cv_alunos_desc.value);
  const cv_percent = Number(cv_percent_desc.value);

  const cv_fix = Number(cv_custo_fixo.value);
  const cv_var = Number(cv_custo_var.value);
  const cv_veic = Number(cv_custo_veic.value);
  const cv_diaria_custo = Number(cv_custo_diaria.value);

  // -----------------------------
  // CÁLCULO BRUTO
  // -----------------------------
  const sl_bruto = sl_d * sl_p;
  const cv_bruto = cv_d * cv_p;

  // -----------------------------
  // CÁLCULO DE DESCONTOS
  // -----------------------------
  const sl_totalAlunos = sl_a + sl_a_desc;
  const cv_totalAlunos = cv_a + cv_a_desc;

  const sl_base = sl_totalAlunos > 0 ? sl_bruto / sl_totalAlunos : 0;
  const cv_base = cv_totalAlunos > 0 ? cv_bruto / cv_totalAlunos : 0;

  const sl_descontoTotal = sl_base * sl_a_desc * (sl_percent / 100);
  const cv_descontoTotal = cv_base * cv_a_desc * (cv_percent / 100);

  const sl_liquido = sl_bruto - sl_descontoTotal;
  const cv_liquido = cv_bruto - cv_descontoTotal;

  // -----------------------------
  // CUSTOS OPERACIONAIS
  // -----------------------------
  const sl_operacional =
    sl_fix + sl_var + sl_veic + sl_diaria_custo * sl_d;

  const cv_operacional =
    cv_fix + cv_var + cv_veic + cv_diaria_custo * cv_d;

  // -----------------------------
  // RESULTADOS GERAIS
  // -----------------------------
  const brutoTotal = sl_bruto + cv_bruto;
  const liquidoTotal = sl_liquido + cv_liquido;
  const operacionalTotal = sl_operacional + cv_operacional;

  const totalAlunosGeral = sl_totalAlunos + cv_totalAlunos;

  const custoOperAluno =
    totalAlunosGeral > 0 ? operacionalTotal / totalAlunosGeral : 0;

  // -----------------------------
  // SALVAR NO ESTADO
  // -----------------------------
  state.ultimoCalculo = {
    sl_bruto,
    cv_bruto,
    sl_liquido,
    cv_liquido,
    sl_operacional,
    cv_operacional,
    brutoTotal,
    liquidoTotal,
    operacionalTotal,
    totalAlunosGeral,
    custoOperAluno,
  };

  // -----------------------------
  // RENDERIZAÇÃO
  // -----------------------------
  const box = document.getElementById("resultado-parte4");
  box.style.display = "grid";

  box.innerHTML = `
    <div class="dash-card">
      <div class="dash-label">Bruto SL</div>
      <div class="dash-value">${formatarMoeda(sl_bruto)}</div>
      <div class="dash-footer">Receita total antes de descontos.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Líquido SL</div>
      <div class="dash-value">${formatarMoeda(sl_liquido)}</div>
      <div class="dash-footer">Após descontos.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Operacional SL</div>
      <div class="dash-value">${formatarMoeda(sl_operacional)}</div>
      <div class="dash-footer">Custos fixos + variáveis + veículo + diárias.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Bruto CV</div>
      <div class="dash-value">${formatarMoeda(cv_bruto)}</div>
      <div class="dash-footer">Receita total antes de descontos.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Líquido CV</div>
      <div class="dash-value">${formatarMoeda(cv_liquido)}</div>
      <div class="dash-footer">Após descontos.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Operacional CV</div>
      <div class="dash-value">${formatarMoeda(cv_operacional)}</div>
      <div class="dash-footer">Custos fixos + variáveis + veículo + diárias.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Operacional total</div>
      <div class="dash-value">${formatarMoeda(operacionalTotal)}</div>
      <div class="dash-footer">Soma SL + CV.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Custo operacional por aluno</div>
      <div class="dash-value">${formatarMoeda(custoOperAluno)}</div>
      <div class="dash-footer">Operacional total ÷ total de alunos.</div>
    </div>
  `;

  render();
}
// ======================================================================
// ASSEUF - APP.JS PARTE 5/12
// Auxílio, desconto global e custo final completo
// ======================================================================

// Expande a página de cálculo para incluir auxílio e desconto global
function paginaCalculoBasico() {
  return `
    <div class="card">
      ${UI.titulo(
        "Cadastro & Cálculo — Parte 5",
        "Agora com auxílio, desconto global e custo final completo."
      )}

      <!-- ROTAS -->
      ${UI.bloco("Rota Sete Lagoas")}
      <div class="dashboard-grid">
        ${UI.input("Diárias (SL)", "sl_diarias", 20)}
        ${UI.input("Valor da passagem (SL)", "sl_passagem", 15)}
        ${UI.input("Alunos SL (sem desconto)", "sl_alunos", 10)}
        ${UI.input("Alunos SL (com desconto)", "sl_alunos_desc", 2)}
        ${UI.input("% de desconto (SL)", "sl_percent_desc", 50)}
      </div>

      ${UI.bloco("Custos — Sete Lagoas")}
      <div class="dashboard-grid">
        ${UI.input("Custo fixo SL", "sl_custo_fixo", 1200)}
        ${UI.input("Custo variável SL", "sl_custo_var", 600)}
        ${UI.input("Custo por veículo SL", "sl_custo_veic", 300)}
        ${UI.input("Custo por diária SL", "sl_custo_diaria", 40)}
      </div>

      ${UI.bloco("Rota Curvelo")}
      <div class="dashboard-grid">
        ${UI.input("Diárias (CV)", "cv_diarias", 20)}
        ${UI.input("Valor da passagem (CV)", "cv_passagem", 18)}
        ${UI.input("Alunos CV (sem desconto)", "cv_alunos", 8)}
        ${UI.input("Alunos CV (com desconto)", "cv_alunos_desc", 1)}
        ${UI.input("% de desconto (CV)", "cv_percent_desc", 50)}
      </div>

      ${UI.bloco("Custos — Curvelo")}
      <div class="dashboard-grid">
        ${UI.input("Custo fixo CV", "cv_custo_fixo", 900)}
        ${UI.input("Custo variável CV", "cv_custo_var", 500)}
        ${UI.input("Custo por veículo CV", "cv_custo_veic", 250)}
        ${UI.input("Custo por diária CV", "cv_custo_diaria", 35)}
      </div>

      ${UI.bloco("Auxílio e Desconto Global")}
      <div class="dashboard-grid">
        ${UI.input("Auxílio total (R$)", "aux_total", 0)}
        ${UI.input("Desconto global (%)", "desc_global", 0)}
      </div>

      <div class="actions-row">
        <button class="btn-primary" type="button" onclick="calcularParte5()">
          <span>🧮</span>
          <span>Calcular (Parte 5)</span>
        </button>
      </div>

      <div id="resultado-parte5" class="dashboard-grid" style="margin-top:18px; display:none;"></div>
    </div>
  `;
}

// Lógica completa da Parte 5
function calcularParte5() {
  // -----------------------------
  // CAPTURA DE DADOS
  // -----------------------------

  // SL
  const sl_d = Number(sl_diarias.value);
  const sl_p = Number(sl_passagem.value);
  const sl_a = Number(sl_alunos.value);
  const sl_a_desc = Number(sl_alunos_desc.value);
  const sl_percent = Number(sl_percent_desc.value);

  const sl_fix = Number(sl_custo_fixo.value);
  const sl_var = Number(sl_custo_var.value);
  const sl_veic = Number(sl_custo_veic.value);
  const sl_diaria_custo = Number(sl_custo_diaria.value);

  // CV
  const cv_d = Number(cv_diarias.value);
  const cv_p = Number(cv_passagem.value);
  const cv_a = Number(cv_alunos.value);
  const cv_a_desc = Number(cv_alunos_desc.value);
  const cv_percent = Number(cv_percent_desc.value);

  const cv_fix = Number(cv_custo_fixo.value);
  const cv_var = Number(cv_custo_var.value);
  const cv_veic = Number(cv_custo_veic.value);
  const cv_diaria_custo = Number(cv_custo_diaria.value);

  // Auxílio e desconto global
  const aux_total = Number(aux_total.value);
  const desc_global = Number(desc_global.value);

  // -----------------------------
  // CÁLCULO BRUTO
  // -----------------------------
  const sl_bruto = sl_d * sl_p;
  const cv_bruto = cv_d * cv_p;

  // -----------------------------
  // CÁLCULO DE DESCONTOS
  // -----------------------------
  const sl_totalAlunos = sl_a + sl_a_desc;
  const cv_totalAlunos = cv_a + cv_a_desc;

  const sl_base = sl_totalAlunos > 0 ? sl_bruto / sl_totalAlunos : 0;
  const cv_base = cv_totalAlunos > 0 ? cv_bruto / cv_totalAlunos : 0;

  const sl_descontoTotal = sl_base * sl_a_desc * (sl_percent / 100);
  const cv_descontoTotal = cv_base * cv_a_desc * (cv_percent / 100);

  const sl_liquido = sl_bruto - sl_descontoTotal;
  const cv_liquido = cv_bruto - cv_descontoTotal;

  // -----------------------------
  // CUSTOS OPERACIONAIS
  // -----------------------------
  const sl_operacional =
    sl_fix + sl_var + sl_veic + sl_diaria_custo * sl_d;

  const cv_operacional =
    cv_fix + cv_var + cv_veic + cv_diaria_custo * cv_d;

  // -----------------------------
  // APLICAÇÃO DO AUXÍLIO
  // -----------------------------
  const liquidoComAuxilio = sl_liquido + cv_liquido - aux_total;

  // -----------------------------
  // DESCONTO GLOBAL
  // -----------------------------
  const valorDescontoGlobal = liquidoComAuxilio * (desc_global / 100);
  const liquidoFinal = liquidoComAuxilio - valorDescontoGlobal;

  // -----------------------------
  // RESULTADOS GERAIS
  // -----------------------------
  const brutoTotal = sl_bruto + cv_bruto;
  const liquidoTotal = sl_liquido + cv_liquido;
  const operacionalTotal = sl_operacional + cv_operacional;

  const totalAlunosGeral = sl_totalAlunos + cv_totalAlunos;

  const custoFinalAluno =
    totalAlunosGeral > 0 ? liquidoFinal / totalAlunosGeral : 0;

  // -----------------------------
  // SALVAR NO ESTADO
  // -----------------------------
  state.ultimoCalculo = {
    sl_bruto,
    cv_bruto,
    sl_liquido,
    cv_liquido,
    sl_operacional,
    cv_operacional,
    brutoTotal,
    liquidoTotal,
    operacionalTotal,
    aux_total,
    desc_global,
    liquidoFinal,
    custoFinalAluno,
  };

  // -----------------------------
  // RENDERIZAÇÃO
  // -----------------------------
  const box = document.getElementById("resultado-parte5");
  box.style.display = "grid";

  box.innerHTML = `
    <div class="dash-card">
      <div class="dash-label">Bruto total</div>
      <div class="dash-value">${formatarMoeda(brutoTotal)}</div>
      <div class="dash-footer">Receita antes de qualquer desconto.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Líquido total</div>
      <div class="dash-value">${formatarMoeda(liquidoTotal)}</div>
      <div class="dash-footer">Após descontos individuais.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Auxílio aplicado</div>
      <div class="dash-value">-${formatarMoeda(aux_total)}</div>
      <div class="dash-footer">Redução direta no valor final.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Desconto global</div>
      <div class="dash-value">-${formatarMoeda(valorDescontoGlobal)}</div>
      <div class="dash-footer">${desc_global}% sobre o valor com auxílio.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Líquido final</div>
      <div class="dash-value">${formatarMoeda(liquidoFinal)}</div>
      <div class="dash-footer">Valor final após tudo.</div>
    </div>

    <div class="dash-card">
      <div class="dash-label">Custo final por aluno</div>
      <div class="dash-value">${formatarMoeda(custoFinalAluno)}</div>
      <div class="dash-footer">Líquido final ÷ total de alunos.</div>
    </div>
  `;

  render();
}
// ======================================================================
// ASSEUF - APP.JS PARTE 6/12
// Gráficos, dashboard visual e percentuais automáticos
// ======================================================================

// Adiciona uma nova página: Dashboard Visual
function paginaDashboardVisual() {
  const calc = state.ultimoCalculo;

  if (!calc) {
    return `
      <div class="card">
        ${UI.titulo("Dashboard Visual", "Nenhum cálculo encontrado")}
        <p style="color:var(--text-muted); font-size:13px;">
          Faça um cálculo primeiro para visualizar os gráficos.
        </p>
      </div>
    `;
  }

  return `
    <div class="card">
      ${UI.titulo("Dashboard Visual — Parte 6", "Gráficos automáticos e comparações")}

      <div class="dashboard-grid">
        <div class="dash-card">
          <div class="dash-label">Bruto total</div>
          <div class="dash-value">${formatarMoeda(calc.brutoTotal)}</div>
          <div class="dash-footer">Receita antes de descontos.</div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Líquido final</div>
          <div class="dash-value">${formatarMoeda(calc.liquidoFinal)}</div>
          <div class="dash-footer">Após auxílio e desconto global.</div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Operacional total</div>
          <div class="dash-value">${formatarMoeda(calc.operacionalTotal)}</div>
          <div class="dash-footer">Custos totais das rotas.</div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Custo final por aluno</div>
          <div class="dash-value">${formatarMoeda(calc.custoFinalAluno)}</div>
          <div class="dash-footer">Valor final dividido pelos alunos.</div>
        </div>
      </div>

      <h4 style="margin-top:20px;">Gráficos</h4>

      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; margin-top:14px;">
        <canvas id="graficoPizza"></canvas>
        <canvas id="graficoBarras"></canvas>
        <canvas id="graficoDonut"></canvas>
      </div>
    </div>
  `;
}

// Adiciona botão no menu
function atualizarNav() {
  const navRoot = document.getElementById("nav-root");
  if (!navRoot) return;

  navRoot.innerHTML = `
    ${botaoNav("inicio", "Início", "🏠")}
    ${botaoNav("calculo", "Cadastro & Cálculo", "🧮")}
    ${botaoNav("dashboard", "Dashboard Visual", "📊")}
    ${botaoNav("pdf", "PDF", "📄", true)}
    ${botaoNav("config", "Configurações", "⚙️", true)}
  `;

  [...navRoot.querySelectorAll("[data-page]")].forEach((btn) => {
    const page = btn.getAttribute("data-page");
    if (page === state.paginaAtual) btn.classList.add("active");
    else btn.classList.remove("active");
  });
}

// Renderização com nova página
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  let conteudo = "";

  switch (state.paginaAtual) {
    case "inicio":
      conteudo = paginaInicio();
      break;
    case "calculo":
      conteudo = paginaCalculoBasico();
      break;
    case "dashboard":
      conteudo = paginaDashboardVisual();
      break;
    case "pdf":
      conteudo = paginaPlaceholder("PDF", "O gerador de PDF virá nas próximas partes.");
      break;
    case "config":
      conteudo = paginaPlaceholder("Configurações", "Configurações avançadas virão depois.");
      break;
    default:
      conteudo = `<div class="card"><p>Erro ao carregar página.</p></div>`;
  }

  app.innerHTML = conteudo;

  // Se estiver no dashboard, gerar gráficos
  if (state.paginaAtual === "dashboard") {
    setTimeout(gerarGraficosParte6, 50);
  }
}

// Função para gerar gráficos
function gerarGraficosParte6() {
  const calc = state.ultimoCalculo;
  if (!calc) return;

  // -----------------------------
  // GRÁFICO PIZZA — Distribuição Bruta SL × CV
  // -----------------------------
  new Chart(document.getElementById("graficoPizza"), {
    type: "pie",
    data: {
      labels: ["Sete Lagoas", "Curvelo"],
      datasets: [
        {
          data: [calc.sl_bruto, calc.cv_bruto],
          backgroundColor: ["#4CAF50", "#66BB6A"],
        },
      ],
    },
  });

  // -----------------------------
  // GRÁFICO BARRAS — Bruto × Líquido × Operacional
  // -----------------------------
  new Chart(document.getElementById("graficoBarras"), {
    type: "bar",
    data: {
      labels: ["Bruto", "Líquido Final", "Operacional"],
      datasets: [
        {
          label: "Valores",
          data: [calc.brutoTotal, calc.liquidoFinal, calc.operacionalTotal],
          backgroundColor: ["#4CAF50", "#42A5F5", "#EF5350"],
        },
      ],
    },
  });

  // -----------------------------
  // GRÁFICO DONUT — Percentual de custos
  // -----------------------------
  new Chart(document.getElementById("graficoDonut"), {
    type: "doughnut",
    data: {
      labels: ["Operacional", "Auxílio", "Desconto Global"],
      datasets: [
        {
          data: [
            calc.operacionalTotal,
            calc.aux_total,
            calc.liquidoTotal - calc.liquidoFinal,
          ],
          backgroundColor: ["#AB47BC", "#FFCA28", "#29B6F6"],
        },
      ],
    },
  });
}
// ======================================================================
// ASSEUF - APP.JS PARTE 7/12
// Histórico de cálculos, resumo mensal e evolução
// ======================================================================

// Estrutura de histórico
if (!state.historico) {
  state.historico = {}; // { "2025-02": { bruto, liquido, operacional, alunos, ... } }
}

// Função para salvar cálculo no histórico
function salvarNoHistorico() {
  const calc = state.ultimoCalculo;
  if (!calc) return;

  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");

  const chave = `${ano}-${mes}`;

  if (!state.historico[chave]) {
    state.historico[chave] = {
      bruto: 0,
      liquido: 0,
      operacional: 0,
      alunos: 0,
      auxilio: 0,
      descontoGlobal: 0,
      liquidoFinal: 0,
      registros: 0,
    };
  }

  const h = state.historico[chave];

  h.bruto += calc.brutoTotal;
  h.liquido += calc.liquidoTotal;
  h.operacional += calc.operacionalTotal;
  h.alunos += calc.totalAlunosGeral;
  h.auxilio += calc.aux_total;
  h.descontoGlobal += calc.desc_global;
  h.liquidoFinal += calc.liquidoFinal;
  h.registros += 1;
}

// Modifica o render para incluir nova página
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  let conteudo = "";

  switch (state.paginaAtual) {
    case "inicio":
      conteudo = paginaInicio();
      break;
    case "calculo":
      conteudo = paginaCalculoBasico();
      break;
    case "dashboard":
      conteudo = paginaDashboardVisual();
      break;
    case "historico":
      conteudo = paginaHistorico();
      break;
    case "pdf":
      conteudo = paginaPlaceholder("PDF", "O gerador de PDF virá nas próximas partes.");
      break;
    case "config":
      conteudo = paginaPlaceholder("Configurações", "Configurações avançadas virão depois.");
      break;
    default:
      conteudo = `<div class="card"><p>Erro ao carregar página.</p></div>`;
  }

  app.innerHTML = conteudo;

  if (state.paginaAtual === "dashboard") {
    setTimeout(gerarGraficosParte6, 50);
  }
}

// Adiciona botão no menu
function atualizarNav() {
  const navRoot = document.getElementById("nav-root");
  if (!navRoot) return;

  navRoot.innerHTML = `
    ${botaoNav("inicio", "Início", "🏠")}
    ${botaoNav("calculo", "Cadastro & Cálculo", "🧮")}
    ${botaoNav("dashboard", "Dashboard Visual", "📊")}
    ${botaoNav("historico", "Histórico", "📅")}
    ${botaoNav("pdf", "PDF", "📄", true)}
    ${botaoNav("config", "Configurações", "⚙️", true)}
  `;

  [...navRoot.querySelectorAll("[data-page]")].forEach((btn) => {
    const page = btn.getAttribute("data-page");
    if (page === state.paginaAtual) btn.classList.add("active");
    else btn.classList.remove("active");
  });
}

// Página de histórico
function paginaHistorico() {
  const meses = Object.keys(state.historico).sort();

  if (meses.length === 0) {
    return `
      <div class="card">
        ${UI.titulo("Histórico de Cálculos", "Nenhum cálculo registrado ainda")}
        <p style="color:var(--text-muted); font-size:13px;">
          Faça um cálculo para começar a registrar o histórico.
        </p>
      </div>
    `;
  }

  let cards = "";

  for (const mes of meses) {
    const h = state.historico[mes];

    cards += `
      <div class="dash-card">
        <div class="dash-label">${mes}</div>
        <div class="dash-value">${formatarMoeda(h.liquidoFinal)}</div>
        <div class="dash-footer">
          ${h.registros} cálculos registrados<br>
          Bruto: ${formatarMoeda(h.bruto)}<br>
          Operacional: ${formatarMoeda(h.operacional)}<br>
          Alunos: ${h.alunos}
        </div>
      </div>
    `;
  }

  return `
    <div class="card">
      ${UI.titulo("Histórico de Cálculos — Parte 7", "Resumo mensal e evolução")}

      <div class="dashboard-grid">
        ${cards}
      </div>
    </div>
  `;
}

// Integração: toda vez que calcular, salva no histórico
const _oldCalcularParte5 = calcularParte5;
calcularParte5 = function () {
  _oldCalcularParte5();
  salvarNoHistorico();
};
// ======================================================================
// ASSEUF - APP.JS PARTE 8/12
// Relatórios avançados: mensal, anual, comparações e resumo financeiro
// ======================================================================

// -----------------------------
// PÁGINA DE RELATÓRIOS
// -----------------------------
function paginaRelatoriosAvancados() {
  const meses = Object.keys(state.historico).sort();

  if (meses.length === 0) {
    return `
      <div class="card">
        ${UI.titulo("Relatórios Avançados", "Nenhum dado disponível")}
        <p style="color:var(--text-muted); font-size:13px;">
          Faça pelo menos um cálculo para gerar relatórios.
        </p>
      </div>
    `;
  }

  let cards = "";
  let totalBrutoAno = 0;
  let totalLiquidoAno = 0;
  let totalOperacionalAno = 0;
  let totalAlunosAno = 0;
  let totalAuxilioAno = 0;
  let totalDescGlobalAno = 0;

  for (const mes of meses) {
    const h = state.historico[mes];

    totalBrutoAno += h.bruto;
    totalLiquidoAno += h.liquidoFinal;
    totalOperacionalAno += h.operacional;
    totalAlunosAno += h.alunos;
    totalAuxilioAno += h.auxilio;
    totalDescGlobalAno += h.descontoGlobal;

    cards += `
      <div class="dash-card">
        <div class="dash-label">${mes}</div>
        <div class="dash-value">${formatarMoeda(h.liquidoFinal)}</div>
        <div class="dash-footer">
          Bruto: ${formatarMoeda(h.bruto)}<br>
          Operacional: ${formatarMoeda(h.operacional)}<br>
          Auxílio: ${formatarMoeda(h.auxilio)}<br>
          Desc. Global: ${h.descontoGlobal}%<br>
          Alunos: ${h.alunos}<br>
          Registros: ${h.registros}
        </div>
      </div>
    `;
  }

  const custoMedioAno =
    totalAlunosAno > 0 ? totalLiquidoAno / totalAlunosAno : 0;

  return `
    <div class="card">
      ${UI.titulo("Relatórios Avançados — Parte 8", "Resumo mensal, anual e comparações")}

      <h4>Resumo Mensal</h4>
      <div class="dashboard-grid">${cards}</div>

      <h4 style="margin-top:20px;">Resumo Anual</h4>
      <div class="dashboard-grid">
        <div class="dash-card">
          <div class="dash-label">Bruto anual</div>
          <div class="dash-value">${formatarMoeda(totalBrutoAno)}</div>
          <div class="dash-footer">Soma de todos os meses.</div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Líquido anual</div>
          <div class="dash-value">${formatarMoeda(totalLiquidoAno)}</div>
          <div class="dash-footer">Após auxílio e descontos.</div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Operacional anual</div>
          <div class="dash-value">${formatarMoeda(totalOperacionalAno)}</div>
          <div class="dash-footer">Custos totais do ano.</div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Auxílio total</div>
          <div class="dash-value">${formatarMoeda(totalAuxilioAno)}</div>
          <div class="dash-footer">Soma do auxílio aplicado.</div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Desconto global médio</div>
          <div class="dash-value">${(totalDescGlobalAno / meses.length).toFixed(2)}%</div>
          <div class="dash-footer">Média anual.</div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Custo médio por aluno (ano)</div>
          <div class="dash-value">${formatarMoeda(custoMedioAno)}</div>
          <div class="dash-footer">Líquido anual ÷ alunos.</div>
        </div>
      </div>

      <h4 style="margin-top:20px;">Comparação SL × CV</h4>
      <div class="dashboard-grid">
        <div class="dash-card">
          <div class="dash-label">Participação SL no bruto</div>
          <div class="dash-value">${calcularPercentual(calcTotal("sl_bruto"), calcTotal("sl_bruto") + calcTotal("cv_bruto"))}%</div>
          <div class="dash-footer">Baseado no histórico.</div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Participação CV no bruto</div>
          <div class="dash-value">${calcularPercentual(calcTotal("cv_bruto"), calcTotal("sl_bruto") + calcTotal("cv_bruto"))}%</div>
          <div class="dash-footer">Baseado no histórico.</div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Participação SL no líquido</div>
          <div class="dash-value">${calcularPercentual(calcTotal("sl_liquido"), calcTotal("sl_liquido") + calcTotal("cv_liquido"))}%</div>
          <div class="dash-footer">Após descontos.</div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Participação CV no líquido</div>
          <div class="dash-value">${calcularPercentual(calcTotal("cv_liquido"), calcTotal("sl_liquido") + calcTotal("cv_liquido"))}%</div>
          <div class="dash-footer">Após descontos.</div>
        </div>
      </div>
    </div>
  `;
}

// Função auxiliar para somar valores do histórico
function calcTotal(campo) {
  let total = 0;
  for (const mes of Object.keys(state.historico)) {
    const h = state.historico[mes];
    if (h[campo] !== undefined) total += h[campo];
  }
  return total;
}

// Percentual seguro
function calcularPercentual(valor, total) {
  if (total === 0) return 0;
  return ((valor / total) * 100).toFixed(1);
}

// Adiciona botão no menu
function atualizarNav() {
  const navRoot = document.getElementById("nav-root");
  if (!navRoot) return;

  navRoot.innerHTML = `
    ${botaoNav("inicio", "Início", "🏠")}
    ${botaoNav("calculo", "Cadastro & Cálculo", "🧮")}
    ${botaoNav("dashboard", "Dashboard Visual", "📊")}
    ${botaoNav("historico", "Histórico", "📅")}
    ${botaoNav("relatorios", "Relatórios", "📘")}
    ${botaoNav("pdf", "PDF", "📄", true)}
    ${botaoNav("config", "Configurações", "⚙️", true)}
  `;

  [...navRoot.querySelectorAll("[data-page]")].forEach((btn) => {
    const page = btn.getAttribute("data-page");
    if (page === state.paginaAtual) btn.classList.add("active");
    else btn.classList.remove("active");
  });
}

// Render com nova página
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  let conteudo = "";

  switch (state.paginaAtual) {
    case "inicio":
      conteudo = paginaInicio();
      break;
    case "calculo":
      conteudo = paginaCalculoBasico();
      break;
    case "dashboard":
      conteudo = paginaDashboardVisual();
      break;
    case "historico":
      conteudo = paginaHistorico();
      break;
    case "relatorios":
      conteudo = paginaRelatoriosAvancados();
      break;
    case "pdf":
      conteudo = paginaPlaceholder("PDF", "O gerador de PDF virá nas próximas partes.");
      break;
    case "config":
      conteudo = paginaPlaceholder("Configurações", "Configurações avançadas virão depois.");
      break;
    default:
      conteudo = `<div class="card"><p>Erro ao carregar página.</p></div>`;
  }

  app.innerHTML = conteudo;

  if (state.paginaAtual === "dashboard") {
    setTimeout(gerarGraficosParte6, 50);
  }
}
// ======================================================================
// ASSEUF - APP.JS PARTE 9/12
// Gerador de PDF profissional com capa, tabelas e gráficos
// ======================================================================

// Página de PDF
function paginaPDF() {
  return `
    <div class="card">
      ${UI.titulo("Gerador de PDF — Parte 9", "Exportação profissional de relatórios")}

      <p style="font-size:13px; color:var(--text-muted); margin-bottom:14px;">
        Gere um PDF completo com capa, resumo mensal, resumo anual, gráficos e dados detalhados.
      </p>

      <div class="actions-row">
        <button class="btn-primary" onclick="gerarPDFParte9()">
          <span>📄</span>
          <span>Gerar PDF Completo</span>
        </button>
      </div>

      <div style="margin-top:20px;">
        <h4>Prévia do conteúdo</h4>
        <p style="font-size:13px; color:var(--text-muted);">
          O PDF incluirá:
          <br>• Capa com título e data
          <br>• Último cálculo completo
          <br>• Resumo mensal
          <br>• Resumo anual
          <br>• Comparação SL × CV
          <br>• Gráficos do dashboard
        </p>
      </div>
    </div>
  `;
}

// Atualiza o menu para incluir PDF
function atualizarNav() {
  const navRoot = document.getElementById("nav-root");
  if (!navRoot) return;

  navRoot.innerHTML = `
    ${botaoNav("inicio", "Início", "🏠")}
    ${botaoNav("calculo", "Cadastro & Cálculo", "🧮")}
    ${botaoNav("dashboard", "Dashboard Visual", "📊")}
    ${botaoNav("historico", "Histórico", "📅")}
    ${botaoNav("relatorios", "Relatórios", "📘")}
    ${botaoNav("pdf", "PDF", "📄")}
    ${botaoNav("config", "Configurações", "⚙️", true)}
  `;

  [...navRoot.querySelectorAll("[data-page]")].forEach((btn) => {
    const page = btn.getAttribute("data-page");
    if (page === state.paginaAtual) btn.classList.add("active");
    else btn.classList.remove("active");
  });
}

// Render com página PDF
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  let conteudo = "";

  switch (state.paginaAtual) {
    case "inicio":
      conteudo = paginaInicio();
      break;
    case "calculo":
      conteudo = paginaCalculoBasico();
      break;
    case "dashboard":
      conteudo = paginaDashboardVisual();
      break;
    case "historico":
      conteudo = paginaHistorico();
      break;
    case "relatorios":
      conteudo = paginaRelatoriosAvancados();
      break;
    case "pdf":
      conteudo = paginaPDF();
      break;
    case "config":
      conteudo = paginaPlaceholder("Configurações", "Configurações avançadas virão depois.");
      break;
    default:
      conteudo = `<div class="card"><p>Erro ao carregar página.</p></div>`;
  }

  app.innerHTML = conteudo;

  if (state.paginaAtual === "dashboard") {
    setTimeout(gerarGraficosParte6, 50);
  }
}

// Função principal de geração de PDF
async function gerarPDFParte9() {
  if (!state.ultimoCalculo) {
    alert("Faça um cálculo antes de gerar o PDF.");
    return;
  }

  const calc = state.ultimoCalculo;

  const pdf = new jspdf.jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  // -----------------------------
  // CAPA
  // -----------------------------
  pdf.setFontSize(26);
  pdf.text("ASSEUF — Relatório Completo", 40, 80);

  pdf.setFontSize(14);
  pdf.text("Sistema Avançado de Gestão de Rotas e Alunos", 40, 110);

  const dataAtual = new Date().toLocaleDateString("pt-BR");
  pdf.text(`Data: ${dataAtual}`, 40, 150);

  pdf.setFontSize(12);
  pdf.text("Relatório gerado automaticamente pelo sistema ASSEUF.", 40, 180);

  pdf.addPage();

  // -----------------------------
  // ÚLTIMO CÁLCULO
  // -----------------------------
  pdf.setFontSize(20);
  pdf.text("Último Cálculo", 40, 60);

  pdf.setFontSize(12);
  pdf.text(`Bruto total: ${formatarMoeda(calc.brutoTotal)}`, 40, 100);
  pdf.text(`Líquido total: ${formatarMoeda(calc.liquidoTotal)}`, 40, 120);
  pdf.text(`Operacional total: ${formatarMoeda(calc.operacionalTotal)}`, 40, 140);
  pdf.text(`Auxílio aplicado: ${formatarMoeda(calc.aux_total)}`, 40, 160);
  pdf.text(`Desconto global: ${calc.desc_global}%`, 40, 180);
  pdf.text(`Líquido final: ${formatarMoeda(calc.liquidoFinal)}`, 40, 200);
  pdf.text(`Custo final por aluno: ${formatarMoeda(calc.custoFinalAluno)}`, 40, 220);

  pdf.addPage();

  // -----------------------------
  // RESUMO MENSAL
  // -----------------------------
  pdf.setFontSize(20);
  pdf.text("Resumo Mensal", 40, 60);

  let y = 100;

  for (const mes of Object.keys(state.historico).sort()) {
    const h = state.historico[mes];

    pdf.setFontSize(14);
    pdf.text(`${mes}`, 40, y);

    pdf.setFontSize(11);
    pdf.text(`Bruto: ${formatarMoeda(h.bruto)}`, 60, y + 20);
    pdf.text(`Líquido final: ${formatarMoeda(h.liquidoFinal)}`, 60, y + 40);
    pdf.text(`Operacional: ${formatarMoeda(h.operacional)}`, 60, y + 60);
    pdf.text(`Alunos: ${h.alunos}`, 60, y + 80);

    y += 120;

    if (y > 700) {
      pdf.addPage();
      y = 60;
    }
  }

  pdf.addPage();

  // -----------------------------
  // RESUMO ANUAL
  // -----------------------------
  pdf.setFontSize(20);
  pdf.text("Resumo Anual", 40, 60);

  const totalBrutoAno = calcTotal("bruto");
  const totalLiquidoAno = calcTotal("liquidoFinal");
  const totalOperacionalAno = calcTotal("operacional");
  const totalAlunosAno = calcTotal("alunos");

  pdf.setFontSize(12);
  pdf.text(`Bruto anual: ${formatarMoeda(totalBrutoAno)}`, 40, 100);
  pdf.text(`Líquido anual: ${formatarMoeda(totalLiquidoAno)}`, 40, 120);
  pdf.text(`Operacional anual: ${formatarMoeda(totalOperacionalAno)}`, 40, 140);
  pdf.text(`Alunos no ano: ${totalAlunosAno}`, 40, 160);

  pdf.addPage();

  // -----------------------------
  // GRÁFICOS (captura do dashboard)
  // -----------------------------
  pdf.setFontSize(20);
  pdf.text("Gráficos", 40, 60);

  // Renderiza dashboard temporariamente
  state.paginaAtual = "dashboard";
  render();

  await new Promise((r) => setTimeout(r, 300));

  const dashboard = document.querySelector(".card");
  const canvasImg = await html2canvas(dashboard).then((c) => c.toDataURL("image/png"));

  pdf.addImage(canvasImg, "PNG", 20, 100, 560, 700);

  // -----------------------------
  // SALVAR PDF
  // -----------------------------
  pdf.save(`ASSEUF-Relatorio-${dataAtual}.pdf`);

  // Volta para a página PDF
  state.paginaAtual = "pdf";
  render();
}
// ======================================================================
// ASSEUF - APP.JS PARTE 10/12
// Configurações avançadas: tema, preferências, backup e reset
// ======================================================================

// -----------------------------
// ESTADO DE CONFIGURAÇÕES
// -----------------------------
if (!state.config) {
  state.config = {
    tema: "dark", // dark | light
    salvarHistorico: true,
    salvarPreferencias: true,
  };
}

// -----------------------------
// APLICAÇÃO DO TEMA
// -----------------------------
function aplicarTema() {
  const tema = state.config.tema;

  if (tema === "light") {
    document.documentElement.style.setProperty("--bg-main", "#f5f5f5");
    document.documentElement.style.setProperty("--bg-card", "#ffffff");
    document.documentElement.style.setProperty("--bg-card-soft", "#f0f0f0");
    document.documentElement.style.setProperty("--text-main", "#111");
    document.documentElement.style.setProperty("--text-muted", "#555");
    document.documentElement.style.setProperty("--border-soft", "#ccc");
  } else {
    document.documentElement.style.setProperty("--bg-main", "#050509");
    document.documentElement.style.setProperty("--bg-card", "#111119");
    document.documentElement.style.setProperty("--bg-card-soft", "#151521");
    document.documentElement.style.setProperty("--text-main", "#f5f5f7");
    document.documentElement.style.setProperty("--text-muted", "#9ea0b8");
    document.documentElement.style.setProperty("--border-soft", "#26263a");
  }
}

// -----------------------------
// SALVAR CONFIGURAÇÕES
// -----------------------------
function salvarConfigLocal() {
  if (!state.config.salvarPreferencias) return;
  localStorage.setItem("ASSEUF_CONFIG", JSON.stringify(state.config));
}

// -----------------------------
// CARREGAR CONFIGURAÇÕES
// -----------------------------
function carregarConfigLocal() {
  const dados = localStorage.getItem("ASSEUF_CONFIG");
  if (dados) {
    try {
      state.config = JSON.parse(dados);
    } catch {}
  }
  aplicarTema();
}

carregarConfigLocal();

// -----------------------------
// BACKUP DO SISTEMA
// -----------------------------
function gerarBackup() {
  const backup = {
    historico: state.historico,
    config: state.config,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ASSEUF_BACKUP.json";
  a.click();
  URL.revokeObjectURL(url);
}

// -----------------------------
// RESTAURAR BACKUP
// -----------------------------
function restaurarBackup(arquivo) {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const dados = JSON.parse(reader.result);

      if (dados.historico) state.historico = dados.historico;
      if (dados.config) state.config = dados.config;

      aplicarTema();
      salvarConfigLocal();
      render();

      alert("Backup restaurado com sucesso!");
    } catch {
      alert("Arquivo inválido.");
    }
  };

  reader.readAsText(arquivo);
}

// -----------------------------
// RESET TOTAL
// -----------------------------
function resetarSistema() {
  if (!confirm("Tem certeza que deseja resetar TODO o sistema?")) return;

  state.historico = {};
  state.ultimoCalculo = null;
  state.config = {
    tema: "dark",
    salvarHistorico: true,
    salvarPreferencias: true,
  };

  localStorage.removeItem("ASSEUF_CONFIG");

  aplicarTema();
  render();

  alert("Sistema resetado com sucesso!");
}

// -----------------------------
// PÁGINA DE CONFIGURAÇÕES
// -----------------------------
function paginaConfig() {
  return `
    <div class="card">
      ${UI.titulo("Configurações — Parte 10", "Tema, preferências, backup e reset")}

      <h4>Tema</h4>
      <div class="dashboard-grid">
        <div class="dash-card" onclick="alterarTema('dark')" style="cursor:pointer;">
          <div class="dash-label">Tema escuro</div>
          <div class="dash-value">🌙</div>
          <div class="dash-footer">${state.config.tema === "dark" ? "Ativo" : "Clique para ativar"}</div>
        </div>

        <div class="dash-card" onclick="alterarTema('light')" style="cursor:pointer;">
          <div class="dash-label">Tema claro</div>
          <div class="dash-value">☀️</div>
          <div class="dash-footer">${state.config.tema === "light" ? "Ativo" : "Clique para ativar"}</div>
        </div>
      </div>

      <h4 style="margin-top:20px;">Preferências</h4>
      <div class="dashboard-grid">
        <div class="dash-card">
          <div class="dash-label">Salvar histórico automaticamente</div>
          <input type="checkbox" id="cfg_hist" ${state.config.salvarHistorico ? "checked" : ""} onchange="toggleSalvarHistorico()" />
        </div>

        <div class="dash-card">
          <div class="dash-label">Salvar preferências</div>
          <input type="checkbox" id="cfg_pref" ${state.config.salvarPreferencias ? "checked" : ""} onchange="toggleSalvarPreferencias()" />
        </div>
      </div>

      <h4 style="margin-top:20px;">Backup</h4>
      <div class="actions-row">
        <button class="btn-primary" onclick="gerarBackup()">
          <span>💾</span>
          <span>Gerar backup</span>
        </button>

        <label class="btn-ghost" style="cursor:pointer;">
          <span>📂</span>
          <span>Restaurar backup</span>
          <input type="file" style="display:none;" onchange="restaurarBackup(this.files[0])">
        </label>
      </div>

      <h4 style="margin-top:20px;">Reset</h4>
      <button class="btn-ghost" style="border-color:#ff5252; color:#ff5252;" onclick="resetarSistema()">
        <span>🗑️</span>
        <span>Resetar sistema</span>
      </button>
    </div>
  `;
}

// -----------------------------
// FUNÇÕES DE CONFIGURAÇÃO
// -----------------------------
function alterarTema(tema) {
  state.config.tema = tema;
  aplicarTema();
  salvarConfigLocal();
  render();
}

function toggleSalvarHistorico() {
  state.config.salvarHistorico = document.getElementById("cfg_hist").checked;
  salvarConfigLocal();
}

function toggleSalvarPreferencias() {
  state.config.salvarPreferencias = document.getElementById("cfg_pref").checked;
  salvarConfigLocal();
}

// -----------------------------
// ATUALIZA MENU PARA INCLUIR CONFIGURAÇÕES
// -----------------------------
function atualizarNav() {
  const navRoot = document.getElementById("nav-root");
  if (!navRoot) return;

  navRoot.innerHTML = `
    ${botaoNav("inicio", "Início", "🏠")}
    ${botaoNav("calculo", "Cadastro & Cálculo", "🧮")}
    ${botaoNav("dashboard", "Dashboard Visual", "📊")}
    ${botaoNav("historico", "Histórico", "📅")}
    ${botaoNav("relatorios", "Relatórios", "📘")}
    ${botaoNav("pdf", "PDF", "📄")}
    ${botaoNav("config", "Configurações", "⚙️")}
  `;

  [...navRoot.querySelectorAll("[data-page]")].forEach((btn) => {
    const page = btn.getAttribute("data-page");
    if (page === state.paginaAtual) btn.classList.add("active");
    else btn.classList.remove("active");
  });
}

// -----------------------------
// RENDER COM NOVA PÁGINA
// -----------------------------
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  let conteudo = "";

  switch (state.paginaAtual) {
    case "inicio":
      conteudo = paginaInicio();
      break;
    case "calculo":
      conteudo = paginaCalculoBasico();
      break;
    case "dashboard":
      conteudo = paginaDashboardVisual();
      break;
    case "historico":
      conteudo = paginaHistorico();
      break;
    case "relatorios":
      conteudo = paginaRelatoriosAvancados();
      break;
    case "pdf":
      conteudo = paginaPDF();
      break;
    case "config":
      conteudo = paginaConfig();
      break;
    default:
      conteudo = `<div class="card"><p>Erro ao carregar página.</p></div>`;
  }

  app.innerHTML = conteudo;

  if (state.paginaAtual === "dashboard") {
    setTimeout(gerarGraficosParte6, 50);
  }
}
// ======================================================================
// ASSEUF - APP.JS PARTE 11/12
// Sistema de usuários, login, permissões e logs de atividade
// ======================================================================

// -----------------------------
// ESTADO DE USUÁRIOS
// -----------------------------
if (!state.usuarios) {
  state.usuarios = [
    {
      usuario: "admin",
      senha: "1234",
      perfil: "admin",
    },
    {
      usuario: "operador",
      senha: "1234",
      perfil: "operador",
    },
  ];
}

if (!state.usuarioLogado) {
  state.usuarioLogado = null;
}

if (!state.logs) {
  state.logs = [];
}

// -----------------------------
// LOG DE ATIVIDADE
// -----------------------------
function registrarLog(acao) {
  const data = new Date().toLocaleString("pt-BR");
  state.logs.push(`[${data}] ${acao}`);
}

// -----------------------------
// LOGIN
// -----------------------------
function paginaLogin() {
  return `
    <div class="card" style="max-width:420px; margin:auto;">
      ${UI.titulo("Login — Parte 11", "Acesso ao sistema")}

      <div class="dashboard-grid">
        <div class="dash-card">
          <div class="dash-label">Usuário</div>
          <input id="login_user" type="text" placeholder="admin ou operador">
        </div>

        <div class="dash-card">
          <div class="dash-label">Senha</div>
          <input id="login_pass" type="password" placeholder="1234">
        </div>
      </div>

      <div class="actions-row">
        <button class="btn-primary" onclick="fazerLogin()">
          <span>🔐</span>
          <span>Entrar</span>
        </button>
      </div>
    </div>
  `;
}

function fazerLogin() {
  const user = document.getElementById("login_user").value.trim();
  const pass = document.getElementById("login_pass").value.trim();

  const encontrado = state.usuarios.find(
    (u) => u.usuario === user && u.senha === pass
  );

  if (!encontrado) {
    alert("Usuário ou senha incorretos.");
    return;
  }

  state.usuarioLogado = encontrado;
  registrarLog(`Usuário '${user}' fez login.`);

  state.paginaAtual = "inicio";
  render();
}

// -----------------------------
// LOGOUT
// -----------------------------
function fazerLogout() {
  if (state.usuarioLogado) {
    registrarLog(`Usuário '${state.usuarioLogado.usuario}' fez logout.`);
  }

  state.usuarioLogado = null;
  state.paginaAtual = "login";
  render();
}

// -----------------------------
// PERMISSÕES
// -----------------------------
function temPermissao(pagina) {
  if (!state.usuarioLogado) return false;

  const perfil = state.usuarioLogado.perfil;

  const permissoes = {
    admin: ["inicio", "calculo", "dashboard", "historico", "relatorios", "pdf", "config", "usuarios"],
    operador: ["inicio", "calculo", "dashboard", "historico", "relatorios"],
  };

  return permissoes[perfil].includes(pagina);
}

// -----------------------------
// GERENCIAMENTO DE USUÁRIOS (ADMIN)
// -----------------------------
function paginaUsuarios() {
  if (!temPermissao("usuarios")) {
    return `
      <div class="card">
        ${UI.titulo("Acesso negado", "Você não tem permissão para ver esta página.")}
      </div>
    `;
  }

  let lista = "";

  for (const u of state.usuarios) {
    lista += `
      <div class="dash-card">
        <div class="dash-label">Usuário</div>
        <div class="dash-value">${u.usuario}</div>
        <div class="dash-footer">Perfil: ${u.perfil}</div>
      </div>
    `;
  }

  return `
    <div class="card">
      ${UI.titulo("Gerenciamento de Usuários — Parte 11", "Somente administradores")}

      <h4>Usuários cadastrados</h4>
      <div class="dashboard-grid">${lista}</div>

      <h4 style="margin-top:20px;">Adicionar novo usuário</h4>
      <div class="dashboard-grid">
        <div class="dash-card">
          <div class="dash-label">Usuário</div>
          <input id="novo_user" type="text">
        </div>

        <div class="dash-card">
          <div class="dash-label">Senha</div>
          <input id="novo_pass" type="password">
        </div>

        <div class="dash-card">
          <div class="dash-label">Perfil</div>
          <select id="novo_perfil" style="padding:8px; border-radius:8px; background:#222; color:#fff;">
            <option value="operador">Operador</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>

      <div class="actions-row">
        <button class="btn-primary" onclick="adicionarUsuario()">
          <span>➕</span>
          <span>Adicionar usuário</span>
        </button>
      </div>
    </div>
  `;
}

function adicionarUsuario() {
  const user = document.getElementById("novo_user").value.trim();
  const pass = document.getElementById("novo_pass").value.trim();
  const perfil = document.getElementById("novo_perfil").value;

  if (!user || !pass) {
    alert("Preencha usuário e senha.");
    return;
  }

  if (state.usuarios.find((u) => u.usuario === user)) {
    alert("Usuário já existe.");
    return;
  }

  state.usuarios.push({ usuario: user, senha: pass, perfil });
  registrarLog(`Usuário '${user}' criado com perfil '${perfil}'.`);

  render();
}

// -----------------------------
// LOGS DO SISTEMA
// -----------------------------
function paginaLogs() {
  if (!temPermissao("usuarios")) {
    return `
      <div class="card">
        ${UI.titulo("Acesso negado", "Somente administradores podem ver os logs.")}
      </div>
    `;
  }

  let linhas = state.logs
    .map((l) => `<div class="dash-card"><div class="dash-label">${l}</div></div>`)
    .join("");

  return `
    <div class="card">
      ${UI.titulo("Logs do Sistema — Parte 11", "Registro de atividades")}

      <div class="dashboard-grid">
        ${linhas}
      </div>
    </div>
  `;
}

// -----------------------------
// ATUALIZA MENU PARA INCLUIR USUÁRIOS E LOGOUT
// -----------------------------
function atualizarNav() {
  const navRoot = document.getElementById("nav-root");
  if (!navRoot) return;

  if (!state.usuarioLogado) {
    navRoot.innerHTML = `
      <button class="nav-btn active" data-page="login">
        <span class="icon">🔐</span>
        <span>Login</span>
      </button>
    `;
    return;
  }

  navRoot.innerHTML = `
    ${botaoNav("inicio", "Início", "🏠")}
    ${botaoNav("calculo", "Cadastro & Cálculo", "🧮")}
    ${botaoNav("dashboard", "Dashboard Visual", "📊")}
    ${botaoNav("historico", "Histórico", "📅")}
    ${botaoNav("relatorios", "Relatórios", "📘")}
    ${botaoNav("pdf", "PDF", "📄")}
    ${state.usuarioLogado.perfil === "admin" ? botaoNav("usuarios", "Usuários", "👥") : ""}
    ${state.usuarioLogado.perfil === "admin" ? botaoNav("logs", "Logs", "📜") : ""}
    <button class="nav-btn secondary" onclick="fazerLogout()">
      <span class="icon">🚪</span>
      <span>Sair</span>
    </button>
  `;

  [...navRoot.querySelectorAll("[data-page]")].forEach((btn) => {
    const page = btn.getAttribute("data-page");
    if (page === state.paginaAtual) btn.classList.add("active");
    else btn.classList.remove("active");
  });
}

// -----------------------------
// RENDER COM LOGIN E PERMISSÕES
// -----------------------------
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  if (!state.usuarioLogado) {
    app.innerHTML = paginaLogin();
    atualizarNav();
    return;
  }

  let conteudo = "";

  switch (state.paginaAtual) {
    case "inicio":
      conteudo = paginaInicio();
      break;
    case "calculo":
      conteudo = paginaCalculoBasico();
      break;
    case "dashboard":
      conteudo = paginaDashboardVisual();
      break;
    case "historico":
      conteudo = paginaHistorico();
      break;
    case "relatorios":
      conteudo = paginaRelatoriosAvancados();
      break;
    case "pdf":
      conteudo = paginaPDF();
      break;
    case "usuarios":
      conteudo = paginaUsuarios();
      break;
    case "logs":
      conteudo = paginaLogs();
      break;
    default:
      conteudo = `<div class="card"><p>Erro ao carregar página.</p></div>`;
  }

  app.innerHTML = conteudo;

  if (state.paginaAtual === "dashboard") {
    setTimeout(gerarGraficosParte6, 50);
  }

  atualizarNav();
}
// ======================================================================
// ASSEUF - APP.JS PARTE 12/12
// Notificações, microinterações, otimizações finais e polimento geral
// ======================================================================

// -----------------------------
// SISTEMA DE NOTIFICAÇÕES
// -----------------------------
if (!state.notificacoes) {
  state.notificacoes = [];
}

function notificar(tipo, mensagem) {
  const id = Date.now();
  state.notificacoes.push({ id, tipo, mensagem });

  renderNotificacoes();

  setTimeout(() => {
    state.notificacoes = state.notificacoes.filter((n) => n.id !== id);
    renderNotificacoes();
  }, 4000);
}

function renderNotificacoes() {
  let container = document.getElementById("toast-root");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-root";
    container.style.position = "fixed";
    container.style.right = "16px";
    container.style.bottom = "16px";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
  }

  container.innerHTML = state.notificacoes
    .map(
      (n) => `
      <div class="toast toast-${n.tipo}">
        <span>${n.mensagem}</span>
      </div>
    `
    )
    .join("");
}

// Estilos básicos dos toasts (injeção simples)
(function injectToastStyles() {
  const style = document.createElement("style");
  style.innerHTML = `
    .toast {
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      color: #fff;
      box-shadow: 0 8px 20px rgba(0,0,0,0.35);
      transform: translateY(10px);
      opacity: 0;
      animation: toast-in 0.25s forwards;
    }
    .toast-info { background: #2196f3; }
    .toast-success { background: #4caf50; }
    .toast-error { background: #f44336; }
    .toast-warning { background: #ff9800; }

    @keyframes toast-in {
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
})();

// -----------------------------
// MICROINTERAÇÕES SIMPLES
// -----------------------------
document.addEventListener("mousedown", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  btn.classList.add("btn-press");
});

document.addEventListener("mouseup", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  btn.classList.remove("btn-press");
});

(function injectButtonPressStyle() {
  const style = document.createElement("style");
  style.innerHTML = `
    .btn-press {
      transform: scale(0.97);
      filter: brightness(0.9);
      transition: transform 0.08s, filter 0.08s;
    }
  `;
  document.head.appendChild(style);
})();

// -----------------------------
// OTIMIZAÇÃO: SALVAR HISTÓRICO SÓ SE CONFIG PERMITIR
// -----------------------------
const _oldSalvarNoHistorico = salvarNoHistorico;
salvarNoHistorico = function () {
  if (!state.config || state.config.salvarHistorico) {
    _oldSalvarNoHistorico();
    notificar("success", "Cálculo registrado no histórico.");
  } else {
    notificar("info", "Histórico desativado nas configurações.");
  }
};

// -----------------------------
// OTIMIZAÇÃO: NOTIFICAÇÕES EM AÇÕES IMPORTANTES
// -----------------------------
const _oldGerarBackup = gerarBackup;
gerarBackup = function () {
  _oldGerarBackup();
  notificar("success", "Backup gerado com sucesso.");
};

const _oldRestaurarBackup = restaurarBackup;
restaurarBackup = function (arquivo) {
  _oldRestaurarBackup(arquivo);
  notificar("info", "Processando arquivo de backup...");
};

const _oldResetarSistema = resetarSistema;
resetarSistema = function () {
  _oldResetarSistema();
  notificar("warning", "Sistema foi resetado.");
};

const _oldFazerLogin = fazerLogin;
fazerLogin = function () {
  const antes = state.usuarioLogado;
  _oldFazerLogin();
  if (!antes && state.usuarioLogado) {
    notificar("success", `Bem-vindo, ${state.usuarioLogado.usuario}.`);
  }
};

const _oldFazerLogout = fazerLogout;
fazerLogout = function () {
  _oldFazerLogout();
  notificar("info", "Sessão encerrada.");
};

// -----------------------------
// MODO OFFLINE (CACHE BÁSICO VIA LOCALSTORAGE)
// -----------------------------
function salvarEstadoBasico() {
  try {
    const snapshot = {
      historico: state.historico,
      config: state.config,
    };
    localStorage.setItem("ASSEUF_SNAPSHOT", JSON.stringify(snapshot));
  } catch {}
}

function carregarEstadoBasico() {
  const dados = localStorage.getItem("ASSEUF_SNAPSHOT");
  if (!dados) return;
  try {
    const snapshot = JSON.parse(dados);
    if (snapshot.historico) state.historico = snapshot.historico;
    if (snapshot.config) state.config = snapshot.config;
  } catch {}
}

carregarEstadoBasico();

// Integra com eventos principais
const _oldCalcularParte5 = calcularParte5;
calcularParte5 = function () {
  _oldCalcularParte5();
  salvarEstadoBasico();
};

const _oldResetarSistema2 = resetarSistema;
resetarSistema = function () {
  _oldResetarSistema2();
  salvarEstadoBasico();
};

// -----------------------------
// TOQUE FINAL: TEXTO DO INÍCIO MAIS RICO
// -----------------------------
const _oldPaginaInicio = paginaInicio;
paginaInicio = function () {
  const base = _oldPaginaInicio();
  const usuario = state.usuarioLogado ? state.usuarioLogado.usuario : "visitante";

  return base.replace(
    "</div>\n\n      <div class=\"divider\"></div>",
    `</div>
      <div class="divider"></div>
      <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">
        Usuário atual: <strong>${usuario}</strong> • Sistema ASSEUF finalizado (Parte 12/12).
      </p>`
  );
};

// -----------------------------
// INICIALIZAÇÃO FINAL
// -----------------------------
window.addEventListener("DOMContentLoaded", () => {
  aplicarTema && aplicarTema();
  atualizarNav();
  render();
  notificar("info", "ASSEUF carregado com sucesso.");
});
