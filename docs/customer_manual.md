# 📱 Your Digital Wallet
*The Official Guide to the Fintera Customer App*

This isn't just a website. It's the control center for your property investment. Here is precisely what you can do.

---

## 🟢 The Main Heads-Up Display (Hero Section)
At the very top of your screen is your financial pulse.

*   **"Balance" Card**: This big number isn't just what you owe—it's your target.
    *   **Action:** None needed. It updates in real-time as your scheduled payments clear.
    *   **Status Indicators:** Look for the small pill status (e.g., `APPROVED`, `PENDING`). This tells you if the system is happy with your latest inputs.

---

## ⚡ Quick Actions

### 1. The "Next Payment" Radar 📡
*Found in the `NextPaymentCard` component.*

*   **What it shows:** The exact amount needed to keep your account "Green" for the upcoming month.
*   **The Math:** `Installment + Overdue Interest (if any)`.
*   **Why it matters:** Paying *this* exact amount prevents "Mora" (Late Fees) from triggering.

### 2. The Statistics Bar 📊
*Found in the `StatsOverview` component.*

*   **Progress Bar:** A visual percentage `(Total Paid / Contract Value)`.
    *   **Goal:** Watch this fill from left to right.
*   **The Splits:**
    *   **Total Paid:** Cash you have successfully transferred.
    *   **Contract Amount:** The total value of the land.

---

## 📸 The Action: Uploading a Receipt
*Found in the `TimelinePaymentCard` component.*

This is your primary job. When you make a bank transfer, you must tell the system.

**Step-by-Step Guide:**
1.  **Scroll** down to the "Payment Timeline".
2.  **Find** the card with the `PENDING` (Amber) status.
3.  **Click** the **"Upload Receipt"** button (or the Camera icon on mobile).
4.  **Select** the photo/screenshot of your bank transfer.
5.  **Confirm:** The system will upload it securely.

> **✨ Magic Moment:** Once uploaded, the status changes to `SUBMITTED`. An admin will review it, and once approved, your Balance drops instantly.

---

## 📅 The Time Machine (Timeline)
The list of cards isn't just history; it's a living record.

*   **Green Dot (Paid):** You're safe. This month is closed.
*   **Amber Dot (Pending):** Money is expected.
*   **Red Dot (Overdue):** Action required immediately. Upload a receipt ASAP to stop the Mora counter.

---

### 💡 Pro Tip for Mobile Users
Look for the **Floating Action Button (FAB)** in the bottom right corner.
*   It looks like a `+` or a specific payment icon.
*   **One Tap:** It opens the "Upload" camera immediately, skipping the need to scroll through history. Use this for speed!

*Documentation produced by Fintera AI Assistant.*
