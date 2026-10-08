
# FUT Minna E-Library

A lightweight digital library for **Federal University of Technology, Minna**. Students browse by School → Department → Level, search by course code, and download lecture materials. Admins upload and manage everything from a protected dashboard.

No student accounts. No login walls. Just open, search, download.

---

## Features

### For Students (no login required)
- Browse all 9 schools and their departments
- Drill down: School → Department → Level (100–500)
- Search across the entire library by course code or course title
- Download materials with one tap
- Fully responsive — built mobile-first

### For Admins (login required)
- Secure email + password login
- Upload materials with school, department, level, course code, and title
- Manage and delete existing materials
- Dashboard with live stats:
  - Total materials & downloads
  - Uploads this week
  - Materials and downloads grouped by school
  - Level distribution (100–500)
  - Top downloaded materials
  - Department activity table

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Data fetching | TanStack Query (React Query) |
| Charts | Recharts |
| Icons | lucide-react |
| Backend / DB | Supabase (Postgres + Storage + Auth) |
| Hosting | Vercel |

---

## Project Structure
