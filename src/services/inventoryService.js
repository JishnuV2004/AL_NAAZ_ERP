import axiosInstance from '../config/axios';
import { useInventoryStore } from '../store/inventoryStore';
import toast from 'react-hot-toast';

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {}
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    try {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    } catch (e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const inventoryService = {
  // PRODUCTS
  fetchProducts: async (page = 1, pageSize = 10) => {
    const store = useInventoryStore.getState();
    store.setLoading(true);
    try {
      try {
        const response = await axiosInstance.get(`/products/?page=${page}&page_size=${pageSize}`);
        const data = response.data.results ? response.data.results : response.data;
        store.setProducts(data);
        return response.data;
      } catch (err) {
        return { results: store.products || [], count: (store.products || []).length, next: null, previous: null };
      }
    } finally {
      store.setLoading(false);
    }
  },
  fetchLiveStock: async () => {
    const store = useInventoryStore.getState();
    store.setLoading(true);
    try {
      try {
        const response = await axiosInstance.get('/stock/');
        const data = response.data.results ? response.data.results : response.data;
        store.setLiveStock(data);
        return data;
      } catch (err) {
        return store.liveStock; // Fallback to local
      }
    } finally {
      store.setLoading(false);
    }
  },
  fetchStock: async () => {
    try {
      const response = await axiosInstance.get('/stock/');
      const data = response.data.results ? response.data.results : response.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to fetch stock from API:', err);
      return [];
    }
  },
  fetchLowStock: async (branchId) => {
    try {
      const url = branchId ? `/stock/low-stock/?branch=${branchId}` : '/stock/low-stock/';
      const response = await axiosInstance.get(url);
      const data = response.data.results ? response.data.results : response.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to fetch low stock from API:', err);
      throw err;
    }
  },
  addProduct: async (data) => {
    const store = useInventoryStore.getState();
    const loadingToast = toast.loading('Adding product...');
    
    try {
      const payload = {
        name: data.name,
        category: data.category ? String(data.category).trim() : '',
        unit: data.unit,
        minimum_stock: Number(data.minStock).toFixed(2),
        is_active: data.status === 'Active'
      };

      try {
        const response = await axiosInstance.post('/products/', payload);
        store.addProduct(response.data);
        toast.success('Product added successfully!', { id: loadingToast });
      } catch (err) {
        store.addProduct(data);
        toast.success('Product added locally (Demo Mode)', { id: loadingToast });
      }
    } catch (e) {
      toast.error('Failed to add product', { id: loadingToast });
    }
  },
  updateProduct: async (id, data) => {
    const store = useInventoryStore.getState();
    const loadingToast = toast.loading('Updating product...');
    
    try {
      const payload = {
        name: data.name,
        category: data.category ? String(data.category).trim() : '',
        unit: data.unit,
        minimum_stock: Number(data.minStock).toFixed(2),
        is_active: data.status === 'Active'
      };

      try {
        const response = await axiosInstance.patch(`/products/${id}/`, payload);
        store.updateProduct(id, response.data);
        toast.success('Product updated successfully!', { id: loadingToast });
      } catch (err) {
        store.updateProduct(id, data);
        toast.success('Product updated locally (Demo Mode)', { id: loadingToast });
      }
    } catch (e) {
      toast.error('Failed to update product', { id: loadingToast });
    }
  },
  deleteProduct: async (id) => {
    const store = useInventoryStore.getState();
    const loadingToast = toast.loading('Deleting product...');
    try {
      try {
        await axiosInstance.delete(`/products/${id}/`);
        store.deleteProduct(id);
        toast.success('Product deleted successfully!', { id: loadingToast });
      } catch (err) {
        store.deleteProduct(id);
        toast.success('Product deleted locally (Demo Mode)', { id: loadingToast });
      }
    } catch (e) {
      toast.error('Failed to delete product', { id: loadingToast });
    }
  },

  // SUPPLIERS
  fetchSuppliers: async (page = 1, pageSize = 10) => {
    const store = useInventoryStore.getState();
    store.setLoading(true);
    try {
      try {
        const response = await axiosInstance.get(`/suppliers/?page=${page}&page_size=${pageSize}`);
        const data = response.data.results ? response.data.results : response.data;
        store.setSuppliers(data);
        return response.data; // Return full response for pagination handling
      } catch (err) {
        return { results: store.suppliers, next: null, previous: null, count: store.suppliers.length };
      }
    } finally {
      store.setLoading(false);
    }
  },
  addSupplier: async (data) => {
    const store = useInventoryStore.getState();
    const loadingToast = toast.loading('Adding supplier...');
    
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address || '',
        is_active: data.status === 'Active'
      };

      try {
        const response = await axiosInstance.post('/suppliers/', payload);
        store.addSupplier(response.data);
        toast.success('Supplier added successfully!', { id: loadingToast });
      } catch (err) {
        store.addSupplier(data);
        toast.success('Supplier added locally (Demo Mode)', { id: loadingToast });
      }
    } catch (e) {
      toast.error('Failed to add supplier', { id: loadingToast });
    }
  },
  updateSupplier: async (id, data) => {
    const store = useInventoryStore.getState();
    const loadingToast = toast.loading('Updating supplier...');
    
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address || '',
        is_active: data.status === 'Active'
      };

      try {
        const response = await axiosInstance.patch(`/suppliers/${id}/`, payload);
        store.updateSupplier(id, response.data);
        toast.success('Supplier updated successfully!', { id: loadingToast });
      } catch (err) {
        store.updateSupplier(id, data);
        toast.success('Supplier updated locally (Demo Mode)', { id: loadingToast });
      }
    } catch (e) {
      toast.error('Failed to update supplier', { id: loadingToast });
    }
  },
  deleteSupplier: async (id) => {
    const store = useInventoryStore.getState();
    const loadingToast = toast.loading('Deleting supplier...');
    try {
      try {
        await axiosInstance.delete(`/suppliers/${id}/`);
        store.deleteSupplier(id);
        toast.success('Supplier deleted successfully!', { id: loadingToast });
      } catch (err) {
        store.deleteSupplier(id);
        toast.success('Supplier deleted locally (Demo Mode)', { id: loadingToast });
      }
    } catch (e) {
      toast.error('Failed to delete supplier', { id: loadingToast });
    }
  },
  fetchSupplierHistory: async (id) => {
    try {
      const response = await axiosInstance.get(`/suppliers/${id}/purchases/`);
      return response.data.results ? response.data.results : response.data;
    } catch (err) {
      return [];
    }
  },

  // PURCHASES
  fetchPurchases: async () => {
    const store = useInventoryStore.getState();
    try {
      try {
        const response = await axiosInstance.get('/purchases/');
        const data = response.data.results ? response.data.results : response.data;
        store.setPurchases(data);
        return data;
      } catch (err) {
        return store.purchases;
      }
    } catch (e) { }
  },
  addPurchase: async (data) => {
    const store = useInventoryStore.getState();
    const loadingToast = toast.loading('Recording purchase...');
    try {
      try {
        const response = await axiosInstance.post('/purchases/', data);
        store.addPurchase(response.data);
        toast.success('Purchase recorded successfully!', { id: loadingToast });
      } catch (err) {
        store.addPurchase(data);
        toast.success('Purchase recorded locally (Demo Mode)', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to record purchase', { id: loadingToast });
    }
  },

  // USAGE
  recordUsage: async (data, idempotencyKey) => {
    const store = useInventoryStore.getState();
    const loadingToast = toast.loading('Recording usage...');
    
    try {
      // Each action sends a fresh, different random Idempotency-Key (UUID v4)
      const key = idempotencyKey || generateUUID();

      const payload = {
        branch: Number(data.branch),
        product: Number(data.product || data.productId),
        quantity: String(data.quantity),
        usage_date: data.usage_date || data.date,
        remarks: data.remarks || ''
      };

      const response = await axiosInstance.post('/usages/', payload, {
        headers: {
          'Idempotency-Key': key
        }
      });
      store.addUsage(response.data);
      toast.success('Usage recorded successfully!', { id: loadingToast });
      try {
        await inventoryService.fetchLiveStock();
      } catch (e) {
        // Non-blocking stock sync
      }
      return response.data;
    } catch (err) {
      console.error('Failed to record stock usage:', err);
      const errDetail =
        err.response?.data?.detail ||
        (typeof err.response?.data === 'object'
          ? Object.entries(err.response.data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
              .join(' | ')
          : null) ||
        err.message ||
        'Failed to record usage';
      toast.error(errDetail, { id: loadingToast });
      throw err;
    }
  },
  fetchUsages: async (page = 1, pageSize = 5) => {
    const store = useInventoryStore.getState();
    store.setLoading(true);
    try {
      const response = await axiosInstance.get(`/usages/?page=${page}&page_size=${pageSize}`);
      const data = response.data.results ? response.data.results : response.data;
      store.setUsages(data);
      return response.data;
    } catch (err) {
      return { results: [], next: null, previous: null, count: 0 };
    } finally {
      store.setLoading(false);
    }
  },

  // LEDGER
  fetchLedger: async (page = 1, pageSize = 10) => {
    const store = useInventoryStore.getState();
    try {
      const response = await axiosInstance.get(`/stock/ledger/?page=${page}&page_size=${pageSize}`);
      const data = response.data.results ? response.data.results : response.data;
      store.setLedger(data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch stock ledger:', err);
      return { results: store.ledger || [], count: (store.ledger || []).length, next: null, previous: null };
    }
  },

  // ADJUSTMENTS
  fetchAdjustments: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`/stock-adjustments/?page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch stock adjustments:', err);
      return { results: [], count: 0 };
    }
  },

  createAdjustment: async (payload, idempotencyKey) => {
    const loadingToast = toast.loading('Recording stock adjustment...');
    try {
      // Each action sends a fresh, different random Idempotency-Key (UUID v4)
      const key = idempotencyKey || generateUUID();

      const response = await axiosInstance.post('/stock-adjustments/', payload, {
        headers: {
          'Idempotency-Key': key
        }
      });
      toast.success('Stock adjustment recorded successfully!', { id: loadingToast });
      try {
        await inventoryService.fetchLiveStock();
      } catch (e) {
        // Non-blocking stock sync
      }
      return response.data;
    } catch (err) {
      console.error('Failed to record stock adjustment:', err);
      const errDetail =
        err.response?.data?.detail ||
        (typeof err.response?.data === 'object'
          ? Object.entries(err.response.data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
              .join(' | ')
          : null) ||
        err.message ||
        'Failed to record stock adjustment';
      toast.error(errDetail, { id: loadingToast });
      throw err;
    }
  },

  // PRODUCT CATEGORIES
  fetchProductCategories: async () => {
    try {
      const response = await axiosInstance.get('/product-categories/?page_size=1000');
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    } catch (err) {
      try {
        const fallback = await axiosInstance.get('/product-categories/');
        const data = fallback.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.results)) return data.results;
        return [];
      } catch (innerErr) {
        console.error('Failed to fetch product categories:', innerErr);
        throw innerErr;
      }
    }
  },

  createProductCategory: async (payload) => {
    try {
      const response = await axiosInstance.post('/product-categories/', payload);
      return response.data;
    } catch (err) {
      console.error('Failed to create product category:', err);
      throw err;
    }
  },

  updateProductCategory: async (id, payload) => {
    try {
      const response = await axiosInstance.patch(`/product-categories/${id}/`, payload);
      return response.data;
    } catch (err) {
      console.error(`Failed to update product category ${id}:`, err);
      throw err;
    }
  },

  deleteProductCategory: async (id) => {
    try {
      const response = await axiosInstance.delete(`/product-categories/${id}/`);
      return response.data;
    } catch (err) {
      console.error(`Failed to delete product category ${id}:`, err);
      throw err;
    }
  }
};
