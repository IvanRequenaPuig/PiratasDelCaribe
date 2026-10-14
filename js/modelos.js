/* ============================================================
   CONFIGURACIÓN DE MODELOS 3D (Sketchfab u otros, formato .glb / .gltf)
   - Deja los archivos en la carpeta models/ con estos nombres (o cambia las rutas).
   - Si un archivo no existe, se usa el modelo hecho por código.
   - size: tamaño objetivo (se escala solo, no hace falta saber la escala original)
   - rotY: giro en grados (el BARCO debe mirar con la proa hacia +X; prueba 90, -90 o 180)
   - y: subir/bajar el modelo
   - OJO: para cargar .glb hay que abrir la web con un servidor local
     (VS Code "Live Server" o:  npx serve ), no con doble clic.
   ============================================================ */
window.MODELOS = {
  barco: { url: 'models/barco.glb', size: 11, rotY: 0, y: -0.5 },
  islas: {
    tortuga: { url: 'models/isla-tortuga.glb', size: 40, rotY: 0, y: 0 },
    fort:    { url: 'models/isla-fuerte.glb',  size: 46, rotY: 0, y: 0 },
    faro:    { url: 'models/isla-faro.glb',    size: 40, rotY: 0, y: 0, lampY: 31 },  // lampY: altura de la luz del faro
    volcan:  { url: 'models/isla-volcan.glb',  size: 46, rotY: 0, y: 0, lampY: 34 },
    wreck:   { url: 'models/isla-naufragio.glb', size: 44, rotY: 0, y: 0 },
    tesoro:  { url: 'models/isla-tesoro.glb',  size: 40, rotY: 0, y: 0 }
  },
  // MAR como modelo 3D (opcional). Si existe, sustituye al mar de código.
  // repetir:true  → se usa en mosaico 3x3 (el modelo debería ser "tileable"); size = tamaño de cada pieza
  // repetir:false → una sola pieza enorme (pon size grande, p. ej. 600)
  mar: { url: 'models/mar.glb', size: 300, rotY: 0, y: -1, repetir: true, velocidad: 1 },

  // MÚSICA DE FONDO: pon aquí la ruta de tu archivo de audio (mp3, ogg...) y el volumen (0 a 1)
  musica: 'audio/piratas.mp3',
  volumen: 0.5,

  // ICONO del botón de sonido: tu propia imagen (mejor PNG con fondo transparente, cuadrada).
  // Si el archivo no existe se muestra el icono 🔊 de siempre.
  iconoSonido: 'images/calavera.png',

  aguaTextura: 'textures/agua.jpg',   // textura de agua (opcional, se repite en mosaico)
  aguaRepeticion: 60
};
