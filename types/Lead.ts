// Lead Management Type Definitions
// Product Boundary: Takes phone numbers as leads, calls them automatically, 
// classifies them as buyer/seller/renter, and shows results in a dashboard.

export type LeadRole = "buyer" | "seller" | "renter";

export type LeadSource = "new" | "old";

export type LeadStatus =
  | "pending"
  | "calling"
  | "answered"
  | "qualified"
  | "dropped";

export type LeadResult = "hot" | "warm" | "cold";

export interface Lead {
  _id?: string;

  // Contact Information
  name?: string;
  phone: string;

  // Lead Classification
  source: LeadSource;
  role?: LeadRole;

  // Property Information
  area?: string;
  budget?: string;
  demandPrice?: string;

  // Call Status & Results
  status: LeadStatus;
  result?: LeadResult;

  // Call Tracking
  callAttempts: number;
  lastCallAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Form data type for creating new leads
export interface CreateLeadData {
  name?: string;
  phone: string;
  source: LeadSource;
  area?: string;
  budget?: string;
}

// Type for lead updates
export interface UpdateLeadData extends Partial<Lead> {
  _id: string;
}

// Lead filter options for dashboard
export interface LeadFilters {
  role?: LeadRole;
  status?: LeadStatus;
  result?: LeadResult;
  source?: LeadSource;
}

// Lead statistics for dashboard
export interface LeadStats {
  total: number;
  pending: number;
  calling: number;
  answered: number;
  qualified: number;
  dropped: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
}