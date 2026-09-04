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
import BranchSettings from './pages/Organization/BranchSettings';
import Users from './pages/Administration/Users';
import AddUser from './pages/Administration/AddUser';
import UserDetails from './pages/Administration/UserDetails';
import EditUser from './pages/Administration/EditUser';
import Roles from './pages/Administration/Roles';
import Permissions from './pages/Administration/Permissions';
import UserBranchAccess from './pages/Administration/UserBranchAccess';
import Employees from './pages/HR/Employees';
import Departments from './pages/HR/Departments';
import DepartmentDetails from './pages/HR/DepartmentDetails';
import Designations from './pages/HR/Designations';
import EmployeeDocuments from './pages/HR/EmployeeDocuments';
import LeaveVacation from './pages/HR/LeaveVacation';
import EmployeeHistory from './pages/HR/EmployeeHistory';
import DailyAttendance from './pages/Attendance/DailyAttendance';
import CheckInOut from './pages/Attendance/CheckInOut';
import Overtime from './pages/Attendance/Overtime';
import AttendanceReports from './pages/Attendance/AttendanceReports';
import Salary from './pages/Payroll/Salary';
import Advances from './pages/Payroll/Advances';
import Deductions from './pages/Payroll/Deductions';
import SalaryHistory from './pages/Payroll/SalaryHistory';
import Products from './pages/Inventory/Products';
import Categories from './pages/Inventory/Categories';
import Stock from './pages/Inventory/Stock';
import StockUsage from './pages/Inventory/StockUsage';
import StockLedger from './pages/Inventory/StockLedger';
import LowStock from './pages/Inventory/LowStock';
import Suppliers from './pages/Procurement/Suppliers';
import Purchases from './pages/Procurement/Purchases';
import PurchaseItems from './pages/Procurement/PurchaseItems';
import CreditPurchases from './pages/Procurement/CreditPurchases';
import SupplierPayments from './pages/Procurement/SupplierPayments';
import SupplierLedger from './pages/Procurement/SupplierLedger';
import Income from './pages/Finance/Income';
import Expenses from './pages/Finance/Expenses';
import PettyCash from './pages/Finance/PettyCash';
import OwnerFunding from './pages/Finance/OwnerFunding';
import CashTransfers from './pages/Finance/CashTransfers';
import SupplierPayables from './pages/Finance/SupplierPayables';
import Budgets from './pages/Finance/Budgets';
import FinancialLedger from './pages/Finance/FinancialLedger';
import Customers from './pages/CRM/Customers';
import CustomerProfiles from './pages/CRM/CustomerProfiles';
import CustomerHistory from './pages/CRM/CustomerHistory';
import CustomerSegments from './pages/CRM/CustomerSegments';
import WhatsAppCommunication from './pages/CRM/WhatsAppCommunication';
import Cooks from './pages/BusinessContacts/Cooks';
import Workers from './pages/BusinessContacts/Workers';
import Drivers from './pages/BusinessContacts/Drivers';
import Vendors from './pages/BusinessContacts/Vendors';
import OtherContacts from './pages/BusinessContacts/OtherContacts';
import SystemAlerts from './pages/Notifications/SystemAlerts';
import BudgetAlerts from './pages/Notifications/BudgetAlerts';
import StockAlerts from './pages/Notifications/StockAlerts';
import HRAlerts from './pages/Notifications/HRAlerts';
import FinanceAlerts from './pages/Notifications/FinanceAlerts';
import HRReports from './pages/Reports/HRReports';
import FinanceReports from './pages/Reports/FinanceReports';
import InventoryReports from './pages/Reports/InventoryReports';
import SupplierReports from './pages/Reports/SupplierReports';
import BudgetReports from './pages/Reports/BudgetReports';
import BranchReports from './pages/Reports/BranchReports';
import ActivityLogs from './pages/Audit/ActivityLogs';
import CompanyOverview from './pages/Dashboard/CompanyOverview';
import BranchOverview from './pages/Dashboard/BranchOverview';
import Finance from './pages/Dashboard/Finance';
import HR from './pages/Dashboard/HR';
import Inventory from './pages/Dashboard/Inventory';
import DashboardSuppliers from './pages/Dashboard/Suppliers';
import DashboardBudgets from './pages/Dashboard/Budgets';
import Alerts from './pages/Dashboard/Alerts';


// Layout wrapper for protected pages
const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#0F111A] overflow-hidden text-gray-200 font-sans">
      <Sidebar />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto bg-[#F8F9FA] shadow-2xl relative text-gray-900 border-l border-gray-200">
        <Navbar />
        <div className="p-8">
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
          <Route path="/organization/branchsettings" element={<Layout><BranchSettings /></Layout>} />
          <Route path="/administration/users" element={<Layout><Users /></Layout>} />
          <Route path="/administration/users/new" element={<Layout><AddUser /></Layout>} />
          <Route path="/administration/users/add" element={<Layout><AddUser /></Layout>} />
          <Route path="/administration/users/invite" element={<Layout><AddUser /></Layout>} />
          <Route path="/administration/users/:id" element={<Layout><UserDetails /></Layout>} />
          <Route path="/administration/users/:id/edit" element={<Layout><EditUser /></Layout>} />
          <Route path="/administration/users/edit/:id" element={<Layout><EditUser /></Layout>} />
          <Route path="/administration/roles" element={<Layout><Roles /></Layout>} />
          <Route path="/administration/permissions" element={<Layout><Permissions /></Layout>} />
          <Route path="/administration/userbranchaccess" element={<Layout><UserBranchAccess /></Layout>} />
          <Route path="/hr/employees" element={<Layout><Employees /></Layout>} />
          <Route path="/hr/departments" element={<Layout><Departments /></Layout>} />
          <Route path="/hr/departments/:id" element={<Layout><DepartmentDetails /></Layout>} />
          <Route path="/hr/designations" element={<Layout><Designations /></Layout>} />
          <Route path="/hr/employeedocuments" element={<Layout><EmployeeDocuments /></Layout>} />
          <Route path="/hr/leavevacation" element={<Layout><LeaveVacation /></Layout>} />
          <Route path="/hr/employeehistory" element={<Layout><EmployeeHistory /></Layout>} />
          <Route path="/attendance/dailyattendance" element={<Layout><DailyAttendance /></Layout>} />
          <Route path="/attendance/checkinout" element={<Layout><CheckInOut /></Layout>} />
          <Route path="/attendance/overtime" element={<Layout><Overtime /></Layout>} />
          <Route path="/attendance/attendancereports" element={<Layout><AttendanceReports /></Layout>} />
          <Route path="/payroll/salary" element={<Layout><Salary /></Layout>} />
          <Route path="/payroll/advances" element={<Layout><Advances /></Layout>} />
          <Route path="/payroll/deductions" element={<Layout><Deductions /></Layout>} />
          <Route path="/payroll/salaryhistory" element={<Layout><SalaryHistory /></Layout>} />
          <Route path="/inventory/products" element={<Layout><Products /></Layout>} />
          <Route path="/inventory/categories" element={<Layout><Categories /></Layout>} />
          <Route path="/inventory/stock" element={<Layout><Stock /></Layout>} />
          <Route path="/inventory/stockusage" element={<Layout><StockUsage /></Layout>} />
          <Route path="/inventory/stockledger" element={<Layout><StockLedger /></Layout>} />
          <Route path="/inventory/lowstock" element={<Layout><LowStock /></Layout>} />
          <Route path="/procurement/suppliers" element={<Layout><Suppliers /></Layout>} />
          <Route path="/procurement/purchases" element={<Layout><Purchases /></Layout>} />
          <Route path="/procurement/purchaseitems" element={<Layout><PurchaseItems /></Layout>} />
          <Route path="/procurement/creditpurchases" element={<Layout><CreditPurchases /></Layout>} />
          <Route path="/procurement/supplierpayments" element={<Layout><SupplierPayments /></Layout>} />
          <Route path="/procurement/supplierledger" element={<Layout><SupplierLedger /></Layout>} />
          <Route path="/finance/income" element={<Layout><Income /></Layout>} />
          <Route path="/finance/expenses" element={<Layout><Expenses /></Layout>} />
          <Route path="/finance/pettycash" element={<Layout><PettyCash /></Layout>} />
          <Route path="/finance/ownerfunding" element={<Layout><OwnerFunding /></Layout>} />
          <Route path="/finance/cashtransfers" element={<Layout><CashTransfers /></Layout>} />
          <Route path="/finance/supplierpayables" element={<Layout><SupplierPayables /></Layout>} />
          <Route path="/finance/budgets" element={<Layout><Budgets /></Layout>} />
          <Route path="/finance/financialledger" element={<Layout><FinancialLedger /></Layout>} />
          <Route path="/crm/customers" element={<Layout><Customers /></Layout>} />
          <Route path="/crm/customerprofiles" element={<Layout><CustomerProfiles /></Layout>} />
          <Route path="/crm/customerhistory" element={<Layout><CustomerHistory /></Layout>} />
          <Route path="/crm/customersegments" element={<Layout><CustomerSegments /></Layout>} />
          <Route path="/crm/whatsappcommunication" element={<Layout><WhatsAppCommunication /></Layout>} />
          <Route path="/businesscontacts/cooks" element={<Layout><Cooks /></Layout>} />
          <Route path="/businesscontacts/workers" element={<Layout><Workers /></Layout>} />
          <Route path="/businesscontacts/drivers" element={<Layout><Drivers /></Layout>} />
          <Route path="/businesscontacts/vendors" element={<Layout><Vendors /></Layout>} />
          <Route path="/businesscontacts/othercontacts" element={<Layout><OtherContacts /></Layout>} />
          <Route path="/notifications/systemalerts" element={<Layout><SystemAlerts /></Layout>} />
          <Route path="/notifications/budgetalerts" element={<Layout><BudgetAlerts /></Layout>} />
          <Route path="/notifications/stockalerts" element={<Layout><StockAlerts /></Layout>} />
          <Route path="/notifications/hralerts" element={<Layout><HRAlerts /></Layout>} />
          <Route path="/notifications/financealerts" element={<Layout><FinanceAlerts /></Layout>} />
          <Route path="/reports/hrreports" element={<Layout><HRReports /></Layout>} />
          <Route path="/reports/financereports" element={<Layout><FinanceReports /></Layout>} />
          <Route path="/reports/inventoryreports" element={<Layout><InventoryReports /></Layout>} />
          <Route path="/reports/supplierreports" element={<Layout><SupplierReports /></Layout>} />
          <Route path="/reports/budgetreports" element={<Layout><BudgetReports /></Layout>} />
          <Route path="/reports/branchreports" element={<Layout><BranchReports /></Layout>} />
          <Route path="/audit/activitylogs" element={<Layout><ActivityLogs /></Layout>} />
          <Route path="/dashboard/companyoverview" element={<Layout><CompanyOverview /></Layout>} />
          <Route path="/dashboard/branchoverview" element={<Layout><BranchOverview /></Layout>} />
          <Route path="/dashboard/finance" element={<Layout><Finance /></Layout>} />
          <Route path="/dashboard/hr" element={<Layout><HR /></Layout>} />
          <Route path="/dashboard/inventory" element={<Layout><Inventory /></Layout>} />
          <Route path="/dashboard/suppliers" element={<Layout><DashboardSuppliers /></Layout>} />
          <Route path="/dashboard/budgets" element={<Layout><DashboardBudgets /></Layout>} />
          <Route path="/dashboard/alerts" element={<Layout><Alerts /></Layout>} />

        </Route>

        {/* Wildcard 404 path */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
