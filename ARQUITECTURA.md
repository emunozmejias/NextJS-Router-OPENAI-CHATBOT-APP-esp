# ARQUITECTURA — OpenAI Chatbot

## 1. Objetivo de la aplicación

Esta aplicación es un **chatbot web** que permite a los usuarios mantener conversaciones con modelos de lenguaje de OpenAI (GPT-4o y GPT-3.5 Turbo) a través de una interfaz moderna. Los objetivos son:

- Ofrecer un chat en tiempo real con **respuestas en streaming** (el texto aparece progresivamente).
- Permitir **elegir el modelo** (GPT-4o o GPT-3.5 Turbo) según la tarea.
- **Persistir el historial de conversación** y el modelo seleccionado en el navegador (localStorage).
- Exponer un endpoint de **transcripción de audio** con Whisper de OpenAI para uso futuro (p. ej. entrada por voz).
- Mantener la **clave de API** fuera del frontend, usando un archivo `.env` en el servidor.

---

## 2. Arquitectura general

La aplicación sigue una arquitectura **cliente–servidor** con Next.js App Router:

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR (cliente)                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  React + Vercel AI SDK (useChat)                             │ │
│  │  ChatInterface → MessageList, InputField, ModelSelector, etc.│ │
│  └───────────────────────────┬─────────────────────────────────┘ │
│                              │ POST /api/openai/chat             │
│                              │ (messages, model)                 │
│                              ▼                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                    NEXT.JS (servidor)                             │
│  ┌──────────────────────────▼──────────────────────────────────┐│
│  │  API Routes                                                  ││
│  │  • /api/openai/chat    → Edge, streamText (GPT-4o / 3.5)     ││
│  │  • /api/openai/transcribe → Node, Whisper (audio → texto)    ││
│  └──────────────────────────┬──────────────────────────────────┘│
│                              │                                     │
│                              ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  Variables de entorno: OPENAI_API_KEY (desde .env)           ││
│  └──────────────────────────┬──────────────────────────────────┘│
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                     OPENAI API                                    │
│  • Chat Completions (GPT-4o, gpt-3.5-turbo) — streaming          │
│  • Whisper (transcripción de audio)                               │
└──────────────────────────────────────────────────────────────────┘
```

- **Frontend**: React con componentes en `src/components`, estado de chat con el hook `useChat` del Vercel AI SDK y persistencia en `localStorage`.
- **Backend**: Rutas API bajo `src/app/api/openai/` que reciben peticiones, validan y llaman a OpenAI usando la API key del `.env`.
- **OpenAI**: Se usa desde el servidor (Next.js); la API key nunca se expone al cliente.

---

## 3. Componentes de la aplicación

### 3.1 Capa de aplicación (App Router)

| Ruta / archivo | Responsabilidad |
|----------------|------------------|
| `src/app/layout.tsx` | Layout raíz, metadatos, tema oscuro y estilos globales. |
| `src/app/page.tsx` | Página principal; renderiza solo `<ChatInterface />`. |
| `src/app/globals.css` | Estilos globales y variables CSS (Tailwind). |

### 3.2 Rutas API (backend)

| Ruta | Runtime | Función |
|------|---------|--------|
| `src/app/api/openai/chat/route.ts` | **Edge** | Recibe `messages` y `model`, valida `OPENAI_API_KEY`, llama a `streamText` con el AI SDK y devuelve la respuesta en streaming. |
| `src/app/api/openai/transcribe/route.ts` | **Node** | Recibe audio en base64, lo guarda en un archivo temporal, llama a Whisper (`whisper-1`) y devuelve la transcripción en JSON. |

### 3.3 Componentes de UI (`src/components/`)

| Componente | Descripción |
|------------|-------------|
| **ChatInterface** | Contenedor principal: integra `useChat`, selector de modelo, lista de mensajes, input, botones de nueva conversación y borrar, y persistencia en localStorage. |
| **MessageList** | Lista de mensajes con scroll automático; muestra estado vacío con sugerencias y un indicador de “escribiendo…” mientras llega la respuesta. |
| **MessageBubble** | Un mensaje (usuario o asistente); renderiza Markdown en respuestas del asistente (react-markdown) y botón de copiar. |
| **InputField** | Área de texto para escribir, enviar con Enter, detener generación; indicadores de carga y atajos de teclado. |
| **ModelSelector** | Desplegable para elegir GPT-4o o GPT-3.5 Turbo; valor sincronizado con estado y localStorage. |
| **ErrorDisplay** | Muestra errores de la API y opción de reintentar. |
| **LoadingIndicator** | Spinner, indicador “AI is thinking…” (TypingIndicator) y loader de página (PageLoader). |

### 3.4 Librería compartida (`src/lib/`)

| Archivo | Contenido |
|---------|-----------|
| `types.ts` | Tipos: `ModelType`, `ChatMessage`, `Conversation`, `AVAILABLE_MODELS`, `LOCAL_STORAGE_KEYS`, etc. |
| `hooks/useChatHistory.ts` | Hook para cargar/guardar historial y modelo en localStorage (usado como apoyo; el flujo principal usa `useChat` en `ChatInterface`). |
| `hooks/useLocalStorage.ts` | Utilidad para leer/escribir en localStorage de forma tipada. |
| `hooks/index.ts` | Reexporta los hooks. |

---

## 4. Integración con OpenAI

### 4.1 Chat (texto en streaming)

- **Ubicación**: `src/app/api/openai/chat/route.ts`.
- **SDK**: `@ai-sdk/openai` (Vercel AI SDK) y `ai` (core).
- **Flujo**:
  1. Se crea el cliente con `createOpenAI({ apiKey: process.env.OPENAI_API_KEY })`.
  2. Se valida que exista `OPENAI_API_KEY`; si no, se responde 501.
  3. Se reciben `messages` y `model` en el body del POST.
  4. Se valida el modelo (`gpt-4o` o `gpt-3.5-turbo`) y los mensajes.
  5. Se llama a `streamText()` con el modelo elegido, un system prompt fijo y parámetros (maxTokens, temperature).
  6. Se devuelve `result.toDataStreamResponse()` para que el cliente consuma el stream con `useChat`.

El **frontend** usa `useChat` de `ai/react` con `api: '/api/openai/chat'` y `body: { model: selectedModel }`; el SDK se encarga de enviar el historial y de parsear el stream.

### 4.2 Transcripción de audio (Whisper)

- **Ubicación**: `src/app/api/openai/transcribe/route.ts`.
- **SDK**: paquete oficial `openai` (constructor `new OpenAI({ apiKey: process.env.OPENAI_API_KEY })`).
- **Flujo**:
  1. Se comprueba `OPENAI_API_KEY`; si falta, se responde 501.
  2. Se recibe el cuerpo con `audio` en base64.
  3. Se escribe un archivo temporal (p. ej. WAV), se pasa a `openai.audio.transcriptions.create({ file, model: "whisper-1" })`.
  4. Se elimina el archivo temporal y se devuelve la transcripción en JSON.

Esta ruta está preparada para ser llamada desde el frontend (p. ej. cuando se añada entrada por voz); de momento el chat solo usa texto.

### 4.3 Configuración y seguridad

- La **API key** se lee únicamente de **variables de entorno** (archivo `.env` en la raíz), nunca se envía al navegador.
- En las rutas se valida la presencia de `OPENAI_API_KEY` y se devuelven errores claros (501, 401, 429, 500) según el caso.

---

## 5. Lenguajes, frameworks y versiones

### 5.1 Entorno de ejecución

| Tecnología | Versión / requisito |
|------------|----------------------|
| Node.js | ≥ 18.17.0 (recomendado: 20.x LTS) |

### 5.2 Lenguajes

| Lenguaje | Uso |
|----------|-----|
| **TypeScript** | Todo el código (app, API, componentes, lib). Versión en dev: `typescript: ^5`. |
| **CSS** | Estilos globales y Tailwind (PostCSS). |

### 5.3 Frameworks y librerías principales

| Paquete | Versión (package.json) | Uso |
|---------|-------------------------|-----|
| **Next.js** | 14.2.7 | Framework full-stack, App Router, API Routes, SSR/CSR. |
| **React** | ^18 | UI y componentes. |
| **react-dom** | ^18 | Renderizado en el DOM. |
| **Tailwind CSS** | ^3.4.1 | Estilos utilitarios y tema. |
| **TypeScript** | ^5 | Tipado estático. |

### 5.4 Integración con OpenAI y AI

| Paquete | Versión | Uso |
|---------|---------|-----|
| **@ai-sdk/openai** | ^0.0.54 | Proveedor OpenAI para el AI SDK (createOpenAI, modelos). |
| **ai** | ^3.3.20 | Vercel AI SDK: streamText, useChat, tipos de mensajes. |
| **openai** | (incluido por dependencias) | Cliente oficial para Whisper en la ruta de transcribe. |

### 5.5 UI y utilidades

| Paquete | Versión | Uso |
|---------|---------|-----|
| **react-markdown** | ^9.0.1 | Renderizado de respuestas en Markdown (código, listas, enlaces, etc.). |
| **lucide-react** | ^0.436.0 | Iconos (Send, Bot, User, Copy, etc.). |
| **date-fns** | ^3.6.0 | Fechas (si se usa en tipos o helpers). |

### 5.6 Desarrollo y calidad de código

| Paquete | Versión | Uso |
|---------|---------|-----|
| **eslint** | ^8 | Linting. |
| **eslint-config-next** | 14.2.7 | Reglas ESLint para Next.js. |
| **postcss** | ^8 | Procesamiento de CSS (Tailwind). |
| **@types/node** | ^20 | Tipos para Node.js. |
| **@types/react** / **@types/react-dom** | ^18 | Tipos para React. |

Otras dependencias presentes en el proyecto (firebase, replicate, framer-motion, etc.) forman parte del template y no son necesarias para el flujo principal del chatbot; el núcleo de la aplicación depende de **Next.js**, **React**, **Vercel AI SDK**, **OpenAI (AI SDK + Whisper)** y **Tailwind**.

---

## Resumen

- **Objetivo**: Chatbot web con OpenAI (GPT-4o / GPT-3.5), streaming, historial en localStorage y API de transcripción con Whisper.
- **Arquitectura**: Next.js App Router, frontend React + useChat, backend en rutas API que llaman a OpenAI con la clave desde `.env`.
- **Componentes**: ChatInterface, MessageList, MessageBubble, InputField, ModelSelector, ErrorDisplay, LoadingIndicator; tipos y hooks en `lib`.
- **OpenAI**: Chat vía `@ai-sdk/openai` + `streamText`; transcripción vía cliente `openai` y modelo `whisper-1`.
- **Stack**: Node ≥ 18.17, TypeScript 5, Next.js 14, React 18, Tailwind 3, Vercel AI SDK y cliente oficial de OpenAI.
