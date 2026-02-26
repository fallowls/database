import { useQuery } from "@tanstack/react-query";
import { Users, Building2, Mail, Phone, Linkedin, TrendingUp, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

interface StatsData {
  totalProspects: number;
  totalCompanies: number;
  withEmail: number;
  withPhone: number;
  withLinkedin: number;
  topIndustries: { name: string; count: number }[];
  seniorityBreakdown: { level: string; count: number }[];
  topSources: { source: string; count: number }[];
}

function MetricCard({ icon: Icon, label, value, change, color, href, loading }: {
  icon: any; label: string; value: number; change?: string; color: string; href?: string; loading?: boolean;
}) {
  const content = (
    <div className="group relative bg-white dark:bg-[#111118] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5 hover:border-gray-200 dark:hover:border-white/[0.12] transition-all hover:shadow-sm cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5 text-white" />
        </div>
        {href && <ArrowUpRight className="w-4 h-4 text-gray-300 dark:text-white/20 group-hover:text-gray-500 dark:group-hover:text-white/40 transition-colors" />}
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-24 bg-gray-100 dark:bg-white/[0.06] rounded-lg animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value.toLocaleString()}</p>
        )}
        <p className="text-xs text-gray-400 dark:text-white/30 mt-1 font-medium">{label}</p>
      </div>
      {change && <span className="absolute top-5 right-5 text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">{change}</span>}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function ProgressBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-gray-500 dark:text-white/40 w-36 truncate flex-shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/[0.04] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.max(pct, 1)}%` }} />
      </div>
      <span className="text-[11px] font-mono text-gray-400 dark:text-white/30 w-14 text-right">{value.toLocaleString()}</span>
    </div>
  );
}

function CoverageRing({ label, percent, color, loading }: { label: string; percent: number; color: string; loading?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 mb-2">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-100 dark:text-white/[0.04]" />
          <circle cx="18" cy="18" r="14" fill="none" strokeWidth="2" strokeDasharray={`${percent} ${100 - percent}`}
            strokeDashoffset="0" className={color} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">
          {loading ? "—" : `${percent}%`}
        </span>
      </div>
      <span className="text-[11px] text-gray-400 dark:text-white/30">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
    staleTime: 60_000,
  });

  const pctEmail = stats ? Math.round((stats.withEmail / stats.totalProspects) * 100) : 0;
  const pctPhone = stats ? Math.round((stats.withPhone / stats.totalProspects) * 100) : 0;
  const pctLinkedin = stats ? Math.round((stats.withLinkedin / stats.totalProspects) * 100) : 0;
  const maxIndustry = stats?.topIndustries[0]?.count ?? 1;
  const maxSeniority = stats?.seniorityBreakdown[0]?.count ?? 1;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h1>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">Real-time database metrics</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard icon={Users} label="Total Prospects" value={stats?.totalProspects ?? 0} color="bg-emerald-500" href="/prospects" loading={isLoading} />
        <MetricCard icon={Building2} label="Total Companies" value={stats?.totalCompanies ?? 0} color="bg-blue-500" href="/companies" loading={isLoading} />
        <MetricCard icon={Mail} label="With Email" value={stats?.withEmail ?? 0} color="bg-violet-500" loading={isLoading} />
        <MetricCard icon={Phone} label="With Phone" value={stats?.withPhone ?? 0} color="bg-amber-500" loading={isLoading} />
        <MetricCard icon={Linkedin} label="With LinkedIn" value={stats?.withLinkedin ?? 0} color="bg-sky-500" loading={isLoading} />
      </div>

      {/* Data Quality + Industry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Data Quality */}
        <div className="bg-white dark:bg-[#111118] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Data Quality</h2>
          <div className="flex justify-around">
            <CoverageRing label="Email" percent={pctEmail} color="stroke-violet-500" loading={isLoading} />
            <CoverageRing label="Phone" percent={pctPhone} color="stroke-amber-500" loading={isLoading} />
            <CoverageRing label="LinkedIn" percent={pctLinkedin} color="stroke-sky-500" loading={isLoading} />
          </div>
        </div>

        {/* Industry */}
        <div className="bg-white dark:bg-[#111118] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Top Industries</h2>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-4 bg-gray-100 dark:bg-white/[0.04] rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-1">
              {stats?.topIndustries.map((ind, i) => (
                <ProgressBar key={ind.name} label={ind.name} value={ind.count} max={maxIndustry}
                  color={["bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-pink-500"][i % 8]} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seniority + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#111118] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Seniority Levels</h2>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-4 bg-gray-100 dark:bg-white/[0.04] rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-1">
              {stats?.seniorityBreakdown.map((s) => (
                <ProgressBar key={s.level} label={s.level} value={s.count} max={maxSeniority}
                  color={
                    s.level.toLowerCase() === "cxo" ? "bg-violet-500" :
                      s.level.toLowerCase() === "vp" ? "bg-indigo-500" :
                        s.level.toLowerCase() === "director" ? "bg-blue-500" :
                          s.level.toLowerCase() === "manager" ? "bg-emerald-500" :
                            "bg-gray-400"
                  } />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#111118] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Data Sources</h2>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 bg-gray-100 dark:bg-white/[0.04] rounded animate-pulse" />)
            ) : (
              stats?.topSources.map((s) => (
                <div key={s.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-white/60">{s.source}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-400 dark:text-white/30 bg-gray-50 dark:bg-white/[0.04] px-2 py-0.5 rounded">
                    {s.count.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
