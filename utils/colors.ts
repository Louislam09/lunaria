export const colors = {
  // lavender: "#B9A7E8",
  lavender: "#b19feb",
  blush: "#F3B7C6",
  moonWhite: "#F6F2FA",
  textPrimary: "#2E2A38",
  textMuted: "#8E8AA0",
  period: "#fb7185",
  // light green
  fertile: "#4BAA4E",
  // light blue
  // fertile: "#f6c4df",
  // light purple
  ovulation: "#c58ffc",
};

// Perfecto, Luis. Buena pregunta — **esto es exactamente lo que hace que una app de ciclo sea confiable** 👍
// Te voy a dar **fechas concretas** para que hoy **22/12/2025** puedas probar **todos los escenarios importantes**, no solo uno.

// Voy por partes, claro y práctico.

// ---

// ## 🧪 Objetivo del testing

// Verificar que Lunaria calcule correctamente:

// * Día del ciclo
// * Fase del ciclo
// * Ventana fértil
// * Ovulación
// * Próximo período
// * Casos límite (inicio, fin, mes siguiente, error humano)

// ---

// # ✅ ESCENARIO 1 — Usuario REGULAR (el más común)

// ### 📌 Datos de onboarding

// * **Último período comenzó:** `08/12/2025`
// * **Duración del período:** `5 días`
// * **Ciclo regular:** Sí
// * **Duración promedio del ciclo:** `28 días`

// ### 📅 Qué debería pasar hoy (22/12/2025)

// * Día del ciclo: **15**
// * Fase: **Lútea**
// * Ovulación: **alrededor del 14–15 de dic**
// * Ventana fértil: **10–15 de dic**
// * Próximo período esperado: **05/01/2026**
// * Días restantes: **14**

// 👉 Este escenario prueba:

// * Cálculo normal
// * Cruce de mes
// * Fase lútea
// * Predicción futura

// ---

// # ✅ ESCENARIO 2 — Usuario en MENSTRUACIÓN (feedback visual)

// ### 📌 Datos

// * **Último período comenzó:** `21/12/2025`
// * **Duración del período:** `5 días`
// * **Ciclo regular:** `28`

// ### 📅 Hoy (22/12/2025)

// * Día del ciclo: **2**
// * Fase: **Menstrual**
// * El calendario debe mostrar:

//   * Strip rosado activo
//   * Día 21–25 marcados
// * Próximo período: **18/01/2026**

// 👉 Esto prueba:

// * UI de período activo
// * “Hoy” dentro del período
// * Textos correctos (“estás menstruando”)

// ---

// # ✅ ESCENARIO 3 — OVULACIÓN HOY 🔥 (caso crítico)

// ### 📌 Datos

// * **Último período comenzó:** `09/12/2025`
// * **Ciclo regular:** `28`
// * **Período:** `5 días`

// ### 📅 Hoy

// * Día del ciclo: **14**
// * Fase: **Ovulatoria**
// * Ovulación: **HOY**
// * Ventana fértil: **10–15**
// * Probabilidad: **alta**

// 👉 Esto prueba:

// * Anillo de ovulación
// * Mensaje de alta fertilidad
// * Exactitud del algoritmo

// ⚠️ Si este falla → el algoritmo está mal.

// ---

// # ✅ ESCENARIO 4 — CICLO IRREGULAR (muy importante)

// ### 📌 Datos

// * **Último período:** `02/12/2025`
// * **Ciclo irregular**
// * **Rango:** `26–32 días`
// * **Período:** `6 días`

// ### 📅 Hoy

// * Día del ciclo: **21**
// * Fase: **Lútea (estimada)**
// * Ovulación: **estimada**
// * Ventana fértil: **NO exacta**
// * UI debe indicar:

//   * Predicción
//   * Menor certeza

// 👉 Esto prueba:

// * Promedio de rango
// * Copy correcto (“estimado”)
// * Lógica alternativa

// ---

// # ✅ ESCENARIO 5 — ERROR HUMANO (edge case real)

// ### 📌 Datos

// * **Último período:** `22/12/2025` (HOY)
// * **Período:** `7 días`
// * **Ciclo:** `28`

// ### Resultado esperado

// * Día del ciclo: **1**
// * Fase: **Menstrual**
// * No ovulación mostrada
// * No ventana fértil aún

// 👉 Esto prueba:

// * Inputs extremos
// * Que no se rompa nada

// ---

// # ✅ ESCENARIO 6 — CICLO LARGO

// ### 📌 Datos

// * **Último período:** `25/11/2025`
// * **Ciclo:** `35 días`
// * **Período:** `5 días`

// ### Hoy

// * Día del ciclo: **28**
// * Fase: **Lútea tardía**
// * Próximo período: **30/12/2025**

// 👉 Esto prueba:

// * Ciclos largos
// * Cálculo de ovulación tardía
// * UI cerca del siguiente período

// ---

// ## 🧠 Regla de oro para verificar si Lunaria está bien

// Si se cumplen estas 3 cosas, tu app está **correcta**:

// 1. **Ovulación ≈ 14 días antes del próximo período**
// 2. **Ventana fértil = 5 días antes + día de ovulación**
// 3. **El día del ciclo nunca salta ni retrocede**

// ---

// ## 🔥 Mi recomendación final

// Haz **screenshots** de cada escenario y compáralos con:

// * Clue
// * Flo
// * Apple Health

// Si Lunaria coincide → estás sólido 💪

// Si quieres, en el próximo mensaje puedo:

// * Crear un **checklist automático de QA**
// * Generarte **tests unitarios** para tus funciones
// * Validar **un escenario específico que tú quieras**

// Dime 👌
