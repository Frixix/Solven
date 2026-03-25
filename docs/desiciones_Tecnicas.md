# Decisiones Técnicas

## Decisión 1
Se inició el desarrollo utilizando HTML, CSS y JavaScript puro antes de introducir frameworks como React.

### Motivo
Permite comprender de forma sólida los fundamentos del desarrollo frontend, incluyendo manipulación del DOM, eventos, estructuras de datos y flujo de la aplicación, evitando depender de abstracciones prematuras.

---

## Decisión 2
Se implementó un manejo de estado centralizado mediante un array en memoria (`transactions`).

### Motivo
Facilita el control de la lógica de la aplicación, permitiendo que toda la interfaz se base en una única fuente de verdad (Single Source of Truth), simplificando el renderizado y la sincronización de datos.

---

## Decisión 3
Se utilizó `localStorage` como mecanismo de persistencia inicial.

### Motivo
Proporciona una solución sencilla y suficiente para un MVP, permitiendo almacenar datos en el navegador sin necesidad de backend, lo que reduce complejidad y acelera el desarrollo.

---

## Decisión 4
Se definió un modelo de datos simple y serializable en formato JSON.

### Motivo
Facilita el almacenamiento, la lectura y la futura migración hacia otras tecnologías como IndexedDB o bases de datos remotas, manteniendo consistencia en la estructura de la información.

---

## Decisión 5
Se implementó renderizado dinámico mediante manipulación directa del DOM.

### Motivo
Permite comprender el funcionamiento interno de la actualización de la interfaz, sentando bases sólidas antes de migrar a frameworks que abstraen este comportamiento.

---

## Decisión 6
Se separaron responsabilidades en funciones específicas (render, lógica, persistencia, utilidades).

### Motivo
Mejora la mantenibilidad del código, facilita la lectura y permite escalar el proyecto sin generar acoplamientos innecesarios.

---

## Decisión 7
Se implementó formateo de datos en la capa de presentación (moneda y fechas).

### Motivo
Permite mantener los datos en un formato limpio y estándar internamente, mientras se presentan de forma amigable al usuario, siguiendo buenas prácticas de separación entre datos y visualización.

---

## Decisión 8
Se utilizó el tipo `datetime-local` para el manejo de fechas en el formulario.

### Motivo
Permite capturar fecha y hora de forma estructurada, facilitando el ordenamiento, almacenamiento y futura interoperabilidad con sistemas externos.

---

## Decisión 9
Se implementó lógica dinámica para categorías basada en el tipo de transacción.

### Motivo
Mejora la experiencia del usuario y reduce errores de entrada, además de estructurar mejor los datos para futuras funcionalidades como filtros o análisis.

---

## Decisión 10
Las transacciones se ordenan por fecha en el momento del renderizado.

### Motivo
Evita modificar directamente el estado original y permite mantener consistencia en los datos, aplicando transformaciones únicamente en la capa de presentación.

---

## Decisión 11
Se añadió confirmación antes de eliminar transacciones.

### Motivo
Previene errores del usuario y mejora la seguridad de la información dentro de la aplicación.

---

## Decisión 12
El desarrollo se realiza por fases incrementales.

### Motivo
Permite validar cada etapa del proyecto antes de avanzar, reducir complejidad, mejorar el aprendizaje y mantener control sobre la evolución del sistema.

---

## Decisión 13
Se planifica migrar a IndexedDB como siguiente paso en persistencia local.

### Motivo
Ofrece mayor capacidad, mejor estructura y soporte para aplicaciones más complejas sin necesidad de backend inmediato.

---

## Decisión 14
Se planifica migrar a React en una etapa posterior.

### Motivo
Permite aprovechar una arquitectura basada en componentes y manejo de estado más robusto, una vez comprendidos los fundamentos del frontend.

---

## Decisión 15
Se planifica integrar Supabase para autenticación y base de datos en la nube.

### Motivo
Permite sincronización entre dispositivos, almacenamiento persistente y gestión de usuarios sin necesidad de construir un backend propio desde cero.