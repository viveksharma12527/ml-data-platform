import { Route, Routes } from "react-router-dom"
import { AdminRoute, AnnotatorRoute, DataSpecialistRoute, GuestRoute, UserRoute } from "./controllers/RoutesController"
import LogIn from "./pages/LogIn/LogIn"
import Register from "./pages/Register/Register"
import Profile from "./pages/Profile/Profile"
import MainLayout from "./layouts/MainLayout"
import NotFound from "./pages/NotFound/NotFound"
import AnnotatorProject from "./pages/AnnotatorProject/AnnotatorProject"
import AnnotatorProjects from "./pages/AnnotatorProjects/AnnotatorProjects"
import DataSpecialistProjects from "./pages/DataSpecialistProjects/DataSpecialistProjects"
import CreateProject from "./pages/CreateProject/CreateProject"
import DataSpecialistProject from "./pages/DataSpecialistProject/DataSpecialistProject"
import UsersMenagment from "./pages/UsersMenagment/UsersMenagment"

function App() {

  return (
    <div>
      <Routes>
        <Route path="/login" element={<GuestRoute><LogIn /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        <Route element={<MainLayout />}>
          <Route path="/me" element={<UserRoute><Profile /></UserRoute>} />
          <Route path="/user/:id" element={<UserRoute><Profile /></UserRoute>} />
          <Route path="/annotator/my-projects" element={<AnnotatorRoute><AnnotatorProjects /></AnnotatorRoute>} />
          <Route path="/annotator/project/:id" element={<AnnotatorRoute><AnnotatorProject /></AnnotatorRoute>} />
          <Route path="/data-specialist/my-projects" element={<DataSpecialistRoute><DataSpecialistProjects /></DataSpecialistRoute>} />
          <Route path="/create-project" element={<DataSpecialistRoute><CreateProject /></DataSpecialistRoute>} />
          <Route path="/data-specialist/my-projects/:id" element={<DataSpecialistRoute><DataSpecialistProject /></DataSpecialistRoute>} />
          <Route path="/users-menagment" element={<AdminRoute><UsersMenagment /></AdminRoute>} />
        </Route>
        
        <Route path="/*" element={<NotFound />} />     
      </Routes>
    </div>
  )
}

export default App
