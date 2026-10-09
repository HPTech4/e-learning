import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ArrowRight,
  BookOpen,
  Download,
  GraduationCap,
} from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { getSchools } from "../lib/queries";
import { SchoolCard } from "../components/SchoolCard";
import { Button } from "../components/ui/Button";

export default function Home() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const { data: schools, isLoading } = useQuery({
    queryKey: ["schools"],
    queryFn: getSchools,
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium mb-5">
            <GraduationCap size={14} />
            Federal University of Technology, Minna
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Course materials,
            <br className="hidden sm:block" />
            <span className="text-brand-600"> organized by level.</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-8">
            Browse your school, pick your department, jump to your level, and
            download the materials you need.
          </p>

          <form onSubmit={onSubmit} className="max-w-lg mx-auto">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by course code or title (e.g. CSC 101)"
                className="w-full pl-12 pr-32 py-4 text-sm sm:text-base rounded-xl border border-gray-200 bg-white shadow-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 outline-none transition"
              />
              <Button
                type="submit"
                size="md"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-gray-500">
            <span className="inline-flex items-center gap-2">
              <BookOpen size={16} className="text-brand-500" />9 Schools
            </span>
            <span className="inline-flex items-center gap-2">
              <Download size={16} className="text-brand-500" />
              Free downloads
            </span>
            <span className="inline-flex items-center gap-2">
              <GraduationCap size={16} className="text-brand-500" />
              100 – 500 Level
            </span>
          </div>
        </div>
      </section>

      {/* Schools preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Browse by school
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Pick your school to see its departments.
            </p>
          </div>
          <Link
            to="/browse"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools?.slice(0, 6).map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        )}

        <div className="sm:hidden mt-6 text-center">
          <Link
            to="/browse"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600"
          >
            View all schools
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
