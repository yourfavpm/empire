
export interface Asset {
    id: string;
    title: string;
    category: string;
    price: number;
    shortDescription: string;
    availableStock: number;
}

export interface MainCategory {
    category: string;
    count: number;
    assets: Asset[];
}

export interface Banner {
    id: string;
    content: string;
    link?: string;
    active: boolean;
    createdAt?: string;
}
