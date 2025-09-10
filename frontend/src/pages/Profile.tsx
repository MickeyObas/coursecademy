import { Pencil, UserCircle2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import api from "../utils/axios";
import { BACKEND_URL } from "../config";
import { type ProfileData } from "../types/User";
import { usePageTitle } from "../hooks/usePageTitle";
import { useAuth } from "../contexts/AuthContext";


export const Profile = () => {
  const { user } = useAuth();
  usePageTitle(`${user?.full_name.split(" ")[0]}'s Profile`);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);
  const profilePictureInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/users/me/');
        const data = response.data;
        setProfile(data);
        console.log(data);
      }catch(err: any){
        if(err.response){
          console.error(err);
        }else{
          console.error(err);
        }
      }
    };
    fetchProfile();
  }, [])

  const updateProfile = async (field: string, newvalue: File) => {
    const updateProfileForm = new FormData();
    updateProfileForm.append(field, newvalue);
    try {
      const response = await api.patch('/api/users/me/update/', updateProfileForm, {
        headers:{
          'Content-Type': 'multipart/form-data'
        }
      });
      const data = response.data;
      console.log(data);
    }catch (err){
      console.error(err);
    }
  }


  const handleProfileIconClick = () => {
    profilePictureInputRef?.current?.click();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files) return;
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile("profile_picture", file);
        setPreview(reader.result);
        console.log(reader.result);
      };
      reader.readAsDataURL(file);

      console.log("Selected file:", file);
    }
  };

  return (
    <main className="bg-slate-100 h-full">
    <div className="px-6 py-10 max-w-3xl mx-auto bg-slate-100">
      <h1 className="text-2xl font-bold mb-8">Your Profile</h1>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar */}
          <div className="" onClick={handleProfileIconClick}>
            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              ref={profilePictureInputRef}
              onChange={handleFileChange}
            />
            {profile?.profile_picture ? (
            <img
              src={ preview as string || `${BACKEND_URL}${profile?.profile_picture}` || ""}
              alt="User avatar"
              className="w-28 h-28 rounded-full object-cover border"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center border">
              <UserCircle2 className="text-slate-400 w-16 h-16" />
            </div>
          )}
          </div>
          

          {/* User Info */}
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{profile?.user.full_name}</h2>
              <button className="inline-flex items-center text-sm text-blue-600 hover:underline">
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">Email:</span> {profile?.user?.email}</p>
              <p><span className="font-medium">Role:</span> {profile?.user?.account_type === 'S' ? "Student" : "Instructor"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </main>
  );
};
