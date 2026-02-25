📘 README.md — Sistema de Cálculo das Rotas – ASSEUF

🚌 Sistema de Cálculo das Rotas – ASSEUF

Este projeto é um sistema completo desenvolvido para auxiliar no cálculo financeiro das rotas de transporte universitário da ASSEUF, permitindo registrar veículos, diárias, passagens, auxílio, alunos e descontos, gerando relatórios, gráficos e PDF detalhado.

O sistema foi construído totalmente em HTML + CSS + JavaScript, sem backend, funcionando 100% no navegador e podendo ser hospedado facilmente no GitHub Pages.

---

📌 Funcionalidades Principais

🔢 Cálculo Completo das Rotas
O sistema calcula automaticamente:

- Custo bruto (soma de diárias × valor)
- Desconto de 10% das passagens
- Bruto ajustado
- Distribuição do auxílio (regra 70/30)
- Abatimento do auxílio
- Desconto dos 90% das passagens
- Valor final da rota
- Mensalidade média por aluno
- Peso proporcional de alunos com desconto

Tudo isso para Sete Lagoas e Curvelo.

---

📊 Relatórios e Gráficos

A aba Relatórios exibe:

- Histórico completo de todos os cálculos
- Tabela detalhada
- Download do histórico em CSV
- Gráfico de evolução da mensalidade média (Chart.js)
- Comparativo financeiro entre as rotas

---

📄 Geração de PDF

A aba PDF permite gerar um documento contendo:

- Resumo das rotas
- Explicação matemática
- Detalhamento dos cálculos
- Fechamento total
- Rateio entre alunos

O PDF é gerado diretamente no navegador usando jsPDF.

---

💾 Histórico Automático

Todos os cálculos são salvos automaticamente no localStorage, permitindo:

- Consultar cálculos antigos
- Exportar histórico em JSON
- Importar histórico novamente (modo avançado)
- Limpar histórico

---

🧠 Modo Avançado

O sistema possui um modo avançado com:

- Estatísticas gerais
- Exportação JSON
- Importação de backup
- Limpeza total do histórico
- Ferramentas extras de análise

---

🎨 Interface Moderna

O layout utiliza:

- Tema escuro com gradiente
- Botões neon
- Cards com sombras
- Tipografia moderna
- Layout responsivo

Tudo definido no arquivo styles.css.

---

🧱 Estrutura do Projeto

`
📁 SANAT
│
├── index.html        → Estrutura principal do site
├── styles.css        → Estilos e layout
├── app.js            → Toda a lógica do sistema
└── logo.png          → Logo exibida no cabeçalho
`

---

🚀 Como Executar

✔ Método 1 — GitHub Pages (recomendado)
1. Vá em Settings → Pages
2. Configure:
   - Branch: main
   - Pasta: /root
3. Aguarde 1–10 minutos
4. O link do site será gerado automaticamente

✔ Método 2 — Localmente
Basta abrir o arquivo:

`
index.html
`

em qualquer navegador moderno.

---

🛠️ Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js (gráficos)
- jsPDF (PDF)
- localStorage (histórico)
- GitHub Pages (deploy)

---

📦 Funcionalidades Futuras (opcional)

- Tema claro/escuro
- Exportação em Excel
- Dashboard avançado
- Controle de usuários
- Modo administrador
- Animações adicionais

---

👨‍💻 Autor

Projeto desenvolvido por taylor .  
Objetivo: facilitar e automatizar o cálculo das rotas da ASSEUF.

---

📄 Licença

Este projeto é de uso livre para fins educacionais e administrativos da ASSEUF.
