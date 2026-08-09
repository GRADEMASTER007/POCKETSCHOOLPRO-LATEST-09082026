import React, { useState } from "react";
import { 
  collection, 
  writeBatch, 
  doc, 
  getDocs, 
  query, 
  where,
  addDoc,
  setDoc
} from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import { 
  Database, 
  Sparkles, 
  Check, 
  Loader2, 
  Activity, 
  GraduationCap,
  Sprout,
  Cpu,
  Accessibility,
  BookOpen,
  Award,
  Book,
  FileText,
  Monitor,
  Globe,
  Map,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PRESEEDED_FLASHCARDS, PRESEEDED_QUIZZES } from "@/src/data/preseededCoursework";

const CURRICULA_TRACKS = [
  {
    id: "academic",
    title: "International Academics & Boards",
    icon: GraduationCap,
    desc: "Syllabi & guides derived from Cambridge Advanced Levels, WAEC, and MIT OpenCourseWare STEM programs.",
    color: "from-blue-500/10 to-indigo-500/10 border-blue-100",
    iconColor: "text-blue-600 bg-blue-50",
    subjects: ["Cambridge Physics", "Biology (A-Level)", "Algorithms (MIT 6.006)", "Advanced Mathematics"],
    milestones: [
      {
        subject: "Cambridge Physics",
        title: "Newtonian Mechanics",
        description: "Kinematics, dynamic friction, and drag resistance in multiple dimensions.",
        dueDate: "Jul 28",
        status: "in_progress",
        subTasks: [
          { text: "Derive 3D kinematics equations for projectile paths", completed: true },
          { text: "Solve advanced friction vectors with incline angles", completed: false }
        ]
      },
      {
        subject: "Biology (A-Level)",
        title: "Cellular Biology & Mitosis",
        description: "Explore the fundamental unit of life, cell organelles, and the cell cycle.",
        dueDate: "Aug 05",
        status: "not_started",
        subTasks: [
          { text: "Identify organelles in an animal cell", completed: false },
          { text: "Map the stages of mitosis", completed: false }
        ]
      },
      {
        subject: "Advanced Mathematics",
        title: "Functions & Geometry",
        description: "Analyze complex functions, graph parabolas, and explore geometric identities.",
        dueDate: "Aug 10",
        status: "not_started",
        subTasks: [
          { text: "Solve quadratic equations using the formula", completed: false },
          { text: "Graph $y = x^2 - 4x + 4$ and find the vertex", completed: false }
        ]
      }
    ],
    documents: [
      {
        name: "Advanced Cellular Biology.md",
        size: "4.5 MB",
        webViewLink: "#",
        content: `# Advanced Cellular Biology

![Animal Cell Diagram](https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1200&q=80)

## Overview of the Cell
Cells are the fundamental units of life. Whether examining a single-celled paramecium or a complex multicellular organism, the cell remains the basic building block.

## Key Organelles
*   **Nucleus:** The command center, containing genetic material (DNA).
*   **Mitochondria:** The powerhouse of the cell, generating ATP through cellular respiration.
*   **Ribosomes:** Sites of protein synthesis.
*   **Endoplasmic Reticulum (ER):** Rough ER (with ribosomes) and Smooth ER (lipid synthesis).
*   **Golgi Apparatus:** Modifies, sorts, and packages proteins for secretion.

### The Cell Cycle (Mitosis)
1.  **Prophase:** Chromatin condenses into visible chromosomes.
2.  **Metaphase:** Chromosomes align at the cell equator.
3.  **Anaphase:** Sister chromatids are pulled apart to opposite poles.
4.  **Telophase:** Nuclear membranes reform around the two sets of chromosomes.

*Interactive experiment: Use a light microscope to observe onion root tip cells undergoing mitosis.*`
      },
      {
        name: "Physics Vol 1 - Mechanics.md",
        size: "3.2 MB",
        webViewLink: "#",
        content: `# Physics Vol 1: Mechanics

![Pendulum Motion](https://images.unsplash.com/photo-1497250681558-444458b68fc3?auto=format&fit=crop&w=1200&q=80)

## 1. Kinematics
Kinematics is the study of motion without considering the forces that cause it. 

**Equations of Motion:**
*   $v = u + at$
*   $s = ut + \frac{1}{2}at^2$
*   $v^2 = u^2 + 2as$

## 2. Dynamics (Newton's Laws)
*   **First Law (Inertia):** An object remains at rest or in uniform motion unless acted upon by a net external force.
*   **Second Law ($F=ma$):** The acceleration of an object is directly proportional to the net force acting on it.
*   **Third Law (Action-Reaction):** For every action, there is an equal and opposite reaction.`
      },
      {
        name: "Mathematics - Geometry & Algebra.md",
        size: "2.8 MB",
        webViewLink: "#",
        content: `# Advanced Mathematics

![Geometry and Math](https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80)

## Quadratic Equations
The standard form of a quadratic equation is $ax^2 + bx + c = 0$.

**The Quadratic Formula:**
$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$

### Worked Example
Solve $x^2 - 5x + 6 = 0$.
Here, $a=1, b=-5, c=6$.
1.  Calculate the discriminant: $(-5)^2 - 4(1)(6) = 25 - 24 = 1$.
2.  Apply the formula: $x = \frac{5 \pm \sqrt{1}}{2}$.
3.  Solutions: $x = 3$ and $x = 2$.

## Geometry: Pythagorean Theorem
For any right-angled triangle, the square of the hypotenuse ($c$) is equal to the sum of the squares of the other two sides ($a$ and $b$).
$a^2 + b^2 = c^2$
`
      }
    ],
    flashcards: [
      { category: "Cambridge Physics", question: "What is terminal velocity?", answer: "The constant velocity reached when the drag force equals the gravitational pull." },
      { category: "Biology (A-Level)", question: "Which organelle is responsible for ATP production?", answer: "Mitochondria." },
      { category: "Advanced Mathematics", question: "What is the quadratic formula?", answer: "x = (-b ± √(b^2 - 4ac)) / 2a" }
    ],
    grades: [
      { subject: "Cambridge Physics", type: "Midterm Exam", score: 94 },
      { subject: "Biology (A-Level)", type: "Cell Structure Quiz", score: 89 },
      { subject: "Advanced Mathematics", type: "Algebra Test", score: 91 }
    ]
  },
  {
    id: "agriculture",
    title: "Agricultural & Soil Sciences",
    icon: Sprout,
    desc: "FAO, USDA, and CGIAR-aligned sustainable agricultural education, soil sciences, crop genetics, and hydrology guides.",
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-100",
    iconColor: "text-emerald-600 bg-emerald-50",
    subjects: ["Sustainable Agriculture", "Soil Science", "Soil Hydrology"],
    milestones: [
      {
        subject: "Soil Science",
        title: "Soil Horizons & Profiles",
        description: "Understanding O, A, B, C, and R horizons and their nutrient compositions.",
        dueDate: "Jul 30",
        status: "in_progress",
        subTasks: [
          { text: "Identify the topsoil (A horizon) characteristics", completed: true },
          { text: "Analyze loam vs clay soil retention", completed: false }
        ]
      }
    ],
    documents: [
      {
        name: "Fundamentals of Soil Science.md",
        size: "5.1 MB",
        webViewLink: "#",
        content: `# Fundamentals of Soil Science

![Soil Profile](https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80)

## The Soil Profile
A soil profile is a vertical section of the soil that depicts all of its horizons.

*   **O Horizon (Organic):** Composed of decomposing organic matter (humus).
*   **A Horizon (Topsoil):** Rich in minerals and organics. Crucial for plant growth.
*   **B Horizon (Subsoil):** Accumulates leached minerals like iron and clay.
*   **C Horizon (Parent Material):** Partially weathered rock.
*   **R Horizon (Bedrock):** Solid unweathered rock.

## Soil Texture
Soil texture is determined by the relative proportions of sand, silt, and clay.
*   **Sand:** Largest particles, excellent drainage, poor nutrient retention.
*   **Silt:** Medium particles, feels floury.
*   **Clay:** Smallest particles, poor drainage, excellent nutrient retention.
*   **Loam:** The ideal agricultural soil, a balanced mixture of all three.

### Practical Application: The Ribbon Test
Determine soil texture by moistening a handful of soil and attempting to press it into a ribbon between your thumb and forefinger.`
      }
    ],
    flashcards: [
      { category: "Soil Science", question: "Which soil horizon is known as the topsoil?", answer: "The A Horizon." },
      { category: "Soil Science", question: "What is loam?", answer: "A balanced mixture of sand, silt, and clay, ideal for agriculture." }
    ],
    grades: [
      { subject: "Soil Science", type: "Soil Profiling Lab", score: 92 }
    ]
  },
  {
    id: "technical",
    title: "Industrial & Vocational TVET",
    icon: Cpu,
    desc: "Hands-on engineering tracks for solar PV array installations, PLC ladder logics, wiring installations, and Arduino hardware guides.",
    color: "from-amber-500/10 to-orange-500/10 border-amber-100",
    iconColor: "text-amber-600 bg-amber-50",
    subjects: ["Solar PV Engineering", "Electrical Engineering", "PLC Systems"],
    milestones: [
      {
        subject: "Electrical Engineering",
        title: "Basic Circuit Analysis",
        description: "Ohm's Law, Kirchhoff's Laws, and series/parallel resistor circuits.",
        dueDate: "Aug 15",
        status: "in_progress",
        subTasks: [
          { text: "Calculate total resistance in a parallel circuit", completed: true },
          { text: "Apply Kirchhoff's Voltage Law to a closed loop", completed: false }
        ]
      }
    ],
    documents: [
      {
        name: "Electrical Engineering Diagrams & Concepts.md",
        size: "4.8 MB",
        webViewLink: "#",
        content: `# Electrical Engineering: Core Concepts

![Circuit Board](https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1200&q=80)

## Ohm's Law
The foundational principle of electrical engineering.
**V = I * R**
Where V is Voltage (Volts), I is Current (Amperes), and R is Resistance (Ohms).

## Circuit Types
### 1. Series Circuits
Components are connected end-to-end.
*   **Current:** The same everywhere ($I_{total} = I_1 = I_2$).
*   **Resistance:** $R_{total} = R_1 + R_2 + ... + R_n$.

### 2. Parallel Circuits
Components are connected across common points.
*   **Voltage:** The same across all branches ($V_{total} = V_1 = V_2$).
*   **Resistance:** $1/R_{total} = 1/R_1 + 1/R_2 + ... + 1/R_n$.

## Kirchhoff's Laws
*   **KCL (Current Law):** Total current entering a junction equals total current leaving.
*   **KVL (Voltage Law):** The sum of all voltages around any closed loop in a circuit must equal zero.

*Workshop Exercise: Breadboard a simple LED circuit using a 9V battery, a 330-ohm resistor, and a standard red LED to visually demonstrate Ohm's law.*`
      }
    ],
    flashcards: [
      { category: "Electrical Engineering", question: "What does KVL state?", answer: "The sum of voltages in a closed loop is zero." },
      { category: "Solar PV Engineering", question: "What is the purpose of an inverter in a solar PV system?", answer: "To convert DC power from the solar panels into AC power for household use." }
    ],
    grades: [
      { subject: "Electrical Engineering", type: "Circuit Analysis Test", score: 88 }
    ]
  },
  {
    id: "disabilities",
    title: "Inclusive & Special Education",
    icon: Accessibility,
    desc: "Unified English Braille mechanical cell configurations, screen-reader shortcuts, ASL sign basics, and plain-language STEM tutorials.",
    color: "from-purple-500/10 to-pink-500/10 border-purple-100",
    iconColor: "text-purple-600 bg-purple-50",
    subjects: ["Inclusive Learning Aids", "ASL Foundations"],
    milestones: [
      {
        subject: "ASL Foundations",
        title: "ASL Finger-Spelling",
        description: "Fingerspelling the manual alphabet quickly and accurately.",
        dueDate: "Aug 10",
        status: "in_progress",
        subTasks: [
          { text: "Perform static hand gestures for vowels A, E, I, O, U", completed: true },
          { text: "Speed-drill finger-spelling random 4-letter words", completed: false }
        ]
      }
    ],
    documents: [
      {
        name: "Sign Language Visual Dictionary.md",
        size: "3.5 MB",
        webViewLink: "#",
        content: `# Sign Language Foundations

![Hands Communicating](https://images.unsplash.com/photo-1526485856375-9110812fbf35?auto=format&fit=crop&w=1200&q=80)

## The Manual Alphabet
Fingerspelling is a fundamental skill, used for names, places, and words without dedicated signs.

### Five Parameters of a Sign
1.  **Handshape:** The shape of the hands (e.g., flat, fist, "C" shape).
2.  **Orientation:** The direction the palm faces (up, down, left, right).
3.  **Location:** Where the sign is performed relative to the body (e.g., chin, chest, neutral space).
4.  **Movement:** The action of the hands (e.g., tapping, sweeping, circular).
5.  **Non-Manual Signals (NMS):** Facial expressions and body language, which provide grammatical context (e.g., raised eyebrows for a yes/no question).

*Practice Activity: Spell your full name in front of a mirror until you can do it smoothly without looking at a chart.*`
      }
    ],
    flashcards: [
      { category: "ASL Foundations", question: "What are Non-Manual Signals?", answer: "Facial expressions and body language used to convey grammar and tone." }
    ],
    grades: [
      { subject: "ASL Foundations", type: "Alphabet Performance", score: 95 }
    ]
  },
  {
    id: "primary",
    title: "Primary School (Foundation Phase)",
    icon: Book,
    desc: "Foundational literacy, numeracy, and life skills for young learners.",
    color: "from-pink-500/10 to-rose-500/10 border-pink-100",
    iconColor: "text-pink-600 bg-pink-50",
    subjects: ["Basic Numeracy", "Phonics", "Life Skills"],
    milestones: [
      {
        subject: "Basic Numeracy",
        title: "Addition & Subtraction to 20",
        description: "Understanding number bonds and using number lines.",
        dueDate: "Jul 28",
        status: "in_progress",
        subTasks: [
          { text: "Complete number bonds to 10 worksheet", completed: true },
          { text: "Practice counting backwards from 20", completed: false }
        ]
      }
    ],
    documents: [
      {
        name: "Foundation Phase Numeracy.md",
        size: "1.2 MB",
        webViewLink: "#",
        content: `# Foundation Phase Numeracy

![Abacus](https://images.unsplash.com/photo-1518133835878-5a93ac3f0c0f?auto=format&fit=crop&w=1200&q=80)

## Counting & Patterns
Recognizing patterns is the foundation of mathematics. 
*   **Skip Counting:** 2, 4, 6, 8, 10.
*   **Shapes:** Recognizing circles, squares, triangles, and rectangles in real life.

## Number Bonds
Number bonds are pairs of numbers that add up to a specific total.
*   **Bonds to 10:** 1+9, 2+8, 3+7, 4+6, 5+5.
*   Visualizing these pairs helps children build strong mental arithmetic skills.`
      }
    ],
    flashcards: [
      { category: "Basic Numeracy", question: "What is 7 + 3?", answer: "10" }
    ],
    grades: []
  },
  {
    id: "middle",
    title: "Middle School (Senior Phase)",
    icon: BookOpen,
    desc: "Transitionary subjects including Natural Sciences, Social Sciences, and pre-algebra concepts.",
    color: "from-cyan-500/10 to-sky-500/10 border-cyan-100",
    iconColor: "text-cyan-600 bg-cyan-50",
    subjects: ["Natural Sciences", "Pre-Algebra"],
    milestones: [
      {
        subject: "Pre-Algebra",
        title: "Linear Equations",
        description: "Solving one-step and two-step linear equations.",
        dueDate: "Aug 20",
        status: "in_progress",
        subTasks: [
          { text: "Solve 10 practice equations", completed: true },
          { text: "Translate word problems into equations", completed: false }
        ]
      }
    ],
    documents: [
      {
        name: "Pre-Algebra Fundamentals.md",
        size: "2.5 MB",
        webViewLink: "#",
        content: `# Pre-Algebra Fundamentals

![Math Equations](https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80)

## Variables and Expressions
A variable is a letter or symbol that represents an unknown number (e.g., $x$, $y$).
An algebraic expression contains numbers, operations, and variables (e.g., $2x + 3$).

## Solving One-Step Equations
The goal is to isolate the variable on one side of the equation.
**Rule:** Whatever you do to one side of the equation, you must do to the other side.

**Example: Solve for x**
$x - 5 = 12$
*(Add 5 to both sides)*
$x = 12 + 5$
$x = 17$`
      }
    ],
    flashcards: [
      { category: "Pre-Algebra", question: "Solve for x: 3x = 12", answer: "x = 4" }
    ],
    grades: []
  },
  {
    id: "high",
    title: "High School (FET Phase)",
    icon: GraduationCap,
    desc: "Advanced subjects preparing for university entrance, including Calculus and Organic Chemistry.",
    color: "from-violet-500/10 to-fuchsia-500/10 border-violet-100",
    iconColor: "text-violet-600 bg-violet-50",
    subjects: ["Calculus", "Organic Chemistry"],
    milestones: [
      {
        subject: "Calculus",
        title: "Derivatives & Applications",
        description: "Applying the power rule, product rule, quotient rule, and chain rule.",
        dueDate: "Aug 10",
        status: "in_progress",
        subTasks: [
          { text: "Differentiate polynomials using the power rule", completed: true },
          { text: "Apply chain rule to composite functions", completed: false }
        ]
      }
    ],
    documents: [
      {
        name: "Calculus - Derivative Rules.md",
        size: "3.0 MB",
        webViewLink: "#",
        content: `# Calculus: Derivative Rules

![Calculus Graph](https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80)

## What is a Derivative?
The derivative of a function measures the rate at which the function's value changes with respect to a change in its argument. Graphically, it is the slope of the tangent line to the curve.

## Common Differentiation Rules
1.  **Power Rule:** If $f(x) = x^n$, then $f'(x) = nx^{n-1}$.
2.  **Constant Rule:** The derivative of a constant is 0.
3.  **Sum Rule:** The derivative of $f(x) + g(x)$ is $f'(x) + g'(x)$.
4.  **Product Rule:** $(f \cdot g)' = f'g + fg'$.
5.  **Chain Rule:** $\frac{d}{dx}[f(g(x))] = f'(g(x))g'(x)$.

### Example Application
Find the derivative of $y = 3x^4 - 2x^2 + 5$.
Using the power rule and sum rule:
$y' = 12x^3 - 4x$`
      }
    ],
    flashcards: [
      { category: "Calculus", question: "What is the derivative of e^x?", answer: "e^x" }
    ],
    grades: []
  },
  {
    id: "earth_sciences",
    title: "Earth & Ocean Sciences",
    icon: Globe,
    desc: "Natural resources, oceanography, ecology, and climate sciences.",
    color: "from-teal-500/10 to-cyan-500/10 border-teal-100",
    iconColor: "text-teal-600 bg-teal-50",
    subjects: ["Oceanography", "Natural Resources"],
    milestones: [],
    documents: [
      {
        name: "Global Oceanography.md",
        size: "4.1 MB",
        webViewLink: "#",
        content: `# Oceanography & Marine Biomes

![Ocean Wave](https://images.unsplash.com/photo-1518182170546-076616fdacdc?auto=format&fit=crop&w=1200&q=80)

## Marine Ecosystems
Oceans cover roughly 71% of the Earth's surface and contain 97% of the Earth's water.
*   **Pelagic Zone:** The open ocean, home to migrating fish, whales, and sharks.
*   **Benthic Zone:** The ocean floor, ranging from shallow coastal areas to the deep abyssal plain.
*   **Coral Reefs:** Found in warm, shallow waters; known as the "rainforests of the sea" due to high biodiversity.

## Ocean Currents
Currents regulate global climate by transporting warm water from the equator toward the poles and cold water from the poles back to the tropics.
*   **Surface Currents:** Driven by global wind patterns.
*   **Thermohaline Circulation:** The global "conveyor belt" driven by differences in water density (temperature and salinity).`
      }
    ],
    flashcards: [],
    grades: []
  },
  {
    id: "african_studies",
    title: "Pan-African History",
    icon: Map,
    desc: "Rich history and geography of the African continent.",
    color: "from-orange-500/10 to-red-500/10 border-orange-100",
    iconColor: "text-orange-600 bg-orange-50",
    subjects: ["African History"],
    milestones: [],
    documents: [],
    flashcards: [],
    grades: []
  },
  {
    id: "digital_literacy",
    title: "Global Digital Literacy",
    icon: Monitor,
    desc: "Essential digital skills for the modern world.",
    color: "from-blue-500/10 to-cyan-500/10 border-blue-100",
    iconColor: "text-blue-600 bg-blue-50",
    subjects: ["Google Workspace", "Internet Safety"],
    milestones: [],
    documents: [],
    flashcards: [],
    grades: []
  }
];

export default function DataSeeder() {
  const [seeding, setSeeding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [showPanel, setShowPanel] = useState(true);
  const [selectedTracks, setSelectedTracks] = useState<string[]>(["academic", "agriculture", "technical", "disabilities", "primary", "middle", "high", "earth_sciences", "african_studies", "digital_literacy"]);

  const toggleTrack = (id: string) => {
    setSelectedTracks(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const seedAuthenticData = async () => {
    if (!auth.currentUser) {
      alert("Please log in first to seed your academic profile!");
      return;
    }

    if (selectedTracks.length === 0) {
      alert("Please select at least one educational track to seed!");
      return;
    }

    const uid = auth.currentUser.uid;
    setSeeding(true);
    setSuccess(false);
    setStatusLog(["Initiating Global Curriculum Synthesis Engine...", "Connecting to secure Firestore database sandbox..."]);

    try {
      const batch = writeBatch(db);

      // --- 1. CLEAN PREVIOUS SEEDED DATA ---
      setStatusLog(prev => [...prev, "Cleaning old coursework records to ensure a fresh, clean workspace..."]);
      const collectionsToPurge = ["grades", "assignments", "exams", "flashcards", "quizzes", "focus_sessions", "study_roadmaps", "documents"];
      
      for (const col of collectionsToPurge) {
        const snap = await getDocs(query(collection(db, col), where("userId", "==", uid)));
        snap.forEach((document) => {
          batch.delete(doc(db, col, document.id));
        });
      }

      // --- 2. COMPILE SELECTED TRACKS ---
      const activeTracks = CURRICULA_TRACKS.filter(t => selectedTracks.includes(t.id));

      for (const track of activeTracks) {
        setStatusLog(prev => [...prev, `Synthesizing materials for: ${track.title}...`]);

        // A. Seed Grades
        track.grades.forEach((grade, idx) => {
          const ref = doc(collection(db, "grades"));
          batch.set(ref, {
            userId: uid,
            subject: grade.subject,
            type: grade.type,
            score: grade.score,
            date: Date.now() - (idx + 1) * 3 * 24 * 60 * 60 * 1000
          });
        });

        // B. Seed Milestones (Study Roadmaps)
        track.milestones.forEach((milestone, idx) => {
          const ref = doc(collection(db, "study_roadmaps"));
          batch.set(ref, {
            userId: uid,
            subject: milestone.subject,
            title: milestone.title,
            description: milestone.description,
            status: milestone.status,
            dueDate: milestone.dueDate,
            order: idx,
            subTasks: milestone.subTasks.map((t, sIdx) => ({
              id: `st_${Date.now()}_${idx}_${sIdx}`,
              text: t.text,
              completed: t.completed
            }))
          });
        });

        // C. Seed Documents (OER Textbooks / Guides with links)
        track.documents.forEach((document) => {
          const ref = doc(collection(db, "documents"));
          batch.set(ref, {
            userId: uid,
            name: document.name,
            mimeType: "text/markdown",
            content: document.content,
            size: document.size,
            webViewLink: document.webViewLink,
            modifiedTime: new Date().toISOString()
          });
        });

        // D. Seed Track Flashcards
        track.flashcards.forEach((fc) => {
          const ref = doc(collection(db, "flashcards"));
          batch.set(ref, {
            userId: uid,
            category: fc.category,
            question: fc.question,
            answer: fc.answer,
            createdAt: Date.now()
          });
        });
      }

      // --- 2B. SEED 300 HIGH-QUALITY PRESEEDED FLASHCARDS & 300 QUIZZES ---
      setStatusLog(prev => [...prev, `Injecting 300 High-Quality Flashcards across 10 academic subjects...`]);
      PRESEEDED_FLASHCARDS.forEach((fc) => {
        const ref = doc(collection(db, "flashcards"));
        batch.set(ref, {
          userId: uid,
          subject: fc.subject,
          category: fc.category,
          question: fc.front,
          answer: fc.back,
          front: fc.front,
          back: fc.back,
          createdAt: Date.now()
        });
      });

      setStatusLog(prev => [...prev, `Injecting 300 High-Quality Quiz Questions with instant step-by-step AI insights...`]);
      PRESEEDED_QUIZZES.forEach((qz) => {
        const ref = doc(collection(db, "quizzes"));
        batch.set(ref, {
          userId: uid,
          subject: qz.subject,
          category: qz.category,
          title: `${qz.subject} - ${qz.category} Quiz`,
          question: qz.question,
          options: qz.options,
          answer: qz.answer,
          explanation: qz.explanation,
          createdAt: Date.now()
        });
      });

      // --- 3. SEED UPCOMING GENERAL DEADLINES & STATS ---
      setStatusLog(prev => [...prev, "Writing central homework timelines, user streaks, and focus metrics..."]);
      
      // Feed some Assignments
      const assignments = [
        { subject: activeTracks[0]?.subjects[0] || "Academics", title: "Comprehensive Review Paper", description: "Read the assigned open-source chapters and summarize the critical outcomes.", dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000 },
        { subject: activeTracks[1]?.subjects[0] || "Specialty", title: "Practical Application Exercise", description: "Simulate and write down practical implementation guidelines.", dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000 }
      ];
      assignments.forEach((asg) => {
        const ref = doc(collection(db, "assignments"));
        batch.set(ref, { userId: uid, ...asg });
      });

      // Feed some Exams
      const exams = [
        { subject: activeTracks[0]?.subjects[0] || "Academics", title: "Syllabus Midterm Evaluation", examDate: Date.now() + 10 * 24 * 60 * 60 * 1000 }
      ];
      exams.forEach((ex) => {
        const ref = doc(collection(db, "exams"));
        batch.set(ref, { userId: uid, ...ex });
      });

      // User streaks
      const streakRef = doc(db, "user_streaks", uid);
      batch.set(streakRef, {
        currentStreak: 15,
        longestStreak: 20,
        totalDaysStudied: 34,
        lastStudyDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      });

      const statsRef = doc(db, "user_stats", uid);
      batch.set(statsRef, {
        xp: 850,
        claimedBadges: []
      }, { merge: true });

      // Focus sessions history
      const now = new Date();
      const focusSessions = [
        { offsetDays: 6, durationSeconds: 60 * 60 },
        { offsetDays: 5, durationSeconds: 90 * 60 },
        { offsetDays: 4, durationSeconds: 45 * 60 },
        { offsetDays: 3, durationSeconds: 120 * 60 },
        { offsetDays: 2, durationSeconds: 40 * 60 },
        { offsetDays: 1, durationSeconds: 150 * 60 },
        { offsetDays: 0, durationSeconds: 80 * 60 },
      ];

      focusSessions.forEach((session) => {
        const sessionDate = new Date();
        sessionDate.setDate(now.getDate() - session.offsetDays);
        const dateStr = sessionDate.toISOString().split('T')[0];
        const ref = doc(collection(db, "focus_sessions"));
        batch.set(ref, {
          userId: uid,
          date: dateStr,
          durationSeconds: session.durationSeconds,
          createdAt: sessionDate.getTime()
        });
      });

      // Commit Batch
      setStatusLog(prev => [...prev, "Deploying database transaction batches securely..."]);
      await batch.commit();

      // Create study room if missing
      const roomsSnap = await getDocs(query(collection(db, "study_rooms"), where("members", "array-contains", uid)));
      if (roomsSnap.empty) {
        setStatusLog(prev => [...prev, "Establishing collaborative Global Learning Circle..."]);
        const roomId = `room_inclusive_${Date.now()}`;
        await setDoc(doc(db, "study_rooms", roomId), {
          id: roomId,
          name: "Global Curriculum Researchers",
          members: [uid],
          createdAt: Date.now()
        });

        await addDoc(collection(db, "room_messages"), {
          roomId: roomId,
          userId: "system",
          userName: "Pocket School AI",
          text: "📚 Welcome to the Global Curriculum Group! Here you can coordinate with other learners studying international academic targets, modern agricultural methods, inclusive braille systems, and vocational trade standards.",
          createdAt: Date.now()
        });
      }

      setStatusLog(prev => [...prev, "🎓 Synthesis complete! Clean, high-fidelity curriculum database loaded successfully."]);
      setSuccess(true);
    } catch (error) {
      console.error("Error seeding global educational data:", error);
      setStatusLog(prev => [...prev, `❌ Error during synthesis: ${(error as Error).message}`]);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AnimatePresence>
      {showPanel && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-100 p-8 rounded-[2.5rem] shadow-sm mb-12 relative overflow-hidden"
          id="academic-data-seeder"
        >
          {/* Background decorative asset */}
          <div className="absolute right-0 top-0 p-8 opacity-5 pointer-events-none">
            <Database className="w-48 h-48 text-indigo-500" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-100/60 pb-5">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-2.5">
                  <Sparkles className="w-3.5 h-3.5" /> Curricular Synthesis Engine
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  Seed Unified & Inclusive Coursework
                </h3>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                  Clear previous data and instantly seed your student profile with internationally recognized curricula, open-source textbooks, vocational craft guides, agricultural methodologies, and disability-accessible learning guides.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
                <button
                  onClick={() => setShowPanel(false)}
                  className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 py-3.5 px-5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Selection Tracks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CURRICULA_TRACKS.map((track) => {
                const IconComponent = track.icon;
                const isSelected = selectedTracks.includes(track.id);
                return (
                  <div 
                    key={track.id}
                    onClick={() => toggleTrack(track.id)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between h-full bg-white select-none ${
                      isSelected 
                        ? "border-blue-500 ring-2 ring-blue-500/10 shadow-sm" 
                        : "border-gray-100/80 hover:border-gray-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${track.iconColor}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-white text-[10px] font-bold ${
                          isSelected ? "bg-blue-600 border-transparent" : "border-gray-300"
                        }`}>
                          {isSelected && "✓"}
                        </div>
                      </div>
                      <h4 className="text-sm font-black text-gray-900 tracking-tight">{track.title}</h4>
                      <p className="text-gray-400 text-[10px] mt-1.5 leading-relaxed font-semibold">{track.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase text-gray-400">Includes:</span>
                      <div className="flex flex-wrap gap-1">
                        {track.subjects.map(s => (
                          <span key={s} className="text-[8px] bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold">
                            {s.split(" ")[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Launch Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
              <div className="flex items-center gap-2.5 text-xs text-gray-500 font-semibold">
                <Book className="w-4 h-4 text-blue-500" />
                <span>Selected: <strong>{selectedTracks.length} of {CURRICULA_TRACKS.length}</strong> educational tracks</span>
              </div>

              <button
                onClick={seedAuthenticData}
                disabled={seeding}
                className="bg-blue-600 text-white py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-600/10 flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
              >
                {seeding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Synthesizing Database...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Seed Curricula & Clean Workspace
                  </>
                )}
              </button>
            </div>

            {/* Log Panel */}
            {(statusLog.length > 0 || success) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="border-t border-blue-100/60 pt-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 animate-pulse" /> Synthesis Execution Log
                  </span>
                  {success && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1 animate-bounce">
                      <Check className="w-3 h-3" /> Successfully Synced!
                    </span>
                  )}
                </div>

                <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-[11px] leading-relaxed max-h-40 overflow-y-auto space-y-1.5 shadow-inner">
                  {statusLog.map((log, index) => (
                    <div key={index} className="flex items-start gap-1.5">
                      <span className="text-slate-500 select-none">&gt;</span>
                      <span className={log.startsWith("❌") ? "text-rose-400" : log.startsWith("🎓") ? "text-emerald-400 font-bold" : "text-slate-200"}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>

                {success && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-[11px] leading-relaxed flex items-start gap-3">
                    <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-emerald-900">Workspace populated with full resources!</p>
                      <p className="text-emerald-700">
                        Go to the <strong>Document Center</strong> to review open-source textbook links and run AI analyses. Launch the <strong>Study Roadmap</strong> tab to step through the detailed syllabi checklists. Start learning!
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
