import { FeedList } from "@/components/FeedList";
import { RequireLogin } from "@/components/RequireLogin";

export default function FeedPage() {
  return (
    <RequireLogin message="Log in to see upcoming events from your favourite categories.">
      <FeedList />
    </RequireLogin>
  );
}
