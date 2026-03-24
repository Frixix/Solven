# Arquitectura del Proyecto

## Enfoque general

El proyecto se desarrollará de forma incremental, comenzando por una versión simple en frontend puro y evolucionando hacia una arquitectura moderna basada en React y Supabase.

---

## Etapa 1: Arquitectura simple

### Capas principales
- Interfaz de usuario
- Lógica de negocio
- Persistencia local

### Componentes funcionales
- Formulario de transacción
- Lista de transacciones
- Panel de balance
- Sistema de filtros
- Módulo de almacenamiento

### Flujo básico
1. El usuario registra una transacción
2. La información se valida
3. Se guarda localmente
4. Se actualiza el estado visual
5. Se recalculan balances y resúmenes

---

## Modelo de datos inicial

```json
{
  "id": "uuid-o-timestamp",
  "tipo": "ingreso",
  "monto": 120000,
  "categoria": "salario",
  "fecha": "2026-03-23",
  "descripcion": "Pago mensual"
}