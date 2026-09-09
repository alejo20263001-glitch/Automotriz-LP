# Taller Central — App web

Sistema de gestión para taller automotriz: clientes/vehículos, órdenes de trabajo,
inventario, facturación, reportes y roles de usuario. Los datos se guardan en
**Firebase Firestore** y se sincronizan en tiempo real entre todos los empleados.

## Paso 1 — Crear el proyecto de Firebase (una sola vez)

1. Ve a https://console.firebase.google.com y crea un proyecto (gratis).
2. En el menú lateral entra a **Compilación → Firestore Database → Crear base de datos**.
   Elige **modo de prueba** para empezar rápido (puedes ajustar las reglas de
   seguridad después, ver la sección de seguridad más abajo).
3. Ve a **Configuración del proyecto** (ícono de engranaje, arriba a la izquierda)
   → pestaña **Tus apps** → botón **Web (`</>`)** → registra la app (no necesitas
   Firebase Hosting).
4. Firebase te mostrará un bloque `firebaseConfig` con varias claves. Copia esos
   valores y pégalos en el archivo `src/firebase.js` de este proyecto,
   reemplazando los valores `"TU_..."`.

## Paso 2 — Probarlo en tu computadora

Necesitas tener [Node.js](https://nodejs.org) instalado (versión 18 o más reciente).

```bash
npm install
npm run dev
```

Abre el link que aparece en la terminal (normalmente `http://localhost:5173`).

## Paso 3 — Publicarlo en línea con Vercel

1. Sube esta carpeta a un repositorio de GitHub (crea uno en https://github.com/new
   y sigue las instrucciones para subir el código, o usa GitHub Desktop si prefieres
   no usar la terminal).
2. Ve a https://vercel.com, crea una cuenta gratis con tu GitHub.
3. Clic en **Add New → Project**, elige el repositorio que acabas de subir.
4. Vercel detecta automáticamente que es un proyecto Vite — no necesitas cambiar
   ninguna configuración. Clic en **Deploy**.
5. En un par de minutos tendrás un link como `taller-central.vercel.app` que
   funciona desde cualquier computadora o celular, con navegador.

Cada vez que subas cambios al repositorio de GitHub, Vercel actualiza la página
automáticamente.

## Seguridad de los datos (importante)

En "modo de prueba", cualquier persona con el link de tu app podría leer o
modificar los datos de Firestore si conociera la configuración. Para un taller
pequeño esto suele ser un riesgo aceptable al inicio, pero antes de usarlo con
datos reales de clientes te recomiendo:

- En Firestore, ve a la pestaña **Reglas** y limita el acceso, por ejemplo
  restringiendo la escritura a un documento específico o agregando autenticación
  de Firebase (correo/contraseña) para que solo tu equipo pueda entrar.
- Si quieres, puedo ayudarte a configurar esas reglas o añadir un inicio de
  sesión con contraseña más adelante.

## Estructura del proyecto

- `src/App.jsx` — toda la interfaz y lógica de la app.
- `src/firebase.js` — conexión a la base de datos (aquí pegas tu configuración).
- `src/main.jsx` — punto de entrada de React.
- `src/index.css` — estilos base (Tailwind).
