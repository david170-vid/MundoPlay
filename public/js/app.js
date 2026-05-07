const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    // ==================== 1. MODO OSCURO ====================
    const btnModo = document.getElementById('btnModoOscuro');
    if (btnModo) {
        if(localStorage.getItem('modo') === 'oscuro') document.body.classList.add('modo-oscuro');
        btnModo.addEventListener('click', () => {
            document.body.classList.toggle('modo-oscuro');
            localStorage.setItem('modo', document.body.classList.contains('modo-oscuro') ? 'oscuro' : 'claro');
        });
    }

    // ==================== 2. BOTÓN VOLVER ARRIBA ====================
    const btnArriba = document.getElementById('btnVolverArriba');
    if (btnArriba) {
        window.addEventListener('scroll', () => { btnArriba.style.display = window.scrollY > 200 ? 'block' : 'none'; });
        btnArriba.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // ==================== 3. ADVERTENCIA ENLACES EXTERNOS ====================
    const linksExternos = document.querySelectorAll('.link-externo');
    linksExternos.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); 
            const mensaje = "⚠️ ADVERTENCIA: Estás a punto de abandonar esta página del Proyecto Escolar.\n\nSerás redirigido a una página externa oficial. ¿Deseas continuar?";
            if (confirm(mensaje)) {
                window.open(this.href, '_blank'); 
            }
        });
    });

    // ==================== 4. LÓGICA DE DETALLES DE JUEGOS ====================
    const tarjetasJuego = document.querySelectorAll('.juego-card');
    const seccionGaleria = document.getElementById('galeria-juegos');
    const seccionDetalles = document.getElementById('vista-detalles');
    const btnVolverGaleria = document.getElementById('btnVolverGaleria');

    if (tarjetasJuego.length > 0 && seccionGaleria && seccionDetalles) {
        tarjetasJuego.forEach(tarjeta => {
            tarjeta.addEventListener('click', () => {
                const titulo = tarjeta.getAttribute('data-titulo');
                const dev = tarjeta.getAttribute('data-dev');
                const fecha = tarjeta.getAttribute('data-fecha');
                const desc = tarjeta.getAttribute('data-desc');
                const imgSrc = tarjeta.querySelector('img').src;

                document.getElementById('det-img').src = imgSrc;
                document.getElementById('det-titulo').textContent = titulo;
                document.getElementById('det-dev').textContent = "Desarrollador: " + dev;
                document.getElementById('det-fecha').textContent = "Fecha de Lanzamiento: " + fecha;
                document.getElementById('det-desc').textContent = desc;

                seccionGaleria.style.display = 'none';
                seccionDetalles.style.display = 'block';
                window.scrollTo({ top: seccionDetalles.offsetTop - 100, behavior: 'smooth' });
            });
        });

        btnVolverGaleria.addEventListener('click', () => {
            seccionDetalles.style.display = 'none';
            seccionGaleria.style.display = 'grid'; 
        });
    }

    // ==================== 5. SISTEMA DE SESIÓN (LOGIN/REGISTRO) ====================
    const usuarioActual = localStorage.getItem('usuario_psn');

    // REGISTRO
    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('registroError');
            const exitoDiv = document.getElementById('registroExito');
            errorDiv.style.display = 'none';
            exitoDiv.style.display = 'none';

            const psnId = document.getElementById('regPsnId').value.trim();
            const correo = document.getElementById('regCorreo').value.trim();
            const password = document.getElementById('regPassword').value;
            const consola = document.getElementById('regConsola').value;
            const juego = document.getElementById('regJuego').value.trim();

            // VALIDACIÓN: Contraseña mínimo 8 caracteres
            if (password.length < 8) {
                errorDiv.textContent = '❌ Error: La contraseña debe tener al menos 8 caracteres.';
                errorDiv.style.display = 'block';
                return;
            }

            try {
                const res = await fetch(`${API_URL}/usuarios`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ psnId, correo, password, consola, juego })
                });
                const data = await res.json();

                if (data.success) {
                    exitoDiv.textContent = '✅ Cuenta creada con éxito. Iniciando sesión...';
                    exitoDiv.style.display = 'block';
                    localStorage.setItem('usuario_psn', data.psnId);
                    setTimeout(() => window.location.href = 'index.html', 1500); 
                } else {
                    // Si el usuario ya existe, la BD manda error y lo mostramos aquí
                    errorDiv.textContent = `❌ ${data.message}`;
                    errorDiv.style.display = 'block';
                }
            } catch (err) {
                errorDiv.textContent = '❌ Error de conexión con el servidor BD.';
                errorDiv.style.display = 'block';
            }
        });
    }

    // LOGIN
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('loginError');
            errorDiv.style.display = 'none';

            const psnId = document.getElementById('loginPsnId').value.trim();
            const password = document.getElementById('loginPassword').value;

            try {
                const res = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ psnId, password })
                });
                const data = await res.json();

                if (data.success) {
                    localStorage.setItem('usuario_psn', data.psnId);
                    window.location.href = 'index.html';
                } else {
                    errorDiv.textContent = `❌ ${data.message}`;
                    errorDiv.style.display = 'block';
                }
            } catch (err) {
                errorDiv.textContent = '❌ Error de conexión con el servidor.';
                errorDiv.style.display = 'block';
            }
        });
    }

    // ==================== 6. MURO DE LA COMUNIDAD ====================
    const areaPub = document.getElementById('areaPublicacion');
    const msgInvitado = document.getElementById('mensajeInvitado');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    const listaComentariosBD = document.getElementById('listaComentariosBD');

    if (areaPub && msgInvitado) {
        if (usuarioActual) {
            areaPub.style.display = 'block';
            msgInvitado.style.display = 'none';
            document.getElementById('usuarioActualDisplay').textContent = usuarioActual;
            
            btnCerrarSesion.addEventListener('click', () => {
                localStorage.removeItem('usuario_psn');
                window.location.reload();
            });

            // Botón publicar en BD
            document.getElementById('btnEnviarComentarioBD').addEventListener('click', async () => {
                const texto = document.getElementById('nuevoComentario').value.trim();
                if (!texto) return alert("Escribe un mensaje.");
                
                await fetch(`${API_URL}/comentarios`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario: usuarioActual, texto })
                });
                document.getElementById('nuevoComentario').value = '';
                cargarComentarios();
            });
        } else {
            areaPub.style.display = 'none';
            msgInvitado.style.display = 'block';
        }
    }

    async function cargarComentarios() {
        if (!listaComentariosBD) return;
        try {
            const res = await fetch(`${API_URL}/comentarios`);
            const data = await res.json();
            listaComentariosBD.innerHTML = '';
            
            if (data.comentarios.length === 0) {
                listaComentariosBD.innerHTML = '<li style="text-align:center; color:#ccc;">Sé el primero en comentar.</li>';
                return;
            }

            // Mostrar comentarios con el nombre del usuario
            data.comentarios.forEach(c => {
                listaComentariosBD.innerHTML += `
                    <li style="background: rgba(255,255,255,0.1); margin-bottom: 10px; padding: 10px; border-radius: 8px;">
                        <strong style="color: #00a2ff;">${c.usuario}:</strong> ${c.texto}
                    </li>
                `;
            });
        } catch (e) {
            listaComentariosBD.innerHTML = '<li style="color:red;">Error al conectar con la base de datos.</li>';
        }
    }
    
    cargarComentarios();

    // ==================== 7. SISTEMA DE QUIZ A BD ====================
    const formQuiz = document.getElementById('formQuiz10');
    const avisoInvitadoQuiz = document.getElementById('avisoQuizInvitado');
    const resultadoDiv = document.getElementById('resultadoQuiz');

    if (formQuiz) {
        if (usuarioActual) avisoInvitadoQuiz.style.display = 'none';

        formQuiz.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            let score = 0;
            for(let i = 1; i <= 10; i++) {
                const respuesta = document.querySelector(`input[name="q${i}"]:checked`);
                if (respuesta && respuesta.value === "1") score++;
            }

            let mensaje = `🎮 ¡Misión Completada! Obtuviste ${score} de 10 respuestas correctas.`;
            
            if (!usuarioActual) {
                mensaje += " (Puntuación no guardada, debes iniciar sesión).";
                resultadoDiv.textContent = mensaje;
                resultadoDiv.className = "alerta-error";
                resultadoDiv.style.display = 'block';
                return;
            }

            try {
                await fetch(`${API_URL}/puntuaciones`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario: usuarioActual, puntaje: score })
                });
                mensaje += ` ¡Excelente, ${usuarioActual}! Tu récord ha sido guardado.`;
                resultadoDiv.textContent = mensaje;
                resultadoDiv.className = "alerta-exito";
                resultadoDiv.style.display = 'block';
            } catch (err) {
                resultadoDiv.textContent = "Error al conectar con la base de datos.";
                resultadoDiv.className = "alerta-error";
                resultadoDiv.style.display = 'block';
            }
        });
    }

    // ==================== 8. BOTÓN LIKES ====================
    const btnLike = document.getElementById('btnMeGusta');
    const contadorLike = document.getElementById('contadorLike');
    if (btnLike && contadorLike) {
        let likes = localStorage.getItem('ps_likes') || 0;
        contadorLike.textContent = likes;
        
        btnLike.addEventListener('click', () => {
            likes++;
            contadorLike.textContent = likes;
            localStorage.setItem('ps_likes', likes);
            
            btnLike.style.transform = 'scale(1.1)';
            setTimeout(() => btnLike.style.transform = 'scale(1)', 150);
        });
    }
});