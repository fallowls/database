import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Users, Search, Mail, Phone, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Contact = {
  leadId: string;
  firstName: string | null;
  lastName: string | null;
  emailPrimary: string | null;
  titleRaw: string | null;
  companyName: string | null;
  companyDomain: string | null;
  phoneMobile: string | null;
  personCity: string | null;
  personState: string | null;
  personCountry: string | null;
  linkedinPersonUrl: string | null;
};

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data, isLoading } = useQuery<{ contacts: Contact[]; total: number }>({
    queryKey: [`/api/contacts?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`],
  });

  const contactsList = data?.contacts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const getInitials = (first: string | null, last: string | null) => {
    return `${(first || "").charAt(0)}${(last || "").charAt(0)}`.toUpperCase() || "?";
  };

  const getFullName = (first: string | null, last: string | null) => {
    return `${first || ""} ${last || ""}`.trim() || "(unnamed)";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" />
            Contacts
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{total.toLocaleString()} contacts total</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${50 + Math.random() * 50}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : contactsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    No contacts found
                  </td>
                </tr>
              ) : (
                contactsList.map((c) => {
                  const location = [c.personCity, c.personState, c.personCountry].filter(Boolean).join(", ");
                  return (
                    <tr key={c.leadId} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {getInitials(c.firstName, c.lastName)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{getFullName(c.firstName, c.lastName)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {c.emailPrimary ? (
                          <a href={`mailto:${c.emailPrimary}`} className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline">
                            <Mail className="w-3.5 h-3.5" />
                            {c.emailPrimary}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {c.titleRaw ? (
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                            <span className="max-w-[200px] truncate">{c.titleRaw}</span>
                          </div>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {c.companyName ? (
                          <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {c.companyName}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {c.phoneMobile ? (
                          <a href={`tel:${c.phoneMobile}`} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {c.phoneMobile}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {location || "—"}
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
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages} ({total.toLocaleString()} results)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
