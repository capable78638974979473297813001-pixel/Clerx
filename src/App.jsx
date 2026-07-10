import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import EmployeeJoin from './pages/EmployeeJoin'
import EmployeeChat from './pages/EmployeeChat'
import NotFound from './pages/NotFound'
import AppLayout from './pages/app/AppLayout'
import Overview from './pages/app/Overview'
import Staff from './pages/app/Staff'
import Knowledge from './pages/app/Knowledge'
import Topics from './pages/app/Topics'
import Activity from './pages/app/Activity'
import Settings from './pages/app/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/signup" element={<Auth mode="signup" />} />
      <Route path="/setup" element={<Onboarding />} />
      <Route path="/join" element={<EmployeeJoin />} />
      <Route path="/chat" element={<EmployeeChat />} />

      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Overview />} />
        <Route path="staff" element={<Staff />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="topics" element={<Topics />} />
        <Route path="activity" element={<Activity />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
