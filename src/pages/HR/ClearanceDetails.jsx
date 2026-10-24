import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Banknote, X, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { clearanceService } from '../../services/clearanceService';
import { useAuthStore } from '../../store/authStore';

const ClearanceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authenticated user & role detection
  const currentUser = useAuthStore((state) => state.user);
  const userRole = String(currentUser?.role || '').toLowerCase();
  const username = String(currentUser?.username || '').toLowerCase();
  const isManager = userRole.includes('manager') || username.includes('manager');
  const isAdmin = userRole.includes('admin') || username.includes('admin') || currentUser?.is_superuser || !isManager;

  // Pagination for payment history (10 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Action / Approval loading state
  const [actionLoading, setActionLoading] = useState(false);

  // Reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'CASH',
    recorded_by_name: currentUser?.username || currentUser?.name || 'admin',
    reference: '',
    notes: '',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const found = await clearanceService.getItemById(id);
      if (!found) {
        setItem(null);
        toast.error('Clearance item not found');
        return;
      }
      setItem(found);
    } catch (e) {
      console.error('Error fetching clearance item details:', e);
      setItem(null);
      toast.error('Failed to load clearance item details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadData();
  }, [id]);

  const handleApproveManager = async () => {
    setActionLoading(true);
    try {
      const updated = await clearanceService.approveManager(item.id);
      if (updated) {
        setItem(updated);
        toast.success('Manager approval submitted');
      }
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to submit manager approval');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveAdmin = async () => {
    setActionLoading(true);
    try {
      const updated = await clearanceService.approveAdmin(item.id);
      if (updated) {
        setItem(updated);
        toast.success('Admin final approval completed');
      }
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to submit admin approval');
    } finally {
      setActionLoading(false);
    }
  };


  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      const stage = item.approval_status === 'PENDING_ADMIN' ? 'ADMIN' : 'MANAGER';
      const updated = await clearanceService.rejectItem(item.id, rejectionReason.trim(), stage);
      if (updated) {
        setItem(updated);
        toast.success('Clearance item has been rejected');
        setIsRejectModalOpen(false);
        setRejectionReason('');
        loadData();
      }
    } catch (e) {
      console.error('Rejection error:', e);
      toast.error(e.message || 'Failed to reject clearance item');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}`;
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const renderStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'PENDING_MANAGER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending Manager
          </span>
        );
      case 'PENDING_ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Pending Admin
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };




  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amt = parseFloat(paymentData.amount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setActionLoading(true);
    try {
      await clearanceService.recordPayment({
        issued_item: Number(item.id),
        amount: String(amt),
        payment_method: paymentData.payment_method,
        payment_date: paymentData.payment_date,
        reference: paymentData.reference ? paymentData.reference.trim() : '',
        notes: paymentData.notes ? paymentData.notes.trim() : ''
      });

      toast.success('Clearance payment recorded successfully');
      setIsPaymentModalOpen(false);
      setPaymentData({
        amount: '',
        payment_method: 'CASH',
        reference: '',
        notes: '',
        payment_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (err) {
      console.error('Record payment error:', err);
      toast.error(err.message || 'Failed to record payment');
    } finally {
      setActionLoading(false);
    }
  };

  // SKELETON LOADING THEME
  if (loading) {
    return (
      <div className="space-y-6 pb-12 font-sans animate-pulse">
        {/* Back button skeleton */}
        <div className="pt-1">
          <div className="h-5 w-44 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-48 bg-gray-200 rounded-xl"></div>
              <div className="h-6 w-28 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-4 w-72 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-9 w-36 bg-gray-200 rounded-xl"></div>
        </div>

        {/* 2 Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1 Skeleton */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="h-5 w-36 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-3 pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <div key={n} className="flex justify-between items-center py-1">
                  <div className="h-4 w-28 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <div className="h-3 w-40 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Card 2 Skeleton */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="h-5 w-36 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4 pt-1">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="h-4 w-36 bg-gray-200 rounded"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="h-16 bg-gray-100 rounded-xl mt-6"></div>
          </div>
        </div>

        {/* Payment History Card Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div className="h-5 w-36 bg-gray-200 rounded"></div>
            <div className="h-4 w-28 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3 pt-2">
            <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
            {[1, 2, 3].map((r) => (
              <div key={r} className="h-12 bg-gray-50 rounded-xl w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not found or no API response
  if (!item) {
    return (
      <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto">
        <div className="pt-1">
          <button
            onClick={() => navigate('/hr/clearance-items')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Clearance Items</span>
          </button>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-14 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-3">
            <XCircle className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Clearance Item Not Found</h3>
          <p className="mt-1 max-w-sm text-xs text-gray-500">
            No clearance item data was returned by the server for ID #{id}.
          </p>
          <button
            onClick={() => navigate('/hr/clearance-items')}
            className="mt-4 inline-flex items-center space-x-1.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <span>Return to Clearance Items</span>
          </button>
        </div>
      </div>
    );
  }

  const isApproved = String(item.approval_status || '').toUpperCase() === 'APPROVED';

  // Pagination calculations (10 items per page)
  const paymentsList = item.payments || [];
  const totalPayments = paymentsList.length;
  const totalPages = Math.max(1, Math.ceil(totalPayments / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalPayments);
  const paginatedPayments = paymentsList.slice(startIndex, endIndex);

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-300 font-sans">
      {/* Back button using the exact UserDetails image model */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => navigate('/hr/clearance-items')}
          className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Back to Clearance Items</span>
        </button>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {item.item_name}
            </h1>
            {renderStatusBadge(item.approval_status)}
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Issued to <span className="font-bold text-gray-800">{item.employee_name}</span> (Employee ID: #{item.employee}) on {formatDate(item.issued_date)}
          </p>
        </div>

        {/* Workflow Approval / Payment Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {item.approval_status === 'PENDING_MANAGER' && (
            <>
              {/* When Manager is logged in, use Approve Manager API */}
              {isManager && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleApproveManager}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  title="Approve as Manager (POST /approve-manager/)"
                >
                  <CheckCircle2 size={16} />
                  <span>{actionLoading ? 'Processing...' : 'Manager Approve'}</span>
                </button>
              )}

              {/* When Admin is logged in, can approve as Manager or proceed directly */}
              {isAdmin && !isManager && (
                <>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleApproveManager}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    title="POST /clearance/items/:id/approve-manager/"
                  >
                    <CheckCircle2 size={16} />
                    <span>{actionLoading ? 'Processing...' : 'Manager Approve'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleApproveAdmin}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    title="POST /clearance/items/:id/approve-admin/"
                  >
                    <CheckCircle2 size={16} />
                    <span>{actionLoading ? 'Processing...' : 'Admin Approve'}</span>
                  </button>
                </>
              )}

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setIsRejectModalOpen(true)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <XCircle size={16} />
                <span>Reject</span>
              </button>
            </>
          )}

          {item.approval_status === 'PENDING_ADMIN' && (
            <>
              {/* When Admin is logged in, use Approve Admin API */}
              {isAdmin && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleApproveAdmin}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  title="Approve as Admin (POST /approve-admin/)"
                >
                  <CheckCircle2 size={16} />
                  <span>{actionLoading ? 'Processing...' : 'Admin Approve'}</span>
                </button>
              )}

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setIsRejectModalOpen(true)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <XCircle size={16} />
                <span>Reject</span>
              </button>
            </>
          )}

          {isApproved && (
            <button
              type="button"
              onClick={() => {
                setPaymentData((prev) => ({
                  ...prev,
                  amount: item.outstanding_balance > 0 ? String(item.outstanding_balance) : ''
                }));
                setIsPaymentModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Banknote size={16} />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Rejection Banner if rejection reason exists */}
      {item.rejection_reason && item.rejection_reason.trim() !== '' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900 shadow-2xs">
          <XCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-rose-800 uppercase tracking-wider text-[11px]">Rejection Reason</span>
            <p className="text-rose-700 text-xs leading-relaxed font-medium">{item.rejection_reason}</p>
          </div>
        </div>
      )}

      {/* 2 Summary Cards (Approval Timeline removed) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Item Information */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-gray-900">Item Information</h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item #{item.id}</span>
            </div>
            <div className="divide-y divide-gray-100 text-xs">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 font-medium">Employee</span>
                <span className="font-bold text-gray-900">
                  {item.employee_name} <span className="font-mono text-gray-400 font-normal">(#{item.employee})</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 font-medium">Item</span>
                <span className="font-semibold text-gray-800">{item.item_name}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 font-medium">Quantity</span>
                <span className="font-mono font-bold text-gray-900">{item.quantity}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 font-medium">Unit Value</span>
                <span className="font-mono text-gray-700">{formatCurrency(item.unit_value)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 font-medium">Employee Payable</span>
                <span className="font-mono font-bold text-blue-600">{formatCurrency(item.employee_payable)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 font-medium">Issued By</span>
                <span className="text-gray-700">
                  {item.issued_by_name} <span className="font-mono text-gray-400">(#{item.issued_by})</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 font-medium">Issued Date</span>
                <span className="text-gray-700">{formatDate(item.issued_date)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 font-medium">Notes</span>
                <span className="text-gray-700 max-w-[220px] truncate">{item.notes || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 font-medium">Rejection Reason</span>
                <span className={item.rejection_reason ? "font-semibold text-rose-600" : "text-gray-400"}>
                  {item.rejection_reason || '—'}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 mt-2 text-[11px] text-gray-400">
            Created: {formatDateTime(item.created_at)}
          </div>
        </div>

        {/* Card 2: Financial Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-gray-900">Financial Summary</h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Settlement</span>
            </div>
            <div className="divide-y divide-gray-100 text-xs mb-4">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-gray-500 font-medium">Employee Payable</span>
                <span className="font-mono font-bold text-base text-gray-900">
                  {formatCurrency(item.employee_payable)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-gray-500 font-medium">Total Paid</span>
                <span className="font-mono font-bold text-base text-emerald-600">
                  {formatCurrency(item.total_paid)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-gray-500 font-medium">Outstanding Balance</span>
                <span className="font-mono font-bold text-base text-amber-700">
                  {isApproved ? formatCurrency(item.outstanding_balance) : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-gray-600 mt-2">
            <div className="flex items-start gap-2">
              <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                {isApproved
                  ? 'This item is officially approved. Payments recorded directly count toward clearing the employee clearance balance.'
                  : 'This item is not finally approved, so its payable amount does not yet count toward the confirmed clearance balance.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card: Payment History Table with Pagination (10 per page) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Payment History</h3>
          <span className="text-xs text-gray-500 font-medium">
            {totalPayments} {totalPayments === 1 ? 'payment' : 'payments'} recorded
          </span>
        </div>

        {totalPayments > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Payment Date</th>
                    <th className="py-2.5 px-3">Recorded By</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3">Recorded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-xs">
                  {paginatedPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-800">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 text-[11px]">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600">{formatDate(p.payment_date)}</td>
                      <td className="py-3 px-3 text-gray-700 font-medium">
                        {p.recorded_by_name || 'admin'}
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-700 font-medium">{p.reference || '—'}</td>
                      <td className="py-3 px-3 text-gray-600 max-w-[200px] truncate">{p.notes || '—'}</td>
                      <td className="py-3 px-3 text-gray-500 text-[11px]">{formatDateTime(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls - 10 per page */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
              <div>
                Showing <span className="font-bold text-gray-900">{totalPayments === 0 ? 0 : startIndex + 1}</span> to{' '}
                <span className="font-bold text-gray-900">{endIndex}</span> of{' '}
                <span className="font-bold text-gray-900">{totalPayments}</span> payments
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    disabled={safePage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-all cursor-pointer ${safePage === pageNum
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-10 text-center text-gray-400 text-xs">
            No payment history found.
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Record Clearance Payment</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Item #{item.id}: {item.item_name} ({item.employee_name})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="0.00"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium"
                />
                {isApproved && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Current outstanding balance: <span className="font-bold text-amber-700 font-mono">{formatCurrency(item.outstanding_balance)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium cursor-pointer"
                >
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                  <option value="CHEQUE">CHEQUE</option>
                  <option value="SALARY_DEDUCTION">SALARY_DEDUCTION</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentData.payment_date}
                    onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Reference / Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. testing"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. testing"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer text-xs disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors cursor-pointer text-xs shadow-2xs disabled:opacity-60 flex items-center gap-1.5"
                >
                  <Banknote size={15} />
                  <span>{actionLoading ? 'Recording...' : 'Save Payment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2.5 text-rose-700">
                <XCircle size={20} />
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Reject Clearance Item</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Item #{item.id}: {item.item_name} ({item.employee_name})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRejectConfirm} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Rejection Reason *
                  </label>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                    Stage: {item.approval_status === 'PENDING_ADMIN' ? 'ADMIN' : 'MANAGER'}
                  </span>
                </div>
                <textarea
                  rows="3"
                  required
                  placeholder="Enter rejection reason (e.g. Item issued incorrectly, returned damaged, etc.)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-rose-500 text-xs bg-white text-gray-800 font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer text-xs disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors cursor-pointer text-xs shadow-2xs disabled:opacity-60 flex items-center gap-1.5"
                >
                  <XCircle size={15} />
                  <span>{actionLoading ? 'Rejecting...' : 'Confirm Reject'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClearanceDetails;

