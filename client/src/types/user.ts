export interface User {
    _id: string;
    username: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
    headline?: string;
    bio?: string;
    location?: string;
    website?: string;
    skills?: string[];
    createdAt?: string;

    // Arrays
    projects?: Project[];
    certificates?: Certificate[];

    // Social Links
    socials?: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        instagram?: string;
        blog?: string;
        kaggle?: string;
        huggingface?: string;
    };

    // Stats
    stats?: {
        github?: {
            followers: number;
            following: number;
            public_repos: number;
            total_stars: number;
            languages?: { [key: string]: number };
            username?: string;
        };
        leetcode?: {
            username: string;
            ranking: number;
            total_solved: number;
            easy_solved?: number;
            medium_solved?: number;
            hard_solved?: number;
        };
        kaggle?: {
            username: string;
        };
        huggingface?: {
            username: string;
        };
    };

    // Social Graph
    followers?: User[];
    following?: User[];
    followRequests?: User[];

    // Integrations
    integrations?: {
        github?: {
            username?: string;
            accessToken?: string;
            lastSync?: string;
            stats?: any;
        };
        leetcode?: {
            username?: string;
            lastSync?: string;
            stats?: {
                ranking: number;
                total_solved: number;
                easy_solved: number;
                medium_solved: number;
                hard_solved: number;
                total_questions?: number;
                easy_questions?: number;
                medium_questions?: number;
                hard_questions?: number;
                last_synced: string;
            };
        };
        kaggle?: {
            username?: string;
            apiKey?: string;
            lastSync?: string;
            stats?: any;
        };
        huggingface?: {
            username?: string;
            accessToken?: string;
            lastSync?: string;
            stats?: {
                username: string;
                profile_url: string;
                models_count: number;
                spaces_count: number;
                total_likes: number;
                total_downloads: number;
                last_synced: string;
            };
        };
    };

    profileSections?: ProfileSection[];
}

export interface Project {
    title: string;
    description: string;
    link?: string;
    tags?: string[];
    image?: string | null;
}

export interface Certificate {
    name: string;
    issuer: string;
    date?: string;
    link?: string;
}

export interface ProfileSection {
    id: string;
    type: string;
    title: string;
    content?: any; // To be refined
    isVisible: boolean;
}
