import { BadgeCheck } from "lucide-react";

const certifications = [
  {
    id: "CERT-001",
    course: "Frontend Web Development",
    dateIssued: "2025-06-15",
    downloadUrl: "/certs/frontend-web.pdf",
  },
  {
    id: "CERT-002",
    course: "Python for Beginners",
    dateIssued: "2025-07-01",
    downloadUrl: "/certs/python-beginners.pdf",
  },
  // Add more certs or fetch from API
];

const Certifications = () => {
  return (
    <div className="bg-slate-100 h-full px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Certifications</h1>

      {certifications.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <p className="text-lg">🎓 You don’t have any certifications yet.</p>
          <p className="text-sm mt-2">Complete a course to earn your first certificate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map(cert => (
            <div
              key={cert.id}
              className="border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col justify-between bg-white hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-4">
                <BadgeCheck className="text-green-600" />
                <h2 className="text-lg font-semibold">{cert.course}</h2>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Issued:</span> {cert.dateIssued}</p>
                <p><span className="font-medium">Certificate ID:</span> {cert.id}</p>
              </div>
              <a
                href={cert.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-center text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                View Certificate
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certifications;
