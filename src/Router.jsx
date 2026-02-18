import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./shared/auth/ProtectedRoute";
import Home from "./features/dashboard/pages";
import Contracts from "./features/contracts/pages";
import Payments from "./features/payments/pages";
import Projects from "./features/projects/pages";
import Users from "./features/users/pages";
import Settings from "./features/settings/pages";
import SignIn from "./features/auth/pages/signin";
import SignUp from "./features/auth/pages/signup";
import ComingSoon from "./features/commingSoon";
import NotFound from "./shared/error/NotFound";
import Layout from "./shared/layout/Layout";
import RouteErrorElement from "./shared/error/RouteErrorElement";
import PersonalInfo from "./features/settings/pages/personal-info";
import Security from "./features/settings/pages/security";
import TermsAndCondition from "./features/settings/pages/terms&condition";
import CreateProject from "./features/projects/pages/create";
import EditProject from "./features/projects/pages/edit";
import AdminRoute from "./shared/auth/AdminRoute";
import LotsList from "./features/projects/pages/lots";
import CreateLot from "./features/projects/pages/lots/create";
import EditLot from "./features/projects/pages/lots/edit";
import Reserve from "./features/projects/pages/reserve";
import CreateUser from "./features/users/pages/create";
import Upload from "./features/financing/pages/upload";
import Summary from "./features/financing/pages/summary";
import AdminOrOwnerRoute from "./shared/auth/AdminOrOwnerRoute";

const Audits = lazy(() => import("./features/audits/pages"));
const Analytics = lazy(() => import("./features/analytics/pages"));
const Financing = lazy(() => import("./features/financing/pages"));

const PageLoader = () => (
  <div className="flex items-center justify-center w-full h-[calc(100vh-64px)]">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const router = createBrowserRouter(
  [
    {
      path: "/",
      Component: Layout,
      errorElement: <RouteErrorElement />,
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          ),
        },
        {
          path: "/contracts",
          element: (
            <ProtectedRoute>
              <Contracts />
            </ProtectedRoute>
          ),
        },
        {
          path: "/payments",
          element: (
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          ),
        },
        {
          path: "/projects",
          element: (
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          ),
        },
        {
          path: "/projects/create",
          element: (
            <AdminRoute>
              <CreateProject />
            </AdminRoute>
          ),
        },
        {
          path: "/projects/:id/edit",
          element: (
            <AdminRoute>
              <EditProject />
            </AdminRoute>
          ),
        },
        {
          path: "/projects/:id/lots",
          element: (
            <ProtectedRoute>
              <LotsList />
            </ProtectedRoute>
          ),
        },
        {
          path: "/projects/:id/lots/create",
          element: (
            <AdminRoute>
              <CreateLot />
            </AdminRoute>
          ),
        },
        {
          path: "/projects/:project_id/lots/:lot_id/edit",
          element: (
            <ProtectedRoute>
              <EditLot />
            </ProtectedRoute>
          ),
        },
        {
          path: "/audits",
          element: (
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Audits />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: "/projects/:id/lots/:lot_id/contracts/create",
          element: (
            <ProtectedRoute>
              <Reserve />
            </ProtectedRoute>
          ),
        },
        {
          path: "/financing/user/:userId",
          element: (
            <AdminOrOwnerRoute>
              <Suspense fallback={<PageLoader />}>
                <Financing />
              </Suspense>
            </AdminOrOwnerRoute>
          ),
          children: [
            {
              index: true,
              element: <Summary />,
            },
            {
              path: "payment/:paymentId/upload",
              element: <Upload />,
            },
          ],
        },
        {
          path: "/settings/user/:userId",
          element: (
            <AdminOrOwnerRoute>
              <Settings />
            </AdminOrOwnerRoute>
          ),
          children: [
            {
              index: true,
              element: <PersonalInfo />,
            },
            {
              path: "security",
              element: <Security />,
            },
            {
              path: "terms&conditions",
              element: <TermsAndCondition />,
            },
          ],
        },
        {
          path: "/users",
          element: (
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          ),
        },
        {
          path: "/users/create",
          element: (
            <ProtectedRoute>
              <CreateUser />
            </ProtectedRoute>
          ),
        },
        {
          path: "/analytics",
          element: (
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Analytics />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },

    {
      path: "/signin",
      element: <SignIn />,
    },
    {
      path: "/signup",
      element: <SignUp />,
    },
    {
      path: "/coming-soon",
      element: <ComingSoon />,
    },
  ],
  {
    future: {
      // Opt-in to React Router v7 future flags
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
