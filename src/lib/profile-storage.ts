import { PROFILE_STORAGE_KEY_PREFIX } from "./constants";

export type StoredProfileData = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  apartment?: string;
  roadNo?: string;
  additionalInfo?: string;
};

export type StoredProfile = {
  data: StoredProfileData;
  updatedAt?: string;
};

const buildStorageKey = (userId: string) =>
  `${PROFILE_STORAGE_KEY_PREFIX}:${userId}`;

export const getStoredProfile = (userId: string) => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(buildStorageKey(userId));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredProfile;

    if (!parsed?.data) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Failed to parse stored profile", error);
    return null;
  }
};

export const setStoredProfile = (userId: string, value: StoredProfile) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      buildStorageKey(userId),
      JSON.stringify(value)
    );
  } catch (error) {
    console.error("Failed to save profile data", error);
  }
};

export const clearStoredProfile = (userId: string) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(buildStorageKey(userId));
  } catch (error) {
    console.error("Failed to clear profile data", error);
  }
};
