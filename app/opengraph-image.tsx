import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Roast My Landing Page AI'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0a',
                    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(249, 115, 22, 0.2) 0%, transparent 50%)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 130,
                        marginBottom: 20,
                    }}
                >
                    🔥
                </div>
                <div
                    style={{
                        fontSize: 80,
                        fontWeight: 900,
                        background: 'linear-gradient(to right, #fff, #ccc)',
                        backgroundClip: 'text',
                        color: 'transparent',
                        marginBottom: 20,
                        textAlign: 'center',
                        display: 'flex',
                    }}
                >
                    Roast My Site
                </div>
                <div
                    style={{
                        fontSize: 30,
                        color: '#f97316',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 4,
                    }}
                >
                    AI-Powered Brutality
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
