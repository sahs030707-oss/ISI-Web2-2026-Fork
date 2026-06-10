//  CRUD de Cards por Equipo

//Simulo la api por que no la pude ejecutar jaja sorry soy el que descargo la API hasta ahora
var BASE = "https://localhost:7001/api";
var jwt = null;
var teamId = null;
var cardIdEditando = null;

// Conectar eventos al cargar la página
document.getElementById("btn-ingresar").addEventListener("click", hacerLogin);
document.getElementById("btn-cargar").addEventListener("click", pedirCards);
document.getElementById("btn-nueva-card").addEventListener("click", abrirFormNuevo);
document.getElementById("btn-guardar-card").addEventListener("click", enviarFormulario);
document.getElementById("btn-cancelar-card").addEventListener("click", cerrarForm);

// LOGIN
function hacerLogin() {
  var email = document.getElementById("inp-email").value.trim();
  var password = document.getElementById("inp-pass").value;

  fetch(BASE + "/authentication/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, password: password })
  })
  .then(function(r) {
    if (!r.ok) throw new Error("Login fallido");
    return r.json();
  })
  .then(function(respuesta) {
    jwt = respuesta.token || respuesta.accessToken || "";
    document.getElementById("lbl-sesion").textContent = "Conectado como: " + email;
    document.getElementById("panel-cards").style.display = "block";
  })
  .catch(function(e) {
    document.getElementById("lbl-sesion").textContent = "Error: " + e.message;
  });
}

// LISTAR CARDS
function pedirCards() {
  teamId = parseInt(document.getElementById("inp-team-id").value);

  if (!teamId || teamId <= 0) {
    document.getElementById("msg-cards").textContent = "Ingresá un ID de equipo válido.";
    return;
  }

  fetch(BASE + "/teams/" + teamId + "/cards", {
    headers: { "Authorization": "Bearer " + jwt }
  })
  .then(function(r) {
    if (!r.ok) throw new Error("Error al cargar cards (código " + r.status + ")");
    return r.json();
  })
  .then(function(cards) {
    mostrarCards(cards);
  })
  .catch(function(e) {
    document.getElementById("msg-cards").textContent = "Error: " + e.message;
  });
}

function mostrarCards(cards) {
  var contenedor = document.getElementById("contenedor-cards");
  document.getElementById("msg-cards").textContent = "";

  if (!cards || cards.length === 0) {
    contenedor.innerHTML = "<p>No hay cards en este equipo.</p>";
    return;
  }

  // Usamos una lista simple con los datos de cada card
  var html = "<ul>";
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    html += "<li>";
    html += "<strong>" + (c.title || "Sin título") + "</strong> - " + (c.description || "Sin descripción");
    html += " [Orden: " + c.order + "]";
    html += " <button onclick='abrirFormEditar(" + c.id + ", \"" + (c.title || "").replace(/"/g, "") + "\", \"" + (c.description || "").replace(/"/g, "") + "\", " + c.order + ", \"" + (c.eTag || "") + "\")'>Editar</button>";
    html += " <button onclick='borrarCard(" + c.id + ")'>Eliminar</button>";
    html += "</li>";
  }
  html += "</ul>";

  contenedor.innerHTML = html;
}

// FORMULARIO
function abrirFormNuevo() {
  if (!teamId) {
    document.getElementById("msg-cards").textContent = "Primero cargá las cards de un equipo.";
    return;
  }

  cardIdEditando = null;
  document.getElementById("form-titulo").textContent = "Nueva Card";
  document.getElementById("form-card-id").value = "";
  document.getElementById("form-etag").value = "";
  document.getElementById("form-titulo-card").value = "";
  document.getElementById("form-desc").value = "";
  document.getElementById("form-orden").value = 0;
  document.getElementById("msg-form-card").textContent = "";
  document.getElementById("formulario-card").style.display = "block";
}

function abrirFormEditar(id, titulo, desc, orden, etag) {
  cardIdEditando = id;
  document.getElementById("form-titulo").textContent = "Editar Card";
  document.getElementById("form-card-id").value = id;
  document.getElementById("form-etag").value = etag;
  document.getElementById("form-titulo-card").value = titulo;
  document.getElementById("form-desc").value = desc;
  document.getElementById("form-orden").value = orden;
  document.getElementById("msg-form-card").textContent = "";
  document.getElementById("formulario-card").style.display = "block";
}

function cerrarForm() {
  document.getElementById("formulario-card").style.display = "none";
  cardIdEditando = null;
}

// CREAR / ACTUALIZAR
function enviarFormulario() {
  var titulo = document.getElementById("form-titulo-card").value.trim();
  var desc = document.getElementById("form-desc").value.trim();
  var orden = parseInt(document.getElementById("form-orden").value) || 0;

  if (!titulo) {
    document.getElementById("msg-form-card").textContent = "El título es obligatorio.";
    return;
  }

  var datos = { title: titulo, description: desc, order: orden };

  if (cardIdEditando === null) {
    // CREAR - POST
    fetch(BASE + "/teams/" + teamId + "/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + jwt
      },
      body: JSON.stringify(datos)
    })
    .then(function(r) {
      if (!r.ok) throw new Error("Error al crear la card");
      return r.json();
    })
    .then(function() {
      document.getElementById("msg-form-card").textContent = "Card creada.";
      cerrarForm();
      pedirCards();
    })
    .catch(function(e) {
      document.getElementById("msg-form-card").textContent = "Error: " + e.message;
    });

  } else {
    // ACTUALIZAR - PATCH (requiere If-Match con el ETag)
    var etag = document.getElementById("form-etag").value;

    fetch(BASE + "/teams/" + teamId + "/cards/" + cardIdEditando, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + jwt,
        "If-Match": etag
      },
      body: JSON.stringify(datos)
    })
    .then(function(r) {
      if (r.status === 412) throw new Error("La card fue modificada por otro usuario. Recargá la lista.");
      if (!r.ok) throw new Error("Error al actualizar la card");
      return r.json();
    })
    .then(function() {
      document.getElementById("msg-form-card").textContent = "Card actualizada.";
      cerrarForm();
      pedirCards();
    })
    .catch(function(e) {
      document.getElementById("msg-form-card").textContent = "Error: " + e.message;
    });
  }
}

// ELIMINAR
function borrarCard(id) {
  if (!confirm("¿Eliminar esta card?")) return;

  fetch(BASE + "/teams/" + teamId + "/cards/" + id, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + jwt }
  })
  .then(function(r) {
    if (!r.ok) throw new Error("No se pudo eliminar");
    document.getElementById("msg-cards").textContent = "Card eliminada.";
    pedirCards();
  })
  .catch(function(e) {
    document.getElementById("msg-cards").textContent = "Error: " + e.message;
  });
}
