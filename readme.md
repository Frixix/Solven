# Solventa

Aplicación web personal para llevar el control de ingresos, gastos, balance, categorías y resúmenes financieros.

## estructura básica 
finanzas-app/
├── README.md
├── ESTADO_DEL_PROYECTO.md
├── ROADMAP.md
├── ARQUITECTURA.md
├── REQUISITOS.md
├── DECISIONES_TECNICAS.md
├── IDEAS_FUTURAS.md
├── INSTRUCCIONES_IA.md
│
├── src/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
│
└── assets/
    └── img/
    
## Objetivo

Construir una app sencilla, escalable y gratuita para uso personal, desarrollada inicialmente con HTML, CSS y JavaScript, y posteriormente migrada a React con integración de Supabase para sincronización entre dispositivos.

## Visión del proyecto

La app debe permitir:

- Registrar ingresos y gastos
- Visualizar historial de movimientos
- Filtrar por fecha, categoría y tipo
- Ver balance general
- Guardar la información localmente
- Escalar hacia una solución con sincronización en la nube
- Ser accesible desde PC y celular

## Tecnologías planeadas

### Fase 1
- HTML
- CSS
- JavaScript
- localStorage

### Fase 2
- IndexedDB

### Fase 3
- React

### Fase 4
- Supabase
- Autenticación
- Base de datos en la nube

## MVP inicial

La primera versión debe incluir:

- Registro de ingresos y gastos
- Listado de transacciones
- Eliminación de transacciones
- Cálculo automático del balance
- Persistencia local

## Escalabilidad futura

Más adelante, el proyecto podrá incluir:

- Edición de transacciones
- Dashboard con gráficas
- Presupuesto mensual
- Metas de ahorro
- Exportación de datos
- Modo oscuro
- Sincronización completa entre dispositivos
- Sistema de autenticación

## Filosofía de desarrollo

El proyecto se construirá por fases, priorizando:

1. Comprensión de la lógica
2. Simplicidad inicial
3. Escalabilidad progresiva
4. Buenas prácticas
5. Aprendizaje real del stack

## Estado actual

Actualmente el proyecto está en etapa de planificación y definición de arquitectura.

## Próximo paso

Diseñar el MVP en HTML, CSS y JavaScript antes de migrar a React.