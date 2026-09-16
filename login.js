const SUPABASE_URL = "https://msgvcxaerouwkswhsudv.supabase.co";

const SUPABASE_KEY = "sb_publishable_CfeoEMG2xpSDxnHxgxm0tQ_-dEJJZhf";

const formLogin = document.getElementById("form-login");
const mensagem = document.getElementById("mensagem");

formLogin.addEventListener("submit", async function (event) {

  event.preventDefault();

  mensagem.textContent = "Entrando...";

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {

    const resposta = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY
        },

        body: JSON.stringify({
          email: email,
          password: senha
        })
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {

      console.error("Erro de login:", dados);

      throw new Error(
        "E-mail ou senha incorretos."
      );
    }

    // Guarda a sess o no navegador
    localStorage.setItem(
      "supabase_access_token",
      dados.access_token
    );

    localStorage.setItem(
      "supabase_refresh_token",
      dados.refresh_token
    );

    mensagem.textContent =
      "Login realizado com sucesso!";

    // Vai para a administra  o
    window.location.href = "admin-agenda.html";

  } catch (erro) {

    console.error(erro);

    mensagem.textContent =
      "N o foi poss vel entrar. Verifique o e-mail e a senha.";

  }

});
