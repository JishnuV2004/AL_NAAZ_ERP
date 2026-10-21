import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  IoAddOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoEyeOutline,
  IoCheckmarkCircleOutline,
  IoReceiptOutline,
  IoWalletOutline,
  IoWarningOutline,
  IoFilterOutline,
  IoSwapHorizontalOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCalendarOutline,
  IoPencilOutline,
  IoTrashOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { Calendar } from '../../components/ui/calendar';
import { expenseService } from '../../services/expenseService';
import { accountService } from '../../services/accountService';
import { financeService } from '../../services/financeService';

// Custom Select Component for crisp filter controls & form dropdowns
const CustomSelect = ({ value, onChange, options, placeholder = 'Select...', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { label: opt.label || opt.name, value: opt.value ?? opt.id };
    }
    return { label: String(opt), value: opt };
  });

  const selectedItem = formattedOptions.find((opt) => String(opt.value) === String(value));
  const isValueEmpty = value === '' || value === null || value === undefined;
  const displayText = selectedItem ? selectedItem.label : (placeholder || 'Select...');
  const isPlaceholder = isValueEmpty || (selectedItem && String(selectedItem.value) === '');

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white hover:border-blue-400 focus:outline-none transition-all font-medium shadow-2xs cursor-pointer"
      >
        <span className={`truncate ${isPlaceholder ? 'text-gray-400 font-normal' : 'text-gray-800 font-semibold'}`}>
          {displayText}
        </span>
        <IoChevronDownOutline className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} size={13} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 font-sans max-h-56 overflow-y-auto">
          {formattedOptions.map((opt) => {
            const isSelected = String(value) === String(opt.value);
            const isOptPlaceholder = String(opt.value) === '';
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? isOptPlaceholder
                      ? 'bg-gray-50 text-gray-400 font-normal'
                      : 'bg-blue-50 text-blue-600 font-bold'
                    : isOptPlaceholder
                    ? 'text-gray-400 font-normal hover:bg-gray-50'
                    : 'text-gray-700 font-semibold hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Metric Card Component (Modeled after CompanyOverview.jsx)
const MetricCard = ({ title, amount, subtitle, icon: Icon, iconBg, iconColor, trend, trendValue }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">{amount}</h3>
      {subtitle && <p className="text-[10px] font-medium text-gray-400 mt-1">{subtitle}</p>}
      {trend && (
        <p className={`text-[10px] font-semibold mt-1 ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trendValue} vs last month
        </p>
      )}
    </div>
    <div className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
      <Icon size={24} />
    </div>
  </div>
);

const Expenses = () => {
  // Page Switcher State: 'expenses' | 'adjustments'
  const [activeTab, setActiveTab] = useState('expenses');

  // --- Expenses View State ---
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [branchFilter, setBranchFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [accountFilter, setAccountFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);

  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const [approvingAdj, setApprovingAdj] = useState(null);
  const [rejectingAdj, setRejectingAdj] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [submittingApprove, setSubmittingApprove] = useState(false);
  const [submittingReject, setSubmittingReject] = useState(false);

  const loadExpenses = async (page = 1) => {
    setLoading(true);
    try {
      const data = await expenseService.fetchExpenses(page, pageSize);
      let list = [];
      let count = 0;

      if (Array.isArray(data)) {
        list = data;
        count = data.length;
      } else if (data && Array.isArray(data.results)) {
        list = data.results;
        count = typeof data.count === 'number' ? data.count : data.results.length;
      }

      setTotalCount(count);
      setCurrentPage(page);

      if (list.length > 0) {
        const mapped = list.map((item) => {
          const formattedDateStr = item.expense_date
            ? new Date(item.expense_date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            : '';
          return {
            id: item.id,
            expenseCode: `#${item.id}`,
            date: item.expense_date || (item.created_at ? item.created_at.slice(0, 10) : ''),
            formattedDate: formattedDateStr,
            branch: item.branch_name || (item.branch ? `Branch #${item.branch}` : '-'),
            branch_id: item.branch,
            category: item.category_name || (item.category ? `Category #${item.category}` : 'General'),
            category_id: item.category,
            paymentAccount: item.payment_account_name || (item.payment_account ? `Account #${item.payment_account}` : '-'),
            payment_account_id: item.payment_account,
            amount: parseFloat(item.amount || 0),
            rawAmount: item.amount,
            description: item.description || '',
            createdBy: item.created_by_name || (item.created_by ? `User #${item.created_by}` : '-')
          };
        });
        setExpenses(mapped);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      console.warn('Failed to load expenses from API:', err);
      setExpenses([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const [branchesList, setBranchesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [accountsList, setAccountsList] = useState([]);

  const [showExpenseCalendarPopover, setShowExpenseCalendarPopover] = useState(false);
  const expenseCalendarRef = useRef(null);

  const [showEditCalendarPopover, setShowEditCalendarPopover] = useState(false);
  const editCalendarRef = useRef(null);

  const [showAdjCalendarPopover, setShowAdjCalendarPopover] = useState(false);
  const adjCalendarRef = useRef(null);

  const [submittingAdj, setSubmittingAdj] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expenseCalendarRef.current && !expenseCalendarRef.current.contains(event.target)) {
        setShowExpenseCalendarPopover(false);
      }
      if (editCalendarRef.current && !editCalendarRef.current.contains(event.target)) {
        setShowEditCalendarPopover(false);
      }
      if (adjCalendarRef.current && !adjCalendarRef.current.contains(event.target)) {
        setShowAdjCalendarPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [newExpense, setNewExpense] = useState({
    branch: '',
    category: '',
    payment_account: '',
    amount: '',
    expense_date: new Date().toISOString().slice(0, 10),
    description: ''
  });

  const loadDropdownData = async () => {
    try {
      const [brRes, catRes, accRes] = await Promise.allSettled([
        accountService.fetchBranches(),
        financeService.fetchExpenseCategories(),
        accountService.fetchAccounts()
      ]);

      let brs = [];
      if (brRes.status === 'fulfilled' && brRes.value) {
        brs = Array.isArray(brRes.value) ? brRes.value : (brRes.value.results || []);
        setBranchesList(brs);
      }

      let cats = [];
      if (catRes.status === 'fulfilled' && catRes.value) {
        cats = Array.isArray(catRes.value) ? catRes.value : (catRes.value.results || []);
        setCategoriesList(cats);
      }

      let accs = [];
      if (accRes.status === 'fulfilled' && accRes.value) {
        accs = Array.isArray(accRes.value) ? accRes.value : (accRes.value.results || []);
        setAccountsList(accs);
      }

      // Do not auto-select any data; user will select manually
    } catch (err) {
      console.warn('Error loading dropdown options:', err);
    }
  };

  // --- Expense Adjustments View State ---
  const [adjustments, setAdjustments] = useState([]);
  const [loadingAdjustments, setLoadingAdjustments] = useState(true);
  const [adjCurrentPage, setAdjCurrentPage] = useState(1);
  const [adjTotalCount, setAdjTotalCount] = useState(0);
  const [adjStatusFilter, setAdjStatusFilter] = useState('All');
  const [adjExpenseFilter, setAdjExpenseFilter] = useState('All');

  const loadAdjustments = async (page = 1) => {
    setLoadingAdjustments(true);
    try {
      const data = await expenseService.fetchExpenseAdjustments(page, pageSize);
      let list = [];
      let count = 0;

      if (Array.isArray(data)) {
        list = data;
        count = data.length;
      } else if (data && Array.isArray(data.results)) {
        list = data.results;
        count = typeof data.count === 'number' ? data.count : data.results.length;
      }

      setAdjTotalCount(count);
      setAdjCurrentPage(page);

      if (list.length > 0) {
        const mapped = list.map((item) => ({
          id: item.id,
          adjustmentCode: `#${item.id}`,
          expenseCode: item.expense_id || item.expense ? `#${item.expense_id || item.expense}` : '-',
          expenseId: item.expense_id || item.expense,
          oldAmount: parseFloat(item.old_amount || 0),
          newAmount: parseFloat(item.new_amount || 0),
          status: item.status || 'PENDING',
          reason: item.reason || '',
          requestedBy: item.requested_by_name || (item.requested_by ? `User #${item.requested_by}` : '-'),
          approvedBy: item.approved_by_name || (item.approved_by ? `User #${item.approved_by}` : ''),
          rejectedBy: item.rejected_by_name || (item.rejected_by ? `User #${item.rejected_by}` : ''),
          rejectionReason: item.rejection_reason || '',
          requestedAt: item.requested_at,
          approvedAt: item.approved_at,
          rejectedAt: item.rejected_at,
          oldCategoryName: item.old_category_name,
          newCategoryName: item.new_category_name,
          oldPaymentAccountName: item.old_payment_account_name,
          newPaymentAccountName: item.new_payment_account_name,
          oldExpenseDate: item.old_expense_date,
          newExpenseDate: item.new_expense_date,
          oldDescription: item.old_description,
          newDescription: item.new_description
        }));
        setAdjustments(mapped);
      } else {
        setAdjustments([]);
      }
    } catch (err) {
      console.warn('Failed to load expense adjustments from API:', err);
      setAdjustments([]);
      setAdjTotalCount(0);
    } finally {
      setLoadingAdjustments(false);
    }
  };

  useEffect(() => {
    loadExpenses(1);
    loadAdjustments(1);
    loadDropdownData();
  }, []);

  const [showRequestAdjModal, setShowRequestAdjModal] = useState(false);
  const [viewingAdjustment, setViewingAdjustment] = useState(null);
  const [loadingAdjDetail, setLoadingAdjDetail] = useState(false);

  const handleViewAdjustment = async (adj) => {
    setViewingAdjustment({
      id: adj.id,
      adjustmentCode: adj.adjustmentCode || `#${adj.id}`,
      expenseCode: adj.expenseCode || `#${adj.expense}`,
      oldAmount: adj.oldAmount || 0,
      newAmount: adj.newAmount || 0,
      status: adj.status || 'PENDING',
      reason: adj.reason || '',
      requestedBy: adj.requestedBy || 'admin'
    });
    setLoadingAdjDetail(true);
    try {
      const data = await expenseService.fetchExpenseAdjustmentById(adj.id);
      if (data) {
        setViewingAdjustment({
          id: data.id,
          adjustmentCode: `#${data.id}`,
          expenseId: data.expense || data.expense_id,
          expenseCode: `#${data.expense || data.expense_id}`,
          status: data.status,
          oldAmount: parseFloat(data.old_amount || 0),
          newAmount: parseFloat(data.new_amount || 0),
          oldPaymentAccount: data.old_payment_account,
          oldPaymentAccountName: data.old_payment_account_name || 'N/A',
          newPaymentAccount: data.new_payment_account,
          newPaymentAccountName: data.new_payment_account_name || 'N/A',
          oldCategory: data.old_category,
          oldCategoryName: data.old_category_name || 'N/A',
          newCategory: data.new_category,
          newCategoryName: data.new_category_name || 'N/A',
          oldExpenseDate: data.old_expense_date,
          newExpenseDate: data.new_expense_date,
          oldDescription: data.old_description,
          newDescription: data.new_description,
          reason: data.reason || 'N/A',
          rejectionReason: data.rejection_reason || '',
          requestedBy: data.requested_by_name || 'admin',
          approvedBy: data.approved_by_name || null,
          rejectedBy: data.rejected_by_name || null,
          requestedAt: data.requested_at,
          approvedAt: data.approved_at,
          rejectedAt: data.rejected_at
        });
      }
    } catch (err) {
      console.warn(`Failed to fetch details for adjustment #${adj.id}:`, err);
    } finally {
      setLoadingAdjDetail(false);
    }
  };

  const [newAdjustment, setNewAdjustment] = useState({
    expense: '',
    new_amount: '',
    new_payment_account: '',
    new_expense_date: new Date().toISOString().slice(0, 10),
    new_category: '',
    new_description: '',
    reason: ''
  });

  // Dynamic filter options from API data
  const branchFilterOptions = useMemo(() => {
    const set = new Set();
    branchesList.forEach((b) => {
      if (b.name) set.add(b.name);
    });
    expenses.forEach((e) => {
      if (e.branch && e.branch !== '-') set.add(e.branch);
    });
    return ['All', ...Array.from(set)];
  }, [branchesList, expenses]);

  const categoryFilterOptions = useMemo(() => {
    const set = new Set();
    categoriesList.forEach((c) => {
      if (c.name) set.add(c.name);
    });
    expenses.forEach((e) => {
      if (e.category && e.category !== '-') set.add(e.category);
    });
    return ['All', ...Array.from(set)];
  }, [categoriesList, expenses]);

  const accountFilterOptions = useMemo(() => {
    const set = new Set();
    accountsList.forEach((a) => {
      if (a.name) set.add(a.name);
    });
    expenses.forEach((e) => {
      if (e.paymentAccount && e.paymentAccount !== '-') set.add(e.paymentAccount);
    });
    return ['All', ...Array.from(set)];
  }, [accountsList, expenses]);

  const adjExpenseFilterOptions = useMemo(() => {
    const set = new Set();
    adjustments.forEach((a) => {
      if (a.expenseCode && a.expenseCode !== '-') set.add(a.expenseCode);
    });
    return ['All', ...Array.from(set)];
  }, [adjustments]);

  // Filtering Logic
  const filteredExpenses = expenses.filter((e) => {
    if (branchFilter && branchFilter !== 'All' && e.branch !== branchFilter) return false;
    if (categoryFilter !== 'All' && e.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (accountFilter !== 'All' && e.paymentAccount.toLowerCase() !== accountFilter.toLowerCase()) return false;
    if (dateFrom && e.date < dateFrom) return false;
    if (dateTo && e.date > dateTo) return false;
    return true;
  });

  const filteredAdjustments = adjustments.filter((a) => {
    if (adjStatusFilter !== 'All' && a.status !== adjStatusFilter) return false;
    if (adjExpenseFilter !== 'All' && a.expenseCode !== adjExpenseFilter) return false;
    return true;
  });

  // Metrics calculation
  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingAdjCount = adjustments.filter((a) => a.status === 'PENDING').length;
  const approvedAdjCount = adjustments.filter((a) => a.status === 'APPROVED').length;

  // Form Submission Handlers
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.branch) {
      toast.error('Please select a Branch');
      return;
    }
    if (!newExpense.category) {
      toast.error('Please select a Category');
      return;
    }
    if (!newExpense.payment_account) {
      toast.error('Please select a Payment Account');
      return;
    }
    const amt = parseFloat(newExpense.amount) || 0;
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid expense amount');
      return;
    }

    const payload = {
      branch: parseInt(newExpense.branch, 10),
      category: parseInt(newExpense.category, 10),
      payment_account: parseInt(newExpense.payment_account, 10),
      amount: amt.toFixed(2),
      expense_date: newExpense.expense_date || new Date().toISOString().slice(0, 10),
      description: newExpense.description?.trim() ? newExpense.description.trim() : 'Expense entry'
    };

    setSubmittingAdd(true);
    try {
      await expenseService.createExpense(payload);
      toast.success('Expense entry added successfully!');
      setShowAddModal(false);
      setNewExpense({
        branch: '',
        category: '',
        payment_account: '',
        amount: '',
        expense_date: new Date().toISOString().slice(0, 10),
        description: ''
      });
      await loadExpenses(1);
    } catch (err) {
      console.error('Failed to create expense detailed error:', err?.response?.data || err);
      let msg = 'Failed to create expense entry';
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.detail) {
          msg = err.response.data.detail;
        } else if (typeof err.response.data === 'object') {
          const fieldErrors = Object.entries(err.response.data).map(([key, val]) => {
            const valStr = Array.isArray(val) ? val.join(', ') : String(val);
            return `${key}: ${valStr}`;
          });
          if (fieldErrors.length > 0) {
            msg = fieldErrors.join(' | ');
          }
        }
      }
      toast.error(msg);
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    if (!editingExpense) return;

    if (!editingExpense.branch) {
      toast.error('Please select a Branch');
      return;
    }
    if (!editingExpense.category) {
      toast.error('Please select a Category');
      return;
    }
    if (!editingExpense.payment_account) {
      toast.error('Please select a Payment Account');
      return;
    }
    const amt = parseFloat(editingExpense.amount) || 0;
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid expense amount');
      return;
    }

    const payload = {
      branch: parseInt(editingExpense.branch, 10),
      category: parseInt(editingExpense.category, 10),
      payment_account: parseInt(editingExpense.payment_account, 10),
      amount: amt.toFixed(2),
      expense_date: editingExpense.expense_date || new Date().toISOString().slice(0, 10),
      description: editingExpense.description?.trim() ? editingExpense.description.trim() : 'Expense entry'
    };

    setSubmittingUpdate(true);
    try {
      await expenseService.updateExpense(editingExpense.id, payload);
      toast.success('Expense entry updated successfully!');
      setEditingExpense(null);
      await loadExpenses(currentPage);
    } catch (err) {
      console.error('Failed to update expense detailed error:', err?.response?.data || err);
      let msg = 'Failed to update expense entry';
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.detail) {
          msg = err.response.data.detail;
        } else if (typeof err.response.data === 'object') {
          const fieldErrors = Object.entries(err.response.data).map(([key, val]) => {
            const valStr = Array.isArray(val) ? val.join(', ') : String(val);
            return `${key}: ${valStr}`;
          });
          if (fieldErrors.length > 0) {
            msg = fieldErrors.join(' | ');
          }
        }
      }
      toast.error(msg);
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingExpense) return;
    setSubmittingDelete(true);
    try {
      await expenseService.deleteExpense(deletingExpense.id);
      toast.success('Expense entry deleted successfully!');
      setDeletingExpense(null);
      await loadExpenses(currentPage);
    } catch (err) {
      console.error('Failed to delete expense:', err);
      const msg = err?.response?.data?.detail || err?.userMessage || 'Failed to delete expense entry';
      toast.error(msg);
    } finally {
      setSubmittingDelete(false);
    }
  };

  const handleRequestAdjustment = async (e) => {
    e.preventDefault();
    if (!newAdjustment.expense) {
      toast.error('Please select an Expense to adjust');
      return;
    }
    const amt = parseFloat(newAdjustment.new_amount) || 0;
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid new amount');
      return;
    }
    if (!newAdjustment.new_payment_account) {
      toast.error('Please select a Payment Account');
      return;
    }
    if (!newAdjustment.new_category) {
      toast.error('Please select a Category');
      return;
    }
    if (!newAdjustment.reason?.trim()) {
      toast.error('Please enter a reason for adjustment');
      return;
    }

    const payload = {
      expense: parseInt(newAdjustment.expense, 10),
      new_amount: amt.toFixed(2),
      new_payment_account: parseInt(newAdjustment.new_payment_account, 10),
      new_expense_date: newAdjustment.new_expense_date || new Date().toISOString().slice(0, 10),
      new_category: parseInt(newAdjustment.new_category, 10),
      new_description: newAdjustment.new_description?.trim() ? newAdjustment.new_description.trim() : 'Expense adjustment',
      reason: newAdjustment.reason.trim()
    };

    setSubmittingAdj(true);
    try {
      await expenseService.createExpenseAdjustment(payload);
      toast.success('Expense adjustment request submitted successfully!');
      setShowRequestAdjModal(false);
      setNewAdjustment({
        expense: '',
        new_amount: '',
        new_payment_account: '',
        new_expense_date: new Date().toISOString().slice(0, 10),
        new_category: '',
        new_description: '',
        reason: ''
      });
      await loadAdjustments(1);
    } catch (err) {
      console.error('Failed to submit adjustment request detailed error:', err?.response?.data || err);
      let msg = 'Failed to submit adjustment request';
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.detail) {
          msg = err.response.data.detail;
        } else if (typeof err.response.data === 'object') {
          const fieldErrors = Object.entries(err.response.data).map(([key, val]) => {
            const valStr = Array.isArray(val) ? val.join(', ') : String(val);
            return `${key}: ${valStr}`;
          });
          if (fieldErrors.length > 0) {
            msg = fieldErrors.join(' | ');
          }
        }
      }
      toast.error(msg);
    } finally {
      setSubmittingAdj(false);
    }
  };

  const handleConfirmApproveAdj = async () => {
    if (!approvingAdj) return;
    setSubmittingApprove(true);
    try {
      await expenseService.approveExpenseAdjustment(approvingAdj.id);
      toast.success(`Adjustment #${approvingAdj.id} approved successfully!`);
      setApprovingAdj(null);
      if (viewingAdjustment && viewingAdjustment.id === approvingAdj.id) {
        setViewingAdjustment(null);
      }
      await loadAdjustments(adjCurrentPage);
      await loadExpenses(currentPage);
    } catch (err) {
      console.error('Failed to approve adjustment:', err);
      const msg = err?.response?.data?.detail || err?.userMessage || 'Failed to approve adjustment';
      toast.error(msg);
    } finally {
      setSubmittingApprove(false);
    }
  };

  const handleConfirmRejectAdj = async () => {
    if (!rejectingAdj) return;
    if (!rejectionReasonInput.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    setSubmittingReject(true);
    try {
      await expenseService.rejectExpenseAdjustment(rejectingAdj.id, {
        rejection_reason: rejectionReasonInput.trim()
      });
      toast.success(`Adjustment #${rejectingAdj.id} rejected successfully!`);
      setRejectingAdj(null);
      setRejectionReasonInput('');
      if (viewingAdjustment && viewingAdjustment.id === rejectingAdj.id) {
        setViewingAdjustment(null);
      }
      await loadAdjustments(adjCurrentPage);
    } catch (err) {
      console.error('Failed to reject adjustment:', err);
      const msg = err?.response?.data?.detail || err?.userMessage || 'Failed to reject adjustment';
      toast.error(msg);
    } finally {
      setSubmittingReject(false);
    }
  };

  return (
    <div className="space-y-6 font-sans w-full pb-12">
      
      {/* 1. Page Switcher Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-gray-400">Finance</span>
            <span className="text-xs text-gray-300">&gt;</span>
            <span className="text-xs font-semibold text-blue-600">
              {activeTab === 'expenses' ? 'Expenses Overview' : 'Expense Adjustments Audit'}
            </span>
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {activeTab === 'expenses' ? 'Expenses' : 'Expense Adjustments'}
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {activeTab === 'expenses'
              ? 'Every expense reduces a financial account and creates an immutable EXPENSE transaction.'
              : 'Approval workflow for correcting posted expenses without altering the original record.'}
          </p>
        </div>

        {/* Top Right Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          {activeTab === 'expenses' ? (
            <button
              onClick={() => {
                setNewExpense({
                  branch: '',
                  category: '',
                  payment_account: '',
                  amount: '',
                  expense_date: new Date().toISOString().slice(0, 10),
                  description: ''
                });
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <IoAddOutline size={16} />
              <span>+ Add Expense</span>
            </button>
          ) : (
            <button
              onClick={() => setShowRequestAdjModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <IoAddOutline size={16} />
              <span>+ Request Adjustment</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Underlined Tab Navigation Switcher */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="flex px-6 border-b border-gray-200 bg-white overflow-x-auto">
          {[
            { id: 'expenses', label: 'Expenses View' },
            { id: 'adjustments', label: 'Expense Adjustments' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-6 py-4 text-sm transition-colors relative cursor-pointer ${
                activeTab === tab.id
                  ? 'text-blue-600 font-bold'
                  : 'text-gray-500 font-semibold hover:text-gray-900'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top Summary Metric Cards Grid (CompanyOverview.jsx Structure) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Expenses"
          amount={`₹ ${totalExpenseSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          subtitle="Total Disbursed"
          icon={IoWalletOutline}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />
        <MetricCard
          title="Expenses Count"
          amount={`${totalCount || expenses.length} Entries`}
          subtitle="Processed Vouchers"
          icon={IoReceiptOutline}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Pending Adjustments"
          amount={`${pendingAdjCount} ${pendingAdjCount === 1 ? 'Request' : 'Requests'}`}
          subtitle="Awaiting Manager Approval"
          icon={IoWarningOutline}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <MetricCard
          title="Approved Adjustments"
          amount={`${approvedAdjCount} Approved`}
          subtitle="Audit Ledger Reconciled"
          icon={IoCheckmarkCircleOutline}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* --- PAGE 1: EXPENSES VIEW --- */}
      {activeTab === 'expenses' && (
        <div className="space-y-5">
          {/* Filter Bar Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4.5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Branch</label>
                <CustomSelect
                  value={branchFilter}
                  onChange={setBranchFilter}
                  options={branchFilterOptions}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category</label>
                <CustomSelect
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={categoryFilterOptions}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Payment Account</label>
                <CustomSelect
                  value={accountFilter}
                  onChange={setAccountFilter}
                  options={accountFilterOptions}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between">
            <div className="overflow-x-auto min-h-[480px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="py-3.5 px-4">Expense ID</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Branch</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Payment Account</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Created By</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                  {loading ? (
                    [...Array(10)].map((_, i) => (
                      <tr key={i} className="animate-pulse h-[48px]">
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                        <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredExpenses.length > 0 ? (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50/60 transition-colors h-[48px]">
                        <td className="py-3.5 px-4 font-bold text-gray-900">{exp.expenseCode}</td>
                        <td className="py-3.5 px-4 font-medium text-gray-800">{exp.formattedDate || exp.date}</td>
                        <td className="py-3.5 px-4 font-medium text-gray-700">{exp.branch}</td>
                        <td className="py-3.5 px-4 font-semibold text-gray-800">{exp.category}</td>
                        <td className="py-3.5 px-4 font-medium text-gray-700">{exp.paymentAccount}</td>
                        <td className="py-3.5 px-4 font-bold text-rose-600 tabular-nums font-mono">
                          - ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-600">{exp.description}</td>
                        <td className="py-3.5 px-4 font-medium text-gray-700">{exp.createdBy}</td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingExpense(exp)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                              title="View Expense Details"
                            >
                              <IoEyeOutline size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingExpense({
                                id: exp.id,
                                expenseCode: exp.expenseCode,
                                branch: exp.branch_id ?? '',
                                category: exp.category_id ?? '',
                                payment_account: exp.payment_account_id ?? '',
                                amount: exp.rawAmount || exp.amount || '',
                                expense_date: exp.date || new Date().toISOString().slice(0, 10),
                                description: exp.description || ''
                              })}
                              className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                              title="Edit Expense"
                            >
                              <IoPencilOutline size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingExpense(exp)}
                              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                              title="Delete Expense"
                            >
                              <IoTrashOutline size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-gray-400 font-medium">
                        No expenses found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {(() => {
              const totalItems = totalCount || filteredExpenses.length;
              const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
              const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
              const endItem = Math.min(currentPage * pageSize, totalItems);

              return (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
                  <div>
                    Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
                    <span className="font-bold text-gray-800">{endItem}</span> of{' '}
                    <span className="font-bold text-gray-800">{totalItems}</span> expenses
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={currentPage === 1 || loading}
                      onClick={() => loadExpenses(currentPage - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <IoChevronBackOutline size={14} />
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          disabled={loading}
                          onClick={() => loadExpenses(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-xs font-bold'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages || loading}
                      onClick={() => loadExpenses(currentPage + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <IoChevronForwardOutline size={14} />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- PAGE 2: EXPENSE ADJUSTMENTS VIEW --- */}
      {activeTab === 'adjustments' && (
        <div className="space-y-5">
          {/* Filter Bar Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4.5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Status</label>
                <CustomSelect
                  value={adjStatusFilter}
                  onChange={setAdjStatusFilter}
                  options={['All', 'PENDING', 'APPROVED', 'REJECTED']}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Expense</label>
                <CustomSelect
                  value={adjExpenseFilter}
                  onChange={setAdjExpenseFilter}
                  options={adjExpenseFilterOptions}
                />
              </div>
            </div>
          </div>

          {/* Expense Adjustments Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between">
            <div className="overflow-x-auto min-h-[480px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="py-3.5 px-4">Adjustment ID</th>
                    <th className="py-3.5 px-4">Expense ID</th>
                    <th className="py-3.5 px-4">Old Amount</th>
                    <th className="py-3.5 px-4">New Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Reason</th>
                    <th className="py-3.5 px-4">Requested By</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {loadingAdjustments ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse h-[48px]">
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-10 mx-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredAdjustments.length > 0 ? (
                    filteredAdjustments.map((adj) => (
                      <tr key={adj.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-900">{adj.adjustmentCode}</td>
                        <td className="py-3.5 px-4 font-bold text-blue-600 font-mono">{adj.expenseCode}</td>
                        <td className="py-3.5 px-4 font-bold text-gray-900 tabular-nums font-mono">
                          ₹{adj.oldAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-gray-900 tabular-nums font-mono">
                          ₹{adj.newAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Status Badges Matching Screenshot 2 */}
                        <td className="py-3.5 px-4">
                          {adj.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              <span>PENDING</span>
                            </span>
                          )}
                          {adj.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                              <span>✓ APPROVED</span>
                            </span>
                          )}
                          {adj.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                              <span>✕ REJECTED</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-gray-600 font-medium max-w-xs leading-relaxed">
                          {adj.reason}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-700">{adj.requestedBy}</td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleViewAdjustment(adj)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs"
                            >
                              View
                            </button>
                            {adj.status === 'PENDING' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setApprovingAdj(adj)}
                                  className="px-2.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingAdj(adj);
                                    setRejectionReasonInput('');
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-400 font-medium">
                        No expense adjustments found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Expense Adjustments Pagination Controls */}
            {(() => {
              const totalItems = adjTotalCount || filteredAdjustments.length;
              const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
              const startItem = totalItems > 0 ? (adjCurrentPage - 1) * pageSize + 1 : 0;
              const endItem = Math.min(adjCurrentPage * pageSize, totalItems);

              return (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
                  <div>
                    Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
                    <span className="font-bold text-gray-800">{endItem}</span> of{' '}
                    <span className="font-bold text-gray-800">{totalItems}</span> adjustments
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={adjCurrentPage === 1 || loadingAdjustments}
                      onClick={() => loadAdjustments(adjCurrentPage - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <IoChevronBackOutline size={14} />
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          disabled={loadingAdjustments}
                          onClick={() => loadAdjustments(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${
                            adjCurrentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-xs font-bold'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      disabled={adjCurrentPage >= totalPages || loadingAdjustments}
                      onClick={() => loadAdjustments(adjCurrentPage + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <IoChevronForwardOutline size={14} />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- MODAL 1: ADD EXPENSE --- */}
      {showAddModal && (() => {
        const branchOptions = [
          { label: 'Select Branch', value: '' },
          ...branchesList.map((b) => ({ label: b.name, value: b.id }))
        ];

        const categoryOptions = [
          { label: 'Select Category', value: '' },
          ...categoriesList.map((c) => ({ label: c.name, value: c.id }))
        ];

        const accountOptions = [
          { label: 'Select Payment Account', value: '' },
          ...accountsList.map((a) => ({ label: `${a.name} (${a.account_type || a.type || 'ACCOUNT'})`, value: a.id }))
        ];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md relative font-sans">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                <h3 className="text-sm font-bold text-gray-900">+ Add Expense Entry</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <IoCloseOutline size={20} />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={newExpense.branch}
                    onChange={(val) => setNewExpense({ ...newExpense, branch: val })}
                    options={branchOptions}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={newExpense.category}
                      onChange={(val) => setNewExpense({ ...newExpense, category: val })}
                      options={categoryOptions}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Payment Account <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={newExpense.payment_account}
                      onChange={(val) => setNewExpense({ ...newExpense, payment_account: val })}
                      options={accountOptions}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="e.g. 2000"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="relative" ref={expenseCalendarRef}>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Expense Date <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowExpenseCalendarPopover(!showExpenseCalendarPopover)}
                      className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none hover:border-blue-400 font-medium cursor-pointer"
                    >
                      <span>
                        {newExpense.expense_date
                          ? newExpense.expense_date.split('-').reverse().join('/')
                          : 'Select date'}
                      </span>
                      <IoCalendarOutline className="text-gray-400 text-sm shrink-0" />
                    </button>

                    {showExpenseCalendarPopover && (
                      <div className="absolute right-0 bottom-full mb-1.5 z-[70] shadow-2xl rounded-2xl bg-white border border-gray-100 p-1 animate-in fade-in zoom-in-95 duration-100">
                        <Calendar
                          value={newExpense.expense_date || new Date().toISOString().slice(0, 10)}
                          onChange={(newDate) => {
                            setNewExpense({ ...newExpense, expense_date: newDate });
                            setShowExpenseCalendarPopover(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Description</label>
                  <textarea
                    rows="2"
                    placeholder="Enter expense details..."
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAdd}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                  >
                    {submittingAdd ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Expense</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* --- MODAL 1.5: EDIT EXPENSE --- */}
      {editingExpense && (() => {
        const branchOptions = [
          { label: 'Select Branch', value: '' },
          ...branchesList.map((b) => ({ label: b.name, value: b.id }))
        ];

        const categoryOptions = [
          { label: 'Select Category', value: '' },
          ...categoriesList.map((c) => ({ label: c.name, value: c.id }))
        ];

        const accountOptions = [
          { label: 'Select Payment Account', value: '' },
          ...accountsList.map((a) => ({ label: `${a.name} (${a.account_type || a.type || 'ACCOUNT'})`, value: a.id }))
        ];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md relative font-sans">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                <h3 className="text-sm font-bold text-gray-900">Edit Expense Entry {editingExpense.expenseCode}</h3>
                <button onClick={() => setEditingExpense(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <IoCloseOutline size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateExpense} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={editingExpense.branch}
                    onChange={(val) => setEditingExpense({ ...editingExpense, branch: val })}
                    options={branchOptions}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={editingExpense.category}
                      onChange={(val) => setEditingExpense({ ...editingExpense, category: val })}
                      options={categoryOptions}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Payment Account <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={editingExpense.payment_account}
                      onChange={(val) => setEditingExpense({ ...editingExpense, payment_account: val })}
                      options={accountOptions}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="e.g. 2000"
                      value={editingExpense.amount}
                      onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                      className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="relative" ref={editCalendarRef}>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Expense Date <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowEditCalendarPopover(!showEditCalendarPopover)}
                      className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none hover:border-blue-400 font-medium cursor-pointer"
                    >
                      <span>
                        {editingExpense.expense_date
                          ? editingExpense.expense_date.split('-').reverse().join('/')
                          : 'Select date'}
                      </span>
                      <IoCalendarOutline className="text-gray-400 text-sm shrink-0" />
                    </button>

                    {showEditCalendarPopover && (
                      <div className="absolute right-0 bottom-full mb-1.5 z-[70] shadow-2xl rounded-2xl bg-white border border-gray-100 p-1 animate-in fade-in zoom-in-95 duration-100">
                        <Calendar
                          value={editingExpense.expense_date || new Date().toISOString().slice(0, 10)}
                          onChange={(newDate) => {
                            setEditingExpense({ ...editingExpense, expense_date: newDate });
                            setShowEditCalendarPopover(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Description</label>
                  <textarea
                    rows="2"
                    placeholder="Enter expense details..."
                    value={editingExpense.description}
                    onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingExpense(null)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingUpdate}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                  >
                    {submittingUpdate ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Expense</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* --- MODAL 1.6: DELETE CONFIRMATION --- */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm overflow-hidden p-6 text-center font-sans">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <IoTrashOutline size={22} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Expense Entry</h3>
            <p className="text-xs text-gray-500 font-medium mb-6">
              Are you sure you want to delete expense voucher <span className="font-bold text-gray-800">{deletingExpense.expenseCode}</span>? This action will remove the record from the database.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={submittingDelete}
                onClick={() => setDeletingExpense(null)}
                className="w-1/2 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingDelete}
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                {submittingDelete ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Entry</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: VIEW EXPENSE DETAILS --- */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Expense Voucher {viewingExpense.expenseCode}</h3>
                <p className="text-[11px] text-gray-500">{viewingExpense.branch} • {viewingExpense.formattedDate}</p>
              </div>
              <button onClick={() => setViewingExpense(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-700 font-semibold">Total Amount Deducted</p>
                  <p className="text-xl font-extrabold text-rose-900 tabular-nums font-mono">
                    - ₹{viewingExpense.amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-rose-100 text-rose-800">
                  {viewingExpense.category}
                </span>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between py-1 text-gray-700">
                  <span>Payment Account:</span>
                  <span className="font-bold text-gray-900">{viewingExpense.paymentAccount}</span>
                </div>
                <div className="flex justify-between py-1 text-gray-700">
                  <span>Description:</span>
                  <span className="font-semibold text-gray-900">{viewingExpense.description}</span>
                </div>
                <div className="flex justify-between py-1 text-gray-700">
                  <span>Created By:</span>
                  <span className="font-bold text-gray-900">{viewingExpense.createdBy}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setViewingExpense(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: REQUEST ADJUSTMENT --- */}
      {showRequestAdjModal && (() => {
        const expenseSelectOptions = [
          { label: 'Select Expense to Adjust', value: '' },
          ...expenses.map((e) => ({
            label: `${e.expenseCode} — ${e.category} (₹${e.amount.toLocaleString('en-IN')})`,
            value: e.id
          }))
        ];

        const categoryOptions = [
          { label: 'Select Category', value: '' },
          ...categoriesList.map((c) => ({ label: c.name, value: c.id }))
        ];

        const accountOptions = [
          { label: 'Select Payment Account', value: '' },
          ...accountsList.map((a) => ({ label: `${a.name} (${a.account_type || a.type || 'ACCOUNT'})`, value: a.id }))
        ];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md relative font-sans">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                <h3 className="text-sm font-bold text-gray-900">+ Request Expense Adjustment</h3>
                <button onClick={() => setShowRequestAdjModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <IoCloseOutline size={20} />
                </button>
              </div>

              <form onSubmit={handleRequestAdjustment} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Select Expense <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={newAdjustment.expense}
                    onChange={(val) => {
                      const selected = expenses.find((e) => String(e.id) === String(val));
                      if (selected) {
                        setNewAdjustment({
                          ...newAdjustment,
                          expense: val,
                          new_amount: selected.rawAmount || String(selected.amount),
                          new_payment_account: selected.payment_account_id || '',
                          new_expense_date: selected.date || new Date().toISOString().slice(0, 10),
                          new_category: selected.category_id || '',
                          new_description: selected.description || '',
                          reason: newAdjustment.reason
                        });
                      } else {
                        setNewAdjustment({ ...newAdjustment, expense: val });
                      }
                    }}
                    options={expenseSelectOptions}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      New Category <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={newAdjustment.new_category}
                      onChange={(val) => setNewAdjustment({ ...newAdjustment, new_category: val })}
                      options={categoryOptions}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      New Payment Account <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={newAdjustment.new_payment_account}
                      onChange={(val) => setNewAdjustment({ ...newAdjustment, new_payment_account: val })}
                      options={accountOptions}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      New Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="e.g. 900"
                      value={newAdjustment.new_amount}
                      onChange={(e) => setNewAdjustment({ ...newAdjustment, new_amount: e.target.value })}
                      className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="relative" ref={adjCalendarRef}>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      New Expense Date <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAdjCalendarPopover(!showAdjCalendarPopover)}
                      className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none hover:border-blue-400 font-medium cursor-pointer"
                    >
                      <span>
                        {newAdjustment.new_expense_date
                          ? newAdjustment.new_expense_date.split('-').reverse().join('/')
                          : 'Select date'}
                      </span>
                      <IoCalendarOutline className="text-gray-400 text-sm shrink-0" />
                    </button>

                    {showAdjCalendarPopover && (
                      <div className="absolute right-0 bottom-full mb-1.5 z-[70] shadow-2xl rounded-2xl bg-white border border-gray-100 p-1 animate-in fade-in zoom-in-95 duration-100">
                        <Calendar
                          value={newAdjustment.new_expense_date || new Date().toISOString().slice(0, 10)}
                          onChange={(newDate) => {
                            setNewAdjustment({ ...newAdjustment, new_expense_date: newDate });
                            setShowAdjCalendarPopover(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">New Description</label>
                  <textarea
                    rows="2"
                    placeholder="Enter revised description..."
                    value={newAdjustment.new_description}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, new_description: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Reason for Adjustment <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Explain why adjustment is required..."
                    value={newAdjustment.reason}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, reason: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestAdjModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAdj}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                  >
                    {submittingAdj ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Request</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* --- MODAL 4: VIEW ADJUSTMENT DETAILS --- */}
      {viewingAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden font-sans">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900">Adjustment Request {viewingAdjustment.adjustmentCode}</h3>
                  {loadingAdjDetail && (
                    <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">Expense Voucher: <span className="font-bold text-blue-600">{viewingAdjustment.expenseCode}</span></p>
              </div>
              <div className="flex items-center gap-3">
                {viewingAdjustment.status === 'PENDING' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>PENDING</span>
                  </span>
                )}
                {viewingAdjustment.status === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                    <span>✓ APPROVED</span>
                  </span>
                )}
                {viewingAdjustment.status === 'REJECTED' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                    <span>✕ REJECTED</span>
                  </span>
                )}
                <button onClick={() => setViewingAdjustment(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <IoCloseOutline size={20} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Amounts Comparison Box */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold">Old Amount</p>
                  <p className="text-base font-bold text-gray-800 tabular-nums font-mono">
                    ₹{typeof viewingAdjustment.oldAmount === 'number' ? viewingAdjustment.oldAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : viewingAdjustment.oldAmount}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold">New Revised Amount</p>
                  <p className="text-base font-bold text-blue-600 tabular-nums font-mono">
                    ₹{typeof viewingAdjustment.newAmount === 'number' ? viewingAdjustment.newAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : viewingAdjustment.newAmount}
                  </p>
                </div>
              </div>

              {/* Revision Comparison Fields */}
              <div className="space-y-2 border-t border-gray-100 pt-3">
                {(viewingAdjustment.oldPaymentAccountName || viewingAdjustment.newPaymentAccountName) && (
                  <div className="flex justify-between py-1 text-gray-700">
                    <span className="text-gray-500 font-semibold">Payment Account:</span>
                    <span className="font-bold text-gray-900">
                      {viewingAdjustment.oldPaymentAccountName || 'N/A'} <span className="text-gray-400 font-normal">→</span> <span className="text-blue-600">{viewingAdjustment.newPaymentAccountName || 'N/A'}</span>
                    </span>
                  </div>
                )}

                {(viewingAdjustment.oldCategoryName || viewingAdjustment.newCategoryName) && (
                  <div className="flex justify-between py-1 text-gray-700">
                    <span className="text-gray-500 font-semibold">Category:</span>
                    <span className="font-bold text-gray-900">
                      {viewingAdjustment.oldCategoryName || 'N/A'} <span className="text-gray-400 font-normal">→</span> <span className="text-blue-600">{viewingAdjustment.newCategoryName || 'N/A'}</span>
                    </span>
                  </div>
                )}

                {(viewingAdjustment.oldExpenseDate || viewingAdjustment.newExpenseDate) && (
                  <div className="flex justify-between py-1 text-gray-700">
                    <span className="text-gray-500 font-semibold">Expense Date:</span>
                    <span className="font-bold text-gray-900">
                      {viewingAdjustment.oldExpenseDate ? viewingAdjustment.oldExpenseDate.split('-').reverse().join('/') : 'N/A'} <span className="text-gray-400 font-normal">→</span> <span className="text-blue-600">{viewingAdjustment.newExpenseDate ? viewingAdjustment.newExpenseDate.split('-').reverse().join('/') : 'N/A'}</span>
                    </span>
                  </div>
                )}

                {(viewingAdjustment.oldDescription || viewingAdjustment.newDescription) && (
                  <div className="py-1 text-gray-700 space-y-1">
                    <span className="text-gray-500 font-semibold block">Description Revision:</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-gray-600">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase">Old</span>
                        {viewingAdjustment.oldDescription || 'N/A'}
                      </div>
                      <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100 text-blue-900">
                        <span className="block text-[10px] font-bold text-blue-500 uppercase">New</span>
                        {viewingAdjustment.newDescription || 'N/A'}
                      </div>
                    </div>
                  </div>
                )}

                {viewingAdjustment.reason && (
                  <div className="space-y-1 pt-1 text-gray-700">
                    <p className="font-semibold text-gray-500">Adjustment Reason:</p>
                    <p className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 leading-relaxed font-medium">
                      {viewingAdjustment.reason}
                    </p>
                  </div>
                )}

                {viewingAdjustment.rejectionReason && (
                  <div className="space-y-1 pt-1 text-gray-700">
                    <p className="font-semibold text-rose-600">Rejection Reason:</p>
                    <p className="p-2.5 bg-rose-50/80 rounded-xl border border-rose-100 text-rose-900 leading-relaxed font-medium">
                      {viewingAdjustment.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                  <div>
                    <span className="font-semibold text-gray-700">Requested By:</span>{' '}
                    {viewingAdjustment.requestedBy}
                    {viewingAdjustment.requestedAt && (
                      <span className="block text-[10px] text-gray-400">
                        {new Date(viewingAdjustment.requestedAt).toLocaleString('en-GB')}
                      </span>
                    )}
                  </div>
                  {viewingAdjustment.approvedBy && (
                    <div>
                      <span className="font-semibold text-emerald-700">Approved By:</span>{' '}
                      {viewingAdjustment.approvedBy}
                      {viewingAdjustment.approvedAt && (
                        <span className="block text-[10px] text-gray-400">
                          {new Date(viewingAdjustment.approvedAt).toLocaleString('en-GB')}
                        </span>
                      )}
                    </div>
                  )}
                  {viewingAdjustment.rejectedBy && (
                    <div>
                      <span className="font-semibold text-rose-700">Rejected By:</span>{' '}
                      {viewingAdjustment.rejectedBy}
                      {viewingAdjustment.rejectedAt && (
                        <span className="block text-[10px] text-gray-400">
                          {new Date(viewingAdjustment.rejectedAt).toLocaleString('en-GB')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setViewingAdjustment(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- MODAL 5: APPROVE ADJUSTMENT CONFIRMATION --- */}
      {approvingAdj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm overflow-hidden p-6 text-center font-sans">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <IoCheckmarkCircleOutline size={26} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Approve Adjustment Request</h3>
            <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
              Are you sure you want to approve adjustment <span className="font-bold text-gray-800">#{approvingAdj.id}</span> for expense <span className="font-bold text-blue-600">{approvingAdj.expenseCode}</span>? Amount will be revised from <span className="font-bold text-gray-800">₹{approvingAdj.oldAmount}</span> to <span className="font-bold text-emerald-600">₹{approvingAdj.newAmount}</span>.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={submittingApprove}
                onClick={() => setApprovingAdj(null)}
                className="w-1/2 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingApprove}
                onClick={handleConfirmApproveAdj}
                className="w-1/2 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                {submittingApprove ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Approving...</span>
                  </>
                ) : (
                  <span>Approve Request</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 6: REJECT ADJUSTMENT CONFIRMATION --- */}
      {rejectingAdj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden font-sans">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                  <IoWarningOutline size={18} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Reject Adjustment #{rejectingAdj.id}</h3>
              </div>
              <button onClick={() => setRejectingAdj(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                You are about to reject adjustment request <span className="font-bold text-gray-800">#{rejectingAdj.id}</span> for expense <span className="font-bold text-blue-600">{rejectingAdj.expenseCode}</span>. Please provide a reason below.
              </p>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Enter rejection reason..."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-rose-500 font-medium"
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={submittingReject}
                  onClick={() => setRejectingAdj(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingReject}
                  onClick={handleConfirmRejectAdj}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  {submittingReject ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <span>Confirm Rejection</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
