/**
 * Grade Master Africa - All-Subjects & All-Schools Academic Knowledgebase
 * Covers CAPS (South Africa), IEB, Cambridge, and African National Curricula
 * Grade R - 12 & Tertiary Foundation
 */

export interface SubjectCurriculum {
  id: string;
  name: string;
  category: "STEM" | "Commercial" | "Humanities" | "Languages" | "Technology";
  grades: string[];
  examPapers: {
    paper: string;
    description: string;
    weighting: string;
    keyTopics: string[];
  }[];
  keyFormulasAndConcepts: {
    topic: string;
    formulaOrRule: string;
    explanation: string;
    exampleQuestion: string;
  }[];
  whiteboardGraphTypes: ("2d_parabola" | "3d_solid" | "trig_wave" | "circuit_diagram" | "chemical_structure" | "balance_sheet" | "timeline")[];
}

export interface SchoolTypeDefinition {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  description: string;
  keyFeatures: string[];
  targetStudents: string;
  curriculumFocus: string;
  aiTutorAdaptation: string;
}

export interface SchoolCategoryDefinition {
  categoryId: string;
  categoryName: string;
  categoryDescription: string;
  schools: SchoolTypeDefinition[];
}

export const SCHOOL_TYPES_KNOWLEDGEBASE: Record<string, SchoolCategoryDefinition> = {
  general_standard: {
    categoryId: "general_standard",
    categoryName: "General and Standard Schools",
    categoryDescription: "These institutions form the backbone of a country's education system, providing foundational and secondary academic instruction to the majority of students.",
    schools: [
      {
        id: "public_state",
        name: "Public (State) Schools",
        category: "General and Standard Schools",
        subtitle: "Government-Funded Universal Education Backbone",
        description: "Governed and primarily funded by local or national governments, these schools follow a standardized national curriculum (e.g., CAPS). They are designed to provide universal access to education, often serving as the default choice for the general population. Because they serve a wide demographic, class sizes are typically larger.",
        keyFeatures: [
          "Government-funded & standardized national curriculum (CAPS/NSC)",
          "Universal access across diverse demographics",
          "Structured grade progression (Grades R to 12)",
          "Large class sizes requiring scalable classroom management",
          "Public national examination pathways (Matric Exams)"
        ],
        targetStudents: "General student population seeking accessible, standardized national qualification.",
        curriculumFocus: "National Core Curriculum (Mathematics, Physical Sciences, Languages, Life Orientation).",
        aiTutorAdaptation: "Large-class pacing assistant, exam past paper generator, step-by-step CAPS matric preparation."
      },
      {
        id: "private_independent",
        name: "Private (Independent) Schools",
        category: "General and Standard Schools",
        subtitle: "Tuition-Funded High-Ratio Independent Academies",
        description: "Funded through tuition fees, private endowments, and alumni networks rather than government subsidies. They operate independently of state systems, allowing them to offer smaller class sizes, extensive extracurriculars, and alternative curricula (such as IEB, Cambridge International, or the International Baccalaureate).",
        keyFeatures: [
          "Independent governance funded by tuition and endowments",
          "Lower student-to-teacher ratios with smaller class sizes",
          "Alternative international examination boards (IEB, Cambridge IGCSE/A-Levels, IB)",
          "Extensive co-curricular and advanced academic enrichment programs",
          "State-of-the-art technological and scientific laboratory facilities"
        ],
        targetStudents: "Students seeking smaller classes, specialized enrichment, or international accreditation.",
        curriculumFocus: "IEB, Cambridge Assessment International, IB Diploma, and Advanced Placement.",
        aiTutorAdaptation: "Advanced problem-solving drills, Olympiad coaching, university entrance exam prep (NBT, SAT)."
      },
      {
        id: "combined_comprehensive",
        name: "Combined / Comprehensive Schools",
        category: "General and Standard Schools",
        subtitle: "Multi-Phase All-Through Educational Campuses",
        description: "These schools offer a seamless educational journey by housing multiple phases of schooling (e.g., primary through high school) on a single campus. They eliminate the need for students to transition to new institutions as they age and often provide a mix of academic and vocational tracks to cater to diverse abilities.",
        keyFeatures: [
          "All-through education from Grade R/1 to Grade 12 on one unified campus",
          "Eliminating stress of institutional transitions between primary and secondary phases",
          "Dual academic and vocational pathways integrated under one roof",
          "Long-term learner tracking and mentorship across development stages",
          "Shared specialized facilities (laboratories, sports complexes, libraries)"
        ],
        targetStudents: "Learners seeking continuous 12-year academic continuity and diverse academic/vocational electives.",
        curriculumFocus: "Integrated General Academic, Commercial, and Vocational elective streams.",
        aiTutorAdaptation: "Multi-grade longitudinal learning analytics and cross-phase skill transition mapping."
      },
      {
        id: "boarding_schools",
        name: "Boarding Schools",
        category: "General and Standard Schools",
        subtitle: "24/7 Residential Academic & Character-Building Environment",
        description: "Institutions where students live on campus in dormitories or houses under the supervision of staff. They offer a highly structured environment where the curriculum extends beyond the classroom into mandatory evening study sessions, weekend sports, and character-building activities.",
        keyFeatures: [
          "Full residential campus living with 24/7 pastoral care and house masters",
          "Structured daily routine with mandatory supervised prep (study hours)",
          "Immersive sports, leadership, and community service integration",
          "Strong alumni networks and house camaraderie traditions",
          "Distraction-free environment with enforced study discipline"
        ],
        targetStudents: "Students seeking an immersive, self-disciplined residential campus life and holistic growth.",
        curriculumFocus: "Rigorous academic curriculum coupled with residential leadership and athletics.",
        aiTutorAdaptation: "Nightly prep study planner, automated homework verifier, and timetable time-management bot."
      }
    ]
  },

  specialized_vocational: {
    categoryId: "specialized_vocational",
    categoryName: "Specialized and Vocational Schools",
    categoryDescription: "These schools focus heavily on practical application and skills training, preparing students for specific careers rather than general academic university pathways.",
    schools: [
      {
        id: "technical_vocational_tvet",
        name: "Technical / Vocational Schools (TVET)",
        category: "Specialized and Vocational Schools",
        subtitle: "Hands-On Practical Trade & Skills Colleges",
        description: "Dedicated to teaching practical trades such as plumbing, electronics, automotive repair, IT networking, and carpentry. The curriculum blends theoretical classroom instruction with a heavy emphasis on hands-on workshops, leading directly to industry certifications or apprenticeships.",
        keyFeatures: [
          "Curriculum balanced between trade theory and practical workshop practice",
          "Specializations in Electrical Engineering, Mechanical Trades, IT Networking, and Building Trades",
          "Direct alignment with Industry Sector Education and Training Authorities (SETA)",
          "Preparation for Red Seal trade testing and artisan certification",
          "State-of-the-art workshop machinery and simulation labs"
        ],
        targetStudents: "Learners focused on acquiring trade skills, technical certifications, and direct employment.",
        curriculumFocus: "N1-N6 Engineering Studies, NC(V) Certificates, Applied Technical Science.",
        aiTutorAdaptation: "Interactive circuit/schematic decoder, trade code compliance guide, hands-on workshop steps."
      },
      {
        id: "agricultural_schools",
        name: "Agricultural Schools",
        category: "Specialized and Vocational Schools",
        subtitle: "Farming Science, Agribusiness & Environmental Tech",
        description: "Combine standard academics with the science and business of farming. Students study crop management, animal husbandry, agribusiness, and sustainable environmental practices, often gaining practical experience on functional school-run farms or greenhouses.",
        keyFeatures: [
          "Hands-on experience on functional school-run commercial farms and greenhouses",
          "Study of Agricultural Sciences, Agricultural Technology, and Agricultural Management Practices",
          "Agribusiness budgeting, livestock care, crop rotation, and soil chemistry",
          "Sustainable farming technologies, precision agriculture, and irrigation systems",
          "Direct pathways to agricultural commerce and food security sector careers"
        ],
        targetStudents: "Students passionate about farming, livestock management, food security, and agricultural commerce.",
        curriculumFocus: "Agricultural Sciences, Agricultural Technology, Agribusiness & Soil Physics.",
        aiTutorAdaptation: "Soil analysis simulator, crop rotation calculator, agribusiness yield predictor."
      },
      {
        id: "hotel_hospitality",
        name: "Hotel and Hospitality Schools",
        category: "Specialized and Vocational Schools",
        subtitle: "Culinary Arts, Tourism & Hotel Management Academies",
        description: "Geared toward the tourism and service industries, focusing on culinary arts, hotel operations, and guest services. Learning takes place in commercial-grade kitchens and mock hotel setups, preparing students for immediate entry into hospitality careers.",
        keyFeatures: [
          "Commercial-grade industrial training kitchens and mock hotel front-desk suites",
          "Comprehensive training in Culinary Studies, Food & Beverage Management, and Consumer Studies",
          "Customer service excellence, event management, and hotel accounting",
          "Industry work placements and internships in international hotel chains",
          "Food safety compliance (HACCP) and sommelier/barista fundamentals"
        ],
        targetStudents: "Aspiring chefs, hotel managers, tourism professionals, and hospitality entrepreneurs.",
        curriculumFocus: "Hospitality Studies, Culinary Arts, Tourism Management, Consumer Studies.",
        aiTutorAdaptation: "Recipe scale & food costing calculator, guest etiquette guide, event budget analyzer."
      },
      {
        id: "maritime_schools",
        name: "Maritime Schools",
        category: "Specialized and Vocational Schools",
        subtitle: "Naval Science, Shipping & Oceanographic Academies",
        description: "Specialized institutions focusing on the shipping and naval industries. Students study marine engineering, navigation, oceanography, and maritime logistics, utilizing simulators and sometimes spending time at sea for practical training.",
        keyFeatures: [
          "Advanced full-mission bridge and engine room simulators",
          "Core subjects: Nautical Science, Maritime Economics, Marine Engineering",
          "STCW international safety certifications and seamanship practicals",
          "Oceanography, port logistics, vessel chartering, and maritime law",
          "Direct pipeline to global merchant navy and maritime transport careers"
        ],
        targetStudents: "Learners seeking careers as ship captains, marine engineers, port logistics managers, or naval officers.",
        curriculumFocus: "Nautical Science, Maritime Economics, Oceanography, Marine Engineering.",
        aiTutorAdaptation: "Celestial navigation step-by-step solver, ship stability physics guide, maritime law tutor."
      }
    ]
  },

  special_needs_support: {
    categoryId: "special_needs_support",
    categoryName: "Special Needs and Support Schools",
    categoryDescription: "These institutions are designed to support students whose physical, intellectual, or emotional needs cannot be fully met in a mainstream classroom.",
    schools: [
      {
        id: "remedial_schools",
        name: "Remedial Schools",
        category: "Special Needs and Support Schools",
        subtitle: "Targeted Learning Gap Bridge & Reintegration Centers",
        description: "Tailored for students with specific learning difficulties such as dyslexia, dyscalculia, or ADHD. They teach the standard academic curriculum but utilize specialized teaching methods, smaller groups, and a flexible pace to help students bridge their learning gaps and, when possible, reintegrate into mainstream schools.",
        keyFeatures: [
          "Small class sizes (8-12 students per teacher)",
          "Specialized multi-sensory teaching techniques (Orton-Gillingham, multisensory math)",
          "Speech-language therapy, occupational therapy, and educational psychology integration",
          "Accommodations for exam concessions (extra time, scribes, readers, spelling concessions)",
          "Goal-oriented pathways for eventual reintegration into mainstream schools"
        ],
        targetStudents: "Students with specific learning disorders (dyslexia, dyscalculia, dysgraphia, ADHD) needing tailored pace.",
        curriculumFocus: "Standard CAPS/National Curriculum delivered through adaptive, small-group remediation.",
        aiTutorAdaptation: "Text-to-speech phonics, high-contrast dyslexic font generator, chunked step-by-step explanations."
      },
      {
        id: "special_needs_inclusive",
        name: "Special Needs / 100% Inclusive Schools",
        category: "Special Needs and Support Schools",
        subtitle: "Full Accessibility & IEP Multi-Disciplinary Centers",
        description: "Built and staffed specifically for students with significant physical, intellectual, or developmental disabilities (e.g., severe autism, Down syndrome, physical impairments). Facilities are fully adapted, and the staff includes occupational, speech, and physical therapists who work on tailored Individualized Education Programs (IEPs).",
        keyFeatures: [
          "100% barrier-free architecture (wheelchair ramps, sensory rooms, assistive tech)",
          "Individualized Education Programs (IEPs) tailored to each child's cognitive profile",
          "Multi-disciplinary support team: OTs, speech therapists, physios, full-time nurses",
          "Alternative communication methods (AAC, Braille, South African Sign Language)",
          "Life-skills, functional literacy, and vocational independence training"
        ],
        targetStudents: "Learners with severe physical, intellectual, visual, hearing, or neurological disabilities.",
        curriculumFocus: "Differentiated CAPS (DCAPS), Life Skills, Assistive Technology, AAC.",
        aiTutorAdaptation: "Visual widget generator, audio-assisted learning, simplified AAC icon-to-speech prompt system."
      },
      {
        id: "therapeutic_schools",
        name: "Therapeutic Schools",
        category: "Special Needs and Support Schools",
        subtitle: "Clinical Emotional Healing & Academic Dual Integration",
        description: "Designed for students struggling with severe emotional trauma, psychological disorders, or behavioral issues. They merge rigorous clinical therapy with academic instruction, focusing heavily on emotional regulation and mental wellness alongside standard learning.",
        keyFeatures: [
          "On-site clinical psychologists, psychiatrists, and licensed mental health counselors",
          "Integrated Dialectical Behavior Therapy (DBT) and Cognitive Behavioral Therapy (CBT)",
          "Small, calm sensory-friendly classrooms with de-escalation quiet spaces",
          "Trauma-informed teaching methodologies and flexible attendance structures",
          "Holistic focus on emotional regulation, self-advocacy, and academic resilience"
        ],
        targetStudents: "Students overcoming severe emotional trauma, anxiety disorders, depression, or behavioral challenges.",
        curriculumFocus: "Standard Academic Curriculum paired with Clinical Psychotherapy & Emotional Regulation Skills.",
        aiTutorAdaptation: "Gentle non-judgmental tone, stress-reducing check-ins, mindful break prompts during problem-solving."
      }
    ]
  },

  arts_culture_sports: {
    categoryId: "arts_culture_sports",
    categoryName: "Arts, Culture, and Sports Schools",
    categoryDescription: "Schools in this category are designed for highly talented students aiming for professional careers in highly competitive physical or creative fields.",
    schools: [
      {
        id: "sport_schools",
        name: "Sport Schools",
        category: "Arts, Culture, and Sports Schools",
        subtitle: "High-Performance Athletic Academies with Flexible Academics",
        description: "High-performance institutions that integrate intense athletic training into the school day. They employ professional coaching staff, utilize elite training facilities, and manage the student's nutrition and physiotherapy, all while ensuring the student completes their academic schooling.",
        keyFeatures: [
          "Elite training facilities (high-performance gym, Olympic pools, bio-mechanics labs)",
          "Professional coaching in rugby, soccer, athletics, swimming, cricket, netball, tennis",
          "Biokinetics, sports nutrition, injury rehabilitation, and mental conditioning staff",
          "Flexible academic schedules accommodated around national/international tour travel",
          "Direct pipeline to professional sports franchises and university athletic scholarships"
        ],
        targetStudents: "Student-athletes striving for professional sports careers or national representation.",
        curriculumFocus: "Standard Academics, Exercise Science, Sports Physiology & High-Performance Athletic Training.",
        aiTutorAdaptation: "Mobile-friendly study modules for tournament travel, biomechanics physics solver, flexible assignment planner."
      },
      {
        id: "music_performing_arts",
        name: "Music and Performing Arts Schools",
        category: "Arts, Culture, and Sports Schools",
        subtitle: "Audition-Based Conservatory Preparation Schools",
        description: "Entry usually requires a rigorous audition. The curriculum dedicates a significant portion of the day to rehearsals, vocal training, instrumental practice, theater, or dance, preparing students for conservatory training or the entertainment industry.",
        keyFeatures: [
          "Rigorous audition-based entry process selecting top talent",
          "Daily dedicated practice hours in soundproof acoustic studios and dance mirrors",
          "Specializations in Music Theory, Vocal Performance, Orchestral Instruments, Drama, Contemporary Dance",
          "Masterclasses by visiting international artists and frequent public stage showcases",
          "Preparation for Trinity, ABRSM, or Royal Schools music examinations"
        ],
        targetStudents: "Young musicians, vocalists, dancers, and stage actors preparing for professional performance careers.",
        curriculumFocus: "Music Theory & Harmony, Dramatic Arts, Dance Studies, Stage Production.",
        aiTutorAdaptation: "Music theory sight-reading generator, monologue analyzer, rhythm & harmony step-by-step solver."
      },
      {
        id: "fine_arts_schools",
        name: "Fine Arts Schools",
        category: "Arts, Culture, and Sports Schools",
        subtitle: "Visual Arts, Digital Design & Fashion Portfolios",
        description: "Centered around the visual and digital arts, including painting, sculpture, graphic design, and fashion. Students focus on mastering techniques and building extensive portfolios required for admission into top art colleges and design institutes.",
        keyFeatures: [
          "Dedicated studio spaces for painting, sculpting, ceramics, digital illustration, and fashion design",
          "Focus on building professional, gallery-ready physical and digital portfolios",
          "Mastery of classical fine art techniques alongside modern design software (Adobe Creative Cloud)",
          "Art history, critical analysis, exhibition curation, and creative entrepreneurship",
          "Direct pathways to top global art academies, architecture schools, and design agencies"
        ],
        targetStudents: "Visual artists, animators, graphic designers, fashion designers, and architects.",
        curriculumFocus: "Visual Arts, Design Studies, Graphic Communication, Art History.",
        aiTutorAdaptation: "Art movement history guide, color theory analyzer, design portfolio critique bot."
      }
    ]
  },

  alternative_faith: {
    categoryId: "alternative_faith",
    categoryName: "Alternative and Faith-Based Schools",
    categoryDescription: "These schools depart from the standard public school model either through a specific religious ideology or a progressive educational philosophy.",
    schools: [
      {
        id: "religious_faith_based",
        name: "Religious / Faith-Based Schools",
        category: "Alternative and Faith-Based Schools",
        subtitle: "Faith-Integrated Morals, Theology & Core Academics",
        description: "Managed by religious organizations, these schools integrate the morals, texts, and practices of a specific faith (e.g., Catholic, Islamic, Jewish) into the daily curriculum. They typically require theological studies and participation in worship services alongside core academic subjects.",
        keyFeatures: [
          "Integration of moral values, ethics, and scriptural studies into school life",
          "Daily/weekly worship services, prayer routines, and spiritual retreats",
          "Strong community values, family involvement, and charitable outreach focus",
          "Rigorous academic curriculum combined with accredited religious studies electives",
          "Nurturing environment reinforcing family and faith traditions"
        ],
        targetStudents: "Families seeking an education rooted in specific religious faith, morals, and spiritual formation.",
        curriculumFocus: "National Core Curriculum enriched with Theology, Religious Education, and Ethical Studies.",
        aiTutorAdaptation: "Ethical reasoning prompt guide, scriptural history context helper, value-aligned learning."
      },
      {
        id: "montessori_waldorf",
        name: "Montessori & Waldorf (Steiner) Schools",
        category: "Alternative and Faith-Based Schools",
        subtitle: "Progressive Holistic Child-Centered Philosophies",
        description: "Progressive educational models that prioritize holistic child development over rigid grading and testing. Montessori focuses on self-directed, hands-on learning with specialized materials in mixed-age classrooms. Waldorf (Steiner) emphasizes imagination, art, and nature, often delaying formal academics until later years.",
        keyFeatures: [
          "Montessori: Self-directed learning, tactile manipulative materials, mixed-age classrooms (3-year cycles)",
          "Waldorf: Artistic integration, storytelling, nature-based learning, eurythmy, delay of early screens",
          "Elimination of competitive testing and letter grades in early/middle childhood",
          "Holistic focus on intellectual, emotional, physical, and spiritual child growth",
          "Cultivation of lifelong curiosity, self-discipline, and creative problem-solving"
        ],
        targetStudents: "Learners thriving in child-led, experiential, artistic, or screen-free developmental settings.",
        curriculumFocus: "Holistic Experiential Curriculum, Practical Life, Discovery Math, Arts & Eurythmy.",
        aiTutorAdaptation: "Discovery-based inquiry prompts, hands-on project ideas, non-graded constructive feedback."
      },
      {
        id: "homeschool_coops",
        name: "Homeschool Co-operatives (Co-ops)",
        category: "Alternative and Faith-Based Schools",
        subtitle: "Parent-Pooled Collaborative Micro-Learning Networks",
        description: "Networks of homeschooling families who pool resources to enhance their children's education. While the primary education happens at home, the co-op meets regularly so students can take specialized group classes (like a science lab or drama class) taught by hired tutors or parents with specific expertise, providing socialization and collaborative learning.",
        keyFeatures: [
          "Parent-led collaborative networks pooling teaching expertise and specialized equipment",
          "Regular group meeting days for science experiments, group projects, sports, and drama",
          "High degree of curriculum customization tailored to each child's speed and interest",
          "Rich socialization opportunities within a close-knit community of homeschooling families",
          "Cost-effective sharing of tutors, laboratory equipment, field trips, and sports facilities"
        ],
        targetStudents: "Homeschooled children seeking group collaboration, lab access, and peer socialization.",
        curriculumFocus: "Customized Homeschool Curricula (CAPS, Cambridge, Accelerated Christian Education, Charlotte Mason).",
        aiTutorAdaptation: "Parent-tutor co-op lesson planner, group experiment step guide, multi-curriculum adapter."
      }
    ]
  }
};

export const ACADEMIC_SUBJECTS_KNOWLEDGEBASE: Record<string, SubjectCurriculum> = {
  mathematics: {
    id: "mathematics",
    name: "Mathematics (CAPS & IEB)",
    category: "STEM",
    grades: ["Grade 10", "Grade 11", "Grade 12", "AP Maths"],
    examPapers: [
      {
        paper: "Paper 1 (Algebra & Calculus)",
        description: "Equations, Inequalities, Functions, Financial Maths, Calculus, Sequences & Series, Probability",
        weighting: "150 Marks (3 Hours)",
        keyTopics: ["Quadratic Equations", "Logarithms", "Differential Calculus", "Financial Annuities", "Counting Principles"]
      },
      {
        paper: "Paper 2 (Geometry & Trigonometry)",
        description: "Statistics, Analytical Geometry, Trigonometry, Euclidean Geometry",
        weighting: "150 Marks (3 Hours)",
        keyTopics: ["Circle Theorems", "Trig Reduction Formulas", "Sine/Cosine Rules", "Regression Lines", "3D Trigonometry"]
      }
    ],
    keyFormulasAndConcepts: [
      {
        topic: "Differential Calculus - Power Rule",
        formulaOrRule: "d/dx [x^n] = n * x^(n-1)",
        explanation: "Differentiate each term with respect to x. Bring power to front and decrease exponent by 1.",
        exampleQuestion: "Find f'(x) if f(x) = 3x^4 - 2x^2 + 7"
      },
      {
        topic: "Calculus - Volume of Solid of Revolution (Disk Method)",
        formulaOrRule: "V = π * ∫[a to b] [f(y)]^2 dy",
        explanation: "Rotate region around y-axis. Radius R(y) = x = f(y). Integrate cross-sectional disk area A(y) = π R(y)^2.",
        exampleQuestion: "Find volume of region bounded by y = x^2, y = 4, x = 0 rotated about y-axis."
      },
      {
        topic: "Financial Maths - Present Value Annuity",
        formulaOrRule: "P = x * [1 - (1 + i)^(-n)] / i",
        explanation: "Calculates loan repayment or monthly installment x for duration of n periods at interest rate i.",
        exampleQuestion: "Calculate monthly payment for a home loan of R850,000 at 11.5% p.a. over 20 years."
      }
    ],
    whiteboardGraphTypes: ["2d_parabola", "3d_solid", "trig_wave"]
  },

  physical_sciences: {
    id: "physical_sciences",
    name: "Physical Sciences (Physics & Chemistry)",
    category: "STEM",
    grades: ["Grade 10", "Grade 11", "Grade 12"],
    examPapers: [
      {
        paper: "Paper 1 (Physics)",
        description: "Newton's Laws, Momentum, Work-Energy-Power, Doppler Effect, Electrostatics, Electric Circuits, Electrodynamics, Photoelectric Effect",
        weighting: "150 Marks (3 Hours)",
        keyTopics: ["Newton 1, 2, 3", "Conservation of Linear Momentum", "Work-Energy Theorem", "Ohm's Law & Internal Resistance"]
      },
      {
        paper: "Paper 2 (Chemistry)",
        description: "Organic Chemistry, Rates of Reaction, Chemical Equilibrium, Acids & Bases, Electrochemistry, Chlor-Alkali Industry",
        weighting: "150 Marks (3 Hours)",
        keyTopics: ["IUPAC Naming", "Intermolecular Forces", "Le Chatelier's Principle", "Galvanic & Electrolytic Cells", "Kc Calculations"]
      }
    ],
    keyFormulasAndConcepts: [
      {
        topic: "Physics - Newton's Second Law",
        formulaOrRule: "F_net = m * a",
        explanation: "Net force acting on an object equals product of mass and acceleration.",
        exampleQuestion: "A 5kg block is pulled on a rough surface (μ = 0.2) by 30N force at 20 degrees. Find acceleration."
      },
      {
        topic: "Chemistry - Equilibrium Constant (Kc)",
        formulaOrRule: "Kc = [Products]^coefficients / [Reactants]^coefficients",
        explanation: "Calculated using equilibrium concentration values (moles per cubic decimeter) at constant temperature.",
        exampleQuestion: "N2(g) + 3H2(g) ⇌ 2NH3(g). Calculate Kc if equilibrium concs are [N2]=0.2, [H2]=0.1, [NH3]=0.4."
      }
    ],
    whiteboardGraphTypes: ["circuit_diagram", "chemical_structure"]
  },

  accounting: {
    id: "accounting",
    name: "Accounting & Financial Management",
    category: "Commercial",
    grades: ["Grade 10", "Grade 11", "Grade 12", "University BCom"],
    examPapers: [
      {
        paper: "Paper 1 (Financial Accounting)",
        description: "Financial Statements of Companies, Income Statement, Balance Sheet, Cash Flow Statement, Analysis & Interpretation",
        weighting: "150 Marks (2 Hours)",
        keyTopics: ["Retained Income Note", "Auditor's Report", "Liquidity Ratios", "Solvency & Profitability"]
      },
      {
        paper: "Paper 2 (Managerial Accounting & Internal Control)",
        description: "Cost Accounting (Manufacturing), Budgeting, Inventory Systems, Internal Controls & Governance",
        weighting: "150 Marks (2 Hours)",
        keyTopics: ["Production Cost Statement", "Break-Even Point", "Cash Budget", "Weighted Average Inventory"]
      }
    ],
    keyFormulasAndConcepts: [
      {
        topic: "Accounting Equation",
        formulaOrRule: "Assets = Liabilities + Owner's Equity (A = L + OE)",
        explanation: "Fundamental double-entry balance rule across all accounting systems.",
        exampleQuestion: "Owner invests R50,000 cash into business. State effect on A, L, and OE."
      },
      {
        topic: "Break-Even Quantity",
        formulaOrRule: "BEP = Total Fixed Costs / (Selling Price per unit - Variable Cost per unit)",
        explanation: "Calculates minimum units to produce to cover all costs with zero profit or loss.",
        exampleQuestion: "Fixed costs = R120,000. Selling price = R50. Variable cost = R20. Find BEP."
      }
    ],
    whiteboardGraphTypes: ["balance_sheet", "timeline"]
  },

  life_sciences: {
    id: "life_sciences",
    name: "Life Sciences / Biology",
    category: "STEM",
    grades: ["Grade 10", "Grade 11", "Grade 12"],
    examPapers: [
      {
        paper: "Paper 1 (Human & Plant Physiology)",
        description: "Meiosis, Human Reproduction, Responding to Environment (Nervous & Endocrine System), Homeostasis, Plant Responses",
        weighting: "150 Marks (2.5 Hours)",
        keyTopics: ["Brain & Reflex Arc", "Eye & Ear Structure", "Negative Feedback Loops", "Menstrual Cycle"]
      },
      {
        paper: "Paper 2 (Genetics & Evolution)",
        description: "DNA Code of Life, RNA Synthesis, Genetics & Inheritance, Evolution by Natural Selection, Hominid Fossil Evidence",
        weighting: "150 Marks (2.5 Hours)",
        keyTopics: ["Transcription & Translation", "Monohybrid & Dihybrid Crosses", "Pedigree Diagrams", "Speciation & Darwinism"]
      }
    ],
    keyFormulasAndConcepts: [
      {
        topic: "Genetics - Monohybrid Cross Ratio",
        formulaOrRule: "Heterozygous x Heterozygous (Tt x Tt) -> 3:1 Phenotype Ratio (75% Dominant, 25% Recessive)",
        explanation: "Punnett square analysis for mendelian single gene inheritance.",
        exampleQuestion: "Two brown-eyed heterozygous parents have children. What is the probability of a blue-eyed child?"
      }
    ],
    whiteboardGraphTypes: ["timeline", "chemical_structure"]
  },

  computer_applications_it: {
    id: "computer_applications_it",
    name: "Information Technology & Computer Studies",
    category: "Technology",
    grades: ["Grade 10", "Grade 11", "Grade 12", "TVET & Coding Bootcamps"],
    examPapers: [
      {
        paper: "Paper 1 (Practical Coding)",
        description: "Object-Oriented Programming, Data Structures, Algorithms, SQL Database Querying, GUI Event Handling",
        weighting: "150 Marks (3 Hours)",
        keyTopics: ["Delphi / Java / Python", "Array Searching & Sorting", "Text File Processing", "Relational Database SQL"]
      },
      {
        paper: "Paper 2 (Theory & Systems)",
        description: "Hardware, Software, Computer Networks, Internet Technologies, Data Security, Social Implications",
        weighting: "150 Marks (3 Hours)",
        keyTopics: ["CPU Architecture", "TCP/IP vs OSI Layers", "Database Normalization", "Cybersecurity Protocols"]
      }
    ],
    keyFormulasAndConcepts: [
      {
        topic: "Algorithms - Binary Search Complexity",
        formulaOrRule: "Time Complexity = O(log2 N)",
        explanation: "Divides sorted search range in half each step.",
        exampleQuestion: "How many maximum comparisons are needed to find a number in 1024 sorted elements using Binary Search?"
      }
    ],
    whiteboardGraphTypes: ["circuit_diagram", "timeline"]
  }
};

/**
 * Search the Knowledgebase for answers, formulas, curriculum guidelines, AND school types
 */
export function searchAcademicKnowledgebase(query: string, subjectId?: string) {
  const queryLower = query.toLowerCase();
  
  if (subjectId && ACADEMIC_SUBJECTS_KNOWLEDGEBASE[subjectId]) {
    const subject = ACADEMIC_SUBJECTS_KNOWLEDGEBASE[subjectId];
    return {
      subjectName: subject.name,
      category: subject.category,
      relevantFormulas: subject.keyFormulasAndConcepts.filter(
        f => f.topic.toLowerCase().includes(queryLower) || f.explanation.toLowerCase().includes(queryLower) || f.formulaOrRule.toLowerCase().includes(queryLower)
      ),
      examPapers: subject.examPapers
    };
  }

  // Cross-subject search
  const matchedSubjects = Object.values(ACADEMIC_SUBJECTS_KNOWLEDGEBASE).map(subj => {
    const matchedFormulas = subj.keyFormulasAndConcepts.filter(
      f => f.topic.toLowerCase().includes(queryLower) || f.explanation.toLowerCase().includes(queryLower) || f.formulaOrRule.toLowerCase().includes(queryLower)
    );
    return {
      subject: subj.name,
      matchedFormulas,
      examPapers: subj.examPapers
    };
  }).filter(m => m.matchedFormulas.length > 0);

  // Search school types knowledgebase
  const matchedSchoolTypes: SchoolTypeDefinition[] = [];
  Object.values(SCHOOL_TYPES_KNOWLEDGEBASE).forEach(category => {
    category.schools.forEach(school => {
      if (
        school.name.toLowerCase().includes(queryLower) ||
        school.description.toLowerCase().includes(queryLower) ||
        school.subtitle.toLowerCase().includes(queryLower) ||
        school.category.toLowerCase().includes(queryLower) ||
        school.keyFeatures.some(feat => feat.toLowerCase().includes(queryLower))
      ) {
        matchedSchoolTypes.push(school);
      }
    });
  });

  return {
    matchedSubjects,
    matchedSchoolTypes
  };
}

