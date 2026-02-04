# Next.js OpenAI Chatbot

Chatbot con Next.js App Router que usa la API de OpenAI (chat y transcripción con Whisper).

## Requisitos

- **Node.js**: 18.17 o superior (recomendado: 20.x LTS)

## Variables de entorno

El proyecto usa un archivo **`.env`** en la raíz para las variables de entorno (no los Secrets de Replit).

1. Crea un archivo `.env` en la raíz del proyecto.
2. Añade tu clave de OpenAI:

```env
OPENAI_API_KEY=sk-tu-clave-aqui
```

Puedes copiar `.env.example` a `.env` y rellenar el valor:

```bash
cp .env.example .env
```

Obtén una API key en [OpenAI API Keys](https://platform.openai.com/api-keys).

## Desarrollo

```bash
npm run dev
```

## Build y producción

```bash
npm run build
npm run start
```

## Docker

Asegúrate de tener un archivo `.env` con `OPENAI_API_KEY` en la raíz del proyecto.

**Compilar y ejecutar con Docker Compose:**

```bash
docker-compose up --build
```

La aplicación quedará disponible en **http://localhost:3000**.

Para ejecutar en segundo plano:

```bash
docker-compose up -d --build
```

**Solo con Docker (sin compose):**

```bash
docker build -t openai-chatbot .
docker run -p 3000:3000 --env-file .env openai-chatbot
```
