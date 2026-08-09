import { 
  Calculator, 
  Atom, 
  Microscope, 
  Globe, 
  History, 
  BookOpen, 
  Palette, 
  Music, 
  Zap, 
  Sprout,
  Users,
  Briefcase,
  Monitor,
  Heart,
  Scale,
  Stethoscope,
  Building,
  Plane,
  Anchor,
  Truck,
  Cpu
} from "lucide-react";

export const languagesList = [
  "English", "French", "Portuguese", "Arabic", "Spanish", "Swahili (Kiswahili)", 
  "Amharic", "Hausa", "Yoruba", "Igbo", "Zulu (isiZulu)", "Xhosa (isiXhosa)", 
  "Sesotho", "Setswana", "Afrikaans", "Somali", "Oromo", "Tigrinya", 
  "Berber / Amazigh", "Shona", "Ndebele", "Kinyarwanda", "Kirundi", 
  "Wolof", "Bambara", "Lingala", "Chichewa / Nyanja", "Tswana", 
  "Xitsonga / Shangaan", "Xitsonga", "Luganda", "Fula / Fulfulde", "Kanuri",
  "Akan/Twi", "Ga", "Ewe", "Fante", "Dagbani", "Kikuyu", "Luo", "Kamba",
  "Bemba", "Swati (siSwati)", "Malagasy", "Khoisan languages"
];

export const academicCategories = [
  {
    category: "General Education (K-12)",
    subcategories: [
      {
        name: "Languages & Humanities",
        subjects: [
          "Home Language", "First Additional Language", "Second Additional Language", 
          "South African Sign Language", "History", "Geography", "Life Orientation", 
          "Social Sciences", "Religious and Moral Education", "Civic Education"
        ]
      },
      {
        name: "STEM & Sciences",
        subjects: [
          "Mathematics", "Mathematical Literacy", "Technical Mathematics", 
          "Advanced Mathematics", "Natural Sciences", "Physical Sciences", 
          "Life Sciences", "Coding and Robotics", "Integrated Science", "Environmental Science"
        ]
      },
      {
        name: "Commerce & Management",
        subjects: [
          "Accounting", "Business Studies", "Economics", 
          "Economic and Management Sciences", "Entrepreneurship", "Tourism"
        ]
      },
      {
        name: "Technology & Computing",
        subjects: [
          "Technology", "Information Technology", "Computer Applications Technology", 
          "Computer Science (School Level)", "Technical Drawing"
        ]
      }
    ]
  },
  {
    category: "Technical & Vocational",
    subcategories: [
      {
        name: "Applied Engineering",
        subjects: [
          "Engineering Graphics and Design", "Civil Technology", "Electrical Technology", 
          "Mechanical Technology", "Technical Sciences", "Electronics", "Automotive Mechanics",
          "Welding and Fabrication"
        ]
      },
      {
        name: "Agricultural Sciences",
        subjects: [
          "Agricultural Sciences", "Agricultural Management Practices", "Agricultural Technology", 
          "Animal Production", "Plant Production", "Soil Science", "Agribusiness Management",
          "Forestry", "Equine Studies", "Aquaculture"
        ]
      },
      {
        name: "Vocational Services",
        subjects: [
          "Hospitality Studies", "Consumer Studies", "Hairdressing and Beauty Technology", 
          "Early Childhood Development"
        ]
      }
    ]
  },
  {
    category: "Higher Education & Specialized",
    subcategories: [
      {
        name: "Physical & Mathematical Sciences",
        subjects: [
          "Astronomy", "Astrophysics", "Quantum Mechanics", "Organic Chemistry", 
          "Analytical Chemistry", "Inorganic Chemistry", "Calculus", "Linear Algebra", 
          "Differential Equations", "Topology", "Statistics", "Geology", "Meteorology", 
          "Oceanography", "Seismology", "Climate Science"
        ]
      },
      {
        name: "Life & Health Sciences",
        subjects: [
          "Medicine and Surgery", "Nursing Science", "Physiotherapy", "Occupational Therapy", 
          "Speech-Language Pathology", "Audiology", "Pharmacy", "Dentistry", 
          "Veterinary Medicine", "Public Health", "Epidemiology", "Genetics", 
          "Molecular Biology", "Biochemistry", "Microbiology", "Anatomy", "Physiology"
        ]
      },
      {
        name: "Engineering & Built Environment",
        subjects: [
          "Aerospace Engineering", "Chemical Engineering", "Civil Engineering", 
          "Mechanical Engineering", "Electrical Engineering", "Mechatronic Engineering", 
          "Mining Engineering", "Metallurgical Engineering", "Petroleum Engineering",
          "Architecture", "Quantity Surveying", "Urban Planning", "Construction Management"
        ]
      },
      {
        name: "Computer Science & AI",
        subjects: [
          "Artificial Intelligence", "Machine Learning", "Data Science", 
          "Cybersecurity", "Software Engineering", "Cloud Computing", 
          "Big Data Analytics", "Robotics"
        ]
      }
    ]
  },
  {
    category: "Arts, Media & Sports",
    subcategories: [
      {
        name: "Visual & Performing Arts",
        subjects: [
          "Fine Arts", "Graphic Design", "Industrial Design", "Fashion Design", 
          "Digital Media", "Animation", "Photography", "Drama", "Music Theory", 
          "Composition", "Music Production", "Choreography", "Dance Studies"
        ]
      },
      {
        name: "Writing & Media",
        subjects: [
          "Creative Writing", "Journalism", "Film and Television Production", 
          "Screenwriting", "Media Studies", "Public Relations"
        ]
      },
      {
        name: "Sports & Human Movement",
        subjects: [
          "Kinesiology", "Biomechanics", "Exercise Physiology", "Sports Medicine", 
          "Sports Psychology", "Sports Nutrition", "Sports Management", 
          "Coaching Science", "Practical Sport Codes (Rugby, Soccer, etc.)"
        ]
      }
    ]
  }
];

export const subjects = [
  { id: "primary-math", name: "Primary Math & Numeracy", icon: Calculator, color: "bg-teal-500", lightColor: "bg-teal-50", textColor: "text-teal-600", phase: "Primary (Grade R-7)", description: "Fun, interactive arithmetic, shapes, fractions and word problems." },
  { id: "primary-science", name: "Primary Science & Tech", icon: Microscope, color: "bg-emerald-500", lightColor: "bg-emerald-50", textColor: "text-emerald-600", phase: "Primary (Grade 1-7)", description: "Explore plants, animals, energy, ecosystems and simple machines." },
  { id: "primary-coding", name: "Coding & Robotics for Kids", icon: Cpu, color: "bg-purple-500", lightColor: "bg-purple-50", textColor: "text-purple-600", phase: "Primary (Grade 1-7)", description: "Block coding, computational thinking and robotics fundamentals." },
  { id: "primary-reading", name: "Primary Phonics & Reading", icon: BookOpen, color: "bg-indigo-500", lightColor: "bg-indigo-50", textColor: "text-indigo-600", phase: "Foundation Phase (R-3)", description: "Phonics, vocabulary, story comprehension and early literacy." },
  { id: "math", name: "Mathematics", icon: Calculator, color: "bg-blue-500", lightColor: "bg-blue-50", textColor: "text-blue-600", phase: "FET / University", description: "Interactive algebra, calculus and geometry solvers." },
  { id: "physics", name: "Physical Sciences", icon: Zap, color: "bg-amber-500", lightColor: "bg-amber-50", textColor: "text-amber-600", phase: "High School / College", description: "Simulate chemical reactions and physics experiments." },
  { id: "life-sci", name: "Life Sciences", icon: Microscope, color: "bg-emerald-500", lightColor: "bg-emerald-50", textColor: "text-emerald-600", phase: "FET / Pre-Med", description: "Explore biological systems and cellular biology." },
  { id: "agri", name: "Agricultural Sciences", icon: Sprout, color: "bg-green-500", lightColor: "bg-green-50", textColor: "text-green-600", phase: "All Levels", description: "Learn soil profiles, crop science and farm management." },
  { id: "languages", name: "Language Hub", icon: BookOpen, color: "bg-indigo-500", lightColor: "bg-indigo-50", textColor: "text-indigo-600", phase: "Pan-African", description: "Master 40+ African languages and global dialects." },
  { id: "history", name: "African History", icon: History, color: "bg-orange-500", lightColor: "bg-orange-50", textColor: "text-orange-600", phase: "All Levels", description: "Interactive timelines of African kingdoms and modern history." },
  { id: "geo", name: "Geography", icon: Globe, color: "bg-cyan-500", lightColor: "bg-cyan-50", textColor: "text-cyan-600", phase: "FET / Senior", description: "Map analysis and environmental system modeling." },
  { id: "it", name: "Computer Science", icon: Monitor, color: "bg-purple-500", lightColor: "bg-purple-50", textColor: "text-purple-600", phase: "FET / University", description: "Coding challenges, AI, and IT system fundamentals." },
  { id: "acc", name: "Accounting & Finance", icon: Briefcase, color: "bg-rose-500", lightColor: "bg-rose-50", textColor: "text-rose-600", phase: "FET / Business", description: "Financial statements and accounting principles." },
  { id: "law", name: "Legal Studies", icon: Scale, color: "bg-slate-500", lightColor: "bg-slate-50", textColor: "text-slate-600", phase: "College / Law School", description: "Constitution, human rights, and legal frameworks." },
  { id: "med", name: "Health Sciences", icon: Stethoscope, color: "bg-red-500", lightColor: "bg-red-50", textColor: "text-red-600", phase: "University", description: "Medicine, nursing, and public health foundations." },
  { id: "eng", name: "Engineering", icon: Cpu, color: "bg-zinc-500", lightColor: "bg-zinc-50", textColor: "text-zinc-600", phase: "FET / Tech", description: "Civil, electrical, and mechanical engineering principles." },
];
