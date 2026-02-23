# Implementation Plan: Reset Database (Start Fresh Season)

## Objective
Add a mechanism allowing the user to completely erase the application's database (Teams, Tournaments, Players, Games) to start a fresh season. Given the destructive nature of this action, it must be protected by two distinct levels of safety (confirmation).

## Architecture & Location
- **Location:** The "Database Reset" button will be placed inside the `StorageSettings.tsx` modal, under a new "Danger Zone" section at the bottom.
- **Backend (Storage):** The action will utilize the existing `saveData` function from `lib/storage.ts` by passing empty arrays for all domain objects (`{ teams: [], tournaments: [], players: [], games: [] }`), which acts as the `DEFAULT_DATA`.

## Step-by-Step Implementation

### Step 1: Add a "Reset App Data" API in `lib/storage.ts`
Introduce a helper function that resets the database and clears active session states:
1. Export a new `resetDatabase` function.
2. The function will call `saveData({ teams: [], tournaments: [], players: [], games: [] })`.
3. Clear specific `localStorage` keys like `tsm_active_team_id` and `tsm_active_tournament_id` so the app doesn't try to load a deleted team.
4. Call `window.location.reload()` to completely refresh the application state and UI.

### Step 2: Build the UI in `StorageSettings.tsx`
1. Append a **Danger Zone** UI section at the bottom of the `StorageSettings` modal body.
2. Make it visually distinct (e.g., using a red border, pink/red background tint, and warning icons).
3. Add a bright red button labeled: **`⚠️ Erase All Data (Start Fresh)`**.

### Step 3: Implement Safety Level 1 - The Warning Dialog
When the user clicks the "Erase All Data" button:
1. Do *not* delete immediately.
2. Change the local block state (e.g., `isResetting = true`) to reveal the second layer of safety.
3. Display a clear warning message: 
   *"Warning: You are about to permanently erase all Teams, Players, Tournaments, and Games. If you are using a local file, it will be wiped completely. This action CANNOT be undone."*
4. Include a "Cancel" button to easily back out.

### Step 4: Implement Safety Level 2 - The Typed Confirmation
Below the warning message:
1. Add a text input field requiring the user to type a specific confirmation string exactly (e.g., `"RESET"` or `"DELETE"`).
2. The final **`Confirm Erase Data`** button remains disabled (`disabled={true}`) until the input `.toUpperCase()` exactly matches the required string.
3. Once the string matches, the user can click the button.
4. On click, invoke the `resetDatabase()` function created in Step 1.

## Summary of Changes
- **`src/lib/storage.ts`**: Add `resetDatabase()` function to clear data & active session storage.
- **`src/components/ui/StorageSettings.tsx`**: Add `isResetting` and `resetValidationText` states. Add the "Danger Zone" card containing the two-step verification UI.

## Testing Steps
1. Open the "Storage Configuration" modal.
2. Click the "Erase All Data" button (Level 1 triggered).
3. Verify the "Confirm" button is disabled.
4. Type an incorrect string into the validation input. Verify it stays disabled.
5. Type "RESET" (or the exact phrase). Verify the "Confirm" button enables (Level 2 triggered).
6. Click "Confirm". Verify the app reloads and all tables/sidebar are empty.
7. Check the linked Local File or Browser Cache to guarantee it's actually wiped.
