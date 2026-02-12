import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./component/protectedRoute";
import Home from "./pages/home";
import Contracts from "./pages/contract";
import Payments from "./pages/payments";
import Projects from "./pages/projects";
import Users from "./pages/users";
import Settings from "./pages/settings";
import SignIn from "./pages/signin";
import SignUp from "./pages/signup";
import ComingSoon from "./pages/commingSoon";
import Error from "./pages/error";
import Layout from "./component/layout";
import RouteErrorElement from "./component/error/RouteErrorElement";
import PersonalInfo from "./pages/settings/personal-info";
import Security from "./pages/settings/security";
import TermsAndCondition from "./pages/settings/terms&condition";
import CreateProject from "./pages/projects/create";
import EditProject from "./pages/projects/edit";
import AdminRoute from "./component/protectedRoute/AdminRoute";
import LotsList from "./pages/projects/lots";
import CreateLot from "./pages/projects/lots/create";
import EditLot from "./pages/projects/lots/edit";
import Reserve from "./pages/projects/reserve";
import CreateUser from "./pages/users/create";
import Upload from "./pages/financing/upload";
import Summary from "./pages/financing/summary";
import AdminOrOwnerRoute from "./component/protectedRoute/AdminOrOwnerRoute";

const Audits = lazy(() => import("./pages/audits"));
const Analytics = lazy(() => import("./pages/analytics"));
const Financing = lazy(() => import("./pages/financing"));

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
    {
      path: "/404",
      element: <Error />,
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
