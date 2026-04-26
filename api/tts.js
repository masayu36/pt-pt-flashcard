const json = (res, status, payload) => {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(payload));
};

const escapeSsml = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed.' });
  }

  const azureSpeechKey = process.env.AZURE_SPEECH_KEY;
  const azureSpeechRegion = process.env.AZURE_SPEECH_REGION;

  if (!azureSpeechKey || !azureSpeechRegion) {
    return json(res, 500, {
      error: 'Azure Speech is not configured. Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.',
    });
  }

  try {
    const { text, voiceName, rate } = req.body ?? {};

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
    res.status(200).setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    return json(res, 500, {
      error: 'Failed to synthesize speech.',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
