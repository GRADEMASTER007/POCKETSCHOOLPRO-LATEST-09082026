/**
 * Grade Master Africa - Global K-12 & Higher Education International Curriculum Engine
 * Complete Phase 17 Expansion: Africa, UK, USA, Canada, Australia, New Zealand, Europe, Asia, Middle East, & International Frameworks
 */

export interface CurriculumDefinition {
  id: string;
  name: string;
  countryOrRegion: string;
  flag: string;
  category: "National" | "International" | "Provincial/State";
  educationStages: string[];
  examBoards: string[];
  gradingSystem: string;
  teachingStyle: "High-Stakes Exam Mastery" | "Continuous Assessment & GPA" | "Inquiry & Criterion-Based" | "Competency & Practical Skills" | "Rigorous Problem Drilling";
  teachingStyleDescription: string;
  keySubjects: string[];
  aiPromptInstruction: string;
}

export interface CountryDefinition {
  code: string;
  name: string;
  flag: string;
  region: "Africa" | "Europe" | "Americas" | "Asia-Pacific" | "Middle East" | "International";
  defaultCurriculumId: string;
  supportedCurricula: string[];
  languages: string[];
}

export interface LanguageDefinition {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "zu", name: "isiZulu", nativeName: "isiZulu", flag: "🇿🇦" },
  { code: "st", name: "Sesotho", nativeName: "Sesotho", flag: "🇿🇦" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪" },
  { code: "yo", name: "Yoruba", nativeName: "Èdè Yorùbá", flag: "🇳🇬" },
  { code: "xh", name: "isiXhosa", nativeName: "isiXhosa", flag: "🇿🇦" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", flag: "🇿🇦" },
  { code: "nso", name: "Sepedi (Northern Sotho)", nativeName: "Sepedi", flag: "🇿🇦" },
  { code: "tn", name: "Setswana", nativeName: "Setswana", flag: "🇿🇦" },
  { code: "ha", name: "Hausa", nativeName: "Harshen Hausa", flag: "🇳🇬" },
  { code: "ig", name: "Igbo", nativeName: "Asụsụ Igbo", flag: "🇳🇬" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹" },
  { code: "sn", name: "Shona", nativeName: "chiShona", flag: "🇿🇼" },
  { code: "nd", name: "Ndebele", nativeName: "Sindebele", flag: "🇿🇼" },
  { code: "bem", name: "Bemba", nativeName: "Chibemba", flag: "🇿🇲" },
  { code: "ny", name: "Nyanja/Chewa", nativeName: "Chichewa", flag: "🇲🇼" },
  { code: "lg", name: "Luganda", nativeName: "Oluganda", flag: "🇺🇬" },
  { code: "ss", name: "Swati", nativeName: "siSwati", flag: "🇸🇿" },
  { code: "mg", name: "Malagasy", nativeName: "Malagasy", flag: "🇲🇬" },
  { code: "ln", name: "Lingala", nativeName: "Lingála", flag: "🇨🇩" },
  { code: "ak", name: "Akan (Twi)", nativeName: "Akan", flag: "🇬🇭" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "zh", name: "Mandarin Chinese", nativeName: "中文 (普通话)", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" }
];

export const GLOBAL_CURRICULA: Record<string, CurriculumDefinition> = {
  caps_sa: {
    id: "caps_sa",
    name: "CAPS (South Africa National Curriculum Statement)",
    countryOrRegion: "South Africa",
    flag: "🇿🇦",
    category: "National",
    educationStages: ["Grade R - 3 (Foundation)", "Grade 4 - 6 (Intermediate)", "Grade 7 - 9 (Senior Phase)", "Grade 10 - 12 (FET Phase / NSC Matric)"],
    examBoards: ["DBE NSC (Public)", "SACAI", "IEB"],
    gradingSystem: "Level 1 (0-29%) to Level 7 (80-100% Outstanding)",
    teachingStyle: "Competency & Practical Skills",
    teachingStyleDescription: "Structured CAPS guidelines, SBA school-based assessments, practical scientific tasks, and NSC exam paper preparation.",
    keySubjects: ["Mathematics", "Physical Sciences", "Life Sciences", "Accounting", "Geography", "Agricultural Sciences", "Mathematical Literacy", "Information Technology"],
    aiPromptInstruction: "Strictly align with South African CAPS & IEB curriculum statements. Reference Paper 1 (Algebra/Physics) and Paper 2 (Geometry/Chemistry) exam structures and Department of Basic Education (DBE) past paper mark schemes."
  },

  ieb_sa: {
    id: "ieb_sa",
    name: "IEB (Independent Examinations Board)",
    countryOrRegion: "South Africa",
    flag: "🇿🇦",
    category: "National",
    educationStages: ["Grade 8 - 9", "Grade 10 - 12 (IEB NSC)", "Advanced Programmes (AP Maths, AP Physics, AP English)"],
    examBoards: ["IEB"],
    gradingSystem: "Level 1 to Level 7 + AP Distinction Honors",
    teachingStyle: "High-Stakes Exam Mastery",
    teachingStyleDescription: "High-level conceptual problem solving, critical thinking, advanced problem extension, and application-focused exam questions.",
    keySubjects: ["Mathematics", "AP Mathematics", "Physical Sciences", "AP Physics", "Life Sciences", "Accounting", "Information Technology", "AP English"],
    aiPromptInstruction: "Focus on IEB exam style: deep analytical depth, non-routine problem solving, higher-order Bloom taxonomy questions, and university-level readiness."
  },

  uk_national: {
    id: "uk_national",
    name: "UK National Curriculum (GCSE & A-Levels)",
    countryOrRegion: "United Kingdom",
    flag: "🇬🇧",
    category: "National",
    educationStages: ["EYFS (Early Years)", "Key Stage 1 (Years 1-2)", "Key Stage 2 (Years 3-6 / SATS)", "Key Stage 3 (Years 7-9)", "Key Stage 4 (Years 10-11 / GCSE)", "Key Stage 5 (Years 12-13 / A-Levels / AS)", "T-Levels / BTEC Vocational"],
    examBoards: ["AQA", "Edexcel (Pearson)", "OCR", "WJEC", "Eduqas", "Cambridge UK"],
    gradingSystem: "GCSE: Grades 9 to 1 (9 = Top Grade). A-Levels: A* to E.",
    teachingStyle: "High-Stakes Exam Mastery",
    teachingStyleDescription: "Formal academic rigor, mark scheme precision, command-word mastery (Explain, Evaluate, Calculate, Compare), past paper practice, and structured step-by-step revision.",
    keySubjects: ["GCSE Maths", "A-Level Maths", "Further Maths", "Biology", "Chemistry", "Physics", "Computer Science", "Economics", "History", "English Literature"],
    aiPromptInstruction: "Target the UK GCSE/A-Level specifications (AQA/Edexcel/OCR). Emphasize exact exam board mark scheme terminology, command words, working out presentation, and past paper examination techniques."
  },

  us_k12_ap: {
    id: "us_k12_ap",
    name: "US K–12 Framework (Common Core, NGSS & AP)",
    countryOrRegion: "United States",
    flag: "🇺🇸",
    category: "National",
    educationStages: ["Kindergarten", "Elementary (Grades 1-5)", "Middle School (Grades 6-8)", "High School (Grades 9-12)", "Honors & AP (Advanced Placement)", "SAT / ACT College Prep"],
    examBoards: ["College Board (AP/SAT)", "ACT", "State Boards (Texas TEKS, NY Regents, California Common Core)"],
    gradingSystem: "GPA Scale 4.0 (Unweighted) / 5.0 (Weighted AP/Honors) & Letter Grades A+ through F",
    teachingStyle: "Continuous Assessment & GPA",
    teachingStyleDescription: "Project-based learning, formative quizzes, inquiry exploration, SAT/ACT test-taking strategies, and college admission preparation.",
    keySubjects: ["Algebra I & II", "Geometry", "Pre-Calculus", "AP Calculus AB/BC", "AP Physics 1/2/C", "AP Chemistry", "AP Biology", "AP Computer Science A", "US History", "SAT Math & Verbal"],
    aiPromptInstruction: "Follow US Common Core & NGSS standards. Integrate College Board AP rubric requirements, FRQ (Free Response Question) scoring criteria, and SAT/ACT strategy tips."
  },

  ib_diploma: {
    id: "ib_diploma",
    name: "International Baccalaureate (IB PYP, MYP & DP)",
    countryOrRegion: "International",
    flag: "🇺🇳",
    category: "International",
    educationStages: ["Primary Years Programme (PYP)", "Middle Years Programme (MYP)", "Diploma Programme (IB DP Year 1 & 2)", "Career-related Programme (CP)"],
    examBoards: ["IBO (International Baccalaureate Organization)"],
    gradingSystem: "Scale of 1 to 7 per subject + 3 points for TOK/EE (Total Max 45 Points)",
    teachingStyle: "Inquiry & Criterion-Based",
    teachingStyleDescription: "Inquiry-based learning, Theory of Knowledge (TOK) interdisciplinary links, Extended Essay (EE) guidance, and criterion-referenced assessment rubrics.",
    keySubjects: ["IB Math Analysis & Approaches (HL/SL)", "IB Math Applications & Interpretation (HL/SL)", "IB Physics HL/SL", "IB Chemistry HL/SL", "IB Biology HL/SL", "IB Economics", "TOK"],
    aiPromptInstruction: "Incorporate IB learner profile attributes, inquiry questions, TOK connection prompts, and IB DP criterion A-D mark bands."
  },

  cambridge_international: {
    id: "cambridge_international",
    name: "Cambridge International (IGCSE & AS/A Levels)",
    countryOrRegion: "International / Global",
    flag: "🌍",
    category: "International",
    educationStages: ["Cambridge Primary (Stage 1-6)", "Cambridge Lower Secondary (Stage 7-9)", "Cambridge IGCSE (Stage 10-11)", "Cambridge International AS & A Level (Stage 12-13)"],
    examBoards: ["CAIE (Cambridge Assessment International Education)"],
    gradingSystem: "IGCSE: A* to G or 9 to 1. A Level: A* to E.",
    teachingStyle: "High-Stakes Exam Mastery",
    teachingStyleDescription: "Deep conceptual grounding, international context, syllabus code precision, structured paper 1/2/3/4/5 preparation, and experimental technique analysis.",
    keySubjects: ["Cambridge IGCSE Math (0580)", "Cambridge Additional Math (0606)", "Cambridge A Level Math (9709)", "Physics (9702)", "Chemistry (9701)", "Biology (9700)"],
    aiPromptInstruction: "Strictly adhere to CAIE syllabus codes and marking conventions. Present solutions step-by-step with exact SI units, significant figures, and Cambridge mark scheme allocation."
  },

  waec_west_africa: {
    id: "waec_west_africa",
    name: "WAEC / WASSCE (West African Examinations Council)",
    countryOrRegion: "Nigeria / Ghana / Sierra Leone / Liberia / Gambia",
    flag: "🇳🇬",
    category: "National",
    educationStages: ["Primary School (Primary 1-6)", "Junior Secondary (JSS 1-3 / BECE)", "Senior Secondary (SSS 1-3 / WASSCE)"],
    examBoards: ["WAEC", "NECO", "NABTEB", "JAMB / UTME"],
    gradingSystem: "A1 (Excellent) to F9 (Fail)",
    teachingStyle: "High-Stakes Exam Mastery",
    teachingStyleDescription: "Rigorous past question drilling, theory paper step presentation, JAMB CBT speed techniques, and WAEC practical lab guides.",
    keySubjects: ["General Mathematics", "Further Mathematics", "Physics", "Chemistry", "Biology", "Financial Accounting", "Civic Education", "English Language"],
    aiPromptInstruction: "Align with WAEC/WASSCE syllabus. Prepare students for Section A (Objectives) and Section B (Theory) with exact step marks as allocated in WAEC marking guides."
  },

  kcse_kenya: {
    id: "kcse_kenya",
    name: "Kenya CBC & KCSE (Competency-Based Curriculum & KCSE)",
    countryOrRegion: "Kenya",
    flag: "🇰🇪",
    category: "National",
    educationStages: ["Early Years Education", "Middle School (Grade 4-6 & Junior Secondary Grade 7-9)", "Senior School (Grade 10-12)", "KCSE Examination Phase"],
    examBoards: ["KNEC (Kenya National Examinations Council)"],
    gradingSystem: "A (Plain) to E + CBC Rubrics (Exceeds Expectations, Meets Expectations)",
    teachingStyle: "Competency & Practical Skills",
    teachingStyleDescription: "Core competencies, real-world application, values-based education, and KCSE Paper 1/2/3 preparation.",
    keySubjects: ["Mathematics", "Physics", "Chemistry", "Biology", "Agriculture", "Business Studies", "Computer Studies", "Kiswahili"],
    aiPromptInstruction: "Follow Kenya KNEC syllabus specifications and CBC core competencies. Include KCSE past paper breakdown and practical examination guidelines."
  },

  aus_curriculum: {
    id: "aus_curriculum",
    name: "Australian Curriculum (VCE, HSC, QCE, SACE, WACE)",
    countryOrRegion: "Australia",
    flag: "🇦🇺",
    category: "National",
    educationStages: ["Foundation / Prep", "Primary School (Years 1-6)", "Junior High (Years 7-10)", "Senior Secondary (Years 11-12 / ATAR Pathway)"],
    examBoards: ["NESA (NSW HSC)", "VCAA (Victoria VCE)", "QCAA (Queensland QCE)", "SACE", "SCSA"],
    gradingSystem: "ATAR Percentile (0.00 to 99.95) & A-E Grade Scale",
    teachingStyle: "Continuous Assessment & GPA",
    teachingStyleDescription: "School-assessed coursework (SACs), external examinations, practical investigations, and ATAR scaling optimizations.",
    keySubjects: ["Mathematical Methods", "Specialist Mathematics", "Physics", "Chemistry", "Biology", "Business Management", "English Advanced"],
    aiPromptInstruction: "Align with Australian Curriculum (ACARA) and state exam board standards (VCE/HSC/QCE). Emphasize SAC criteria, VCAA/NESA marking schemes, and ATAR calculation context."
  },

  cbse_india: {
    id: "cbse_india",
    name: "India CBSE & ICSE (Central Board of Secondary Education)",
    countryOrRegion: "India",
    flag: "🇮🇳",
    category: "National",
    educationStages: ["Primary (Classes 1-5)", "Middle (Classes 6-8)", "Secondary (Classes 9-10 / Board Exams)", "Senior Secondary (Classes 11-12 / Science/Commerce/Humanities)", "JEE Main/Advanced & NEET Prep"],
    examBoards: ["CBSE", "CISCE (ICSE/ISC)", "State Boards"],
    gradingSystem: "Percentage & Letter Grades A1 to E + JEE/NEET All India Rank (AIR)",
    teachingStyle: "Rigorous Problem Drilling",
    teachingStyleDescription: "Intensive numerical solving, NCERT textbook mastery, derive-and-evaluate questions, speed & accuracy drills for competitive entrance tests.",
    keySubjects: ["Class 11/12 Mathematics", "Physics", "Chemistry", "Biology", "Accountancy", "Computer Science", "JEE Mathematics", "NEET Biology"],
    aiPromptInstruction: "Follow NCERT textbook solutions and CBSE board marking schemes. Provide detailed derivations, standard numerical methods, and competitive entrance exam (JEE/NEET) shortcuts."
  },

  euro_baccalaureate: {
    id: "euro_baccalaureate",
    name: "European Secondary & Baccalaureate System",
    countryOrRegion: "Europe (France, Germany, Netherlands, Spain, etc.)",
    flag: "🇪🇺",
    category: "National",
    educationStages: ["Primaire / Grundschule", "Collège / Sekundarstufe I", "Lycée / Gymnasium / Sekundarstufe II", "Baccalauréat / Abitur Examination"],
    examBoards: ["Ministère de l'Éducation Nationale", "Kultusministerkonferenz (Abitur)", "Selectividad / EvAU"],
    gradingSystem: "France: 0 to 20 Scale. Germany: 1.0 (Top) to 6.0. Spain: 0 to 10 Scale.",
    teachingStyle: "High-Stakes Exam Mastery",
    teachingStyleDescription: "Deep essay structures, rigorous scientific proofs, multi-language fluency, and comprehensive oral defense examinations.",
    keySubjects: ["Mathematics", "Physics-Chemistry", "Life & Earth Sciences (SVT)", "Philosophy", "Economic & Social Sciences"],
    aiPromptInstruction: "Incorporate European academic rigor, structured dissertation / proof formats, and official Baccalauréat / Abitur scoring criteria."
  },

  zimsec_zimbabwe: {
    id: "zimsec_zimbabwe",
    name: "ZIMSEC (Zimbabwe School Examinations Council)",
    countryOrRegion: "Zimbabwe",
    flag: "🇿🇼",
    category: "National",
    educationStages: ["Grade 1-7", "Form 1-4 (ZIMSEC O-Level)", "Form 5-6 (ZIMSEC A-Level)"],
    examBoards: ["ZIMSEC"],
    gradingSystem: "Grade A to U (O-Level) / A to E (A-Level)",
    teachingStyle: "High-Stakes Exam Mastery",
    teachingStyleDescription: "Rigorous academic focus, syllabus-driven content, and precision in examination responses.",
    keySubjects: ["Mathematics", "Integrated Science", "Physics", "Chemistry", "Biology", "Accounting", "Geography"],
    aiPromptInstruction: "Strictly align with ZIMSEC O-Level and A-Level syllabi. Use Zimbabwe-specific terminology and exam structures."
  },

  ecz_zambia: {
    id: "ecz_zambia",
    name: "ECZ (Examinations Council of Zambia)",
    countryOrRegion: "Zambia",
    flag: "🇿🇲",
    category: "National",
    educationStages: ["Primary (Grade 1-7)", "Junior Secondary (Grade 8-9)", "Senior Secondary (Grade 10-12)"],
    examBoards: ["ECZ"],
    gradingSystem: "Grade 1 (Distinction) to 9 (Fail)",
    teachingStyle: "High-Stakes Exam Mastery",
    teachingStyleDescription: "Focus on national exam pass rates, core competency in STEM, and structured paper 1/2 formats.",
    keySubjects: ["Mathematics", "Science", "Biology", "Physics", "Chemistry", "Agricultural Science", "Geography"],
    aiPromptInstruction: "Adhere to the Zambian ECZ syllabus guidelines for Grade 7, 9, and 12. Focus on clear step-by-step solutions for Paper 1 and 2."
  },

  nssco_namibia: {
    id: "nssco_namibia",
    name: "NSSCO/NSSCAS (Namibia Senior Secondary Certificate)",
    countryOrRegion: "Namibia",
    flag: "🇳🇦",
    category: "National",
    educationStages: ["Junior Secondary (Grade 8-9)", "Senior Secondary Ordinary (Grade 10-11)", "Senior Secondary Advanced Subsidiary (Grade 12)"],
    examBoards: ["DNEA (Directorate of National Examinations and Assessment)"],
    gradingSystem: "NSSCO: A to G. NSSCAS: a to e.",
    teachingStyle: "Inquiry & Criterion-Based",
    teachingStyleDescription: "Conceptual understanding, practical investigations, and preparation for Advanced Subsidiary levels.",
    keySubjects: ["Mathematics", "Physics", "Chemistry", "Biology", "Accounting", "Geography", "Development Studies"],
    aiPromptInstruction: "Follow the Namibian NIED curriculum and DNEA examination standards. Align with NSSCO and NSSCAS requirements."
  },

  maneb_malawi: {
    id: "maneb_malawi",
    name: "MANEB / MSCE (Malawi National Examinations Board)",
    countryOrRegion: "Malawi",
    flag: "🇲🇼",
    category: "National",
    educationStages: ["Primary (Standard 1-8)", "Secondary (Form 1-4 / MSCE)"],
    examBoards: ["MANEB"],
    gradingSystem: "1 (Distinction) to 9 (Fail)",
    teachingStyle: "High-Stakes Exam Mastery",
    teachingStyleDescription: "Focus on MSCE certification, core literacy and numeracy, and agricultural science mastery.",
    keySubjects: ["Mathematics", "Physical Science", "Biology", "Agriculture", "Geography", "Social Studies"],
    aiPromptInstruction: "Align with the Malawian MANEB syllabus for JCE and MSCE. Emphasize agriculture and physical science concepts as per national standards."
  },

  uneb_uganda: {
    id: "uneb_uganda",
    name: "UNEB / UCE / UACE (Uganda National Examinations Board)",
    countryOrRegion: "Uganda",
    flag: "🇺🇬",
    category: "National",
    educationStages: ["Primary (P1-P7)", "Lower Secondary (S1-S4 / UCE)", "Upper Secondary (S5-S6 / UACE)"],
    examBoards: ["UNEB"],
    gradingSystem: "UCE: Distinction 1 to F9. UACE: A to O.",
    teachingStyle: "High-Stakes Exam Mastery",
    teachingStyleDescription: "Rigorous academic drilling, deep theoretical knowledge, and structured examination formats.",
    keySubjects: ["Mathematics", "Physics", "Chemistry", "Biology", "Agriculture", "Geography", "Economics"],
    aiPromptInstruction: "Adhere to the Uganda UNEB syllabus for O-Level (UCE) and A-Level (UACE). Use Ugandan terminology and exam paper structures."
  },

  portugal_national: {
    id: "portugal_national",
    name: "Portugal National Curriculum (Ensino Básico e Secundário)",
    countryOrRegion: "Portugal",
    flag: "🇵🇹",
    category: "National",
    educationStages: ["1º Ciclo (Anos 1-4)", "2º Ciclo (Anos 5-6)", "3º Ciclo (Anos 7-9)", "Ensino Secundário (Anos 10-12 / Exames Nacionais)"],
    examBoards: ["IAVE (Instituto de Avaliação Educativa)"],
    gradingSystem: "1 to 5 (Básico) / 0 to 20 (Secundário)",
    teachingStyle: "Inquiry & Criterion-Based",
    teachingStyleDescription: "Conceptual rigor, preparation for national exams (Exames Nacionais), and European academic standards.",
    keySubjects: ["Matemática A/B", "Física e Química A", "Biologia e Geologia", "Economia A", "Geometria Descritiva A"],
    aiPromptInstruction: "Follow the Portuguese Ministry of Education (DGE) standards. Use Portuguese terminology and align with IAVE national exam structures."
  },

  sne_mozambique: {
    id: "sne_mozambique",
    name: "Mozambique SNE (Sistema Nacional de Educação)",
    countryOrRegion: "Mozambique",
    flag: "🇲🇿",
    category: "National",
    educationStages: ["Ensino Primário (1ª-7ª Classe)", "Ensino Secundário Geral (8ª-12ª Classe)"],
    examBoards: ["Conselho Nacional de Exames, Certificação e Equivalências"],
    gradingSystem: "0 to 20 Scale",
    teachingStyle: "Competency & Practical Skills",
    teachingStyleDescription: "Focus on national development, practical skills, and Portuguese-medium instruction.",
    keySubjects: ["Matemática", "Física", "Química", "Biologia", "Geografia", "Agro-Pecuária"],
    aiPromptInstruction: "Align with the Mozambican SNE curriculum. Use Portuguese as the primary instructional language and focus on national exam preparation for 10th and 12th classes."
  },

  epsp_drc: {
    id: "epsp_drc",
    name: "DRC EPSP (Enseignement Primaire, Secondaire et Professionnel)",
    countryOrRegion: "DR Congo",
    flag: "🇨🇩",
    category: "National",
    educationStages: ["École Primaire (1ère-6ème)", "Cycle d'Orientation (7ème-8ème)", "Humanités (1ère-4ème / Examen d'État)"],
    examBoards: ["Inspection Générale de l'Enseignement"],
    gradingSystem: "Percentage based (0-100%) / Examen d'État Score",
    teachingStyle: "High-Stakes Exam Mastery",
    teachingStyleDescription: "Rigorous preparation for the 'Exétat', broad academic knowledge, and French-medium instruction.",
    keySubjects: ["Mathématiques", "Physique", "Chimie", "Biologie", "Géographie", "Latin-Philosophie"],
    aiPromptInstruction: "Adhere to the DRC national curriculum (Programme National). Prepare students for the 'Examen d'État' (Exétat) and use French-medium terminology."
  },

  egcse_eswatini: {
    id: "egcse_eswatini",
    name: "EGCSE (Eswatini General Certificate of Secondary Education)",
    countryOrRegion: "Eswatini",
    flag: "🇸🇿",
    category: "National",
    educationStages: ["Primary (Grade 1-7)", "Junior Secondary (Form 1-3)", "Senior Secondary (Form 4-5 / EGCSE)"],
    examBoards: ["ECESWA (Examinations Council of Eswatini)"],
    gradingSystem: "Grade A* to G",
    teachingStyle: "High-Stakes Exam Mastery",
    teachingStyleDescription: "Based on IGCSE standards, focus on core academic subjects and examination technique.",
    keySubjects: ["Mathematics", "Physical Science", "Biology", "Geography", "SiSwati", "Economics"],
    aiPromptInstruction: "Follow the EGCSE syllabus guidelines from ECESWA. Align with IGCSE-style question and marking standards."
  },

  lgcse_lesotho: {
    id: "lgcse_lesotho",
    name: "LGCSE (Lesotho General Certificate of Secondary Education)",
    countryOrRegion: "Lesotho",
    flag: "🇱🇸",
    category: "National",
    educationStages: ["Primary (Standard 1-7)", "Junior Secondary (Form A-C)", "Senior Secondary (Form D-E / LGCSE)"],
    examBoards: ["ECOL (Examinations Council of Lesotho)"],
    gradingSystem: "Grade A* to G",
    teachingStyle: "High-Stakes Exam Mastery",
    teachingStyleDescription: "Syllabus-focused instruction, national exam preparation, and core literacy/numeracy.",
    keySubjects: ["Mathematics", "Physical Science", "Biology", "Geography", "Sesotho", "Development Studies"],
    aiPromptInstruction: "Align with the LGCSE syllabus from ECOL. Focus on Sesotho-medium context where appropriate and national exam structures."
  },

  bacc_madagascar: {
    id: "bacc_madagascar",
    name: "Baccalauréat de l'Enseignement Secondaire (Madagascar)",
    countryOrRegion: "Madagascar",
    flag: "🇲🇬",
    category: "National",
    educationStages: ["Primaire (T1-T5)", "Secondaire le Premier Cycle (6ème-3ème / BEPC)", "Secondaire le Second Cycle (Seconde-Terminale / Bac)"],
    examBoards: ["Office du Baccalauréat"],
    gradingSystem: "0 to 20 Scale",
    teachingStyle: "High-Stakes Exam Mastery",
    teachingStyleDescription: "French-influenced academic rigor, broad knowledge base, and national examination focus.",
    keySubjects: ["Mathématiques", "Physique-Chimie", "Sciences de la Vie et de la Terre", "Philosophie", "Malagasy"],
    aiPromptInstruction: "Follow the Malagasy national curriculum. Prepare students for the Baccalauréat and use French/Malagasy terminology as appropriate."
  }
}

export const GLOBAL_COUNTRIES: CountryDefinition[] = [
  { code: "ZA", name: "South Africa", flag: "🇿🇦", region: "Africa", defaultCurriculumId: "caps_sa", supportedCurricula: ["caps_sa", "ieb_sa", "cambridge_international", "ib_diploma"], languages: ["en", "af", "zu", "xh"] },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", region: "Europe", defaultCurriculumId: "uk_national", supportedCurricula: ["uk_national", "cambridge_international", "ib_diploma"], languages: ["en"] },
  { code: "US", name: "United States", flag: "🇺🇸", region: "Americas", defaultCurriculumId: "us_k12_ap", supportedCurricula: ["us_k12_ap", "ib_diploma"], languages: ["en", "es"] },
  { code: "CA", name: "Canada", flag: "🇨🇦", region: "Americas", defaultCurriculumId: "us_k12_ap", supportedCurricula: ["us_k12_ap", "ib_diploma"], languages: ["en", "fr"] },
  { code: "AU", name: "Australia", flag: "🇦🇺", region: "Asia-Pacific", defaultCurriculumId: "aus_curriculum", supportedCurricula: ["aus_curriculum", "ib_diploma", "cambridge_international"], languages: ["en"] },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", region: "Asia-Pacific", defaultCurriculumId: "aus_curriculum", supportedCurricula: ["aus_curriculum", "cambridge_international", "ib_diploma"], languages: ["en"] },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", region: "Africa", defaultCurriculumId: "waec_west_africa", supportedCurricula: ["waec_west_africa", "cambridge_international", "uk_national"], languages: ["en"] },
  { code: "KE", name: "Kenya", flag: "🇰🇪", region: "Africa", defaultCurriculumId: "kcse_kenya", supportedCurricula: ["kcse_kenya", "cambridge_international", "ib_diploma"], languages: ["en"] },
  { code: "GH", name: "Ghana", flag: "🇬🇭", region: "Africa", defaultCurriculumId: "waec_west_africa", supportedCurricula: ["waec_west_africa", "cambridge_international"], languages: ["en"] },
  { code: "IN", name: "India", flag: "🇮🇳", region: "Asia-Pacific", defaultCurriculumId: "cbse_india", supportedCurricula: ["cbse_india", "cambridge_international", "ib_diploma"], languages: ["en", "hi"] },
  { code: "SG", name: "Singapore", flag: "🇸🇬", region: "Asia-Pacific", defaultCurriculumId: "cambridge_international", supportedCurricula: ["cambridge_international", "ib_diploma"], languages: ["en", "zh"] },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", region: "Middle East", defaultCurriculumId: "ib_diploma", supportedCurricula: ["ib_diploma", "cambridge_international", "uk_national", "us_k12_ap"], languages: ["en", "ar"] },
  { code: "DE", name: "Germany", flag: "🇩🇪", region: "Europe", defaultCurriculumId: "euro_baccalaureate", supportedCurricula: ["euro_baccalaureate", "ib_diploma"], languages: ["de", "en"] },
  { code: "FR", name: "France", flag: "🇫🇷", region: "Europe", defaultCurriculumId: "euro_baccalaureate", supportedCurricula: ["euro_baccalaureate", "ib_diploma"], languages: ["fr", "en"] },
  { code: "JP", name: "Japan", flag: "🇯🇵", region: "Asia-Pacific", defaultCurriculumId: "ib_diploma", supportedCurricula: ["ib_diploma", "cambridge_international"], languages: ["ja", "en"] },
  { code: "KR", name: "South Korea", flag: "🇰🇷", region: "Asia-Pacific", defaultCurriculumId: "ib_diploma", supportedCurricula: ["ib_diploma", "us_k12_ap"], languages: ["ko", "en"] },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", region: "Africa", defaultCurriculumId: "zimsec_zimbabwe", supportedCurricula: ["zimsec_zimbabwe", "cambridge_international"], languages: ["en", "sn", "nd"] },
  { code: "ZM", name: "Zambia", flag: "🇿🇲", region: "Africa", defaultCurriculumId: "ecz_zambia", supportedCurricula: ["ecz_zambia", "cambridge_international"], languages: ["en", "bem", "ny"] },
  { code: "NA", name: "Namibia", flag: "🇳🇦", region: "Africa", defaultCurriculumId: "nssco_namibia", supportedCurricula: ["nssco_namibia", "cambridge_international"], languages: ["en", "af"] },
  { code: "MW", name: "Malawi", flag: "🇲🇼", region: "Africa", defaultCurriculumId: "maneb_malawi", supportedCurricula: ["maneb_malawi"], languages: ["en", "ny"] },
  { code: "UG", name: "Uganda", flag: "🇺🇬", region: "Africa", defaultCurriculumId: "uneb_uganda", supportedCurricula: ["uneb_uganda", "cambridge_international"], languages: ["en", "lg"] },
  { code: "PT", name: "Portugal", flag: "🇵🇹", region: "Europe", defaultCurriculumId: "portugal_national", supportedCurricula: ["portugal_national", "ib_diploma"], languages: ["pt"] },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿", region: "Africa", defaultCurriculumId: "sne_mozambique", supportedCurricula: ["sne_mozambique"], languages: ["pt"] },
  { code: "CD", name: "DR Congo", flag: "🇨🇩", region: "Africa", defaultCurriculumId: "epsp_drc", supportedCurricula: ["epsp_drc"], languages: ["fr", "ln"] },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", region: "Africa", defaultCurriculumId: "bacc_madagascar", supportedCurricula: ["bacc_madagascar"], languages: ["fr", "mg"] },
  { code: "SZ", name: "Eswatini", flag: "🇸🇿", region: "Africa", defaultCurriculumId: "egcse_eswatini", supportedCurricula: ["egcse_eswatini", "cambridge_international"], languages: ["en", "ss"] },
  { code: "LS", name: "Lesotho", flag: "🇱🇸", region: "Africa", defaultCurriculumId: "lgcse_lesotho", supportedCurricula: ["lgcse_lesotho", "cambridge_international"], languages: ["en", "st"] }
];

export function getCurriculumById(id: string): CurriculumDefinition {
  return GLOBAL_CURRICULA[id] || GLOBAL_CURRICULA["caps_sa"];
}

export function formatGlobalCurriculumPrompt(profile: any): string {
  const country = profile?.country || "South Africa";
  const curriculumId = profile?.curriculum || "caps_sa";
  const curr = getCurriculumById(curriculumId);
  const gradeYear = profile?.gradeYear || profile?.grade || "Grade 11 / Year 12";
  const examBoard = profile?.examBoard || curr.examBoards[0] || "Standard Board";
  const langCode = profile?.preferredLanguage || "English";
  const stage = profile?.educationStage || "High School / Secondary";

  return `
[GLOBAL ACADEMIC CURRICULUM ROUTING PROTOCOL]
- Country: ${country} (${curr.flag})
- Curriculum Framework: ${curr.name}
- Education Stage: ${stage}
- Grade / Year Level: ${gradeYear}
- Examination Board: ${examBoard}
- Preferred Language: ${langCode}
- Grading System Context: ${curr.gradingSystem}
- Teaching Style Adaptation: ${curr.teachingStyle} (${curr.teachingStyleDescription})
- Specific AI Instructions: ${curr.aiPromptInstruction}

When explaining concepts, solving problems, or creating practice items:
1. Always adapt terms, formulas, mark scheme conventions, and question structures to ${curr.name} and ${examBoard}.
2. Respect the grading and assessment style: ${curr.teachingStyle}.
3. If user language is set to non-English (${langCode}), respond in ${langCode} while preserving international mathematical/scientific notation.
`;
}
