export interface Business {
  id: string;
  name: string;
  description: string;
  industry: string;
  youtube_video_url: string | null;
  website_url: string | null;
  social_links: { [key: string]: string };
  owner_id: string;
  created_at: string;
  featured: boolean;
  rating: number;
  phone: string | null;
  email: string | null;
  category_id: string | null;
  visitor_count: number;
  total_ratings: number;
}

export interface Profile {
  id: string;
  role: 'admin' | 'student';
  full_name: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  created_at: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price: number;
  created_at: string;
}

export interface TeamMember {
  id: string;
  business_id: string;
  name: string;
  role: string;
  is_captain: boolean;
  created_at: string;
}

export interface ValuePropositionCanvas {
  id: string;
  business_id: string;
  customer_jobs: string[];
  pains: string[];
  gains: string[];
  products_services: string[];
  pain_relievers: string[];
  gain_creators: string[];
  created_at: string;
  updated_at: string;
}

export interface BusinessModelCanvas {
  id: string;
  business_id: string;
  key_partners: string[];
  key_activities: string[];
  key_resources: string[];
  value_propositions: string[];
  customer_relationships: string[];
  channels: string[];
  customer_segments: string[];
  cost_structure: string[];
  revenue_streams: string[];
  created_at: string;
  updated_at: string;
}