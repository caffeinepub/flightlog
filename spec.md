# Specification

## Summary
**Goal:** Fix the update, edit, and delete operations for flight log entries so they work correctly end-to-end.

**Planned changes:**
- Fix the `updateFlightEntry` Motoko backend function to correctly persist and return updated flight entries
- Fix the `deleteFlightEntry` Motoko backend function to correctly remove entries from storage
- Fix the `useEditFlightEntry` frontend mutation hook to properly serialize fields, call the backend, and invalidate the query cache on success
- Fix the delete mutation hook and confirmation dialog in `FlightRecordsTable` to correctly call the backend delete function and update the displayed table
- Add success and error toast notifications for both update and delete operations

**User-visible outcome:** Users can edit and delete flight log entries; changes are immediately reflected in the records table with appropriate success or error notifications.
