import { Route, Routes } from "react-router-dom"
import { AdminRoute, GuestRoute, UserRoute } from "./controllers/RoutesController"
import LogIn from "./pages/LogIn/LogIn"
import Register from "./pages/Register/Register"
import Profile from "./pages/Profile/Profile"

function App() {

  return (
    <div>
      <Routes>
        // auth
        <Route path="/login" element={<GuestRoute><LogIn /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/me" element={<UserRoute><Profile /></UserRoute>} />
        <Route path="/user/:id" element={<UserRoute><Profile /></UserRoute>} />
        <Route path="/dashboard" element={<AdminRoute><LogIn /></AdminRoute>} />     
      </Routes>
    </div>
  )
}

export default App
