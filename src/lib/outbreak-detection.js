/**
 * Outbreak / Cluster Detection — Pure Function
 * 
 * Flags when 3+ patients in the same village report similar symptoms
 * within a 7-day window. Uses simple keyword matching, not ML.
 */

const SYMPTOM_KEYWORDS = [
  'fever',
  'diarrhea',
  'diarrhoea',
  'vomiting',
  'rash',
  'cough',
  'headache',
  'cold',
  'malaria',
  'dengue',
  'jaundice',
  'breathlessness',
];

/**
 * Normalize a symptom text to extract matching keywords.
 * Returns an array of matched keywords.
 */
function extractSymptomKeywords(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  return SYMPTOM_KEYWORDS.filter(keyword => lower.includes(keyword));
}

/**
 * Detect outbreak clusters from tickets and patients.
 * 
 * @param {Array} tickets - Array of health ticket objects (DEMO_HEALTH_TICKETS shape)
 * @param {Array} patients - Array of patient objects (DEMO_PATIENTS shape)
 * @returns {Array} Array of cluster objects:
 *   { village, symptom, patientCount, patientIds, firstReported }
 */
export function detectClusters(tickets, patients) {
  if (!tickets || !patients || tickets.length === 0 || patients.length === 0) {
    return [];
  }

  // Build a patient lookup by ID for village resolution
  const patientMap = {};
  for (const p of patients) {
    patientMap[p.id] = p;
  }

  // Filter tickets from the last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentTickets = tickets.filter(t => {
    const created = new Date(t.createdDate);
    return created >= sevenDaysAgo && created <= now;
  });

  // Group by (village, symptom) pair
  // Key format: "village::symptom"
  const clusterMap = {};

  for (const ticket of recentTickets) {
    const patient = patientMap[ticket.patientId];
    if (!patient) continue;

    const village = patient.village;
    if (!village) continue;

    // Extract symptom keywords from ticket text fields
    const textToSearch = [
      ticket.symptoms || '',
      ticket.concern || '',
      ticket.transcript || '',
      ticket.translatedTranscript || '',
    ].join(' ');

    const keywords = extractSymptomKeywords(textToSearch);

    for (const symptom of keywords) {
      const key = `${village}::${symptom}`;
      if (!clusterMap[key]) {
        clusterMap[key] = {
          village,
          symptom,
          patientIds: new Set(),
          firstReported: ticket.createdDate,
        };
      }

      clusterMap[key].patientIds.add(ticket.patientId);

      // Track earliest report date
      if (new Date(ticket.createdDate) < new Date(clusterMap[key].firstReported)) {
        clusterMap[key].firstReported = ticket.createdDate;
      }
    }
  }

  // Filter for clusters with 3+ distinct patients
  const clusters = [];
  for (const key of Object.keys(clusterMap)) {
    const entry = clusterMap[key];
    if (entry.patientIds.size >= 3) {
      clusters.push({
        village: entry.village,
        symptom: entry.symptom,
        patientCount: entry.patientIds.size,
        patientIds: Array.from(entry.patientIds),
        firstReported: entry.firstReported,
      });
    }
  }

  // Sort by patient count descending
  clusters.sort((a, b) => b.patientCount - a.patientCount);

  return clusters;
}
