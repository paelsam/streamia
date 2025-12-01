import { Routes, Route } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "white",
            borderRadius: "8px",
          },
        }}
      />

      <Routes>
        <Route index element={<ProfilePage />} />
        <Route path="edit" element={<EditProfilePage />} />
      </Routes>
    </>
  );
}
