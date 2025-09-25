import Loader from "@/utils/Loader";
import Layout from "@components/Layout.js";
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";

const SubmitClaimPage = lazy(() => import("@components/SubmitClaim"));
const ComingSoon = lazy(() => import("@components/ComingSoon"));
const ClaimListPage = lazy(() => import("@components/ClaimListPage"));
const ClaimViewPage = lazy(() => import("@components/ClaimViewPage"));
const SettingsPage = lazy(() => import("@components/SettingsPage"));
const ClaimEditPage = lazy(() => import("@components/ClaimEditPage"));

export const navItems = [
  { label: "Dashboard", path: "/dashboard", available: true },
  { label: "Submit Claim", path: "/submit", available: true },
  { label: "My Claims", path: "/claims", available: true },
  { label: "Reports", path: "/reports", available: true },
  { label: "Settings", path: "/settings", available: true },
] as const;

export const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/submit" replace /> },

      {
        path: "dashboard",
        element: (
          <Suspense fallback={<Loader />}>
            <ComingSoon feature="Dashboard" />
          </Suspense>
        ),
      },

      {
        path: "submit",
        element: (
          <Suspense fallback={<Loader />}>
            <SubmitClaimPage />
          </Suspense>
        ),
      },

      {
        path: "claims",
        element: (
          <Suspense fallback={<Loader />}>
            <ClaimListPage />
          </Suspense>
        ),
      },

      {
        path: "claims/:id",
        element: (
          <Suspense fallback={<Loader />}>
            <ClaimViewPage />
          </Suspense>
        ),
      },
      {
        path: "claims/:id/edit",
        element: (
          <Suspense fallback={<Loader />}>
            <ClaimEditPage />
          </Suspense>
        ),
      },

      {
        path: "reports",
        element: (
          <Suspense fallback={<Loader />}>
            <ComingSoon feature="Reports" />
          </Suspense>
        ),
      },
      {
        path: "settings",
        element: (
          <Suspense fallback={<Loader />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      { path: "*", element: <Navigate to="/submit" replace /> },
    ],
  },
];
