import { Pencil, UserCircle2 } from "lucide-react";

const user = {
  name: "Mickey Goke",
  email: "mickey@example.com",
  role: "Student",
  joinDate: "2024-03-18",
  avatarUrl: "", // fallback if empty
};

const Profile = () => {
  return (
    <main className="bg-slate-100 h-full">
    <div className="px-6 py-10 max-w-3xl mx-auto bg-slate-100">
      <h1 className="text-2xl font-bold mb-8">Your Profile</h1>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar */}
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="User avatar"
              className="w-28 h-28 rounded-full object-cover border"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center border">
              <UserCircle2 className="text-slate-400 w-16 h-16" />
            </div>
          )}

          {/* User Info */}
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <button className="inline-flex items-center text-sm text-blue-600 hover:underline">
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Role:</span> {user.role}</p>
              <p><span className="font-medium">Joined:</span> {user.joinDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </main>
  );
};

export default Profile;
