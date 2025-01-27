const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

// Configuración de almacenamiento de archivos usando multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'firmware/');  // Guardar los archivos en la carpeta 'firmware'
  },
  filename: function (req, file, cb) {
    // Cambiar el nombre del archivo para evitar colisiones
    cb(null, `firmware-${Date.now()}.bin`);
  }
});

// Filtrar solo archivos .bin
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(new Error('Solo archivos .bin son permitidos!'), false);
  }
};

// Crear el middleware de multer para manejar las cargas de archivos
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter 
});

// Ruta para mostrar el formulario de carga de archivo
app.get('/', (req, res) => {
  res.send(`
    <h1>Cargar archivo de firmware para ESP32</h1>
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <input type="file" name="firmware" accept=".bin" required>
      <button type="submit">Subir Firmware</button>
    </form>
  `);
});

// Ruta para manejar la carga del archivo
app.post('/upload', upload.single('firmware'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se ha subido ningún archivo.');
  }
  
  res.send(`
    <h2>Archivo subido exitosamente</h2>
    <p>Nombre del archivo: ${req.file.filename}</p>
    <p><a href="/check-update">Verificar si hay actualizaciones</a></p>
  `);
});

// Ruta para verificar si hay actualizaciones
app.get('/check-update', (req, res) => {
  // Suponiendo que si se sube un archivo, se puede decir que hay una nueva actualización
  const latestFirmware = `firmware/${req.file ? req.file.filename : 'firmware-v1.bin'}`;

  res.json({
    updateAvailable: true, 
    version: '2.0.0',  // Versión de ejemplo, puedes gestionarlo dinámicamente.
    firmwareUrl: `https://your-railway-app-name.railway.app/firmware/${latestFirmware}`
  });
});

// Ruta para servir el archivo binario de firmware
app.use('/firmware', express.static(path.join(__dirname, 'firmware')));

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor OTA corriendo en http://localhost:${PORT}`);
});
