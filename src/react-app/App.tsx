import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@/react-app/contexts/AuthContext-simple";
import HomePage from "@/react-app/pages/Home";
import BookingPage from "@/react-app/pages/Booking";
import AdminPage from "@/react-app/pages/Admin";
import PublicEventsPage from "@/react-app/pages/PublicEvents";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import MyBookingsPage from "@/react-app/pages/MyBookings";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/events" element={<PublicEventsPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
