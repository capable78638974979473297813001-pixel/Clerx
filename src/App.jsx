import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import EmployeeJoin from './pages/EmployeeJoin'
import EmployeeChat from './pages/EmployeeChat'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/setup" element={<Onboarding />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/join" element={<EmployeeJoin />} />
      <Route path="/chat" element={<EmployeeChat />} />
    </Routes>
  )
}
