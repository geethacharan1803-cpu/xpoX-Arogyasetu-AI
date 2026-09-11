import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const village = searchParams.get('village');
    const isPregnant = searchParams.get('is_pregnant');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `SELECT * FROM patients WHERE 1=1`;
    const params = [];

    if (q.trim()) {
      const searchTerm = `%${q.trim().toLowerCase()}%`;
      sql += ` AND (LOWER(name) LIKE ? OR LOWER(patient_id) LIKE ? OR LOWER(village) LIKE ? OR phone LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (village) {
      sql += ` AND LOWER(village) = LOWER(?)`;
      params.push(village);
    }

    if (isPregnant !== null && isPregnant !== undefined && isPregnant !== '') {
      sql += ` AND is_pregnant = ?`;
      params.push(isPregnant === 'true' || isPregnant === '1' ? 1 : 0);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await query(sql, params);
    
    // Parse JSON fields
    const patients = result.rows.map(p => ({
      ...p,
      id: p.patient_id || p.id,
      conditions: p.conditions ? (typeof p.conditions === 'string' ? JSON.parse(p.conditions) : p.conditions) : [],
      allergies: p.allergies ? (typeof p.allergies === 'string' ? JSON.parse(p.allergies) : p.allergies) : [],
      isPregnant: Boolean(p.is_pregnant),
      pregnancyWeek: p.pregnancy_week,
      bloodGroup: p.blood_group,
      registeredDate: p.created_at ? p.created_at.split('T')[0].split(' ')[0] : 'Today',
      lastVisit: 'Recently',
    }));

    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM patients WHERE 1=1`;
    const countParams = [];
    if (q.trim()) {
      const searchTerm = `%${q.trim().toLowerCase()}%`;
      countSql += ` AND (LOWER(name) LIKE ? OR LOWER(patient_id) LIKE ? OR LOWER(village) LIKE ? OR phone LIKE ?)`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (village) {
      countSql += ` AND LOWER(village) = LOWER(?)`;
      countParams.push(village);
    }
    const countRes = await queryOne(countSql, countParams);

    return NextResponse.json({
      patients,
      total: parseInt(countRes?.total || 0),
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Failed to retrieve patients from database' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      name,
      age,
      gender,
      village,
      phone,
      bloodGroup,
      isPregnant,
      pregnancyWeek,
      conditions,
      allergies,
      address,
      emergencyContact,
      bp,
      pulse,
      temp,
      weight,
      spo2,
      bloodSugar,
      createdBy,
      checkDuplicateOnly,
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Patient full name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedPhone = (phone || '').trim();
    const trimmedVillage = (village || 'Rampur').trim() || 'Rampur';

    // Check for duplicate patient (matching name AND phone, or matching name AND village)
    let duplicateQuery = `SELECT * FROM patients WHERE LOWER(name) = LOWER(?)`;
    const duplicateParams = [trimmedName];

    if (trimmedPhone) {
      duplicateQuery += ` AND (phone = ? OR LOWER(village) = LOWER(?))`;
      duplicateParams.push(trimmedPhone, trimmedVillage);
    } else {
      duplicateQuery += ` AND LOWER(village) = LOWER(?))`;
      // Fix parenthesis if single condition
      duplicateQuery = `SELECT * FROM patients WHERE LOWER(name) = LOWER(?) AND LOWER(village) = LOWER(?)`;
      duplicateParams.push(trimmedVillage);
    }

    const existing = await queryOne(duplicateQuery, duplicateParams);

    if (checkDuplicateOnly) {
      return NextResponse.json({
        possibleDuplicate: Boolean(existing),
        existingPatient: existing ? {
          id: existing.patient_id,
          name: existing.name,
          age: existing.age,
          village: existing.village,
          phone: existing.phone,
        } : null
      });
    }

    // Generate consecutive, collision-proof Patient ID
    const existingIds = await query("SELECT patient_id FROM patients WHERE patient_id LIKE 'P-2026-%'");
    let maxSeq = 0;
    for (const row of existingIds.rows || []) {
      const match = (row.patient_id || '').match(/^P-2026-(\d+)$/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    }
    let nextNum = Math.max(maxSeq + 1, (existingIds.rows ? existingIds.rows.length : 0) + 1, 1);
    let patientId = `P-2026-${String(nextNum).padStart(3, '0')}`;

    // Guarantee uniqueness
    let collision = await queryOne('SELECT id FROM patients WHERE patient_id = ? OR id = ?', [patientId, patientId]);
    while (collision) {
      nextNum++;
      patientId = `P-2026-${String(nextNum).padStart(3, '0')}`;
      collision = await queryOne('SELECT id FROM patients WHERE patient_id = ? OR id = ?', [patientId, patientId]);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    // Safe number parsers (guaranteed never to return NaN)
    const safeParseInt = (val, fallback = null) => {
      if (val === undefined || val === null || val === '') return fallback;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? fallback : parsed;
    };

    const safeParseFloat = (val, fallback = null) => {
      if (val === undefined || val === null || val === '') return fallback;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? fallback : parsed;
    };

    const cleanAge = safeParseInt(age, 30);
    const cleanPulse = safeParseInt(pulse, 76);
    const cleanTemp = safeParseFloat(temp, 98.6);
    const cleanWeight = safeParseFloat(weight, 60.0);
    const cleanSpo2 = safeParseInt(spo2, 98);
    const cleanBloodSugar = safeParseInt(bloodSugar, null);
    const cleanPregnancyWeek = isPregnant ? safeParseInt(pregnancyWeek, 12) : null;
    const finalPhone = trimmedPhone || ('9876' + Math.floor(100000 + Math.random() * 900000));
    const cleanGender = gender || 'Female';
    const cleanBloodGroup = bloodGroup || 'B+';
    const cleanAddress = (address || '').trim() || `${trimmedVillage}, Ward 1`;
    const cleanCreator = createdBy || 'ASHA Priya';

    const conditionsArray = Array.isArray(conditions)
      ? conditions.filter(Boolean)
      : (conditions ? String(conditions).split(',').map(c => c.trim()).filter(Boolean) : ['General Health Intake']);
    if (conditionsArray.length === 0) conditionsArray.push('General Health Intake');

    const allergiesArray = Array.isArray(allergies)
      ? allergies.filter(Boolean)
      : (allergies ? String(allergies).split(',').map(a => a.trim()).filter(Boolean) : ['None known']);
    if (allergiesArray.length === 0) allergiesArray.push('None known');

    // 1. Insert Patient
    await query(
      `INSERT INTO patients (
        id, patient_id, name, age, gender, phone, address, village, emergency_contact,
        blood_group, is_pregnant, pregnancy_week, edd, conditions, allergies, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        patientId,
        trimmedName,
        cleanAge,
        cleanGender,
        finalPhone,
        cleanAddress,
        trimmedVillage,
        emergencyContact || null,
        cleanBloodGroup,
        isPregnant ? 1 : 0,
        cleanPregnancyWeek,
        isPregnant ? 'In 6 months' : null,
        JSON.stringify(conditionsArray),
        JSON.stringify(allergiesArray),
        cleanCreator,
        todayStr,
        todayStr
      ]
    );

    // 2. Insert Initial Vitals
    await query(
      `INSERT INTO patient_vitals (
        patient_id, recorded_by, blood_pressure, pulse, temperature, weight, spo2, blood_sugar, recorded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        cleanCreator,
        bp || '120/80',
        cleanPulse,
        cleanTemp,
        cleanWeight,
        cleanSpo2,
        cleanBloodSugar,
        nowIso
      ]
    );

    // 3. Insert Initial Problem / Symptoms
    for (const cond of conditionsArray) {
      await query(
        `INSERT INTO patient_problems (patient_id, description, source, recorded_by, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [patientId, cond, 'asha_registration', cleanCreator, nowIso]
      );
    }

    // 4. Insert Initial Visit
    await query(
      `INSERT INTO hospital_visits (patient_id, facility_name, visit_date, visit_type, doctor, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patientId, 'Community Outreach', todayStr, 'Field Registration', cleanCreator, 'Initial community health registration completed by ASHA.', nowIso]
    );

    // 5. Audit Log
    await query(
      `INSERT INTO audit_logs (user_id, user_role, action, entity, entity_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cleanCreator, 'asha', 'CREATE_PATIENT', 'patients', patientId, `Registered new patient: ${trimmedName} (${patientId}) in ${trimmedVillage}`, nowIso]
    );

    // Fetch created patient
    const created = await queryOne('SELECT * FROM patients WHERE patient_id = ? OR id = ?', [patientId, patientId]);

    return NextResponse.json({
      success: true,
      patient: {
        ...(created || {}),
        id: patientId,
        name: trimmedName,
        age: cleanAge,
        gender: cleanGender,
        phone: finalPhone,
        village: trimmedVillage,
        conditions: conditionsArray,
        allergies: allergiesArray,
        isPregnant: Boolean(isPregnant),
        pregnancyWeek: cleanPregnancyWeek,
        bloodGroup: cleanBloodGroup,
        registeredDate: todayStr,
      },
      warning: existing ? 'Possible existing patient with similar name found in records' : null
    }, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({
      error: 'Unable to save patient information. Please check the connection and try again.',
      details: error.message || String(error)
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
