import { db } from "../../src/lib/db";

export default async function TrackerPage() {
  const applications = await db.jobApplication.findMany({ orderBy: { appliedAt: "desc" } });
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Application Tracker</h1>
      <table className="table-auto w-full border">
        <thead>
          <tr>
            <th className="px-4 py-2">Company</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Applied</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="border-t">
              <td className="px-4 py-2">{app.companyName}</td>
              <td className="px-4 py-2">{app.jobTitle}</td>
              <td className="px-4 py-2">{app.status}</td>
              <td className="px-4 py-2">{new Date(app.appliedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
