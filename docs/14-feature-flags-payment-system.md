# Feature Flags - Payment System

## Overview

The application must support dynamic payment system switching using feature flags.

Booking payments MUST use internal wallet balance only.

Feature flags are only used for:
- deposit flow
- withdraw flow

Admin users must be able to switch between:
- manual verification flow
- payment gateway integration flow

The switching mechanism must be configurable dynamically from the admin panel without redeploying the application.

---

# Core Requirements

## Booking Payment Rules

### Wallet-Based Booking

All villa bookings must use:
- internal wallet balance

Booking flow:
1. User creates booking
2. System validates villa availability
3. System validates wallet balance
4. Wallet balance deducted transactionally
5. Booking status updated
6. Transaction history recorded

Requirements:
- transactional-safe wallet deduction
- rollback handling
- concurrency-safe transactions
- prevent negative balances

Booking payments MUST NOT:
- use manual transfer
- upload payment proof
- use payment gateway directly

---

# Supported Payment Modes

Feature flags apply ONLY for:
- deposit
- withdraw

---

## 1. Manual Verification Mode

Users:
- upload payment proof image
- wait for admin verification

Admins:
- review uploaded evidence
- approve/reject payment manually
- change transaction status

---

## 2. Payment Gateway Mode

System uses automatic payment processing via payment gateway integration.

Features:
- automatic payment confirmation
- webhook verification
- automatic wallet balance updates

---

# Feature Flag Requirements

## Dynamic Feature Flags

Feature flags must:
- be stored in database
- be editable from admin panel
- support real-time updates
- support caching
- support SSR compatibility

Frontend must not hardcode feature flags.

---

# Database Design

## Feature Flags Table

```sql
feature_flags
```

Columns:
- id
- key
- description
- value
- type
- is_active
- created_at
- updated_at

---

## Example Feature Flags

| key | value |
|------|------|
| deposit.manual_verification | true |
| deposit.gateway_enabled | false |
| withdraw.manual_review | true |
| withdraw.gateway_enabled | false |

---

# Payment Receiver Accounts

## Overview

Receiver accounts are used ONLY for:
- manual deposit verification

Receiver accounts MUST NOT be hardcoded.

Admin panel must support:
- create receiver account
- update receiver account
- enable/disable receiver account
- set default receiver account
- assign payment methods

---

## Payment Receiver Accounts Table

```sql
payment_receiver_accounts
```

Columns:
- id
- bank_name
- account_name
- account_number
- payment_type
- qr_image_url
- is_active
- is_default
- created_at
- updated_at

---

# Deposit Flow Rules

## Manual Verification Deposit Flow

1. User creates deposit request
2. User redirected to:
   - /deposit/:transactionId

3. System displays:
   - dynamic receiver account
   - payment instructions
   - QR payment if available

4. User uploads transfer evidence image

5. Transaction status becomes:
   - pending_verification

6. Admin reviews uploaded evidence

7. Admin approves/rejects transaction

8. Wallet balance updated after approval

---

## Gateway Deposit Flow

1. User selects payment method
2. Redirect/payment popup opened
3. Webhook validates payment
4. Wallet balance updated automatically

---

# Withdraw Flow Rules

## Manual Withdraw Review

1. User submits withdraw request
2. Admin reviews request
3. Admin transfers manually
4. Admin updates transaction status

---

## Gateway Withdraw Flow

1. User submits withdraw request
2. Gateway/API processes transfer
3. Webhook confirms transfer
4. Status updated automatically

---

# Upload Requirements

## Evidence Upload

Supported:
- jpg
- jpeg
- png
- webp

Validation:
- file size validation
- mime type validation
- secure upload handling

Storage:
- Supabase Storage

Features:
- image preview
- drag and drop upload
- upload progress indicator

---

# Transaction Status

## Deposit Status

- pending
- pending_verification
- approved
- rejected
- cancelled

---

## Withdraw Status

- pending
- processing
- approved
- rejected
- completed

---

# Admin Panel Requirements

Admin panel must support:

## Feature Flag Management
- enable/disable feature flags
- toggle deposit modes
- toggle withdraw modes
- view active payment mode
- audit configuration changes

---

## Receiver Account Management
- CRUD receiver accounts
- activate/deactivate accounts
- reorder display priority
- upload QR images

---

## Transaction Verification
- view uploaded evidence
- zoom image preview
- approve/reject payment
- add admin notes

---

# Frontend Requirements

Frontend must:
- dynamically react to feature flag changes
- render deposit/withdraw UI conditionally
- support SSR feature flag loading

Examples:
- show upload form if manual deposit enabled
- show gateway payment button if gateway enabled

Booking page must:
- use wallet balance only
- never show manual transfer flow

---

# Security Requirements

## Validation

- validate uploaded files
- validate ownership
- validate transaction amount
- prevent duplicate uploads

---

## Admin Security

- only admins can approve/reject
- admin actions must be logged
- audit trail required

---

# Audit Logging

All feature flag changes must be logged.

Examples:
- who changed flag
- previous value
- new value
- timestamp

Also log:
- transaction approvals
- transaction rejections
- receiver account updates

---

# API Requirements

## Feature Flags API

### Get Feature Flags

```http
GET /api/feature-flags
```

---

### Update Feature Flag

```http
PATCH /api/feature-flags/:id
```

---

# Architecture Rules

- feature flags must use centralized service
- avoid scattered feature flag logic
- feature checks must be reusable
- support future feature flags expansion

---

# Recommended Feature Flag Keys

```text
deposit.manual_verification
deposit.gateway_enabled
withdraw.manual_review
withdraw.gateway_enabled
maintenance_mode
```

---

# Strict Rules

- booking payments must use wallet only
- do not hardcode payment mode
- do not hardcode receiver accounts
- payment behavior must be feature-flag driven
- all feature flags must support SSR
- all admin actions must be logged
- feature flag queries should be cached
- use repository/service architecture only

---
