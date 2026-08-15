import React, { useState, useEffect } from 'react';
import LiveStock from './LiveStock';
import Purchases from './Purchases';
import StockUsage from './StockUsage';
import StockHistory from './StockHistory';
import Products from './Products';
import Suppliers from './Suppliers';
import { inventoryService } from '../../services/inventoryService';
import { useInventoryStore } from '../../store/inventoryStore';
import { 
  IoCubeOutline, 
  IoCartOutline, 
  IoTrendingDownOutline, 
  IoTimeOutline, 
  IoListOutline, 
  IoPeopleOutline,
  IoArrowForwardOutline,
  IoWarningOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline
} from 'react-icons/io5';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const products = useInventoryStore(state => state.products);

  // Load base data on mount
  useEffect(() => {
    inventoryService.fetchProducts();
    inventoryService.fetchSuppliers();
    inventoryService.fetchPurchases();
    inventoryService.fetchLedger();
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];
  const lowStockCount = safeProducts.filter(p => (p.currentStock || 0) <= (p.minStock || p.minimum_stock || 0)).length;

  const cards = [
    { 
      id: 'livestock', 
      title: 'Live Stock', 
      desc: 'See current stock for every product at a glance.',
      icon: IoCubeOutline,
      color: 'bg-[#eeedfc] text-[#4f46e5]'
    },
    { 
      id: 'purchases', 
      title: 'Purchases', 
      desc: 'Record bulk purchases and view purchase history.',
      icon: IoCartOutline,
      color: 'bg-[#e0f2fe] text-[#0284c7]'
    },
    { 
      id: 'usage', 
      title: 'Stock Usage', 
      desc: 'Log daily or weekly consumption of stock.',
      icon: IoTrendingDownOutline,
      color: 'bg-[#fef4c7] text-[#ca8a04]'
    },
    { 
      id: 'history', 
      title: 'Stock History', 
      desc: 'Full ledger of where stock came from and went.',
      icon: IoTimeOutline,
      color: 'bg-[#f3e8ff] text-[#9333ea]'
    },
    { 
      id: 'products', 
      title: 'Products', 
      desc: 'Manage the product list and minimum stock levels.',
      icon: IoListOutline,
      color: 'bg-[#ecfccb] text-[#65a30d]'
    },
    { 
      id: 'suppliers', 
      title: 'Suppliers', 
      desc: 'Manage suppliers and see what you\'ve bought from each.',
      icon: IoPeopleOutline,
      color: 'bg-[#ffe4e6] text-[#e11d48]'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'livestock': return <LiveStock />;
      case 'purchases': return <Purchases />;
      case 'usage': return <StockUsage />;
      case 'history': return <StockHistory />;
      case 'products': return <Products />;
      case 'suppliers': return <Suppliers />;
      default: return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {lowStockCount > 0 && (
        <div className="inline-flex items-center space-x-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <IoWarningOutline className="h-5 w-5 text-yellow-600" />
          <span><span className="font-bold">{lowStockCount} products</span> need attention — check Live Stock.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div 
              key={card.id}
              onClick={() => setActiveTab(card.id)}
              className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-brand-border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-brand-gold/50 min-h-[130px]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-brand-border transition-colors group-hover:text-brand-gold">
                  <IoArrowForwardOutline className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-brand-text text-base">{card.title}</h3>
                <p className="mt-1 text-xs text-brand-text-muted leading-snug">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#FAFAF9] -mx-8 -my-10 px-8 py-10 min-h-screen">
      <div className="space-y-6 pb-12">
      {/* Dynamic Header */}
      <div className="flex flex-col space-y-2">
        {/* Breadcrumbs */}
        <div className="flex items-center text-[11px] font-bold text-brand-text-muted tracking-wider uppercase mb-1">
           <span className="cursor-pointer hover:text-brand-gold transition-colors" onClick={() => setActiveTab('dashboard')}>Al Naaz Dashboard</span>
           <IoChevronForwardOutline className="mx-2 h-3 w-3" />
           {activeTab === 'dashboard' ? (
             <span className="text-brand-brown">Inventory</span>
           ) : (
             <>
               <span className="cursor-pointer hover:text-brand-gold transition-colors" onClick={() => setActiveTab('dashboard')}>Inventory</span>
               <IoChevronForwardOutline className="mx-2 h-3 w-3" />
               <span className="text-brand-brown">{cards.find(c => c.id === activeTab)?.title}</span>
             </>
           )}
        </div>
        
        {activeTab === 'dashboard' ? (
          <>
            <h1 className="font-serif text-3xl font-bold text-brand-brown mt-2">Inventory</h1>
            <p className="text-sm text-brand-text-muted">Manage your products, purchases and current stock.</p>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-2 mt-4 mb-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-1 rounded-xl border border-brand-border bg-white px-4 py-2 text-sm font-medium text-brand-text hover:bg-brand-cream/50 transition-colors"
            >
              <IoChevronBackOutline className="h-4 w-4" /> Overview
            </button>
            {cards.map(card => (
              <button
                key={card.id}
                onClick={() => setActiveTab(card.id)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === card.id
                    ? 'bg-[#5946D5] text-white border-[#5946D5]'
                    : 'border-brand-border bg-white text-brand-text hover:bg-brand-cream/50'
                }`}
              >
                {card.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2">
        {renderContent()}
      </div>
      </div>
    </div>
  );
};

export default Inventory;
