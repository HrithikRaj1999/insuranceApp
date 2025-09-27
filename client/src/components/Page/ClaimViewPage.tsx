import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "@services/apiService.js";
import Loader from "@components/UI/Loader";
const ClaimForm = React.lazy(() => import("@components/Claim/ClaimForm"));
const ClaimViewPage: React.FC = () => {
  const { id } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [initial, setInitial] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiService.getClaim(id!);
        if (alive) setInitial(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);
  if (loading) return <Loader />;
  if (!initial)
    return (
      <div
        style={{
          padding: 24,
        }}
      >
        Claim not found.
      </div>
    );
  return (
    <React.Suspense
      fallback={
        <div
          style={{
            padding: 24,
          }}
        >
          Loading form…
        </div>
      }
    >
      <ClaimForm
        onSubmit={() => Promise.resolve()}
        summary={initial.summary ?? ""}
        loading={false}
        initial={initial}
        mode="view"
      />
    </React.Suspense>
  );
};
export default ClaimViewPage;
