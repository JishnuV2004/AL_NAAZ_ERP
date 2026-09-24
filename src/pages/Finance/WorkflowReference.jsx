import React from 'react';
import { IoArrowForwardOutline, IoInformationCircleOutline } from 'react-icons/io5';

const WORKFLOWS = [
  {
    id: 'daily-sales',
    title: 'Daily Sales',
    steps: [
      'CREATE',
      'DRAFT',
      'POST',
      'REVENUE',
      'CASH / UPI / CARD AR / FOOD DELIVERY AR',
      '(AR) SETTLEMENT',
      'CASH / BANK / UPI'
    ]
  },
  {
    id: 'expense',
    title: 'Expense',
    steps: [
      'CREATE EXPENSE',
      'TRANSACTION OUT',
      'ACCOUNT DECREASES'
    ]
  },
  {
    id: 'expense-correction',
    title: 'Expense Correction',
    steps: [
      'EXPENSE',
      'ADJUSTMENT REQUEST',
      'PENDING',
      'APPROVE / REJECT',
      '(if approved) ORIGINAL STAYS + NEW ADJUSTMENT TXN'
    ]
  },
  {
    id: 'purchase-payable',
    title: 'Purchase / Payable',
    steps: [
      'PURCHASE',
      'SUPPLIER PAYABLE',
      'INITIAL PAYMENT (if any)',
      'ACCOUNT DECREASES',
      'OUTSTANDING PAYABLE',
      'SUPPLIER PAYMENT',
      'PAID'
    ]
  },
  {
    id: 'transfer',
    title: 'Transfer',
    steps: [
      'ACCOUNT A',
      'TRANSFER OUT',
      'TRANSFER GROUP',
      'TRANSFER IN',
      'ACCOUNT B'
    ]
  }
];

const WorkflowReference = () => {
  return (
    <div className="space-y-5 font-sans w-full pb-10">
      {/* 1. Header Section */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1">
          <span>Finance</span>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Workflow Reference</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Finance Workflow Reference</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          How each Finance action moves money through the ledger. For onboarding staff and confirming UI matches backend behaviour.
        </p>
      </div>

      {/* 2. Workflow Cards List */}
      <div className="space-y-4">
        {WORKFLOWS.map((wf) => (
          <div
            key={wf.id}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4"
          >
            <h3 className="text-sm font-bold text-gray-900">{wf.title}</h3>

            <div className="flex flex-wrap items-center gap-2.5">
              {wf.steps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800 tracking-wide uppercase shadow-2xs">
                    {step}
                  </div>
                  {idx < wf.steps.length - 1 && (
                    <IoArrowForwardOutline className="text-gray-400 shrink-0 mx-0.5" size={14} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Footer Ledger Rule Note */}
      <div className="p-3.5 bg-gray-100/80 rounded-xl border border-gray-200/60 text-xs text-gray-500 leading-relaxed font-medium">
        Revenue ≠ Cash. A receivable settlement is a separate event from revenue recognition. Credit purchases increase stock and payables — they do not immediately reduce cash.
      </div>
    </div>
  );
};

export default WorkflowReference;
