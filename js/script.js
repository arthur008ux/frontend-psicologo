async function login() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const msg = document.getElementById("msg");

    msg.style.color = "red";
    msg.innerText = "";

    if (!email || !senha) {
        msg.innerText = "Preencha todos os campos";
        return;
    }

    try {
        const response = await fetch(
            "https://backend-psicologo-production.up.railway.app/psicologos/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            msg.innerText = data.error || "Erro no login";
            return;
        }

        // salva sessão
        localStorage.setItem("psicologo", JSON.stringify(data.psicologo));

        msg.style.color = "green";
        msg.innerText = "Login realizado!";

        // redireciona
        setTimeout(() => {
            window.location.href = "../dashboard.html";
        }, 800);

    } catch (err) {
        console.error(err);
        msg.innerText = "Erro ao conectar com servidor";
    }
}

let senhaVisivel = false;

function toggleSenha() {
    const senha = document.getElementById("senha");
    const eyeSlash = document.getElementById("eyeSlash");

    senhaVisivel = !senhaVisivel;

    if (senhaVisivel) {
        senha.type = "text";
        eyeSlash.style.display = "none";
    } else {
        senha.type = "password";
        eyeSlash.style.display = "block";
    }
}