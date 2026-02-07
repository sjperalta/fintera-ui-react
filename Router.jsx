import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./component/protectedRoute";
import Layout from "./component/layout";

// Lazy-load pages to reduce initial bundle and egress (only load JS for visited routes)
const Home = lazy(() => import("./pages/home"));
const Payments = lazy(() => import("./pages/Payments"));
const Projects = lazy(() => import("./pages/projects"));
const Users = lazy(() => import("./pages/users"));
const Settings = lazy(() => import("./pages/settings"));
const SignIn = lazy(() => import("./pages/signin"));
const SignUp = lazy(() => import("./pages/signup"));
const ComingSoon = lazy(() => import("./pages/commingSoon"));
const Error = lazy(() => import("./pages/error"));
const PersonalInfo = lazy(() => import("./pages/settings/personal-info"));
const Security = lazy(() => import("./pages/settings/security"));
const TermsAndCondition = lazy(() => import("./pages/settings/Terms&condition"));
const CreateProject = lazy(() => import("./src/pages/projects/create"));
const LotsList = lazy(() => import("./src/pages/projects/lots"));
const Reserve = lazy(() => import("./src/pages/projects/reserve"));
const Financing = lazy(() => import("./pages/financing"));
const Upload = lazy(() => import("./src/pages/financing/upload"));
const Summary = lazy(() => import("./src/pages/financing/summary"));
const Audits = lazy(() => import("./pages/audits"));

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <Home />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/payments",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <Payments />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/projects",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <Projects />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/projects/create",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <CreateProject />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/projects/:id/lots",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <LotsList />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/projects/:id/lots/:lot_id/contracts/create",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <Reserve />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/audits",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <Audits />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/financing/user/:userId",
        element: (
          <Suspense fallback={<PageFallback />}>
            <Financing />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageFallback />}>
                <Summary />
              </Suspense>
            ),
          },
          {
            path: "payment/:paymentId/upload",
            element: (
              <Suspense fallback={<PageFallback />}>
                <Upload />
              </Suspense>
            ),
          },
        ]
      },
      {
        path: "/settings/user/:userId",
        element: (
          <Suspense fallback={<PageFallback />}>
            <Settings />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageFallback />}>
                <PersonalInfo />
              </Suspense>
            ),
          },
          {
            path: "security",
            element: (
              <Suspense fallback={<PageFallback />}>
                <Security />
              </Suspense>
            ),
          },
          {
            path: "terms&conditions",
            element: (
              <Suspense fallback={<PageFallback />}>
                <TermsAndCondition />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "/users",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <Users />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },

  {
    path: "/signin",
    element: (
      <Suspense fallback={<PageFallback />}>
        <SignIn />
      </Suspense>
    ),
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={<PageFallback />}>
        <SignUp />
      </Suspense>
    ),
  },
  {
    path: "/coming-soon",
    element: (
      <Suspense fallback={<PageFallback />}>
        <ComingSoon />
      </Suspense>
    ),
  },
  {
    path: "/404",
    element: (
      <Suspense fallback={<PageFallback />}>
        <Error />
      </Suspense>
    ),
  },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
