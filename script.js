// ===========================================
// POKEDEX SPA
// API: https://pokeapi.co
// ===========================================

// ==============================
// URL BASE
// ==============================

const URL = "https://pokeapi.co/api/v2/pokemon";

// Aqui busco las evoluciones de los Pokemon
const URL_ESPECIES = "https://pokeapi.co/api/v2/pokemon-species";

// ==============================
// VARIABLES
// ==============================

let offset = 0;
const limite = 20;
// Aqui guardo mis Pokemon favoritos
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

// ==============================
// ELEMENTOS DEL DOM
// ==============================

const pokemonContainer = document.getElementById("pokemonContainer");
const detailContainer = document.getElementById("detailContainer");

const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const pokemonCounter = document.getElementById("pokemonCounter");

// ==============================
// LOADING
// ==============================

function mostrarLoading() {
    loading.classList.remove("hidden");
}

function ocultarLoading() {
    loading.classList.add("hidden");
}

// ==============================
// ERROR
// ==============================

function mostrarError(texto = "Pokémon no encontrado.") {

    errorMessage.textContent = texto;

    errorMessage.classList.remove("hidden");

    setTimeout(() => {

        errorMessage.classList.add("hidden");

    }, 2500);

}

// ==============================
// OBTENER LISTA
// ==============================

async function cargarPokemon() {

    mostrarLoading();

    pokemonContainer.innerHTML = "";

    try {

        const respuesta = await fetch(
            `${URL}?offset=${offset}&limit=${limite}`
        );

        const datos = await respuesta.json();

        pokemonCounter.textContent =
            `${datos.results.length} Pokémon`;

        for (const pokemon of datos.results) {

            const respuestaPokemon = await fetch(pokemon.url);

            const info = await respuestaPokemon.json();

            crearCard(info);

        }

    } catch (error) {

        mostrarError("Error cargando la Pokédex");

    }

    ocultarLoading();

}

// ==============================
// TARJETAS
// ==============================

function crearCard(pokemon) {

    const card = document.createElement("article");

    card.classList.add("card");

    // Mis cartas empiezan tapadas
    card.classList.add("girada");

    card.innerHTML = `

    <div class="card-inner">
    <div class="card-front">

        <img src="${pokemon.sprites.other["official-artwork"].front_default}"
             alt="${pokemon.name}">

        <div class="card-body">

            <p class="id">

                #${pokemon.id}

            </p>

            <h3>

                ${capitalizar(pokemon.name)}

            </h3>

            <span class="tipo ${pokemon.types[0].type.name}">

                ${capitalizar(pokemon.types[0].type.name)}

            </span>

            <button>

                Ver Información

            </button>

            <!-- Esta estrella es para mis Pokemon favoritos -->
            <button class="boton-favorito">
            ⭐ Favorito
            </button>

        </div>

            </div>

                <div class="card-back">

                   <span class="numero-carta">#${pokemon.id}</span>

                    <img src="img/reverso-pokemon.jpg"
                
                    alt="Reverso de carta Pokémon">
            
                    </div>

        </div>

    `;

    card.querySelector("button")
    .addEventListener("click", (e) => {
        e.stopPropagation();
        mostrarDetalle(pokemon);
    });

            // Cuando toco una carta, se voltea
            card.addEventListener("click", () => {
            card.classList.toggle("girada");
        });

            // Guardo o quito un Pokemon favorito
        const botonFavorito = card.querySelector(".boton-favorito");

        if (favoritos.includes(pokemon.id)) {
          botonFavorito.textContent = "⭐ Guardado";
    }

        botonFavorito.addEventListener("click", (e) => {
            e.stopPropagation();

        if (favoritos.includes(pokemon.id)) {
        favoritos = favoritos.filter(id => id !== pokemon.id);

        botonFavorito.textContent = "☆ Favorito";
         } else {
        favoritos.push(pokemon.id);
        botonFavorito.textContent = "⭐ Guardado";
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
});



    pokemonContainer.appendChild(card);

}


// Aqui busco la familia del Pokemon
async function buscarEvolucion(pokemon) {

    const respuesta = await fetch(
        `${URL_ESPECIES}/${pokemon.id}`
    );

    const especie = await respuesta.json();

    const respuestaEvolucion = await fetch(
        especie.evolution_chain.url
    );

    const evolucion = await respuestaEvolucion.json();

    return evolucion.chain;
}


// ==============================
// DETALLE
// ==============================

async function mostrarDetalle(pokemon) {

    // Busco las evoluciones de mi Pokemon
    const familia = await buscarEvolucion(pokemon);

    // Aqui guardo los nombres de las evoluciones
    let evoluciones = [];

    function verEvoluciones(etapa) {
    evoluciones.push({
    nombre: etapa.species.name,
    numero: etapa.species.url.split("/").filter(Boolean).pop()
    });

    etapa.evolves_to.forEach(siguiente => {
        verEvoluciones(siguiente);
    });
}

verEvoluciones(familia);


// Miro en que etapa esta mi Pokemon
let etapaPokemon = "Sin evolución";

if (evoluciones.length > 1) {
    const lugar = evoluciones.findIndex(e => e.nombre === pokemon.name);

    if (lugar === 0) {
        etapaPokemon = "Inicial";
    } else if (lugar === evoluciones.length - 1) {
        etapaPokemon = "Final";
    } else {
        etapaPokemon = "Intermedia";
    }
}

    let estadisticas = "";

    pokemon.stats.forEach(stat => {

        estadisticas += `

        <div class="stat">

            <div class="stat-header">

                <span>

                    ${capitalizar(stat.stat.name)}

                </span>

                <span>

                    ${stat.base_stat}

                </span>

            </div>

            <div class="progress">

                <span style="width:${Math.min(stat.base_stat,100)}%"></span>

            </div>

        </div>

        `;

    });

    let tipos = "";

    pokemon.types.forEach(tipo => {

        tipos += `
            <span class="tipo ${tipo.type.name}">
                ${capitalizar(tipo.type.name)}
            </span>
        `;

    });

    let habilidades = "";

    pokemon.abilities.forEach(habilidad => {

        habilidades += `
            <li>${capitalizar(habilidad.ability.name)}</li>
        `;

    });

    detailContainer.innerHTML = `

        <img
            src="${pokemon.sprites.other["official-artwork"].front_default}"
            alt="${pokemon.name}">

        <h2>

            ${capitalizar(pokemon.name)}

        </h2>

        <h3>

            #${pokemon.id}

        </h3>

        <div>

            ${tipos}

        </div>

        <p>

            <strong>Altura:</strong>
            ${pokemon.height / 10} m

        </p>

        <p>

            <strong>Peso:</strong>
            ${pokemon.weight / 10} kg

        </p>

        <h3>

            Habilidades

        </h3>

        <ul>

            ${habilidades}

        </ul>

        <div class="stats">

            ${estadisticas}

        </div>

        <h3>Evoluciones</h3>

        <p><strong>Mi etapa:</strong> ${etapaPokemon}</p>

        <div class="evoluciones">
    ${evoluciones.map(e => `
        <div class="${e.nombre === pokemon.name ? 'evolucion-actual' : ''}">
            <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${e.numero}.png"
                alt="${e.nombre}">

            <p>#${e.numero}</p>
            <p>${capitalizar(e.nombre)}</p>
        </div>
        `).join("")}
    </div>    

    `;

}

// ==============================
// BUSCAR
// ==============================

async function buscarPokemon() {

    const nombre = searchInput.value
        .trim()
        .toLowerCase();

    if (nombre === "") {

        cargarPokemon();

        return;

    }

    mostrarLoading();

    try {

        const respuesta = await fetch(`${URL}/${nombre}`);

        if (!respuesta.ok) {

            throw new Error();

        }

        const pokemon = await respuesta.json();

        pokemonContainer.innerHTML = "";

        crearCard(pokemon);

        mostrarDetalle(pokemon);

        pokemonCounter.textContent = "1 Pokémon";

    } catch {

        mostrarError();

    }

    ocultarLoading();

}

// ==============================
// EVENTOS
// ==============================

searchButton.addEventListener("click", buscarPokemon);

// Aqui vuelvo a ver todos mis Pokemon
document.getElementById("verTodos").addEventListener("click", () => {
    offset = 0;
    searchInput.value = "";
    cargarPokemon();
});

// Este boton prende y apaga el modo oscuro
document.getElementById("darkButton").addEventListener("click", () => {
    document.body.classList.toggle("modo-oscuro");
});

// Este boton busca un Pokemon sorpresa
document.getElementById("randomButton").addEventListener("click", async () => {

    // Escojo un numero al azar del 1 al 1025
    const numero = Math.floor(Math.random() * 1025) + 1;

    searchInput.value = numero;
    buscarPokemon();
});

    // Aqui veo mis Pokemon favoritos
document.getElementById("verFavoritos").addEventListener("click", async () => {

    mostrarLoading();
    pokemonContainer.innerHTML = "";

    // Busco los Pokemon que guarde
    for (const numero of favoritos) {
        const respuesta = await fetch(`${URL}/${numero}`);
        const pokemon = await respuesta.json();
        crearCard(pokemon);
    }

    pokemonCounter.textContent = favoritos.length + " Favoritos";

    ocultarLoading();
});


searchInput.addEventListener("keypress", e => {

    if (e.key === "Enter") {

        buscarPokemon();

    }

});

// ==============================
// PAGINACIÓN
// ==============================

// Cambio a la siguiente pagina
nextBtn.addEventListener("click", () => {

    // Si estoy en favoritos, comienzo desde la primera pagina
    if (pokemonCounter.textContent.includes("Favoritos")) {
        offset = 0;
    } else {
        offset += limite;
    }

    cargarPokemon();
});

previousBtn.addEventListener("click", () => {

    if (offset === 0) return;

    offset -= limite;

    cargarPokemon();

});

// ==============================
// UTILIDADES
// ==============================

function capitalizar(texto) {

    return texto.charAt(0).toUpperCase() +
        texto.slice(1);

}

// ==============================
// INICIO
// ==============================
cargarPokemon();


