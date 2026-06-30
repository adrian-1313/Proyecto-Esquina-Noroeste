let ultimaAsignacion = [];
let ultimaMatrizCostos = [];
let tieneFicticio = false;
let tipoFicticio = "";
let diferenciaFicticia = 0;

function generarInputs() {

    const f = parseInt(document.getElementById("numOfertas").value);
    const c = parseInt(document.getElementById("numDemandas").value);

    if (isNaN(f) || isNaN(c) || f <= 0 || c <= 0) {
        alert("Ingresá cantidades válidas.");
        return;
    }

    let html = `<div class="card"><h3>Costos</h3><table>`;

    for (let i = 0; i < f; i++) {
        html += "<tr>";
        for (let j = 0; j < c; j++) {
            html += `<td><input type="number" min="0" id="c-${i}-${j}"></td>`;
        }
        html += "</tr>";
    }

    html += `</table><div class="oferta-demanda-container"><div><h3>Ofertas</h3>`;

    for (let i = 0; i < f; i++) {
        html += `<input type="number" min="0" id="o-${i}"><br>`;
    }

    html += `</div><div><h3>Demandas</h3>`;

    for (let j = 0; j < c; j++) {
        html += `<input type="number" min="0" id="d-${j}"><br>`;
    }

    html += `</div></div></div>`;

    document.getElementById("inputsContainer").innerHTML = html;

    // Reset estado
    tieneFicticio = false;
    tipoFicticio = "";
    diferenciaFicticia = 0;

    document.getElementById("btnResolver").style.display = "none";
    document.getElementById("tablaResultado").innerHTML = "";
    document.getElementById("solucionInicial").style.display = "none";
    document.getElementById("btnCalcularCosto").style.display = "none";
    document.getElementById("ficticioContainer").innerHTML = "";

    resultado.innerHTML = "";
    resultado1.innerHTML = "";
    resultado2.innerHTML = "";
}

function calcular() {

    const f = parseInt(numOfertas.value);
    const c = parseInt(numDemandas.value);

    let totalO = 0;
    let totalD = 0;

    for (let i = 0; i < f; i++) {
        let v = parseFloat(document.getElementById(`o-${i}`).value);
        if (isNaN(v)) { alert("Completá todas las ofertas."); return false; }
        if (v < 0)    { alert("Las ofertas no pueden ser negativas."); return false; }
        totalO += v;
    }

    for (let j = 0; j < c; j++) {
        let v = parseFloat(document.getElementById(`d-${j}`).value);
        if (isNaN(v)) { alert("Completá todas las demandas."); return false; }
        if (v < 0)    { alert("Las demandas no pueden ser negativas."); return false; }
        totalD += v;
    }

    resultado1.innerText = "Oferta Total: " + totalO;
    resultado2.innerText = "Demanda Total: " + totalD;

    ficticioContainer.innerHTML = "";

    // Si ya tiene ficticio agregado, el problema ya está balanceado
    if (tieneFicticio) {
        resultado.innerHTML = `✅ Problema balanceado correctamente.<br><br>
            Se agregó un ${tipoFicticio} ficticio de ${diferenciaFicticia} unidades.`;
        document.getElementById("btnResolver").style.display = "inline-block";
        return true;
    }

    if (totalO === totalD) {
        resultado.innerHTML = "✅ Problema balanceado.";
        document.getElementById("btnResolver").style.display = "inline-block";
        return true;
    }

    const diferencia = Math.abs(totalO - totalD);

    resultado.innerHTML = "⚠ Problema no balanceado.";

    if (totalO > totalD) {
        ficticioContainer.innerHTML = `
            <p><strong>La oferta supera a la demanda en ${diferencia} unidades.</strong></p>
            <button class="btn" onclick="agregarFicticio('destino', ${diferencia})">
                Agregar Demanda Ficticia
            </button>`;
    } else {
        ficticioContainer.innerHTML = `
            <p><strong>La demanda supera a la oferta en ${diferencia} unidades.</strong></p>
            <button class="btn" onclick="agregarFicticio('origen', ${diferencia})">
                Agregar Oferta Ficticia
            </button>`;
    }

    document.getElementById("btnResolver").style.display = "none";
    return false;
}

function agregarFicticio(tipo, diferencia) {

    tieneFicticio = true;
    tipoFicticio = tipo;
    diferenciaFicticia = diferencia;

    resultado.innerHTML = `✅ Problema balanceado correctamente.<br><br>
        Se agregó un ${tipo} ficticio de ${diferencia} unidades.`;

    ficticioContainer.innerHTML = "";
    document.getElementById("btnResolver").style.display = "inline-block";
}

function resolver() {

    if (!calcular()) return;

    let f = parseInt(numOfertas.value);
    let c = parseInt(numDemandas.value);

    let oferta = [];
    let demanda = [];
    let costos = [];

    for (let i = 0; i < f; i++) {
        oferta.push(parseFloat(document.getElementById(`o-${i}`).value));
    }

    for (let j = 0; j < c; j++) {
        demanda.push(parseFloat(document.getElementById(`d-${j}`).value));
    }

    for (let i = 0; i < f; i++) {
        costos[i] = [];
        for (let j = 0; j < c; j++) {
            let valor = parseFloat(document.getElementById(`c-${i}-${j}`).value);
            if (isNaN(valor)) return alert("Completá todos los costos.");
            if (valor < 0)   return alert("Los costos no pueden ser negativos.");
            costos[i][j] = valor;
        }
    }

    if (tieneFicticio) {
        if (tipoFicticio === "destino") {
            for (let i = 0; i < f; i++) costos[i].push(0);
            demanda.push(diferenciaFicticia);
            c++;
        } else {
            costos.push(Array(c).fill(0));
            oferta.push(diferenciaFicticia);
            f++;
        }
    }

    // Algoritmo Menor Costo
    let asignacion = Array.from({ length: f }, () => Array(c).fill(0));

    while (true) {
        let minimo = Infinity;
        let filaMin = -1;
        let colMin = -1;

        for (let i = 0; i < f; i++) {
            for (let j = 0; j < c; j++) {
                if (oferta[i] > 0 && demanda[j] > 0 && costos[i][j] < minimo) {
                    minimo = costos[i][j];
                    filaMin = i;
                    colMin = j;
                }
            }
        }

        if (filaMin === -1) break;

        let cantidad = Math.min(oferta[filaMin], demanda[colMin]);
        asignacion[filaMin][colMin] = cantidad;
        oferta[filaMin] -= cantidad;
        demanda[colMin] -= cantidad;
    }

    ultimaAsignacion = asignacion;
    ultimaMatrizCostos = costos;

    mostrarTabla(asignacion, costos);

    // Mostrar botón de costo total recién ahora que hay tabla
    document.getElementById("btnCalcularCosto").style.display = "inline-block";
}

function mostrarTabla(asignacion, costos) {

    const f = asignacion.length;
    const c = asignacion[0].length;

    let html = "<h3>Tabla Resuelta</h3><table><tr><th></th>";

    for (let j = 0; j < c; j++) {
        let esFicticia = tieneFicticio && tipoFicticio === "destino" && j === c - 1;
        html += esFicticia
            ? `<th class="ficticia">Demanda Ficticia</th>`
            : `<th>D${j + 1}</th>`;
    }
    html += "<th>Oferta</th></tr>";

    for (let i = 0; i < f; i++) {
        let esFilaFicticia = tieneFicticio && tipoFicticio === "origen" && i === f - 1;
        html += esFilaFicticia
            ? `<tr><th class="ficticia">Oferta Ficticia</th>`
            : `<tr><th>O${i + 1}</th>`;

        for (let j = 0; j < c; j++) {
            let clases = asignacion[i][j] > 0 ? "usada" : "";
            let esColFicticia = tieneFicticio && tipoFicticio === "destino" && j === c - 1;
            if (esFilaFicticia || esColFicticia) clases += " ficticia";

            html += `<td class="${clases.trim()}">${asignacion[i][j]} | ${costos[i][j]}</td>`;
        }

        html += `<td>${asignacion[i].reduce((a, b) => a + b, 0)}</td></tr>`;
    }

    html += "<tr><th>Demanda</th>";
    for (let j = 0; j < c; j++) {
        let suma = 0;
        for (let i = 0; i < f; i++) suma += asignacion[i][j];
        let esFicticia = tieneFicticio && tipoFicticio === "destino" && j === c - 1;
        html += `<td class="${esFicticia ? 'ficticia' : ''}">${suma}</td>`;
    }
    html += "<td></td></tr></table>";

    document.getElementById("tablaResultado").innerHTML = html;
}

function calcularCostoTotal() {

    let total = 0;
    let expresion = [];

    for (let i = 0; i < ultimaAsignacion.length; i++) {
        for (let j = 0; j < ultimaAsignacion[i].length; j++) {
            if (ultimaAsignacion[i][j] > 0) {
                expresion.push(`(${ultimaAsignacion[i][j]} × ${ultimaMatrizCostos[i][j]})`);
                total += ultimaAsignacion[i][j] * ultimaMatrizCostos[i][j];
            }
        }
    }

    const card = document.getElementById("solucionInicial");
    card.style.display = "block";
    card.innerHTML = `
        <h3>Solución Inicial</h3>
        <p>${expresion.join(" + ")}</p>
        <h2>Costo Total = ${total}</h2>
    `;
}

function reiniciar() {
    if (confirm("¿Desea reiniciar el sistema?")) {
        location.reload();
    }
}

function volverInicio() {
    window.location.href = "index.html";
}
