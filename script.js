// --- Clave Oficial de Respuestas ---
const respuestasCorrectas = {
    1:"B", 2:"D", 3:"A", 4:"D", 5:"B", 6:"B", 7:"D", 8:"B", 9:"B", 10:"C",
    11:"D", 12:"A", 13:"B", 14:"B", 15:"B", 16:"C", 17:"C", 18:"D", 19:"A", 20:"B",
    21:"B", 22:"B", 23:"D", 24:"D", 25:"B", 26:"C", 27:"D", 28:"C", 29:"C", 30:"D",
    31:"C", 32:"C", 33:"D", 34:"C", 35:"A", 36:"D", 37:"A", 38:"C", 39:"B", 40:"D",
    41:"C", 42:"B", 43:"C", 44:"C", 45:"D", 46:"C", 47:"A", 48:"C", 49:"C", 50:"D",
    51:"A", 52:"B", 53:"A", 54:"A", 55:"A", 56:"D", 57:"B", 58:"C", 59:"C", 60:"C",
    61:"B", 62:"C", 63:"B", 64:"C", 65:"B", 66:"A", 67:"B", 68:"A", 69:"D", 70:"B",
    71:"C", 72:"B", 73:"A", 74:"B", 75:"D", 76:"C", 77:"B", 78:"B", 79:"A", 80:"C",
    81:"D", 82:"A", 83:"B", 84:"A", 85:"A", 86:"C", 87:"B", 88:"C", 89:"B", 90:"A",
    91:"A", 92:"A", 93:"B", 94:"A", 95:"A", 96:"B", 97:"B", 98:"D", 99:"B", 100:"C",
    101:"C", 102:"C", 103:"D", 104:"B", 105:"D", 106:"B", 107:"A", 108:"D", 109:"A", 110:"D",
    111:"A", 112:"B", 113:"A", 114:"A", 115:"D", 116:"C", 117:"C", 118:"B", 119:"B", 120:"A"
};

// --- Configuración de Asignaturas ---
const asignaturas = [
    { nombre: "Física", inicio: 1, fin: 10 },
    { nombre: "Literatura", inicio: 11, fin: 20 },
    { nombre: "Química", inicio: 21, fin: 30 },
    { nombre: "Geografía", inicio: 31, fin: 40 },
    { nombre: "Matemáticas", inicio: 41, fin: 62 },
    { nombre: "Español", inicio: 63, fin: 80 },
    { nombre: "Biología", inicio: 81, fin: 90 },
    { font: "Historia Universal", nombre: "Historia Universal", inicio: 91, fin: 100 },
    { nombre: "Historia de México", inicio: 101, fin: 110 },
    { nombre: "Filosofía", inicio: 111, fin: 120 }
];

// --- Variables de Estado del Sistema ---
let tiempoRestante = 180 * 60; // 180 minutos en segundos
let intervaloCronometro = null;
let intervaloAutoGuardado = null;
let examenIniciado = false;
let examenFinalizado = false;

// --- Elementos del DOM ---
const loginContainer = document.getElementById("login-container");
const examContainer = document.getElementById("exam-container");
const resultsContainer = document.getElementById("results-container");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const questionsGrid = document.getElementById("questions-grid");
const timerDisplay = document.getElementById("timer");
const progressText = document.getElementById("progress-text");
const progressBarFill = document.getElementById("progress-bar-fill");
const btnFinish = document.getElementById("btn-finish");
const btnRestart = document.getElementById("btn-restart");

// --- Inicialización al Cargar la Página ---
document.addEventListener("DOMContentLoaded", () => {
    generarHojaRespuestas();
    verificarSesionExistente();
    
    // Eventos
    loginForm.addEventListener("submit", procesarLogin);
    btnFinish.addEventListener("click", clickFinalizarExamen);
    btnRestart.addEventListener("click", reiniciarSimulador);
    
    // Escuchar cambios en las respuestas para actualizar indicadores visuales
    questionsGrid.addEventListener("change", actualizarProgreso);
});

// --- Generar Formulario Dinámico de 120 Preguntas ---
function generarHojaRespuestas() {
    questionsGrid.innerHTML = "";
    for (let i = 1; i <= 120; i++) {
        const row = document.createElement("div");
        row.className = "question-row";
        row.id = `row-q-${i}`;
        
        row.innerHTML = `
            <span class="question-number">${i}.</span>
            <div class="options-group">
                <label class="option-label"><input type="radio" name="q${i}" value="A"> A</label>
                <label class="option-label"><input type="radio" name="q${i}" value="B"> B</label>
                <label class="option-label"><input type="radio" name="q${i}" value="C"> C</label>
                <label class="option-label"><input type="radio" name="q${i}" value="D"> D</label>
            </div>
        `;
        questionsGrid.appendChild(row);
    }
}

// --- Control de Acceso (Login) ---
function procesarLogin(e) {
    e.preventDefault();
    const usuarioInput = document.getElementById("email").value.trim();
    const passwordInput = document.getElementById("password").value;

    // Validación según requerimientos temporales
    if (usuarioInput === "admin" && passwordInput === "123") {
        loginError.classList.add("hidden");
        iniciarExamen();
    } else {
        loginError.classList.remove("hidden");
    }
}

// --- Flujo de Inicio del Examen ---
function iniciarExamen() {
    loginContainer.classList.add("hidden");
    examContainer.classList.remove("hidden");
    examenIniciado = true;
    
    // Recuperar datos si existen de una sesión previa activa
    cargarRespuestasGuardadas();
    
    // Configurar componentes en ejecución
    comenzarCronometro();
    activarDeteccionFraude();
    
    // Configurar temporizador de guardado automático (cada 10 segundos)
    intervaloAutoGuardado = setInterval(guardarProgresoEnStorage, 10000);
    actualizarProgreso();
}

// --- Gestión del Reloj Regresivo ---
function comenzarCronometro() {
    actualizarInterfazReloj();
    intervaloCronometro = setInterval(() => {
        tiempoRestante--;
        actualizarInterfazReloj();
        
        if (tiempoRestante <= 0) {
            clearInterval(intervaloCronometro);
            alert("El tiempo del examen ha expirado. Tus respuestas se calificarán de forma automática.");
            finalizarExamen(true);
        }
    }, 1000);
}

function actualizarInterfazReloj() {
    const horas = Math.floor(tiempoRestante / 3600);
    const minutos = Math.floor((tiempoRestante % 3600) / 60);
    const segundos = tiempoRestante % 60;
    
    const formatoHH = String(horas).padStart(2, "0");
    const formatoMM = String(minutos).padStart(2, "0");
    const formatoSS = String(segundos).padStart(2, "0");
    
    timerDisplay.textContent = `${formatoHH}:${formatoMM}:${formatoSS}`;
}

// --- Métodos de UX: Indicadores de Progreso ---
function actualizarProgreso() {
    let contestadas = 0;
    for (let i = 1; i <= 120; i++) {
        const seleccionada = document.querySelector(`input[name="q${i}"]:checked`);
        const fila = document.getElementById(`row-q-${i}`);
        
        if (seleccionada) {
            contestadas++;
            fila.classList.add("answered");
        } else {
            fila.classList.remove("answered");
        }
    }
    
    progressText.textContent = `Contestadas: ${contestadas} / 120`;
    const porcentaje = (contestadas / 120) * 100;
    progressBarFill.style.width = `${porcentaje}%`;
}

// --- Sistema de Seguridad (Anti-Fraude) ---
function activarDeteccionFraude() {
    // API de Visibilidad del documento
    document.addEventListener("visibilitychange", ejecutarAccionFraude);
    // Evento de desenfoque de la ventana del navegador
    window.addEventListener("blur", ejecutarAccionFraude);
}

function desactivarDeteccionFraude() {
    document.removeEventListener("visibilitychange", ejecutarAccionFraude);
    window.removeEventListener("blur", ejecutarAccionFraude);
}

function ejecutarAccionFraude() {
    // Evitar ejecuciones si el examen ya se cerró previamente
    if (examenFinalizado || !examenIniciado) return;
    
    desactivarDeteccionFraude();
    alert("Se detectó salida del examen. El examen será finalizado automáticamente.");
    finalizarExamen(true); // Forzar finalización sin guardar cambios extra
}

// --- Persistencia en LocalStorage (Guardado automático) ---
function guardarProgresoEnStorage() {
    if (!examenIniciado || examenFinalizado) return;
    
    const respuestasUsuario = {};
    for (let i = 1; i <= 120; i++) {
        const inputChecked = document.querySelector(`input[name="q${i}"]:checked`);
        if (inputChecked) {
            respuestasUsuario[i] = inputChecked.value;
        }
    }
    
    const snapshot = {
        respuestas: respuestasUsuario,
        tiempo: tiempoRestante,
        sesionActiva: true
    };
    
    localStorage.setItem("unam_simulador_state", JSON.stringify(snapshot));
}

function cargarRespuestasGuardadas() {
    const backupRaw = localStorage.getItem("unam_simulador_state");
    if (!backupRaw) return;
    
    try {
        const backup = JSON.parse(backupRaw);
        if (backup && backup.sesionActiva) {
            tiempoRestante = backup.tiempo;
            const respuestas = backup.respuestas || {};
            
            for (const preguntaId in respuestas) {
                const valor = respuestas[preguntaId];
                const inputElement = document.querySelector(`input[name="q${preguntaId}"][value="${valor}"]`);
                if (inputElement) {
                    inputElement.checked = true;
                }
            }
        }
    } catch (e) {
        console.error("Error al restaurar los datos del LocalStorage", e);
    }
}

function verificarSesionExistente() {
    const backupRaw = localStorage.getItem("unam_simulador_state");
    if (backupRaw) {
        const backup = JSON.parse(backupRaw);
        if (backup && backup.sesionActiva) {
            // Saltarse el login si el usuario refrescó la página en pleno examen
            iniciarExamen();
        }
    }
}

// --- Flujo de Cierre y Calificación del Examen ---
function clickFinalizarExamen() {
    if (confirm("¿Estás seguro de que deseas finalizar tu examen? Ya no podrás cambiar tus respuestas.")) {
        finalizarExamen(false);
    }
}

function finalizarExamen(forzadoPorFraude = false) {
    examenFinalizado = true;
    desactivarDeteccionFraude();
    
    clearInterval(intervaloCronometro);
    clearInterval(intervaloAutoGuardado);
    
    // Bloquear todas las opciones de la hoja de respuestas
    const inputs = questionsGrid.querySelectorAll("input");
    inputs.forEach(input => input.disabled = true);
    
    // Extraer respuestas finales del usuario
    const respuestasUsuarioFinales = {};
    for (let i = 1; i <= 120; i++) {
        const radio = document.querySelector(`input[name="q${i}"]:checked`);
        respuestasUsuarioFinales[i] = radio ? radio.value : "Sin responder";
    }
    
    // Limpiar estado en LocalStorage
    localStorage.removeItem("unam_simulador_state");
    
    // Cambiar de pantalla
    examContainer.classList.add("hidden");
    resultsContainer.classList.remove("hidden");
    
    // Procesar Datos Estadísticos
    calcularYMostrarResultados(respuestasUsuarioFinales);
}

function obtenerMateriaDePregunta(numero) {
    for (const materia of asignaturas) {
        if (numero >= materia.inicio && numero <= materia.fin) {
            return materia.nombre;
        }
    }
    return "Desconocida";
}

// --- Lógica del Motor de Calificación Automática ---
function calcularYMostrarResultados(respuestasUsuario) {
    let aciertosGlobales = 0;
    let erroresGlobales = 0;
    
    // Estructura para almacenar estadísticas por asignatura
    const estadisticasMaterias = {};
    asignaturas.forEach(m => {
        estadisticasMaterias[m.nombre] = { aciertos: 0, total: (m.fin - m.inicio) + 1 };
    });
    
    const detailedTableBody = document.getElementById("detailed-table").querySelector("tbody");
    detailedTableBody.innerHTML = "";
    
    // Evaluar las 120 preguntas
    for (let i = 1; i <= 120; i++) {
        const correcta = respuestasCorrectas[i];
        const usuario = respuestasUsuario[i];
        const materia = obtenerMateriaDePregunta(i);
        
        let resultadoTexto = "";
        let claseEstilo = "";
        
        if (usuario === "Sin responder") {
            resultadoTexto = "Sin responder";
            claseEstilo = "status-unanswered";
            erroresGlobales++;
        } else if (usuario === correcta) {
            resultadoTexto = "Correcta";
            claseEstilo = "status-correct";
            aciertosGlobales++;
            estadisticasMaterias[materia].aciertos++;
        } else {
            resultadoTexto = "Incorrecta";
            claseEstilo = "status-incorrect";
            erroresGlobales++;
        }
        
        // Agregar fila al reporte detallado
        const filaDetalle = document.createElement("tr");
        filaDetalle.innerHTML = `
            <td>${i}</td>
            <td>${materia}</td>
            <td><strong>${correcta}</strong></td>
            <td>${usuario === "Sin responder" ? "-" : usuario}</td>
            <td class="${claseEstilo}">${resultadoTexto}</td>
        `;
        detailedTableBody.appendChild(filaDetalle);
    }
    
    // Actualizar Resumen Global
    const totalPreguntas = 120;
    const porcentajeGlobalCalculado = ((aciertosGlobales / totalPreguntas) * 100).toFixed(1);
    
    document.getElementById("total-correct").textContent = aciertosGlobales;
    document.getElementById("total-incorrect").textContent = erroresGlobales;
    document.getElementById("global-percentage").textContent = `${porcentajeGlobalCalculado}%`;
    
    // Construir Tabla resumida por Asignatura
    const subjectTableBody = document.getElementById("subject-table").querySelector("tbody");
    subjectTableBody.innerHTML = "";
    
    asignaturas.forEach(materia => {
        const datos = estadisticasMaterias[materia.nombre];
        const porcentajeMateria = ((datos.aciertos / datos.total) * 100).toFixed(1);
        
        const filaMateria = document.createElement("tr");
        filaMateria.innerHTML = `
            <td><strong>${materia.nombre}</strong></td>
            <td>${datos.aciertos}</td>
            <td>${datos.total}</td>
            <td>${porcentajeMateria}%</td>
        `;
        subjectTableBody.appendChild(filaMateria);
    });
}

// --- Reinicio del Sistema ---
function reiniciarSimulador() {
    // Restablecer todas las variables globales de control
    tiempoRestante = 180 * 60;
    examenIniciado = false;
    examenFinalizado = false;
    
    localStorage.removeItem("unam_simulador_state");
    
    // Limpiar formulario y regenerar inputs limpios
    generarHojaRespuestas();
    
    // Alternar visibilidad de contenedores para volver al Login original
    resultsContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
    loginForm.reset();
}
