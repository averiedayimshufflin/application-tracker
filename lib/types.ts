export type User = {
  id: number;
  name: string;
  email: string;
}; 

export type Application = {
  id: number;
  userId: number;
  company: string;
  role: string;
  location: string;
  jobUrl: string;
  status: "applied" | "interviewing" | "offer" | "rejected";
  dateApplied: Date;
  deadline: Date;
salary: string;
notes: string;
resumeFile:File | null;
createdAt: Date;

};

export type Contact = {
    id: number;
    applicationId: number;
    name: string;
    email: string;
    role: string;
    company: string;
    notes: string;
};

export type Event = {
    id: number;
    applicationId: number;
    type: 
    | "deadline"
  | "interview"
  | "follow_up"
  | "assessment"
  | "application_submitted"
  | "offer_deadline";
    title: string;
    date: Date;
    notes: string;
};