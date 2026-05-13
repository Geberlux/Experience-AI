# Security Specification - Experience Gamer Store

## Data Invariants
1. A user can only access their own orders.
2. Only admins can create, update, or delete products.
3. Products must have a valid price and category.
4. Users cannot change their own roles (must be set by an admin or system).
5. Contact submissions are write-only for clients (or read for admins).

## The Dirty Dozen (Attack Vectors)
1. User A tries to read User B's orders. -> Denied (Owner check)
2. Guest tries to create a product. -> Denied (Admin check)
3. User tries to set their role to 'admin' during registration. -> Denied (Schema validation & field restriction)
4. Admin ID spoofing (User A tries to write to User A's profile with a "role: admin" update). -> Denied (Affected keys gate)
5. Injecting a 2MB string into a product name. -> Denied (Size enforcement)
6. Deleting a terminal order (paid/shipped). -> Denied (Terminal state locking)
7. Query scraping (trying to list all personas). -> Denied (Secure list query)
8. Bypassing schema by sending an object as a price. -> Denied (Type safety)
9. Orphaned write (creating an order for a non-existent user). -> Denied (Existence check)
10. Spoofing timestamps (setting createdAt to the past). -> Denied (Server timestamp check)
11. ID Poisoning (using a massive junk string as a productId). -> Denied (isValidId gate)
12. Email spoofing with unverified email. -> Denied (email_verified check)

## Test Plan
- Run ESLint security rules plugin.
- Manual verification of each gate.
