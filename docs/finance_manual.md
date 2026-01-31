# 📘 The Fintera Financial Guide
*Navigating the Financial Engine of Your Real Estate System*

Welcome to the manual for Fintera's financial core. This guide is designed to demystify how money flows through the system, how contracts behave, and what powers you hold as a user.

---

## 🏛️ Part 1: The Two Pillars of Truth

To understand Fintera, you must distinguish between what *should* happen and what *actually* happens.

### 1. The Payment Schedule ("The Flight Plan") 🗺️
The **Payment Schedule** is the ideal path. It is generated when a contract is created.
- **What it is:** A forecasted list of dates and amounts the client *promised* to pay.
- **Role:** It sets expectations. "On Jan 1st, client pays $500."
- **Is it editable?** Generally, no. It's a generated projection based on the loan terms. However, it *reacts* to reality (e.g., if a client pays off their loan early, future scheduled payments vanish).

### 2. The Financial Ledger ("The Flight Log") 📓
The **Ledger** is the historical truth. It records every single movement of money.
- **What it is:** A strict, immutable list of transactions.
- **Role:** It is the ultimate authority on the Balance. 
- **The Equation:** `Initial Contract Amount - Sum of all Credit Entries = Current Balance`.
- **Entries:** It contains *Debits* (charges, fees) and *Credits* (payments, capital repayments).

> **💡 The Golden Rule:** The *Schedule* tells you if a client is "Up to Date" or "Overdue". The *Ledger* tells you exactly how much money they still owe.

---

## 📖 Part 2: The Financial Dictionary

Key terms that define the mathematics of the system.

| Term | Definition | System Impact |
| :--- | :--- | :--- |
| **Capital (Principal)** | The actual cost of the land/property being financed. | Evaluating this down to zero is the ultimate goal. |
| **Interest** | The cost of borrowing money. | Calculated mostly on the *Wait Time*. It doesn't reduce the debt; it pays for the time. |
| **Cuota (Installment)** | A regular scheduled payment containing both **Capital** + **Interest**. | Paying this keeps the contract "Current". |
| **Abono a Capital** *(Capital Repayment)* | An *extra* payment made directly to reduce the principal, bypassing interest. | **The Superpower:** This shortens the loan term! The system automatically recalculates and removes future installments from the end of the schedule. |
| **Mora (Moratory Interest)** | A penalty fee for late payments. | Prevents the contract from being "Current" until paid. It is an *extra* charge on top of the installment. |
| **Reserve** | A "holding fee" to take a lot off the market temporarily. | Usually deducted from the final Contract Value. |
| **Down Payment (Prima)** | The initial "good faith" payment. | Drastically reduces the financed amount before the schedule even begins. |

---

## ⚙️ Part 3: Cause & Effect

How your actions ripple through the system.

### 🟢 When a Regular Payment is made:
1.  **Schedule Update:** The specific installment (e.g., "Jan Payment") is marked as `PAID`.
2.  **Ledger Entry:** A `CREDIT` entry is created for the payment amount.
3.  **Balance Update:** The contract balance decreases.
4.  **Status Change:** If the client was "Overdue" and this covers the debt, they become "Current".

### 🚀 When a Capital Repayment (Abono) is made:
1.  **Ledger Entry:** A `PREPAYMENT` credit is created.
2.  **Balance Slash:** The balance drops effectively.
3.  **The "Shrink":** The system looks at the remaining debt. Since the debt is lower, fewer installments are needed. The system *deletes* installments from the end of the schedule.
    *   *Example:* You pay $5,000 extra today -> You finish your mortgage 2 years early.

### 🔴 When a Payment is Missed:
1.  **Status Alert:** The contract status flips to `OVERDUE`.
2.  **Mora Accrual:** The system begins calculating daily penalty interest based on the *days past due*.
3.  **Block:** New regular payments might be blocked until the *oldest* debt is settled.

---

## 👮 Part 4: Operations & Permissions

Who holds the keys?

### 👤 The Seller (The Guide)
*Focus: Sales, Relationships, and Visibility*
- **Create:** Can propose new Contracts and reserve Lots.
- **View:** Has full visibility of their clients' Schedules and Ledgers.
- **Initiate:** Can *submit* payment receipts for review.
- **Simulation:** Can calculate "What If" scenarios for financing terms.

### 🛡️ The Admin (The Guardian)
*Focus: Approval, Correction, and Control*
- **Approve:** The only role that can turn a "Proposed" contract into an "Active" one.
- **Verify Payments:** Reviews submitted receipts and marks them as valid `PAID`.
- **Adjust:** Can apply manual *Ledger Adjustments* (e.g., forgiving a small debt, correcting a typo).
- **Override:** Can force-edit dates or statuses in rare exception cases.
- **Capital Repayments:** Authorized to process high-impact Capital Repayments.

---

### 🌟 Summary Checklist for Healthy Contracts
- [ ] **Green Status:** Keep the "Next Payment Date" in the future.
- [ ] **Clean Ledger:** Ensure every physical receipt has a matching Ledger Entry.
- [ ] **Zero Balance Goal:** Every interaction moves the client closer to owning their property.

*Documentation produced by Fintera AI Assistant.*
