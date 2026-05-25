import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Login from './pages/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import ViewAllTransactions from './pages/Dashboard/ViewAllTransactions';
import AddUser from './pages/UserManagement/AddUser';
import UsersList from './pages/UserManagement/UsersList';
import RolePermissions from './pages/UserManagement/RolePermissions';
import CounterSetup from './pages/CounterManagement/CounterSetup';
import AddDevotee from './pages/DevoteeManagement/AddDevotee';
import AddSeva from './pages/SevaManagement/AddSeva';
import SevaBooking from './pages/SevaManagement/SevaBooking';
import AddDonation from './pages/DonationManagement/AddDonation';
import AddPrasadaItem from './pages/PrasadaSales/AddPrasadaItem';
import PrasadaBilling from './pages/PrasadaSales/PrasadaBilling';
import RoomSetup from './pages/Accommodation/RoomSetup';
import RoomBooking from './pages/Accommodation/RoomBooking';
import AddItem from './pages/Inventory/AddItem';
import StockEntry from './pages/Inventory/StockEntry';
import GenerateReceipt from './pages/BillingSystem/GenerateReceipt';
import LedgerEntry from './pages/Accounts/LedgerEntry';
import CashBook from './pages/Accounts/CashBook';
import DailyReport from './pages/Reports/DailyReport';
import DonationReport from './pages/Reports/DonationReport';
import SevaReport from './pages/Reports/SevaReport';
import AlertSystem from './pages/Alerts/AlertSystem';
import AuditLogs from './pages/AuditLogs/AuditLogs';
import AddExpense from './pages/ExpenseManagement/AddExpense';
import ReceiptConfiguration from './pages/ReceiptConfig/ReceiptConfiguration';
import FestivalManagement from './pages/FestivalManagement/FestivalManagement';
import StaffManagement from './pages/StaffManagement/StaffManagement';
import BackupRestore from './pages/Security/BackupRestore';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/transactions" element={<ViewAllTransactions />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="users" element={<UsersList />} />
          <Route path="users/roles" element={<RolePermissions />} />
          <Route path="counters/setup" element={<CounterSetup />} />
          <Route path="devotees/add" element={<AddDevotee />} />
          <Route path="seva/add" element={<AddSeva />} />
          <Route path="seva/book" element={<SevaBooking />} />
          <Route path="donations/add" element={<AddDonation />} />
          <Route path="prasada/items" element={<AddPrasadaItem />} />
          <Route path="prasada/billing" element={<PrasadaBilling />} />
          <Route path="accommodation/rooms" element={<RoomSetup />} />
          <Route path="accommodation/book" element={<RoomBooking />} />
          <Route path="inventory/items" element={<AddItem />} />
          <Route path="inventory/stock" element={<StockEntry />} />
          <Route path="billing/receipt" element={<GenerateReceipt />} />
          <Route path="accounts/ledger" element={<LedgerEntry />} />
          <Route path="accounts/cashbook" element={<CashBook />} />
          <Route path="reports/daily" element={<DailyReport />} />
          <Route path="reports/donation" element={<DonationReport />} />
          <Route path="reports/seva" element={<SevaReport />} />
          <Route path="alerts" element={<AlertSystem />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="expenses" element={<AddExpense />} />
          <Route path="receipt-config" element={<ReceiptConfiguration />} />
          <Route path="festivals" element={<FestivalManagement />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="security/backup" element={<BackupRestore />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );

}

export default App;
