const usuariosPadrao = [
  { user: "taylor", pass: "123", tipo: "presidente" },
  { user: "tesoureiro", pass: "123", tipo: "tesoureiro" },
  { user: "usuario", pass: "123", tipo: "usuario" }
];

if (!localStorage.getItem("usuarios")) {
  localStorage.setItem("usuarios", JSON.stringify(usuariosPadrao));
}

if (!localStorage.getItem("rateios")) {
  localStorage.setItem("rateios", JSON.stringify([]));
}

let usuarioAtual = null;

function login() {
  const user = document.getElementById("login-user").value;
  const pass = document.getElementById("login-pass").value;

  const usuarios = JSON.parse(localStorage.getItem("usuarios"));

  const encontrado = usuarios.find(u => u.user === user && u.pass === pass);

  if (encontrado) {
    usuarioAtual = encontrado;
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("user-info").innerText =
      `${encontrado.user} (${encontrado.tipo})`;
    carregarHistorico();
  } else {
    alert("Login inválido");
  }
}

function logout() {
  usuarioAtual = null;
  document.getElementById("app").style.display = "none";
  document.getElementById("login-screen").style.display = "block";
}

function adicionarRateio() {
  if (usuarioAtual.tipo === "usuario") {
    alert("Você não tem permissão para adicionar.");
    return;
  }

  const descricao = document.getElementById("descricao").value;
  const auxilio = parseFloat(document.getElementById("auxilio").value);

  const rateios = JSON.parse(localStorage.getItem("rateios"));

  const novo = {
    id: Date.now(),
    descricao,
    auxilio,
    criadoPor: usuarioAtual.user,
    data: new Date().toLocaleString()
  };

  rateios.push(novo);
  localStorage.setItem("rateios", JSON.stringify(rateios));

  carregarHistorico();
}

function carregarHistorico() {
  const historicoDiv = document.getElementById("historico");
  historicoDiv.innerHTML = "";

  const rateios = JSON.parse(localStorage.getItem("rateios"));

  rateios.forEach(r => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${r.descricao}</strong><br>
      Auxílio: R$ ${r.auxilio}<br>
      Criado por: ${r.criadoPor}<br>
      Data: ${r.data}
      <hr>
    `;
    historicoDiv.appendChild(div);
  });

  desenharGrafico(rateios);
}

function desenharGrafico(rateios) {
  const canvas = document.getElementById("grafico");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let x = 20;
  rateios.forEach(r => {
    const altura = r.auxilio / 5;
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(x, 200 - altura, 30, altura);
    x += 50;
  });
}
