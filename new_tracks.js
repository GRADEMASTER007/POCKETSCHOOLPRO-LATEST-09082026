const fs = require('fs');
let content = fs.readFileSync('src/components/study/DataSeeder.tsx', 'utf8');

const newTracksStr = `,
  {
    id: "primary",
    title: "Primary School (Foundation Phase)",
    icon: Book,
    desc: "Foundational literacy, numeracy, and life skills for young learners (Grades 1-3). Aligned with international primary standards.",
    color: "from-pink-500/10 to-rose-500/10 border-pink-100",
    iconColor: "text-pink-600 bg-pink-50",
    subjects: ["Basic Numeracy", "Phonics & Literacy", "Life Skills"],
    milestones: [
      {
        subject: "Basic Numeracy",
        title: "Addition & Subtraction to 20",
        description: "Understanding number bonds, using number lines, and solving simple word problems.",
        dueDate: "Jul 28",
        status: "in_progress",
        subTasks: [
          { text: "Complete number bonds to 10 worksheet", completed: true },
          { text: "Practice counting forwards and backwards from 20", completed: false }
        ]
      },
      {
        subject: "Phonics & Literacy",
        title: "Vowel Digraphs",
        description: "Identifying and reading words with long vowel sounds (ai, ee, igh, oa, oo).",
        dueDate: "Aug 15",
        status: "not_started",
        subTasks: [
          { text: "Read the 'ai' sound storybook", completed: false },
          { text: "Complete spelling list for 'ee' words", completed: false }
        ]
      }
    ],
    documents: [
      {
        name: "Foundation Phase Literacy Guide.md",
        size: "1.2 MB",
        webViewLink: "#",
        content: \`# Foundation Phase Literacy\nA guide to teaching reading and writing in the early years.\n## Core Principles:\n1. **Phonemic Awareness**: Recognizing individual sounds in words.\n2. **Phonics**: Connecting sounds to letters.\n3. **Fluency**: Reading with speed, accuracy, and proper expression.\n*Source: Early Literacy OER.*\`
      }
    ],
    flashcards: [
      { category: "Basic Numeracy", question: "What is 7 + 5?", answer: "12" },
      { category: "Phonics & Literacy", question: "What sound does 'oa' make in 'boat'?", answer: "The long 'o' sound." }
    ],
    grades: [
      { subject: "Basic Numeracy", type: "Math Quiz", score: 95 },
      { subject: "Phonics & Literacy", type: "Reading Assessment", score: 88 }
    ]
  },
  {
    id: "middle",
    title: "Middle School (Senior Phase)",
    icon: BookOpen,
    desc: "Transitionary subjects including Natural Sciences, Social Sciences, and pre-algebra concepts (Grades 7-9).",
    color: "from-cyan-500/10 to-sky-500/10 border-cyan-100",
    iconColor: "text-cyan-600 bg-cyan-50",
    subjects: ["Natural Sciences", "Social Sciences", "Pre-Algebra"],
    milestones: [
      {
        subject: "Natural Sciences",
        title: "Ecosystems and Food Webs",
        description: "Understanding producers, consumers, decomposers, and energy flow in ecosystems.",
        dueDate: "Aug 05",
        status: "in_progress",
        subTasks: [
          { text: "Draw a local ecosystem food web", completed: true },
          { text: "Identify the apex predator in a marine biome", completed: false }
        ]
      },
      {
        subject: "Pre-Algebra",
        title: "Linear Equations",
        description: "Solving one-step and two-step linear equations for an unknown variable.",
        dueDate: "Aug 20",
        status: "not_started",
        subTasks: [
          { text: "Solve 10 practice equations balancing both sides", completed: false },
          { text: "Translate word problems into algebraic equations", completed: false }
        ]
      }
    ],
    documents: [
      {
        name: "Natural Sciences Grade 8.md",
        size: "2.5 MB",
        webViewLink: "#",
        content: \`# Grade 8 Natural Sciences\nAn introduction to physical and biological sciences.\n## Topics:\n- **Life and Living**: Cells, reproduction, and ecosystems.\n- **Matter and Materials**: Particle model of matter, atoms, and chemical reactions.\n- **Energy and Change**: Static electricity, circuits, and heat transfer.\n*Source: Open Educational Resources for Middle School.*\`
      }
    ],
    flashcards: [
      { category: "Natural Sciences", question: "What is a primary consumer?", answer: "An organism that eats producers (plants); an herbivore." },
      { category: "Pre-Algebra", question: "Solve for x: 2x + 5 = 15", answer: "x = 5" }
    ],
    grades: [
      { subject: "Natural Sciences", type: "Ecosystems Project", score: 92 },
      { subject: "Pre-Algebra", type: "Midterm Test", score: 85 }
    ]
  },
  {
    id: "high",
    title: "High School (FET Phase)",
    icon: GraduationCap,
    desc: "Advanced subjects preparing for university entrance, including Calculus, Organic Chemistry, and Literature.",
    color: "from-violet-500/10 to-fuchsia-500/10 border-violet-100",
    iconColor: "text-violet-600 bg-violet-50",
    subjects: ["Calculus", "Organic Chemistry", "Literature"],
    milestones: [
      {
        subject: "Calculus",
        title: "Differentiation Rules",
        description: "Applying the power rule, product rule, quotient rule, and chain rule.",
        dueDate: "Aug 10",
        status: "in_progress",
        subTasks: [
          { text: "Differentiate polynomials using the power rule", completed: true },
          { text: "Apply chain rule to composite functions", completed: false }
        ]
      },
      {
        subject: "Organic Chemistry",
        title: "Hydrocarbon Naming",
        description: "IUPAC nomenclature for alkanes, alkenes, alkynes, and aromatic compounds.",
        dueDate: "Aug 25",
        status: "not_started",
        subTasks: [
          { text: "Memorize prefixes for carbon chain lengths 1-10", completed: false },
          { text: "Identify functional groups in complex molecules", completed: false }
        ]
      }
    ],
    documents: [
      {
        name: "Introductory Calculus.md",
        size: "3.0 MB",
        webViewLink: "#",
        content: \`# Introductory Calculus\nA foundational text for limits, derivatives, and integrals.\n## Chapters:\n1. **Limits and Continuity**: The foundation of calculus.\n2. **Derivatives**: Rates of change and tangent lines.\n3. **Applications of Derivatives**: Optimization and curve sketching.\n*Source: Open Calculus Consortium.*\`
      }
    ],
    flashcards: [
      { category: "Calculus", question: "What is the derivative of sin(x)?", answer: "cos(x)" },
      { category: "Organic Chemistry", question: "What is the general formula for an alkane?", answer: "C_nH_{2n+2}" }
    ],
    grades: [
      { subject: "Calculus", type: "Derivatives Quiz", score: 96 },
      { subject: "Organic Chemistry", type: "Nomenclature Assignment", score: 89 }
    ]
  }
];

export default function DataSeeder() {`;

content = content.replace("];\n\nexport default function DataSeeder() {", newTracksStr);
content = content.replace(`const [selectedTracks, setSelectedTracks] = useState<string[]>(["academic", "agriculture", "technical", "disabilities"]);`, `const [selectedTracks, setSelectedTracks] = useState<string[]>(["academic", "agriculture", "technical", "disabilities", "primary", "middle", "high"]);`);
content = content.replace(`<span>Selected: <strong>{selectedTracks.length} of 4</strong> educational tracks</span>`, `<span>Selected: <strong>{selectedTracks.length} of {CURRICULA_TRACKS.length}</strong> educational tracks</span>`);


fs.writeFileSync('src/components/study/DataSeeder.tsx', content);
