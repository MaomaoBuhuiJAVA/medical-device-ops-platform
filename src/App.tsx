/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard-layout';
import Dashboard from './pages/Dashboard';
import EquipmentLedger from './pages/EquipmentLedger';
import InspectionPlanning from './pages/InspectionPlanning';
import RepairManagement from './pages/RepairManagement';
import AssetScrap from './pages/AssetScrap';
import Login from './pages/Login';
import Register from './pages/Register';
import { RequireAuth } from './auth/RequireAuth';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipment" element={<EquipmentLedger />} />
          <Route path="/inspection" element={<InspectionPlanning />} />
          <Route path="/repair" element={<RepairManagement />} />
          <Route path="/scrap" element={<AssetScrap />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
