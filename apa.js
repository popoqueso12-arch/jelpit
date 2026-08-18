const fs = require('fs');
const path = require('path');

// Configuración de rutas
const URL_BASE = 'https://administraciones-conjuntos-jelpit.com/new-login/api/apartamentos/';
const ARCHIVO_CONJUNTOS = './conjuntos.json';
const CARPETA_DESTINO = './api/apartamentos/';
const TAMANO_LOTE = 50; // Descargará 50 archivos simultáneamente

async function descargarApartamentos() {
    // 1. Crear la carpeta si no existe
    if (!fs.existsSync(CARPETA_DESTINO)) {
        fs.mkdirSync(CARPETA_DESTINO, { recursive: true });
        console.log(`📁 Carpeta creada: ${CARPETA_DESTINO}`);
    }

    // 2. Leer el archivo conjuntos.json local
    let conjuntos = [];
    try {
        const data = fs.readFileSync(ARCHIVO_CONJUNTOS, 'utf8');
        conjuntos = JSON.parse(data);
    } catch (error) {
        console.error('❌ Error al leer conjuntos.json.', error.message);
        return;
    }

    console.log(`🚀 Iniciando procesamiento de ${conjuntos.length} archivos en lotes de ${TAMANO_LOTE}...`);

    let completados = 0;
    let fallidos = 0;
    let saltados = 0; // Nuevo contador para los archivos que ya tienes

    // Función auxiliar para descargar un solo archivo
    async function descargarUnArchivo(id) {
        if (!id) return;
        
        const rutaArchivo = path.join(CARPETA_DESTINO, `${id}.json`);

        // 🛑 LA MAGIA ESTÁ AQUÍ: Verificamos si el archivo ya existe
        if (fs.existsSync(rutaArchivo)) {
            saltados++;
            return; // Nos salimos inmediatamente sin hacer el fetch
        }

        const url = `${URL_BASE}${id}.json`;

        try {
            const respuesta = await fetch(url);
            if (!respuesta.ok) {
                fallidos++;
                return;
            }
            const jsonText = await respuesta.text();
            fs.writeFileSync(rutaArchivo, jsonText);
            completados++;
        } catch (error) {
            fallidos++;
        }
    }

    // 3. Procesar en lotes paralelos
    for (let i = 0; i < conjuntos.length; i += TAMANO_LOTE) {
        const lote = conjuntos.slice(i, i + TAMANO_LOTE);
        
        // Creamos un array de promesas (peticiones simultáneas)
        const promesas = lote.map(conjunto => descargarUnArchivo(conjunto._id));
        
        // Esperamos a que todo el lote termine
        await Promise.all(promesas);
        
        // Imprimir progreso en la consola
        const procesados = Math.min(i + TAMANO_LOTE, conjuntos.length);
        console.log(`⏳ Progreso: ${procesados} / ${conjuntos.length} ... (Descargados: ${completados} | Ya existían: ${saltados} | Fallidos: ${fallidos})`);
    }

    console.log(`\n🎉 ¡Proceso masivo terminado!`);
    console.log(`✅ Nuevas descargas exitosas: ${completados}`);
    console.log(`⏭️ Archivos que ya tenías (saltados): ${saltados}`);
    if (fallidos > 0) console.log(`❌ Fallidos/No encontrados: ${fallidos}`);
}

descargarApartamentos();