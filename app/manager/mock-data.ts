export const USE_MOCK = true;

export type MockManagerRequest = {
  id: string;
  employee: string;
  amount: number;
  category: string;
  status: string;
  receipt_url: string | null;
  risk_score: number;
  ai_suggestion: "Approve" | "Reject" | "Flag for review";
  duplicate_flag: boolean;
  vendor: string;
  description: string;
  expense_date: string;
  submitted_at: string;
  ocr_confidence: number;
  user_data: {
    merchant: string;
    date: string;
    amount: string;
    category: string;
  };
  ocr_data: {
    merchant: string;
    date: string;
    amount: string;
    category: string;
  };
  history: Array<{
    id: string;
    vendor: string;
    amount: number;
    status: string;
    expenseDate: string;
  }>;
};

const mockRequests: MockManagerRequest[] = [
  {
    id: "mc_001",
    employee: "Nina Patel",
    amount: 420,
    category: "Travel",
    status: "Pending Manager Approval",
    receipt_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
    risk_score: 0.22,
    ai_suggestion: "Approve",
    duplicate_flag: false,
    vendor: "Skyline Cabs",
    description: "Airport transfer after client meeting",
    expense_date: "2026-03-24",
    submitted_at: "2026-03-25",
    ocr_confidence: 0.92,
    user_data: {
      merchant: "Skyline Cabs",
      date: "2026-03-24",
      amount: "USD 420",
      category: "Travel"
    },
    ocr_data: {
      merchant: "Skyline Cabs",
      date: "2026-03-24",
      amount: "USD 420",
      category: "Travel"
    },
    history: [
      { id: "h_001", vendor: "Metro Rail", amount: 96, status: "Approved", expenseDate: "2026-03-10" },
      { id: "h_002", vendor: "Airport Shuttle", amount: 160, status: "Approved", expenseDate: "2026-03-02" }
    ]
  },
  {
    id: "mc_002",
    employee: "Marcus Chen",
    amount: 1890,
    category: "Meals",
    status: "Pending Manager Approval",
    receipt_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    risk_score: 0.68,
    ai_suggestion: "Flag for review",
    duplicate_flag: true,
    vendor: "Luna Bistro",
    description: "Team dinner during partner workshop",
    expense_date: "2026-03-23",
    submitted_at: "2026-03-23",
    ocr_confidence: 0.74,
    user_data: {
      merchant: "Luna Bistro",
      date: "2026-03-23",
      amount: "USD 1,890",
      category: "Meals"
    },
    ocr_data: {
      merchant: "Luna B1stro",
      date: "2026-03-23",
      amount: "USD 1,890",
      category: "Meals"
    },
    history: [
      { id: "h_003", vendor: "North Fork Kitchen", amount: 820, status: "Approved", expenseDate: "2026-03-05" },
      { id: "h_004", vendor: "Luna Bistro", amount: 1890, status: "Approved", expenseDate: "2026-03-23" }
    ]
  },
  {
    id: "mc_003",
    employee: "Ariana Blake",
    amount: 6400,
    category: "Hotel",
    status: "Pending Manager Approval",
    receipt_url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80",
    risk_score: 0.87,
    ai_suggestion: "Reject",
    duplicate_flag: false,
    vendor: "Harbor Grand",
    description: "Conference hotel block with incidental charges",
    expense_date: "2026-03-22",
    submitted_at: "2026-03-23",
    ocr_confidence: 0.81,
    user_data: {
      merchant: "Harbor Grand",
      date: "2026-03-22",
      amount: "USD 6,400",
      category: "Hotel"
    },
    ocr_data: {
      merchant: "Harbor Grand",
      date: "2026-03-22",
      amount: "USD 6,380",
      category: "Hotel"
    },
    history: [
      { id: "h_005", vendor: "Riverview Suites", amount: 3200, status: "Approved", expenseDate: "2026-02-17" },
      { id: "h_006", vendor: "Urban Stay", amount: 2850, status: "Rejected", expenseDate: "2026-01-28" }
    ]
  }
];

function cloneRequests() {
  return mockRequests.map((request) => ({
    ...request,
    user_data: { ...request.user_data },
    ocr_data: { ...request.ocr_data },
    history: request.history.map((item) => ({ ...item }))
  }));
}

let managerRequestsStore = cloneRequests();

export async function getRequests() {
  if (USE_MOCK) {
    return cloneRequestsFromStore();
  }

  const response = await fetch("/manager/requests", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load manager requests.");
  }
  return response.json();
}

export async function approveRequest(id: string) {
  if (USE_MOCK) {
    managerRequestsStore = managerRequestsStore.map((request) =>
      request.id === id ? { ...request, status: "Approved", ai_suggestion: "Approve" } : request
    );
    return cloneRequestsFromStore().find((request) => request.id === id) ?? null;
  }

  const response = await fetch("/manager/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  if (!response.ok) {
    throw new Error("Could not approve request.");
  }
  return response.json();
}

export async function rejectRequest(id: string) {
  if (USE_MOCK) {
    managerRequestsStore = managerRequestsStore.map((request) =>
      request.id === id ? { ...request, status: "Rejected", ai_suggestion: "Reject" } : request
    );
    return cloneRequestsFromStore().find((request) => request.id === id) ?? null;
  }

  const response = await fetch("/manager/reject", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  if (!response.ok) {
    throw new Error("Could not reject request.");
  }
  return response.json();
}

function cloneRequestsFromStore() {
  return managerRequestsStore.map((request) => ({
    ...request,
    user_data: { ...request.user_data },
    ocr_data: { ...request.ocr_data },
    history: request.history.map((item) => ({ ...item }))
  }));
}
