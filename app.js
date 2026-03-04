const usuarios = [
    { usuario:"admin", senha:"Admin@123", tipo:"admin" },
    { usuario:"operador1", senha:"Op1@123", tipo:"operador" },
    { usuario:"operador2", senha:"Op2@123", tipo:"operador" }
];

let usuarioLogado=null;

function fazerLogin(){
    const u=document.getElementById("loginUser").value;
    const s=document.getElementById("loginPass").value;

    const user=usuarios.find(x=>x.usuario===u && x.senha===s);

    if(!user){
        document.getElementById("loginErro").innerText="Credenciais inválidas.";
        return;
    }

    usuarioLogado=user;
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    document.getElementById("usuarioInfo").innerText=
        `${user.usuario} (${user.tipo})`;

    aplicarPermissoes();
    atualizarDashboard();
    carregarHistorico();
}

function logout(){
    usuarioLogado=null;
    location.reload();
}

function aplicarPermissoes(){
    if(usuarioLogado.tipo!=="admin"){
        document.getElementById("btnExportar").style.display="none";
        document.getElementById("btnLimpar").style.display="none";
    }
}

function calcularRateio(){
    const alunos=parseFloat(document.getElementById("totalAlunos").value);
    const veiculos=parseFloat(document.getElementById("totalVeiculos").value);

    if(!alunos || !veiculos) return;

    const resultado=(alunos/veiculos).toFixed(2);

    document.getElementById("resultadoRateio").innerHTML=
        `<h3>${resultado} alunos por veículo</h3>`;

    salvarHistorico(alunos,veiculos,resultado);
}

function salvarHistorico(a,v,r){
    const historico=JSON.parse(localStorage.getItem("historico"))||[];

    historico.push({
        data:new Date().toLocaleString(),
        alunos:a,
        veiculos:v,
        resultado:r,
        usuario:usuarioLogado.usuario
    });

    localStorage.setItem("historico",JSON.stringify(historico));
    atualizarDashboard();
    carregarHistorico();
}

function carregarHistorico(){
    const historico=JSON.parse(localStorage.getItem("historico"))||[];
    const div=document.getElementById("historico");
    div.innerHTML="";

    historico.forEach(h=>{
        div.innerHTML+=`
            <div class="card" style="margin-bottom:15px;">
                <strong>${h.data}</strong><br>
                ${h.alunos} alunos / ${h.veiculos} veículos<br>
                Resultado: ${h.resultado}<br>
                Usuário: ${h.usuario}
            </div>
        `;
    });
}

function limparHistorico(){
    localStorage.removeItem("historico");
    carregarHistorico();
    atualizarDashboard();
}

function atualizarDashboard(){
    const historico=JSON.parse(localStorage.getItem("historico"))||[];

    document.getElementById("statRateios").innerText=historico.length;

    if(historico.length>0){
        const soma=historico.reduce((acc,x)=>acc+parseFloat(x.resultado),0);
        document.getElementById("statMedia").innerText=
            (soma/historico.length).toFixed(2);

        document.getElementById("statUsuario").innerText=
            historico[historico.length-1].usuario;
    }
}

function exportarCSV(){
    const historico=JSON.parse(localStorage.getItem("historico"))||[];
    let csv="Data,Alunos,Veiculos,Resultado,Usuario\n";

    historico.forEach(h=>{
        csv+=`${h.data},${h.alunos},${h.veiculos},${h.resultado},${h.usuario}\n`;
    });

    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download="historico_rateio.csv";
    a.click();
}
