/**
 * Grade Master Africa - Curriculum Routing Engine
 * Maps user selections (Country, Grade/Year Level, Exam Board, Curriculum) to specific
 * AI system prompts, pedagogical instructions, and knowledge base access layers.
 */

import { 
  GLOBAL_CURRICULA, 
  GLOBAL_COUNTRIES, 
  getCurriculumById, 
  CurriculumDefinition, 
  CountryDefinition 
} from "./globalCurriculum.js";
import { ACADEMIC_SUBJECTS_KNOWLEDGEBASE, searchAcademicKnowledgebase } from "./knowledgebase.js";

export interface CurriculumRoutingParams {
  country?: string;
  countryCode?: string;
  gradeYear?: string;
  grade?: string;
  examBoard?: string;
  curriculum?: string;
  curriculumId?: string;
  educationStage?: "K-12 / Secondary" | "Higher Education / University" | "Vocational / Technical" | "Early Childhood" | string;
  preferredLanguage?: string;
  schoolType?: string;
}

export interface RoutingOutput {
  curriculum: CurriculumDefinition;
  country: CountryDefinition;
  examBoard: string;
  gradeYear: string;
  educationStage: string;
  systemPromptAddendum: string;
  knowledgeBaseAccessLayer: {
    primaryCategory: string;
    curriculumKeywords: string[];
    assessmentFormat: string;
    suggestedTopics: string[];
  };
  pedagogyStyle: string;
  languageInstruction: string;
}

export class CurriculumRouting {
  /**
   * Resolves curriculum definition based on parameters or defaults.
   */
  static resolveCurriculum(params: CurriculumRoutingParams): CurriculumDefinition {
    const id = params.curriculumId || params.curriculum;
    if (id && GLOBAL_CURRICULA[id]) {
      return GLOBAL_CURRICULA[id];
    }

    // Lookup by country code or country name
    const countryObj = GLOBAL_COUNTRIES.find(
      (c) => c.code === params.countryCode || c.name.toLowerCase() === (params.country || "").toLowerCase()
    );

    if (countryObj && countryObj.defaultCurriculumId) {
      return GLOBAL_CURRICULA[countryObj.defaultCurriculumId] || GLOBAL_CURRICULA["caps_sa"];
    }

    return GLOBAL_CURRICULA["caps_sa"];
  }

  /**
   * Maps user selections for Country, Grade, and Exam Board to specific AI system prompts and knowledge base access layers.
   */
  static mapUserSelectionToPrompt(params: CurriculumRoutingParams): RoutingOutput {
    const curriculum = this.resolveCurriculum(params);
    const countryCode = params.countryCode || (curriculum.id === "caps_sa" ? "ZA" : "GB");
    const country = GLOBAL_COUNTRIES.find((c) => c.code === countryCode) || GLOBAL_COUNTRIES[0];
    
    const examBoard = params.examBoard || curriculum.examBoards[0] || "National Board";
    const gradeYear = params.gradeYear || params.grade || "Grade 11 / Year 12";
    const educationStage = params.educationStage || "K-12 / Secondary";
    const language = params.preferredLanguage || "English";

    // Build Knowledge Base Access Layer
    const knowledgeBaseAccessLayer = this.getKnowledgeBaseAccessLayer(curriculum.id, gradeYear, examBoard);

    // Build Language Instruction
    const langLower = language.toLowerCase();
    const isRegionalDialect = ["isizulu", "zulu", "sesotho", "sotho", "swahili", "kiswahili", "yoruba", "isixhosa", "xhosa", "afrikaans", "sepedi", "setswana", "hausa", "igbo", "amharic", "shona", "ndebele", "bemba", "nyanja", "chewa", "chichewa", "luganda", "swati", "siswati", "malagasy", "lingala", "akan", "twi"].some(d => langLower.includes(d));

    let languageInstruction = "";
    if (langLower === "english") {
      languageInstruction = "Deliver instruction in formal academic English while using local terms appropriate for " + curriculum.name;
    } else if (isRegionalDialect) {
      languageInstruction = `[REGIONAL DIALECT VOICE TUTORING INSTRUCTION]
1. Deliver primary spoken and written tutoring explanations in ${language}.
2. Use bilingual pedagogical code-switching: explain concepts in ${language}, while providing standard English STEM terms in parentheses (e.g., "isiphumo (derivative)", "isivinini (velocity)", "imfundo (integral)") to prepare students for official ${curriculum.name} examinations.
3. Keep spoken voice output fluid, natural, and phonetically clear for voice tutoring speech synthesis (TTS).
4. Maintain standard international mathematical and scientific symbols, formulas, and KaTeX LaTeX formatting.`;
    } else {
      languageInstruction = `Deliver primary instruction in ${language}, maintaining international mathematical and scientific symbols, formulas, and KaTeX LaTeX formatting.`;
    }

    // System prompt addendum
    const systemPromptAddendum = `
[DYNAMIC CURRICULUM ROUTING LAYER]
- Country Target: ${country.name} (${country.flag})
- Curriculum Framework: ${curriculum.name}
- Grade/Year Level: ${gradeYear}
- Education Stage: ${educationStage}
- Selected Exam Board: ${examBoard}
- Language Preference: ${language}
- Assessment Standard: ${curriculum.gradingSystem}
- Pedagogical Approach: ${curriculum.teachingStyle} - ${curriculum.teachingStyleDescription}

INSTRUCTION MODIFIERS:
1. Align all worked solutions, notation, and mark allocation with ${examBoard} and ${curriculum.name}.
2. For mathematical/scientific derivations, format formulas clearly using LaTeX/KaTeX ($...$ or $$...$$).
3. Use the required exam command words (e.g., "Evaluate", "Calculate", "Show that", "Derive", "Analyze", "Critique") as specified by ${examBoard}.
4. [WHITEBOARD PEDAGOGY]: Organize complex derivations into structured tables or horizontal lines (---) to simulate a physical whiteboard layout. Use bold headings for each sub-topic.
5. ${curriculum.aiPromptInstruction}
`;

    return {
      curriculum,
      country,
      examBoard,
      gradeYear,
      educationStage,
      systemPromptAddendum,
      knowledgeBaseAccessLayer,
      pedagogyStyle: `${curriculum.teachingStyle}: ${curriculum.teachingStyleDescription}`,
      languageInstruction
    };
  }

  /**
   * Generates dynamic Knowledge Base access layer for filtering and scoring relevant topics
   */
  static getKnowledgeBaseAccessLayer(curriculumId: string, gradeYear: string, examBoard: string) {
    const curr = getCurriculumById(curriculumId);
    
    const searchResults = searchAcademicKnowledgebase(curr.name + " " + gradeYear);
    const matchedSubjects = searchResults.matchedSubjects || [];
    const suggestedTopics = matchedSubjects.length > 0 
      ? matchedSubjects.map(s => s.subject)
      : curr.keySubjects;

    return {
      primaryCategory: curr.category,
      curriculumKeywords: [curr.name, examBoard, gradeYear, curr.countryOrRegion],
      assessmentFormat: curr.gradingSystem,
      suggestedTopics
    };
  }

  /**
   * Utility method to generate complete system instructions for the backend or frontend tutor.
   */
  static getSystemInstruction(params: CurriculumRoutingParams, subject: string = "Mathematics"): string {
    const routing = this.mapUserSelectionToPrompt(params);
    return `You are Aristotle, an elite AI Academic Tutor specializing in ${subject}.
    
${routing.systemPromptAddendum}

${routing.languageInstruction}

Maintain encouraging, rigorous, and step-by-step academic guidance with clear LaTeX formatting for all mathematical or scientific equations.`;
  }
}

export default CurriculumRouting;
