import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SearchFilterBar from "../../component/ui/SearchFilterBar";
import GenericList from "../../component/ui/GenericList";
import UserData from "../../component/user/UserData";
import RightSidebar from "../../component/user/RightSidebar";
import AuthContext from "../../context/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { getToken } from "../../../auth";

function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useLocale();
  const token = getToken();

  // Get available role options based on current user's role
  const getRoleFilterOptions = () => {
    const allRoles = [
      { value: "", label: t('userFilter.all') },
      { value: "user", label: t('userFilter.user') },
      { value: "seller", label: t('userFilter.seller') },
      { value: "admin", label: t('userFilter.admin') }
    ];

    if (user?.role === 'admin') {
      return allRoles;
    } else if (user?.role === 'seller') {
      return [allRoles[0], allRoles[1]];
    }

    return [allRoles[0]];
  };

  const roleOptions = getRoleFilterOptions();

  // Render function for individual user items - now simplified as cards
  const renderUserItem = (user, index, isMobileCard, handleClick) => {
    return (
      <UserData
        userInfo={user}
        index={index}
        token={token}
        onClick={handleClick}
      />
    );
  };

  useEffect(() => {
    if (location.state?.selectedUserId || location.state?.selectedUserName) {
      const userFromState = {
        id: location.state.selectedUserId,
        identity: location.state.selectedUserId,
        full_name: location.state.selectedUserName,
        phone: location.state.selectedUserPhone,
        credit_score: location.state.selectedUserCreditScore,
        email: "",
        role: "user",
        status: "active",
      };

      if (location.state.selectedUserName) {
        setSearchTerm(location.state.selectedUserName);
      }

      setSelectedUser(userFromState);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const onClose = () => {
    setSelectedUser(null);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] dark:bg-darkblack-700 min-h-screen"
    >
      <div className="flex 2xl:flex-row 2xl:space-x-11 flex-col space-y-10">
        <div className="2xl:flex-1 w-full">
          <SearchFilterBar
            id="users-search-bar"
            searchTerm={searchTerm}
            filterValue={role}
            filterOptions={roleOptions}
            onSearchChange={setSearchTerm}
            onFilterChange={setRole}
            searchPlaceholder={t('userFilter.searchPlaceholder')}
            filterPlaceholder={t('userFilter.selectType')}
            minSearchLength={3}
            showFilter={true}
            actions={[
              {
                id: "add-user-btn",
                label: t('userFilter.addUser'),
                onClick: () => navigate("/users/create"),
                className: "py-3 px-10 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
              }
            ]}
          />

          <GenericList
            endpoint="/api/v1/users"
            renderItem={renderUserItem}
            filters={{ search_term: searchTerm, role: role }}
            onItemSelect={setSelectedUser}
            columns={[]} // No columns needed for grid view
            gridClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            sortBy="created_at-desc"
            itemsPerPage={12}
            emptyMessage={t('users.noUsersFound')}
            loadingMessage={t('users.loadingUsers')}
            entityName="users"
            showDesktopTable={false}
          />
        </div>

        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="2xl:relative fixed inset-0 2xl:inset-auto z-50 2xl:z-0 flex justify-end 2xl:block"
              onClick={(e) => {
                if (e.target === e.currentTarget && window.innerWidth < 1536) onClose();
              }}
            >
              <div className="h-full 2xl:h-auto 2xl:sticky 2xl:top-[156px] w-[400px] max-w-full">
                <RightSidebar user={selectedUser} onClose={onClose} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}

export default Users;
