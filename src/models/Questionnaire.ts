// File: /src/models/Questionnaire.ts

// Core data model for an Enterprise Market Research Questionnaire application.

export interface ILogicRule {
  type: 'ScreenOut' | 'RouteTo' | 'FilterBy';
  condition: string; // e.g., "Q1_response_value == 'B'"
  targetId: string; // The next question/section ID or a specific 'ScreenOut' message ID.
}

export interface IQuestion {
  id: string;
  type: 'SingleChoice' | 'MultiChoice' | 'OpenText' | 'RatingScale' | 'ScreenOut' | 'Netting';
  text: string;
  options?: { label: string; value: string }[]; // For choice types
  logic?: ILogicRule[]; // For screen-out, routing, filtering
  labels?: string[]; // For netting/data analysis
  commentArea?: boolean; // Specific area for commenting
}

export interface ISection {
  id: string;
  title: string;
  questions: IQuestion[];
}

export interface IQuestionnaire {
  id: string; // UUID
  title: string;
  clientName: string;
  fieldworkMarket: string[]; // e.g., ["US", "UK"]
  comissionMarket: string[];
  language: string; // e.g., "en-US"
  status: 'Draft' | 'AI_Pending' | 'Ready' | 'InField' | 'Complete';
  createdAt: Date;
  createdByUserId: string;
  sections: ISection[];
}
