import { useQuery } from "@tanstack/react-query";

type Contact = {
  contactId: string;
  firstName: string | null;
  lastName: string | null;
  emailPrimary: string | null;
  titleRaw: string | null;
  companyName: string | null;
  companyDomain: string | null;
};

export default function Contacts() {
  const { data, isLoading, error } = useQuery<{ contacts: Contact[]; total: number }>({
    queryKey: ["/api/contacts"],
  });

  if (isLoading) return <div style={{ padding: 16 }}>Loading contacts...</div>;
  if (error) return <div style={{ padding: 16 }}>Failed to load contacts</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Contacts</h1>
      <div style={{ marginBottom: 8, color: "#666" }}>Total: {data?.total ?? 0}</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Name</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Email</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Title</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Company</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Domain</th>
          </tr>
        </thead>
        <tbody>
          {(data?.contacts ?? []).map((c) => (
            <tr key={c.contactId}>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{`${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "(no name)"}</td>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{c.emailPrimary ?? ""}</td>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{c.titleRaw ?? ""}</td>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{c.companyName ?? ""}</td>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{c.companyDomain ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
