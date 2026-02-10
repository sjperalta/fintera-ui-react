import ProtoTypes from "prop-types";
import { getInitials, getAvatarColor } from "@/utils/avatarUtils";
import { API_URL } from "@config";

function Author({ showProfile, user }) {
  return (
    <div
      onClick={() => showProfile("profile")}
      id="profile-trigger"
      className="flex cursor-pointer space-x-0 lg:space-x-3 z-30"
    >
      <div className={`h-[52px] w-[52px] rounded-xl border border-bgray-300 ${(!user.profile_picture && !user.profile_picture_thumb) ? getAvatarColor(user.full_name) : ''} flex items-center justify-center overflow-hidden bg-white dark:bg-darkblack-500`}>
        {(user.profile_picture || user.profile_picture_thumb) ? (
          <img
            src={`${API_URL}${user.profile_picture_thumb || user.profile_picture}`}
            alt={user.full_name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
          />
        ) : null}
        <span className="text-white font-bold text-xl" style={{ display: (user.profile_picture || user.profile_picture_thumb) ? 'none' : 'block' }}>
          {getInitials(user.full_name)}
        </span>
      </div>
      <div className="hidden 2xl:block">
        <div className="flex items-center space-x-2.5">
          <h3 className="text-base font-bold leading-[28px] text-bgray-900 dark:text-white">
            {user.full_name}
          </h3>
          <span>
            <svg
              className="stroke-bgray-900 dark:stroke-white"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 10L12 14L17 10"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        <p className="text-sm font-medium leading-[20px] text-bgray-600 dark:text-bgray-50">
          {user.role}
        </p>
      </div>
    </div>
  );
}

Author.propTypes = {
  showProfile: ProtoTypes.func,
};

export default Author;