import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import config from "../hooks/config";
import { FaTimes, FaUserFriends, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

const ProfileModal = ({ userId, isOpen, onClose }) => {
  const { token } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.apiUrl}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      setUserProfile(data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Unknown date";
      }
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      });
    } catch (e) {
      return "Unknown date";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 dark:text-white">Loading profile...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">Error: {error}</p>
              <button
                onClick={fetchUserProfile}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : userProfile ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-700 mb-4">
                  {userProfile.profilePic ? (
                    <img
                      src={userProfile.profilePic}
                      alt={userProfile.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = 
                          `<span class="text-3xl font-semibold text-gray-700 dark:text-gray-300">
                            ${userProfile.username?.charAt(0).toUpperCase() || 'U'}
                          </span>`;
                      }}
                    />
                  ) : (
                    <span className="text-3xl font-semibold text-gray-700 dark:text-gray-300">
                      {userProfile.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold dark:text-white">
                  {userProfile.realname || userProfile.username || "Unknown User"}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  @{userProfile.username || "unknown"}
                </p>
              </div>

              {userProfile.bio && (
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">{userProfile.bio}</p>
                </div>
              )}

              <div className="space-y-2">
                {userProfile.location && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{userProfile.location}</span>
                  </div>
                )}

                {userProfile.joinedDate && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FaCalendarAlt className="mr-2" />
                    <span>Joined {formatDate(userProfile.joinedDate)}</span>
                  </div>
                )}

                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <FaUserFriends className="mr-2" />
                  <span>{userProfile.followersCount || 0} followers</span>
                </div>
              </div>

              {userProfile.website && (
                <div className="pt-2">
                  <a
                    href={userProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {userProfile.website}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="dark:text-white">No profile data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;