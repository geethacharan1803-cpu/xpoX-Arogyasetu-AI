/**
 * ArogyaSetu AI — Referral Turnaround Analytics
 * 
 * Pure functions for computing analytics metrics from
 * referrals, followups, and patients data.
 */

/**
 * Compute average referral turnaround time in hours.
 * Measures time between createdDate and acceptedDate or resolvedDate.
 * Only includes referrals that have both timestamps.
 * 
 * @param {Array} referrals - Array of referral objects
 * @returns {number|null} Average hours, or null if no computable referrals
 */
export function avgReferralTurnaroundHours(referrals) {
  if (!referrals || referrals.length === 0) return null;

  const durations = [];

  for (const ref of referrals) {
    const start = ref.createdDate ? new Date(ref.createdDate) : null;
    // Use resolvedDate if available, fall back to acceptedDate
    const endDateStr = ref.resolvedDate || ref.acceptedDate;
    const end = endDateStr ? new Date(endDateStr) : null;

    if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      durations.push(hours);
    }
  }

  if (durations.length === 0) return null;

  const total = durations.reduce((sum, h) => sum + h, 0);
  return Math.round((total / durations.length) * 10) / 10;
}

/**
 * Compute the percentage of followups that are currently overdue.
 * 
 * @param {Array} followups - Array of followup objects
 * @returns {number} Percentage (0-100), or 0 if no followups
 */
export function overdueFollowupRate(followups) {
  if (!followups || followups.length === 0) return 0;

  const overdueCount = followups.filter(f => f.status === 'overdue').length;
  return Math.round((overdueCount / followups.length) * 100);
}

/**
 * Count patients per ASHA worker based on visit records.
 * Since patients don't have a direct ASHA field, we derive from
 * visit `by` fields that contain 'ASHA'.
 * 
 * @param {Array} patients - Array of patient objects with visits
 * @returns {Array} Array of { worker, count } objects, sorted by count descending
 */
export function patientsPerAshaWorker(patients) {
  if (!patients || patients.length === 0) return [];

  const workerPatients = {};

  for (const patient of patients) {
    if (!patient.visits || patient.visits.length === 0) continue;

    // Find ASHA workers from visit records
    const ashaWorkers = new Set();
    for (const visit of patient.visits) {
      if (visit.by && visit.by.toLowerCase().includes('asha')) {
        ashaWorkers.add(visit.by);
      }
    }

    for (const worker of ashaWorkers) {
      if (!workerPatients[worker]) {
        workerPatients[worker] = new Set();
      }
      workerPatients[worker].add(patient.id);
    }
  }

  return Object.entries(workerPatients)
    .map(([worker, patientSet]) => ({
      worker,
      count: patientSet.size,
    }))
    .sort((a, b) => b.count - a.count);
}
