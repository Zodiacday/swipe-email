import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Swipe - Clean Your Inbox',
        short_name: 'Swipe',
        description: 'Dopamine-driven email cleanup with gestures and gamification.',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/apple-icon.png',
                sizes: '192x192',
                type: 'image/png',
            },
        ],
    }
}
