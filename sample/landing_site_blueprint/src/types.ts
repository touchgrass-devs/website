export interface ServiceSubCategory {
  title: string;
  description: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  tagline: string;
  description: string;
  iconName: string; // Used to dynamically map Lucide icons
  subServices: ServiceSubCategory[];
  accentColor: string;
}

export interface TechItem {
  name: string;
  category: "frontend" | "backend" | "ai" | "tools";
}

export interface TechCategory {
  title: string;
  items: TechItem[];
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  serviceCategory: string;
  budget: string;
  message: string;
  createdAt: string;
  status: 'new' | 'reviewed' | 'contacted';
}
