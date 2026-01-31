export interface Student {
  id: string;
  name: string;
  grade: string; // e.g., "الصف الخامس"
  className: string; // e.g., "5/أ"
  phone?: string; // New: Parent phone number
}

export type ActionType = 'NONE' | 'WARNING' | 'PLEDGE' | 'CALL' | 'SUMMON' | 'COUNCIL';

export interface LateRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  className: string;
  timestamp: number;
  dateString: string;
  notes: string;
  // New Fields
  arrivalTime?: string; // e.g. "07:30"
  isExcused?: boolean; // Has medical/transport excuse
  actionTaken?: ActionType;
  phone?: string; // Snapshot of phone at time of record
}

export interface AppSettings {
  schoolName: string;
  managerName: string;
  supervisorName: string;
  logoDataUrl?: string;
}

export interface GradeLevel {
  id: string;
  name: string;
  classes: string[];
}

export type ViewState = 'HOME' | 'STUDENTS' | 'REGISTER' | 'REPORTS' | 'SETTINGS';