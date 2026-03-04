const usuarios = {
    taylor: { senha: "1269", nivel: "admin" },
    tesoureiro: { senha: "0000", nivel: "admin" },
    usuario: { senha: "1234", nivel: "viewer" }
};

let usuarioAtual = null;

function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (usuarios[user] && usuarios[user].senha === pass) {
        usuarioAtual = usuarios[user];
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("app").style.display = "flex";
        document.getElementById("loggedUser").innerText = "Logado como: " + user;
        verificarPermissao();
        carregarHistorico();
        atualizarDashboard();
    } else {
        document.getElementById("loginError").innerText = "Login inválido";
    }
}

function logout() {
    location.reload();
}

function verificarPermissao() {
    if (usuarioAtual.nivel === "viewer") {
        document.getElementById("btnCalcular").style.display = "none";
        document.getElementById("valorTotal").disabled = true;
        document.getElementById("quantidade").disabled = true;
    }
}

function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function calcularRateio() {
    const total = parseFloat(document.getElementById("valorTotal").value);
    const qtd = parseInt(document.getElementById("quantidade").value);

    if (!total || !qtd) return;

    const valor = (total / qtd).toFixed(2);
    document.getElementById("resultadoRateio").innerText = 
        "Cada associado pagará R$ " + valor;

    salvarHistorico(total, qtd, valor);
}

function salvarHistorico(total, qtd, valor) {
    let historico = JSON.parse(localStorage.getItem("historico")) || [];

    const registro = {
        data: new Date().toLocaleString(),
        total,
        qtd,
        valor,
        usuario: usuarioAtual
    };

    historico.push(registro);
    localStorage.setItem("historico", JSON.stringify(historico));

    carregarHistorico();
    atualizarDashboard();
}

function carregarHistorico() {
    let historico = JSON.parse(localStorage.getItem("historico")) || [];
    const lista = document.getElementById("historicoLista");
    lista.innerHTML = "";

    historico.forEach(item => {
        lista.innerHTML += `
            <div class="premium-card">
                <div class="card-body">
                    <p><b>Data:</b> ${item.data}</p>
                    <p><b>Total:</b> R$ ${item.total}</p>
                    <p><b>Associados:</b> ${item.qtd}</p>
                    <p><b>Valor individual:</b> R$ ${item.valor}</p>
                </div>
            </div>
        `;
    });
}

function atualizarDashboard() {
    let historico = JSON.parse(localStorage.getItem("historico")) || [];
    let totalMovimentado = historico.reduce((soma, h) => soma + parseFloat(h.total), 0);

    document.getElementById("dashboardContent").innerHTML = `
        <div class="premium-card">
            <div class="card-body">
                <h3>Total movimentado</h3>
                <h2>R$ ${totalMovimentado.toFixed(2)}</h2>
                <p>Total de rateios realizados: ${historico.length}</p>
            </div>
        </div>
    `;
}

function baixarRelatorio() {
    let historico = JSON.parse(localStorage.getItem("historico")) || [];
    let texto = "RELATORIO FINANCEIRO\n\n";

    historico.forEach(h => {
        texto += `Data: ${h.data}\nTotal: R$ ${h.total}\nQtd: ${h.qtd}\nValor: R$ ${h.valor}\n\n`;
    });

    const blob = new Blob([texto], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio.txt";
    link.click();
}
