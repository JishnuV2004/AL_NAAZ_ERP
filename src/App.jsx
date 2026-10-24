import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Route Guards
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';
import PublicRoute from './components/routes/PublicRoute';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Auto-generated Pages
import Company from './pages/Organization/Company';
import Branches from './pages/Organization/Branches';
import Users from './pages/Administration/Users';
import AddUser from './pages/Administration/AddUser';
import UserDetails from './pages/Administration/UserDetails';
import EditUser from './pages/Administration/EditUser';
import Roles from './pages/Administration/Roles';
import UserBranchAccess from './pages/Administration/UserBranchAccess';
import Employees from './pages/HR/Employees';
import Departments from './pages/HR/Departments';
import DepartmentDetails from './pages/HR/DepartmentDetails';
import EmployeeDocuments from './pages/HR/EmployeeDocuments';
import LeaveVacation from './pages/HR/LeaveVacation';
import ClearanceItems from './pages/HR/ClearanceItems';
import ClearanceDetails from './pages/HR/ClearanceDetails';
import ClearancePayments from './pages/HR/ClearancePayments';
import DailyAttendance from './pages/Attendance/DailyAttendance';
import Overtime from './pages/Attendance/Overtime';
import AttendanceReports from './pages/Attendance/AttendanceReports';
import Salary from './pages/Payroll/Salary';
import EmployeeSalaryHistory from './pages/Payroll/EmployeeSalaryHistory';
import Advances from './pages/Payroll/Advances';
import Deductions from './pages/Payroll/Deductions';
import Products from './pages/Inventory/Products';
import Categories from './pages/Inventory/Categories';
import Stock from './pages/Inventory/Stock';
import StockUsage from './pages/Inventory/StockUsage';
import StockAdjustments from './pages/Inventory/StockAdjustments';
import StockLedger from './pages/Inventory/StockLedger';
import LowStock from './pages/Inventory/LowStock';
import Suppliers from './pages/Procurement/Suppliers';
import Purchases from './pages/Procurement/Purchases';
import CreditPurchases from './pages/Procurement/CreditPurchases';
import SupplierPayments from './pages/Procurement/SupplierPayments';
import SupplierLedger from './pages/Procurement/SupplierLedger';
import FinanceOverview from './pages/Finance/Overview';
import DailySales from './pages/Finance/DailySales';
import FinancialAccounts from './pages/Finance/FinancialAccounts';
import WorkflowReference from './pages/Finance/WorkflowReference';
import Receivables from './pages/Finance/Receivables';
import Expenses from './pages/Finance/Expenses';
import PettyCash from './pages/Finance/PettyCash';
import CashTransfers from './pages/Finance/CashTransfers';
import SupplierPayables from './pages/Finance/SupplierPayables';
import Transactions from './pages/Finance/Transactions';
import DeliveryPartners from './pages/Finance/DeliveryPartners';
import Cooks from './pages/BusinessContacts/Cooks';
import Workers from './pages/BusinessContacts/Workers';
import Drivers from './pages/BusinessContacts/Drivers';
import Vendors from './pages/BusinessContacts/Vendors';
import OtherContacts from './pages/BusinessContacts/OtherContacts';
import Notifications from './pages/Notifications';
import ActivityLogs from './pages/Audit/ActivityLogs';
import CompanyOverview from './pages/Dashboard/CompanyOverview';


// Layout wrapper for protected pages
const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#0F111A] overflow-hidden text-gray-200 font-sans">
      <Sidebar />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto bg-[#F8F9FA] shadow-2xl relative text-gray-900 border-l border-gray-200">
        <Navbar />
        <div className="p-3 sm:p-4">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Route Index Redirection */}
        <Route path="/" element={<Navigate to="/dashboard/companyoverview" replace />} />

        {/* Public auth paths */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected app paths */}
        <Route element={<ProtectedRoute />}>
          <Route path="/organization/company" element={<Layout><Company /></Layout>} />
          <Route path="/organization/branches" element={<Layout><Branches /></Layout>} />
          <Route path="/administration/users" element={<Layout><Users /></Layout>} />
          <Route path="/administration/users/new" element={<Layout><AddUser /></Layout>} />
          <Route path="/administration/users/add" element={<Layout><AddUser /></Layout>} />
          <Route path="/administration/users/invite" element={<Layout><AddUser /></Layout>} />
          <Route path="/administration/users/:id" element={<Layout><UserDetails /></Layout>} />
          <Route path="/administration/users/:id/edit" element={<Layout><EditUser /></Layout>} />
          <Route path="/administration/users/edit/:id" element={<Layout><EditUser /></Layout>} />
          <Route path="/administration/roles" element={<Layout><Roles /></Layout>} />
          <Route path="/administration/userbranchaccess" element={<Layout><UserBranchAccess /></Layout>} />
          <Route path="/hr/employees" element={<Layout><Employees /></Layout>} />
          <Route path="/hr/departments" element={<Layout><Departments /></Layout>} />
          <Route path="/hr/departments/:id" element={<Layout><DepartmentDetails /></Layout>} />
          <Route path="/hr/employeedocuments" element={<Layout><EmployeeDocuments /></Layout>} />
          <Route path="/hr/leavevacation" element={<Layout><LeaveVacation /></Layout>} />
          <Route path="/hr/clearance-items" element={<Layout><ClearanceItems /></Layout>} />
          <Route path="/hr/clearance-items/:id" element={<Layout><ClearanceDetails /></Layout>} />
          <Route path="/hr/clearance" element={<Navigate to="/hr/clearance-items" replace />} />
          <Route path="/hr/clearance-payments" element={<Layout><ClearancePayments /></Layout>} />
          <Route path="/hr/payments" element={<Layout><ClearancePayments /></Layout>} />
          <Route path="/attendance/dailyattendance" element={<Layout><DailyAttendance /></Layout>} />
          <Route path="/attendance/overtime" element={<Layout><Overtime /></Layout>} />
          <Route path="/attendance/attendancereports" element={<Layout><AttendanceReports /></Layout>} />
          <Route path="/payroll/salary" element={<Layout><Salary /></Layout>} />
          <Route path="/payroll/employee-salary-history" element={<Layout><EmployeeSalaryHistory /></Layout>} />
          <Route path="/payroll/advances" element={<Layout><Advances /></Layout>} />
          <Route path="/payroll/deductions" element={<Layout><Deductions /></Layout>} />
          <Route path="/inventory/products" element={<Layout><Products /></Layout>} />
          <Route path="/inventory/categories" element={<Layout><Categories /></Layout>} />
          <Route path="/inventory/stock" element={<Layout><Stock /></Layout>} />
          <Route path="/inventory/stockusage" element={<Layout><StockUsage /></Layout>} />
          <Route path="/inventory/stockadjustments" element={<Layout><StockAdjustments /></Layout>} />
          <Route path="/inventory/adjustments" element={<Layout><StockAdjustments /></Layout>} />
          <Route path="/inventory/stockledger" element={<Layout><StockLedger /></Layout>} />
          <Route path="/inventory/lowstock" element={<Layout><LowStock /></Layout>} />
          <Route path="/procurement/suppliers" element={<Layout><Suppliers /></Layout>} />
          <Route path="/procurement/purchases" element={<Layout><Purchases /></Layout>} />
          <Route path="/procurement/creditpurchases" element={<Layout><CreditPurchases /></Layout>} />
          <Route path="/procurement/supplierpayments" element={<Layout><SupplierPayments /></Layout>} />
          <Route path="/procurement/supplierledger" element={<Layout><SupplierLedger /></Layout>} />
          <Route path="/finance" element={<Navigate to="/finance/overview" replace />} />
          <Route path="/finance/overview" element={<Layout><FinanceOverview /></Layout>} />
          <Route path="/finance/dailysales" element={<Layout><DailySales /></Layout>} />
          <Route path="/finance/financialaccounts" element={<Layout><FinancialAccounts /></Layout>} />
          <Route path="/finance/workflowreference" element={<Layout><WorkflowReference /></Layout>} />
          <Route path="/finance/receivables" element={<Layout><Receivables /></Layout>} />
          <Route path="/finance/expenses" element={<Layout><Expenses /></Layout>} />
          <Route path="/finance/pettycash" element={<Layout><PettyCash /></Layout>} />
          <Route path="/finance/transactions" element={<Navigate to="/finance/overview" replace />} />
          <Route path="/finance/cashtransfers" element={<Layout><Transactions /></Layout>} />
          <Route path="/finance/supplierpayables" element={<Layout><SupplierPayables /></Layout>} />
          <Route path="/finance/deliverypartners" element={<Layout><DeliveryPartners /></Layout>} />
          <Route path="/finance/commissionrates" element={<Layout><DeliveryPartners /></Layout>} />
          <Route path="/businesscontacts/cooks" element={<Layout><Cooks /></Layout>} />
          <Route path="/businesscontacts/workers" element={<Layout><Workers /></Layout>} />
          <Route path="/businesscontacts/drivers" element={<Layout><Drivers /></Layout>} />
          <Route path="/businesscontacts/vendors" element={<Layout><Vendors /></Layout>} />
          <Route path="/businesscontacts/othercontacts" element={<Layout><OtherContacts /></Layout>} />
          <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
          <Route path="/notifications/*" element={<Navigate to="/notifications" replace />} />
          <Route path="/audit/activitylogs" element={<Layout><ActivityLogs /></Layout>} />
          <Route path="/dashboard" element={<Layout><CompanyOverview /></Layout>} />
          <Route path="/dashboard/companyoverview" element={<Layout><CompanyOverview /></Layout>} />

        </Route>

        {/* Wildcard 404 path */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
