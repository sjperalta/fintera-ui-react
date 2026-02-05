# 🛡️ The Guardian's Protocol
*System Administration, Control, and the Truth of the Ledger*

You are the final authority. While Sellers propose and Clients promise, you decide what is *true*. This role requires caution: your actions rewrite the financial reality of the company.

---

## 🏛️ Part 1: The Gatekeeper (Approvals)

Nothing becomes "Real" until you say so. You stand between the proposal and the official record.

### 1. Contract Approval 📝
*   **Trigger:** A Seller submits a signed deal. Status is `Waiting for Approval`.
*   **Your Job:**
    1.  **Verify Documents:** Are the ID and Proof of Address legible?
    2.  **Check Terms:** Does the Down Payment match the receipt?
    3.  **Action:** Click **"Approve"**.
*   **System Effect:** The lot turns **Red (Sold)**. The Payment Schedule is generated. The Client receives their Welcome Email.

### 2. Payment Verification 💵
*   **Trigger:** A Client/Seller uploads a receipt for a Pending payment. Status is `Submitted`.
*   **Your Job:**
    1.  **Bank Check:** Open your bank portal. Did the money actually hit the account?
    2.  **Match:** Does the amount match the receipt exactly?
    3.  **Action:** Click **"Verify Payment"**.
*   **System Effect:** The Ledger is updated. The status turns `PAID`. The Balance drops.

---

## 🏗️ Part 2: The Architect (Inventory)

You define the world that Sellers sell.

### 1. Creating Projects
*   **Definition:** Setting the rules (Interest Rate, Default Pricing).
*   **Impact:** Changing the "Base Price" here updates *every unsold lot* in the project. Use with extreme care.

### 2. Managing Lots
Sometimes a lot isn't for sale.
*   **Blocking:** Select a lot and set status to `BLOCKED`. Use this for legal disputes, reserved-for-friends, or strategic holding.
*   **Pricing Overrides:** You can set a specific lot to have a *higher* price than its neighbors (e.g., corner lots).

---

## ⚖️ Part 3: The Judge (Exceptions)

Real life is messy. You have the tools to fix it, but every tool leaves a mark.

### 1. Ledger Adjustments (The Eraser)
*   **Scenario:** A cashier made a mistake, or a small debt ($0.50) needs to be forgiven.
*   **Action:** Create a manual "Credit" or "Debit" note.
*   **Warning:** This is permanent. ALways add a "Comment" explaining *why* you did it.

### 2. The Status Rollback (Foreclosure)
*   **Scenario:** A client has stopped paying. The deal is dead.
*   **Action:** Cancel the Contract.
*   **System Effect:**
    1.  The Contract is archived (Status `CANCELLED`).
    2.  The Lot returns to **Green (Available)** immediately.
    3.  The "Wallet" of payments made is preserved for legal record, but the debt is gone.

---

## 🦅 Part 4: The Report (Intelligence)

The Dashboard gives you the "God View" of the business.

### Key Metrics to Watch:
*   **Project Health:** Total Sold vs. Total Available. (Are we selling fast enough?)
*   **Mora Index:** What % of our portfolio is overdue? (If this spikes, the Sellers aren't doing their job).
*   **Cash Flow:** Total collected *this month*.

---

## ⚡ Golden Rules for Admins

1.  **Trust, but Verify:** Never approve a payment based on a screenshot alone. Check the bank.
2.  **The Ledger is Sacred:** Never delete a payment record. If it was wrong, add a *negative* adjustment to correct it. History must be preserved.
3.  **No "Backdoor" Deals:** If a lot is sold, it *must* have a contract in the system. No verbal holds.

*- Documentation produced by Fintera AI Assistant.*
