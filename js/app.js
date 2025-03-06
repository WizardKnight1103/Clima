// Código para el modo oscuro
document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    if (localStorage.getItem('dark-mode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('dark-mode', 'enabled');
        } else {
            localStorage.setItem('dark-mode', 'disabled');
        }
    });
});

function mostrarLoading() {
    document.getElementById('loading').style.display = 'block';
}

function ocultarLoading() {
    document.getElementById('loading').style.display = 'none';
}

const weatherAnimations = {
    "Thunderstorm": "icons/Tormenta.json",
    "Drizzle": "icons/Lluvia.json",
    "Rain": "icons/Lluvia.json",
    "Snow": "icons/Nieve.json",
    "Clear": "icons/Limpio.json",
    "Clouds": "icons/Nublado.json",
    "Partly Cloudy": "icons/Parcialmente-Nublado.json",
    "default": "icons/Nublado.json"
};

function updateWeatherAnimation(condition, containerId) {
    const weatherContainer = document.getElementById(containerId);
    if (!weatherContainer) return;

    weatherContainer.innerHTML = "";
    const animationPath = weatherAnimations[condition] || weatherAnimations["default"];

    lottie.loadAnimation({
        container: weatherContainer,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: animationPath
    });
}

document.getElementById('buscar-btn').addEventListener('click', () => {
    const ciudad = document.getElementById('ciudad-input').value.trim();
    const mensajeError = document.getElementById('mensaje-error');

    if (ciudad === "") {
        mensajeError.textContent = "Por favor, ingresa el nombre de una ciudad.";
        mensajeError.style.display = "block";
    } else {
        mensajeError.style.display = "none";
        mostrarLoading();
        obtenerClima(ciudad);
        obtenerPronostico(ciudad);
    }
});

async function obtenerClima(ciudad) {
    const apiKey = 'ef924cf14dfca95bfa2cceb15b8a34b3';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;
    
    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error('Ciudad no encontrada');
        const datos = await respuesta.json();
        mostrarClima(datos);
        obtenerIndiceUV(datos.coord.lat, datos.coord.lon);
    } catch (error) {
        const mensajeError = document.getElementById('mensaje-error');
        mensajeError.textContent = "No se pudo encontrar el clima para esta ciudad. Intenta nuevamente.";
        mensajeError.style.display = "block";
        console.error("Error al obtener el clima:", error);
    } finally {
        ocultarLoading();
    }
}

async function obtenerIndiceUV(lat, lon) {
    const apiKey = 'ef924cf14dfca95bfa2cceb15b8a34b3';
    const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    
    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error('No se pudo obtener el índice UV');
        const datos = await respuesta.json();
        document.getElementById('uv-index').textContent = `${datos.value}`;
    } catch (error) {
        console.error("Error al obtener el índice UV:", error);
    }
}

async function obtenerPronostico(ciudad) {
    const apiKey = 'ef924cf14dfca95bfa2cceb15b8a34b3';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;
    
    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error('No se pudo obtener el pronóstico extendido');
        const datos = await respuesta.json();
        mostrarPronostico(datos);
    } catch (error) {
        console.error("Error al obtener el pronóstico extendido:", error);
    } finally {
        ocultarLoading();
    }
}

function mostrarClima(datos) {
    document.getElementById('ciudad').textContent = `${datos.name}, ${datos.sys.country}`;
    document.getElementById('fecha-hora').textContent = new Date(datos.dt * 1000).toLocaleString('es-ES', {
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        hour: '2-digit', 
        minute: '2-digit'
    });

    document.getElementById('temperatura').textContent = `${Math.round(datos.main.temp)}°C`;
    document.getElementById('sensacion').textContent = `Sensación térmica: ${Math.round(datos.main.feels_like)}°C`;
    document.getElementById('descripcion').textContent = datos.weather[0].description;
    document.getElementById('viento').textContent = `${datos.wind.speed} km/h`;
    document.getElementById('humedad').textContent = `${datos.main.humidity}%`;
    document.getElementById('presion').textContent = `${datos.main.pressure} hPa`;
    document.getElementById('sunrise').textContent = new Date(datos.sys.sunrise * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunset').textContent = new Date(datos.sys.sunset * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    updateWeatherAnimation(datos.weather[0].main, "weather-icon");
}

function mostrarPronostico(datos) {
    const contenedorPronostico = document.querySelectorAll('.dia');
    const pronosticoDiario = filtrarPronostico(datos.list);

    pronosticoDiario.forEach((dia, index) => {
        const fecha = new Date(dia.dt * 1000);
        const descripcionClima = dia.weather[0].main;
        const idContenedor = `pronostico-dia-${index}`;

        // Crear div dinámico para la animación Lottie
        contenedorPronostico[index].innerHTML = `
            <p>${fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <div id="${idContenedor}" class="icono-clima"></div>
            <p>${Math.round(dia.main.temp)}°C</p>
            <p>${dia.weather[0].description}</p>
        `;

        // Cargar animación para cada día del pronóstico
        updateWeatherAnimation(descripcionClima, idContenedor);
    });
}

function filtrarPronostico(lista) {
    const dias = [];
    const fechasVistas = new Set();

    lista.forEach(item => {
        const fecha = new Date(item.dt * 1000).toLocaleDateString('es-ES');

        if (!fechasVistas.has(fecha) && new Date(item.dt * 1000).getHours() === 12) {
            fechasVistas.add(fecha);
            dias.push(item);
        }
    });

    return dias.slice(0, 4);
}

// Registrar el Service Worker y manejar notificaciones
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('../sw.js')
            .then((registration) => {
                console.log('Service Worker registrado', registration.scope);

                // Solicita permiso para las notificaciones al cargar la página
                if (Notification.permission === "default") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            registration.active?.postMessage({ type: 'SHOW_NOTIFICATION' });
                        }
                    });
                } else if (Notification.permission === "granted") {
                    registration.active?.postMessage({ type: 'SHOW_NOTIFICATION' });
                }
            })
            .catch((error) => {
                console.log('Error al registrar el Service Worker:', error);
            });
    });
}