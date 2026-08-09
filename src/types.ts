export interface Assignment {
  id: string;
  userId: string;
  title: string;
  subject: string;
  dueDate: number;
  description: string;
}

export interface Exam {
  id: string;
  userId: string;
  title: string;
  subject: string;
  examDate: number;
}

export type UserRole = 'student' | 'teacher' | 'admin' | 'parent';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  grade?: string;
  gradeYear?: string;
  school?: string;
  schoolType?: string;
  country?: string;
  curriculum?: string;
  educationStage?: string;
  examBoard?: string;
  learningStyle?: string;
  universityAspirations?: string;
  careerInterests?: string;
  learningGoals?: string[];
  preferredLanguage?: string;
  subscriptionTier?: string;
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  type: 'rich-text' | 'handwritten' | 'voice';
  createdAt: number;
  updatedAt: number;
}

export interface Document {
  id: string;
  userId: string;
  name: string;
  url: string;
  type: 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'google-doc' | 'google-sheet' | 'google-slides';
  summary?: string;
  createdAt: number;
}

export interface LearningProgress {
  userId: string;
  subject: string;
  progress: number;
  completedLessons: string[];
  badges: string[];
  lastStudySession: number;
}
