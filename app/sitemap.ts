import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://roast-my-landing-page.ai' // Replace with actual domain

    // Get all roasts
    const { data: roasts } = await supabase
        .from('roasts')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

    const roastUrls = roasts?.map((roast) => ({
        url: `${baseUrl}/roast/${roast.id}`,
        lastModified: new Date(roast.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    })) ?? [];

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/gallery`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        ...roastUrls,
    ]
}
