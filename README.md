# LDN Marc – Plataforma Full Stack

Este repositorio contiene una solución full stack compuesta por un frontend desarrollado en Angular y un backend basado en Node.js y Express. El proyecto está estructurado siguiendo criterios de mantenibilidad, escalabilidad y separación de responsabilidades, con el objetivo de facilitar su integración en entornos corporativos y flujos de trabajo profesionales. Además, este proyecto forma parte de mi portfolio personal y refleja mi forma de trabajar, mis decisiones técnicas y mi enfoque profesional en el desarrollo de software.

---------------------------------------------------------------------

## 1. Arquitectura General

La solución se organiza en dos módulos independientes:

- marc-app: Aplicación cliente desarrollada con Angular, orientada a ofrecer una experiencia de usuario rápida, modular y extensible.
- marc-back: API REST construida con Node.js y Express, diseñada para ser segura, eficiente y fácilmente integrable con servicios externos.

Ambos módulos pueden desplegarse de forma independiente o conjunta, según los requisitos del entorno.

---------------------------------------------------------------------

## 2. Mi Rol en el Proyecto

He desarrollado íntegramente tanto el frontend como el backend. Las decisiones técnicas adoptadas se han orientado a:

- Garantizar una arquitectura clara y mantenible.
- Facilitar la escalabilidad del proyecto.
- Asegurar una comunicación eficiente entre cliente y servidor.
- Mantener un código limpio, modular y fácil de extender.
- Aplicar estándares profesionales adecuados para entornos corporativos.

Este proyecto representa mi forma de entender el desarrollo: ordenado, orientado a resultados y con atención al detalle.

---------------------------------------------------------------------

## 3. Tecnologías Utilizadas

### Frontend (marc-app)
- Angular
- TypeScript
- Arquitectura modular
- Servicios, interceptores y componentes reutilizables

### Backend (marc-back)
- Node.js + Express
- TypeScript
- Controladores y servicios desacoplados
- Middlewares personalizados
- Preparación para integración con bases de datos y autenticación

---------------------------------------------------------------------

## 4. Requisitos Técnicos

- Node.js (versión LTS)
- npm o yarn
- Angular CLI
- Entorno de desarrollo compatible con TypeScript

---------------------------------------------------------------------

## 5. Instalación

### Frontend

cd marc-app
npm install

### Backend

cd marc-back
npm install

---------------------------------------------------------------------

## 6. Ejecución en Desarrollo

### Frontend

npm start

Disponible en:
http://localhost:4200

### Backend

npm run dev

Disponible en:
http://localhost:3000

---------------------------------------------------------------------

## 7. Variables de Entorno

Cada módulo utiliza su propio archivo .env, que debe configurarse antes de ejecutar la aplicación.  
Estos archivos no se incluyen en el repositorio por motivos de seguridad.

Ejemplo para el backend:

PORT=3000  
DATABASE_URL=...  
JWT_SECRET=...

---------------------------------------------------------------------

## 8. Estándares de Calidad

El proyecto sigue prácticas recomendadas para entornos profesionales:

- Estructura modular y desacoplada
- Uso de TypeScript en ambos módulos
- Formateo consistente mediante Prettier
- Separación clara entre lógica de negocio, controladores y servicios
- Preparación para despliegues en contenedores o plataformas cloud
- Código orientado a mantenibilidad y escalabilidad

---------------------------------------------------------------------

## 9. Decisiones de Arquitectura (Enfoque Portfolio)

- Separación completa entre frontend y backend para facilitar despliegues independientes.
- Uso de TypeScript en ambos módulos para mejorar la robustez del código.
- Estructura basada en principios de clean architecture.
- Configuración de entornos mediante .env para mantener la seguridad y flexibilidad.
- Preparación para CI/CD y despliegues en plataformas modernas.
- Organización clara de controladores, servicios y middlewares en el backend.
- Componentización y modularización en el frontend.

Estas decisiones reflejan mi enfoque profesional y mi capacidad para diseñar soluciones escalables y bien estructuradas.

---------------------------------------------------------------------

## 10. Despliegue

La arquitectura permite despliegues independientes:

- Frontend: plataformas de hosting estático o CDNs.
- Backend: servidores Node, contenedores Docker o servicios cloud.

---------------------------------------------------------------------

## 11. Objetivo del Proyecto

Este repositorio forma parte de mi marca personal y representa mi forma de trabajar:  
soluciones claras, bien estructuradas y orientadas a aportar valor real.

Mi intención es seguir ampliándolo con nuevas funcionalidades, integraciones y mejoras técnicas.

---------------------------------------------------------------------

## 12. Contacto

Para más información sobre mi trabajo o para colaborar en proyectos profesionales, puedes ponerte en contacto conmigo a través de los canales habituales.

---------------------------------------------------------------------

## 13. Licencia

Proyecto desarrollado por Marc Lidón. Uso autorizado para fines profesionales y corporativos.

