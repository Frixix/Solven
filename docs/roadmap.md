# Roadmap del Proyecto

## Fase 0 — Planeación (Completada)
Objetivo: definir qué se va a construir y cómo.

### Logros
- Definición de la visión del proyecto
- Definición del MVP
- Creación de documentación base
- Definición de estructura inicial

---

## Fase 1 — MVP con HTML, CSS y JavaScript (Completada)

Objetivo: construir una aplicación funcional básica.

### Funcionalidades implementadas
- Registro de ingresos y gastos
- Visualización de lista de transacciones
- Eliminación de transacciones
- Cálculo automático de balance
- Persistencia con localStorage
- Formateo de moneda (COP)
- Manejo de fecha y hora automática
- Ordenamiento por fecha
- Categorías dinámicas

### Aprendizajes adquiridos
- Manipulación del DOM
- Manejo de eventos
- Formularios
- Estructuras de datos (arrays y objetos)
- Renderizado dinámico
- Persistencia local

---

## Fase 1.5 — Mejora del MVP (En progreso)

Objetivo: fortalecer la base antes de escalar a nuevas tecnologías.

### Funcionalidades a implementar
- Edición de transacciones
- Validaciones avanzadas en formularios
- Filtros por:
  - tipo
  - categoría
  - rango de fechas
- Mejoras de experiencia de usuario (feedback visual)
- Refactorización del código (posible modularización)

### Enfoque
- Mejorar calidad del código
- Reducir deuda técnica
- Preparar la migración a React

---

## Fase 2 — Persistencia avanzada con IndexedDB

Objetivo: mejorar el almacenamiento local.

### Funcionalidades
- Migración de localStorage a IndexedDB
- Manejo de grandes volúmenes de datos
- Estructura de almacenamiento más robusta

### Aprendizajes
- IndexedDB
- Programación asíncrona
- Modelado de datos en cliente

---

## Fase 3 — Migración a React

Objetivo: reconstruir la aplicación con arquitectura basada en componentes.

### Funcionalidades
- Componentización
- Separación clara de responsabilidades
- Manejo de estado reactivo
- Reutilización de componentes

### Aprendizajes
- useState
- useEffect
- props
- patrones de diseño en frontend
- arquitectura moderna

---

## Fase 4 — Integración con Supabase

Objetivo: habilitar sincronización entre dispositivos.

### Funcionalidades
- Registro e inicio de sesión de usuarios
- Persistencia en base de datos en la nube
- Sincronización de datos en tiempo real
- Acceso desde múltiples dispositivos

### Aprendizajes
- Autenticación
- Bases de datos relacionales
- Operaciones CRUD
- Integración frontend-backend

---

## Fase 5 — Escalado del producto

Objetivo: mejorar la aplicación a nivel funcional y visual.

### Posibles mejoras
- Dashboard con métricas y resúmenes
- Gráficas financieras
- Metas de ahorro
- Categorías personalizadas
- Gastos recurrentes
- Exportación de reportes
- Modo oscuro
- Diseño responsive avanzado
- Conversión a PWA (instalable)

---

## Enfoque general del roadmap

- Construcción incremental
- Validación continua de funcionalidades
- Prioridad en la comprensión antes que en la complejidad
- Evolución progresiva hacia tecnologías modernas