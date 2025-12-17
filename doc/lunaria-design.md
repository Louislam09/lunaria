# Lunaria – Diseño Funcional y Técnico

## Propósito y experiencia
- Calendario menstrual inteligente con enfoque empático para hispanohablantes.
- Uso libre sin cuenta; iniciar sesión permite guardar y sincronizar datos en la nube.
- Copys clave visibles en onboarding y puntos de guardado: “Inicia sesión para guardar y proteger tu información”, “Tu información es privada”, “Puedes usar Lunaria como invitada”.

## Principio de autenticación
- Modo invitada: explora UI, ve ejemplos; NO persiste datos ni push.
- Modo autenticada (email+contraseña o Google OAuth vía PocketBase): todo se guarda y sincroniza; habilita notificaciones.
- Guard rails en cada acción de guardado:
  - `if (!isAuthenticated) { showLoginModal(); return; }`
  - Modal: “Inicia sesión para guardar tus datos”.

## Arquitectura de frontend (Expo + TypeScript)
- Expo Router con estructura:
  ```
  src/
    app/
      onboarding/
      home/
      calendar/
      predictions/
      pcos/
      settings/
      auth/
    components/
    context/AuthContext.tsx
    services/{pocketbase.ts,authService.ts,notifications.ts}
    utils/{predictions.ts,pcosLogic.ts,dates.ts}
  ```
- AuthContext:
  - Estado: `isAuthenticated`, `user`.
  - Métodos: `loginEmail`, `loginGoogle`, `logout`.
  - Persiste sesión de PocketBase y token en memoria; opcional cache en `AsyncStorage` para re-login.
- Guards: hooks/componente `RequireAuth` solo para secciones que escriben datos; pantallas de lectura se permiten pero acciones de guardar bloquean con modal.

## Flujo de onboarding (adaptativo)
1) Bienvenida: explica uso sin cuenta y beneficio de iniciar sesión.
2) Paso de login opcional:
   - Botones: “Continuar como invitada”, “Iniciar sesión con Email”, “Iniciar sesión con Google”.
3) Datos personales y de ciclo:
   - Nombre, fecha de nacimiento, tipo de ciclo (regular/irregular), duraciones.
   - Paso SOP/PCOS: diagnóstico (Sí/No/No segura); si Sí → preguntas de síntomas, duración >35 días, tratamientos.
4) Salud reproductiva: método anticonceptivo, desea embarazo.
5) Permisos de notificaciones: solo si autenticada; explicar beneficio antes de pedir permiso.
6) Confirmación: resume que solo se guarda en la nube si está logueada.
7) Si no autenticada: datos se mantienen en estado temporal; al intentar guardar se ofrece login.

## Estados de uso
- Invitada:
  - Puede navegar home, calendario (datos demo), predicciones mock, registro diario con datos locales temporales (no persistentes).
  - Guardar → bloque modal.
  - Sin push notifications.
- Autenticada:
  - CRUD completo en PocketBase.
  - Push activables; token se asocia a `userId`.

## PocketBase (colecciones y reglas)
- Colección `users` (auth) con providers email y google.
- `profiles`:
  ```json
  {
    "user": "relation(users)",
    "name": "string",
    "birthDate": "date",
    "cycleType": "regular | irregular",
    "averageCycleLength": "number",
    "averagePeriodLength": "number",
    "hasPCOS": "boolean",
    "pcosSymptoms": ["string"],
    "pcosTreatment": ["string"],
    "contraceptiveMethod": "string",
    "wantsPregnancy": "boolean"
  }
  ```
- `cycles`:
  ```json
  { "user": "relation(users)", "startDate": "date", "endDate": "date" }
  ```
- `daily_logs`:
  ```json
  {
    "user": "relation(users)",
    "date": "date",
    "symptoms": ["string"],
    "flow": "light | medium | heavy",
    "mood": "string",
    "notes": "string"
  }
  ```
- Regla de acceso estándar para cada colección:
  - `@request.auth.id = user.id`

## Servicios frontend
- `services/pocketbase.ts`: instancia cliente, manejo de auth store, refresh.
- `services/authService.ts`: wrappers `loginEmail`, `loginGoogle`, `logout`; mapear errores de PocketBase a mensajes empáticos.
- `services/notifications.ts`: solicita permisos (solo autenticadas), registra token con `userId`, permite activar/desactivar; endpoints en PocketBase para guardar token (colección `push_tokens` opcional).
- `utils/predictions.ts`: lógica de predicción con rama regular vs irregular; ventana fértil ±4 días; para SOP ampliar rango y mostrar baja precisión.
- `utils/pcosLogic.ts`: mensajes educativos y banderas de alerta según síntomas y duración de ciclos.

## Comportamiento de UI clave
- Botón “Guardar” en formularios:
  - Si invitada → abre modal de login con copy empático.
  - Si autenticada → ejecuta mutación a PocketBase.
- Home:
  - Tarjeta de próximo periodo y fase actual.
  - Mensaje dinámico empático.
- Calendario:
  - Vista mensual, colores por fase; marca manual de periodos si autenticada.
  - En modo invitada muestra datos demo con leyenda “No se guardará”.
- Registro diario:
  - Campos: síntomas, flujo, estado de ánimo, notas.
- Predicciones:
  - Mostrar advertencia de precisión reducida si `hasPCOS` o ciclo irregular con <3 registros.
- PCOS:
  - Educación breve, recordatorios suaves, checklist de síntomas.
- Ajustes:
  - Editar perfil, activar/desactivar notificaciones, sincronizar, borrar cuenta/datos (solo autenticada).

## Push notifications (Expo)
- Pedir permisos en onboarding solo si autenticada; si no, ocultar hasta que inicie sesión.
- Tipos:
  - Próximo periodo (3 y 1 día antes).
  - Ovulación / ventana fértil (marcar menor precisión en SOP/irregular).
  - Recordatorio de registro de síntomas (SOP).
  - Tips educativos.
- Guardar `expoPushToken` en PocketBase asociado a `userId`.

## Copy y tono
- Frases guía:
  - “Tu información es privada.”
  - “Solo se guarda si decides crear una cuenta.”
  - “Puedes usar Lunaria como invitada.”
  - “Inicia sesión para guardar y proteger tu información.”

## Rutas críticas para desarrollo inicial
1) Implementar AuthContext con flujos email y Google (PocketBase).
2) Onboarding con paso de login opcional + guard rails de guardado.
3) Servicios de datos para `profiles`, `cycles`, `daily_logs` con verificación `isAuthenticated` previa.
4) Notificaciones: pedir permiso solo autenticadas, guardar token.
5) Predicciones y lógica SOP/PCOS en utilidades reutilizables.

## Checklist de aceptación
- App arranca con `npx expo start`.
- Se puede usar sin login; cualquier guardado exige autenticarse.
- Login email y Google funcionando.
- Datos autenticados se persisten en PocketBase con reglas de acceso por usuario.
- Push notifications solo si autenticada y token guardado con `userId`.
- Copys empáticos visibles en onboarding, modal de guardado y home.

