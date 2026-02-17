import { useQuery } from "@tanstack/react-query";

type Company = {
  companyId: string;
  companyName: string | null;
  companyDomain: string | null;
  companyWebsite: string | null;
  industry: string | null;
};

export default function Companies() {
  const { data, isLoading, error } = useQuery<{ companies: Company[]; total: number }>({
    queryKey: ["/api/companies"],
  });

  if (isLoading) return <div style={{ padding: 16 }}>Loading companies...</div>;
  if (error) return <div style={{ padding: 16 }}>Failed to load companies</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Companies</h1>
      <div style={{ marginBottom: 8, color: "#666" }}>Total: {data?.total ?? 0}</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Name</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Domain</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Website</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Industry</th>
          </tr>
        </thead>
        <tbody>
          {(data?.companies ?? []).map((c) => (
            <tr key={c.companyId}>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{c.companyName ?? "(no name)"}</td>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{c.companyDomain ?? ""}</td>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{c.companyWebsite ?? ""}</td>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{c.industry ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
