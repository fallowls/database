import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Building2, Search, Globe, ChevronLeft, ChevronRight,
  Users, DollarSign, Calendar, MapPin, Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Company = {
  companyId: string;
  companyName: string | null;
  companyDomain: string | null;
  companyWebsite: string | null;
  companyLinkedinUrl: string | null;
  industry: string | null;
  subIndustry: string | null;
  employeeCount: number | null;
  revenue: number | null;
  yearFounded: number | null;
  companyCity: string | null;
  companyState: string | null;
  companyCountry: string | null;
  totalFunding: number | null;
  accountStage: string | null;
  logoUrl: string | null;
  companyDescription: string | null;
};

function formatRevenue(val: number | null) {
  if (!val) return "—";
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(0)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

function formatFunding(val: number | null) {
  if (!val) return null;
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(0)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

export default function Companies() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [industry, setIndustry] = useState("");
  const limit = 25;

  const queryParams = new URLSearchParams();
  queryParams.set("page", String(page));
  queryParams.set("limit", String(limit));
  if (search) queryParams.set("search", search);
  if (industry) queryParams.set("industry", industry);

  const { data, isLoading } = useQuery<{ companies: Company[]; total: number }>({
    queryKey: [`/api/companies?${queryParams.toString()}`],
  });

  const companies = data?.companies ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-500" />
            Companies
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">{total.toLocaleString()} companies</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, domain, industry..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
        <div className="relative max-w-xs">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Filter by industry..."
            value={industry}
            onChange={(e) => { setIndustry(e.target.value); setPage(1); }}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Industry</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employees</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Funding</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Founded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-500">No companies found</td>
                </tr>
              ) : (
                companies.map((c) => {
                  const location = [c.companyCity, c.companyState, c.companyCountry].filter(Boolean).join(", ");
                  const funding = formatFunding(c.totalFunding);

                  return (
                    <tr key={c.companyId} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {c.logoUrl ? (
                            <img src={c.logoUrl} alt="" className="w-8 h-8 rounded-lg object-contain bg-gray-50 dark:bg-gray-700 flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-white">
                                {(c.companyName || "?").charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm block">{c.companyName || "(unnamed)"}</span>
                            {c.companyDomain && (
                              <a href={`https://${c.companyDomain}`} target="_blank" rel="noopener"
                                className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5">
                                <Globe className="w-3 h-3" />{c.companyDomain}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {c.industry ? (
                          <div>
                            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                              {c.industry}
                            </span>
                            {c.subIndustry && (
                              <span className="text-[10px] text-gray-400 block mt-0.5 truncate max-w-[150px]">{c.subIndustry}</span>
                            )}
                          </div>
                        ) : <span className="text-sm text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {location ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[140px]">{location}</span>
                          </div>
                        ) : <span className="text-sm text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {c.employeeCount ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            {c.employeeCount.toLocaleString()}
                          </div>
                        ) : <span className="text-sm text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formatRevenue(c.revenue)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {funding ? (
                          <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            {funding}
                          </div>
                        ) : <span className="text-sm text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {c.yearFounded ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {c.yearFounded}
                          </div>
                        ) : <span className="text-sm text-gray-400">—</span>}
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
              Page {page} of {totalPages.toLocaleString()} · {total.toLocaleString()} companies
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
