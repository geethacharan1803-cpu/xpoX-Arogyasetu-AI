import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const patientId = params.id;
    const res = await query(
      'SELECT * FROM medications WHERE patient_id = ? ORDER BY created_at DESC',
      [patientId]
    );

    const currentMeds = [];
    const completedMeds = [];
    const discontinuedMeds = [];

    for (const m of res.rows) {
      const item = {
        id: m.id,
        name: m.medicine_name,
        dosage: m.dose,
        frequency: m.frequency,
        duration: m.duration,
        startDate: m.start_date,
        endDate: m.end_date,
        doctor: m.prescribing_doctor,
        status: m.status || 'CURRENT',
      };

      if (item.status === 'CURRENT') {
        currentMeds.push(item);
      } else if (item.status === 'COMPLETED') {
        completedMeds.push(item);
      } else {
        discontinuedMeds.push(item);
      }
    }

    return NextResponse.json({
      medications: res.rows,
      categorized: {
        current: currentMeds,
        completed: completedMeds,
        discontinued: discontinuedMeds,
      }
    });
  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json({ error: 'Failed to retrieve medications' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const patientId = params.id;
    const body = await request.json();
    const {
      medicineName,
      dose,
      frequency,
      duration,
      startDate,
      endDate,
      prescribingDoctor,
      status,
    } = body;

    const todayStr = new Date().toISOString().split('T')[0];

    await query(
      `INSERT INTO medications (
        patient_id, medicine_name, dose, frequency, duration, start_date, end_date, prescribing_doctor, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        medicineName,
        dose,
        frequency,
        duration,
        startDate || todayStr,
        endDate || null,
        prescribingDoctor || 'Doctor',
        status || 'CURRENT',
        todayStr
      ]
    );

    return NextResponse.json({ success: true, message: 'Medication added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error adding medication:', error);
    return NextResponse.json({ error: 'Failed to add medication' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Medication ID and status are required' }, { status: 400 });
    }

    await query('UPDATE medications SET status = ? WHERE id = ?', [status, id]);
    return NextResponse.json({ success: true, message: 'Medication status updated' });
  } catch (error) {
    console.error('Error updating medication status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
