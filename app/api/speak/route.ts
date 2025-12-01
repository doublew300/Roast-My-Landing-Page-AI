import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text, persona } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        console.log('ElevenLabs API Request - Key configured:', !!apiKey);

        if (!apiKey) {
            return NextResponse.json({ error: 'ElevenLabs API key not configured (Restart server to load .env)' }, { status: 500 });
        }

        // Voice IDs mapping
        const voices: Record<string, string> = {
            ramsay: '2EiwWnXFnvU5JabPnv8n', // Clyde (Deep/Assertive)
            jobs: 'piTKgcLEGmPE4e6mEKli',   // Nicole (Calm/Whispery)
            vc: 'IKne3meq5aSn9XLyUdCD',     // Charlie (Casual)
            zoomer: 'D38z5RcWu1voky8WS1ja'  // Fin (Energetic)
        };

        const voiceId = voices[persona] || voices['ramsay'];

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text: text.slice(0, 1000), // Limit length to save credits/latency
                model_id: "eleven_turbo_v2_5",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API Error:', errorText);
            return NextResponse.json({ error: `ElevenLabs Error: ${errorText}` }, { status: response.status });
        }

        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
            },
        });

    } catch (error: any) {
        console.error('Error generating audio:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
