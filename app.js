// ===============================
// ESTADO GLOBAL DA APLICAÇÃO
// ===============================
const state = {
  pagina: 'inicio',      // 'inicio' | 'calculo' | 'relatorios' | 'pdf'
  resultado: null,       // último resultado de cálculo das rotas
  historico: []          // histórico salvo em localStorage
};

// ===============================
// UTILITÁRIOS GERAIS
// ===============================

/**
 * Formata número em Real brasileiro.
 * Ex: 12047.0 -> "R$ 12.047,00"
 */
function formatBRL(valor) {
  if (isNaN(valor)) return 'R$ 0,00';
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * Lê histórico do localStorage ao iniciar.
 */
function carregarHistoricoLocal() {
  try {
    const raw = localStorage.getItem('historico_rotas');
    if (!raw) {
      state.historico = [];
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      state.historico = parsed;
    } else {
      state.historico = [];
    }
  } catch (e) {
    console.error('Erro ao carregar histórico do localStorage:', e);
    state.historico = [];
  }
}

/**
 * Salva histórico no localStorage.
 */
function salvarHistoricoLocal() {
  try {
    localStorage.setItem('historico_rotas', JSON.stringify(state.historico));
  } catch (e) {
    console.error('Erro ao salvar histórico no localStorage:', e);
  }
}

/**
 * Adiciona um registro ao histórico.
 */
function adicionarAoHistorico(mesRef, rotaNome, dados) {
  const base = {
    mes_ref: mesRef || '',
    rota: rotaNome,
    bruto: dados.bruto,
    passagens: dados.passagens,
    dez_porcento: dados.dezPorcento,
    bruto_aj_10: dados.brutoAj10,
    aux_recebido: dados.auxRecebido,
    pos_aux: dados.posAux,
    noventa_porcento: dados.noventaPorcento,
    valor_final: dados.valorFinal,
    alunos_integrais: dados.alunosIntegrais,
    alunos_desconto_total: dados.alunosDescontoTotal,
    mensalidade_media: dados.mensalidadeMedia,
    veiculos: dados.veiculosQtd,
    diarias: dados.diarias,
    data_registro: new Date().toLocaleString('pt-BR')
  };

  state.historico.push(base);
  salvarHistoricoLocal();
}

// ===============================
// FUNÇÕES DE CÁLCULO
// ===============================

/**
 * Calcula o custo bruto da rota somando (valor diária * dias) de cada veículo.
 * veiculos: [{ nome, valor, dias }]
 */
function calcularBruto(veiculos) {
  return veiculos.reduce((acc, v) => acc + (v.valor || 0) * (v.dias || 0), 0);
}

/**
 * Calcula o "peso" total dos alunos, considerando integrais e faixas de desconto.
 * alunosIntegrais: número
 * descontos: [{ percentual, quantidade }]
 */
function calcularPesoAlunos(alunosIntegrais, descontos) {
  let peso = alunosIntegrais || 0;
  descontos.forEach(faixa => {
    const pct = faixa.percentual || 0;
    const qtd = faixa.quantidade || 0;
    const fator = (100 - pct) / 100;
    peso += qtd * fator;
  });
  return peso;
}

/**
 * Distribui o auxílio total entre as duas rotas com base nas diárias e regra 70/30.
 */
function distribuirAuxilioPorDiarias(auxTotal, dSete, dCur) {
  if (auxTotal <= 0) return { auxSete: 0, auxCur: 0 };
  if (dSete === 0 && dCur === 0) return { auxSete: 0, auxCur: 0 };
  if (dSete === 0) return { auxSete: 0, auxCur: auxTotal };
  if (dCur === 0) return { auxSete: auxTotal, auxCur: 0 };

  if (dSete === dCur) {
    const total = dSete + dCur;
    return {
      auxSete: auxTotal * dSete / total,
      auxCur: auxTotal * dCur / total
    };
  }

  if (dSete > dCur) {
    const excedente = dSete - dCur;
    const base = dCur;
    const totalBase = base * 2 + excedente;
    const valorDiaria = auxTotal / totalBase;
    const auxSete = base * valorDiaria + excedente * (valorDiaria * 0.70);
    const auxCur = base * valorDiaria + excedente * (valorDiaria * 0.30);
    return { auxSete, auxCur };
  }

  const excedente = dCur - dSete;
  const base = dSete;
  const totalBase = base * 2 + excedente;
  const valorDiaria = auxTotal / totalBase;
  const auxSete = base * valorDiaria + excedente * (valorDiaria * 0.30);
  const auxCur = base * valorDiaria + excedente * (valorDiaria * 0.70);
  return { auxSete, auxCur };
}

/**
 * Calcula todos os indicadores de uma rota.
 */
function calcularRota({ veiculos, passagens, alunosIntegrais, descontos, auxRecebido, diarias }) {
  const bruto = calcularBruto(veiculos);
  const dezPorcento = passagens * 0.10;
  const brutoAj10 = bruto - dezPorcento;
  const posAux = brutoAj10 - auxRecebido;
  const noventaPorcento = passagens * 0.90;
  const valorFinal = posAux - noventaPorcento;

  const pesoAlunos = calcularPesoAlunos(alunosIntegrais, descontos);
  const alunosDescontoTotal = descontos.reduce((acc, f) => acc + (f.quantidade || 0), 0);
  const mensalidadeMedia = pesoAlunos > 0 ? valorFinal / pesoAlunos : 0;

  return {
    bruto,
    passagens,
    dezPorcento,
    brutoAj10,
    auxRecebido,
    posAux,
    noventaPorcento,
    valorFinal,
    alunosIntegrais,
    alunosDescontoTotal,
    mensalidadeMedia,
    descontos,
    diarias,
    veiculosQtd: veiculos.length
  };
}

// ===============================
// RENDERIZAÇÃO DAS PÁGINAS
// ===============================

/**
 * Render principal: decide qual página mostrar.
 */
function render(app) {
  app.innerHTML = '';

  if (state.pagina === 'inicio') {
    renderInicio(app);
  } else if (state.pagina === 'calculo') {
    renderCalculo(app);
  } else if (state.pagina === 'relatorios') {
    renderRelatorios(app);
  } else if (state.pagina === 'pdf') {
    renderPdfPage(app);
  }
}

/**
 * Página "Início" – explicação da metodologia.
 */
function renderInicio(container) {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2 class="section-title">Sistema de Cálculo das Rotas - ASSEUF</h2>
    <div class="divider"></div>
    <p>
      Este sistema foi desenvolvido para representar, com o máximo de fidelidade possível,
      o custo real de operação das rotas <strong>Sete Lagoas</strong> e <strong>Curvelo</strong>.
      A ideia é transformar um cenário complexo (veículos, diárias, auxílio, passagens,
      alunos integrais e com desconto) em um cálculo claro, auditável e visualmente organizado.
    </p>
    <p>
      A lógica segue uma sequência bem definida, sempre por rota:
    </p>
    <ol>
      <li><strong>Custo bruto:</strong> soma de (valor da diária × dias rodados) de cada veículo.</li>
      <li><strong>Desconto de 10% das passagens:</strong> esse valor é abatido diretamente do bruto.</li>
      <li><strong>Auxílio:</strong> o total do auxílio do mês é dividido entre as rotas
          com base nas diárias rodadas e na regra de compensação 70/30.</li>
      <li><strong>Abatimento do auxílio:</strong> o auxílio recebido por cada rota é subtraído
          do custo já ajustado pelos 10%.</li>
      <li><strong>Desconto dos 90% restantes das passagens:</strong> o valor restante das passagens
          (90%) é abatido da própria rota.</li>
      <li><strong>Rateio entre alunos:</strong> o valor final é dividido considerando
          alunos integrais e alunos com desconto, onde cada faixa de desconto
          tem um peso proporcional.</li>
    </ol>
    <p>
      O resultado final é uma visão detalhada por rota: quanto custou, quanto foi abatido,
      quanto de auxílio entrou e qual é a mensalidade média esperada por aluno,
      respeitando os diferentes níveis de desconto.
    </p>
    <p>
      Use o menu superior para navegar entre as abas:
      <strong>Cadastro e Cálculo</strong>, <strong>Relatórios</strong> e <strong>PDF</strong>.
    </p>
  `;

  container.appendChild(card);
}

// As funções abaixo serão implementadas nas próximas partes:
// - renderCalculo(container)
// - renderRelatorios(container)
// - renderPdfPage(container)

// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const navButtons = document.querySelectorAll('nav button');

  // Carrega histórico salvo
  carregarHistoricoLocal();

  // Configura navegação
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (!page) return;
      state.pagina = page;
      render(app);
    });
  });

  // Render inicial
  render(app);
});
// ===============================================
// PARTE 2 — PÁGINA DE CADASTRO E CÁLCULO COMPLETA
// ===============================================

/**
 * Renderiza a página de Cadastro e Cálculo das Rotas.
 * Aqui o usuário insere:
 * - veículos das duas rotas
 * - passagens
 * - alunos integrais
 * - faixas de desconto
 * - diárias
 * - auxílio total
 */
function renderCalculo(container) {
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2 class="section-title">Cadastro e Cálculo das Rotas</h2>
    <div class="divider"></div>

    <label>Mês de referência</label>
    <input id="mesRef" placeholder="Ex: Janeiro/2026" />

    <label>Auxílio total do mês (R$)</label>
    <input id="auxTotal" type="number" step="0.01" min="0" />

    <h3 class="section-title">🚍 Rota Sete Lagoas</h3>
    <div id="sete-veiculos"></div>
    <button id="addVeicSete" class="primary">Adicionar veículo - Sete Lagoas</button>

    <label>Total de passagens arrecadadas - Sete Lagoas (R$)</label>
    <input id="passSete" type="number" step="0.01" min="0" />

    <label>Alunos integrais - Sete Lagoas</label>
    <input id="intSete" type="number" min="0" />

    <h4 class="section-title">Faixas de desconto - Sete Lagoas</h4>
    <div id="sete-descontos"></div>
    <button id="addDescSete" class="primary">Adicionar faixa de desconto - Sete Lagoas</button>

    <label>Total de diárias da rota Sete Lagoas</label>
    <input id="diariasSete" type="number" min="0" />

    <h3 class="section-title">🚍 Rota Curvelo</h3>
    <div id="cur-veiculos"></div>
    <button id="addVeicCur" class="primary">Adicionar veículo - Curvelo</button>

    <label>Total de passagens arrecadadas - Curvelo (R$)</label>
    <input id="passCur" type="number" step="0.01" min="0" />

    <label>Alunos integrais - Curvelo</label>
    <input id="intCur" type="number" min="0" />

    <h4 class="section-title">Faixas de desconto - Curvelo</h4>
    <div id="cur-descontos"></div>
    <button id="addDescCur" class="primary">Adicionar faixa de desconto - Curvelo</button>

    <label>Total de diárias da rota Curvelo</label>
    <input id="diariasCur" type="number" min="0" />

    <br/><br/>
    <button id="btnCalcular" class="primary">Calcular rotas</button>

    <div id="resultado"></div>
  `;

  container.appendChild(card);

  // ============================
  // SISTEMA DE ADICIONAR VEÍCULOS
  // ============================

  const veicSeteDiv = card.querySelector('#sete-veiculos');
  const veicCurDiv = card.querySelector('#cur-veiculos');

  function addVeiculo(div, rota) {
    const idx = div.children.length + 1;
    const wrapper = document.createElement('div');
    wrapper.className = 'card';

    wrapper.innerHTML = `
      <h4>Veículo ${idx} - ${rota}</h4>
      <label>Nome/Tipo do veículo</label>
      <input data-field="nome" placeholder="Ex: Van, Micro-ônibus" />

      <label>Valor da diária (R$)</label>
      <input data-field="valor" type="number" step="0.01" min="0" />

      <label>Dias rodados</label>
      <input data-field="dias" type="number" min="0" />
    `;

    div.appendChild(wrapper);
  }

  // Começa com 1 veículo em cada rota
  addVeiculo(veicSeteDiv, 'Sete Lagoas');
  addVeiculo(veicCurDiv, 'Curvelo');

  card.querySelector('#addVeicSete').onclick = () => addVeiculo(veicSeteDiv, 'Sete Lagoas');
  card.querySelector('#addVeicCur').onclick = () => addVeiculo(veicCurDiv, 'Curvelo');

  // ============================
  // SISTEMA DE ADICIONAR DESCONTOS
  // ============================

  const descSeteDiv = card.querySelector('#sete-descontos');
  const descCurDiv = card.querySelector('#cur-descontos');

  function addDesconto(div, rota) {
    const idx = div.children.length + 1;
    const wrapper = document.createElement('div');
    wrapper.className = 'card';

    wrapper.innerHTML = `
      <h4>Faixa de desconto ${idx} - ${rota}</h4>

      <label>Percentual de desconto (%)</label>
      <input data-field="percentual" type="number" min="0" max="100" step="5" />

      <label>Quantidade de alunos nessa faixa</label>
      <input data-field="quantidade" type="number" min="0" />
    `;

    div.appendChild(wrapper);
  }

  card.querySelector('#addDescSete').onclick = () => addDesconto(descSeteDiv, 'Sete Lagoas');
  card.querySelector('#addDescCur').onclick = () => addDesconto(descCurDiv, 'Curvelo');

  // ============================
  // LEITURA DOS INPUTS
  // ============================

  function lerVeiculos(div) {
    const arr = [];
    div.querySelectorAll('.card').forEach(c => {
      const nome = c.querySelector('input[data-field="nome"]').value || '';
      const valor = parseFloat(c.querySelector('input[data-field="valor"]').value || '0');
      const dias = parseInt(c.querySelector('input[data-field="dias"]').value || '0', 10);
      arr.push({ nome, valor, dias });
    });
    return arr;
  }

  function lerDescontos(div) {
    const arr = [];
    div.querySelectorAll('.card').forEach(c => {
      const percentual = parseFloat(c.querySelector('input[data-field="percentual"]').value || '0');
      const quantidade = parseInt(c.querySelector('input[data-field="quantidade"]').value || '0', 10);
      if (percentual > 0 && quantidade > 0) {
        arr.push({ percentual, quantidade });
      }
    });
    return arr;
  }

  // ============================
  // BOTÃO CALCULAR
  // ============================

  card.querySelector('#btnCalcular').onclick = () => {
    const mesRef = card.querySelector('#mesRef').value || '';
    const auxTotal = parseFloat(card.querySelector('#auxTotal').value || '0');

    const veiculosSete = lerVeiculos(veicSeteDiv);
    const veiculosCur = lerVeiculos(veicCurDiv);

    const passSete = parseFloat(card.querySelector('#passSete').value || '0');
    const passCur = parseFloat(card.querySelector('#passCur').value || '0');

    const intSete = parseInt(card.querySelector('#intSete').value || '0', 10);
    const intCur = parseInt(card.querySelector('#intCur').value || '0', 10);

    const descSete = lerDescontos(descSeteDiv);
    const descCur = lerDescontos(descCurDiv);

    const diariasSete = parseInt(card.querySelector('#diariasSete').value || '0', 10);
    const diariasCur = parseInt(card.querySelector('#diariasCur').value || '0', 10);

    // Distribuição do auxílio
    const { auxSete, auxCur } = distribuirAuxilioPorDiarias(auxTotal, diariasSete, diariasCur);

    // Cálculo das rotas
    const resSete = calcularRota({
      veiculos: veiculosSete,
      passagens: passSete,
      alunosIntegrais: intSete,
      descontos: descSete,
      auxRecebido: auxSete,
      diarias: diariasSete
    });

    const resCur = calcularRota({
      veiculos: veiculosCur,
      passagens: passCur,
      alunosIntegrais: intCur,
      descontos: descCur,
      auxRecebido: auxCur,
      diarias: diariasCur
    });

    // Salva no estado
    state.resultado = { mesRef, sete: resSete, cur: resCur };

    // Salva no histórico
    adicionarAoHistorico(mesRef, 'Sete Lagoas', resSete);
    adicionarAoHistorico(mesRef, 'Curvelo', resCur);

    // Exibe resultados
    const resDiv = card.querySelector('#resultado');
    resDiv.innerHTML = `
      <div class="card">
        <h3 class="section-title">Resumo - Sete Lagoas</h3>
        <pre>${JSON.stringify(resSete, null, 2)}</pre>
      </div>

      <div class="card">
        <h3 class="section-title">Resumo - Curvelo</h3>
        <pre>${JSON.stringify(resCur, null, 2)}</pre>
      </div>
    `;
  };
}
// =====================================================
// PARTE 3 — PÁGINA DE RELATÓRIOS COMPLETA
// =====================================================

/**
 * Renderiza a página de Relatórios.
 * Inclui:
 * - tabela do histórico
 * - download CSV
 * - gráficos de evolução
 * - comparativo financeiro da última simulação
 */
function renderRelatorios(container) {
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2 class="section-title">Relatórios e Gráficos</h2>
    <div class="divider"></div>
  `;

  container.appendChild(card);

  // ============================
  // HISTÓRICO
  // ============================

  if (state.historico.length === 0) {
    const warn = document.createElement('div');
    warn.className = 'card';
    warn.innerHTML = `<p>Nenhum histórico encontrado. Realize um cálculo na aba "Cadastro e Cálculo".</p>`;
    container.appendChild(warn);
    return;
  }

  const histCard = document.createElement('div');
  histCard.className = 'card';

  histCard.innerHTML = `
    <h3 class="section-title">Histórico mensal registrado</h3>
    <div class="divider"></div>
    <table id="histTable" style="width:100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Mês</th>
          <th>Rota</th>
          <th>Bruto</th>
          <th>Passagens</th>
          <th>Auxílio</th>
          <th>Valor Final</th>
          <th>Mensalidade Média</th>
          <th>Data Registro</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>

    <br/>
    <button id="btnDownloadCSV" class="primary">📥 Baixar histórico completo (CSV)</button>
  `;

  container.appendChild(histCard);

  // Preenche tabela
  const tbody = histCard.querySelector('tbody');
  state.historico.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.mes_ref}</td>
      <td>${item.rota}</td>
      <td>${formatBRL(item.bruto)}</td>
      <td>${formatBRL(item.passagens)}</td>
      <td>${formatBRL(item.aux_recebido)}</td>
      <td>${formatBRL(item.valor_final)}</td>
      <td>${formatBRL(item.mensalidade_media)}</td>
      <td>${item.data_registro}</td>
    `;
    tbody.appendChild(tr);
  });

  // ============================
  // DOWNLOAD CSV
  // ============================

  histCard.querySelector('#btnDownloadCSV').onclick = () => {
    const csv = gerarCSV(state.historico);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'historico_rotas.csv';
    a.click();

    URL.revokeObjectURL(url);
  };

  // ============================
  // GRÁFICO DE EVOLUÇÃO
  // ============================

  const grafCard = document.createElement('div');
  grafCard.className = 'card';

  grafCard.innerHTML = `
    <h3 class="section-title">Evolução da Mensalidade Média por Rota</h3>
    <div class="divider"></div>
    <canvas id="grafMensal" height="120"></canvas>
  `;

  container.appendChild(grafCard);

  gerarGraficoMensal('grafMensal');

  // ============================
  // COMPARATIVO FINANCEIRO
  // ============================

  const compCard = document.createElement('div');
  compCard.className = 'card';

  compCard.innerHTML = `
    <h3 class="section-title">Comparativo Financeiro da Última Simulação</h3>
    <div class="divider"></div>
    <canvas id="grafComp" height="120"></canvas>
  `;

  container.appendChild(compCard);

  if (state.resultado) {
    gerarGraficoComparativo('grafComp', state.resultado);
  } else {
    compCard.innerHTML += `<p>Nenhuma simulação ativa encontrada.</p>`;
  }
}

// =====================================================
// FUNÇÃO PARA GERAR CSV
// =====================================================

function gerarCSV(data) {
  const header = [
    'mes_ref',
    'rota',
    'bruto',
    'passagens',
    'dez_porcento',
    'bruto_aj_10',
    'aux_recebido',
    'pos_aux',
    'noventa_porcento',
    'valor_final',
    'alunos_integrais',
    'alunos_desconto_total',
    'mensalidade_media',
    'veiculos',
    'diarias',
    'data_registro'
  ];

  const rows = data.map(item =>
    header.map(h => item[h]).join(',')
  );

  return header.join(',') + '\n' + rows.join('\n');
}

// =====================================================
// GRÁFICO DE EVOLUÇÃO (Chart.js)
// =====================================================

function gerarGraficoMensal(canvasId) {
  const ctx = document.getElementById(canvasId);

  // Agrupa por mês e rota
  const agrupado = {};

  state.historico.forEach(item => {
    if (!agrupado[item.mes_ref]) agrupado[item.mes_ref] = {};
    agrupado[item.mes_ref][item.rota] = item.mensalidade_media;
  });

  const meses = Object.keys(agrupado);

  const sete = meses.map(m => agrupado[m]['Sete Lagoas'] || 0);
  const cur = meses.map(m => agrupado[m]['Curvelo'] || 0);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: meses,
      datasets: [
        {
          label: 'Sete Lagoas',
          data: sete,
          borderColor: '#00e676',
          backgroundColor: 'rgba(0,230,118,0.2)',
          tension: 0.3
        },
        {
          label: 'Curvelo',
          data: cur,
          borderColor: '#2979ff',
          backgroundColor: 'rgba(41,121,255,0.2)',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#fff' } }
      },
      scales: {
        x: { ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' } }
      }
    }
  });
}

// =====================================================
// GRÁFICO COMPARATIVO (Chart.js)
// =====================================================

function gerarGraficoComparativo(canvasId, resultado) {
  const ctx = document.getElementById(canvasId);

  const s = resultado.sete;
  const c = resultado.cur;

  const labels = [
    'Bruto',
    'Bruto Ajustado (10%)',
    'Auxílio Recebido',
    'Valor Final'
  ];

  const sete = [
    s.bruto,
    s.brutoAj10,
    s.auxRecebido,
    s.valorFinal
  ];

  const cur = [
    c.bruto,
    c.brutoAj10,
    c.auxRecebido,
    c.valorFinal
  ];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Sete Lagoas',
          data: sete,
          backgroundColor: 'rgba(0,230,118,0.6)'
        },
        {
          label: 'Curvelo',
          data: cur,
          backgroundColor: 'rgba(41,121,255,0.6)'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#fff' } }
      },
      scales: {
        x: { ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' } }
      }
    }
  });
}
// =====================================================
// PARTE 4 — PÁGINA DE PDF + GERAÇÃO DO PDF DETALHADO
// =====================================================

/**
 * Renderiza a página de geração de PDF.
 * Aqui o usuário pode gerar um PDF profissional contendo:
 * - resumo das rotas
 * - cálculos detalhados
 * - explicações matemáticas
 * - fechamento total
 */
function renderPdfPage(container) {
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2 class="section-title">Gerar PDF Detalhado</h2>
    <div class="divider"></div>
    <p>
      Aqui você pode gerar um PDF completo contendo:
      <ul>
        <li>Resumo das rotas</li>
        <li>Cálculos detalhados</li>
        <li>Explicação matemática</li>
        <li>Fechamento total</li>
        <li>Valores por aluno</li>
      </ul>
    </p>
    <button id="btnGerarPDF" class="primary">Gerar PDF</button>
  `;

  container.appendChild(card);

  const btn = card.querySelector('#btnGerarPDF');
  btn.onclick = () => {
    if (!state.resultado) {
      alert('Nenhum cálculo encontrado. Vá até "Cadastro e Cálculo" e gere um cálculo primeiro.');
      return;
    }
    gerarPdfDetalhado(state.resultado);
  };
}

// =====================================================
// FUNÇÃO PRINCIPAL DE GERAÇÃO DO PDF
// =====================================================

function gerarPdfDetalhado(resultado) {
  const { mesRef, sete, cur } = resultado;

  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4'
  });

  let y = 40;

  // ============================
  // TÍTULO
  // ============================

  doc.setFontSize(18);
  doc.text('ASSEUF - Relatório Detalhado de Cálculo das Rotas', 40, y);
  y += 30;

  doc.setFontSize(12);
  doc.text(`Mês de referência: ${mesRef || 'Não informado'}`, 40, y);
  y += 20;

  // ============================
  // RESUMO GERAL
  // ============================

  doc.setFontSize(14);
  doc.text('1. Resumo Geral das Rotas', 40, y);
  y += 20;

  doc.setFontSize(11);
  doc.text(`Sete Lagoas - Valor final a ratear: ${formatBRL(sete.valorFinal)}`, 40, y);
  y += 16;

  doc.text(`Curvelo - Valor final a ratear: ${formatBRL(cur.valorFinal)}`, 40, y);
  y += 30;

  // ============================
  // DETALHAMENTO MATEMÁTICO
  // ============================

  y = addSectionTitle(doc, y, '2. Detalhamento Matemático - Sete Lagoas');

  y = addCalcBlock(doc, y, sete);

  y += 20;
  y = addSectionTitle(doc, y, '3. Detalhamento Matemático - Curvelo');

  y = addCalcBlock(doc, y, cur);

  // ============================
  // RATEIO ENTRE ALUNOS
  // ============================

  y += 20;
  y = addSectionTitle(doc, y, '4. Rateio entre Alunos');

  y = addRateioBlock(doc, y, 'Sete Lagoas', sete);
  y += 20;
  y = addRateioBlock(doc, y, 'Curvelo', cur);

  // ============================
  // FECHAMENTO TOTAL (EXEMPLO)
  // ============================

  y += 30;
  y = addSectionTitle(doc, y, '5. Fechamento Total (Exemplo)');

  const fechamento = [
    'Doblô - 2 – 1.064',
    'Van 4 – 2.000',
    'Ônibus - 13 – 8.983',
    '',
    'Valor total do transporte: R$ 12.047,00',
    'Auxílio recebido: R$ 4.000,00',
    'Passagens avulsas arrecadadas: R$ 820,00',
    '',
    'Total a ser abatido: R$ 7.227,00',
    '',
    '22 alunos integrais: Valor individual: R$ 272,72',
    '9 alunos 50%: Valor individual: R$ 136,36',
    '',
    'Total por aluno integral: R$ 272,72',
    'Total por aluno 50%: R$ 136,36'
  ];

  doc.setFontSize(11);
  fechamento.forEach(linha => {
    doc.text(linha, 40, y);
    y += 16;
  });

  // ============================
  // SALVAR PDF
  // ============================

  doc.save(`relatorio_rotas_${mesRef || 'mes'}.pdf`);
}

// =====================================================
// FUNÇÕES AUXILIARES PARA O PDF
// =====================================================

function addSectionTitle(doc, y, title) {
  if (y > 760) {
    doc.addPage();
    y = 40;
  }
  doc.setFontSize(14);
  doc.text(title, 40, y);
  return y + 20;
}

function addCalcBlock(doc, y, rota) {
  const linhas = [
    `Bruto (soma de diárias): ${formatBRL(rota.bruto)}`,
    `10% das passagens: ${formatBRL(rota.dezPorcento)}`,
    `Bruto ajustado (bruto - 10% passagens): ${formatBRL(rota.brutoAj10)}`,
    `Auxílio recebido: ${formatBRL(rota.auxRecebido)}`,
    `Após auxílio (bruto ajustado - auxílio): ${formatBRL(rota.posAux)}`,
    `90% das passagens: ${formatBRL(rota.noventaPorcento)}`,
    `Valor final (após 90% passagens): ${formatBRL(rota.valorFinal)}`
  ];

  doc.setFontSize(11);

  linhas.forEach(l => {
    if (y > 760) {
      doc.addPage();
      y = 40;
    }
    doc.text(l, 40, y);
    y += 16;
  });

  return y;
}

function addRateioBlock(doc, y, nomeRota, rota) {
  const linhas = [
    `${nomeRota}:`,
    `Alunos integrais: ${rota.alunosIntegrais}`,
    `Alunos com desconto (total): ${rota.alunosDescontoTotal}`,
    `Mensalidade média (valor base 100%): ${formatBRL(rota.mensalidadeMedia)}`
  ];

  doc.setFontSize(11);

  linhas.forEach(l => {
    if (y > 760) {
      doc.addPage();
      y = 40;
    }
    doc.text(l, 40, y);
    y += 16;
  });

  return y;
}
// =====================================================
// PARTE 5 — VALIDAÇÕES, UX, UTILITÁRIOS E MELHORIAS
// =====================================================
//
// Esta parte adiciona:
// - validações de campos
// - mensagens de erro amigáveis
// - funções utilitárias extras
// - melhorias de experiência do usuário
// - logs internos
// - mecanismos de segurança
// - ajustes automáticos
//
// Tudo isso deixa o sistema mais robusto, seguro e profissional.
// =====================================================


// =====================================================
// SISTEMA DE VALIDAÇÃO DE CAMPOS
// =====================================================

/**
 * Exibe uma mensagem de erro visual abaixo de um campo.
 */
function mostrarErro(campo, mensagem) {
  removerErro(campo);

  const span = document.createElement('div');
  span.className = 'erro-campo';
  span.style.color = '#ff5252';
  span.style.fontSize = '0.85rem';
  span.style.marginTop = '4px';
  span.textContent = mensagem;

  campo.insertAdjacentElement('afterend', span);
}

/**
 * Remove erro visual de um campo.
 */
function removerErro(campo) {
  const prox = campo.nextElementSibling;
  if (prox && prox.classList.contains('erro-campo')) {
    prox.remove();
  }
}

/**
 * Valida se um campo numérico é válido.
 */
function validarNumero(campo, nome) {
  const valor = campo.value.trim();

  if (valor === '') {
    mostrarErro(campo, `${nome} é obrigatório.`);
    return false;
  }

  const num = Number(valor);

  if (isNaN(num)) {
    mostrarErro(campo, `${nome} deve ser um número.`);
    return false;
  }

  if (num < 0) {
    mostrarErro(campo, `${nome} não pode ser negativo.`);
    return false;
  }

  removerErro(campo);
  return true;
}

/**
 * Valida campos de texto simples.
 */
function validarTexto(campo, nome) {
  const valor = campo.value.trim();

  if (valor.length === 0) {
    mostrarErro(campo, `${nome} é obrigatório.`);
    return false;
  }

  removerErro(campo);
  return true;
}

/**
 * Valida todos os campos de uma lista.
 */
function validarLista(campos) {
  let ok = true;
  campos.forEach(c => {
    if (!c.fn(c.campo, c.nome)) ok = false;
  });
  return ok;
}


// =====================================================
// MELHORIAS DE UX
// =====================================================

/**
 * Adiciona máscara monetária simples.
 */
function aplicarMascaraMoeda(input) {
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '');
    v = (Number(v) / 100).toFixed(2) + '';
    v = v.replace('.', ',');
    input.value = v;
  });
}

/**
 * Adiciona destaque ao focar em campos.
 */
function destacarCampos() {
  document.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('focus', () => {
      inp.style.outline = '2px solid #00e676';
    });
    inp.addEventListener('blur', () => {
      inp.style.outline = 'none';
    });
  });
}

/**
 * Animação suave ao trocar de página.
 */
function animarTransicao(container) {
  container.style.opacity = 0;
  setTimeout(() => {
    container.style.transition = 'opacity 0.4s';
    container.style.opacity = 1;
  }, 50);
}


// =====================================================
// LOGS INTERNOS (DEBUG)
// =====================================================

const DEBUG = true;

/**
 * Log seguro (só aparece se DEBUG = true).
 */
function logDebug(...args) {
  if (DEBUG) console.log('[DEBUG]', ...args);
}

/**
 * Log de erro interno.
 */
function logErro(...args) {
  console.error('[ERRO]', ...args);
}


// =====================================================
// AJUSTES AUTOMÁTICOS
// =====================================================

/**
 * Garante que valores numéricos vazios virem zero.
 */
function normalizarNumero(valor) {
  if (valor === '' || valor === null || valor === undefined) return 0;
  const n = Number(valor);
  return isNaN(n) ? 0 : n;
}

/**
 * Garante que campos de desconto fiquem dentro de 0–100.
 */
function limitarPercentual(input) {
  input.addEventListener('input', () => {
    let v = Number(input.value);
    if (v < 0) input.value = 0;
    if (v > 100) input.value = 100;
  });
}


// =====================================================
// FUNÇÕES AVANÇADAS PARA EXPANSÃO FUTURA
// =====================================================

/**
 * Calcula estatísticas gerais do histórico.
 */
function calcularEstatisticasHistorico() {
  if (state.historico.length === 0) return null;

  const totalRegistros = state.historico.length;

  const totalBruto = state.historico.reduce((acc, r) => acc + r.bruto, 0);
  const totalAux = state.historico.reduce((acc, r) => acc + r.aux_recebido, 0);
  const totalFinal = state.historico.reduce((acc, r) => acc + r.valor_final, 0);

  const mediaMensalidade = state.historico.reduce((acc, r) => acc + r.mensalidade_media, 0) / totalRegistros;

  return {
    totalRegistros,
    totalBruto,
    totalAux,
    totalFinal,
    mediaMensalidade
  };
}

/**
 * Gera um relatório textual simples (para debug).
 */
function gerarRelatorioTexto(resultado) {
  const { mesRef, sete, cur } = resultado;

  return `
Relatório ASSEUF - ${mesRef}

SETÉ LAGOAS:
Bruto: ${formatBRL(sete.bruto)}
Bruto Ajustado: ${formatBRL(sete.brutoAj10)}
Auxílio Recebido: ${formatBRL(sete.auxRecebido)}
Valor Final: ${formatBRL(sete.valorFinal)}
Mensalidade Média: ${formatBRL(sete.mensalidadeMedia)}

CURVELO:
Bruto: ${formatBRL(cur.bruto)}
Bruto Ajustado: ${formatBRL(cur.brutoAj10)}
Auxílio Recebido: ${formatBRL(cur.auxRecebido)}
Valor Final: ${formatBRL(cur.valorFinal)}
Mensalidade Média: ${formatBRL(cur.mensalidadeMedia)}
  `;
}

/**
 * Exporta o histórico como JSON (para backup).
 */
function exportarHistoricoJSON() {
  const blob = new Blob([JSON.stringify(state.historico, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'historico_rotas.json';
  a.click();
  URL.revokeObjectURL(url);
}


// =====================================================
// MELHORIAS DE SEGURANÇA
// =====================================================

/**
 * Evita que valores absurdos quebrem o sistema.
 */
function validarLimites(valor, min, max) {
  if (valor < min) return min;
  if (valor > max) return max;
  return valor;
}

/**
 * Sanitiza texto para evitar caracteres inválidos.
 */
function sanitizarTexto(txt) {
  return txt.replace(/[<>]/g, '').trim();
}


// =====================================================
// APLICA MELHORIAS AUTOMÁTICAS AO CARREGAR PÁGINA
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  destacarCampos();
});
// =====================================================
// PARTE 6 — RECURSOS AVANÇADOS, OTIMIZAÇÕES E FINALIZAÇÃO
// =====================================================
//
// Esta parte adiciona:
// - modo avançado
// - ferramentas de depuração
// - funções premium
// - otimizações finais
// - melhorias de performance
// - sistema de backup e restauração
// - limpeza de histórico
// - exportações extras
//
// Após esta parte, o app.js estará COMPLETO.
// =====================================================


// =====================================================
// MODO AVANÇADO
// =====================================================

let modoAvancado = false;

/**
 * Ativa ou desativa o modo avançado.
 * No modo avançado, o sistema exibe:
 * - estatísticas extras
 * - logs detalhados
 * - botões adicionais
 */
function toggleModoAvancado() {
  modoAvancado = !modoAvancado;
  alert(`Modo avançado ${modoAvancado ? 'ativado' : 'desativado'}.`);
  logDebug('Modo avançado:', modoAvancado);
}

/**
 * Renderiza botões extras quando o modo avançado está ativo.
 */
function renderExtrasAvancados(container) {
  if (!modoAvancado) return;

  const card = document.createElement('div');
  card.className = 'card';

  const stats = calcularEstatisticasHistorico();

  card.innerHTML = `
    <h3 class="section-title">Modo Avançado</h3>
    <div class="divider"></div>

    <p><strong>Total de registros:</strong> ${stats ? stats.totalRegistros : 0}</p>
    <p><strong>Total bruto acumulado:</strong> ${stats ? formatBRL(stats.totalBruto) : 'R$ 0,00'}</p>
    <p><strong>Total de auxílio acumulado:</strong> ${stats ? formatBRL(stats.totalAux) : 'R$ 0,00'}</p>
    <p><strong>Total final acumulado:</strong> ${stats ? formatBRL(stats.totalFinal) : 'R$ 0,00'}</p>
    <p><strong>Média geral de mensalidade:</strong> ${stats ? formatBRL(stats.mediaMensalidade) : 'R$ 0,00'}</p>

    <br/>
    <button id="btnExportJSON" class="primary">Exportar histórico (JSON)</button>
    <button id="btnLimparHist" class="primary" style="background:#ff5252;">Limpar histórico</button>
  `;

  container.appendChild(card);

  card.querySelector('#btnExportJSON').onclick = () => exportarHistoricoJSON();

  card.querySelector('#btnLimparHist').onclick = () => {
    if (confirm('Tem certeza que deseja apagar TODO o histórico?')) {
      state.historico = [];
      salvarHistoricoLocal();
      alert('Histórico apagado.');
      location.reload();
    }
  };
}


// =====================================================
// SISTEMA DE BACKUP E RESTAURAÇÃO
// =====================================================

/**
 * Permite ao usuário importar um arquivo JSON contendo o histórico.
 */
function importarHistoricoJSON(arquivo, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        state.historico = data;
        salvarHistoricoLocal();
        callback(true);
      } else {
        callback(false);
      }
    } catch (err) {
      callback(false);
    }
  };
  reader.readAsText(arquivo);
}

/**
 * Renderiza interface de backup/restauração.
 */
function renderBackup(container) {
  if (!modoAvancado) return;

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h3 class="section-title">Backup e Restauração</h3>
    <div class="divider"></div>

    <p>Importar histórico (arquivo JSON):</p>
    <input type="file" id="inputBackup" accept="application/json" />

    <br/><br/>
    <button id="btnImportar" class="primary">Importar</button>
  `;

  container.appendChild(card);

  card.querySelector('#btnImportar').onclick = () => {
    const file = card.querySelector('#inputBackup').files[0];
    if (!file) {
      alert('Selecione um arquivo JSON.');
      return;
    }

    importarHistoricoJSON(file, ok => {
      if (ok) {
        alert('Histórico importado com sucesso!');
        location.reload();
      } else {
        alert('Arquivo inválido.');
      }
    });
  };
}


// =====================================================
// OTIMIZAÇÕES DE PERFORMANCE
// =====================================================

/**
 * Debounce — evita execuções repetidas de funções.
 */
function debounce(fn, delay = 300) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Cache simples para cálculos repetidos.
 */
const cacheCalculos = {};

function calcularComCache(chave, fn) {
  if (cacheCalculos[chave]) {
    logDebug('Cache hit:', chave);
    return cacheCalculos[chave];
  }
  const resultado = fn();
  cacheCalculos[chave] = resultado;
  return resultado;
}


// =====================================================
// FUNÇÕES PREMIUM
// =====================================================

/**
 * Gera um relatório HTML completo (para exportar no futuro).
 */
function gerarRelatorioHTML(resultado) {
  const { mesRef, sete, cur } = resultado;

  return `
<h1>Relatório ASSEUF - ${mesRef}</h1>

<h2>Sete Lagoas</h2>
<p>Bruto: ${formatBRL(sete.bruto)}</p>
<p>Bruto Ajustado: ${formatBRL(sete.brutoAj10)}</p>
<p>Auxílio Recebido: ${formatBRL(sete.auxRecebido)}</p>
<p>Valor Final: ${formatBRL(sete.valorFinal)}</p>

<h2>Curvelo</h2>
<p>Bruto: ${formatBRL(cur.bruto)}</p>
<p>Bruto Ajustado: ${formatBRL(cur.brutoAj10)}</p>
<p>Auxílio Recebido: ${formatBRL(cur.auxRecebido)}</p>
<p>Valor Final: ${formatBRL(cur.valorFinal)}</p>
  `;
}

/**
 * Exporta relatório HTML como arquivo .html
 */
function exportarRelatorioHTML() {
  if (!state.resultado) {
    alert('Nenhum cálculo disponível.');
    return;
  }

  const html = gerarRelatorioHTML(state.resultado);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'relatorio_rotas.html';
  a.click();

  URL.revokeObjectURL(url);
}


// =====================================================
// BOTÕES SECRETOS (EASTER EGGS)
// =====================================================

/**
 * Apenas para diversão.
 */
function easterEgg() {
  alert('🚌 Você encontrou o Easter Egg da ASSEUF! Continue explorando...');
}


// =====================================================
// FINALIZAÇÃO DO SISTEMA
// =====================================================

/**
 * Renderiza elementos extras no final da página.
 */
function renderRodape(container) {
  const rodape = document.createElement('div');
  rodape.style.textAlign = 'center';
  rodape.style.marginTop = '40px';
  rodape.style.opacity = '0.7';
  rodape.innerHTML = `
    <p>Sistema ASSEUF — Desenvolvido com dedicação</p>
    <p style="font-size:0.8rem;">Versão 1.0 — Modo Avançado disponível</p>
  `;
  container.appendChild(rodape);
}


// =====================================================
// INTEGRAÇÃO FINAL COM TODAS AS PÁGINAS
// =====================================================

/**
 * Sobrescreve o render principal para incluir:
 * - animação
 * - modo avançado
 * - rodapé
 */
const renderOriginal = render;

render = function(app) {
  renderOriginal(app);

  // animação suave
  animarTransicao(app);

  // modo avançado
  renderExtrasAvancados(app);

  // backup
  renderBackup(app);

  // rodapé
  renderRodape(app);
};


// =====================================================
// FIM DO ARQUIVO app.js
// =====================================================