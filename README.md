# FUT Minna E-Library

A digital library for **Federal University of Technology, Minna**. Students browse by School → Department → Level, search by course code or title, and download lecture materials. Admins upload and manage everything from a protected dashboard.

**No student accounts. No login walls. Open, search, download.**

---

## Live

🔗 **[futminna-elibrary.vercel.app](https://futminna-elibrary.vercel.app)** *(replace with your URL)*

---

## Features

### For students (no login)
- Browse 9 schools and their departments
- Navigate School → Department → Level (100–500)
- Search by course code or course title across the entire library
- One-tap downloads
- Mobile-first responsive design

### For admins (login required)
- Secure email + password authentication
- Upload files with cascading selectors (School → Department → Level)
- Manage and delete materials with filters
- Dashboard with:
  - Stat cards: total materials, downloads, active departments, weekly uploads, most downloaded
  - Recharts bar charts: materials by school, downloads by school
  - Level distribution (toggle materials/downloads)
  - Top 10 downloaded materials
  - Recent 8 uploads
  - Sortable department activity table

---

## Tech Stack

- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS v4
- **Routing:** React Router v6
- **Data:** TanStack Query (React Query)
- **Charts:** Recharts
- **Icons:** lucide-react
- **Backend:** Supabase (Postgres + Storage + Auth)
- **Hosting:** Vercel

---

## Screenshots

### Student side
![Home](./public/screenshots/home.png)
![Browse](./public/screenshots/browse.png)
![Level page](./public/screenshots/level.png)

### Admin side
![Dashboard](./public/screenshots/dashboard.png)
![Upload](./public/screenshots/upload.png)

---

## Project Structure
src/
├── components/
│ ├── ui/ Button, Card, Spinner, EmptyState, Skeleton
│ ├── layout/ Header, Footer, Layout
│ └── admin/ AdminLayout, StatCard, ChartCard, DeleteConfirm
├── pages/
│ ├── Home, Browse, SchoolPage, DepartmentPage, LevelPage, SearchResults
│ └── admin/ Login, Dashboard, Upload, Materials
├── lib/ supabase, queries, dashboard, utils
├── hooks/ useAuth, useDebounce, usePageTitle
├── routes/ ProtectedRoute
└── types/ database

text

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/futminna-elibrary.git
cd futminna-elibrary
npm install