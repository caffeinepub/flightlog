# Specification

## Summary
**Goal:** Fix broken update and delete operations for flight log entries so that editing and removing records works correctly end-to-end.

**Planned changes:**
- Fix the edit/update mutation in the frontend so that submitting the EditFlightEntryModal correctly calls the backend with the entry ID and updated data, and refreshes the table
- Fix the delete operation in the frontend so that confirming the deletion dialog correctly calls the backend and removes the entry from the table
- Audit and fix the backend Motoko actor update and delete functions to correctly locate entries by ID, persist changes or removals, and return proper success/error responses
- Ensure role-based access control is respected for both update and delete operations

**User-visible outcome:** Users can successfully edit and delete flight log entries; changes are immediately reflected in the flight records table with no errors.
