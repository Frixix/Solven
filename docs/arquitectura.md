# Arquitectura del Proyecto

## Enfoque general

El proyecto sigue una arquitectura incremental basada en frontend puro, con una clara separación de responsabilidades entre:

- Interfaz (UI)
- Lógica de negocio
- Persistencia de datos

Actualmente, la aplicación funciona completamente en el navegador, utilizando `localStorage` como mecanismo de almacenamiento.

A futuro, evolucionará hacia una arquitectura moderna con React y Supabase.

---

## Estado actual de la arquitectura (MVP funcional)

La aplicación ya implementa:

- Manejo de estado en memoria (`transactions`)
- Persistencia local (`localStorage`)
- Render dinámico del DOM
- Formateo de datos (moneda y fechas)
- Manejo de eventos (formularios y acciones)
- UI reactiva basada en cambios de estado

---

## Capas del sistema

### 1. Interfaz de usuario (UI)

Responsable de mostrar información al usuario e interactuar con él.

**Incluye:**
- Formulario de transacciones
- Lista de movimientos
- Panel de resumen (ingresos, gastos, balance)
- Select dinámico de categorías

---

### 2. Lógica de negocio

Encargada de procesar los datos y aplicar reglas.

**Funciones principales:**
- `createTransaction`
- `deleteTransaction`
- `calculateSummary`
- `updateCategories`

**Responsabilidades:**
- Crear y eliminar transacciones
- Calcular ingresos, gastos y balance
- Controlar categorías según tipo
- Validar datos básicos

---

### 3. Persistencia

Encargada de almacenar y recuperar datos.

**Implementación actual:**
- `localStorage`

**Funciones:**
- `loadTransactions`
- `saveTransactions`

---

### 4. Renderizado (UI dinámica)

Responsable de reflejar el estado en la interfaz.

**Funciones:**
- `renderTransactions`
- `updateUI`

**Características:**
- Render dinámico con `innerHTML`
- Ordenamiento por fecha (más reciente primero)
- Estado vacío controlado

---

### 5. Utilidades

Funciones auxiliares reutilizables.

**Incluye:**
- `formatCurrency` → formato COP
- `formatDate` → fecha legible
- `setDefaultDateTime` → fecha automática

---

## Flujo de la aplicación

1. El usuario llena el formulario
2. Se captura el evento `submit`
3. Se crea una nueva transacción
4. Se guarda en memoria (`transactions`)
5. Se persiste en `localStorage`
6. Se actualiza la interfaz (`updateUI`)
7. Se recalculan los valores del resumen

---

## Modelo de datos actual

```json
{
  "id": 1711300000000,
  "type": "ingreso",
  "amount": 1500000,
  "category": "trabajo",
  "date": "2026-03-24T18:54",
  "description": "Pago mensual"
}