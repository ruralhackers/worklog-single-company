
# Time Tracking Application

Una aplicación de control de fichaje construida con React, TypeScript y Supabase.

## Descripción General

Esta aplicación permite a las empresas gestionar el control de fichaje de sus empleados de forma sencilla y eficiente:

- Los empleados pueden fichar entrada/salida
- Los administradores pueden gestionar usuarios y ver reportes
- Interfaz simple e intuitiva
- Totalmente responsive

## Requisitos Previos

Antes de comenzar, asegúrate de tener:

- Node.js 18+ instalado
- Una cuenta en [Supabase](https://supabase.com) (capa gratuita disponible)

## Configuración del Proyecto

1. **Clonar el Repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd time-tracking-app
   ```

2. **Configurar Supabase**
   
   a. Crear un nuevo proyecto en [Supabase](https://supabase.com)
   
   b. Una vez creado el proyecto, copiar las credenciales:
   - Project URL
   - anon/public key

   c. Crear un archivo `.env` en la raíz del proyecto con estas variables:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Instalar Dependencias**
   ```bash
   npm install
   ```

4. **Inicializar la Base de Datos**
   
   La aplicación requiere las siguientes tablas:
   - profiles (usuarios y sus datos)
   - time_records (registros de fichaje)
   - user_roles (roles de usuario)

   Ejecuta las migraciones necesarias desde el panel de Supabase > SQL Editor.

## Desarrollo Local

1. **Iniciar el Servidor de Desarrollo**
   ```bash
   npm run dev
   ```

2. **Construir para Producción**
   ```bash
   npm run build
   ```

## Despliegue

La aplicación puede desplegarse en cualquier servicio que soporte aplicaciones estáticas (Vercel, Netlify, etc.).

1. **Construir la Aplicación**
   ```bash
   npm run build
   ```

2. **Desplegar**
   - El directorio `dist` contiene los archivos estáticos
   - Configura las variables de entorno en tu plataforma de hosting
   - Asegúrate de que las redirecciones estén configuradas para SPA

### Plataformas Recomendadas

- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

## Administración

Para crear el primer usuario administrador:

1. Registra un usuario normal
2. Usa el SQL Editor de Supabase para asignarle el rol de admin:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('ID_DEL_USUARIO', 'admin');
   ```

## Características de Seguridad

- Autenticación segura mediante Supabase Auth
- Políticas RLS para proteger los datos
- Roles de usuario (admin/user)
- Tokens JWT para sesiones

## Soporte

Para soporte, por favor:
1. Revisa la documentación
2. Abre un issue en el repositorio
3. Contacta con el equipo de mantenimiento

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
