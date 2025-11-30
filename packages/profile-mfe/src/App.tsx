import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/app.scss";

import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProfilePage />} />
        <Route path="/edit" element={<EditProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}
