import { useEffect, useState, useContext } from "react";
import { API_URL } from "./../../../config"; // Update the path as needed
import { getToken } from "./../../../auth"; // Update the path as needed
import PropTypes from "prop-types";
import { useLocale } from "../../contexts/LocaleContext";
import AuthContext from "../../context/AuthContext";
import { useToast } from "../../contexts/ToastContext";

// helper formatters (minimal, preserve digits and insert dashes)
function formatCedula(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  const g1 = d.slice(0, 4);
  const g2 = d.slice(4, 8);
  const g3 = d.slice(8, 13);
  let out = g1;
  if (g2) out += `-${g2}`;
  if (g3) out += `-${g3}`;
  return out;
}

function formatRTN(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  const g1 = d.slice(0, 4);
  const g2 = d.slice(4, 8);
  const g3 = d.slice(8, 13);
  const g4 = d.slice(13, 14);
  let out = g1;
  if (g2) out += `-${g2}`;
  if (g3) out += `-${g3}`;
  if (g4) out += `-${g4}`;
  return out;
}

function PersonalInfoForm({ userId }) {
  const { t, setLocale, locale } = useLocale();
  const [user, setUser] = useState({
    full_name: "",
    phone: "",
    email: "",
    identity: "",
    rtn: "",
    address: "",
    locale: locale, // Initialize with current locale from context
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const token = getToken(); // Retrieve token from auth helper
  const { setUser: setAuthUser } = useContext(AuthContext);

  useEffect(() => {
    if (!userId) {
      setError(t("errors.userIdInvalid"));
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include token for authentication
          },
        });

        if (!response.ok) {
          throw new Error(t("errors.fetchUserFailed"));
        }

        const data = await response.json();
        setUser({
          ...data,
          identity: formatCedula(data.identity),
          rtn: formatRTN(data.rtn),
          locale: data.locale || locale, // Use fetched locale or current context locale
        });
        if (data.locale && data.locale !== locale) {
          setLocale(data.locale); // Sync context if fetched user has different locale
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, token]); // Only re-fetch when userId or token changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "identity") v = formatCedula(value);
    if (name === "rtn") v = formatRTN(value);
    setUser((prevUser) => ({
      ...prevUser,
      [name]: v,
    }));

    // Immediately update locale when language is changed
    if (name === "locale") {
      setLocale(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError(t("errors.updateWithoutId"));
      return;
    }

    try {
      // Update main user data
      const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: user.full_name,
          phone: user.phone,
          email: user.email,
          identity: user.identity.replace(/-/g, ''), // send raw digits
          rtn: user.rtn.replace(/-/g, ''), // send raw digits
          address: user.address,
          locale: user.locale, // Include locale in the update
        }),
      });

      if (!response.ok) {
        // Try to parse server message
        const contentType = response.headers.get("content-type") || "";
        const body = contentType.includes("application/json") ? await response.json().catch(() => ({})) : await response.text().catch(() => (response.statusText || ""));
        const msg = body?.errors ? body.errors.join(", ") : body?.error || String(body) || t("errors.updateUserFailed");
        throw new Error(msg);
      }

      // parse returned user and update global auth user and local state
      const returned = await response.json().catch(() => ({}));
      const returnedUser = returned?.user || returned;
      if (returnedUser) {
        // update component state (format identity/rtn for display)
        setUser((u) => ({
          ...u,
          ...returnedUser,
          identity: formatCedula(returnedUser.identity),
          rtn: formatRTN(returnedUser.rtn),
        }));

        // update global auth context and localStorage if this is the logged-in user
        try {
          const storedUser = JSON.parse(localStorage.getItem("user") || "null");
          if (storedUser && storedUser.id === returnedUser.id) {
            const merged = { ...storedUser, ...returnedUser };
            localStorage.setItem("user", JSON.stringify(merged));
            if (typeof setAuthUser === "function") setAuthUser(merged);
          }
        } catch (e) {
          // ignore localStorage issues
        }

        if (returnedUser.locale) setLocale(returnedUser.locale);
      }

      showToast(t("errors.profileUpdated"), "success");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!userId) {
    return <p className="text-red-500">{t("errors.userIdRequired")}</p>;
  }

  if (loading) return <p>{t("common.loading")}</p>;
  if (error) return <p className="text-red-500">{t("common.error")}: {error}</p>;

  return (
    <div className="2xl:col-span-8 xl:col-span-7">
      <h3 className="text-2xl font-bold pb-5 text-bgray-900 dark:text-white dark:border-darkblack-400 border-b border-bgray-200">
        {t("personalInfo.title")}
      </h3>
      <div className="mt-8">
        <form onSubmit={handleSubmit}>
          <div className="grid 2xl:grid-cols-2 grid-cols-1 gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="full_name"
                className="text-base text-bgray-600 dark:text-bgray-50 font-medium"
              >
                {t("personalInfo.fullName")}
              </label>
              <input
                type="text"
                name="full_name"
                value={user.full_name}
                onChange={handleInputChange}
                className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="phone"
                className="text-base text-bgray-600 dark:text-bgray-50 font-medium"
              >
                {t("personalInfo.phoneOptional")}
              </label>
              <input
                type="text"
                name="phone"
                value={user.phone}
                onChange={handleInputChange}
                className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="address"
                className="text-base text-bgray-600 dark:text-bgray-50 font-medium"
              >
                {t("personalInfo.addressOptional")}
              </label>
              <input
                type="text"
                name="address"
                value={user.address}
                onChange={handleInputChange}
                className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-base text-bgray-600 dark:text-bgray-50 font-medium"
              >
                {t("personalInfo.email")}
              </label>
              <input
                type="text"
                name="email"
                value={user.email}
                onChange={handleInputChange}
                readOnly
                className="bg-bgray-100 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
              />
            </div>
          </div>
          <h4 className="pt-8 pb-6 text-xl font-bold text-bgray-900 dark:text-white">
            {t("personalInfo.generalInfo")}
          </h4>
          <div className="grid 2xl:grid-cols-2 grid-cols-1 gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="identity"
                className="text-base text-bgray-600 dark:text-bgray-50 font-medium"
              >
                {t("personalInfo.identity")}
              </label>
              <input
                type="text"
                name="identity"
                value={user.identity}
                onChange={handleInputChange}
                className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="rtn"
                className="text-base text-bgray-600 dark:text-bgray-50 font-medium"
              >
                {t("personalInfo.rtn")}
              </label>
              <input
                type="text"
                name="rtn"
                value={user.rtn}
                onChange={handleInputChange}
                className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="locale"
                className="text-base text-bgray-600 dark:text-bgray-50 font-medium"
              >
                {t("personalInfo.language")}
              </label>
              <select
                name="locale"
                value={user.locale}
                onChange={handleInputChange}
                className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:border focus:border-success-300 focus:ring-0"
              >
                <option value="es">{t("personalInfo.spanish")}</option>
                <option value="en">{t("personalInfo.english")}</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              aria-label="none"
              className="rounded-lg bg-success-300 text-white font-semibold mt-10 py-3.5 px-4"
            >
              {t("personalInfo.saveProfile")}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

PersonalInfoForm.propTypes = {
  userId: PropTypes.string, // Updated to allow null values
};

export default PersonalInfoForm;