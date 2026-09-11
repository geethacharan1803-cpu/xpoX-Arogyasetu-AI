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

export async function POST(request) {
  try {
    const body = await request.json();
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

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedPhone = (phone || '').trim();
    const trimmedVillage = (village || 'Rampur').trim();

    // Check for duplicate patient (matching name AND phone, or matching name AND village)
    let duplicateQuery = `SELECT * FROM patients WHERE LOWER(name) = LOWER(?)`;
    const duplicateParams = [trimmedName];

    if (trimmedPhone) {
      duplicateQuery += ` AND (phone = ? OR LOWER(village) = LOWER(?))`;
      duplicateParams.push(trimmedPhone, trimmedVillage);
    } else {
      duplicateQuery += ` AND LOWER(village) = LOWER(?)`;
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

    // Generate consecutive Patient ID
    const countRes = await queryOne('SELECT COUNT(*) as count FROM patients');
    const nextNum = parseInt(countRes?.count || 0) + 1;
    const patientId = `P-2026-${String(nextNum).padStart(3, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const conditionsArray = Array.isArray(conditions)
      ? conditions
      : (conditions ? String(conditions).split(',').map(c => c.trim()).filter(Boolean) : ['General Health Intake']);

    const allergiesArray = Array.isArray(allergies)
      ? allergies
      : (allergies ? String(allergies).split(',').map(a => a.trim()).filter(Boolean) : ['None known']);

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
        parseInt(age) || 30,
        gender || 'Female',
        trimmedPhone || '9876XXXX' + Math.floor(10 + Math.random() * 89),
        address || `${trimmedVillage}, Ward 1`,
        trimmedVillage,
        emergencyContact || null,
        bloodGroup || 'B+',
        isPregnant ? 1 : 0,
        isPregnant ? parseInt(pregnancyWeek) || 12 : null,
        isPregnant ? 'In 6 months' : null,
        JSON.stringify(conditionsArray),
        JSON.stringify(allergiesArray),
        createdBy || 'ASHA Priya',
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
        createdBy || 'ASHA Priya',
        bp || '120/80',
        parseInt(pulse) || 76,
        parseFloat(temp) || 98.6,
        parseFloat(weight) || 60,
        parseInt(spo2) || 98,
        bloodSugar ? parseInt(bloodSugar) : null,
        todayStr
      ]
    );

    // 3. Insert Initial Problem / Symptoms
    for (const cond of conditionsArray) {
      await query(
        `INSERT INTO patient_problems (patient_id, description, source, recorded_by, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [patientId, cond, 'asha_registration', createdBy || 'ASHA Priya', todayStr]
      );
    }

    // 4. Insert Initial Visit
    await query(
      `INSERT INTO hospital_visits (patient_id, facility_name, visit_date, visit_type, doctor, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patientId, 'Community Outreach', todayStr, 'Field Registration', createdBy || 'ASHA Priya', 'Initial community health registration completed by ASHA.']
    );

    // 5. Audit Log
    await query(
      `INSERT INTO audit_logs (user_id, user_role, action, entity, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [createdBy || 'ASHA Priya', 'asha', 'CREATE_PATIENT', 'patients', patientId, `Registered new patient: ${trimmedName} (${patientId}) in ${trimmedVillage}`]
    );

    // Fetch created patient
    const created = await queryOne('SELECT * FROM patients WHERE patient_id = ?', [patientId]);

    return NextResponse.json({
      success: true,
      patient: {
        ...created,
        id: created.patient_id,
        conditions: conditionsArray,
        allergies: allergiesArray,
        isPregnant: Boolean(created.is_pregnant),
        pregnancyWeek: created.pregnancy_week,
        bloodGroup: created.blood_group,
        registeredDate: todayStr,
      },
      warning: existing ? 'Possible existing patient with similar name found in records' : null
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Unable to save patient information. Please check the connection and try again.' }, { status: 500 });
  }
}
