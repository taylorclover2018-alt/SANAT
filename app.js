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
  calculoAtual: null,
  rotaEmEdicao: null
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
    root.style.setProperty('--border', '#444');
  } else {
    root.style.setProperty('--bg', '#f5f5f5');
    root.style.setProperty('--text', '#333');
    root.style.setProperty('--card', '#fff');
    root.style.setProperty('--border', '#ddd');
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
      <aside style="width:220px;background:var(--card);padding:20px;border-right:1px solid var(--border);">
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
    case 'editarRota': main.innerHTML = paginaEditarRota(); break;
    case 'calculo': main.innerHTML = paginaCalculoRotas(); break;
    case 'historico': main.innerHTML = paginaHistorico(); break;
    case 'relatorio': main.innerHTML = paginaRelatorio(); break;
    case 'backup': main.innerHTML = paginaBackup(); break;
    default: main.innerHTML = paginaHome();
  }
}

function mudarPagina(pagina, params = {}) {
  state.paginaAtual = pagina;
  if (params.rotaId) state.rotaEmEdicao = params.rotaId;
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

function paginaRotas() {
  let html = '<h2>Rotas</h2><button onclick="mudarPagina(\'novaRota\')">Nova Rota</button><ul>';
  state.rotas.forEach(r => {
    html += `<li>${r.nome} 
      <button onclick="mudarPagina('editarRota', {rotaId:'${r.id}'})">Editar</button>
      <button onclick="excluirRota('${r.id}')">Excluir</button>
    </li>`;
  });
  html += '</ul>';
  return html;
}

function excluirRota(id) {
  if (state.usuarioLogado.perfil !== 'admin' && state.usuarioLogado.perfil !== 'taylor') {
    return notificar('Permissão negada', 'erro');
  }
  state.rotas = state.rotas.filter(r => r.id !== id);
  salvarBackup();
  render();
}

function paginaNovaRota() {
  state.rotaEmEdicao = null;
  return formularioRota();
}

function paginaEditarRota() {
  const rota = state.rotas.find(r => r.id === state.rotaEmEdicao);
  if (!rota) return '<p>Rota não encontrada</p>';
  return formularioRota(rota);
}

function formularioRota(rota = null) {
  const id = rota ? rota.id : '';
  const nome = rota ? rota.nome : '';
  const diasRodados = rota ? rota.diasRodadosArray.join(',') : '';
  const passagens = rota ? rota.passagens : '';
  const veiculos = rota ? rota.veiculos : [];
  const alunos = rota ? rota.alunos : [];

  let veiculosHtml = '';
  veiculos.forEach((v, idx) => {
    veiculosHtml += `
      <div class="veiculo-item" style="margin-bottom:8px;padding:8px;border:1px solid var(--border);">
        <input type="text" placeholder="Nome veículo" value="${v.nome}" id="veiculo-nome-${idx}" required>
        <input type="number" placeholder="Diária (R$)" step="0.01" value="${v.valorDiaria}" id="veiculo-diaria-${idx}" required>
        <input type="number" placeholder="Qtd diárias" step="1" value="${v.qtdDiarias}" id="veiculo-qtd-${idx}" required>
        <input type="number" placeholder="Dias rodados (opcional)" step="1" value="${v.diasRodados || ''}" id="veiculo-dias-${idx}">
        <button type="button" onclick="removerVeiculo(this)">Remover</button>
      </div>
    `;
  });

  let alunosHtml = '';
  alunos.forEach((a, idx) => {
    const tipo = a.integral ? 'integral' : 'desconto';
    alunosHtml += `
      <div class="aluno-item" style="margin-bottom:8px;padding:8px;border:1px solid var(--border);">
        <input type="text" placeholder="Nome aluno" value="${a.nome}" id="aluno-nome-${idx}" required>
        <select id="aluno-tipo-${idx}">
          <option value="integral" ${tipo==='integral'?'selected':''}>Integral</option>
          <option value="desconto" ${tipo==='desconto'?'selected':''}>Com desconto</option>
        </select>
        <input type="number" placeholder="Desconto %" step="0.01" value="${a.desconto || 0}" id="aluno-desconto-${idx}">
        <button type="button" onclick="removerAluno(this)">Remover</button>
      </div>
    `;
  });

  return `
    <h2>${rota ? 'Editar' : 'Nova'} Rota</h2>
    <form onsubmit="salvarRota(event)">
      <input type="hidden" id="rota-id" value="${id}">
      <div>
        <label>Nome da rota:</label>
        <input type="text" id="rota-nome" value="${nome}" required>
      </div>
      <div>
        <label>Dias rodados (ex: 1,2,3,4):</label>
        <input type="text" id="rota-dias" value="${diasRodados}" required>
      </div>
      <div>
        <label>Valor das passagens (R$):</label>
        <input type="number" id="rota-passagens" step="0.01" value="${passagens}" required>
      </div>
      <h4>Veículos</h4>
      <div id="veiculos-container">${veiculosHtml}</div>
      <button type="button" onclick="adicionarVeiculo()">Adicionar Veículo</button>
      <h4>Alunos</h4>
      <div id="alunos-container">${alunosHtml}</div>
      <button type="button" onclick="adicionarAluno()">Adicionar Aluno</button><br><br>
      <button type="submit">Salvar</button>
      <button type="button" onclick="mudarPagina('rotas')">Cancelar</button>
    </form>
  `;
}

window.adicionarVeiculo = function() {
  const container = document.getElementById('veiculos-container');
  const idx = container.children.length;
  const div = document.createElement('div');
  div.className = 'veiculo-item';
  div.style = 'margin-bottom:8px;padding:8px;border:1px solid var(--border);';
  div.innerHTML = `
    <input type="text" placeholder="Nome veículo" id="veiculo-nome-${idx}" required>
    <input type="number" placeholder="Diária (R$)" step="0.01" id="veiculo-diaria-${idx}" required>
    <input type="number" placeholder="Qtd diárias" step="1" id="veiculo-qtd-${idx}" required>
    <input type="number" placeholder="Dias rodados (opcional)" step="1" id="veiculo-dias-${idx}">
    <button type="button" onclick="removerVeiculo(this)">Remover</button>
  `;
  container.appendChild(div);
};

window.removerVeiculo = function(btn) {
  btn.closest('.veiculo-item').remove();
};

window.adicionarAluno = function() {
  const container = document.getElementById('alunos-container');
  const idx = container.children.length;
  const div = document.createElement('div');
  div.className = 'aluno-item';
  div.style = 'margin-bottom:8px;padding:8px;border:1px solid var(--border);';
  div.innerHTML = `
    <input type="text" placeholder="Nome aluno" id="aluno-nome-${idx}" required>
    <select id="aluno-tipo-${idx}">
      <option value="integral">Integral</option>
      <option value="desconto">Com desconto</option>
    </select>
    <input type="number" placeholder="Desconto %" step="0.01" id="aluno-desconto-${idx}" value="0">
    <button type="button" onclick="removerAluno(this)">Remover</button>
  `;
  container.appendChild(div);
};

window.removerAluno = function(btn) {
  btn.closest('.aluno-item').remove();
};

function salvarRota(e) {
  e.preventDefault();
  const id = document.getElementById('rota-id').value;
  const nome = document.getElementById('rota-nome').value;
  const diasStr = document.getElementById('rota-dias').value;
  const passagens = parseFloat(document.getElementById('rota-passagens').value) || 0;
  const diasRodadosArray = diasStr.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));

  const veiculos = [];
  const veiculoItems = document.querySelectorAll('#veiculos-container .veiculo-item');
  veiculoItems.forEach((item, idx) => {
    const nome = item.querySelector(`#veiculo-nome-${idx}`)?.value;
    const diaria = parseFloat(item.querySelector(`#veiculo-diaria-${idx}`)?.value);
    const qtd = parseInt(item.querySelector(`#veiculo-qtd-${idx}`)?.value);
    const diasRodados = parseInt(item.querySelector(`#veiculo-dias-${idx}`)?.value);
    if (nome && !isNaN(diaria) && !isNaN(qtd)) {
      veiculos.push({
        id: 'v' + Date.now() + idx,
        nome,
        valorDiaria: diaria,
        qtdDiarias: qtd,
        diasRodados: isNaN(diasRodados) ? null : diasRodados
      });
    }
  });

  const alunos = [];
  const alunoItems = document.querySelectorAll('#alunos-container .aluno-item');
  alunoItems.forEach((item, idx) => {
    const nome = item.querySelector(`#aluno-nome-${idx}`)?.value;
    const tipo = item.querySelector(`#aluno-tipo-${idx}`)?.value;
    const desconto = parseFloat(item.querySelector(`#aluno-desconto-${idx}`)?.value) || 0;
    if (nome) {
      alunos.push({
        id: 'a' + Date.now() + idx,
        nome,
        integral: tipo === 'integral',
        desconto: tipo === 'integral' ? 0 : desconto
      });
    }
  });

  if (!veiculos.length || !alunos.length) {
    return notificar('Adicione pelo menos um veículo e um aluno', 'erro');
  }

  const rota = {
    id: id || Date.now().toString(),
    nome,
    diasRodadosArray,
    passagens,
    veiculos,
    alunos
  };

  if (id) {
    const index = state.rotas.findIndex(r => r.id === id);
    if (index !== -1) state.rotas[index] = rota;
  } else {
    state.rotas.push(rota);
  }

  salvarBackup();
  notificar('Rota salva', 'sucesso');
  mudarPagina('rotas');
}

// Cálculos
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

function calcularAuxilio(auxilioDinheiro, auxilioCombustivel) {
  const auxilioTotal = auxilioDinheiro + auxilioCombustivel;
  const rotas = state.rotas;
  if (!rotas.length) return notificar('Nenhuma rota cadastrada', 'erro');
  const brutos = rotas.map(r => calcularBruto(r));
  const auxilios = calcularDistribuicao30_70(rotas, auxilioTotal);
  const totalBruto = brutos.reduce((a,b) => a+b, 0);
  const resultados = rotas.map((r, idx) => {
    const bruto = brutos[idx];
    const auxilio = auxilios[idx];
    const aposAuxilio = bruto - auxilio;
    const aposPassagens = aposAuxilio - r.passagens;
    const alunosValores = calcularValoresPorAluno(r, aposPassagens);
    return {
      rota: r.nome,
      bruto,
      percBruto: (bruto / totalBruto * 100).toFixed(2),
      auxilio,
      percAuxilio: (auxilio / auxilioTotal * 100).toFixed(2),
      aposAuxilio,
      aposPassagens,
      alunos: alunosValores
    };
  });
  state.calculoAtual = { 
    auxilioDinheiro, 
    auxilioCombustivel, 
    auxilioTotal, 
    resultados, 
    data: new Date().toISOString() 
  };
  return resultados;
}

function paginaCalculoRotas() {
  let html = '<h2>Cálculo de Rotas e Auxílio</h2>';
  html += `
    <div style="background:var(--card);padding:20px;border-radius:8px;">
      <label>Auxílio em Dinheiro (R$): <input type="number" id="auxilioDinheiro" step="0.01" value="0"></label><br>
      <label>Auxílio em Combustível (R$): <input type="number" id="auxilioCombustivel" step="0.01" value="0"></label><br>
      <button onclick="executarCalculo()">Calcular</button>
    </div>
    <div id="resultado-calculo" style="margin-top:20px;"></div>
  `;
  return html;
}

window.executarCalculo = function() {
  const dinheiro = parseFloat(document.getElementById('auxilioDinheiro').value) || 0;
  const combustivel = parseFloat(document.getElementById('auxilioCombustivel').value) || 0;
  if (dinheiro + combustivel === 0) return notificar('Informe pelo menos um valor de auxílio', 'erro');
  const res = calcularAuxilio(dinheiro, combustivel);
  let html = '<h3>Resultado</h3>';
  html += '<table style="width:100%;border-collapse:collapse;background:var(--card);">';
  html += '<thead><tr style="background:#4CAF50;color:#fff;"><th>Rota</th><th>Bruto (R$)</th><th>% Bruto</th><th>Auxílio (R$)</th><th>% Auxílio</th><th>Após auxílio</th><th>Após passagens</th></tr></thead><tbody>';
  res.forEach(r => {
    html += `<tr style="border-bottom:1px solid var(--border);">
      <td>${r.rota}</td>
      <td>${r.bruto.toFixed(2)}</td>
      <td>${r.percBruto}%</td>
      <td>${r.auxilio.toFixed(2)}</td>
      <td>${r.percAuxilio}%</td>
      <td>${r.aposAuxilio.toFixed(2)}</td>
      <td>${r.aposPassagens.toFixed(2)}</td>
    </tr>`;
  });
  html += '</tbody></table>';
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
    html += `<li>${new Date(calc.data).toLocaleString()} - Auxílio total: R$ ${calc.auxilioTotal} (Dinheiro: R$ ${calc.auxilioDinheiro}, Combustível: R$ ${calc.auxilioCombustivel}) 
      <button onclick="excluirRegistroHistorico(${idx})">Excluir</button>
      <button onclick="visualizarRelatorio(${idx})">Ver relatório</button>
    </li>`;
  });
  html += '</ul>';
  return html;
}

function visualizarRelatorio(index) {
  state.calculoAtual = state.historicoCalculos[index];
  mudarPagina('relatorio');
}

function paginaRelatorio() {
  if (!state.calculoAtual) return '<h2>Relatório</h2><p>Selecione um cálculo no histórico.</p>';
  const calc = state.calculoAtual;
  return `
    <h2>Relatório do Cálculo</h2>
    <button onclick="imprimirRelatorio()">Exportar PDF</button>
    <div id="relatorio-conteudo" style="background:var(--card);padding:20px;margin-top:20px;">
      ${gerarHTMLRelatorio(calc)}
    </div>
  `;
}

function gerarHTMLRelatorio(calc) {
  let html = `<h3>Data: ${new Date(calc.data).toLocaleString()}</h3>`;
  html += `<p>Auxílio total: R$ ${calc.auxilioTotal} (Dinheiro: R$ ${calc.auxilioDinheiro}, 
