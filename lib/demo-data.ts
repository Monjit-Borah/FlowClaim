import {
  AnalyticsSnapshot,
  AuditLog,
  Company,
  CostCenter,
  Department,
  ExpenseClaim,
  NotificationItem,
  PolicyRule,
  ReimbursementPayment,
  User,
  WorkflowTemplate
} from "@/lib/types";

export const company: Company = {
  id: "comp_1",
  name: "Northstar Dynamics",
  country: "United States",
  baseCurrency: "USD",
  industry: "AI Infrastructure",
  size: "201-500",
  approvalPreference: "Hybrid intelligent routing"
};

export const departments: Department[] = [
  { id: "dept_1", name: "Operations" },
  { id: "dept_2", name: "Sales" },
  { id: "dept_3", name: "Finance" },
  { id: "dept_4", name: "Product" }
];

export const costCenters: CostCenter[] = [
  { id: "cc_1", name: "Core Platform", code: "CP-101" },
  { id: "cc_2", name: "Revenue", code: "RV-204" },
  { id: "cc_3", name: "Corporate Finance", code: "FN-401" }
];

export const users: User[] = [
  {
    id: "usr_admin",
    companyId: "comp_1",
    name: "Ariana Blake",
    email: "ariana@northstar.ai",
    role: "ADMIN",
    avatar: "AB",
    active: true,
    profile: {
      departmentId: "dept_3",
      costCenterId: "cc_3",
      title: "Finance Systems Lead",
      country: "United States"
    }
  },
  {
    id: "usr_mgr_1",
    companyId: "comp_1",
    name: "Marcus Lane",
    email: "marcus@northstar.ai",
    role: "MANAGER",
    avatar: "ML",
    active: true,
    profile: {
      departmentId: "dept_1",
      costCenterId: "cc_1",
      title: "Operations Manager",
      country: "United States"
    }
  },
  {
    id: "usr_mgr_2",
    companyId: "comp_1",
    name: "Priya Kapoor",
    email: "priya@northstar.ai",
    role: "MANAGER",
    avatar: "PK",
    active: true,
    profile: {
      departmentId: "dept_2",
      costCenterId: "cc_2",
      title: "Regional Sales Manager",
      country: "India"
    }
  },
  {
    id: "usr_emp_1",
    companyId: "comp_1",
    name: "Nina Chen",
    email: "nina@northstar.ai",
    role: "EMPLOYEE",
    avatar: "NC",
    active: true,
    profile: {
      departmentId: "dept_1",
      costCenterId: "cc_1",
      title: "Field Operations Lead",
      country: "United States",
      managerId: "usr_mgr_1"
    }
  },
  {
    id: "usr_emp_2",
    companyId: "comp_1",
    name: "Daniel Ross",
    email: "daniel@northstar.ai",
    role: "EMPLOYEE",
    avatar: "DR",
    active: true,
    profile: {
      departmentId: "dept_2",
      costCenterId: "cc_2",
      title: "Account Executive",
      country: "United Kingdom",
      managerId: "usr_mgr_2"
    }
  },
  {
    id: "usr_emp_3",
    companyId: "comp_1",
    name: "Farah El-Sayed",
    email: "farah@northstar.ai",
    role: "EMPLOYEE",
    avatar: "FE",
    active: false,
    profile: {
      departmentId: "dept_4",
      costCenterId: "cc_1",
      title: "Product Operations Analyst",
      country: "United Arab Emirates",
      managerId: "usr_mgr_1"
    }
  }
];

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "wf_1",
    name: "Under 5k Fast Lane",
    description: "Manager only for low-risk claims under 5,000",
    trigger: "Amount < 5,000",
    mode: "SEQUENTIAL",
    steps: [
      {
        id: "wf_1_s1",
        name: "Reporting Manager",
        approverType: "MANAGER",
        mode: "SEQUENTIAL",
        conditionChip: "Default manager approval"
      }
    ]
  },
  {
    id: "wf_2",
    name: "5k to 25k Finance Review",
    description: "Manager followed by finance checkpoint",
    trigger: "5,001 - 25,000",
    mode: "SEQUENTIAL",
    steps: [
      {
        id: "wf_2_s1",
        name: "Reporting Manager",
        approverType: "MANAGER",
        mode: "SEQUENTIAL",
        conditionChip: "Step 1"
      },
      {
        id: "wf_2_s2",
        name: "Finance",
        approverType: "FINANCE",
        mode: "SEQUENTIAL",
        conditionChip: "Threshold gate"
      }
    ]
  },
  {
    id: "wf_3",
    name: "High Value Governance",
    description: "Manager, finance, director for 25k+",
    trigger: "Amount > 25,000",
    mode: "SEQUENTIAL",
    steps: [
      {
        id: "wf_3_s1",
        name: "Reporting Manager",
        approverType: "MANAGER",
        mode: "SEQUENTIAL",
        conditionChip: "Step 1"
      },
      {
        id: "wf_3_s2",
        name: "Finance",
        approverType: "FINANCE",
        mode: "SEQUENTIAL",
        conditionChip: "Budget review"
      },
      {
        id: "wf_3_s3",
        name: "Director",
        approverType: "DIRECTOR",
        mode: "SEQUENTIAL",
        conditionChip: "Step 3"
      }
    ]
  },
  {
    id: "wf_4",
    name: "60 Percent Consensus",
    description: "Parallel approvers with weighted approval",
    trigger: "Policy exception",
    mode: "PARALLEL",
    steps: [
      {
        id: "wf_4_s1",
        name: "Operations Panel",
        approverType: "MANAGER",
        mode: "PARALLEL",
        minApprovalPercent: 60,
        conditionChip: "60% approve"
      }
    ]
  },
  {
    id: "wf_5",
    name: "CFO Override",
    description: "CFO approval auto resolves claim",
    trigger: "Executive travel",
    mode: "HYBRID",
    steps: [
      {
        id: "wf_5_s1",
        name: "CFO",
        approverType: "CFO",
        mode: "HYBRID",
        overrideAutoApprove: true,
        conditionChip: "CFO approves => auto approved"
      }
    ]
  },
  {
    id: "wf_6",
    name: "60 Percent Or CFO",
    description: "Hybrid consensus or executive override",
    trigger: "Exception path",
    mode: "HYBRID",
    steps: [
      {
        id: "wf_6_s1",
        name: "Panel Consensus",
        approverType: "MANAGER",
        mode: "PARALLEL",
        minApprovalPercent: 60,
        conditionChip: "60% or CFO"
      },
      {
        id: "wf_6_s2",
        name: "CFO Override",
        approverType: "CFO",
        mode: "HYBRID",
        overrideAutoApprove: true,
        conditionChip: "Hybrid override"
      }
    ]
  },
  {
    id: "wf_7",
    name: "International Travel",
    description: "Manager + Finance + Director for international travel",
    trigger: "International travel = true",
    mode: "SEQUENTIAL",
    steps: [
      {
        id: "wf_7_s1",
        name: "Reporting Manager",
        approverType: "MANAGER",
        mode: "SEQUENTIAL",
        conditionChip: "Travel origin outside base country"
      },
      {
        id: "wf_7_s2",
        name: "Finance",
        approverType: "FINANCE",
        mode: "SEQUENTIAL",
        conditionChip: "FX and tax review"
      },
      {
        id: "wf_7_s3",
        name: "Director",
        approverType: "DIRECTOR",
        mode: "SEQUENTIAL",
        conditionChip: "International oversight"
      }
    ]
  }
];

export const policyRules: PolicyRule[] = [
  {
    id: "pol_1",
    name: "Meals cap",
    description: "Meals above 120 require extra justification",
    severity: "SOFT",
    category: "Meals",
    threshold: 120
  },
  {
    id: "pol_2",
    name: "Hotel receipt required",
    description: "Lodging claims must include a receipt",
    severity: "HARD",
    category: "Hotel"
  },
  {
    id: "pol_3",
    name: "Late submission",
    description: "Claims older than 30 days need justification",
    severity: "SOFT"
  },
  {
    id: "pol_4",
    name: "Weekend warning",
    description: "Weekend expenses trigger warning review",
    severity: "SOFT"
  },
  {
    id: "pol_5",
    name: "Travel finance threshold",
    description: "Travel above 2,500 requires finance approval",
    severity: "HARD",
    category: "Travel",
    threshold: 2500
  }
];

export const claims: ExpenseClaim[] = [
  {
    id: "clm_1001",
    employeeId: "usr_emp_1",
    employeeName: "Nina Chen",
    managerName: "Marcus Lane",
    department: "Operations",
    category: "Travel",
    amount: 1420,
    currency: "USD",
    convertedAmount: 1420,
    companyCurrency: "USD",
    expenseDate: "2026-03-10",
    vendor: "JetBlue",
    description: "Regional operations review in Austin",
    notes: "Flight plus airport transfers",
    international: false,
    status: "In Payment Queue",
    createdAt: "2026-03-11T09:20:00Z",
    updatedAt: "2026-03-12T18:15:00Z",
    riskScore: 24,
    aiSummary: "Fully receipted domestic travel claim with matched itinerary timing and no policy blockers.",
    similarInsight: "12 similar Austin field review claims approved in the last two quarters.",
    policyViolations: [],
    fraudFlags: [],
    approvalActions: [
      {
        id: "act_1",
        stepName: "Reporting Manager",
        actorName: "Marcus Lane",
        decision: "APPROVED",
        comment: "Business need is clear. Costs aligned with trip scope.",
        createdAt: "2026-03-11T16:10:00Z"
      },
      {
        id: "act_2",
        stepName: "Finance",
        actorName: "Ariana Blake",
        decision: "APPROVED",
        comment: "All amounts reconciled against receipt and itinerary.",
        createdAt: "2026-03-12T10:30:00Z"
      }
    ],
    approvalRequests: [],
    timeline: [
      {
        title: "Claim drafted",
        timestamp: "2026-03-11 09:20",
        detail: "Expense draft created from uploaded travel receipt"
      },
      {
        title: "Approved",
        timestamp: "2026-03-12 10:30",
        detail: "Moved into payment queue after finance approval"
      }
    ],
    receipt: {
      id: "rcp_1",
      claimId: "clm_1001",
      fileName: "jetblue-austin.pdf",
      fileUrl: "/receipts/jetblue-austin.pdf",
      uploadedAt: "2026-03-11T09:22:00Z",
      ocr: {
        merchant: "JetBlue",
        amount: 1420,
        tax: 83,
        date: "2026-03-10",
        currency: "USD",
        suggestedCategory: "Travel",
        confidence: 0.96,
        lineItems: [
          { id: "li_1", label: "Airfare", amount: 1280 },
          { id: "li_2", label: "Airport transfer", amount: 140 }
        ],
        lowConfidenceFields: []
      }
    }
  },
  {
    id: "clm_1002",
    employeeId: "usr_emp_2",
    employeeName: "Daniel Ross",
    managerName: "Priya Kapoor",
    department: "Sales",
    category: "Meals",
    amount: 138,
    currency: "GBP",
    convertedAmount: 176,
    companyCurrency: "USD",
    expenseDate: "2026-03-15",
    vendor: "The Lighterman",
    description: "Client dinner after pipeline review",
    notes: "Two client attendees",
    international: true,
    status: "Pending Manager Approval",
    createdAt: "2026-03-16T12:00:00Z",
    updatedAt: "2026-03-16T12:40:00Z",
    riskScore: 48,
    aiSummary: "Meal exceeds policy soft cap in converted value but includes business context.",
    similarInsight: "Comparable London client dinners average USD 162.",
    policyViolations: [
      {
        id: "pv_1",
        title: "Meals cap exceeded",
        description: "Converted amount exceeds the recommended meal cap of 120 USD.",
        severity: "SOFT",
        resolvedByJustification: true
      }
    ],
    fraudFlags: [
      {
        id: "ff_1",
        title: "Weekend expense",
        description: "Submitted for a Sunday evening dinner.",
        level: "MEDIUM",
        score: 47
      }
    ],
    approvalActions: [],
    approvalRequests: [
      {
        id: "apr_1",
        claimId: "clm_1002",
        stepName: "Reporting Manager",
        approverName: "Priya Kapoor",
        approverRole: "MANAGER",
        state: "PENDING"
      }
    ],
    timeline: [
      {
        title: "OCR completed",
        timestamp: "2026-03-16 12:12",
        detail: "Receipt fields extracted with 89% confidence"
      },
      {
        title: "Submitted",
        timestamp: "2026-03-16 12:40",
        detail: "Awaiting manager review"
      }
    ],
    receipt: {
      id: "rcp_2",
      claimId: "clm_1002",
      fileName: "london-client-dinner.jpg",
      fileUrl: "/receipts/london-client-dinner.jpg",
      uploadedAt: "2026-03-16T12:02:00Z",
      ocr: {
        merchant: "The Lighterman",
        amount: 138,
        tax: 17,
        date: "2026-03-15",
        currency: "GBP",
        suggestedCategory: "Meals",
        confidence: 0.89,
        lineItems: [
          { id: "li_3", label: "Dinner", amount: 121 },
          { id: "li_4", label: "Service", amount: 17 }
        ],
        lowConfidenceFields: ["tax"]
      }
    }
  },
  {
    id: "clm_1003",
    employeeId: "usr_emp_1",
    employeeName: "Nina Chen",
    managerName: "Marcus Lane",
    department: "Operations",
    category: "Supplies",
    amount: 510,
    currency: "USD",
    convertedAmount: 510,
    companyCurrency: "USD",
    expenseDate: "2026-03-05",
    vendor: "Staples",
    description: "Field office replenishment",
    international: false,
    status: "Rejected",
    createdAt: "2026-03-06T08:00:00Z",
    updatedAt: "2026-03-07T15:00:00Z",
    riskScore: 61,
    aiSummary: "Receipt present but item grouping indicates personal goods mixed with office supplies.",
    similarInsight: "Rejected because 3 line items do not map to approved supply SKUs.",
    policyViolations: [
      {
        id: "pv_2",
        title: "Mandatory field mismatch",
        description: "Description did not match line-item profile for approved supply categories.",
        severity: "HARD"
      }
    ],
    fraudFlags: [
      {
        id: "ff_2",
        title: "Receipt mismatch",
        description: "Manual edits detected in one line subtotal region.",
        level: "HIGH",
        score: 78
      }
    ],
    approvalActions: [
      {
        id: "act_3",
        stepName: "Reporting Manager",
        actorName: "Marcus Lane",
        decision: "REJECTED",
        comment: "Please separate personal and approved field supply purchases.",
        createdAt: "2026-03-07T15:00:00Z"
      }
    ],
    approvalRequests: [],
    timeline: [
      {
        title: "Flagged",
        timestamp: "2026-03-06 09:12",
        detail: "Fraud engine detected edited receipt region"
      },
      {
        title: "Rejected",
        timestamp: "2026-03-07 15:00",
        detail: "Manager rejected with remediation request"
      }
    ]
  },
  {
    id: "clm_1004",
    employeeId: "usr_emp_2",
    employeeName: "Daniel Ross",
    managerName: "Priya Kapoor",
    department: "Sales",
    category: "Travel",
    amount: 6800,
    currency: "EUR",
    convertedAmount: 7360,
    companyCurrency: "USD",
    expenseDate: "2026-03-18",
    vendor: "Lufthansa",
    description: "Berlin summit and partner meetings",
    notes: "International summit with customer expansion sessions",
    international: true,
    status: "Pending Finance Approval",
    createdAt: "2026-03-19T07:30:00Z",
    updatedAt: "2026-03-20T13:30:00Z",
    riskScore: 72,
    aiSummary: "High-value international travel routed to finance after manager approval. Risk elevated by weekend hotel stay and rapid resubmission.",
    similarInsight: "Spend is 22% above Daniel's average international trip amount.",
    policyViolations: [
      {
        id: "pv_3",
        title: "Travel threshold",
        description: "Converted value exceeds the travel finance threshold of 2,500 USD.",
        severity: "HARD"
      }
    ],
    fraudFlags: [
      {
        id: "ff_3",
        title: "Unusual spend",
        description: "Travel amount is materially higher than peer benchmark for the same route.",
        level: "HIGH",
        score: 72
      }
    ],
    approvalActions: [
      {
        id: "act_4",
        stepName: "Reporting Manager",
        actorName: "Priya Kapoor",
        decision: "APPROVED",
        comment: "Trip matched summit and pipeline goals.",
        createdAt: "2026-03-20T09:10:00Z"
      }
    ],
    approvalRequests: [
      {
        id: "apr_2",
        claimId: "clm_1004",
        stepName: "Finance",
        approverName: "Ariana Blake",
        approverRole: "FINANCE",
        state: "PENDING"
      }
    ],
    timeline: [
      {
        title: "Submitted",
        timestamp: "2026-03-19 07:30",
        detail: "International travel workflow attached"
      },
      {
        title: "Moved to finance",
        timestamp: "2026-03-20 09:10",
        detail: "Manager approval complete"
      }
    ]
  },
  {
    id: "clm_1005",
    employeeId: "usr_emp_1",
    employeeName: "Nina Chen",
    managerName: "Marcus Lane",
    department: "Operations",
    category: "Meals",
    amount: 148,
    currency: "USD",
    convertedAmount: 148,
    companyCurrency: "USD",
    expenseDate: "2026-03-15",
    vendor: "The Lighterman",
    description: "Possible duplicate submission",
    international: false,
    status: "Ready for Review",
    createdAt: "2026-03-18T11:00:00Z",
    updatedAt: "2026-03-18T11:15:00Z",
    riskScore: 83,
    aiSummary: "Likely duplicate based on merchant, amount, date proximity, and OCR similarity score.",
    similarInsight: "Matched against claim clm_1002 with 92% document similarity.",
    policyViolations: [],
    fraudFlags: [
      {
        id: "ff_4",
        title: "Duplicate suspicion",
        description: "Same merchant, amount, and date pattern already seen in another claim.",
        level: "HIGH",
        score: 83
      }
    ],
    approvalActions: [],
    approvalRequests: [],
    timeline: [
      {
        title: "OCR review required",
        timestamp: "2026-03-18 11:15",
        detail: "Low-trust receipt held before submission"
      }
    ],
    receipt: {
      id: "rcp_3",
      claimId: "clm_1005",
      fileName: "duplicate-dinner.png",
      fileUrl: "/receipts/duplicate-dinner.png",
      uploadedAt: "2026-03-18T11:02:00Z",
      ocr: {
        merchant: "The Lighterman",
        amount: 148,
        tax: 14,
        date: "2026-03-15",
        currency: "USD",
        suggestedCategory: "Meals",
        confidence: 0.74,
        lineItems: [
          { id: "li_5", label: "Dinner", amount: 134 },
          { id: "li_6", label: "Tax", amount: 14 }
        ],
        lowConfidenceFields: ["date", "currency"]
      }
    }
  },
  {
    id: "clm_1006",
    employeeId: "usr_emp_1",
    employeeName: "Nina Chen",
    managerName: "Marcus Lane",
    department: "Operations",
    category: "Travel",
    amount: 480,
    currency: "USD",
    convertedAmount: 480,
    companyCurrency: "USD",
    expenseDate: "2026-03-25",
    vendor: "Uber",
    description: "Airport transfer and local transport",
    international: false,
    status: "Paid",
    createdAt: "2026-03-25T09:00:00Z",
    updatedAt: "2026-03-27T18:00:00Z",
    riskScore: 12,
    aiSummary: "Low-risk local travel claim fully paid.",
    similarInsight: "Within normal transport range for similar airport runs.",
    policyViolations: [],
    fraudFlags: [],
    approvalActions: [
      {
        id: "act_5",
        stepName: "Reporting Manager",
        actorName: "Marcus Lane",
        decision: "APPROVED",
        comment: "Approved.",
        createdAt: "2026-03-25T16:00:00Z"
      }
    ],
    approvalRequests: [],
    timeline: [
      {
        title: "Paid",
        timestamp: "2026-03-27 18:00",
        detail: "Reimbursed to employee wallet"
      }
    ]
  }
];

export const notifications: NotificationItem[] = [
  {
    id: "ntf_1",
    title: "Finance review needed",
    description: "Daniel Ross's Berlin summit claim moved into finance review.",
    time: "8 mins ago",
    type: "APPROVAL",
    audience: "ADMIN"
  },
  {
    id: "ntf_2",
    title: "Claim approved",
    description: "Austin travel claim for Nina Chen is ready for payout.",
    time: "1 hr ago",
    type: "APPROVED",
    audience: "EMPLOYEE"
  },
  {
    id: "ntf_3",
    title: "Duplicate risk detected",
    description: "One new claim was held before submission due to high duplicate confidence.",
    time: "2 hrs ago",
    type: "ESCALATED",
    audience: "ALL"
  }
];

export const auditLogs: AuditLog[] = [
  {
    id: "aud_1",
    actor: "System",
    action: "Company created",
    target: "Northstar Dynamics",
    timestamp: "2026-03-01 08:00",
    detail: "Signup flow created company, admin user, and base currency USD."
  },
  {
    id: "aud_2",
    actor: "Ariana Blake",
    action: "Workflow updated",
    target: "International Travel",
    timestamp: "2026-03-20 11:00",
    detail: "Added director step for international expense claims."
  },
  {
    id: "aud_3",
    actor: "Marcus Lane",
    action: "Claim rejected",
    target: "clm_1003",
    timestamp: "2026-03-07 15:00",
    detail: "Rejected after receipt edit flag and category mismatch."
  },
  {
    id: "aud_4",
    actor: "Finance Bot",
    action: "OCR processed",
    target: "clm_1002",
    timestamp: "2026-03-16 12:12",
    detail: "Structured extraction completed with 89% confidence."
  }
];

export const payments: ReimbursementPayment[] = [
  {
    id: "pay_1",
    claimId: "clm_1001",
    employeeName: "Nina Chen",
    amount: 1420,
    currency: "USD",
    status: "QUEUED",
    eta: "Today 18:00"
  },
  {
    id: "pay_2",
    claimId: "clm_1006",
    employeeName: "Nina Chen",
    amount: 480,
    currency: "USD",
    status: "PAID",
    payoutReference: "RF-2026-10489",
    eta: "Completed"
  }
];

export const adminAnalytics: AnalyticsSnapshot = {
  kpis: [
    { label: "Total spend", value: "$148K", delta: "+12.4%" },
    { label: "Approval rate", value: "91%", delta: "+4.1%" },
    { label: "Avg approval time", value: "18h", delta: "-6h" },
    { label: "Fraud alerts", value: "14", delta: "-3" }
  ],
  monthlySpend: [
    { month: "Oct", value: 24000 },
    { month: "Nov", value: 27000 },
    { month: "Dec", value: 22000 },
    { month: "Jan", value: 31000 },
    { month: "Feb", value: 29000 },
    { month: "Mar", value: 35000 }
  ],
  categorySpend: [
    { name: "Travel", value: 64000 },
    { name: "Meals", value: 18000 },
    { name: "Supplies", value: 12000 },
    { name: "Hotels", value: 28000 },
    { name: "Mileage", value: 9000 }
  ],
  departmentSpend: [
    { name: "Operations", value: 42000 },
    { name: "Sales", value: 51000 },
    { name: "Finance", value: 17000 },
    { name: "Product", value: 38000 }
  ]
};

export const managerAnalytics: AnalyticsSnapshot = {
  kpis: [
    { label: "Team spend", value: "$41K", delta: "+8.2%" },
    { label: "Pending approvals", value: "7", delta: "-2" },
    { label: "Avg response time", value: "6h", delta: "-1.2h" },
    { label: "High-risk claims", value: "3", delta: "+1" }
  ],
  monthlySpend: adminAnalytics.monthlySpend,
  categorySpend: [
    { name: "Travel", value: 25000 },
    { name: "Meals", value: 7000 },
    { name: "Supplies", value: 9000 }
  ],
  departmentSpend: [
    { name: "Sales", value: 41000 },
    { name: "Operations", value: 22000 }
  ]
};

export const employeeAnalytics: AnalyticsSnapshot = {
  kpis: [
    { label: "Submitted", value: "18", delta: "+4" },
    { label: "Approved", value: "14", delta: "+3" },
    { label: "Rejected", value: "2", delta: "0" },
    { label: "This month paid", value: "$3.8K", delta: "+11%" }
  ],
  monthlySpend: [
    { month: "Oct", value: 1300 },
    { month: "Nov", value: 900 },
    { month: "Dec", value: 1180 },
    { month: "Jan", value: 1520 },
    { month: "Feb", value: 1820 },
    { month: "Mar", value: 3800 }
  ],
  categorySpend: [
    { name: "Travel", value: 3000 },
    { name: "Meals", value: 420 },
    { name: "Supplies", value: 510 }
  ],
  departmentSpend: [
    { name: "Operations", value: 3930 }
  ]
};
