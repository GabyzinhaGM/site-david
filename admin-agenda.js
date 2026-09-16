const token = localStorage.getItem("supabase_access_token");

if (!token) {
  window.location.href = "login.html";
}

const SUPABASE_URL = "https://msgvcxaerouwkswhsudv.supabase.co";

const SUPABASE_KEY = "sb_publishable_CfeoEMG2xpSDxnHxgxm0tQ_-dEJJZhf";

const form = document.getElementById("form-agenda");
const mensagem = document.getElementById("mensagem");
const listaShows = document.getElementById("lista-shows");

const tituloFormulario =
  document.getElementById("titulo-formulario");

const botaoSalvar =
  document.getElementById("botao-salvar");

const botaoCancelar =
  document.getElementById("botao-cancelar");

const botaoSair =
  document.getElementById("botao-sair");

let idEditando = null;


// ==============================
// SAIR
// ==============================

botaoSair.addEventListener("click", function () {

  localStorage.removeItem(
    "supabase_access_token"
  );

  localStorage.removeItem(
    "supabase_refresh_token"
  );

  window.location.href = "login.html";

});


// ==============================
// CARREGAR SHOWS
// ==============================

async function carregarShows() {

  listaShows.innerHTML =
    "<p>Carregando shows...</p>";

  try {

    const resposta = await fetch(
      `${SUPABASE_URL}/rest/v1/agenda?select=*&order=data.asc,horario.asc`,
      {
        method: "GET",

        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${token}`
        }
      }
    );

    if (!resposta.ok) {
      throw new Error(
        "Erro ao carregar os shows."
      );
    }

    const eventos = await resposta.json();

    listaShows.innerHTML = "";

    if (eventos.length === 0) {

      listaShows.innerHTML =
        "<p>Nenhum show cadastrado.</p>";

      return;
    }

    eventos.forEach(function (evento) {

      const item =
        document.createElement("article");

      item.className = "show-admin";

      const data =
        new Date(
          evento.data + "T00:00:00"
        );

      const dataFormatada =
        data.toLocaleDateString("pt-BR");

      let horario = "";

      if (evento.horario) {

        horario =
          evento.horario.substring(0, 5);

      }

      let conteudo = `
        <p>
          <strong>${dataFormatada}</strong>
        </p>

        <p>
          Local: ${evento.local}
        </p>

        <p>
          Cidade: ${evento.cidade}/${evento.estado}
        </p>
      `;


      if (horario) {

        conteudo += `
          <p>
            Horário: ${horario}
          </p>
        `;

      }


      if (evento.tipo_evento) {

        conteudo += `
          <p>
            Tipo: ${evento.tipo_evento}
          </p>
        `;

      }


      if (evento.privado) {

        conteudo += `
          <p>
            Evento privado
          </p>
        `;

      }


      if (evento.link) {

        conteudo += `
          <p>
            <a
              href="${evento.link}"
              target="_blank"
              rel="noopener"
            >
              Link do evento
            </a>
          </p>
        `;

      }


      conteudo += `
        <div class="acoes">

          <button
            type="button"
            class="btn-editar"
            data-id="${evento.id}"
          >
            Editar
          </button>

          <button
            type="button"
            class="btn-excluir"
            data-id="${evento.id}"
          >
            Excluir
          </button>

        </div>
      `;


      item.innerHTML = conteudo;

      listaShows.appendChild(item);

    });


    adicionarEventosDosBotoes();


  } catch (erro) {

    console.error(erro);

    listaShows.innerHTML =
      "<p>Erro ao carregar os shows.</p>";

  }

}


// ==============================
// CADASTRAR OU EDITAR
// ==============================

form.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();

    mensagem.textContent =
      idEditando
        ? "Atualizando show..."
        : "Cadastrando show...";


    const dados = {

      data:
        document.getElementById("data").value,

      horario:
        document.getElementById("horario").value || null,

      local:
        document.getElementById("local").value,

      cidade:
        document.getElementById("cidade").value,

      estado:
        document.getElementById("estado").value,

      tipo_evento:
        document.getElementById("tipo_evento").value || null,

      privado:
        document.getElementById("privado").checked,

      link:
        document.getElementById("link").value || null

    };


    try {

      let resposta;


      if (idEditando) {

        resposta = await fetch(
          `${SUPABASE_URL}/rest/v1/agenda?id=eq.${idEditando}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type": "application/json",
              "apikey": SUPABASE_KEY,
              "Authorization": `Bearer ${token}`,
              "Prefer": "return=minimal"
            },

            body: JSON.stringify(dados)
          }
        );


      } else {

        resposta = await fetch(
          `${SUPABASE_URL}/rest/v1/agenda`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              "apikey": SUPABASE_KEY,
              "Authorization": `Bearer ${token}`,
              "Prefer": "return=minimal"
            },

            body: JSON.stringify(dados)
          }
        );

      }


      if (!resposta.ok) {

        const erro =
          await resposta.text();

        console.error(
          "Erro do Supabase:",
          erro
        );

        throw new Error(
          "Não foi possível salvar o show."
        );

      }


      mensagem.textContent =
        idEditando
          ? "Show atualizado com sucesso!"
          : "Show cadastrado com sucesso!";


      form.reset();

      idEditando = null;


      tituloFormulario.textContent =
        "Cadastrar novo show";


      botaoSalvar.textContent =
        "Cadastrar show";


      botaoCancelar.hidden = true;


      carregarShows();


    } catch (erro) {

      console.error(erro);

      mensagem.textContent =
        "Erro ao salvar o show. Verifique os dados e tente novamente.";

    }

  }
);


// ==============================
// EDITAR SHOW
// ==============================

async function editarShow(id) {

  try {

    const resposta = await fetch(
      `${SUPABASE_URL}/rest/v1/agenda?id=eq.${id}&select=*`,
      {
        method: "GET",

        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${token}`
        }
      }
    );


    if (!resposta.ok) {

      throw new Error(
        "Erro ao buscar show."
      );

    }


    const eventos =
      await resposta.json();


    if (eventos.length === 0) {
      return;
    }


    const evento = eventos[0];


    document.getElementById("data").value =
      evento.data || "";


    document.getElementById("horario").value =
      evento.horario
        ? evento.horario.substring(0, 5)
        : "";


    document.getElementById("local").value =
      evento.local || "";


    document.getElementById("cidade").value =
      evento.cidade || "";


    document.getElementById("estado").value =
      evento.estado || "";


    document.getElementById("tipo_evento").value =
      evento.tipo_evento || "";


    document.getElementById("privado").checked =
      evento.privado || false;


    document.getElementById("link").value =
      evento.link || "";


    idEditando = id;


    tituloFormulario.textContent =
      "Editar show";


    botaoSalvar.textContent =
      "Salvar alterações";


    botaoCancelar.hidden = false;


    mensagem.textContent =
      "Editando show.";


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });


  } catch (erro) {

    console.error(erro);

    mensagem.textContent =
      "Erro ao carregar o show.";

  }

}


// ==============================
// EXCLUIR SHOW
// ==============================

async function excluirShow(id) {

  const confirmar =
    confirm(
      "Tem certeza que deseja excluir este show?"
    );


  if (!confirmar) {
    return;
  }


  try {

    const resposta = await fetch(
      `${SUPABASE_URL}/rest/v1/agenda?id=eq.${id}`,
      {
        method: "DELETE",

        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${token}`,
          "Prefer": "return=minimal"
        }
      }
    );


    if (!resposta.ok) {

      const erro =
        await resposta.text();

      console.error(
        "Erro do Supabase:",
        erro
      );

      throw new Error(
        "Não foi possível excluir o show."
      );

    }


    mensagem.textContent =
      "Show excluído com sucesso!";


    carregarShows();


  } catch (erro) {

    console.error(erro);

    mensagem.textContent =
      "Erro ao excluir o show.";

  }

}


// ==============================
// BOTÕES EDITAR E EXCLUIR
// ==============================

function adicionarEventosDosBotoes() {

  const botoesEditar =
    document.querySelectorAll(
      ".btn-editar"
    );


  botoesEditar.forEach(function (botao) {

    botao.addEventListener(
      "click",
      function () {

        const id =
          botao.getAttribute("data-id");

        editarShow(id);

      }
    );

  });


  const botoesExcluir =
    document.querySelectorAll(
      ".btn-excluir"
    );


  botoesExcluir.forEach(function (botao) {

    botao.addEventListener(
      "click",
      function () {

        const id =
          botao.getAttribute("data-id");

        excluirShow(id);

      }
    );

  });

}


// ==============================
// CANCELAR EDIÇÃO
// ==============================

botaoCancelar.addEventListener(
  "click",
  function () {

    form.reset();

    idEditando = null;


    tituloFormulario.textContent =
      "Cadastrar novo show";


    botaoSalvar.textContent =
      "Cadastrar show";


    botaoCancelar.hidden = true;


    mensagem.textContent =
      "Edição cancelada.";

  }
);


// ==============================
// INICIAR
// ==============================

carregarShows();