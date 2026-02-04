import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import { useToast } from "../../contexts/ToastContext";
import { useLocale } from "../../contexts/LocaleContext";

const FIELDS = ["full_name", "email", "identity", "rtn", "phone", "address"];

function Progressbar({ className, user }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const percent = useMemo(() => {
    if (!user || typeof user !== "object") return 0;

    const total = FIELDS.length || 1;
    let filled = 0;
    for (const key of FIELDS) {
      const val = user[key];
      if (val != null && String(val).trim() !== "") filled += 1;
    }
    const raw = Math.round((filled / total) * 100);
    return Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : 0;
  }, [user]);

  const strokeOffset = `calc(215 - 215 * (${percent} / 100))`;

  const handleVerifyIdentity = async () => {
    if (!user || !user.id) {
      showToast(t("progressbar.invalidUser"), "error");
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_URL}/api/v1/users/${user.id}/resend_confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || t("progressbar.resendError"));
      }

      showToast(t("progressbar.verificationEmailSent"), "success");
    } catch (err) {
      console.error(err);
      showToast(`${t("common.error")}: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={
          className
            ? className
            : "bg-bgray-200 dark:bg-darkblack-600 p-7 rounded-xl"
        }
      >
        <div className="flex-row space-x-6 2xl:flex-row 2xl:space-x-6 flex md:flex-col md:space-x-0 items-center">
          <div className="progess-bar flex justify-center md:mb-[13px] xl:mb-0 mb-0">
            <div className="bonus-per relative">
              <div className="bonus-outer">
                <div className="bonus-inner">
                  <div className="number">
                    <span className="text-sm font-medium text-bgray-900">
                      {percent}%
                    </span>
                  </div>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="80px" height="80px">
                <circle
                  style={{
                    strokeDashoffset: strokeOffset,
                  }}
                  cx="40"
                  cy="40"
                  r="35"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col md:items-center xl:items-start items-start">
            <h4 className="text-bgray-900 dark:text-white text-base font-bold">
              {t("progressbar.completeInfo")}
            </h4>
            <span className="text-sm font-medium text-bgray-700 dark:text-darkblack-300">
              {t("progressbar.percentComplete", { percent, count: FIELDS.length })}
            </span>
          </div>
        </div>
        <button
          aria-label="none"
          onClick={handleVerifyIdentity}
          disabled={loading}
          className="w-full mt-4 bg-success-300 hover:bg-success-400 text-white font-bold text-xs py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? t("progressbar.resending") : t("progressbar.verifyIdentity")}
        </button>
      </div>

    </>
  );
}

Progressbar.propTypes = {
  className: PropTypes.string,
  user: PropTypes.object,
};

export default Progressbar;
