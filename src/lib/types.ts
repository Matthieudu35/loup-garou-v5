export interface User {
    login: string;
    firstName: string;
    lastName?: string;
    isAdmin: boolean;
    isCurrentUser?: boolean;
    isAlive: boolean;
    role?: string;
    photoUrl?: string;
    isMayor?: boolean;
    password?: string;
}

export interface Association {
    login: string;
    author: string;
    timestamp: number;
    sourceLogin: string;
    targetLogin: string;
    role: string;
    isWolf: boolean;
}

export interface Memo {
    text: string;
    timestamp: number;
} 