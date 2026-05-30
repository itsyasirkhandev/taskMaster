# 1. Journals as a Root Collection

Date: 2026-05-30

## Status

Accepted

## Context

We are introducing a new "Journal" feature, allowing users to create text entries. Existing user data (like "Tasks" and "Settings") is stored as subcollections under the `users/{userId}/` document. During the planning phase, we needed to decide whether to place Journals in a subcollection (matching Tasks) or a root-level collection.

## Decision

We will store Journals in a root-level `/journals` collection, rather than a `users/{userId}/journals` subcollection, per explicit user request.

## Consequences

- **Pros**: It allows easier global querying of Journals if we ever need a global feed or aggregate analytics across all users without using a collection group query.
- **Cons**: It breaks consistency with the existing data model (Tasks). It also means that to delete all data for a user, we must query and delete from multiple root collections rather than just deleting everything under their user document.
