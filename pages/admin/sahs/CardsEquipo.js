import CardsService from "./cards.service.js"
import CardRequest from "./card.request.js"

const CardsService = new CardsService();

var teamId = null;
var cardIdEditando = null;

document.getElementById("btn-cargar").addEventListener("click, pedirCards");
document.getElementById("btn-nueva-card").addEventListener("click", abrirFormNuevo);
document.getElementById("btn-guardar-card").addEventListener("click", enviarFormulario);
document.getElementById("btn-cancelar-card").addEventListener("click", cerrarForm);

async function pedirCards() {
  teamId = parseInt(document.getElementById("inp-team-id").value);

  if(!teamId || teamId <= 0) {
    document.getElementById("msg-cards").textContent = "Ingresa un ID de Equipo Valido.";
    return;
  }

  try{
    const cards = await cardsService.getByTeam(teamId);
    mostrarCards(cards);
  } catch (e){
    document.getElementById("msg-cards").textContent = "Error" + e.message;
  }
}

function mostrarCards(cards) {
  const contenedor = document.getElementById("contenedor-cards");
  document.getElementById("msg-cards").textContent = "";

  if (!cards || cards.length === 0) {
    contenedor.innerHTML = "<li>No Hay Cards en este Equipo</li>";
    return;
  }

  contenedor.innerHTML = cards.map(c => `
    <li>
      <strong>${c.title || "Sin título"}</strong> - ${c.description || "Sin descripción"} [Orden: ${c.order}]
      <button onclick="abrirFormEditar(${c.id}, 
      '${(c.title || "").replace(/'/g, "")}', 
      '${(c.description || "").replace(/'/g, "")}', 
      ${c.order}, '${c.eTag || ""}')">Editar</button>
      <button onclick="borrarCard(${c.id})">Eliminar</button>
    </li>`).join("");
}

function abrirFormNuevo() {
  if (!teamId) {
    document.getElementById("msg-cards").textContent = "Primero Carga las Cards de Un equipo";
    return;
  }
  cardIdEditando = null;
  document.getElementById("form-titulo").textContent = "Nueva Card";
  document.getElementById("form-card-id").value = "";
  document.getElementById("form-etag").value = "";
  document.getElementById("form-titulo-card").value = "";
  document.getElementById("form-desc").value = "";
  document.getElementById("form-orden").value = "0";
  document.getElementById("msg-form-card").textContent = "";
  document.getElementById("formulario-card").style.display = "block";
}

function abrirFormEditar(id, titulo, desc, orden, etag) {
  cardIdEditando = id;
  document.getElementById("form-titulo").textContent = "Editar Card";
  document.getElementById("form-card-id").value = id ;
  document.getElementById("form-etag").value = etag ;
  document.getElementById("form-titulo-card").value =  titulo;
  document.getElementById("form-desc").value = desc;
  document.getElementById("form-orden").value = orden;
  document.getElementById("msg-form-card").textContent = "";
  document.getElementById("formulario-card").style.display = "block";
}

function cerrarForm() {
  document.getElementById("formulario-card").style.display = "none";
  cardIdEditando = null;
}

async function enviarFormulario() {
  const titulo = document.getElementById("form-titulo-card").value.trim();
  const desc = document.getElementById("form-desc").value.trim();
  const orden = parseInt(document.getElementById("form-orden").value) || 0;

  if (!titulo) {
    document.getElementById("msg-form-card").textContent = "El titulo es obligatorio.";
    return;
  }

  const request = new CardRequest(titulo, desc, orden);

  try {
    if (cardIdEditando === null) {
      await cardsService.create(teamId, request);
    } else {
      const etag = document.getElementById("form-etag").value;
      await cardsService.update(teamId, cardIdEditando, request, etag);
    }
    document.getElementById("msg-form-card").textContent = "Guardado Correctamente.";
    cerrarForm();
    pedirCards();
  } catch (e) {
    document.getElementById("msg-form-card").textContent = "Error" + e.message;
  }
}

async function borrarCard(id) {
  if (!confirm("Eliminar esta card?")) return;

  try {
    await cardsService.remove(teamId, id);
    document.getElementById("msg-cards").textContent = "Card Eliminada.";
    pedirCards();
  } catch (e){
    document.getElementById("msg-cards").textContent = "Error" + e.message;
  }
}

window.abrirFormEditar = abrirFormEditar;
window.borrarCard = borrarCard;