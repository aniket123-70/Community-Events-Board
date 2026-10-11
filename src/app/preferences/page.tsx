import { FavouritesPicker } from "@/components/FavouritesPicker";
import { RequireLogin } from "@/components/RequireLogin";

export default function PreferencesPage() {
  return (
    <RequireLogin message="Log in to choose your favourite categories.">
      <FavouritesPicker />
    </RequireLogin>
  );
}
