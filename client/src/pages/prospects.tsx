import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  UserPlus, Search, Mail, Phone, Briefcase, ChevronLeft, ChevronRight,
  Linkedin, Filter, X, Building2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Prospect = {
  leadId: string;
  firstName: string | null;
  lastName: string | null;
  emailPrimary: string | null;
  titleRaw: string | null;
  titleNormalized: string | null;
  seniorityLevel: string | null;
  departmentPrimary: string | null;
  companyName: string | null;
  companyDomain: string | null;
  phoneMobile: string | null;
  phoneWork: string | null;
  personCity: string | null;
  personState: string | null;
  personCountry: string | null;
  linkedinPersonUrl: string | null;
  industry: string | null;
  source: string | null;
  emailIsValid: boolean | null;
};

export default function Prospects() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    industry: "", seniority: "", source: "", hasEmail: false, hasPhone: false,
  });
  const limit = 25;

  const queryParams = new URLSearchParams();
  queryParams.set("page", String(page));
  queryParams.set("limit", String(limit));
  if (search) queryParams.set("search", search);
  if (filters.industry) queryParams.set("industry", filters.industry);
  if (filters.seniority) queryParams.set("seniority", filters.seniority);
  if (filters.source) queryParams.set("source", filters.source);
  if (filters.hasEmail) queryParams.set("hasEmail", "true");
  if (filters.hasPhone) queryParams.set("hasPhone", "true");

  const { data, isLoading } = useQuery<{ prospects: Prospect[]; total: number }>({
    queryKey: [`/api/prospects?${queryParams.toString()}`],
  });

  const prospects = data?.prospects ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const activeFilterCount = [filters.industry, filters.seniority, filters.source, filters.hasEmail, filters.hasPhone]
    .filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ industry: "", seniority: "", source: "", hasEmail: false, hasPhone: false });
    setPage(1);
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-emerald-500" />
            Prospects
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">{total.toLocaleString()} results</p>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, company, title..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1.5"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-gray-500">
            <X className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Industry</label>
            <Input
              placeholder="e.g. Financial Services"
              value={filters.industry}
              onChange={(e) => { setFilters(f => ({ ...f, industry: e.target.value })); setPage(1); }}
              className="h-9 text-sm bg-gray-50 dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Seniority</label>
            <select
              value={filters.seniority}
              onChange={(e) => { setFilters(f => ({ ...f, seniority: e.target.value })); setPage(1); }}
              className="w-full h-9 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-2 text-gray-900 dark:text-white"
            >
              <option value="">All</option>
              <option value="cxo">CxO</option>
              <option value="vp">VP</option>
              <option value="director">Director</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Source</label>
            <Input
              placeholder="e.g. Lusha"
              value={filters.source}
              onChange={(e) => { setFilters(f => ({ ...f, source: e.target.value })); setPage(1); }}
              className="h-9 text-sm bg-gray-50 dark:bg-gray-900"
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox" checked={filters.hasEmail}
                onChange={(e) => { setFilters(f => ({ ...f, hasEmail: e.target.checked })); setPage(1); }}
                className="rounded"
              />
              Has Email
            </label>
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox" checked={filters.hasPhone}
                onChange={(e) => { setFilters(f => ({ ...f, hasPhone: e.target.checked })); setPage(1); }}
                className="rounded"
              />
              Has Phone
            </label>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title / Seniority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${40 + Math.random() * 50}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : prospects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-500">
                    No prospects found
                  </td>
                </tr>
              ) : (
                prospects.map((p) => {
                  const fullName = `${p.firstName || ""} ${p.lastName || ""}`.trim() || "(unnamed)";
                  const initials = `${(p.firstName || "").charAt(0)}${(p.lastName || "").charAt(0)}`.toUpperCase() || "?";
                  const location = [p.personCity, p.personState, p.personCountry].filter(Boolean).join(", ");
                  const seniority = p.seniorityLevel;

                  return (
                    <tr key={p.leadId} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">{initials}</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                          {p.titleRaw || "—"}
                        </div>
                        {seniority && (
                          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded uppercase mt-0.5 ${seniority.toLowerCase() === "cxo" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" :
                              seniority.toLowerCase() === "vp" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" :
                                seniority.toLowerCase() === "director" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                                  "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            }`}>
                            {seniority}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.companyName ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{p.companyName}</span>
                          </div>
                        ) : <span className="text-sm text-gray-400">—</span>}
                        {p.industry && (
                          <span className="text-[10px] text-gray-400 block mt-0.5 truncate max-w-[150px]">{p.industry}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {p.emailPrimary ? (
                          <div className="flex items-center gap-1.5">
                            <Mail className={`w-3.5 h-3.5 flex-shrink-0 ${p.emailIsValid ? "text-emerald-500" : "text-gray-400"}`} />
                            <a href={`mailto:${p.emailPrimary}`} className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[180px]">
                              {p.emailPrimary}
                            </a>
                          </div>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {p.phoneMobile ? (
                          <a href={`tel:${p.phoneMobile}`} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{p.phoneMobile}</span>
                          </a>
                        ) : p.phoneWork ? (
                          <a href={`tel:${p.phoneWork}`} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{p.phoneWork}</span>
                          </a>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 truncate max-w-[120px]">
                        {location || "—"}
                      </td>
                      <td className="px-4 py-2">
                        {p.linkedinPersonUrl && (
                          <a href={p.linkedinPersonUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                            <Linkedin className="w-4 h-4 text-sky-500 hover:text-sky-600" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages.toLocaleString()} · {total.toLocaleString()} results
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page <= 1}>First</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-500 px-2">{page}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>Last</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
