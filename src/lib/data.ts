export type ProFilter =
  | "Residential"
  | "Commercial"
  | "Repair"
  | "New Install"
  | "Solar Ready";

export type MaterialCategory =
  | "All Materials"
  | "Aluminum Roofing"
  | "Stone Coated Tiles"
  | "Roofing Accessories";

export type Professional = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  verified: boolean;
  certified: boolean;
  filters: ProFilter[];
  tags: string[];
  about: string;
  avatar: string;
  projects: number;
  satisfaction: number;
  yearsOnLapace: number;
  credentials: { title: string; subtitle: string; icon: string }[];
  portfolio: { title: string; subtitle: string; image: string }[];
};

export type Material = {
  id: string;
  name: string;
  category: Exclude<MaterialCategory, "All Materials">;
  label: string;
  description: string;
  badge?: "In Stock" | "Best Seller";
  image: string;
};

export type Project = {
  id: string;
  title: string;
  type: string;
  image: string;
};

export const professionals: Professional[] = [
  {
    id: "james-construction",
    name: "James Construction",
    specialty: "Residential re-roofing specialist",
    rating: 4.9,
    reviews: 124,
    verified: true,
    certified: true,
    filters: ["Residential", "Repair", "New Install"],
    tags: ["Corrugated Aluminum", "Storm Repair"],
    about:
      "Trusted residential roofing crew focused on aluminum and stone-coated installs across Lagos.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    projects: 180,
    satisfaction: 97,
    yearsOnLapace: 4,
    credentials: [
      {
        title: "Licensed Contractor",
        subtitle: "State Board Certified",
        icon: "assignment",
      },
      {
        title: "Fully Insured",
        subtitle: "$2M Liability Coverage",
        icon: "shield",
      },
      {
        title: "Lapace Approved Installer",
        subtitle: "Tier 1 Partner",
        icon: "verified",
      },
    ],
    portfolio: [
      {
        title: "Modern Residential Setup",
        subtitle: "Stone Coated Shingles",
        image:
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Estate Re-roof",
        subtitle: "Longspan Aluminum",
        image:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "apex-roofing",
    name: "Apex Roofing Co.",
    specialty: "Expert in modern residential re-roofing",
    rating: 4.9,
    reviews: 124,
    verified: true,
    certified: false,
    filters: ["Residential", "Repair"],
    tags: ["Asphalt Shingles", "Emergency Tarping"],
    about:
      "Specializing in modern residential re-roofing and storm damage repair. Over 15 years of industry experience.",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    projects: 210,
    satisfaction: 96,
    yearsOnLapace: 6,
    credentials: [
      {
        title: "Licensed Contractor",
        subtitle: "State Board Certified",
        icon: "assignment",
      },
      {
        title: "Fully Insured",
        subtitle: "$1M Liability Coverage",
        icon: "shield",
      },
      {
        title: "Lapace Verified",
        subtitle: "Marketplace Partner",
        icon: "verified",
      },
    ],
    portfolio: [
      {
        title: "Storm Recovery Install",
        subtitle: "Emergency Tarping + Rebuild",
        image:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Family Home Refresh",
        subtitle: "Asphalt Shingles",
        image:
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "solid-structure",
    name: "Solid Structure",
    specialty: "Commercial flat roof systems",
    rating: 4.8,
    reviews: 89,
    verified: true,
    certified: true,
    filters: ["Commercial", "New Install"],
    tags: ["Flat Roofs", "TPO / EPDM"],
    about:
      "Commercial flat roofs and high-durability coatings. Certified master installers for leading material brands.",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    projects: 140,
    satisfaction: 98,
    yearsOnLapace: 5,
    credentials: [
      {
        title: "Licensed Contractor",
        subtitle: "Commercial Certified",
        icon: "assignment",
      },
      {
        title: "Fully Insured",
        subtitle: "$5M Liability Coverage",
        icon: "shield",
      },
      {
        title: "Lapace Approved Installer",
        subtitle: "Tier 1 Partner",
        icon: "verified",
      },
    ],
    portfolio: [
      {
        title: "Warehouse Complex",
        subtitle: "Industrial Aluminum",
        image:
          "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Retail Plaza Roof",
        subtitle: "TPO Membrane",
        image:
          "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "horizon-installers",
    name: "Horizon Installers",
    specialty: "Solar-ready metal roofing",
    rating: 5.0,
    reviews: 42,
    verified: false,
    certified: false,
    filters: ["Residential", "Commercial", "Solar Ready", "New Install"],
    tags: ["Solar Ready", "Metal Roofing"],
    about:
      "Your go-to experts for solar-ready roofing solutions and modern architectural shingles.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    projects: 95,
    satisfaction: 99,
    yearsOnLapace: 3,
    credentials: [
      {
        title: "Solar Integration Trained",
        subtitle: "Panel-ready installs",
        icon: "assignment",
      },
      {
        title: "Fully Insured",
        subtitle: "$2M Liability Coverage",
        icon: "shield",
      },
    ],
    portfolio: [
      {
        title: "Solar-Ready Villa",
        subtitle: "Metal Roofing",
        image:
          "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Commercial Canopy",
        subtitle: "Architectural Metal",
        image:
          "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "john-mitchell",
    name: "John Mitchell",
    specialty: "Expert in Stone Coated Tiles",
    rating: 4.95,
    reviews: 76,
    verified: true,
    certified: true,
    filters: ["Residential", "Commercial", "Repair"],
    tags: ["Residential", "Commercial", "Repairs"],
    about:
      "Specializing in high-durability stone coated roofing systems. We prioritize structural integrity and precise installation techniques to ensure long-lasting performance in all weather conditions.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    projects: 150,
    satisfaction: 98,
    yearsOnLapace: 5,
    credentials: [
      {
        title: "Licensed Contractor",
        subtitle: "State Board Certified",
        icon: "assignment",
      },
      {
        title: "Fully Insured",
        subtitle: "$2M Liability Coverage",
        icon: "shield",
      },
      {
        title: "Lapace Approved Installer",
        subtitle: "Tier 1 Partner",
        icon: "verified",
      },
    ],
    portfolio: [
      {
        title: "Modern Residential Setup",
        subtitle: "Stone Coated Shingles",
        image:
          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Commercial Installation",
        subtitle: "Heavy Duty Corrugated",
        image:
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];

export const materials: Material[] = [
  {
    id: "milano-profile-tile",
    name: "Milano Profile Tile",
    category: "Stone Coated Tiles",
    label: "Stone Coated",
    description:
      "Premium stone-coated steel roof tile offering a classic Mediterranean aesthetic with modern industrial resilience.",
    badge: "In Stock",
    image:
      "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "longspan-corrugated",
    name: "Longspan Corrugated Sheet",
    category: "Aluminum Roofing",
    label: "Aluminum",
    description:
      "High-tensile aluminum roofing sheets ideal for commercial and residential applications requiring rapid installation.",
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1504328345604-1f17e69c45c2?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "ridge-cap-assembly",
    name: "Ridge Cap Assembly",
    category: "Roofing Accessories",
    label: "Accessories",
    description:
      "Precision-formed ridge caps ensuring weather-tight seals and architectural continuity for peaked roof designs.",
    badge: "In Stock",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "aluminum-coils",
    name: "Aluminum Coils",
    category: "Aluminum Roofing",
    label: "Industrial Grade",
    description:
      "Durable, lightweight, and resistant to corrosion. Ideal for custom corrugation and large-scale projects.",
    badge: "In Stock",
    image:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "stone-coated-tiles",
    name: "Stone Coated Tiles",
    category: "Stone Coated Tiles",
    label: "Premium Finish",
    description:
      "Elegant aesthetics combined with exceptional weather resistance for homes and estates.",
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=900&q=80",
  },
];

export const projects: Project[] = [
  {
    id: "modern-corrugated",
    title: "Modern Corrugated Install",
    type: "Residential",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "warehouse-complex",
    title: "Warehouse Complex",
    type: "Commercial",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "stone-coated-villa",
    title: "Stone-Coated Villa",
    type: "Residential",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
  },
];

export const proFilters: ProFilter[] = [
  "Residential",
  "Commercial",
  "Repair",
  "New Install",
  "Solar Ready",
];

export const materialCategories: MaterialCategory[] = [
  "All Materials",
  "Aluminum Roofing",
  "Stone Coated Tiles",
  "Roofing Accessories",
];

export function getProfessional(id: string) {
  return professionals.find((pro) => pro.id === id);
}
