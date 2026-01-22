// Lead Management Type Definitions
// Product Boundary: Takes phone numbers as leads, calls them automatically, 
// classifies them as buyer/seller/renter, and shows results in a dashboard.

export type LeadRole = "buyer" | "seller" | "renter";

export type LeadSource = "new" | "old";

// Single Source of Truth for Lead States
export const LeadStatuses = ["pending", "calling", "answered", "qualified", "dropped"] as const;
export type LeadStatus = typeof LeadStatuses[number];

// Lead State Machine: Explicit state transitions
export interface LeadStateTransition {
  from: LeadStatus;
  to: LeadStatus[];
}

// Allowed state transitions - prevents illegal moves
export const LEAD_STATE_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  pending: ["calling", "dropped"], // Can start calling or drop entirely
  calling: ["answered", "dropped", "pending"], // Call resolves to answered, gets dropped, or returns to pending for retry
  answered: ["qualified", "dropped"], // Answered calls get qualified or dropped
  qualified: [], // Terminal state - no transitions out
  dropped: [], // Terminal state - no transitions out
};

// State Machine Validation Functions
export function canTransitionTo(fromStatus: LeadStatus, toStatus: LeadStatus): boolean {
  const allowedTransitions = LEAD_STATE_TRANSITIONS[fromStatus];
  return allowedTransitions.includes(toStatus);
}

export function getValidTransitions(currentStatus: LeadStatus): LeadStatus[] {
  return LEAD_STATE_TRANSITIONS[currentStatus];
}

export function isTerminalState(status: LeadStatus): boolean {
  return status === "qualified" || status === "dropped";
}

export class LeadStateTransitionError extends Error {
  constructor(fromStatus: LeadStatus, toStatus: LeadStatus) {
    super(`Invalid transition from "${fromStatus}" to "${toStatus}". Allowed transitions: [${LEAD_STATE_TRANSITIONS[fromStatus].join(", ")}]`);
    this.name = "LeadStateTransitionError";
  }
}

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