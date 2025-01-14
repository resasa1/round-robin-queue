export interface Patient {
  id: string;
  name: string;
  priority: number;
  arrivalTime: Date;
  estimatedDuration: number; // in minutes
  status: 'waiting' | 'in-progress' | 'completed';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
  currentPatient: string | null;
}