// ======================================================================
// ASSEUF - APP.JS PARTE 1/12
// Núcleo do sistema, estado global e componentes base de UI
// ======================================================================

// -----------------------------
// ESTADO GLOBAL DO SISTEMA
// -----------------------------
const state = {
  paginaAtual: "login",
  usuarioLogado: null,
  usuarios: [
    { usuario: "admin", senha: "1234", perfil: "admin" },
    { usuario: "operador", senha: "1234", perfil: "operador" }
  ],
  historico: {},
  logs: [],
  config: {
    tema: "dark",
    salvarHistorico: true,
    salvarPreferencias: true
  },
  notificacoes: []
};

// -----------------------------
// COMPONENTES DE UI
// -----------------------------
const UI = {
  titulo: (titulo, subtitulo = "") => `
    <h2 style="margin-bottom:4px;">${titulo}</h2>
    <p style="margin-top:0; color:var(--text-muted);">${subtitulo}</p>
    <div class="divider" style="margin:14px 0; border-bottom:1px solid var(--border-soft);"></div>
  `,

  linha: () => `<div class="divider" style="margin:14px 0; border-bottom:1px solid var(--border-soft);"></div>`
};

// -----------------------------
// BOTÃO DO MENU
// -----------------------------
function botaoNav(pagina, nome, icone) {
  return `
    <button class="nav-btn" data-page="${pagina}">
      <span class="icon">${icone}</span>
      <span>${nome}</span>
    </button>
  `;
}

// -----------------------------
// SISTEMA DE NAVEGAÇÃO
// -----------------------------
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-page]");
  if (!btn) return;

  const pagina = btn.getAttribute("data-page");
  state.paginaAtual = pagina;
  render();
});
// ======================================================================
// ASSEUF - APP.JS PARTE 2/12
// Tema, preferências e inicialização visual
// ======================================================================

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
// ======================================================================
// ASSEUF - APP.JS PARTE 3/12
// Login, usuários, permissões e logs
// ======================================================================

// -----------------------------
// REGISTRAR LOG
// -----------------------------
function registrarLog(acao) {
  const data = new Date().toLocaleString("pt-BR");
  state.logs.push(`[${data}] ${acao}`);
}

// -----------------------------
// TELA DE LOGIN
// -----------------------------
function paginaLogin() {
  return `
    <div class="card" style="max-width:420px; margin:auto;">
      ${UI.titulo("Login", "Acesse o sistema")}

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

      <div style="margin-top:20px;">
        <button class="btn-primary" onclick="fazerLogin()">
          🔐 Entrar
        </button>
      </div>
    </div>
  `;
}

// -----------------------------
// FAZER LOGIN
// -----------------------------
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
    admin: [
      "inicio",
      "calculo",
      "dashboard",
      "historico",
      "relatorios",
      "pdf",
      "config",
      "usuarios",
      "logs"
    ],
    operador: [
      "inicio",
      "calculo",
      "dashboard",
      "historico",
      "relatorios"
    ]
  };

  return permissoes[perfil].includes(pagina);
}
// ======================================================================
// ASSEUF - APP.JS PARTE 4/12
// Navegação, menu dinâmico e render principal
// ======================================================================

// -----------------------------
// MENU DINÂMICO
// -----------------------------
function montarMenu() {
  const nav = document.getElementById("nav-root");
  if (!nav) return;

  if (!state.usuarioLogado) {
    nav.innerHTML = "";
    return;
  }

  const perfil = state.usuarioLogado.perfil;

  let botoes = `
    ${botaoNav("inicio", "Início", "🏠")}
    ${botaoNav("calculo", "Cálculo", "🧮")}
    ${botaoNav("dashboard", "Dashboard", "📊")}
    ${botaoNav("historico", "Histórico", "📁")}
    ${botaoNav("relatorios", "Relatórios", "📄")}
  `;

  if (perfil === "admin") {
    botoes += `
      ${botaoNav("usuarios", "Usuários", "👥")}
      ${botaoNav("logs", "Logs", "📝")}
      ${botaoNav("config", "Configurações", "⚙️")}
    `;
  }

  botoes += `
    <button class="nav-btn secondary" onclick="fazerLogout()">🚪 Sair</button>
  `;

  nav.innerHTML = botoes;

  document.querySelectorAll(".nav-btn").forEach((b) => {
    if (b.dataset.page === state.paginaAtual) {
      b.classList.add("active");
    }
  });
}

// -----------------------------
// RENDER PRINCIPAL
// -----------------------------
function render() {
  const app = document.getElementById("app");
  montarMenu();

  // Se não estiver logado → mostrar login
  if (!state.usuarioLogado) {
    app.innerHTML = paginaLogin();
    return;
  }

  // Se não tiver permissão → bloquear
  if (!temPermissao(state.paginaAtual)) {
    app.innerHTML = `
      <div class="card">
        ${UI.titulo("Acesso Negado", "Você não tem permissão para acessar esta página.")}
        <button class="btn-primary" onclick="state.paginaAtual='inicio'; render();">
          Voltar ao início
        </button>
      </div>
    `;
    return;
  }

  // Carregar páginas
  switch (state.paginaAtual) {
    case "inicio":
      app.innerHTML = paginaInicio();
      break;

    case "calculo":
      app.innerHTML = paginaCalculo();
      break;

    case "dashboard":
      app.innerHTML = paginaDashboard();
      break;

    case "historico":
      app.innerHTML = paginaHistorico();
      break;

    case "relatorios":
      app.innerHTML = paginaRelatorios();
      break;

    case "usuarios":
      app.innerHTML = paginaUsuarios();
      break;

    case "logs":
      app.innerHTML = paginaLogs();
      break;

    case "config":
      app.innerHTML = paginaConfig();
      break;

    default:
      app.innerHTML = `<div class="card">Página não encontrada.</div>`;
  }
}
// ======================================================================
// ASSEUF - APP.JS PARTE 5/12
// Página Início + Dashboard básico
// ======================================================================

// -----------------------------
// PÁGINA INICIAL
// -----------------------------
function paginaInicio() {
  return `
    <div class="card">
      ${UI.titulo("Bem-vindo ao ASSEUF", "Sistema avançado de rotas, cálculos e relatórios")}

      <p>Use o menu acima para navegar entre as funções do sistema.</p>

      <div class="dashboard-grid" style="margin-top:20px;">
        <div class="dash-card">
          <h3 style="margin:0;">🧮</h3>
          <p style="margin:4px 0 0;">Cálculo de Rotas</p>
        </div>

        <div class="dash-card">
          <h3 style="margin:0;">📊</h3>
          <p style="margin:4px 0 0;">Dashboard</p>
        </div>

        <div class="dash-card">
          <h3 style="margin:0;">📁</h3>
          <p style="margin:4px 0 0;">Histórico</p>
        </div>

        <div class="dash-card">
          <h3 style="margin:0;">📄</h3>
          <p style="margin:4px 0 0;">Relatórios</p>
        </div>
      </div>
    </div>
  `;
}

// -----------------------------
// DASHBOARD BÁSICO
// -----------------------------
function paginaDashboard() {
  return `
    <div class="card">
      ${UI.titulo("Dashboard", "Visão geral do sistema")}

      <p>Aqui você verá gráficos e indicadores quando os cálculos forem realizados.</p>

      <div class="dashboard-grid" style="margin-top:20px;">
        <div class="dash-card">
          <strong>Total de Registros:</strong><br>
          ${Object.keys(state.historico).length}
        </div>

        <div class="dash-card">
          <strong>Usuário Logado:</strong><br>
          ${state.usuarioLogado.usuario}
        </div>

        <div class="dash-card">
          <strong>Perfil:</strong><br>
          ${state.usuarioLogado.perfil}
        </div>
      </div>
    </div>
  `;
}
// ======================================================================
// ASSEUF - APP.JS PARTE 6/12
// Página de Cálculo COMPLETA (rotas, valores, custos, totais)
// ======================================================================

// -----------------------------
// PÁGINA DE CÁLCULO
// -----------------------------
function paginaCalculo() {
  return `
    <div class="card">
      ${UI.titulo("Cálculo de Rotas", "Preencha os valores e gere o resultado")}

      <h3>Rota Sete Lagoas</h3>
      <div class="dashboard-grid">
        <div class="dash-card">
          <label>Diárias SL</label>
          <input id="sl_d" type="number" value="20">
        </div>

        <div class="dash-card">
          <label>Passagem SL</label>
          <input id="sl_p" type="number" value="15">
        </div>

        <div class="dash-card">
          <label>Alunos SL</label>
          <input id="sl_a" type="number" value="10">
        </div>
      </div>

      <h3 style="margin-top:20px;">Rota Curvelo</h3>
      <div class="dashboard-grid">
        <div class="dash-card">
          <label>Diárias CV</label>
          <input id="cv_d" type="number" value="20">
        </div>

        <div class="dash-card">
          <label>Passagem CV</label>
          <input id="cv_p" type="number" value="18">
        </div>

        <div class="dash-card">
          <label>Alunos CV</label>
          <input id="cv_a" type="number" value="8">
        </div>
      </div>

      <button class="btn-primary" style="margin-top:20px;" onclick="calcularRotas()">
        Calcular Rotas
      </button>

      <div id="resultado" class="card" style="margin-top:20px; display:none;"></div>
    </div>
  `;
}

// -----------------------------
// CÁLCULO COMPLETO DAS ROTAS
// -----------------------------
function calcularRotas() {
  // Valores SL
  const sl_d = Number(document.getElementById("sl_d").value);
  const sl_p = Number(document.getElementById("sl_p").value);
  const sl_a = Number(document.getElementById("sl_a").value);

  // Valores CV
  const cv_d = Number(document.getElementById("cv_d").value);
  const cv_p = Number(document.getElementById("cv_p").value);
  const cv_a = Number(document.getElementById("cv_a").value);

  // Cálculos SL
  const sl_bruto = sl_d * sl_p;
  const sl_custoAluno = sl_a > 0 ? sl_bruto / sl_a : 0;

  // Cálculos CV
  const cv_bruto = cv_d * cv_p;
  const cv_custoAluno = cv_a > 0 ? cv_bruto / cv_a : 0;

  // Totais
  const totalBruto = sl_bruto + cv_bruto;
  const totalAlunos = sl_a + cv_a;
  const custoAlunoGeral = totalAlunos > 0 ? totalBruto / totalAlunos : 0;

  // Registrar no histórico
  const registro = {
    data: new Date().toLocaleString("pt-BR"),
    sl: { sl_d, sl_p, sl_a, sl_bruto, sl_custoAluno },
    cv: { cv_d, cv_p, cv_a, cv_bruto, cv_custoAluno },
    totalBruto,
    totalAlunos,
    custoAlunoGeral
  };

  const id = Date.now();
  state.historico[id] = registro;

  registrarLog("Cálculo realizado e salvo no histórico.");

  // Exibir resultado
  const r = document.getElementById("resultado");
  r.style.display = "block";

  r.innerHTML = `
    <h3>Resultado do Cálculo</h3>

    <strong>Sete Lagoas:</strong><br>
    Bruto SL: R$ ${sl_bruto.toFixed(2)}<br>
    Custo por aluno SL: R$ ${sl_custoAluno.toFixed(2)}<br><br>

    <strong>Curvelo:</strong><br>
    Bruto CV: R$ ${cv_bruto.toFixed(2)}<br>
    Custo por aluno CV: R$ ${cv_custoAluno.toFixed(2)}<br><br>

    <strong>Geral:</strong><br>
    Bruto Total: R$ ${totalBruto.toFixed(2)}<br>
    Total de alunos: ${totalAlunos}<br>
    Custo por aluno (geral): R$ ${custoAlunoGeral.toFixed(2)}
  `;
}
// ======================================================================
// ASSEUF - APP.JS PARTE 7/12
// Histórico completo (listar, visualizar, excluir)
// ======================================================================

// -----------------------------
// PÁGINA DE HISTÓRICO
// -----------------------------
function paginaHistorico() {
  const ids = Object.keys(state.historico).sort((a, b) => b - a);

  if (ids.length === 0) {
    return `
      <div class="card">
        ${UI.titulo("Histórico de Cálculos", "Nenhum cálculo foi registrado ainda.")}
        <p>Faça um cálculo na aba "Cálculo" para começar.</p>
      </div>
    `;
  }

  let lista = "";

  ids.forEach((id) => {
    const item = state.historico[id];

    lista += `
      <div class="dash-card" style="padding:14px;">
        <strong>${item.data}</strong><br>
        Total bruto: R$ ${item.totalBruto.toFixed(2)}<br>
        Alunos: ${item.totalAlunos}<br>

        <div style="margin-top:10px; display:flex; gap:10px;">
          <button class="btn-primary" style="padding:6px 12px;" onclick="verHistorico(${id})">
            Ver
          </button>

          <button class="btn-ghost" style="padding:6px 12px;" onclick="excluirHistorico(${id})">
            Excluir
          </button>
        </div>
      </div>
    `;
  });

  return `
    <div class="card">
      ${UI.titulo("Histórico de Cálculos", "Todos os registros salvos")}

      <div class="dashboard-grid">
        ${lista}
      </div>
    </div>
  `;
}

// -----------------------------
// VISUALIZAR UM REGISTRO
// -----------------------------
function verHistorico(id) {
  const item = state.historico[id];
  if (!item) return;

  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="card">
      ${UI.titulo("Detalhes do Registro", item.data)}

      <h3>Sete Lagoas</h3>
      Bruto: R$ ${item.sl.sl_bruto.toFixed(2)}<br>
      Custo por aluno: R$ ${item.sl.sl_custoAluno.toFixed(2)}<br><br>

      <h3>Curvelo</h3>
      Bruto: R$ ${item.cv.cv_bruto.toFixed(2)}<br>
      Custo por aluno: R$ ${item.cv.cv_custoAluno.toFixed(2)}<br><br>

      <h3>Total</h3>
      Bruto total: R$ ${item.totalBruto.toFixed(2)}<br>
      Total de alunos: ${item.totalAlunos}<br>
      Custo por aluno geral: R$ ${item.custoAlunoGeral.toFixed(2)}<br><br>

      <button class="btn-primary" onclick="state.paginaAtual='historico'; render();">
        Voltar
      </button>
    </div>
  `;
}

// -----------------------------
// EXCLUIR UM REGISTRO
// -----------------------------
function excluirHistorico(id) {
  if (!confirm("Tem certeza que deseja excluir este registro?")) return;

  delete state.historico[id];
  registrarLog(`Registro ${id} excluído do histórico.`);

  render();
}
// ======================================================================
// ASSEUF - APP.JS PARTE 8/12
// Relatórios completos (geração dinâmica)
// ======================================================================

// -----------------------------
// PÁGINA DE RELATÓRIOS
// -----------------------------
function paginaRelatorios() {
  const ids = Object.keys(state.historico).sort((a, b) => b - a);

  if (ids.length === 0) {
    return `
      <div class="card">
        ${UI.titulo("Relatórios", "Nenhum cálculo disponível para gerar relatórios.")}
        <p>Faça um cálculo na aba "Cálculo" para começar.</p>
      </div>
    `;
  }

  let lista = "";

  ids.forEach((id) => {
    const item = state.historico[id];

    lista += `
      <div class="dash-card" style="padding:14px;">
        <strong>${item.data}</strong><br>
        Total bruto: R$ ${item.totalBruto.toFixed(2)}<br>
        Alunos: ${item.totalAlunos}<br>

        <div style="margin-top:10px; display:flex; gap:10px;">
          <button class="btn-primary" style="padding:6px 12px;" onclick="gerarRelatorio(${id})">
            Gerar Relatório
          </button>
        </div>
      </div>
    `;
  });

  return `
    <div class="card">
      ${UI.titulo("Relatórios", "Selecione um registro para gerar um relatório detalhado")}

      <div class="dashboard-grid">
        ${lista}
      </div>
    </div>
  `;
}

// -----------------------------
// GERAR RELATÓRIO (VISUAL)
// -----------------------------
function gerarRelatorio(id) {
  const item = state.historico[id];
  if (!item) return;

  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="card">
      ${UI.titulo("Relatório Detalhado", item.data)}

      <h3>Sete Lagoas</h3>
      Diárias: ${item.sl.sl_d}<br>
      Passagem: R$ ${item.sl.sl_p.toFixed(2)}<br>
      Alunos: ${item.sl.sl_a}<br>
      Bruto SL: R$ ${item.sl.sl_bruto.toFixed(2)}<br>
      Custo por aluno SL: R$ ${item.sl.sl_custoAluno.toFixed(2)}<br><br>

      <h3>Curvelo</h3>
      Diárias: ${item.cv.cv_d}<br>
      Passagem: R$ ${item.cv.cv_p.toFixed(2)}<br>
      Alunos: ${item.cv.cv_a}<br>
      Bruto CV: R$ ${item.cv.cv_bruto.toFixed(2)}<br>
      Custo por aluno CV: R$ ${item.cv.cv_custoAluno.toFixed(2)}<br><br>

      <h3>Total Geral</h3>
      Bruto total: R$ ${item.totalBruto.toFixed(2)}<br>
      Total de alunos: ${item.totalAlunos}<br>
      Custo por aluno geral: R$ ${item.custoAlunoGeral.toFixed(2)}<br><br>

      <button class="btn-primary" onclick="gerarPDF(${id})">
        📄 Gerar PDF
      </button>

      <button class="btn-ghost" style="margin-left:10px;" onclick="state.paginaAtual='relatorios'; render();">
        Voltar
      </button>
    </div>
  `;
}
// ======================================================================
// ASSEUF - APP.JS PARTE 9/12
// Geração de PDF (jsPDF + html2canvas)
// ======================================================================

// -----------------------------
// GERAR PDF
// -----------------------------
async function gerarPDF(id) {
  const item = state.historico[id];
  if (!item) return;

  registrarLog(`PDF gerado para o registro ${id}.`);

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4"
  });

  const conteudo = `
    RELATÓRIO ASSEUF
    -----------------------------

    Data: ${item.data}

    --- SETE LAGOAS ---
    Diárias: ${item.sl.sl_d}
    Passagem: R$ ${item.sl.sl_p.toFixed(2)}
    Alunos: ${item.sl.sl_a}
    Bruto SL: R$ ${item.sl.sl_bruto.toFixed(2)}
    Custo por aluno SL: R$ ${item.sl.sl_custoAluno.toFixed(2)}

    --- CURVELO ---
    Diárias: ${item.cv.cv_d}
    Passagem: R$ ${item.cv.cv_p.toFixed(2)}
    Alunos: ${item.cv.cv_a}
    Bruto CV: R$ ${item.cv.cv_bruto.toFixed(2)}
    Custo por aluno CV: R$ ${item.cv.cv_custoAluno.toFixed(2)}

    --- TOTAL ---
    Bruto total: R$ ${item.totalBruto.toFixed(2)}
    Total de alunos: ${item.totalAlunos}
    Custo por aluno geral: R$ ${item.custoAlunoGeral.toFixed(2)}
  `;

  const linhas = conteudo.split("\n");
  let y = 40;

  pdf.setFont("Helvetica", "normal");

  linhas.forEach((linha) => {
    pdf.text(linha, 40, y);
    y += 20;
  });

  pdf.save(`relatorio_${id}.pdf`);
}
// ======================================================================
// ASSEUF - APP.JS PARTE 10/12
// Gerenciamento de Usuários (somente admin)
// ======================================================================

// -----------------------------
// PÁGINA DE USUÁRIOS
// -----------------------------
function paginaUsuarios() {
  if (state.usuarioLogado.perfil !== "admin") {
    return `
      <div class="card">
        ${UI.titulo("Acesso Negado", "Somente administradores podem acessar esta página.")}
      </div>
    `;
  }

  let lista = "";

  state.usuarios.forEach((u, index) => {
    lista += `
      <div class="dash-card" style="padding:14px;">
        <strong>Usuário:</strong> ${u.usuario}<br>
        <strong>Perfil:</strong> ${u.perfil}<br>

        <div style="margin-top:10px; display:flex; gap:10px;">
          <button class="btn-ghost" style="padding:6px 12px;" onclick="removerUsuario(${index})">
            Excluir
          </button>
        </div>
      </div>
    `;
  });

  return `
    <div class="card">
      ${UI.titulo("Gerenciamento de Usuários", "Adicionar, remover e gerenciar perfis")}

      <h3>Adicionar Usuário</h3>

      <div class="dashboard-grid">
        <div class="dash-card">
          <label>Novo usuário</label>
          <input id="novo_user" type="text" placeholder="nome">
        </div>

        <div class="dash-card">
          <label>Senha</label>
          <input id="novo_pass" type="password" placeholder="senha">
        </div>

        <div class="dash-card">
          <label>Perfil</label>
          <select id="novo_perfil">
            <option value="operador">Operador</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <button class="btn-primary" style="margin-top:20px;" onclick="adicionarUsuario()">
        ➕ Adicionar Usuário
      </button>

      <h3 style="margin-top:30px;">Usuários Cadastrados</h3>

      <div class="dashboard-grid">
        ${lista}
      </div>
    </div>
  `;
}

// -----------------------------
// ADICIONAR USUÁRIO
// -----------------------------
function adicionarUsuario() {
  const user = document.getElementById("novo_user").value.trim();
  const pass = document.getElementById("novo_pass").value.trim();
  const perfil = document.getElementById("novo_perfil").value;

  if (!user || !pass) {
    alert("Preencha usuário e senha.");
    return;
  }

  if (state.usuarios.find((u) => u.usuario === user)) {
    alert("Este usuário já existe.");
    return;
  }

  state.usuarios.push({ usuario: user, senha: pass, perfil });
  registrarLog(`Usuário '${user}' criado com perfil '${perfil}'.`);

  render();
}

// -----------------------------
// REMOVER USUÁRIO
// -----------------------------
function removerUsuario(index) {
  const u = state.usuarios[index];

  if (u.usuario === "admin") {
    alert("O usuário 'admin' não pode ser removido.");
    return;
  }

  if (!confirm(`Excluir o usuário '${u.usuario}'?`)) return;

  registrarLog(`Usuário '${u.usuario}' removido.`);
  state.usuarios.splice(index, 1);

  render();
}
// ======================================================================
// ASSEUF - APP.JS PARTE 11/12
// Configurações do Sistema (tema, preferências, histórico)
// ======================================================================

// -----------------------------
// PÁGINA DE CONFIGURAÇÕES
// -----------------------------
function paginaConfig() {
  if (state.usuarioLogado.perfil !== "admin") {
    return `
      <div class="card">
        ${UI.titulo("Acesso Negado", "Somente administradores podem acessar esta página.")}
      </div>
    `;
  }

  return `
    <div class="card">
      ${UI.titulo("Configurações do Sistema", "Preferências e ajustes gerais")}

      <h3>Tema</h3>
      <div class="dashboard-grid">
        <div class="dash-card">
          <label>Tema atual:</label><br>
          <strong>${state.config.tema === "dark" ? "Escuro" : "Claro"}</strong><br><br>

          <button class="btn-primary" onclick="alternarTema()">
            Alternar Tema
          </button>
        </div>
      </div>

      <h3 style="margin-top:30px;">Preferências</h3>
      <div class="dashboard-grid">
        <div class="dash-card">
          <label>Salvar histórico automaticamente</label><br>
          <input type="checkbox" id="cfg_hist" ${state.config.salvarHistorico ? "checked" : ""} onchange="toggleSalvarHistorico()">
        </div>

        <div class="dash-card">
          <label>Salvar preferências no navegador</label><br>
          <input type="checkbox" id="cfg_pref" ${state.config.salvarPreferencias ? "checked" : ""} onchange="toggleSalvarPreferencias()">
        </div>
      </div>

      <h3 style="margin-top:30px;">Manutenção</h3>
      <div class="dashboard-grid">
        <div class="dash-card">
          <button class="btn-ghost" onclick="limparHistorico()">
            🗑️ Limpar Histórico
          </button>
        </div>

        <div class="dash-card">
          <button class="btn-ghost" onclick="limparLogs()">
            🗑️ Limpar Logs
          </button>
        </div>
      </div>
    </div>
  `;
}

// -----------------------------
// ALTERAR TEMA
// -----------------------------
function alternarTema() {
  state.config.tema = state.config.tema === "dark" ? "light" : "dark";
  aplicarTema();
  salvarConfigLocal();
  render();
}

// -----------------------------
// TOGGLE SALVAR HISTÓRICO
// -----------------------------
function toggleSalvarHistorico() {
  state.config.salvarHistorico = document.getElementById("cfg_hist").checked;
  salvarConfigLocal();
}

// -----------------------------
// TOGGLE SALVAR PREFERÊNCIAS
// -----------------------------
function toggleSalvarPreferencias() {
  state.config.salvarPreferencias = document.getElementById("cfg_pref").checked;
  salvarConfigLocal();
}

// -----------------------------
// LIMPAR HISTÓRICO
// -----------------------------
function limparHistorico() {
  if (!confirm("Tem certeza que deseja limpar TODO o histórico?")) return;

  state.historico = {};
  registrarLog("Histórico completamente apagado.");
  render();
}

// -----------------------------
// LIMPAR LOGS
// -----------------------------
function limparLogs() {
  if (!confirm("Tem certeza que deseja limpar TODOS os logs?")) return;

  state.logs = [];
  render();
}
// ======================================================================
// ASSEUF - APP.JS PARTE 12/12
// Página de Logs + Inicialização Final
// ======================================================================

// -----------------------------
// PÁGINA DE LOGS (somente admin)
// -----------------------------
function paginaLogs() {
  if (state.usuarioLogado.perfil !== "admin") {
    return `
      <div class="card">
        ${UI.titulo("Acesso Negado", "Somente administradores podem acessar esta página.")}
      </div>
    `;
  }

  if (state.logs.length === 0) {
    return `
      <div class="card">
        ${UI.titulo("Logs do Sistema", "Nenhum log registrado ainda.")}
      </div>
    `;
  }

  let lista = "";

  state.logs.slice().reverse().forEach((log) => {
    lista += `
      <div class="dash-card" style="padding:12px;">
        ${log}
      </div>
    `;
  });

  return `
    <div class="card">
      ${UI.titulo("Logs do Sistema", "Atividades registradas")}

      <div class="dashboard-grid">
        ${lista}
      </div>
    </div>
  `;
}

// -----------------------------
// INICIALIZAÇÃO FINAL
// -----------------------------
window.onload = () => {
  aplicarTema();
  render();
};