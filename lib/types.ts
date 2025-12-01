export interface RoastRequest {
    url: string;
    persona?: 'ramsay' | 'jobs' | 'vc' | 'zoomer';
}

export interface RoastResponse {
    score: number;
    roast: string;
    pro_tips: string[];
}

export interface RoastResult {
    roast: string;
    score: number;
    pro_tips: string[];
    image: string;
}
