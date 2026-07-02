export interface Product {
  id: string;
  name: string;
  koreanName?: string;
  type: string;
  volume: string;
  price: string;
  image: string;
}

export interface Collection {
  id: string;
  name: string;
  koreanName: string;
  tags: string[];
  description: string[];
  heroImage: string;
  heroPosition: 'left' | 'right';
  products: Product[];
}

export interface InstagramPost {
  id: string;
  image: string;
  alt: string;
  link: string;
}

export interface NavItem {
  label: string;
  href: string;
}
