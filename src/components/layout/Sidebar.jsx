import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import {
  Building2, ShieldCheck, Users, CalendarClock, CreditCard, Package,
  ShoppingCart, Banknote, Target, Contact, Bell, FileBarChart, ShieldAlert,
  ChevronDown, ChevronRight, Settings, LogOut, LayoutDashboard
} from 'lucide-react';

const MENU_GROUPS = [
  {
    id: '00',
    name: 'Dashboard',
    icon: LayoutDashboard,
    links: [
      { name: 'Company Overview', path: '/dashboard/companyoverview' },
      // { name: 'Branch Overview', path: '/dashboard/branchoverview' },
      // { name: 'Finance', path: '/dashboard/finance' },
      // { name: 'HR', path: '/dashboard/hr' },
      // { name: 'Inventory', path: '/dashboard/inventory' },
      // { name: 'Suppliers', path: '/dashboard/suppliers' },
      // { name: 'Budgets', path: '/dashboard/budgets' },
      // { name: 'Alerts', path: '/dashboard/alerts' }
    ]
  },
  {
    id: '01',
    name: 'Organization',
    icon: Building2,
    links: [
      { name: 'Company', path: '/organization/company' },
      { name: 'Branches', path: '/organization/branches' },
      { name: 'Branch Settings', path: '/organization/branchsettings' }
    ]
  },
  {
    id: '02',
    name: 'Administration',
    icon: ShieldCheck,
    links: [
      { name: 'Users', path: '/administration/users' },
      { name: 'Roles', path: '/administration/roles' },
      { name: 'Permissions', path: '/administration/permissions' },
      { name: 'User Branch Access', path: '/administration/userbranchaccess' }
    ]
  },
  {
    id: '03',
    name: 'HR',
    icon: Users,
    links: [
      { name: 'Employees', path: '/hr/employees' },
      { name: 'Departments', path: '/hr/departments' },
      { name: 'Designations', path: '/hr/designations' },
      { name: 'Employee Documents', path: '/hr/employeedocuments' },
      { name: 'Leave / Vacation', path: '/hr/leavevacation' },
      { name: 'Employee History', path: '/hr/employeehistory' }
    ]
  },
  {
    id: '04',
    name: 'Attendance',
    icon: CalendarClock,
    links: [
      { name: 'Daily Attendance', path: '/attendance/dailyattendance' },
      { name: 'Check In / Out', path: '/attendance/checkinout' },
      { name: 'Overtime', path: '/attendance/overtime' },
      { name: 'Attendance Reports', path: '/attendance/attendancereports' }
    ]
  },
  {
    id: '05',
    name: 'Payroll',
    icon: CreditCard,
    links: [
      { name: 'Salary', path: '/payroll/salary' },
      { name: 'Advances', path: '/payroll/advances' },
      { name: 'Deductions', path: '/payroll/deductions' },
      { name: 'Salary History', path: '/payroll/salaryhistory' }
    ]
  },
  {
    id: '06',
    name: 'Inventory',
    icon: Package,
    links: [
      { name: 'Products', path: '/inventory/products' },
      { name: 'Categories', path: '/inventory/categories' },
      { name: 'Stock', path: '/inventory/stock' },
      { name: 'Stock Usage', path: '/inventory/stockusage' },
      { name: 'Stock Ledger', path: '/inventory/stockledger' },
      { name: 'Low Stock', path: '/inventory/lowstock' }
    ]
  },
  {
    id: '07',
    name: 'Procurement',
    icon: ShoppingCart,
    links: [
      { name: 'Suppliers', path: '/procurement/suppliers' },
      { name: 'Purchases', path: '/procurement/purchases' },
      { name: 'Purchase Items', path: '/procurement/purchaseitems' },
      { name: 'Credit Purchases', path: '/procurement/creditpurchases' },
      { name: 'Supplier Payments', path: '/procurement/supplierpayments' },
      { name: 'Supplier Ledger', path: '/procurement/supplierledger' }
    ]
  },
  {
    id: '08',
    name: 'Finance',
    icon: Banknote,
    links: [
      { name: 'Income', path: '/finance/income' },
      { name: 'Expenses', path: '/finance/expenses' },
      { name: 'Petty Cash', path: '/finance/pettycash' },
      { name: 'Owner Funding', path: '/finance/ownerfunding' },
      { name: 'Cash Transfers', path: '/finance/cashtransfers' },
      { name: 'Supplier Payables', path: '/finance/supplierpayables' },
      { name: 'Budgets', path: '/finance/budgets' },
      { name: 'Financial Ledger', path: '/finance/financialledger' }
    ]
  },
  {
    id: '09',
    name: 'CRM',
    icon: Target,
    links: [
      { name: 'Customers', path: '/crm/customers' },
      { name: 'Customer Profiles', path: '/crm/customerprofiles' },
      { name: 'Customer History', path: '/crm/customerhistory' },
      { name: 'Customer Segments', path: '/crm/customersegments' },
      { name: 'WhatsApp', path: '/crm/whatsappcommunication' }
    ]
  },
  {
    id: '10',
    name: 'Business Contacts',
    icon: Contact,
    links: [
      { name: 'Cooks', path: '/businesscontacts/cooks' },
      { name: 'Workers', path: '/businesscontacts/workers' },
      { name: 'Drivers', path: '/businesscontacts/drivers' },
      { name: 'Vendors', path: '/businesscontacts/vendors' },
      { name: 'Other', path: '/businesscontacts/othercontacts' }
    ]
  },
  {
    id: '11',
    name: 'Notifications',
    icon: Bell,
    links: [
      { name: 'System Alerts', path: '/notifications/systemalerts' },
      { name: 'Budget Alerts', path: '/notifications/budgetalerts' },
      { name: 'Stock Alerts', path: '/notifications/stockalerts' },
      { name: 'HR Alerts', path: '/notifications/hralerts' },
      { name: 'Finance Alerts', path: '/notifications/financealerts' }
    ]
  },
  {
    id: '12',
    name: 'Reports',
    icon: FileBarChart,
    links: [
      { name: 'HR Reports', path: '/reports/hrreports' },
      { name: 'Finance Reports', path: '/reports/financereports' },
      { name: 'Inventory Reports', path: '/reports/inventoryreports' },
      { name: 'Supplier Reports', path: '/reports/supplierreports' },
      { name: 'Budget Reports', path: '/reports/budgetreports' },
      { name: 'Branch Reports', path: '/reports/branchreports' }
    ]
  },
  {
    id: '13',
    name: 'Audit',
    icon: ShieldAlert,
    links: [
      { name: 'Activity Logs', path: '/audit/activitylogs' }
    ]
  }
];

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // Find which group is currently active based on URL
  const activeGroupId = MENU_GROUPS.find(group =>
    group.links.some(link => location.pathname.startsWith(link.path))
  )?.id || '00';

  const [expandedGroup, setExpandedGroup] = useState(activeGroupId);
  const [isHovered, setIsHovered] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleGroup = (id) => {
    setExpandedGroup(expandedGroup === id ? null : id);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await authService.logout();
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`h-screen shrink-0 bg-[#161925] text-[#94A3B8] flex flex-col font-sans border-r border-[#1E2336] transition-all duration-300 relative z-50 ${isHovered ? 'w-72' : 'w-[84px]'}`}
    >
      {/* Header / Logo */}
      <div className={`p-6 flex items-center gap-3 transition-all duration-300 ${!isHovered ? 'justify-center p-4' : ''}`}>
        <div className="w-11 h-11 shrink-0 bg-white/10 rounded-xl flex items-center justify-center p-1.5 backdrop-blur-sm border border-white/5">
          <img
            src="/logo/al-naaz-mandi-logo-transparent.png"
            alt="Al Naaz"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
        {isHovered && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-white font-bold text-lg leading-tight">Al Naaz Group</h1>
            <p className="text-xs text-[#94A3B8]">Group Operations</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-2 space-y-1 custom-scrollbar ${isHovered ? 'px-4' : 'px-3'}`}>
        {MENU_GROUPS.map((group) => {
          const Icon = group.icon;
          const isExpanded = expandedGroup === group.id;
          const hasActiveChild = group.links.some(link => location.pathname.startsWith(link.path));

          return (
            <div key={group.id} className="mb-2">
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${isExpanded || hasActiveChild ? 'bg-[#1E2336] text-white' : 'hover:bg-[#1E2336]/50 hover:text-white'} ${!isHovered ? 'justify-center' : ''}`}
                title={!isHovered ? group.name : ''}
              >
                <div className={`flex items-center gap-3 ${!isHovered ? 'justify-center w-full' : ''}`}>
                  {isHovered && (
                    <span className={`text-xs font-mono ${isExpanded || hasActiveChild ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
                      {group.id}
                    </span>
                  )}
                  <Icon size={isHovered ? 18 : 22} className={isExpanded || hasActiveChild ? 'text-white' : 'text-[#94A3B8]'} />
                  {isHovered && <span className="font-medium text-sm whitespace-nowrap">{group.name}</span>}
                </div>
                {isHovered && (
                  isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                )}
              </button>

              {/* Sub-menu */}
              {isHovered && isExpanded && (
                <div className="mt-1 ml-[46px] flex flex-col space-y-1 border-l border-[#2E364F] py-2">
                  {group.links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        className={`relative pl-4 pr-3 py-2 text-sm transition-colors duration-200 whitespace-nowrap ${isActive ? 'text-[#EAB308] font-medium' : 'text-[#94A3B8] hover:text-white'}`}
                      >
                        {link.name}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className={`p-4 border-t border-[#1E2336] bg-[#12141D] flex ${!isHovered ? 'flex-col items-center gap-4' : 'justify-between items-center'}`}>
        <div className={`flex items-center ${isHovered ? 'gap-3' : 'justify-center w-full'}`}>
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#1E2336] flex items-center justify-center text-white font-bold border border-[#2E364F]">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          {isHovered && (
            <div className="overflow-hidden whitespace-nowrap">
              <p className="text-sm font-medium text-white">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-[#94A3B8]">{user?.role || 'Super Admin'}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowLogoutModal(true)}
          className={`text-[#94A3B8] hover:text-red-400 transition-colors cursor-pointer shrink-0 ${isHovered ? 'ml-2' : ''}`}
          title="Log Out"
        >
          <LogOut size={isHovered ? 18 : 22} />
        </button>
      </div>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-brand-cream border border-brand-border/40 p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-fade-in-up font-sans">
            <h3 className="text-2xl font-serif font-bold tracking-wide text-brand-brown mb-2">Sign Out</h3>
            <p className="text-brand-text-muted text-sm mb-8 leading-relaxed">Are you sure you want to log out of the Al Naaz Admin Panel?</p>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-xl border border-brand-border text-brand-brown font-bold text-sm hover:bg-brand-border/30 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
