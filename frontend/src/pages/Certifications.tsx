import { BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../utils/axios";
import { usePageTitle } from "../hooks/usePageTitle";
import { useRateLimit } from "../contexts/RateLimitContext";
import toast from "react-hot-toast";

type Certification = {
  id: number, 
  course: string,
  issued_at: string,
  certificate_file: string
}

const Certifications = () => {
  const { isRateLimited, cooldown } = useRateLimit();
  usePageTitle("Certifications");
  const [certifications, setCertifications] = useState<Certification[] | null>(null);

  useEffect(() => {
    if(isRateLimited){
      toast.error(`Sorry about that, you're being rate-limited. Please try again in ${cooldown} seconds.`, {duration: 4000})
    }
  }, [])

  useEffect(() => {
    const fetchCertifications = async () => {
      const response = await api.get(`/api/certifications/`);
      if(response.status === 200){
        console.log(response.data);
        setCertifications(response.data);
      }
    };

    fetchCertifications();

  }, [])
  

  return (
    <div className="bg-slate-100 h-full px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Certifications</h1>

      {certifications 
        ? certifications.length === 0 
          ? (
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
              <div className="flex items-start gap-3 mb-4">
                <div>
                  <BadgeCheck className="text-green-600 mt-1" />
                </div>
                <h2 className="text-lg font-semibold">{cert.course}</h2>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Issued:</span> {new Date(cert.issued_at).toISOString().split("T")[0]}</p>
                <p><span className="font-medium">Certificate ID:</span> CERT-00{cert.id}</p>
              </div>
              <a
                href={cert.certificate_file}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-center text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                View Certificate
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-64 rounded-2xl shadow-sm p-5 flex flex-col justify-between bg-white"></div>
          <div className="h-64 rounded-2xl shadow-sm p-5 flex flex-col justify-between bg-white"></div>
          <div className="h-64 rounded-2xl shadow-sm p-5 flex flex-col justify-between bg-white"></div>
        </div>
      )}
    </div>
  );
};

export default Certifications;
