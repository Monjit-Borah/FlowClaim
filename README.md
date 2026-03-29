# ClaimFlow AI

ClaimFlow AI is a premium reimbursement management platform built with Next.js, TypeScript, Tailwind CSS, Prisma, live session auth, receipt uploads, OCR extraction, approval workflows, policy checks, fraud checks, notifications, audit logs, analytics, and payout tracking.

## Local live setup

```bash
npm install
npm run prisma:generate
npm run seed
npm run dev
```

Seeded logins:

- `ariana@northstar.ai` / `password123`
- `marcus@northstar.ai` / `password123`
- `nina@northstar.ai` / `password123`

## Included live features

- company creation on signup
- live login/logout with cookie sessions
- role-based access
- live company onboarding with country and currency lookup
- claim drafting and persistence
- receipt upload to local filesystem
- OCR processing with Tesseract.js
- live policy validation
- live fraud checks
- live workflow attachment and approval request creation
- manager approval actions
- notifications and audit logging
- payout queue and mark-as-paid flow
- dashboard analytics from persisted claim data

## External APIs used

- Country/currency source: `https://restcountries.com/v3.1/all?fields=name,currencies`
- Exchange rates: `https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}`

## Production deployment upgrades recommended

The current codebase runs as a live local system. For a cloud production deployment, replace the local adapters with these services:

- PostgreSQL: replace the current local SQLite datasource with a hosted PostgreSQL `DATABASE_URL`
- Object storage: replace local `public/uploads` storage with S3, Cloudinary, or Supabase Storage
- OCR at scale: replace local Tesseract with AWS Textract, Google Document AI, or Azure Form Recognizer for better extraction quality
- Email or push notifications: add Resend, Postmark, or SendGrid for outbound approval and payout messages

## Main app routes

- `/login`
- `/signup`
- `/onboarding`
- `/app/admin`
- `/app/manager`
- `/app/employee`
# FlowClaim
