---
applyTo: "____NOTHING____"
---

# Summary

The goal of this app is to use Plaid to aggregate financial transactions from the user's connected accounts, store them in a database, and provide a simple interface to view and export the transactions.

The tech stack includes:

- Frontend: Next.js (app router)
- Backend: Next.js API routes
- Database: PostgreSQL with Drizzle ORM (PostgreSQL in local dev, Neon in production)
- Authentication: better-auth
- Deployment Target: Vercel

## Additional Details

- A user should be able to sign up, log in, and log out.
- A user should be able to log in with Google, Github, or email/password.
- A user should be able to connect their bank account(s) and/or credit card(s) using Plaid Link.
- A user should be able to remove a connected account. If a connected account is removed, all transactions associated with that account should also be deleted.
- A user should be able to manually sync transactions from their connected accounts. This should fetch new transactions from Plaid and store them in the database.
- A user should be able to configure automatic syncing of transactions on a per account basis, including how often the sync job runs. This should be handled by a background job.
- A user should be able to cancel automatic syncing.
- For a given account, a user should be able to view a list of their transactions, including details such as date, amount, description, vendor, and category. Transactions should be displayed in a table format with sortable columns. The table should support pagination to handle large numbers of transactions. It _should not_ use infinite scrolling. Pagination should extend to the server side to avoid loading all transactions at once.
- A user should be able to filter transactions by date range, amount range, vendor, and category.
- A user should be able to search transactions by description.
- All filtering and searching should be combinable, e.g. a user could filter by date range and category, and then search within those results.
- All sorting, filtering, and searching should be compatible with pagination and handled on the server side.
- A user should be able to export their transactions to a CSV or JSON file. The export should respect any filters or searches the user has applied, so they can export a specific subset of their transactions. All pages of results should be included in the export, not just the current page.
- The export should be generated on the server side to handle large datasets efficiently. The export process should be asynchronous and the CSV/JSON file should be emailed to the user when ready.
- A user should be able to configure scheduled exports, including the frequency (e.g. daily, weekly, monthly), format (CSV or JSON), and filters (e.g. only export transactions from the last week in the "Food" category).
- A user should be able to cancel scheduled exports.
