import { useEffect, useState } from "react";
import { getUserProfile } from "../services/userService";
import { Profile } from "../types/profile.types";

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Profile-MFE] Fetching profile...');
      const user = await getUserProfile();
      console.log('[Profile-MFE] Profile loaded:', user);
      setProfile(user);
    } catch (err: any) {
      console.error('[Profile-MFE] Error loading profile:', err);
      const errorMessage = err?.response?.data?.error || err?.message || "Failed to load profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refresh: fetchProfile };
};
