let ultimaAsignacion = [];
let ultimaMatrizCostos = [];
let tieneFicticio = false;
let tipoFicticio = "";
let diferenciaFicticia = 0;

function generarInputs() {

    const ofertas = parseInt(document.getElementById("numOfertas").value);
    const demandas = parseInt(document.getElementById("numDemandas").value);

    if (isNaN(ofertas) || isNaN(demandas) || ofertas <= 0 || demandas <= 0) {
        alert("Ingresá cantidades válidas.");
        return;
    }

    let html = `<div class="card"><h3>Costos</h3><table>`;

    for (let i = 0; i < ofertas; i++) {
        html += "<tr>";
        for (let j = 0; j < demandas; j++) {
            html += `<td><input type="number" min="0" id="costo-${i}-${j}"></td>`;
        }
        html += "</tr>";
    }

    html += `</table><div class="oferta-demanda-container"><div><h3>Ofertas</h3>`;

    for (let i = 0; i < ofertas; i++) {
        html += `<input type="number" min="0" id="oferta-${i}"><br>`;
    }

    html += `</div><div><h3>Demandas</h3>`;

    for (let j = 0; j < demandas; j++) {
        html += `<input type="number" min="0" id="demanda-${j}"><br>`;
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
    document.getElementById("ficticioContainer").innerHTML = "";
    document.getElementById("btnCalcularCosto").style.display = "none";

    resultado.innerHTML = "";
    resultado1.innerHTML = "";
    resultado2.innerHTML = "";
}

function calcular() {

    const ofertas = parseInt(numOfertas.value);
    const demandas = parseInt(numDemandas.value);

    let totalO = 0;
    let totalD = 0;

    for (let i = 0; i < ofertas; i++) {
        let v = parseFloat(document.getElementById(`oferta-${i}`).value);
        if (isNaN(v)) { alert("Completá todas las ofertas."); return false; }
        if (v < 0)    { alert("Las ofertas no pueden ser negativas."); return false; }
        totalO += v;
    }

    for (let j = 0; j < demandas; j++) {
        let v = parseFloat(document.getElementById(`demanda-${j}`).value);
        if (isNaN(v)) { alert("Completá todas las demandas."); return false; }
        if (v < 0)    { alert("Las demandas no pueden ser negativas."); return false; }
        totalD += v;
    }

    resultado1.innerText = "Oferta Total: " + totalO;
    resultado2.innerText = "Demanda Total: " + totalD;

    const contenedor = document.getElementById("ficticioContainer");
    contenedor.innerHTML = "";

    // Si ya tiene ficticio agregado, el problema ya está balanceado
    if (tieneFicticio) {
        resultado.innerHTML = `✅ Problema balanceado correctamente.<br><br>
            Se agregó un ${tipoFicticio} ficticio de ${diferenciaFicticia} unidades.`;
        document.getElementById("btnResolver").style.display = "inline-block";
        return true;
    }

    if (totalO === totalD) {
        resultado.innerText = "✅ Problema balanceado";
        document.getElementById("btnResolver").style.display = "inline-block";
        return true;
    }

    const diferencia = Math.abs(totalO - totalD);

    if (totalO > totalD) {
        resultado.innerHTML = `⚠ Problema no balanceado<br><br>
            La oferta supera a la demanda en ${diferencia} unidades.`;
        contenedor.innerHTML = `
            <button class="btn" onclick="agregarFicticio('destino', ${diferencia})">
                Agregar Destino Ficticio
            </button>`;
    } else {
        resultado.innerHTML = `⚠ Problema no balanceado<br><br>
            La demanda supera a la oferta en ${diferencia} unidades.`;
        contenedor.innerHTML = `
            <button class="btn" onclick="agregarFicticio('origen', ${diferencia})">
                Agregar Origen Ficticio
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

    document.getElementById("ficticioContainer").innerHTML = "";
    document.getElementById("btnResolver").style.display = "inline-block";
}

function resolverTabla() {

    if (!calcular()) return;

    let f = parseInt(numOfertas.value);
    let c = parseInt(numDemandas.value);

    let oferta = [];
    let demanda = [];
    let costos = [];

    for (let i = 0; i < f; i++) {
        oferta.push(parseFloat(document.getElementById(`oferta-${i}`).value));
    }

    for (let j = 0; j < c; j++) {
        demanda.push(parseFloat(document.getElementById(`demanda-${j}`).value));
    }

    for (let i = 0; i < f; i++) {
        costos[i] = [];
        for (let j = 0; j < c; j++) {
            let valor = parseFloat(document.getElementById(`costo-${i}-${j}`).value);
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

    // Algoritmo Esquina Noroeste
    let asignacion = Array.from({ length: f }, () => Array(c).fill(0));
    let i = 0, j = 0;

    while (i < f && j < c) {
        let cantidad = Math.min(oferta[i], demanda[j]);
        asignacion[i][j] = cantidad;
        oferta[i] -= cantidad;
        demanda[j] -= cantidad;
        if (oferta[i] === 0) i++;
        else j++;
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
            let clases = asignacion[i][j] ? "usada" : "";
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
        <h3>Costo Total = ${total}</h3>
    `;
}

function reiniciar() {
    if (confirm("¿Desea reiniciar el sistema? Se perderán todos los datos ingresados.")) {
        location.reload();
    }
}
