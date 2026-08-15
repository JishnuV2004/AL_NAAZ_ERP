import { create } from 'zustand';

export const useInventoryStore = create((set, get) => ({
  products: [
    { id: 'p1', name: 'Tomato', category: 'Vegetables', unit: 'KG', minStock: 15, currentStock: 25, status: 'Active' },
    { id: 'p2', name: 'Rice', category: 'Grains', unit: 'KG', minStock: 20, currentStock: 8, status: 'Active' },
    { id: 'p3', name: 'Oil', category: 'Cooking', unit: 'L', minStock: 10, currentStock: 0, status: 'Active' }
  ],
  suppliers: [
    { id: 's1', name: 'Fresh Farms LLC', phone: '+971 50 123 4567', email: 'sales@freshfarms.com', status: 'Active' },
    { id: 's2', name: 'Gulf General Trading', phone: '+971 4 987 6543', email: 'info@ggtrading.com', status: 'Active' }
  ],
  liveStock: [],
  purchases: [
    {
      id: 'pur1',
      purchase_date: '2026-08-10',
      supplier: 's1',
      invoice_number: 'INV-1001',
      items: [
        { product: 'p1', quantity: 15, total_price: 5000, unit_price: 333.33 }
      ]
    }
  ],
  ledger: [
    { id: 'l1', date: '2026-08-10', productId: 'p1', type: 'PURCHASE', quantity: 15, balance: 15, reference: 'pur1' },
    { id: 'l2', date: '2026-08-10', productId: 'p1', type: 'PURCHASE', quantity: 15, balance: 30, reference: 'pur2' },
    { id: 'l3', date: '2026-08-11', productId: 'p1', type: 'USAGE', quantity: -5, balance: 25, reference: 'usage1' }
  ],
  usages: [],
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // Setters for API loads
  setProducts: (products) => set({ products }),
  setLiveStock: (liveStock) => set({ liveStock }),
  setSuppliers: (suppliers) => set({ suppliers }),
  setPurchases: (purchases) => set({ purchases }),
  setLedger: (ledger) => set({ ledger }),
  setUsages: (usages) => set({ usages }),

  // CRUD Products
  addProduct: (product) => {
    const newProduct = { id: Date.now().toString(), ...product, currentStock: 0 };
    set((state) => ({ products: [...state.products, newProduct] }));
    return newProduct;
  },
  updateProduct: (id, data) => set((state) => ({ products: state.products.map(p => p.id === id ? { ...p, ...data } : p) })),
  deleteProduct: (id) => set((state) => ({ products: state.products.filter(p => p.id !== id) })),
  
  // CRUD Suppliers
  addSupplier: (supplier) => {
    const newSupplier = { id: Date.now().toString(), ...supplier };
    set((state) => ({ suppliers: [...state.suppliers, newSupplier] }));
    return newSupplier;
  },
  updateSupplier: (id, data) => set((state) => ({ suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...data } : s) })),
  deleteSupplier: (id) => set((state) => ({ suppliers: state.suppliers.filter(s => s.id !== id) })),

  // Record Purchase
  addPurchase: (purchaseData) => {
    const purchaseId = Date.now().toString();
    const newPurchase = {
      id: purchaseId,
      ...purchaseData
    };
    
    set((state) => ({ purchases: [newPurchase, ...state.purchases] }));

    purchaseData.items.forEach(item => {
      get().addLedgerEntry({
        date: purchaseData.purchase_date || purchaseData.date,
        productId: item.product || item.productId,
        type: 'PURCHASE',
        quantity: Number(item.quantity),
        reference: purchaseId
      });
    });
    return newPurchase;
  },

  // Record Usage
  addUsage: (usageData) => {
    const usageId = Date.now().toString();
    get().addLedgerEntry({
      date: usageData.date,
      productId: usageData.productId,
      type: 'USAGE',
      quantity: -Math.abs(Number(usageData.quantity)),
      reference: usageId,
      remarks: usageData.remarks
    });
  },

  // Add Ledger Entry & update Product Stock
  addLedgerEntry: (entry) => {
    set((state) => {
      const product = state.products.find(p => p.id === entry.productId);
      if (!product) return state;

      const newBalance = product.currentStock + entry.quantity;
      
      const newLedgerEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        ...entry,
        balance: newBalance
      };

      return {
        ledger: [newLedgerEntry, ...state.ledger],
        products: state.products.map(p => p.id === entry.productId ? { ...p, currentStock: newBalance } : p)
      };
    });
  }
}));
