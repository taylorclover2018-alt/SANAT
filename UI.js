/*  
===========================================================
UI.js — Componentes Visuais Globais
===========================================================
*/

const UI = {

    // ---------------------------------------------------------
    // LOGO
    // ---------------------------------------------------------
    logo() {
        return `
            <div style="
                font-size:26px;
                font-weight:700;
                color:var(--accent);
                margin-bottom:10px;
            ">
                ASSEUF
            </div>
        `;
    },

    // ---------------------------------------------------------
    // TÍTULO DE PÁGINA
    // ---------------------------------------------------------
    titulo(texto) {
        return `
            <h1 style="
                margin:0 0 20px 0;
                font-size:26px;
                font-weight:600;
                color:var(--text-main);
            ">
                ${texto}
            </h1>
        `;
    },

    // ---------------------------------------------------------
    // SUBTÍTULO
    // ---------------------------------------------------------
    subtitulo(texto) {
        return `
            <h2 style="
                margin:0 0 14px 0;
                font-size:20px;
                font-weight:500;
                color:var(--text-muted);
            ">
                ${texto}
            </h2>
        `;
    },

    // ---------------------------------------------------------
    // BOTÃO PRIMÁRIO
    // ---------------------------------------------------------
    btnPrimary(texto, onclick) {
        return `
            <button onclick="${onclick}" style="
                padding:10px 18px;
                border-radius:999px;
                background:var(--accent);
                color:#000;
                font-weight:600;
                border:none;
                cursor:pointer;
                box-shadow:0 0 10px var(--accent);
                margin:4px 0;
            ">
                ${texto}
            </button>
        `;
    },

    // ---------------------------------------------------------
    // BOTÃO SECUNDÁRIO
    // ---------------------------------------------------------
    btnSecondary(texto, onclick) {
        return `
            <button onclick="${onclick}" style="
                padding:10px 18px;
                border-radius:999px;
                background:transparent;
                border:1px solid var(--border-soft);
                color:var(--text-main);
                cursor:pointer;
                margin:4px 0;
            ">
                ${texto}
            </button>
        `;
    },

    // ---------------------------------------------------------
    // CARD PADRÃO
    // ---------------------------------------------------------
    card(conteudo) {
        return `
            <div style="
                background:var(--bg-card);
                border-radius:var(--radius-lg);
                padding:20px;
                border:1px solid var(--border-soft);
                box-shadow:var(--shadow-soft);
                margin-bottom:20px;
            ">
                ${conteudo}
            </div>
        `;
    },

    // ---------------------------------------------------------
    // INPUT PADRÃO
    // ---------------------------------------------------------
    input(id, placeholder, value = "") {
        return `
            <input id="${id}" placeholder="${placeholder}" value="${value}" style="
                width:100%;
                padding:10px;
                border-radius:8px;
                border:1px solid var(--border-soft);
                background:#0d0d15;
                color:var(--text-main);
                margin:6px 0 14px 0;
            ">
        `;
    },

    // ---------------------------------------------------------
    // TEXTAREA
    // ---------------------------------------------------------
    textarea(id, placeholder, value = "") {
        return `
            <textarea id="${id}" placeholder="${placeholder}" style="
                width:100%;
                height:100px;
                padding:10px;
                border-radius:8px;
                border:1px solid var(--border-soft);
                background:#0d0d15;
                color:var(--text-main);
                margin:6px 0 14px 0;
            ">${value}</textarea>
        `;
    },

    // ---------------------------------------------------------
    // SELECT
    // ---------------------------------------------------------
    select(id, optionsHtml) {
        return `
            <select id="${id}" style="
                width:100%;
                padding:10px;
                border-radius:8px;
                border:1px solid var(--border-soft);
                background:#0d0d15;
                color:var(--text-main);
                margin:6px 0 14px 0;
            ">
                ${optionsHtml}
            </select>
        `;
    },

    // ---------------------------------------------------------
    // AVATAR DE USUÁRIO
    // ---------------------------------------------------------
    avatar(usuario, size = 40) {
        const letra = usuario?.charAt(0)?.toUpperCase() || "?";

        return `
            <div style="
                width:${size}px;
                height:${size}px;
                border-radius:50%;
                background:var(--accent-soft);
                color:var(--accent);
                display:flex;
                align-items:center;
                justify-content:center;
                font-weight:700;
                font-size:${size * 0.45}px;
                margin-right:8px;
            ">
                ${letra}
            </div>
        `;
    },

    // ---------------------------------------------------------
    // LINHA DE LISTA
    // ---------------------------------------------------------
    linha(titulo, subtitulo = "") {
        return `
            <div style="
                padding:12px;
                border-bottom:1px solid var(--border-soft);
            ">
                <div style="font-weight:600;">${titulo}</div>
                <div style="font-size:13px; color:var(--text-muted);">${subtitulo}</div>
            </div>
        `;
    },

    // ---------------------------------------------------------
    // LOADER
    // ---------------------------------------------------------
    loader() {
        return `
            <div style="
                width:100%;
                text-align:center;
                padding:40px;
                font-size:18px;
                color:var(--text-muted);
            ">
                Carregando...
            </div>
        `;
    }
};
