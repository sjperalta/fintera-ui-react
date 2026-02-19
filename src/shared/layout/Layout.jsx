import ProtoTypes from "prop-types";
import { Suspense, useContext, useState } from "react";
import { Sidebar, SidebarV2 } from "../sidebar";
import { Overlay, OnboardingTour } from "../overlays";
import { HeaderOne, HeaderTwo } from "../header";

import { Outlet, useNavigate } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";

import { ThemeContext } from "../../contexts/ThemeContext";

function Layout({ bg, overlay, children }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [sidebar, setSidebar] = useState(true);
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme === "" || storedTheme ? storedTheme : "";
  });

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div
        className={`layout-wrapper ${sidebar && "active"
          }  w-full dark:bg-darkblack-600 `}
        style={{
          borderColor: "#2a313c",
        }}
      >
        <div className="relative flex w-full">
          {user ? <Sidebar handleActive={() => setSidebar(!sidebar)} user={user} handleLogout={handleLogout} /> : <div>Sidebar render ...</div>}
          {/* Only show overlay on mobile when sidebar is active */}
          {overlay ? overlay : (sidebar && <Overlay handleClick={() => setSidebar(false)} />)}
          {user ? <SidebarV2 user={user} handleLogout={handleLogout} /> : <div>Sidebar render ...</div>}
          <div
            className={`body-wrapper flex-1 overflow-x-hidden ${bg ? bg : "dark:bg-darkblack-500"
              } `}
          >
            <HeaderOne handleSidebar={() => setSidebar(!sidebar)} />
            <HeaderTwo handleSidebar={() => setSidebar(!sidebar)} />
            <Suspense fallback={<div className="flex items-center justify-center w-full h-[calc(100vh-64px)]"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
              <Outlet />
            </Suspense>
            <OnboardingTour />
            {children}
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

Layout.propTypes = {
  bg: ProtoTypes.string,
  overlay: ProtoTypes.node,
  children: ProtoTypes.node,
};

export default Layout;
