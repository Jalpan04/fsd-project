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
            languages?: {[key: string]: number};
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
    followers?: string[];
    following?: string[];
    followRequests?: User[]; // Or ID strings, but often populated

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
