---
description: Ensure data integrity during import and storage operations
---
# Data Integrity & Import Workflow

This workflow describes the robust process for importing external data into The Stats Machine, ensuring persistence across browser reloads and storage drivers.

## Import Process Steps

1. **Validation**: Check if the incoming JSON follows the `AppData` structure.
   - Ensure `teams`, `tournaments`, `players`, and `games` are arrays.
   - Fail early if no teams are present.

2. **Driver Switching**: Always force the `LocalStorageDriver` during an import operation.
   - This prevents issues with file handles that might have expired or lost write permissions.

3. **Atomic Save**: Save the validated data directly to the `STORAGE_KEY`.
   - Use `storageManager.save(data)`.

4. **Persistence Verification**: 
   - Immediately after saving, perform a raw `localStorage.getItem(STORAGE_KEY)` check.
   - Verify that the returned string is not empty or just `{}`.

5. **State Synchronization**:
   - Update the React context/state with `setData(validData)`.

6. **Full App Reset**:
   - Use `window.location.reload()` to clear all intermediate memory states and force the `useEffect` initialization to read the fresh data from storage.

## Key Considerations

- **Race Conditions**: Avoid multiple parallel state updates for mission-critical data.
- **Batching**: React's state batching can sometimes hide the true state during the render cycle where the import happens. Reloading is the safest "Next Step".
- **User Feedback**: Always provide an alert with the count of imported items before the reload occurs.
