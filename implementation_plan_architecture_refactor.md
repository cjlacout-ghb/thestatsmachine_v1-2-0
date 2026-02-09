# Implementation Plan: Restructuring "The Stats Machine"

## Objective
Refactor the application's navigation and visual hierarchy to clearly separate **Entity Management (Organization)** from **Activity Management (Events)**. This aligns the user interface with the mental model of *setting up who is playing* versus *managing the actual games*.

---

## 1. Structural Comparison

### Current Structure (Linear/Mixed)
- **Step 1**: Team Selection (Hub)
- **Step 2**: Roster (Players) - *Implicitly treated as a step before events*
- **Step 3**: Events (Tournaments)
- **Step 4**: Games (Data)

### Proposed Structure (Categorized)
The application will be divided into two distinct conceptual zones once a Team is selected:

#### **Zone A: ORGANIZATION (Entities)**
*Focus: Long-term data that persists across seasons.*
1. **Team Dashboard**: High-level overview.
2. **Roster (Players)**: Management of athletes (The "Who").

#### **Zone B: EVENTS (Activities)**
*Focus: Time-bound competitions and performance data.*
1. **Tournaments**: List of events or seasons.
2. **Games**: The specific matches within a selected tournament.

---

## 2. Navigation & Menu Changes

### A. New Navigation Architecture (Sidebar or Split Header)
Instead of a simple flat tab list, we will introduce a **Sectioned Navigation** when a team is active.

**Visual Layout:**
```text
[Header: "The Stats Machine" | Active Team: Red Dragons]

[ LEFT PANEL / TABS ]
SECTION: ORGANIZATION
  - 🏠 Overview (Team Dashboard)
  - 👥 Roster (Players)

SECTION: EVENTS
  - 🏆 Tournaments & Games (Entry point to Events)
```

### B. Interaction Flow
1. **Hub**: User selects a Team.
2. **Team View**:
   - Default lands on **Overview**.
   - User clicks **Roster** to add/edit players.
   - User clicks **Tournaments** to see the list of events.
3. **Event Drill-Down**:
   - Selecting a Tournament does *not* obscure the Organization menu entirely, but focuses the main view on that Tournament.
   - **Breadcrumb**: Team > Events > [Spring Championship]
   - **Sub-navigation for Event**: "Games" | "Stats/Report"

### C. Updated Hierarchy Stepper
Refactor the generic stepper 1-2-3-4 into a **Context Indicator**:
- State: **Organization View** (Managing Team/Players)
- State: **Event View** (Managing Games for a specific Tournament)

---

## 3. Data Model Implications
*No schema changes are required.* The recent refactor already supports this:
- **Teams** hold **Players** (Organization Level).
- **Teams** hold **Tournaments** (Event Level).
- **Tournaments** hold **Games** (Activity Level).

We just need to ensure the UI strictly respects these boundaries.

---

## 4. Impact on User Workflows

| Action | Old Workflow | New Workflow |
| :--- | :--- | :--- |
| **Add Player** | Step 2 (Roster) | **Organization** Section > **Roster** |
| **New Tournament** | Step 3 (Events) | **Events** Section > **+ New Event** |
| **Log Game** | Step 4 -> Games | **Events** > Select Tourney > **Games** |
| **View Stats** | Mixed | **Events** > Select Tourney > **Stats** (Scoped) |

## 5. Implementation Steps
1. **Refactor App.tsx Navigation**:
   - Remove the linear `activeTab` switching that mixes levels.
   - Introduce a `viewMode` state: `'ORGANIZATION'` or `'EVENT'`.
2. **Create `Sidebar` or `SectionedNav` Component**:
   - Visually group tabs under "Organization" and "Events" headers.
3. **Update `HierarchyStepper`**:
   - Change to a breadcrumb or simpler Context Switcher.
4. **Refine `TournamentsTab`**:
   - Ensure clicking a tournament enters the `'EVENT'` viewMode.
