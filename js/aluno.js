const API = "https://backend-psicologo-production.up.railway.app";

// ELEMENTOS
const selectPsicologo = document.getElementById("psicologoSelect");
const selectTurma = document.getElementById("turmaSelect");
const horariosContainer = document.getElementById("horariosContainer");

// INIT
window.onload = async () => {
    await carregarPsicologos();
    await carregarTurmas();
};

// ======================
// PSICÓLOGOS
// ======================
async function carregarPsicologos() {
    try {
        const res = await fetch(`${API}/psicologos`);
        const data = await res.json();

        selectPsicologo.innerHTML = `<option value="">Selecione um psicólogo</option>`;

        data.forEach(p => {
            selectPsicologo.innerHTML += `
                <option value="${p.id}">${p.nome}</option>
            `;
        });

    } catch (err) {
        console.log("Erro psicólogos:", err);
    }
}

// ======================
// TURMAS
// ======================
async function carregarTurmas() {
    try {
        const res = await fetch(`${API}/turmas`);
        const data = await res.json();

        selectTurma.innerHTML = `<option value="">Selecione sua turma</option>`;

        data.forEach(t => {
            const nome = t.curso || t.nome || "Turma";
            const serie = t.serie || t.periodo || "";

            selectTurma.innerHTML += `
                <option value="${t.id}">
                    ${nome}${serie ? " - " + serie : ""}
                </option>
            `;
        });

    } catch (err) {
        console.log("Erro turmas:", err);
    }
}

// ======================
// TROCAR PSICÓLOGO
// ======================
selectPsicologo.addEventListener("change", async (e) => {
    const id = e.target.value;

    horariosContainer.innerHTML = "";

    if (!id) return;

    await carregarHorarios(id);
});

// ======================
// HORÁRIOS
// ======================
async function carregarHorarios(psicologoId) {
    try {
        const res = await fetch(`${API}/horarios/${psicologoId}`);
        const response = await res.json();

        console.log("HORÁRIOS RAW:", response);

        horariosContainer.innerHTML = "";

        const data =
            Array.isArray(response)
                ? (Array.isArray(response[0]) ? response[0] : response)
                : response.data
                ? response.data
                : [];

        if (!Array.isArray(data)) {
            horariosContainer.innerHTML =
                "<p style='color:white'>Erro ao carregar horários</p>";
            return;
        }

        if (data.length === 0) {
            horariosContainer.innerHTML =
                "<p style='color:white'>Nenhum horário disponível</p>";
            return;
        }

        data.forEach(h => {
            const disponivel = Number(h.disponivel) === 1;

            const card = document.createElement("div");
            card.classList.add("horario-card");

            card.innerHTML = `
                <p><strong>Psicólogo:</strong> ${h.psicologo_nome || "N/A"}</p>
                <p><strong>Data:</strong> ${
                    h.data_hora ? formatarData(h.data_hora) : "N/A"
                }</p>
                <p><strong>Status:</strong> ${
                    disponivel ? "Disponível" : "Ocupado"
                }</p>

                <button onclick="marcarConsulta(${h.id})" ${
                    !disponivel ? "disabled" : ""
                }>
                    Marcar consulta
                </button>
            `;

            horariosContainer.appendChild(card);
        });

    } catch (err) {
        console.log("Erro horários:", err);
        horariosContainer.innerHTML =
            "<p style='color:red'>Erro ao carregar horários</p>";
    }
}

// ======================
// MARCAR CONSULTA
// ======================
async function marcarConsulta(horarioId) {
    const nome = document.getElementById("nome").value;
    const motivo = document.getElementById("motivo").value;
    const turmaId = selectTurma.value;

    if (!nome || !motivo || !turmaId) {
        alert("Preencha todos os campos");
        return;
    }

    try {
        const res = await fetch(`${API}/consultas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome_aluno: nome,
                turma_id: turmaId,
                horario_id: horarioId,
                motivo
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Erro ao marcar consulta");
        }

        alert("Consulta marcada com sucesso!");

        await carregarHorarios(selectPsicologo.value);

    } catch (err) {
        console.log(err);
        alert("Erro ao marcar consulta");
    }
}

// ======================
// UTIL
// ======================
function formatarData(data) {
    const d = new Date(data);

    return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}