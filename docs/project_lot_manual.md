# 🏗️ The Builder's Guide
*Mastering Fintera's Real Estate Inventory*

Every contract begins with a piece of land. This manual explains how Fintera organizes, values, and manages the physical world within the digital system.

---

## 🌍 Part 1: The Hierarchy of Land

The system organizes inventory in a strict three-tier structure. Think of it like a map zoom level.

### 1. The Project ("The Kingdom") 🏰
The top-level container.
- **What it is:** A residential complex, apartment building, or commercial zone.
- **Key Attributes:**
    - **Base Price/m²:** The default value key for all land inside.
    - **Locations:** The geographical coordinates for the master map.
    - **Amenities:** Features that sell the lifestyle (Pool, Gym, Security).
- **System Impact:** Settings here trickle down. Changing a Project's status to "Inactive" hides *all* its lots from the sales dashboard.

### 2. The Stage/Block ("The Region") 🗺️
(Often implicit in Lot Numbering, e.g., "Block A", "Stage 2")
- **What it is:** A logical grouping of lots.
- **Role:** Used for phased releases. You might open "Stage 1" for sale while keeping "Stage 2" hidden.

### 3. The Lot ("The Parcel") 📍
The sellable unit. The atomic element of Fintera.
- **What it is:** The specific piece of ground a client buys.
- **The Formula:** `Width x Length = Area`. `Area x Price/m² = Total Value`.
- **Identity:** Defined by a unique combination of `Project + Block + Number`.

---

## 🚦 Part 2: State of the World (Statuses)

A Lot has a lifecycle. Its "Status" determines who can touch it.

| Status | Color Code | Definition | System Behavior |
| :--- | :--- | :--- | :--- |
| **Available** | 🟢 Green | Open for business. | Visible to ALL Sellers. Can be quoted and added to a Contract. |
| **Reserved** | 🟡 Amber | "Dibs" called. | Locked by a specific Seller/Client. *Cannot* be sold to anyone else while in this state. Has a time-to-live (usually 3-7 days). |
| **Sold** | 🔴 Red | Contract Active. | Permanently removed from inventory. Linked to a `Contract ID`. |
| **Blocked** | ⚫ Black | Not for sale. | Used for roads, parks, legal disputes, or strategic holding. |

> **⚠️ The Domino Effect:** Changing a lot from **Available** -> **Sold** triggers the Financial System to generate a *Contract* and a *Payment Schedule*.

---

## 👷 Part 3: Roles & Powers

Who creates the world, and who sells it?

### 🛡️ The Admin (The Architect)
*Focus: Creation, Valuation, and Corrections*
- **Terraforming:** Can create new Projects and bulk-import Lots (via CSV/Excel).
- **Valuation:** detailed control over pricing. Can set specific "Premium" prices for corner lots or lots with views, overriding the Project default.
- **Status Override:** Can force a lot from "Sold" back to "Available" (e.g., if a Contract is cancelled/foreclosed).
- **Master Map:** Can edit the SVG/Image overlay for the interactive map.

### 👤 The Seller (The Explorer)
*Focus: Navigation and Claiming*
- **Real-Time Map:** Can view the "Live" map to see what's green (available) right now.
- **Filtering:** "Show me all lots > 200m² under $50,000."
- **Reservation:** The primary action. A seller clicks "Reserve" to lock a lot for their client, starting the countdown timer.
- **Quoting:** Can generate instant PDF payment plans for any *Available* lot.

---

### 📝 Summary Checklist for Inventory Managers
- [ ] **Accurate Measurements:** Ensure Width/Length match the legal survey.
- [ ] **Price Check:** Verify the `Price/m²` reflects current market value before releasing a Block.
- [ ] **Visuals:** Ensure the Project has high-quality renders uploaded to the `Gallery`.

*Documentation produced by Fintera AI Assistant.*
