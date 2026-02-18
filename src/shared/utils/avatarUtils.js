import { API_URL } from "@config";

/**
 * Utility functions for user avatar handling
 */

/**
 * Get the full URL for an image path
 * @param {string} path - The relative path from the API
 * @returns {string} - The full URL
 */
export const getFullImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
};

/**
 * Get initials from a full name (max 2 letters)
 * @param {string} name - The full name
 * @returns {string} - 2-letter initials
 */
export const getInitials = (name) => {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Get a consistent color for an avatar based on the name
 * @param {string} name - The name to generate color for
 * @returns {string} - Tailwind CSS color class
 */
export const getAvatarColor = (name) => {
  if (!name) return "bg-gray-600";
  const colors = [
    "bg-blue-600",
    "bg-green-600",
    "bg-purple-600",
    "bg-pink-600",
    "bg-indigo-600",
    "bg-yellow-600",
    "bg-red-600",
    "bg-teal-600",
    "bg-orange-600",
    "bg-cyan-600",
    "bg-fuchsia-600",
    "bg-rose-600",
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};