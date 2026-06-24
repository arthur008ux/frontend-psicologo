const user = JSON.parse(localStorage.getItem("psicologo"));

if (!user) {
    window.location.href = "index.html";
}

document.getElementById("bemvindo").innerText =
    "Bem-vindo, " + user.nome;

/* ======================
   LOGOUT
====================== */

function logout() {
    localStorage.removeItem("psicologo");
    window.location.href = "index.html";
}

/* ======================
   HORÁRIOS
====================== */

async function carregarHorarios() {
    try {
        const res = await fetch(`https://backend-psicologo-production.up.railway.app/horarios/${user.id}`);

        if (!res.ok) {
            throw new Error("Erro ao buscar horários");
        }

        const response = await res.json();

        console.log("HORÁRIOS RAW:", response);

        const data =
            Array.isArray(response)
                ? (Array.isArray(response[0]) ? response[0] : response)
                : response.data
                ? response.data
                : [];

        const div = document.getElementById("horarios");

        if (!Array.isArray(data) || data.length === 0) {
            div.innerHTML = "<p>Nenhum horário encontrado</p>";
            return;
        }

        div.innerHTML = data.map(h => `
            <div class="item-card">
                <span class="item-text">${formatarData(h.data_hora)}</span>
                <span class="badge ${Number(h.disponivel) === 1 ? 'livre' : 'ocupado'}">
                    ${Number(h.disponivel) === 1 ? 'Livre' : 'Ocupado'}
                </span>
            </div>
        `).join("");

    } catch (err) {
        console.log(err);
        document.getElementById("horarios").innerHTML =
            "<p style='color:red'>Erro ao carregar horários</p>";
    }
}

/* ======================
   CRIAR HORÁRIO
====================== */

async function criarHorario() {
    const dataHora = document.getElementById("dataHora").value;

    if (!dataHora) return;

    try {
        await fetch("https://backend-psicologo-production.up.railway.app/horarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                psicologo_id: user.id,
                data_hora: dataHora
            })
        });

        await carregarHorarios();

    } catch (err) {
        console.log("Erro ao criar horário:", err);
    }
}

/* ======================
   CONSULTAS
====================== */

async function carregarConsultas() {
    try {
        const res = await fetch(`https://backend-psicologo-production.up.railway.app/consultas/psicologo/${user.id}`);

        if (!res.ok) {
            throw new Error("Erro ao buscar consultas");
        }

        const response = await res.json();

        const div = document.getElementById("consultas");

        const data =
            Array.isArray(response)
                ? response
                : response.data
                ? response.data
                : [];

        if (!Array.isArray(data) || data.length === 0) {
            div.innerHTML = "<p>Nenhuma consulta encontrada</p>";
            return;
        }

        div.innerHTML = data.map(c => `
            <div class="item-card">
                <div>
                    <div class="consulta-nome">${c.nome_aluno}</div>
                    <div class="consulta-motivo">${c.motivo}</div>
                </div>
                <span class="badge livre">Consulta</span>
            </div>
        `).join("");

    } catch (err) {
        console.log(err);
    }
}

/* ======================
   UTIL
====================== */

function formatarData(data) {
    const d = new Date(data);

    return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}