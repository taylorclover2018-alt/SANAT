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
  calculoAtual: null
};

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
  } else {
    root.style.setProperty('--bg', '#f5f5f5');
    root.style.setProperty('--text', '#333');
    root.style.setProperty('--card', '#fff');
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

function render() {
  const root = document.getElementById('root') || (() => {
    const r = document.createElement('div');
    r.id = 'root';
    document.body.innerHTML = '';
    document.body.appendChild(r);
    return r;
  })();

  if (!state.usuarioLogado) {
    root.innerHTML = paginaLogin();
    return;
  }

  let html = `
    <div style="display:flex;min-height:100vh;background:var(--bg);color:var(--text);">
      <aside style="width:220px;background:var(--card);padding:20px;">
        <h3>ASSEUF</h3>
        <nav style="display:flex;flex-direction:column;gap:8px;">
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
      <main style="flex:1;padding:20px;" id="main-content"></main>
    </div>
  `;
  root.innerHTML = html;
  const main = document.getElementById('main-content');
  switch (state.paginaAtual) {
    case 'home': main.innerHTML = paginaHome(); break;
    case 'rotas': main.innerHTML = paginaRotas(); break;
    case 'novaRota': main.innerHTML = paginaNovaRota(); break;
    case 'detalheRota': main.innerHTML = paginaRotaDetalhe(); break;
    case 'novoVeiculo': main.innerHTML = paginaNovoVeiculo(); break;
    case 'novoAluno': main.innerHTML = paginaNovoAluno(); break;
    case 'calculo': main.innerHTML = paginaCalculoRotas(); break;
    case 'historico': main.innerHTML = paginaHistorico(); break;
    case 'relatorio': main.innerHTML = paginaRelatorio(); break;
    case 'backup': main.innerHTML = paginaBackup(); break;
    default: main.innerHTML = paginaHome();
  }
}

function mudarPagina(pagina, params = {}) {
  state.paginaAtual = pagina;
  if (params.rotaId) state.rotaIdAtual = params.rotaId;
  render();
}

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
      <input type="text" id="login-user" placeholder="Usuário" style="width:100%;margin:8px0;padding:8px;">
      <input type="password" id="login-pass" placeholder="Senha" style="width:100%;margin:8px0;padding:8px;">
      <button onclick="fazerLogin(document.getElementById('login-user').value, document.getElementById('login-pass').value)" style="width:100%;padding:10px;">Entrar</button>
    </div>
  `;
}

function paginaHome() {
  return `<h2>Home</h2><p>Bem-vindo ao sistema ASSEUF ENTERPRISE PRO.</p>`;
}

function garantirRotas() {
  if (!state.rotas.length) {
    state.rotas.push({
      id: '1',
      nome: 'Curvelo',
      diasRodadosArray: [1,2,3,4,5],
      passagens: 20,
      veiculos: [
        { id: 'v1', nome: 'Van', valorDiaria: 20, qtdDiarias: 2, diasRodados: null },
        { id: 'v2', nome: 'Micro', valorDiaria: 30, qtdDiarias: 3, diasRodados: null }
      ],
      alunos: [
        { id: 'a1', nome: 'João', integral: true, desconto: 0 },
        { id: 'a2', nome: 'Maria', integral: false, desconto: 50 }
      ]
    });
    state.rotas.push({
      id: '2',
      nome: 'Sete Lagoas',
      diasRodadosArray: [1,2,3,4,5,6],
      passagens: 10,
      veiculos: [
        { id: 'v3', nome: 'Micro', valorDiaria: 40, qtdDiarias: 4, diasRodados: null },
        { id: 'v4', nome: 'Ônibus', valorDiaria: 50, qtdDiarias: 2, diasRodados: null }
      ],
      alunos: [
        { id: 'a3', nome: 'Pedro', integral: true, desconto: 0 },
        { id: 'a4', nome: 'Ana', integral: true, desconto: 0 },
        { id: 'a5', nome: 'Lucas', integral: true, desconto: 0 },
        { id: 'a6', nome: 'Carla', integral: true, desconto: 0 },
        { id: 'a7', nome: 'José', integral: false, desconto: 50 }
      ]
    });
  }
}

function paginaRotas() {
  garantirRotas();
  let html = '<h2>Rotas</h2><button onclick="mudarPagina(\'novaRota\')">Nova Rota</button><ul>';
  state.rotas.forEach(r => {
    html += `<li>${r.nome} <button onclick="mudarPagina('detalheRota', {rotaId:'${r.id}'})">Detalhes</button></li>`;
  });
  html += '</ul>';
  return html;
}

function paginaNovaRota() {
  return `
    <h2>Nova Rota</h2>
    <form onsubmit="salvarNovaRota(event)">
      <input type="text" id="rota-nome" placeholder="Nome da rota" required><br>
      <textarea id="rota-dias" placeholder="Dias rodados (ex: 1,2,3,4,5)"></textarea><br>
      <input type="number" id="rota-passagens" placeholder="Valor passagens" step="0.01"><br>
      <h4>Veículos</h4>
      <div id="veiculos-lista"></div>
      <button type="button" onclick="adicionarCampoVeiculo()">Adicionar Veículo</button>
      <h4>Alunos</h4>
      <div id="alunos-lista"></div>
      <button type="button" onclick="adicionarCampoAluno()">Adicionar Aluno</button><br><br>
      <button type="submit">Salvar Rota</button>
    </form>
  `;
}

window.adicionarCampoVeiculo = function() {
  const div = document.getElementById('veiculos-lista');
  const i = div.children.length;
  div.innerHTML += `<div>
    <input type="text" placeholder="Nome veículo" id="veiculo-nome-${i}">
    <input type="number" placeholder="Diária" id="veiculo-diaria-${i}" step="0.01">
    <input type="number" placeholder="Qtd diárias" id="veiculo-qtd-${i}" step="1">
    <input type="number" placeholder="Dias rodados (opcional)" id="veiculo-dias-${i}" step="1">
  </div>`;
};

window.adicionarCampoAluno = function() {
  const div = document.getElementById('alunos-lista');
  const i = div.children.length;
  div.innerHTML += `<div>
    <input type="text" placeholder="Nome aluno" id="aluno-nome-${i}">
    <label><input type="checkbox" id="aluno-integral-${i}"> Integral</label>
    <input type="number" placeholder="Desconto %" id="aluno-desconto-${i}" step="0.01" value="0">
  </div>`;
};

function salvarNovaRota(e) {
  e.preventDefault();
  const nome = document.getElementById('rota-nome').value;
  const diasStr = document.getElementById('rota-dias').value;
  const passagens = parseFloat(document.getElementById('rota-passagens').value) || 0;
  const diasRodadosArray = diasStr.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));

  const veiculos = [];
  const veicDivs = document.getElementById('veiculos-lista').children;
  for (let i = 0; i < veicDivs.length; i++) {
    const nome = document.getElementById(`veiculo-nome-${i}`)?.value;
    const diaria = parseFloat(document.getElementById(`veiculo-diaria-${i}`)?.value);
    const qtd = parseInt(document.getElementById(`veiculo-qtd-${i}`)?.value);
    const diasRodados = parseInt(document.getElementById(`veiculo-dias-${i}`)?.value);
    if (nome && !isNaN(diaria) && !isNaN(qtd)) {
      veiculos.push({
        id: 'v' + Date.now() + i,
        nome,
        valorDiaria: diaria,
        qtdDiarias: qtd,
        diasRodados: isNaN(diasRodados) ? null : diasRodados
      });
    }
  }

  const alunos = [];
  const alunoDivs = document.getElementById('alunos-lista').children;
  for (let i = 0; i < alunoDivs.length; i++) {
    const nome = document.getElementById(`aluno-nome-${i}`)?.value;
    const integral = document.getElementById(`aluno-integral-${i}`)?.checked;
    const desconto = parseFloat(document.getElementById(`aluno-desconto-${i}`)?.value) || 0;
    if (nome) {
      alunos.push({
        id: 'a' + Date.now() + i,
        nome,
        integral: !!integral,
        desconto
      });
    }
  }

  const novaRota = {
    id: Date.now().toString(),
    nome,
    diasRodadosArray,
    passagens,
    veiculos,
    alunos
  };
  state.rotas.push(novaRota);
  salvarBackup();
  notificar('Rota criada', 'sucesso');
  mudarPagina('rotas');
}

function paginaRotaDetalhe() {
  const rota = state.rotas.find(r => r.id === state.rotaIdAtual);
  if (!rota) return '<p>Rota não encontrada</p>';
  return `
    <h2>${rota.nome}</h2>
    <p>Dias: ${rota.diasRodadosArray.join(', ')}</p>
    <p>Passagens: R$ ${rota.passagens}</p>
    <h4>Veículos</h4>
    <ul>${rota.veiculos.map(v => `<li>${v.nome} - Diária R$${v.valorDiaria} x ${v.qtdDiarias} diárias${v.diasRodados ? `, dias rodados ${v.diasRodados}` : ''}</li>`).join('')}</ul>
    <h4>Alunos</h4>
    <ul>${rota.alunos.map(a => `<li>${a.nome} - ${a.integral ? 'Integral' : a.desconto+'%'}</li>`).join('')}</ul>
    <button onclick="mudarPagina('rotas')">Voltar</button>
  `;
}

function paginaNovoVeiculo() { return '<p>Em construção: novo veículo</p>'; }
function salvarNovoVeiculo() {}
function paginaNovoAluno() { return '<p>Em construção: novo aluno</p>'; }
function salvarNovoAluno() {}

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
  const valorPorDia = auxilioTotal / diasMaximo;
  const auxilioPorRota = rotas.map(() => 0);

  for (let dia = 1; dia <= diasMaximo; dia++) {
    const rotasNoDia = rotas.filter(r => r.diasRodadosArray.includes(dia));
    if (rotasNoDia.length === rotas.length) {
      const brutos = rotasNoDia.map(r => calcularBruto(r));
      const totalBruto = brutos.reduce((a,b) => a+b, 0);
      rotasNoDia.forEach((r, idx) => {
        const proporcao = brutos[idx] / totalBruto;
        auxilioPorRota[rotas.indexOf(r)] += valorPorDia * proporcao;
      });
    } else if (rotasNoDia.length === 1) {
      const r = rotasNoDia[0];
      auxilioPorRota[rotas.indexOf(r)] += valorPorDia * 0.7;
      rotas.filter(r2 => !r2.diasRodadosArray.includes(dia)).forEach(r2 => {
        auxilioPorRota[rotas.indexOf(r2)] += valorPorDia * 0.3;
      });
    }
  }
  return auxilioPorRota;
}

function calcularValoresPorAluno(rota, saldoAposAuxilioEPassagens) {
  const integrais = rota.alunos.filter(a => a.integral).length;
  let totalDesconto = 0;
  rota.alunos.forEach(a => {
    if (!a.integral) totalDesconto += a.desconto / 100;
  });
  const fator = 1 + totalDesconto; // cada desconto reduz a base? No exemplo, eles dividem de forma que integral paga x e com desconto paga x*(1-desconto). Então precisamos encontrar x tal que: integrais*x + soma( (1-desconto)*x ) = saldo.
  // soma( (1-desconto) ) = integrais + soma(1-desconto dos nao integrais)
  let somaCoef = integrais;
  rota.alunos.forEach(a => {
    if (!a.integral) somaCoef += (1 - a.desconto/100);
  });
  const valorIntegral = saldoAposAuxilioEPassagens / somaCoef;
  return rota.alunos.map(a => ({
    nome: a.nome,
    valor: a.integral ? valorIntegral : valorIntegral * (1 - a.desconto/100)
  }));
}

function calcularAuxilio(auxilioTotal) {
  garantirRotas();
  const rotas = state.rotas;
  const brutos = rotas.map(r => calcularBruto(r));
  const auxilios = calcularDistribuicao30_70(rotas, auxilioTotal);
  const resultados = rotas.map((r, idx) => {
    const bruto = brutos[idx];
    const auxilio = auxilios[idx];
    const aposAuxilio = bruto - auxilio;
    const aposPassagens = aposAuxilio - r.passagens;
    const alunosValores = calcularValoresPorAluno(r, aposPassagens);
    return {
      rota: r.nome,
      bruto,
      auxilio,
      aposAuxilio,
      aposPassagens,
      alunos: alunosValores
    };
  });
  state.calculoAtual = { auxilioTotal, resultados, data: new Date().toISOString() };
  return resultados;
}

function paginaCalculoRotas() {
  garantirRotas();
  let html = '<h2>Cálculo de Rotas e Auxílio</h2>';
  html += '<label>Valor total do auxílio: <input type="number" id="auxilioTotal" step="0.01" value="200"></label>';
  html += '<button onclick="executarCalculo()">Calcular</button>';
  html += '<div id="resultado-calculo"></div>';
  return html;
}

window.executarCalculo = function() {
  const valor = parseFloat(document.getElementById('auxilioTotal').value);
  if (isNaN(valor)) return notificar('Valor inválido', 'erro');
  const res = calcularAuxilio(valor);
  let html = '<h3>Resultado</h3><table border="1" style="border-collapse:collapse"><tr><th>Rota</th><th>Bruto</th><th>Auxílio</th><th>Após auxílio</th><th>Após passagens</th></tr>';
  res.forEach(r => {
    html += `<tr><td>${r.rota}</td><td>${r.bruto.toFixed(2)}</td><td>${r.auxilio.toFixed(2)}</td><td>${r.aposAuxilio.toFixed(2)}</td><td>${r.aposPassagens.toFixed(2)}</td></tr>`;
  });
  html += '</table>';
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
    html += `<li>${new Date(calc.data).toLocaleString()} - Auxílio total: R$ ${calc.auxilioTotal} <button onclick="excluirRegistroHistorico(${idx})">Excluir</button></li>`;
  });
  html += '</ul>';
  return html;
}

function gerarMemoriaCalculo(calc) {
  if (!calc) return '';
  let memoria = `Memória de Cálculo - ${new Date(calc.data).toLocaleString()}\n`;
  memoria += `Auxílio total: R$ ${calc.auxilioTotal}\n\n`;
  calc.resultados.forEach(r => {
    memoria += `Rota: ${r.rota}\n`;
    memoria += `  Bruto: R$ ${r.bruto.toFixed(2)}\n`;
    memoria += `  Auxílio: R$ ${r.auxilio.toFixed(2)}\n`;
    memoria += `  Após auxílio: R$ ${r.aposAuxilio.toFixed(2)}\n`;
    memoria += `  Passagens: R$ ${(r.bruto - r.aposAuxilio).toFixed(2)}\n`;
    memoria += `  Após passagens: R$ ${r.aposPassagens.toFixed(2)}\n`;
    memoria += `  Alunos:\n`;
    r.alunos.forEach(a => memoria += `    ${a.nome}: R$ ${a.valor.toFixed(2)}\n`);
    memoria += '\n';
  });
  return memoria;
}

function paginaRelatorio() {
  if (!state.historicoCalculos.length) return '<h2>Relatório</h2><p>Nenhum cálculo no histórico.</p>';
  const calc = state.historicoCalculos[state.historicoCalculos.length - 1];
  const memoria = gerarMemoriaCalculo(calc);
  return `<h2>Relatório (último cálculo)</h2><pre style="background:var(--card);padding:20px;white-space:pre-wrap;">${memoria}</pre>`;
}

function paginaBackup() {
  return `
    <h2>Backup</h2>
    <button onclick="exportarBackup()">Exportar Backup</button>
    <button onclick="document.getElementById('importFile').click()">Importar Backup</button>
    <input type="file" id="importFile" style="display:none" accept=".json" onchange="importarBackup(event)">
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

window.addEventListener('load', () => {
  carregarBackup();
  criarUsuarioAdminPadrao();
  render();
});

// Expor funções globais necessárias
window.mudarPagina = mudarPagina;
window.fazerLogin = fazerLogin;
window.logout = logout;
window.alternarTema = alternarTema;
window.salvarNovaRota = salvarNovaRota;
window.salvarCalculoNoHistorico = salvarCalculoNoHistorico;
window.excluirRegistroHistorico = excluirRegistroHistorico;
window.exportarBackup = exportarBackup;
window.importarBackup = importarBackup;
