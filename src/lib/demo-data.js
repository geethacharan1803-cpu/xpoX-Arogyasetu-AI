// ArogyaSetu AI — Demo Data
// All data is synthetic and for demonstration purposes only

const today = new Date();
const formatDate = (d) => d.toISOString().split('T')[0];
const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return formatDate(d); };
const daysFromNow = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return formatDate(d); };

export const DEMO_PATIENTS = [
  {
    id: 'P-2026-001',
    name: 'Lakshmi Devi',
    age: 28,
    gender: 'Female',
    phone: '9876XXXX01',
    village: 'Rampur',
    bloodGroup: 'B+',
    isPregnant: true,
    pregnancyWeek: 32,
    edd: daysFromNow(56),
    registeredDate: daysAgo(180),
    lastVisit: daysAgo(7),
    conditions: ['Pregnancy', 'Mild Anemia'],
    allergies: ['None known'],
    vitals: [
      { date: daysAgo(7), bp: '110/70', pulse: 82, temp: 98.4, weight: 62, spo2: 98, hemoglobin: 10.2 },
      { date: daysAgo(30), bp: '108/68', pulse: 78, temp: 98.6, weight: 60, spo2: 99, hemoglobin: 10.0 },
    ],
    visits: [
      { date: daysAgo(7), type: 'ANC Visit', notes: 'Regular ANC checkup. Vitals normal. Iron supplements continued.', by: 'ASHA Priya' },
      { date: daysAgo(30), type: 'ANC Visit', notes: 'Weight gain on track. BP normal. Advised nutrition.', by: 'ASHA Priya' },
      { date: daysAgo(60), type: 'ANC Visit', notes: 'Ultrasound done. Baby growth normal.', by: 'Dr. Sharma' },
    ],
    prescriptions: [
      { date: daysAgo(7), doctor: 'Dr. Sharma', medicines: [
        { name: 'Iron Folic Acid', dosage: '1 tablet', frequency: 'Once daily', duration: '90 days' },
        { name: 'Calcium', dosage: '500mg', frequency: 'Twice daily', duration: '60 days' },
      ]},
    ],
    reports: [
      { date: daysAgo(60), type: 'Ultrasound', result: 'Normal fetal growth', facility: 'PHC Rampur' },
      { date: daysAgo(90), type: 'Blood Test', result: 'Hemoglobin 10.0 g/dL', facility: 'PHC Rampur' },
    ],
  },
  {
    id: 'P-2026-002',
    name: 'Rajesh Kumar',
    age: 55,
    gender: 'Male',
    phone: '9876XXXX02',
    village: 'Rampur',
    bloodGroup: 'A+',
    isPregnant: false,
    registeredDate: daysAgo(365),
    lastVisit: daysAgo(3),
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    allergies: ['Penicillin'],
    vitals: [
      { date: daysAgo(3), bp: '140/90', pulse: 76, temp: 98.2, weight: 78, spo2: 97, sugar: 180 },
      { date: daysAgo(30), bp: '145/92', pulse: 80, temp: 98.4, weight: 79, spo2: 96, sugar: 200 },
    ],
    visits: [
      { date: daysAgo(3), type: 'Follow-up', notes: 'BP slightly elevated. Sugar 180 fasting. Medication adjusted.', by: 'Dr. Sharma' },
      { date: daysAgo(30), type: 'Regular Checkup', notes: 'Sugar levels high. Diet counseling given.', by: 'ASHA Priya' },
    ],
    prescriptions: [
      { date: daysAgo(3), doctor: 'Dr. Sharma', medicines: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days' },
        { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' },
      ]},
    ],
    reports: [
      { date: daysAgo(30), type: 'Blood Sugar', result: 'Fasting: 200 mg/dL, PP: 280 mg/dL', facility: 'PHC Rampur' },
    ],
  },
  {
    id: 'P-2026-003',
    name: 'Sita Kumari',
    age: 24,
    gender: 'Female',
    phone: '9876XXXX03',
    village: 'Sundernagar',
    bloodGroup: 'O+',
    isPregnant: true,
    pregnancyWeek: 16,
    edd: daysFromNow(168),
    registeredDate: daysAgo(60),
    lastVisit: daysAgo(14),
    conditions: ['Pregnancy'],
    allergies: ['None known'],
    vitals: [
      { date: daysAgo(14), bp: '106/66', pulse: 74, temp: 98.6, weight: 54, spo2: 99, hemoglobin: 11.5 },
    ],
    visits: [
      { date: daysAgo(14), type: 'ANC Visit', notes: 'First trimester completed. All normal.', by: 'ASHA Priya' },
    ],
    prescriptions: [
      { date: daysAgo(14), doctor: 'Dr. Reddy', medicines: [
        { name: 'Folic Acid', dosage: '5mg', frequency: 'Once daily', duration: '90 days' },
      ]},
    ],
    reports: [],
  },
  {
    id: 'P-2026-004',
    name: 'Ramu Yadav',
    age: 8,
    gender: 'Male',
    phone: '9876XXXX04',
    village: 'Rampur',
    bloodGroup: 'B-',
    isPregnant: false,
    registeredDate: daysAgo(730),
    lastVisit: daysAgo(5),
    conditions: ['Seasonal Fever'],
    allergies: ['None known'],
    vitals: [
      { date: daysAgo(5), bp: '90/60', pulse: 100, temp: 101.2, weight: 24, spo2: 98 },
    ],
    visits: [
      { date: daysAgo(5), type: 'Sick Visit', notes: 'Fever for 2 days. Mild cough. No rash.', by: 'ASHA Priya' },
    ],
    prescriptions: [
      { date: daysAgo(5), doctor: 'Dr. Sharma', medicines: [
        { name: 'Paracetamol Syrup', dosage: '5ml', frequency: 'Three times daily', duration: '3 days' },
        { name: 'ORS', dosage: '1 packet', frequency: 'As needed', duration: '3 days' },
      ]},
    ],
    reports: [],
  },
  {
    id: 'P-2026-005',
    name: 'Meena Bai',
    age: 62,
    gender: 'Female',
    phone: '9876XXXX05',
    village: 'Sundernagar',
    bloodGroup: 'AB+',
    isPregnant: false,
    registeredDate: daysAgo(500),
    lastVisit: daysAgo(10),
    conditions: ['Hypertension', 'Arthritis'],
    allergies: ['Sulfa drugs'],
    vitals: [
      { date: daysAgo(10), bp: '150/95', pulse: 72, temp: 98.0, weight: 65, spo2: 96 },
    ],
    visits: [
      { date: daysAgo(10), type: 'Follow-up', notes: 'Joint pain persisting. BP elevated. Referred to district hospital.', by: 'ASHA Priya' },
    ],
    prescriptions: [
      { date: daysAgo(10), doctor: 'Dr. Reddy', medicines: [
        { name: 'Enalapril', dosage: '5mg', frequency: 'Once daily', duration: '30 days' },
      ]},
    ],
    reports: [],
  },
  {
    id: 'P-2026-006',
    name: 'Anita Devi',
    age: 30,
    gender: 'Female',
    phone: '9876XXXX06',
    village: 'Rampur',
    bloodGroup: 'A-',
    isPregnant: true,
    pregnancyWeek: 38,
    edd: daysFromNow(14),
    registeredDate: daysAgo(240),
    lastVisit: daysAgo(2),
    conditions: ['Pregnancy', 'Gestational Diabetes'],
    allergies: ['None known'],
    vitals: [
      { date: daysAgo(2), bp: '120/78', pulse: 86, temp: 98.6, weight: 70, spo2: 98, hemoglobin: 11.0, sugar: 140 },
    ],
    visits: [
      { date: daysAgo(2), type: 'ANC Visit', notes: 'Week 38. GDM controlled. Institutional delivery planned.', by: 'ASHA Priya' },
    ],
    prescriptions: [
      { date: daysAgo(2), doctor: 'Dr. Sharma', medicines: [
        { name: 'Insulin (as prescribed)', dosage: 'As directed', frequency: 'As directed', duration: 'Until delivery' },
        { name: 'Iron Folic Acid', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' },
      ]},
    ],
    reports: [
      { date: daysAgo(7), type: 'GTT', result: 'Gestational diabetes confirmed', facility: 'District Hospital' },
    ],
  },
  {
    id: 'P-2026-007',
    name: 'Suresh Reddy',
    age: 45,
    gender: 'Male',
    phone: '9876XXXX07',
    village: 'Sundernagar',
    bloodGroup: 'O-',
    isPregnant: false,
    registeredDate: daysAgo(200),
    lastVisit: daysAgo(20),
    conditions: ['Chronic Cough'],
    allergies: ['None known'],
    vitals: [
      { date: daysAgo(20), bp: '118/76', pulse: 78, temp: 98.8, weight: 68, spo2: 95 },
    ],
    visits: [
      { date: daysAgo(20), type: 'Sick Visit', notes: 'Persistent cough for 3 weeks. Referred for TB screening.', by: 'ASHA Priya' },
    ],
    prescriptions: [],
    reports: [],
  },
  {
    id: 'P-2026-008',
    name: 'Kavitha Prasad',
    age: 35,
    gender: 'Female',
    phone: '9876XXXX08',
    village: 'Rampur',
    bloodGroup: 'B+',
    isPregnant: false,
    registeredDate: daysAgo(100),
    lastVisit: daysAgo(1),
    conditions: ['Seasonal Allergy'],
    allergies: ['Dust'],
    vitals: [
      { date: daysAgo(1), bp: '110/70', pulse: 72, temp: 98.4, weight: 58, spo2: 99 },
    ],
    visits: [
      { date: daysAgo(1), type: 'Sick Visit', notes: 'Nasal congestion, sneezing. Seasonal allergy.', by: 'ASHA Priya' },
    ],
    prescriptions: [
      { date: daysAgo(1), doctor: 'Dr. Reddy', medicines: [
        { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '5 days' },
      ]},
    ],
    reports: [],
  },
];

export const DEMO_HEALTH_TICKETS = [
  {
    id: 'HT-2026-000124',
    patientId: 'P-2026-001',
    patientName: 'Lakshmi Devi',
    concern: 'Routine ANC checkup - Week 32',
    priority: 'medium',
    status: 'follow-up-scheduled',
    createdDate: daysAgo(7),
    createdBy: 'ASHA Priya',
    timeline: [
      { step: 'Registered', date: daysAgo(7), completed: true, note: 'Health ticket created during home visit' },
      { step: 'Symptoms Recorded', date: daysAgo(7), completed: true, note: 'Mild fatigue, back pain' },
      { step: 'Vitals Added', date: daysAgo(7), completed: true, note: 'BP 110/70, Pulse 82' },
      { step: 'Referred', date: daysAgo(7), completed: true, note: 'Referred to PHC for ANC review' },
      { step: 'Doctor Reviewed', date: daysAgo(6), completed: true, note: 'Dr. Sharma reviewed. Continue supplements.' },
      { step: 'Prescription Added', date: daysAgo(6), completed: true, note: 'Iron and Calcium continued' },
      { step: 'Follow-up Scheduled', date: daysAgo(6), completed: true, note: 'Next visit in 2 weeks' },
    ],
    vitals: { bp: '110/70', pulse: 82, temp: 98.4, weight: 62, spo2: 98 },
    symptoms: 'Mild fatigue, lower back pain. No swelling. No headaches.',
    transcript: 'Patient reports mild tiredness and lower back pain since last week.',
    translatedTranscript: null,
    detectedLanguage: 'Hindi',
  },
  {
    id: 'HT-2026-000125',
    patientId: 'P-2026-002',
    patientName: 'Rajesh Kumar',
    concern: 'Elevated blood sugar and blood pressure',
    priority: 'high',
    status: 'doctor-reviewed',
    createdDate: daysAgo(3),
    createdBy: 'ASHA Priya',
    timeline: [
      { step: 'Registered', date: daysAgo(3), completed: true, note: 'Health ticket created' },
      { step: 'Symptoms Recorded', date: daysAgo(3), completed: true, note: 'Dizziness, frequent urination' },
      { step: 'Vitals Added', date: daysAgo(3), completed: true, note: 'BP 140/90, Sugar 180' },
      { step: 'Referred', date: daysAgo(3), completed: true, note: 'Urgent referral to PHC' },
      { step: 'Doctor Reviewed', date: daysAgo(2), completed: true, note: 'Medication adjusted by Dr. Sharma' },
      { step: 'Prescription Added', date: daysAgo(2), completed: true, note: 'Metformin and Amlodipine prescribed' },
      { step: 'Follow-up Scheduled', date: daysAgo(2), completed: false, note: '' },
    ],
    vitals: { bp: '140/90', pulse: 76, temp: 98.2, weight: 78, spo2: 97, sugar: 180 },
    symptoms: 'Dizziness in morning, increased urination, occasional blurred vision.',
    transcript: 'Subah se chakkar aa raha hai, baar baar bathroom jaana pad raha hai.',
    translatedTranscript: 'Feeling dizzy since morning, frequent urination.',
    detectedLanguage: 'Hindi',
  },
  {
    id: 'HT-2026-000126',
    patientId: 'P-2026-004',
    patientName: 'Ramu Yadav',
    concern: 'Fever for 2 days with mild cough',
    priority: 'medium',
    status: 'prescription-added',
    createdDate: daysAgo(5),
    createdBy: 'ASHA Priya',
    timeline: [
      { step: 'Registered', date: daysAgo(5), completed: true, note: 'Child brought by mother' },
      { step: 'Symptoms Recorded', date: daysAgo(5), completed: true, note: 'Fever, mild cough, no rash' },
      { step: 'Vitals Added', date: daysAgo(5), completed: true, note: 'Temp 101.2, Pulse 100' },
      { step: 'Referred', date: daysAgo(5), completed: true, note: 'Referred to PHC' },
      { step: 'Doctor Reviewed', date: daysAgo(4), completed: true, note: 'Viral fever. Symptomatic treatment.' },
      { step: 'Prescription Added', date: daysAgo(4), completed: true, note: 'Paracetamol and ORS' },
      { step: 'Follow-up Scheduled', date: daysAgo(4), completed: false, note: '' },
    ],
    vitals: { bp: '90/60', pulse: 100, temp: 101.2, weight: 24, spo2: 98 },
    symptoms: 'Fever since 2 days, mild dry cough, no rash, appetite reduced.',
    transcript: 'Bacche ko do din se bukhar hai, khansi bhi hai.',
    translatedTranscript: 'Child has fever for 2 days, also has cough.',
    detectedLanguage: 'Hindi',
  },
  {
    id: 'HT-2026-000127',
    patientId: 'P-2026-005',
    patientName: 'Meena Bai',
    concern: 'Joint pain and elevated blood pressure',
    priority: 'high',
    status: 'referred',
    createdDate: daysAgo(10),
    createdBy: 'ASHA Priya',
    timeline: [
      { step: 'Registered', date: daysAgo(10), completed: true, note: 'Created during home visit' },
      { step: 'Symptoms Recorded', date: daysAgo(10), completed: true, note: 'Knee and hip pain, headache' },
      { step: 'Vitals Added', date: daysAgo(10), completed: true, note: 'BP 150/95' },
      { step: 'Referred', date: daysAgo(10), completed: true, note: 'Referred to District Hospital' },
      { step: 'Doctor Reviewed', date: null, completed: false, note: '' },
      { step: 'Prescription Added', date: null, completed: false, note: '' },
      { step: 'Follow-up Scheduled', date: null, completed: false, note: '' },
    ],
    vitals: { bp: '150/95', pulse: 72, temp: 98.0, weight: 65, spo2: 96 },
    symptoms: 'Severe joint pain in both knees, difficulty walking, headaches.',
    transcript: 'Ghutno mein bahut dard hai, chal nahi paa rahi hoon.',
    translatedTranscript: 'Severe knee pain, unable to walk properly.',
    detectedLanguage: 'Hindi',
  },
  {
    id: 'HT-2026-000128',
    patientId: 'P-2026-007',
    patientName: 'Suresh Reddy',
    concern: 'Persistent cough for 3 weeks',
    priority: 'high',
    status: 'referred',
    createdDate: daysAgo(20),
    createdBy: 'ASHA Priya',
    timeline: [
      { step: 'Registered', date: daysAgo(20), completed: true, note: 'Patient visited ASHA for help' },
      { step: 'Symptoms Recorded', date: daysAgo(20), completed: true, note: 'Persistent cough, weight loss' },
      { step: 'Vitals Added', date: daysAgo(20), completed: true, note: 'SpO2 95%, mild weight loss' },
      { step: 'Referred', date: daysAgo(20), completed: true, note: 'Referred for TB screening at District Hospital' },
      { step: 'Doctor Reviewed', date: null, completed: false, note: '' },
      { step: 'Prescription Added', date: null, completed: false, note: '' },
      { step: 'Follow-up Scheduled', date: null, completed: false, note: '' },
    ],
    vitals: { bp: '118/76', pulse: 78, temp: 98.8, weight: 68, spo2: 95 },
    symptoms: 'Cough for 3 weeks, some weight loss, night sweats occasionally.',
    transcript: 'Moodu vaaraalugaa daggu vastundi, baruvu thaggutundi.',
    translatedTranscript: 'Cough for 3 weeks, losing weight.',
    detectedLanguage: 'Telugu',
  },
  {
    id: 'HT-2026-000129',
    patientId: 'P-2026-006',
    patientName: 'Anita Devi',
    concern: 'Week 38 ANC - Gestational Diabetes monitoring',
    priority: 'high',
    status: 'follow-up-scheduled',
    createdDate: daysAgo(2),
    createdBy: 'ASHA Priya',
    timeline: [
      { step: 'Registered', date: daysAgo(2), completed: true, note: 'Routine ANC visit' },
      { step: 'Symptoms Recorded', date: daysAgo(2), completed: true, note: 'No complaints, GDM controlled' },
      { step: 'Vitals Added', date: daysAgo(2), completed: true, note: 'BP 120/78, Sugar 140' },
      { step: 'Referred', date: daysAgo(2), completed: true, note: 'Continue at District Hospital' },
      { step: 'Doctor Reviewed', date: daysAgo(1), completed: true, note: 'Dr. Sharma: Plan institutional delivery' },
      { step: 'Prescription Added', date: daysAgo(1), completed: true, note: 'Insulin continued' },
      { step: 'Follow-up Scheduled', date: daysAgo(1), completed: true, note: 'Weekly follow-up until delivery' },
    ],
    vitals: { bp: '120/78', pulse: 86, temp: 98.6, weight: 70, spo2: 98, sugar: 140 },
    symptoms: 'No new symptoms. GDM under control with insulin.',
    transcript: 'Sab theek hai, sugar dawai se control mein hai.',
    translatedTranscript: 'Everything fine, sugar controlled with medication.',
    detectedLanguage: 'Hindi',
  },
];

export const DEMO_REFERRALS = [
  {
    id: 'REF-2026-001',
    ticketId: 'HT-2026-000125',
    patientId: 'P-2026-002',
    patientName: 'Rajesh Kumar',
    reason: 'Elevated blood sugar (180 mg/dL) and blood pressure (140/90)',
    priority: 'high',
    destination: 'PHC Rampur',
    createdDate: daysAgo(3),
    createdBy: 'ASHA Priya',
    status: 'completed',
  },
  {
    id: 'REF-2026-002',
    ticketId: 'HT-2026-000127',
    patientId: 'P-2026-005',
    patientName: 'Meena Bai',
    reason: 'Severe joint pain, hypertension not controlled with current medication',
    priority: 'high',
    destination: 'District Hospital Hyderabad',
    createdDate: daysAgo(10),
    createdBy: 'ASHA Priya',
    status: 'pending',
  },
  {
    id: 'REF-2026-003',
    ticketId: 'HT-2026-000128',
    patientId: 'P-2026-007',
    patientName: 'Suresh Reddy',
    reason: 'Persistent cough for 3 weeks, possible TB - needs sputum test',
    priority: 'high',
    destination: 'District Hospital Hyderabad',
    createdDate: daysAgo(20),
    createdBy: 'ASHA Priya',
    status: 'in-review',
  },
  {
    id: 'REF-2026-004',
    ticketId: 'HT-2026-000126',
    patientId: 'P-2026-004',
    patientName: 'Ramu Yadav',
    reason: 'Child with persistent fever for 2 days',
    priority: 'medium',
    destination: 'PHC Rampur',
    createdDate: daysAgo(5),
    createdBy: 'ASHA Priya',
    status: 'completed',
  },
  {
    id: 'REF-2026-005',
    ticketId: 'HT-2026-000129',
    patientId: 'P-2026-006',
    patientName: 'Anita Devi',
    reason: 'Week 38 pregnancy with GDM - Plan institutional delivery',
    priority: 'high',
    destination: 'District Hospital Hyderabad',
    createdDate: daysAgo(2),
    createdBy: 'ASHA Priya',
    status: 'accepted',
  },
];

export const DEMO_FOLLOWUPS = [
  {
    id: 'FU-001',
    patientId: 'P-2026-001',
    patientName: 'Lakshmi Devi',
    reason: 'ANC Week 34 checkup',
    dueDate: daysFromNow(0),
    status: 'due-today',
    type: 'ANC Visit',
    assignedTo: 'ASHA Priya',
  },
  {
    id: 'FU-002',
    patientId: 'P-2026-002',
    patientName: 'Rajesh Kumar',
    reason: 'Diabetes and BP follow-up, check medication response',
    dueDate: daysFromNow(4),
    status: 'upcoming',
    type: 'Follow-up',
    assignedTo: 'ASHA Priya',
  },
  {
    id: 'FU-003',
    patientId: 'P-2026-006',
    patientName: 'Anita Devi',
    reason: 'Weekly ANC visit - GDM monitoring',
    dueDate: daysFromNow(5),
    status: 'upcoming',
    type: 'ANC Visit',
    assignedTo: 'ASHA Priya',
  },
  {
    id: 'FU-004',
    patientId: 'P-2026-004',
    patientName: 'Ramu Yadav',
    reason: 'Check fever resolution',
    dueDate: daysAgo(2),
    status: 'overdue',
    type: 'Follow-up',
    assignedTo: 'ASHA Priya',
  },
  {
    id: 'FU-005',
    patientId: 'P-2026-005',
    patientName: 'Meena Bai',
    reason: 'Post district hospital referral check',
    dueDate: daysAgo(3),
    status: 'overdue',
    type: 'Follow-up',
    assignedTo: 'ASHA Priya',
  },
  {
    id: 'FU-006',
    patientId: 'P-2026-008',
    patientName: 'Kavitha Prasad',
    reason: 'Allergy follow-up',
    dueDate: daysFromNow(0),
    status: 'due-today',
    type: 'Follow-up',
    assignedTo: 'ASHA Priya',
  },
  {
    id: 'FU-007',
    patientId: 'P-2026-003',
    patientName: 'Sita Kumari',
    reason: 'ANC Week 18 checkup',
    dueDate: daysFromNow(14),
    status: 'upcoming',
    type: 'ANC Visit',
    assignedTo: 'ASHA Priya',
  },
];

export const DEMO_FACILITIES = [
  {
    id: 'FAC-001',
    name: 'PHC Rampur',
    type: 'Primary Health Centre',
    address: 'Main Road, Rampur Village',
    distance: '2 km',
    phone: 'DEMO - Not a real number',
    services: ['General OPD', 'ANC', 'Immunization', 'Basic Lab'],
    doctors: ['Dr. Sharma', 'Dr. Reddy'],
  },
  {
    id: 'FAC-002',
    name: 'Sub-Centre Sundernagar',
    type: 'Sub-Centre',
    address: 'Village Road, Sundernagar',
    distance: '0.5 km',
    phone: 'DEMO - Not a real number',
    services: ['Basic Healthcare', 'ANC', 'Immunization'],
    doctors: [],
  },
  {
    id: 'FAC-003',
    name: 'District Hospital',
    type: 'District Hospital',
    address: 'NH Road, District HQ',
    distance: '25 km',
    phone: 'DEMO - Not a real number',
    services: ['Emergency', 'Surgery', 'Maternity', 'Lab', 'Radiology', 'TB Screening'],
    doctors: ['Multiple specialists available'],
  },
  {
    id: 'FAC-004',
    name: 'Community Health Centre',
    type: 'Government Hospital',
    address: 'Block Road, Block HQ',
    distance: '12 km',
    phone: 'DEMO - Not a real number',
    services: ['OPD', 'Emergency', 'Maternity', 'Lab'],
    doctors: ['Dr. Patel', 'Dr. Singh'],
  },
];

export const DEMO_EDUCATION = [
  {
    id: 'EDU-001',
    category: 'Maternal Health',
    title: 'Importance of Regular ANC Visits',
    description: 'Learn about the recommended schedule for antenatal care visits and what to expect during each visit.',
    content: 'Regular ANC visits help monitor the health of both mother and baby. WHO recommends at least 8 contacts during pregnancy. Early registration helps identify and manage complications.',
    languages: ['English', 'Hindi', 'Telugu'],
    hasAudio: true,
  },
  {
    id: 'EDU-002',
    category: 'Nutrition',
    title: 'Balanced Diet During Pregnancy',
    description: 'Nutritional requirements during pregnancy and how to meet them with locally available foods.',
    content: 'During pregnancy, the body needs extra iron, calcium, folic acid and protein. Locally available foods like green leafy vegetables, dairy products, pulses and fruits can help meet these needs.',
    languages: ['English', 'Hindi', 'Telugu'],
    hasAudio: true,
  },
  {
    id: 'EDU-003',
    category: 'Vaccination',
    title: 'Child Immunization Schedule',
    description: 'Complete immunization schedule for children from birth to 5 years as per national guidelines.',
    content: 'Timely vaccination protects children from dangerous diseases. The national immunization schedule includes BCG, OPV, Hepatitis B, Pentavalent, Rotavirus, PCV, MR, JE and DPT vaccines.',
    languages: ['English', 'Hindi', 'Telugu'],
    hasAudio: true,
  },
  {
    id: 'EDU-004',
    category: 'Sanitation',
    title: 'Clean Water and Hygiene Practices',
    description: 'Simple steps for water purification and hygiene to prevent waterborne diseases.',
    content: 'Boiling water for 1 minute kills most harmful bacteria. Regular handwashing with soap, especially before meals and after using the toilet, prevents many diseases.',
    languages: ['English', 'Hindi', 'Telugu'],
    hasAudio: false,
  },
  {
    id: 'EDU-005',
    category: 'Seasonal Health',
    title: 'Preventing Dengue and Malaria',
    description: 'Steps to prevent mosquito-borne diseases during monsoon season.',
    content: 'Remove stagnant water around the house. Use mosquito nets while sleeping. Wear full-sleeve clothing. Seek medical attention immediately if you have high fever with body pain.',
    languages: ['English', 'Hindi', 'Telugu'],
    hasAudio: true,
  },
  {
    id: 'EDU-006',
    category: 'Maternal Health',
    title: 'Danger Signs During Pregnancy',
    description: 'Warning signs that need immediate medical attention during pregnancy.',
    content: 'Seek immediate help if you notice: severe headache, blurred vision, swelling of face/hands, vaginal bleeding, reduced baby movements, high fever, or severe abdominal pain.',
    languages: ['English', 'Hindi', 'Telugu'],
    hasAudio: true,
  },
];

export const DEMO_USERS = {
  asha: { id: 'U-001', name: 'Priya Kumari', role: 'asha', phone: '98XXXXXXX1', area: 'Rampur & Sundernagar', phc: 'PHC Rampur' },
  doctor: { id: 'U-002', name: 'Dr. Sharma', role: 'doctor', phone: '98XXXXXXX2', specialization: 'General Medicine', phc: 'PHC Rampur' },
  patient: { id: 'U-003', name: 'Lakshmi Devi', role: 'patient', phone: '9876XXXX01', patientId: 'P-2026-001' },
  admin: { id: 'U-004', name: 'Vikram Singh', role: 'admin', phone: '98XXXXXXX4', area: 'District HQ' },
};

export function getPatientById(id) {
  return DEMO_PATIENTS.find(p => p.id === id) || null;
}

export function getTicketsByPatient(patientId) {
  return DEMO_HEALTH_TICKETS.filter(t => t.patientId === patientId);
}

export function getReferralsByPatient(patientId) {
  return DEMO_REFERRALS.filter(r => r.patientId === patientId);
}

export function getFollowupsByPatient(patientId) {
  return DEMO_FOLLOWUPS.filter(f => f.patientId === patientId);
}

export function searchPatients(query) {
  if (!query) return DEMO_PATIENTS;
  const q = query.toLowerCase();
  return DEMO_PATIENTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.id.toLowerCase().includes(q) ||
    p.phone.toLowerCase().includes(q) ||
    p.village.toLowerCase().includes(q)
  );
}

export function getTicketById(id) {
  return DEMO_HEALTH_TICKETS.find(t => t.id === id) || null;
}
