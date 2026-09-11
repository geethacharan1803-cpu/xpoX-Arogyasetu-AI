import {
  DEMO_USERS,
  DEMO_PATIENTS,
  DEMO_HEALTH_TICKETS,
  DEMO_REFERRALS,
  DEMO_FOLLOWUPS,
} from './demo-data.js';

export async function seedDatabaseIfEmpty(queryFn, queryOneFn) {
  try {
    const userCount = await queryOneFn('SELECT COUNT(*) as count FROM users');
    const count = parseInt(userCount?.count || 0);

    // 1. Seed Users if missing
    if (count === 0) {
      const users = [
        { id: 'U-001', name: 'Priya Kumari', email: 'asha.priya@arogyasetu.gov.in', phone: '9876543210', role: 'asha', phc: 'PHC Rampur', area: 'Rampur & Sundernagar' },
        { id: 'U-002', name: 'Dr. Sharma', email: 'dr.sharma@arogyasetu.gov.in', phone: '9876543211', role: 'doctor', phc: 'PHC Rampur', area: 'PHC Rampur' },
        { id: 'U-003', name: 'Lakshmi Devi', email: 'lakshmi.devi@citizen.gov.in', phone: '9876XXXX01', role: 'patient', patient_id: 'P-2026-001', area: 'Rampur' },
        { id: 'U-004', name: 'Vikram Singh', email: 'admin.vikram@arogyasetu.gov.in', phone: '9876543213', role: 'admin', area: 'District HQ' },
        { id: 'U-005', name: 'Sunita ANM', email: 'anm.sunita@arogyasetu.gov.in', phone: '9876543214', role: 'anm', phc: 'PHC Rampur', area: 'Rampur Sub-Centre' },
        { id: 'U-006', name: 'Ramesh CHO', email: 'cho.ramesh@arogyasetu.gov.in', phone: '9876543215', role: 'cho', phc: 'PHC Rampur', area: 'Health & Wellness Centre' },
        { id: 'U-007', name: 'Dr. Verma (BMO)', email: 'bmo.verma@arogyasetu.gov.in', phone: '9876543216', role: 'bmo', phc: 'Block Health Office', area: 'Rampur Block' },
        { id: 'U-008', name: 'Dr. Rao (CMHO)', email: 'cmho.rao@arogyasetu.gov.in', phone: '9876543217', role: 'cmho', phc: 'District Medical Office', area: 'District Medical Jurisdiction' },
      ];

      for (const u of users) {
        await queryFn(
          `INSERT INTO users (id, name, email_or_username, phone, role, phc, area, patient_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [u.id, u.name, u.email, u.phone, u.role, u.phc || null, u.area || null, u.patient_id || null]
        );
      }

      // 2. Seed ASHA Workers
      await queryFn(
        `INSERT INTO asha_workers (id, worker_id, user_id, name, village, locality, phc, block, district, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['W-001', 'ASHA-001', 'U-001', 'Priya Kumari', 'Rampur', 'Rampur Ward 2', 'PHC Rampur', 'Rampur Block', 'District HQ', '9876543210']
      );
    }

    // 3. Seed Patients & related clinical data (idempotent: checks each patient by ID)
    for (const p of DEMO_PATIENTS) {
      const existing = await queryOneFn('SELECT id FROM patients WHERE patient_id = ? OR id = ?', [p.id, p.id]);
      if (existing) continue;

      await queryFn(
        `INSERT INTO patients (id, patient_id, name, age, gender, phone, village, blood_group, is_pregnant, pregnancy_week, edd, conditions, allergies, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.id,
          p.name,
          p.age,
          p.gender,
          p.phone,
          p.village,
          p.bloodGroup,
          p.isPregnant ? 1 : 0,
          p.pregnancyWeek || null,
          p.edd || null,
          JSON.stringify(p.conditions || []),
          JSON.stringify(p.allergies || []),
          'ASHA Priya',
          p.registeredDate || '2026-01-01'
        ]
      );

      // Seed Vitals
      if (p.vitals && p.vitals.length > 0) {
        for (const v of p.vitals) {
          await queryFn(
            `INSERT INTO patient_vitals (patient_id, recorded_by, blood_pressure, pulse, temperature, weight, spo2, blood_sugar, hemoglobin, recorded_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              p.id,
              'ASHA Priya',
              v.bp || '120/80',
              v.pulse || 76,
              v.temp || 98.6,
              v.weight || 60,
              v.spo2 || 98,
              v.sugar || null,
              v.hemoglobin || null,
              v.date || '2026-01-01'
            ]
          );
        }
      }

      // Seed Symptoms / Conditions
      if (p.conditions && p.conditions.length > 0) {
        for (const cond of p.conditions) {
          await queryFn(
            `INSERT INTO patient_problems (patient_id, description, source, recorded_by, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            [p.id, cond, 'community_intake', 'ASHA Priya', p.registeredDate || '2026-01-01']
          );
        }
      }

      // Seed Hospital Visits
      if (p.visits && p.visits.length > 0) {
        for (const visit of p.visits) {
          await queryFn(
            `INSERT INTO hospital_visits (patient_id, facility_name, visit_date, visit_type, doctor, notes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [p.id, 'PHC Rampur', visit.date, visit.type, visit.by, visit.notes]
          );
        }
      }

      // Seed Prescriptions & Medications
      if (p.prescriptions && p.prescriptions.length > 0) {
        for (let i = 0; i < p.prescriptions.length; i++) {
          const rx = p.prescriptions[i];
          const rxId = `RX-${p.id}-${i + 1}`;
          await queryFn(
            `INSERT INTO prescriptions (id, prescription_id, patient_id, doctor_id, doctor_name, prescription_date, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [rxId, rxId, p.id, 'U-002', rx.doctor || 'Dr. Sharma', rx.date, 'Take regularly as prescribed.']
          );

          if (rx.medicines && rx.medicines.length > 0) {
            for (const med of rx.medicines) {
              await queryFn(
                `INSERT INTO prescription_items (prescription_id, medicine_name, dose, frequency, duration)
                 VALUES (?, ?, ?, ?, ?)`,
                [rxId, med.name, med.dosage, med.frequency, med.duration]
              );

              await queryFn(
                `INSERT INTO medications (patient_id, medicine_name, dose, frequency, duration, start_date, prescribing_doctor, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.id, med.name, med.dosage, med.frequency, med.duration, rx.date, rx.doctor || 'Dr. Sharma', 'CURRENT']
              );
            }
          }
        }
      }
    }

    // 4. Seed Health Tickets (idempotent)
    for (const ht of DEMO_HEALTH_TICKETS) {
      const existingTicket = await queryOneFn('SELECT id FROM health_tickets WHERE ticket_number = ? OR id = ?', [ht.id, ht.id]);
      if (existingTicket) continue;

      await queryFn(
        `INSERT INTO health_tickets (id, ticket_number, patient_id, patient_name, concern, symptoms, vitals_json, timeline_json, transcript, translated_transcript, detected_language, priority, status, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ht.id,
          ht.id,
          ht.patientId,
          ht.patientName,
          ht.concern,
          ht.symptoms || '',
          JSON.stringify(ht.vitals || {}),
          JSON.stringify(ht.timeline || []),
          ht.transcript || '',
          ht.translatedTranscript || '',
          ht.detectedLanguage || 'English',
          ht.priority || 'medium',
          ht.status || 'registered',
          ht.createdBy || 'ASHA Priya',
          ht.createdDate || '2026-01-01'
        ]
      );
    }

    // 5. Seed Referrals (idempotent)
    for (const r of DEMO_REFERRALS) {
      const existingRef = await queryOneFn('SELECT id FROM referrals WHERE referral_id = ? OR id = ?', [r.id, r.id]);
      if (existingRef) continue;

      await queryFn(
        `INSERT INTO referrals (id, referral_id, patient_id, patient_name, health_ticket_id, referred_by, referred_to, reason, priority, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.id,
          r.id,
          r.patientId,
          r.patientName,
          r.ticketId,
          r.createdBy || 'ASHA Priya',
          r.destination || 'PHC Rampur',
          r.reason,
          r.priority || 'medium',
          r.status || 'pending',
          r.createdDate || '2026-01-01'
        ]
      );
    }

    // 6. Seed Follow-ups (idempotent)
    for (const f of DEMO_FOLLOWUPS) {
      const existingFu = await queryOneFn('SELECT id FROM followups WHERE followup_id = ? OR id = ?', [f.id, f.id]);
      if (existingFu) continue;

      await queryFn(
        `INSERT INTO followups (id, followup_id, patient_id, patient_name, assigned_to, reason, followup_date, followup_type, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          f.id,
          f.id,
          f.patientId,
          f.patientName,
          f.assignedTo || 'ASHA Priya',
          f.reason,
          f.dueDate || '2026-01-01',
          f.type || 'Follow-up',
          f.status || 'upcoming'
        ]
      );
    }

    // 7. Initial Audit Log if not logged
    const auditExists = await queryOneFn("SELECT id FROM audit_logs WHERE action = 'DATABASE_INITIALIZATION'");
    if (!auditExists) {
      await queryFn(
        `INSERT INTO audit_logs (user_id, user_role, action, entity, details)
         VALUES (?, ?, ?, ?, ?)`,
        ['SYSTEM', 'system', 'DATABASE_INITIALIZATION', 'database', 'Initialized database tables and baseline demonstration clinical dataset']
      );
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}
