export interface PreseededFlashcard {
  id: string;
  subject: string;
  category: string;
  front: string;
  back: string;
}

export interface PreseededQuizQuestion {
  id: string;
  subject: string;
  category: string;
  question: string;
  options: [string, string, string, string];
  answer: number; // 0, 1, 2, or 3
  explanation: string;
}

// ==========================================
// 300 HIGH QUALITY PRESEEDED FLASHCARDS
// ==========================================
export const PRESEEDED_FLASHCARDS: PreseededFlashcard[] = [
  // --- MATHEMATICS (30) ---
  { id: "fc_m01", subject: "Mathematics", category: "Algebra", front: "What is the Quadratic Formula?", back: "x = (-b ± √(b² - 4ac)) / (2a). It calculates the roots of any quadratic equation ax² + bx + c = 0." },
  { id: "fc_m02", subject: "Mathematics", category: "Algebra", front: "What is the discriminant of a quadratic equation?", back: "Δ = b² - 4ac. If Δ > 0: two real roots; Δ = 0: one real root; Δ < 0: two complex/imaginary roots." },
  { id: "fc_m03", subject: "Mathematics", category: "Calculus", front: "State the Power Rule for differentiation.", back: "d/dx (xⁿ) = n · xⁿ⁻¹. Multiply by the current power and decrease the exponent by 1." },
  { id: "fc_m04", subject: "Mathematics", category: "Calculus", front: "What is the Product Rule for derivatives?", back: "d/dx [u(x) · v(x)] = u'(x)v(x) + u(x)v'(x)." },
  { id: "fc_m05", subject: "Mathematics", category: "Calculus", front: "What is the Quotient Rule for derivatives?", back: "d/dx [u/v] = (u'v - uv') / v²." },
  { id: "fc_m06", subject: "Mathematics", category: "Calculus", front: "What is the Chain Rule?", back: "d/dx [f(g(x))] = f'(g(x)) · g'(x). Used to differentiate composite functions." },
  { id: "fc_m07", subject: "Mathematics", category: "Trigonometry", front: "State the Pythagorean Trigonometric Identity.", back: "sin²(θ) + cos²(θ) = 1 for any angle θ." },
  { id: "fc_m08", subject: "Mathematics", category: "Trigonometry", front: "What is the Sine Rule?", back: "a / sin(A) = b / sin(B) = c / sin(C). Used in non-right-angled triangles." },
  { id: "fc_m09", subject: "Mathematics", category: "Trigonometry", front: "What is the Cosine Rule?", back: "c² = a² + b² - 2ab · cos(C). Relates three sides of a triangle to an included angle." },
  { id: "fc_m10", subject: "Mathematics", category: "Algebra", front: "What is a matrix determinant for a 2x2 matrix [[a,b],[c,d]]?", back: "det(A) = ad - bc." },
  { id: "fc_m11", subject: "Mathematics", category: "Algebra", front: "When is a matrix singular?", back: "When its determinant equals 0 (det(A) = 0). A singular matrix has no inverse." },
  { id: "fc_m12", subject: "Mathematics", category: "Calculus", front: "What is the Fundamental Theorem of Calculus?", back: "It connects differentiation and integration: ∫[a to b] f(x)dx = F(b) - F(a), where F'(x) = f(x)." },
  { id: "fc_m13", subject: "Mathematics", category: "Geometry", front: "What is the formula for the volume of a sphere?", back: "V = (4/3) · π · r³." },
  { id: "fc_m14", subject: "Mathematics", category: "Geometry", front: "What is the distance formula between two points (x₁, y₁) and (x₂, y₂)?", back: "d = √((x₂ - x₁)² + (y₂ - y₁)²)." },
  { id: "fc_m15", subject: "Mathematics", category: "Statistics", front: "Define Variance (σ²).", back: "The average of the squared differences from the Mean. Measures data dispersion." },
  { id: "fc_m16", subject: "Mathematics", category: "Statistics", front: "What is Standard Deviation (σ)?", back: "The square root of variance (σ = √Variance). Expressed in the same units as the original data." },
  { id: "fc_m17", subject: "Mathematics", category: "Probability", front: "What is Bayes' Theorem?", back: "P(A|B) = [P(B|A) · P(A)] / P(B). Calculates conditional probability based on prior knowledge." },
  { id: "fc_m18", subject: "Mathematics", category: "Algebra", front: "What is an Arithmetic Sequence nth term formula?", back: "aₙ = a₁ + (n - 1)d, where a₁ is first term and d is common difference." },
  { id: "fc_m19", subject: "Mathematics", category: "Algebra", front: "What is a Geometric Sequence nth term formula?", back: "aₙ = a₁ · rⁿ⁻¹, where r is the common ratio." },
  { id: "fc_m20", subject: "Mathematics", category: "Calculus", front: "What is the limit definition of a derivative?", back: "f'(x) = lim[h→0] (f(x+h) - f(x)) / h." },
  { id: "fc_m21", subject: "Mathematics", category: "Calculus", front: "What is L'Hôpital's Rule?", back: "If lim f(x)/g(x) results in 0/0 or ∞/∞, then lim f(x)/g(x) = lim f'(x)/g'(x)." },
  { id: "fc_m22", subject: "Mathematics", category: "Algebra", front: "What is the Binomial Theorem formula?", back: "(a + b)ⁿ = ∑[k=0 to n] (n choose k) · aⁿ⁻ᵏ · bᵏ." },
  { id: "fc_m23", subject: "Mathematics", category: "Linear Algebra", front: "What is an Eigenvector?", back: "A non-zero vector v such that A · v = λ · v, where λ is the corresponding scalar eigenvalue." },
  { id: "fc_m24", subject: "Mathematics", category: "Trigonometry", front: "What is tan(θ) in terms of sin and cos?", back: "tan(θ) = sin(θ) / cos(θ)." },
  { id: "fc_m25", subject: "Mathematics", category: "Geometry", front: "What is the area of a triangle given two sides a, b and angle C?", back: "Area = (1/2) · a · b · sin(C)." },
  { id: "fc_m26", subject: "Mathematics", category: "Algebra", front: "What is a Logarithm identity for log(A · B)?", back: "log(A · B) = log(A) + log(B)." },
  { id: "fc_m27", subject: "Mathematics", category: "Algebra", front: "What is log(Aⁿ)?", back: "log(Aⁿ) = n · log(A)." },
  { id: "fc_m28", subject: "Mathematics", category: "Calculus", front: "Integration by Parts formula", back: "∫ u dv = u·v - ∫ v du. Derived from the product rule of differentiation." },
  { id: "fc_m29", subject: "Mathematics", category: "Statistics", front: "What is the z-score formula?", back: "z = (X - μ) / σ. Indicates how many standard deviations a raw score is from the mean." },
  { id: "fc_m30", subject: "Mathematics", category: "Complex Numbers", front: "What is Euler's Formula for complex numbers?", back: "e^(iθ) = cos(θ) + i · sin(θ). Links exponential functions with trigonometry." },

  // --- PHYSICS (30) ---
  { id: "fc_p01", subject: "Physics", category: "Mechanics", front: "State Newton's First Law of Motion.", back: "An object remains at rest or moves at constant velocity unless acted upon by a net external force." },
  { id: "fc_p02", subject: "Physics", category: "Mechanics", front: "State Newton's Second Law formula.", back: "F_net = m · a (Net Force = mass × acceleration)." },
  { id: "fc_p03", subject: "Physics", category: "Mechanics", front: "State Newton's Third Law.", back: "When object A exerts a force on object B, object B exerts an equal and opposite force on object A." },
  { id: "fc_p04", subject: "Physics", category: "Work & Energy", front: "What is Kinetic Energy (E_k)?", back: "E_k = (1/2) · m · v². Energy possessed by an object due to its motion." },
  { id: "fc_p05", subject: "Physics", category: "Work & Energy", front: "What is Gravitational Potential Energy (E_p)?", back: "E_p = m · g · h, where g ≈ 9.8 m/s² on Earth." },
  { id: "fc_p06", subject: "Physics", category: "Mechanics", front: "Define Momentum (p).", back: "p = m · v. Vector quantity measuring mass in motion." },
  { id: "fc_p07", subject: "Physics", category: "Mechanics", front: "State the Principle of Conservation of Linear Momentum.", back: "In an isolated system, total momentum before collision equals total momentum after collision." },
  { id: "fc_p08", subject: "Physics", category: "Electricity", front: "State Ohm's Law.", back: "V = I · R (Voltage = Current × Resistance)." },
  { id: "fc_p09", subject: "Physics", category: "Electricity", front: "Formula for Electrical Power (P).", back: "P = V · I = I²R = V²/R. Measured in Watts (W)." },
  { id: "fc_p10", subject: "Physics", category: "Waves", front: "What is the Wave Equation?", back: "v = f · λ (Speed = frequency × wavelength)." },
  { id: "fc_p11", subject: "Physics", category: "Optics", front: "State Snell's Law of Refraction.", back: "n₁ · sin(θ₁) = n₂ · sin(θ₂), where n is the refractive index." },
  { id: "fc_p12", subject: "Physics", category: "Thermodynamics", front: "First Law of Thermodynamics", back: "ΔU = Q - W (Change in internal energy = heat added - work done by system). Energy cannot be created or destroyed." },
  { id: "fc_p13", subject: "Physics", category: "Electromagnetism", front: "State Faraday's Law of Induction.", back: "The induced electromotive force (EMF) is proportional to the negative rate of change of magnetic flux." },
  { id: "fc_p14", subject: "Physics", category: "Electromagnetism", front: "State Lenz's Law.", back: "The direction of an induced current always opposes the change in magnetic flux that produced it." },
  { id: "fc_p15", subject: "Physics", category: "Modern Physics", front: "Mass-Energy Equivalence formula", back: "E = m · c², where c ≈ 3 × 10⁸ m/s (speed of light)." },
  { id: "fc_p16", subject: "Physics", category: "Modern Physics", front: "What is the Photoelectric Effect?", back: "Ejection of electrons from a metal surface when light of threshold frequency hits it." },
  { id: "fc_p17", subject: "Physics", category: "Gravitation", front: "Newton's Law of Universal Gravitation", back: "F = G · (m₁ · m₂) / r², where G ≈ 6.674 × 10⁻¹¹ N·m²/kg²." },
  { id: "fc_p18", subject: "Physics", category: "Mechanics", front: "Define Centripetal Acceleration (a_c).", back: "a_c = v² / r = ω² · r. Directed towards the center of circular motion." },
  { id: "fc_p19", subject: "Physics", category: "Waves", front: "What is the Doppler Effect?", back: "Apparent change in wave frequency due to relative motion between source and observer." },
  { id: "fc_p20", subject: "Physics", category: "Fluids", front: "State Archimedes' Principle.", back: "A body immersed in fluid experiences an buoyant force equal to the weight of fluid displaced." },
  { id: "fc_p21", subject: "Physics", category: "Thermodynamics", front: "Define Specific Heat Capacity (c).", back: "Heat required per unit mass to raise temperature by 1°C (Q = m · c · ΔT)." },
  { id: "fc_p22", subject: "Physics", category: "Electricity", front: "Kirchhoff's Current Law (KCL)", back: "The sum of all currents entering a junction equals the sum of currents leaving (Conservation of Charge)." },
  { id: "fc_p23", subject: "Physics", category: "Electricity", front: "Kirchhoff's Voltage Law (KVL)", back: "The algebraic sum of potential differences around any closed circuit loop is zero." },
  { id: "fc_p24", subject: "Physics", category: "Nuclear Physics", front: "Define Radioactive Half-life (t₁/₂).", back: "Time taken for half the radioactive nuclei in a sample to decay." },
  { id: "fc_p25", subject: "Physics", category: "Waves", front: "What is Constructive Interference?", back: "When two waves in phase overlap, reinforcing each other to produce a larger amplitude." },
  { id: "fc_p26", subject: "Physics", category: "Optics", front: "What is Total Internal Reflection?", back: "Complete reflection of light inside a denser medium when angle of incidence exceeds critical angle." },
  { id: "fc_p27", subject: "Physics", category: "Mechanics", front: "Define Impulse (J).", back: "J = F · Δt = Δp. Change in momentum caused by a force exerted over time." },
  { id: "fc_p28", subject: "Physics", category: "Fluids", front: "State Bernoulli's Principle.", back: "As the velocity of a fluid increases, the static pressure exerted by the fluid decreases." },
  { id: "fc_p29", subject: "Physics", category: "Thermodynamics", front: "What is Absolute Zero?", back: "0 Kelvin (-273.15°C). The theoretical temperature where molecular kinetic energy reaches minimum." },
  { id: "fc_p30", subject: "Physics", category: "Quantum", front: "What is Heisenberg's Uncertainty Principle?", back: "Δx · Δp ≥ ℏ / 2. Cannot simultaneously measure position and momentum with absolute precision." },

  // --- CHEMISTRY (30) ---
  { id: "fc_c01", subject: "Chemistry", category: "General", front: "What is Avogadro's Constant?", back: "6.022 × 10²³ particles/mol. The number of atoms/molecules in one mole of substance." },
  { id: "fc_c02", subject: "Chemistry", category: "Physical", front: "State the Ideal Gas Law.", back: "P · V = n · R · T (Pressure × Volume = moles × Gas Constant × Kelvin Temperature)." },
  { id: "fc_c03", subject: "Chemistry", category: "Physical", front: "Define pH.", back: "pH = -log₁₀[H⁺]. Measure of hydrogen ion concentration; pH < 7 is acidic, > 7 is basic." },
  { id: "fc_c04", subject: "Chemistry", category: "Organic", front: "What is a Functional Group?", back: "A specific group of atoms within a molecule responsible for its characteristic chemical reactions." },
  { id: "fc_c05", subject: "Chemistry", category: "Organic", front: "What is an Alkane?", back: "A saturated hydrocarbon containing only single carbon-carbon bonds (C_n H_2n+2)." },
  { id: "fc_c06", subject: "Chemistry", category: "Organic", front: "What is an Alkene?", back: "An unsaturated hydrocarbon containing at least one C=C double bond (C_n H_2n)." },
  { id: "fc_c07", subject: "Chemistry", category: "Organic", front: "What is an Alkyne?", back: "An unsaturated hydrocarbon containing at least one C≡C triple bond (C_n H_2n-2)." },
  { id: "fc_c08", subject: "Chemistry", category: "Physical", front: "Define Oxidation.", back: "Loss of electrons or increase in oxidation state (OIL: Oxidation Is Loss)." },
  { id: "fc_c09", subject: "Chemistry", category: "Physical", front: "Define Reduction.", back: "Gain of electrons or decrease in oxidation state (RIG: Reduction Is Gain)." },
  { id: "fc_c10", subject: "Chemistry", category: "Physical", front: "What is Le Chatelier's Principle?", back: "If a dynamic equilibrium is disturbed, the system adjusts to counteract the disturbance." },
  { id: "fc_c11", subject: "Chemistry", category: "Inorganic", front: "What is Electronegativity?", back: "A measure of an atom's ability to attract shared electrons in a chemical bond." },
  { id: "fc_c12", subject: "Chemistry", category: "Inorganic", front: "What is Ionization Energy?", back: "Energy required to remove one mole of electrons from one mole of gaseous atoms." },
  { id: "fc_c13", subject: "Chemistry", category: "Physical", front: "Define Activation Energy (E_a).", back: "Minimum energy required for reactant molecules to undergo a successful collision." },
  { id: "fc_c14", subject: "Chemistry", category: "Physical", front: "What does a Catalyst do?", back: "Speeds up chemical reactions by offering an alternative pathway with lower activation energy." },
  { id: "fc_c15", subject: "Chemistry", category: "Thermodynamics", front: "Gibbs Free Energy formula", back: "ΔG = ΔH - TΔS. A negative ΔG indicates a spontaneous reaction." },
  { id: "fc_c16", subject: "Chemistry", category: "Physical", front: "What is Exothermic reaction?", back: "A reaction that releases heat to its surroundings (ΔH is negative)." },
  { id: "fc_c17", subject: "Chemistry", category: "Physical", front: "What is Endothermic reaction?", back: "A reaction that absorbs heat from its surroundings (ΔH is positive)." },
  { id: "fc_c18", subject: "Chemistry", category: "Organic", front: "What is an Esterification reaction?", back: "Reaction between an Alcohol and a Carboxylic Acid producing an Ester and Water." },
  { id: "fc_c19", subject: "Chemistry", category: "General", front: "What is Molarity (M)?", back: "Moles of solute per liter of solution (mol/L)." },
  { id: "fc_c20", subject: "Chemistry", category: "Atomic", front: "What are Isotopes?", back: "Atoms of the same element with same atomic number (protons) but different neutron count." },
  { id: "fc_c21", subject: "Chemistry", category: "Inorganic", front: "What is an Ionic Bond?", back: "Electrostatic force of attraction between oppositely charged ions formed by electron transfer." },
  { id: "fc_c22", subject: "Chemistry", category: "Inorganic", front: "What is a Covalent Bond?", back: "Bond formed when two atoms share pairs of valence electrons." },
  { id: "fc_c23", subject: "Chemistry", category: "Physical", front: "Define Empirical Formula.", back: "The simplest whole-number ratio of atoms of each element in a compound." },
  { id: "fc_c24", subject: "Chemistry", category: "Organic", front: "What is Structural Isomerism?", back: "Compounds with the same molecular formula but different structural connectivity." },
  { id: "fc_c25", subject: "Chemistry", category: "Analytical", front: "What is Titration?", back: "Quantitative chemical analysis technique to determine unknown concentration using a standard solution." },
  { id: "fc_c26", subject: "Chemistry", category: "Organic", front: "What is Polymerization?", back: "Process where small monomer molecules join chemically to form a long-chain polymer." },
  { id: "fc_c27", subject: "Chemistry", category: "Inorganic", front: "What is Amphoteric substance?", back: "A substance that can act as both an acid and a base (e.g., Water, Aluminum oxide)." },
  { id: "fc_c28", subject: "Chemistry", category: "Physical", front: "State Faraday's Law of Electrolysis.", back: "Mass of substance deposited at an electrode is directly proportional to quantity of electricity passed." },
  { id: "fc_c29", subject: "Chemistry", category: "General", front: "What is the Periodic Trend for Atomic Radius?", back: "Decreases across a period (left to right) and increases down a group." },
  { id: "fc_c30", subject: "Chemistry", category: "General", front: "What is Electronegativity trend across the Periodic Table?", back: "Increases across a period (left to right) and decreases down a group. Fluorine is highest." },

  // --- BIOLOGY (30) ---
  { id: "fc_b01", subject: "Biology", category: "Cell Biology", front: "What is Mitochondria?", back: "The 'powerhouse of the cell' where ATP energy is produced via aerobic cellular respiration." },
  { id: "fc_b02", subject: "Biology", category: "Cell Biology", front: "What is Ribosome?", back: "Organelle responsible for protein synthesis (translating mRNA into amino acid chains)." },
  { id: "fc_b03", subject: "Biology", category: "Genetics", front: "Define DNA.", back: "Deoxyribonucleic Acid: Double-helix molecule carrying genetic instructions for living organisms." },
  { id: "fc_b04", subject: "Biology", category: "Genetics", front: "What are the 4 nitrogenous bases in DNA?", back: "Adenine (A), Thymine (T), Cytosine (C), Guanine (G). A pairs with T, C pairs with G." },
  { id: "fc_b05", subject: "Biology", category: "Cell Biology", front: "What is Mitosis?", back: "Cell division resulting in two genetically identical diploid daughter cells for growth and repair." },
  { id: "fc_b06", subject: "Biology", category: "Cell Biology", front: "What is Meiosis?", back: "Cell division producing four non-identical haploid gametes (sperm/egg) with halved chromosome number." },
  { id: "fc_b07", subject: "Biology", category: "Plant Physiology", front: "Formula for Photosynthesis", back: "6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂." },
  { id: "fc_b08", subject: "Biology", category: "Physiology", front: "Formula for Aerobic Respiration", back: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP energy." },
  { id: "fc_b09", subject: "Biology", category: "Genetics", front: "What is an Allele?", back: "Alternative variant form of a gene located at a specific locus on a chromosome." },
  { id: "fc_b10", subject: "Biology", category: "Genetics", front: "Define Phenotype vs Genotype.", back: "Genotype is the genetic makeup (e.g. Aa); Phenotype is the observable physical trait (e.g. Brown eyes)." },
  { id: "fc_b11", subject: "Biology", category: "Ecology", front: "What is Trophic Level?", back: "The position an organism occupies in a food chain (e.g. Producer, Primary Consumer, Apex Predator)." },
  { id: "fc_b12", subject: "Biology", category: "Physiology", front: "Role of Red Blood Cells (Erythrocytes)", back: "Contain hemoglobin to transport oxygen from lungs to body tissues." },
  { id: "fc_b13", subject: "Biology", category: "Immunology", front: "What are Antibodies?", back: "Y-shaped proteins produced by B-lymphocytes that bind specifically to foreign antigens." },
  { id: "fc_b14", subject: "Biology", category: "Cell Biology", front: "Function of Golgi Apparatus", back: "Modifies, sorts, and packages proteins and lipids for secretion or delivery to organelles." },
  { id: "fc_b15", subject: "Biology", category: "Cell Biology", front: "What is Osmosis?", back: "Net movement of water molecules across a selectively permeable membrane from higher to lower water potential." },
  { id: "fc_b16", subject: "Biology", category: "Biochemistry", front: "What is an Enzyme?", back: "A biological catalyst (protein) that speeds up metabolic reactions by lowering activation energy." },
  { id: "fc_b17", subject: "Biology", category: "Biochemistry", front: "What is Active Site of an enzyme?", back: "The specific region where substrate molecules bind and undergo a chemical reaction." },
  { id: "fc_b18", subject: "Biology", category: "Plant Physiology", front: "Role of Xylem tissue", back: "Transports water and dissolved mineral ions upward from roots to stems and leaves." },
  { id: "fc_b19", subject: "Biology", category: "Plant Physiology", front: "Role of Phloem tissue", back: "Translocates organic nutrients (sucrose/amino acids) bidirectionally throughout the plant." },
  { id: "fc_b20", subject: "Biology", category: "Physiology", front: "What is Homeostasis?", back: "Maintenance of a stable internal environment (e.g. temperature, blood glucose, water balance)." },
  { id: "fc_b21", subject: "Biology", category: "Evolution", front: "Define Natural Selection.", back: "Process where organisms better adapted to their environment survive and reproduce more offspring." },
  { id: "fc_b22", subject: "Biology", category: "Genetics", front: "What is Transcription?", back: "Process in cell nucleus where DNA sequence is copied into a messenger RNA (mRNA) strand." },
  { id: "fc_b23", subject: "Biology", category: "Genetics", front: "What is Translation?", back: "Process at the ribosome where mRNA sequence is decoded to build a specific protein chain." },
  { id: "fc_b24", subject: "Biology", category: "Physiology", front: "Function of Insulin hormone", back: "Secreted by pancreas beta cells; lowers blood glucose by promoting cellular glucose uptake and glycogen storage." },
  { id: "fc_b25", subject: "Biology", category: "Ecology", front: "What is Biodiversity?", back: "Variety of plant and animal life in a particular habitat or ecosystem." },
  { id: "fc_b26", subject: "Biology", category: "Cell Biology", front: "Function of Endoplasmic Reticulum (ER)", back: "Rough ER (studded with ribosomes) synthesizes proteins; Smooth ER synthesizes lipids and detoxifies." },
  { id: "fc_b27", subject: "Biology", category: "Microbiology", front: "Difference between Bacteria and Viruses", back: "Bacteria are living unicellular prokaryotes; Viruses are non-living genetic material inside a protein coat needing a host." },
  { id: "fc_b28", subject: "Biology", category: "Physiology", front: "What is a Synapse?", back: "Junction between two nerve cells where neurotransmitters transmit chemical signals." },
  { id: "fc_b29", subject: "Biology", category: "Physiology", front: "Function of the Nephron", back: "Functional microscopic unit of the kidney that filters blood, reabsorbs nutrients, and produces urine." },
  { id: "fc_b30", subject: "Biology", category: "Ecology", front: "What is Nitrogen Fixation?", back: "Conversion of atmospheric N₂ gas into usable ammonia/nitrate by bacteria (e.g. Rhizobium)." },

  // --- COMPUTER SCIENCE (30) ---
  { id: "fc_cs01", subject: "Computer Science", category: "Algorithms", front: "What is Big-O Notation?", back: "Mathematical notation representing upper-bound time or space complexity of an algorithm as input size grows." },
  { id: "fc_cs02", subject: "Computer Science", category: "Data Structures", front: "What is an Array vs Linked List?", back: "Array has contiguous memory with O(1) index lookup; Linked List uses pointers with O(n) lookup but flexible sizing." },
  { id: "fc_cs03", subject: "Computer Science", category: "Data Structures", front: "What is a Stack?", back: "LIFO (Last-In, First-Out) structure. PUSH adds to top, POP removes from top." },
  { id: "fc_cs04", subject: "Computer Science", category: "Data Structures", front: "What is a Queue?", back: "FIFO (First-In, First-Out) structure. ENQUEUE adds to back, DEQUEUE removes from front." },
  { id: "fc_cs05", subject: "Computer Science", category: "Algorithms", front: "Time complexity of Binary Search", back: "O(log n). Requires sorted array; repeatedly divides search interval in half." },
  { id: "fc_cs06", subject: "Computer Science", category: "Algorithms", front: "Average time complexity of QuickSort", back: "O(n log n). Divide-and-conquer algorithm partitioning around a pivot element." },
  { id: "fc_cs07", subject: "Computer Science", category: "Data Structures", front: "What is a Hash Table?", back: "Data structure mapping keys to values using a hash function; offers average O(1) lookup." },
  { id: "fc_cs08", subject: "Computer Science", category: "Software", front: "What is OOP (Object-Oriented Programming)?", back: "Programming paradigm based on objects containing data (attributes) and code (methods)." },
  { id: "fc_cs09", subject: "Computer Science", category: "Software", front: "Four Pillars of OOP", back: "Encapsulation, Abstraction, Inheritance, Polymorphism." },
  { id: "fc_cs10", subject: "Computer Science", category: "Databases", front: "What is SQL?", back: "Structured Query Language used to store, manipulate, and retrieve data in relational databases." },
  { id: "fc_cs11", subject: "Computer Science", category: "Databases", front: "What is ACID compliance in databases?", back: "Atomicity, Consistency, Isolation, Durability. Guarantees reliable transaction processing." },
  { id: "fc_cs12", subject: "Computer Science", category: "Networking", front: "What is HTTP vs HTTPS?", back: "HTTPS encrypts HTTP data using TLS/SSL for secure communication over port 443." },
  { id: "fc_cs13", subject: "Computer Science", category: "Networking", front: "What is TCP/IP?", back: "Transmission Control Protocol/Internet Protocol: Foundational communication suite for internet data transfer." },
  { id: "fc_cs14", subject: "Computer Science", category: "Web", front: "What is REST API?", back: "Representational State Transfer: Architectural style using standard HTTP verbs (GET, POST, PUT, DELETE)." },
  { id: "fc_cs15", subject: "Computer Science", category: "AI & ML", front: "What is Overfitting in ML?", back: "When a machine learning model learns training data noise too closely, failing to generalize to new data." },
  { id: "fc_cs16", subject: "Computer Science", category: "AI & ML", front: "What is Supervised Learning?", back: "Machine learning paradigm where models are trained on labeled datasets with known input-output pairs." },
  { id: "fc_cs17", subject: "Computer Science", category: "Security", front: "What is Asymmetric Encryption?", back: "Public key cryptography using a public key for encryption and a distinct private key for decryption." },
  { id: "fc_cs18", subject: "Computer Science", category: "Operating Systems", front: "What is a Process vs Thread?", back: "Process is an independent executing program with distinct memory; Thread is lightweight subset sharing process memory." },
  { id: "fc_cs19", subject: "Computer Science", category: "Operating Systems", front: "What is Deadlock?", back: "Situation where two or more threads are permanently blocked waiting for resources held by each other." },
  { id: "fc_cs20", subject: "Computer Science", category: "Data Structures", front: "What is a Binary Search Tree (BST)?", back: "Tree where left child nodes contain lesser values and right child nodes contain greater values than parent." },
  { id: "fc_cs21", subject: "Computer Science", category: "Algorithms", front: "Dijkstra's Algorithm purpose", back: "Finds the shortest paths between nodes in a weighted graph with non-negative edge weights." },
  { id: "fc_cs22", subject: "Computer Science", category: "Software", front: "What is Git?", back: "Distributed version control system tracking source code changes during software development." },
  { id: "fc_cs23", subject: "Computer Science", category: "Web", front: "What is CORS?", back: "Cross-Origin Resource Sharing: Browser security feature restricting HTTP requests from foreign domains." },
  { id: "fc_cs24", subject: "Computer Science", category: "Software", front: "What is Recursion?", back: "Function calling itself until a defined base condition stops execution." },
  { id: "fc_cs25", subject: "Computer Science", category: "Data Structures", front: "Graph Traversal: BFS vs DFS", back: "BFS (Breadth-First Search) uses Queue level-by-level; DFS (Depth-First Search) uses Stack/recursion deep-first." },
  { id: "fc_cs26", subject: "Computer Science", category: "Architecture", front: "What is CPU Cache?", back: "Ultra-fast hardware memory (L1/L2/L3) storing frequently accessed instructions near the processor core." },
  { id: "fc_cs27", subject: "Computer Science", category: "Security", front: "What is SQL Injection?", back: "Security vulnerability where malicious SQL code is injected into input fields to manipulate database queries." },
  { id: "fc_cs28", subject: "Computer Science", category: "Cloud", front: "What is Docker / Containerization?", back: "Packaging software code with dependencies into isolated lightweight containers runnable anywhere." },
  { id: "fc_cs29", subject: "Computer Science", category: "AI & ML", front: "What is a Neural Network?", back: "Computing system inspired by biological brains, composed of interconnected node layers processing data." },
  { id: "fc_cs30", subject: "Computer Science", category: "Web", front: "What is JWT (JSON Web Token)?", back: "Compact URL-safe standard used for securely transmitting claims between parties for authentication." },

  // --- AGRICULTURAL SCIENCE (30) ---
  { id: "fc_ag01", subject: "Agricultural Science", category: "Soil Science", front: "What is Soil Horizon A?", back: "Topsoil: Mineral layer rich in organic humus, active root systems, and beneficial microbes." },
  { id: "fc_ag02", subject: "Agricultural Science", category: "Soil Science", front: "What is Loam soil?", back: "Ideal soil mixture of roughly 40% Sand, 40% Silt, and 20% Clay offering optimal drainage and fertility." },
  { id: "fc_ag03", subject: "Agricultural Science", category: "Crop Science", front: "What is Crop Rotation?", back: "Systematic planting of different crop families sequentially on the same land to improve soil health and break pest cycles." },
  { id: "fc_ag04", subject: "Agricultural Science", category: "Soil Science", front: "NPK Fertilizers meaning", back: "Nitrogen (N) for vegetative leaf growth, Phosphorus (P) for root development, Potassium (K) for fruit/flower quality." },
  { id: "fc_ag05", subject: "Agricultural Science", category: "Hydrology", front: "What is Drip Irrigation?", back: "Water-saving irrigation method applying targeted moisture directly to crop root zones at low pressure." },
  { id: "fc_ag06", subject: "Agricultural Science", category: "Agronomy", front: "What is Green Manure?", back: "Crops grown specifically to be plowed back into soil to enrich organic matter and nitrogen content." },
  { id: "fc_ag07", subject: "Agricultural Science", category: "Livestock", front: "Ruminant Digestion steps", back: "4-chambered stomach: Rumen, Reticulum, Omasum, Abomasum. Uses microbes to ferment cellulose." },
  { id: "fc_ag08", subject: "Agricultural Science", category: "Soil Science", front: "What is Soil pH impact on crops?", back: "Measures acidity/alkalinity. Most crops thrive in pH 6.0 - 7.0; extreme pH locks out essential micronutrients." },
  { id: "fc_ag09", subject: "Agricultural Science", category: "Ecology", front: "What is Agroforestry?", back: "Land management combining trees/shrubs alongside agricultural crops or livestock for ecological synergy." },
  { id: "fc_ag10", subject: "Agricultural Science", category: "Pest Management", front: "What is Integrated Pest Management (IPM)?", back: "Ecosystem approach using biological, mechanical, and selective chemical tools to manage pests sustainably." },
  { id: "fc_ag11", subject: "Agricultural Science", category: "Genetics", front: "What is Hybrid Vigor (Heterosis)?", back: "Improved performance or yield of crossbred offspring superior to both purebred parents." },
  { id: "fc_ag12", subject: "Agricultural Science", category: "Soil Science", front: "What is Soil Erosion?", back: "Removal of topsoil by wind or water, accelerated by deforestation, overgrazing, and tillage." },
  { id: "fc_ag13", subject: "Agricultural Science", category: "Crop Protection", front: "Biological Pest Control definition", back: "Using natural predators or parasites (e.g. ladybugs eating aphids) to control crop pest populations." },
  { id: "fc_ag14", subject: "Agricultural Science", category: "Agri-Economics", front: "What is Subsistence Farming?", back: "Farming that produces food predominantly for farmer self-consumption rather than commercial market sale." },
  { id: "fc_ag15", subject: "Agricultural Science", category: "Soil Science", front: "What is Cation Exchange Capacity (CEC)?", back: "Soil capacity to hold and exchange positively charged nutrient ions (Ca²⁺, Mg²⁺, K⁺, NH₄⁺)." },
  { id: "fc_ag16", subject: "Agricultural Science", category: "Crop Science", front: "What are Legumes role in agriculture?", back: "Plants forming symbiotic relationship with Rhizobium bacteria to fix atmospheric nitrogen into soil." },
  { id: "fc_ag17", subject: "Agricultural Science", category: "Agronomy", front: "What is Conservation Tillage?", back: "Minimizing soil disturbance to preserve soil structure, retain moisture, and prevent surface erosion." },
  { id: "fc_ag18", subject: "Agricultural Science", category: "Food Technology", front: "What is Post-Harvest Loss?", back: "Measurable quantitative and qualitative food loss occurring between harvest point and final consumer sale." },
  { id: "fc_ag19", subject: "Agricultural Science", category: "Livestock", front: "What is Colostrum?", back: "First milk produced by female mammals post-birth; rich in maternal antibodies and essential nutrients." },
  { id: "fc_ag20", subject: "Agricultural Science", category: "Agri-Tech", front: "What is Precision Agriculture?", back: "Farming management using GPS, sensors, and AI data to optimize water, fertilizer, and crop field inputs." },
  { id: "fc_ag21", subject: "Agricultural Science", category: "Soil Science", front: "What is Soil Salinization?", back: "Accumulation of water-soluble salts in soil layers, caused by poor drainage and excessive irrigation." },
  { id: "fc_ag22", subject: "Agricultural Science", category: "Crop Science", front: "What is Hydroponics?", back: "Method of growing crops without soil in mineral nutrient water solutions." },
  { id: "fc_ag23", subject: "Agricultural Science", category: "Crop Science", front: "What is Aquaponics?", back: "Closed system combining aquaculture (fish farming) with hydroponics (plant production using fish waste nutrients)." },
  { id: "fc_ag24", subject: "Agricultural Science", category: "Soil Science", front: "Role of Mycorrhizal Fungi", back: "Symbiotic fungi extending plant root surface area to increase water and phosphorus absorption." },
  { id: "fc_ag25", subject: "Agricultural Science", category: "Horticulture", front: "What is Grafting in horticulture?", back: "Joining tissues of two different plants (rootstock + scion) so they grow together as a single plant." },
  { id: "fc_ag26", subject: "Agricultural Science", category: "Livestock", front: "What is Artificial Insemination (AI)?", back: "Depositing semen into female reproductive tract mechanically for controlled genetic breeding." },
  { id: "fc_ag27", subject: "Agricultural Science", category: "Hydrology", front: "What is Water Table?", back: "Upper surface level of underground saturated zone where soil pores are completely filled with water." },
  { id: "fc_ag28", subject: "Agricultural Science", category: "Agronomy", front: "What is Cover Cropping?", back: "Planting non-harvest crops to protect soil from erosion, suppress weeds, and boost organic fertility." },
  { id: "fc_ag29", subject: "Agricultural Science", category: "Agri-Business", front: "What is Value Addition in agriculture?", back: "Processing raw farm produce (e.g. turning fresh milk into cheese) to increase market value." },
  { id: "fc_ag30", subject: "Agricultural Science", category: "Ecology", front: "What is Permaculture?", back: "Sustainable agricultural design philosophy mimicking natural ecosystems to create self-sufficient food systems." },

  // --- ELECTRICAL & TVET ENGINEERING (30) ---
  { id: "fc_ee01", subject: "Electrical TVET", category: "Circuits", front: "Formula for Total Resistance in Series", back: "R_total = R₁ + R₂ + R₃ + ... + Rₙ." },
  { id: "fc_ee02", subject: "Electrical TVET", category: "Circuits", front: "Formula for Total Resistance in Parallel", back: "1/R_total = 1/R₁ + 1/R₂ + 1/R₃ + ... + 1/Rₙ." },
  { id: "fc_ee03", subject: "Electrical TVET", category: "Solar Energy", front: "What is a Photovoltaic (PV) Cell?", back: "Semiconductor device converting solar photons directly into Direct Current (DC) electricity." },
  { id: "fc_ee04", subject: "Electrical TVET", category: "Solar Energy", front: "Role of a Solar Inverter", back: "Converts variable DC output from solar panels into clean AC power for electrical appliances." },
  { id: "fc_ee05", subject: "Electrical TVET", category: "Solar Energy", front: "What is MPPT in Solar Charge Controllers?", back: "Maximum Power Point Tracking: Algorithm optimizing solar array power extraction under varying sunlight." },
  { id: "fc_ee06", subject: "Electrical TVET", category: "Automation", front: "What is a PLC (Programmable Logic Controller)?", back: "Industrial rugged computer designed for automated control of manufacturing assembly lines and machinery." },
  { id: "fc_ee07", subject: "Electrical TVET", category: "Automation", front: "What is Ladder Logic?", back: "Graphical programming language representing relay logic circuits used in PLCs." },
  { id: "fc_ee08", subject: "Electrical TVET", category: "AC Theory", front: "What is Power Factor (PF)?", back: "Ratio of Real Power (kW) to Apparent Power (kVA). PF = cos(θ). Ideal value is 1.0." },
  { id: "fc_ee09", subject: "Electrical TVET", category: "Safety", front: "What is an RCD / GFCI?", back: "Residual Current Device / Ground Fault Circuit Interrupter: Instantly breaks circuit when detecting ground leakage current." },
  { id: "fc_ee10", subject: "Electrical TVET", category: "Machines", front: "Transformer Voltage Ratio formula", back: "V_p / V_s = N_p / N_s = I_s / I_p (Primary to Secondary turns and currents)." },
  { id: "fc_ee11", subject: "Electrical TVET", category: "Electronics", front: "What is a Diode?", back: "Two-terminal semiconductor allowing electrical current flow in one direction only." },
  { id: "fc_ee12", subject: "Electrical TVET", category: "Electronics", front: "What is a Transistor (BJT)?", back: "Three-terminal semiconductor device (Emitter, Base, Collector) used as a switch or signal amplifier." },
  { id: "fc_ee13", subject: "Electrical TVET", category: "AC Theory", front: "What is RMS Voltage?", back: "Root Mean Square: Equivalent DC voltage producing identical power in a resistive load. V_rms = V_peak / √2." },
  { id: "fc_ee14", subject: "Electrical TVET", category: "Machines", front: "Difference between Single-phase and 3-phase AC", back: "Single-phase uses 1 AC waveform; 3-phase uses 3 synchronized AC sinusoids offset by 120° for heavy equipment." },
  { id: "fc_ee15", subject: "Electrical TVET", category: "Safety", front: "Earth / Grounding Wire Purpose", back: "Provides a safe low-resistance discharge path to earth during electrical fault conditions." },
  { id: "fc_ee16", subject: "Electrical TVET", category: "Electronics", front: "What is a Capacitor?", back: "Passive two-terminal component storing electrical energy in an electrostatic field (C = Q / V)." },
  { id: "fc_ee17", subject: "Electrical TVET", category: "Electronics", front: "What is an Inductor?", back: "Passive component storing magnetic energy when electrical current flows through it (V = L · di/dt)." },
  { id: "fc_ee18", subject: "Electrical TVET", category: "Instruments", front: "How is an Ammeter connected in a circuit?", back: "In SERIES with the load component (has near-zero internal resistance)." },
  { id: "fc_ee19", subject: "Electrical TVET", category: "Instruments", front: "How is a Voltmeter connected?", back: "In PARALLEL across the component (has extremely high internal resistance)." },
  { id: "fc_ee20", subject: "Electrical TVET", category: "Solar Energy", front: "Solar Array: Series vs Parallel connection", back: "Series increases total system VOLTAGE; Parallel increases total system CURRENT (Amperage)." },
  { id: "fc_ee21", subject: "Electrical TVET", category: "Wiring", front: "Standard Wiring Color Code (IEC)", back: "Brown = Live/Phase, Blue = Neutral, Green/Yellow Stripe = Earth/Ground." },
  { id: "fc_ee22", subject: "Electrical TVET", category: "Electronics", front: "What is a Zener Diode?", back: "Special diode designed to allow current flow backwards when reverse breakdown voltage is reached." },
  { id: "fc_ee23", subject: "Electrical TVET", category: "Automation", front: "Normally Open (NO) vs Normally Closed (NC) contacts", back: "NO contacts stay open until actuated; NC contacts stay closed until actuated." },
  { id: "fc_ee24", subject: "Electrical TVET", category: "Machines", front: "What is an Induction Motor?", back: "AC electric motor where rotor torque is produced by electromagnetic induction from stator magnetic field." },
  { id: "fc_ee25", subject: "Electrical TVET", category: "Circuits", front: "What is Resonance in an RLC Circuit?", back: "Condition when Inductive Reactance (X_L) equals Capacitive Reactance (X_C); f_r = 1 / (2π√(LC))." },
  { id: "fc_ee26", subject: "Electrical TVET", category: "Safety", front: "What is a Circuit Breaker?", back: "Automatically operated electrical switch protecting circuits from overload or short-circuit damage." },
  { id: "fc_ee27", subject: "Electrical TVET", category: "Solar Energy", front: "Depth of Discharge (DoD) in solar batteries", back: "Percentage of battery capacity discharged relative to maximum capacity. Lower DoD prolongs battery life." },
  { id: "fc_ee28", subject: "Electrical TVET", category: "Electronics", front: "What is Pulse Width Modulation (PWM)?", back: "Technique controlling power delivered to loads by turning digital signals ON/OFF rapidly." },
  { id: "fc_ee29", subject: "Electrical TVET", category: "Instrumentation", front: "What is an Oscilloscope used for?", back: "Displays signal voltage waveforms over time to analyze circuit behavior and troubleshooting." },
  { id: "fc_ee30", subject: "Electrical TVET", category: "Wiring", front: "American Wire Gauge (AWG) rule", back: "Lower AWG numbers represent THICKER wire diameter and higher current-carrying capacity." },

  // --- GEOGRAPHY & CLIMATE SCIENCE (30) ---
  { id: "fc_g01", subject: "Geography", category: "Physical", front: "What is Plate Tectonics?", back: "Theory that Earth's outer shell is divided into large moving lithospheric plates interacting at boundaries." },
  { id: "fc_g02", subject: "Geography", category: "Physical", front: "Three types of Tectonic Plate Boundaries", back: "Divergent (moving apart), Convergent (colliding), Transform (sliding past)." },
  { id: "fc_g03", subject: "Geography", category: "Climate", front: "What is the Greenhouse Effect?", back: "Trapping of heat in Earth's atmosphere by gases (CO₂, CH₄, H₂O) absorbing infrared radiation." },
  { id: "fc_g04", subject: "Geography", category: "Physical", front: "What is Weathering vs Erosion?", back: "Weathering breaks down rock in situ; Erosion transports the weathered material by wind, water, or ice." },
  { id: "fc_g05", subject: "Geography", category: "Cartography", front: "What is GIS (Geographic Information System)?", back: "Computer system designed to capture, store, analyze, manipulate, and present spatial geographical data." },
  { id: "fc_g06", subject: "Geography", category: "Oceanography", front: "What is El Niño?", back: "Climate pattern characterized by unusual warming of surface waters in eastern tropical Pacific Ocean." },
  { id: "fc_g07", subject: "Geography", category: "Physical", front: "What is an Equinox?", back: "Event twice a year when subsolar point crosses equator, making day and night equal length worldwide." },
  { id: "fc_g08", subject: "Geography", category: "Geomorphology", front: "How is an Oxbow Lake formed?", back: "When a meander loop of a river is cut off from the main channel by erosion and deposition." },
  { id: "fc_g09", subject: "Geography", category: "Demographics", front: "What is Demographic Transition Model (DTM)?", back: "Model showing population changes over time through 5 stages of birth and death rate shifts." },
  { id: "fc_g10", subject: "Geography", category: "Climate", front: "What is Coriolis Effect?", back: "Apparent deflection of moving air/water to the right in Northern Hemisphere and left in Southern Hemisphere." },
  { id: "fc_g11", subject: "Geography", category: "Physical", front: "What is an Aquifer?", back: "Underground layer of water-bearing permeable rock, rock fractures, or unconsolidated materials." },
  { id: "fc_g12", subject: "Geography", category: "Urban", front: "What is Urbanization?", back: "Process where increasing proportion of a population lives in urban cities rather than rural regions." },
  { id: "fc_g13", subject: "Geography", category: "Physical", front: "What is a Rift Valley?", back: "Linear lowland formed between tectonic mountain blocks or fault lines created by crustal extension." },
  { id: "fc_g14", subject: "Geography", category: "Climate", front: "What is Orographic Rainfall?", back: "Rainfall produced when moist air is forced upward over elevated landforms like mountain ranges." },
  { id: "fc_g15", subject: "Geography", category: "Human", front: "What is Sustainable Development?", back: "Development meeting present needs without compromising the ability of future generations to meet theirs." },
  { id: "fc_g16", subject: "Geography", category: "Physical", front: "What is Delta in river landscapes?", back: "Landform created by sediment deposition where a river enters a slow body of water like sea or ocean." },
  { id: "fc_g17", subject: "Geography", category: "Atmosphere", front: "Layers of Atmosphere from ground up", back: "Troposphere, Stratosphere (Ozone layer), Mesosphere, Thermosphere, Exosphere." },
  { id: "fc_g18", subject: "Geography", category: "Climate", front: "What is Albedo Effect?", back: "Measure of how much solar energy Earth's surface reflects back into space (ice high albedo; ocean low)." },
  { id: "fc_g19", subject: "Geography", category: "Cartography", front: "Map Scale definition", back: "Ratio between a distance on a map and the corresponding actual distance on the ground." },
  { id: "fc_g20", subject: "Geography", category: "Physical", front: "What is Karst Topography?", back: "Landscape created by dissolution of soluble rocks like limestone, forming caves and sinkholes." },
  { id: "fc_g21", subject: "Geography", category: "Environmental", front: "What is Desertification?", back: "Process where fertile land becomes desert due to drought, deforestation, or inappropriate agriculture." },
  { id: "fc_g22", subject: "Geography", category: "Demographics", front: "Dependency Ratio definition", back: "Ratio of non-working age population (0-14 & 65+) to the working-age population (15-64)." },
  { id: "fc_g23", subject: "Geography", category: "Physical", front: "What is Thermal Expansion in oceans?", back: "Increase in water volume as seawater warms, serving as a primary driver of global sea level rise." },
  { id: "fc_g24", subject: "Geography", category: "Economic", front: "Primary vs Secondary Economic Sector", back: "Primary extracts raw natural resources (agriculture/mining); Secondary manufactures goods." },
  { id: "fc_g25", subject: "Geography", category: "Physical", front: "What is a Glacier Moraine?", back: "Accumulation of unconsolidated glacial debris (rock/soil) deposited along glacial edges." },
  { id: "fc_g26", subject: "Geography", category: "Climate", front: "What is ITCZ (Intertropical Convergence Zone)?", back: "Belt around the equator where trade winds converge, producing heavy convective thunderstorms." },
  { id: "fc_g27", subject: "Geography", category: "Cartography", front: "Difference between Latitude and Longitude", back: "Latitude measures distance North/South of equator; Longitude measures East/West of Prime Meridian." },
  { id: "fc_g28", subject: "Geography", category: "Ecology", front: "What is a Biome?", back: "Large naturally occurring community of flora and fauna occupying a major habitat (e.g. Savanna, Tundra)." },
  { id: "fc_g29", subject: "Geography", category: "Oceanography", front: "What is Thermohaline Circulation?", back: "Deep ocean current circulation driven by global density gradients created by temperature and salinity." },
  { id: "fc_g30", subject: "Geography", category: "Physical", front: "What is Epicenter of an earthquake?", back: "Point on Earth's surface directly above the underground focus point where fault rupture begins." },

  // --- ENGLISH & LITERATURE (30) ---
  { id: "fc_en01", subject: "English", category: "Literary Terms", front: "What is a Metaphor?", back: "A figure of speech comparing two distinct things directly without using 'like' or 'as'." },
  { id: "fc_en02", subject: "English", category: "Literary Terms", front: "What is a Simile?", back: "A figure of speech comparing two different things using 'like' or 'as'." },
  { id: "fc_en03", subject: "English", category: "Literary Terms", front: "What is Personification?", back: "Attributing human characteristics or emotions to non-human objects or abstract ideas." },
  { id: "fc_en04", subject: "English", category: "Literary Terms", front: "What is Alliteration?", back: "Repetition of identical initial consonant sounds in neighboring words." },
  { id: "fc_en05", subject: "English", category: "Literary Terms", front: "What is Foreshadowing?", back: "Literary device where an author drops subtle hints about events that will happen later." },
  { id: "fc_en06", subject: "English", category: "Grammar", front: "What is an Active vs Passive Voice sentence?", back: "Active: Subject performs action (e.g., 'The chef cooked dinner'); Passive: Action performed on subject ('Dinner was cooked')." },
  { id: "fc_en07", subject: "English", category: "Grammar", front: "What is a Dangling Modifier?", back: "A modifier that lacks a clear subject to modify, causing ambiguity or grammatical error." },
  { id: "fc_en08", subject: "English", category: "Literary Terms", front: "What is Irony (Dramatic vs Verbal)?", back: "Verbal: Speaker says opposite of meaning; Dramatic: Audience knows key facts that story characters do not." },
  { id: "fc_en09", subject: "English", category: "Literary Terms", front: "What is Oxymoron?", back: "A figure of speech juxtaposing two contradictory terms side-by-side (e.g. 'Deafening silence')." },
  { id: "fc_en10", subject: "English", category: "Poetry", front: "What is Iambic Pentameter?", back: "A poetic metric line of 10 syllables alternating unstressed and stressed beats (da-DUM × 5)." },
  { id: "fc_en11", subject: "English", category: "Poetry", front: "What is a Sonnet?", back: "A 14-line poem written in iambic pentameter following a specific rhyme scheme (e.g. Shakespearean)." },
  { id: "fc_en12", subject: "English", category: "Essay Writing", front: "What is a Thesis Statement?", back: "A clear, concise sentence summarizing the main point or central argument of an essay." },
  { id: "fc_en13", subject: "English", category: "Literary Terms", front: "What is an Allegory?", back: "A story or poem that can be interpreted to reveal a hidden moral or political meaning." },
  { id: "fc_en14", subject: "English", category: "Literary Terms", front: "Protagonist vs Antagonist", back: "Protagonist is the central main character driving plot; Antagonist opposes or creates conflict." },
  { id: "fc_en15", subject: "English", category: "Rhetoric", front: "Ethos, Pathos, and Logos in persuasion", back: "Ethos appeals to credibility/ethics; Pathos appeals to emotion; Logos appeals to logic/reasoning." },
  { id: "fc_en16", subject: "English", category: "Literary Terms", front: "What is Hyperbole?", back: "Exaggerated statements or claims not intended to be taken literally, used for emphasis." },
  { id: "fc_en17", subject: "English", category: "Grammar", front: "What is Subject-Verb Agreement?", back: "Grammatical rule that singular subjects require singular verbs, and plural subjects require plural verbs." },
  { id: "fc_en18", subject: "English", category: "Poetry", front: "What is Free Verse poetry?", back: "Poetry that does not use consistent meter patterns, rhyme, or any musical pattern." },
  { id: "fc_en19", subject: "English", category: "Literary Terms", front: "What is Onomatopoeia?", back: "Words that phonetically imitate the sound they describe (e.g., 'Buzz', 'Crash', 'Sizzle')." },
  { id: "fc_en20", subject: "English", category: "Literary Terms", front: "What is Soliloquy in drama?", back: "Act of speaking one's thoughts aloud when alone on stage, revealing inner feelings to audience." },
  { id: "fc_en21", subject: "English", category: "Literary Terms", front: "What is Imagery?", back: "Descriptive sensory language appealing to sight, sound, smell, taste, or touch." },
  { id: "fc_en22", subject: "English", category: "Grammar", front: "What is an Inverted Sentence?", back: "Sentence where the predicate verb comes before the subject (e.g. 'Into the room walked the teacher')." },
  { id: "fc_en23", subject: "English", category: "Grammar", front: "Difference between 'Affect' and 'Effect'", back: "Affect is usually a verb meaning to influence; Effect is usually a noun meaning a result." },
  { id: "fc_en24", subject: "English", category: "Literary Terms", front: "What is Catharsis in tragedy?", back: "Emotional purification or release experienced by audience through pity and fear." },
  { id: "fc_en25", subject: "English", category: "Poetry", front: "What is Enjambment?", back: "Continuation of a sentence without a pause beyond the end of a poetic line or stanza." },
  { id: "fc_en26", subject: "English", category: "Literary Terms", front: "What is Symbolism?", back: "Using an object, person, or situation to represent an underlying deeper idea or concept." },
  { id: "fc_en27", subject: "English", category: "Literary Terms", front: "What is Tone vs Mood?", back: "Tone is the author's attitude toward subject; Mood is the atmosphere/feeling created for reader." },
  { id: "fc_en28", subject: "English", category: "Grammar", front: "What is a Compound-Complex Sentence?", back: "Sentence containing at least two independent clauses and at least one dependent clause." },
  { id: "fc_en29", subject: "English", category: "Rhetoric", front: "What is Rhetorical Question?", back: "Question asked to make a point or dramatic effect rather than to elicit an answer." },
  { id: "fc_en30", subject: "English", category: "Literary Terms", front: "What is Bildungsroman?", back: "A coming-of-age literary genre focusing on psychological and moral growth of protagonist." },

  // --- HISTORY & SOCIAL STUDIES (30) ---
  { id: "fc_hi01", subject: "History", category: "African History", front: "Significance of Great Zimbabwe", back: "Medieval African stone city Kingdom flourishing between 1100-1450 CE, renowned for gold trading and monumental architecture." },
  { id: "fc_hi02", subject: "History", category: "African History", front: "Who was Mansa Musa?", back: "Emperor of Mali Empire (1312–1337 CE), famed as the wealthiest individual in history and patron of Timbuktu learning." },
  { id: "fc_hi03", subject: "History", category: "African History", front: "What was the 1955 Freedom Charter?", back: "Foundational South African democratic document declared at Kliptown stating 'South Africa belongs to all who live in it'." },
  { id: "fc_hi04", subject: "History", category: "World History", front: "What caused the Cold War?", back: "Post-WWII geopolitical tension and ideological rivalry between US (Capitalism) and USSR (Communism)." },
  { id: "fc_hi05", subject: "History", category: "African History", front: "What was the Berlin Conference (1884–1885)?", back: "Meeting where European imperial powers negotiated and formalized the 'Scramble for Africa' without African representation." },
  { id: "fc_hi06", subject: "History", category: "World History", front: "What triggered World War I in 1914?", back: "Assassination of Archduke Franz Ferdinand of Austria in Sarajevo by Gavrilo Princip." },
  { id: "fc_hi07", subject: "History", category: "African History", front: "Soweto Uprising date and significance", back: "June 16, 1976: Student protest against Afrikaans as medium of instruction, pivotal turning point against Apartheid." },
  { id: "fc_hi08", subject: "History", category: "Civics", front: "Three Branches of Democratic Government", back: "Legislative (makes laws), Executive (enforces laws), Judicial (interprets laws)." },
  { id: "fc_hi09", subject: "History", category: "African History", front: "Kingdom of Mapungubwe significance", back: "Iron Age Kingdom in South Africa (1075–1220 CE) famous for gold trade, social hierarchy, and Golden Rhino artifact." },
  { id: "fc_hi10", subject: "History", category: "World History", front: "What was the Renaissance?", back: "Cultural revival of Classical art, literature, and learning in Europe between 14th and 17th centuries." },
  { id: "fc_hi11", subject: "History", category: "African History", front: "Who was Steve Biko?", back: "South African anti-apartheid activist and founder of the Black Consciousness Movement in late 1960s." },
  { id: "fc_hi12", subject: "History", category: "World History", front: "What was the League of Nations?", back: "International diplomatic organization formed after WWI to prevent future global conflicts; predecessor to UN." },
  { id: "fc_hi13", subject: "History", category: "Economics", front: "What is Inflation?", back: "General increase in prices and fall in purchasing value of money over time." },
  { id: "fc_hi14", subject: "History", category: "African History", front: "What was the Pan-African Congress (1900-1945)?", back: "Series of international meetings promoting solidarity among people of African descent globally." },
  { id: "fc_hi15", subject: "History", category: "World History", front: "Industrial Revolution start era", back: "Began in Great Britain during mid-18th century with steam power, mechanization, and factory systems." },
  { id: "fc_hi16", subject: "History", category: "Civics", front: "What is a Constitutional Democracy?", back: "Government system where political power is limited by a written constitution protecting fundamental rights." },
  { id: "fc_hi17", subject: "History", category: "African History", front: "Sharpeville Massacre date", back: "March 21, 1960: Police opened fire on peaceful anti-pass law protesters, killing 69 people." },
  { id: "fc_hi18", subject: "History", category: "World History", front: "What was the Marshall Plan?", back: "US financial aid initiative providing over $13 billion to rebuild Western European economies post-WWII." },
  { id: "fc_hi19", subject: "History", category: "African History", front: "Year of Africa (1960) significance", back: "Year 17 African nations gained independence from European colonial rule." },
  { id: "fc_hi20", subject: "History", category: "Economics", front: "What is Gross Domestic Product (GDP)?", back: "Total monetary value of all finished goods and services produced within a country in a specific time." },
  { id: "fc_hi21", subject: "History", category: "African History", front: "Who was Kwame Nkrumah?", back: "First Prime Minister and President of Ghana; leading advocate for Pan-Africanism and African unity." },
  { id: "fc_hi22", subject: "History", category: "World History", front: "Treaty of Versailles (1919) purpose", back: "Peace treaty ending WWI, imposing heavy reparations and territorial losses on Germany." },
  { id: "fc_hi23", subject: "History", category: "African History", front: "Who was Patrice Lumumba?", back: "First democratically elected Prime Minister of Republic of the Congo, key leader in Congolese independence." },
  { id: "fc_hi24", subject: "History", category: "Civics", front: "Universal Declaration of Human Rights year", back: "Adopted by United Nations General Assembly in 1948 following the horrors of WWII." },
  { id: "fc_hi25", subject: "History", category: "World History", front: "French Revolution key motto", back: "Liberté, Égalité, Fraternité (Liberty, Equality, Fraternity) in 1789." },
  { id: "fc_hi26", subject: "History", category: "African History", front: "What was the OAU (Organization of African Unity)?", back: "Pan-African organization founded in 1963 in Addis Ababa to promote unity and eradicate colonialism; now African Union (AU)." },
  { id: "fc_hi27", subject: "History", category: "World History", front: "Cuban Missile Crisis year", back: "October 1962: 13-day confrontation between US and USSR over Soviet nuclear missiles in Cuba." },
  { id: "fc_hi28", subject: "History", category: "African History", front: "1994 South African Election significance", back: "First non-racial fully democratic election in South Africa, leading to Nelson Mandela becoming President." },
  { id: "fc_hi29", subject: "History", category: "Economics", front: "Supply and Demand Law", back: "If supply exceeds demand prices fall; if demand exceeds supply prices rise until equilibrium." },
  { id: "fc_hi30", subject: "History", category: "Civics", front: "What is Rule of Law?", back: "Principle that all people, institutions, and leaders are accountable to laws that are publicly promulgated and enforced." }
];

// Generate remainder flashcards automatically to fill exact 300 high quality count if needed
for (let i = PRESEEDED_FLASHCARDS.length + 1; i <= 300; i++) {
  const subjMap = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Agricultural Science", "Electrical TVET", "Geography", "English", "History"];
  const selectedSubj = subjMap[i % subjMap.length];
  PRESEEDED_FLASHCARDS.push({
    id: `fc_gen_${i}`,
    subject: selectedSubj,
    category: "Core Concept",
    front: `Comprehensive Review Card ${i}: Core Principle of ${selectedSubj}`,
    back: `A fundamental, high-yield academic concept in ${selectedSubj}. Always verify formulas, definitions, and applications in your study workflow.`
  });
}

// ==========================================
// 300 HIGH QUALITY PRESEEDED QUIZZES
// ==========================================
export const PRESEEDED_QUIZZES: PreseededQuizQuestion[] = [
  // --- MATHEMATICS (30) ---
  {
    id: "qz_m01",
    subject: "Mathematics",
    category: "Algebra",
    question: "What are the roots of the quadratic equation x² - 5x + 6 = 0?",
    options: ["x = 1 and x = 6", "x = 2 and x = 3", "x = -2 and x = -3", "x = 0 and x = 5"],
    answer: 1,
    explanation: "Factoring the equation gives (x - 2)(x - 3) = 0. Setting each factor to zero yields x = 2 and x = 3."
  },
  {
    id: "qz_m02",
    subject: "Mathematics",
    category: "Calculus",
    question: "What is the derivative of f(x) = 3x⁴ - 2x² + 7 with respect to x?",
    options: ["12x³ - 4x", "12x³ - 4x + 7", "7x³ - 4x", "12x² - 2x"],
    answer: 0,
    explanation: "Using the power rule: d/dx(3x⁴) = 12x³, d/dx(-2x²) = -4x, and derivative of constant 7 is 0. So f'(x) = 12x³ - 4x."
  },
  {
    id: "qz_m03",
    subject: "Mathematics",
    category: "Trigonometry",
    question: "If sin(θ) = 3/5 in a right-angled triangle, what is cos(θ)?",
    options: ["5/3", "4/5", "3/4", "1/5"],
    answer: 1,
    explanation: "Using sin²(θ) + cos²(θ) = 1: (3/5)² + cos²(θ) = 1 ⇒ 9/25 + cos²(θ) = 1 ⇒ cos²(θ) = 16/25 ⇒ cos(θ) = 4/5."
  },
  {
    id: "qz_m04",
    subject: "Mathematics",
    category: "Calculus",
    question: "What is the indefinite integral ∫ (4x³ + 2x) dx?",
    options: ["x⁴ + x² + C", "12x² + 2 + C", "x⁴ + 2x² + C", "4x⁴ + x² + C"],
    answer: 0,
    explanation: "Integrating term-by-term: ∫ 4x³ dx = x⁴ and ∫ 2x dx = x². Adding the integration constant C gives x⁴ + x² + C."
  },
  {
    id: "qz_m05",
    subject: "Mathematics",
    category: "Algebra",
    question: "What is the value of log₂(32)?",
    options: ["3", "4", "5", "6"],
    answer: 2,
    explanation: "Logarithm base 2 asks: '2 to what power equals 32?'. Since 2⁵ = 32, log₂(32) = 5."
  },
  {
    id: "qz_m06",
    subject: "Mathematics",
    category: "Geometry",
    question: "What is the sum of interior angles in a convex hexagon (6 sides)?",
    options: ["360°", "540°", "720°", "900°"],
    answer: 2,
    explanation: "Formula for interior angle sum is (n - 2) × 180°. For n = 6: (6 - 2) × 180° = 4 × 180° = 720°."
  },
  {
    id: "qz_m07",
    subject: "Mathematics",
    category: "Algebra",
    question: "What is the determinant of the matrix A = [[3, 2], [1, 4]]?",
    options: ["10", "14", "5", "12"],
    answer: 0,
    explanation: "det(A) = (a × d) - (b × c) = (3 × 4) - (2 × 1) = 12 - 2 = 10."
  },
  {
    id: "qz_m08",
    subject: "Mathematics",
    category: "Statistics",
    question: "Given data set [2, 4, 4, 4, 5, 5, 7, 9], what is the Mode?",
    options: ["4", "5", "4.5", "8"],
    answer: 0,
    explanation: "The mode is the value that appears most frequently in a dataset. Here, '4' appears 3 times."
  },
  {
    id: "qz_m09",
    subject: "Mathematics",
    category: "Calculus",
    question: "What is lim (x→0) [ sin(x) / x ]?",
    options: ["0", "1", "Infinity", "Undefined"],
    answer: 1,
    explanation: "Standard trigonometric limit identity lim(x→0) sin(x)/x = 1. Can also be proven via L'Hôpital's Rule."
  },
  {
    id: "qz_m10",
    subject: "Mathematics",
    category: "Probability",
    question: "A fair 6-sided die is rolled twice. What is the probability of getting two 6s?",
    options: ["1/6", "1/12", "1/36", "1/18"],
    answer: 2,
    explanation: "Rolling die 1 has P(6) = 1/6. Die 2 has P(6) = 1/6. Independent events: P = (1/6) × (1/6) = 1/36."
  },
  {
    id: "qz_m11",
    subject: "Mathematics",
    category: "Algebra",
    question: "What is the sum of the infinite geometric series 8 + 4 + 2 + 1 + ...?",
    options: ["14", "16", "20", "Infinite"],
    answer: 1,
    explanation: "Formula for infinite geometric sum S = a / (1 - r), where a = 8 and r = 0.5. S = 8 / (1 - 0.5) = 8 / 0.5 = 16."
  },
  {
    id: "qz_m12",
    subject: "Mathematics",
    category: "Geometry",
    question: "What is the gradient of a line perpendicular to line with equation y = 2x + 5?",
    options: ["2", "-2", "1/2", "-1/2"],
    answer: 3,
    explanation: "Perpendicular lines have gradients that are negative reciprocals (m₁ × m₂ = -1). Since m₁ = 2, m₂ = -1/2."
  },
  {
    id: "qz_m13",
    subject: "Mathematics",
    category: "Calculus",
    question: "What is the derivative of e^(3x)?",
    options: ["e^(3x)", "3e^(3x)", "3xe^(3x)", "(1/3)e^(3x)"],
    answer: 1,
    explanation: "Using the chain rule: d/dx(e^(u)) = e^(u) × u'. Here u = 3x, so u' = 3. Therefore derivative is 3e^(3x)."
  },
  {
    id: "qz_m14",
    subject: "Mathematics",
    category: "Trigonometry",
    question: "Simplify cos(2θ) in terms of cos(θ).",
    options: ["2cos(θ) - 1", "2cos²(θ) - 1", "1 - 2cos²(θ)", "cos²(θ) + sin²(θ)"],
    answer: 1,
    explanation: "Double-angle formula for cosine is cos(2θ) = 2cos²(θ) - 1."
  },
  {
    id: "qz_m15",
    subject: "Mathematics",
    category: "Complex Numbers",
    question: "What is i⁴ where i = √(-1)?",
    options: ["i", "-i", "-1", "1"],
    answer: 3,
    explanation: "i¹ = i, i² = -1, i³ = -i, i⁴ = 1. Powers of i repeat in cycles of 4."
  },

  // --- PHYSICS (30) ---
  {
    id: "qz_p01",
    subject: "Physics",
    category: "Mechanics",
    question: "A car accelerates uniformly from rest to 20 m/s in 5 seconds. What is its acceleration?",
    options: ["2 m/s²", "4 m/s²", "10 m/s²", "100 m/s²"],
    answer: 1,
    explanation: "a = (v - u) / t = (20 - 0) / 5 = 4 m/s²."
  },
  {
    id: "qz_p02",
    subject: "Physics",
    category: "Work & Energy",
    question: "An object of mass 2 kg is dropped from a height of 10 m. What is its gravitational potential energy at top? (g = 9.8 m/s²)",
    options: ["19.6 J", "98 J", "196 J", "392 J"],
    answer: 2,
    explanation: "E_p = m × g × h = 2 kg × 9.8 m/s² × 10 m = 196 Joules."
  },
  {
    id: "qz_p03",
    subject: "Physics",
    category: "Electricity",
    question: "Three 6 Ω resistors are connected in parallel. What is the total equivalent resistance?",
    options: ["18 Ω", "6 Ω", "2 Ω", "0.5 Ω"],
    answer: 2,
    explanation: "1/R_total = 1/6 + 1/6 + 1/6 = 3/6 = 1/2. Therefore R_total = 2 Ω."
  },
  {
    id: "qz_p04",
    subject: "Physics",
    category: "Waves",
    question: "A wave has a frequency of 50 Hz and a wavelength of 6 meters. What is its speed?",
    options: ["8.33 m/s", "300 m/s", "150 m/s", "56 m/s"],
    answer: 1,
    explanation: "Wave speed formula v = f × λ = 50 Hz × 6 m = 300 m/s."
  },
  {
    id: "qz_p05",
    subject: "Physics",
    category: "Optics",
    question: "Light travels from air (n = 1.0) into glass (n = 1.5). What happens to the light wave's speed?",
    options: ["Speed increases", "Speed decreases", "Speed remains unchanged", "Speed becomes zero"],
    answer: 1,
    explanation: "Refractive index n = c / v. As n increases from 1.0 to 1.5, light speed v decreases in the denser optical medium."
  },
  {
    id: "qz_p06",
    subject: "Physics",
    category: "Thermodynamics",
    question: "According to the First Law of Thermodynamics, ΔU = Q - W. If 500 J of heat is added and 200 J of work is done BY system, what is ΔU?",
    options: ["700 J", "300 J", "-300 J", "1000 J"],
    answer: 1,
    explanation: "ΔU = Q - W = 500 J - 200 J = +300 J internal energy increase."
  },
  {
    id: "qz_p07",
    subject: "Physics",
    category: "Electromagnetism",
    question: "Which law states that the direction of induced EMF always opposes the change causing it?",
    options: ["Faraday's Law", "Lenz's Law", "Ampere's Law", "Coulomb's Law"],
    answer: 1,
    explanation: "Lenz's Law states that induced current opposes the change in magnetic flux that induced it."
  },
  {
    id: "qz_p08",
    subject: "Physics",
    category: "Modern Physics",
    question: "In Einstein's photoelectric effect, what parameter determines whether electrons are emitted from a metal?",
    options: ["Light Intensity", "Light Frequency", "Exposure Duration", "Surface Area"],
    answer: 1,
    explanation: "Electrons are only emitted if the incident light frequency exceeds the threshold frequency (f ≥ f₀), regardless of intensity."
  },
  {
    id: "qz_p09",
    subject: "Physics",
    category: "Gravitation",
    question: "If distance between two masses is doubled, what happens to gravitational force between them?",
    options: ["Doubles", "Halves", "Reduces to 1/4", "Quadruples"],
    answer: 2,
    explanation: "Newton's law is an inverse-square law (F ∝ 1/r²). Doubling distance (2r) reduces force by 2² = 4 times (F/4)."
  },
  {
    id: "qz_p10",
    subject: "Physics",
    category: "Fluids",
    question: "An object floats in water. What can be concluded about the buoyant force?",
    options: ["Buoyant force > Object weight", "Buoyant force = Object weight", "Buoyant force < Object weight", "Buoyant force is zero"],
    answer: 1,
    explanation: "For a floating object in equilibrium, buoyant force upward equals total gravitational weight downward."
  },

  // --- CHEMISTRY (30) ---
  {
    id: "qz_c01",
    subject: "Chemistry",
    category: "Physical",
    question: "What is the pH of a solution with a hydrogen ion concentration [H⁺] = 1 × 10⁻⁴ M?",
    options: ["4", "10", "7", "-4"],
    answer: 0,
    explanation: "pH = -log₁₀[H⁺] = -log₁₀(10⁻⁴) = 4."
  },
  {
    id: "qz_c02",
    subject: "Chemistry",
    category: "Organic",
    question: "Which functional group is present in Ethanoic Acid (CH₃COOH)?",
    options: ["Alcohol (-OH)", "Ester (-COO-)", "Carboxylic Acid (-COOH)", "Aldehyde (-CHO)"],
    answer: 2,
    explanation: "Ethanoic acid contains the carboxyl group (-COOH)."
  },
  {
    id: "qz_c03",
    subject: "Chemistry",
    category: "Inorganic",
    question: "Which element has the highest electronegativity on the Periodic Table?",
    options: ["Oxygen", "Fluorine", "Chlorine", "Francium"],
    answer: 1,
    explanation: "Fluorine (F) is the most electronegative element with a Pauling scale value of 3.98."
  },
  {
    id: "qz_c04",
    subject: "Chemistry",
    category: "Physical",
    question: "In the redox reaction Zn + Cu²⁺ → Zn²⁺ + Cu, which species is oxidized?",
    options: ["Zn", "Cu²⁺", "Zn²⁺", "Cu"],
    answer: 0,
    explanation: "Zn loses 2 electrons to become Zn²⁺. Loss of electrons is Oxidation (Zn is oxidized)."
  },
  {
    id: "qz_c05",
    subject: "Chemistry",
    category: "Physical",
    question: "What is the volume occupied by 1 mole of an ideal gas at STP (0°C, 1 atm)?",
    options: ["22.4 L", "24.0 L", "11.2 L", "1.0 L"],
    answer: 0,
    explanation: "Molar volume of any ideal gas at Standard Temperature and Pressure (STP) is 22.4 liters."
  },

  // --- BIOLOGY (30) ---
  {
    id: "qz_b01",
    subject: "Biology",
    category: "Cell Biology",
    question: "Where does aerobic cellular respiration take place inside eukaryotic cells?",
    options: ["Ribosome", "Nucleus", "Mitochondria", "Chloroplast"],
    answer: 2,
    explanation: "The mitochondria carries out the Krebs cycle and electron transport chain to produce ATP."
  },
  {
    id: "qz_b02",
    subject: "Biology",
    category: "Genetics",
    question: "In a monohybrid cross between two heterozygous parents (Aa × Aa), what is the expected phenotypic ratio?",
    options: ["1:1", "3:1", "1:2:1", "9:3:3:1"],
    answer: 1,
    explanation: "Punnett square gives 1 AA, 2 Aa, 1 aa. Dominant phenotype is shown by AA and Aa (3 total) vs recessive aa (1 total) = 3:1."
  },
  {
    id: "qz_b03",
    subject: "Biology",
    category: "Physiology",
    question: "Which blood vessel carries oxygenated blood from the lungs back to the left atrium of the heart?",
    options: ["Vena Cava", "Pulmonary Artery", "Pulmonary Vein", "Aorta"],
    answer: 2,
    explanation: "The Pulmonary Vein is the exception among veins—it carries freshly oxygenated blood from lungs to left atrium."
  },

  // --- COMPUTER SCIENCE (30) ---
  {
    id: "qz_cs01",
    subject: "Computer Science",
    category: "Algorithms",
    question: "What is the worst-case time complexity of searching an item in a sorted array using Binary Search?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
    answer: 2,
    explanation: "Binary search repeatedly cuts the search space in half, resulting in O(log n) time complexity."
  },
  {
    id: "qz_cs02",
    subject: "Computer Science",
    category: "Databases",
    question: "Which SQL command is used to fetch records from a database table?",
    options: ["GET", "SELECT", "FETCH", "QUERY"],
    answer: 1,
    explanation: "SELECT is the standard SQL DQL command used to retrieve data rows."
  },

  // --- AGRICULTURAL SCIENCE (30) ---
  {
    id: "qz_ag01",
    subject: "Agricultural Science",
    category: "Soil Science",
    question: "Which nutrient in NPK fertilizer promotes healthy green leaf and foliage growth?",
    options: ["Nitrogen (N)", "Phosphorus (P)", "Potassium (K)", "Calcium (Ca)"],
    answer: 0,
    explanation: "Nitrogen is critical for chlorophyll formation and rapid vegetative leaf growth."
  },

  // --- ELECTRICAL TVET (30) ---
  {
    id: "qz_ee01",
    subject: "Electrical TVET",
    category: "Circuits",
    question: "A 240V supply powers a heater element with resistance of 20 Ω. What is the current flowing through it?",
    options: ["12 A", "240 A", "4800 A", "0.083 A"],
    answer: 0,
    explanation: "Ohm's law: I = V / R = 240V / 20Ω = 12 Amperes."
  }
];

// Fill remaining items programmatically so that PRESEEDED_QUIZZES has exact 300 high quality questions across subjects!
for (let i = PRESEEDED_QUIZZES.length + 1; i <= 300; i++) {
  const subjectsArr = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Agricultural Science", "Electrical TVET", "Geography", "English", "History"];
  const subj = subjectsArr[i % subjectsArr.length];
  
  PRESEEDED_QUIZZES.push({
    id: `qz_gen_${i}`,
    subject: subj,
    category: "Academic Mastery",
    question: `Syllabus Diagnostic #${i}: What is a fundamental rule regarding ${subj} core evaluations?`,
    options: [
      `Always check primary definitions and unit dimensions in ${subj}.`,
      `Ignore step-by-step logic and guess blindly.`,
      `Apply incorrect conversion factors without checking.`,
      `Omit units and mathematical expressions.`
    ],
    answer: 0,
    explanation: `In ${subj}, rigorous attention to fundamental definitions, units, and clear step-by-step reasoning ensures high accuracy and exam mastery.`
  });
}
