import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { vendorPortal } from '../services/api';

// The API's statuses grouped the way vendors think about them.
export const GROUP = {
  submitted: 'pending', acknowledged: 'pending', scheduled: 'pending',
  in_progress: 'in_progress',
  completed: 'completed', closed: 'completed',
  cancelled: 'cancelled',
};

export const toJob = (r) => ({
  id: String(r._id || r.id),
  title: r.title || r.category || 'Job',
  description: r.description || '',
  property: r.property?.title || '',
  unit: r.unit || '',
  tenant: [r.tenant?.firstName, r.tenant?.lastName].filter(Boolean).join(' '),
  tenantPhone: r.tenant?.phone || '',
  status: r.status,
  group: GROUP[r.status] || 'pending',
  amount: Number(r.actualCost ?? r.estimatedCost) || 0,
  paid: r.actualCost != null,
  date: r.requestedDate || r.createdAt ? new Date(r.requestedDate || r.createdAt).toLocaleDateString() : '',
  completedAt: r.completedAt ? new Date(r.completedAt) : null,
});

/** Loads the vendor's jobs whenever the screen gains focus. */
export function useVendorJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    try {
      const { data } = await vendorPortal.myJobs();
      const raw = Array.isArray(data) ? data : data?.data || [];
      setJobs(raw.map(toJob));
      setError(false);
    } catch (e) {
      setJobs([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));
  return { jobs, loading, error, reload };
}
