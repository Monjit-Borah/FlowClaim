export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";
export type ClaimStatus =
  | "Draft"
  | "OCR Processing"
  | "Ready for Review"
  | "Submitted"
  | "Pending Manager Approval"
  | "Pending Finance Approval"
  | "Pending Director Approval"
  | "Pending Conditional Approval"
  | "Approved"
  | "Rejected"
  | "Sent Back"
  | "Escalated"
  | "In Payment Queue"
  | "Paid"
  | "Archived";

export type PolicySeverity = "SOFT" | "HARD";
export type FraudRiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type ApprovalDecision = "APPROVED" | "REJECTED" | "SENT_BACK" | "ESCALATED";
export type WorkflowMode = "SEQUENTIAL" | "PARALLEL" | "HYBRID";

export interface Company {
  id: string;
  name: string;
  country: string;
  baseCurrency: string;
  industry: string;
  size: string;
  approvalPreference: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface CostCenter {
  id: string;
  name: string;
  code: string;
}

export interface EmployeeProfile {
  departmentId: string;
  costCenterId: string;
  title: string;
  country: string;
  managerId?: string;
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  active: boolean;
  profile: EmployeeProfile;
}

export interface ReceiptLineItem {
  id: string;
  label: string;
  amount: number;
}

export interface OCRExtraction {
  merchant: string;
  amount: number;
  tax: number;
  date: string;
  currency: string;
  suggestedCategory: string;
  confidence: number;
  lineItems: ReceiptLineItem[];
  lowConfidenceFields: string[];
}

export interface ExpenseReceipt {
  id: string;
  claimId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  ocr?: OCRExtraction;
}

export interface ApprovalAction {
  id: string;
  stepName: string;
  actorName: string;
  decision: ApprovalDecision;
  comment: string;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  claimId: string;
  stepName: string;
  approverName: string;
  approverRole: Role | "FINANCE" | "DIRECTOR" | "CFO";
  state: "PENDING" | "DONE";
}

export interface PolicyViolation {
  id: string;
  title: string;
  description: string;
  severity: PolicySeverity;
  resolvedByJustification?: boolean;
}

export interface FraudFlag {
  id: string;
  title: string;
  description: string;
  level: FraudRiskLevel;
  score: number;
}

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  managerName: string;
  department: string;
  category: string;
  amount: number;
  currency: string;
  convertedAmount: number;
  companyCurrency: string;
  expenseDate: string;
  vendor: string;
  description: string;
  notes?: string;
  international: boolean;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
  riskScore: number;
  aiSummary: string;
  similarInsight: string;
  receipt?: ExpenseReceipt;
  policyViolations: PolicyViolation[];
  fraudFlags: FraudFlag[];
  approvalActions: ApprovalAction[];
  approvalRequests: ApprovalRequest[];
  timeline: { title: string; timestamp: string; detail: string }[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  approverType: "MANAGER" | "FINANCE" | "DIRECTOR" | "CFO" | "SPECIFIC_USER";
  specificUserId?: string;
  mode: WorkflowMode;
  minApprovalPercent?: number;
  overrideAutoApprove?: boolean;
  conditionChip: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  trigger: string;
  mode: WorkflowMode;
  steps: WorkflowStep[];
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  severity: PolicySeverity;
  category?: string;
  threshold?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "SUBMITTED" | "APPROVAL" | "APPROVED" | "REJECTED" | "SENT_BACK" | "ESCALATED" | "PAID" | "SYSTEM";
  audience: Role | "ALL";
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  detail: string;
}

export interface ReimbursementPayment {
  id: string;
  claimId: string;
  employeeName: string;
  amount: number;
  currency: string;
  status: "QUEUED" | "PAID";
  payoutReference?: string;
  eta: string;
}

export interface AnalyticsSnapshot {
  kpis: {
    label: string;
    value: string;
    delta: string;
  }[];
  monthlySpend: { month: string; value: number }[];
  categorySpend: { name: string; value: number }[];
  departmentSpend: { name: string; value: number }[];
}
