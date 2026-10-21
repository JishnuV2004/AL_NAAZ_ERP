import api from '../config/axios';

/**
 * Fetch finance dashboard overview
 * GET /finance/dashboard/
 */
export const getFinanceDashboard = async (params = {}) => {
  const query = {};
  if (params.branch && params.branch !== 'All Branches' && params.branch !== 'all') {
    query.branch = params.branch;
  }
  if (params.period && params.period !== 'all') {
    query.period = params.period;
  }
  const response = await api.get('/finance/dashboard/', { params: query });
  return response.data;
};
