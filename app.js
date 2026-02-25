// ======================================================================
// ASSEUF ULTRA - APP.JS (PARTE 1/7)
// Núcleo do sistema: estado global, logs, auditoria, notificações,
// backup e preferências avançadas.
// Estilo: DIDÁTICO (muito comentado).
// Arquitetura: MODULAR (mas tudo em um único arquivo JS).
// ======================================================================

/*
  VISÃO GERAL DO NÚCLEO

  Aqui definimos:
  - state: objeto único que guarda todo o estado do sistema
  - config: preferências globais e opções avançadas
  - logs: sistema de registro de eventos
  - auditoria: trilha de ações sensíveis
  - notificações: mensagens para o usuário (UI)
  - backup: snapshots do estado
  - preferências: tema, idioma, layout, etc.

  IMPORTANTE:
  - Tudo aqui é pensado para ser reutilizável em qualquer módulo.
  - Nenhuma função aqui depende de "páginas" específicas.
  - As páginas (rotas, veículos, etc.) virão nas próximas partes.
*/

// -----------------------------
// ESTADO GLOBAL PRINCIPAL
// -----------------------------
const state = {
  // Usuário atualmente logado (ou null se ninguém logado)
  usuarioLogado: null,

  // Página atual (string que será usada pelo sistema de navegação)
  paginaAtual: "login",

  // Lista de usuários (será expandida no módulo de usuários avançado)
  usuarios: [
    {
      id: 1,
      usuario: "admin",
      senha: "admin",
      nome: "Administrador Geral",
      perfil: "admin",
      ativo: true,
      criadoEm: new Date().toISOString()
    },
    {
      id: 2,
      usuario: "operador",
      senha: "123",
      nome: "Operador Padrão",
      perfil: "operador",
      ativo: true,
      criadoEm: new Date().toISOString()
    }
  ],

  // Logs gerais do sistema (eventos informativos)
  logs: [],

  // Auditoria (ações sensíveis, como exclusões, alterações críticas, etc.)
  auditoria: [],

  // Histórico de cálculos, relatórios, etc. (será usado em módulos posteriores)
  historico: {},

  // Backups de estado (snapshots)
  backups: [],

  // Notificações pendentes para exibir na UI
  notificacoes: [],

  // Configurações globais e preferências avançadas
  config: {
    tema: "light",              // "light" ou "dark"
    idioma: "pt-BR",            // idioma padrão
    salvarHistorico: true,      // se true, histórico é persistido
    salvarPreferencias: true,   // se true, config é salva em localStorage
    salvarBackups: true,        // se true, backups são mantidos em memória
    maxBackups: 10,             // número máximo de backups armazenados
    habilitarAuditoria: true,   // se true, ações sensíveis são registradas
    habilitarNotificacoes: true,// se true, notificações são exibidas
    habilitarLogsDetalhados: true, // se true, logs mais verbosos
    layoutDenso: false,         // se true, menos espaçamento na UI
    mostrarTooltips: true       // se true, dicas na interface
  }
};

// -----------------------------
// FUNÇÃO UTILITÁRIA: DATA FORMATADA
// -----------------------------
function agoraFormatado() {
  // Aqui usamos o idioma configurado no state.config.idioma
  try {
    return new Date().toLocaleString(state.config.idioma || "pt-BR");
  } catch (e) {
    // fallback caso o idioma seja inválido
    return new Date().toLocaleString("pt-BR");
  }
}

// -----------------------------
// SISTEMA DE LOGS
// -----------------------------
/*
  registrarLog:
  - Registra eventos gerais do sistema.
  - Pode ser usado por qualquer módulo.
  - Se habilitarLogsDetalhados = false, você pode filtrar logs menos importantes.
*/
function registrarLog(mensagem, tipo = "info", contexto = null) {
  const entrada = {
    data: agoraFormatado(),
    tipo,          // "info", "warn", "error", "debug"
    mensagem,
    contexto       // qualquer objeto adicional (opcional)
  };

  state.logs.push(entrada);

  // Se quisermos limitar o tamanho dos logs no futuro, podemos fazer aqui.
  // Exemplo: manter apenas os últimos 1000 logs.

  if (state.config.habilitarLogsDetalhados) {
    console.log(`[LOG - ${entrada.tipo}] ${entrada.data} - ${entrada.mensagem}`, contexto || "");
  }
}

// -----------------------------
// SISTEMA DE AUDITORIA
// -----------------------------
/*
  registrarAuditoria:
  - Usado para ações sensíveis (ex: excluir usuário, alterar rota, etc.).
  - Sempre que algo importante acontecer, chamamos esta função.
*/
function registrarAuditoria(acao, detalhes = {}, nivel = "alto") {
  if (!state.config.habilitarAuditoria) return;

  const entrada = {
    data: agoraFormatado(),
    usuario: state.usuarioLogado ? state.usuarioLogado.usuario : "desconhecido",
    acao,        // ex: "EXCLUIR_USUARIO", "ALTERAR_ROTA"
    detalhes,    // objeto com informações adicionais
    nivel        // "baixo", "medio", "alto", "critico"
  };

  state.auditoria.push(entrada);

  if (nivel === "alto" || nivel === "critico") {
    console.warn("[AUDITORIA]", entrada);
  }
}

// -----------------------------
// SISTEMA DE NOTIFICAÇÕES
// -----------------------------
/*
  adicionarNotificacao:
  - Adiciona uma notificação à fila.
  - A UI (em outro módulo) será responsável por exibir e remover.
*/
function adicionarNotificacao(texto, tipo = "info", duracaoMs = 5000) {
  if (!state.config.habilitarNotificacoes) return;

  const id = Date.now() + Math.random();

  const notif = {
    id,
    texto,
    tipo,        // "info", "sucesso", "erro", "aviso"
    criadaEm: agoraFormatado(),
    expiraEm: duracaoMs > 0 ? Date.now() + duracaoMs : null
  };

  state.notificacoes.push(notif);

  // Log opcional
  registrarLog(`Notificação adicionada: ${texto}`, "info", { tipo });

  // Se tiver expiração, agendamos remoção automática
  if (duracaoMs > 0) {
    setTimeout(() => {
      removerNotificacao(id);
    }, duracaoMs);
  }
}

/*
  removerNotificacao:
  - Remove uma notificação da fila.
*/
function removerNotificacao(id) {
  state.notificacoes = state.notificacoes.filter((n) => n.id !== id);
}

/*
  limparNotificacoes:
  - Remove todas as notificações.
*/
function limparNotificacoes() {
  state.notificacoes = [];
  registrarLog("Todas as notificações foram limpas.", "info");
}

// -----------------------------
// SISTEMA DE BACKUP
// -----------------------------
/*
  criarBackup:
  - Cria um snapshot do estado atual.
  - Não salva funções, apenas dados serializáveis.
*/
function criarBackup(descricao = "Backup automático") {
  if (!state.config.salvarBackups) return;

  const snapshot = {
    id: Date.now(),
    data: agoraFormatado(),
    descricao,
    usuario: state.usuarioLogado ? state.usuarioLogado.usuario : "sistema",
    // Clonamos apenas partes importantes do state
    dados: {
      usuarios: JSON.parse(JSON.stringify(state.usuarios)),
      historico: JSON.parse(JSON.stringify(state.historico)),
      config: JSON.parse(JSON.stringify(state.config))
    }
  };

  state.backups.push(snapshot);

  // Mantém apenas os últimos N backups
  if (state.backups.length > state.config.maxBackups) {
    state.backups.shift();
  }

  registrarLog(`Backup criado: ${descricao}`, "info");
}

/*
  restaurarBackup:
  - Restaura um backup pelo id.
  - NÃO restaura logs, auditoria, notificações, etc. (apenas dados principais).
*/
function restaurarBackup(id) {
  const backup = state.backups.find((b) => b.id === id);
  if (!backup) {
    adicionarNotificacao("Backup não encontrado.", "erro");
    return;
  }

  state.usuarios = JSON.parse(JSON.stringify(backup.dados.usuarios));
  state.historico = JSON.parse(JSON.stringify(backup.dados.historico));
  state.config = { ...state.config, ...backup.dados.config };

  aplicarTema(); // será definida mais abaixo (tema da UI)

  registrarLog(`Backup restaurado: ${backup.descricao}`, "warn");
  registrarAuditoria("RESTAURAR_BACKUP", { backupId: id, descricao: backup.descricao }, "critico");
  adicionarNotificacao("Backup restaurado com sucesso.", "sucesso");
}

// -----------------------------
// PREFERÊNCIAS E CONFIGURAÇÕES
// -----------------------------
/*
  salvarConfigLocal:
  - Salva as preferências do usuário em localStorage.
*/
function salvarConfigLocal() {
  try {
    if (state.config.salvarPreferencias) {
      const dados = {
        tema: state.config.tema,
        idioma: state.config.idioma,
        layoutDenso: state.config.layoutDenso,
        mostrarTooltips: state.config.mostrarTooltips
      };
      localStorage.setItem("asseuf_ultra_config", JSON.stringify(dados));
      registrarLog("Configurações salvas localmente.", "info");
    } else {
      localStorage.removeItem("asseuf_ultra_config");
      registrarLog("Configurações locais removidas (salvarPreferencias = false).", "info");
    }
  } catch (e) {
    console.warn("Não foi possível salvar config local:", e);
    registrarLog("Falha ao salvar configurações locais.", "error", { erro: e });
  }
}

/*
  carregarConfigLocal:
  - Carrega as preferências do usuário do localStorage.
*/
function carregarConfigLocal() {
  try {
    const cfg = localStorage.getItem("asseuf_ultra_config");
    if (cfg) {
      const parsed = JSON.parse(cfg);
      state.config = { ...state.config, ...parsed };
      registrarLog("Configurações locais carregadas.", "info");
    } else {
      registrarLog("Nenhuma configuração local encontrada.", "debug");
    }
  } catch (e) {
    console.warn("Não foi possível carregar config local:", e);
    registrarLog("Falha ao carregar configurações locais.", "error", { erro: e });
  }
}

// -----------------------------
// TEMA (LIGHT / DARK)
// -----------------------------
/*
  aplicarTema:
  - Aplica o tema atual (light/dark) ao <body>.
  - Outros módulos podem chamar esta função após alterar state.config.tema.
*/
function aplicarTema() {
  const body = document.body;
  if (!body) return;

  if (state.config.tema === "dark") {
    body.classList.add("theme-dark");
    body.classList.remove("theme-light");
  } else {
    body.classList.add("theme-light");
    body.classList.remove("theme-dark");
  }
}

// Carrega config local assim que o script é interpretado
carregarConfigLocal();
aplicarTema();

// ======================================================================
// FIM DA PARTE 1/7
// Próxima parte: autenticação + usuários avançados.
// ======================================================================
// ======================================================================
// ASSEUF ULTRA - APP.JS (PARTE 2/7)
// Autenticação + Módulo de Usuários Avançado
// Estilo: DIDÁTICO (muito comentado)
// Arquitetura: MODULAR
// ======================================================================

/*
  Nesta parte, implementamos:

  1. Autenticação:
     - Login
     - Logout
     - Verificação de permissões
     - Perfis avançados

  2. Módulo de Usuários Avançado:
     - Criar usuário
     - Editar usuário
     - Desativar usuário
     - Reativar usuário
     - Excluir usuário
     - Listar usuários
     - Auditoria integrada

  Tudo aqui é independente das páginas.
  A interface visual (UI) virá na Parte 3/7.
*/

// ======================================================================
// AUTENTICAÇÃO
// ======================================================================

/*
  validarCredenciais:
  - Verifica se usuário e senha correspondem a um usuário ativo.
*/
function validarCredenciais(usuario, senha) {
  return state.usuarios.find(
    (u) => u.usuario === usuario && u.senha === senha && u.ativo
  );
}

/*
  fazerLogin:
  - Autentica o usuário.
  - Registra log e auditoria.
  - Atualiza state.usuarioLogado.
*/
function fazerLogin(usuario, senha) {
  const encontrado = validarCredenciais(usuario, senha);

  if (!encontrado) {
    registrarLog("Tentativa de login falhou.", "warn", { usuario });
    adicionarNotificacao("Usuário ou senha inválidos.", "erro");
    return false;
  }

  state.usuarioLogado = {
    id: encontrado.id,
    usuario: encontrado.usuario,
    nome: encontrado.nome,
    perfil: encontrado.perfil
  };

  registrarLog(`Login bem-sucedido: ${encontrado.usuario}`, "info");
  registrarAuditoria("LOGIN", { usuario: encontrado.usuario }, "baixo");
  adicionarNotificacao(`Bem-vindo, ${encontrado.nome}!`, "sucesso");

  return true;
}

/*
  fazerLogout:
  - Remove o usuário logado.
  - Registra auditoria.
*/
function fazerLogout() {
  if (!state.usuarioLogado) return;

  registrarAuditoria("LOGOUT", { usuario: state.usuarioLogado.usuario }, "baixo");
  registrarLog(`Logout: ${state.usuarioLogado.usuario}`, "info");

  state.usuarioLogado = null;
}

/*
  temPermissao:
  - Verifica se o usuário logado tem permissão para acessar um módulo.
  - Perfis:
      admin → acesso total
      gestor → acesso a tudo exceto configurações críticas
      operador → acesso básico
*/
function temPermissao(modulo) {
  if (!state.usuarioLogado) return false;

  const perfil = state.usuarioLogado.perfil;

  const permissoes = {
    admin: ["*"], // tudo liberado
    gestor: [
      "rotas",
      "veiculos",
      "motoristas",
      "dashboard",
      "relatorios",
      "historico",
      "usuarios"
    ],
    operador: [
      "rotas",
      "dashboard",
      "historico",
      "calculos"
    ]
  };

  const lista = permissoes[perfil] || [];

  return lista.includes("*") || lista.includes(modulo);
}

// ======================================================================
// MÓDULO DE USUÁRIOS AVANÇADO
// ======================================================================

/*
  gerarIdUsuario:
  - Gera um ID único incremental.
*/
function gerarIdUsuario() {
  return (
    Math.max(...state.usuarios.map((u) => u.id), 0) + 1
  );
}

/*
  criarUsuario:
  - Adiciona um novo usuário ao sistema.
*/
function criarUsuario({ usuario, senha, nome, perfil }) {
  if (!usuario || !senha || !nome || !perfil) {
    adicionarNotificacao("Preencha todos os campos para criar um usuário.", "erro");
    return false;
  }

  if (state.usuarios.some((u) => u.usuario === usuario)) {
    adicionarNotificacao("Este nome de usuário já existe.", "erro");
    return false;
  }

  const novo = {
    id: gerarIdUsuario(),
    usuario,
    senha,
    nome,
    perfil,
    ativo: true,
    criadoEm: agoraFormatado()
  };

  state.usuarios.push(novo);

  registrarLog(`Usuário criado: ${usuario}`, "info");
  registrarAuditoria("CRIAR_USUARIO", { usuario }, "medio");
  adicionarNotificacao("Usuário criado com sucesso!", "sucesso");

  return true;
}

/*
  editarUsuario:
  - Atualiza dados de um usuário existente.
*/
function editarUsuario(id, novosDados) {
  const usuario = state.usuarios.find((u) => u.id === id);
  if (!usuario) {
    adicionarNotificacao("Usuário não encontrado.", "erro");
    return false;
  }

  Object.assign(usuario, novosDados);

  registrarLog(`Usuário editado: ${usuario.usuario}`, "info");
  registrarAuditoria("EDITAR_USUARIO", { id, novosDados }, "medio");
  adicionarNotificacao("Usuário atualizado com sucesso!", "sucesso");

  return true;
}

/*
  desativarUsuario:
  - Marca um usuário como inativo.
*/
function desativarUsuario(id) {
  const usuario = state.usuarios.find((u) => u.id === id);
  if (!usuario) return false;

  usuario.ativo = false;

  registrarAuditoria("DESATIVAR_USUARIO", { id }, "alto");
  registrarLog(`Usuário desativado: ${usuario.usuario}`, "warn");
  adicionarNotificacao("Usuário desativado.", "aviso");

  return true;
}

/*
  reativarUsuario:
  - Reativa um usuário inativo.
*/
function reativarUsuario(id) {
  const usuario = state.usuarios.find((u) => u.id === id);
  if (!usuario) return false;

  usuario.ativo = true;

  registrarAuditoria("REATIVAR_USUARIO", { id }, "medio");
  registrarLog(`Usuário reativado: ${usuario.usuario}`, "info");
  adicionarNotificacao("Usuário reativado.", "sucesso");

  return true;
}

/*
  excluirUsuario:
  - Remove um usuário definitivamente.
*/
function excluirUsuario(id) {
  const usuario = state.usuarios.find((u) => u.id === id);
  if (!usuario) return false;

  state.usuarios = state.usuarios.filter((u) => u.id !== id);

  registrarAuditoria("EXCLUIR_USUARIO", { id }, "critico");
  registrarLog(`Usuário excluído: ${usuario.usuario}`, "error");
  adicionarNotificacao("Usuário excluído permanentemente.", "erro");

  return true;
}

/*
  listarUsuarios:
  - Retorna todos os usuários (ativos e inativos).
*/
function listarUsuarios() {
  return [...state.usuarios];
}

// ======================================================================
// FIM DA PARTE 2/7
// Próxima parte: UI + Navegação + Layout
// ======================================================================// ======================================================================
// ASSEUF ULTRA - APP.JS (PARTE 3/7)
// Módulo de UI + Navegação + Layout
// Estilo: DIDÁTICO (muito comentado)
// Arquitetura: MODULAR
// ======================================================================

/*
  Nesta parte implementamos:

  1. Sistema de UI:
     - Componentes reutilizáveis
     - Cartões, botões, títulos, inputs
     - Notificações visuais

  2. Sistema de Navegação:
     - mudarPagina()
     - render()
     - menu dinâmico baseado em permissões

  3. Layout:
     - Tema claro/escuro
     - Layout denso
     - Tooltips
     - Responsividade

  IMPORTANTE:
  - Nada aqui depende de rotas, veículos, motoristas, etc.
  - Isso garante que a UI seja independente e reutilizável.
*/

// ======================================================================
// COMPONENTES DE UI
// ======================================================================

/*
  UI.titulo:
  - Componente simples para padronizar títulos de páginas.
*/
const UI = {
  titulo: (titulo, subtitulo = "") => `
    <div class="ui-title-block">
      <h1 class="ui-title">${titulo}</h1>
      ${subtitulo ? `<p class="ui-subtitle">${subtitulo}</p>` : ""}
    </div>
  `,

  /*
    UI.card:
    - Cria um cartão visual padronizado.
  */
  card: (conteudo) => `
    <div class="ui-card">
      ${conteudo}
    </div>
  `,

  /*
    UI.botao:
    - Botão estilizado com classes dinâmicas.
  */
  botao: (texto, onclick, tipo = "primary") => `
    <button class="ui-btn ui-btn-${tipo}" onclick="${onclick}">
      ${texto}
    </button>
  `,

  /*
    UI.input:
    - Campo de entrada padronizado.
  */
  input: (id, label, valor = "", tipo = "text") => `
    <label class="ui-label" for="${id}">${label}</label>
    <input id="${id}" class="ui-input" type="${tipo}" value="${valor}">
  `
};

// ======================================================================
// SISTEMA DE NOTIFICAÇÕES VISUAIS
// ======================================================================

/*
  renderNotificacoes:
  - Renderiza todas as notificações pendentes.
  - Chamado automaticamente dentro do render().
*/
function renderNotificacoes() {
  const container = document.getElementById("notificacoes-root");
  if (!container) return;

  container.innerHTML = state.notificacoes
    .map(
      (n) => `
      <div class="ui-notificacao ui-notificacao-${n.tipo}">
        <span>${n.texto}</span>
      </div>
    `
    )
    .join("");
}

// ======================================================================
// SISTEMA DE NAVEGAÇÃO
// ======================================================================

/*
  mudarPagina:
  - Atualiza a página atual e chama render().
*/
function mudarPagina(pagina) {
  state.paginaAtual = pagina;
  registrarLog(`Mudança de página: ${pagina}`, "debug");
  render();
}

/*
  montarMenu:
  - Cria o menu lateral/topo baseado no perfil do usuário.
*/
function montarMenu() {
  const nav = document.getElementById("nav-root");
  if (!nav) return;

  if (!state.usuarioLogado) {
    nav.innerHTML = "";
    return;
  }

  const perfil = state.usuarioLogado.perfil;

  const botoesBase = [
    { pagina: "dashboard", label: "Dashboard", modulo: "dashboard" },
    { pagina: "rotas", label: "Rotas", modulo: "rotas" },
    { pagina: "veiculos", label: "Veículos", modulo: "veiculos" },
    { pagina: "motoristas", label: "Motoristas", modulo: "motoristas" },
    { pagina: "calculos", label: "Cálculos", modulo: "calculos" },
    { pagina: "historico", label: "Histórico", modulo: "historico" },
    { pagina: "relatorios", label: "Relatórios", modulo: "relatorios" }
  ];

  const botoesAdmin = [
    { pagina: "usuarios", label: "Usuários", modulo: "usuarios" },
    { pagina: "config", label: "Configurações", modulo: "config" },
    { pagina: "auditoria", label: "Auditoria", modulo: "auditoria" }
  ];

  let botoes = "";

  botoesBase.forEach((b) => {
    if (temPermissao(b.modulo)) {
      botoes += `
        <button class="nav-btn" onclick="mudarPagina('${b.pagina}')">
          ${b.label}
        </button>
      `;
    }
  });

  if (perfil === "admin") {
    botoesAdmin.forEach((b) => {
      botoes += `
        <button class="nav-btn nav-btn-admin" onclick="mudarPagina('${b.pagina}')">
          ${b.label}
        </button>
      `;
    });
  }

  botoes += `
    <button class="nav-btn nav-btn-sair" onclick="fazerLogout(); render();">
      Sair
    </button>
  `;

  nav.innerHTML = botoes;
}

// ======================================================================
// SISTEMA DE RENDERIZAÇÃO PRINCIPAL
// ======================================================================

/*
  render:
  - Atualiza toda a interface com base na página atual.
  - Chama montarMenu() e renderNotificacoes().
*/
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  montarMenu();
  renderNotificacoes();

  if (!state.usuarioLogado) {
    app.innerHTML = paginaLogin();
    return;
  }

  switch (state.paginaAtual) {
    case "dashboard":
      app.innerHTML = paginaDashboard();
      break;

    case "rotas":
      app.innerHTML = paginaRotas();
      break;

    case "veiculos":
      app.innerHTML = paginaVeiculos();
      break;

    case "motoristas":
      app.innerHTML = paginaMotoristas();
      break;

    case "calculos":
      app.innerHTML = paginaCalculos();
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

    case "config":
      app.innerHTML = paginaConfig();
      break;

    case "auditoria":
      app.innerHTML = paginaAuditoria();
      break;

    default:
      app.innerHTML = UI.card(`
        ${UI.titulo("Página não encontrada")}
        <p>A página solicitada não existe.</p>
      `);
  }
}

// ======================================================================
// PÁGINA DE LOGIN (UI)
// ======================================================================

function paginaLogin() {
  return UI.card(`
    ${UI.titulo("ASSEUF ULTRA", "Acesso ao sistema")}

    <div class="login-form">
      ${UI.input("login_user", "Usuário")}
      ${UI.input("login_pass", "Senha", "", "password")}

      ${UI.botao("Entrar", "tentarLogin()", "primary")}
    </div>
  `);
}

/*
  tentarLogin:
  - Função chamada pelo botão da UI.
*/
function tentarLogin() {
  const user = document.getElementById("login_user").value.trim();
  const pass = document.getElementById("login_pass").value.trim();

  if (fazerLogin(user, pass)) {
    mudarPagina("dashboard");
  }
}

// ======================================================================
// FIM DA PARTE 3/7
// Próxima parte: Rotas + Veículos + Motoristas
// ======================================================================
// ======================================================================
// ASSEUF ULTRA - APP.JS (PARTE 4/7)
// Módulo de Rotas + Veículos + Motoristas
// Estilo: DIDÁTICO (muito comentado)
// Arquitetura: MODULAR
// ======================================================================

/*
  Nesta parte implementamos:

  1. Módulo de Rotas:
     - Criar rota
     - Editar rota
     - Excluir rota
     - Listar rotas
     - Validações
     - Auditoria integrada

  2. Módulo de Veículos:
     - Cadastro completo
     - Manutenção
     - Status (ativo/inativo)
     - Auditoria

  3. Módulo de Motoristas:
     - Cadastro
     - CNH
     - Vínculo com veículos
     - Auditoria

  IMPORTANTE:
  - Nenhuma interface visual aqui.
  - A UI será implementada na Parte 5/7 e 6/7.
*/

// ======================================================================
// MÓDULO DE ROTAS
// ======================================================================

state.rotas = [];

/*
  gerarIdRota:
  - Gera um ID único incremental para rotas.
*/
function gerarIdRota() {
  return state.rotas.length > 0
    ? Math.max(...state.rotas.map((r) => r.id)) + 1
    : 1;
}

/*
  criarRota:
  - Cria uma nova rota com validações.
*/
function criarRota({ nome, origem, destino, distanciaKm, ativo = true }) {
  if (!nome || !origem || !destino || !distanciaKm) {
    adicionarNotificacao("Preencha todos os campos da rota.", "erro");
    return false;
  }

  const nova = {
    id: gerarIdRota(),
    nome,
    origem,
    destino,
    distanciaKm: Number(distanciaKm),
    ativo,
    criadoEm: agoraFormatado()
  };

  state.rotas.push(nova);

  registrarLog(`Rota criada: ${nome}`, "info");
  registrarAuditoria("CRIAR_ROTA", nova, "medio");
  adicionarNotificacao("Rota criada com sucesso!", "sucesso");

  return true;
}

/*
  editarRota:
  - Atualiza dados de uma rota existente.
*/
function editarRota(id, novosDados) {
  const rota = state.rotas.find((r) => r.id === id);
  if (!rota) {
    adicionarNotificacao("Rota não encontrada.", "erro");
    return false;
  }

  Object.assign(rota, novosDados);

  registrarLog(`Rota editada: ${rota.nome}`, "info");
  registrarAuditoria("EDITAR_ROTA", { id, novosDados }, "medio");
  adicionarNotificacao("Rota atualizada!", "sucesso");

  return true;
}

/*
  excluirRota:
  - Remove uma rota definitivamente.
*/
function excluirRota(id) {
  const rota = state.rotas.find((r) => r.id === id);
  if (!rota) return false;

  state.rotas = state.rotas.filter((r) => r.id !== id);

  registrarAuditoria("EXCLUIR_ROTA", { id }, "alto");
  registrarLog(`Rota excluída: ${rota.nome}`, "warn");
  adicionarNotificacao("Rota excluída permanentemente.", "aviso");

  return true;
}

/*
  listarRotas:
  - Retorna todas as rotas cadastradas.
*/
function listarRotas() {
  return [...state.rotas];
}

// ======================================================================
// MÓDULO DE VEÍCULOS
// ======================================================================

state.veiculos = [];

/*
  gerarIdVeiculo:
  - Gera ID único incremental.
*/
function gerarIdVeiculo() {
  return state.veiculos.length > 0
    ? Math.max(...state.veiculos.map((v) => v.id)) + 1
    : 1;
}

/*
  criarVeiculo:
  - Cadastra um novo veículo.
*/
function criarVeiculo({ placa, modelo, capacidade, ativo = true }) {
  if (!placa || !modelo || !capacidade) {
    adicionarNotificacao("Preencha todos os campos do veículo.", "erro");
    return false;
  }

  if (state.veiculos.some((v) => v.placa === placa)) {
    adicionarNotificacao("Já existe um veículo com esta placa.", "erro");
    return false;
  }

  const novo = {
    id: gerarIdVeiculo(),
    placa,
    modelo,
    capacidade: Number(capacidade),
    ativo,
    criadoEm: agoraFormatado()
  };

  state.veiculos.push(novo);

  registrarLog(`Veículo cadastrado: ${placa}`, "info");
  registrarAuditoria("CRIAR_VEICULO", novo, "medio");
  adicionarNotificacao("Veículo cadastrado com sucesso!", "sucesso");

  return true;
}

/*
  editarVeiculo:
  - Atualiza dados de um veículo.
*/
function editarVeiculo(id, novosDados) {
  const veiculo = state.veiculos.find((v) => v.id === id);
  if (!veiculo) {
    adicionarNotificacao("Veículo não encontrado.", "erro");
    return false;
  }

  Object.assign(veiculo, novosDados);

  registrarLog(`Veículo editado: ${veiculo.placa}`, "info");
  registrarAuditoria("EDITAR_VEICULO", { id, novosDados }, "medio");
  adicionarNotificacao("Veículo atualizado!", "sucesso");

  return true;
}

/*
  excluirVeiculo:
  - Remove um veículo.
*/
function excluirVeiculo(id) {
  const veiculo = state.veiculos.find((v) => v.id === id);
  if (!veiculo) return false;

  state.veiculos = state.veiculos.filter((v) => v.id !== id);

  registrarAuditoria("EXCLUIR_VEICULO", { id }, "alto");
  registrarLog(`Veículo excluído: ${veiculo.placa}`, "warn");
  adicionarNotificacao("Veículo excluído permanentemente.", "aviso");

  return true;
}

/*
  listarVeiculos:
  - Retorna todos os veículos.
*/
function listarVeiculos() {
  return [...state.veiculos];
}

// ======================================================================
// MÓDULO DE MOTORISTAS
// ======================================================================

state.motoristas = [];

/*
  gerarIdMotorista:
  - Gera ID único incremental.
*/
function gerarIdMotorista() {
  return state.motoristas.length > 0
    ? Math.max(...state.motoristas.map((m) => m.id)) + 1
    : 1;
}

/*
  criarMotorista:
  - Cadastra um motorista.
*/
function criarMotorista({ nome, cnh, categoria, ativo = true }) {
  if (!nome || !cnh || !categoria) {
    adicionarNotificacao("Preencha todos os campos do motorista.", "erro");
    return false;
  }

  const novo = {
    id: gerarIdMotorista(),
    nome,
    cnh,
    categoria,
    ativo,
    criadoEm: agoraFormatado()
  };

  state.motoristas.push(novo);

  registrarLog(`Motorista cadastrado: ${nome}`, "info");
  registrarAuditoria("CRIAR_MOTORISTA", novo, "medio");
  adicionarNotificacao("Motorista cadastrado com sucesso!", "sucesso");

  return true;
}

/*
  editarMotorista:
  - Atualiza dados de um motorista.
*/
function editarMotorista(id, novosDados) {
  const motorista = state.motoristas.find((m) => m.id === id);
  if (!motorista) {
    adicionarNotificacao("Motorista não encontrado.", "erro");
    return false;
  }

  Object.assign(motorista, novosDados);

  registrarLog(`Motorista editado: ${motorista.nome}`, "info");
  registrarAuditoria("EDITAR_MOTORISTA", { id, novosDados }, "medio");
  adicionarNotificacao("Motorista atualizado!", "sucesso");

  return true;
}

/*
  excluirMotorista:
  - Remove um motorista.
*/
function excluirMotorista(id) {
  const motorista = state.motoristas.find((m) => m.id === id);
  if (!motorista) return false;

  state.motoristas = state.motoristas.filter((m) => m.id !== id);

  registrarAuditoria("EXCLUIR_MOTORISTA", { id }, "alto");
  registrarLog(`Motorista excluído: ${motorista.nome}`, "warn");
  adicionarNotificacao("Motorista excluído permanentemente.", "aviso");

  return true;
}

/*
  listarMotoristas:
  - Retorna todos os motoristas.
*/
function listarMotoristas() {
  return [...state.motoristas];
}

// ======================================================================
// FIM DA PARTE 4/7
// Próxima parte: Cálculos Avançados (a parte mais pesada)
// ======================================================================
// ======================================================================
// ASSEUF ULTRA - APP.JS (PARTE 5/7)
// Módulo de Cálculos Avançados
// Estilo: DIDÁTICO (muito comentado)
// Arquitetura: MODULAR
// ======================================================================

/*
  Nesta parte implementamos:

  1. Cálculo por rota:
     - custo por km
     - custo total da rota
     - custo por aluno

  2. Cálculo por veículo:
     - custo operacional
     - custo por viagem
     - custo por aluno

  3. Cálculo por motorista:
     - custo de diária
     - custo por rota
     - custo por aluno

  4. Cálculo geral:
     - soma de todos os custos
     - custo médio por aluno
     - custo total do sistema

  5. Histórico:
     - salvamento automático
     - auditoria
     - logs detalhados

  IMPORTANTE:
  - Nenhuma interface visual aqui.
  - A UI será implementada na Parte 6/7.
*/

// ======================================================================
// CONFIGURAÇÕES DE CUSTOS PADRÃO
// ======================================================================

state.custos = {
  custoKm: 4.5,             // custo por km rodado
  custoDiariaMotorista: 180, // diária do motorista
  custoOperacionalVeiculo: 250, // custo fixo por dia do veículo
  custoAlunoPadrao: 0        // será calculado dinamicamente
};

// ======================================================================
// FUNÇÕES DE CÁLCULO POR ROTA
// ======================================================================

/*
  calcularCustoRota:
  - Calcula o custo total de uma rota com base na distância.
*/
function calcularCustoRota(rotaId) {
  const rota = state.rotas.find((r) => r.id === rotaId);
  if (!rota) return null;

  const custo = rota.distanciaKm * state.custos.custoKm;

  return {
    rotaId,
    nome: rota.nome,
    distanciaKm: rota.distanciaKm,
    custoTotal: custo
  };
}

/*
  calcularCustoRotaPorAluno:
  - Divide o custo total pelo número de alunos transportados.
*/
function calcularCustoRotaPorAluno(rotaId, alunos) {
  const base = calcularCustoRota(rotaId);
  if (!base) return null;

  const custoAluno = alunos > 0 ? base.custoTotal / alunos : 0;

  return {
    ...base,
    alunos,
    custoPorAluno: custoAluno
  };
}

// ======================================================================
// FUNÇÕES DE CÁLCULO POR VEÍCULO
// ======================================================================

/*
  calcularCustoVeiculo:
  - Calcula o custo operacional de um veículo.
*/
function calcularCustoVeiculo(veiculoId) {
  const veiculo = state.veiculos.find((v) => v.id === veiculoId);
  if (!veiculo) return null;

  return {
    veiculoId,
    placa: veiculo.placa,
    modelo: veiculo.modelo,
    capacidade: veiculo.capacidade,
    custoOperacional: state.custos.custoOperacionalVeiculo
  };
}

/*
  calcularCustoVeiculoPorAluno:
  - Divide o custo operacional pela capacidade do veículo.
*/
function calcularCustoVeiculoPorAluno(veiculoId) {
  const base = calcularCustoVeiculo(veiculoId);
  if (!base) return null;

  const custoAluno =
    base.capacidade > 0
      ? base.custoOperacional / base.capacidade
      : 0;

  return {
    ...base,
    custoPorAluno: custoAluno
  };
}

// ======================================================================
// FUNÇÕES DE CÁLCULO POR MOTORISTA
// ======================================================================

/*
  calcularCustoMotorista:
  - Retorna o custo da diária do motorista.
*/
function calcularCustoMotorista(motoristaId) {
  const motorista = state.motoristas.find((m) => m.id === motoristaId);
  if (!motorista) return null;

  return {
    motoristaId,
    nome: motorista.nome,
    categoria: motorista.categoria,
    custoDiaria: state.custos.custoDiariaMotorista
  };
}

/*
  calcularCustoMotoristaPorAluno:
  - Divide o custo da diária pelo número de alunos transportados.
*/
function calcularCustoMotoristaPorAluno(motoristaId, alunos) {
  const base = calcularCustoMotorista(motoristaId);
  if (!base) return null;

  const custoAluno = alunos > 0 ? base.custoDiaria / alunos : 0;

  return {
    ...base,
    alunos,
    custoPorAluno: custoAluno
  };
}

// ======================================================================
// CÁLCULO GERAL DO SISTEMA
// ======================================================================

/*
  calcularCustoGeral:
  - Soma todos os custos de rota, veículo e motorista.
  - Calcula custo médio por aluno.
*/
function calcularCustoGeral({ rotaId, veiculoId, motoristaId, alunos }) {
  const custoRota = calcularCustoRota(rotaId);
  const custoVeiculo = calcularCustoVeiculo(veiculoId);
  const custoMotorista = calcularCustoMotorista(motoristaId);

  if (!custoRota || !custoVeiculo || !custoMotorista) {
    adicionarNotificacao("Dados insuficientes para cálculo.", "erro");
    return null;
  }

  const total =
    custoRota.custoTotal +
    custoVeiculo.custoOperacional +
    custoMotorista.custoDiaria;

  const custoAluno = alunos > 0 ? total / alunos : 0;

  const resultado = {
    rota: custoRota,
    veiculo: custoVeiculo,
    motorista: custoMotorista,
    alunos,
    total,
    custoPorAluno: custoAluno,
    data: agoraFormatado()
  };

  registrarLog("Cálculo geral realizado.", "info", resultado);
  registrarAuditoria("CALCULO_GERAL", resultado, "medio");

  return resultado;
}

// ======================================================================
// SALVAMENTO NO HISTÓRICO
// ======================================================================

/*
  salvarCalculoNoHistorico:
  - Armazena o cálculo completo no histórico do sistema.
*/
function salvarCalculoNoHistorico(resultado) {
  if (!resultado) return;

  const id = Date.now();

  state.historico[id] = {
    id,
    ...resultado
  };

  registrarLog("Cálculo salvo no histórico.", "info");
  registrarAuditoria("SALVAR_CALCULO", { id }, "baixo");
  adicionarNotificacao("Cálculo salvo no histórico!", "sucesso");
}

// ======================================================================
// FUNÇÃO PRINCIPAL DE CÁLCULO (USADA PELA UI)
// ======================================================================

/*
  executarCalculo:
  - Função chamada pela interface.
  - Realiza o cálculo geral e salva no histórico.
*/
function executarCalculo(rotaId, veiculoId, motoristaId, alunos) {
  const resultado = calcularCustoGeral({
    rotaId,
    veiculoId,
    motoristaId,
    alunos
  });

  if (resultado) {
    salvarCalculoNoHistorico(resultado);
  }

  return resultado;
}

// ======================================================================
// FIM DA PARTE 5/7
// Próxima parte: Dashboard + Relatórios + Estatísticas
// ======================================================================
// ======================================================================
// ASSEUF ULTRA - APP.JS (PARTE 6/7)
// Dashboard + Relatórios + Estatísticas
// Estilo: DIDÁTICO (muito comentado)
// Arquitetura: MODULAR
// ======================================================================

/*
  Nesta parte implementamos:

  1. Dashboard:
     - Indicadores principais
     - Totais
     - Últimos cálculos
     - Resumo do sistema

  2. Relatórios:
     - Relatório geral
     - Relatório por rota
     - Relatório por veículo
     - Relatório por motorista
     - Exportação para PDF (opcional)
     - Exportação para CSV (opcional)

  3. Estatísticas:
     - Média de custos
     - Top rotas
     - Top veículos
     - Top motoristas
     - Gráficos (opcional Chart.js)

  IMPORTANTE:
  - A UI destas páginas será montada na Parte 7/7.
  - Aqui ficam apenas as funções e cálculos.
*/

// ======================================================================
// DASHBOARD - INDICADORES PRINCIPAIS
// ======================================================================

/*
  obterTotalRotas:
  - Retorna o número total de rotas cadastradas.
*/
function obterTotalRotas() {
  return state.rotas.length;
}

/*
  obterTotalVeiculos:
  - Retorna o número total de veículos cadastrados.
*/
function obterTotalVeiculos() {
  return state.veiculos.length;
}

/*
  obterTotalMotoristas:
  - Retorna o número total de motoristas cadastrados.
*/
function obterTotalMotoristas() {
  return state.motoristas.length;
}

/*
  obterTotalCalculos:
  - Retorna quantos cálculos existem no histórico.
*/
function obterTotalCalculos() {
  return Object.keys(state.historico).length;
}

/*
  obterUltimosCalculos:
  - Retorna os últimos N cálculos.
*/
function obterUltimosCalculos(qtd = 5) {
  const todos = Object.values(state.historico);
  return todos.sort((a, b) => b.id - a.id).slice(0, qtd);
}

// ======================================================================
// RELATÓRIOS - FUNÇÕES PRINCIPAIS
// ======================================================================

/*
  gerarRelatorioGeral:
  - Gera um relatório completo com:
    - totais
    - médias
    - últimos cálculos
*/
function gerarRelatorioGeral() {
  return {
    data: agoraFormatado(),
    totais: {
      rotas: obterTotalRotas(),
      veiculos: obterTotalVeiculos(),
      motoristas: obterTotalMotoristas(),
      calculos: obterTotalCalculos()
    },
    ultimosCalculos: obterUltimosCalculos(10),
    estatisticas: gerarEstatisticasGerais()
  };
}

/*
  gerarRelatorioPorRota:
  - Lista todas as rotas com seus custos estimados.
*/
function gerarRelatorioPorRota() {
  return state.rotas.map((rota) => ({
    id: rota.id,
    nome: rota.nome,
    distanciaKm: rota.distanciaKm,
    custoEstimado: rota.distanciaKm * state.custos.custoKm
  }));
}

/*
  gerarRelatorioPorVeiculo:
  - Lista veículos com custo operacional.
*/
function gerarRelatorioPorVeiculo() {
  return state.veiculos.map((v) => ({
    id: v.id,
    placa: v.placa,
    modelo: v.modelo,
    capacidade: v.capacidade,
    custoOperacional: state.custos.custoOperacionalVeiculo
  }));
}

/*
  gerarRelatorioPorMotorista:
  - Lista motoristas com custo de diária.
*/
function gerarRelatorioPorMotorista() {
  return state.motoristas.map((m) => ({
    id: m.id,
    nome: m.nome,
    categoria: m.categoria,
    custoDiaria: state.custos.custoDiariaMotorista
  }));
}

// ======================================================================
// EXPORTAÇÃO PARA PDF (OPCIONAL)
// ======================================================================

/*
  exportarPDF:
  - Exporta um relatório para PDF usando jsPDF (se disponível).
  - Não quebra o sistema caso jsPDF não esteja carregado.
*/
function exportarPDF(texto) {
  if (typeof window.jsPDF === "undefined") {
    adicionarNotificacao("Biblioteca jsPDF não carregada.", "erro");
    return false;
  }

  const doc = new jsPDF();
  const linhas = texto.split("\n");

  let y = 10;
  linhas.forEach((linha) => {
    doc.text(linha, 10, y);
    y += 7;
  });

  doc.save("relatorio.pdf");

  registrarLog("Relatório exportado para PDF.", "info");
  adicionarNotificacao("PDF gerado com sucesso!", "sucesso");

  return true;
}

// ======================================================================
// EXPORTAÇÃO PARA CSV (OPCIONAL)
// ======================================================================

/*
  exportarCSV:
  - Converte um array de objetos em CSV.
*/
function exportarCSV(dados, nomeArquivo = "relatorio.csv") {
  if (!Array.isArray(dados) || dados.length === 0) {
    adicionarNotificacao("Nada para exportar.", "erro");
    return false;
  }

  const colunas = Object.keys(dados[0]);
  const linhas = dados.map((obj) =>
    colunas.map((c) => JSON.stringify(obj[c] ?? "")).join(";")
  );

  const csv = [colunas.join(";"), ...linhas].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();

  registrarLog("Relatório exportado para CSV.", "info");
  adicionarNotificacao("CSV gerado com sucesso!", "sucesso");

  return true;
}

// ======================================================================
// ESTATÍSTICAS AVANÇADAS
// ======================================================================

/*
  gerarEstatisticasGerais:
  - Calcula estatísticas globais do sistema.
*/
function gerarEstatisticasGerais() {
  const historico = Object.values(state.historico);

  if (historico.length === 0) {
    return {
      mediaCustoAluno: 0,
      mediaCustoTotal: 0,
      maiorCusto: 0,
      menorCusto: 0
    };
  }

  const custos = historico.map((h) => h.total);
  const custosAluno = historico.map((h) => h.custoPorAluno);

  return {
    mediaCustoAluno:
      custosAluno.reduce((a, b) => a + b, 0) / custosAluno.length,

    mediaCustoTotal:
      custos.reduce((a, b) => a + b, 0) / custos.length,

    maiorCusto: Math.max(...custos),
    menorCusto: Math.min(...custos)
  };
}

/*
  topRotas:
  - Retorna as rotas mais caras.
*/
function topRotas(qtd = 5) {
  return state.rotas
    .map((r) => ({
      ...r,
      custoEstimado: r.distanciaKm * state.custos.custoKm
    }))
    .sort((a, b) => b.custoEstimado - a.custoEstimado)
    .slice(0, qtd);
}

/*
  topVeiculos:
  - Retorna veículos com maior custo operacional.
*/
function topVeiculos(qtd = 5) {
  return state.veiculos
    .map((v) => ({
      ...v,
      custoOperacional: state.custos.custoOperacionalVeiculo
    }))
    .slice(0, qtd);
}

/*
  topMotoristas:
  - Retorna motoristas com maior custo de diária.
*/
function topMotoristas(qtd = 5) {
  return state.motoristas
    .map((m) => ({
      ...m,
      custoDiaria: state.custos.custoDiariaMotorista
    }))
    .slice(0, qtd);
}

// ======================================================================
// GRÁFICOS (OPCIONAL - Chart.js)
// ======================================================================

/*
  gerarGrafico:
  - Cria um gráfico usando Chart.js se a biblioteca estiver carregada.
*/
function gerarGrafico(idCanvas, labels, valores, titulo = "Gráfico") {
  if (typeof Chart === "undefined") {
    registrarLog("Chart.js não carregado. Gráfico ignorado.", "warn");
    return false;
  }

  const ctx = document.getElementById(idCanvas);
  if (!ctx) return false;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: titulo,
          data: valores,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  registrarLog("Gráfico gerado com sucesso.", "info");
  return true;
}

// ======================================================================
// FIM DA PARTE 6/7
// Próxima parte: Histórico + Inicialização + Páginas UI
// ======================================================================
// ======================================================================
// ASSEUF ULTRA - APP.JS (PARTE 7/7)
// Histórico + UI completa + Inicialização
// Estilo: DIDÁTICO (muito comentado)
// Arquitetura: MODULAR
// ======================================================================

/*
  Nesta parte final implementamos:

  1. Páginas completas da UI:
     - Dashboard
     - Rotas
     - Veículos
     - Motoristas
     - Cálculos
     - Histórico
     - Relatórios
     - Usuários
     - Configurações
     - Auditoria

  2. Inicialização do sistema:
     - window.onload
     - render inicial
*/

// ======================================================================
// PÁGINA: DASHBOARD
// ======================================================================

function paginaDashboard() {
  const totais = {
    rotas: obterTotalRotas(),
    veiculos: obterTotalVeiculos(),
    motoristas: obterTotalMotoristas(),
    calculos: obterTotalCalculos()
  };

  const ultimos = obterUltimosCalculos(5);

  return UI.card(`
    ${UI.titulo("Dashboard", "Visão geral do sistema")}

    <div class="dash-grid">
      <div class="dash-item">Rotas: <strong>${totais.rotas}</strong></div>
      <div class="dash-item">Veículos: <strong>${totais.veiculos}</strong></div>
      <div class="dash-item">Motoristas: <strong>${totais.motoristas}</strong></div>
      <div class="dash-item">Cálculos: <strong>${totais.calculos}</strong></div>
    </div>

    <h3>Últimos cálculos</h3>
    <ul>
      ${ultimos
        .map(
          (c) => `
        <li>
          <strong>${c.data}</strong> — Total: R$ ${c.total.toFixed(2)}
        </li>
      `
        )
        .join("")}
    </ul>
  `);
}

// ======================================================================
// PÁGINA: ROTAS
// ======================================================================

function paginaRotas() {
  const rotas = listarRotas();

  return UI.card(`
    ${UI.titulo("Rotas", "Gerenciamento de rotas")}

    <div class="form-grid">
      ${UI.input("rota_nome", "Nome da rota")}
      ${UI.input("rota_origem", "Origem")}
      ${UI.input("rota_destino", "Destino")}
      ${UI.input("rota_km", "Distância (km)", "", "number")}
    </div>

    ${UI.botao("Criar rota", "uiCriarRota()", "primary")}

    <h3>Rotas cadastradas</h3>
    <ul>
      ${rotas
        .map(
          (r) => `
        <li>
          <strong>${r.nome}</strong> — ${r.origem} → ${r.destino}
          (${r.distanciaKm} km)
        </li>
      `
        )
        .join("")}
    </ul>
  `);
}

function uiCriarRota() {
  criarRota({
    nome: document.getElementById("rota_nome").value,
    origem: document.getElementById("rota_origem").value,
    destino: document.getElementById("rota_destino").value,
    distanciaKm: document.getElementById("rota_km").value
  });

  render();
}

// ======================================================================
// PÁGINA: VEÍCULOS
// ======================================================================

function paginaVeiculos() {
  const veiculos = listarVeiculos();

  return UI.card(`
    ${UI.titulo("Veículos", "Cadastro de veículos")}

    <div class="form-grid">
      ${UI.input("vei_placa", "Placa")}
      ${UI.input("vei_modelo", "Modelo")}
      ${UI.input("vei_cap", "Capacidade", "", "number")}
    </div>

    ${UI.botao("Cadastrar veículo", "uiCriarVeiculo()", "primary")}

    <h3>Veículos cadastrados</h3>
    <ul>
      ${veiculos
        .map(
          (v) => `
        <li>
          <strong>${v.placa}</strong> — ${v.modelo} (${v.capacidade} lugares)
        </li>
      `
        )
        .join("")}
    </ul>
  `);
}

function uiCriarVeiculo() {
  criarVeiculo({
    placa: document.getElementById("vei_placa").value,
    modelo: document.getElementById("vei_modelo").value,
    capacidade: document.getElementById("vei_cap").value
  });

  render();
}

// ======================================================================
// PÁGINA: MOTORISTAS
// ======================================================================

function paginaMotoristas() {
  const motoristas = listarMotoristas();

  return UI.card(`
    ${UI.titulo("Motoristas", "Cadastro de motoristas")}

    <div class="form-grid">
      ${UI.input("mot_nome", "Nome")}
      ${UI.input("mot_cnh", "CNH")}
      ${UI.input("mot_cat", "Categoria")}
    </div>

    ${UI.botao("Cadastrar motorista", "uiCriarMotorista()", "primary")}

    <h3>Motoristas cadastrados</h3>
    <ul>
      ${motoristas
        .map(
          (m) => `
        <li>
          <strong>${m.nome}</strong> — CNH: ${m.cnh} (${m.categoria})
        </li>
      `
        )
        .join("")}
    </ul>
  `);
}

function uiCriarMotorista() {
  criarMotorista({
    nome: document.getElementById("mot_nome").value,
    cnh: document.getElementById("mot_cnh").value,
    categoria: document.getElementById("mot_cat").value
  });

  render();
}

// ======================================================================
// PÁGINA: CÁLCULOS
// ======================================================================

function paginaCalculos() {
  return UI.card(`
    ${UI.titulo("Cálculos", "Cálculo avançado de custos")}

    <div class="form-grid">
      ${UI.input("calc_rota", "ID da rota", "", "number")}
      ${UI.input("calc_vei", "ID do veículo", "", "number")}
      ${UI.input("calc_mot", "ID do motorista", "", "number")}
      ${UI.input("calc_alunos", "Quantidade de alunos", "", "number")}
    </div>

    ${UI.botao("Calcular", "uiExecutarCalculo()", "primary")}

    <div id="calc_resultado"></div>
  `);
}

function uiExecutarCalculo() {
  const rotaId = Number(document.getElementById("calc_rota").value);
  const veiculoId = Number(document.getElementById("calc_vei").value);
  const motoristaId = Number(document.getElementById("calc_mot").value);
  const alunos = Number(document.getElementById("calc_alunos").value);

  const resultado = executarCalculo(rotaId, veiculoId, motoristaId, alunos);

  if (!resultado) return;

  document.getElementById("calc_resultado").innerHTML = `
    <h3>Resultado</h3>
    <p>Total: R$ ${resultado.total.toFixed(2)}</p>
    <p>Custo por aluno: R$ ${resultado.custoPorAluno.toFixed(2)}</p>
  `;
}

// ======================================================================
// PÁGINA: HISTÓRICO
// ======================================================================

function paginaHistorico() {
  const hist = Object.values(state.historico).sort((a, b) => b.id - a.id);

  return UI.card(`
    ${UI.titulo("Histórico", "Cálculos realizados")}

    <ul>
      ${hist
        .map(
          (h) => `
        <li>
          <strong>${h.data}</strong> — Total: R$ ${h.total.toFixed(2)}
        </li>
      `
        )
        .join("")}
    </ul>
  `);
}

// ======================================================================
// PÁGINA: RELATÓRIOS
// ======================================================================

function paginaRelatorios() {
  const rel = gerarRelatorioGeral();

  return UI.card(`
    ${UI.titulo("Relatórios", "Exportação e análises")}

    <pre>${JSON.stringify(rel, null, 2)}</pre>

    ${UI.botao("Exportar CSV", "exportarCSV(gerarRelatorioPorRota())")}
  `);
}

// ======================================================================
// PÁGINA: USUÁRIOS
// ======================================================================

function paginaUsuarios() {
  const usuarios = listarUsuarios();

  return UI.card(`
    ${UI.titulo("Usuários", "Gerenciamento de contas")}

    <ul>
      ${usuarios
        .map(
          (u) => `
        <li>
          <strong>${u.usuario}</strong> — ${u.nome} (${u.perfil})
        </li>
      `
        )
        .join("")}
    </ul>
  `);
}

// ======================================================================
// PÁGINA: CONFIGURAÇÕES
// ======================================================================

function paginaConfig() {
  return UI.card(`
    ${UI.titulo("Configurações", "Preferências do sistema")}

    <p>Tema atual: <strong>${state.config.tema}</strong></p>

    ${UI.botao("Tema claro", "uiTemaClaro()", "secondary")}
    ${UI.botao("Tema escuro", "uiTemaEscuro()", "secondary")}
  `);
}

function uiTemaClaro() {
  state.config.tema = "light";
  aplicarTema();
  salvarConfigLocal();
  render();
}

function uiTemaEscuro() {
  state.config.tema = "dark";
  aplicarTema();
  salvarConfigLocal();
  render();
}

// ======================================================================
// PÁGINA: AUDITORIA
// ======================================================================

function paginaAuditoria() {
  return UI.card(`
    ${UI.titulo("Auditoria", "Ações sensíveis registradas")}

    <ul>
      ${state.auditoria
        .map(
          (a) => `
        <li>
          <strong>${a.data}</strong> — ${a.acao} (${a.nivel})
        </li>
      `
        )
        .join("")}
    </ul>
  `);
}

// ======================================================================
// INICIALIZAÇÃO DO SISTEMA
// ======================================================================

window.onload = () => {
  registrarLog("Sistema iniciado.", "info");
  render();
};

// ======================================================================
// FIM DA PARTE 7/7
// ======================================================================