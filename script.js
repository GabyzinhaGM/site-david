//
// DAVID MEIRELES - SCRIPT JS
//

// ===============================
// 1. WHATSAPP DINÂMICO
// ===============================

function enviarWhatsApp() {
  const numero = "5527997268001";

  const mensagem =
    "Olá! Vim pelo site do David Meireles. Gostaria de mais informações sobre shows e produção musical.";

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
}

// ===============================
// 2. ANIMAÇÃO SIMPLES AO ROLAR
// ===============================

const elementos = document.querySelectorAll("section");

function mostrarAoScroll() {
  elementos.forEach((el) => {
    const topo = el.getBoundingClientRect().top;
    const tela = window.innerHeight;

    if (topo < tela - 100) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
      el.style.transition = "0.6s ease";
    }
  });
}

window.addEventListener("scroll", mostrarAoScroll);