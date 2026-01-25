export interface Student {
  id: string;
  name: string;
  grade: string; // e.g., "الصف الخامس"
  className: string; // e.g., "5/أ"
}

export interface LateRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  className: string;
  timestamp: number; // For sorting and ID
  dateString: string; // For filtering e.g., "2023-10-25"
  notes: string;
}

export interface AppSettings {
  schoolName: string;
  managerName: string;
  supervisorName: string;
  logoDataUrl?: string; // New optional field for Base64 image
}

// New Interface for managing the structure (Grades & Classes)
export interface GradeLevel {
  id: string;
  name: string; // e.g. "الصف الخامس"
  classes: string[]; // e.g. ["1", "2", "أ", "ب"]
}

export type ViewState = 'HOME' | 'STUDENTS' | 'REGISTER' | 'REPORTS' | 'SETTINGS';