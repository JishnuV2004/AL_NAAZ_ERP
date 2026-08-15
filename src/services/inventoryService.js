import axiosInstance from '../config/axios';
import { useInventoryStore } from '../store/inventoryStore';
import toast from 'react-hot-toast';

export const inventoryService = {
  // PRODUCTS
  fetchProducts: async () => {
    const store = useInventoryStore.getState();
    store.setLoading(true);
    try {
      try {
        const response = await axiosInstance.get('/products/');
        const data = response.data.results ? response.data.results : response.data;
        store.setProducts(data);
        return data;
      } catch (err) {
        return store.products;
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
  addProduct: async (data) => {
    const store = useInventoryStore.getState();
    const loadingToast = toast.loading('Adding product...');
    
    try {
      const payload = {
        name: data.name,
        category: data.category.toLowerCase(),
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
        category: data.category.toLowerCase(),
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
  recordUsage: async (data) => {
    const store = useInventoryStore.getState();
    const loadingToast = toast.loading('Recording usage...');
    
    try {
      const payload = {
        product: Number(data.productId),
        quantity: String(data.quantity),
        usage_date: data.date,
        remarks: data.remarks || ''
      };

      try {
        const response = await axiosInstance.post('/usages/', payload);
        store.addUsage(response.data);
        toast.success('Usage recorded successfully!', { id: loadingToast });
      } catch (err) {
        store.addUsage(data);
        toast.success('Usage recorded locally (Demo Mode)', { id: loadingToast });
      }
    } catch (e) {
      toast.error('Failed to record usage', { id: loadingToast });
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
  fetchLedger: async () => {
    const store = useInventoryStore.getState();
    try {
      const response = await axiosInstance.get('/stock/ledger/');
      const data = response.data.results ? response.data.results : response.data;
      store.setLedger(data);
      return data;
    } catch (err) {
      return store.ledger; // Fallback to local
    }
  },
};
