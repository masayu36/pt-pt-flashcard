import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const json = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
};

const readJsonBody = async (req) => {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const escapeSsml = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const createApiHandler = (env) => {
  const azureSpeechKey = env.AZURE_SPEECH_KEY;
  const azureSpeechRegion = env.AZURE_SPEECH_REGION;

  return async (req, res, next) => {
    if (req.method === 'POST' && req.url === '/api/tts') {
      if (!azureSpeechKey || !azureSpeechRegion) {
        return json(res, 500, {
          error: 'Azure Speech is not configured. Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env.',
        });
      }

      try {
        const { text, voiceName, rate } = await readJsonBody(req);
        if (!text || !voiceName) {
          return json(res, 400, { error: 'text and voiceName are required.' });
        }

        const speechRate = typeof rate === 'string' && rate.trim() ? rate.trim() : '1.0';

        const ssml = `
          <speak version="1.0" xml:lang="pt-PT">
            <voice name="${voiceName}">
              <prosody rate="${escapeSsml(speechRate)}">
                ${escapeSsml(text)}
              </prosody>
            </voice>
          </speak>
        `.trim();

        const response = await fetch(
          `https://${azureSpeechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
          {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': azureSpeechKey,
              'Content-Type': 'application/ssml+xml',
              'User-Agent': 'pt-pt-learning-app',
              'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
            },
            body: ssml,
          }
        );

        if (!response.ok) {
          const detail = await response.text();
          return json(res, response.status, {
            error: 'Azure TTS request failed.',
            detail,
          });
        }

        const arrayBuffer = await response.arrayBuffer();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'audio/mpeg');
        res.end(Buffer.from(arrayBuffer));
        return;
      } catch (error) {
        return json(res, 500, {
          error: 'Failed to synthesize speech.',
          detail: error instanceof Error ? error.message : String(error),
        });
      }
    }

    next();
  };
};

const apiPlugin = (env) => {
  const handler = createApiHandler(env);

  return {
    name: 'local-api-routes',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), apiPlugin(env)],
    server: {
      host: '127.0.0.1',
      port: 3000,
    },
    preview: {
      host: '127.0.0.1',
      port: 3000,
    },
  };
});
