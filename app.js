// ==============================================
// UI - COMPONENTES REUTILIZÁVEIS
// ==============================================
const UI = {
    card(conteudo, titulo = "", classe = "") {
        return `
            <div class="card ${classe}">
                ${titulo ? `<div class="card-header"><h3>${titulo}</h3></div>` : ""}
                <div class="card-body">${conteudo}</div>
            </div>
        `;
    },

    tabela(cabecalhos, linhas, id = "") {
        let html = `<table class="tabela" ${id ? `id="${id}"` : ""}><thead><tr>`;
        cabecalhos.forEach(h => html += `<th>${h}</th>`);
        html += "</tr></thead><tbody>";
        linhas.forEach(linha => {
            html += "<tr>";
            linha.forEach(celula => html += `<td>${celula}</td>`);
            html += "</tr>";
        });
        html += "</tbody></table>";
        return html;
    },

    botao(texto, onClick = "", tipo = "primario") {
        return `<button class="btn btn-${tipo}" onclick="${onClick}">${texto}</button>`;
    },

    botaoSecundario(texto, onClick = "") {
        return this.botao(texto, onClick, "secundario");
    },

    botaoPerigo(texto, onClick = "") {
        return this.botao(texto, onClick, "perigo");
    },

    resumoGrid(itens) {
        return `<div class="resumo-grid">${itens.join("")}</div>`;
    },

    resumoCard(titulo, valor, subtitulo = "") {
        return `
            <div class="resumo-card">
                <div class="resumo-label">${titulo}</div>
                <div class="resumo-valor">${valor}</div>
                ${subtitulo ? `<div class="resumo-sub">${subtitulo}</div>` : ""}
            </div>
        `;
    },

    blocoMemoria(conteudo) {
        return `<div class="memoria-bloco">${conteudo}</div>`;
    },

    formulario(campos, onSubmit) {
        let html = `<form onsubmit="${onSubmit}; return false;">`;
        campos.forEach(campo => {
            html += `
                <div class="form-group">
                    <label>${campo.label}</label>
                    <input type="${campo.tipo || 'text'}" 
                           id="${campo.id}" 
                           placeholder="${campo.placeholder || ''}" 
                           ${campo.required ? 'required' : ''}
                           ${campo.value ? `value="${campo.value}"` : ''}>
                </div>
            `;
        });
        html += `<button type="submit" class="btn btn-primario">Salvar</button>`;
        html += `</form>`;
        return html;
    },

    modal(titulo, conteudo, id) {
        return `
            <div class="modal" id="${id}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${titulo}</h3>
                        <span class="modal-close" onclick="UI.fecharModal('${id}')">&times;</span>
                    </div>
                    <div class="modal-body">${conteudo}</div>
                </div>
            </div>
        `;
    },

    fecharModal(id) {
        document.getElementById(id).style.display = "none";
    },

    abrirModal(id) {
        document.getElementById(id).style.display = "block";
    },

    notificacao(mensagem, tipo = "info") {
        const id = "toast-" + Date.now();
        const toast = `
            <div class="toast toast-${tipo}" id="${id}">
                <div class="toast-content">
                    <div class="toast-title">${tipo.toUpperCase()}</div>
                    <div class="toast-message">${mensagem}</div>
                </div>
                <button class="toast-close" onclick="UI.fecharNotificacao('${id}')">&times;</button>
            </div>
        `;
        
        let area = document.getElementById("toastArea");
        if (!area) {
            area = document.createElement("div");
            area.id = "toastArea";
            area.className = "toast-container";
            document.body.appendChild(area);
        }
        
        area.insertAdjacentHTML("beforeend", toast);
        setTimeout(() => this.fecharNotificacao(id), 3000);
    },

    fecharNotificacao(id) {
        const toast = document.getElementById(id);
        if (toast) {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(20px)";
            setTimeout(() => toast.remove(), 300);
        }
    },

    veiculoItem(veiculo, index) {
        return `
            <div class="veiculo-item" data-index="${index}">
                <div class="veiculo-header">
                    <span class="veiculo-tipo">${veiculo.nome}</span>
                    <button type="button" class="btn btn-sm btn-perigo" onclick="removerVeiculo(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="veiculo-custos">
                    <div class="veiculo-campo">
                        <label>Valor da Diária (R$)</label>
                        <input type="number" class="form-control veiculo-diaria" value="${veiculo.valorDiaria}" step="0.01" min="0" required>
                    </div>
                    <div class="veiculo-campo">
                        <label>Quantidade de Diárias</label>
                        <input type="number" class="form-control veiculo-qtd" value="${veiculo.qtdDiarias}" min="1" required>
                    </div>
                    <div class="veiculo-campo">
                        <label>Dias Rodados</label>
                        <input type="number" class="form-control veiculo-dias" value="${veiculo.diasRodados || 1}" min="1" required>
                    </div>
                    <div class="veiculo-campo">
                        <label>Custo Total</label>
                        <div class="valor">R$ ${(veiculo.valorDiaria * veiculo.qtdDiarias * (veiculo.diasRodados || 1)).toFixed(2)}</div>
                    </div>
                </div>
            </div>
        `;
    },

    alunoItem(aluno, index) {
        return `
            <div class="veiculo-item" data-aluno-index="${index}">
                <div class="veiculo-header">
                    <span class="veiculo-tipo">${aluno.nome}</span>
                    <button type="button" class="btn btn-sm btn-perigo" onclick="removerAluno(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="veiculo-custos">
                    <div class="veiculo-campo">
                        <label>Nome do Aluno</label>
                        <input type="text" class="form-control aluno-nome" value="${aluno.nome}" required>
                    </div>
                    <div class="veiculo-campo">
                        <label>Tipo</label>
                        <select class="form-control aluno-tipo">
                            <option value="integral" ${aluno.integral ? 'selected' : ''}>Integral</option>
                            <option value="desconto" ${!aluno.integral ? 'selected' : ''}>Com Desconto</option>
                        </select>
                    </div>
                    <div class="veiculo-campo">
                        <label>Desconto (%)</label>
                        <input type="number" class="form-control aluno-desconto" value="${aluno.desconto || 0}" step="0.1" min="0" max="100">
                    </div>
                </div>
            </div>
        `;
    }
};

// ==============================================
// ESTADO GLOBAL
// ==============================================
const Estado = {
    usuarioAtual: null,
    usuarios: [
        { id: 1, nome: "Admin", usuario: "admin", senha: "0000", perfil: "admin" },
        { id: 2, nome: "Taylor", usuario: "taylor", senha: "1296", perfil: "taylor" },
        { id: 3, nome: "Operador", usuario: "operador", senha: "4321", perfil: "operador" },
        { id: 4, nome: "Visitante", usuario: "visitante", senha: "1234", perfil: "visitante" }
    ],
    rotas: [
        {
            id: 1,
            nome: "Curvelo",
            diasRodados: [1, 2, 3, 4, 5],
            passagens: 20,
            veiculos: [
                { id: 1, nome: "Van", valorDiaria: 425, qtdDiarias: 3, diasRodados: 5 },
                { id: 2, nome: "Micro-ônibus", valorDiaria: 532, qtdDiarias: 9, diasRodados: 5 }
            ],
            alunos: [
                { id: 1, nome: "João", integral: true },
                { id: 2, nome: "Maria", integral: false, desconto: 50 }
            ]
        },
        {
            id: 2,
            nome: "Sete Lagoas",
            diasRodados: [1, 2, 3, 4, 5, 6],
            passagens: 10,
            veiculos: [
                { id: 3, nome: "Micro-ônibus", valorDiaria: 532, qtdDiarias: 9, diasRodados: 6 },
                { id: 4, nome: "Ônibus", valorDiaria: 691, qtdDiarias: 7, diasRodados: 6 }
            ],
            alunos: [
                { id: 3, nome: "Pedro", integral: true },
                { id: 4, nome: "Ana", integral: true },
                { id: 5, nome: "Lucas", integral: true },
                { id: 6, nome: "Carla", integral: true },
                { id: 7, nome: "José", integral: false, desconto: 50 }
            ]
        }
    ],
    historicoCalculos: [],
    calculoAtual: null,
    tema: "claro"
};

// ==============================================
// FUNÇÕES DE AUTENTICAÇÃO
// ==============================================
const Auth = {
    fazerLogin(usuario, senha) {
        const user = Estado.usuarios.find(u => u.usuario === usuario && u.senha === senha);
        if (user) {
            Estado.usuarioAtual = user;
            UI.notificacao(`Bem-vindo, ${user.nome}!`, "success");
            Navegacao.mudar("home");
            return true;
        }
        UI.notificacao("Usuário ou senha inválidos", "error");
        return false;
    },

    logout() {
        Estado.usuarioAtual = null;
        UI.notificacao("Logout realizado com sucesso", "info");
        Navegacao.mudar("login");
    },

    temPermissao(perfilNecessario) {
        if (!Estado.usuarioAtual) return false;
        if (perfilNecessario === "admin" && Estado.usuarioAtual.perfil !== "admin") return false;
        if (perfilNecessario === "taylor" && !["admin", "taylor"].includes(Estado.usuarioAtual.perfil)) return false;
        return true;
    }
};

// ==============================================
// FUNÇÕES DE CÁLCULO
// ==============================================
const Calculos = {
    calcularBrutoRota(rota) {
        return rota.veiculos.reduce((total, v) => {
            return total + (v.valorDiaria * v.qtdDiarias * (v.diasRodados || 1));
        }, 0);
    },

    calcularBrutoTotal() {
        return Estado.rotas.reduce((total, r) => total + this.calcularBrutoRota(r), 0);
    },

    calcularDiasMaximo() {
        return Math.max(...Estado.rotas.map(r => Math.max(...r.diasRodados)));
    },

    calcularDistribuicao30_70(auxilioTotal) {
        const diasMaximo = this.calcularDiasMaximo();
        const valorPorDia = auxilioTotal / diasMaximo;
        const auxilioPorRota = new Array(Estado.rotas.length).fill(0);

        for (let dia = 1; dia <= diasMaximo; dia++) {
            const rotasNoDia = Estado.rotas.filter(r => r.diasRodados.includes(dia));
            
            if (rotasNoDia.length === Estado.rotas.length) {
                // Todas as rotas rodaram - divisão proporcional ao bruto
                const brutos = rotasNoDia.map(r => this.calcularBrutoRota(r));
                const totalBruto = brutos.reduce((a, b) => a + b, 0);
                rotasNoDia.forEach((r, idx) => {
                    const index = Estado.rotas.findIndex(rota => rota.id === r.id);
                    const proporcao = totalBruto ? brutos[idx] / totalBruto : 1 / Estado.rotas.length;
                    auxilioPorRota[index] += valorPorDia * proporcao;
                });
            } 
            else if (rotasNoDia.length === 1) {
                // Apenas uma rota rodou - 70/30
                const r = rotasNoDia[0];
                const index = Estado.rotas.findIndex(rota => rota.id === r.id);
                auxilioPorRota[index] += valorPorDia * 0.7;
                
                Estado.rotas.forEach((rota, idx) => {
                    if (!rota.diasRodados.includes(dia)) {
                        auxilioPorRota[idx] += valorPorDia * 0.3;
                    }
                });
            }
            else if (rotasNoDia.length > 1) {
                // Mais de uma, mas não todas - divisão proporcional entre as que rodaram
                const brutos = rotasNoDia.map(r => this.calcularBrutoRota(r));
                const totalBruto = brutos.reduce((a, b) => a + b, 0);
                rotasNoDia.forEach((r, idx) => {
                    const index = Estado.rotas.findIndex(rota => rota.id === r.id);
                    const proporcao = totalBruto ? brutos[idx] / totalBruto : 1 / rotasNoDia.length;
                    auxilioPorRota[index] += valorPorDia * proporcao;
                });
            }
        }

        return auxilioPorRota;
    },

    calcularRateioAlunos(rota, valorDisponivel) {
        if (!rota.alunos || !rota.alunos.length) return [];
        
        const integrais = rota.alunos.filter(a => a.integral).length;
        let somaPesos = integrais;
        
        rota.alunos.forEach(a => {
            if (!a.integral) {
                somaPesos += (1 - (a.desconto || 0) / 100);
            }
        });
        
        const valorBase = valorDisponivel / somaPesos;
        
        return rota.alunos.map(a => {
            if (a.integral) {
                return { ...a, valorPagar: valorBase };
            } else {
                return { ...a, valorPagar: valorBase * (1 - (a.desconto || 0) / 100) };
            }
        });
    },

    calcularAuxilio(auxilioDinheiro, auxilioCombustivel) {
        const auxilioTotal = auxilioDinheiro + auxilioCombustivel;
        
        if (!Estado.rotas.length) {
            UI.notificacao("Nenhuma rota cadastrada", "error");
            return null;
        }

        const resultados = [];
        const brutos = Estado.rotas.map(r => this.calcularBrutoRota(r));
        const auxilios = this.calcularDistribuicao30_70(auxilioTotal);
        const totalBruto = brutos.reduce((a, b) => a + b, 0);

        for (let i = 0; i < Estado.rotas.length; i++) {
            const rota = Estado.rotas[i];
            const bruto = brutos[i];
            const auxilio = auxilios[i];
            const aposAuxilio = bruto - auxilio;
            const aposPassagens = aposAuxilio - rota.passagens;
            
            const alunosComValores = this.calcularRateioAlunos(rota, aposPassagens);
            
            resultados.push({
                rotaId: rota.id,
                rotaNome: rota.nome,
                bruto,
                percBruto: totalBruto ? ((bruto / totalBruto) * 100).toFixed(2) : "0",
                auxilio,
                percAuxilio: auxilioTotal ? ((auxilio / auxilioTotal) * 100).toFixed(2) : "0",
                aposAuxilio,
                passagens: rota.passagens,
                aposPassagens,
                alunos: alunosComValores,
                totalAlunos: rota.alunos.length
            });
        }

        const totais = {
            bruto: brutos.reduce((a, b) => a + b, 0),
            auxilio: auxilios.reduce((a, b) => a + b, 0),
            passagens: Estado.rotas.reduce((a, r) => a + r.passagens, 0),
            alunos: Estado.rotas.reduce((a, r) => a + r.alunos.length, 0)
        };

        Estado.calculoAtual = {
            data: new Date().toISOString(),
            auxilioDinheiro,
            auxilioCombustivel,
            auxilioTotal,
            resultados,
            totais,
            usuario: Estado.usuarioAtual?.nome || "Sistema"
        };

        return Estado.calculoAtual;
    }
};

// ==============================================
// FUNÇÕES DE BACKUP
// ==============================================
const Backup = {
    salvar() {
        const backup = {
            usuarios: Estado.usuarios,
            rotas: Estado.rotas,
            historicoCalculos: Estado.historicoCalculos,
            data: new Date().toISOString(),
            versao: "2.0"
        };
        localStorage.setItem("assef_backup", JSON.stringify(backup));
        UI.notificacao("Backup salvo com sucesso!", "success");
    },

    carregar() {
        const backup = localStorage.getItem("assef_backup");
        if (backup) {
            try {
                const dados = JSON.parse(backup);
                if (dados.usuarios) Estado.usuarios = dados.usuarios;
                if (dados.rotas) Estado.rotas = dados.rotas;
                if (dados.historicoCalculos) Estado.historicoCalculos = dados.historicoCalculos;
                UI.notificacao("Backup carregado com sucesso!", "success");
                Navegacao.render();
            } catch (error) {
                UI.notificacao("Erro ao carregar backup", "error");
            }
        }
    },

    exportar() {
        const backup = {
            usuarios: Estado.usuarios,
            rotas: Estado.rotas,
            historicoCalculos: Estado.historicoCalculos,
            data: new Date().toISOString(),
            versao: "2.0"
        };
        
        const dataStr = JSON.stringify(backup, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `assef_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        UI.notificacao("Backup exportado com sucesso!", "success");
    },

    importar(arquivo) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                if (backup.usuarios) Estado.usuarios = backup.usuarios;
                if (backup.rotas) Estado.rotas = backup.rotas;
                if (backup.historicoCalculos) Estado.historicoCalculos = backup.historicoCalculos;
                localStorage.setItem("assef_backup", JSON.stringify(backup));
                UI.notificacao("Backup importado com sucesso!", "success");
                Navegacao.render();
            } catch (error) {
                UI.notificacao("Arquivo de backup inválido", "error");
            }
        };
        reader.readAsText(arquivo);
    }
};

// ==============================================
// FUNÇÕES DE EXPORTAÇÃO
// ==============================================
const Exportacao = {
    paraPDF() {
        if (!Estado.calculoAtual) {
            UI.notificacao("Nenhum cálculo para exportar", "warning");
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(20);
            doc.setTextColor(67, 97, 238);
            doc.text("ASSEUF - Relatório de Cálculo", 14, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Data: ${new Date(Estado.calculoAtual.data).toLocaleString()}`, 14, 30);
            doc.text(`Usuário: ${Estado.calculoAtual.usuario}`, 14, 35);
            
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text("AUXÍLIOS", 14, 45);
            
            doc.autoTable({
                startY: 48,
                head: [["Tipo", "Valor (R$)"]],
                body: [
                    ["Dinheiro", Estado.calculoAtual.auxilioDinheiro.toFixed(2)],
                    ["Combustível", Estado.calculoAtual.auxilioCombustivel.toFixed(2)],
                    ["Total", Estado.calculoAtual.auxilioTotal.toFixed(2)]
                ],
                theme: "grid",
                headStyles: { fillColor: [67, 97, 238] }
            });

            doc.text("RESUMO POR ROTA", 14, doc.lastAutoTable.finalY + 10);
            
            const dadosRotas = Estado.calculoAtual.resultados.map(r => [
                r.rotaNome,
                r.bruto.toFixed(2),
                r.percBruto + "%",
                r.auxilio.toFixed(2),
                r.percAuxilio + "%",
                r.aposPassagens.toFixed(2)
            ]);

            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 13,
                head: [["Rota", "Bruto", "%", "Auxílio", "%", "Líquido"]],
                body: dadosRotas,
                theme: "striped",
                headStyles: { fillColor: [67, 97, 238] }
            });

            doc.save(`assef_relatorio_${new Date().toISOString().slice(0, 10)}.pdf`);
            UI.notificacao("PDF exportado com sucesso!", "success");
        } catch (error) {
            console.error(error);
            UI.notificacao("Erro ao exportar PDF", "error");
        }
    },

    paraExcel() {
        if (!Estado.calculoAtual) {
            UI.notificacao("Nenhum cálculo para exportar", "warning");
            return;
        }

        try {
            const wb = XLSX.utils.book_new();
            
            // Planilha de Resumo
            const dadosResumo = [
                ["RELATÓRIO DE CÁLCULO DE AUXÍLIO - ASSEUF"],
                [`Data: ${new Date(Estado.calculoAtual.data).toLocaleString()}`],
                [`Usuário: ${Estado.calculoAtual.usuario}`],
                [],
                ["AUXÍLIOS"],
                ["Tipo", "Valor (R$)"],
                ["Dinheiro", Estado.calculoAtual.auxilioDinheiro],
                ["Combustível", Estado.calculoAtual.auxilioCombustivel],
                ["Total", Estado.calculoAtual.auxilioTotal],
                [],
                ["RESUMO POR ROTA"],
                ["Rota", "Bruto (R$)", "% Bruto", "Auxílio (R$)", "% Auxílio", "Após Auxílio", "Passagens", "Após Passagens", "Total Alunos"]
            ];

            Estado.calculoAtual.resultados.forEach(r => {
                dadosResumo.push([
                    r.rotaNome,
                    r.bruto.toFixed(2),
                    r.percBruto + "%",
                    r.auxilio.toFixed(2),
                    r.percAuxilio + "%",
                    r.aposAuxilio.toFixed(2),
                    r.passagens.toFixed(2),
                    r.aposPassagens.toFixed(2),
                    r.totalAlunos
                ]);
            });

            const wsResumo = XLSX.utils.aoa_to_sheet(dadosResumo);
            XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

            XLSX.writeFile(wb, `assef_calculo_${new Date().toISOString().slice(0, 10)}.xlsx`);
            UI.notificacao("Planilha Excel exportada com sucesso!", "success");
        } catch (error) {
            console.error(error);
            UI.notificacao("Erro ao exportar Excel", "error");
        }
    }
};

// ==============================================
// PÁGINAS
// ==============================================
const Paginas = {
    login() {
        return `
            <div class="login-container">
                <div class="card login-card">
                    <div class="logo">ASSEUF</div>
                    <div class="subtitulo-sistema">ENTERPRISE PRO</div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-user"></i> Usuário
                        </label>
                        <input type="text" id="login-usuario" class="form-control" placeholder="Digite seu usuário">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-lock"></i> Senha
                        </label>
                        <input type="password" id="login-senha" class="form-control" placeholder="Digite sua senha">
                    </div>
                    
                    ${UI.botao("ENTRAR", "fazerLogin()", "primario", "width:100%")}
                    
                    <div class="usuarios-demo">
                        <span class="badge badge-primary">admin / 0000</span>
                        <span class="badge badge-success">taylor / 1296</span>
                        <span class="badge badge-warning">operador / 4321</span>
                        <span class="badge badge-info">visitante / 1234</span>
                    </div>
                </div>
            </div>
        `;
    },

    home() {
        const totalRotas = Estado.rotas.length;
        const totalVeiculos = Estado.rotas.reduce((acc, r) => acc + (r.veiculos?.length || 0), 0);
        const totalAlunos = Estado.rotas.reduce((acc, r) => acc + (r.alunos?.length || 0), 0);
        const brutoTotal = Calculos.calcularBrutoTotal();

        return `
            <div class="container">
                <div class="card-header">
                    <h2 class="card-title">
                        <i class="fas fa-tachometer-alt"></i>
                        Dashboard
                    </h2>
                    <span class="badge badge-success">Online</span>
                </div>
                
                ${UI.resumoGrid([
                    UI.resumoCard("Rotas", totalRotas, "Cadastradas"),
                    UI.resumoCard("Veículos", totalVeiculos, "Em operação"),
                    UI.resumoCard("Alunos", totalAlunos, "Matriculados"),
                    UI.resumoCard("Bruto Total", `R$ ${brutoTotal.toFixed(2)}`, "Soma das rotas")
                ])}
                
                <div class="grid-2">
                    ${UI.card(`
                        <h3><i class="fas fa-route"></i> Últimas Rotas</h3>
                        <div class="tabela-wrapper">
                            ${UI.tabela(
                                ["Rota", "Veículos", "Alunos", "Ações"],
                                Estado.rotas.slice(0, 3).map(r => [
                                    r.nome,
                                    r.veiculos.length,
                                    r.alunos.length,
                                    UI.botao("Ver", `Navegacao.mudar('rotaDetalhe', {id:${r.id}})`, "sm")
                                ])
                            )}
                        </div>
                    `)}
                    
                    ${UI.card(`
                        <h3><i class="fas fa-calculator"></i> Cálculo Rápido</h3>
                        <p>Calcule o auxílio para todas as rotas</p>
                        <div class="form-group">
                            <label>Auxílio Dinheiro (R$)</label>
                            <input type="number" id="rapido-dinheiro" class="form-control" value="200" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Auxílio Combustível (R$)</label>
                            <input type="number" id="rapido-combustivel" class="form-control" value="0" step="0.01">
                        </div>
                        ${UI.botao("Calcular", "calculoRapido()", "primario")}
                    `)}
                </div>
            </div>
        `;
    },

    rotas() {
        return `
            <div class="container">
                <div class="card-header">
                    <h2 class="card-title">
                        <i class="fas fa-route"></i>
                        Gerenciar Rotas
                    </h2>
                    ${UI.botao("Nova Rota", "Navegacao.mudar('novaRota')", "success")}
                </div>
                
                <div class="grid-2">
                    ${Estado.rotas.map(rota => {
                        const bruto = Calculos.calcularBrutoRota(rota);
                        return UI.card(`
                            <div class="rota-card">
                                <div class="rota-header">
                                    <h3>${rota.nome}</h3>
                                    <div class="btn-group">
                                        ${UI.botao("<i class='fas fa-edit'></i>", `editarRota(${rota.id})`, "sm-outline")}
                                        ${UI.botao("<i class='fas fa-trash'></i>", `excluirRota(${rota.id})`, "sm-perigo")}
                                    </div>
                                </div>
                                <div class="rota-stats">
                                    <div><i class="fas fa-calendar"></i> ${rota.diasRodados.length} dias</div>
                                    <div><i class="fas fa-truck"></i> ${rota.veiculos.length} veículos</div>
                                    <div><i class="fas fa-users"></i> ${rota.alunos.length} alunos</div>
                                    <div><i class="fas fa-dollar-sign"></i> R$ ${bruto.toFixed(2)}</div>
                                </div>
                            </div>
                        `);
                    }).join("")}
                </div>
            </div>
        `;
    },

    novaRota() {
        return this.formularioRota();
    },

    editarRota(params) {
        const rota = Estado.rotas.find(r => r.id === params.id);
        if (!rota) {
            UI.notificacao("Rota não encontrada", "error");
            Navegacao.mudar("rotas");
            return "";
        }
        return this.formularioRota(rota);
    },

    formularioRota(rota = null) {
        const veiculosHtml = rota ? rota.veiculos.map((v, i) => UI.veiculoItem(v, i)).join("") : "";
        const alunosHtml = rota ? rota.alunos.map((a, i) => UI.alunoItem(a, i)).join("") : "";

        return `
            <div class="container">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas ${rota ? 'fa-edit' : 'fa-plus-circle'}"></i>
                            ${rota ? 'Editar Rota' : 'Nova Rota'}
                        </h2>
                    </div>
                    
                    <form onsubmit="salvarRota(event); return false;">
                        <input type="hidden" id="rota-id" value="${rota?.id || ''}">
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Nome da Rota</label>
                                <input type="text" class="form-control" id="rota-nome" value="${rota?.nome || ''}" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Dias Rodados (ex: 1,2,3,4)</label>
                                <input type="text" class="form-control" id="rota-dias" value="${rota?.diasRodados?.join(', ') || ''}" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Valor das Passagens (R$)</label>
                                <input type="number" class="form-control" id="rota-passagens" value="${rota?.passagens || ''}" step="0.01" min="0" required>
                            </div>
                        </div>
                        
                        <h3 class="card-title">Veículos</h3>
                        <div id="veiculos-container">${veiculosHtml}</div>
                        <div class="btn-group">
                            <select id="tipo-veiculo" class="form-control" style="width: auto;">
                                <option value="onibus">Ônibus - R$ 691,00</option>
                                <option value="micro">Micro-ônibus - R$ 532,00</option>
                                <option value="van">Van - R$ 425,00</option>
                            </select>
                            ${UI.botao("Adicionar Veículo", "adicionarVeiculo()", "success")}
                        </div>
                        
                        <h3 class="card-title" style="margin-top: 2rem;">Alunos</h3>
                        <div id="alunos-container">${alunosHtml}</div>
                        <div class="btn-group">
                            ${UI.botao("Adicionar Aluno", "adicionarAluno()", "success")}
                            ${UI.botao("Adicionar em Massa", "adicionarAlunosMassa()", "outline")}
                        </div>
                        
                        <div class="btn-group" style="margin-top: 2rem; justify-content: flex-end;">
                            ${UI.botao("Cancelar", "Navegacao.mudar('rotas')", "secundario")}
                            ${UI.botao("Salvar Rota", null, "success", "type='submit'")}
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    calculo() {
        return `
            <div class="container">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-calculator"></i>
                            Calcular Auxílio
                        </h2>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Auxílio em Dinheiro (R$)</label>
                            <input type="number" class="form-control" id="calculo-dinheiro" value="200" step="0.01" min="0">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Auxílio em Combustível (R$)</label>
                            <input type="number" class="form-control" id="calculo-combustivel" value="0" step="0.01" min="0">
                        </div>
                    </div>
                    
                    <div class="btn-group">
                        ${UI.botao("Calcular", "executarCalculo()", "primario")}
                        ${UI.botao("Limpar", "limparCalculo()", "secundario")}
                    </div>
                </div>
                
                <div id="resultado-calculo"></div>
            </div>
        `;
    },

    historico() {
        if (!Estado.historicoCalculos.length) {
            return `
                <div class="container">
                    <div class="card text-center" style="padding: 3rem;">
                        <i class="fas fa-history" style="font-size: 4rem; color: var(--primary); margin-bottom: 1rem;"></i>
                        <h3>Nenhum cálculo no histórico</h3>
                        <p style="color: var(--text-muted);">Realize um cálculo e salve para aparecer aqui</p>
                        ${UI.botao("Ir para Cálculo", "Navegacao.mudar('calculo')", "primario")}
                    </div>
                </div>
            `;
        }

        const historicoReverso = [...Estado.historicoCalculos].reverse();
        
        return `
            <div class="container">
                <div class="card-header">
                    <h2 class="card-title">
                        <i class="fas fa-history"></i>
                        Histórico de Cálculos
                    </h2>
                    ${UI.botao("Limpar Histórico", "limparHistorico()", "perigo")}
                </div>
                
                ${historicoReverso.map((calc, idx) => {
                    const index = Estado.historicoCalculos.length - 1 - idx;
                    return UI.card(`
                        <div class="historico-item">
                            <div class="historico-header">
                                <div>
                                    <h3>${new Date(calc.data).toLocaleString()}</h3>
                                    <div class="historico-tags">
                                        <span class="badge badge-primary">R$ ${calc.auxilioDinheiro} (Dinheiro)</span>
                                        <span class="badge badge-success">R$ ${calc.auxilioCombustivel} (Combustível)</span>
                                        <span class="badge badge-warning">Total: R$ ${calc.auxilioTotal}</span>
                                    </div>
                                </div>
                                <div class="btn-group">
                                    ${UI.botao("Ver", `visualizarCalculo(${index})`, "sm-outline")}
                                    ${UI.botao("Excluir", `excluirCalculo(${index})`, "sm-perigo")}
                                </div>
                            </div>
                            
                            <div class="historico-resumo">
                                <div><strong>${calc.resultados.length}</strong> rotas</div>
                                <div><strong>R$ ${calc.totais.bruto.toFixed(2)}</strong> bruto</div>
                                <div><strong>${calc.totais.alunos}</strong> alunos</div>
                            </div>
                        </div>
                    `);
                }).join("")}
            </div>
        `;
    },

    relatorio() {
        if (!Estado.calculoAtual) {
            return `
                <div class="container">
                    <div class="card text-center" style="padding: 3rem;">
                        <i class="fas fa-file-pdf" style="font-size: 4rem; color: var(--primary); margin-bottom: 1rem;"></i>
                        <h3>Nenhum cálculo selecionado</h3>
                        <p style="color: var(--text-muted);">Selecione um cálculo no histórico</p>
                        ${UI.botao("Ver Histórico", "Navegacao.mudar('historico')", "primario")}
                    </div>
                </div>
            `;
        }

        const calc = Estado.calculoAtual;
        
        return `
            <div class="container">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-file-pdf"></i>
                            Relatório de Cálculo
                        </h2>
                        <div class="btn-group">
                            ${UI.botao("Excel", "Exportacao.paraExcel()", "success")}
                            ${UI.botao("PDF", "Exportacao.paraPDF()", "danger")}
                        </div>
                    </div>
                    
                    <div class="relatorio-info">
                        <div class="grid-3">
                            <div class="info-item">
                                <div class="info-label">Data</div>
                                <div class="info-value">${new Date(calc.data).toLocaleDateString()}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Usuário</div>
                                <div class="info-value">${calc.usuario}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Auxílio Total</div>
                                <div class="info-value">R$ ${calc.auxilioTotal.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <h3 class="card-title">Resumo por Rota</h3>
                    <div class="tabela-wrapper">
                        ${UI.tabela(
                            ["Rota", "Bruto", "%", "Auxílio", "%", "Passagens", "Líquido", "Alunos"],
                            calc.resultados.map(r => [
                                r.rotaNome,
                                `R$ ${r.bruto.toFixed(2)}`,
                                `${r.percBruto}%`,
                                `R$ ${r.auxilio.toFixed(2)}`,
                                `${r.percAuxilio}%`,
                                `R$ ${r.passagens.toFixed(2)}`,
                                `R$ ${r.aposPassagens.toFixed(2)}`,
                                r.totalAlunos
                            ])
                        )}
                    </div>
                    
                    <h3 class="card-title" style="margin-top: 2rem;">Rateio por Aluno</h3>
                    ${calc.resultados.map(r => `
                        <div style="margin-bottom: 2rem;">
                            <h4>${r.rotaNome}</h4>
                            <div class="tabela-wrapper">
                                ${UI.tabela(
                                    ["Aluno", "Tipo", "Desconto", "Valor"],
                                    r.alunos.map(a => [
                                        a.nome,
                                        a.integral ? "Integral" : "Com Desconto",
                                        a.integral ? "-" : `${a.desconto}%`,
                                        `R$ ${a.valorPagar.toFixed(2)}`
                                    ])
                                )}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    },

    backup() {
        return `
            <div class="container">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i class="fas fa-database"></i>
                            Backup e Restauração
                        </h2>
                    </div>
                    
                    <div class="grid-2">
                        <div class="card text-center">
                            <i class="fas fa-download" style="font-size: 3rem; color: var(--success); margin-bottom: 1rem;"></i>
                            <h3>Exportar Backup</h3>
                            <p style="color: var(--text-muted); margin-bottom: 1rem;">Exportar todos os dados para um arquivo JSON</p>
                            ${UI.botao("Exportar", "Backup.exportar()", "success")}
                        </div>
                        
                        <div class="card text-center">
                            <i class="fas fa-upload" style="font-size: 3rem; color: var(--warning); margin-bottom: 1rem;"></i>
                            <h3>Importar Backup</h3>
                            <p style="color: var(--text-muted); margin-bottom: 1rem;">Importar dados de um arquivo JSON</p>
                            <input type="file" id="backup-file" style="display: none;" accept=".json" onchange="importarBackupArquivo(event)">
                            ${UI.botao("Importar", "document.getElementById('backup-file').click()", "warning")}
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3 class="card-title">Informações do Sistema</h3>
                        <div class="grid-3">
                            <div class="info-item">
                                <div class="info-label">Rotas</div>
                                <div class="info-value">${Estado.rotas.length}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Cálculos</div>
                                <div class="info-value">${Estado.historicoCalculos.length}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Usuários</div>
                                <div class="info-value">${Estado.usuarios.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// ==============================================
// NAVEGAÇÃO
// ==============================================
const Navegacao = {
    atual: "login",
    params: {},

    mudar(pagina, params = {}) {
        this.atual = pagina;
        this.params = params;
        this.render();
    },

    render() {
        const app = document.getElementById("app");
        if (!app) return;

        if (!Estado.usuarioAtual && this.atual !== "login") {
            this.atual = "login";
        }

        let conteudo = "";

        if (this.atual === "login") {
            conteudo = Paginas.login();
        } else {
            conteudo = `
                <div class="app-layout">
                    <aside class="sidebar">
                        <div class="sidebar-header">
                            <div class="logo">ASSEUF</div>
                            <div class="subtitle">ENTERPRISE PRO</div>
                        </div>
                        
                        <div class="user-info">
                            <div class="user-name">
                                <i class="fas fa-user-circle"></i> ${Estado.usuarioAtual?.nome}
                            </div>
                            <div class="user-role">
                                Perfil: <span class="role-badge">${Estado.usuarioAtual?.perfil?.toUpperCase()}</span>
                            </div>
                        </div>
                        
                        <nav class="nav-menu">
                            <button class="nav-item ${this.atual === 'home' ? 'active' : ''}" onclick="Navegacao.mudar('home')">
                                <i class="fas fa-home"></i> Dashboard
                            </button>
                            <button class="nav-item ${this.atual === 'rotas' ? 'active' : ''}" onclick="Navegacao.mudar('rotas')">
                                <i class="fas fa-route"></i> Rotas
                            </button>
                            <button class="nav-item ${this.atual === 'calculo' ? 'active' : ''}" onclick="Navegacao.mudar('calculo')">
                                <i class="fas fa-calculator"></i> Calcular
                            </button>
                            <button class="nav-item ${this.atual === 'historico' ? 'active' : ''}" onclick="Navegacao.mudar('historico')">
                                <i class="fas fa-history"></i> Histórico
                            </button>
                            <button class="nav-item ${this.atual === 'relatorio' ? 'active' : ''}" onclick="Navegacao.mudar('relatorio')">
                                <i class="fas fa-file-pdf"></i> Relatório
                            </button>
                            <button class="nav-item ${this.atual === 'backup' ? 'active' : ''}" onclick="Navegacao.mudar('backup')">
                                <i class="fas fa-database"></i> Backup
                            </button>
                            <button class="nav-item" onclick="alternarTema()">
                                <i class="fas ${Estado.tema === 'light' ? 'fa-moon' : 'fa-sun'}"></i>
                                ${Estado.tema === 'light' ? 'Tema Escuro' : 'Tema Claro'}
                            </button>
                            <button class="nav-item logout" onclick="Auth.logout()">
                                <i class="fas fa-sign-out-alt"></i> Sair
                            </button>
                        </nav>
                    </aside>
                    
                    <main class="main-content">
                        ${this.renderConteudo()}
                    </main>
                </div>
            `;
        }

        app.innerHTML = conteudo;
    },

    renderConteudo() {
        if (this.atual === "editarRota") {
            return Paginas.editarRota(this.params);
        }
        return Paginas[this.atual] ? Paginas[this.atual]() : Paginas.home();
    }
};

// ==============================================
// FUNÇÕES GLOBAIS
// ==============================================
function fazerLogin() {
    const usuario = document.getElementById("login-usuario")?.value;
    const senha = document.getElementById("login-senha")?.value;
    Auth.fazerLogin(usuario, senha);
}

function alternarTema() {
    Estado.tema = Estado.tema === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", Estado.tema);
    Navegacao.render();
}

function calculoRapido() {
    const dinheiro = parseFloat(document.getElementById("rapido-dinheiro")?.value) || 0;
    const combustivel = parseFloat(document.getElementById("rapido-combustivel")?.value) || 0;
    
    if (dinheiro + combustivel === 0) {
        UI.notificacao("Informe pelo menos um valor de auxílio", "warning");
        return;
    }
    
    Calculos.calcularAuxilio(dinheiro, combustivel);
    Navegacao.mudar("relatorio");
}

function executarCalculo() {
    const dinheiro = parseFloat(document.getElementById("calculo-dinheiro")?.value) || 0;
    const combustivel = parseFloat(document.getElementById("calculo-combustivel")?.value) || 0;
    
    if (dinheiro + combustivel === 0) {
        UI.notificacao("Informe pelo menos um valor de auxílio", "warning");
        return;
    }
    
    const resultado = Calculos.calcularAuxilio(dinheiro, combustivel);
    if (!resultado) return;
    
    let html = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Resultado do Cálculo</h3>
                <div class="btn-group">
                    ${UI.botao("Salvar no Histórico", "salvarNoHistorico()", "success")}
                    ${UI.botao("Ver Relatório", "Navegacao.mudar('relatorio')", "primario")}
                </div>
            </div>
            
            <div class="tabela-wrapper">
                ${UI.tabela(
                    ["Rota", "Bruto", "%", "Auxílio", "%", "Após Auxílio", "Passagens", "Líquido"],
                    resultado.resultados.map(r => [
                        r.rotaNome,
                        `R$ ${r.bruto.toFixed(2)}`,
                        `${r.percBruto}%`,
                        `R$ ${r.auxilio.toFixed(2)}`,
                        `${r.percAuxilio}%`,
                        `R$ ${r.aposAuxilio.toFixed(2)}`,
                        `R$ ${r.passagens.toFixed(2)}`,
                        `R$ ${r.aposPassagens.toFixed(2)}`
                    ])
                )}
            </div>
            
            <div class="resumo-grid" style="margin-top: 1rem;">
                ${UI.resumoCard("Total Bruto", `R$ ${resultado.totais.bruto.toFixed(2)}`)}
                ${UI.resumoCard("Total Auxílio", `R$ ${resultado.totais.auxilio.toFixed(2)}`)}
                ${UI.resumoCard("Total Passagens", `R$ ${resultado.totais.passagens.toFixed(2)}`)}
                ${UI.resumoCard("Total Alunos", resultado.totais.alunos)}
            </div>
        </div>
    `;
    
    document.getElementById("resultado-calculo").innerHTML = html;
}

function limparCalculo() {
    document.getElementById("resultado-calculo").innerHTML = "";
}

function salvarNoHistorico() {
    if (!Estado.calculoAtual) {
        UI.notificacao("Nenhum cálculo para salvar", "warning");
        return;
    }
    
    Estado.historicoCalculos.push(Estado.calculoAtual);
    Backup.salvar();
    UI.notificacao("Cálculo salvo no histórico!", "success");
}

function visualizarCalculo(index) {
    Estado.calculoAtual = Estado.historicoCalculos[index];
    Navegacao.mudar("relatorio");
}

function excluirCalculo(index) {
    if (confirm("Tem certeza que deseja excluir este cálculo?")) {
        Estado.historicoCalculos.splice(index, 1);
        Backup.salvar();
        UI.notificacao("Cálculo excluído!", "success");
        Navegacao.render();
    }
}

function limparHistorico() {
    if (confirm("Tem certeza que deseja limpar todo o histórico?")) {
        Estado.historicoCalculos = [];
        Backup.salvar();
        UI.notificacao("Histórico limpo!", "success");
        Navegacao.render();
    }
}

function adicionarVeiculo() {
    const tipoSelect = document.getElementById("tipo-veiculo");
    const tipo = tipoSelect.value;
    
    let nome, valorDiaria;
    if (tipo === "onibus") {
        nome = "Ônibus";
        valorDiaria = 691;
    } else if (tipo === "micro") {
        nome = "Micro-ônibus";
        valorDiaria = 532;
    } else {
        nome = "Van";
        valorDiaria = 425;
    }
    
    const veiculo = {
        nome,
        valorDiaria,
        qtdDiarias: 1,
        diasRodados: 1
    };
    
    const container = document.getElementById("veiculos-container");
    const index = container.children.length;
    container.insertAdjacentHTML("beforeend", UI.veiculoItem(veiculo, index));
}

function removerVeiculo(botao) {
    botao.closest(".veiculo-item").remove();
}

function adicionarAluno() {
    const aluno = {
        nome: "Novo Aluno",
        integral: true,
        desconto: 0
    };
    
    const container = document.getElementById("alunos-container");
    const index = container.children.length;
    container.insertAdjacentHTML("beforeend", UI.alunoItem(aluno, index));
}

function adicionarAlunosMassa() {
    const quantidade = prompt("Quantos alunos deseja adicionar?", "5");
    const qtd = parseInt(quantidade);
    
    if (isNaN(qtd) || qtd <= 0) return;
    
    for (let i = 0; i < qtd; i++) {
        adicionarAluno();
    }
}

function removerAluno(botao) {
    botao.closest(".veiculo-item").remove();
}

function salvarRota(event) {
    const id = document.getElementById("rota-id")?.value;
    const nome = document.getElementById("rota-nome")?.value;
    const diasStr = document.getElementById("rota-dias")?.value;
    const passagens = parseFloat(document.getElementById("rota-passagens")?.value) || 0;
    
    if (!nome || !diasStr) {
        UI.notificacao("Preencha todos os campos", "error");
        return;
    }
    
    const diasRodados = diasStr.split(",").map(d => parseInt(d.trim())).filter(d => !isNaN(d));
    
    const veiculos = [];
    document.querySelectorAll("#veiculos-container .veiculo-item").forEach((item, idx) => {
        const nome = item.querySelector(".veiculo-tipo")?.textContent || "Veículo";
        const diaria = parseFloat(item.querySelector(".veiculo-diaria")?.value) || 0;
        const qtd = parseInt(item.querySelector(".veiculo-qtd")?.value) || 0;
        const dias = parseInt(item.querySelector(".veiculo-dias")?.value) || 1;
        
        if (diaria > 0 && qtd > 0) {
            veiculos.push({
                id: idx + 1,
                nome,
                valorDiaria: diaria,
                qtdDiarias: qtd,
                diasRodados: dias
            });
        }
    });
    
    const alunos = [];
    document.querySelectorAll("#alunos-container .veiculo-item").forEach((item, idx) => {
        const nome = item.querySelector(".aluno-nome")?.value;
        const tipo = item.querySelector(".aluno-tipo")?.value;
        const desconto = parseFloat(item.querySelector(".aluno-desconto")?.value) || 0;
        
        if (nome) {
            alunos.push({
                id: idx + 1,
                nome,
                integral: tipo === "integral",
                desconto: tipo === "integral" ? 0 : desconto
            });
        }
    });
    
    if (!veiculos.length) {
        UI.notificacao("Adicione pelo menos um veículo", "error");
        return;
    }
    
    if (!alunos.length) {
        UI.notificacao("Adicione pelo menos um aluno", "error");
        return;
    }
    
    const rota = {
        id: id ? parseInt(id) : Date.now(),
        nome,
        diasRodados,
        passagens,
        veiculos,
        alunos
    };
    
    if (id) {
        const index = Estado.rotas.findIndex(r => r.id === parseInt(id));
        if (index !== -1) {
            Estado.rotas[index] = rota;
            UI.notificacao("Rota atualizada com sucesso!", "success");
        }
    } else {
        Estado.rotas.push(rota);
        UI.notificacao("Rota criada com sucesso!", "success");
    }
    
    Backup.salvar();
    Navegacao.mudar("rotas");
}

function editarRota(id) {
    Navegacao.mudar("editarRota", { id });
}

function excluirRota(id) {
    if (confirm("Tem certeza que deseja excluir esta rota?")) {
        Estado.rotas = Estado.rotas.filter(r => r.id !== id);
        Backup.salvar();
        UI.notificacao("Rota excluída com sucesso!", "success");
        Navegacao.render();
    }
}

function importarBackupArquivo(event) {
    const arquivo = event.target.files[0];
    if (arquivo) {
        Backup.importar(arquivo);
    }
}

// ==============================================
// INICIALIZAÇÃO
// ==============================================
document.addEventListener("DOMContentLoaded", () => {
    Backup.carregar();
    Navegacao.render();
});

// Expor funções globais
window.fazerLogin = fazerLogin;
window.alternarTema = alternarTema;
window.calculoRapido = calculoRapido;
window.executarCalculo = executarCalculo;
window.limparCalculo = limparCalculo;
window.salvarNoHistorico = salvarNoHistorico;
window.visualizarCalculo = visualizarCalculo;
window.excluirCalculo = excluirCalculo;
window.limparHistorico = limparHistorico;
window.adicionarVeiculo = adicionarVeiculo;
window.removerVeiculo = removerVeiculo;
window.adicionarAluno = adicionarAluno;
window.adicionarAlunosMassa = adicionarAlunosMassa;
window.removerAluno = removerAluno;
window.salvarRota = salvarRota;
window.editarRota = editarRota;
window.excluirRota = excluirRota;
window.importarBackupArquivo = importarBackupArquivo;
window.Backup = Backup;
window.Exportacao = Exportacao;
window.Navegacao = Navegacao;
