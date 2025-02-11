
# Creación del Primer Usuario Administrador

Después de configurar la base de datos y crear un nuevo usuario a través del proceso de registro de la aplicación, necesitarás asignar manualmente el rol de administrador para crear el primer administrador. Sigue estos pasos:

1. Primero, regístrate para obtener una nueva cuenta a través de la aplicación
2. Anota el correo electrónico que usaste para registrarte
3. Ve al Editor SQL en tu Dashboard de Supabase
4. Ejecuta la siguiente consulta SQL, reemplazando `'usuario@ejemplo.com'` con tu correo electrónico real:

```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'usuario@ejemplo.com'
);
```

Esto promoverá al usuario especificado a un rol de administrador. Después de esto, podrás usar la interfaz de administración de la aplicación para gestionar los roles de otros usuarios.

## Método Alternativo

Si conoces directamente el UUID del usuario, puedes usar esta consulta:

```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = 'TU-UUID-DE-USUARIO';
```

Reemplaza `'TU-UUID-DE-USUARIO'` con el UUID real del usuario que quieres hacer administrador.

## Verificación

Para verificar el cambio, puedes ejecutar:

```sql
SELECT 
    au.email,
    ur.role
FROM auth.users au
JOIN user_roles ur ON au.id = ur.user_id
WHERE ur.role = 'admin';
```

Esto te mostrará todos los usuarios con privilegios de administrador.

